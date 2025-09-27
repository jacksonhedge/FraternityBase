import { useState } from 'react';
import { Search, Filter, Users, MapPin, Calendar, ExternalLink, Star, Building2, TrendingUp, Award, ChevronDown } from 'lucide-react';

const FraternitiesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCouncil, setSelectedCouncil] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'chapters' | 'members' | 'founded'>('chapters');

  // Comprehensive list of fraternities and sororities
  const organizations = [
    // IFC Fraternities
    { id: 1, name: 'Sigma Chi', type: 'fraternity', council: 'IFC', founded: 1855, chapters: 244, members: 350000, headquarters: 'Evanston, IL', colors: 'Blue and Old Gold', motto: 'In Hoc Signo Vinces' },
    { id: 2, name: 'Sigma Alpha Epsilon', type: 'fraternity', council: 'IFC', founded: 1856, chapters: 219, members: 336000, headquarters: 'Evanston, IL', colors: 'Purple and Gold', motto: 'The True Gentleman' },
    { id: 3, name: 'Sigma Phi Epsilon', type: 'fraternity', council: 'IFC', founded: 1901, chapters: 234, members: 328000, headquarters: 'Richmond, VA', colors: 'Red and Purple', motto: 'Building Balanced Men' },
    { id: 4, name: 'Pi Kappa Alpha', type: 'fraternity', council: 'IFC', founded: 1868, chapters: 220, members: 305000, headquarters: 'Memphis, TN', colors: 'Garnet and Gold', motto: 'Scholars, Leaders, Athletes, Gentlemen' },
    { id: 5, name: 'Tau Kappa Epsilon', type: 'fraternity', council: 'IFC', founded: 1899, chapters: 234, members: 298000, headquarters: 'Indianapolis, IN', colors: 'Cherry and Gray', motto: 'Better Men for a Better World' },
    { id: 6, name: 'Kappa Sigma', type: 'fraternity', council: 'IFC', founded: 1869, chapters: 316, members: 295000, headquarters: 'Charlottesville, VA', colors: 'Scarlet, White, and Green', motto: 'Bononia Docet' },
    { id: 7, name: 'Lambda Chi Alpha', type: 'fraternity', council: 'IFC', founded: 1909, chapters: 195, members: 280000, headquarters: 'Carmel, IN', colors: 'Purple, Green, and Gold', motto: 'Cross and Crescent' },
    { id: 8, name: 'Beta Theta Pi', type: 'fraternity', council: 'IFC', founded: 1839, chapters: 139, members: 190000, headquarters: 'Oxford, OH', colors: 'Pink and Blue', motto: 'Men of Principle' },
    { id: 9, name: 'Phi Delta Theta', type: 'fraternity', council: 'IFC', founded: 1848, chapters: 185, members: 186000, headquarters: 'Oxford, OH', colors: 'Azure and Argent', motto: 'One Man is No Man' },
    { id: 10, name: 'Alpha Tau Omega', type: 'fraternity', council: 'IFC', founded: 1865, chapters: 139, members: 181000, headquarters: 'Indianapolis, IN', colors: 'Azure and Gold', motto: 'Love and Respect' },
    { id: 11, name: 'Delta Tau Delta', type: 'fraternity', council: 'IFC', founded: 1858, chapters: 133, members: 170000, headquarters: 'Fishers, IN', colors: 'Purple, White, and Gold', motto: 'Truth, Courage, Faith, and Power' },
    { id: 12, name: 'Phi Gamma Delta', type: 'fraternity', council: 'IFC', founded: 1848, chapters: 144, members: 169000, headquarters: 'Lexington, KY', colors: 'Royal Purple and White', motto: 'Friendship, Knowledge, Service, Morality, Excellence' },
    { id: 13, name: 'Sigma Nu', type: 'fraternity', council: 'IFC', founded: 1869, chapters: 166, members: 227000, headquarters: 'Lexington, VA', colors: 'Black, White, and Gold', motto: 'Love, Truth, Honor' },
    { id: 14, name: 'Kappa Alpha Order', type: 'fraternity', council: 'IFC', founded: 1865, chapters: 133, members: 150000, headquarters: 'Lexington, VA', colors: 'Crimson and Old Gold', motto: 'Dieu et les Dames' },
    { id: 15, name: 'Phi Kappa Psi', type: 'fraternity', council: 'IFC', founded: 1852, chapters: 100, members: 112000, headquarters: 'Indianapolis, IN', colors: 'Cardinal Red and Hunter Green', motto: 'The Great Joy of Serving Others' },

    // NPHC Fraternities
    { id: 16, name: 'Alpha Phi Alpha', type: 'fraternity', council: 'NPHC', founded: 1906, chapters: 290, members: 290000, headquarters: 'Baltimore, MD', colors: 'Black and Old Gold', motto: 'First of All, Servants of All, We Shall Transcend All' },
    { id: 17, name: 'Kappa Alpha Psi', type: 'fraternity', council: 'NPHC', founded: 1911, chapters: 365, members: 160000, headquarters: 'Philadelphia, PA', colors: 'Crimson and Cream', motto: 'Achievement in Every Field of Human Endeavor' },
    { id: 18, name: 'Omega Psi Phi', type: 'fraternity', council: 'NPHC', founded: 1911, chapters: 750, members: 290000, headquarters: 'Decatur, GA', colors: 'Purple and Gold', motto: 'Friendship is Essential to the Soul' },
    { id: 19, name: 'Phi Beta Sigma', type: 'fraternity', council: 'NPHC', founded: 1914, chapters: 290, members: 290000, headquarters: 'Washington, DC', colors: 'Royal Blue and Pure White', motto: 'Culture for Service, Service for Humanity' },
    { id: 20, name: 'Iota Phi Theta', type: 'fraternity', council: 'NPHC', founded: 1963, chapters: 301, members: 70000, headquarters: 'Baltimore, MD', colors: 'Brown and Gold', motto: 'Building a Tradition, Not Resting on One' },

    // NPC Sororities
    { id: 21, name: 'Chi Omega', type: 'sorority', council: 'NPC', founded: 1895, chapters: 181, members: 366000, headquarters: 'Memphis, TN', colors: 'Cardinal and Straw', motto: 'Hellenic Culture and Christian Ideals' },
    { id: 22, name: 'Kappa Kappa Gamma', type: 'sorority', council: 'NPC', founded: 1870, chapters: 140, members: 260000, headquarters: 'Columbus, OH', colors: 'Light Blue and Dark Blue', motto: 'Aspire to Be' },
    { id: 23, name: 'Kappa Alpha Theta', type: 'sorority', council: 'NPC', founded: 1870, chapters: 147, members: 260000, headquarters: 'Indianapolis, IN', colors: 'Black and Gold', motto: 'Leading Women' },
    { id: 24, name: 'Delta Delta Delta', type: 'sorority', council: 'NPC', founded: 1888, chapters: 141, members: 250000, headquarters: 'Arlington, TX', colors: 'Silver, Gold, and Blue', motto: 'Let Us Steadfastly Love One Another' },
    { id: 25, name: 'Alpha Chi Omega', type: 'sorority', council: 'NPC', founded: 1885, chapters: 144, members: 230000, headquarters: 'Indianapolis, IN', colors: 'Scarlet and Olive Green', motto: 'Real. Strong. Women.' },
    { id: 26, name: 'Pi Beta Phi', type: 'sorority', council: 'NPC', founded: 1867, chapters: 154, members: 230000, headquarters: 'Town and Country, MO', colors: 'Wine and Silver Blue', motto: 'Friends and Leaders for Life' },
    { id: 27, name: 'Alpha Delta Pi', type: 'sorority', council: 'NPC', founded: 1851, chapters: 160, members: 225000, headquarters: 'Atlanta, GA', colors: 'Azure Blue and White', motto: 'We Live for Each Other' },
    { id: 28, name: 'Gamma Phi Beta', type: 'sorority', council: 'NPC', founded: 1874, chapters: 139, members: 224000, headquarters: 'Centennial, CO', colors: 'Pink and Brown', motto: 'Building Strong Girls' },
    { id: 29, name: 'Alpha Phi', type: 'sorority', council: 'NPC', founded: 1872, chapters: 172, members: 220000, headquarters: 'Evanston, IL', colors: 'Silver and Bordeaux', motto: 'Union Hand in Hand' },
    { id: 30, name: 'Delta Gamma', type: 'sorority', council: 'NPC', founded: 1873, chapters: 151, members: 220000, headquarters: 'Columbus, OH', colors: 'Bronze, Pink, and Blue', motto: 'Do Good' },
    { id: 31, name: 'Zeta Tau Alpha', type: 'sorority', council: 'NPC', founded: 1898, chapters: 173, members: 270000, headquarters: 'Carmel, IN', colors: 'Turquoise and Steel Gray', motto: 'Seek the Noblest' },
    { id: 32, name: 'Alpha Omicron Pi', type: 'sorority', council: 'NPC', founded: 1897, chapters: 143, members: 210000, headquarters: 'Brentwood, TN', colors: 'Cardinal and Rose', motto: 'Inspire Ambition' },
    { id: 33, name: 'Kappa Delta', type: 'sorority', council: 'NPC', founded: 1897, chapters: 166, members: 230000, headquarters: 'Memphis, TN', colors: 'Pearl White and Olive Green', motto: 'Let Us Strive for That Which is Honorable' },
    { id: 34, name: 'Delta Zeta', type: 'sorority', council: 'NPC', founded: 1902, chapters: 165, members: 240000, headquarters: 'Oxford, OH', colors: 'Rose and Green', motto: 'Love That is Ever Steadfast' },
    { id: 35, name: 'Phi Mu', type: 'sorority', council: 'NPC', founded: 1852, chapters: 137, members: 190000, headquarters: 'Peachtree City, GA', colors: 'Rose and White', motto: 'The Faithful Sisters' },

    // NPHC Sororities
    { id: 36, name: 'Alpha Kappa Alpha', type: 'sorority', council: 'NPHC', founded: 1908, chapters: 300, members: 325000, headquarters: 'Chicago, IL', colors: 'Salmon Pink and Apple Green', motto: 'By Culture and By Merit' },
    { id: 37, name: 'Delta Sigma Theta', type: 'sorority', council: 'NPHC', founded: 1913, chapters: 300, members: 350000, headquarters: 'Washington, DC', colors: 'Crimson and Cream', motto: 'Intelligence is the Torch of Wisdom' },
    { id: 38, name: 'Zeta Phi Beta', type: 'sorority', council: 'NPHC', founded: 1920, chapters: 300, members: 125000, headquarters: 'Washington, DC', colors: 'Royal Blue and White', motto: 'A Community Conscious, Action-Oriented Organization' },
    { id: 39, name: 'Sigma Gamma Rho', type: 'sorority', council: 'NPHC', founded: 1922, chapters: 500, members: 100000, headquarters: 'Cary, NC', colors: 'Royal Blue and Gold', motto: 'Greater Service, Greater Progress' },
  ];

  const councils = ['all', 'IFC', 'NPC', 'NPHC'];

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.headquarters.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || org.type === selectedType;
    const matchesCouncil = selectedCouncil === 'all' || org.council === selectedCouncil;
    return matchesSearch && matchesType && matchesCouncil;
  });

  const sortedOrganizations = [...filteredOrganizations].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'chapters':
        return b.chapters - a.chapters;
      case 'members':
        return b.members - a.members;
      case 'founded':
        return a.founded - b.founded;
      default:
        return 0;
    }
  });

  const stats = {
    totalOrgs: filteredOrganizations.length,
    totalChapters: filteredOrganizations.reduce((acc, org) => acc + org.chapters, 0),
    totalMembers: filteredOrganizations.reduce((acc, org) => acc + org.members, 0),
    avgFounded: Math.round(filteredOrganizations.reduce((acc, org) => acc + org.founded, 0) / filteredOrganizations.length)
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedCouncil}
            onChange={(e) => setSelectedCouncil(e.target.value)}
          >
            {councils.map(council => (
              <option key={council} value={council}>
                {council === 'all' ? 'All Councils' : council}
              </option>
            ))}
          </select>
          <div className="relative">
            <select
              className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="chapters">Sort by Chapters</option>
              <option value="members">Sort by Members</option>
              <option value="founded">Sort by Founded</option>
              <option value="name">Sort by Name</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
          <p className="text-3xl font-bold">{stats.totalOrgs}</p>
          <p className="text-sm opacity-90">Organizations</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
          <p className="text-3xl font-bold">{stats.totalChapters.toLocaleString()}</p>
          <p className="text-sm opacity-90">Total Chapters</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
          <p className="text-3xl font-bold">{(stats.totalMembers / 1000000).toFixed(1)}M</p>
          <p className="text-sm opacity-90">Total Members</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4">
          <p className="text-3xl font-bold">{stats.avgFounded}</p>
          <p className="text-sm opacity-90">Avg Founded</p>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Council
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Founded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chapters
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Headquarters
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Colors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedOrganizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                        org.type === 'fraternity' ? 'bg-blue-100' : 'bg-pink-100'
                      }`}>
                        <span className={`font-bold text-sm ${
                          org.type === 'fraternity' ? 'text-blue-600' : 'text-pink-600'
                        }`}>
                          {org.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        <div className="text-xs text-gray-500">{org.motto.slice(0, 40)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      org.council === 'IFC' ? 'bg-blue-100 text-blue-800' :
                      org.council === 'NPC' ? 'bg-pink-100 text-pink-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {org.council}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {org.founded}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">{org.chapters}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{org.members.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {org.headquarters}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      {org.colors.split(' and ').slice(0, 2).map((color, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{
                            backgroundColor:
                              color.toLowerCase().includes('blue') ? '#3B82F6' :
                              color.toLowerCase().includes('gold') ? '#F59E0B' :
                              color.toLowerCase().includes('red') || color.toLowerCase().includes('crimson') || color.toLowerCase().includes('scarlet') || color.toLowerCase().includes('cardinal') ? '#DC2626' :
                              color.toLowerCase().includes('purple') ? '#8B5CF6' :
                              color.toLowerCase().includes('green') ? '#10B981' :
                              color.toLowerCase().includes('pink') || color.toLowerCase().includes('rose') ? '#EC4899' :
                              color.toLowerCase().includes('black') ? '#000000' :
                              color.toLowerCase().includes('white') || color.toLowerCase().includes('silver') || color.toLowerCase().includes('argent') ? '#E5E7EB' :
                              color.toLowerCase().includes('brown') || color.toLowerCase().includes('bronze') ? '#92400E' :
                              color.toLowerCase().includes('gray') || color.toLowerCase().includes('grey') ? '#6B7280' :
                              color.toLowerCase().includes('orange') ? '#F97316' :
                              '#D1D5DB'
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FraternitiesPage;