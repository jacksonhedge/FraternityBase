import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Unlock
} from 'lucide-react';
import { getCollegeLogoWithFallback } from '../utils/collegeLogos';

const ChapterDetailPage = () => {
  const { id } = useParams();
  const [selectedYear, setSelectedYear] = useState('2025-2026');

  // Credit unlock system
  const [unlockStatus, setUnlockStatus] = useState<string[]>([]);
  const [balance, setBalance] = useState(0);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (id && token) {
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
    if (!token || !id) return;

    if (balance < creditCost) {
      alert(`Insufficient credits! You need ${creditCost} credits but only have ${balance}.`);
      return;
    }

    const confirmMessage = `This will cost ${creditCost} credits. You currently have ${balance} credits. Continue?`;
    if (!confirm(confirmMessage)) return;

    setIsUnlocking(true);

    try {
      const response = await fetch(`${API_URL}/chapters/${id}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ unlockType })
      });

      const data = await response.json();

      if (response.ok) {
        setUnlockStatus([...unlockStatus, unlockType]);
        setBalance(data.remainingBalance);
        alert(`✅ Unlocked! ${data.creditsSpent} credits spent. Remaining balance: ${data.remainingBalance}`);
        window.location.reload(); // Refresh to show unlocked data
      } else {
        alert(`❌ ${data.error || 'Failed to unlock'}`);
      }
    } catch (error) {
      console.error('Error unlocking chapter:', error);
      alert('Error unlocking chapter. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const isUnlocked = (unlockType: string) => unlockStatus.includes(unlockType);

  // Mock data - would come from API based on ID
  const chapter = {
    id: 1,
    fraternity: 'Sigma Chi',
    university: 'Penn State',
    state: 'PA',
    chapterName: 'Beta Theta',
    motto: 'In Hoc Signo Vinces',
    colors: ['Blue', 'Old Gold'],
    founded: 1888,
    house: '420 E Fairmount Ave, State College, PA 16801',
    website: 'sigmachipsu.org',
    instagram: '@sigmachi_psu',
    greekRank: 4.2,
    nationalRank: 15,
    yearData: {
      '2025-2026': {
        size: 145,
        president: {
          name: 'Michael Thompson',
          emails: ['mthompson@psu.edu', 'michael.thompson@sigmachi.org'],
          phone: '(814) 555-0123',
          major: 'Business Administration',
          year: 'Senior'
        },
        vicePresident: {
          name: 'James Wilson',
          emails: ['jwilson@psu.edu'],
          phone: '(814) 555-0124',
          major: 'Finance',
          year: 'Junior'
        },
        rushChair: {
          name: 'Connor Mitchell',
          emails: ['cmitchell@psu.edu', 'rush@sigmachipsu.org', 'connor.mitchell@gmail.com'],
          phone: '(814) 555-0125',
          major: 'Marketing',
          year: 'Junior'
        },
        treasurer: {
          name: 'David Chen',
          emails: ['dchen@psu.edu', 'treasurer@sigmachipsu.org'],
          phone: '(814) 555-0126',
          major: 'Accounting',
          year: 'Senior'
        },
        socialChair: {
          name: 'Ryan Cooper',
          emails: ['rcooper@psu.edu', 'social@sigmachipsu.org'],
          phone: '(814) 555-0127',
          major: 'Communications',
          year: 'Sophomore'
        },
        philanthropyChair: {
          name: 'Alex Martinez',
          emails: ['amartinez@psu.edu'],
          phone: '(814) 555-0128',
          major: 'Psychology',
          year: 'Junior'
        },
        currentBrands: [
          { name: 'Nike', type: 'Apparel Partner', value: '$25,000', duration: '2 years' },
          { name: 'Chipotle', type: 'Food Sponsor', value: '$10,000', duration: '1 year' },
          { name: 'Red Bull', type: 'Event Partner', value: '$15,000', duration: '6 months' },
          { name: 'State Farm', type: 'Insurance Partner', value: '$20,000', duration: '3 years' }
        ],
        events: [
          { name: 'Derby Days', date: 'September 2025', attendance: 500, raised: '$35,000' },
          { name: 'Winter Formal', date: 'December 2025', attendance: 200 },
          { name: 'Spring Philanthropy Week', date: 'March 2026', attendance: 800, raised: '$50,000' }
        ],
        philanthropies: {
          primary: 'Huntsman Cancer Institute',
          raised: '$85,000',
          hours: 2400,
          events: 12
        },
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
        currentBrands: [
          { name: 'Nike', type: 'Apparel Partner', value: '$20,000', duration: '1 year' },
          { name: 'Buffalo Wild Wings', type: 'Food Sponsor', value: '$8,000', duration: '1 year' },
          { name: 'Monster Energy', type: 'Event Partner', value: '$12,000', duration: '1 year' }
        ],
        philanthropies: {
          primary: 'Huntsman Cancer Institute',
          raised: '$72,000',
          hours: 2100,
          events: 10
        },
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
        philanthropies: {
          primary: 'Huntsman Cancer Institute',
          raised: '$68,000',
          hours: 1950,
          events: 9
        },
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/app/chapters"
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
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {currentYearData.philanthropies?.raised || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">Raised</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {currentYearData.currentBrands?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Partners</p>
            </div>
            <Building className="w-8 h-8 text-blue-500" />
          </div>
        </div>
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
                    onClick={() => handleUnlock('officer_contacts', 8)}
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
                        Unlock for 8 Credits
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentYearData.president && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">President</h3>
                <p className="text-gray-900 mt-1">{currentYearData.president.name}</p>
                <p className="text-sm text-gray-600">{currentYearData.president.major} • {currentYearData.president.year}</p>
                {isUnlocked('officer_contacts') ? (
                  <div className="mt-2 space-y-1">
                    {(currentYearData.president.emails || [currentYearData.president.email]).filter(Boolean).map((email, idx) => (
                      <a key={idx} href={`mailto:${email}`} className="flex items-center text-sm text-primary-600 hover:text-primary-700">
                        <Mail className="w-4 h-4 mr-1" />
                        {email}
                      </a>
                    ))}
                    {currentYearData.president.phone && (
                      <a href={`tel:${currentYearData.president.phone}`} className="flex items-center text-sm text-primary-600 hover:text-primary-700">
                        <Phone className="w-4 h-4 mr-1" />
                        {currentYearData.president.phone}
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <Lock className="w-4 h-4" />
                    <span>Unlock to view contacts</span>
                  </div>
                )}
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

        {/* Chapter Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Chapter Info</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Founded</p>
              <p className="font-semibold">{chapter.founded}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">House Address</p>
              <p className="font-semibold">{chapter.house}</p>
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
              <p className="font-semibold italic">"{chapter.motto}"</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Chapter Colors</p>
              <div className="flex items-center space-x-2 mt-1">
                {chapter.colors.map(color => (
                  <span key={color} className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {color}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-4 space-y-2">
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
            </div>
          </div>
        </div>
      </div>

      {/* Brand Partnerships */}
      {currentYearData.currentBrands && currentYearData.currentBrands.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Brand Partnerships</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentYearData.currentBrands.map((brand, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{brand.type}</p>
                <p className="text-lg font-bold text-primary-600 mt-2">{brand.value}</p>
                <p className="text-xs text-gray-500">Duration: {brand.duration}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Philanthropy & Academic Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Philanthropy */}
        {currentYearData.philanthropies && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Philanthropy</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Primary Charity</span>
                <span className="font-semibold">{currentYearData.philanthropies.primary}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Money Raised</span>
                <span className="font-semibold text-green-600">{currentYearData.philanthropies.raised}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Service Hours</span>
                <span className="font-semibold">{currentYearData.philanthropies.hours?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Events Held</span>
                <span className="font-semibold">{currentYearData.philanthropies.events || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Academic Performance */}
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

      {/* Events */}
      {currentYearData.events && currentYearData.events.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Major Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentYearData.events.map((event, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">{event.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {event.date}
                </p>
                {event.attendance && (
                  <p className="text-sm text-gray-600 mt-1">
                    <Users className="w-4 h-4 inline mr-1" />
                    {event.attendance} attendees
                  </p>
                )}
                {event.raised && (
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    Raised {event.raised}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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