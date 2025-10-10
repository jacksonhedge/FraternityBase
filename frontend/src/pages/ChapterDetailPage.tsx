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
  Handshake
} from 'lucide-react';
import { getCollegeLogoWithFallback } from '../utils/collegeLogos';

const ChapterDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedYear, setSelectedYear] = useState('2025-2026');

  // Determine back link based on current path
  const backLink = location.pathname.includes('/my-chapters/') ? '/app/my-chapters' : '/app/chapters';

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
          if (data.success && data.data) {
            setChapterData(data.data);
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

      // Fetch credit balance
      fetch(`${API_URL}/credits/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setBalance(data.balance || 0))
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
    greekRank: 4.2, // TODO: Add to database
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={backLink}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <img
            src={getCollegeLogoWithFallback(chapter.university)}
            alt={chapter.university}
            className="w-16 h-16 object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {chapter.fraternity} - {chapter.chapterName}
            </h1>
            <p className="text-gray-600 mt-1">{chapter.university} • {chapter.state}</p>
          </div>
        </div>

        {/* Year Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">School Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{currentYearData.size}</p>
              <p className="text-sm text-gray-600">Members</p>
            </div>
            <Users className="w-8 h-8 text-primary-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{chapter.greekRank}</p>
              <p className="text-sm text-gray-600">Greek Rank</p>
            </div>
            <Award className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {currentYearData.gpa?.chapter || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">Chapter GPA</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        {/* Raised stat card removed - was showing hardcoded philanthropy dummy data */}
        {/* Partners stat card removed - was showing dummy data */}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leadership Section */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Chapter Leadership</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Award className="w-4 h-4" />
              {balance} credits
            </div>
          </div>

          {/* Unlock Banner */}
          {!isUnlocked('officer_contacts') && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">🔒 Officer Contacts Locked</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Unlock full contact information (emails & phones) for all officers to reach out directly.
                  </p>
                  <button
                    onClick={() => handleUnlock('full', 20)}
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
                        Unlock for 20 Credits
                      </>
                    )}
                  </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {officers.length > 0 ? (
              officers
                .filter((officer) => officer.position && officer.position.toLowerCase() !== 'member')
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
                .map((officer) => (
                <div key={officer.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">{officer.position || 'To be Determined'}</h3>
                  <p className="text-gray-900 mt-1">{officer.name || (officer.first_name && officer.last_name ? `${officer.first_name} ${officer.last_name}` : 'To be Determined')}</p>
                  {officer.major && officer.graduation_year && (
                    <p className="text-sm text-gray-600">{officer.major} • Class of {officer.graduation_year}</p>
                  )}
                  {isUnlocked('officer_contacts') ? (
                    <div className="mt-2 space-y-1">
                      {officer.email ? (
                        <a href={`mailto:${officer.email}`} className="flex items-center text-sm text-primary-600 hover:text-primary-700">
                          <Mail className="w-4 h-4 mr-1" />
                          {officer.email}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-500">Email: To be Determined</p>
                      )}
                      {officer.phone ? (
                        <a href={`tel:${officer.phone}`} className="flex items-center text-sm text-primary-600 hover:text-primary-700">
                          <Phone className="w-4 h-4 mr-1" />
                          {officer.phone}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-500">Phone: To be Determined</p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <Lock className="w-4 h-4" />
                      <span>Unlock to view contacts</span>
                    </div>
                  )}
                </div>
              ))
            ) : officers.length > 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No officer positions available. Only general members listed.
              </div>
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                Chapter leadership: To be Determined
              </div>
            )}

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

        {/* Warm Introduction Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Handshake className="w-6 h-6 text-emerald-600" />
            Personal Introduction
          </h2>

          {!isUnlocked('warm_introduction') ? (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">🤝 Get a Personal Introduction</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Skip the cold outreach! We'll personally introduce you to the chapter's leadership team,
                    leveraging our network and credibility to facilitate a warm connection. Perfect for
                    partnerships, sponsorships, and collaboration opportunities.
                  </p>
                  <div className="bg-white/60 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">What's included:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">✓</span>
                        <span>Personal email introduction from our team to chapter president</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">✓</span>
                        <span>Your company background and partnership proposal shared</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">✓</span>
                        <span>Follow-up coordination to ensure connection is made</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">✓</span>
                        <span>Higher response rate vs. cold email (~70% vs. ~10%)</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleUnlock('warm_introduction', 100)}
                    disabled={isUnlocking}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUnlocking ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Unlocking...
                      </>
                    ) : (
                      <>
                        <Handshake className="w-4 h-4" />
                        Request Introduction for 100 Credits
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Significantly increases partnership success rate
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
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="text-green-600 text-4xl mb-3">✅</div>
                    <h4 className="font-semibold text-green-900 mb-2">Request Submitted!</h4>
                    <p className="text-sm text-green-800">
                      Our team will reach out to facilitate the connection within 24-48 hours.
                    </p>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={async (e) => {
                    e.preventDefault();
                    if (!user?.companyId || !id) return;

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
                          alert(`Insufficient balance. You need $${data.required} but only have $${data.available}.`);
                        } else {
                          alert(data.error || 'Failed to submit request');
                        }
                        return;
                      }

                      // Success!
                      setIntroSubmitted(true);
                      setBalance(balance - 59.99); // Update local balance
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Partnership Proposal *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={introFormData.message}
                        onChange={(e) => setIntroFormData({...introFormData, message: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Briefly describe your partnership opportunity, what you're offering, and what you're looking for..."
                      />
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
                      {isSubmittingIntro ? 'Submitting...' : 'Submit Introduction Request'}
                    </button>
                  </form>
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

      {/* Academic Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentYearData.gpa && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Academic Performance</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Chapter GPA</span>
                <span className="font-semibold text-primary-600">{currentYearData.gpa.chapter}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Member GPA</span>
                <span className="font-semibold">{currentYearData.gpa.newMember}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">All Men's Average</span>
                <span className="font-semibold">{currentYearData.gpa.allMensAverage}</span>
              </div>
              <div className="mt-2 pt-2 border-t">
                <p className="text-sm text-green-600">
                  {currentYearData.gpa.chapter > currentYearData.gpa.allMensAverage
                    ? `+${(currentYearData.gpa.chapter - currentYearData.gpa.allMensAverage).toFixed(2)} above average`
                    : `${(currentYearData.gpa.chapter - currentYearData.gpa.allMensAverage).toFixed(2)} below average`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

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