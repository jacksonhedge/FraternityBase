import { useState, useEffect } from 'react';
import { Search, Filter, Users, MapPin, Calendar, ExternalLink, Star, Building2, TrendingUp, Award, ChevronDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface GreekOrganization {
  id: string;
  name: string;
  greek_letters?: string;
  organization_type: 'fraternity' | 'sorority';
  founded_year?: number;
  national_website?: string;
  colors?: string;
  philanthropy?: string;
  chapter_count: number;
}

const FraternitiesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCouncil, setSelectedCouncil] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'chapters' | 'founded'>('chapters');
  const [organizations, setOrganizations] = useState<GreekOrganization[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch greek organizations from database
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch(`${API_URL}/greek-organizations`);
        const data = await response.json();

        if (data.success && data.data) {
          setOrganizations(data.data);
        }
      } catch (error) {
        console.error('Error fetching greek organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || org.organization_type === selectedType;
    return matchesSearch && matchesType;
  });

  // Separate Sigma Chi as pinned organization
  const sigmaChi = filteredOrganizations.find(org => org.name === 'Sigma Chi');
  const otherOrgs = filteredOrganizations.filter(org => org.name !== 'Sigma Chi');

  const sortedOrganizations = [...otherOrgs].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'chapters':
        return b.chapter_count - a.chapter_count;
      case 'founded':
        return (a.founded_year || 0) - (b.founded_year || 0);
      default:
        return 0;
    }
  });

  // Put Sigma Chi first if it's in the filtered results
  const finalOrganizations = sigmaChi ? [sigmaChi, ...sortedOrganizations] : sortedOrganizations;

  const stats = {
    totalOrgs: filteredOrganizations.length,
    totalChapters: filteredOrganizations.reduce((acc, org) => acc + org.chapter_count, 0),
    avgFounded: filteredOrganizations.length > 0
      ? Math.round(filteredOrganizations.reduce((acc, org) => acc + (org.founded_year || 0), 0) / filteredOrganizations.filter(o => o.founded_year).length)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Greek Organizations Directory</h1>
        <p className="text-gray-600 mt-1">Complete listing of all national fraternities and sororities</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search organizations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="fraternity">Fraternities</option>
            <option value="sorority">Sororities</option>
          </select>
          <div className="relative">
            <select
              className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="chapters">Sort by Chapters</option>
              <option value="founded">Sort by Founded</option>
              <option value="name">Sort by Name</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
          <p className="text-3xl font-bold">{stats.totalOrgs}</p>
          <p className="text-sm opacity-90">Organizations in Database</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
          <p className="text-3xl font-bold">{stats.totalChapters.toLocaleString()}</p>
          <p className="text-sm opacity-90">Total Chapters</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4">
          <p className="text-3xl font-bold">{stats.avgFounded || 'N/A'}</p>
          <p className="text-sm opacity-90">Avg Founded</p>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading greek organizations...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Greek Letters
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Founded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chapters
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Website
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {finalOrganizations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No organizations found
                    </td>
                  </tr>
                ) : (
                  finalOrganizations.map((org) => (
                    <tr key={org.id} className={`hover:bg-gray-50 transition-colors ${org.name === 'Sigma Chi' ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}>
                      {/* Organization Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {org.name === 'Sigma Chi' && (
                            <Star className="w-5 h-5 text-yellow-500 mr-2 fill-yellow-500" />
                          )}
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                            org.organization_type === 'fraternity' ? 'bg-blue-100' : 'bg-pink-100'
                          }`}>
                            <span className={`font-bold text-sm ${
                              org.organization_type === 'fraternity' ? 'text-blue-600' : 'text-pink-600'
                            }`}>
                              {org.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              {org.name}
                              {org.name === 'Sigma Chi' && (
                                <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded-full">Featured</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          org.organization_type === 'fraternity' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {org.organization_type}
                        </span>
                      </td>

                      {/* Greek Letters */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {org.greek_letters || '-'}
                      </td>

                      {/* Founded */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {org.founded_year || '-'}
                      </td>

                      {/* Chapters */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{org.chapter_count}</span>
                      </td>

                      {/* Website */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {org.national_website ? (
                          <a
                            href={org.national_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium inline-flex items-center gap-1"
                          >
                            Visit <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};

export default FraternitiesPage;