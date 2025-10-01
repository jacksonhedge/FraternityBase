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
  // Pennsylvania
  "Penn State": { lat: 40.7982, lng: -77.8599, state: "PA", fraternities: 58, sororities: 32, totalMembers: 4500, conference: "BIG 10", division: "D1" },
  "University of Pennsylvania": { lat: 39.9522, lng: -75.1932, state: "PA", fraternities: 45, sororities: 28, totalMembers: 3200, conference: "IVY", division: "D1" },
  "Temple University": { lat: 39.9808, lng: -75.1548, state: "PA", fraternities: 38, sororities: 25, totalMembers: 2800, conference: "AAC", division: "D1" },
  "Carnegie Mellon": { lat: 40.4433, lng: -79.9436, state: "PA", fraternities: 22, sororities: 18, totalMembers: 1800, conference: "UAA", division: "D3" },
  "Villanova": { lat: 40.0384, lng: -75.3434, state: "PA", fraternities: 25, sororities: 20, totalMembers: 2000, conference: "BIG EAST", division: "D1" },
  "University of Pittsburgh": { lat: 40.4444, lng: -79.9608, state: "PA", fraternities: 42, sororities: 24, totalMembers: 3200, conference: "ACC", division: "D1" },
  "Bucknell University": { lat: 40.9546, lng: -76.8836, state: "PA", fraternities: 7, sororities: 10, totalMembers: 1500, conference: "PATRIOT", division: "D1" },
  "Gettysburg College": { lat: 39.8340, lng: -77.2360, state: "PA", fraternities: 5, sororities: 6, totalMembers: 900, conference: "CENTENNIAL", division: "D3" },

  // New York
  "Cornell University": { lat: 42.4534, lng: -76.4735, state: "NY", fraternities: 52, sororities: 30, totalMembers: 4200, conference: "IVY", division: "D1" },
  "Syracuse University": { lat: 43.0392, lng: -76.1351, state: "NY", fraternities: 48, sororities: 28, totalMembers: 3800, conference: "ACC", division: "D1" },
  "Columbia University": { lat: 40.8075, lng: -73.9626, state: "NY", fraternities: 35, sororities: 22, totalMembers: 2500, conference: "IVY", division: "D1" },
  "NYU": { lat: 40.7295, lng: -73.9965, state: "NY", fraternities: 32, sororities: 25, totalMembers: 2800, conference: "UAA", division: "D3" },
  "Colgate University": { lat: 42.8193, lng: -75.5354, state: "NY", fraternities: 6, sororities: 6, totalMembers: 1800, conference: "PATRIOT", division: "D1" },

  // California
  "UCLA": { lat: 34.0689, lng: -118.4452, state: "CA", fraternities: 62, sororities: 35, totalMembers: 5200, conference: "PAC-12", division: "D1" },
  "USC": { lat: 34.0224, lng: -118.2851, state: "CA", fraternities: 58, sororities: 33, totalMembers: 4800, conference: "PAC-12", division: "D1" },
  "Stanford": { lat: 37.4275, lng: -122.1697, state: "CA", fraternities: 38, sororities: 25, totalMembers: 3000, conference: "PAC-12", division: "D1" },
  "UC Berkeley": { lat: 37.8719, lng: -122.2585, state: "CA", fraternities: 55, sororities: 30, totalMembers: 4500, conference: "PAC-12", division: "D1" },
  "UC San Diego": { lat: 32.8801, lng: -117.2340, state: "CA", fraternities: 42, sororities: 28, totalMembers: 3500, conference: "BIG WEST", division: "D1" },

  // Texas
  "UT Austin": { lat: 30.2849, lng: -97.7341, state: "TX", fraternities: 72, sororities: 38, totalMembers: 5800, conference: "SEC", division: "D1" },
  "Texas A&M": { lat: 30.6014, lng: -96.3144, state: "TX", fraternities: 65, sororities: 35, totalMembers: 5200, conference: "SEC", division: "D1" },
  "Rice University": { lat: 29.7174, lng: -95.4018, state: "TX", fraternities: 28, sororities: 20, totalMembers: 2200, conference: "AAC", division: "D1" },
  "SMU": { lat: 32.8407, lng: -96.7847, state: "TX", fraternities: 45, sororities: 28, totalMembers: 3500, conference: "ACC", division: "D1" },

  // Florida
  "University of Florida": { lat: 29.6436, lng: -82.3549, state: "FL", fraternities: 65, sororities: 35, totalMembers: 5000, conference: "SEC", division: "D1" },
  "Florida State": { lat: 30.4419, lng: -84.2985, state: "FL", fraternities: 60, sororities: 33, totalMembers: 4800, conference: "ACC", division: "D1" },
  "University of Miami": { lat: 25.7216, lng: -80.2793, state: "FL", fraternities: 42, sororities: 25, totalMembers: 3200, conference: "ACC", division: "D1" },
  "Rollins College": { lat: 28.5915, lng: -81.3484, state: "FL", fraternities: 5, sororities: 5, totalMembers: 800, conference: "SUNSHINE STATE", division: "D2" },
  "Florida Southern College": { lat: 28.0314, lng: -81.9475, state: "FL", fraternities: 7, sororities: 7, totalMembers: 1000, conference: "SUNSHINE STATE", division: "D2" },

  // Illinois
  "Northwestern": { lat: 42.0565, lng: -87.6753, state: "IL", fraternities: 45, sororities: 28, totalMembers: 3500, conference: "BIG 10", division: "D1" },
  "UIUC": { lat: 40.1020, lng: -88.2272, state: "IL", fraternities: 68, sororities: 36, totalMembers: 5300, conference: "BIG 10", division: "D1" },
  "University of Chicago": { lat: 41.7886, lng: -87.5987, state: "IL", fraternities: 25, sororities: 18, totalMembers: 1800, conference: "UAA", division: "D3" },

  // Georgia
  "University of Georgia": { lat: 33.9480, lng: -83.3773, state: "GA", fraternities: 63, sororities: 34, totalMembers: 4900, conference: "SEC", division: "D1" },
  "Georgia Tech": { lat: 33.7756, lng: -84.3963, state: "GA", fraternities: 48, sororities: 26, totalMembers: 3600, conference: "ACC", division: "D1" },
  "Emory University": { lat: 33.7970, lng: -84.3222, state: "GA", fraternities: 35, sororities: 22, totalMembers: 2500, conference: "UAA", division: "D3" },

  // Massachusetts
  "Harvard": { lat: 42.3770, lng: -71.1167, state: "MA", fraternities: 32, sororities: 20, totalMembers: 2200, conference: "IVY", division: "D1" },
  "MIT": { lat: 42.3601, lng: -71.0942, state: "MA", fraternities: 28, sororities: 18, totalMembers: 1900, conference: "NEWMAC", division: "D3" },
  "Boston University": { lat: 42.3505, lng: -71.1054, state: "MA", fraternities: 40, sororities: 25, totalMembers: 3000, conference: "PATRIOT", division: "D1" },
  "Bentley University": { lat: 42.3876, lng: -71.2206, state: "MA", fraternities: 6, sororities: 5, totalMembers: 900, conference: "NORTHEAST-10", division: "D2" },

  // Michigan
  "University of Michigan": { lat: 42.2780, lng: -83.7382, state: "MI", fraternities: 70, sororities: 37, totalMembers: 5500, conference: "BIG 10", division: "D1" },
  "Michigan State": { lat: 42.7018, lng: -84.4822, state: "MI", fraternities: 65, sororities: 34, totalMembers: 5000, conference: "BIG 10", division: "D1" },
  "Grand Valley State University": { lat: 42.9633, lng: -85.8881, state: "MI", fraternities: 8, sororities: 9, totalMembers: 1200, conference: "GLIAC", division: "D2" },

  // Ohio
  "Ohio State": { lat: 40.0067, lng: -83.0305, state: "OH", fraternities: 68, sororities: 36, totalMembers: 5400, conference: "BIG 10", division: "D1" },
  "Miami University": { lat: 39.5079, lng: -84.7452, state: "OH", fraternities: 55, sororities: 30, totalMembers: 4200, conference: "MAC", division: "D1" },
  "Denison University": { lat: 40.0724, lng: -82.5277, state: "OH", fraternities: 10, sororities: 8, totalMembers: 1300, conference: "NCAC", division: "D3" },

  // North Carolina
  "Duke": { lat: 36.0011, lng: -78.9389, state: "NC", fraternities: 42, sororities: 25, totalMembers: 3200, conference: "ACC", division: "D1" },
  "UNC Chapel Hill": { lat: 35.9049, lng: -79.0469, state: "NC", fraternities: 55, sororities: 32, totalMembers: 4300, conference: "ACC", division: "D1" },
  "Wake Forest": { lat: 36.1355, lng: -80.2773, state: "NC", fraternities: 35, sororities: 20, totalMembers: 2500, conference: "ACC", division: "D1" },

  // Virginia
  "University of Virginia": { lat: 38.0336, lng: -78.5080, state: "VA", fraternities: 58, sororities: 30, totalMembers: 4400, conference: "ACC", division: "D1" },
  "Virginia Tech": { lat: 37.2284, lng: -80.4234, state: "VA", fraternities: 48, sororities: 26, totalMembers: 3600, conference: "ACC", division: "D1" },
  "Washington and Lee University": { lat: 37.7853, lng: -79.4399, state: "VA", fraternities: 13, sororities: 12, totalMembers: 2200, conference: "ODAC", division: "D3" },

  // Indiana
  "Indiana University": { lat: 39.1766, lng: -86.5131, state: "IN", fraternities: 62, sororities: 33, totalMembers: 4800, conference: "BIG 10", division: "D1" },
  "Purdue": { lat: 40.4237, lng: -86.9212, state: "IN", fraternities: 55, sororities: 28, totalMembers: 4100, conference: "BIG 10", division: "D1" },
  "DePauw University": { lat: 39.6397, lng: -86.8617, state: "IN", fraternities: 13, sororities: 12, totalMembers: 2400, conference: "NCAC", division: "D3" },
  "Wabash College": { lat: 40.0398, lng: -86.9068, state: "IN", fraternities: 9, sororities: 0, totalMembers: 1100, conference: "NCAC", division: "D3" },

  // Wisconsin
  "University of Wisconsin": { lat: 43.0766, lng: -89.4125, state: "WI", fraternities: 58, sororities: 31, totalMembers: 4500, conference: "BIG 10", division: "D1" },

  // Alabama
  "University of Alabama": { lat: 33.2098, lng: -87.5692, state: "AL", fraternities: 68, sororities: 35, totalMembers: 5300, conference: "SEC", division: "D1" },
  "Auburn University": { lat: 32.6099, lng: -85.4808, state: "AL", fraternities: 55, sororities: 30, totalMembers: 4200, conference: "SEC", division: "D1" },

  // Tennessee
  "Vanderbilt": { lat: 36.1447, lng: -86.8027, state: "TN", fraternities: 42, sororities: 24, totalMembers: 3100, conference: "SEC", division: "D1" },
  "University of Tennessee": { lat: 35.9544, lng: -83.9295, state: "TN", fraternities: 52, sororities: 28, totalMembers: 3900, conference: "SEC", division: "D1" },
  "Sewanee": { lat: 35.2034, lng: -85.9197, state: "TN", fraternities: 10, sororities: 10, totalMembers: 1400, conference: "SAA", division: "D3" },
  "Rhodes College": { lat: 35.1558, lng: -89.9910, state: "TN", fraternities: 8, sororities: 9, totalMembers: 1300, conference: "SAA", division: "D3" },

  // South Carolina
  "Clemson": { lat: 34.6834, lng: -82.8374, state: "SC", fraternities: 45, sororities: 25, totalMembers: 3400, conference: "ACC", division: "D1" },
  "University of South Carolina": { lat: 33.9938, lng: -81.0299, state: "SC", fraternities: 48, sororities: 27, totalMembers: 3600, conference: "SEC", division: "D1" },

  // Arizona
  "Arizona State": { lat: 33.4242, lng: -111.9281, state: "AZ", fraternities: 60, sororities: 32, totalMembers: 4600, conference: "PAC-12", division: "D1" },
  "University of Arizona": { lat: 32.2319, lng: -110.9501, state: "AZ", fraternities: 55, sororities: 30, totalMembers: 4200, conference: "PAC-12", division: "D1" },

  // Colorado
  "University of Colorado Boulder": { lat: 40.0150, lng: -105.2705, state: "CO", fraternities: 48, sororities: 26, totalMembers: 3600, conference: "PAC-12", division: "D1" },
  "Colorado State": { lat: 40.5734, lng: -105.0865, state: "CO", fraternities: 38, sororities: 22, totalMembers: 2800, conference: "MW", division: "D1" },

  // Washington
  "University of Washington": { lat: 47.6553, lng: -122.3035, state: "WA", fraternities: 52, sororities: 28, totalMembers: 3900, conference: "PAC-12", division: "D1" },
  "Washington State": { lat: 46.7319, lng: -117.1542, state: "WA", fraternities: 45, sororities: 25, totalMembers: 3400, conference: "PAC-12", division: "D1" },

  // Louisiana
  "LSU": { lat: 30.4133, lng: -91.1800, state: "LA", fraternities: 52, sororities: 30, totalMembers: 4100, conference: "SEC", division: "D1" },
  "Tulane": { lat: 29.9389, lng: -90.1208, state: "LA", fraternities: 38, sororities: 22, totalMembers: 2800, conference: "AAC", division: "D1" },
  "Louisiana Tech": { lat: 32.5252, lng: -92.6377, state: "LA", fraternities: 28, sororities: 18, totalMembers: 2000, conference: "CUSA", division: "D1" },

  // Mississippi
  "Ole Miss": { lat: 34.3665, lng: -89.5348, state: "MS", fraternities: 48, sororities: 28, totalMembers: 3800, conference: "SEC", division: "D1" },
  "Mississippi State": { lat: 33.4549, lng: -88.7904, state: "MS", fraternities: 45, sororities: 26, totalMembers: 3500, conference: "SEC", division: "D1" },
  "Southern Miss": { lat: 31.3307, lng: -89.3378, state: "MS", fraternities: 32, sororities: 20, totalMembers: 2400, conference: "SBC", division: "D1" },
  "Millsaps College": { lat: 32.3200, lng: -90.1743, state: "MS", fraternities: 5, sororities: 3, totalMembers: 700, conference: "SAA", division: "D3" },

  // Kentucky
  "University of Kentucky": { lat: 38.0297, lng: -84.5037, state: "KY", fraternities: 48, sororities: 27, totalMembers: 3700, conference: "SEC", division: "D1" },
  "University of Louisville": { lat: 38.2104, lng: -85.7584, state: "KY", fraternities: 38, sororities: 22, totalMembers: 2800, conference: "ACC", division: "D1" },
  "Centre College": { lat: 37.6433, lng: -84.7810, state: "KY", fraternities: 5, sororities: 4, totalMembers: 650, conference: "SAA", division: "D3" },

  // Arkansas
  "University of Arkansas": { lat: 36.0679, lng: -94.1748, state: "AR", fraternities: 42, sororities: 24, totalMembers: 3200, conference: "SEC", division: "D1" },

  // Missouri
  "Mizzou": { lat: 38.9404, lng: -92.3277, state: "MO", fraternities: 52, sororities: 29, totalMembers: 4000, conference: "SEC", division: "D1" },
  "Washington University": { lat: 38.6488, lng: -90.3108, state: "MO", fraternities: 35, sororities: 20, totalMembers: 2500, conference: "UAA", division: "D3" },

  // Kansas
  "University of Kansas": { lat: 38.9543, lng: -95.2558, state: "KS", fraternities: 48, sororities: 26, totalMembers: 3600, conference: "BIG 12", division: "D1" },
  "Kansas State": { lat: 39.1910, lng: -96.5803, state: "KS", fraternities: 42, sororities: 24, totalMembers: 3200, conference: "BIG 12", division: "D1" },

  // Nebraska
  "University of Nebraska": { lat: 40.8202, lng: -96.7005, state: "NE", fraternities: 45, sororities: 26, totalMembers: 3500, conference: "BIG 10", division: "D1" },

  // Iowa
  "University of Iowa": { lat: 41.6611, lng: -91.5302, state: "IA", fraternities: 50, sororities: 28, totalMembers: 3900, conference: "BIG 10", division: "D1" },
  "Iowa State": { lat: 42.0266, lng: -93.6465, state: "IA", fraternities: 48, sororities: 26, totalMembers: 3600, conference: "BIG 12", division: "D1" },

  // Minnesota
  "University of Minnesota": { lat: 44.9742, lng: -93.2277, state: "MN", fraternities: 52, sororities: 28, totalMembers: 3900, conference: "BIG 10", division: "D1" },

  // Oklahoma
  "University of Oklahoma": { lat: 35.2058, lng: -97.4452, state: "OK", fraternities: 55, sororities: 30, totalMembers: 4200, conference: "SEC", division: "D1" },
  "Oklahoma State": { lat: 36.1156, lng: -97.0584, state: "OK", fraternities: 48, sororities: 26, totalMembers: 3600, conference: "BIG 12", division: "D1" },

  // Oregon
  "University of Oregon": { lat: 44.0448, lng: -123.0718, state: "OR", fraternities: 42, sororities: 24, totalMembers: 3200, conference: "PAC-12", division: "D1" },
  "Oregon State": { lat: 44.5646, lng: -123.2780, state: "OR", fraternities: 38, sororities: 22, totalMembers: 2800, conference: "PAC-12", division: "D1" },

  // West Virginia
  "West Virginia University": { lat: 39.6350, lng: -79.9539, state: "WV", fraternities: 42, sororities: 24, totalMembers: 3200, conference: "BIG 12", division: "D1" },

  // Maryland
  "University of Maryland": { lat: 38.9869, lng: -76.9426, state: "MD", fraternities: 48, sororities: 26, totalMembers: 3600, conference: "BIG 10", division: "D1" },

  // New Jersey
  "Rutgers": { lat: 40.5008, lng: -74.4474, state: "NJ", fraternities: 52, sororities: 28, totalMembers: 3900, conference: "BIG 10", division: "D1" },

  // Connecticut
  "UConn": { lat: 41.8084, lng: -72.2512, state: "CT", fraternities: 38, sororities: 22, totalMembers: 2800, conference: "BIG EAST", division: "D1" },

  // Rhode Island
  "Brown University": { lat: 41.8268, lng: -71.4025, state: "RI", fraternities: 30, sororities: 18, totalMembers: 2200, conference: "IVY", division: "D1" },

  // New Mexico
  "University of New Mexico": { lat: 35.0844, lng: -106.6198, state: "NM", fraternities: 32, sororities: 20, totalMembers: 2400, conference: "MW", division: "D1" },

  // Nevada
  "UNLV": { lat: 36.1082, lng: -115.1450, state: "NV", fraternities: 38, sororities: 22, totalMembers: 2800, conference: "MW", division: "D1" },
  "University of Nevada Reno": { lat: 39.5445, lng: -119.8154, state: "NV", fraternities: 32, sororities: 20, totalMembers: 2400, conference: "MW", division: "D1" },

  // Utah
  "University of Utah": { lat: 40.7649, lng: -111.8421, state: "UT", fraternities: 35, sororities: 20, totalMembers: 2500, conference: "PAC-12", division: "D1" },
  "BYU": { lat: 40.2519, lng: -111.6493, state: "UT", fraternities: 0, sororities: 0, totalMembers: 0, conference: "BIG 12", division: "D1" },

  // Idaho
  "Boise State": { lat: 43.6025, lng: -116.2023, state: "ID", fraternities: 28, sororities: 18, totalMembers: 2000, conference: "MW", division: "D1" },

  // Montana
  "University of Montana": { lat: 46.8595, lng: -113.9856, state: "MT", fraternities: 25, sororities: 16, totalMembers: 1800, conference: "BIG SKY", division: "D1" },

  // Wyoming
  "University of Wyoming": { lat: 41.3147, lng: -105.5652, state: "WY", fraternities: 22, sororities: 15, totalMembers: 1600, conference: "MW", division: "D1" },

  // South Dakota
  "South Dakota State": { lat: 44.3114, lng: -96.7854, state: "SD", fraternities: 18, sororities: 12, totalMembers: 1400, conference: "SUMMIT", division: "D1" },

  // North Dakota
  "University of North Dakota": { lat: 47.9225, lng: -97.0731, state: "ND", fraternities: 20, sororities: 14, totalMembers: 1500, conference: "SUMMIT", division: "D1" }
};