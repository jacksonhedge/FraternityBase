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
  const logoUrl = getCollegeLogo(collegeName);

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={collegeName}
        className={`${className} object-contain flex-shrink-0`}
      />
    );
  }

  // Show initials when no logo available
  const initials = getCollegeInitials(collegeName);
  return (
    <div className={`${className} flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center`}>
      <span className="text-white font-bold text-xl">{initials}</span>
    </div>
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

          const collegesInState = Object.values(COLLEGE_LOCATIONS).filter(
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
  }, []);

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
    if (!stateAbbr) return;

    const collegesInState = Object.entries(COLLEGE_LOCATIONS)
      .filter(([_, college]) => college.state === stateAbbr)
      .map(([name, data]) => ({ name, ...data }));

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
    const collegeMatch = Object.entries(COLLEGE_LOCATIONS).find(
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
    const allColleges = Object.values(COLLEGE_LOCATIONS);
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
      mapRef.current.setView([39.8283, -98.5795], 4);
      setSelectedState(null);
      setSelectedCollege(null);
      setSelectedChapter(null);
      setViewMode('usa');
    }
  };

  // Handle college click → show campus with Greek chapters
  const handleCollegeClick = (collegeName: string, collegeData: College) => {
    setSelectedCollege({ name: collegeName, ...collegeData });
    setViewMode('campus');

    // Zoom to campus level
    if (mapRef.current) {
      mapRef.current.setView([collegeData.lat, collegeData.lng], 15);
    }
  };

  // Mock Greek chapter data for campus view (TODO: fetch from DB)
  const campusChapters = selectedCollege ? [
    { id: 1, name: 'Sigma Chi', lat: selectedCollege.lat + 0.002, lng: selectedCollege.lng - 0.001, members: 85, unlocked: false, cost: 100 },
    { id: 2, name: 'Alpha Tau Omega', lat: selectedCollege.lat - 0.001, lng: selectedCollege.lng + 0.002, members: 75, unlocked: false, cost: 90 },
    { id: 3, name: 'Pi Kappa Alpha', lat: selectedCollege.lat + 0.001, lng: selectedCollege.lng + 0.001, members: 92, unlocked: true, cost: 0 },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MapPin className="w-8 h-8 text-primary-600" />
              Interactive US Fraternity & Sorority Map
            </h1>
            <p className="text-gray-600 mt-2">
              Explore Greek life across America with precise locations and real-time coordinates
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search state or college..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Search
            </button>
          </div>
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
        <div className="absolute top-4 left-4 z-[1000] flex gap-2">
          <button
            onClick={() => setShowColleges(!showColleges)}
            className={`px-4 py-2 rounded-lg shadow-lg transition-colors ${
              showColleges
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <GraduationCap className="w-5 h-5 inline mr-2" />
            {showColleges ? 'Hide' : 'Show'} Colleges
          </button>
        </div>

        <MapContainer
          center={[39.8283, -98.5795]}
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
              eventHandlers={{
                click: () => handleCollegeClick(college.name, college),
                mouseover: (e) => {
                  const marker = e.target;
                  marker.setRadius(14);
                  marker.setStyle({
                    fillColor: '#7C3AED',
                    color: '#FFFFFF',
                    weight: 4,
                    fillOpacity: 1,
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
                    <div>🏛️ {college.fraternities} Fraternities • {college.sororities} Sororities</div>
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
              eventHandlers={{
                click: () => {
                  setSelectedChapter(chapter);
                  setViewMode('chapter');
                },
                mouseover: (e) => {
                  const marker = e.target;
                  marker.setRadius(15);
                  marker.setStyle({
                    fillColor: chapter.unlocked ? '#059669' : '#7C3AED',
                    weight: 4,
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
                  });
                }
              }}
            >
              <Tooltip>
                <div style={{ padding: '4px' }}>
                  <div className="font-bold text-base">
                    {chapter.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    👥 {chapter.members} members
                  </div>
                  {chapter.unlocked ? (
                    <div className="text-sm text-green-600 font-semibold mt-1">
                      ✓ Unlocked
                    </div>
                  ) : (
                    <div className="text-sm text-purple-600 font-semibold mt-1">
                      🔒 {chapter.cost} credits to unlock
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
                  mapRef.current?.setView([39.8283, -98.5795], 4);
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

                    <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                      <div className="text-center p-2 bg-blue-50 rounded group-hover:bg-blue-100 transition-colors">
                        <p className="font-bold text-blue-600">{college.fraternities}</p>
                        <p className="text-xs text-gray-600">Fraternities</p>
                      </div>
                      <div className="text-center p-2 bg-pink-50 rounded group-hover:bg-pink-100 transition-colors">
                        <p className="font-bold text-pink-600">{college.sororities}</p>
                        <p className="text-xs text-gray-600">Sororities</p>
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

            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center p-2 bg-blue-50 rounded">
                <p className="font-bold text-blue-600">{selectedCollege.fraternities}</p>
                <p className="text-xs text-gray-600">Fraternities</p>
              </div>
              <div className="text-center p-2 bg-pink-50 rounded">
                <p className="font-bold text-pink-600">{selectedCollege.sororities}</p>
                <p className="text-xs text-gray-600">Sororities</p>
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
        {/* Map Legend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Map Information
          </h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <p className="mb-2">🎨 <strong>Hover</strong> over any state to see its unique color</p>
              <p className="mb-2">🖱️ <strong>Click</strong> on a state to view detailed information</p>
              <p className="mb-2">📍 <strong>College markers</strong> show Greek life locations</p>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Each state is assigned a unique color from our rainbow palette when you hover over it.
              </p>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow"></div>
                <span className="text-sm text-gray-700">College Location</span>
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
              const counts = Object.entries(COLLEGE_LOCATIONS).reduce((acc: { [key: string]: number }, [_, college]) => {
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

              <h2 className="text-2xl font-bold">{selectedChapter.name}</h2>
              <p className="text-purple-100 text-sm mt-1">{selectedCollege?.name}</p>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">{selectedChapter.members} members</span>
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
                    <span className="font-semibold">1925</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Members:</span>
                    <span className="font-semibold">{selectedChapter.members}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">House Address:</span>
                    <span className="font-semibold">420 Frat Row</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data Quality:</span>
                    <span className="font-semibold text-green-600">A Grade</span>
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
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }

  /* Create a pulsing shadow effect on hover */
  .leaflet-interactive.leaflet-circle:hover {
    filter: drop-shadow(0 0 12px rgba(30, 64, 175, 0.6));
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