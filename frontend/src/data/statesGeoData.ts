// Accurate US State coordinates and boundaries
export const STATE_COORDINATES = {
  AL: { lat: 32.806671, lng: -86.791130, name: "Alabama", abbr: "AL" },
  AK: { lat: 61.370716, lng: -152.404419, name: "Alaska", abbr: "AK" },
  AZ: { lat: 33.729759, lng: -111.431221, name: "Arizona", abbr: "AZ" },
  AR: { lat: 34.969704, lng: -92.373123, name: "Arkansas", abbr: "AR" },
  CA: { lat: 36.116203, lng: -119.681564, name: "California", abbr: "CA" },
  CO: { lat: 39.059811, lng: -105.311104, name: "Colorado", abbr: "CO" },
  CT: { lat: 41.597782, lng: -72.755371, name: "Connecticut", abbr: "CT" },
  DE: { lat: 39.318523, lng: -75.507141, name: "Delaware", abbr: "DE" },
  DC: { lat: 38.897438, lng: -77.026817, name: "District of Columbia", abbr: "DC" },
  FL: { lat: 27.766279, lng: -81.686783, name: "Florida", abbr: "FL" },
  GA: { lat: 33.040619, lng: -83.643074, name: "Georgia", abbr: "GA" },
  HI: { lat: 21.094318, lng: -157.498337, name: "Hawaii", abbr: "HI" },
  ID: { lat: 44.240459, lng: -114.478828, name: "Idaho", abbr: "ID" },
  IL: { lat: 40.349457, lng: -88.986137, name: "Illinois", abbr: "IL" },
  IN: { lat: 39.849426, lng: -86.258278, name: "Indiana", abbr: "IN" },
  IA: { lat: 42.011539, lng: -93.210526, name: "Iowa", abbr: "IA" },
  KS: { lat: 38.526600, lng: -96.726486, name: "Kansas", abbr: "KS" },
  KY: { lat: 37.668140, lng: -84.670067, name: "Kentucky", abbr: "KY" },
  LA: { lat: 31.169546, lng: -91.867805, name: "Louisiana", abbr: "LA" },
  ME: { lat: 44.693947, lng: -69.381927, name: "Maine", abbr: "ME" },
  MD: { lat: 39.063946, lng: -76.802101, name: "Maryland", abbr: "MD" },
  MA: { lat: 42.230171, lng: -71.530106, name: "Massachusetts", abbr: "MA" },
  MI: { lat: 43.326618, lng: -84.536095, name: "Michigan", abbr: "MI" },
  MN: { lat: 45.694454, lng: -93.900192, name: "Minnesota", abbr: "MN" },
  MS: { lat: 32.741646, lng: -89.678696, name: "Mississippi", abbr: "MS" },
  MO: { lat: 38.456085, lng: -92.288368, name: "Missouri", abbr: "MO" },
  MT: { lat: 46.921925, lng: -110.454353, name: "Montana", abbr: "MT" },
  NE: { lat: 41.125370, lng: -98.268082, name: "Nebraska", abbr: "NE" },
  NV: { lat: 38.313515, lng: -117.055374, name: "Nevada", abbr: "NV" },
  NH: { lat: 43.452492, lng: -71.563896, name: "New Hampshire", abbr: "NH" },
  NJ: { lat: 40.298904, lng: -74.521011, name: "New Jersey", abbr: "NJ" },
  NM: { lat: 34.840515, lng: -106.248482, name: "New Mexico", abbr: "NM" },
  NY: { lat: 42.165726, lng: -74.948051, name: "New York", abbr: "NY" },
  NC: { lat: 35.630066, lng: -79.806419, name: "North Carolina", abbr: "NC" },
  ND: { lat: 47.528912, lng: -99.784012, name: "North Dakota", abbr: "ND" },
  OH: { lat: 40.388783, lng: -82.764915, name: "Ohio", abbr: "OH" },
  OK: { lat: 35.565342, lng: -96.928917, name: "Oklahoma", abbr: "OK" },
  OR: { lat: 44.572021, lng: -122.070938, name: "Oregon", abbr: "OR" },
  PA: { lat: 40.590752, lng: -77.209755, name: "Pennsylvania", abbr: "PA" },
  RI: { lat: 41.680893, lng: -71.511780, name: "Rhode Island", abbr: "RI" },
  SC: { lat: 33.856892, lng: -80.945007, name: "South Carolina", abbr: "SC" },
  SD: { lat: 44.299782, lng: -99.438828, name: "South Dakota", abbr: "SD" },
  TN: { lat: 35.747845, lng: -86.692345, name: "Tennessee", abbr: "TN" },
  TX: { lat: 31.054487, lng: -97.563461, name: "Texas", abbr: "TX" },
  UT: { lat: 40.150032, lng: -111.862434, name: "Utah", abbr: "UT" },
  VT: { lat: 44.045876, lng: -72.710686, name: "Vermont", abbr: "VT" },
  VA: { lat: 37.769337, lng: -78.169968, name: "Virginia", abbr: "VA" },
  WA: { lat: 47.400902, lng: -121.490494, name: "Washington", abbr: "WA" },
  WV: { lat: 38.491226, lng: -80.954453, name: "West Virginia", abbr: "WV" },
  WI: { lat: 44.268543, lng: -89.616508, name: "Wisconsin", abbr: "WI" },
  WY: { lat: 42.755966, lng: -107.302490, name: "Wyoming", abbr: "WY" }
};

// State boundaries (approximate bounds for zoom calculations)
export const STATE_BOUNDS = {
  AL: [[30.144425, -88.473227], [35.008028, -84.888246]],
  AK: [[51.214183, -179.148909], [71.365162, -129.979511]],
  AZ: [[31.332177, -114.816591], [37.004260, -109.045223]],
  AR: [[33.004106, -94.617919], [36.499600, -89.644395]],
  CA: [[32.534156, -124.409591], [42.009518, -114.131211]],
  CO: [[36.992426, -109.060253], [41.003444, -102.041524]],
  CT: [[40.950943, -73.727775], [42.050587, -71.786994]],
  DE: [[38.451013, -75.788658], [39.839007, -75.048939]],
  FL: [[24.396308, -87.634938], [31.000968, -80.031362]],
  GA: [[30.357851, -85.605165], [35.000659, -80.839729]],
  HI: [[18.910361, -160.161542], [22.235240, -154.806671]],
  ID: [[41.988057, -117.241552], [49.001146, -111.043564]],
  IL: [[36.970298, -91.513079], [42.508481, -87.019935]],
  IN: [[37.771742, -88.097892], [41.761144, -84.784579]],
  IA: [[40.375501, -96.639704], [43.501196, -90.140061]],
  KS: [[36.993016, -102.051744], [40.003162, -94.588413]],
  KY: [[36.497129, -89.571509], [39.147458, -81.964971]],
  LA: [[28.925560, -94.043147], [33.019457, -88.817017]],
  ME: [[42.977764, -71.083924], [47.459686, -66.949895]],
  MD: [[37.911717, -79.487651], [39.723043, -75.048939]],
  MA: [[41.237964, -73.508142], [42.886589, -69.928393]],
  MI: [[41.696118, -90.418136], [48.306063, -82.122971]],
  MN: [[43.499356, -97.239209], [49.384479, -89.491739]],
  MS: [[30.173943, -91.655009], [34.996052, -88.097888]],
  MO: [[35.995683, -95.774704], [40.613640, -89.098843]],
  MT: [[44.357688, -116.048759], [49.001390, -104.039138]],
  NE: [[39.999998, -104.053514], [43.001708, -95.308292]],
  NV: [[35.001857, -120.005746], [42.002207, -114.039648]],
  NH: [[42.696985, -72.557247], [45.305476, -70.610621]],
  NJ: [[38.928519, -75.567206], [41.357423, -73.893979]],
  NM: [[31.332301, -109.050173], [37.000232, -103.001964]],
  NY: [[40.496103, -79.762152], [45.015865, -71.856214]],
  NC: [[33.753959, -84.321869], [36.588117, -75.460621]],
  ND: [[45.935054, -104.048915], [49.000574, -96.554507]],
  OH: [[38.403202, -84.820159], [41.977523, -80.518693]],
  OK: [[33.615833, -103.002565], [37.002206, -94.430662]],
  OR: [[41.991794, -124.566244], [46.292035, -116.463504]],
  PA: [[39.719872, -80.519891], [42.269503, -74.689516]],
  RI: [[41.146339, -71.862772], [42.018798, -71.120575]],
  SC: [[32.034600, -83.353928], [35.215402, -78.541094]],
  SD: [[42.479635, -104.057698], [45.945455, -96.436589]],
  TN: [[34.982972, -90.310298], [36.678118, -81.646900]],
  TX: [[25.837377, -106.645646], [36.500704, -93.508292]],
  UT: [[36.997968, -114.052962], [42.001567, -109.041058]],
  VT: [[42.726853, -73.437740], [45.016659, -71.464555]],
  VA: [[36.540738, -83.675395], [39.466012, -75.242266]],
  WA: [[45.543541, -124.848974], [49.002494, -116.915989]],
  WV: [[37.201483, -82.644739], [40.638801, -77.719519]],
  WI: [[42.491983, -92.888114], [47.309774, -86.249548]],
  WY: [[40.994746, -111.056888], [45.005904, -104.052334]]
};

// College locations with precise coordinates
export const COLLEGE_LOCATIONS = {
  // AK
  "University of Alaska Anchorage": { lat: 61.9979, lng: -153.0725, state: "AK", fraternities: 8, sororities: 5, totalMembers: 500, conference: "GREAT NORTHWEST ATHLETIC CONFERENCE", division: "DII" },
  "University of Alaska Fairbanks": { lat: 61.2273, lng: -153.1894, state: "AK", fraternities: 8, sororities: 5, totalMembers: 500, conference: "GREAT NORTHWEST ATHLETIC CONFERENCE", division: "DII" },

  // AL
  "Auburn University": { lat: 32.6099, lng: -85.4808, state: "AL", fraternities: 55, sororities: 30, totalMembers: 4200, conference: "SOUTHEASTERN CONFERENCE", division: "DI" },
  "Jacksonville State University": { lat: 32.0453, lng: -86.8983, state: "AL", fraternities: 8, sororities: 5, totalMembers: 500, conference: "CONFERENCE USA", division: "DI" },
  "Samford University": { lat: 32.3474, lng: -86.3705, state: "AL", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHERN CONFERENCE", division: "DI" },
  "Troy University": { lat: 32.3607, lng: -87.0768, state: "AL", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SUN BELT CONFERENCE", division: "DI" },
  "University of Alabama": { lat: 33.2098, lng: -87.5692, state: "AL", fraternities: 68, sororities: 35, totalMembers: 5300, conference: "SUN BELT CONFERENCE", division: "DI" },

  // AR
  "University of Arkansas": { lat: 36.0679, lng: -94.1748, state: "AR", fraternities: 42, sororities: 24, totalMembers: 3200, conference: "BIG 12 CONFERENCE", division: "DI" },

  // AZ
  "Arizona State": { lat: 33.4242, lng: -111.9281, state: "AZ", fraternities: 60, sororities: 32, totalMembers: 4600, conference: "BIG 12 CONFERENCE", division: "DI" },
  "Grand Canyon University": { lat: 34.0896, lng: -112.2553, state: "AZ", fraternities: 8, sororities: 5, totalMembers: 500, conference: "WESTERN ATHLETIC CONFERENCE", division: "DI" },
  "University of Arizona": { lat: 32.2319, lng: -110.9501, state: "AZ", fraternities: 55, sororities: 30, totalMembers: 4200, conference: "BIG 12 CONFERENCE", division: "DI" },

  // CA
  "California Baptist University": { lat: 35.9424, lng: -118.9692, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "WESTERN ATHLETIC CONFERENCE", division: "DI" },
  "California Polytechnic State University": { lat: 35.2154, lng: -120.1478, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG WEST CONFERENCE", division: "DI" },
  "California State University Bakersfield": { lat: 35.5471, lng: -119.182, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG WEST CONFERENCE", division: "DI" },
  "California State University Fresno": { lat: 36.0082, lng: -120.056, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MOUNTAIN WEST CONFERENCE", division: "DI" },
  "California State University Fullerton": { lat: 36.2592, lng: -118.788, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG WEST CONFERENCE", division: "DI" },
  "California State University Long Beach": { lat: 35.7544, lng: -119.5917, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG WEST CONFERENCE", division: "DI" },
  "California State University Northridge": { lat: 35.2865, lng: -119.8266, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG WEST CONFERENCE", division: "DI" },
  "California State University Sacramento": { lat: 35.3672, lng: -120.0424, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG SKY CONFERENCE", division: "DI" },
  "Loyola Marymount University": { lat: 36.6945, lng: -119.2364, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "WEST COAST CONFERENCE", division: "DI" },
  "Pepperdine University": { lat: 35.8505, lng: -120.0446, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "WEST COAST CONFERENCE", division: "DI" },
  "Saint Mary's College of California": { lat: 36.3232, lng: -119.4842, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "WEST COAST CONFERENCE", division: "DI" },
  "San Jose State University": { lat: 37.0459, lng: -119.8282, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MOUNTAIN WEST CONFERENCE", division: "DI" },
  "Santa Clara University": { lat: 36.8173, lng: -118.9748, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "WEST COAST CONFERENCE", division: "DI" },
  "Stanford": { lat: 37.4275, lng: -122.1697, state: "CA", fraternities: 38, sororities: 25, totalMembers: 3000, conference: "ATLANTIC COAST CONFERENCE", division: "DI" },
  "UC Berkeley": { lat: 37.8719, lng: -122.2585, state: "CA", fraternities: 55, sororities: 30, totalMembers: 4500, conference: "PAC-12", division: "D1" },
  "UC San Diego": { lat: 32.8801, lng: -117.234, state: "CA", fraternities: 42, sororities: 28, totalMembers: 3500, conference: "WEST COAST CONFERENCE", division: "DI" },
  "UCLA": { lat: 34.0689, lng: -118.4452, state: "CA", fraternities: 62, sororities: 35, totalMembers: 5200, conference: "PAC-12", division: "D1" },
  "University of California Berkeley": { lat: 36.7371, lng: -120.6725, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ATLANTIC COAST CONFERENCE", division: "DI" },
  "University of California Davis": { lat: 35.8941, lng: -118.8884, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG WEST CONFERENCE", division: "DI" },
  "University of California Irvine": { lat: 35.8035, lng: -118.859, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG WEST CONFERENCE", division: "DI" },
  "University of California Los Angeles": { lat: 35.9467, lng: -119.8635, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG TEN CONFERENCE", division: "DI" },
  "University of California Riverside": { lat: 36.8541, lng: -120.3104, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG WEST CONFERENCE", division: "DI" },
  "University of California San Diego": { lat: 35.6664, lng: -119.8126, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG WEST CONFERENCE", division: "DI" },
  "University of California Santa Barbara": { lat: 36.0405, lng: -120.0929, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG WEST CONFERENCE", division: "DI" },
  "University of San Francisco": { lat: 36.1938, lng: -120.3631, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "WEST COAST CONFERENCE", division: "DI" },
  "University of Southern California": { lat: 36.8604, lng: -120.3128, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG TEN CONFERENCE", division: "DI" },
  "University of the Pacific": { lat: 35.4844, lng: -118.6958, state: "CA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "WEST COAST CONFERENCE", division: "DI" },
  "USC": { lat: 34.0224, lng: -118.2851, state: "CA", fraternities: 58, sororities: 33, totalMembers: 4800, conference: "PAC-12", division: "D1" },

  // CO
  "Colorado State": { lat: 40.5734, lng: -105.0865, state: "CO", fraternities: 38, sororities: 22, totalMembers: 2800, conference: "MW", division: "D1" },
  "United States Air Force Academy": { lat: 39.1895, lng: -104.602, state: "CO", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MOUNTAIN WEST CONFERENCE", division: "DI" },
  "University of Colorado Boulder": { lat: 40.015, lng: -105.2705, state: "CO", fraternities: 48, sororities: 26, totalMembers: 3600, conference: "BIG 12 CONFERENCE", division: "DI" },
  "University of Denver": { lat: 39.2604, lng: -104.4868, state: "CO", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SUMMIT LEAGUE", division: "DI" },
  "University of Northern Colorado": { lat: 38.1239, lng: -105.7384, state: "CO", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG SKY CONFERENCE", division: "DI" },

  // CT
  "Central Connecticut State University": { lat: 41.3048, lng: -72.2583, state: "CT", fraternities: 8, sororities: 5, totalMembers: 500, conference: "NORTHEAST CONFERENCE", division: "DI" },
  "Fairfield University": { lat: 42.5753, lng: -72.2971, state: "CT", fraternities: 8, sororities: 5, totalMembers: 500, conference: "METRO ATLANTIC ATHLETIC CONFERENCE", division: "DI" },
  "Quinnipiac University": { lat: 42.4307, lng: -72.1395, state: "CT", fraternities: 8, sororities: 5, totalMembers: 500, conference: "METRO ATLANTIC ATHLETIC CONFERENCE", division: "DI" },
  "Sacred Heart University": { lat: 41.408, lng: -71.775, state: "CT", fraternities: 8, sororities: 5, totalMembers: 500, conference: "METRO ATLANTIC ATHLETIC CONFERENCE", division: "DI" },
  "UConn": { lat: 41.8084, lng: -72.2512, state: "CT", fraternities: 38, sororities: 22, totalMembers: 2800, conference: "BIG EAST", division: "D1" },
  "University of Connecticut": { lat: 41.476, lng: -73.4037, state: "CT", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG EAST CONFERENCE", division: "DI" },
  "Yale University": { lat: 41.9924, lng: -72.5555, state: "CT", fraternities: 8, sororities: 5, totalMembers: 500, conference: "IVY LEAGUE", division: "DI" },

  // DC
  "American University": { lat: 38.8441, lng: -77.0028, state: "DC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "PATRIOT LEAGUE", division: "DI" },
  "Georgetown University": { lat: 38.9554, lng: -77.4142, state: "DC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG EAST CONFERENCE", division: "DI" },
  "Howard University": { lat: 39.3858, lng: -77.135, state: "DC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MID-EASTERN ATHLETIC CONFERENCE", division: "DI" },

  // DE
  "Delaware State University": { lat: 39.9245, lng: -75.6647, state: "DE", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MID-EASTERN ATHLETIC CONFERENCE", division: "DI" },
  "University of Delaware": { lat: 40.1806, lng: -76.376, state: "DE", fraternities: 8, sororities: 5, totalMembers: 500, conference: "COASTAL ATHLETIC ASSOCIATION", division: "DI" },

  // FL
  "Bethune-Cookman University": { lat: 27.875, lng: -81.3812, state: "FL", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHWESTERN ATHLETIC CONFERENCE", division: "DI" },
  "Florida Southern College": { lat: 28.0314, lng: -81.9475, state: "FL", fraternities: 7, sororities: 7, totalMembers: 1000, conference: "SUNSHINE STATE", division: "D2" },
  "Florida State": { lat: 30.4419, lng: -84.2985, state: "FL", fraternities: 60, sororities: 33, totalMembers: 4800, conference: "ACC", division: "D1" },
  "Jacksonville University": { lat: 28.6103, lng: -82.019, state: "FL", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ASUN CONFERENCE", division: "DI" },
  "Rollins College": { lat: 28.5915, lng: -81.3484, state: "FL", fraternities: 5, sororities: 5, totalMembers: 800, conference: "SUNSHINE STATE", division: "D2" },
  "Stetson University": { lat: 27.7253, lng: -82.2681, state: "FL", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ASUN CONFERENCE", division: "DI" },
  "University of Florida": { lat: 29.6436, lng: -82.3549, state: "FL", fraternities: 65, sororities: 35, totalMembers: 5000, conference: "AMERICAN ATHLETIC CONFERENCE", division: "DI" },
  "University of Miami": { lat: 25.7216, lng: -80.2793, state: "FL", fraternities: 42, sororities: 25, totalMembers: 3200, conference: "ATLANTIC COAST CONFERENCE", division: "DI" },

  // GA
  "Emory University": { lat: 33.797, lng: -84.3222, state: "GA", fraternities: 35, sororities: 22, totalMembers: 2500, conference: "UAA", division: "D3" },
  "Georgia Tech": { lat: 33.7756, lng: -84.3963, state: "GA", fraternities: 48, sororities: 26, totalMembers: 3600, conference: "ACC", division: "D1" },
  "Kennesaw State University": { lat: 33.7871, lng: -83.3774, state: "GA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "CONFERENCE USA", division: "DI" },
  "Mercer University": { lat: 32.3284, lng: -83.561, state: "GA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHERN CONFERENCE", division: "DI" },
  "Savannah State University": { lat: 32.709, lng: -83.4587, state: "GA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "INDEPENDENT", division: "DI" },
  "University of Georgia": { lat: 33.948, lng: -83.3773, state: "GA", fraternities: 63, sororities: 34, totalMembers: 4900, conference: "SOUTHEASTERN CONFERENCE", division: "DI" },

  // HI
  "University of Hawaii at Manoa": { lat: 21.11, lng: -157.2586, state: "HI", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MOUNTAIN WEST CONFERENCE", division: "DI" },

  // IA
  "Drake University": { lat: 42.6062, lng: -92.8149, state: "IA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MISSOURI VALLEY CONFERENCE", division: "DI" },
  "Iowa State": { lat: 42.0266, lng: -93.6465, state: "IA", fraternities: 48, sororities: 26, totalMembers: 3600, conference: "BIG 12", division: "D1" },
  "University of Iowa": { lat: 41.6611, lng: -91.5302, state: "IA", fraternities: 50, sororities: 28, totalMembers: 3900, conference: "MISSOURI VALLEY CONFERENCE", division: "DI" },

  // ID
  "Boise State": { lat: 43.6025, lng: -116.2023, state: "ID", fraternities: 28, sororities: 18, totalMembers: 2000, conference: "MOUNTAIN WEST CONFERENCE", division: "DI" },
  "Idaho State University": { lat: 44.3462, lng: -114.7525, state: "ID", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG SKY CONFERENCE", division: "DI" },

  // IL
  "Bradley University": { lat: 40.6434, lng: -88.1714, state: "IL", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MISSOURI VALLEY CONFERENCE", division: "DI" },
  "DePaul University": { lat: 39.5708, lng: -88.4554, state: "IL", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG EAST CONFERENCE", division: "DI" },
  "Eastern Illinois University": { lat: 40.0204, lng: -88.7891, state: "IL", fraternities: 8, sororities: 5, totalMembers: 500, conference: "OHIO VALLEY CONFERENCE", division: "DI" },
  "Illinois State University": { lat: 40.8578, lng: -89.3413, state: "IL", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MISSOURI VALLEY CONFERENCE", division: "DI" },
  "Northern Illinois University": { lat: 40.207, lng: -89.8165, state: "IL", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MID-AMERICAN CONFERENCE", division: "DI" },
  "Northwestern": { lat: 42.0565, lng: -87.6753, state: "IL", fraternities: 45, sororities: 28, totalMembers: 3500, conference: "SOUTHLAND CONFERENCE", division: "DI" },
  "Southern Illinois University Carbondale": { lat: 41.2631, lng: -89.728, state: "IL", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MISSOURI VALLEY CONFERENCE", division: "DI" },
  "Southern Illinois University Edwardsville": { lat: 41.3431, lng: -89.5447, state: "IL", fraternities: 8, sororities: 5, totalMembers: 500, conference: "OHIO VALLEY CONFERENCE", division: "DI" },
  "UIUC": { lat: 40.102, lng: -88.2272, state: "IL", fraternities: 68, sororities: 36, totalMembers: 5300, conference: "BIG 10", division: "D1" },
  "University of Chicago": { lat: 41.7886, lng: -87.5987, state: "IL", fraternities: 25, sororities: 18, totalMembers: 1800, conference: "MISSOURI VALLEY CONFERENCE", division: "DI" },
  "University of Illinois Urbana-Champaign": { lat: 40.3985, lng: -88.905, state: "IL", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG TEN CONFERENCE", division: "DI" },
  "Western Illinois University": { lat: 40.1482, lng: -89.1091, state: "IL", fraternities: 8, sororities: 5, totalMembers: 500, conference: "OHIO VALLEY CONFERENCE", division: "DI" },

  // IN
  "Ball State University": { lat: 40.7626, lng: -87.1341, state: "IN", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MID-AMERICAN CONFERENCE", division: "DI" },
  "Butler University": { lat: 39.224, lng: -85.6778, state: "IN", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG EAST CONFERENCE", division: "DI" },
  "DePauw University": { lat: 39.6397, lng: -86.8617, state: "IN", fraternities: 13, sororities: 12, totalMembers: 2400, conference: "NCAC", division: "D3" },
  "Indiana University": { lat: 39.1766, lng: -86.5131, state: "IN", fraternities: 62, sororities: 33, totalMembers: 4800, conference: "HORIZON LEAGUE", division: "DI" },
  "Purdue": { lat: 40.4237, lng: -86.9212, state: "IN", fraternities: 55, sororities: 28, totalMembers: 4100, conference: "BIG TEN CONFERENCE", division: "DI" },
  "University of Evansville": { lat: 38.97, lng: -86.1616, state: "IN", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MISSOURI VALLEY CONFERENCE", division: "DI" },
  "University of Notre Dame": { lat: 40.2085, lng: -85.7509, state: "IN", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ATLANTIC COAST CONFERENCE", division: "DI" },
  "Valparaiso University": { lat: 40.5321, lng: -85.2646, state: "IN", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MISSOURI VALLEY CONFERENCE", division: "DI" },
  "Wabash College": { lat: 40.0398, lng: -86.9068, state: "IN", fraternities: 9, sororities: 0, totalMembers: 1100, conference: "NCAC", division: "D3" },

  // KS
  "Kansas State": { lat: 39.191, lng: -96.5803, state: "KS", fraternities: 42, sororities: 24, totalMembers: 3200, conference: "BIG 12", division: "D1" },
  "University of Kansas": { lat: 38.9543, lng: -95.2558, state: "KS", fraternities: 48, sororities: 26, totalMembers: 3600, conference: "SUMMIT LEAGUE", division: "DI" },
  "Wichita State University": { lat: 38.3455, lng: -96.8, state: "KS", fraternities: 8, sororities: 5, totalMembers: 500, conference: "AMERICAN ATHLETIC CONFERENCE", division: "DI" },

  // KY
  "Bellarmine University": { lat: 37.7803, lng: -85.6596, state: "KY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ASUN CONFERENCE", division: "DI" },
  "Centre College": { lat: 37.6433, lng: -84.781, state: "KY", fraternities: 5, sororities: 4, totalMembers: 650, conference: "SAA", division: "D3" },
  "Morehead State University": { lat: 37.9147, lng: -83.7947, state: "KY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "PIONEER FOOTBALL LEAGUE", division: "DI" },
  "Murray State University": { lat: 37.4587, lng: -83.8701, state: "KY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MISSOURI VALLEY CONFERENCE", division: "DI" },
  "University of Kentucky": { lat: 38.0297, lng: -84.5037, state: "KY", fraternities: 48, sororities: 27, totalMembers: 3700, conference: "MID-AMERICAN CONFERENCE", division: "DI" },
  "University of Louisville": { lat: 38.2104, lng: -85.7584, state: "KY", fraternities: 38, sororities: 22, totalMembers: 2800, conference: "ATLANTIC COAST CONFERENCE", division: "DI" },

  // LA
  "Grambling State University": { lat: 30.948, lng: -91.6913, state: "LA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHWESTERN ATHLETIC CONFERENCE", division: "DI" },
  "Louisiana Tech": { lat: 32.5252, lng: -92.6377, state: "LA", fraternities: 28, sororities: 18, totalMembers: 2000, conference: "CONFERENCE USA", division: "DI" },
  "LSU": { lat: 30.4133, lng: -91.18, state: "LA", fraternities: 52, sororities: 30, totalMembers: 4100, conference: "SEC", division: "D1" },
  "McNeese State University": { lat: 31.6987, lng: -90.9267, state: "LA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHLAND CONFERENCE", division: "DI" },
  "Nicholls State University": { lat: 31.0417, lng: -91.6152, state: "LA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHLAND CONFERENCE", division: "DI" },
  "Southeastern Louisiana University": { lat: 30.2066, lng: -92.3229, state: "LA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHLAND CONFERENCE", division: "DI" },
  "Southern University": { lat: 30.3159, lng: -91.4385, state: "LA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHWESTERN ATHLETIC CONFERENCE", division: "DI" },
  "Tulane": { lat: 29.9389, lng: -90.1208, state: "LA", fraternities: 38, sororities: 22, totalMembers: 2800, conference: "AMERICAN ATHLETIC CONFERENCE", division: "DI" },
  "University of Louisiana at Lafayette": { lat: 31.761, lng: -91.0981, state: "LA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SUN BELT CONFERENCE", division: "DI" },
  "University of Louisiana at Monroe": { lat: 32.0059, lng: -91.5626, state: "LA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SUN BELT CONFERENCE", division: "DI" },
  "University of New Orleans": { lat: 32.0912, lng: -91.012, state: "LA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHLAND CONFERENCE", division: "DI" },

  // MA
  "Bentley University": { lat: 42.3876, lng: -71.2206, state: "MA", fraternities: 6, sororities: 5, totalMembers: 900, conference: "NORTHEAST-10", division: "D2" },
  "Boston University": { lat: 42.3505, lng: -71.1054, state: "MA", fraternities: 40, sororities: 25, totalMembers: 3000, conference: "PATRIOT LEAGUE", division: "DI" },
  "College of the Holy Cross": { lat: 43.0813, lng: -70.8929, state: "MA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "PATRIOT LEAGUE", division: "DI" },
  "Harvard": { lat: 42.377, lng: -71.1167, state: "MA", fraternities: 32, sororities: 20, totalMembers: 2200, conference: "IVY LEAGUE", division: "DI" },
  "Merrimack College": { lat: 41.9808, lng: -71.2913, state: "MA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "METRO ATLANTIC ATHLETIC CONFERENCE", division: "DI" },
  "MIT": { lat: 42.3601, lng: -71.0942, state: "MA", fraternities: 28, sororities: 18, totalMembers: 1900, conference: "NEWMAC", division: "D3" },
  "Northeastern University": { lat: 42.9974, lng: -71.8348, state: "MA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "COASTAL ATHLETIC ASSOCIATION", division: "DI" },
  "University of Massachusetts Amherst": { lat: 41.9491, lng: -72.0996, state: "MA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MID-AMERICAN CONFERENCE", division: "DI" },
  "University of Massachusetts Lowell": { lat: 41.903, lng: -71.5523, state: "MA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "AMERICA EAST CONFERENCE", division: "DI" },

  // MD
  "Coppin State University": { lat: 38.3354, lng: -77.2709, state: "MD", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MID-EASTERN ATHLETIC CONFERENCE", division: "DI" },
  "Morgan State University": { lat: 40.0146, lng: -77.1048, state: "MD", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MID-EASTERN ATHLETIC CONFERENCE", division: "DI" },
  "Mount St. Mary's University": { lat: 38.7779, lng: -77.4132, state: "MD", fraternities: 8, sororities: 5, totalMembers: 500, conference: "METRO ATLANTIC ATHLETIC CONFERENCE", division: "DI" },
  "Towson University": { lat: 39.9474, lng: -76.5857, state: "MD", fraternities: 8, sororities: 5, totalMembers: 500, conference: "COASTAL ATHLETIC ASSOCIATION", division: "DI" },
  "United States Naval Academy": { lat: 39.1297, lng: -76.7356, state: "MD", fraternities: 8, sororities: 5, totalMembers: 500, conference: "AMERICAN ATHLETIC CONFERENCE", division: "DI" },
  "University of Maryland": { lat: 38.9869, lng: -76.9426, state: "MD", fraternities: 48, sororities: 26, totalMembers: 3600, conference: "BIG TEN CONFERENCE", division: "DI" },

  // ME
  "University of Maine": { lat: 45.4071, lng: -68.5025, state: "ME", fraternities: 8, sororities: 5, totalMembers: 500, conference: "AMERICA EAST CONFERENCE", division: "DI" },

  // MI
  "Detroit Mercy": { lat: 44.3115, lng: -85.5036, state: "MI", fraternities: 8, sororities: 5, totalMembers: 500, conference: "HORIZON LEAGUE", division: "DI" },
  "Grand Valley State University": { lat: 42.9633, lng: -85.8881, state: "MI", fraternities: 8, sororities: 9, totalMembers: 1200, conference: "GLIAC", division: "D2" },
  "Michigan State": { lat: 42.7018, lng: -84.4822, state: "MI", fraternities: 65, sororities: 34, totalMembers: 5000, conference: "BIG 10", division: "D1" },
  "Oakland University": { lat: 42.401, lng: -83.8507, state: "MI", fraternities: 8, sororities: 5, totalMembers: 500, conference: "HORIZON LEAGUE", division: "DI" },
  "University of Michigan": { lat: 42.278, lng: -83.7382, state: "MI", fraternities: 70, sororities: 37, totalMembers: 5500, conference: "MID-AMERICAN CONFERENCE", division: "DI" },
  "Wayne State University": { lat: 44.2562, lng: -83.6072, state: "MI", fraternities: 8, sororities: 5, totalMembers: 500, conference: "GREAT LAKES INTERCOLLEGIATE ATHLETIC CONFERENCE", division: "DII" },

  // MN
  "University of Minnesota": { lat: 44.9742, lng: -93.2277, state: "MN", fraternities: 52, sororities: 28, totalMembers: 3900, conference: "BIG TEN CONFERENCE", division: "DI" },

  // MO
  "Missouri State University": { lat: 38.9389, lng: -91.8811, state: "MO", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MISSOURI VALLEY CONFERENCE", division: "DI" },
  "Mizzou": { lat: 38.9404, lng: -92.3277, state: "MO", fraternities: 52, sororities: 29, totalMembers: 4000, conference: "SEC", division: "D1" },
  "Saint Louis University": { lat: 37.9231, lng: -92.9057, state: "MO", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ATLANTIC 10 CONFERENCE", division: "DI" },
  "Southeast Missouri State University": { lat: 38.9852, lng: -92.8551, state: "MO", fraternities: 8, sororities: 5, totalMembers: 500, conference: "OHIO VALLEY CONFERENCE", division: "DI" },
  "University of Missouri": { lat: 38.9135, lng: -92.9093, state: "MO", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHEASTERN CONFERENCE", division: "DI" },
  "Washington University": { lat: 38.6488, lng: -90.3108, state: "MO", fraternities: 35, sororities: 20, totalMembers: 2500, conference: "UAA", division: "D3" },

  // MS
  "Alcorn State University": { lat: 33.4683, lng: -89.7834, state: "MS", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHWESTERN ATHLETIC CONFERENCE", division: "DI" },
  "Jackson State University": { lat: 33.4895, lng: -90.1441, state: "MS", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHWESTERN ATHLETIC CONFERENCE", division: "DI" },
  "Millsaps College": { lat: 32.32, lng: -90.1743, state: "MS", fraternities: 5, sororities: 3, totalMembers: 700, conference: "SAA", division: "D3" },
  "Mississippi State": { lat: 33.4549, lng: -88.7904, state: "MS", fraternities: 45, sororities: 26, totalMembers: 3500, conference: "SOUTHEASTERN CONFERENCE", division: "DI" },
  "Mississippi Valley State University": { lat: 33.3541, lng: -89.8864, state: "MS", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHWESTERN ATHLETIC CONFERENCE", division: "DI" },
  "Ole Miss": { lat: 34.3665, lng: -89.5348, state: "MS", fraternities: 48, sororities: 28, totalMembers: 3800, conference: "SEC", division: "D1" },
  "Southern Miss": { lat: 31.3307, lng: -89.3378, state: "MS", fraternities: 32, sororities: 20, totalMembers: 2400, conference: "SUN BELT CONFERENCE", division: "DI" },

  // MT
  "University of Montana": { lat: 46.8595, lng: -113.9856, state: "MT", fraternities: 25, sororities: 16, totalMembers: 1800, conference: "BIG SKY CONFERENCE", division: "DI" },

  // NC
  "Appalachian State University": { lat: 35.954, lng: -79.6367, state: "NC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SUN BELT CONFERENCE", division: "DI" },
  "Campbell University": { lat: 35.9336, lng: -80.1269, state: "NC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "COASTAL ATHLETIC ASSOCIATION", division: "DI" },
  "Davidson College": { lat: 36.2814, lng: -80.4049, state: "NC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ATLANTIC 10 CONFERENCE", division: "DI" },
  "Duke": { lat: 36.0011, lng: -78.9389, state: "NC", fraternities: 42, sororities: 25, totalMembers: 3200, conference: "ATLANTIC COAST CONFERENCE", division: "DI" },
  "East Carolina University": { lat: 35.312, lng: -79.498, state: "NC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "AMERICAN ATHLETIC CONFERENCE", division: "DI" },
  "Elon University": { lat: 34.7264, lng: -80.1171, state: "NC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "COASTAL ATHLETIC ASSOCIATION", division: "DI" },
  "Gardner-Webb University": { lat: 35.6352, lng: -79.1306, state: "NC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG SOUTH CONFERENCE", division: "DI" },
  "High Point University": { lat: 35.9205, lng: -79.2291, state: "NC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG SOUTH CONFERENCE", division: "DI" },
  "North Carolina A&T State University": { lat: 36.0662, lng: -78.9112, state: "NC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "COLONIAL ATHLETIC ASSOCIATION", division: "DI" },
  "North Carolina Central University": { lat: 34.7275, lng: -79.1772, state: "NC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MID-EASTERN ATHLETIC CONFERENCE", division: "DI" },
  "North Carolina State University": { lat: 35.2503, lng: -80.7155, state: "NC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ATLANTIC COAST CONFERENCE", division: "DI" },
  "UNC Chapel Hill": { lat: 35.9049, lng: -79.0469, state: "NC", fraternities: 55, sororities: 32, totalMembers: 4300, conference: "ACC", division: "D1" },
  "University of North Carolina at Chapel Hill": { lat: 36.5568, lng: -79.1983, state: "NC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ATLANTIC COAST CONFERENCE", division: "DI" },
  "University of North Carolina at Charlotte": { lat: 36.5138, lng: -80.2313, state: "NC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "AMERICAN ATHLETIC CONFERENCE", division: "DI" },
  "University of North Carolina at Greensboro": { lat: 35.2764, lng: -80.5725, state: "NC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHERN CONFERENCE", division: "DI" },
  "University of North Carolina at Wilmington": { lat: 34.8823, lng: -79.5571, state: "NC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "COASTAL ATHLETIC ASSOCIATION", division: "DI" },
  "Wake Forest": { lat: 36.1355, lng: -80.2773, state: "NC", fraternities: 35, sororities: 20, totalMembers: 2500, conference: "ATLANTIC COAST CONFERENCE", division: "DI" },
  "Western Carolina University": { lat: 35.8086, lng: -80.3586, state: "NC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHERN CONFERENCE", division: "DI" },

  // ND
  "University of North Dakota": { lat: 47.9225, lng: -97.0731, state: "ND", fraternities: 20, sororities: 14, totalMembers: 1500, conference: "SUMMIT LEAGUE", division: "DI" },

  // NE
  "Creighton University": { lat: 40.725, lng: -98.1352, state: "NE", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG EAST CONFERENCE", division: "DI" },
  "University of Nebraska": { lat: 40.8202, lng: -96.7005, state: "NE", fraternities: 45, sororities: 26, totalMembers: 3500, conference: "SUMMIT LEAGUE", division: "DI" },

  // NH
  "Dartmouth College": { lat: 43.9517, lng: -71.6178, state: "NH", fraternities: 8, sororities: 5, totalMembers: 500, conference: "IVY LEAGUE", division: "DI" },
  "University of New Hampshire": { lat: 43.2333, lng: -72.2752, state: "NH", fraternities: 8, sororities: 5, totalMembers: 500, conference: "COASTAL ATHLETIC ASSOCIATION", division: "DI" },

  // NJ
  "Fairleigh Dickinson University": { lat: 39.7974, lng: -74.0544, state: "NJ", fraternities: 8, sororities: 5, totalMembers: 500, conference: "NORTHEAST CONFERENCE", division: "DI" },
  "Monmouth University": { lat: 40.2569, lng: -74.658, state: "NJ", fraternities: 8, sororities: 5, totalMembers: 500, conference: "COASTAL ATHLETIC ASSOCIATION", division: "DI" },
  "New Jersey Institute of Technology": { lat: 40.3044, lng: -74.5307, state: "NJ", fraternities: 8, sororities: 5, totalMembers: 500, conference: "AMERICA EAST CONFERENCE", division: "DI" },
  "Princeton University": { lat: 39.3113, lng: -74.7688, state: "NJ", fraternities: 8, sororities: 5, totalMembers: 500, conference: "IVY LEAGUE", division: "DI" },
  "Rider University": { lat: 40.059, lng: -75.2219, state: "NJ", fraternities: 8, sororities: 5, totalMembers: 500, conference: "METRO ATLANTIC ATHLETIC CONFERENCE", division: "DI" },
  "Rutgers": { lat: 40.5008, lng: -74.4474, state: "NJ", fraternities: 52, sororities: 28, totalMembers: 3900, conference: "BIG TEN CONFERENCE", division: "DI" },
  "Saint Peter's University": { lat: 40.7626, lng: -74.9562, state: "NJ", fraternities: 8, sororities: 5, totalMembers: 500, conference: "METRO ATLANTIC ATHLETIC CONFERENCE", division: "DI" },
  "Seton Hall University": { lat: 40.375, lng: -74.8519, state: "NJ", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG EAST CONFERENCE", division: "DI" },

  // NM
  "University of New Mexico": { lat: 35.0844, lng: -106.6198, state: "NM", fraternities: 32, sororities: 20, totalMembers: 2400, conference: "MOUNTAIN WEST CONFERENCE", division: "DI" },

  // NV
  "University of Nevada Las Vegas": { lat: 38.5124, lng: -117.4657, state: "NV", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MOUNTAIN WEST CONFERENCE", division: "DI" },
  "University of Nevada Reno": { lat: 39.5445, lng: -119.8154, state: "NV", fraternities: 32, sororities: 20, totalMembers: 2400, conference: "MOUNTAIN WEST CONFERENCE", division: "DI" },
  "UNLV": { lat: 36.1082, lng: -115.145, state: "NV", fraternities: 38, sororities: 22, totalMembers: 2800, conference: "MW", division: "D1" },

  // NY
  "Binghamton University": { lat: 41.2075, lng: -74.8955, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "AMERICA EAST CONFERENCE", division: "DI" },
  "Canisius University": { lat: 42.6678, lng: -75.5201, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "METRO ATLANTIC ATHLETIC CONFERENCE", division: "DI" },
  "Colgate University": { lat: 42.8193, lng: -75.5354, state: "NY", fraternities: 6, sororities: 6, totalMembers: 1800, conference: "PATRIOT LEAGUE", division: "DI" },
  "Columbia University": { lat: 40.8075, lng: -73.9626, state: "NY", fraternities: 35, sororities: 22, totalMembers: 2500, conference: "IVY LEAGUE", division: "DI" },
  "Cornell University": { lat: 42.4534, lng: -76.4735, state: "NY", fraternities: 52, sororities: 30, totalMembers: 4200, conference: "IVY LEAGUE", division: "DI" },
  "Fordham University": { lat: 41.5116, lng: -75.6897, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ATLANTIC 10 CONFERENCE", division: "DI" },
  "Hofstra University": { lat: 41.7549, lng: -75.7477, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "COASTAL ATHLETIC ASSOCIATION", division: "DI" },
  "Iona University": { lat: 41.7113, lng: -75.1767, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "METRO ATLANTIC ATHLETIC CONFERENCE", division: "DI" },
  "Long Island University": { lat: 41.3148, lng: -75.2208, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "NORTHEAST CONFERENCE", division: "DI" },
  "Manhattan College": { lat: 42.5469, lng: -75.4861, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "METRO ATLANTIC ATHLETIC CONFERENCE", division: "DI" },
  "Marist College": { lat: 42.5493, lng: -75.3936, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "METRO ATLANTIC ATHLETIC CONFERENCE", division: "DI" },
  "Niagara University": { lat: 42.7114, lng: -75.4485, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "METRO ATLANTIC ATHLETIC CONFERENCE", division: "DI" },
  "NYU": { lat: 40.7295, lng: -73.9965, state: "NY", fraternities: 32, sororities: 25, totalMembers: 2800, conference: "UAA", division: "D3" },
  "Saint Bonaventure University": { lat: 42.0502, lng: -75.0517, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ATLANTIC 10 CONFERENCE", division: "DI" },
  "Saint Francis College": { lat: 42.5689, lng: -74.9972, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "NORTHEAST CONFERENCE", division: "DI" },
  "Saint John's University": { lat: 42.8253, lng: -75.2802, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG EAST CONFERENCE", division: "DI" },
  "Siena College": { lat: 42.3448, lng: -75.4676, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "METRO ATLANTIC ATHLETIC CONFERENCE", division: "DI" },
  "St. Francis Brooklyn": { lat: 41.8788, lng: -75.4555, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "NORTHEAST CONFERENCE", division: "DI" },
  "Stony Brook University": { lat: 41.4909, lng: -75.3285, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "COASTAL ATHLETIC ASSOCIATION", division: "DI" },
  "Syracuse University": { lat: 43.0392, lng: -76.1351, state: "NY", fraternities: 48, sororities: 28, totalMembers: 3800, conference: "ATLANTIC COAST CONFERENCE", division: "DI" },
  "United States Military Academy": { lat: 41.2607, lng: -75.8749, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "AMERICAN ATHLETIC CONFERENCE", division: "DI" },
  "University at Albany SUNY": { lat: 41.679, lng: -75.0842, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "COASTAL ATHLETIC ASSOCIATION", division: "DI" },
  "University at Buffalo SUNY": { lat: 43.0074, lng: -74.232, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MID-AMERICAN CONFERENCE", division: "DI" },
  "Wagner College": { lat: 43.0108, lng: -75.7367, state: "NY", fraternities: 8, sororities: 5, totalMembers: 500, conference: "NORTHEAST CONFERENCE", division: "DI" },

  // OH
  "Bowling Green State University": { lat: 40.1694, lng: -82.0119, state: "OH", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MID-AMERICAN CONFERENCE", division: "DI" },
  "Cleveland State University": { lat: 41.1546, lng: -83.0354, state: "OH", fraternities: 8, sororities: 5, totalMembers: 500, conference: "HORIZON LEAGUE", division: "DI" },
  "Denison University": { lat: 40.0724, lng: -82.5277, state: "OH", fraternities: 10, sororities: 8, totalMembers: 1300, conference: "NCAC", division: "D3" },
  "Miami University": { lat: 39.5079, lng: -84.7452, state: "OH", fraternities: 55, sororities: 30, totalMembers: 4200, conference: "MID-AMERICAN CONFERENCE", division: "DI" },
  "Ohio State": { lat: 40.0067, lng: -83.0305, state: "OH", fraternities: 68, sororities: 36, totalMembers: 5400, conference: "BIG TEN CONFERENCE", division: "DI" },
  "Ohio University": { lat: 39.6185, lng: -82.0573, state: "OH", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MID-AMERICAN CONFERENCE", division: "DI" },
  "University of Akron": { lat: 40.8263, lng: -83.0066, state: "OH", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MID-AMERICAN CONFERENCE", division: "DI" },
  "University of Cincinnati": { lat: 39.4795, lng: -82.1351, state: "OH", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG 12 CONFERENCE", division: "DI" },
  "University of Dayton": { lat: 40.2915, lng: -82.4422, state: "OH", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ATLANTIC 10 CONFERENCE", division: "DI" },
  "University of Toledo": { lat: 39.6677, lng: -82.5155, state: "OH", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MID-AMERICAN CONFERENCE", division: "DI" },
  "Wright State University": { lat: 40.8916, lng: -83.3745, state: "OH", fraternities: 8, sororities: 5, totalMembers: 500, conference: "HORIZON LEAGUE", division: "DI" },
  "Xavier University": { lat: 41.3697, lng: -82.7925, state: "OH", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG EAST CONFERENCE", division: "DI" },
  "Youngstown State University": { lat: 41.3518, lng: -82.4122, state: "OH", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MISSOURI VALLEY CONFERENCE", division: "DI" },

  // OK
  "Oklahoma State": { lat: 36.1156, lng: -97.0584, state: "OK", fraternities: 48, sororities: 26, totalMembers: 3600, conference: "BIG 12", division: "D1" },
  "Oral Roberts University": { lat: 34.9952, lng: -96.5012, state: "OK", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SUMMIT LEAGUE", division: "DI" },
  "University of Oklahoma": { lat: 35.2058, lng: -97.4452, state: "OK", fraternities: 55, sororities: 30, totalMembers: 4200, conference: "SOUTHEASTERN CONFERENCE", division: "DI" },
  "University of Tulsa": { lat: 35.7492, lng: -96.1245, state: "OK", fraternities: 8, sororities: 5, totalMembers: 500, conference: "AMERICAN ATHLETIC CONFERENCE", division: "DI" },

  // OR
  "Oregon State": { lat: 44.5646, lng: -123.278, state: "OR", fraternities: 38, sororities: 22, totalMembers: 2800, conference: "PAC-12", division: "D1" },
  "Portland State University": { lat: 43.5783, lng: -121.751, state: "OR", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG SKY CONFERENCE", division: "DI" },
  "University of Oregon": { lat: 44.0448, lng: -123.0718, state: "OR", fraternities: 42, sororities: 24, totalMembers: 3200, conference: "BIG TEN CONFERENCE", division: "DI" },
  "University of Portland": { lat: 44.0206, lng: -121.5573, state: "OR", fraternities: 8, sororities: 5, totalMembers: 500, conference: "WEST COAST CONFERENCE", division: "DI" },

  // PA
  "Bucknell University": { lat: 40.9546, lng: -76.8836, state: "PA", fraternities: 7, sororities: 10, totalMembers: 1500, conference: "PATRIOT LEAGUE", division: "DI" },
  "Carnegie Mellon": { lat: 40.4433, lng: -79.9436, state: "PA", fraternities: 22, sororities: 18, totalMembers: 1800, conference: "UAA", division: "D3" },
  "Drexel University": { lat: 40.4813, lng: -78.0461, state: "PA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "COASTAL ATHLETIC ASSOCIATION", division: "DI" },
  "Duquesne University": { lat: 40.4159, lng: -77.4843, state: "PA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ATLANTIC 10 CONFERENCE", division: "DI" },
  "Gettysburg College": { lat: 39.834, lng: -77.236, state: "PA", fraternities: 5, sororities: 6, totalMembers: 900, conference: "CENTENNIAL", division: "D3" },
  "La Salle University": { lat: 40.3507, lng: -77.7918, state: "PA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ATLANTIC 10 CONFERENCE", division: "DI" },
  "Lafayette College": { lat: 41.5166, lng: -77.1208, state: "PA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "PATRIOT LEAGUE", division: "DI" },
  "Lehigh University": { lat: 40.5631, lng: -78.0522, state: "PA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "PATRIOT LEAGUE", division: "DI" },
  "Penn State": { lat: 40.7982, lng: -77.8599, state: "PA", fraternities: 58, sororities: 32, totalMembers: 4500, conference: "BIG 10", division: "D1" },
  "Robert Morris University": { lat: 39.9667, lng: -77.351, state: "PA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "HORIZON LEAGUE", division: "DI" },
  "Saint Francis University": { lat: 40.4941, lng: -78.0164, state: "PA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "NORTHEAST CONFERENCE", division: "DI" },
  "Saint Joseph's University": { lat: 41.4153, lng: -76.7485, state: "PA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ATLANTIC 10 CONFERENCE", division: "DI" },
  "Temple University": { lat: 39.9808, lng: -75.1548, state: "PA", fraternities: 38, sororities: 25, totalMembers: 2800, conference: "AMERICAN ATHLETIC CONFERENCE", division: "DI" },
  "University of Pennsylvania": { lat: 39.9522, lng: -75.1932, state: "PA", fraternities: 45, sororities: 28, totalMembers: 3200, conference: "IVY LEAGUE", division: "DI" },
  "University of Pittsburgh": { lat: 40.4444, lng: -79.9608, state: "PA", fraternities: 42, sororities: 24, totalMembers: 3200, conference: "ATLANTIC COAST CONFERENCE", division: "DI" },
  "Villanova": { lat: 40.0384, lng: -75.3434, state: "PA", fraternities: 25, sororities: 20, totalMembers: 2000, conference: "BIG EAST CONFERENCE", division: "DI" },

  // RI
  "Brown University": { lat: 41.8268, lng: -71.4025, state: "RI", fraternities: 30, sororities: 18, totalMembers: 2200, conference: "IVY LEAGUE", division: "DI" },
  "Bryant University": { lat: 41.3512, lng: -71.9096, state: "RI", fraternities: 8, sororities: 5, totalMembers: 500, conference: "AMERICA EAST CONFERENCE", division: "DI" },
  "Providence College": { lat: 42.0458, lng: -71.5485, state: "RI", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG EAST CONFERENCE", division: "DI" },
  "University of Rhode Island": { lat: 42.2504, lng: -71.8102, state: "RI", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ATLANTIC 10 CONFERENCE", division: "DI" },

  // SC
  "Charleston Southern University": { lat: 33.2787, lng: -80.5443, state: "SC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG SOUTH CONFERENCE", division: "DI" },
  "Clemson": { lat: 34.6834, lng: -82.8374, state: "SC", fraternities: 45, sororities: 25, totalMembers: 3400, conference: "ATLANTIC COAST CONFERENCE", division: "DI" },
  "Coastal Carolina University": { lat: 33.0975, lng: -81.8872, state: "SC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SUN BELT CONFERENCE", division: "DI" },
  "College of Charleston": { lat: 33.7258, lng: -80.6895, state: "SC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "COASTAL ATHLETIC ASSOCIATION", division: "DI" },
  "Furman University": { lat: 34.1994, lng: -81.5795, state: "SC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHERN CONFERENCE", division: "DI" },
  "Presbyterian College": { lat: 33.8561, lng: -81.4424, state: "SC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "PIONEER FOOTBALL LEAGUE", division: "DI" },
  "The Citadel": { lat: 33.5559, lng: -81.1611, state: "SC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHERN CONFERENCE", division: "DI" },
  "University of South Carolina": { lat: 33.9938, lng: -81.0299, state: "SC", fraternities: 48, sororities: 27, totalMembers: 3600, conference: "SOUTHEASTERN CONFERENCE", division: "DI" },
  "Winthrop University": { lat: 33.312, lng: -80.2346, state: "SC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG SOUTH CONFERENCE", division: "DI" },
  "Wofford College": { lat: 34.8215, lng: -81.2835, state: "SC", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHERN CONFERENCE", division: "DI" },

  // SD
  "South Dakota State": { lat: 44.3114, lng: -96.7854, state: "SD", fraternities: 18, sororities: 12, totalMembers: 1400, conference: "SUMMIT LEAGUE", division: "DI" },

  // TN
  "Austin Peay State University": { lat: 36.7316, lng: -86.5892, state: "TN", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ASUN CONFERENCE", division: "DI" },
  "Belmont University": { lat: 35.7306, lng: -86.8558, state: "TN", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MISSOURI VALLEY CONFERENCE", division: "DI" },
  "Lipscomb University": { lat: 35.9464, lng: -86.5007, state: "TN", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ASUN CONFERENCE", division: "DI" },
  "Rhodes College": { lat: 35.1558, lng: -89.991, state: "TN", fraternities: 8, sororities: 9, totalMembers: 1300, conference: "SAA", division: "D3" },
  "Sewanee": { lat: 35.2034, lng: -85.9197, state: "TN", fraternities: 10, sororities: 10, totalMembers: 1400, conference: "SAA", division: "D3" },
  "University of Memphis": { lat: 35.0277, lng: -86.1578, state: "TN", fraternities: 8, sororities: 5, totalMembers: 500, conference: "AMERICAN ATHLETIC CONFERENCE", division: "DI" },
  "University of Tennessee": { lat: 35.9544, lng: -83.9295, state: "TN", fraternities: 52, sororities: 28, totalMembers: 3900, conference: "OHIO VALLEY CONFERENCE", division: "DI" },
  "Vanderbilt": { lat: 36.1447, lng: -86.8027, state: "TN", fraternities: 42, sororities: 24, totalMembers: 3100, conference: "SOUTHEASTERN CONFERENCE", division: "DI" },

  // TX
  "Abilene Christian University": { lat: 31.7832, lng: -97.364, state: "TX", fraternities: 8, sororities: 5, totalMembers: 500, conference: "WESTERN ATHLETIC CONFERENCE", division: "DI" },
  "Baylor University": { lat: 30.4534, lng: -97.4896, state: "TX", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG 12 CONFERENCE", division: "DI" },
  "Houston Christian University": { lat: 31.7042, lng: -97.2172, state: "TX", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHLAND CONFERENCE", division: "DI" },
  "Lamar University": { lat: 30.635, lng: -97.5452, state: "TX", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHLAND CONFERENCE", division: "DI" },
  "Prairie View A&M University": { lat: 30.6396, lng: -96.8748, state: "TX", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHWESTERN ATHLETIC CONFERENCE", division: "DI" },
  "Rice University": { lat: 29.7174, lng: -95.4018, state: "TX", fraternities: 28, sororities: 20, totalMembers: 2200, conference: "AMERICAN ATHLETIC CONFERENCE", division: "DI" },
  "Sam Houston State University": { lat: 30.6164, lng: -98.5378, state: "TX", fraternities: 8, sororities: 5, totalMembers: 500, conference: "CONFERENCE USA", division: "DI" },
  "SMU": { lat: 32.8407, lng: -96.7847, state: "TX", fraternities: 45, sororities: 28, totalMembers: 3500, conference: "ACC", division: "D1" },
  "Southern Methodist University": { lat: 31.8893, lng: -97.8224, state: "TX", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ATLANTIC COAST CONFERENCE", division: "DI" },
  "Stephen F. Austin State University": { lat: 30.5643, lng: -96.661, state: "TX", fraternities: 8, sororities: 5, totalMembers: 500, conference: "WESTERN ATHLETIC CONFERENCE", division: "DI" },
  "Texas A&M": { lat: 30.6014, lng: -96.3144, state: "TX", fraternities: 65, sororities: 35, totalMembers: 5200, conference: "SUN BELT CONFERENCE", division: "DI" },
  "Texas Christian University": { lat: 30.5732, lng: -98.0663, state: "TX", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG 12 CONFERENCE", division: "DI" },
  "Texas Southern University": { lat: 31.4217, lng: -97.8294, state: "TX", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHWESTERN ATHLETIC CONFERENCE", division: "DI" },
  "Texas Tech University": { lat: 30.9239, lng: -97.5593, state: "TX", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG 12 CONFERENCE", division: "DI" },
  "University of Houston": { lat: 30.1638, lng: -96.6418, state: "TX", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG 12 CONFERENCE", division: "DI" },
  "University of North Texas": { lat: 30.5173, lng: -97.9631, state: "TX", fraternities: 8, sororities: 5, totalMembers: 500, conference: "AMERICAN ATHLETIC CONFERENCE", division: "DI" },
  "University of Texas at Arlington": { lat: 30.0635, lng: -97.3394, state: "TX", fraternities: 8, sororities: 5, totalMembers: 500, conference: "WESTERN ATHLETIC CONFERENCE", division: "DI" },
  "University of Texas at Austin": { lat: 30.9013, lng: -97.0672, state: "TX", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SOUTHEASTERN CONFERENCE", division: "DI" },
  "University of Texas at El Paso": { lat: 30.9409, lng: -97.3461, state: "TX", fraternities: 8, sororities: 5, totalMembers: 500, conference: "CONFERENCE USA", division: "DI" },
  "University of Texas at San Antonio": { lat: 32.0287, lng: -97.0478, state: "TX", fraternities: 8, sororities: 5, totalMembers: 500, conference: "AMERICAN ATHLETIC CONFERENCE", division: "DI" },
  "University of Texas Rio Grande Valley": { lat: 31.497, lng: -97.1204, state: "TX", fraternities: 8, sororities: 5, totalMembers: 500, conference: "WESTERN ATHLETIC CONFERENCE", division: "DI" },
  "UT Austin": { lat: 30.2849, lng: -97.7341, state: "TX", fraternities: 72, sororities: 38, totalMembers: 5800, conference: "SEC", division: "D1" },

  // UT
  "Brigham Young University": { lat: 40.8742, lng: -111.8889, state: "UT", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG 12 CONFERENCE", division: "DI" },
  "BYU": { lat: 40.2519, lng: -111.6493, state: "UT", fraternities: 0, sororities: 0, totalMembers: 0, conference: "BIG 12", division: "D1" },
  "University of Utah": { lat: 40.7649, lng: -111.8421, state: "UT", fraternities: 35, sororities: 20, totalMembers: 2500, conference: "BIG 12 CONFERENCE", division: "DI" },
  "Weber State University": { lat: 39.5437, lng: -112.229, state: "UT", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG SKY CONFERENCE", division: "DI" },

  // VA
  "College of William & Mary": { lat: 37.2614, lng: -79.1256, state: "VA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "COASTAL ATHLETIC ASSOCIATION", division: "DI" },
  "George Mason University": { lat: 37.6946, lng: -78.5774, state: "VA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ATLANTIC 10 CONFERENCE", division: "DI" },
  "Hampton University": { lat: 38.313, lng: -78.0061, state: "VA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "COASTAL ATHLETIC ASSOCIATION", division: "DI" },
  "James Madison University": { lat: 37.8239, lng: -78.7996, state: "VA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SUN BELT CONFERENCE", division: "DI" },
  "Liberty University": { lat: 37.9041, lng: -79.1255, state: "VA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "CONFERENCE USA", division: "DI" },
  "Longwood University": { lat: 38.438, lng: -77.4968, state: "VA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG SOUTH CONFERENCE", division: "DI" },
  "Norfolk State University": { lat: 36.8711, lng: -78.5858, state: "VA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "MID-EASTERN ATHLETIC CONFERENCE", division: "DI" },
  "Old Dominion University": { lat: 36.8708, lng: -78.1401, state: "VA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SUN BELT CONFERENCE", division: "DI" },
  "Radford University": { lat: 37.7044, lng: -78.0942, state: "VA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG SOUTH CONFERENCE", division: "DI" },
  "University of Richmond": { lat: 38.2451, lng: -77.2598, state: "VA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "ATLANTIC 10 CONFERENCE", division: "DI" },
  "University of Virginia": { lat: 38.0336, lng: -78.508, state: "VA", fraternities: 58, sororities: 30, totalMembers: 4400, conference: "ATLANTIC COAST CONFERENCE", division: "DI" },
  "Virginia Tech": { lat: 37.2284, lng: -80.4234, state: "VA", fraternities: 48, sororities: 26, totalMembers: 3600, conference: "ACC", division: "D1" },
  "Washington and Lee University": { lat: 37.7853, lng: -79.4399, state: "VA", fraternities: 13, sororities: 12, totalMembers: 2200, conference: "WEST COAST CONFERENCE", division: "DI" },

  // VT
  "University of Vermont": { lat: 43.3063, lng: -73.2661, state: "VT", fraternities: 8, sororities: 5, totalMembers: 500, conference: "AMERICA EAST CONFERENCE", division: "DI" },

  // WA
  "Gonzaga University": { lat: 47.4851, lng: -122.0224, state: "WA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "WEST COAST CONFERENCE", division: "DI" },
  "Seattle University": { lat: 46.4661, lng: -120.9237, state: "WA", fraternities: 8, sororities: 5, totalMembers: 500, conference: "WESTERN ATHLETIC CONFERENCE", division: "DI" },
  "University of Washington": { lat: 47.6553, lng: -122.3035, state: "WA", fraternities: 52, sororities: 28, totalMembers: 3900, conference: "BIG TEN CONFERENCE", division: "DI" },
  "Washington State": { lat: 46.7319, lng: -117.1542, state: "WA", fraternities: 45, sororities: 25, totalMembers: 3400, conference: "PAC-12", division: "D1" },

  // WI
  "Marquette University": { lat: 45.1027, lng: -89.7481, state: "WI", fraternities: 8, sororities: 5, totalMembers: 500, conference: "BIG EAST CONFERENCE", division: "DI" },
  "University of Wisconsin": { lat: 43.0766, lng: -89.4125, state: "WI", fraternities: 58, sororities: 31, totalMembers: 4500, conference: "HORIZON LEAGUE", division: "DI" },

  // WV
  "Marshall University": { lat: 38.7225, lng: -80.7054, state: "WV", fraternities: 8, sororities: 5, totalMembers: 500, conference: "SUN BELT CONFERENCE", division: "DI" },
  "West Virginia University": { lat: 39.635, lng: -79.9539, state: "WV", fraternities: 42, sororities: 24, totalMembers: 3200, conference: "BIG 12 CONFERENCE", division: "DI" },

  // WY
  "University of Wyoming": { lat: 41.3147, lng: -105.5652, state: "WY", fraternities: 22, sororities: 15, totalMembers: 1600, conference: "MOUNTAIN WEST CONFERENCE", division: "DI" },
};
