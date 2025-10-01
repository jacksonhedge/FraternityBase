import { useState, useEffect, useRef } from 'react';
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
  const [divisionFilter, setDivisionFilter] = useState<'all' | 'power4' | 'd1' | 'd2' | 'd3' | 'mychapters'>('power4');
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
    { name: 'My Chapters', href: '/app/my-chapters', icon: GraduationCap, count: 0 },
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
      // Light mode: Clean, professional style
      if (isSelected && viewMode === 'state') {
        return {
          fillColor: '#DBEAFE',
          weight: 3,
          opacity: 1,
          color: '#3B82F6',
          fillOpacity: 0.5,
          dashArray: '',
        };
      }

      if (isHovered) {
        return {
          fillColor: '#BFDBFE',
          weight: 3,
          opacity: 1,
          color: '#2563EB',
          fillOpacity: 0.6,
          dashArray: '',
        };
      }

      return {
        fillColor: '#EFF6FF',
        weight: 2,
        opacity: 1,
        color: '#93C5FD',
        fillOpacity: 0.4,
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

  // Handle state click
  const handleStateClick = (feature: any) => {
    console.log('📍 handleStateClick called for:', feature.properties.name);
    // Get state abbreviation from name since GeoJSON doesn't have abbr field
    const stateAbbr = getStateAbbr(feature.properties.name);
    if (!stateAbbr) {
      console.log('❌ No state abbreviation found for:', feature.properties.name);
      return;
    }
    console.log('✅ Found state abbreviation:', stateAbbr);

    const collegesInState = Object.entries(COLLEGE_LOCATIONS)
      .filter(([name, college]) => {
        // First filter by state
        if (college.state !== stateAbbr) return false;

        // Then filter by division
        if (divisionFilter === 'all') return true;

        if (divisionFilter === 'mychapters') {
          // TODO: Replace with actual unlocked chapters from user's account
          // For now, return empty array (no unlocked chapters)
          return false;
        }

        if (divisionFilter === 'power4') {
          const power4Conferences = ['SEC', 'BIG 10', 'BIG 12', 'ACC', 'PAC-12', 'PAC - 12'];
          return power4Conferences.includes(college.conference || '');
        }

        if (divisionFilter === 'd1') {
          return college.division === 'D1';
        }

        if (divisionFilter === 'd2') {
          return college.division === 'D2';
        }

        if (divisionFilter === 'd3') {
          return college.division === 'D3';
        }

        return true;
      })
      .map(([name, data]) => ({ name, ...data }));

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

    setShowSidebar(true);
    setViewMode('state'); // Change to state view mode

    // Zoom to state center with same zoom ratio as default USA view
    setTimeout(() => {
      if (mapRef.current && STATE_COORDINATES[stateAbbr as keyof typeof STATE_COORDINATES]) {
        const stateCoords = STATE_COORDINATES[stateAbbr as keyof typeof STATE_COORDINATES];
        const map = mapRef.current;

        console.log('🎯 Zooming to state:', stateAbbr, stateCoords);
        console.log('  - Found colleges:', collegesInState.length);
        console.log('  - Total chapters:', totalChapters);

        // Use zoom level 6.5 to get closer to the state while keeping nearby states visible
        map.setView([stateCoords.lat, stateCoords.lng], 6.5, {
          animate: true,
          duration: 0.5
        });
        console.log('✅ Zoom complete');
      } else {
        console.log('Map ref or state coordinates not available:', {
          hasMapRef: !!mapRef.current,
          stateAbbr,
          hasCoords: !!STATE_COORDINATES[stateAbbr as keyof typeof STATE_COORDINATES]
        });
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
  const handleCollegeClick = (collegeName: string, collegeData: College) => {
    console.log('🎓 COLLEGE CLICKED:', collegeName);
    console.log('  - Conference:', collegeData.conference);
    console.log('  - Division:', collegeData.division);
    console.log('  - Fraternities:', collegeData.fraternities, '| Sororities:', collegeData.sororities);
    setSelectedCollege({ name: collegeName, ...collegeData });
    setViewMode('campus'); // This will trigger the fraternity list view in the sidebar
    setShowInfo(false);

    // Zoom to college on map
    if (mapRef.current) {
      mapRef.current.setView([collegeData.lat, collegeData.lng], 10);
      console.log('✅ Zoomed to college view');
    }
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

      {/* Light/Dark Mode Toggle Switch & Reset Button */}
      <div className="absolute top-4 left-20 z-[1001] flex items-center gap-3 bg-white rounded-lg shadow-lg p-2">
        <span className={`text-sm font-medium transition-colors ${!isDarkMode ? 'text-yellow-500' : 'text-gray-400'}`}>
          ☀️ Light
        </span>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            isDarkMode ? 'bg-gray-700' : 'bg-blue-500'
          }`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              isDarkMode ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-blue-400' : 'text-gray-400'}`}>
          🌙 Dark
        </span>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300" />

        {/* Reset Button */}
        <button
          onClick={() => {
            setViewMode('usa');
            setSelectedState(null);
            setSelectedCollege(null);
            setDivisionFilter('all');
            if (mapRef.current) {
              mapRef.current.setView([39.8283, -98.5795], 5);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
          title="Reset to default view"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Reset</span>
        </button>
      </div>

      {/* Division Filter Buttons */}
      <div className="absolute top-4 right-4 z-[1001] flex flex-wrap items-center justify-end gap-2 bg-white rounded-lg shadow-lg p-2 max-w-md">
        <button
          onClick={() => setDivisionFilter('mychapters')}
          className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all whitespace-nowrap ${
            divisionFilter === 'mychapters'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          My Chapters
        </button>
        <button
          onClick={() => setDivisionFilter('power4')}
          className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all whitespace-nowrap ${
            divisionFilter === 'power4'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Power 5
        </button>
        <button
          onClick={() => setDivisionFilter('d1')}
          className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all whitespace-nowrap ${
            divisionFilter === 'd1'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All D1
        </button>
        <button
          onClick={() => setDivisionFilter('d2')}
          className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all whitespace-nowrap ${
            divisionFilter === 'd2'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All D2
        </button>
        <button
          onClick={() => setDivisionFilter('d3')}
          className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all whitespace-nowrap ${
            divisionFilter === 'd3'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All D3
        </button>
        <button
          onClick={() => setDivisionFilter('all')}
          className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all whitespace-nowrap ${
            divisionFilter === 'all'
              ? 'bg-gray-800 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
      </div>

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

            <h1 className={`text-2xl font-bold flex items-center gap-2 mb-2 ${isDarkMode ? 'text-cyan-400' : 'text-gray-900'}`}>
              <MapPin className="w-6 h-6" />
              Fraternity Map
            </h1>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-cyan-300/70' : 'text-gray-600'}`}>
              Explore Greek life across America with real-time data
            </p>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-lg p-3 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border border-cyan-500/30'
                  : 'bg-gradient-to-br from-blue-50 to-primary-50 border border-primary-200'
              }`}>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-cyan-400' : 'text-primary-600'}`}>{stats.states}</p>
                <p className={`text-xs ${isDarkMode ? 'text-cyan-300/70' : 'text-gray-600'}`}>States</p>
              </div>
              <div className={`rounded-lg p-3 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border border-cyan-500/30'
                  : 'bg-gradient-to-br from-blue-50 to-primary-50 border border-primary-200'
              }`}>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-cyan-400' : 'text-primary-600'}`}>{stats.colleges}</p>
                <p className={`text-xs ${isDarkMode ? 'text-cyan-300/70' : 'text-gray-600'}`}>Colleges</p>
              </div>
              <div className={`rounded-lg p-3 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border border-cyan-500/30'
                  : 'bg-gradient-to-br from-blue-50 to-primary-50 border border-primary-200'
              }`}>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-cyan-400' : 'text-primary-600'}`}>{stats.chapters.toLocaleString()}</p>
                <p className={`text-xs ${isDarkMode ? 'text-cyan-300/70' : 'text-gray-600'}`}>Chapters</p>
              </div>
              <div className={`rounded-lg p-3 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border border-cyan-500/30'
                  : 'bg-gradient-to-br from-blue-50 to-primary-50 border border-primary-200'
              }`}>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-cyan-400' : 'text-primary-600'}`}>{stats.members.toLocaleString()}</p>
                <p className={`text-xs ${isDarkMode ? 'text-cyan-300/70' : 'text-gray-600'}`}>Members</p>
              </div>
            </div>
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
                    {selectedCollege.fraternities} Fraternities
                  </span>
                  <span className={isDarkMode ? 'text-cyan-300' : 'text-primary-100'}>
                    {selectedCollege.sororities} Sororities
                  </span>
                  <span className={isDarkMode ? 'text-cyan-300' : 'text-primary-100'}>
                    {selectedCollege.totalMembers?.toLocaleString()} Members
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
                {/* Placeholder fraternity list - we'll populate with real data */}
                {Array.from({ length: selectedCollege.fraternities + selectedCollege.sororities }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-4 ${
                      isDarkMode
                        ? 'bg-gradient-to-br from-black/80 to-cyan-900/20 border border-cyan-500/30'
                        : 'bg-white border border-primary-200'
                    }`}
                  >
                    <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-cyan-400' : 'text-primary-600'}`}>
                      {i < selectedCollege.fraternities ? 'Fraternity ' : 'Sorority '} {i + 1}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-cyan-300/70' : 'text-gray-600'}`}>
                      Click to view chapter details
                    </p>
                  </div>
                ))}
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
                      src={getCollegeLogoWithFallback(college.name)}
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
                      <div className={`flex gap-3 text-xs ${
                        isDarkMode ? 'text-cyan-300/70' : 'text-gray-600'
                      }`}>
                        <span>🏛️ {college.fraternities} Frats</span>
                        <span>👥 {college.sororities} Sororities</span>
                        <span>📊 {college.totalMembers.toLocaleString()} Total</span>
                      </div>
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
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000] bg-black/95 backdrop-blur-md border-2 border-cyan-500 rounded-lg shadow-2xl shadow-cyan-500/50 p-4 min-w-[350px]">
          <div className="flex items-start gap-3">
            <img
              src={getCollegeLogoWithFallback(hoveredCollege.name)}
              alt={hoveredCollege.name}
              className="w-16 h-16 object-contain flex-shrink-0"
            />
            <div>
              <div className="font-bold text-lg text-cyan-400 mb-2">
                {hoveredCollege.name}
              </div>
              <div className="flex gap-4 text-sm text-cyan-300/90">
                <span>🏛️ {hoveredCollege.data.fraternities} Frats</span>
                <span>•</span>
                <span>{hoveredCollege.data.sororities} Sororities</span>
                <span>•</span>
                <span>👥 {hoveredCollege.data.totalMembers.toLocaleString()} Members</span>
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
        style={{ height: '100vh', width: '100%', backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }}
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

        {/* College markers - Radar (dark) or Logo (light) style */}
        {viewMode === 'usa' && Object.entries(COLLEGE_LOCATIONS)
          .filter(([collegeName, collegeData]) => {
            // Filter based on division
            if (divisionFilter === 'all') return true;

            if (divisionFilter === 'mychapters') {
              // TODO: Replace with actual unlocked chapters from user's account
              // For now, return false to show no markers
              return false;
            }

            if (divisionFilter === 'power4') {
              // Power 5: SEC, BIG 10, BIG 12, ACC, PAC-12
              const power4Conferences = ['SEC', 'BIG 10', 'BIG 12', 'ACC', 'PAC-12', 'PAC - 12'];
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
          })
          .map(([collegeName, collegeData]) => {
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
                    <img src="${getCollegeLogoWithFallback(collegeName)}" alt="${collegeName}" class="college-logo" />
                  </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
              });

          return (
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
        })}

        {/* State-specific college markers when zoomed into a state */}
        {selectedState && viewMode === 'state' && selectedState.colleges.map((college) => {
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
                    <img src="${getCollegeLogoWithFallback(college.name)}" alt="${college.name}" class="college-logo" />
                  </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
              });

          return (
            <Marker
              key={college.name}
              position={[college.lat, college.lng]}
              icon={icon}
              eventHandlers={{
                click: () => handleCollegeClick(college.name, college),
                mouseover: () => setHoveredCollege({ name: college.name, data: college }),
                mouseout: () => setHoveredCollege(null),
              }}
            />
          );
        })}

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
          background: ${isDarkMode ? '#1F2937' : '#F3F4F6'} !important;
        }

        /* Logo marker styles for light mode */}
        .logo-marker {
          background: transparent !important;
          border: none !important;
        }

        .logo-container {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 3px solid #4F46E5;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .logo-container:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.6);
          border-color: #6366F1;
        }

        .college-logo {
          width: 30px;
          height: 30px;
          object-fit: contain;
          border-radius: 50%;
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