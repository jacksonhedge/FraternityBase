import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, GraduationCap, Users, MapPin, Calendar, TrendingUp, Building2, Award, Grid, List, ChevronRight, Filter } from 'lucide-react';

const CollegesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const colleges = [
    // NCAA Division I Schools
    {
      id: 1,
      name: 'University of Alabama',
      location: 'Tuscaloosa, AL',
      state: 'AL',
      division: 'Division I',
      conference: 'SEC',
      students: 38563,
      greekLife: 68,
      greekPercentage: 36,
      image: 'https://ui-avatars.com/api/?name=UA&background=9e1b32&color=fff&size=200',
      topOrgs: ['Sigma Chi', 'Alpha Phi', 'Kappa Alpha'],
      nextEvent: 'Greek Week - April 10-17',
      partnershipOpportunities: 24,
      avgDealSize: '$52,000',
      founded: 1831,
      mascot: 'Crimson Tide'
    },
    {
      id: 2,
      name: 'University of Florida',
      location: 'Gainesville, FL',
      state: 'FL',
      division: 'Division I',
      conference: 'SEC',
      students: 52218,
      greekLife: 65,
      greekPercentage: 22,
      image: 'https://ui-avatars.com/api/?name=UF&background=0021a5&color=fff&size=200',
      topOrgs: ['Delta Delta Delta', 'Pi Kappa Alpha', 'Chi Omega'],
      nextEvent: 'Spring Philanthropy Week - March 20-27',
      partnershipOpportunities: 31,
      avgDealSize: '$48,000',
      founded: 1853,
      mascot: 'Gators'
    },
    {
      id: 3,
      name: 'University of Georgia',
      location: 'Athens, GA',
      state: 'GA',
      division: 'Division I',
      conference: 'SEC',
      students: 39147,
      greekLife: 63,
      greekPercentage: 28,
      image: 'https://ui-avatars.com/api/?name=UGA&background=ba0c2f&color=fff&size=200',
      topOrgs: ['Kappa Kappa Gamma', 'Sigma Alpha Epsilon', 'Alpha Delta Pi'],
      nextEvent: 'Dawgs for a Cause - April 5',
      partnershipOpportunities: 27,
      avgDealSize: '$45,000',
      founded: 1785,
      mascot: 'Bulldogs'
    },
    {
      id: 4,
      name: 'Auburn University',
      location: 'Auburn, AL',
      state: 'AL',
      division: 'Division I',
      conference: 'SEC',
      students: 31526,
      greekLife: 52,
      greekPercentage: 29,
      image: 'https://ui-avatars.com/api/?name=AU&background=f26522&color=fff&size=200',
      topOrgs: ['Beta Theta Pi', 'Phi Mu', 'Alpha Tau Omega'],
      nextEvent: 'War Eagle Greek Challenge - March 30',
      partnershipOpportunities: 19,
      avgDealSize: '$42,000',
      founded: 1856,
      mascot: 'Tigers'
    },
    {
      id: 5,
      name: 'LSU',
      location: 'Baton Rouge, LA',
      state: 'LA',
      division: 'Division I',
      conference: 'SEC',
      students: 35000,
      greekLife: 45,
      greekPercentage: 18,
      image: 'https://ui-avatars.com/api/?name=LSU&background=461d7c&color=fff&size=200',
      topOrgs: ['Kappa Alpha Psi', 'Delta Zeta', 'Sigma Nu'],
      nextEvent: 'Geaux Greek Week - April 15-22',
      partnershipOpportunities: 22,
      avgDealSize: '$38,000',
      founded: 1860,
      mascot: 'Tigers'
    },
    {
      id: 6,
      name: 'University of Texas at Austin',
      location: 'Austin, TX',
      state: 'TX',
      division: 'Division I',
      conference: 'Big 12',
      students: 51991,
      greekLife: 72,
      greekPercentage: 17,
      image: 'https://ui-avatars.com/api/?name=UT&background=bf5700&color=fff&size=200',
      topOrgs: ['Texas Cowboys', 'Pi Beta Phi', 'Fiji'],
      nextEvent: 'Round Up Week - April 8-14',
      partnershipOpportunities: 35,
      avgDealSize: '$58,000',
      founded: 1883,
      mascot: 'Longhorns'
    },
    {
      id: 7,
      name: 'University of Michigan',
      location: 'Ann Arbor, MI',
      state: 'MI',
      division: 'Division I',
      conference: 'Big Ten',
      students: 46002,
      greekLife: 62,
      greekPercentage: 24,
      image: 'https://ui-avatars.com/api/?name=UM&background=00274c&color=ffcb05&size=200',
      topOrgs: ['Theta Chi', 'Alpha Phi', 'Sigma Phi Epsilon'],
      nextEvent: 'Greek Week - April 3-10',
      partnershipOpportunities: 28,
      avgDealSize: '$50,000',
      founded: 1817,
      mascot: 'Wolverines'
    },
    {
      id: 8,
      name: 'UCLA',
      location: 'Los Angeles, CA',
      state: 'CA',
      division: 'Division I',
      conference: 'Pac-12',
      students: 45742,
      greekLife: 65,
      greekPercentage: 13,
      image: 'https://ui-avatars.com/api/?name=UCLA&background=2774ae&color=ffd100&size=200',
      topOrgs: ['Sigma Chi', 'Kappa Kappa Gamma', 'Alpha Tau Omega'],
      nextEvent: 'Bruin Bash Greek Edition - April 12',
      partnershipOpportunities: 30,
      avgDealSize: '$55,000',
      founded: 1919,
      mascot: 'Bruins'
    },
    // NCAA Division II Schools
    {
      id: 9,
      name: 'Rollins College',
      location: 'Winter Park, FL',
      state: 'FL',
      division: 'Division II',
      conference: 'Sunshine State',
      students: 3200,
      greekLife: 11,
      greekPercentage: 35,
      image: 'https://ui-avatars.com/api/?name=RC&background=002e5d&color=ffc627&size=200',
      topOrgs: ['Kappa Delta', 'Chi Psi', 'Phi Delta Theta'],
      nextEvent: 'Fox Day Greek Games - March 25',
      partnershipOpportunities: 8,
      avgDealSize: '$25,000',
      founded: 1885,
      mascot: 'Tars'
    },
    {
      id: 10,
      name: 'University of Tampa',
      location: 'Tampa, FL',
      state: 'FL',
      division: 'Division II',
      conference: 'Sunshine State',
      students: 10000,
      greekLife: 22,
      greekPercentage: 20,
      image: 'https://ui-avatars.com/api/?name=UT&background=7f0000&color=fff&size=200',
      topOrgs: ['Sigma Phi Epsilon', 'Zeta Tau Alpha', 'Delta Zeta'],
      nextEvent: 'Spartan Showcase - April 2',
      partnershipOpportunities: 12,
      avgDealSize: '$28,000',
      founded: 1931,
      mascot: 'Spartans'
    },
    // NCAA Division III Schools
    {
      id: 11,
      name: 'Emory University',
      location: 'Atlanta, GA',
      state: 'GA',
      division: 'Division III',
      conference: 'UAA',
      students: 14458,
      greekLife: 31,
      greekPercentage: 30,
      image: 'https://ui-avatars.com/api/?name=EU&background=012169&color=f2a900&size=200',
      topOrgs: ['Alpha Epsilon Pi', 'Kappa Alpha', 'Pi Beta Phi'],
      nextEvent: 'Dooley Week - April 10-16',
      partnershipOpportunities: 15,
      avgDealSize: '$35,000',
      founded: 1836,
      mascot: 'Eagles'
    },
    {
      id: 12,
      name: 'Washington University in St. Louis',
      location: 'St. Louis, MO',
      state: 'MO',
      division: 'Division III',
      conference: 'UAA',
      students: 15852,
      greekLife: 24,
      greekPercentage: 35,
      image: 'https://ui-avatars.com/api/?name=WU&background=a51417&color=fff&size=200',
      topOrgs: ['Sigma Alpha Mu', 'Alpha Omicron Pi', 'Beta Theta Pi'],
      nextEvent: 'WILD Spring Concert - April 8',
      partnershipOpportunities: 14,
      avgDealSize: '$32,000',
      founded: 1853,
      mascot: 'Bears'
    }
  ];

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