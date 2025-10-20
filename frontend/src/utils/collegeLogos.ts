/**
 * College Logo Utility
 * Maps college names to their logo file paths
 */

// Conference mapping for quick lookups
const CONFERENCE_MAP: Record<string, string> = {
  // ACC
  'Boston College': 'ACC/Boston_College_Eagles_logo.png',
  'Clemson': 'ACC/Clemson_Tigers_logo.png',
  'Duke': 'ACC/Duke_Blue_Devils_logo.png',
  'Florida State': 'ACC/Florida_State_Seminoles_logo.png',
  'Georgia Tech': 'ACC/Georgia_Tech_Yellow_Jackets_logo.png',
  'Louisville': 'ACC/Louisville_Cardinals_logo.png',
  'Miami': 'ACC/Miami_Hurricanes_logo.png',
  'Miami University': 'ACC/Miami_Hurricanes_logo.png', // Miami (Florida)
  'Miami (FL)': 'ACC/Miami_Hurricanes_logo.png',
  'Miami Ohio': 'MAC/Miami_OH_Redhawks_logo.png', // Miami (Ohio) - different school
  'Miami (OH)': 'MAC/Miami_OH_Redhawks_logo.png',
  'Miami (Ohio)': 'MAC/Miami_OH_Redhawks_logo.png',
  'North Carolina': 'ACC/North_Carolina_Tar_Heels_logo.png',
  'North Carolina State': 'ACC/North_Carolina_State_Wolfpack_logo.png',
  'Pittsburgh': 'ACC/Pitt_Panthers_logo.png',
  'University of Pittsburgh': 'ACC/Pitt_Panthers_logo.png',
  'SMU': 'ACC/SMU_Mustang_logo.png',
  'Syracuse': 'ACC/Syracuse_Orange_logo.png',
  'Virginia': 'ACC/Virginia_Cavaliers_logo.png',
  'Virginia Tech': 'ACC/Virginia_Tech_Hokies_logo.png',
  'Wake Forest': 'ACC/Wake_Forest_Demon_Deacons_logo.png',

  // Big 10
  'Illinois': 'BIG 10/Illinois_Fighting_Illini_logo.png',
  'Indiana': 'BIG 10/Indiana_Hoosiers_logo.png',
  'Iowa': 'BIG 10/Iowa_Hawkeyes_logo.png',
  'Maryland': 'BIG 10/Maryland_Terrapins_logo.png',
  'Michigan': 'BIG 10/Michigan_Wolverines_logo.png',
  'Michigan State': 'BIG 10/Michigan_State_Spartans_logo.png',
  'Minnesota': 'BIG 10/Minnesota_Golden_Gophers_logo.png',
  'Nebraska': 'BIG 10/Nebraska_Cornhuskers_logo.png',
  'Northwestern': 'BIG 10/Northwestern_Wildcats_logo.png',
  'Ohio State': 'BIG 10/Ohio_State_Buckeyes_logo.png',
  'Penn State': 'BIG 10/Penn_State_Nittany_Lions_logo.png',
  'Penn State University': 'BIG 10/Penn_State_Nittany_Lions_logo.png',
  'Purdue': 'BIG 10/Purdue_Boilermakers_logo.png',
  'Purdue University': 'BIG 10/Purdue_Boilermakers_logo.png',
  'Rutgers': 'BIG 10/Rutgers_Scarlet_Knights_logo.png',
  'Wisconsin': 'BIG 10/Wisconsin_Badgers_logo.png',
  'UCLA': 'BIG 10/UCLA.png',
  'USC': 'BIG 10/USC_Trojans_logo.png',
  'University of Washington': 'BIG 10/Washington_Huskies_logo.png',
  'University of Oregon': 'BIG 10/Oregon_Ducks_logo.png',

  // Big 12
  'Arizona State': 'BIG 12/Arizona_State_Sun_Devils_logo.png',
  'University of Arizona': 'BIG 12/Arizona_Wildcats_logo.png',
  'Arizona': 'BIG 12/Arizona_Wildcats_logo.png',
  'Baylor': 'BIG 12/Baylor_Bears_logo.png',
  'BYU': 'BIG 12/BYU_Cougars_logo.png',
  'University of Colorado Boulder': 'BIG 12/Colorado_Buffaloes_logo.png',
  'Colorado': 'BIG 12/Colorado_Buffaloes_logo.png',
  'Iowa State': 'BIG 12/Iowa_State_Cyclones_logo.png',
  'Kansas': 'BIG 12/Kansas_Jayhawks_logo.png',
  'Kansas State': 'BIG 12/Kansas_State_Wildcats_logo.png',
  'Oklahoma': 'BIG 12/Oklahoma_Sooners_logo.png',
  'Oklahoma State': 'BIG 12/Oklahoma_State_Cowboys_logo.png',
  'TCU': 'BIG 12/TCU_Horned_Frogs_logo.png',
  'Texas': 'SEC/Texas_Longhorns_logo.png',
  'UT Austin': 'SEC/Texas_Longhorns_logo.png',
  'Texas Tech': 'BIG 12/Texas_Tech_Red_Raiders_logo.png',
  'University of Utah': 'BIG 12/Utah_Utes_logo.png',
  'Utah': 'BIG 12/Utah_Utes_logo.png',
  'West Virginia': 'BIG 12/West_Virginia_Mountaineers_logo.png',

  // SEC
  'Alabama': 'SEC/Alabama_Crimson_Tide_logo.png',
  'Arkansas': 'SEC/Arkansas_Razorbacks_logo.png',
  'Auburn': 'SEC/Auburn_Tigers_logo.png',
  'Florida': 'SEC/Florida_Gators_logo.png',
  'Georgia': 'SEC/Georgia_Bulldogs_logo.png',
  'Kentucky': 'SEC/Kentucky_Wildcats_logo.png',
  'LSU': 'SEC/LSU_Tigers_logo.png',
  'Mississippi State': 'SEC/Mississippi_State_Bulldogs_logo.png',
  'Missouri': 'SEC/Missouri_Tigers_logo.png',
  'Ole Miss': 'SEC/Ole_Miss_Rebels_logo.png',
  'South Carolina': 'SEC/South_Carolina_Gamecocks_logo.png',
  'Tennessee': 'SEC/Tennessee_Volunteers_logo.png',
  'Texas A&M': 'SEC/Texas_A_M_Aggies_logo.png',
  'Vanderbilt': 'SEC/Vanderbilt_Commodores_logo.png',

  // PAC-12
  'UC Berkeley': 'ACC/California_Golden_Bears_logo.png',
  'Stanford': 'ACC/Stanford_Cardinal_logo.png',
  'Stanford University': 'ACC/Stanford_Cardinal_logo.png',
  'Oregon State': 'PAC - 12/Oregon_State_Beavers_logo.png',
  'Washington State': 'PAC - 12/Washington_State_Cougars_logo.png',

  // Mountain West / Big West / Big Sky
  'Boise State': 'MW/Boise_State_Broncos_Logo.png',
  'Colorado State': 'MW/Colorado_State_Rams_logo.png',
  'University of New Mexico': 'MW/New_Mexico_Lobos_logo.png',
  'New Mexico': 'MW/New_Mexico_Lobos_logo.png',
  'UNLV': 'MW/UNLV_Rebels_logo.png',
  'University of Nevada Reno': 'MW/Nevada_Wolf_Pack_logo.png',
  'Nevada': 'MW/Nevada_Wolf_Pack_logo.png',
  'University of Wyoming': 'MW/Wyoming_Cowboys_logo.png',
  'Wyoming': 'MW/Wyoming_Cowboys_logo.png',

  // UC San Diego will show initials (no logo file found)
  // University of Montana will show initials (no logo file found)

  // Big East
  'Butler': 'BIG EAST/Butler_Bulldogs_logo.png',
  'Creighton': 'BIG EAST/Creighton_Bluejays_logo.png',
  'DePaul': 'BIG EAST/DePaul_Blue_Demons_logo.png',
  'Georgetown': 'BIG EAST/Georgetown_Hoyas_logo.png',
  'Marquette': 'BIG EAST/Marquette_Golden_Eagles_logo.png',
  'Providence': 'BIG EAST/Providence_Friars_logo.png',
  'St. Johns': 'BIG EAST/St_Johns_Red_Storm_logo.png',
  'Seton Hall': 'BIG EAST/Seton_Hall_Pirates_logo.png',
  'Villanova': 'BIG EAST/Villanova_Wildcats_logo.png',
  'Xavier': 'BIG EAST/Xavier_Musketeers_logo.png',

  // Ivy League
  'Brown': 'IVY/Brown_Bears_logo.png',
  'Columbia': 'IVY/Columbia_Lions_logo.png',
  'Cornell': 'IVY/Cornell_Big_Red_logo.png',
  'Dartmouth': 'IVY/Dartmouth_Big_Green_logo.png',
  'Harvard': 'IVY/Harvard_Crimson_logo.png',
  'Pennsylvania': 'IVY/Pennsylvania_Quakers_logo.png',
  'Princeton': 'IVY/Princeton_Tigers_logo.png',
  'Yale': 'IVY/Yale_Bulldogs_logo.png',

  // Patriot League
  'American University': 'Patriot League /American-Eagles-logo.png',
  'Army': 'Patriot League /Army_West_Point_Black_Knights_logo.png',
  'Boston University': 'Patriot League /Boston-University-Terriers-logo.png',
  'Bucknell': 'Patriot League /Bucknell-Bison-logo.png',
  'Bucknell University': 'Patriot League /Bucknell-Bison-logo.png',
  'Colgate': 'Patriot League /Colgate-Raiders-logo.png',
  'Colgate University': 'Patriot League /Colgate-Raiders-logo.png',
  'Holy Cross': 'Patriot League /Holy-Cross-Crusaders-logo.png',
  'Lafayette': 'Patriot League /Lafayette-Leopards-logo.png',
  'Lafayette College': 'Patriot League /Lafayette-Leopards-logo.png',
  'Lehigh': 'Patriot League /Lehigh-Mountain-Hawks-logo.png',
  'Lehigh University': 'Patriot League /Lehigh-Mountain-Hawks-logo.png',
  'Loyola Maryland': 'Patriot League /Loyola-University-Maryland-Greyhounds-logo.png',
  'Navy': 'Patriot League /Navy_Midshipmen_logo.png',
};

/**
 * Get the logo path for a college
 * @param collegeName - Name of the college (e.g., "Penn State", "Ohio State")
 * @returns Path to logo file or null if not found
 */
export function getCollegeLogo(collegeName: string): string | null {
  // Normalize the name - remove state suffix like "(KY)" if present
  const normalized = collegeName.replace(/\s*\([A-Z]{2}\)\s*$/, '').trim();

  // Direct lookup
  if (CONFERENCE_MAP[normalized]) {
    return `/college-logos/${CONFERENCE_MAP[normalized]}`;
  }

  // Try exact match with common variations
  const variations = [
    normalized,
    normalized.replace(/^University of /, ''),
    normalized.replace(/^The /, ''),
    `University of ${normalized}`,
  ];

  for (const variation of variations) {
    if (CONFERENCE_MAP[variation]) {
      return `/college-logos/${CONFERENCE_MAP[variation]}`;
    }
  }

  // Only do partial matching if the lookup key is an exact substring match
  // This prevents "Kentucky State" from matching "Kentucky"
  const lowerName = normalized.toLowerCase();
  for (const [key, path] of Object.entries(CONFERENCE_MAP)) {
    const lowerKey = key.toLowerCase();
    // Exact match only - no partial matching
    if (lowerKey === lowerName) {
      return `/college-logos/${path}`;
    }
  }

  return null;
}

/**
 * Get logo with fallback to data URL with initials
 */
export function getCollegeLogoWithFallback(collegeName: string): string {
  const logo = getCollegeLogo(collegeName);
  if (logo) return logo;

  // Generate a data URL SVG with initials as fallback
  const initials = getCollegeInitials(collegeName);

  // Generate consistent color based on college name hash
  const { gradient, textColor } = getCollegeColors(collegeName);

  const svg = `
    <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="grad-${initials}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradient[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradient[1]};stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#grad-${initials})" filter="url(#shadow)"/>
      <text x="60" y="60" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="700" fill="${textColor}" text-anchor="middle" dominant-baseline="middle" letter-spacing="-1">
        ${initials}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Check if logo exists for a college
 */
export function hasCollegeLogo(collegeName: string): boolean {
  return getCollegeLogo(collegeName) !== null;
}

/**
 * Get initials from college name (e.g., "Penn State" -> "PS")
 */
export function getCollegeInitials(collegeName: string): string {
  const words = collegeName
    .trim()
    .split(/\s+/)
    .filter(word => {
      // Filter out common words that shouldn't be in initials
      const lowercased = word.toLowerCase();
      return !['university', 'of', 'the', 'at', '&', 'and', 'college', 'state'].includes(lowercased);
    });

  if (words.length === 0) {
    // Fallback: use first two letters of the name
    return collegeName.substring(0, 2).toUpperCase();
  }

  if (words.length === 1) {
    // Single word: take first two letters (e.g., "Harvard" -> "HA")
    return words[0].substring(0, 2).toUpperCase();
  }

  // Multiple words: take first letter of each word, max 3
  return words
    .slice(0, 3)
    .map(word => word[0].toUpperCase())
    .join('');
}

/**
 * Generate consistent gradient colors based on college name
 */
export function getCollegeColors(collegeName: string): { gradient: [string, string]; textColor: string } {
  // Beautiful gradient combinations
  const gradients: Array<{ gradient: [string, string]; textColor: string }> = [
    { gradient: ['#667eea', '#764ba2'], textColor: '#ffffff' }, // Purple
    { gradient: ['#f093fb', '#f5576c'], textColor: '#ffffff' }, // Pink-Red
    { gradient: ['#4facfe', '#00f2fe'], textColor: '#ffffff' }, // Blue-Cyan
    { gradient: ['#43e97b', '#38f9d7'], textColor: '#1a202c' }, // Green-Teal
    { gradient: ['#fa709a', '#fee140'], textColor: '#1a202c' }, // Pink-Yellow
    { gradient: ['#30cfd0', '#330867'], textColor: '#ffffff' }, // Cyan-Purple
    { gradient: ['#a8edea', '#fed6e3'], textColor: '#1a202c' }, // Light Blue-Pink
    { gradient: ['#ff9a56', '#ff6a88'], textColor: '#ffffff' }, // Orange-Pink
    { gradient: ['#fbc2eb', '#a6c1ee'], textColor: '#1a202c' }, // Pink-Blue
    { gradient: ['#fdcbf1', '#e6dee9'], textColor: '#1a202c' }, // Light Pink
    { gradient: ['#a1c4fd', '#c2e9fb'], textColor: '#1a202c' }, // Sky Blue
    { gradient: ['#ffecd2', '#fcb69f'], textColor: '#1a202c' }, // Peach
    { gradient: ['#ff6e7f', '#bfe9ff'], textColor: '#ffffff' }, // Red-Blue
    { gradient: ['#e0c3fc', '#8ec5fc'], textColor: '#1a202c' }, // Purple-Blue
    { gradient: ['#f8b500', '#fceabb'], textColor: '#1a202c' }, // Gold
    { gradient: ['#d299c2', '#fef9d7'], textColor: '#1a202c' }, // Purple-Cream
    { gradient: ['#7F7FD5', '#91EAE4'], textColor: '#ffffff' }, // Indigo-Teal
    { gradient: ['#89f7fe', '#66a6ff'], textColor: '#ffffff' }, // Cyan-Blue
    { gradient: ['#fddb92', '#d1fdff'], textColor: '#1a202c' }, // Yellow-Cyan
    { gradient: ['#9890e3', '#b1f4cf'], textColor: '#1a202c' }, // Purple-Green
  ];

  // Simple hash function to get consistent color for same name
  let hash = 0;
  for (let i = 0; i < collegeName.length; i++) {
    hash = ((hash << 5) - hash) + collegeName.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % gradients.length;

  return gradients[index];
}