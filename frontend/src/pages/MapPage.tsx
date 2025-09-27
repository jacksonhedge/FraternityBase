import { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Info, Users, Building2, X } from 'lucide-react';
import { US_STATES_PATHS, STATE_CENTERS, STATE_NAMES } from '../data/usStates';

interface College {
  id: number;
  name: string;
  state: string;
  fraternities: number;
  sororities: number;
  totalMembers: number;
}

interface StateData {
  id: string;
  name: string;
  colleges: College[];
}

const MapPage = () => {
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // College data for each state
  const collegesByState: { [key: string]: College[] } = {
    'PA': [
      { id: 1, name: 'Penn State', state: 'PA', fraternities: 58, sororities: 32, totalMembers: 4500 },
      { id: 2, name: 'University of Pennsylvania', state: 'PA', fraternities: 45, sororities: 28, totalMembers: 3200 },
      { id: 3, name: 'Temple University', state: 'PA', fraternities: 38, sororities: 25, totalMembers: 2800 },
      { id: 4, name: 'Carnegie Mellon', state: 'PA', fraternities: 22, sororities: 18, totalMembers: 1800 },
      { id: 5, name: 'Villanova', state: 'PA', fraternities: 25, sororities: 20, totalMembers: 2000 },
    ],
    'NY': [
      { id: 6, name: 'Cornell University', state: 'NY', fraternities: 52, sororities: 30, totalMembers: 4200 },
      { id: 7, name: 'Syracuse University', state: 'NY', fraternities: 48, sororities: 28, totalMembers: 3800 },
      { id: 8, name: 'Columbia University', state: 'NY', fraternities: 35, sororities: 22, totalMembers: 2500 },
      { id: 9, name: 'NYU', state: 'NY', fraternities: 32, sororities: 25, totalMembers: 2800 },
    ],
    'CA': [
      { id: 10, name: 'UCLA', state: 'CA', fraternities: 62, sororities: 35, totalMembers: 5200 },
      { id: 11, name: 'USC', state: 'CA', fraternities: 58, sororities: 33, totalMembers: 4800 },
      { id: 12, name: 'Stanford', state: 'CA', fraternities: 38, sororities: 25, totalMembers: 3000 },
      { id: 13, name: 'UC Berkeley', state: 'CA', fraternities: 55, sororities: 30, totalMembers: 4500 },
      { id: 14, name: 'UC San Diego', state: 'CA', fraternities: 42, sororities: 28, totalMembers: 3500 },
    ],
    'TX': [
      { id: 15, name: 'UT Austin', state: 'TX', fraternities: 72, sororities: 38, totalMembers: 5800 },
      { id: 16, name: 'Texas A&M', state: 'TX', fraternities: 65, sororities: 35, totalMembers: 5200 },
      { id: 17, name: 'Rice University', state: 'TX', fraternities: 28, sororities: 20, totalMembers: 2200 },
      { id: 18, name: 'SMU', state: 'TX', fraternities: 45, sororities: 28, totalMembers: 3500 },
    ],
    'FL': [
      { id: 19, name: 'University of Florida', state: 'FL', fraternities: 65, sororities: 35, totalMembers: 5000 },
      { id: 20, name: 'Florida State', state: 'FL', fraternities: 60, sororities: 33, totalMembers: 4800 },
      { id: 21, name: 'University of Miami', state: 'FL', fraternities: 42, sororities: 25, totalMembers: 3200 },
    ],
    'IL': [
      { id: 22, name: 'Northwestern', state: 'IL', fraternities: 45, sororities: 28, totalMembers: 3500 },
      { id: 23, name: 'UIUC', state: 'IL', fraternities: 68, sororities: 36, totalMembers: 5300 },
      { id: 24, name: 'University of Chicago', state: 'IL', fraternities: 25, sororities: 18, totalMembers: 1800 },
    ],
    'GA': [
      { id: 25, name: 'University of Georgia', state: 'GA', fraternities: 63, sororities: 34, totalMembers: 4900 },
      { id: 26, name: 'Georgia Tech', state: 'GA', fraternities: 48, sororities: 26, totalMembers: 3600 },
      { id: 27, name: 'Emory University', state: 'GA', fraternities: 35, sororities: 22, totalMembers: 2500 },
    ],
    'MA': [
      { id: 28, name: 'Harvard', state: 'MA', fraternities: 32, sororities: 20, totalMembers: 2200 },
      { id: 29, name: 'MIT', state: 'MA', fraternities: 28, sororities: 18, totalMembers: 1900 },
      { id: 30, name: 'Boston University', state: 'MA', fraternities: 40, sororities: 25, totalMembers: 3000 },
    ],
    'MI': [
      { id: 31, name: 'University of Michigan', state: 'MI', fraternities: 70, sororities: 37, totalMembers: 5500 },
      { id: 32, name: 'Michigan State', state: 'MI', fraternities: 65, sororities: 34, totalMembers: 5000 },
    ],
    'OH': [
      { id: 33, name: 'Ohio State', state: 'OH', fraternities: 68, sororities: 36, totalMembers: 5400 },
      { id: 34, name: 'Miami University', state: 'OH', fraternities: 55, sororities: 30, totalMembers: 4200 },
    ],
    'NC': [
      { id: 35, name: 'Duke', state: 'NC', fraternities: 42, sororities: 25, totalMembers: 3200 },
      { id: 36, name: 'UNC Chapel Hill', state: 'NC', fraternities: 55, sororities: 32, totalMembers: 4300 },
      { id: 37, name: 'Wake Forest', state: 'NC', fraternities: 35, sororities: 20, totalMembers: 2500 },
    ],
    'VA': [
      { id: 38, name: 'University of Virginia', state: 'VA', fraternities: 58, sororities: 30, totalMembers: 4400 },
      { id: 39, name: 'Virginia Tech', state: 'VA', fraternities: 48, sororities: 26, totalMembers: 3600 },
    ],
    'IN': [
      { id: 40, name: 'Indiana University', state: 'IN', fraternities: 62, sororities: 33, totalMembers: 4800 },
      { id: 41, name: 'Purdue', state: 'IN', fraternities: 55, sororities: 28, totalMembers: 4100 },
    ],
    'WI': [
      { id: 42, name: 'University of Wisconsin', state: 'WI', fraternities: 58, sororities: 31, totalMembers: 4500 },
    ],
    'AL': [
      { id: 43, name: 'University of Alabama', state: 'AL', fraternities: 68, sororities: 35, totalMembers: 5300 },
      { id: 44, name: 'Auburn University', state: 'AL', fraternities: 55, sororities: 30, totalMembers: 4200 },
    ],
    'TN': [
      { id: 45, name: 'Vanderbilt', state: 'TN', fraternities: 42, sororities: 24, totalMembers: 3100 },
      { id: 46, name: 'University of Tennessee', state: 'TN', fraternities: 52, sororities: 28, totalMembers: 3900 },
    ],
    'SC': [
      { id: 47, name: 'Clemson', state: 'SC', fraternities: 45, sororities: 25, totalMembers: 3400 },
      { id: 48, name: 'University of South Carolina', state: 'SC', fraternities: 48, sororities: 27, totalMembers: 3600 },
    ],
    'AZ': [
      { id: 49, name: 'Arizona State', state: 'AZ', fraternities: 60, sororities: 32, totalMembers: 4600 },
      { id: 50, name: 'University of Arizona', state: 'AZ', fraternities: 55, sororities: 30, totalMembers: 4200 },
    ],
    'CO': [
      { id: 51, name: 'University of Colorado Boulder', state: 'CO', fraternities: 48, sororities: 26, totalMembers: 3600 },
      { id: 52, name: 'Colorado State', state: 'CO', fraternities: 38, sororities: 22, totalMembers: 2800 },
    ],
    'WA': [
      { id: 53, name: 'University of Washington', state: 'WA', fraternities: 52, sororities: 28, totalMembers: 3900 },
      { id: 54, name: 'Washington State', state: 'WA', fraternities: 45, sororities: 25, totalMembers: 3400 },
    ],
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedState(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedState) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !selectedState) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleStateClick = (stateId: string) => {
    const colleges = collegesByState[stateId];
    if (colleges && colleges.length > 0) {
      setSelectedState({
        id: stateId,
        name: STATE_NAMES[stateId],
        colleges
      });
    }
  };

  const getStateColor = (stateId: string) => {
    const colleges = collegesByState[stateId];
    if (!colleges || colleges.length === 0) {
      return '#e5e7eb'; // gray-200
    }
    if (colleges.length >= 5) return '#1e40af'; // blue-800
    if (colleges.length >= 3) return '#3b82f6'; // blue-500
    if (colleges.length >= 2) return '#60a5fa'; // blue-400
    return '#93c5fd'; // blue-300
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interactive US College Map</h1>
          <p className="text-gray-600 mt-2">Hover over states to see details • Click states with colleges to explore</p>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
          <span className="text-sm font-medium text-gray-600 w-16 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ml-2"
            title="Reset View"
          >
            <Maximize2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div
          className="relative h-[650px] bg-gradient-to-br from-blue-50 via-white to-gray-50"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 560 300"
            className="w-full h-full"
            onMouseDown={handleMouseDown}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transformOrigin: 'center',
              transition: isDragging ? 'none' : 'transform 0.3s ease'
            }}
          >
            {/* Ocean/Background */}
            <rect width="900" height="540" fill="#f0f9ff" />

            {/* Grid Pattern */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e7ff" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="900" height="540" fill="url(#grid)" />

            {/* States */}
            <g transform="translate(0, 20)">
              {Object.entries(US_STATES_PATHS).map(([stateId, path]) => (
                <g key={stateId}>
                  <path
                    d={path}
                    fill={getStateColor(stateId)}
                    stroke="#fff"
                    strokeWidth="1.5"
                    className={`transition-all duration-200 ${
                      collegesByState[stateId]?.length > 0 ? 'hover:brightness-110 cursor-pointer' : ''
                    }`}
                    style={{
                      filter: hoveredState?.id === stateId ? 'brightness(1.1) drop-shadow(0 4px 6px rgba(0,0,0,0.1))' : '',
                      strokeWidth: selectedState?.id === stateId ? 3 : 1.5
                    }}
                    onMouseEnter={() => setHoveredState({
                      id: stateId,
                      name: STATE_NAMES[stateId],
                      colleges: collegesByState[stateId] || []
                    })}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => handleStateClick(stateId)}
                  />
                  {/* State Labels */}
                  {STATE_CENTERS[stateId] && (
                    <text
                      x={STATE_CENTERS[stateId].x}
                      y={STATE_CENTERS[stateId].y}
                      fontSize="10"
                      fill={collegesByState[stateId]?.length > 0 ? "#fff" : "#9ca3af"}
                      fontWeight="600"
                      pointerEvents="none"
                      textAnchor="middle"
                      className="select-none"
                    >
                      {stateId}
                    </text>
                  )}
                </g>
              ))}
            </g>

            {/* Alaska and Hawaii insets */}
            <g transform="translate(50, 400)">
              <rect x="-10" y="-10" width="140" height="110" fill="#fff" stroke="#e5e7eb" strokeWidth="1" rx="4" />
              <text x="60" y="0" fontSize="8" fill="#6b7280" textAnchor="middle">Alaska</text>
              <g transform="scale(0.35)">
                <path d={US_STATES_PATHS.AK} fill={getStateColor('AK')} stroke="#fff" strokeWidth="2" />
              </g>
            </g>

            <g transform="translate(200, 450)">
              <rect x="-10" y="-10" width="100" height="60" fill="#fff" stroke="#e5e7eb" strokeWidth="1" rx="4" />
              <text x="40" y="0" fontSize="8" fill="#6b7280" textAnchor="middle">Hawaii</text>
              <g transform="translate(10, 10) scale(0.8)">
                <path d={US_STATES_PATHS.HI} fill={getStateColor('HI')} stroke="#fff" strokeWidth="2" />
              </g>
            </g>
          </svg>

          {/* Hover Info */}
          {hoveredState && !selectedState && (
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl p-4 max-w-xs pointer-events-none z-10">
              <h3 className="font-bold text-gray-900 text-lg">{hoveredState.name}</h3>
              {hoveredState.colleges.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 mt-1">
                    {hoveredState.colleges.length} {hoveredState.colleges.length === 1 ? 'college' : 'colleges'} with Greek life
                  </p>
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <p>Total Chapters: {hoveredState.colleges.reduce((sum, c) => sum + c.fraternities + c.sororities, 0)}</p>
                    <p>Total Members: {hoveredState.colleges.reduce((sum, c) => sum + c.totalMembers, 0).toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-primary-600 mt-2 font-medium">Click to see details</p>
                </>
              ) : (
                <p className="text-sm text-gray-500 mt-1">No college data available</p>
              )}
            </div>
          )}

          {/* Selected State Details */}
          {selectedState && (
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-2xl p-6 max-w-md max-h-[600px] overflow-y-auto">
              <button
                onClick={() => setSelectedState(null)}
                className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedState.name}</h2>
              <p className="text-sm text-gray-600 mb-4">
                {selectedState.colleges.length} colleges with Greek life programs
              </p>

              <div className="space-y-3">
                {selectedState.colleges.map((college) => (
                  <div key={college.id} className="border-l-4 border-primary-500 pl-4 py-3 hover:bg-gray-50 rounded-r">
                    <h3 className="font-semibold text-gray-900">{college.name}</h3>
                    <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                      <div className="text-center">
                        <p className="text-gray-600">Fraternities</p>
                        <p className="font-bold text-blue-600">{college.fraternities}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Sororities</p>
                        <p className="font-bold text-pink-600">{college.sororities}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Members</p>
                        <p className="font-bold text-green-600">{college.totalMembers.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t bg-gray-50 -mx-6 px-6 -mb-6 pb-6">
                <h4 className="font-semibold text-gray-900 mb-3">State Totals</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Chapters</p>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedState.colleges.reduce((sum, c) => sum + c.fraternities + c.sororities, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Members</p>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedState.colleges.reduce((sum, c) => sum + c.totalMembers, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats and Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Legend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Map Legend
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-800 rounded"></div>
              <span className="text-sm text-gray-600">5+ Colleges</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">3-4 Colleges</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-400 rounded"></div>
              <span className="text-sm text-gray-600">2 Colleges</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-300 rounded"></div>
              <span className="text-sm text-gray-600">1 College</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <span className="text-sm text-gray-600">No Data</span>
            </div>
          </div>
        </div>

        {/* National Statistics */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="w-4 h-4 mr-2" />
            National Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">States with Data</span>
              <span className="text-sm font-bold text-gray-900">
                {Object.keys(collegesByState).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Colleges</span>
              <span className="text-sm font-bold text-gray-900">
                {Object.values(collegesByState).flat().length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Chapters</span>
              <span className="text-sm font-bold text-gray-900">
                {Object.values(collegesByState).flat().reduce((sum, c) => sum + c.fraternities + c.sororities, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Members</span>
              <span className="text-sm font-bold text-gray-900">
                {Object.values(collegesByState).flat().reduce((sum, c) => sum + c.totalMembers, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Top States */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Top States by Colleges
          </h3>
          <div className="space-y-2">
            {Object.entries(collegesByState)
              .map(([stateId, colleges]) => ({
                id: stateId,
                name: STATE_NAMES[stateId],
                count: colleges.length
              }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map(state => (
                <div key={state.id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{state.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-primary-600">{state.count}</span>
                    <span className="text-xs text-gray-500">colleges</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;