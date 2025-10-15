import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Download,
  UserPlus
} from 'lucide-react';
import { getCollegeLogoWithFallback } from '../utils/collegeLogos';
import UnlockConfirmationModal from '../components/UnlockConfirmationModal';

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
  grade?: number;
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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'grade' | 'name' | 'university'>('grade');
  const [filterState, setFilterState] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedIntros, setRequestedIntros] = useState<Set<string>>(new Set());
  const [unlockedChapterIds, setUnlockedChapterIds] = useState<Set<string>>(new Set());
  const [balance, setBalance] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

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

  // Fetch unlocked chapters for the current user
  useEffect(() => {
    const fetchUnlockedChapters = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${API_URL}/chapters/unlocked`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          const unlockedIds = new Set<string>(data.data.map((chapter: any) => chapter.id));
          setUnlockedChapterIds(unlockedIds);
        }
      } catch (error) {
        console.error('Error fetching unlocked chapters:', error);
      }
    };

    fetchUnlockedChapters();
  }, []);

  // Fetch credit balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${API_URL}/credits/balance`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setBalance(data.balance || 0);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
  }, []);

  const handleRequestIntro = async (chapter: Chapter) => {
    try {
      const response = await fetch(`${API_URL}/intro-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapter_id: chapter.id,
          chapter_name: chapter.chapter_name,
          fraternity_name: chapter.greek_organizations?.name,
          university_name: chapter.universities?.name,
          grade: chapter.grade
        })
      });

      if (response.ok) {
        setRequestedIntros(prev => new Set(prev).add(chapter.id));
      }
    } catch (error) {
      console.error('Error requesting intro:', error);
    }
  };

  // Calculate unlock pricing based on chapter grade
  const calculateUnlockPricing = (grade?: number) => {
    const rank = grade || 4.0;
    let credits = 5;
    let tierLabel = 'Good';
    let tierBadge = '';

    if (rank >= 5.0) {
      credits = 9;
      tierLabel = 'Premium';
      tierBadge = '⭐ Top Rated';
    } else if (rank >= 4.5) {
      credits = 7;
      tierLabel = 'Quality';
      tierBadge = '🔥 Most Popular';
    } else if (rank >= 4.0) {
      credits = 5;
      tierLabel = 'Good';
      tierBadge = '💎 Best Value';
    } else if (rank >= 3.5) {
      credits = 3;
      tierLabel = 'Standard';
      tierBadge = '';
    } else if (rank >= 3.0) {
      credits = 2;
      tierLabel = 'Basic';
      tierBadge = '';
    } else {
      credits = 1;
      tierLabel = 'Budget';
      tierBadge = '🎯 Best Deal';
    }

    return { credits, tierLabel, tierBadge };
  };

  // Handle unlock action
  const handleUnlock = async () => {
    if (!selectedChapter) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to unlock chapters');
      return;
    }

    const pricing = calculateUnlockPricing(selectedChapter.grade);

    try {
      const response = await fetch(`${API_URL}/chapters/${selectedChapter.id}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ unlockType: 'full' })
      });

      const data = await response.json();

      if (response.ok) {
        setUnlockedChapterIds(prev => new Set(prev).add(selectedChapter.id));
        setBalance(data.balance || balance - pricing.credits);
        // Navigate to the chapter detail page after successful unlock
        navigate(`/app/chapters/${selectedChapter.id}`);
      } else {
        alert(`❌ ${data.error || 'Failed to unlock chapter'}`);
      }
    } catch (error) {
      console.error('Error unlocking chapter:', error);
      alert('Error unlocking chapter. Please try again.');
    }
  };

  // Filter and sort logic adapted for database structure
  const filteredChapters = chapters
    .filter(chapter => {
      const fraternityName = chapter.greek_organizations?.name || '';
      const universityName = chapter.universities?.name || '';
      const chapterName = chapter.chapter_name || '';
      const state = chapter.universities?.state || '';
      const orgType = chapter.greek_organizations?.organization_type;

      // Only show fraternities on this page
      const isFraternity = orgType === 'fraternity';

      const matchesSearch =
        fraternityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        universityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapterName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesState = filterState === 'all' || state === filterState;

      return isFraternity && matchesSearch && matchesState;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'grade':
          return (b.grade || 0) - (a.grade || 0);
        case 'name':
          return (a.greek_organizations?.name || '').localeCompare(b.greek_organizations?.name || '');
        case 'university':
          return (a.universities?.name || '').localeCompare(b.universities?.name || '');
        default:
          return 0;
      }
    });

  // Get only fraternity chapters for stats
  const fraternityChapters = chapters.filter(ch => ch.greek_organizations?.organization_type === 'fraternity');

  // Get unique states for filter
  const states = [...new Set(fraternityChapters.map(c => c.universities?.state).filter(Boolean))].sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Fraternities</h1>
          <p className="text-sm text-gray-600 mt-1">Explore fraternity chapters across the country</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white rounded-md shadow-sm p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">{fraternityChapters.length}</p>
              <p className="text-xs text-gray-600">Fraternity Chapters</p>
            </div>
            <Users className="w-5 h-5 text-primary-500" />
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">
                {fraternityChapters.reduce((sum, ch) => sum + (ch.member_count || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">Total Members</p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">
                {fraternityChapters.length > 0 ? Math.round(fraternityChapters.reduce((sum, ch) => sum + (ch.member_count || 0), 0) / fraternityChapters.length) : 0}
              </p>
              <p className="text-xs text-gray-600">Avg Chapter Size</p>
            </div>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">{states.length}</p>
              <p className="text-xs text-gray-600">States</p>
            </div>
            <MapPin className="w-5 h-5 text-purple-500" />
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
            <option value="grade">Sort by Grade</option>
            <option value="name">Sort by Name</option>
            <option value="university">Sort by College</option>
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
                    Grade
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
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      Loading chapters...
                    </td>
                  </tr>
                ) : filteredChapters.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
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
                        {chapter.grade ? (
                          <span className={`px-2 py-1 font-bold rounded text-sm ${
                            chapter.grade >= 5.0 ? 'bg-green-100 text-green-800' :
                            chapter.grade >= 4.0 ? 'bg-yellow-100 text-yellow-800' :
                            chapter.grade >= 3.0 ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {chapter.grade.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
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
                        <div className="text-lg font-semibold text-gray-900">50+</div>
                        <div className="text-sm text-gray-500">members</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {unlockedChapterIds.has(chapter.id) ? (
                          <>
                            <div className="text-sm text-green-700 font-medium">Contact Unlocked</div>
                            <div className="text-sm text-gray-500">View chapter details</div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm text-gray-900">Contact Locked</div>
                            <div className="text-sm text-gray-500">Unlock to view</div>
                          </>
                        )}
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
          {filteredChapters.map((chapter) => {
            const isUnlocked = unlockedChapterIds.has(chapter.id);
            return (
            <Link
              key={chapter.id}
              to={`/app/chapters/${chapter.id}`}
              className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border relative group ${
                isUnlocked
                  ? 'border-green-400 hover:border-green-500'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
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
                  {unlockedChapterIds.has(chapter.id) ? (
                    <div className="bg-green-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-green-600">
                      <Unlock className="w-3.5 h-3.5 text-white" />
                      <span className="text-xs font-semibold text-white">Unlocked</span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedChapter(chapter);
                        setIsModalOpen(true);
                      }}
                      className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-xs font-semibold text-gray-700">Click to unlock</span>
                    </button>
                  )}
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
                  50+ members
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Founded {chapter.founded_date ? new Date(chapter.founded_date).getFullYear() : '-'}
                </div>
              </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      {unlockedChapterIds.has(chapter.id) ? (
                        <>
                          <p className="font-medium text-green-700">Contact Unlocked</p>
                          <p className="text-gray-500">View chapter details</p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-gray-900">Contact Locked</p>
                          <p className="text-gray-500">Unlock to view</p>
                        </>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 text-yellow-500 mr-1" />
                      {chapter.grade ? (
                        <span className={`text-sm font-bold px-2 py-1 rounded ${
                          chapter.grade >= 5.0 ? 'bg-green-100 text-green-800' :
                          chapter.grade >= 4.0 ? 'bg-yellow-100 text-yellow-800' :
                          chapter.grade >= 3.0 ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {chapter.grade.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-gray-400">-</span>
                      )}
                    </div>
                  </div>
                </div>

                {(chapter.instagram_handle || (chapter.grade && chapter.grade >= 4.0)) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between gap-4">
                    {chapter.instagram_handle && (
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(`https://instagram.com/${chapter.instagram_handle.replace('@', '')}`, '_blank', 'noopener,noreferrer');
                        }}
                        className="flex items-center text-sm text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
                      >
                        <Instagram className="w-4 h-4 mr-2" />
                        {chapter.instagram_handle.startsWith('@') ? chapter.instagram_handle : `@${chapter.instagram_handle}`}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </div>
                    )}
                    {chapter.grade && chapter.grade >= 4.0 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRequestIntro(chapter);
                        }}
                        disabled={requestedIntros.has(chapter.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          requestedIntros.has(chapter.id)
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        {requestedIntros.has(chapter.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Requested
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Request an Intro
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </Link>
            );
          })}
        </div>
      )}

      {/* Unlock Confirmation Modal */}
      {selectedChapter && (
        <UnlockConfirmationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedChapter(null);
          }}
          onConfirm={handleUnlock}
          chapterName={`${selectedChapter.greek_organizations?.name} - ${selectedChapter.chapter_name}`}
          credits={calculateUnlockPricing(selectedChapter.grade).credits}
          balance={balance}
          tierLabel={calculateUnlockPricing(selectedChapter.grade).tierLabel}
          tierBadge={calculateUnlockPricing(selectedChapter.grade).tierBadge}
        />
      )}
    </div>
  );
};

export default ChaptersPage;