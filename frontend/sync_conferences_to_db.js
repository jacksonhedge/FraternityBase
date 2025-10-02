#!/usr/bin/env node
/**
 * Sync conference data from statesGeoData.ts to Supabase database
 */

import { COLLEGE_LOCATIONS } from './src/data/statesGeoData.ts';

const API_URL = 'https://backend-two-topaz-47.vercel.app/api';
const ADMIN_TOKEN = '***REMOVED***';

async function syncConferences() {
  console.log('🚀 Starting conference sync...\n');

  // First, fetch all universities from the database
  const response = await fetch(`${API_URL}/admin/universities`, {
    headers: {
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  const { data: universities } = await response.json();
  console.log(`📊 Found ${universities.length} universities in database\n`);

  let updated = 0;
  let notFound = 0;
  let alreadyHasConference = 0;

  // For each university in the database, find matching entry in COLLEGE_LOCATIONS
  for (const uni of universities) {
    // Skip if already has conference
    if (uni.conference) {
      alreadyHasConference++;
      continue;
    }

    // Try to find matching college in COLLEGE_LOCATIONS
    const collegeName = uni.name.replace(/\s*\([A-Z]{2}\)\s*$/, '').trim();

    // Search for match
    let matchedCollege = null;
    let matchedName = null;

    for (const [name, data] of Object.entries(COLLEGE_LOCATIONS)) {
      const cleanName = name.replace(/\s*\([A-Z]{2}\)\s*$/, '').trim();

      if (cleanName.toLowerCase() === collegeName.toLowerCase() ||
          cleanName.toLowerCase().includes(collegeName.toLowerCase()) ||
          collegeName.toLowerCase().includes(cleanName.toLowerCase())) {
        matchedCollege = data;
        matchedName = name;
        break;
      }
    }

    if (matchedCollege && matchedCollege.conference) {
      // Update the database
      try {
        const updateResponse = await fetch(`${API_URL}/admin/universities/${uni.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            conference: matchedCollege.conference
          })
        });

        if (updateResponse.ok) {
          console.log(`✅ Updated ${uni.name} → ${matchedCollege.conference}`);
          updated++;
        } else {
          console.log(`❌ Failed to update ${uni.name}`);
        }
      } catch (error) {
        console.error(`Error updating ${uni.name}:`, error.message);
      }
    } else {
      notFound++;
      // Only log a few examples of not found
      if (notFound <= 5) {
        console.log(`⚠️  No match found for: ${uni.name}`);
      }
    }
  }

  console.log(`\n📈 Summary:`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ✔️  Already had conference: ${alreadyHasConference}`);
  console.log(`   ⚠️  Not found in hardcoded data: ${notFound}`);
}

syncConferences().catch(console.error);
