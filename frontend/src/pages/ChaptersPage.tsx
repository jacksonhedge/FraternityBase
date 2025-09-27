import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MapPin,
  Calendar,
  TrendingUp,
  Award,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  Instagram,
  Globe
} from 'lucide-react';

const ChaptersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'size' | 'name' | 'university'>('size');
  const [filterState, setFilterState] = useState('all');

  // Mock data - fraternities only, sorted by chapter size
  const chapters = [
    {
      id: 1,
      fraternity: 'Sigma Chi',
      university: 'Penn State',
      state: 'PA',
      chapterName: 'Beta Theta',
      size: 145,
      founded: 1888,
      status: 'Active',
      president: 'Michael Thompson',
      presidentEmail: 'mthompson@psu.edu',
      presidentPhone: '(814) 555-0123',
      vicePresident: 'James Wilson',
      vpEmail: 'jwilson@psu.edu',
      vpPhone: '(814) 555-0124',
      rushChair: 'Connor Mitchell',
      rushEmail: 'cmitchell@psu.edu',
      rushPhone: '(814) 555-0125',
      website: 'sigmachipsu.org',
      instagram: '@sigmachi_psu',
      currentBrands: ['Nike', 'Chipotle', 'Red Bull', 'State Farm'],
      greekRank: 4.2,
      house: '420 E Fairmount Ave',
      colors: ['Blue', 'Old Gold'],
      motto: 'In Hoc Signo Vinces'
    },
    {
      id: 2,
      fraternity: 'Alpha Tau Omega',
      university: 'University of Alabama',
      state: 'AL',
      chapterName: 'Alpha Delta',
      size: 142,
      founded: 1885,
      status: 'Active',
      president: 'William Roberts',
      presidentEmail: 'wroberts@ua.edu',
      rushChair: 'Blake Anderson',
      rushEmail: 'banderson@ua.edu',
      website: 'atoalabama.com',
      instagram: '@ato_alabama',
      currentBrands: ['Under Armour', 'Buffalo Wild Wings'],
      greekRank: 4.5,
      house: '202 University Blvd'
    },
    {
      id: 3,
      fraternity: 'Sigma Alpha Epsilon',
      university: 'University of Texas',
      state: 'TX',
      chapterName: 'Texas Rho',
      size: 138,
      founded: 1883,
      status: 'Active',
      president: 'David Martinez',
      presidentEmail: 'dmartinez@utexas.edu',
      rushChair: 'Ryan Cooper',
      rushEmail: 'rcooper@utexas.edu',
      website: 'texassae.com',
      instagram: '@sae_texas',
      currentBrands: ['Patagonia', 'Raising Cane\'s'],
      greekRank: 4.3,
      house: '2501 San Jacinto Blvd'
    },
    {
      id: 4,
      fraternity: 'Phi Gamma Delta',
      university: 'Ohio State',
      state: 'OH',
      chapterName: 'Lambda',
      size: 135,
      founded: 1878,
      status: 'Active',
      president: 'Andrew Johnson',
      presidentEmail: 'ajohnson@osu.edu',
      rushChair: 'Tyler Davis',
      rushEmail: 'tdavis@osu.edu',
      website: 'fijiohiostate.org',
      instagram: '@fiji_osu',
      currentBrands: ['Adidas', 'Jimmy Johns'],
      greekRank: 4.1,
      house: '99 E Woodruff Ave'
    },
    {
      id: 5,
      fraternity: 'Delta Tau Delta',
      university: 'University of Florida',
      state: 'FL',
      chapterName: 'Delta Zeta',
      size: 130,
      founded: 1925,
      status: 'Active',
      president: 'Christopher Lee',
      presidentEmail: 'clee@ufl.edu',
      rushChair: 'Nathan White',
      rushEmail: 'nwhite@ufl.edu',
      website: 'ufdelts.org',
      instagram: '@delts_uf',
      currentBrands: ['New Balance', 'Subway'],
      greekRank: 4.4,
      house: '1926 W University Ave'
    },
    {
      id: 6,
      fraternity: 'Beta Theta Pi',
      university: 'University of Michigan',
      state: 'MI',
      chapterName: 'Lambda',
      size: 128,
      founded: 1845,
      status: 'Active',
      president: 'Robert Taylor',
      presidentEmail: 'rtaylor@umich.edu',
      rushChair: 'Kevin Brown',
      rushEmail: 'kbrown@umich.edu',
      website: 'michiganbetathetapi.com',
      instagram: '@beta_umich',
      currentBrands: ['Columbia', 'Domino\'s'],
      greekRank: 4.2,
      house: '604 S State St'
    },
    {
      id: 7,
      fraternity: 'Kappa Alpha Order',
      university: 'University of Georgia',
      state: 'GA',
      chapterName: 'Gamma',
      size: 125,
      founded: 1868,
      status: 'Active',
      president: 'Matthew Harris',
      presidentEmail: 'mharris@uga.edu',
      rushChair: 'Jacob Miller',
      rushEmail: 'jmiller@uga.edu',
      website: 'kageorgia.com',
      instagram: '@ka_uga',
      currentBrands: ['Southern Tide', 'Chick-fil-A'],
      greekRank: 4.6,
      house: '150 Greek Park Cir'
    },
    {
      id: 8,
      fraternity: 'Pi Kappa Alpha',
      university: 'Arizona State',
      state: 'AZ',
      chapterName: 'Delta Tau',
      size: 122,
      founded: 1984,
      status: 'Active',
      president: 'Daniel Garcia',
      presidentEmail: 'dgarcia@asu.edu',
      rushChair: 'Brandon Scott',
      rushEmail: 'bscott@asu.edu',
      website: 'asupikes.org',
      instagram: '@pike_asu',
      currentBrands: ['Puma', 'In-N-Out'],
      greekRank: 4.0,
      house: '615 E Apache Blvd'
    },
    {
      id: 9,
      fraternity: 'Phi Delta Theta',
      university: 'University of Wisconsin',
      state: 'WI',
      chapterName: 'Wisconsin Alpha',
      size: 118,
      founded: 1857,
      status: 'Active',
      president: 'Thomas Anderson',
      presidentEmail: 'tanderson@wisc.edu',
      rushChair: 'Eric Johnson',
      rushEmail: 'ejohnson@wisc.edu',
      website: 'wisconsinphidelt.com',
      instagram: '@phidelt_wisconsin',
      currentBrands: ['North Face', 'Culver\'s'],
      greekRank: 4.1,
      house: '222 Langdon St'
    },
    {
      id: 10,
      fraternity: 'Lambda Chi Alpha',
      university: 'Indiana University',
      state: 'IN',
      chapterName: 'Alpha Pi',
      size: 115,
      founded: 1919,
      status: 'Active',
      president: 'Joseph Martinez',
      presidentEmail: 'jmartinez@indiana.edu',
      rushChair: 'Patrick Wilson',
      rushEmail: 'pwilson@indiana.edu',
      website: 'iulambdachi.org',
      instagram: '@lambdachi_iu',
      currentBrands: ['Reebok', 'Five Guys'],
      greekRank: 3.9,
      house: '915 N Jordan Ave'
    }
  ];

  // Filter and sort logic
  const filteredChapters = chapters
    .filter(chapter => {
      const matchesSearch =
        chapter.fraternity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.chapterName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesState = filterState === 'all' || chapter.state === filterState;

      return matchesSearch && matchesState;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'size':
          return b.size - a.size;
        case 'name':
          return a.fraternity.localeCompare(b.fraternity);
        case 'university':
          return a.university.localeCompare(b.university);
        default:
          return 0;
      }
    });

  // Get unique states for filter
  const states = [...new Set(chapters.map(c => c.state))].sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fraternity Chapters</h1>
          <p className="text-gray-600 mt-2">Manage and view all active fraternity chapters</p>
        </div>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Add New Chapter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{chapters.length}</p>
              <p className="text-sm text-gray-600">Total Chapters</p>
            </div>
            <Users className="w-8 h-8 text-primary-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {chapters.reduce((sum, ch) => sum + ch.size, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Members</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(chapters.reduce((sum, ch) => sum + ch.size, 0) / chapters.length)}
              </p>
              <p className="text-sm text-gray-600">Avg Chapter Size</p>
            </div>
            <Award className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{states.length}</p>
              <p className="text-sm text-gray-600">States</p>
            </div>
            <MapPin className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by fraternity, university, or chapter..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="size">Sort by Size</option>
            <option value="name">Sort by Name</option>
            <option value="university">Sort by University</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
          >
            <option value="all">All States</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chapters List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fraternity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  University
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chapter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  President
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Greek Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredChapters.map((chapter) => (
                <tr key={chapter.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{chapter.fraternity}</div>
                    <div className="text-sm text-gray-500">{chapter.chapterName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{chapter.university}</div>
                    <div className="text-sm text-gray-500">{chapter.state}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Founded {chapter.founded}</div>
                    <div className="text-sm text-gray-500">{chapter.house}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-gray-900">{chapter.size}</div>
                    <div className="text-sm text-gray-500">members</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{chapter.president}</div>
                    <div className="text-sm text-gray-500">{chapter.presidentEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{chapter.greekRank}</span>
                      <span className="text-sm text-gray-500 ml-1">/ 5.0</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/app/chapters/${chapter.id}`}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      View Profile
                    </Link>
                    <button className="text-gray-600 hover:text-gray-900">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Featured Chapter - Sigma Chi Penn State */}
      <div className="bg-gradient-to-r from-blue-600 to-yellow-500 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Featured Chapter: Sigma Chi - Penn State</h2>
            <p className="text-lg mb-4">Beta Theta Chapter • 145 Members</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Leadership</h3>
                <p className="text-sm">President: Michael Thompson</p>
                <p className="text-sm">VP: James Wilson</p>
                <p className="text-sm">Rush Chair: Connor Mitchell</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Partner Brands</h3>
                <div className="flex flex-wrap gap-2">
                  {['Nike', 'Chipotle', 'Red Bull', 'State Farm'].map(brand => (
                    <span key={brand} className="bg-white/20 px-2 py-1 rounded text-sm">
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <a href="https://sigmachipsu.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                <Globe className="w-4 h-4" />
                Website
              </a>
              <a href="https://instagram.com/sigmachi_psu" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                <Instagram className="w-4 h-4" />
                @sigmachi_psu
              </a>
            </div>
          </div>
          <Link
            to="/app/chapters/1"
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            View Full Profile
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChaptersPage;