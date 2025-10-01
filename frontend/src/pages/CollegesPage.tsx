import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, GraduationCap, Users, MapPin, Calendar, TrendingUp, Building2, Award, Grid, List, ChevronRight, Filter } from 'lucide-react';
import { COLLEGE_LOCATIONS } from '../data/statesGeoData';
import { getCollegeLogoWithFallback } from '../utils/collegeLogos';

const CollegesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Convert COLLEGE_LOCATIONS to the format expected by the UI
  const colleges = useMemo(() => {
    return Object.entries(COLLEGE_LOCATIONS).map(([name, data], index) => {
      // Remove state suffix like "(KY)" from the name for display
      const displayName = name.replace(/\s*\([A-Z]{2}\)\s*$/, '');

      return {
        id: index + 1,
        name: displayName,
        location: `${data.state}`,
        state: data.state,
        division: data.division === 'D1' ? 'Division I' : data.division === 'D2' ? 'Division II' : 'Division III',
        conference: data.conference || 'Independent',
        students: data.totalMembers * 10, // Rough estimate based on Greek life members
        greekLife: data.fraternities + data.sororities,
        greekPercentage: Math.round((data.totalMembers / (data.totalMembers * 10)) * 100),
        image: getCollegeLogoWithFallback(displayName),
        topOrgs: ['Sigma Chi', 'Alpha Phi', 'Kappa Alpha'], // Mock data
        nextEvent: 'Greek Week', // Mock data
        partnershipOpportunities: data.division === 'D1' ? 24 : data.division === 'D2' ? 12 : 8,
        avgDealSize: data.division === 'D1' ? '$50,000' : data.division === 'D2' ? '$28,000' : '$15,000',
        founded: 1900, // Mock data
        mascot: '' // Mock data
      };
    });
  }, []);

  const states = [...new Set(colleges.map(c => c.state))].sort();

  const filteredColleges = colleges.filter(college => {
    const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         college.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         college.conference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === 'all' || college.state === selectedState;
    const matchesDivision = selectedDivision === 'all' || college.division === selectedDivision;
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
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
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
          >
            <option value="all">All Divisions</option>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
          <p className="text-3xl font-bold">{filteredColleges.length}</p>
          <p className="text-sm opacity-90">Universities</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
          <p className="text-3xl font-bold">
            {filteredColleges.reduce((acc, c) => acc + c.greekLife, 0)}
          </p>
          <p className="text-sm opacity-90">Greek Orgs</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
          <p className="text-3xl font-bold">
            {filteredColleges.filter(c => c.division === 'Division I').length}
          </p>
          <p className="text-sm opacity-90">Division I</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4">
          <p className="text-3xl font-bold">
            {Math.round(filteredColleges.reduce((acc, c) => acc + c.greekPercentage, 0) / filteredColleges.length)}%
          </p>
          <p className="text-sm opacity-90">Avg Greek Life</p>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg p-4">
          <p className="text-3xl font-bold">
            {filteredColleges.reduce((acc, c) => acc + c.partnershipOpportunities, 0)}
          </p>
          <p className="text-sm opacity-90">Opportunities</p>
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
                <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-y border-gray-100">
                  <div>
                    <div className="flex items-center text-gray-600">
                      <GraduationCap className="w-4 h-4 mr-1" />
                      <span className="text-sm">Students</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{college.students.toLocaleString()}</p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm">Greek Life</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{college.greekPercentage}%</p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span className="text-sm">Avg Deal</span>
                    </div>
                    <p className="text-lg font-semibold text-green-600">{college.avgDealSize}</p>
                  </div>
                </div>

                {/* Top Organizations */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Top Organizations:</p>
                  <div className="flex flex-wrap gap-2">
                    {college.topOrgs.map((org, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                        {org}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Next Event */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Next Event:</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{college.nextEvent}</span>
                  </div>
                </div>

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
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Greek Orgs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Greek %
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
                    <span className="text-sm text-gray-900">{college.students.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-blue-600">{college.greekLife}</span>
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
    </div>
  );
};

export default CollegesPage;