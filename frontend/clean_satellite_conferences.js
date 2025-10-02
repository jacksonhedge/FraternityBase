#!/usr/bin/env node
/**
 * Remove conference assignments from satellite campuses
 */

const API_URL = 'https://backend-two-topaz-47.vercel.app/api';
const ADMIN_TOKEN = 'sk_admin_fra7ernity_b4se_sec2ret_92fj39';

// Keywords that indicate a satellite campus (NOT a Power 4 school)
const SATELLITE_KEYWORDS = [
  ' at ', 'campus', 'branch', ', ', '–', ' - ',
  'fort wayne', 'northwest', 'crookston', 'duluth', 'morris',
  'omaha', 'camden', 'newark', 'abington', 'altoona', 'behrend',
  'berks', 'brandywine', 'harrisburg', 'chicago', 'indianapolis',
  'eastern shore', 'baltimore county', 'springfield', 'fort smith',
  'st. louis', 'aiken', 'beaufort', 'upstate', 'kingsville',
  'corpus christi', 'san antonio', 'permian basin', 'tyler',
  'parkside', 'bradford', 'greensburg', 'johnstown', 'wise',
  'little rock', 'monticello', 'pine bluff', 'montgomery'
];

async function cleanSatelliteConferences() {
  console.log('🧹 Cleaning satellite campus conferences...\n');

  // Fetch all universities
  const response = await fetch(`${API_URL}/admin/universities`, {
    headers: {
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  const { data: universities } = await response.json();
  console.log(`📊 Found ${universities.length} universities in database\n`);

  let cleaned = 0;
  let kept = 0;

  for (const uni of universities) {
    // Skip if no conference
    if (!uni.conference) {
      continue;
    }

    const nameLower = uni.name.toLowerCase();
    let isSatellite = false;

    // Check if this is a satellite campus
    for (const keyword of SATELLITE_KEYWORDS) {
      if (nameLower.includes(keyword)) {
        isSatellite = true;
        break;
      }
    }

    if (isSatellite) {
      // Remove conference from satellite campus
      try {
        const updateResponse = await fetch(`${API_URL}/admin/universities/${uni.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            conference: null
          })
        });

        if (updateResponse.ok) {
          console.log(`🧹 Removed ${uni.conference} from satellite: ${uni.name}`);
          cleaned++;
        }
      } catch (error) {
        console.error(`Error cleaning ${uni.name}:`, error.message);
      }
    } else {
      kept++;
      if (kept <= 10) {
        console.log(`✅ Kept ${uni.conference}: ${uni.name}`);
      }
    }
  }

  console.log(`\n📈 Summary:`);
  console.log(`   🧹 Cleaned (removed conference): ${cleaned}`);
  console.log(`   ✅ Kept (main campus): ${kept}`);
}

cleanSatelliteConferences().catch(console.error);
