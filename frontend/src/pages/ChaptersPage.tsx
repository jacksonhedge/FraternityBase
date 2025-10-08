import { useState, useEffect } from 'react';
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
  Globe,
  List,
  Grid3x3,
  Unlock,
  Lock,
  Clock,
  CheckCircle,
  Mail,
  Phone,
  Download
} from 'lucide-react';
import { getCollegeLogoWithFallback } from '../utils/collegeLogos';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Chapter {
  id: string;
  chapter_name: string;
  member_count?: number;
  status: string;
  founded_date?: string;
  house_address?: string;
  instagram_handle?: string;
  website?: string;
  contact_email?: string;
  phone?: string;
  header_image_url?: string;
  greek_organizations?: {
    id: string;
    name: string;
    greek_letters?: string;
    organization_type: 'fraternity' | 'sorority';
  };
  universities?: {
    id: string;
    name: string;
    location: string;
    state: string;
    student_count?: number;
    logo_url?: string;
  };
}

const ChaptersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'size' | 'name' | 'university'>('size');
  const [filterState, setFilterState] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch chapters from database
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await fetch(`${API_URL}/chapters`);
        const data = await res.json();
        if (data.success) {
          setChapters(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching chapters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  // Filter and sort logic adapted for database structure
  const filteredChapters = chapters
    .filter(chapter => {
      const fraternityName = chapter.greek_organizations?.name || '';
      const universityName = chapter.universities?.name || '';
      const chapterName = chapter.chapter_name || '';
      const state = chapter.universities?.state || '';

      const matchesSearch =
        fraternityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        universityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapterName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesState = filterState === 'all' || state === filterState;

      return matchesSearch && matchesState;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'size':
          return (b.member_count || 0) - (a.member_count || 0);
        case 'name':
          return (a.greek_organizations?.name || '').localeCompare(b.greek_organizations?.name || '');
        case 'university':
          return (a.universities?.name || '').localeCompare(b.universities?.name || '');
        default:
          return 0;
      }
    });

  // Get unique states for filter
  const states = [...new Set(chapters.map(c => c.universities?.state).filter(Boolean))].sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse All Chapters</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
          </div>
        </div>
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
                {chapters.reduce((sum, ch) => sum + (ch.member_count || 0), 0).toLocaleString()}
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
                {chapters.length > 0 ? Math.round(chapters.reduce((sum, ch) => sum + (ch.member_count || 0), 0) / chapters.length) : 0}
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

      {/* Chapters List or Grid */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Loading chapters...
                    </td>
                  </tr>
                ) : filteredChapters.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No chapters found
                    </td>
                  </tr>
                ) : (
                  filteredChapters.map((chapter) => (
                    <tr key={chapter.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            Locked
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{chapter.greek_organizations?.name || '-'}</div>
                        <div className="text-sm text-gray-500">{chapter.chapter_name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={chapter.universities?.logo_url || getCollegeLogoWithFallback(chapter.universities?.name || '')}
                            alt={chapter.universities?.name || ''}
                            className="w-10 h-10 rounded-lg object-contain"
                          />
                          <div>
                            <div className="text-sm text-gray-900">{chapter.universities?.name || '-'}</div>
                            <div className="text-sm text-gray-500">{chapter.universities?.state || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{chapter.founded_date ? `Founded ${new Date(chapter.founded_date).getFullYear()}` : '-'}</div>
                        <div className="text-sm text-gray-500">{chapter.house_address || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-semibold text-gray-900">{chapter.member_count || '-'}</div>
                        <div className="text-sm text-gray-500">members</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Contact Locked</div>
                        <div className="text-sm text-gray-500">Unlock to view</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/app/chapters/${chapter.id}`}
                          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-900"
                        >
                          <span>View Details</span>
                          <Unlock className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChapters.map((chapter) => (
            <Link
              key={chapter.id}
              to={`/app/chapters/${chapter.id}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200 hover:border-primary-300 relative group"
            >
              {/* Header Background Image */}
              <div className="h-24 bg-gradient-to-r from-primary-500 to-primary-700 relative">
                {chapter.header_image_url ? (
                  <img
                    src={chapter.header_image_url}
                    alt={`${chapter.greek_organizations?.name} header`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600" />
                )}

                {/* Unlock Badge Overlay */}
                <div className="absolute top-2 right-2">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-gray-200">
                    <Lock className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-xs font-semibold text-gray-700">Unlock</span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 pt-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={chapter.universities?.logo_url || getCollegeLogoWithFallback(chapter.universities?.name || '')}
                      alt={chapter.universities?.name || ''}
                      className="w-14 h-14 object-contain flex-shrink-0 bg-white rounded-lg border border-gray-100 p-1"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{chapter.greek_organizations?.name || '-'}</h3>
                      <p className="text-sm text-gray-600">{chapter.chapter_name || '-'}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded">
                    {chapter.universities?.state || '-'}
                  </span>
                </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {chapter.universities?.name || '-'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  {chapter.member_count || 0} members
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Founded {chapter.founded_date ? new Date(chapter.founded_date).getFullYear() : '-'}
                </div>
              </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Contact Locked</p>
                      <p className="text-gray-500">Unlock to view</p>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-semibold text-gray-900">-</span>
                    </div>
                  </div>
                </div>

                {chapter.instagram_handle && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <a
                      href={`https://instagram.com/${chapter.instagram_handle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center text-sm text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      <Instagram className="w-4 h-4 mr-2" />
                      {chapter.instagram_handle.startsWith('@') ? chapter.instagram_handle : `@${chapter.instagram_handle}`}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChaptersPage;