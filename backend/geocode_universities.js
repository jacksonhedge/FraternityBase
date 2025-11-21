import { createClient } from '@supabase/supabase-js';
import https from 'https';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vvsawtexgpopqxgaqyxg.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Sleep function for rate limiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Geocode a university using OpenStreetMap Nominatim
async function geocodeUniversity(name, city, state) {
  return new Promise((resolve, reject) => {
    // Build search query - use city and state for better accuracy
    const query = city && state
      ? `${name}, ${city}, ${state}, USA`
      : state
      ? `${name}, ${state}, USA`
      : `${name}, USA`;

    const encodedQuery = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1`;

    const options = {
      headers: {
        'User-Agent': 'FraternityBase/1.0 (contact@fraternitybase.com)'
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.length > 0) {
            resolve({
              latitude: parseFloat(json[0].lat),
              longitude: parseFloat(json[0].lon)
            });
          } else {
            resolve(null);
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  console.log('🌍 Starting university geocoding...\n');

  // Get all universities without coordinates
  const { data: universities, error } = await supabase
    .from('universities')
    .select('id, name, city, state, location')
    .is('latitude', null)
    .order('state', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching universities:', error);
    return;
  }

  console.log(`Found ${universities.length} universities to geocode\n`);

  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < universities.length; i++) {
    const uni = universities[i];

    try {
      console.log(`[${i + 1}/${universities.length}] Geocoding: ${uni.name}, ${uni.state}`);

      const coords = await geocodeUniversity(uni.name, uni.city, uni.state);

      if (coords) {
        // Update database
        const { error: updateError } = await supabase
          .from('universities')
          .update({
            latitude: coords.latitude,
            longitude: coords.longitude
          })
          .eq('id', uni.id);

        if (updateError) {
          console.log(`  ❌ Failed to update: ${updateError.message}`);
          failCount++;
        } else {
          console.log(`  ✅ Success: ${coords.latitude}, ${coords.longitude}`);
          successCount++;
        }
      } else {
        console.log(`  ⚠️  No coordinates found`);
        skippedCount++;
      }

      // Rate limit: 1 request per second for Nominatim
      if (i < universities.length - 1) {
        await sleep(1100); // 1.1 seconds to be safe
      }

    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      failCount++;
      await sleep(2000); // Wait longer on error
    }
  }

  console.log('\n📊 Geocoding Complete!');
  console.log(`✅ Success: ${successCount}`);
  console.log(`⚠️  Skipped: ${skippedCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📍 Total: ${successCount + skippedCount + failCount}`);
}

main().catch(console.error);
