import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MapPin,
  GraduationCap,
  Briefcase,
  Search,
  Filter,
  List,
  Grid3x3,
  Lock,
  Mail,
  Phone,
  Instagram,
  Linkedin,
  Globe,
  MessageSquare,
  Calendar,
  Award,
  TrendingUp,
  Star,
  Unlock,
  Crown,
  Sparkles
} from 'lucide-react';
import { getCollegeLogoWithFallback } from '../utils/collegeLogos';

interface Ambassador {
  id: string;
  firstName: string;
  lastInitial: string;
  lastName?: string;
  university: string;
  universityState: string;
  universityLogo?: string;
  major: string;
  graduationYear: number;
  fraternity?: string;
  position?: string;
  bio: string;
  skills: string[];
  interests: string[];
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  rating: number;
  completedCampaigns: number;
  isUnlocked: boolean;
  // Locked fields
  email?: string;
  phone?: string;
  instagram?: string;
  linkedin?: string;
}

const AmbassadorsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('all');
  const [filterSkill, setFilterSkill] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's subscription tier
  useEffect(() => {
    const fetchSubscriptionTier = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setSubscriptionTier('trial');
          setIsLoading(false);
          return;
        }

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_URL}/credits/balance`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSubscriptionTier(data.subscriptionTier?.toLowerCase() || 'trial');
        } else {
          setSubscriptionTier('trial');
        }
      } catch (error) {
        console.error('Failed to fetch subscription tier:', error);
        setSubscriptionTier('trial');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionTier();
  }, []);

  const isEnterpriseTier2 = subscriptionTier === 'enterprise_tier2';

  // Only Tyler A. (unlocked) and George S. (locked)
  const ambassadors: Ambassador[] = [
    {
      id: '1',
      firstName: 'Tyler',
      lastInitial: 'A',
      lastName: 'Alesso',
      university: 'Penn State University',
      universityState: 'PA',
      major: 'Marketing',
      graduationYear: 2026,
      fraternity: 'Sigma Chi',
      position: 'Social Chair',
      bio: 'Passionate about brand partnerships and social media marketing. Love connecting brands with college audiences.',
      skills: ['Social Media', 'Event Planning', 'Brand Partnerships'],
      interests: ['Sports Marketing', 'Influencer Marketing'],
      experienceLevel: 'Advanced',
      rating: 4.8,
      completedCampaigns: 12,
      isUnlocked: true,
      email: 'tyler.a@psu.edu',
      phone: '(814) 555-0100',
      instagram: '@tyler_marketing',
      linkedin: '/in/tyler-anderson'
    },
    {
      id: '2',
      firstName: 'George',
      lastInitial: 'S',
      university: 'Gettysburg College',
      universityState: 'PA',
      major: 'Business Administration',
      graduationYear: 2025,
      fraternity: 'Phi Kappa Psi',
      position: 'Vice President',
      bio: 'Experienced campus leader with strong connections in Greek life. Skilled at organizing events and building brand awareness.',
      skills: ['Leadership', 'Event Management', 'Greek Life Marketing'],
      interests: ['Brand Partnerships', 'Campus Events'],
      experienceLevel: 'Advanced',
      rating: 4.7,
      completedCampaigns: 9,
      isUnlocked: false,
      email: 'george.s@gettysburg.edu',
      phone: '(717) 555-0200',
      instagram: '@georges_gburg',
      linkedin: '/in/george-smith'
    }
  ];

  // Filter and search
  const filteredAmbassadors = ambassadors
    .filter(ambassador => {
      const matchesSearch =
        ambassador.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ambassador.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ambassador.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ambassador.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesState = filterState === 'all' || ambassador.universityState === filterState;
      const matchesSkill = filterSkill === 'all' || ambassador.skills.includes(filterSkill);

      return matchesSearch && matchesState && matchesSkill;
    });

  // Get unique states and skills for filters
  const states = [...new Set(ambassadors.map(a => a.universityState))].sort();
  const allSkills = [...new Set(ambassadors.flatMap(a => a.skills))].sort();

  return (
    <div className="relative space-y-6">
      {/* Enterprise Tier 2 Lock Overlay */}
      {!isLoading && !isEnterpriseTier2 && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-center px-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mb-6 shadow-lg">
              <Crown className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Ambassadors Marketplace
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Exclusive to Enterprise Tier 2 Subscribers
            </p>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-6 border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-600" />
                What You'll Get
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Verified Ambassadors</p>
                    <p className="text-sm text-gray-600">Access to pre-vetted student influencers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Campaign Tracking</p>
                    <p className="text-sm text-gray-600">Monitor performance and ROI metrics</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Direct Communication</p>
                    <p className="text-sm text-gray-600">Message ambassadors directly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Quality Ratings</p>
                    <p className="text-sm text-gray-600">See verified reviews and past performance</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/app/team"
                className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Upgrade to Enterprise Tier 2 - $2,222/month
              </Link>
              <p className="text-sm text-gray-500">
                Current tier: <span className="font-semibold capitalize">{subscriptionTier || 'Trial'}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content (blurred when locked) */}
      <div className={!isEnterpriseTier2 ? 'filter blur-sm pointer-events-none select-none' : ''}>
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campus Ambassadors</h1>
            <p className="text-gray-600 mt-2">Connect with student influencers and brand ambassadors</p>
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
              <p className="text-2xl font-bold text-gray-900">{ambassadors.length}</p>
              <p className="text-sm text-gray-600">Total Ambassadors</p>
            </div>
            <Users className="w-8 h-8 text-primary-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{states.length}</p>
              <p className="text-sm text-gray-600">States Covered</p>
            </div>
            <MapPin className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">4.8</p>
              <p className="text-sm text-gray-600">Avg Rating</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {ambassadors.reduce((sum, a) => sum + a.completedCampaigns, 0)}
              </p>
              <p className="text-sm text-gray-600">Campaigns Completed</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
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
              placeholder="Search by name, university, major, or skills..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
          >
            <option value="all">All Skills</option>
            {allSkills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ambassadors Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAmbassadors.map((ambassador) => (
            <div
              key={ambassador.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200 hover:border-primary-300"
            >
              {/* Header with gradient background */}
              <div className="h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 relative">
                {/* Lock/Unlocked badge */}
                <div className="absolute top-2 right-2">
                  {ambassador.isUnlocked ? (
                    <div className="bg-green-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border-2 border-white">
                      <Unlock className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold">Unlocked</span>
                    </div>
                  ) : (
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-gray-200">
                      <Lock className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-xs font-semibold text-gray-700">Locked</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 pt-4">
                <div className="flex items-start gap-3 mb-4">
                  {/* University logo */}
                  <img
                    src={ambassador.universityLogo || getCollegeLogoWithFallback(ambassador.university)}
                    alt={ambassador.university}
                    className="w-14 h-14 object-contain flex-shrink-0 bg-white rounded-lg border border-gray-100 p-1"
                  />
                  <div className="flex-1">
                    {/* Name */}
                    <h3 className="text-lg font-bold text-gray-900">
                      {ambassador.isUnlocked
                        ? `${ambassador.firstName} ${ambassador.lastName || ambassador.lastInitial + '.'}`
                        : `${ambassador.firstName} ${ambassador.lastInitial}.`
                      }
                    </h3>
                    <p className="text-sm text-gray-600">{ambassador.university}</p>
                    <p className="text-xs text-gray-500">{ambassador.universityState}</p>
                  </div>
                </div>

                {/* Info - Blurred if locked */}
                <div className={`space-y-2 mb-4 ${ambassador.isUnlocked ? '' : 'relative'}`}>
                  {!ambassador.isUnlocked && (
                    <div className="absolute inset-0 backdrop-blur-md bg-white/50 rounded-lg flex items-center justify-center z-10">
                      <Lock className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                    {ambassador.major} • Class of {ambassador.graduationYear}
                  </div>
                  {ambassador.fraternity && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      {ambassador.fraternity} {ambassador.position && `• ${ambassador.position}`}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                    {ambassador.completedCampaigns} campaigns completed
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-2 text-yellow-500 fill-yellow-500" />
                    {ambassador.rating} rating • {ambassador.experienceLevel}
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {ambassador.skills.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {ambassador.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                        +{ambassador.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Bio preview - Blurred if locked */}
                <div className={`mb-4 ${ambassador.isUnlocked ? '' : 'relative'}`}>
                  {!ambassador.isUnlocked && (
                    <div className="absolute inset-0 backdrop-blur-sm bg-white/50 rounded z-10"></div>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {ambassador.bio}
                  </p>
                </div>

                {/* Action buttons */}
                {ambassador.isUnlocked ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <Award className="w-4 h-4" />
                      <span className="font-medium">Profile Unlocked</span>
                    </div>
                    {ambassador.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${ambassador.email}`} className="hover:text-primary-600">
                          {ambassador.email}
                        </a>
                      </div>
                    )}
                    {ambassador.linkedin && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Linkedin className="w-4 h-4" />
                        <a
                          href={`https://linkedin.com${ambassador.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary-600"
                        >
                          View LinkedIn Profile
                        </a>
                      </div>
                    )}
                    {ambassador.instagram && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Instagram className="w-4 h-4" />
                        <a
                          href={`https://instagram.com/${ambassador.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary-600"
                        >
                          {ambassador.instagram}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" />
                      Request Introduction for $99.99
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ambassador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    University
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Major & Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAmbassadors.map((ambassador) => (
                  <tr key={ambassador.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {ambassador.isUnlocked ? (
                          <>
                            <Unlock className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                              Unlocked
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
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {ambassador.firstName[0]}{ambassador.lastInitial}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ambassador.isUnlocked
                              ? `${ambassador.firstName} ${ambassador.lastName || ambassador.lastInitial + '.'}`
                              : `${ambassador.firstName} ${ambassador.lastInitial}.`
                            }
                          </div>
                          {ambassador.fraternity && (
                            <div className="text-sm text-gray-500">{ambassador.fraternity}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={ambassador.universityLogo || getCollegeLogoWithFallback(ambassador.university)}
                          alt={ambassador.university}
                          className="w-10 h-10 rounded-lg object-contain"
                        />
                        <div>
                          <div className="text-sm text-gray-900">{ambassador.university}</div>
                          <div className="text-sm text-gray-500">{ambassador.universityState}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ambassador.major}</div>
                      <div className="text-sm text-gray-500">Class of {ambassador.graduationYear}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ambassador.experienceLevel}</div>
                      <div className="text-sm text-gray-500">{ambassador.completedCampaigns} campaigns</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{ambassador.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {ambassador.isUnlocked ? (
                        <>
                          {ambassador.email && (
                            <a href={`mailto:${ambassador.email}`} className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-900">
                              <Mail className="w-4 h-4" />
                              <span>Email</span>
                            </a>
                          )}
                          <button className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900">
                            <MessageSquare className="w-4 h-4" />
                            <span>Message</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-900">
                            <Lock className="w-4 h-4" />
                            <span>Request Introduction for $99.99</span>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AmbassadorsPage;
