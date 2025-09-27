import { useState } from 'react';
import { Search, GraduationCap, Users, ChevronRight, Building2, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';

const AboutPage = () => {
  const [viewMode, setViewMode] = useState<'school' | 'organization'>('school');
  const [schoolSearch, setSchoolSearch] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [orgType, setOrgType] = useState<'all' | 'fraternity' | 'sorority'>('all');

  // Sample data - will be replaced with API calls
  const schools = [
    { id: 1, name: 'University of Alabama', state: 'AL', city: 'Tuscaloosa', chapters: 68, students: 38000 },
    { id: 2, name: 'Auburn University', state: 'AL', city: 'Auburn', chapters: 52, students: 31000 },
    { id: 3, name: 'University of Florida', state: 'FL', city: 'Gainesville', chapters: 65, students: 52000 },
    { id: 4, name: 'Florida State University', state: 'FL', city: 'Tallahassee', chapters: 55, students: 42000 },
    { id: 5, name: 'University of Georgia', state: 'GA', city: 'Athens', chapters: 63, students: 39000 },
    { id: 6, name: 'Georgia Tech', state: 'GA', city: 'Atlanta', chapters: 42, students: 44000 },
    { id: 7, name: 'University of Texas at Austin', state: 'TX', city: 'Austin', chapters: 72, students: 51000 },
    { id: 8, name: 'Texas A&M University', state: 'TX', city: 'College Station', chapters: 58, students: 71000 },
    { id: 9, name: 'LSU', state: 'LA', city: 'Baton Rouge', chapters: 45, students: 35000 },
    { id: 10, name: 'University of Mississippi', state: 'MS', city: 'Oxford', chapters: 38, students: 23000 },
    { id: 11, name: 'University of Tennessee', state: 'TN', city: 'Knoxville', chapters: 48, students: 31000 },
    { id: 12, name: 'Vanderbilt University', state: 'TN', city: 'Nashville', chapters: 32, students: 13000 },
  ];

  const organizations = [
    // Fraternities
    { id: 1, name: 'Alpha Phi Alpha', type: 'fraternity', founded: 1906, chapters: 290, members: 290000, category: 'NPHC' },
    { id: 2, name: 'Sigma Chi', type: 'fraternity', founded: 1855, chapters: 244, members: 350000, category: 'NIC' },
    { id: 3, name: 'Kappa Alpha Psi', type: 'fraternity', founded: 1911, chapters: 365, members: 160000, category: 'NPHC' },
    { id: 4, name: 'Phi Beta Sigma', type: 'fraternity', founded: 1914, chapters: 290, members: 290000, category: 'NPHC' },
    { id: 5, name: 'Sigma Alpha Epsilon', type: 'fraternity', founded: 1856, chapters: 219, members: 336000, category: 'NIC' },
    { id: 6, name: 'Beta Theta Pi', type: 'fraternity', founded: 1839, chapters: 139, members: 190000, category: 'NIC' },
    { id: 7, name: 'Pi Kappa Alpha', type: 'fraternity', founded: 1868, chapters: 220, members: 305000, category: 'NIC' },
    { id: 8, name: 'Tau Kappa Epsilon', type: 'fraternity', founded: 1899, chapters: 234, members: 298000, category: 'NIC' },
    // Sororities
    { id: 9, name: 'Alpha Kappa Alpha', type: 'sorority', founded: 1908, chapters: 300, members: 325000, category: 'NPHC' },
    { id: 10, name: 'Delta Sigma Theta', type: 'sorority', founded: 1913, chapters: 300, members: 350000, category: 'NPHC' },
    { id: 11, name: 'Zeta Phi Beta', type: 'sorority', founded: 1920, chapters: 300, members: 125000, category: 'NPHC' },
    { id: 12, name: 'Kappa Alpha Theta', type: 'sorority', founded: 1870, chapters: 147, members: 260000, category: 'NPC' },
    { id: 13, name: 'Chi Omega', type: 'sorority', founded: 1895, chapters: 181, members: 366000, category: 'NPC' },
    { id: 14, name: 'Kappa Kappa Gamma', type: 'sorority', founded: 1870, chapters: 140, members: 260000, category: 'NPC' },
    { id: 15, name: 'Delta Delta Delta', type: 'sorority', founded: 1888, chapters: 141, members: 250000, category: 'NPC' },
    { id: 16, name: 'Alpha Chi Omega', type: 'sorority', founded: 1885, chapters: 144, members: 230000, category: 'NPC' },
  ];

  // Filter schools based on search and state
  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
                         school.city.toLowerCase().includes(schoolSearch.toLowerCase());
    const matchesState = selectedState === 'all' || school.state === selectedState;
    return matchesSearch && matchesState;
  });

  // Filter organizations based on type
  const filteredOrgs = organizations.filter(org => {
    return orgType === 'all' || org.type === orgType;
  });

  // Get unique states
  const uniqueStates = [...new Set(schools.map(school => school.state))].sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Explore Greek Life Across America
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover organizations by school or browse national fraternities and sororities
            </p>

            {/* Toggle View */}
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('school')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'school'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <GraduationCap className="inline-block w-4 h-4 mr-2" />
                By School
              </button>
              <button
                onClick={() => setViewMode('organization')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'organization'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="inline-block w-4 h-4 mr-2" />
                By Organization
              </button>
            </div>
          </div>

          {/* School View */}
          {viewMode === 'school' && (
            <>
              {/* Search and Filter Bar */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search schools by name or city..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={schoolSearch}
                        onChange={(e) => setSchoolSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                    >
                      <option value="all">All States</option>
                      {uniqueStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Showing {filteredSchools.length} schools
                </div>
              </div>

              {/* Schools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSchools.map((school) => (
                  <div key={school.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{school.name}</h3>
                        <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                          <MapPin className="w-4 h-4" />
                          {school.city}, {school.state}
                        </div>
                      </div>
                      <Building2 className="w-8 h-8 text-blue-600" />
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Greek Chapters:</span>
                        <span className="font-semibold text-gray-900">{school.chapters}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Students:</span>
                        <span className="font-semibold text-gray-900">{school.students.toLocaleString()}</span>
                      </div>
                    </div>

                    <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      View Chapters
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Organization View */}
          {viewMode === 'organization' && (
            <>
              {/* Filter Bar */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="flex flex-wrap gap-4 items-center">
                  <span className="text-gray-700 font-medium">Filter by type:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOrgType('all')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        orgType === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All ({organizations.length})
                    </button>
                    <button
                      onClick={() => setOrgType('fraternity')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        orgType === 'fraternity'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Fraternities ({organizations.filter(o => o.type === 'fraternity').length})
                    </button>
                    <button
                      onClick={() => setOrgType('sorority')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        orgType === 'sorority'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Sororities ({organizations.filter(o => o.type === 'sorority').length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Organizations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredOrgs.map((org) => (
                  <div key={org.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          org.type === 'fraternity'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-pink-100 text-pink-700'
                        }`}>
                          {org.type === 'fraternity' ? 'Fraternity' : 'Sorority'}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {org.category}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Founded:</span>
                        <span className="font-semibold text-gray-900">{org.founded}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Chapters:</span>
                        <span className="font-semibold text-gray-900">{org.chapters}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Members:</span>
                        <span className="font-semibold text-gray-900">{org.members.toLocaleString()}</span>
                      </div>
                    </div>

                    <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;