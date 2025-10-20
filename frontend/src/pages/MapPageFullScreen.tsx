import { useState, useEffect, useRef, ReactElement } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, useMap, Marker } from 'react-leaflet';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ChevronLeft, ChevronRight, Maximize2, Lock, Unlock, Mail, Phone, Download,
  Award, Users as UsersIcon, MapPin, Info, X, Home, Building2, GraduationCap,
  LogOut, Menu as MenuIcon, Minus, ArrowLeft, Plus, RotateCcw
} from 'lucide-react';
import { STATE_COORDINATES, STATE_BOUNDS, COLLEGE_LOCATIONS } from '../data/statesGeoData';
import { getCollegeLogoWithFallback } from '../utils/collegeLogos';

// Hook to set map ref
const SetMapRef = ({ mapRef }: { mapRef: React.MutableRefObject<any> }) => {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

  return null;
};

// Component to create a pane for states with high z-index for clickability
const CreateStatePane = () => {
  const map = useMap();

  useEffect(() => {
    // Create a custom pane for states with higher z-index than markers (400)
    // Default marker pane is at z-index 600, so we put states at 650
    const statePane = map.createPane('statePane');
    statePane.style.zIndex = '650';
  }, [map]);

  return null;
};

// Component to add state labels
const StateLabels = ({ statesData }: { statesData: any }) => {
  const map = useMap();

  useEffect(() => {
    if (!statesData || !map) return;

    // States to exclude (too small for labels)
    const excludeStates = ['NJ', 'CT', 'MA', 'DE', 'MD', 'RI', 'NH', 'VT', 'DC'];

    const labels: L.Marker[] = [];

    statesData.features.forEach((feature: any) => {
      const stateAbbr = feature.properties.abbr;
      const stateName = feature.properties.name;

      // Skip small states
      if (!stateAbbr || excludeStates.includes(stateAbbr)) return;

      // Get state center coordinates
      const stateCoords = STATE_COORDINATES[stateAbbr as keyof typeof STATE_COORDINATES];
      if (!stateCoords) return;

      // Create custom icon with state abbreviation
      const labelIcon = L.divIcon({
        className: 'state-label',
        html: `<div style="
          color: #00ffff;
          font-size: 16px;
          font-weight: bold;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.5);
          pointer-events: none;
          white-space: nowrap;
        ">${stateAbbr}</div>`,
        iconSize: [30, 20],
        iconAnchor: [15, 10]
      });

      const marker = L.marker([stateCoords.lat, stateCoords.lng], {
        icon: labelIcon,
        interactive: false
      }).addTo(map);

      labels.push(marker);
    });

    // Cleanup
    return () => {
      labels.forEach(label => map.removeLayer(label));
    };
  }, [statesData, map]);

  return null;
};

interface College {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  state: string;
  fraternities: number;
  sororities: number;
  totalMembers: number;
  conference?: string;
  division?: string;
}

interface SelectedState {
  name: string;
  abbr: string;
  colleges: College[];
  totalChapters: number;
  totalMembers: number;
}

const MapPageFullScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [statesData, setStatesData] = useState<any>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<SelectedState | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'usa' | 'state' | 'campus' | 'chapter'>('usa');
  const [mapReady, setMapReady] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [hoveredCollege, setHoveredCollege] = useState<{ name: string; data: any } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false); // Toggle between radar (dark) and logo (light) mode - default to light
  const [divisionFilter, setDivisionFilter] = useState<'all' | 'big10' | 'power4' | 'd1' | 'd2' | 'd3' | 'mychapters'>('big10'); // Default to Big 10 for public users
  const [showLockOverlay, setShowLockOverlay] = useState(false);
  const [collegeLogos, setCollegeLogos] = useState<Record<string, string>>({});
  const [universities, setUniversities] = useState<any[]>([]); // Store all universities from database with IDs
  const [collegeChapters, setCollegeChapters] = useState<any[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('trial');
  const [collegeClickedName, setCollegeClickedName] = useState<string>('');
  const [unlockedChapters, setUnlockedChapters] = useState<any[]>([]);
  const [unlockedCollegeIds, setUnlockedCollegeIds] = useState<Set<string>>(new Set());
  const [hasEnterpriseAccess, setHasEnterpriseAccess] = useState(false); // Enterprise = unlimited chapter unlocks
  const [collegeClickCount, setCollegeClickCount] = useState(0); // Track clicks for non-authenticated users
  const [navbarMinimized, setNavbarMinimized] = useState(false); // Track if navbar is minimized
  const mapRef = useRef<any>(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Database section - full catalog
  const databaseNavigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: Home },
    { name: 'Map', href: '/app/map', icon: MapPin, badge: 'NEW' },
    { name: 'Colleges', href: '/app/colleges', icon: Building2 },
    { name: 'Chapters', href: '/app/chapters', icon: GraduationCap },
    { name: 'Fraternities', href: '/app/fraternities', icon: UsersIcon },
    { name: 'Team', href: '/app/team', icon: UsersIcon },
  ];

  // My Section - company's unlocked data
  const mySection = [
    { name: 'My Dashboard', href: '/app/my-dashboard', icon: Home, count: 0 },
    { name: 'My Map', href: '/app/my-map', icon: MapPin, count: 0 },
    { name: 'My Colleges', href: '/app/my-colleges', icon: Building2, count: 0 },
    { name: 'My Chapters', href: '/app/my-unlocked', icon: GraduationCap, count: 0 },
    { name: 'My Fraternities', href: '/app/my-fraternities', icon: UsersIcon, count: 0 },
    { name: 'My Team', href: '/app/my-team', icon: UsersIcon, count: 0 },
  ];

  // Load US states GeoJSON
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
      .then(response => response.json())
      .then(data => setStatesData(data))
      .catch(err => console.error('Error loading GeoJSON:', err));
  }, []);

  // Fetch college logos from database
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

    const fetchCollegeLogos = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/admin/universities`, { headers });
        const data = await res.json();

        if (data.data) {
          // Store full university data
          setUniversities(data.data);

          // Create a map of college name to logo URL
          const logoMap: Record<string, string> = {};
          data.data.forEach((uni: any) => {
            if (uni.logo_url) {
              // Normalize the name to match COLLEGE_LOCATIONS format
              const normalizedName = uni.name.replace(/\s*\([A-Z]{2}\)\s*$/, '').trim();
              logoMap[normalizedName] = uni.logo_url;

              // Also store with full name if it has state suffix
              logoMap[uni.name] = uni.logo_url;
            }
          });
          setCollegeLogos(logoMap);
          console.log('✅ Loaded', data.data.length, 'universities from database');
        }
      } catch (error) {
        console.error('Error fetching college logos:', error);
      }
    };

    fetchCollegeLogos();
  }, []);

  // Fetch subscription tier and check for Enterprise access
  useEffect(() => {
    const fetchSubscriptionTier = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_URL}/credits/balance`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSubscriptionTier(data.subscriptionTier || 'trial');

          // Check for Enterprise access (unlimited chapter unlocks)
          const isEnterprise =
            data.subscriptionTier === 'enterprise' ||
            data.subscriptionTier === 'monthly' ||
            data.chapterUnlocksRemaining === -1;
          setHasEnterpriseAccess(isEnterprise);

          if (isEnterprise) {
            console.log('✅ Enterprise access detected - all chapters will be unlocked');
          }
        }
      } catch (error) {
        console.error('Error fetching subscription tier:', error);
      }
    };

    fetchSubscriptionTier();
  }, []);

  // Fetch unlocked chapters
  useEffect(() => {
    const fetchUnlockedChapters = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_URL}/chapters/unlocked`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setUnlockedChapters(data.data);

            // Extract unique university names and match them to COLLEGE_LOCATIONS
            const collegeNames = new Set<string>();

            data.data.forEach((chapter: any) => {
              const univName = chapter.university;
              console.log('🏫 Matching university from API:', univName);

              // Try to find matching college in COLLEGE_LOCATIONS
              const normalizedUnivName = univName.toLowerCase()
                .replace(/^the\s+/i, '')
                .replace(/\s+/g, ' ')
                .trim();

              console.log('   📝 Normalized API name:', normalizedUnivName);

              let foundMatch = false;

              // Check all college names in COLLEGE_LOCATIONS for a match
              for (const collegeName of Object.keys(COLLEGE_LOCATIONS)) {
                const normalizedCollegeName = collegeName.toLowerCase()
                  .replace(/^the\s+/i, '')
                  .replace(/\s*\([A-Z]{2}\)\s*$/, '')
                  .replace(/\s+/g, ' ')
                  .trim();

                if (normalizedCollegeName === normalizedUnivName ||
                    normalizedCollegeName.includes(normalizedUnivName) ||
                    normalizedUnivName.includes(normalizedCollegeName)) {
                  console.log('   ✅ MATCHED:', univName, '→', collegeName);
                  collegeNames.add(collegeName);
                  foundMatch = true;
                  break;
                }
              }

              if (!foundMatch) {
                console.warn('   ❌ NO MATCH FOUND for:', univName);
                console.warn('   Available Penn State variants in COLLEGE_LOCATIONS:');
                Object.keys(COLLEGE_LOCATIONS).filter(name =>
                  name.toLowerCase().includes('penn') || name.toLowerCase().includes('pennsylvania')
                ).forEach(name => console.warn('      -', name));
              }
            });

            console.log('📍 Unlocked college names for map:', Array.from(collegeNames));
            setUnlockedCollegeIds(collegeNames);
          }
        }
      } catch (error) {
        console.error('Error fetching unlocked chapters:', error);
      }
    };

    fetchUnlockedChapters();
  }, []);

  // Load college click count from sessionStorage for non-authenticated users
  useEffect(() => {
    if (!user) {
      const storedCount = sessionStorage.getItem('mapCollegeClicks');
      if (storedCount) {
        setCollegeClickCount(parseInt(storedCount, 10));
      }
    }
  }, [user]);

  // Dynamic style for states based on light/dark mode
  const styleState = (feature?: any) => {
    const isHovered = hoveredState === feature?.properties?.name;
    const isSelected = selectedState?.name === feature?.properties?.name;

    if (isDarkMode) {
      // Dark mode: Cyberpunk neon style
      if (isSelected && viewMode === 'state') {
        return {
          fillColor: '#1a1a3e',
          weight: 4,
          opacity: 1,
          color: '#00ffff',
          fillOpacity: 0.7,
          dashArray: '',
        };
      }

      if (isHovered) {
        return {
          fillColor: '#1a1a2e',
          weight: 3,
          opacity: 1,
          color: '#00ffff',
          fillOpacity: 0.8,
          dashArray: '',
        };
      }

      return {
        fillColor: '#0f0f1e',
        weight: 2,
        opacity: 1,
        color: '#1a73e8',
        fillOpacity: 0.6,
        dashArray: '',
      };
    } else {
      // Light mode: Clean, professional, high-contrast style
      if (isSelected && viewMode === 'state') {
        return {
          fillColor: '#DBEAFE',
          weight: 3,
          opacity: 1,
          color: '#1D4ED8',
          fillOpacity: 0.65,
          dashArray: '',
        };
      }

      if (isHovered) {
        return {
          fillColor: '#BFDBFE',
          weight: 3,
          opacity: 1,
          color: '#2563EB',
          fillOpacity: 0.75,
          dashArray: '',
        };
      }

      return {
        fillColor: '#F0F9FF',
        weight: 2.5,
        opacity: 1,
        color: '#60A5FA',
        fillOpacity: 0.35,
        dashArray: '',
      };
    }
  };

  // Helper function to get state abbreviation from state name
  const getStateAbbr = (stateName: string): string | null => {
    // Search STATE_COORDINATES for matching state name
    const entry = Object.entries(STATE_COORDINATES).find(
      ([_, data]) => data.name === stateName
    );
    return entry ? entry[0] : null;
  };

  // Helper function to get college logo - prioritizes database over hardcoded
  const getCollegeLogo = (collegeName: string): string => {
    // Normalize the name - remove state suffix
    const normalizedName = collegeName.replace(/\s*\([A-Z]{2}\)\s*$/, '').trim();

    // Check database logos first - try exact match
    if (collegeLogos[collegeName]) {
      return collegeLogos[collegeName];
    }

    if (collegeLogos[normalizedName]) {
      return collegeLogos[normalizedName];
    }

    // Try common name variations
    const cleanName = normalizedName
      .replace(/^The\s+/i, '')  // Remove "The" prefix
      .replace(/^University of\s+/i, '')  // Remove "University of" prefix
      .trim();

    // Search for partial matches in database
    for (const [dbName, logoUrl] of Object.entries(collegeLogos)) {
      const dbCleanName = dbName
        .replace(/^The\s+/i, '')
        .replace(/^University of\s+/i, '')
        .replace(/\s*\([A-Z]{2}\)\s*$/, '')
        .trim();

      // Check if names match after cleaning
      if (dbCleanName.toLowerCase() === cleanName.toLowerCase()) {
        return logoUrl;
      }

      // Special handling for Penn State variations
      const isPennStateVariation = (name: string) => {
        const lower = name.toLowerCase();
        return (lower.includes('penn') || lower.includes('pennsylvania')) &&
               lower.includes('state') &&
               lower.includes('university');
      };

      if (isPennStateVariation(cleanName) && isPennStateVariation(dbCleanName)) {
        // Make sure it's not a satellite campus
        const isSatellite = dbName.toLowerCase().includes(',') ||
                          dbName.toLowerCase().includes(' at ') ||
                          dbName.toLowerCase().includes('abington') ||
                          dbName.toLowerCase().includes('altoona');

        if (!isSatellite) {
          return logoUrl;
        }
      }
    }

    // Fall back to hardcoded logos
    return getCollegeLogoWithFallback(collegeName);
  };

  // Helper function to find college coordinates from COLLEGE_LOCATIONS with fuzzy matching
  const getCollegeCoordinates = (collegeName: string, stateAbbr: string): { lat: number; lng: number } | null => {
    // Normalize the college name - handle both en-dash (–) and hyphen (-)
    const normalizedName = collegeName.replace(/\s*\([A-Z]{2}\)\s*$/, '').trim();

    // Try exact matches first
    if (COLLEGE_LOCATIONS[collegeName]) {
      return { lat: COLLEGE_LOCATIONS[collegeName].lat, lng: COLLEGE_LOCATIONS[collegeName].lng };
    }

    if (COLLEGE_LOCATIONS[`${collegeName} (${stateAbbr})`]) {
      const loc = COLLEGE_LOCATIONS[`${collegeName} (${stateAbbr})`];
      return { lat: loc.lat, lng: loc.lng };
    }

    if (COLLEGE_LOCATIONS[normalizedName]) {
      return { lat: COLLEGE_LOCATIONS[normalizedName].lat, lng: COLLEGE_LOCATIONS[normalizedName].lng };
    }

    // Try fuzzy matching - normalize dashes and spaces
    const cleanName = normalizedName
      .replace(/^The\s+/i, '')
      .replace(/^University of\s+/i, '')
      .replace(/[–\-]/g, '') // Remove both en-dash and hyphen
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    // Special handling for Penn State variations
    const isPennStateVariation = (name: string) => {
      const lower = name.toLowerCase();
      return (lower.includes('penn') || lower.includes('pennsylvania')) &&
             lower.includes('state') &&
             lower.includes('university');
    };

    for (const [locName, locData] of Object.entries(COLLEGE_LOCATIONS)) {
      const locCleanName = locName
        .replace(/^The\s+/i, '')
        .replace(/^University of\s+/i, '')
        .replace(/\s*\([A-Z]{2}\)\s*$/, '')
        .replace(/[–\-]/g, '') // Remove both en-dash and hyphen
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();

      // Check if names match after cleaning
      if (locCleanName.toLowerCase() === cleanName.toLowerCase()) {
        // Make sure it's the right state
        if (locData.state === stateAbbr) {
          return { lat: locData.lat, lng: locData.lng };
        }
      }

      // Penn State special handling
      if (isPennStateVariation(cleanName) && isPennStateVariation(locCleanName)) {
        // Make sure it's not a satellite campus
        const isSatellite = locName.toLowerCase().includes(',') ||
                          locName.toLowerCase().includes(' at ') ||
                          locName.toLowerCase().includes('abington') ||
                          locName.toLowerCase().includes('altoona') ||
                          locName.toLowerCase().includes('behrend') ||
                          locName.toLowerCase().includes('berks') ||
                          locName.toLowerCase().includes('brandywine') ||
                          locName.toLowerCase().includes('harrisburg');

        if (!isSatellite && locData.state === stateAbbr) {
          return { lat: locData.lat, lng: locData.lng };
        }
      }
    }

    return null;
  };

  // Handle state click - use hardcoded data to match what's shown on map
  const handleStateClick = async (feature: any) => {
    console.log('==================================================');
    console.log('🗺️ [MapPage - handleStateClick] State clicked:', feature.properties.name);
    console.log('📍 [MapPage - handleStateClick] Current view mode:', viewMode);
    // Get state abbreviation from name since GeoJSON doesn't have abbr field
    const stateAbbr = getStateAbbr(feature.properties.name);
    if (!stateAbbr) {
      console.error('❌ [MapPage - handleStateClick] No state abbreviation found for:', feature.properties.name);
      return;
    }
    console.log('✅ [MapPage - handleStateClick] Found state abbreviation:', stateAbbr);

    // Use hardcoded data to match what's actually shown on the map
    let collegesInState = Object.entries(COLLEGE_LOCATIONS)
      .filter(([name, college]) => college.state === stateAbbr)
      .map(([name, data]) => {
        // Find matching university ID from database
        const normalizedName = name.replace(/\s*\([A-Z]{2}\)\s*$/, '').trim();
        const uni = universities.find(u => {
          const uniNormalizedName = u.name.replace(/\s*\([A-Z]{2}\)\s*$/, '').trim();
          return uniNormalizedName.toLowerCase() === normalizedName.toLowerCase() ||
                 u.name.toLowerCase() === name.toLowerCase();
        });

        return {
          id: uni?.id,
          name,
          ...data
        };
      });

    // Apply division filter to match map markers
    if (divisionFilter === 'big10') {
      collegesInState = collegesInState.filter((c: any) => c.conference === 'BIG 10');
    } else if (divisionFilter === 'power4') {
      const power4Conferences = ['SEC', 'BIG 10', 'BIG 12', 'ACC'];
      collegesInState = collegesInState.filter((c: any) =>
        power4Conferences.includes(c.conference || '')
      );
    } else if (divisionFilter === 'd1') {
      collegesInState = collegesInState.filter((c: any) => c.division === 'D1');
    } else if (divisionFilter === 'd2') {
      collegesInState = collegesInState.filter((c: any) => c.division === 'D2');
    } else if (divisionFilter === 'd3') {
      collegesInState = collegesInState.filter((c: any) => c.division === 'D3');
    } else if (divisionFilter === 'mychapters') {
      // Filter to show only colleges with unlocked chapters
      collegesInState = collegesInState.filter((c: any) => {
        // Check if college name exists in unlockedCollegeIds
        return unlockedCollegeIds.has(c.name);
      });
    } else if (divisionFilter === 'all') {
      // Show all colleges - no filter applied
    }

    const totalChapters = collegesInState.reduce(
      (sum, c) => sum + c.fraternities + c.sororities, 0
    );
    const totalMembers = collegesInState.reduce(
      (sum, c) => sum + c.totalMembers, 0
    );

    setSelectedState({
      name: feature.properties.name,
      abbr: stateAbbr,
      colleges: collegesInState,
      totalChapters,
      totalMembers
    });

    console.log(`✅ [MapPage - handleStateClick] Loaded ${collegesInState.length} colleges for ${stateAbbr}`);
    console.log(`📊 [MapPage - handleStateClick] Total chapters: ${totalChapters}, Total members: ${totalMembers}`);
    console.log(`🎯 [MapPage - handleStateClick] Setting sidebar to show state view`);
    console.log('==================================================');

    setShowSidebar(true);
    setViewMode('state'); // Change to state view mode

    // Zoom to state center
    setTimeout(() => {
      if (mapRef.current && STATE_COORDINATES[stateAbbr as keyof typeof STATE_COORDINATES]) {
        const stateCoords = STATE_COORDINATES[stateAbbr as keyof typeof STATE_COORDINATES];
        const map = mapRef.current;

        console.log('🎯 Zooming to state:', stateAbbr, stateCoords);

        // Use zoom level 6.5 to get closer to the state
        map.setView([stateCoords.lat, stateCoords.lng], 6.5, {
          animate: true,
          duration: 0.5
        });
        console.log('✅ Zoom complete');
      }
    }, 100);
  };

  // Handle each feature
  const onEachState = (feature: any, layer: L.Layer) => {
    const stateLayer = layer as L.Path;

    stateLayer.on({
      mouseover: () => {
        if (!selectedState) {
          setHoveredState(feature.properties.name);
          stateLayer.setStyle({
            fillColor: '#1a1a2e',
            fillOpacity: 0.8,
            weight: 3,
            color: '#00ffff'
          });
          stateLayer.bringToFront();
        }
      },
      mouseout: () => {
        if (!selectedState) {
          setHoveredState(null);
          stateLayer.setStyle({
            fillColor: '#0f0f1e',
            fillOpacity: 0.6,
            weight: 2,
            color: '#1a73e8'
          });
        }
      },
      click: () => {
        const stateAbbr = getStateAbbr(feature.properties.name);
        console.log('🗺️ STATE CLICKED:', feature.properties.name, `(${stateAbbr || 'not found'})`);
        console.log('  - All properties:', feature.properties);
        console.log('  - Property keys:', Object.keys(feature.properties));
        stateLayer.setStyle({
          fillColor: '#0f0f1e',
          fillOpacity: 0.6,
          weight: 2,
          color: '#1a73e8'
        });
        handleStateClick(feature);
      }
    });

    // No tooltips unless state is already selected
    if (!selectedState) {
      const collegeCount = feature.properties.colleges || 0;
      stateLayer.bindTooltip(
        `<div style="font-weight: bold; font-size: 14px; color: #00ffff;">${feature.properties.name}</div>
         <div style="font-size: 12px; color: #1a73e8; margin-top: 2px;">${
           collegeCount > 0 ? `${collegeCount} colleges with Greek life` : 'Click to explore'
         }</div>`,
        {
          sticky: true,
          className: 'neon-tooltip',
          offset: [0, 0]
        }
      );
    } else {
      stateLayer.unbindTooltip();
    }
  };

  // Handle college click - show fraternity list instead of zooming
  const handleCollegeClick = async (collegeName: string, collegeData: College) => {
    console.log('==================================================');
    console.log('🎓 [MapPage - handleCollegeClick] College clicked:', collegeName);
    console.log('📊 [MapPage - handleCollegeClick] College data:', {
      conference: collegeData.conference,
      division: collegeData.division,
      fraternities: collegeData.fraternities,
      sororities: collegeData.sororities
    });

    // Check if user is NOT authenticated - implement 3-click limit
    if (!user) {
      const newCount = collegeClickCount + 1;
      setCollegeClickCount(newCount);
      sessionStorage.setItem('mapCollegeClicks', newCount.toString());

      console.log(`🔒 [Non-authenticated user] Click count: ${newCount}/3`);

      if (newCount >= 3) {
        console.log('🚫 [Non-authenticated user] Reached 3-click limit, redirecting to signup');
        navigate('/signup');
        return;
      }
    }

    // Check if user is on free trial and trying to access non-BIG10 college
    const isFreeUser = subscriptionTier.toLowerCase() === 'trial' || subscriptionTier.toLowerCase() === 'free';
    const isBIG10College = collegeData.conference === 'BIG 10';

    if (isFreeUser && !isBIG10College) {
      // Show paywall for free users clicking non-BIG10 colleges
      setCollegeClickedName(collegeName);
      setShowLockOverlay(true);
      return;
    }

    setSelectedCollege({ name: collegeName, ...collegeData });
    setViewMode('campus'); // This will trigger the fraternity list view in the sidebar
    setShowInfo(false);
    setLoadingChapters(true);
    console.log('🎯 [MapPage - handleCollegeClick] View mode set to: campus');

    // Fetch chapters for this college from database
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log(`🌐 [MapPage - handleCollegeClick] Fetching chapters from: ${API_URL}/chapters`);
      const res = await fetch(`${API_URL}/chapters`, { headers });
      const data = await res.json();
      console.log(`📊 [MapPage - handleCollegeClick] Received ${data.data?.length || 0} total chapters from API`);

      if (data.success && data.data) {
        // Filter chapters by university name
        const chapters = data.data.filter((chapter: any) => {
          const uniName = chapter.universities?.name || '';
          // Match with or without state suffix
          const cleanCollegeName = collegeName.replace(/\s*\([A-Z]{2}\)\s*$/, '').trim();
          const cleanUniName = uniName.replace(/\s*\([A-Z]{2}\)\s*$/, '').trim();

          return cleanUniName.toLowerCase() === cleanCollegeName.toLowerCase() ||
                 cleanUniName.toLowerCase().includes(cleanCollegeName.toLowerCase()) ||
                 cleanCollegeName.toLowerCase().includes(cleanUniName.toLowerCase());
        });

        console.log(`✅ [MapPage - handleCollegeClick] Filtered to ${chapters.length} chapters for ${collegeName}`);

        // Mark chapters as unlocked - Enterprise users get unlimited access
        const unlockedIds = new Set(unlockedChapters.map((c: any) => c.id));
        const chaptersWithUnlockStatus = chapters.map((c: any) => ({
          ...c,
          unlocked: hasEnterpriseAccess || unlockedIds.has(c.id) // Enterprise OR individually unlocked
        }));

        if (hasEnterpriseAccess) {
          console.log('🔓 Enterprise access: All chapters automatically unlocked');
        }

        // If in mychapters mode, filter to only show unlocked chapters
        let finalChapters = chaptersWithUnlockStatus;
        if (divisionFilter === 'mychapters') {
          finalChapters = chaptersWithUnlockStatus.filter((c: any) => c.unlocked);
          console.log(`📍 [MapPage - handleCollegeClick] Filtered to ${finalChapters.length} unlocked chapters in mychapters mode`);
        }

        if (finalChapters.length > 0) {
          console.log(`📍 [MapPage - handleCollegeClick] Sample chapter:`, {
            name: finalChapters[0].greek_organizations?.name,
            type: finalChapters[0].greek_organizations?.organization_type,
            members: finalChapters[0].member_count,
            unlocked: finalChapters[0].unlocked
          });
        }
        console.log('==================================================');

        // If no chapters found from API, use mock data for Big 10 schools (but not in mychapters mode)
        if (finalChapters.length === 0 && collegeData.conference === 'BIG 10' && divisionFilter !== 'mychapters') {
          console.log('📝 [MapPage - handleCollegeClick] No API data, using mock chapters for Big 10 school');
          const mockChapters = [
            {
              id: 'mock-1',
              greek_organizations: {
                name: 'Sigma Chi',
                organization_type: 'fraternity'
              },
              member_count: 85,
              unlocked: true
            },
            {
              id: 'mock-2',
              greek_organizations: {
                name: 'Alpha Tau Omega',
                organization_type: 'fraternity'
              },
              member_count: 78,
              unlocked: false
            },
            {
              id: 'mock-3',
              greek_organizations: {
                name: 'Pi Kappa Alpha',
                organization_type: 'fraternity'
              },
              member_count: 92,
              unlocked: false
            },
            {
              id: 'mock-4',
              greek_organizations: {
                name: 'Beta Theta Pi',
                organization_type: 'fraternity'
              },
              member_count: 68,
              unlocked: false
            },
            {
              id: 'mock-5',
              greek_organizations: {
                name: 'Phi Delta Theta',
                organization_type: 'fraternity'
              },
              member_count: 75,
              unlocked: false
            },
            {
              id: 'mock-6',
              greek_organizations: {
                name: 'Kappa Sigma',
                organization_type: 'fraternity'
              },
              member_count: 81,
              unlocked: false
            }
          ];
          setCollegeChapters(mockChapters);
        } else {
          setCollegeChapters(finalChapters);
        }
      }
    } catch (error) {
      console.error('❌ [MapPage - handleCollegeClick] Error fetching chapters:', error);
      console.error('❌ [MapPage - handleCollegeClick] Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.log('==================================================');

      // Use mock data for Big 10 schools even on error (but not in mychapters mode)
      if (collegeData.conference === 'BIG 10' && divisionFilter !== 'mychapters') {
        const mockChapters = [
          {
            id: 'mock-1',
            greek_organizations: {
              name: 'Sigma Chi',
              organization_type: 'fraternity'
            },
            member_count: 85,
            unlocked: true
          },
          {
            id: 'mock-2',
            greek_organizations: {
              name: 'Alpha Tau Omega',
              organization_type: 'fraternity'
            },
            member_count: 78,
            unlocked: false
          },
          {
            id: 'mock-3',
            greek_organizations: {
              name: 'Pi Kappa Alpha',
              organization_type: 'fraternity'
            },
            member_count: 92,
            unlocked: false
          },
          {
            id: 'mock-4',
            greek_organizations: {
              name: 'Beta Theta Pi',
              organization_type: 'fraternity'
            },
            member_count: 68,
            unlocked: false
          },
          {
            id: 'mock-5',
            greek_organizations: {
              name: 'Phi Delta Theta',
              organization_type: 'fraternity'
            },
            member_count: 75,
            unlocked: false
          },
          {
            id: 'mock-6',
            greek_organizations: {
              name: 'Kappa Sigma',
              organization_type: 'fraternity'
            },
            member_count: 81,
            unlocked: false
          }
        ];
        setCollegeChapters(mockChapters);
      } else {
        setCollegeChapters([]);
      }
    } finally {
      setLoadingChapters(false);
    }

    // Don't zoom to college - keep the current view
    // Removed zoom functionality to maintain state view
  };

  // Reset to USA view
  const handleResetToUSA = () => {
    if (mapRef.current) {
      mapRef.current.setView([37.8, -96], 4.5);
      setSelectedState(null);
      setSelectedCollege(null);
      setSelectedChapter(null);
      setViewMode('usa');
      setShowSidebar(false);
      setShowInfo(true);
    }
  };

  // Back to state view from campus
  const handleBackToState = () => {
    if (selectedState && mapRef.current) {
      const stateAbbr = selectedState.abbr;
      const bounds = STATE_BOUNDS[stateAbbr as keyof typeof STATE_BOUNDS];

      if (bounds) {
        mapRef.current.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 8,
          animate: true,
          duration: 0.5
        });
      }

      setSelectedCollege(null);
      setViewMode('state');
      setShowInfo(false);
      setShowSidebar(true);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleResetZoom = () => {
    handleResetToUSA();
  };

  // Mock Greek chapter data for campus view
  const campusChapters = selectedCollege ? [
    { id: 1, name: 'Sigma Chi', lat: selectedCollege.lat + 0.002, lng: selectedCollege.lng - 0.001, members: 85, unlocked: false, cost: 100 },
    { id: 2, name: 'Alpha Tau Omega', lat: selectedCollege.lat - 0.001, lng: selectedCollege.lng + 0.002, members: 75, unlocked: false, cost: 90 },
    { id: 3, name: 'Pi Kappa Alpha', lat: selectedCollege.lat + 0.001, lng: selectedCollege.lng + 0.001, members: 92, unlocked: true, cost: 0 },
  ] : [];

  // Get statistics
  const stats = {
    states: 20,
    colleges: 54,
    chapters: 4164,
    members: 204500
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setShowNavMenu(!showNavMenu)}
        className={`absolute top-4 left-4 z-[1001] p-3 rounded-lg transition-colors shadow-lg ${
          isDarkMode
            ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-cyan-500/50'
            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/50'
        }`}
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      {/* Filter Navbar - Redesigned at Top */}
      {!navbarMinimized ? (
        <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 z-[1001] transition-all duration-300 ${
          isDarkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95'
        } backdrop-blur-md rounded-2xl shadow-2xl border-2 ${
          isDarkMode ? 'border-cyan-500/50 shadow-cyan-500/20' : 'border-gray-200 shadow-gray-500/20'
        }`}>
          <div className="flex items-center gap-3 px-6 py-3">
          {/* Light/Dark Mode Toggle */}
          <div className={`flex items-center gap-2 pr-3 border-r-2 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <span className={`text-sm transition-colors ${!isDarkMode ? 'text-yellow-500' : 'text-gray-500'}`}>
              ☀️
            </span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-cyan-600' : 'bg-blue-500'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm transition-colors ${isDarkMode ? 'text-cyan-400' : 'text-gray-500'}`}>
              🌙
            </span>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDivisionFilter('big10')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                divisionFilter === 'big10'
                  ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-lg transform scale-105'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Big 10
            </button>
            <button
              onClick={() => setDivisionFilter('mychapters')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                divisionFilter === 'mychapters'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              My Chapters
              {unlockedChapters.length > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-yellow-400 text-yellow-900 rounded-full min-w-[20px]">
                  {unlockedChapters.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setDivisionFilter('power4')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                divisionFilter === 'power4'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5 inline mr-1.5" />
              Power 5
            </button>
            <button
              onClick={() => setDivisionFilter('d1')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                divisionFilter === 'd1'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All D1
            </button>
            <button
              onClick={() => setDivisionFilter('d2')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                divisionFilter === 'd2'
                  ? 'bg-green-600 text-white shadow-lg transform scale-105'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All D2
            </button>
            <button
              onClick={() => setDivisionFilter('d3')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                divisionFilter === 'd3'
                  ? 'bg-orange-600 text-white shadow-lg transform scale-105'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All D3
            </button>
            <button
              onClick={() => setDivisionFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                divisionFilter === 'all'
                  ? 'bg-gray-800 text-white shadow-lg transform scale-105'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
          </div>

          {/* Reset Button */}
          <div className={`pl-3 border-l-2 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={() => {
                setViewMode('usa');
                setSelectedState(null);
                setSelectedCollege(null);
                setDivisionFilter('big10');
                if (mapRef.current) {
                  mapRef.current.setView([39.8283, -98.5795], 5);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                isDarkMode
                  ? 'bg-gray-800 text-cyan-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Reset to default view"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>

          {/* Minimize Button */}
          <div className={`pl-3 border-l-2 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={() => setNavbarMinimized(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                isDarkMode
                  ? 'bg-gray-800 text-cyan-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Hide navbar"
            >
              <Minus className="w-4 h-4" />
              <span>Hide</span>
            </button>
          </div>
        </div>
      </div>
      ) : (
        <button
          onClick={() => setNavbarMinimized(false)}
          className={`absolute top-20 left-1/2 transform -translate-x-1/2 z-[1001] flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-lg font-medium text-sm ${
            isDarkMode
              ? 'bg-gray-900/95 border-2 border-cyan-500/50 text-cyan-400 hover:bg-gray-800'
              : 'bg-white/95 border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
          } backdrop-blur-md`}
          title="Show filters"
        >
          <MenuIcon className="w-5 h-5" />
          <span>Filter</span>
        </button>
      )}

      {/* Lock Overlay */}
      {showLockOverlay && divisionFilter !== 'big10' && (
        <div className="absolute inset-0 z-[1002] bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            {collegeClickedName ? (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Subscribe to Access {collegeClickedName}
                </h3>
                <p className="text-gray-600 mb-2">
                  Unlock access to all colleges and their chapters with a subscription.
                </p>
                <p className="text-2xl font-bold text-blue-600 mb-6">
                  $29.99/month
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setShowLockOverlay(false);
                      setCollegeClickedName('');
                    }}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = '/app/subscription';
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    Subscribe Now
                  </button>
                </div>
              </>
            ) : divisionFilter === 'mychapters' ? (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Subscribe to Interactive Map
                </h3>
                <p className="text-gray-600 mb-2">
                  Access "My Chapters" and personalized features with a subscription.
                </p>
                <p className="text-2xl font-bold text-blue-600 mb-6">
                  $29.99/month
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setShowLockOverlay(false);
                      setDivisionFilter('big10');
                    }}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = '/app/subscription';
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    Subscribe Now
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Subscribe to Access {divisionFilter === 'power4' ? 'Power 5' : divisionFilter === 'all' ? 'All Schools' : `All ${divisionFilter.toUpperCase()}`}
                </h3>
                <p className="text-gray-600 mb-2">
                  This filter requires a subscription to unlock.
                </p>
                <p className="text-2xl font-bold text-blue-600 mb-6">
                  $29.99/month
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setShowLockOverlay(false);
                      setDivisionFilter('big10');
                    }}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = '/app/subscription';
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    Subscribe Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Navigation Menu (Collapsible Left) */}
      {showNavMenu && (
        <div className="absolute top-0 left-0 h-full z-[1000] transition-all duration-300">
          <div className={`h-full w-72 shadow-2xl ${
            isDarkMode
              ? 'bg-black/95 backdrop-blur-md border-r-2 border-cyan-500 shadow-cyan-500/50'
              : 'bg-white border-r-2 border-gray-300 shadow-gray-500/50'
          }`}>
            {/* Header */}
            <div className={`border-b-2 p-6 ${
              isDarkMode
                ? 'bg-gradient-to-r from-cyan-900 to-blue-900 border-cyan-500'
                : 'bg-gradient-to-r from-primary-600 to-blue-600 border-gray-300'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-cyan-400' : 'text-white'}`}>
                  FraternityBase
                </h2>
                <button
                  onClick={() => setShowNavMenu(false)}
                  className={isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-white hover:text-gray-200'}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {user && (
                <div className={`text-sm ${isDarkMode ? 'text-cyan-300/70' : 'text-white/80'}`}>
                  <p className="truncate">{user.email}</p>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
              {/* Database Section */}
              <div>
                <h3 className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-cyan-400/70' : 'text-gray-500'
                }`}>
                  Database
                </h3>
                <div className="space-y-1 mt-2">
                  {databaseNavigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? isDarkMode
                              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/50'
                              : 'bg-primary-600 text-white shadow-lg shadow-primary-500/50'
                            : isDarkMode
                              ? 'text-cyan-300 hover:bg-cyan-900/30 hover:text-cyan-400'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        onClick={() => setShowNavMenu(false)}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                        {item.badge && (
                          <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-green-500 text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* My Section */}
              <div className="pt-4">
                <h3 className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-cyan-400/70' : 'text-gray-500'
                }`}>
                  My Section
                </h3>
                <div className="space-y-1 mt-2">
                  {mySection.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? isDarkMode
                              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/50'
                              : 'bg-primary-600 text-white shadow-lg shadow-primary-500/50'
                            : isDarkMode
                              ? 'text-cyan-300 hover:bg-cyan-900/30 hover:text-cyan-400'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        onClick={() => setShowNavMenu(false)}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                        <span className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full ${
                          isDarkMode ? 'bg-cyan-900 text-cyan-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {item.count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>

            {/* Logout Button */}
            <div className={`absolute bottom-0 left-0 right-0 border-t-2 p-4 ${
              isDarkMode ? 'border-cyan-500' : 'border-gray-300'
            }`}>
              <button
                onClick={handleLogout}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full ${
                  isDarkMode
                    ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300'
                    : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                }`}
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel (Collapsible Right) */}
      {showInfo && (
        <div className={`absolute top-4 right-4 z-[1000] transition-all duration-300 ${
          showInfo ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className={`rounded-lg shadow-2xl p-6 w-80 ${
            isDarkMode
              ? 'bg-black/90 backdrop-blur-md border-2 border-cyan-500 shadow-cyan-500/50'
              : 'bg-white border-2 border-gray-300 shadow-gray-500/50'
          }`}>
            <button
              onClick={() => setShowInfo(false)}
              className={isDarkMode ? 'absolute top-3 right-3 text-cyan-400 hover:text-cyan-300' : 'absolute top-3 right-3 text-gray-600 hover:text-gray-800'}
            >
              <Minus className="w-5 h-5" />
            </button>

            <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-cyan-400' : 'text-gray-900'}`}>
              <MapPin className="w-6 h-6" />
              Fraternity Map
            </h1>
          </div>
        </div>
      )}

      {/* Show Info Button (when collapsed) */}
      {!showInfo && (
        <button
          onClick={() => setShowInfo(true)}
          className="absolute top-4 right-4 z-[1000] bg-cyan-500 text-black p-3 rounded-lg hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/50"
        >
          <Info className="w-6 h-6" />
        </button>
      )}

      {/* State/College Sidebar (Collapsible Left) */}
      {selectedState && (
        <div className={`absolute top-0 left-0 h-full z-[1000] transition-all duration-300 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className={`h-full w-96 overflow-y-auto shadow-2xl ${
            isDarkMode
              ? 'bg-black/90 backdrop-blur-md border-r-2 border-cyan-500 shadow-cyan-500/50'
              : 'bg-white/95 backdrop-blur-md border-r-2 border-primary-300 shadow-primary-500/30'
          }`}>
            {/* Header */}
            <div className={`sticky top-0 p-6 ${
              isDarkMode
                ? 'bg-gradient-to-r from-cyan-900 to-blue-900 border-b-2 border-cyan-500'
                : 'bg-gradient-to-r from-primary-600 to-primary-700 border-b-2 border-primary-400'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-cyan-400' : 'text-white'}`}>
                  {viewMode === 'campus' && selectedCollege ? selectedCollege.name : selectedState.name}
                </h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className={`${isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-white hover:text-primary-100'}`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>
              {viewMode === 'campus' && selectedCollege ? (
                <div className="flex gap-4 text-sm">
                  <span className={isDarkMode ? 'text-cyan-300' : 'text-primary-100'}>
                    {collegeChapters.filter(c => c.greek_organizations?.organization_type === 'fraternity').length} Fraternities
                  </span>
                  <span className={isDarkMode ? 'text-cyan-300' : 'text-primary-100'}>
                    {collegeChapters.filter(c => c.greek_organizations?.organization_type === 'sorority').length} Sororities
                  </span>
                  <span className={isDarkMode ? 'text-cyan-300' : 'text-primary-100'}>
                    {collegeChapters.reduce((sum, c) => sum + (c.member_count || 0), 0).toLocaleString()} Members
                  </span>
                </div>
              ) : (
                <div className="flex gap-4 text-sm">
                  <span className={isDarkMode ? 'text-cyan-300' : 'text-primary-100'}>
                    {selectedState.colleges.length} Colleges
                  </span>
                  <span className={isDarkMode ? 'text-cyan-300' : 'text-primary-100'}>
                    {selectedState.totalChapters} Chapters
                  </span>
                  <span className={isDarkMode ? 'text-cyan-300' : 'text-primary-100'}>
                    {selectedState.totalMembers.toLocaleString()} Members
                  </span>
                </div>
              )}
            </div>

            {/* Colleges List OR Fraternities List */}
            {viewMode === 'campus' && selectedCollege ? (
              // Fraternity List View
              <div className="p-4 space-y-3">
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-cyan-300' : 'text-gray-600'}`}>
                  Fraternities and sororities at {selectedCollege.name}
                </p>

                {loadingChapters ? (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-cyan-400' : 'text-gray-600'}`}>
                    Loading chapters...
                  </div>
                ) : collegeChapters.length === 0 ? (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-cyan-300' : 'text-gray-600'}`}>
                    No chapters found for this college
                  </div>
                ) : (
                  <>
                    {/* Show unlocked chapters and locked chapters separately */}
                    {collegeChapters.map((chapter, index) => {
                      const isUnlocked = chapter.unlocked === true;

                      if (isUnlocked) {
                        // Unlocked chapter - full display
                        // Use /app/my-unlocked/:id when in mychapters mode, otherwise /app/chapters/:id
                        const chapterLink = divisionFilter === 'mychapters' ? `/app/my-unlocked/${chapter.id}` : `/app/chapters/${chapter.id}`;
                        return (
                          <Link
                            key={chapter.id}
                            to={chapterLink}
                            className={`block rounded-lg p-4 transition-all group ${
                              isDarkMode
                                ? 'bg-gradient-to-br from-black/80 to-cyan-900/20 border border-cyan-500/30 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/30'
                                : 'bg-white border border-primary-200 hover:border-primary-400 hover:shadow-lg hover:shadow-primary-500/20'
                            }`}
                          >
                            <h3 className={`font-bold mb-1 ${
                              isDarkMode
                                ? 'text-cyan-400 group-hover:text-cyan-300'
                                : 'text-primary-600 group-hover:text-primary-500'
                            }`}>
                              {chapter.greek_organizations?.name || 'Unknown Organization'}
                              {chapter.greek_organizations?.greek_letters && (
                                <span className={`ml-2 text-sm ${
                                  isDarkMode ? 'text-cyan-300/70' : 'text-gray-500'
                                }`}>
                                  {chapter.greek_organizations.greek_letters}
                                </span>
                              )}
                            </h3>
                            <p className={`text-sm mb-1 ${isDarkMode ? 'text-cyan-300/70' : 'text-gray-600'}`}>
                              {chapter.chapter_name}
                            </p>
                            <div className={`flex gap-3 text-xs ${isDarkMode ? 'text-cyan-300/50' : 'text-gray-500'}`}>
                              {chapter.member_count && (
                                <span>👥 {chapter.member_count} members</span>
                              )}
                              <span className="capitalize">{chapter.greek_organizations?.organization_type || 'Chapter'}</span>
                            </div>
                          </Link>
                        );
                      } else {
                        // Locked chapter - blurred display with lock icon
                        return (
                          <div
                            key={chapter.id}
                            className={`relative rounded-lg p-4 overflow-hidden ${
                              isDarkMode
                                ? 'bg-gradient-to-br from-black/50 to-gray-900/50 border border-gray-600/30'
                                : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300'
                            }`}
                          >
                            <div className="filter blur-sm pointer-events-none">
                              <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                {chapter.greek_organizations?.name || 'Unknown Organization'}
                              </h3>
                              <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                Chapter Information
                              </p>
                              <div className={`flex gap-3 text-xs ${isDarkMode ? 'text-gray-700' : 'text-gray-400'}`}>
                                <span>👥 {chapter.member_count} members</span>
                              </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Lock className={`w-6 h-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                            </div>
                          </div>
                        );
                      }
                    })}

                    {/* Unlock button if there are locked chapters and user doesn't have Enterprise access */}
                    {!hasEnterpriseAccess && collegeChapters.some(c => !c.unlocked) && (
                      <div className="mt-4 text-center">
                        <Link
                          to={location.pathname === '/dashboard-map' || !user ? '/pricing' : '/app/subscription'}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg"
                        >
                          <Unlock className="w-5 h-5" />
                          Unlock All Chapters
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              // Colleges List */}
            <div className="p-4 space-y-3">
              {selectedState.colleges.map((college) => (
                <button
                  key={college.name}
                  onClick={() => handleCollegeClick(college.name, college)}
                  className={`w-full rounded-lg p-4 text-left transition-all group ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-black/80 to-cyan-900/20 border border-cyan-500/30 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/30'
                      : 'bg-white border border-primary-200 hover:border-primary-400 hover:shadow-lg hover:shadow-primary-500/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={getCollegeLogo(college.name)}
                      alt={college.name}
                      className="w-20 h-20 object-contain flex-shrink-0 rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className={`font-bold mb-2 ${
                        isDarkMode
                          ? 'text-cyan-400 group-hover:text-cyan-300'
                          : 'text-primary-700 group-hover:text-primary-600'
                      }`}>
                        {college.name}
                      </h3>
                      {college.id ? (
                        <Link
                          to={`/app/colleges/${college.id}`}
                          className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-md transition-colors ${
                            isDarkMode
                              ? 'text-cyan-400 bg-cyan-900/30 hover:bg-cyan-900/50'
                              : 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          👉 See Fraternities
                        </Link>
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-md opacity-50 ${
                          isDarkMode ? 'text-cyan-400' : 'text-gray-500'
                        }`}>
                          No data available
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed Sidebar Toggle */}
      {selectedState && !showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          className={`absolute top-1/2 left-0 z-[1000] p-3 rounded-r-lg transition-all transform -translate-y-1/2 shadow-lg ${
            isDarkMode
              ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-cyan-500/50'
              : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/50'
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Back Button (Campus View -> State View) */}
      {viewMode === 'campus' && selectedState && (
        <button
          onClick={handleBackToState}
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] px-6 py-3 rounded-lg shadow-lg transition-all font-semibold flex items-center gap-2 ${
            isDarkMode
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-cyan-500/50 hover:shadow-cyan-500/80'
              : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-primary-500/50 hover:shadow-primary-500/80'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to {selectedState.name}
        </button>
      )}

      {/* Reset Button (State View -> USA View) */}
      {selectedState && viewMode === 'state' && (
        <button
          onClick={handleResetToUSA}
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] px-6 py-3 rounded-lg shadow-lg transition-all font-semibold flex items-center gap-2 ${
            isDarkMode
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-cyan-500/50 hover:shadow-cyan-500/80'
              : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-primary-500/50 hover:shadow-primary-500/80'
          }`}
        >
          <Maximize2 className="w-5 h-5" />
          Reset to USA View
        </button>
      )}

      {/* Hovered College Info (Bottom Center) */}
      {hoveredCollege && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000] bg-black/95 backdrop-blur-md border-2 border-cyan-500 rounded-lg shadow-2xl shadow-cyan-500/50 p-4 min-w-[350px] max-w-[500px]">
          <div className="flex items-start gap-3">
            <img
              src={getCollegeLogo(hoveredCollege.name)}
              alt={hoveredCollege.name}
              className="w-16 h-16 object-contain flex-shrink-0"
              title=""
            />
            <div className="flex-1">
              <div className="font-bold text-lg text-cyan-400 mb-2 whitespace-normal break-words" title="">
                {hoveredCollege.name}
              </div>
              <div className="text-sm text-cyan-300/90">
                Click to view fraternities →
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Controls (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="bg-cyan-500 text-black p-3 rounded-lg hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80"
          title="Zoom In"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="bg-cyan-500 text-black p-3 rounded-lg hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80"
          title="Zoom Out"
        >
          <Minus className="w-6 h-6" />
        </button>

        {/* Reset to USA View */}
        <button
          onClick={handleResetZoom}
          className="bg-cyan-500 text-black p-3 rounded-lg hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80"
          title="Reset to USA View"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* The Map */}
      <MapContainer
        center={[37.8, -96]}
        zoom={4.5}
        minZoom={4}
        maxBounds={[
          [24.396308, -125.0],
          [49.384358, -66.93457]
        ]}
        maxBoundsViscosity={1.0}
        style={{
          height: '100vh',
          width: '100%',
          backgroundColor: isDarkMode ? '#1F2937' : '#ffffff',
          imageRendering: '-webkit-optimize-contrast'
        }}
        whenReady={() => setMapReady(true)}
        zoomControl={false}
      >
        <SetMapRef mapRef={mapRef} />
        <CreateStatePane />

        {/* State boundaries */}
        {statesData && (
          <>
            <GeoJSON
              key={`geojson-${viewMode}-${selectedState?.abbr || 'none'}`}
              data={statesData}
              style={styleState}
              onEachFeature={onEachState}
              pane="statePane"
            />
            {/* State abbreviation labels */}
            {viewMode === 'usa' && <StateLabels statesData={statesData} />}
          </>
        )}

        {/* College markers - Radar (dark) or Logo (light) style - Show in both USA and state view */}
        {!showLockOverlay && (viewMode === 'usa' || viewMode === 'state') && (() => {
          // Filter all colleges first
          const filteredColleges = Object.entries(COLLEGE_LOCATIONS).filter(([collegeName, collegeData]) => {
            // Filter by state if in state view
            if (viewMode === 'state' && selectedState) {
              if (collegeData.state !== selectedState.abbr) {
                return false;
              }
            }

            // Filter based on division
            if (divisionFilter === 'all') return true;

            if (divisionFilter === 'big10') {
              return collegeData.conference === 'BIG 10';
            }

            if (divisionFilter === 'mychapters') {
              return unlockedCollegeIds.has(collegeName);
            }

            if (divisionFilter === 'power4') {
              const power4Conferences = ['SEC', 'BIG 10', 'BIG 12', 'ACC'];
              return power4Conferences.includes(collegeData.conference || '');
            }

            if (divisionFilter === 'd1') {
              return collegeData.division === 'D1';
            }

            if (divisionFilter === 'd2') {
              return collegeData.division === 'D2';
            }

            if (divisionFilter === 'd3') {
              return collegeData.division === 'D3';
            }

            return true;
          });

          // Group by state
          const collegesByState: Record<string, Array<[string, any]>> = {};
          filteredColleges.forEach(([name, data]) => {
            if (!collegesByState[data.state]) {
              collegesByState[data.state] = [];
            }
            collegesByState[data.state].push([name, data]);
          });

          // Create markers: first 10 per state + "+X More" markers
          const markers: ReactElement[] = [];

          Object.entries(collegesByState).forEach(([stateAbbr, colleges]) => {
            const firstTen = colleges.slice(0, 10);
            const remaining = colleges.length - 10;

            // Add markers for first 10 colleges
            firstTen.forEach(([collegeName, collegeData]) => {
              const icon = isDarkMode
                ? L.divIcon({
                    className: 'radar-marker',
                    html: `
                      <div class="radar-container">
                        <div class="radar-ping"></div>
                        <div class="radar-ping radar-ping-2"></div>
                        <div class="radar-dot"></div>
                      </div>
                    `,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                  })
                : L.divIcon({
                    className: 'logo-marker',
                    html: `
                      <div class="logo-container">
                        <img src="${getCollegeLogo(collegeName)}" alt="${collegeName}" class="college-logo" />
                      </div>
                    `,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                  });

              markers.push(
                <Marker
                  key={collegeName}
                  position={[collegeData.lat, collegeData.lng]}
                  icon={icon}
                  eventHandlers={{
                    click: () => handleCollegeClick(collegeName, { name: collegeName, ...collegeData }),
                    mouseover: () => setHoveredCollege({ name: collegeName, data: collegeData }),
                    mouseout: () => setHoveredCollege(null),
                  }}
                />
              );
            });

            // Add "+X More" marker if there are more than 10
            if (remaining > 0 && STATE_COORDINATES[stateAbbr as keyof typeof STATE_COORDINATES]) {
              const stateCoords = STATE_COORDINATES[stateAbbr as keyof typeof STATE_COORDINATES];
              const moreIcon = L.divIcon({
                className: 'more-marker',
                html: `
                  <div style="
                    background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-weight: bold;
                    font-size: 14px;
                    white-space: nowrap;
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
                    cursor: pointer;
                    border: 2px solid white;
                  ">+${remaining} More</div>
                `,
                iconSize: [80, 36],
                iconAnchor: [40, 18]
              });

              markers.push(
                <Marker
                  key={`more-${stateAbbr}`}
                  position={[stateCoords.lat, stateCoords.lng]}
                  icon={moreIcon}
                />
              );
            }
          });

          return markers;
        })()}


        {/* Campus chapter markers */}
        {viewMode === 'campus' && campusChapters.map((chapter) => (
          <CircleMarker
            key={chapter.id}
            center={[chapter.lat, chapter.lng]}
            radius={10}
            fillColor={chapter.unlocked ? '#00ff00' : '#ff00ff'}
            color="#FFFFFF"
            weight={3}
            fillOpacity={0.9}
            eventHandlers={{
              click: () => setSelectedChapter(chapter),
            }}
          >
            <Tooltip>
              <div style={{ color: '#00ffff', fontWeight: 'bold' }}>
                {chapter.name}
              </div>
              <div style={{ color: '#1a73e8', fontSize: '12px' }}>
                {chapter.members} members • {chapter.unlocked ? 'Unlocked' : `${chapter.cost} credits`}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Add custom CSS for neon effects, radar markers, and logo markers */}
      <style>{`
        .neon-tooltip {
          background: rgba(0, 0, 0, 0.95) !important;
          border: 2px solid #00ffff !important;
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.5) !important;
          border-radius: 8px !important;
        }
        .neon-tooltip::before {
          border-top-color: #00ffff !important;
        }
        .leaflet-container {
          background: ${isDarkMode ? '#1F2937' : '#ffffff'} !important;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* High-quality tile rendering */}
        .leaflet-tile-container {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }

        .leaflet-tile {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }

        /* Crisp SVG rendering for state boundaries */}
        .leaflet-overlay-pane svg {
          shape-rendering: geometricPrecision;
        }

        .leaflet-overlay-pane path {
          vector-effect: non-scaling-stroke;
        }

        /* Logo marker styles for light mode */}
        .logo-marker {
          background: transparent !important;
          border: none !important;
        }

        .logo-container {
          position: relative;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 3px solid #4F46E5;
          border-radius: 50%;
          box-shadow:
            0 2px 4px rgba(0, 0, 0, 0.05),
            0 4px 8px rgba(79, 70, 229, 0.15),
            0 8px 16px rgba(79, 70, 229, 0.1),
            inset 0 1px 2px rgba(255, 255, 255, 0.8);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          backdrop-filter: blur(8px);
        }

        .logo-container:hover {
          transform: scale(1.25) translateY(-2px);
          box-shadow:
            0 4px 8px rgba(0, 0, 0, 0.08),
            0 8px 16px rgba(79, 70, 229, 0.25),
            0 16px 32px rgba(79, 70, 229, 0.2),
            inset 0 1px 2px rgba(255, 255, 255, 0.9);
          border-color: #6366F1;
          border-width: 4px;
        }

        .college-logo {
          width: 38px;
          height: 38px;
          object-fit: contain;
          border-radius: 50%;
          filter: contrast(1.05) saturate(1.1) brightness(1.02);
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }

        /* Radar marker styles */
        .radar-marker {
          background: transparent !important;
          border: none !important;
        }

        .radar-container {
          position: relative;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .radar-dot {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #00ffff;
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.8),
                      0 0 20px rgba(0, 255, 255, 0.6),
                      0 0 30px rgba(0, 255, 255, 0.4);
          z-index: 3;
          cursor: pointer;
        }

        .radar-ping {
          position: absolute;
          width: 30px;
          height: 30px;
          border: 2px solid #00ffff;
          border-radius: 50%;
          animation: radar-pulse 2s cubic-bezier(0, 0.2, 0.8, 1) infinite;
          opacity: 0.8;
        }

        .radar-ping-2 {
          animation-delay: 1s;
        }

        @keyframes radar-pulse {
          0% {
            transform: scale(0.5);
            opacity: 1;
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
          }
          50% {
            opacity: 0.6;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
          }
          100% {
            transform: scale(2);
            opacity: 0;
            box-shadow: 0 0 30px rgba(0, 255, 255, 0);
          }
        }

        .radar-marker:hover .radar-dot {
          background: #ffffff;
          box-shadow: 0 0 15px rgba(255, 255, 255, 1),
                      0 0 25px rgba(0, 255, 255, 0.8),
                      0 0 40px rgba(0, 255, 255, 0.6);
          transform: scale(1.2);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default MapPageFullScreen;