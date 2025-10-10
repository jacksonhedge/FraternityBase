import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, GraduationCap, Users, MapPin, Calendar, TrendingUp, Building2, Award, Grid, List, ChevronRight, Filter } from 'lucide-react';
import { getCollegeLogoWithFallback } from '../utils/collegeLogos';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface College {
  id: string;
  name: string;
  location: string;
  state: string;
  division: string;
  conference: string;
  students: number;
  greekLife: number;
  greekPercentage: number;
  greekMembers: number;
  image: string;
  chapter_count: number;
  logo_url?: string;
  topOrgs?: string[];
  nextEvent?: string;
  partnershipOpportunities?: number;
  avgDealSize?: string;
}

const CollegesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedDivision, setSelectedDivision] = useState('Power 5');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch colleges from database
  useEffect(() => {
    console.log('🏛️ [CollegesPage] Component mounted, fetching colleges from database...');

    const fetchColleges = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('🔐 [CollegesPage] Auth token found, making authenticated request');
        } else {
          console.log('⚠️ [CollegesPage] No auth token found, making unauthenticated request');
        }

        console.log(`🌐 [CollegesPage] Fetching from: ${API_URL}/admin/universities`);
        const res = await fetch(`${API_URL}/admin/universities`, { headers });
        const data = await res.json();

        console.log(`📊 [CollegesPage] API Response:`, {
          success: data.success,
          dataCount: data.data?.length || 0,
          status: res.status
        });

        if (data.success && data.data) {
          const formattedColleges = data.data.map((uni: any) => ({
            id: uni.id,
            name: uni.name,
            location: uni.state,
            state: uni.state,
            division: 'Division I', // Can be enhanced later
            conference: uni.conference || 'Independent',
            students: uni.student_count || 0,
            greekLife: uni.chapter_count || 0,
            greekPercentage: uni.greek_percentage || 15, // Default to 15% if not available
            greekMembers: uni.greek_members || 0,
            image: uni.logo_url || getCollegeLogoWithFallback(uni.name),
            chapter_count: uni.chapter_count || 0,
            logo_url: uni.logo_url,
            partnershipOpportunities: uni.chapter_count // Just show chapter count as opportunities
          }));

          console.log(`✅ [CollegesPage] Successfully formatted ${formattedColleges.length} colleges`);
          console.log(`📍 [CollegesPage] Sample college:`, formattedColleges[0]);
          setColleges(formattedColleges);
        } else {
          console.error('❌ [CollegesPage] API returned unsuccessful response:', data);
        }
      } catch (error) {
        console.error('❌ [CollegesPage] Error fetching colleges:', error);
        console.error('❌ [CollegesPage] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
      } finally {
        setLoading(false);
        console.log('✅ [CollegesPage] Loading complete');
      }
    };

    fetchColleges();
  }, []);

  const states = [...new Set(colleges.map(c => c.state))].sort();

  const filteredColleges = colleges.filter(college => {
    const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         college.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         college.conference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === 'all' || college.state === selectedState;

    let matchesDivision = true;
    if (selectedDivision === 'all') {
      matchesDivision = true;
    } else if (selectedDivision === 'Power 5') {
      // Filter by Power 4 conferences (SEC, Big 10, Big 12, ACC)
      const power4Conferences = ['SEC', 'BIG 10', 'BIG 12', 'ACC'];
      matchesDivision = power4Conferences.includes(college.conference);
    } else {
      matchesDivision = college.division === selectedDivision;
    }

    return matchesSearch && matchesState && matchesDivision;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Universities & Colleges</h1>
            <p className="text-gray-600 mt-1">Browse NCAA Division I, II, and III institutions with Greek life</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Grid View"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="List View"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search universities, cities, or conferences..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
          >
            <option value="all">All Divisions</option>
            <option value="Power 5">Power 5</option>
            <option value="Division I">NCAA Division I</option>
            <option value="Division II">NCAA Division II</option>
            <option value="Division III">NCAA Division III</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="all">All States</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredColleges.length} of {colleges.length} universities
          </p>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading colleges...</p>
        </div>
      )}

      {/* Summary Stats */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
              <p className="text-3xl font-bold">{filteredColleges.length}</p>
              <p className="text-sm opacity-90">Universities</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
              <p className="text-3xl font-bold">
                {filteredColleges.reduce((acc, c) => acc + c.greekLife, 0).toLocaleString()}
              </p>
              <p className="text-sm opacity-90">Greek Orgs</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
              <p className="text-3xl font-bold">
                {filteredColleges.length * 3}
              </p>
              <p className="text-sm opacity-90">Known Rosters</p>
            </div>
          </div>

          {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredColleges.map((college) => (
            <div key={college.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <img
                      src={college.image}
                      alt={college.name}
                      className="w-16 h-16 rounded-lg mr-4"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{college.name}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {college.location}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {college.division}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {college.conference}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{college.greekLife}</p>
                    <p className="text-xs text-gray-500">Greek Orgs</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-gray-100">
                  <div>
                    <div className="flex items-center text-gray-600">
                      <Building2 className="w-4 h-4 mr-1" />
                      <span className="text-sm">Chapters</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{college.chapter_count}</p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm">Greek Life %</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{college.greekPercentage}%</p>
                  </div>
                </div>

                {/* Top Organizations - removed, was hardcoded dummy data */}
                {/* Next Event - removed, was hardcoded dummy data */}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {college.partnershipOpportunities} Opportunities
                    </span>
                  </div>
                  <Link
                    to={`/app/colleges/${college.id}`}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-center">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  University
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Division
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chapters
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Greek Life %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opportunities
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Deal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredColleges.map((college) => (
                <tr key={college.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={college.image}
                        alt={college.name}
                        className="w-10 h-10 rounded-lg mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{college.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {college.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className="text-sm text-gray-900">{college.division}</span>
                      <div className="text-xs text-gray-500">{college.conference}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-blue-600">{college.chapter_count}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(college.greekPercentage * 2, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{college.greekPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {college.partnershipOpportunities}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-green-600">{college.avgDealSize}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/app/colleges/${college.id}`}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center gap-1">
                      View
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default CollegesPage;