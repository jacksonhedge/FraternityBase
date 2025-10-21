import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  Globe,
  Instagram,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Building,
  DollarSign,
  ChevronDown,
  ExternalLink,
  Lock,
  Unlock,
  Handshake,
  LayoutGrid,
  Layers
} from 'lucide-react';
import { getCollegeLogoWithFallback } from '../utils/collegeLogos';
import { maskName, maskEmail, maskPhone, getMaskingTier, getMaskingIndicator } from '../utils/dataMasking';
import { analytics } from '../services/analytics';

const ChapterDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedYear, setSelectedYear] = useState('2025-2026');

  // Subscription tier for masking
  const [subscriptionTier, setSubscriptionTier] = useState<string>('trial');

  // Determine back link based on current path
  const backLink = location.pathname.includes('/my-unlocked/') ? '/app/my-unlocked' : '/app/chapters';

  // Credit unlock system
  const [unlockStatus, setUnlockStatus] = useState<string[]>([]);
  const [balance, setBalance] = useState(0);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Chapter data from API
  const [chapterData, setChapterData] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [regularMembers, setRegularMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Introduction request form
  const [introFormData, setIntroFormData] = useState({
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    message: '',
    preferredContactMethod: 'Email'
  });
  const [isSubmittingIntro, setIsSubmittingIntro] = useState(false);
  const [introSubmitted, setIntroSubmitted] = useState(false);
  const [leadershipView, setLeadershipView] = useState<'card' | 'grid'>('card');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (id && token) {
      // Fetch actual chapter data
      fetch(`${API_URL}/chapters/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          console.log('Chapter data from API:', data);
          console.log('🔍 DEBUG - Grade field value:', data.data?.grade, 'Type:', typeof data.data?.grade);
          if (data.success && data.data) {
            setChapterData(data.data);

            // Track chapter view
            analytics.trackChapterView(
              data.data.id,
              data.data.chapter_name || 'Unknown Chapter',
              data.data.universities?.name || 'Unknown University'
            );
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch chapter data:', err);
          setLoading(false);
        });

      // Fetch chapter members and officers
      fetch(`${API_URL}/chapters/${id}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          console.log('Chapter members from API:', data);
          if (data.success) {
            setMembers(data.data || []);
            setOfficers(data.officers || []);
            setRegularMembers(data.regularMembers || []);
          }
        })
        .catch(err => console.error('Failed to fetch chapter members:', err));

      // Fetch unlock status for this chapter
      fetch(`${API_URL}/chapters/${id}/unlock-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUnlockStatus(data.unlocked || []))
        .catch(err => console.error('Failed to fetch unlock status:', err));

      // Fetch credit balance and subscription tier
      fetch(`${API_URL}/credits/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setBalance(data.balance || 0);
          setSubscriptionTier(data.subscriptionTier || 'trial');
        })
        .catch(err => console.error('Failed to fetch balance:', err));
    }
  }, [id, token]);

  const handleUnlock = async (unlockType: string, creditCost: number) => {
    console.log('🔓 handleUnlock called', { unlockType, creditCost, token: token?.substring(0, 20) + '...', id });

    if (!token || !id) {
      console.log('❌ Missing token or id', { hasToken: !!token, hasId: !!id });
      return;
    }

    if (balance < creditCost) {
      console.log('❌ Insufficient credits', { balance, creditCost });
      alert(`Insufficient credits! You need ${creditCost} credits but only have ${balance}.`);
      return;
    }

    const confirmMessage = `This will cost ${creditCost} credits. You currently have ${balance} credits. Continue?`;
    console.log('💬 Showing confirmation dialog');
    if (!confirm(confirmMessage)) {
      console.log('❌ User cancelled');
      return;
    }

    console.log('✅ User confirmed, starting unlock');
    setIsUnlocking(true);

    try {
      const url = `${API_URL}/chapters/${id}/unlock`;
      const payload = { unlockType };
      console.log('📤 Sending unlock request:', { url, payload, API_URL });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('📥 Response received:', { status: response.status, statusText: response.statusText, ok: response.ok });

      const data = await response.json();
      console.log('📊 Response data:', data);

      if (response.ok) {
        console.log('✅ UNLOCK SUCCESSFUL!', data);
        setUnlockStatus([...unlockStatus, unlockType]);
        // Fix: backend sends 'balance' not 'remainingBalance'
        const newBalance = data.balance || data.remainingBalance || balance - (data.creditsSpent || 0);
        setBalance(newBalance);

        // Track chapter unlock
        const chapterName = chapterData?.chapter_name || 'Unknown Chapter';
        analytics.trackChapterUnlock(id!, chapterName, creditCost);

        alert(`✅ Unlocked! ${data.creditsSpent} credits spent. Remaining balance: ${newBalance}`);
        window.location.reload(); // Refresh to show unlocked data
      } else {
        console.error('❌ UNLOCK FAILED:', { status: response.status, error: data.error, data });

        // Special message for database constraint errors
        if (data.error && data.error.includes('constraint')) {
          alert(`❌ DATABASE ERROR: ${data.error}\n\nThe database constraint needs to be fixed. Check console for details.`);
        } else {
          alert(`❌ ${data.error || 'Failed to unlock'}`);
        }
      }
    } catch (error) {
      console.error('Error unlocking chapter:', error);
      alert('Error unlocking chapter. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const isUnlocked = (unlockType: string) => {
    console.log('🔍 isUnlocked check:', { unlockType, unlockStatus, hasFull: unlockStatus.includes('full') });
    // If they have 'full' access, they have everything
    if (unlockStatus.includes('full')) return true;
    // Otherwise check for specific unlock type
    return unlockStatus.includes(unlockType);
  };

  /**
   * Calculate unlock pricing based on chapter rank (matches backend logic)
   */
  const calculateUnlockPricing = (rank: number) => {
    let credits = 5;
    let dollarValue = 4.99;
    let tierLabel = 'Good';
    let tierBadge = '';

    if (rank >= 5.0) {
      // 5.0 star chapter - Premium tier
      credits = 9;
      dollarValue = 8.99;
      tierLabel = 'Premium';
      tierBadge = '⭐ Top Rated';
    } else if (rank >= 4.5) {
      // 4.5-4.9 star chapter - Quality tier (Most Popular)
      credits = 7;
      dollarValue = 6.99;
      tierLabel = 'Quality';
      tierBadge = '🔥 Most Popular';
    } else if (rank >= 4.0) {
      // 4.0-4.4 star chapter - Good tier (Best Value)
      credits = 5;
      dollarValue = 4.99;
      tierLabel = 'Good';
      tierBadge = '💎 Best Value';
    } else if (rank >= 3.5) {
      // 3.5-3.9 star chapter - Standard tier
      credits = 3;
      dollarValue = 2.99;
      tierLabel = 'Standard';
      tierBadge = '';
    } else if (rank >= 3.0) {
      // 3.0-3.4 star chapter - Basic tier
      credits = 2;
      dollarValue = 1.99;
      tierLabel = 'Basic';
      tierBadge = '';
    } else {
      // Below 3.0 or no rank - Budget tier (impulse purchase)
      credits = 1;
      dollarValue = 0.99;
      tierLabel = 'Budget';
      tierBadge = '🎯 Best Deal';
    }

    return { credits, dollarValue, tierLabel, tierBadge };
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700">Loading chapter details...</div>
        </div>
      </div>
    );
  }

  // Show error if no chapter data
  if (!chapterData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700">Chapter not found</div>
          <Link to="/app/map" className="text-primary-600 hover:underline mt-4 inline-block">
            Back to Map
          </Link>
        </div>
      </div>
    );
  }

  // Helper to find officer by position
  const findOfficer = (positionName: string) => {
    const officer = officers.find(o =>
      o.position?.toLowerCase().includes(positionName.toLowerCase())
    );
    if (!officer) return null;
    return {
      name: officer.name || `${officer.first_name} ${officer.last_name}`,
      emails: officer.email ? [officer.email] : [],
      email: officer.email,
      phone: officer.phone,
      major: officer.major || '',
      year: officer.graduation_year ? `Class of ${officer.graduation_year}` : ''
    };
  };

  // Map API data to display format
  console.log('🎯 DEBUG - Mapping chapter data. chapterData.grade =', chapterData.grade, 'Type:', typeof chapterData.grade);

  // Convert grade to number explicitly to handle string/number type issues
  const gradeValue = chapterData.grade ? parseFloat(chapterData.grade) : 4.0;
  console.log('🎯 DEBUG - Parsed grade value:', gradeValue, 'Type:', typeof gradeValue);

  const chapter = {
    id: chapterData.id,
    fraternity: chapterData.greek_organizations?.name || 'Unknown Organization',
    university: chapterData.universities?.name || 'Unknown University',
    state: chapterData.universities?.state || chapterData.state || 'N/A',
    chapterName: chapterData.chapter_name || 'Chapter',
    motto: chapterData.greek_organizations?.motto || '',
    colors: chapterData.greek_organizations?.colors || [],
    founded: chapterData.charter_date ? new Date(chapterData.charter_date).getFullYear() : null,
    house: chapterData.house_address || '',
    website: chapterData.website || '',
    instagram: chapterData.instagram_handle || '',
    greekRank: gradeValue, // Use database grade (0-5.0), converted to number, fallback to 4.0
    isPlatinum: chapterData.is_platinum || false, // Platinum status for chapters with partner intros
    nationalRank: 15, // TODO: Add to database
    lastUpdated: chapterData.updated_at || new Date().toISOString(),
    yearData: {
      '2025-2026': {
        size: chapterData.member_count || 0,
        president: findOfficer('president'),
        vicePresident: findOfficer('vice president') || findOfficer('vp'),
        rushChair: findOfficer('rush'),
        treasurer: findOfficer('treasurer'),
        socialChair: findOfficer('social'),
        philanthropyChair: findOfficer('philanthropy'),
        // currentBrands removed - was hardcoded dummy data
        // events removed - was hardcoded dummy data (Derby Days, Winter Formal, Spring Philanthropy Week)
        // philanthropies removed - was hardcoded dummy data (Huntsman Cancer Institute on all chapters)
        gpa: {
          chapter: 3.42,
          newMember: 3.38,
          allMensAverage: 3.15
        },
        budget: {
          annual: '$450,000',
          dues: '$2,800/semester',
          housing: '$4,200/semester'
        }
      },
      '2024-2025': {
        size: 138,
        president: {
          name: 'William Anderson',
          email: 'wanderson@psu.edu',
          phone: '(814) 555-0200',
          major: 'Engineering',
          year: 'Senior (Graduated)'
        },
        vicePresident: {
          name: 'Michael Thompson',
          email: 'mthompson@psu.edu',
          phone: '(814) 555-0123',
          major: 'Business Administration',
          year: 'Junior'
        },
        rushChair: {
          name: 'Tyler Davis',
          email: 'tdavis@psu.edu',
          phone: '(814) 555-0201',
          major: 'Communications',
          year: 'Junior'
        },
        // currentBrands removed - was hardcoded dummy data
        // philanthropies removed - was hardcoded dummy data (Huntsman Cancer Institute on all chapters)
        gpa: {
          chapter: 3.38,
          newMember: 3.35,
          allMensAverage: 3.12
        }
      },
      '2023-2024': {
        size: 132,
        president: {
          name: 'Robert Johnson',
          email: 'rjohnson@psu.edu',
          phone: '(814) 555-0300',
          major: 'Political Science',
          year: 'Senior (Graduated)'
        },
        // philanthropies removed - was hardcoded dummy data (Huntsman Cancer Institute on all chapters)
        gpa: {
          chapter: 3.35,
          newMember: 3.32,
          allMensAverage: 3.10
        }
      }
    }
  };

  const currentYearData = chapter.yearData[selectedYear];
  const years = Object.keys(chapter.yearData).sort().reverse();

  // Check if chapter has complete data (house address, officers, etc.)
  const hasCompleteData = chapter.house && chapter.house.trim() !== '' && currentYearData.president;

  // Calculate dynamic unlock pricing based on chapter rank
  const unlockPricing = calculateUnlockPricing(chapter.greekRank);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl shadow-lg border-2 border-blue-100 p-6 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl -ml-24 -mb-24"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              to={backLink}
              className="group p-3 bg-white hover:bg-blue-50 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 hover:border-blue-300"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
            </Link>

            {/* College Logo with enhanced styling */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-white p-3 rounded-2xl shadow-lg border-2 border-gray-200 group-hover:border-blue-300 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                <img
                  src={getCollegeLogoWithFallback(chapter.university)}
                  alt={chapter.university}
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                {chapter.fraternity}
              </h1>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {chapter.chapterName}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="w-4 h-4 text-blue-600" />
                  <p className="font-medium">{chapter.university}</p>
                  <span className="text-gray-400">•</span>
                  <MapPin className="w-4 h-4 text-green-600" />
                  <p className="font-medium">{chapter.state}</p>
                </div>
                <Link
                  to={`/app/map?state=${encodeURIComponent(chapter.state)}`}
                  className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <MapPin className="w-4 h-4 group-hover:animate-bounce" />
                  View in Map
                </Link>
              </div>
            </div>
          </div>

          {/* Year Selector */}
          <div className="flex items-center space-x-3 bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">School Year</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="text-sm font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="group relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden p-6">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-white mb-1">{currentYearData.size}</p>
              <p className="text-sm text-white/90 font-medium">Active Members</p>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl transform group-hover:rotate-12 transition-transform duration-300">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden p-6">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-4xl font-bold text-white">{chapter.greekRank.toFixed(1)}</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-2xl ${i < Math.floor(chapter.greekRank) ? 'opacity-100' : 'opacity-30'}`}>⭐</span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-white/90 font-medium mt-1">Chapter Rating</p>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl transform group-hover:rotate-12 transition-transform duration-300">
              <Award className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leadership Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Chapter Leadership</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLeadershipView('card')}
                  className={`p-1.5 rounded ${leadershipView === 'card' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Card View"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLeadershipView('grid')}
                  className={`p-1.5 rounded ${leadershipView === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Award className="w-4 h-4" />
                {balance} credits
              </div>
            </div>
          </div>

          {/* Unlock Banner */}
          {!isUnlocked('officer_contacts') && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">🔓 See Partial Info • Unlock for Full Details</h3>
                    {unlockPricing.tierBadge && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {unlockPricing.tierBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    You can see partial officer names and contact info below. Unlock to reveal complete emails, phone numbers, and names for direct outreach.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUnlock('full', unlockPricing.credits)}
                      disabled={isUnlocking}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUnlocking ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Unlocking...
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" />
                          Unlock for {unlockPricing.credits} Credits
                        </>
                      )}
                    </button>
                    <div className="text-sm text-gray-600">
                      <span className="text-xs text-gray-500">{unlockPricing.tierLabel} tier</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isUnlocked('officer_contacts') && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <Unlock className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Officer contacts unlocked! ✅</span>
            </div>
          )}

          {/* Dynamic Officers List */}
          <div className={`grid gap-4 ${leadershipView === 'grid' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {(() => {
              const filteredOfficers = officers.filter((officer) => officer.position && officer.position.toLowerCase() !== 'member');

              if (filteredOfficers.length > 0) {
                return filteredOfficers
                  .sort((a, b) => {
                    // Define officer position priority
                    const positionOrder: {[key: string]: number} = {
                      'president': 1,
                      'vice president': 2,
                      'vp': 2,
                      'treasurer': 3,
                      'secretary': 4,
                      'rush': 5,
                      'rush chair': 5,
                      'social': 6,
                      'social chair': 6,
                      'philanthropy': 7,
                      'philanthropy chair': 7,
                    };

                    const aPos = a.position?.toLowerCase() || '';
                    const bPos = b.position?.toLowerCase() || '';

                    const aOrder = positionOrder[aPos] || 999;
                    const bOrder = positionOrder[bPos] || 999;

                    return aOrder - bOrder;
                  })
                  .map((officer) => {
                    // Determine masking tier for this officer
                    const maskingTier = getMaskingTier(
                      isUnlocked('officer_contacts'),
                      subscriptionTier
                    );
                    const indicator = getMaskingIndicator(maskingTier);
                    const officerName = officer.name || (officer.first_name && officer.last_name ? `${officer.first_name} ${officer.last_name}` : 'To be Determined');

                    return (
                      <div key={officer.id} className="group relative bg-white border-2 border-gray-200 hover:border-blue-400 rounded-xl p-5 hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
                        {/* Decorative gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* LinkedIn Badge - Top Right */}
                        {officer.linkedin_url && maskingTier === 'unlocked' && (
                          <a
                            href={officer.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-3 right-3 z-20 p-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transition-all transform hover:scale-110"
                            title="View LinkedIn Profile"
                          >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"/>
                            </svg>
                          </a>
                        )}

                        <div className="relative z-10">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="p-2 bg-blue-100 group-hover:bg-blue-200 rounded-lg transform group-hover:rotate-6 transition-all duration-300">
                              <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{officer.position || 'To be Determined'}</h3>
                              <p className="text-gray-900 mt-1 font-medium">
                                {officerName !== 'To be Determined' ? maskName(officerName, maskingTier) : 'To be Determined'}
                                {maskingTier !== 'unlocked' && officerName !== 'To be Determined' && (
                                  <span className="ml-1 text-xs">{indicator}</span>
                                )}
                              </p>
                            </div>
                          </div>
                          {officer.major && officer.graduation_year && (
                            <p className="text-sm text-gray-600 mb-3 pl-11">{officer.major} • Class of {officer.graduation_year}</p>
                          )}
                          <div className="mt-3 space-y-2 pl-11">
                            {officer.email ? (
                              maskingTier === 'unlocked' ? (
                                <a href={`mailto:${officer.email}`} className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium">
                                  <Mail className="w-4 h-4 mr-2" />
                                  {officer.email}
                                </a>
                              ) : (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="w-4 h-4 mr-2" />
                                  <span>{maskEmail(officer.email, maskingTier)}</span>
                                  <span className="ml-1 text-xs">{indicator}</span>
                                </div>
                              )
                            ) : (
                              <p className="text-sm text-gray-500 flex items-center"><Mail className="w-4 h-4 mr-2" />Email: To be Determined</p>
                            )}
                            {officer.phone ? (
                              maskingTier === 'unlocked' ? (
                                <a href={`tel:${officer.phone}`} className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium">
                                  <Phone className="w-4 h-4 mr-2" />
                                  {officer.phone}
                                </a>
                              ) : (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="w-4 h-4 mr-2" />
                                  <span>{maskPhone(officer.phone, maskingTier)}</span>
                                  <span className="ml-1 text-xs">{indicator}</span>
                                </div>
                              )
                            ) : (
                              <p className="text-sm text-gray-500 flex items-center"><Phone className="w-4 h-4 mr-2" />Phone: To be Determined</p>
                            )}
                            {officer.linkedin_url && maskingTier === 'unlocked' && (
                              <a
                                href={officer.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/linkedin flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                              >
                                <div className="w-4 h-4 mr-2 bg-blue-600 group-hover/linkedin:bg-blue-700 rounded flex items-center justify-center transition-colors">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"/>
                                  </svg>
                                </div>
                                LinkedIn Profile
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
              } else {
                return (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    Chapter leadership: To be Determined
                  </div>
                );
              }
            })()}

            {currentYearData.vicePresident && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">Vice President</h3>
                <p className="text-gray-900 mt-1">{currentYearData.vicePresident.name}</p>
                <p className="text-sm text-gray-600">{currentYearData.vicePresident.major} • {currentYearData.vicePresident.year}</p>
                <div className="mt-2 space-y-1">
                  {(currentYearData.vicePresident.emails || [currentYearData.vicePresident.email]).filter(Boolean).map((email, idx) => (
                    <a key={idx} href={`mailto:${email}`} className="flex items-center text-sm text-primary-600 hover:text-primary-700">
                      <Mail className="w-4 h-4 mr-1" />
                      {email}
                    </a>
                  ))}
                  {currentYearData.vicePresident.phone && (
                    <a href={`tel:${currentYearData.vicePresident.phone}`} className="flex items-center text-sm text-primary-600 hover:text-primary-700">
                      <Phone className="w-4 h-4 mr-1" />
                      {currentYearData.vicePresident.phone}
                    </a>
                  )}
                </div>
              </div>
            )}

            {currentYearData.rushChair && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">Rush Chair</h3>
                <p className="text-gray-900 mt-1">{currentYearData.rushChair.name}</p>
                <p className="text-sm text-gray-600">{currentYearData.rushChair.major} • {currentYearData.rushChair.year}</p>
                <div className="mt-2 space-y-1">
                  {(currentYearData.rushChair.emails || [currentYearData.rushChair.email]).filter(Boolean).map((email, idx) => (
                    <a key={idx} href={`mailto:${email}`} className="flex items-center text-sm text-primary-600 hover:text-primary-700">
                      <Mail className="w-4 h-4 mr-1" />
                      {email}
                    </a>
                  ))}
                  {currentYearData.rushChair.phone && (
                    <a href={`tel:${currentYearData.rushChair.phone}`} className="flex items-center text-sm text-primary-600 hover:text-primary-700">
                      <Phone className="w-4 h-4 mr-1" />
                      {currentYearData.rushChair.phone}
                    </a>
                  )}
                </div>
              </div>
            )}

            {currentYearData.treasurer && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">Treasurer</h3>
                <p className="text-gray-900 mt-1">{currentYearData.treasurer.name}</p>
                <p className="text-sm text-gray-600">{currentYearData.treasurer.major} • {currentYearData.treasurer.year}</p>
                <div className="mt-2 space-y-1">
                  {(currentYearData.treasurer.emails || [currentYearData.treasurer.email]).filter(Boolean).map((email, idx) => (
                    <a key={idx} href={`mailto:${email}`} className="flex items-center text-sm text-primary-600 hover:text-primary-700">
                      <Mail className="w-4 h-4 mr-1" />
                      {email}
                    </a>
                  ))}
                  {currentYearData.treasurer.phone && (
                    <a href={`tel:${currentYearData.treasurer.phone}`} className="flex items-center text-sm text-primary-600 hover:text-primary-700">
                      <Phone className="w-4 h-4 mr-1" />
                      {currentYearData.treasurer.phone}
                    </a>
                  )}
                </div>
              </div>
            )}

            {currentYearData.socialChair && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">Social Chair</h3>
                <p className="text-gray-900 mt-1">{currentYearData.socialChair.name}</p>
                <p className="text-sm text-gray-600">{currentYearData.socialChair.major} • {currentYearData.socialChair.year}</p>
                <div className="mt-2 space-y-1">
                  {(currentYearData.socialChair.emails || [currentYearData.socialChair.email]).filter(Boolean).map((email, idx) => (
                    <a key={idx} href={`mailto:${email}`} className="flex items-center text-sm text-primary-600 hover:text-primary-700">
                      <Mail className="w-4 h-4 mr-1" />
                      {email}
                    </a>
                  ))}
                  {currentYearData.socialChair.phone && (
                    <a href={`tel:${currentYearData.socialChair.phone}`} className="flex items-center text-sm text-primary-600 hover:text-primary-700">
                      <Phone className="w-4 h-4 mr-1" />
                      {currentYearData.socialChair.phone}
                    </a>
                  )}
                </div>
              </div>
            )}

            {currentYearData.philanthropyChair && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">Philanthropy Chair</h3>
                <p className="text-gray-900 mt-1">{currentYearData.philanthropyChair.name}</p>
                <p className="text-sm text-gray-600">{currentYearData.philanthropyChair.major} • {currentYearData.philanthropyChair.year}</p>
                <div className="mt-2 space-y-1">
                  {(currentYearData.philanthropyChair.emails || [currentYearData.philanthropyChair.email]).filter(Boolean).map((email, idx) => (
                    <a key={idx} href={`mailto:${email}`} className="flex items-center text-sm text-primary-600 hover:text-primary-700">
                      <Mail className="w-4 h-4 mr-1" />
                      {email}
                    </a>
                  ))}
                  {currentYearData.philanthropyChair.phone && (
                    <a href={`tel:${currentYearData.philanthropyChair.phone}`} className="flex items-center text-sm text-primary-600 hover:text-primary-700">
                      <Phone className="w-4 h-4 mr-1" />
                      {currentYearData.philanthropyChair.phone}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chapter Roster Section */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Chapter Roster</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              {regularMembers.length} members
            </div>
          </div>

          {/* Unlock Full Roster Banner */}
          {!isUnlocked('roster_access') && regularMembers.length > 0 && (
            <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-300 rounded-xl shadow-md">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Lock className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">🔓 Unlock Complete Chapter Roster</h3>
                    <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">
                      Best Value 💎
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    Get full access to the complete member roster with names, majors, graduation years, and LinkedIn profiles.
                    Perfect for recruitment, networking, and partnership opportunities.
                  </p>

                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 mb-4 border border-purple-200">
                    <p className="text-xs font-semibold text-gray-700 mb-3">What's included:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">✓</span>
                        <span className="text-xs text-gray-600">Full names for all {regularMembers.length}+ members</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">✓</span>
                        <span className="text-xs text-gray-600">Majors and academic details</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">✓</span>
                        <span className="text-xs text-gray-600">Graduation years (Class of)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">✓</span>
                        <span className="text-xs text-gray-600">LinkedIn profile links</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">✓</span>
                        <span className="text-xs text-gray-600">Member contact information</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">✓</span>
                        <span className="text-xs text-gray-600">Lifetime access to this roster</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleUnlock('roster_access', 15)}
                      disabled={isUnlocking}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      {isUnlocking ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Unlocking...
                        </>
                      ) : (
                        <>
                          <Unlock className="w-5 h-5" />
                          Unlock Full Roster for 15 Credits
                        </>
                      )}
                    </button>
                    <div className="text-sm">
                      <p className="text-gray-700 font-semibold">≈ $15.00 value</p>
                      <p className="text-xs text-gray-500">One-time unlock • Lifetime access</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isUnlocked('roster_access') && (
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2">
              <Unlock className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Full roster unlocked! ✅ You have complete access to all member details</span>
            </div>
          )}

          {regularMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regularMembers.map((member) => {
                const maskingTier = getMaskingTier(
                  isUnlocked('roster_access'),
                  subscriptionTier
                );
                const indicator = getMaskingIndicator(maskingTier);
                const memberName = member.name || (member.first_name && member.last_name ? `${member.first_name} ${member.last_name}` : 'Member');

                return (
                  <div key={member.id} className="group relative bg-white border-2 border-gray-200 hover:border-indigo-400 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden">
                    {/* Decorative gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10 flex items-start gap-3">
                      {chapterData?.universities && (
                        <div className="flex-shrink-0">
                          <img
                            src={chapterData.universities.logo_url || getCollegeLogoWithFallback(chapterData.universities.name)}
                            alt={chapterData.universities.name}
                            className="w-12 h-12 object-contain bg-white rounded-lg border-2 border-gray-200 group-hover:border-indigo-300 p-1.5 shadow-sm transform group-hover:rotate-3 transition-all duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-bold truncate group-hover:text-indigo-600 transition-colors">
                          {maskName(memberName, maskingTier)}
                          {maskingTier !== 'unlocked' && (
                            <span className="ml-1 text-xs">{indicator}</span>
                          )}
                        </p>
                        {member.major && (
                          <p className="text-sm text-gray-600 truncate mt-0.5">{member.major}</p>
                        )}
                        {member.graduation_year && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Class of {member.graduation_year}
                          </p>
                        )}
                        {member.linkedin_url && maskingTier === 'unlocked' && (
                          <a
                            href={member.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 mt-2 font-medium"
                          >
                            <Globe className="w-3 h-3" />
                            LinkedIn Profile
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Chapter roster information coming soon</p>
            </div>
          )}
        </div>

        {/* Warm Introduction Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Handshake className={`w-6 h-6 ${chapter.isPlatinum ? 'text-blue-600' : 'text-emerald-600'}`} />
            Personal Introduction
            {chapter.isPlatinum && <span className="text-2xl">💎</span>}
          </h2>

          {!isUnlocked('warm_introduction') ? (
            <div className={`bg-gradient-to-r ${chapter.isPlatinum ? 'from-blue-50 to-indigo-100 border-2 border-blue-300' : 'from-emerald-50 to-teal-50 border-2 border-emerald-200'} rounded-lg p-6`}>
              <div className="flex items-start gap-3">
                <Lock className={`w-5 h-5 ${chapter.isPlatinum ? 'text-blue-600' : 'text-emerald-600'} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    {chapter.isPlatinum && <span className="text-xl">💎</span>}
                    {chapter.isPlatinum ? 'Platinum Chapter - Priority Introduction' : '🤝 Get a Personal Introduction'}
                  </h3>
                  {chapter.isPlatinum && (
                    <div className="mb-3 p-2 bg-blue-100 border border-blue-200 rounded-md">
                      <p className="text-xs font-semibold text-blue-900">
                        ⭐ This is a Platinum chapter with verified contact data and existing partner relationships
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-gray-700 mb-4">
                    Skip the cold outreach! We'll personally introduce you to the chapter's leadership team,
                    leveraging our network and credibility to facilitate a warm connection. Perfect for
                    partnerships, sponsorships, and collaboration opportunities.
                  </p>
                  <div className="bg-white/60 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">What's included:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li className="flex items-start gap-2">
                        <span className={`${chapter.isPlatinum ? 'text-blue-600' : 'text-emerald-600'} mt-0.5`}>✓</span>
                        <span>Personal email introduction from our team to chapter president</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`${chapter.isPlatinum ? 'text-blue-600' : 'text-emerald-600'} mt-0.5`}>✓</span>
                        <span>Your company background and partnership proposal shared</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`${chapter.isPlatinum ? 'text-blue-600' : 'text-emerald-600'} mt-0.5`}>✓</span>
                        <span>Follow-up coordination to ensure connection is made</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`${chapter.isPlatinum ? 'text-blue-600' : 'text-emerald-600'} mt-0.5`}>✓</span>
                        <span>Higher response rate vs. cold email (~70% vs. ~10%)</span>
                      </li>
                      {chapter.isPlatinum && (
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">✓</span>
                          <span className="font-semibold">Complete roster data and verified officer contacts</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  <button
                    onClick={() => handleUnlock('warm_introduction', chapter.isPlatinum ? 20 : 100)}
                    disabled={isUnlocking}
                    className={`inline-flex items-center gap-2 ${chapter.isPlatinum ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isUnlocking ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Unlocking...
                      </>
                    ) : (
                      <>
                        {chapter.isPlatinum && <span className="text-xl">💎</span>}
                        <Handshake className="w-4 h-4" />
                        Request Introduction for {chapter.isPlatinum ? '20' : '100'} Credits
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    {chapter.isPlatinum ? '💎 Platinum tier - Premium partner with complete data' : 'Significantly increases partnership success rate'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                <Unlock className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-900">Introduction unlocked! ✅</span>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">📝 Introduction Request Form</h3>
                {introSubmitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="text-center mb-4">
                      <div className="text-green-600 text-4xl mb-3">✅</div>
                      <h4 className="font-semibold text-green-900 mb-2">Request Submitted Successfully!</h4>
                      <p className="text-sm text-green-800 mb-4">
                        Our team will review your request and reach out within 24-48 hours to facilitate the introduction.
                      </p>
                    </div>
                    <div className="p-4 bg-white border border-green-200 rounded-lg space-y-2">
                      <h5 className="font-semibold text-gray-900 text-sm mb-2">What happens next?</h5>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">1.</span>
                          <span>We'll review your partnership proposal and company profile</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">2.</span>
                          <span>Our team will reach out to the chapter leadership on your behalf</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">3.</span>
                          <span>We'll coordinate a direct introduction via your preferred contact method</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">4.</span>
                          <span>You'll receive an email with next steps and contact details</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-600">
                        Track this request in your <a href="/app/requested-introductions" className="text-blue-600 hover:underline font-medium">Requested Introductions</a> page
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Preview what admin will see */}
                    <div className="mb-4 p-4 bg-indigo-100 border border-indigo-200 rounded-lg">
                      <p className="text-xs text-indigo-700 font-semibold uppercase tracking-wide mb-1">
                        Preview - What our team will see
                      </p>
                      <div className="text-sm space-y-1">
                        <p className="text-indigo-900">
                          <strong>Company:</strong> {user?.companyName || 'Your Company'}
                        </p>
                        <p className="text-indigo-900">
                          <strong>Requesting:</strong> Introduction to {chapter.fraternity} - {chapter.chapterName}
                        </p>
                        <p className="text-indigo-900">
                          <strong>At:</strong> {chapter.university}
                        </p>
                      </div>
                    </div>
                    <form className="space-y-4" onSubmit={async (e) => {
                      e.preventDefault();
                      if (!user?.companyId || !id) return;

                      // Validation: Ensure message has enough content
                      if (introFormData.message.trim().length < 50) {
                        alert('Please provide a more detailed partnership proposal (at least 50 characters)');
                        return;
                      }

                      setIsSubmittingIntro(true);
                    try {
                      const response = await fetch(`${API_URL}/credits/warm-intro/request`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          companyId: user.companyId,
                          chapterId: id,
                          message: introFormData.message,
                          preferredContactMethod: introFormData.preferredContactMethod,
                          urgency: 'normal'
                        })
                      });

                      const data = await response.json();

                      if (!response.ok) {
                        if (response.status === 402) {
                          alert(`Insufficient credits. You need ${data.required} credits but only have ${data.available}.`);
                        } else {
                          alert(data.error || 'Failed to submit request');
                        }
                        return;
                      }

                      // Success!
                      setIntroSubmitted(true);
                      const deductedAmount = chapter.isPlatinum ? 20 : 100;
                      setBalance(balance - deductedAmount);

                      // Track warm introduction request
                      analytics.track({
                        eventType: 'warm_intro_request',
                        eventCategory: 'conversion',
                        eventName: `Warm Intro Requested: ${chapter.fraternity}`,
                        eventData: {
                          chapter_id: id,
                          chapter_name: chapter.chapterName,
                          university_name: chapter.university,
                          is_platinum: chapter.isPlatinum,
                          cost: deductedAmount
                        }
                      });
                    } catch (error) {
                      console.error('Error submitting intro request:', error);
                      alert('Failed to submit request. Please try again.');
                    } finally {
                      setIsSubmittingIntro(false);
                    }
                  }}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={introFormData.name}
                        onChange={(e) => setIntroFormData({...introFormData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={introFormData.email}
                        onChange={(e) => setIntroFormData({...introFormData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="john@company.com"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Partnership Proposal *
                        </label>
                        <span className={`text-xs ${introFormData.message.length >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
                          {introFormData.message.length}/50 minimum
                        </span>
                      </div>
                      <textarea
                        required
                        rows={4}
                        value={introFormData.message}
                        onChange={(e) => setIntroFormData({...introFormData, message: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Briefly describe your partnership opportunity, what you're offering, and what you're looking for..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Be specific about what you're offering and how it benefits the chapter
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Contact Method
                      </label>
                      <select
                        value={introFormData.preferredContactMethod}
                        onChange={(e) => setIntroFormData({...introFormData, preferredContactMethod: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option>Email</option>
                        <option>Phone</option>
                        <option>Both</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingIntro}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingIntro ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </form>
                  </>
                )}
                <p className="text-xs text-gray-600 mt-4">
                  💡 Our team typically responds within 24 hours to facilitate the introduction.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Chapter Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 relative">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Chapter Info</h2>

          {!hasCompleteData && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
              <div className="text-center p-6">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-sm text-gray-600">
                  Detailed chapter information is being added
                </p>
              </div>
            </div>
          )}

          <div className={`space-y-4 ${!hasCompleteData ? 'blur-sm pointer-events-none' : ''}`}>
            <div>
              <p className="text-sm text-gray-600">Founded</p>
              <p className="font-semibold">{chapter.founded || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">House Address</p>
              <p className="font-semibold">{chapter.house || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-semibold text-xs text-gray-500">
                {chapter.lastUpdated ? new Date(chapter.lastUpdated).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Not available'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Chapter Motto</p>
              <p className="font-semibold italic">"{chapter.motto || 'N/A'}"</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Chapter Colors</p>
              <div className="flex items-center space-x-2 mt-1">
                {chapter.colors && chapter.colors.length > 0 ? chapter.colors.map(color => (
                  <span key={color} className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {color}
                  </span>
                )) : <span className="text-sm text-gray-500">N/A</span>}
              </div>
            </div>
            {(chapter.website || chapter.instagram) && (
              <div className="pt-4 space-y-2">
                {chapter.website && (
                  <a
                    href={`https://${chapter.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-primary-600 hover:text-primary-700"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    {chapter.website}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
                {chapter.instagram && (
                  <a
                    href={`https://instagram.com/${chapter.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-primary-600 hover:text-primary-700"
                  >
                    <Instagram className="w-4 h-4 mr-2" />
                    {chapter.instagram}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Brand Partnerships section removed - was displaying fake hardcoded data */}

      {/* Philanthropy section removed - was displaying hardcoded dummy data */}

      {/* Academic Performance section removed - Chapter GPA should not be displayed per user requirements */}

      {/* Major Events section removed - was displaying hardcoded dummy data (Derby Days, Winter Formal, Spring Philanthropy Week) */}

      {/* Financial Information */}
      {currentYearData.budget && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Annual Budget</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{currentYearData.budget.annual}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Semester Dues</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{currentYearData.budget.dues}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Housing Cost</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{currentYearData.budget.housing}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterDetailPage;