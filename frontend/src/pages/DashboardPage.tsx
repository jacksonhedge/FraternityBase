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
  const [comingSoonItems, setComingSoonItems] = useState<any[]>([]);
  // Only show loading screen on initial app load, not on navigation
  const hasSeenLoading = sessionStorage.getItem('hasSeenDashboardLoading') === 'true';
  const [loading, setLoading] = useState(!hasSeenLoading);
  const [loadingComplete, setLoadingComplete] = useState(hasSeenLoading);
  const [showDashboard, setShowDashboard] = useState(hasSeenLoading);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');
  const [recentChapters, setRecentChapters] = useState<any[]>([]);
  const [recentAdditions, setRecentAdditions] = useState<any[]>([]);

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
        fetch(`${API_URL}/chapters/recent`).then(res => res.json()).catch(() => ({ data: [] })),
        fetch(`${API_URL}/admin/coming-tomorrow`).then(res => res.json()).catch(() => ({ data: [] })),
        fetch(`${API_URL}/dashboard/recent-additions`).then(res => res.json()).catch(() => ({ data: [] }))
      ])
        .then(([creditsData, chaptersData, allChaptersData, universitiesData, activityData, recentChaptersData, comingTomorrowData, recentAdditionsData]) => {
          console.log('[Dashboard] Recent chapters API response:', recentChaptersData);
          console.log('[Dashboard] Recent chapters data array:', recentChaptersData.data);
          console.log('[Dashboard] Coming tomorrow data:', comingTomorrowData);
          console.log('[Dashboard] Recent additions data:', recentAdditionsData);

          setAccountBalance(creditsData.balance || 0);
          setLifetimeSpent(creditsData.lifetimeSpent || 0);
          setLifetimeAdded(creditsData.lifetimeAdded || 0);
          setSubscriptionTier(creditsData.subscriptionTier || 'trial');
          setUnlockedChapters(chaptersData.data || []);
          setActivityFeed(activityData.data || []);
          setComingSoonItems(comingTomorrowData.data || []);
          setRecentAdditions(recentAdditionsData.data || []);

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
            className="text-green-600 hover:text-green-800 transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* RECENT ACTIVITY TICKERTAPE - Enhanced with Anime.js */}
      <AnimatedTickertape activities={recentChapters} />


      {/* Header */}
      <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl shadow-lg border-2 border-blue-100 p-4 sm:p-6 md:p-8 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl -ml-24 -mb-24"></div>

        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent break-words">
            {user?.company?.name ? `Welcome back, ${user.company.name}!` : 'Welcome Back!'}
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base md:text-lg">
            Here's your partnership network overview
          </p>
        </div>
      </div>

      {/* Stats Grid - Enhanced KPI Cards */}
      <div ref={statsContainerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Unlocked Chapters */}
        <div
          data-animate-card
          className="group relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden p-4 sm:p-6"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl transform group-hover:rotate-12 transition-transform duration-300">
                <Unlock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{unlockedChapters.length}</div>
            <div className="text-xs sm:text-sm text-white/90 font-medium">Unlocked Chapters</div>
            <p className="text-xs text-white/70 mt-1">Your active partnerships</p>

            <Link
              to="/app/chapters"
              className="mt-3 sm:mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white hover:bg-gray-100 text-blue-600 rounded-lg font-semibold transition-all shadow-md text-xs sm:text-sm"
            >
              <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
              Unlock More
            </Link>
          </div>
        </div>

        {/* Unlocked Ambassadors */}
        <div
          data-animate-card
          className="group relative bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden p-4 sm:p-6"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl transform group-hover:rotate-12 transition-transform duration-300">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {unlockedChapters.reduce((sum, ch) => sum + (ch.unlockedTypes?.includes('leadership_access') ? 5 : 0), 0)}
            </div>
            <div className="text-xs sm:text-sm text-white/90 font-medium">Unlocked Ambassadors</div>
            <p className="text-xs text-white/70 mt-1">Officers you can contact</p>

            <Link
              to="/app/my-unlocked"
              className="mt-3 sm:mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white hover:bg-gray-100 text-purple-600 rounded-lg font-semibold transition-all shadow-md text-xs sm:text-sm"
            >
              <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
              View Contacts
            </Link>
          </div>
        </div>

        {/* Credits Balance */}
        <div
          data-animate-card
          className="group relative bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden p-4 sm:p-6"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl transform group-hover:rotate-12 transition-transform duration-300">
                <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{accountBalance}</div>
            <div className="text-xs sm:text-sm text-white/90 font-medium">Credits Balance</div>
            <p className="text-xs text-white/70 mt-1">Available to spend</p>

            <Link
              to="/app/credits"
              className="mt-3 sm:mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white hover:bg-gray-100 text-green-600 rounded-lg font-semibold transition-all shadow-md text-xs sm:text-sm"
            >
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
              Buy Credits
            </Link>
          </div>
        </div>

        {/* Total Network Size */}
        <div
          data-animate-card
          className="group relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden p-4 sm:p-6"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl transform group-hover:rotate-12 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {unlockedChapters.reduce((sum, ch) => sum + (ch.memberCount || 0), 0)}
            </div>
            <div className="text-xs sm:text-sm text-white/90 font-medium">Total Network Size</div>
            <p className="text-xs text-white/70 mt-1">Combined members reached</p>

            <Link
              to="/app/map"
              className="mt-3 sm:mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white hover:bg-gray-100 text-orange-600 rounded-lg font-semibold transition-all shadow-md text-xs sm:text-sm"
            >
              <Target className="w-3 h-3 sm:w-4 sm:h-4" />
              Expand Network
            </Link>
          </div>
        </div>
      </div>

      {/* Newly Added & Coming Tomorrow - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Newly Added Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Newly Added
            </h2>
          </div>
          <div className={`p-6 ${approvalStatus === 'pending' ? 'pointer-events-none opacity-60' : ''}`}>
            {recentAdditions.length > 0 ? (
              <div className="space-y-4">
                {recentAdditions.slice(0, 6).map((item) => {
                  const borderColor = item.type === 'university' ? 'green-500' :
                                     item.type === 'chapter' ? 'blue-500' :
                                     'purple-500';
                  const badgeBg = item.type === 'university' ? 'green-100' :
                                 item.type === 'chapter' ? 'blue-100' :
                                 'purple-100';
                  const badgeText = item.type === 'university' ? 'green-700' :
                                   item.type === 'chapter' ? 'blue-700' :
                                   'purple-700';
                  const badgeLabel = item.type === 'university' ? '🏫 New School' :
                                    item.type === 'chapter' ? '🆕 New Chapter' :
                                    `📋 Updated Roster${item.member_count ? ` (${item.member_count})` : ''}`;

                  const createdDate = new Date(item.created_at);
                  const formattedDate = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                  return (
                    <div key={`${item.type}-${item.id}`} className={`border-l-4 border-${borderColor} pl-4 cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all duration-200 rounded-r-lg hover:-translate-y-0.5 p-3 -ml-1`}>
                      <div className="flex items-start gap-3">
                        <img
                          src={getCollegeLogoWithFallback(item.college_name)}
                          alt={item.college_name}
                          className="w-12 h-12 object-contain flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formattedDate}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <span className={`inline-block mt-2 text-xs px-2 py-1 bg-${badgeBg} text-${badgeText} rounded-full`}>
                            {badgeLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent additions in the past 3 days
              </div>
            )}
          </div>
        </div>

        {/* Coming Tomorrow Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
              Coming Tomorrow
            </h2>
          </div>
          <div className={`p-6 ${approvalStatus === 'pending' ? 'pointer-events-none opacity-60' : ''}`}>
            {comingSoonItems.length > 0 ? (
              <div className="space-y-4">
                {comingSoonItems.map((item) => {
                  const borderColor = item.update_type === 'new_chapter' ? 'orange-500' :
                                     item.update_type === 'roster_update' ? 'yellow-500' :
                                     'pink-500';
                  const scoreColor = item.update_type === 'new_chapter' ? 'orange-600' :
                                    item.update_type === 'roster_update' ? 'yellow-600' :
                                    'pink-600';
                  const badgeBg = item.update_type === 'new_chapter' ? 'orange-100' :
                                 item.update_type === 'roster_update' ? 'yellow-100' :
                                 'pink-100';
                  const badgeText = item.update_type === 'new_chapter' ? 'orange-700' :
                                   item.update_type === 'roster_update' ? 'yellow-700' :
                                   'pink-700';
                  // Format the scheduled date
                  const scheduledDate = item.scheduled_date ? new Date(item.scheduled_date) : null;
                  const dateStr = scheduledDate ? scheduledDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Soon';

                  const badgeLabel = item.update_type === 'new_chapter' ? `🚀 New Chapter ${dateStr}` :
                                    item.update_type === 'roster_update' ? `📋 Roster Update ${dateStr}` :
                                    `🚀 New Sorority ${dateStr}`;

                  return (
                    <div key={item.id} className={`border-l-4 border-${borderColor} pl-4 cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all duration-200 rounded-r-lg hover:-translate-y-0.5 p-3 -ml-1`}>
                      <div className="flex items-start gap-3">
                        <img
                          src={getCollegeLogoWithFallback(item.college_name)}
                          alt={item.college_name}
                          className="w-12 h-12 object-contain flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-gray-900">
                              {item.chapter_name ? `${item.college_name} ${item.chapter_name}` : item.college_name}
                            </h4>
                            {item.anticipated_score && (
                              <span className={`text-xs text-${scoreColor} font-semibold flex items-center gap-1`}>
                                <Award className="w-3 h-3" />
                                {item.anticipated_score}⭐
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {item.college_name}
                            {item.expected_member_count && ` • Expected ${item.expected_member_count} members`}
                          </p>
                          <span className={`inline-block mt-2 text-xs px-2 py-1 bg-${badgeBg} text-${badgeText} rounded-full`}>
                            {badgeLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No upcoming additions scheduled
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;