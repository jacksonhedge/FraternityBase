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

// Hook to set map ref
const SetMapRef = ({ mapRef }: { mapRef: React.MutableRefObject<any> }) => {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

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
  const [showInfo, setShowInfo] = useState(true);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [hoveredCollege, setHoveredCollege] = useState<{ name: string; data: any } | null>(null);
  const mapRef = useRef<any>(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: Home },
    { name: 'Map', href: '/app/map', icon: MapPin, badge: 'NEW' },
    { name: 'Colleges', href: '/app/colleges', icon: Building2 },
    { name: 'Chapters', href: '/app/chapters', icon: GraduationCap },
    { name: 'Fraternities', href: '/app/fraternities', icon: UsersIcon },
    { name: 'Team', href: '/app/team', icon: UsersIcon },
  ];

  // Load US states GeoJSON
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
      .then(response => response.json())
      .then(data => setStatesData(data))
      .catch(err => console.error('Error loading GeoJSON:', err));
  }, []);

  // Cyberpunk neon style for states
  const styleState = (feature?: any) => {
    const isHovered = hoveredState === feature?.properties?.name;
    const isSelected = selectedState?.name === feature?.properties?.name;

    // Style for selected state (in state view)
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

    // Style for hovered state
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

    // Default style
    return {
      fillColor: '#0f0f1e',
      weight: 2,
      opacity: 1,
      color: '#1a73e8',
      fillOpacity: 0.6,
      dashArray: '',
    };
  };

  // Handle state click
  const handleStateClick = (feature: any) => {
    const stateAbbr = feature.properties.abbr;
    if (!stateAbbr) return;

    const collegesInState = Object.entries(COLLEGE_LOCATIONS)
      .filter(([_, college]) => college.state === stateAbbr)
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

    // Zoom to state bounds with tighter fit
    setTimeout(() => {
      if (mapRef.current && STATE_BOUNDS[stateAbbr as keyof typeof STATE_BOUNDS]) {
        const bounds = STATE_BOUNDS[stateAbbr as keyof typeof STATE_BOUNDS];
        const map = mapRef.current;

        console.log('Zooming to state:', stateAbbr, bounds);

        map.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 8,
          animate: true,
          duration: 0.5
        });
      } else {
        console.log('Map ref or bounds not available:', {
          hasMapRef: !!mapRef.current,
          stateAbbr,
          hasBounds: !!STATE_BOUNDS[stateAbbr as keyof typeof STATE_BOUNDS]
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

  // Handle college click
  const handleCollegeClick = (collegeName: string, collegeData: College) => {
    setSelectedCollege({ name: collegeName, ...collegeData });
    setViewMode('campus');
    setShowInfo(false);

    if (mapRef.current) {
      mapRef.current.setView([collegeData.lat, collegeData.lng], 15);
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
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setShowNavMenu(!showNavMenu)}
        className="absolute top-4 left-4 z-[1001] bg-cyan-500 text-black p-3 rounded-lg hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/50"
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      {/* Navigation Menu (Collapsible Left) */}
      {showNavMenu && (
        <div className="absolute top-0 left-0 h-full z-[1000] transition-all duration-300">
          <div className="bg-black/95 backdrop-blur-md border-r-2 border-cyan-500 h-full w-72 shadow-2xl shadow-cyan-500/50">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-900 to-blue-900 border-b-2 border-cyan-500 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-cyan-400">FraternityBase</h2>
                <button
                  onClick={() => setShowNavMenu(false)}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {user && (
                <div className="text-sm text-cyan-300/70">
                  <p className="truncate">{user.email}</p>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/50'
                        : 'text-cyan-300 hover:bg-cyan-900/30 hover:text-cyan-400'
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
            </nav>

            {/* Logout Button */}
            <div className="absolute bottom-0 left-0 right-0 border-t-2 border-cyan-500 p-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all w-full"
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
          <div className="bg-black/90 backdrop-blur-md border-2 border-cyan-500 rounded-lg shadow-2xl shadow-cyan-500/50 p-6 w-80">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-3 right-3 text-cyan-400 hover:text-cyan-300"
            >
              <Minus className="w-5 h-5" />
            </button>

            <h1 className="text-2xl font-bold text-cyan-400 flex items-center gap-2 mb-2">
              <MapPin className="w-6 h-6" />
              Fraternity Map
            </h1>
            <p className="text-cyan-300/70 text-sm mb-4">
              Explore Greek life across America with real-time data
            </p>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border border-cyan-500/30 rounded-lg p-3">
                <p className="text-3xl font-bold text-cyan-400">{stats.states}</p>
                <p className="text-xs text-cyan-300/70">States</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border border-cyan-500/30 rounded-lg p-3">
                <p className="text-3xl font-bold text-cyan-400">{stats.colleges}</p>
                <p className="text-xs text-cyan-300/70">Colleges</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border border-cyan-500/30 rounded-lg p-3">
                <p className="text-3xl font-bold text-cyan-400">{stats.chapters.toLocaleString()}</p>
                <p className="text-xs text-cyan-300/70">Chapters</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border border-cyan-500/30 rounded-lg p-3">
                <p className="text-3xl font-bold text-cyan-400">{stats.members.toLocaleString()}</p>
                <p className="text-xs text-cyan-300/70">Members</p>
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

      {/* State Sidebar (Collapsible Left) */}
      {selectedState && (
        <div className={`absolute top-0 left-0 h-full z-[1000] transition-all duration-300 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="bg-black/90 backdrop-blur-md border-r-2 border-cyan-500 h-full w-96 overflow-y-auto shadow-2xl shadow-cyan-500/50">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-cyan-900 to-blue-900 border-b-2 border-cyan-500 p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-cyan-400">{selectedState.name}</h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-cyan-300">{selectedState.colleges.length} Colleges</span>
                <span className="text-cyan-300">{selectedState.totalChapters} Chapters</span>
                <span className="text-cyan-300">{selectedState.totalMembers.toLocaleString()} Members</span>
              </div>
            </div>

            {/* Colleges List */}
            <div className="p-4 space-y-3">
              {selectedState.colleges.map((college) => (
                <button
                  key={college.name}
                  onClick={() => handleCollegeClick(college.name, college)}
                  className="w-full bg-gradient-to-br from-black/80 to-cyan-900/20 border border-cyan-500/30 hover:border-cyan-500 rounded-lg p-4 text-left transition-all hover:shadow-lg hover:shadow-cyan-500/30 group"
                >
                  <h3 className="font-bold text-cyan-400 group-hover:text-cyan-300 mb-2">
                    {college.name}
                  </h3>
                  <div className="flex gap-3 text-xs text-cyan-300/70">
                    <span>🏛️ {college.fraternities} Frats</span>
                    <span>👥 {college.sororities} Sororities</span>
                    <span>📊 {college.totalMembers.toLocaleString()} Total</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Sidebar Toggle */}
      {selectedState && !showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          className="absolute top-1/2 left-0 z-[1000] bg-cyan-500 text-black p-3 rounded-r-lg hover:bg-cyan-400 transition-all transform -translate-y-1/2 shadow-lg shadow-cyan-500/50"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Back Button (Campus View -> State View) */}
      {viewMode === 'campus' && selectedState && (
        <button
          onClick={handleBackToState}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all font-semibold flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to {selectedState.name}
        </button>
      )}

      {/* Reset Button (State View -> USA View) */}
      {selectedState && viewMode === 'state' && (
        <button
          onClick={handleResetToUSA}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all font-semibold flex items-center gap-2"
        >
          <Maximize2 className="w-5 h-5" />
          Reset to USA View
        </button>
      )}

      {/* Hovered College Info (Bottom Center) */}
      {hoveredCollege && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000] bg-black/95 backdrop-blur-md border-2 border-cyan-500 rounded-lg shadow-2xl shadow-cyan-500/50 p-4 min-w-[300px]">
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
        style={{ height: '100vh', width: '100%', backgroundColor: '#000000' }}
        whenReady={() => setMapReady(true)}
        zoomControl={false}
      >
        <SetMapRef mapRef={mapRef} />

        {/* State boundaries */}
        {statesData && (
          <>
            <GeoJSON
              key={`geojson-${viewMode}-${selectedState?.abbr || 'none'}`}
              data={statesData}
              style={styleState}
              onEachFeature={onEachState}
            />
            {/* State abbreviation labels */}
            {viewMode === 'usa' && <StateLabels statesData={statesData} />}
          </>
        )}

        {/* College markers - Radar style with pulsing animation */}
        {viewMode === 'usa' && Object.entries(COLLEGE_LOCATIONS).map(([collegeName, collegeData]) => {
          const radarIcon = L.divIcon({
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
          });

          return (
            <Marker
              key={collegeName}
              position={[collegeData.lat, collegeData.lng]}
              icon={radarIcon}
              eventHandlers={{
                click: () => handleCollegeClick(collegeName, collegeData),
                mouseover: () => setHoveredCollege({ name: collegeName, data: collegeData }),
                mouseout: () => setHoveredCollege(null),
              }}
            />
          );
        })}

        {/* State-specific college markers when zoomed into a state */}
        {selectedState && viewMode === 'state' && selectedState.colleges.map((college) => {
          const radarIcon = L.divIcon({
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
          });

          return (
            <Marker
              key={college.name}
              position={[college.lat, college.lng]}
              icon={radarIcon}
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

      {/* Add custom CSS for neon effects and radar markers */}
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
          background: #000000 !important;
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