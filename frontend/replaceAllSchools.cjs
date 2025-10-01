/**
 * Script to REPLACE all college data with 1,077 NCAA schools from CSV
 * Run with: node replaceAllSchools.cjs
 */

const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = '/Users/jacksonfitzgerald/ncaa_schools_complete.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Read existing statesGeoData
const geoDataPath = path.join(__dirname, 'src/data/statesGeoData.ts');
const geoDataContent = fs.readFileSync(geoDataPath, 'utf-8');

// Parse CSV
const lines = csvContent.split('\n').slice(1); // Skip header
const ncaaSchools = [];

for (const line of lines) {
  if (!line.trim()) continue;

  // Parse CSV properly - split by comma but respect quotes
  const parts = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current.trim()); // Add last part

  if (parts.length < 3) continue;

  const college = parts[0];
  const state = parts[1];
  const division = parts[2];

  if (!college || !state) continue;

  // Convert division format properly
  let divisionCode = 'D1';
  if (division.includes('III')) {
    divisionCode = 'D3';
  } else if (division.includes('II')) {
    divisionCode = 'D2';
  } else if (division.includes('I')) {
    divisionCode = 'D1';
  }

  ncaaSchools.push({
    name: college,
    state: state,
    division: divisionCode
  });
}

console.log(`📚 Parsed ${ncaaSchools.length} NCAA schools from CSV`);

// Count by division
const divisionCounts = {
  D1: ncaaSchools.filter(s => s.division === 'D1').length,
  D2: ncaaSchools.filter(s => s.division === 'D2').length,
  D3: ncaaSchools.filter(s => s.division === 'D3').length
};
console.log(`📊 Division breakdown: D1=${divisionCounts.D1}, D2=${divisionCounts.D2}, D3=${divisionCounts.D3}`);

const STATE_CENTERS = {
  'AL': { lat: 32.806671, lng: -86.791130 },
  'AK': { lat: 61.370716, lng: -152.404419 },
  'AZ': { lat: 33.729759, lng: -111.431221 },
  'AR': { lat: 34.969704, lng: -92.373123 },
  'BC': { lat: 53.726669, lng: -127.647621 }, // British Columbia
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
  'PR': { lat: 18.220833, lng: -66.590149 }, // Puerto Rico
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

// Create ALL colleges from NCAA data
const allColleges = {};
let skipped = 0;

for (const school of ncaaSchools) {
  const stateCenter = STATE_CENTERS[school.state];
  if (!stateCenter) {
    console.log(`⚠️  Skipping ${school.name} - unknown state: ${school.state}`);
    skipped++;
    continue;
  }

  // Random offset to spread schools around state center
  const latOffset = (Math.random() - 0.5) * 2; // ±1 degree
  const lngOffset = (Math.random() - 0.5) * 2;

  // Use unique key: append state for schools with same name in different states
  const uniqueKey = `${school.name} (${school.state})`;

  allColleges[uniqueKey] = {
    lat: parseFloat((stateCenter.lat + latOffset).toFixed(4)),
    lng: parseFloat((stateCenter.lng + lngOffset).toFixed(4)),
    state: school.state,
    fraternities: school.division === 'D1' ? 30 : school.division === 'D2' ? 15 : 8,
    sororities: school.division === 'D1' ? 20 : school.division === 'D2' ? 10 : 5,
    totalMembers: school.division === 'D1' ? 2500 : school.division === 'D2' ? 1000 : 500,
    conference: '',
    division: school.division
  };
}

console.log(`✅ Created ${Object.keys(allColleges).length} colleges (skipped ${skipped})`);

// Verify final division counts
const finalCounts = {
  D1: Object.values(allColleges).filter(c => c.division === 'D1').length,
  D2: Object.values(allColleges).filter(c => c.division === 'D2').length,
  D3: Object.values(allColleges).filter(c => c.division === 'D3').length
};
console.log(`✅ Final division counts: D1=${finalCounts.D1}, D2=${finalCounts.D2}, D3=${finalCounts.D3}`);

// Generate new COLLEGE_LOCATIONS export
const sortedColleges = Object.entries(allColleges).sort((a, b) => {
  return a[1].state.localeCompare(b[1].state) || a[0].localeCompare(b[0]);
});

let newCollegeLocationsCode = 'export const COLLEGE_LOCATIONS = {\n';

let currentState = '';
for (const [name, data] of sortedColleges) {
  const college = data;

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
console.log(`   - Total colleges: ${Object.keys(allColleges).length}`);
console.log(`   - D1 schools: ${finalCounts.D1}`);
console.log(`   - D2 schools: ${finalCounts.D2}`);
console.log(`   - D3 schools: ${finalCounts.D3}`);
