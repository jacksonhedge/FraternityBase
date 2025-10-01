/**
 * Script to import NCAA schools from CSV and merge with existing college data
 *
 * Run with: npx ts-node src/scripts/importNCAASchools.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Read the CSV file
const csvPath = path.join(__dirname, '../../../ncaa_schools_complete.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Read existing statesGeoData
const geoDataPath = path.join(__dirname, '../data/statesGeoData.ts');
const geoDataContent = fs.readFileSync(geoDataPath, 'utf-8');

// Parse CSV
const lines = csvContent.split('\n').slice(1); // Skip header
const ncaaSchools: any[] = [];

for (const line of lines) {
  if (!line.trim()) continue;

  const [state, college, division, conference, subdivision, publicPrivate, hbcu] = line.split(',');

  if (!college || !state) continue;

  ncaaSchools.push({
    name: college.trim(),
    state: state.trim(),
    division: division.replace('Division ', 'D').trim(), // "Division I" -> "D1"
    conference: conference.trim().toUpperCase(),
    subdivision: subdivision.trim(),
    publicPrivate: publicPrivate.trim(),
    hbcu: hbcu.trim() === 'Yes'
  });
}

console.log(`📚 Parsed ${ncaaSchools.length} NCAA schools from CSV`);

// Extract existing COLLEGE_LOCATIONS from statesGeoData.ts
const collegeLocationsMatch = geoDataContent.match(/export const COLLEGE_LOCATIONS = \{([\s\S]*?)\n\};/);
if (!collegeLocationsMatch) {
  throw new Error('Could not find COLLEGE_LOCATIONS in statesGeoData.ts');
}

const existingCollegesText = collegeLocationsMatch[1];
const existingColleges: any = {};

// Parse existing colleges (simplified regex parsing)
const collegePattern = /"([^"]+)":\s*\{([^}]+)\}/g;
let match;

while ((match = collegePattern.exec(existingCollegesText)) !== null) {
  const collegeName = match[1];
  const dataStr = match[2];

  // Extract lat, lng, state, etc.
  const latMatch = dataStr.match(/lat:\s*([-\d.]+)/);
  const lngMatch = dataStr.match(/lng:\s*([-\d.]+)/);
  const stateMatch = dataStr.match(/state:\s*"([^"]+)"/);
  const fraternitiesMatch = dataStr.match(/fraternities:\s*(\d+)/);
  const sororitiesMatch = dataStr.match(/sororities:\s*(\d+)/);
  const totalMembersMatch = dataStr.match(/totalMembers:\s*(\d+)/);
  const conferenceMatch = dataStr.match(/conference:\s*"([^"]+)"/);
  const divisionMatch = dataStr.match(/division:\s*"([^"]+)"/);

  if (latMatch && lngMatch && stateMatch) {
    existingColleges[collegeName] = {
      lat: parseFloat(latMatch[1]),
      lng: parseFloat(lngMatch[1]),
      state: stateMatch[1],
      fraternities: fraternitiesMatch ? parseInt(fraternitiesMatch[1]) : 25,
      sororities: sororitiesMatch ? parseInt(sororitiesMatch[1]) : 15,
      totalMembers: totalMembersMatch ? parseInt(totalMembersMatch[1]) : 1500,
      conference: conferenceMatch ? conferenceMatch[1] : '',
      division: divisionMatch ? divisionMatch[1] : 'D1'
    };
  }
}

console.log(`📊 Found ${Object.keys(existingColleges).length} existing colleges in statesGeoData.ts`);

// Merge NCAA data with existing colleges
// For colleges that exist: update conference/division if missing
// For new colleges: we need to geocode them (for now, use state center + offset)

const STATE_CENTERS: any = {
  'AL': { lat: 32.806671, lng: -86.791130 },
  'AK': { lat: 61.370716, lng: -152.404419 },
  'AZ': { lat: 33.729759, lng: -111.431221 },
  'AR': { lat: 34.969704, lng: -92.373123 },
  'CA': { lat: 36.116203, lng: -119.681564 },
  'CO': { lat: 39.059811, lng: -105.311104 },
  'CT': { lat: 41.597782, lng: -72.755371 },
  'DE': { lat: 39.318523, lng: -75.507141 },
  'DC': { lat: 38.897438, lng: -77.026817 },
  'FL': { lat: 27.766279, lng: -81.686783 },
  'GA': { lat: 33.040619, lng: -83.643074 },
  'HI': { lat: 21.094318, lng: -157.498337 },
  'ID': { lat: 44.240459, lng: -114.478828 },
  'IL': { lat: 40.349457, lng: -88.986137 },
  'IN': { lat: 39.849426, lng: -86.258278 },
  'IA': { lat: 42.011539, lng: -93.210526 },
  'KS': { lat: 38.526600, lng: -96.726486 },
  'KY': { lat: 37.668140, lng: -84.670067 },
  'LA': { lat: 31.169546, lng: -91.867805 },
  'ME': { lat: 44.693947, lng: -69.381927 },
  'MD': { lat: 39.063946, lng: -76.802101 },
  'MA': { lat: 42.230171, lng: -71.530106 },
  'MI': { lat: 43.326618, lng: -84.536095 },
  'MN': { lat: 45.694454, lng: -93.900192 },
  'MS': { lat: 32.741646, lng: -89.678696 },
  'MO': { lat: 38.456085, lng: -92.288368 },
  'MT': { lat: 46.921925, lng: -110.454353 },
  'NE': { lat: 41.125370, lng: -98.268082 },
  'NV': { lat: 38.313515, lng: -117.055374 },
  'NH': { lat: 43.452492, lng: -71.563896 },
  'NJ': { lat: 40.298904, lng: -74.521011 },
  'NM': { lat: 34.840515, lng: -106.248482 },
  'NY': { lat: 42.165726, lng: -74.948051 },
  'NC': { lat: 35.630066, lng: -79.806419 },
  'ND': { lat: 47.528912, lng: -99.784012 },
  'OH': { lat: 40.388783, lng: -82.764915 },
  'OK': { lat: 35.565342, lng: -96.928917 },
  'OR': { lat: 44.572021, lng: -122.070938 },
  'PA': { lat: 40.590752, lng: -77.209755 },
  'RI': { lat: 41.680893, lng: -71.511780 },
  'SC': { lat: 33.856892, lng: -80.945007 },
  'SD': { lat: 44.299782, lng: -99.438828 },
  'TN': { lat: 35.747845, lng: -86.692345 },
  'TX': { lat: 31.054487, lng: -97.563461 },
  'UT': { lat: 40.150032, lng: -111.862434 },
  'VT': { lat: 44.045876, lng: -72.710686 },
  'VA': { lat: 37.769337, lng: -78.169968 },
  'WA': { lat: 47.400902, lng: -121.490494 },
  'WV': { lat: 38.491226, lng: -80.954453 },
  'WI': { lat: 44.268543, lng: -89.616508 },
  'WY': { lat: 42.755966, lng: -107.302490 }
};

let mergedCount = 0;
let newCount = 0;

// Helper to normalize college names for matching
function normalizeCollegeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/university of /g, '')
    .replace(/state university/g, '')
    .replace(/college/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Create merged college data
const mergedColleges: any = { ...existingColleges };

for (const ncaaSchool of ncaaSchools) {
  const ncaaName = ncaaSchool.name;

  // Try to find exact match first
  let existingKey = Object.keys(existingColleges).find(key =>
    key.toLowerCase() === ncaaName.toLowerCase()
  );

  // Try partial match
  if (!existingKey) {
    const normalized = normalizeCollegeName(ncaaName);
    existingKey = Object.keys(existingColleges).find(key =>
      normalizeCollegeName(key).includes(normalized) ||
      normalized.includes(normalizeCollegeName(key))
    );
  }

  if (existingKey) {
    // Update existing college with conference/division from NCAA data
    mergedColleges[existingKey] = {
      ...existingColleges[existingKey],
      conference: ncaaSchool.conference || existingColleges[existingKey].conference,
      division: ncaaSchool.division || existingColleges[existingKey].division
    };
    mergedCount++;
  } else {
    // Add new college with estimated location (state center + random offset)
    const stateCenter = STATE_CENTERS[ncaaSchool.state];
    if (!stateCenter) continue;

    // Random offset to spread schools around state center
    const latOffset = (Math.random() - 0.5) * 2; // ±1 degree
    const lngOffset = (Math.random() - 0.5) * 2;

    mergedColleges[ncaaName] = {
      lat: parseFloat((stateCenter.lat + latOffset).toFixed(4)),
      lng: parseFloat((stateCenter.lng + lngOffset).toFixed(4)),
      state: ncaaSchool.state,
      fraternities: ncaaSchool.division === 'D1' ? 30 : ncaaSchool.division === 'D2' ? 15 : 8,
      sororities: ncaaSchool.division === 'D1' ? 20 : ncaaSchool.division === 'D2' ? 10 : 5,
      totalMembers: ncaaSchool.division === 'D1' ? 2500 : ncaaSchool.division === 'D2' ? 1000 : 500,
      conference: ncaaSchool.conference,
      division: ncaaSchool.division
    };
    newCount++;
  }
}

console.log(`✅ Merged ${mergedCount} existing colleges with NCAA data`);
console.log(`➕ Added ${newCount} new colleges from NCAA data`);
console.log(`📍 Total colleges: ${Object.keys(mergedColleges).length}`);

// Generate new COLLEGE_LOCATIONS export
const sortedColleges = Object.entries(mergedColleges).sort((a: any, b: any) => {
  return a[1].state.localeCompare(b[1].state) || a[0].localeCompare(b[0]);
});

let newCollegeLocationsCode = 'export const COLLEGE_LOCATIONS = {\n';

let currentState = '';
for (const [name, data] of sortedColleges) {
  const college: any = data;

  // Add state comment separator
  if (college.state !== currentState) {
    if (currentState !== '') newCollegeLocationsCode += '\n';
    newCollegeLocationsCode += `  // ${college.state}\n`;
    currentState = college.state;
  }

  newCollegeLocationsCode += `  "${name}": { `;
  newCollegeLocationsCode += `lat: ${college.lat}, `;
  newCollegeLocationsCode += `lng: ${college.lng}, `;
  newCollegeLocationsCode += `state: "${college.state}", `;
  newCollegeLocationsCode += `fraternities: ${college.fraternities}, `;
  newCollegeLocationsCode += `sororities: ${college.sororities}, `;
  newCollegeLocationsCode += `totalMembers: ${college.totalMembers}, `;
  newCollegeLocationsCode += `conference: "${college.conference}", `;
  newCollegeLocationsCode += `division: "${college.division}"`;
  newCollegeLocationsCode += ` },\n`;
}

newCollegeLocationsCode += '};\n';

// Replace in original file
const newGeoDataContent = geoDataContent.replace(
  /export const COLLEGE_LOCATIONS = \{[\s\S]*?\n\};/,
  newCollegeLocationsCode
);

// Write updated file
fs.writeFileSync(geoDataPath, newGeoDataContent, 'utf-8');

console.log(`\n🎉 Successfully updated ${geoDataPath}`);
console.log(`📊 Final stats:`);
console.log(`   - Total colleges: ${Object.keys(mergedColleges).length}`);
console.log(`   - Existing updated: ${mergedCount}`);
console.log(`   - New additions: ${newCount}`);
