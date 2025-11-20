import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import travelMapData from '../data/travelMapData.json';

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

const TravelMapPage = () => {
  const svgRef = useRef<SVGSVGElement>(null);
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

  useEffect(() => {
    if (!svgRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight - 80; // Account for header

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

        zoomGroup.selectAll('.route-line').attr('stroke-width', 1 * nodeSizeFactor);
      });

    svg.call(zoom as any);

    // Load US map
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(response => response.json())
      .then(us => {
        const usStates = topojson.feature(us, us.objects.states as any);

        zoomGroup.selectAll('.state-boundary')
          .data((usStates as any).features)
          .enter()
          .append('path')
          .attr('class', 'state-boundary')
          .attr('d', path as any)
          .style('fill', 'rgba(0, 50, 100, 0.3)')
          .style('stroke', 'rgba(0, 255, 255, 0.2)')
          .style('stroke-width', '0.5px')
          .style('cursor', 'pointer');

        renderVisualization();
      });

    function renderVisualization() {
      const filteredMembers = mapData.members.filter(m => {
        if (m.age !== null) {
          if (m.age < 21 && !filters.under21) return false;
          if (m.age >= 21 && !filters.over21) return false;
        }
        if (filters.fromState !== 'all' && m.current_location.state !== filters.fromState) return false;
        if (filters.toState !== 'all' && m.home_location.state !== filters.toState) return false;
        return true;
      });

      const filteredMemberIds = new Set(filteredMembers.map(m => m.id));
      const filteredRoutes = mapData.routes.filter(r => filteredMemberIds.has(r.member_id));

      zoomGroup.selectAll('.route-line').remove();
      zoomGroup.selectAll('.home-node').remove();
      zoomGroup.selectAll('.university-node').remove();

      // Draw routes
      filteredRoutes.forEach(route => {
        const fromCoords = projection([route.from_lng, route.from_lat]);
        const toCoords = projection([route.to_lng, route.to_lat]);

        if (fromCoords && toCoords) {
          zoomGroup.append('path')
            .attr('class', 'route-line')
            .attr('d', `M${fromCoords[0]},${fromCoords[1]} L${toCoords[0]},${toCoords[1]}`)
            .attr('stroke', route.age && route.age >= 21 ? '#00d9ff' : '#ff006e')
            .style('fill', 'none')
            .style('stroke-width', '1px')
            .style('opacity', '0.15')
            .style('pointer-events', 'none');
        }
      });

      // Draw home locations
      if (filters.showHomes) {
        const homeLocations: any = {};
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
            zoomGroup.append('circle')
              .attr('class', 'home-node')
              .attr('cx', coords[0])
              .attr('cy', coords[1])
              .attr('r', Math.min(4 + loc.members.length * 0.5, 10))
              .attr('data-base-r', Math.min(4 + loc.members.length * 0.5, 10))
              .style('fill', '#ff006e')
              .style('stroke', '#fff')
              .style('stroke-width', '1px')
              .style('cursor', 'pointer');
          }
        });
      }

      // Draw universities
      if (filters.showUniversities) {
        const universityData: any = {};
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
            zoomGroup.append('circle')
              .attr('class', 'university-node')
              .attr('cx', coords[0])
              .attr('cy', coords[1])
              .attr('r', 10)
              .attr('data-base-r', 10)
              .style('fill', '#00b4d8')
              .style('stroke', '#fff')
              .style('stroke-width', '2px')
              .style('cursor', 'pointer');
          }
        });
      }
    }
  }, [filters]);

  const formatName = (firstName: string, lastName: string) => {
    return `${firstName} ${lastName.charAt(0)}.`;
  };

  const getFilteredMembers = () => {
    return mapData.members.filter(m => {
      if (m.age !== null) {
        if (m.age < 21 && !dbFilters.under21) return false;
        if (m.age >= 21 && !dbFilters.over21) return false;
      }
      if (dbFilters.fromState !== 'all' && m.current_location.state !== dbFilters.fromState) return false;
      if (dbFilters.toState !== 'all' && m.home_location.state !== dbFilters.toState) return false;
      return true;
    }).sort((a, b) => {
      let valA: any, valB: any;

      switch(dbSortColumn) {
        case 'name':
          valA = `${a.last_name} ${a.first_name}`.toLowerCase();
          valB = `${b.last_name} ${b.first_name}`.toLowerCase();
          break;
        case 'college':
          valA = a.current_location.state;
          valB = b.current_location.state;
          break;
        case 'home':
          valA = a.home_location.state;
          valB = b.home_location.state;
          break;
        case 'age':
          valA = a.age || 0;
          valB = b.age || 0;
          break;
        default:
          return 0;
      }

      if (valA < valB) return dbSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return dbSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const generateFakeBirthday = (id: number) => {
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const fakeMonth = months[id % 12];
    const fakeDay = String((id % 28) + 1).padStart(2, '0');
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - 20;
    return `${fakeMonth}/${fakeDay}/${birthYear}`;
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1e3e]">
      {/* Title */}
      <div className="absolute top-5 left-5 z-10">
        <h1 className="text-3xl font-bold text-[#00ffff] uppercase tracking-[4px]">
          College Roster and Travel Map
        </h1>
      </div>

      {/* Database Toggle */}
      <button
        onClick={() => setShowDatabase(!showDatabase)}
        className="absolute top-5 left-1/2 transform -translate-x-1/2 z-[1001] bg-[rgba(26,30,62,0.95)] border-2 border-[#00ffff] rounded-lg px-5 py-2.5 text-[#00ffff] font-bold uppercase tracking-wider hover:bg-[rgba(0,255,255,0.2)] transition-all"
      >
        📊 View Database
      </button>

      {/* Database Panel */}
      {showDatabase && (
        <div className="absolute top-[70px] left-1/2 transform -translate-x-1/2 w-[90%] max-w-[1400px] max-h-[85vh] bg-[rgba(26,30,62,0.98)] border-2 border-[#00ffff] rounded-xl p-5 z-[1000] flex flex-col">
          <button
            onClick={() => setShowDatabase(false)}
            className="absolute top-4 right-4 bg-[rgba(255,0,110,0.8)] border border-white text-white px-4 py-2 rounded-md font-bold hover:bg-[rgba(255,0,110,1)]"
          >
            ✕ Close
          </button>

          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h2 className="text-xl text-[#00ffff] uppercase tracking-wider font-bold">Member Database</h2>
            <span className="text-[#00ffff] font-bold">{getFilteredMembers().length} members</span>
          </div>

          <div className="flex gap-5 items-center flex-wrap mb-4">
            <div className="flex gap-2.5 items-center">
              <label className="text-[#00cccc] text-xs uppercase font-bold">Age:</label>
              <label className="flex items-center gap-1 px-3 py-1.5 bg-[rgba(0,50,100,0.3)] border border-[#00ffff] rounded cursor-pointer">
                <input type="checkbox" checked={dbFilters.under21} onChange={(e) => setDbFilters({...dbFilters, under21: e.target.checked})} className="w-4 h-4" />
                <span className="text-white text-sm">20 & Under</span>
              </label>
              <label className="flex items-center gap-1 px-3 py-1.5 bg-[rgba(0,50,100,0.3)] border border-[#00ffff] rounded cursor-pointer">
                <input type="checkbox" checked={dbFilters.over21} onChange={(e) => setDbFilters({...dbFilters, over21: e.target.checked})} className="w-4 h-4" />
                <span className="text-white text-sm">21+ 👑</span>
              </label>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-[rgba(0,180,216,0.95)] z-10">
                <tr>
                  <th className="p-3 text-left text-white font-bold uppercase tracking-wider cursor-pointer" onClick={() => {setDbSortColumn('name'); setDbSortDirection(dbSortDirection === 'asc' ? 'desc' : 'asc')}}>Name {dbSortColumn === 'name' && (dbSortDirection === 'asc' ? '▲' : '▼')}</th>
                  <th className="p-3 text-left text-white font-bold uppercase tracking-wider cursor-pointer" onClick={() => {setDbSortColumn('college'); setDbSortDirection(dbSortDirection === 'asc' ? 'desc' : 'asc')}}>College State {dbSortColumn === 'college' && (dbSortDirection === 'asc' ? '▲' : '▼')}</th>
                  <th className="p-3 text-left text-white font-bold uppercase tracking-wider cursor-pointer" onClick={() => {setDbSortColumn('home'); setDbSortDirection(dbSortDirection === 'asc' ? 'desc' : 'asc')}}>Home State {dbSortColumn === 'home' && (dbSortDirection === 'asc' ? '▲' : '▼')}</th>
                  <th className="p-3 text-left text-white font-bold uppercase tracking-wider cursor-pointer" onClick={() => {setDbSortColumn('age'); setDbSortDirection(dbSortDirection === 'asc' ? 'desc' : 'asc')}}>Age {dbSortColumn === 'age' && (dbSortDirection === 'asc' ? '▲' : '▼')}</th>
                  <th className="p-3 text-left text-white font-bold uppercase tracking-wider">Birthday</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredMembers().map(member => (
                  <tr key={member.id} className="border-b border-[rgba(0,255,255,0.2)] hover:bg-[rgba(0,255,255,0.1)]">
                    <td className="p-2.5 text-[#e0e0e0]">
                      {formatName(member.first_name, member.last_name)}
                      {member.age && member.age >= 21 && <span className="ml-1.5">👑</span>}
                    </td>
                    <td className="p-2.5 text-[#e0e0e0]">{member.current_location.state}</td>
                    <td className="p-2.5 text-[#e0e0e0]">{member.home_location.state}</td>
                    <td className="p-2.5 text-[#e0e0e0]">{member.age || 'N/A'}</td>
                    <td className="p-2.5 text-[#e0e0e0] blur-sm opacity-60">{generateFakeBirthday(member.id)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Controls Panel */}
      <div className="absolute top-5 right-5 bg-[rgba(26,30,62,0.95)] border-2 border-[#00ffff] rounded-xl p-5 min-w-[300px] max-h-[90vh] overflow-y-auto z-10">
        <h2 className="mb-4 text-[#00ffff] text-lg uppercase tracking-wider border-b-2 border-[#00ffff] pb-2">Filters</h2>

        <div className="mb-5">
          <h3 className="text-sm text-[#00cccc] mb-2.5 uppercase tracking-wide">Age Groups</h3>
          <label className="flex items-center mb-2.5 cursor-pointer p-2 rounded hover:bg-[rgba(0,255,255,0.1)]">
            <input type="checkbox" checked={filters.under21} onChange={(e) => setFilters({...filters, under21: e.target.checked})} className="w-4.5 h-4.5 mr-2.5 cursor-pointer" />
            <span className="text-sm text-[#e0e0e0]">20 and Under</span>
          </label>
          <label className="flex items-center mb-2.5 cursor-pointer p-2 rounded hover:bg-[rgba(0,255,255,0.1)]">
            <input type="checkbox" checked={filters.over21} onChange={(e) => setFilters({...filters, over21: e.target.checked})} className="w-4.5 h-4.5 mr-2.5 cursor-pointer" />
            <span className="text-sm text-[#e0e0e0]">21+ 👑</span>
          </label>
        </div>

        <div className="mb-5">
          <h3 className="text-sm text-[#00cccc] mb-2.5 uppercase tracking-wide">Node Visibility</h3>
          <label className="flex items-center mb-2.5 cursor-pointer p-2 rounded hover:bg-[rgba(0,255,255,0.1)]">
            <input type="checkbox" checked={filters.showUniversities} onChange={(e) => setFilters({...filters, showUniversities: e.target.checked})} className="w-4.5 h-4.5 mr-2.5 cursor-pointer" />
            <span className="text-sm text-[#e0e0e0]">🔵 Universities</span>
          </label>
          <label className="flex items-center mb-2.5 cursor-pointer p-2 rounded hover:bg-[rgba(0,255,255,0.1)]">
            <input type="checkbox" checked={filters.showHomes} onChange={(e) => setFilters({...filters, showHomes: e.target.checked})} className="w-4.5 h-4.5 mr-2.5 cursor-pointer" />
            <span className="text-sm text-[#e0e0e0]">🔴 Home Locations</span>
          </label>
        </div>

        <div className="mt-5 pt-5 border-t border-[rgba(0,255,255,0.3)]">
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-[#00cccc]">Total Members:</span>
            <span className="text-white font-bold">{mapData.members.length}</span>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-8 left-5 flex flex-col gap-2.5 z-10">
        <button className="w-12 h-12 bg-[rgba(26,30,62,0.95)] border-2 border-[#00ffff] rounded-lg text-[#00ffff] text-2xl cursor-pointer flex items-center justify-center hover:bg-[rgba(0,255,255,0.2)]">+</button>
        <button className="w-12 h-12 bg-[rgba(26,30,62,0.95)] border-2 border-[#00ffff] rounded-lg text-[#00ffff] text-xl cursor-pointer flex items-center justify-center hover:bg-[rgba(0,255,255,0.2)]">⟲</button>
        <button className="w-12 h-12 bg-[rgba(26,30,62,0.95)] border-2 border-[#00ffff] rounded-lg text-[#00ffff] text-2xl cursor-pointer flex items-center justify-center hover:bg-[rgba(0,255,255,0.2)]">−</button>
      </div>

      {/* SVG Map */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ background: 'radial-gradient(circle at center, #1a1e3e 0%, #0a0e27 100%)' }}
      />
    </div>
  );
};

export default TravelMapPage;
