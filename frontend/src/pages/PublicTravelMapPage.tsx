import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import travelMapData from '../data/travelMapData.json';
import axios from 'axios';

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  chapter: string;
  age: number | null;
  birthday: string | null;
  birthday_today: boolean;
  current_location: {
    name: string;
    state: string;
    lat: number;
    lng: number;
  };
  home_location: {
    city: string;
    state: string;
    lat: number;
    lng: number;
  };
}

interface Route {
  member_id: number;
  from_lat: number;
  from_lng: number;
  from_state: string;
  to_lat: number;
  to_lng: number;
  to_state: string;
  age: number | null;
}

interface MapData {
  members: Member[];
  universities: any[];
  routes: Route[];
}

const PublicTravelMapPage = () => {
  const { token } = useParams<{ token: string }>();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDatabase, setShowDatabase] = useState(false);
  const [filters, setFilters] = useState({
    under21: true,
    over21: true,
    fromState: 'all',
    toState: 'all',
    showUniversities: true,
    showHomes: true,
  });
  const [dbFilters, setDbFilters] = useState({
    under21: true,
    over21: true,
    fromState: 'all',
    toState: 'all',
  });
  const [dbSortColumn, setDbSortColumn] = useState('home');
  const [dbSortDirection, setDbSortDirection] = useState<'asc' | 'desc'>('asc');

  const mapData = travelMapData as MapData;

  // Check if user has already submitted email (stored in localStorage)
  useEffect(() => {
    const storedAccess = localStorage.getItem(`travel-map-access-${token}`);
    if (storedAccess === 'granted') {
      setHasAccess(true);
    }
  }, [token]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Save email to backend
      await axios.post(`${import.meta.env.VITE_API_URL}/travel-map/submit-email`, {
        email,
        token,
        timestamp: new Date().toISOString(),
      });

      // Grant access and store in localStorage
      localStorage.setItem(`travel-map-access-${token}`, 'granted');
      setHasAccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render map (always render, but blur when no access)
  useEffect(() => {
    if (!svgRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight - 80;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const zoomGroup = svg.append('g');

    const projection = d3.geoAlbersUsa()
      .translate([width / 2, height / 2])
      .scale(1000);

    const path = d3.geoPath().projection(projection);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8])
      .on('zoom', (event) => {
        zoomGroup.attr('transform', event.transform);

        const scale = event.transform.k;
        const nodeSizeFactor = Math.max(0.3, 1 / Math.sqrt(scale));

        zoomGroup.selectAll('.home-node').each(function() {
          const baseR = d3.select(this).attr('data-base-r');
          if (baseR) {
            d3.select(this).attr('r', parseFloat(baseR) * nodeSizeFactor);
          }
        });

        zoomGroup.selectAll('.university-node').each(function() {
          const baseR = d3.select(this).attr('data-base-r');
          if (baseR) {
            d3.select(this).attr('r', parseFloat(baseR) * nodeSizeFactor);
          }
        });
      });

    svg.call(zoom);

    // Load and render US map
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(response => response.json())
      .then(us => {
        const states = topojson.feature(us, us.objects.states) as any;

        zoomGroup.append('g')
          .attr('class', 'states')
          .selectAll('path')
          .data(states.features)
          .join('path')
          .attr('d', path)
          .attr('fill', '#1a1e3e')
          .attr('stroke', '#00ffff')
          .attr('stroke-width', 0.5)
          .attr('opacity', 0.3)
          .attr('cursor', 'pointer')
          .on('click', function(event, d: any) {
            event.stopPropagation();
            const bounds = path.bounds(d);
            const dx = bounds[1][0] - bounds[0][0];
            const dy = bounds[1][1] - bounds[0][1];
            const x = (bounds[0][0] + bounds[1][0]) / 2;
            const y = (bounds[0][1] + bounds[1][1]) / 2;
            const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
            const translate = [width / 2 - scale * x, height / 2 - scale * y];

            svg.transition()
              .duration(750)
              .call(
                zoom.transform as any,
                d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
              );
          })
          .on('mouseenter', function() {
            d3.select(this)
              .attr('opacity', 0.5)
              .attr('stroke-width', 1.5);
          })
          .on('mouseleave', function() {
            d3.select(this)
              .attr('opacity', 0.3)
              .attr('stroke-width', 0.5);
          });

        renderVisualization();
      });

    const renderVisualization = () => {
      zoomGroup.selectAll('.route-line, .home-node, .university-node').remove();

      const filteredMembers = mapData.members.filter(member => {
        if (!filters.under21 && (member.age === null || member.age < 21)) return false;
        if (!filters.over21 && member.age !== null && member.age >= 21) return false;
        if (filters.fromState !== 'all' && member.home_location.state !== filters.fromState) return false;
        if (filters.toState !== 'all' && member.current_location.state !== filters.toState) return false;
        return true;
      });

      const filteredRoutes = mapData.routes.filter(route => {
        const member = mapData.members.find(m => m.id === route.member_id);
        if (!member) return false;
        if (!filters.under21 && (route.age === null || route.age < 21)) return false;
        if (!filters.over21 && route.age !== null && route.age >= 21) return false;
        if (filters.fromState !== 'all' && route.from_state !== filters.fromState) return false;
        if (filters.toState !== 'all' && route.to_state !== filters.toState) return false;
        return true;
      });

      // Draw routes (very translucent)
      filteredRoutes.forEach(route => {
        const fromCoords = projection([route.from_lng, route.from_lat]);
        const toCoords = projection([route.to_lng, route.to_lat]);

        if (fromCoords && toCoords) {
          zoomGroup.append('path')
            .attr('d', `M${fromCoords[0]},${fromCoords[1]} L${toCoords[0]},${toCoords[1]}`)
            .attr('stroke', route.age && route.age >= 21 ? '#00d9ff' : '#ff006e')
            .attr('stroke-width', 1)
            .attr('opacity', 0.15)
            .attr('fill', 'none')
            .attr('pointer-events', 'none')
            .lower();
        }
      });

      // Draw universities
      if (filters.showUniversities) {
        const universityData: { [key: string]: any } = {};
        filteredMembers.forEach(member => {
          const chapterId = member.current_location.name;
          if (!universityData[chapterId]) {
            universityData[chapterId] = {
              ...member.current_location,
              members: []
            };
          }
          universityData[chapterId].members.push(member);
        });

        Object.values(universityData).forEach((uni: any) => {
          const coords = projection([uni.lng, uni.lat]);
          if (coords) {
            const uniGroup = zoomGroup.append('g');

            uniGroup.append('circle')
              .attr('class', 'university-node')
              .attr('cx', coords[0])
              .attr('cy', coords[1])
              .attr('r', 10)
              .attr('data-base-r', 10)
              .attr('fill', '#0099ff')
              .attr('stroke', '#00d9ff')
              .attr('stroke-width', 2)
              .style('cursor', 'pointer')
              .on('mouseenter', function(event) {
                d3.select(this)
                  .attr('fill', '#00d9ff')
                  .attr('stroke-width', 3);

                const tooltip = d3.select('body').append('div')
                  .attr('class', 'tooltip')
                  .style('position', 'absolute')
                  .style('background', 'rgba(0, 0, 0, 0.9)')
                  .style('color', '#00ffff')
                  .style('padding', '12px')
                  .style('border-radius', '8px')
                  .style('border', '1px solid #00ffff')
                  .style('pointer-events', 'none')
                  .style('font-family', 'monospace')
                  .style('font-size', '14px')
                  .style('z-index', '10000')
                  .html(`
                    <div><strong>${uni.name}</strong></div>
                    <div>Members: ${uni.members.length}</div>
                  `)
                  .style('left', (event.pageX + 10) + 'px')
                  .style('top', (event.pageY - 10) + 'px');
              })
              .on('mouseleave', function() {
                d3.select(this)
                  .attr('fill', '#0099ff')
                  .attr('stroke-width', 2);
                d3.selectAll('.tooltip').remove();
              });
          }
        });
      }

      // Draw home locations
      if (filters.showHomes) {
        const homeLocations: { [key: string]: any } = {};
        filteredMembers.forEach(member => {
          const key = `${member.home_location.city}_${member.home_location.state}`;
          if (!homeLocations[key]) {
            homeLocations[key] = {
              ...member.home_location,
              members: []
            };
          }
          homeLocations[key].members.push(member);
        });

        Object.values(homeLocations).forEach((loc: any) => {
          const coords = projection([loc.lng, loc.lat]);
          if (coords) {
            const homeGroup = zoomGroup.append('g');

            homeGroup.append('circle')
              .attr('class', 'home-node')
              .attr('cx', coords[0])
              .attr('cy', coords[1])
              .attr('r', 8)
              .attr('data-base-r', 8)
              .attr('fill', '#ff1a75')
              .attr('stroke', '#ff4d94')
              .attr('stroke-width', 1.5)
              .style('cursor', 'pointer')
              .on('mouseenter', function(event) {
                d3.select(this)
                  .attr('fill', '#ff4d94')
                  .attr('stroke-width', 2);

                const tooltip = d3.select('body').append('div')
                  .attr('class', 'tooltip')
                  .style('position', 'absolute')
                  .style('background', 'rgba(0, 0, 0, 0.9)')
                  .style('color', '#ff4d94')
                  .style('padding', '12px')
                  .style('border-radius', '8px')
                  .style('border', '1px solid #ff4d94')
                  .style('pointer-events', 'none')
                  .style('font-family', 'monospace')
                  .style('font-size', '14px')
                  .style('z-index', '10000')
                  .html(`
                    <div><strong>${loc.city}, ${loc.state}</strong></div>
                    <div>Members: ${loc.members.length}</div>
                  `)
                  .style('left', (event.pageX + 10) + 'px')
                  .style('top', (event.pageY - 10) + 'px');
              })
              .on('mouseleave', function() {
                d3.select(this)
                  .attr('fill', '#ff1a75')
                  .attr('stroke-width', 1.5);
                d3.selectAll('.tooltip').remove();
              });
          }
        });
      }
    };
  }, [filters]);

  // Get filtered members for database
  const getFilteredMembers = () => {
    return mapData.members.filter(member => {
      if (!dbFilters.under21 && (member.age === null || member.age < 21)) return false;
      if (!dbFilters.over21 && member.age !== null && member.age >= 21) return false;
      if (dbFilters.fromState !== 'all' && member.home_location.state !== dbFilters.fromState) return false;
      if (dbFilters.toState !== 'all' && member.current_location.state !== dbFilters.toState) return false;
      return true;
    });
  };

  const getSortedMembers = () => {
    const filtered = getFilteredMembers();
    return [...filtered].sort((a, b) => {
      let aVal: any, bVal: any;

      switch (dbSortColumn) {
        case 'name':
          aVal = `${a.first_name} ${a.last_name}`;
          bVal = `${b.first_name} ${b.last_name}`;
          break;
        case 'age':
          aVal = a.age ?? -1;
          bVal = b.age ?? -1;
          break;
        case 'home':
          aVal = `${a.home_location.city}, ${a.home_location.state}`;
          bVal = `${b.home_location.city}, ${b.home_location.state}`;
          break;
        case 'university':
          aVal = a.current_location.name;
          bVal = b.current_location.name;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return dbSortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return dbSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Get all unique states and sort them
  const allStates = Array.from(new Set(mapData.members.map(m => m.home_location.state))).sort();

  // Priority states at the top
  const priorityStates = ['Michigan', 'New Jersey', 'Pennsylvania'];
  const otherStates = allStates.filter(state => !priorityStates.includes(state));
  const states = [...priorityStates.filter(state => allStates.includes(state)), ...otherStates];

  // Main map UI with overlay
  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1e3e] overflow-hidden">
      {/* Email Gate Overlay */}
      {!hasAccess && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center backdrop-blur-sm bg-[#0a0e27]/70">
          <div className="max-w-md w-full mx-4 bg-[#1a1e3e]/95 border-2 border-[#00ffff] rounded-xl p-8 shadow-2xl">
            <h1 className="text-3xl font-bold text-[#00ffff] text-center mb-2">
              🗺️ College Roster & Travel Map
            </h1>
            <p className="text-gray-300 text-center mb-6">
              Enter your email to view the interactive travel map
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 bg-[#0a0e27] border border-[#00ffff]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ffff] transition-colors"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00ffff] text-[#0a0e27] font-bold py-3 px-6 rounded-lg hover:bg-[#00d9ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'View Map →'}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              Your email will only be used to track map viewers
            </p>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <h1 className="text-3xl font-bold text-[#00ffff] text-center drop-shadow-lg tracking-wider">
          COLLEGE ROSTER AND TRAVEL MAP
        </h1>
      </div>

      {/* Database Toggle Button */}
      {hasAccess && (
        <button
          onClick={() => setShowDatabase(!showDatabase)}
          className="absolute top-16 right-4 z-50 bg-[#00ffff] text-[#0a0e27] px-6 py-2 rounded-lg font-bold hover:bg-[#00d9ff] transition-colors shadow-lg"
        >
          {showDatabase ? '✕ Close Database' : '📊 View Database'}
        </button>
      )}

      {/* Database Panel */}
      {showDatabase && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[1400px] max-h-[85vh] bg-[#1a1e3e] border-2 border-[#00ffff] rounded-xl p-5 z-40 shadow-2xl overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#00ffff]">Member Database</h2>
            <button
              onClick={() => setShowDatabase(false)}
              className="text-[#00ffff] hover:text-white text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Database Filters */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-[#00ffff] text-sm mb-2">From State</label>
              <select
                value={dbFilters.fromState}
                onChange={(e) => setDbFilters({ ...dbFilters, fromState: e.target.value })}
                className="w-full bg-[#0a0e27] text-white border border-[#00ffff]/30 rounded px-3 py-2"
              >
                <option value="all">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#00ffff] text-sm mb-2">To State</label>
              <select
                value={dbFilters.toState}
                onChange={(e) => setDbFilters({ ...dbFilters, toState: e.target.value })}
                className="w-full bg-[#0a0e27] text-white border border-[#00ffff]/30 rounded px-3 py-2"
              >
                <option value="all">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <label className="flex items-center text-white text-sm">
                <input
                  type="checkbox"
                  checked={dbFilters.under21}
                  onChange={(e) => setDbFilters({ ...dbFilters, under21: e.target.checked })}
                  className="mr-2"
                />
                20 & Under
              </label>
            </div>

            <div className="flex items-end gap-2">
              <label className="flex items-center text-white text-sm">
                <input
                  type="checkbox"
                  checked={dbFilters.over21}
                  onChange={(e) => setDbFilters({ ...dbFilters, over21: e.target.checked })}
                  className="mr-2"
                />
                21+ 👑
              </label>
            </div>
          </div>

          {/* Database Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-white text-sm">
              <thead className="sticky top-0 bg-[#0a0e27]">
                <tr className="border-b border-[#00ffff]">
                  <th
                    className="px-4 py-2 text-left cursor-pointer hover:text-[#00ffff]"
                    onClick={() => {
                      setDbSortColumn('name');
                      setDbSortDirection(dbSortDirection === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Name {dbSortColumn === 'name' && (dbSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer hover:text-[#00ffff]"
                    onClick={() => {
                      setDbSortColumn('age');
                      setDbSortDirection(dbSortDirection === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Age {dbSortColumn === 'age' && (dbSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer hover:text-[#00ffff]"
                    onClick={() => {
                      setDbSortColumn('home');
                      setDbSortDirection(dbSortDirection === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Home Location {dbSortColumn === 'home' && (dbSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer hover:text-[#00ffff]"
                    onClick={() => {
                      setDbSortColumn('university');
                      setDbSortDirection(dbSortDirection === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    University {dbSortColumn === 'university' && (dbSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {getSortedMembers().map(member => (
                  <tr key={member.id} className="border-b border-[#00ffff]/20 hover:bg-[#0a0e27]/50">
                    <td className="px-4 py-2">{member.first_name} {member.last_name}</td>
                    <td className="px-4 py-2">{member.age ?? 'N/A'}</td>
                    <td className="px-4 py-2">{member.home_location.city}, {member.home_location.state}</td>
                    <td className="px-4 py-2">{member.current_location.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-[#00ffff] text-center">
            Showing {getSortedMembers().length} of {mapData.members.length} members
          </div>
        </div>
      )}

      {/* Controls Panel */}
      {hasAccess && (
        <div className="absolute top-24 left-4 bg-[#1a1e3e]/95 border-2 border-[#00ffff] rounded-xl p-4 z-30 max-w-xs shadow-xl">
          <h3 className="text-[#00ffff] font-bold text-lg mb-4">Controls</h3>

          <div className="space-y-4">
          <div>
            <h4 className="text-white font-semibold mb-2">Age Groups</h4>
            <label className="flex items-center text-white text-sm mb-2">
              <input
                type="checkbox"
                checked={filters.under21}
                onChange={(e) => setFilters({ ...filters, under21: e.target.checked })}
                className="mr-2"
              />
              20 and Under
            </label>
            <label className="flex items-center text-white text-sm">
              <input
                type="checkbox"
                checked={filters.over21}
                onChange={(e) => setFilters({ ...filters, over21: e.target.checked })}
                className="mr-2"
              />
              21+ 👑
            </label>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Node Visibility</h4>
            <label className="flex items-center text-white text-sm mb-2">
              <input
                type="checkbox"
                checked={filters.showUniversities}
                onChange={(e) => setFilters({ ...filters, showUniversities: e.target.checked })}
                className="mr-2"
              />
              🔵 Universities
            </label>
            <label className="flex items-center text-white text-sm">
              <input
                type="checkbox"
                checked={filters.showHomes}
                onChange={(e) => setFilters({ ...filters, showHomes: e.target.checked })}
                className="mr-2"
              />
              🔴 Home Locations
            </label>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">State Filters</h4>
            <label className="block text-white text-xs mb-1">From State</label>
            <select
              value={filters.fromState}
              onChange={(e) => setFilters({ ...filters, fromState: e.target.value })}
              className="w-full bg-[#0a0e27] text-white border border-[#00ffff]/30 rounded px-2 py-1 text-sm mb-2"
            >
              <option value="all">All States</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <label className="block text-white text-xs mb-1">To State</label>
            <select
              value={filters.toState}
              onChange={(e) => setFilters({ ...filters, toState: e.target.value })}
              className="w-full bg-[#0a0e27] text-white border border-[#00ffff]/30 rounded px-2 py-1 text-sm"
            >
              <option value="all">All States</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      {hasAccess && (
        <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-30">
          <button
          onClick={() => {
            const svg = d3.select(svgRef.current);
            svg.transition().call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.5);
          }}
          className="bg-[#00ffff] text-[#0a0e27] w-12 h-12 rounded-lg font-bold text-2xl hover:bg-[#00d9ff] transition-colors shadow-lg"
        >
          +
          </button>
          <button
            onClick={() => {
              const svg = d3.select(svgRef.current);
              svg.transition().call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 0.67);
            }}
            className="bg-[#00ffff] text-[#0a0e27] w-12 h-12 rounded-lg font-bold text-2xl hover:bg-[#00d9ff] transition-colors shadow-lg"
          >
            −
          </button>
          <button
            onClick={() => {
              const svg = d3.select(svgRef.current);
              svg.transition().call(d3.zoom<SVGSVGElement, unknown>().transform as any, d3.zoomIdentity);
            }}
            className="bg-[#00ffff] text-[#0a0e27] w-12 h-12 rounded-lg font-bold text-xl hover:bg-[#00d9ff] transition-colors shadow-lg"
          >
            ⟲
          </button>
        </div>
      )}

      {/* SVG Map */}
      <svg
        ref={svgRef}
        className="w-full h-full transition-all duration-500"
        style={{
          filter: !hasAccess ? 'blur(4px) brightness(0.7)' : 'none',
          pointerEvents: !hasAccess ? 'none' : 'auto'
        }}
      />
    </div>
  );
};

export default PublicTravelMapPage;
