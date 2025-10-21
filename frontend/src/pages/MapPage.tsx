import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Building2, Users, MapPin, Info, Search, ZoomIn, ZoomOut,
  Maximize2, Navigation, X, ChevronRight, GraduationCap, Award,
  Lock, Unlock, Coins, Mail, Phone, Download, ExternalLink
} from 'lucide-react';
import { STATE_COORDINATES, STATE_BOUNDS, COLLEGE_LOCATIONS } from '../data/statesGeoData';
import { getCollegeLogo, getCollegeInitials } from '../utils/collegeLogos';
import { useAuth } from '../contexts/AuthContext';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface StateProperties {
  name: string;
  density?: number;
  colleges?: number;
}

interface College {
  name: string;
  lat: number;
  lng: number;
  state: string;
  fraternities: number;
  sororities: number;
  totalMembers: number;
}

interface SelectedState {
  name: string;
  abbr: string;
  colleges: College[];
  totalChapters: number;
  totalMembers: number;
}

// Rainbow color palette for states
const RAINBOW_COLORS = [
  '#FF6B6B', // Red
  '#FFA85C', // Orange
  '#FFD93D', // Yellow
  '#6BCF7F', // Green
  '#4ECDC4', // Teal
  '#5B9FFF', // Blue
  '#9B88FF', // Purple
  '#FF88DC', // Pink
  '#FFB347', // Peach
  '#87CEEB', // Sky Blue
  '#98D8C8', // Mint
  '#F7DC6F', // Soft Yellow
  '#BB8FCE', // Lavender
  '#85C1E2', // Light Blue
  '#F8B739', // Gold
  '#52C41A', // Lime
  '#13C2C2', // Cyan
  '#EB2F96', // Magenta
  '#FF6B9D', // Rose
  '#C44569', // Dark Pink
  '#F8B195', // Salmon
  '#F67280', // Coral
  '#355C7D', // Navy
  '#6C5B7B', // Deep Purple
  '#547980', // Slate
  '#45B7D1', // Ocean Blue
  '#96CEB4', // Sage
  '#DDA77A', // Tan
  '#9A8C98', // Mauve
  '#C9ADA7', // Dusty Rose
];

// Assign colors to states consistently
const stateColorMap: { [key: string]: string } = {};

// Map control component
const MapControls = ({ map, onResetView, showResetButton }: {
  map: L.Map | null;
  onResetView: () => void;
  showResetButton: boolean;
}) => {
  const handleZoomIn = () => map?.zoomIn();
  const handleZoomOut = () => map?.zoomOut();

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      {showResetButton && (
        <button
          onClick={onResetView}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary-700 transition-colors font-semibold flex items-center gap-2"
          title="Zoom out to USA"
        >
          <Maximize2 className="w-4 h-4" />
          Zoom to USA
        </button>
      )}
      <button
        onClick={handleZoomIn}
        className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-5 h-5" />
      </button>
      <button
        onClick={handleZoomOut}
        className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-5 h-5" />
      </button>
    </div>
  );
};

// College logo or initials component
const CollegeLogo = ({ collegeName, className = "w-16 h-16" }: { collegeName: string; className?: string }) => {
  const [imageError, setImageError] = useState(false);
  const logoUrl = getCollegeLogo(collegeName);

  // Show initials if no logo URL or image failed to load
  if (!logoUrl || imageError) {
    const initials = getCollegeInitials(collegeName);
    return (
      <div className={`${className} flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center`}>
        <span className="text-white font-bold text-xl">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={collegeName}
      className={`${className} object-contain flex-shrink-0`}
      onError={() => setImageError(true)}
    />
  );
};

// Coordinate display component
const CoordinateDisplay = () => {
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const map = useMap();

  useEffect(() => {
    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      setCoords({
        lat: Math.round(e.latlng.lat * 1000) / 1000,
        lng: Math.round(e.latlng.lng * 1000) / 1000
      });
    };

    map.on('mousemove', handleMouseMove);
    return () => {
      map.off('mousemove', handleMouseMove);
    };
  }, [map]);

  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-lg text-sm font-mono">
      <span className="text-gray-600">Lat:</span> <span className="font-semibold">{coords.lat}°</span>
      <span className="mx-2 text-gray-400">|</span>
      <span className="text-gray-600">Lng:</span> <span className="font-semibold">{coords.lng}°</span>
    </div>
  );
};

const MapPage = () => {
  const { session } = useAuth();
  const [statesData, setStatesData] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<SelectedState | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showColleges, setShowColleges] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [viewMode, setViewMode] = useState<'usa' | 'campus' | 'chapter'>('usa');
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'big10' | 'mychapters' | 'd1' | 'd2' | 'd3' | 'power5'>('big10');
  const [showLockOverlay, setShowLockOverlay] = useState(false);
  const [campusChapters, setCampusChapters] = useState<any[]>([]);
  const [hasEnterpriseAccess, setHasEnterpriseAccess] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('trial');
  const [realCollegeData, setRealCollegeData] = useState<any>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [filterTransitioning, setFilterTransitioning] = useState(false);
  const [organizationType, setOrganizationType] = useState<'fraternity' | 'sorority'>('fraternity');
  // Force rebuild - timestamp: 2025-10-10

  // Check subscription status for Enterprise access
  useEffect(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 [MapPage - useEffect] SUBSCRIPTION CHECK STARTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 [MapPage] Session object:', session);
    console.log('🔑 [MapPage] Session exists:', session ? 'YES' : 'NO');
    console.log('🎫 [MapPage] Access token exists:', session?.access_token ? 'YES' : 'NO');
    if (session?.access_token) {
      const token = session.access_token;
      console.log('🎫 [MapPage] Token preview:', `${token.substring(0, 20)}...${token.substring(token.length - 20)}`);
      console.log('🎫 [MapPage] Token length:', token.length);
    }

    const checkSubscription = async () => {
      try {
        if (!session?.access_token) {
          console.log('⚠️ [MapPage] ABORT: No session token available');
          console.log('⚠️ [MapPage] Setting hasEnterpriseAccess = false');
          setHasEnterpriseAccess(false);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          return;
        }

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const balanceEndpoint = `${API_URL}/balance`;
        console.log('📡 [MapPage] API_URL:', API_URL);
        console.log('📡 [MapPage] Full endpoint:', balanceEndpoint);
        console.log('📡 [MapPage] Fetching balance data...');

        const response = await fetch(balanceEndpoint, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        console.log('📨 [MapPage] Response status:', response.status);
        console.log('📨 [MapPage] Response ok:', response.ok);
        console.log('📨 [MapPage] Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const data = await response.json();
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('💰 [MapPage] FULL BALANCE DATA RECEIVED:');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(JSON.stringify(data, null, 2));
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          console.log('📊 [MapPage] Extracted fields:');
          console.log('   - subscriptionTier:', data.subscriptionTier);
          console.log('   - subscriptionStatus:', data.subscriptionStatus);
          console.log('   - chapterUnlocksRemaining:', data.chapterUnlocksRemaining);
          console.log('   - monthlyChapterUnlocks:', data.monthlyChapterUnlocks);
          console.log('   - balanceCredits:', data.balanceCredits);

          const newTier = data.subscriptionTier || 'trial';
          console.log('🎯 [MapPage] Setting subscriptionTier state to:', newTier);
          setSubscriptionTier(newTier);

          // Enterprise tier gets unlimited chapter unlocks (-1)
          // Check for enterprise tier OR unlimited chapter unlocks
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('🧮 [MapPage] CALCULATING ENTERPRISE ACCESS:');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          const check1 = data.subscriptionTier === 'enterprise';
          const check2 = data.subscriptionTier === 'monthly';
          const check3 = data.chapterUnlocksRemaining === -1;

          console.log('   ✓ Check 1 - Is tier "enterprise"?', check1, `(tier: "${data.subscriptionTier}")`);
          console.log('   ✓ Check 2 - Is tier "monthly"?', check2, `(tier: "${data.subscriptionTier}")`);
          console.log('   ✓ Check 3 - Unlimited unlocks?', check3, `(unlocks: ${data.chapterUnlocksRemaining})`);

          const isEnterprise = check1 || check2 || check3;
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('🎯 [MapPage] FINAL RESULT: isEnterprise =', isEnterprise);
          console.log('🎯 [MapPage] Setting hasEnterpriseAccess state to:', isEnterprise);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          setHasEnterpriseAccess(isEnterprise);

          console.log('✅ [MapPage] State updates complete');
          console.log('   - hasEnterpriseAccess → ', isEnterprise);
          console.log('   - subscriptionTier → ', newTier);
        } else {
          const errorText = await response.text();
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.error('❌ [MapPage] Balance API ERROR');
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.error('   Status:', response.status);
          console.error('   Status text:', response.statusText);
          console.error('   Response body:', errorText);
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          setHasEnterpriseAccess(false);
        }
      } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ [MapPage] EXCEPTION in checkSubscription');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('   Error type:', error?.constructor?.name);
        console.error('   Error message:', error?.message);
        console.error('   Full error:', error);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        setHasEnterpriseAccess(false);
      }
    };

    checkSubscription();
  }, [session]);

  // Monitor hasEnterpriseAccess state changes and auto-close lock overlay
  useEffect(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 [MapPage] hasEnterpriseAccess STATE CHANGED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   New value:', hasEnterpriseAccess);
    console.log('   Type:', typeof hasEnterpriseAccess);
    console.log('   Current subscriptionTier:', subscriptionTier);
    console.log('   Current campusChapters count:', campusChapters.length);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Auto-close lock overlay if user gains enterprise access
    if (hasEnterpriseAccess && showLockOverlay) {
      console.log('✅ [MapPage] Auto-closing lock overlay - user has enterprise access');
      setShowLockOverlay(false);
    }
  }, [hasEnterpriseAccess]);

  // Monitor subscriptionTier state changes
  useEffect(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 [MapPage] subscriptionTier STATE CHANGED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   New value:', subscriptionTier);
    console.log('   Type:', typeof subscriptionTier);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }, [subscriptionTier]);

  // Handle filter transitions with fade animations
  useEffect(() => {
    // Skip animation on initial mount
    if (!mapReady) return;

    // Trigger fade-out animation
    setFilterTransitioning(true);

    // After fade-out completes, show new markers with fade-in
    const timer = setTimeout(() => {
      setFilterTransitioning(false);
    }, 350); // Duration matches markerFadeOut animation (0.35s)

    return () => clearTimeout(timer);
  }, [activeFilter, mapReady]);

  // Refetch chapters when organization type changes in campus view
  useEffect(() => {
    if (viewMode === 'campus' && selectedCollege) {
      handleCollegeClick(selectedCollege.name, selectedCollege);
    }
  }, [organizationType]);

  // Update selected state colleges when filter changes
  useEffect(() => {
    if (selectedState && viewMode === 'usa') {
      // Reapply the filter to the selected state
      const collegeData = getCollegeData();
      let collegesInState = Object.entries(collegeData)
        .filter(([_, college]) => college.state === selectedState.abbr)
        .map(([name, data]) => ({ name, ...data }));

      // Apply active filter
      if (activeFilter === 'power5') {
        const power5Conferences = ['SEC', 'BIG 10', 'BIG 12', 'ACC'];
        collegesInState = collegesInState.filter(college =>
          power5Conferences.includes(college.conference)
        );
      } else if (activeFilter === 'big10') {
        collegesInState = collegesInState.filter(college =>
          college.conference === 'BIG 10'
        );
      } else if (activeFilter === 'd1') {
        collegesInState = collegesInState.filter(college =>
          college.division === 'D1'
        );
      } else if (activeFilter === 'd2') {
        collegesInState = collegesInState.filter(college =>
          college.division === 'D2'
        );
      } else if (activeFilter === 'd3') {
        collegesInState = collegesInState.filter(college =>
          college.division === 'D3'
        );
      }

      // Update the selected state with filtered colleges
      if (collegesInState.length > 0) {
        const totalChapters = collegesInState.reduce(
          (sum, c) => sum + c.fraternities + c.sororities, 0
        );
        const totalMembers = collegesInState.reduce(
          (sum, c) => sum + c.totalMembers, 0
        );

        setSelectedState({
          ...selectedState,
          colleges: collegesInState,
          totalChapters,
          totalMembers
        });
      } else {
        // If no colleges match the filter, clear the selection
        setSelectedState(null);
      }
    }
  }, [activeFilter]);

  // Fetch real college data from API to replace hardcoded COLLEGE_LOCATIONS
  useEffect(() => {
    const fetchRealCollegeData = async () => {
      try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🏫 [MapPage] FETCHING REAL COLLEGE DATA FROM API');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

        // Fetch all universities
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('📡 Fetching universities from:', `${API_URL}/admin/universities`);
        const universitiesRes = await fetch(`${API_URL}/admin/universities`, { headers });
        const universitiesData = await universitiesRes.json();

        console.log('📡 Fetching chapters from:', `${API_URL}/chapters`);
        const chaptersRes = await fetch(`${API_URL}/chapters`, { headers });
        const chaptersData = await chaptersRes.json();

        if (!universitiesData.success || !chaptersData.success) {
          console.error('❌ Failed to fetch data');
          setDataLoading(false);
          return;
        }

        console.log(`✅ Loaded ${universitiesData.data.length} universities`);
        console.log(`✅ Loaded ${chaptersData.data.length} chapters`);

        // Aggregate chapter counts per university
        const collegeDataMap: any = {};

        universitiesData.data.forEach((uni: any) => {
          // Get chapters for this university
          const uniChapters = chaptersData.data.filter((ch: any) => ch.university_id === uni.id);

          const fraternities = uniChapters.filter((ch: any) =>
            ch.greek_organizations?.organization_type === 'fraternity'
          );
          const sororities = uniChapters.filter((ch: any) =>
            ch.greek_organizations?.organization_type === 'sorority'
          );

          const maleMembers = fraternities.reduce((sum: number, f: any) => sum + (f.member_count || 0), 0);
          const femaleMembers = sororities.reduce((sum: number, s: any) => sum + (s.member_count || 0), 0);

          // Match the COLLEGE_LOCATIONS structure but with real data
          collegeDataMap[uni.name] = {
            lat: uni.latitude || COLLEGE_LOCATIONS[uni.name]?.lat || 0,
            lng: uni.longitude || COLLEGE_LOCATIONS[uni.name]?.lng || 0,
            state: uni.state,
            fraternities: fraternities.length,
            sororities: sororities.length,
            totalMembers: maleMembers + femaleMembers,
            conference: uni.conference || COLLEGE_LOCATIONS[uni.name]?.conference || '',
            division: COLLEGE_LOCATIONS[uni.name]?.division || 'D1'
          };
        });

        console.log(`✅ Created real college data map with ${Object.keys(collegeDataMap).length} entries`);
        console.log('📊 Sample data:', Object.entries(collegeDataMap).slice(0, 3).map(([name, data]) => ({
          name,
          fraternities: (data as any).fraternities,
          sororities: (data as any).sororities
        })));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        setRealCollegeData(collegeDataMap);
        setDataLoading(false);
      } catch (error) {
        console.error('❌ Error fetching real college data:', error);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        setDataLoading(false);
      }
    };

    fetchRealCollegeData();
  }, []);

  // Get merged college data (real + fallback to hardcoded)
  const getCollegeData = () => {
    // Merge real data with COLLEGE_LOCATIONS fallback
    // Start with a copy of COLLEGE_LOCATIONS to preserve all hardcoded entries
    const merged = { ...COLLEGE_LOCATIONS };

    // If we have real data, override/merge it in
    if (Object.keys(realCollegeData).length > 0) {
      Object.entries(realCollegeData).forEach(([name, data]) => {
        // Add the real data entry
        merged[name] = data as any;

        // Also try to find and update matching entries in COLLEGE_LOCATIONS
        // that might have different name formatting (e.g., "University of Oklahoma" vs "University of Oklahoma (OK)")
        Object.keys(COLLEGE_LOCATIONS).forEach(mapKey => {
          if (mapKey.includes(name) || name.includes(mapKey.split(' (')[0])) {
            // Update the existing entry with real data while preserving the original key
            merged[mapKey] = {
              ...COLLEGE_LOCATIONS[mapKey],
              ...(data as any),
              // Preserve the lat/lng from COLLEGE_LOCATIONS if real data doesn't have it
              lat: (data as any).lat || COLLEGE_LOCATIONS[mapKey].lat,
              lng: (data as any).lng || COLLEGE_LOCATIONS[mapKey].lng,
            };
          }
        });
      });
    }

    return merged;
  };

  // Load GeoJSON data
  useEffect(() => {
    fetch('/us-states.json')
      .then(response => response.json())
      .then(data => {
        // Add college count to each state
        const enhancedFeatures = data.features.map((feature: any) => {
          const stateAbbr = Object.keys(STATE_COORDINATES).find(
            abbr => STATE_COORDINATES[abbr as keyof typeof STATE_COORDINATES].name === feature.properties.name
          );

          // Debug: log states that don't have abbreviations
          if (!stateAbbr) {
            console.log('⚠️ No abbreviation found for state:', feature.properties.name);
          }

          const collegeData = getCollegeData();
          const collegesInState = Object.values(collegeData).filter(
            college => college.state === stateAbbr
          );

          return {
            ...feature,
            properties: {
              ...feature.properties,
              abbr: stateAbbr,
              colleges: collegesInState.length
            }
          };
        });

        setStatesData({
          ...data,
          features: enhancedFeatures
        });
      })
      .catch(error => console.error('Error loading states data:', error));
  }, [realCollegeData]); // Re-run when real college data is loaded

  // Get consistent color for each state
  const getStateColor = (stateName: string) => {
    if (!stateColorMap[stateName]) {
      // Generate consistent color index based on state name
      let hash = 0;
      for (let i = 0; i < stateName.length; i++) {
        hash = stateName.charCodeAt(i) + ((hash << 5) - hash);
      }
      const colorIndex = Math.abs(hash) % RAINBOW_COLORS.length;
      stateColorMap[stateName] = RAINBOW_COLORS[colorIndex];
    }
    return stateColorMap[stateName];
  };

  // Style function for states
  const styleState = (feature?: any) => {
    const isHovered = hoveredState === feature?.properties?.name;

    // Darkened, muted appearance
    return {
      fillColor: isHovered ? '#6B7280' : '#9CA3AF', // Gray-500 on hover, Gray-400 default
      weight: isHovered ? 2 : 1,
      opacity: 1,
      color: isHovered ? '#FFFFFF' : '#D1D5DB', // White border on hover, Gray-300 default
      fillOpacity: isHovered ? 0.6 : 0.5,
      dashArray: '',
    };
  };

  // Handle state click
  const handleStateClick = (feature: any) => {
    const stateAbbr = feature.properties.abbr;
    console.log('🗺️ State clicked:', feature.properties.name, 'Abbr:', stateAbbr);

    if (!stateAbbr) {
      console.warn('❌ No abbreviation for state:', feature.properties.name);
      return;
    }

    const collegeData = getCollegeData();
    let collegesInState = Object.entries(collegeData)
      .filter(([_, college]) => college.state === stateAbbr)
      .map(([name, data]) => ({ name, ...data }));

    console.log(`📍 Found ${collegesInState.length} colleges in ${stateAbbr}`);

    // Apply active filter to colleges list
    if (activeFilter === 'power5') {
      const power5Conferences = ['SEC', 'BIG 10', 'BIG 12', 'ACC'];
      collegesInState = collegesInState.filter(college =>
        power5Conferences.includes(college.conference)
      );
    } else if (activeFilter === 'big10') {
      collegesInState = collegesInState.filter(college =>
        college.conference === 'BIG 10'
      );
    } else if (activeFilter === 'd1') {
      collegesInState = collegesInState.filter(college =>
        college.division === 'D1'
      );
    } else if (activeFilter === 'd2') {
      collegesInState = collegesInState.filter(college =>
        college.division === 'D2'
      );
    } else if (activeFilter === 'd3') {
      collegesInState = collegesInState.filter(college =>
        college.division === 'D3'
      );
    }
    // Note: 'mychapters' filter is handled separately and doesn't filter colleges

    if (collegesInState.length > 0) {
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

      // Zoom to state bounds
      if (mapRef.current && STATE_BOUNDS[stateAbbr as keyof typeof STATE_BOUNDS]) {
        const bounds = STATE_BOUNDS[stateAbbr as keyof typeof STATE_BOUNDS];
        mapRef.current.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50] });
      }
    }
  };

  // Handle each feature
  const onEachState = (feature: any, layer: L.Layer) => {
    const stateLayer = layer as L.Path;

    stateLayer.on({
      mouseover: () => {
        // Only show hover effect if no state is selected
        if (!selectedState) {
          setHoveredState(feature.properties.name);
          stateLayer.setStyle({
            fillColor: '#6B7280',
            fillOpacity: 0.6,
            weight: 2,
            color: '#FFFFFF'
          });
          stateLayer.bringToFront();
        }
      },
      mouseout: () => {
        if (!selectedState) {
          setHoveredState(null);
          // Reset to darkened default style
          stateLayer.setStyle({
            fillColor: '#9CA3AF',
            fillOpacity: 0.5,
            weight: 1,
            color: '#D1D5DB'
          });
        }
      },
      click: () => {
        // Reset the state style immediately on click
        const stateLayer = layer as L.Path;
        stateLayer.setStyle({
          fillColor: '#9CA3AF',
          fillOpacity: 0.5,
          weight: 1,
          color: '#D1D5DB'
        });
        handleStateClick(feature);
      }
    });

    // Add tooltip only when no state is selected
    if (!selectedState) {
      const collegeCount = feature.properties.colleges || 0;
      stateLayer.bindTooltip(
        `<div style="font-weight: bold; font-size: 14px; color: #1F2937;">${feature.properties.name}</div>
         <div style="font-size: 12px; color: #6B7280; margin-top: 2px;">${
           collegeCount > 0 ? `${collegeCount} colleges with Greek life` : 'Click to explore'
         }</div>`,
        {
          sticky: true,
          className: 'leaflet-tooltip-clean',
          offset: [0, 0]
        }
      );
    } else {
      // Remove tooltip if state is selected
      stateLayer.unbindTooltip();
    }
  };

  // Search functionality
  const handleSearch = () => {
    const searchLower = searchQuery.toLowerCase();

    // Search for state
    const stateMatch = Object.entries(STATE_COORDINATES).find(
      ([abbr, data]) =>
        data.name.toLowerCase().includes(searchLower) ||
        abbr.toLowerCase() === searchLower
    );

    if (stateMatch) {
      const [abbr, data] = stateMatch;
      mapRef.current?.setView([data.lat, data.lng], 6);
      return;
    }

    // Search for college
    const collegeData = getCollegeData();
    const collegeMatch = Object.entries(collegeData).find(
      ([name, _]) => name.toLowerCase().includes(searchLower)
    );

    if (collegeMatch) {
      const [name, data] = collegeMatch;
      mapRef.current?.setView([data.lat, data.lng], 13);
      setSelectedCollege({ name, ...data });
    }
  };

  // Get statistics
  const getStatistics = () => {
    const collegeData = getCollegeData();
    const allColleges = Object.values(collegeData);
    const statesWithColleges = new Set(allColleges.map(c => c.state)).size;
    const totalChapters = allColleges.reduce((sum, c) => sum + c.fraternities + c.sororities, 0);
    const totalMembers = allColleges.reduce((sum, c) => sum + c.totalMembers, 0);

    return {
      states: statesWithColleges,
      colleges: allColleges.length,
      chapters: totalChapters,
      members: totalMembers
    };
  };

  const stats = getStatistics();

  // Reset to USA view
  const handleResetToUSA = () => {
    if (mapRef.current) {
      mapRef.current.setView([37.5, -98.5795], 4);
      setSelectedState(null);
      setSelectedCollege(null);
      setSelectedChapter(null);
      setViewMode('usa');
    }
  };

  // Handle college click → show campus with Greek chapters
  const handleCollegeClick = async (collegeName: string, collegeData: College) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏫 [handleCollegeClick] COLLEGE CLICKED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 College name:', collegeName);
    console.log('📍 College location:', collegeData.lat, collegeData.lng);
    console.log('🔑 Current hasEnterpriseAccess state:', hasEnterpriseAccess);
    console.log('🎯 Current subscriptionTier state:', subscriptionTier);

    setSelectedCollege({ name: collegeName, ...collegeData });
    setViewMode('campus');
    console.log('✅ View mode set to: campus');

    // Zoom to campus level
    if (mapRef.current) {
      mapRef.current.setView([collegeData.lat, collegeData.lng], 15);
      console.log('✅ Map zoomed to campus level (zoom: 15)');
    }

    // Fetch real chapters from API
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const chaptersEndpoint = `${API_URL}/chapters?universityName=${encodeURIComponent(collegeName)}`;
      console.log('📡 Fetching chapters from:', chaptersEndpoint);

      const response = await fetch(chaptersEndpoint);
      console.log('📨 Response status:', response.status);
      console.log('📨 Response ok:', response.ok);

      const data = await response.json();
      console.log('📦 API Response:', data);

      if (data.success && data.data) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 CHAPTER DATA PROCESSING');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Total chapters received:', data.data.length);

        // Filter to show selected organization type only
        const filteredChapters = data.data.filter((chapter: any) =>
          chapter.greek_organizations?.organization_type === organizationType
        );
        console.log(`   ${organizationType === 'fraternity' ? 'Fraternities' : 'Sororities'} only:`, filteredChapters.length);
        console.log('   hasEnterpriseAccess value:', hasEnterpriseAccess);
        console.log('   Will set unlocked to:', hasEnterpriseAccess);
        console.log('   Will set cost to:', hasEnterpriseAccess ? 0 : 100);

        // Map chapters to include position offsets for display on map
        const chaptersWithPositions = filteredChapters.map((chapter: any, index: number) => {
          const newChapter = {
            ...chapter,
            // Create a circle pattern around the campus center
            lat: collegeData.lat + (Math.cos(index * (Math.PI * 2 / data.data.length)) * 0.002),
            lng: collegeData.lng + (Math.sin(index * (Math.PI * 2 / data.data.length)) * 0.002),
            // Enterprise users get all chapters unlocked automatically
            unlocked: hasEnterpriseAccess,
            cost: hasEnterpriseAccess ? 0 : 100 // Free for Enterprise
          };

          if (index < 3) {
            console.log(`   Chapter ${index + 1}:`, {
              name: chapter.greek_organizations?.name || chapter.name,
              originalUnlocked: chapter.unlocked,
              newUnlocked: newChapter.unlocked,
              cost: newChapter.cost
            });
          }

          return newChapter;
        });

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Setting campusChapters state');
        console.log('   Total chapters:', chaptersWithPositions.length);
        console.log('   First chapter:', {
          name: chaptersWithPositions[0]?.greek_organizations?.name || chaptersWithPositions[0]?.name,
          unlocked: chaptersWithPositions[0]?.unlocked,
          cost: chaptersWithPositions[0]?.cost
        });
        console.log('   Last chapter:', {
          name: chaptersWithPositions[chaptersWithPositions.length - 1]?.greek_organizations?.name || chaptersWithPositions[chaptersWithPositions.length - 1]?.name,
          unlocked: chaptersWithPositions[chaptersWithPositions.length - 1]?.unlocked,
          cost: chaptersWithPositions[chaptersWithPositions.length - 1]?.cost
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        setCampusChapters(chaptersWithPositions);
        console.log('✅ State update complete - campusChapters set');
      } else {
        console.log('⚠️ No chapter data found or API returned failure');
        console.log('   data.success:', data.success);
        console.log('   data.data exists:', !!data.data);
        setCampusChapters([]);
      }
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ ERROR in handleCollegeClick');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('   Error type:', error?.constructor?.name);
      console.error('   Error message:', error?.message);
      console.error('   Full error:', error);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      setCampusChapters([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-primary-600" />
            Interactive US Fraternity & Sorority Map
          </h1>
          <p className="text-gray-600 mt-2">
            Explore Greek life across America with precise locations and real-time coordinates
          </p>
        </div>

        {/* Statistics Bar */}
        <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">{stats.states}</p>
            <p className="text-sm text-gray-600">States</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">{stats.colleges}</p>
            <p className="text-sm text-gray-600">Colleges</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">{stats.chapters.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Chapters</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">{stats.members.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Members</p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Search Bar */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-md px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search states or colleges..."
              className="w-full pl-10 pr-12 py-3 bg-white rounded-lg shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="absolute top-20 left-4 z-[1000] flex gap-2 flex-wrap max-w-2xl">
          {hasEnterpriseAccess && (
            <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg shadow-lg flex items-center gap-2">
              <Unlock className="w-4 h-4" />
              <span className="font-semibold text-sm">Enterprise: All Filters Unlocked</span>
            </div>
          )}

          {/* Fraternity/Sorority Toggle */}
          <div className="flex gap-1 bg-white rounded-lg shadow-lg p-1">
            <button
              onClick={() => setOrganizationType('fraternity')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                organizationType === 'fraternity'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Fraternities
            </button>
            <button
              onClick={() => setOrganizationType('sorority')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                organizationType === 'sorority'
                  ? 'bg-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Sororities
            </button>
          </div>

          <button
            onClick={() => {
              console.log('🔘 [MapPage] "Big 10" filter clicked');
              setActiveFilter('big10');
            }}
            className={`px-4 py-2 rounded-lg shadow-lg transition-colors ${
              activeFilter === 'big10'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Big 10
          </button>
          <button
            onClick={() => {
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('🔘 [MapPage] "My Chapters" filter clicked');
              console.log('   hasEnterpriseAccess:', hasEnterpriseAccess);
              console.log('   Will show lock overlay:', !hasEnterpriseAccess);
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              setActiveFilter('mychapters');
              if (!hasEnterpriseAccess) {
                setShowLockOverlay(true);
              }
            }}
            className={`px-4 py-2 rounded-lg shadow-lg transition-colors relative ${
              activeFilter === 'mychapters'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {!hasEnterpriseAccess && <Lock className="w-4 h-4 inline mr-1" />}
            My Chapters
          </button>
          <button
            onClick={() => {
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('🔘 [MapPage] "All D1" filter clicked');
              console.log('   hasEnterpriseAccess:', hasEnterpriseAccess);
              console.log('   Will show lock overlay:', !hasEnterpriseAccess);
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              setActiveFilter('d1');
              if (!hasEnterpriseAccess) {
                setShowLockOverlay(true);
              }
            }}
            className={`px-4 py-2 rounded-lg shadow-lg transition-colors relative ${
              activeFilter === 'd1'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {!hasEnterpriseAccess && <Lock className="w-4 h-4 inline mr-1" />}
            All D1
          </button>
          <button
            onClick={() => {
              setActiveFilter('d2');
              if (!hasEnterpriseAccess) {
                setShowLockOverlay(true);
              }
            }}
            className={`px-4 py-2 rounded-lg shadow-lg transition-colors relative ${
              activeFilter === 'd2'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {!hasEnterpriseAccess && <Lock className="w-4 h-4 inline mr-1" />}
            All D2
          </button>
          <button
            onClick={() => {
              setActiveFilter('d3');
              if (!hasEnterpriseAccess) {
                setShowLockOverlay(true);
              }
            }}
            className={`px-4 py-2 rounded-lg shadow-lg transition-colors relative ${
              activeFilter === 'd3'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {!hasEnterpriseAccess && <Lock className="w-4 h-4 inline mr-1" />}
            All D3
          </button>
          <button
            onClick={() => {
              setActiveFilter('power5');
              if (!hasEnterpriseAccess) {
                setShowLockOverlay(true);
              }
            }}
            className={`px-4 py-2 rounded-lg shadow-lg transition-colors relative ${
              activeFilter === 'power5'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {!hasEnterpriseAccess && <Lock className="w-4 h-4 inline mr-1" />}
            Power 5
          </button>
        </div>

        {/* Lock Overlay */}
        {showLockOverlay && activeFilter !== 'big10' && (
          <div className="absolute inset-0 z-[999] bg-black bg-opacity-60 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Unlock {activeFilter === 'power5' ? 'Power 5' : activeFilter === 'mychapters' ? 'My Chapters' : `All ${activeFilter.toUpperCase()}`}</h3>
              <p className="text-gray-600 mb-6">
                This filter requires an unlock. Add credits to your account to access this view.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowLockOverlay(false);
                    setActiveFilter('big10');
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Navigate to billing/credits page
                    window.location.href = '/app/credits';
                  }}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Coins className="w-4 h-4" />
                  Add Credits
                </button>
              </div>
            </div>
          </div>
        )}

        <MapContainer
          center={[37.5, -98.5795]}
          zoom={4}
          minZoom={4}
          maxBounds={[
            [24.396308, -125.0],  // Southwest corner (South California to Maine)
            [49.384358, -66.93457] // Northeast corner (North border with Canada)
          ]}
          maxBoundsViscosity={1.0}
          style={{ height: '700px', width: '100%', backgroundColor: '#E5E7EB' }}
          ref={mapRef}
          whenReady={() => {
            setMapReady(true);
          }}
          zoomControl={false}
        >
          {/* Show street map tiles only in campus view */}
          {viewMode === 'campus' && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          {/* State boundaries */}
          {statesData && (
            <GeoJSON
              data={statesData}
              style={styleState}
              onEachFeature={onEachState}
            />
          )}

          {/* College markers - only show when a state is selected */}
          {selectedState && viewMode !== 'campus' && selectedState.colleges.map((college) => (
            <CircleMarker
              key={college.name}
              center={[college.lat, college.lng]}
              radius={8}
              fillColor="#8B5CF6"
              color="#FFFFFF"
              weight={3}
              fillOpacity={0.9}
              className={filterTransitioning ? 'filter-transitioning' : 'filter-entering'}
              eventHandlers={{
                click: () => handleCollegeClick(college.name, college),
                mouseover: (e) => {
                  const marker = e.target;
                  marker.setRadius(18); // Larger scale-up
                  marker.setStyle({
                    fillColor: '#7C3AED',
                    color: '#FFFFFF',
                    weight: 5,
                    fillOpacity: 1,
                    className: 'marker-glow' // Add glow class
                  });
                  marker.bringToFront();
                  marker.openTooltip();
                },
                mouseout: (e) => {
                  const marker = e.target;
                  marker.setRadius(8);
                  marker.setStyle({
                    fillColor: '#8B5CF6',
                    color: '#FFFFFF',
                    weight: 3,
                    fillOpacity: 0.9,
                    className: ''
                  });
                }
              }}
            >
              <Tooltip className="college-tooltip">
                <div style={{ padding: '4px' }}>
                  <div className="font-bold text-base" style={{ color: '#1F2937' }}>
                    {college.name}
                  </div>
                  <div className="text-sm" style={{ color: '#4B5563', marginTop: '4px' }}>
                    <div>🏛️ {organizationType === 'fraternity' ? college.fraternities : college.sororities} {organizationType === 'fraternity' ? 'Fraternities' : 'Sororities'}</div>
                    <div>👥 {college.totalMembers.toLocaleString()} Total Members</div>
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}

          {/* Campus chapter markers - show in campus view */}
          {viewMode === 'campus' && campusChapters.map((chapter) => (
            <CircleMarker
              key={chapter.id}
              center={[chapter.lat, chapter.lng]}
              radius={10}
              fillColor={chapter.unlocked ? '#10B981' : '#8B5CF6'}
              color="#FFFFFF"
              weight={3}
              fillOpacity={0.9}
              className={filterTransitioning ? 'filter-transitioning' : 'filter-entering'}
              eventHandlers={{
                click: () => {
                  setSelectedChapter(chapter);
                  setViewMode('chapter');
                },
                mouseover: (e) => {
                  const marker = e.target;
                  marker.setRadius(16); // Larger scale-up
                  marker.setStyle({
                    fillColor: chapter.unlocked ? '#059669' : '#7C3AED',
                    weight: 5,
                    fillOpacity: 1,
                    className: 'marker-glow' // Add glow effect
                  });
                  marker.bringToFront();
                  marker.openTooltip();
                },
                mouseout: (e) => {
                  const marker = e.target;
                  marker.setRadius(10);
                  marker.setStyle({
                    fillColor: chapter.unlocked ? '#10B981' : '#8B5CF6',
                    weight: 3,
                    fillOpacity: 0.9,
                    className: ''
                  });
                }
              }}
            >
              <Tooltip>
                <div style={{ padding: '4px' }}>
                  <div className="font-bold text-base">
                    {chapter.greek_organizations?.name || chapter.name || 'Unknown Chapter'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    👥 {chapter.member_count || chapter.members || 0} members
                  </div>
                  {chapter.unlocked ? (
                    <div className="text-sm text-green-600 font-semibold mt-1">
                      ✓ Unlocked
                    </div>
                  ) : (
                    <div className="text-sm text-purple-600 font-semibold mt-1">
                      🔒 {chapter.cost || 100} credits to unlock
                    </div>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}

          {/* Map controls */}
          <MapControls
            map={mapRef.current}
            onResetView={handleResetToUSA}
            showResetButton={viewMode !== 'usa'}
          />
          <CoordinateDisplay />
        </MapContainer>

        {/* Selected State Panel */}
        {selectedState && (
          <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-2xl overflow-y-auto z-[1001]">
            <div className="sticky top-0 bg-white border-b p-4">
              <button
                onClick={() => {
                  setSelectedState(null);
                  mapRef.current?.setView([37.5, -98.5795], 4);
                }}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-gray-900">{selectedState.name}</h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>{selectedState.colleges.length} Colleges</span>
                <span>•</span>
                <span>{selectedState.totalChapters} Chapters</span>
                <span>•</span>
                <span>{selectedState.totalMembers.toLocaleString()} Members</span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Colleges & Universities</h3>
              <div className="space-y-3">
                {selectedState.colleges.map((college) => (
                  <div
                    key={college.name}
                    className="group border rounded-lg p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-white hover:border-blue-300 cursor-pointer transition-all transform hover:scale-[1.02] hover:shadow-md"
                    onClick={() => {
                      mapRef.current?.setView([college.lat, college.lng], 13);
                      setSelectedCollege(college);
                    }}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <CollegeLogo collegeName={college.name} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{college.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {college.lat.toFixed(4)}°, {college.lng.toFixed(4)}°
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-all group-hover:translate-x-1 flex-shrink-0" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div className={`text-center p-2 rounded group-hover:${organizationType === 'fraternity' ? 'bg-blue-100' : 'bg-pink-100'} transition-colors ${organizationType === 'fraternity' ? 'bg-blue-50' : 'bg-pink-50'}`}>
                        <p className={`font-bold ${organizationType === 'fraternity' ? 'text-blue-600' : 'text-pink-600'}`}>
                          {organizationType === 'fraternity' ? college.fraternities : college.sororities}
                        </p>
                        <p className="text-xs text-gray-600">{organizationType === 'fraternity' ? 'Fraternities' : 'Sororities'}</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded group-hover:bg-green-100 transition-colors">
                        <p className="font-bold text-green-600">{college.totalMembers.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">Members</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected College Popup */}
        {selectedCollege && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[1002] bg-white rounded-lg shadow-2xl p-4 max-w-sm">
            <button
              onClick={() => setSelectedCollege(null)}
              className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 mb-3">
              <CollegeLogo collegeName={selectedCollege.name} />
              <div>
                <h3 className="font-bold text-lg text-gray-900">{selectedCollege.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {selectedCollege.lat.toFixed(4)}°, {selectedCollege.lng.toFixed(4)}°
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className={`text-center p-2 rounded ${organizationType === 'fraternity' ? 'bg-blue-50' : 'bg-pink-50'}`}>
                <p className={`font-bold ${organizationType === 'fraternity' ? 'text-blue-600' : 'text-pink-600'}`}>
                  {organizationType === 'fraternity' ? selectedCollege.fraternities : selectedCollege.sororities}
                </p>
                <p className="text-xs text-gray-600">{organizationType === 'fraternity' ? 'Fraternities' : 'Sororities'}</p>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <p className="font-bold text-green-600">{selectedCollege.totalMembers.toLocaleString()}</p>
                <p className="text-xs text-gray-600">Members</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend and Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Enhanced Map Legend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Map Legend
          </h3>
          <div className="space-y-4">
            {/* Marker Types */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Markers</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-purple-600 rounded-full border-2 border-white shadow-md"></div>
                  <span className="text-sm text-gray-700">College/University</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                  <span className="text-sm text-gray-700">Unlocked Chapter</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-purple-600 rounded-full border-2 border-white shadow-md relative">
                    <Lock className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ fontSize: '10px' }} />
                  </div>
                  <span className="text-sm text-gray-700">Locked Chapter</span>
                </div>
              </div>
            </div>

            {/* State Colors */}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">States</p>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-4 h-4 bg-gray-400 border border-gray-300 rounded"></div>
                <span className="text-xs text-gray-600">Default</span>
                <div className="w-4 h-4 bg-gray-500 border border-white rounded"></div>
                <span className="text-xs text-gray-600">Hover</span>
              </div>
            </div>

            {/* Interactions */}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Interactions</p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• <strong>Hover:</strong> See state/college info</p>
                <p>• <strong>Click:</strong> Zoom to location</p>
                <p>• <strong>Search:</strong> Find instantly</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Controls Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Navigation className="w-4 h-4 mr-2" />
            Map Controls
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• <strong>Click & Drag:</strong> Pan around the map</p>
            <p>• <strong>Scroll:</strong> Zoom in/out</p>
            <p>• <strong>Click State:</strong> View state details</p>
            <p>• <strong>Click College:</strong> View college info</p>
            <p>• <strong>Search:</strong> Find states or colleges</p>
            <p>• <strong>Hover:</strong> See coordinates in real-time</p>
          </div>
        </div>

        {/* Top States */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="w-4 h-4 mr-2" />
            Top States by Greek Life
          </h3>
          <div className="space-y-2">
            {(() => {
              const collegeData = getCollegeData();
              const counts = Object.entries(collegeData).reduce((acc: { [key: string]: number }, [_, college]) => {
                acc[college.state] = (acc[college.state] || 0) + 1;
                return acc;
              }, {});

              const topStates = Object.entries(counts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([state, count]) => ({
                  state: STATE_COORDINATES[state as keyof typeof STATE_COORDINATES]?.name || state,
                  count
                }));

              return topStates.map((item, index) => (
                <div key={item.state} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary-600">#{index + 1}</span>
                    <span className="text-sm text-gray-700">{item.state}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.count} colleges</span>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Chapter Detail Panel - shows when chapter is clicked */}
        {selectedChapter && viewMode === 'chapter' && (
          <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-2xl overflow-y-auto z-[1002]">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6">
              <button
                onClick={() => {
                  setSelectedChapter(null);
                  setViewMode('campus');
                }}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold">{selectedChapter.greek_organizations?.name || selectedChapter.name || 'Unknown Chapter'}</h2>
              <p className="text-purple-100 text-sm mt-1">{selectedCollege?.name}</p>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">{selectedChapter.member_count || selectedChapter.members || 0} members</span>
                </div>
                {selectedChapter.unlocked ? (
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold flex items-center gap-1">
                    <Unlock className="w-4 h-4" />
                    Unlocked
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-semibold flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    Locked
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* House Photo Placeholder */}
              <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Chapter House Photo</p>
                </div>
              </div>

              {/* Unlock Options */}
              {!selectedChapter.unlocked && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-purple-600" />
                    Unlock Chapter Data
                  </h3>

                  <div className="space-y-3">
                    <button className="w-full bg-white border-2 border-purple-200 hover:border-purple-400 rounded-lg p-4 text-left transition-all hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">Roster Only</p>
                          <p className="text-sm text-gray-600">Names, majors, grad years</p>
                        </div>
                        <span className="font-bold text-purple-600 flex items-center gap-1">
                          <Coins className="w-4 h-4" />
                          25
                        </span>
                      </div>
                    </button>

                    <button className="w-full bg-white border-2 border-purple-200 hover:border-purple-400 rounded-lg p-4 text-left transition-all hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">Roster + Emails</p>
                          <p className="text-sm text-gray-600">All member emails</p>
                        </div>
                        <span className="font-bold text-purple-600 flex items-center gap-1">
                          <Coins className="w-4 h-4" />
                          {selectedChapter.cost}
                        </span>
                      </div>
                    </button>

                    <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg p-4 text-left hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Full Access ⭐</p>
                          <p className="text-sm text-purple-100">Names, emails, phones, addresses</p>
                        </div>
                        <span className="font-bold flex items-center gap-1">
                          <Coins className="w-4 h-4" />
                          200
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Unlocked Data */}
              {selectedChapter.unlocked && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Unlock className="w-5 h-5 text-green-600" />
                    Available Data
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    <button className="flex flex-col items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                      <Mail className="w-6 h-6 text-green-600" />
                      <span className="text-xs font-semibold text-gray-700">Emails</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                      <Phone className="w-6 h-6 text-green-600" />
                      <span className="text-xs font-semibold text-gray-700">Phones</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                      <Download className="w-6 h-6 text-green-600" />
                      <span className="text-xs font-semibold text-gray-700">Export</span>
                    </button>
                  </div>

                  <button className="w-full bg-green-600 text-white rounded-lg p-3 font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    View Full Roster
                  </button>
                </div>
              )}

              {/* Chapter Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Chapter Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Founded:</span>
                    <span className="font-semibold">{selectedChapter.founded_year || '1925'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Members:</span>
                    <span className="font-semibold">{selectedChapter.member_count || selectedChapter.members || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">House Address:</span>
                    <span className="font-semibold">{selectedChapter.house_address || '420 Frat Row'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data Quality:</span>
                    <span className="font-semibold text-green-600">{selectedChapter.data_quality || 'A Grade'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;

// Add custom styles for cleaner tooltips and college markers
const style = document.createElement('style');
style.textContent = `
  .leaflet-tooltip-clean {
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    padding: 8px 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  }

  .leaflet-tooltip-clean::before {
    display: none;
  }

  .college-tooltip {
    background: white !important;
    border: 1px solid #CBD5E1 !important;
    border-radius: 12px !important;
    padding: 10px 14px !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
    animation: fadeIn 0.2s ease-in-out;
  }

  .college-tooltip::before {
    display: none !important;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .leaflet-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  }

  /* Smoother state transitions */
  .leaflet-interactive {
    transition: fill 0.2s ease, fill-opacity 0.2s ease, stroke-width 0.2s ease;
  }

  /* Enhanced college marker animations */
  .leaflet-interactive.leaflet-circle {
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy easing */
    cursor: pointer;
  }

  /* Enhanced glow effect on hover */
  .leaflet-interactive.leaflet-circle:hover,
  .marker-glow {
    filter: drop-shadow(0 0 16px rgba(124, 58, 237, 0.8)) drop-shadow(0 0 8px rgba(139, 92, 246, 0.6));
  }

  /* Fade-in animation for markers */
  @keyframes markerFadeIn {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Fade-out animation for markers */
  @keyframes markerFadeOut {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.5);
    }
  }

  .leaflet-interactive.leaflet-circle {
    animation: markerFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* Filter transition animations */
  .leaflet-interactive.leaflet-circle.filter-transitioning {
    animation: markerFadeOut 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .leaflet-interactive.leaflet-circle.filter-entering {
    animation: markerFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  /* Subtle pulse animation for college markers */
  @keyframes gentlePulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .leaflet-interactive.leaflet-circle {
    transform-origin: center;
  }

  .leaflet-interactive.leaflet-circle:hover {
    animation: gentlePulse 2s infinite;
  }
`;
document.head.appendChild(style);