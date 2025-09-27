import { useState } from 'react';
import { Search, Filter, MapPin, Users, Calendar } from 'lucide-react';

const BrowsePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Sample data - will be replaced with API calls
  const organizations = [
    { id: 1, name: 'Alpha Phi Alpha', type: 'Fraternity', school: 'University of Alabama', state: 'AL', members: 45, founded: 1906 },
    { id: 2, name: 'Delta Sigma Theta', type: 'Sorority', school: 'University of Georgia', state: 'GA', members: 62, founded: 1913 },
    { id: 3, name: 'Sigma Chi', type: 'Fraternity', school: 'Florida State University', state: 'FL', members: 78, founded: 1855 },
    { id: 4, name: 'Kappa Alpha Theta', type: 'Sorority', school: 'University of Texas', state: 'TX', members: 55, founded: 1870 },
    { id: 5, name: 'Phi Beta Sigma', type: 'Fraternity', school: 'LSU', state: 'LA', members: 38, founded: 1914 },
    { id: 6, name: 'Alpha Kappa Alpha', type: 'Sorority', school: 'Auburn University', state: 'AL', members: 48, founded: 1908 },
  ];

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          org.school.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === 'all' || org.state === selectedState;
    const matchesType = selectedType === 'all' || org.type === selectedType;

    return matchesSearch && matchesState && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Greek Organizations</h1>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or school..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* State Filter */}
            <div>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                <option value="all">All States</option>
                <option value="AL">Alabama</option>
                <option value="FL">Florida</option>
                <option value="GA">Georgia</option>
                <option value="LA">Louisiana</option>
                <option value="TX">Texas</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="Fraternity">Fraternities</option>
                <option value="Sorority">Sororities</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>Showing {filteredOrgs.length} organizations</span>
          </div>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs.map((org) => (
            <div key={org.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{org.name}</h3>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mt-2">
                  {org.type}
                </span>
              </div>

              <div className="space-y-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{org.school}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{org.members} active members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Founded {org.founded}</span>
                </div>
              </div>

              <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>

        {filteredOrgs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No organizations found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;