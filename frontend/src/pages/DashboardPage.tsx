import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  TrendingUp,
  DollarSign,
  Activity,
  Target,
  Award,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  Coins,
  Lock,
  Unlock,
  Mail,
  Phone,
  Download,
  X
} from 'lucide-react';
import { getCollegeLogoWithFallback } from '../utils/collegeLogos';
import ApprovalPendingOverlay from '../components/ApprovalPendingOverlay';
import LoadingScreen from '../components/LoadingScreen';
import AnimatedTickertape from '../components/AnimatedTickertape';
import { useCardStagger } from '../animations/useCardStagger';
import { supabase } from '../lib/supabase';

const DashboardPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [purchasedCredits, setPurchasedCredits] = useState(0);

  // Animation hooks
  const statsContainerRef = useCardStagger([]);

  // Fetch real data from API
  const [accountBalance, setAccountBalance] = useState(0);
  const [lifetimeSpent, setLifetimeSpent] = useState(0);
  const [lifetimeAdded, setLifetimeAdded] = useState(0);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('trial');
  const [unlockedChapters, setUnlockedChapters] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [topChapters, setTopChapters] = useState<any[]>([]);
  // Only show loading screen on initial app load, not on navigation
  const hasSeenLoading = sessionStorage.getItem('hasSeenDashboardLoading') === 'true';
  const [loading, setLoading] = useState(!hasSeenLoading);
  const [loadingComplete, setLoadingComplete] = useState(hasSeenLoading);
  const [showDashboard, setShowDashboard] = useState(hasSeenLoading);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');
  const [recentChapters, setRecentChapters] = useState<any[]>([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Fetch approval status first
    const checkApprovalStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('companies(approval_status)')
          .eq('user_id', user.id)
          .single();

        if ((profile?.companies as any)?.approval_status) {
          setApprovalStatus((profile.companies as any).approval_status);
        }
      }
    };

    checkApprovalStatus();

    // Fetch all dashboard data
    if (token) {
      Promise.all([
        fetch(`${API_URL}/credits/balance`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()).catch(() => ({ balance: 0, lifetimeSpent: 0, lifetimeAdded: 0 })),
        fetch(`${API_URL}/chapters/unlocked`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.ok ? res.json() : { data: [] }).catch(() => ({ data: [] })),
        fetch(`${API_URL}/chapters`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()).catch(() => ({ data: [] })),
        fetch(`${API_URL}/admin/universities`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()).catch(() => ({ data: [] })),
        fetch(`${API_URL}/activity-feed/public?limit=15`).then(res => res.json()).catch(() => ({ data: [] })),
        fetch(`${API_URL}/chapters/recent`).then(res => res.json()).catch(() => ({ data: [] }))
      ])
        .then(([creditsData, chaptersData, allChaptersData, universitiesData, activityData, recentChaptersData]) => {
          console.log('[Dashboard] Recent chapters API response:', recentChaptersData);
          console.log('[Dashboard] Recent chapters data array:', recentChaptersData.data);

          setAccountBalance(creditsData.balance || 0);
          setLifetimeSpent(creditsData.lifetimeSpent || 0);
          setLifetimeAdded(creditsData.lifetimeAdded || 0);
          setSubscriptionTier(creditsData.subscriptionTier || 'trial');
          setUnlockedChapters(chaptersData.data || []);
          setActivityFeed(activityData.data || []);

          const formattedChapters = (recentChaptersData.data || []).map((item: any) => ({ ...item, metadata: item }));
          console.log('[Dashboard] Formatted chapters for tickertape:', formattedChapters);
          setRecentChapters(formattedChapters);

          // Calculate real stats from API data
          const chapters = allChaptersData.data || [];
          const universities = universitiesData.data || [];

          // Get unique states
          const states = new Set(universities.map((u: any) => u.state).filter(Boolean));

          // Format subscription tier for display
          const tierDisplay = subscriptionTier === 'trial' ? 'Trial' :
                             subscriptionTier === 'monthly' ? 'Monthly' :
                             subscriptionTier === 'enterprise' ? 'Enterprise' : 'Trial';

          setStats([
            {
              label: 'Greek Chapters',
              value: chapters.length.toString(),
              change: 'Total in database',
              trend: 'neutral',
              icon: Users,
              color: 'primary',
              description: 'Active chapters tracked'
            },
            {
              label: 'Universities',
              value: universities.length.toString(),
              change: 'With Greek life',
              trend: 'neutral',
              icon: Target,
              color: 'green',
              description: 'Schools in database'
            }
          ]);

          // Recent activities - for now empty until we track this
          setRecentActivities([]);

          // Featured chapters - use real data from API (already sorted with favorites first)
          const topChaptersData = chapters.slice(0, 10).map((chapter: any) => ({
            id: chapter.id,
            name: `${chapter.universities?.name} ${chapter.greek_organizations?.name}`,
            university: chapter.universities?.name,
            members: chapter.member_count || 0,
            grade: chapter.grade || 'N/A',
            is_favorite: chapter.is_favorite || false,
            chapter_name: chapter.chapter_name,
            greek_org: chapter.greek_organizations?.name,
            logo_url: chapter.universities?.logo_url
          }));
          setTopChapters(topChaptersData);

          setLoading(false);
          setLoadingComplete(true);
          sessionStorage.setItem('hasSeenDashboardLoading', 'true');
          setTimeout(() => setShowDashboard(true), 800);
        })
        .catch(err => {
          console.error('Failed to fetch dashboard data:', err);
          setLoading(false);
          setLoadingComplete(true);
          sessionStorage.setItem('hasSeenDashboardLoading', 'true');
          setTimeout(() => setShowDashboard(true), 800);
        });
    }
  }, [token]);

  // Check for payment success
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const credits = searchParams.get('credits');

    if (paymentStatus === 'success' && credits) {
      setShowSuccessMessage(true);
      setPurchasedCredits(parseInt(credits));

      // Clear URL parameters after showing message
      setTimeout(() => {
        searchParams.delete('payment');
        searchParams.delete('credits');
        setSearchParams(searchParams);
      }, 100);

      // Auto-hide message after 10 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 10000);
    }
  }, [searchParams, setSearchParams]);

  // Show loading screen while data is being fetched
  if (loading || !showDashboard) {
    return <LoadingScreen isComplete={loadingComplete} />;
  }

  return (
    <div className="space-y-6">
      {/* SUCCESS MESSAGE */}
      {showSuccessMessage && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 text-lg">Payment Successful!</h3>
            <p className="text-green-700 mt-1">
              {purchasedCredits} credits have been added to your account. You can now unlock chapter data and access contact information.
            </p>
          </div>
          <button
            onClick={() => setShowSuccessMessage(false)}
            className="text-green-600 hover:text-green-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* RECENT ACTIVITY TICKERTAPE - Enhanced with Anime.js */}
      <AnimatedTickertape activities={recentChapters} />


      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.company?.name ? `Welcome back, ${user.company.name}!` : 'Welcome Back!'}
        </h1>
        <p className="text-gray-600 mt-1">
          Here's your dashboard overview
        </p>
      </div>

      {/* Stats Grid */}
      <div ref={statsContainerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} data-animate-card className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                {stat.trend === 'up' && (
                  <span className="flex items-center text-green-600 text-sm font-medium">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    {stat.change}
                  </span>
                )}
                {stat.trend === 'down' && (
                  <span className="flex items-center text-red-600 text-sm font-medium">
                    <ArrowDown className="w-4 h-4 mr-1" />
                    {stat.change}
                  </span>
                )}
                {stat.trend === 'neutral' && (
                  <span className="text-gray-600 text-sm">
                    {stat.change}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity - Only show if there are activities */}
        {recentActivities.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary-600" />
                Recent Credit Activity
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {activity.type === 'unlock' && (
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                      {activity.type === 'purchase' && (
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <ArrowUp className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                      {activity.type === 'export' && (
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${activity.credits > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    {activity.credits > 0 ? '+' : ''}{activity.credits}
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-primary-600 text-sm font-medium hover:text-primary-700">
              View all transactions →
            </button>
          </div>
        </div>
        )}

        {/* Top Chapters to Unlock - Only show if there are chapters */}
        {topChapters.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm relative">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary-600" />
              Featured Chapters
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topChapters.map((chapter, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <img
                        src={getCollegeLogoWithFallback(chapter.university)}
                        alt={chapter.university}
                        className="w-12 h-12 object-contain flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{chapter.name}</h4>
                        <p className="text-sm text-gray-600">{chapter.university}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-500">{chapter.members} members</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            chapter.grade === 'A+' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            Grade {chapter.grade}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/app/chapters" className="inline-block mt-4 text-primary-600 text-sm font-medium hover:text-primary-700">
              Browse all chapters →
            </Link>
          </div>
          {approvalStatus === 'pending' && <ApprovalPendingOverlay />}
        </div>
        )}

        {/* Newly Added Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Newly Added
            </h2>
          </div>
          <div className={`p-6 ${approvalStatus === 'pending' ? 'pointer-events-none opacity-60' : ''}`}>
            <div className="space-y-4">
              {/* New School Example */}
              <div className="border-l-4 border-green-500 pl-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <img
                    src={getCollegeLogoWithFallback('Lehigh University')}
                    alt="Lehigh University"
                    className="w-12 h-12 object-contain flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Lehigh University</h4>
                    <p className="text-sm text-gray-600">New school added to database</p>
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      🏫 New School
                    </span>
                  </div>
                </div>
              </div>

              {/* New Chapter Example */}
              <div className="border-l-4 border-blue-500 pl-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <img
                    src={getCollegeLogoWithFallback('Penn State University')}
                    alt="Penn State University"
                    className="w-12 h-12 object-contain flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Penn State SAE</h4>
                    <p className="text-sm text-gray-600">Penn State University</p>
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      🆕 New Chapter
                    </span>
                  </div>
                </div>
              </div>

              {/* New Roster Example */}
              <div className="border-l-4 border-purple-500 pl-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <img
                    src={getCollegeLogoWithFallback('Purdue University')}
                    alt="Purdue University"
                    className="w-12 h-12 object-contain flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Purdue Sigma Chi Roster</h4>
                    <p className="text-sm text-gray-600">Purdue University • 94 members</p>
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                      📋 Updated Roster
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Coming Soon
        </h2>
        <div className={`space-y-4 ${approvalStatus === 'pending' ? 'pointer-events-none opacity-60' : ''}`}>
          <div className="border-l-4 border-blue-500 pl-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-3">
              <img
                src={getCollegeLogoWithFallback('University of Texas')}
                alt="University of Texas"
                className="w-12 h-12 object-contain flex-shrink-0"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">University of Texas</h4>
                <p className="text-sm text-gray-600">New chapters being added</p>
                <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  🔜 Coming Soon
                </span>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-blue-500 pl-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-3">
              <img
                src={getCollegeLogoWithFallback('University of Pittsburgh')}
                alt="University of Pittsburgh"
                className="w-12 h-12 object-contain flex-shrink-0"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">University of Pittsburgh</h4>
                <p className="text-sm text-gray-600">New chapters being added</p>
                <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  🔜 Coming Soon
                </span>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-blue-500 pl-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-3">
              <img
                src={getCollegeLogoWithFallback('Stanford University')}
                alt="Stanford University"
                className="w-12 h-12 object-contain flex-shrink-0"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Stanford University</h4>
                <p className="text-sm text-gray-600">New chapters being added</p>
                <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  🔜 Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;