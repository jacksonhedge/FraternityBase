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
  UserPlus,
  Star,
  Building2
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
  coming_soon_date?: string;
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
    conference?: string;
    division?: string;
  };
}

// Power 5 Conferences (matches database format - uppercase)
const POWER_5_CONFERENCES = ['SEC', 'BIG 10', 'BIG 12', 'ACC'];

// All major conferences
const CONFERENCES = [
  'Big Ten',
  'SEC',
  'ACC',
  'Big 12',
  'Pac-12',
  'American',
  'Mountain West',
  'Conference USA',
  'MAC',
  'Sun Belt',
  'Independent',
  'Ivy League'
];

const ChaptersPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'grade' | 'name' | 'university' | 'conference'>('grade');
  const [filterState, setFilterState] = useState('all');
  const [filterConference, setFilterConference] = useState('all'); // Show all conferences by default
  const [filterDivision, setFilterDivision] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedIntros, setRequestedIntros] = useState<Set<string>>(new Set());
  const [interestedChapterIds, setInterestedChapterIds] = useState<Set<string>>(new Set());
  const [unlockedChapterIds, setUnlockedChapterIds] = useState<Set<string>>(new Set());
  const [balance, setBalance] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlocks, setUnlocks] = useState<{
    fiveStar: { remaining: number; monthly: number; isUnlimited: boolean };
    fourStar: { remaining: number; monthly: number; isUnlimited: boolean };
    threeStar: { remaining: number; monthly: number; isUnlimited: boolean };
  } | null>(null);
  const [hideUnlocked, setHideUnlocked] = useState(false);

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

  // Fetch credit balance and unlock counts
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('❌ No token found, skipping balance fetch');
          return;
        }

        console.log('💰 Fetching balance from:', `${API_URL}/credits/balance`);
        const res = await fetch(`${API_URL}/credits/balance`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        console.log('💰 Raw API response:', data);
        console.log('💰 Balance fields:', {
          'data.balance': data.balance,
          'data.balanceCredits': data.balanceCredits,
          'data.credits': data.credits
        });
        console.log('💰 Unlocks data:', {
          'data.unlocks': data.unlocks,
          'data.subscriptionUnlocks': data.subscriptionUnlocks,
          'data.remainingSubscriptionUnlocks': data.remainingSubscriptionUnlocks
        });

        // Try multiple possible field names for balance
        const balanceValue = data.balance || data.balanceCredits || data.credits || 0;
        console.log('💰 Setting balance to:', balanceValue);
        setBalance(balanceValue);

        // Try multiple possible field names for unlocks
        const unlocksValue = data.unlocks || data.subscriptionUnlocks || data.remainingSubscriptionUnlocks || null;
        console.log('💰 Setting unlocks to:', unlocksValue);
        setUnlocks(unlocksValue);

        console.log('✅ Balance fetch complete:', {
          balance: balanceValue,
          unlocks: unlocksValue
        });
      } catch (error) {
        console.error('❌ Error fetching balance:', error);
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

  const handleToggleInterested = (e: React.MouseEvent, chapterId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setInterestedChapterIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
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
    if (!selectedChapter || isUnlocking) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to unlock chapters');
      return;
    }

    setIsUnlocking(true);
    const pricing = calculateUnlockPricing(selectedChapter.grade);

    try {
      console.log('🔓 Unlocking chapter:', selectedChapter.id);

      const response = await fetch(`${API_URL}/chapters/${selectedChapter.id}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ unlockType: 'full' })
      });

      const data = await response.json();
      console.log('🔓 Unlock response:', data);

      if (response.ok) {
        setUnlockedChapterIds(prev => new Set(prev).add(selectedChapter.id));
        setBalance(data.balance || balance - pricing.credits);

        // Update unlock counts if subscription unlock was used
        if (data.usedSubscriptionUnlock && data.remainingSubscriptionUnlocks) {
          const remaining = data.remainingSubscriptionUnlocks;
          setUnlocks(prev => prev ? {
            ...prev,
            fiveStar: { ...prev.fiveStar, remaining: remaining.fiveStar },
            fourStar: { ...prev.fourStar, remaining: remaining.fourStar },
            threeStar: { ...prev.threeStar, remaining: remaining.threeStar }
          } : null);
        }

        // Dispatch custom event to notify Layout component to refresh balance/unlocks
        window.dispatchEvent(new CustomEvent('balanceUpdated', {
          detail: {
            balance: data.balance,
            unlocks: data.remainingSubscriptionUnlocks,
            usedSubscription: data.usedSubscriptionUnlock
          }
        }));
        console.log('📢 Dispatched balanceUpdated event');

        // Close modal and navigate on success
        setIsModalOpen(false);
        setSelectedChapter(null);
        navigate(`/app/chapters/${selectedChapter.id}`);
      } else {
        console.error('❌ Unlock failed:', data.error);
        alert(`❌ ${data.error || 'Failed to unlock chapter'}`);
      }
    } catch (error) {
      console.error('❌ Error unlocking chapter:', error);
      alert('Error unlocking chapter. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  // Filter and sort logic adapted for database structure
  const filteredChapters = chapters
    .filter(chapter => {
      const fraternityName = chapter.greek_organizations?.name || '';
      const universityName = chapter.universities?.name || '';
      const chapterName = chapter.chapter_name || '';
      const state = chapter.universities?.state || '';
      const conference = chapter.universities?.conference || '';
      const division = chapter.universities?.division || '';
      const orgType = chapter.greek_organizations?.organization_type;

      // Only show fraternities on this page
      const isFraternity = orgType === 'fraternity';

      const matchesSearch =
        fraternityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        universityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapterName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesState = filterState === 'all' || state === filterState;

      // Conference filter - matches CollegesPage.tsx logic exactly
      let matchesConference = true;
      if (filterConference === 'all') {
        matchesConference = true;
      } else if (filterConference === 'Power 5') {
        // Filter by Power 4 conferences (SEC, Big 10, Big 12, ACC) - same as CollegesPage
        const power4Conferences = ['SEC', 'BIG 10', 'BIG 12', 'ACC'];
        matchesConference = power4Conferences.includes(conference);
      } else {
        matchesConference = conference === filterConference;
      }

      const matchesDivision = filterDivision === 'all' || division === filterDivision;

      // Hide unlocked chapters filter
      const matchesUnlockedFilter = !hideUnlocked || !unlockedChapterIds.has(chapter.id);

      return isFraternity && matchesSearch && matchesState && matchesConference && matchesDivision && matchesUnlockedFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'grade':
          return (b.grade || 0) - (a.grade || 0);
        case 'name':
          return (a.greek_organizations?.name || '').localeCompare(b.greek_organizations?.name || '');
        case 'university':
          return (a.universities?.name || '').localeCompare(b.universities?.name || '');
        case 'conference':
          return (a.universities?.conference || '').localeCompare(b.universities?.conference || '');
        default:
          return 0;
      }
    });

  // Get only fraternity chapters for stats
  const fraternityChapters = chapters.filter(ch => ch.greek_organizations?.organization_type === 'fraternity');

  // Get unique states for filter
  const states = [...new Set(fraternityChapters.map(c => c.universities?.state).filter(Boolean))].sort();

  // Get unique conferences for filter
  const activeConferences = [...new Set(fraternityChapters.map(c => c.universities?.conference).filter(Boolean))].sort();

  // Get unique divisions for filter
  const activeDivisions = [...new Set(fraternityChapters.map(c => c.universities?.division).filter(Boolean))].sort();

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
            <option value="conference">Sort by Conference</option>
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
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filterConference}
            onChange={(e) => setFilterConference(e.target.value)}
          >
            <option value="all">All Conferences</option>
            <option value="Power 5">⭐ Power 5</option>
            {activeConferences.map(conference => (
              <option key={conference} value={conference}>{conference}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filterDivision}
            onChange={(e) => setFilterDivision(e.target.value)}
          >
            <option value="all">All Divisions</option>
            {activeDivisions.map(division => (
              <option key={division} value={division}>{division}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Hide Unlocked Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setHideUnlocked(!hideUnlocked)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            hideUnlocked
              ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {hideUnlocked ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Show Unlocked</span>
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              <span>Hide Unlocked</span>
            </>
          )}
        </button>
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
                          {unlockedChapterIds.has(chapter.id) ? (
                            <>
                              <Unlock className="w-4 h-4 text-green-500" />
                              <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                                Unlocked
                              </span>
                            </>
                          ) : chapter.coming_soon_date ? (
                            <>
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                Coming {new Date(chapter.coming_soon_date).toLocaleDateString()}
                              </span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 text-gray-400" />
                              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                Locked
                              </span>
                            </>
                          )}
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
                  ) : chapter.coming_soon_date ? (
                    <div className="bg-blue-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-blue-600">
                      <Clock className="w-3.5 h-3.5 text-white" />
                      <span className="text-xs font-semibold text-white">Coming {new Date(chapter.coming_soon_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
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
                {/* Member Icons with Fan Effect */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    Members
                  </span>
                  <div className="relative h-6 w-16 group">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-5 h-5 bg-blue-100 border border-blue-300 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-blue-200"
                        style={{
                          left: `${i * 8}px`,
                          transform: `translateY(0px) rotate(0deg)`,
                          zIndex: 5 - i,
                        }}
                        onMouseEnter={(e) => {
                          const angle = (i - 2) * 15;
                          const yOffset = Math.abs(i - 2) * 6;
                          e.currentTarget.style.transform = `translateY(-${yOffset}px) rotate(${angle}deg)`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = `translateY(0px) rotate(0deg)`;
                        }}
                      >
                        <Users className="w-2.5 h-2.5 text-blue-600" />
                      </div>
                    ))}
                  </div>
                </div>
                {chapter.house_address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                    {chapter.house_address}
                  </div>
                )}
              </div>

                {/* Grade Badge */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
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
                  {chapter.instagram_handle && (
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(`https://instagram.com/${chapter.instagram_handle.replace('@', '')}`, '_blank', 'noopener,noreferrer');
                      }}
                      className="flex items-center text-sm text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
                    >
                      <Instagram className="w-4 h-4 mr-1" />
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  {!isUnlocked && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedChapter(chapter);
                        setIsModalOpen(true);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Click to Unlock
                    </button>
                  )}
                  <button
                    onClick={(e) => handleToggleInterested(e, chapter.id)}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1.5 ${
                      interestedChapterIds.has(chapter.id)
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${interestedChapterIds.has(chapter.id) ? 'fill-white' : ''}`} />
                    {interestedChapterIds.has(chapter.id) ? 'Interested' : 'Mark Interested'}
                  </button>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      )}

      {/* Unlock Confirmation Modal */}
      {selectedChapter && (() => {
        const grade = selectedChapter.grade || 3.0;
        let subscriptionUnlocksRemaining = 0;
        let isUnlimitedUnlocks = false;
        let willUseSubscriptionUnlock = false;

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎯 MODAL RENDER - Chapter Selected:', selectedChapter.chapter_name);
        console.log('🎯 Grade:', grade, '(type:', typeof grade, ')');
        console.log('🎯 Current balance state:', balance);
        console.log('🎯 Current unlocks state:', unlocks);
        console.log('🎯 Modal open:', isModalOpen);

        if (unlocks) {
          console.log('✅ Unlocks object exists, checking tier...');

          if (grade >= 5.0) {
            console.log('⭐ This is a 5.0 star chapter');
            console.log('⭐ unlocks.fiveStar:', unlocks.fiveStar);
            subscriptionUnlocksRemaining = unlocks.fiveStar?.remaining || 0;
            isUnlimitedUnlocks = unlocks.fiveStar?.isUnlimited || false;
            console.log('⭐ Extracted values:', { subscriptionUnlocksRemaining, isUnlimitedUnlocks });
          } else if (grade >= 4.0) {
            console.log('💎 This is a 4.0 star chapter');
            console.log('💎 unlocks.fourStar:', unlocks.fourStar);
            subscriptionUnlocksRemaining = unlocks.fourStar?.remaining || 0;
            isUnlimitedUnlocks = unlocks.fourStar?.isUnlimited || false;
            console.log('💎 Extracted values:', { subscriptionUnlocksRemaining, isUnlimitedUnlocks });
          } else if (grade >= 3.0) {
            console.log('🟢 This is a 3.0 star chapter');
            console.log('🟢 unlocks.threeStar:', unlocks.threeStar);
            subscriptionUnlocksRemaining = unlocks.threeStar?.remaining || 0;
            isUnlimitedUnlocks = unlocks.threeStar?.isUnlimited || false;
            console.log('🟢 Extracted values:', { subscriptionUnlocksRemaining, isUnlimitedUnlocks });
          }

          willUseSubscriptionUnlock = isUnlimitedUnlocks || subscriptionUnlocksRemaining > 0;
          console.log('🔍 Calculation: isUnlimitedUnlocks =', isUnlimitedUnlocks, '|| subscriptionUnlocksRemaining =', subscriptionUnlocksRemaining, '> 0');
          console.log('✅ willUseSubscriptionUnlock:', willUseSubscriptionUnlock);
        } else {
          console.log('❌ No unlocks data available - unlocks is null/undefined');
          console.log('❌ This will default to credit unlock');
        }

        const modalProps = {
          isOpen: isModalOpen,
          onClose: () => {
            if (!isUnlocking) {
              setIsModalOpen(false);
              setSelectedChapter(null);
            }
          },
          onConfirm: handleUnlock,
          chapterName: `${selectedChapter.greek_organizations?.name} - ${selectedChapter.chapter_name}`,
          credits: calculateUnlockPricing(selectedChapter.grade).credits,
          balance: balance,
          tierLabel: calculateUnlockPricing(selectedChapter.grade).tierLabel,
          tierBadge: calculateUnlockPricing(selectedChapter.grade).tierBadge,
          isUnlocking: isUnlocking,
          subscriptionUnlocksRemaining: subscriptionUnlocksRemaining,
          isUnlimitedUnlocks: isUnlimitedUnlocks,
          willUseSubscriptionUnlock: willUseSubscriptionUnlock
        };

        console.log('📤 Props being passed to UnlockConfirmationModal:', modalProps);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        return (
          <UnlockConfirmationModal {...modalProps} />
        );
      })()}
    </div>
  );
};

export default ChaptersPage;