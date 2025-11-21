import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, CircleMarker, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Building2, Users, MapPin, Info, Search, ZoomIn, ZoomOut,
  Maximize2, Navigation, X, ChevronRight, GraduationCap, Award,
  Lock, Unlock, Coins, Mail, Phone, Download, ExternalLink,
  ChevronLeft, Activity, TrendingUp, Radio
} from 'lucide-react';
import { STATE_COORDINATES, STATE_BOUNDS, COLLEGE_LOCATIONS } from '../data/statesGeoData';
import { getCollegeLogo, getCollegeInitials } from '../utils/collegeLogos';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SPRING_CONFIGS,
  slideUpVariants,
  scaleVariants,
  staggerVariants,
  fadeVariants
} from '../config/animations';

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

// Neon color palette for states (like a neon sign collection)
const NEON_COLORS = [
  '#00ffff', // Cyan
  '#ff00ff', // Magenta
  '#ffff00', // Yellow
  '#00ff00', // Lime Green
  '#ff0080', // Hot Pink
  '#0080ff', // Electric Blue
  '#ff8000', // Orange
  '#80ff00', // Chartreuse
  '#ff0040', // Red-Pink
  '#00ff80', // Spring Green
  '#8000ff', // Purple
  '#ff4000', // Orange-Red
  '#00ffbf', // Turquoise
  '#ff00bf', // Fuchsia
  '#bfff00', // Yellow-Green
  '#00bfff', // Deep Sky Blue
  '#ff00ff', // Magenta
  '#00ff40', // Neon Green
  '#ff0080', // Rose
  '#40ff00', // Bright Green
  '#0040ff', // Royal Blue
  '#ff4080', // Coral Pink
  '#80ff40', // Light Green
  '#4000ff', // Indigo
  '#ff8040', // Peach
  '#40ff80', // Mint
  '#8040ff', // Violet
  '#ffbf00', // Amber
  '#00ffff', // Aqua
  '#ff40bf', // Pink Purple
  '#bf00ff', // Purple Magenta
  '#00ffbf', // Cyan Green
  '#ff8080', // Light Coral
  '#80ffbf', // Aquamarine
  '#bf80ff', // Lavender
  '#ffbf80', // Light Orange
  '#80bfff', // Light Blue
  '#ffff80', // Light Yellow
  '#80ff80', // Pale Green
  '#ff80bf', // Light Pink
  '#bf80ff', // Pale Purple
  '#80ffff', // Pale Cyan
  '#ffbf40', // Gold
  '#40ffbf', // Sea Green
  '#bf40ff', // Deep Purple
  '#ff40ff', // Bright Magenta
  '#40ff40', // Lime
  '#ff4040', // Bright Red
];

// Assign each state a unique neon color
const STATE_NEON_COLORS: { [key: string]: string } = {};
let colorIndex = 0;

// CRT Scanline Overlay Component
const CRTScanlines = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-[2000]">
      {/* Horizontal Scanlines */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 100, 0.4) 2px, rgba(0, 255, 100, 0.4) 4px)',
          animation: 'scanlines 8s linear infinite'
        }}
      />

      {/* Vertical Grid Lines */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0, 255, 100, 0.3) 4px, rgba(0, 255, 100, 0.3) 5px)'
        }}
      />

      {/* Screen Flicker */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/[0.02] to-transparent"
        style={{
          animation: 'flicker 0.15s infinite'
        }}
      />

      {/* Vignette Effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)'
        }}
      />
    </div>
  );
};

// Retro Stats Box Component
const RetroStatsBox = ({ title, stats, icon: Icon }: {
  title: string;
  stats: { label: string; value: string | number }[];
  icon: any;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black/80 border-2 border-green-500 rounded-lg p-4 backdrop-blur-sm"
      style={{
        boxShadow: '0 0 20px rgba(34, 197, 94, 0.4), inset 0 0 20px rgba(34, 197, 94, 0.1)'
      }}
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-500/30">
        <Icon className="w-5 h-5 text-green-400" style={{ filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.8))' }} />
        <h3 className="text-green-400 font-mono font-bold text-sm tracking-wider uppercase"
            style={{ textShadow: '0 0 8px rgba(34, 197, 94, 0.8)' }}>
          {title}
        </h3>
      </div>

      <div className="space-y-2">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex justify-between items-center gap-3">
            <span className="text-green-300/80 font-mono text-xs font-medium">{stat.label}</span>
            <span className="text-green-400 font-mono font-bold text-xl tracking-wider"
                  style={{
                    textShadow: '0 0 8px rgba(34, 197, 94, 0.9), 0 0 4px rgba(34, 197, 94, 0.6)',
                    filter: 'brightness(1.2)'
                  }}>
              {typeof stat.value === 'number' && stat.value > 999
                ? stat.value.toLocaleString()
                : stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Pulsing indicator */}
      <div className="mt-3 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
             style={{ boxShadow: '0 0 10px rgba(34, 197, 94, 0.8)' }} />
        <span className="text-green-400/60 font-mono text-[10px]">LIVE</span>
      </div>
    </motion.div>
  );
};

// Collapsed Sidebar Toggle
const CollapsedSidebar = ({ onClick, count }: { onClick: () => void; count: number }) => {
  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-1/2 -translate-y-1/2 z-[1001]"
    >
      <button
        onClick={onClick}
        className="bg-black/80 border-2 border-green-500 rounded-r-lg px-2 py-8 backdrop-blur-sm hover:bg-black/90 transition-all group"
        style={{
          boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
          writingMode: 'vertical-rl',
        }}
      >
        <div className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-green-400 group-hover:translate-x-1 transition-transform"
                       style={{ filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.8))' }} />
          <span className="text-green-400 font-mono font-bold text-xs tracking-wider"
                style={{ textShadow: '0 0 8px rgba(34, 197, 94, 0.8)' }}>
            ORGANIZATIONS ({count})
          </span>
        </div>
      </button>
    </motion.div>
  );
};

// Expanded Sidebar with Fraternity List
const ExpandedSidebar = ({ onCollapse, organizations }: {
  onCollapse: () => void;
  organizations: any[];
}) => {
  return (
    <motion.div
      initial={{ x: -400 }}
      animate={{ x: 0 }}
      exit={{ x: -400 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed left-0 top-0 h-full w-80 bg-black/90 border-r-2 border-green-500 backdrop-blur-md z-[1001] overflow-y-auto"
      style={{
        boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)'
      }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-black/95 border-b-2 border-green-500/50 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-green-400 font-mono font-bold text-lg tracking-wider"
              style={{ textShadow: '0 0 8px rgba(34, 197, 94, 0.8)' }}>
            GREEK ORGANIZATIONS
          </h2>
          <button
            onClick={onCollapse}
            className="text-green-400 hover:text-green-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.8))' }} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-green-400/70 text-xs font-mono">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>{organizations.length} ACTIVE</span>
        </div>
      </div>

      {/* Organization List */}
      <div className="p-4 space-y-2">
        {organizations.map((org, idx) => (
          <motion.div
            key={org.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="bg-green-950/30 border border-green-500/30 rounded p-3 hover:border-green-400 hover:bg-green-950/50 transition-all cursor-pointer group"
            style={{
              boxShadow: '0 0 10px rgba(34, 197, 94, 0.1)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-green-400 font-mono font-semibold text-sm group-hover:text-green-300">
                  {org.name}
                </h3>
                <p className="text-green-400/50 font-mono text-xs mt-1">
                  {org.greek_letters}
                </p>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-mono font-bold text-xs">
                  {org.total_chapters || 0}
                </p>
                <p className="text-green-400/50 font-mono text-[10px]">
                  CHAPTERS
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Map Controls Component
const MapControls = ({ map, onResetView, showResetButton }: {
  map: L.Map | null;
  onResetView: () => void;
  showResetButton: boolean;
}) => {
  const handleZoomIn = () => map?.zoomIn();
  const handleZoomOut = () => map?.zoomOut();

  return (
    <div className="absolute top-4 right-4 z-[1100] flex flex-col gap-2">
      <AnimatePresence>
        {showResetButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={SPRING_CONFIGS.snappy}
            onClick={onResetView}
            className="bg-black/80 border-2 border-green-500 text-green-400 px-4 py-2 rounded-lg backdrop-blur-sm font-mono font-semibold flex items-center gap-2 hover:bg-black/90 transition-all"
            style={{
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
              textShadow: '0 0 8px rgba(34, 197, 94, 0.8)'
            }}
            title="Zoom out to USA"
          >
            <Maximize2 className="w-4 h-4" style={{ filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.8))' }} />
            RESET VIEW
          </motion.button>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={SPRING_CONFIGS.snappy}
        onClick={handleZoomIn}
        className="bg-black/80 border-2 border-green-500 p-2 rounded-lg backdrop-blur-sm hover:bg-black/90 transition-all"
        style={{ boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)' }}
        title="Zoom In"
      >
        <ZoomIn className="w-5 h-5 text-green-400" style={{ filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.8))' }} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={SPRING_CONFIGS.snappy}
        onClick={handleZoomOut}
        className="bg-black/80 border-2 border-green-500 p-2 rounded-lg backdrop-blur-sm hover:bg-black/90 transition-all"
        style={{ boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)' }}
        title="Zoom Out"
      >
        <ZoomOut className="w-5 h-5 text-green-400" style={{ filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.8))' }} />
      </motion.button>
    </div>
  );
};

const RetroSuperMapPage = () => {
  const { session } = useAuth();
  const [statesData, setStatesData] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<SelectedState | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [viewMode, setViewMode] = useState<'usa' | 'state'>('usa');
  const [selectedStateData, setSelectedStateData] = useState<SelectedState | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [stats, setStats] = useState({
    states: 48, // Mainland US only (excluding Alaska & Hawaii)
    colleges: 0,
    chapters: 0,
    members: 0,
    activeNow: 0
  });
  const [instagramChapters, setInstagramChapters] = useState<any[]>([]);
  const [showInstagramClusters, setShowInstagramClusters] = useState(true);
  const [organizationType, setOrganizationType] = useState<'all' | 'fraternity' | 'sorority'>('all');
  const [showPower5Only, setShowPower5Only] = useState(false);

  // Load GeoJSON data
  useEffect(() => {
    fetch('/us-states.json')
      .then(res => res.json())
      .then(data => {
        setStatesData(data);
      })
      .catch(err => console.error('Error loading GeoJSON:', err));
  }, []);

  // Fetch organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_URL}/greek-organizations`);
        if (response.ok) {
          const data = await response.json();
          // Ensure data is an array
          setOrganizations(Array.isArray(data) ? data : []);
        } else {
          setOrganizations([]); // Set empty array on error
        }
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setOrganizations([]); // Set empty array on error
      }
    };

    fetchOrganizations();
  }, []);

  // Calculate stats
  useEffect(() => {
    const collegeData = COLLEGE_LOCATIONS;
    const totalColleges = Object.keys(collegeData).length;
    const totalChapters = Object.values(collegeData).reduce((sum, college) =>
      sum + college.fraternities + college.sororities, 0
    );
    const totalMembers = Object.values(collegeData).reduce((sum, college) =>
      sum + college.totalMembers, 0
    );

    setStats({
      states: 48, // Mainland US only
      colleges: totalColleges,
      chapters: totalChapters,
      members: totalMembers,
      activeNow: Math.floor(totalMembers * 0.23) // Simulated 23% active
    });
  }, []);

  // Fetch Instagram chapters for clustering on the map
  useEffect(() => {
    const fetchInstagramChapters = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3050';
        console.log('📸 [RetroSuperMap] Fetching Instagram chapters for clustering...');

        const response = await fetch(`${API_URL}/api/chapters/instagram-map`);
        const data = await response.json();

        if (data.success && data.data) {
          console.log(`📸 [RetroSuperMap] Loaded ${data.data.length} chapters with Instagram and coordinates`);
          setInstagramChapters(data.data);
        }
      } catch (error) {
        console.error('❌ [RetroSuperMap] Error fetching Instagram chapters:', error);
      }
    };

    fetchInstagramChapters();
  }, []);

  // Update body data attribute for dynamic styling
  useEffect(() => {
    document.body.setAttribute('data-org-type', organizationType);
    return () => {
      document.body.removeAttribute('data-org-type');
    };
  }, [organizationType]);

  // Power 5 conferences
  const POWER_5_CONFERENCES = ['BIG 10', 'ACC', 'BIG 12', 'SEC', 'PAC - 12'];

  // Filter chapters by organization type and Power 5
  const getFilteredChapters = () => {
    let filtered = instagramChapters;

    // Filter by organization type
    if (organizationType !== 'all') {
      filtered = filtered.filter(
        chapter => chapter.greek_organizations?.organization_type === organizationType
      );
    }

    // Filter by Power 5
    if (showPower5Only) {
      filtered = filtered.filter(
        chapter => chapter.universities?.conference && POWER_5_CONFERENCES.includes(chapter.universities.conference)
      );
    }

    return filtered;
  };

  // Get color scheme based on organization type
  const getColorScheme = () => {
    if (organizationType === 'sorority') {
      return {
        primary: '#EC4899', // Pink-500
        secondary: '#F9A8D4', // Pink-300
        glow: 'rgba(236, 72, 153, 0.6)',
        border: '#EC4899',
        text: 'pink'
      };
    }
    // Default green for fraternities and all
    return {
      primary: '#22C55E', // Green-500
      secondary: '#4ADE80', // Green-400
      glow: 'rgba(34, 197, 94, 0.6)',
      border: '#22C55E',
      text: 'green'
    };
  };

  const colorScheme = getColorScheme();
  const filteredChapters = getFilteredChapters();

  // Get or assign neon color for state
  const getStateNeonColor = (stateName: string) => {
    if (!STATE_NEON_COLORS[stateName]) {
      STATE_NEON_COLORS[stateName] = NEON_COLORS[colorIndex % NEON_COLORS.length];
      colorIndex++;
    }
    return STATE_NEON_COLORS[stateName];
  };

  // State styling with neon colors and glow effect
  const stateStyle = (feature: any) => {
    const stateName = feature.properties.name;
    const isHovered = hoveredState === stateName;

    // Hide Alaska and Hawaii
    if (stateName === 'Alaska' || stateName === 'Hawaii') {
      return {
        fillColor: 'transparent',
        weight: 0,
        opacity: 0,
        fillOpacity: 0
      };
    }

    const neonColor = getStateNeonColor(stateName);

    return {
      fillColor: 'transparent', // No fill, just outlines
      weight: isHovered ? 4 : 2.5,
      opacity: 1,
      color: neonColor,
      fillOpacity: 0
    };
  };

  const onEachState = (feature: any, layer: L.Layer) => {
    // Skip Alaska and Hawaii
    const stateName = feature.properties.name;
    if (stateName === 'Alaska' || stateName === 'Hawaii') {
      return;
    }

    const neonColor = getStateNeonColor(stateName);

    layer.on({
      mouseover: (e) => {
        setHoveredState(feature.properties.name);
        const layer = e.target;
        layer.setStyle({
          weight: 4,
          color: neonColor
        });
      },
      mouseout: (e) => {
        setHoveredState(null);
        const layer = e.target;
        layer.setStyle({
          weight: 2.5,
          color: neonColor
        });
      },
      click: (e) => {
        console.log('🖱️ CLICK EVENT FIRED on state:', feature.properties.name);
        e.target.setStyle({ weight: 5, color: '#ffffff' }); // White highlight
        handleStateClick(feature.properties.name);
      }
    });

    // Add tooltip with matching neon color
    layer.bindTooltip(feature.properties.name, {
      permanent: false,
      direction: 'center',
      className: 'retro-tooltip',
      opacity: 1
    });
  };

  const handleStateClick = (stateName: string) => {
    console.log('===================================');
    console.log('🎯 handleStateClick CALLED!');
    console.log('State Name:', stateName);
    console.log('===================================');

    const stateAbbr = Object.keys(STATE_COORDINATES).find(
      key => STATE_COORDINATES[key as keyof typeof STATE_COORDINATES].name === stateName
    );

    console.log('Found stateAbbr:', stateAbbr);
    console.log('mapRef.current exists:', mapRef.current ? 'YES' : 'NO');

    if (stateAbbr && mapRef.current) {
      const bounds = STATE_BOUNDS[stateAbbr as keyof typeof STATE_BOUNDS];
      if (bounds) {
        // Get filtered Instagram chapters in this state from database
        const filtered = getFilteredChapters();
        const stateChapters = filtered.filter(
          chapter => chapter.universities?.state === stateAbbr
        );

        // Get unique universities
        const uniqueUniversities = new Set(
          stateChapters.map(chapter => chapter.universities?.id).filter(Boolean)
        );

        const totalChapters = stateChapters.length;
        const totalMembers = stateChapters.reduce(
          (sum, chapter) => sum + (chapter.member_count || 0), 0
        );

        console.log(`📊 State: ${stateName}, Universities: ${uniqueUniversities.size}, Chapters: ${totalChapters}, Members: ${totalMembers}`);

        // Set selected state data with real database info
        setSelectedStateData({
          name: stateName,
          abbr: stateAbbr,
          colleges: stateChapters.map(chapter => ({
            name: chapter.universities?.name || 'Unknown',
            lat: chapter.universities?.latitude || 0,
            lng: chapter.universities?.longitude || 0,
            state: stateAbbr,
            fraternities: 0, // Not tracked per college in this view
            sororities: 0,
            totalMembers: chapter.member_count || 0
          })),
          totalChapters,
          totalMembers
        });

        // Zoom to state
        mapRef.current.flyToBounds(
          bounds as any,
          {
            duration: 1.5,
            easeLinearity: 0.25,
            padding: [50, 50]
          }
        );
        setViewMode('state');
        console.log('🗺️ State clicked:', stateName, 'Universities:', uniqueUniversities.size, 'Chapters:', totalChapters);
      }
    }
  };

  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([39.8283, -98.5795], 4.2, {
        duration: 1.5,
        easeLinearity: 0.25
      });
      setViewMode('usa');
      setSelectedStateData(null);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* CRT Scanlines Overlay */}
      <CRTScanlines />

      {/* Collapsed/Expanded Sidebar */}
      <AnimatePresence>
        {!sidebarExpanded ? (
          <CollapsedSidebar
            onClick={() => setSidebarExpanded(true)}
            count={organizations.length}
          />
        ) : (
          <ExpandedSidebar
            onCollapse={() => setSidebarExpanded(false)}
            organizations={organizations}
          />
        )}
      </AnimatePresence>

      {/* Map Controls - Top Right Corner */}
      <div className="absolute top-4 right-4 z-[1100]">
        <MapControls
          map={mapRef.current}
          onResetView={resetView}
          showResetButton={viewMode === 'state'}
        />
      </div>

      {/* Right Side Info Boxes - Below Controls */}
      <div className="absolute top-48 right-4 z-[998] w-80 space-y-4">
        {/* State View: Show State Info */}
        {viewMode === 'state' && selectedStateData ? (
          <>
            <RetroStatsBox
              title={`${selectedStateData.name.toUpperCase()} - STATE VIEW`}
              icon={MapPin}
              stats={(() => {
                // Count unique universities in this state with filtered Instagram chapters
                const stateChapters = filteredChapters.filter(
                  chapter => chapter.universities?.state === selectedStateData.abbr
                );
                const uniqueUniversities = new Set(
                  stateChapters.map(chapter => chapter.universities?.id).filter(Boolean)
                );
                const uniqueUnivCount = uniqueUniversities.size;

                return [
                  { label: 'UNIVERSITIES', value: uniqueUnivCount },
                  { label: 'INSTAGRAM CHAPTERS', value: selectedStateData.totalChapters },
                  { label: 'TOTAL MEMBERS', value: selectedStateData.totalMembers },
                  { label: 'AVG MEMBERS/CHAPTER', value: selectedStateData.totalChapters > 0 ? Math.floor(selectedStateData.totalMembers / selectedStateData.totalChapters) : 0 }
                ];
              })()}
            />
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/80 border-2 border-cyan-500 rounded-lg p-4 backdrop-blur-sm max-h-96 overflow-y-auto"
              style={{
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)'
              }}
            >
              {(() => {
                // Get unique universities with chapter counts (filtered by org type)
                const stateChapters = filteredChapters.filter(
                  chapter => chapter.universities?.state === selectedStateData.abbr
                );

                const universitiesMap = new Map();
                stateChapters.forEach(chapter => {
                  const univId = chapter.universities?.id;
                  const univName = chapter.universities?.name;
                  if (univId && univName) {
                    if (!universitiesMap.has(univId)) {
                      universitiesMap.set(univId, {
                        name: univName,
                        chapterCount: 0
                      });
                    }
                    universitiesMap.get(univId).chapterCount++;
                  }
                });

                const universities = Array.from(universitiesMap.values())
                  .sort((a, b) => b.chapterCount - a.chapterCount);

                return (
                  <>
                    <h3 className="text-cyan-400 font-mono font-bold text-sm tracking-wider uppercase mb-3 pb-2 border-b border-cyan-500/30"
                        style={{ textShadow: '0 0 8px rgba(0, 255, 255, 0.8)' }}>
                      UNIVERSITIES ({universities.length})
                    </h3>
                    <div className="space-y-2">
                      {universities.length === 0 ? (
                        <div className="text-xs font-mono text-cyan-300/60 italic text-center py-4">
                          No universities with Instagram chapters in this state
                        </div>
                      ) : (
                        <>
                          {universities.slice(0, 10).map((univ, idx) => (
                            <div key={idx} className="text-xs font-mono text-cyan-300/80 hover:text-cyan-400 cursor-pointer flex justify-between">
                              <span>• {univ.name}</span>
                              <span className="text-cyan-400/60">({univ.chapterCount})</span>
                            </div>
                          ))}
                          {universities.length > 10 && (
                            <div className="text-xs font-mono text-cyan-300/60 italic pt-2">
                              + {universities.length - 10} more universities...
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </>
        ) : (
          <>
            {/* USA View: Show System Stats */}
            <RetroStatsBox
              title="SYSTEM STATUS"
              icon={Activity}
              stats={[
                { label: 'STATES ONLINE', value: stats.states },
                { label: 'COLLEGES TRACKED', value: stats.colleges.toLocaleString() },
                { label: 'CHAPTERS ACTIVE', value: stats.chapters.toLocaleString() },
                { label: 'USERS ACTIVE NOW', value: stats.activeNow.toLocaleString() }
              ]}
            />

            {/* Network Activity Box */}
            <RetroStatsBox
              title="NETWORK ACTIVITY"
              icon={TrendingUp}
              stats={[
                { label: 'TOTAL MEMBERS', value: stats.members.toLocaleString() },
                { label: 'ORGANIZATIONS', value: organizations.length },
                { label: 'AVG CHAPTER SIZE', value: Math.floor(stats.members / (stats.chapters || 1)) },
                { label: 'UPTIME', value: '99.8%' }
              ]}
            />
          </>
        )}
      </div>

      {/* Map Container */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          perspective: '1500px',
          perspectiveOrigin: 'center top'
        }}
      >
        <div
          className="h-full w-full transition-transform duration-1500 ease-out"
          style={{
            transform: viewMode === 'state'
              ? 'rotateX(25deg) scale(1.1)'
              : 'rotateX(0deg) scale(1)',
            transformOrigin: 'center center',
            transformStyle: 'preserve-3d',
            boxShadow: viewMode === 'state'
              ? '0 30px 60px rgba(0, 255, 100, 0.3), 0 15px 30px rgba(0, 0, 0, 0.5)'
              : 'none'
          }}
        >
          <MapContainer
            center={[39.8283, -98.5795]}
            zoom={4.2}
            maxZoom={18}
            minZoom={2}
            className="h-full w-full"
            zoomControl={false}
            ref={mapRef}
            whenReady={() => setMapReady(true)}
            style={{
              background: '#000',
              filter: 'contrast(1.1) brightness(0.9)'
            }}
          >
          {/* State boundaries with neon glow - NO TILE LAYER */}
          {statesData && (
            <GeoJSON
              data={statesData}
              style={stateStyle}
              onEachFeature={onEachState}
            />
          )}

          {/* Instagram Chapter Clusters - Show in USA view */}
          {showInstagramClusters && viewMode === 'usa' && (
            <MarkerClusterGroup
              key={organizationType}
              chunkedLoading
              maxClusterRadius={50}
              spiderfyOnMaxZoom={true}
              showCoverageOnHover={false}
              zoomToBoundsOnClick={true}
              iconCreateFunction={(cluster) => {
                const count = cluster.getChildCount();
                let size = 'small';
                if (count >= 50) size = 'large';
                else if (count >= 20) size = 'medium';

                const clusterClass = organizationType === 'sorority' ? 'sorority' : 'fraternity';

                return L.divIcon({
                  html: `<div class="${clusterClass}-cluster-icon ${clusterClass}-cluster-${size}">
                           <span>${count}</span>
                         </div>`,
                  className: `${clusterClass}-cluster`,
                  iconSize: L.point(40, 40, true)
                });
              }}
            >
              {filteredChapters.map((chapter) => {
                if (!chapter.universities?.latitude || !chapter.universities?.longitude) return null;

                const markerColor = organizationType === 'sorority' ? '#EC4899' : '#E11D48';

                return (
                  <CircleMarker
                    key={chapter.id}
                    center={[chapter.universities.latitude, chapter.universities.longitude]}
                    radius={6}
                    pathOptions={{
                      fillColor: markerColor,
                      color: '#FFFFFF',
                      weight: 2,
                      fillOpacity: 0.8
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={1} className="retro-tooltip instagram-tooltip">
                      <div className="font-mono">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-pink-400 font-bold">📸</div>
                          <div className="font-bold text-base text-pink-400">
                            {chapter.greek_organizations?.name || 'Unknown Chapter'}
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="text-cyan-300">🏫 {chapter.universities?.name}</div>
                          <div className="flex items-center gap-1 text-pink-300">
                            <span className="font-semibold">Instagram:</span>
                            <a
                              href={`https://instagram.com/${chapter.instagram_handle?.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-400 hover:text-pink-300 font-medium underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {chapter.instagram_handle}
                            </a>
                          </div>
                          <div className="text-cyan-300">👥 {chapter.member_count || 0} members</div>
                        </div>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                );
              })}
            </MarkerClusterGroup>
          )}

          {/* Instagram Chapter Markers - Show in State View with accurate coordinates */}
          {viewMode === 'state' && selectedStateData && filteredChapters
            .filter(chapter => chapter.universities?.state === selectedStateData.abbr)
            .map((chapter) => {
              if (!chapter.universities?.latitude || !chapter.universities?.longitude) return null;

              return (
                <CircleMarker
                  key={`state-${chapter.id}`}
                  center={[chapter.universities.latitude, chapter.universities.longitude]}
                  radius={8}
                  pathOptions={{
                    fillColor: '#00ffff',
                    color: '#00ffff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.6
                  }}
                  eventHandlers={{
                    mouseover: (e) => {
                      e.target.setRadius(12);
                      e.target.setStyle({ fillOpacity: 0.9 });
                    },
                    mouseout: (e) => {
                      e.target.setRadius(8);
                      e.target.setStyle({ fillOpacity: 0.6 });
                    }
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1} className="retro-tooltip">
                    <div className="font-mono">
                      <div className="font-bold text-cyan-400">{chapter.universities?.name}</div>
                      <div className="text-xs text-cyan-300 mt-1">
                        {chapter.greek_organizations?.name}
                      </div>
                      <div className="text-xs text-pink-300 mt-1">
                        📸 {chapter.instagram_handle}
                      </div>
                      <div className="text-xs text-cyan-300">
                        {chapter.member_count?.toLocaleString() || 0} Members
                      </div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })
          }

          {/* Old College Markers - Disabled, now using Instagram chapter markers with accurate coordinates */}
        </MapContainer>
        </div>
      </div>

      {/* Radar Background Effect */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {/* Pulsing Radar Circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="radar-circle radar-circle-1"></div>
          <div className="radar-circle radar-circle-2"></div>
          <div className="radar-circle radar-circle-3"></div>
          <div className="radar-circle radar-circle-4"></div>
        </div>
      </div>

      {/* Retro Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999]">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-black/80 border-2 rounded-lg px-6 py-3 backdrop-blur-sm"
          style={{
            borderColor: colorScheme.border,
            boxShadow: `0 0 30px ${colorScheme.glow}`
          }}
        >
          <h1 className="font-mono font-bold text-2xl tracking-wider text-center"
              style={{
                color: colorScheme.primary,
                textShadow: `0 0 10px ${colorScheme.glow}`
              }}>
            {organizationType === 'sorority' ? 'SORORITY' : organizationType === 'fraternity' ? 'FRATERNITY' : 'GREEK LIFE'} PARTNERSHIP MAP
          </h1>
          <p className="font-mono text-xs text-center mt-1"
             style={{ color: `${colorScheme.primary}99` }}>
            REAL-TIME MONITORING SYSTEM v2.5.1
          </p>

          {/* Organization Type Toggle */}
          <div className="flex gap-2 mt-3 justify-center">
            <button
              onClick={() => setOrganizationType('all')}
              className={`px-3 py-1 text-xs font-mono font-semibold rounded transition-all ${
                organizationType === 'all'
                  ? 'bg-green-500 text-black'
                  : 'bg-black/50 text-green-400 border border-green-500/50 hover:bg-green-500/20'
              }`}
              style={organizationType === 'all' ? { boxShadow: '0 0 10px rgba(34, 197, 94, 0.6)' } : {}}
            >
              ALL
            </button>
            <button
              onClick={() => setOrganizationType('fraternity')}
              className={`px-3 py-1 text-xs font-mono font-semibold rounded transition-all ${
                organizationType === 'fraternity'
                  ? 'bg-green-500 text-black'
                  : 'bg-black/50 text-green-400 border border-green-500/50 hover:bg-green-500/20'
              }`}
              style={organizationType === 'fraternity' ? { boxShadow: '0 0 10px rgba(34, 197, 94, 0.6)' } : {}}
            >
              FRATERNITIES
            </button>
            <button
              onClick={() => setOrganizationType('sorority')}
              className={`px-3 py-1 text-xs font-mono font-semibold rounded transition-all ${
                organizationType === 'sorority'
                  ? 'bg-pink-500 text-black'
                  : 'bg-black/50 text-pink-400 border border-pink-500/50 hover:bg-pink-500/20'
              }`}
              style={organizationType === 'sorority' ? { boxShadow: '0 0 10px rgba(236, 72, 153, 0.6)' } : {}}
            >
              SORORITIES
            </button>
          </div>

          {/* Power 5 Toggle */}
          <div className="flex gap-2 mt-2 justify-center">
            <button
              onClick={() => setShowPower5Only(!showPower5Only)}
              className={`px-3 py-1 text-xs font-mono font-semibold rounded transition-all ${
                showPower5Only
                  ? 'bg-yellow-500 text-black'
                  : 'bg-black/50 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/20'
              }`}
              style={showPower5Only ? { boxShadow: '0 0 10px rgba(234, 179, 8, 0.6)' } : {}}
            >
              {showPower5Only ? '⭐ POWER 5 ONLY' : 'POWER 5'}
            </button>
            {showPower5Only && (
              <span className="text-xs font-mono text-yellow-400 self-center">
                SEC • BIG 10 • ACC • BIG 12 • PAC-12
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Add custom CSS for retro effects */}
      <style>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }

        @keyframes flicker {
          0%, 100% { opacity: 0.97; }
          50% { opacity: 1; }
        }

        /* Radar Pulsing Circles */
        @keyframes radarPulse {
          0% {
            transform: scale(0);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        .radar-circle {
          position: absolute;
          border-radius: 50%;
          animation: radarPulse 4s ease-out infinite;
        }

        /* Dynamic radar colors based on organization type */
        body[data-org-type="sorority"] .radar-circle {
          border: 2px solid rgba(236, 72, 153, 0.4);
        }

        body[data-org-type="fraternity"] .radar-circle,
        body[data-org-type="all"] .radar-circle {
          border: 2px solid rgba(34, 197, 94, 0.4);
        }

        .radar-circle-1 {
          width: 400px;
          height: 400px;
          margin-left: -200px;
          margin-top: -200px;
          animation-delay: 0s;
        }

        .radar-circle-2 {
          width: 800px;
          height: 800px;
          margin-left: -400px;
          margin-top: -400px;
          animation-delay: 1s;
        }

        .radar-circle-3 {
          width: 1200px;
          height: 1200px;
          margin-left: -600px;
          margin-top: -600px;
          animation-delay: 2s;
        }

        .radar-circle-4 {
          width: 1600px;
          height: 1600px;
          margin-left: -800px;
          margin-top: -800px;
          animation-delay: 3s;
        }


        .retro-tooltip {
          background: rgba(0, 0, 0, 0.9) !important;
          border: 2px solid #22c55e !important;
          border-radius: 4px !important;
          color: #22c55e !important;
          font-family: 'Courier New', monospace !important;
          font-weight: bold !important;
          padding: 4px 8px !important;
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.6) !important;
          text-shadow: 0 0 6px rgba(34, 197, 94, 0.8) !important;
        }

        .leaflet-container {
          background: #000 !important;
        }

        /* Neon glow effect for state paths */
        path.leaflet-interactive {
          filter: drop-shadow(0 0 8px currentColor) drop-shadow(0 0 4px currentColor);
          transition: all 0.3s ease;
        }

        path.leaflet-interactive:hover {
          filter: drop-shadow(0 0 15px currentColor) drop-shadow(0 0 8px currentColor) drop-shadow(0 0 4px currentColor);
        }

        /* Glow effect for college markers */
        .leaflet-interactive[fill="#00ffff"] {
          filter: drop-shadow(0 0 6px #00ffff) drop-shadow(0 0 3px #00ffff);
          transition: all 0.3s ease;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.5);
          border-left: 1px solid rgba(34, 197, 94, 0.3);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.7);
        }

        /* Fraternity Cluster Styling */
        .fraternity-cluster {
          background: transparent !important;
        }

        .fraternity-cluster-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: bold;
          color: white;
          box-shadow: 0 0 15px rgba(225, 29, 72, 0.6), 0 0 8px rgba(225, 29, 72, 0.4);
          border: 3px solid rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
        }

        .fraternity-cluster-small {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #E11D48 0%, #BE123C 100%);
          font-size: 14px;
        }

        .fraternity-cluster-medium {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #E11D48 0%, #9F1239 100%);
          font-size: 16px;
        }

        .fraternity-cluster-large {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
          font-size: 18px;
        }

        .fraternity-cluster-icon:hover {
          transform: scale(1.15);
          box-shadow: 0 0 25px rgba(225, 29, 72, 0.8), 0 0 15px rgba(225, 29, 72, 0.6);
        }

        @keyframes fraternityPulse {
          0%, 100% {
            box-shadow: 0 0 15px rgba(225, 29, 72, 0.6), 0 0 8px rgba(225, 29, 72, 0.4);
          }
          50% {
            box-shadow: 0 0 25px rgba(225, 29, 72, 0.9), 0 0 15px rgba(225, 29, 72, 0.7);
          }
        }

        .fraternity-cluster-icon {
          animation: fraternityPulse 2s ease-in-out infinite;
        }

        /* Sorority Cluster Styling - PINK */
        .sorority-cluster {
          background: transparent !important;
        }

        .sorority-cluster-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: bold;
          color: white;
          box-shadow: 0 0 15px rgba(236, 72, 153, 0.6), 0 0 8px rgba(236, 72, 153, 0.4);
          border: 3px solid rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
        }

        .sorority-cluster-small {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%);
          font-size: 14px;
        }

        .sorority-cluster-medium {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #EC4899 0%, #BE185D 100%);
          font-size: 16px;
        }

        .sorority-cluster-large {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #F472B6 0%, #BE185D 100%);
          font-size: 18px;
        }

        .sorority-cluster-icon:hover {
          transform: scale(1.15);
          box-shadow: 0 0 25px rgba(236, 72, 153, 0.8), 0 0 15px rgba(236, 72, 153, 0.6);
        }

        @keyframes sororityPulse {
          0%, 100% {
            box-shadow: 0 0 15px rgba(236, 72, 153, 0.6), 0 0 8px rgba(236, 72, 153, 0.4);
          }
          50% {
            box-shadow: 0 0 25px rgba(236, 72, 153, 0.9), 0 0 15px rgba(236, 72, 153, 0.7);
          }
        }

        .sorority-cluster-icon {
          animation: sororityPulse 2s ease-in-out infinite;
        }

        /* Instagram Tooltip Styling */
        .instagram-tooltip {
          background: rgba(0, 0, 0, 0.95) !important;
          border: 2px solid #E11D48 !important;
          border-radius: 6px !important;
          box-shadow: 0 0 20px rgba(225, 29, 72, 0.6) !important;
        }

        /* Glow effect for Instagram markers */
        .leaflet-interactive[fill="#E11D48"] {
          filter: drop-shadow(0 0 8px #E11D48) drop-shadow(0 0 4px #E11D48);
          transition: all 0.3s ease;
        }

        .leaflet-interactive[fill="#E11D48"]:hover {
          filter: drop-shadow(0 0 15px #E11D48) drop-shadow(0 0 8px #E11D48);
        }
      `}</style>
    </div>
  );
};

export default RetroSuperMapPage;
