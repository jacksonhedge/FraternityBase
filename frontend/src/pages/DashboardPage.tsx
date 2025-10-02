// import { useSelector } from 'react-redux';
// import { RootState } from '../store/store';
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

const DashboardPage = () => {
  // const { user } = useSelector((state: RootState) => state.auth);
  const user = { firstName: 'Demo', lastName: 'User' };
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [purchasedCredits, setPurchasedCredits] = useState(0);

  // Fetch real data from API
  const [creditBalance, setCreditBalance] = useState(0);
  const [lifetimeCredits, setLifetimeCredits] = useState(0);
  const [unlockedChapters, setUnlockedChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Fetch credit balance and unlocked chapters
    if (token) {
      Promise.all([
        fetch(`${API_URL}/credits/balance`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()),
        fetch(`${API_URL}/chapters/unlocked`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json())
      ])
        .then(([creditsData, chaptersData]) => {
          setCreditBalance(creditsData.balance || 0);
          setLifetimeCredits(creditsData.lifetime || 0);
          setUnlockedChapters(chaptersData.data || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch dashboard data:', err);
          setLoading(false);
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

  // Data Inventory Stats - What we have for sale
  const stats = [
    {
      label: 'Greek Chapters',
      value: '240',
      change: 'Sigma Chi only',
      trend: 'neutral',
      icon: Users,
      color: 'primary',
      description: 'Active chapters nationwide'
    },
    {
      label: 'Potential Members',
      value: '18,500+',
      change: 'Verified contacts',
      trend: 'neutral',
      icon: Target,
      color: 'green',
      description: 'Undergrads & alumni'
    },
    {
      label: 'States Covered',
      value: '48',
      change: 'Coast to coast',
      trend: 'neutral',
      icon: TrendingUp,
      color: 'blue',
      description: 'National coverage'
    },
    {
      label: 'Data Quality',
      value: 'A-Grade',
      change: 'Verified 2024',
      trend: 'up',
      icon: Award,
      color: 'purple',
      description: 'Fresh, accurate data'
    }
  ];

  const recentActivities = [
    {
      type: 'unlock',
      title: 'Unlocked USC Sigma Chi roster (85 members)',
      time: '2 hours ago',
      status: 'new',
      credits: -25
    },
    {
      type: 'purchase',
      title: 'Purchased 500 credits - Popular Pack',
      time: '5 hours ago',
      status: 'confirmed',
      credits: +500
    },
    {
      type: 'export',
      title: 'Exported UCLA Sigma Chi contact list',
      time: '1 day ago',
      status: 'confirmed',
      credits: -25
    },
    {
      type: 'unlock',
      title: 'Unlocked officer contacts - Ohio State Sigma Chi',
      time: '2 days ago',
      status: 'confirmed',
      credits: -50
    }
  ];

  // Top chapters available to unlock
  const topChapters = [
    {
      id: 'usc-sigma-chi',
      name: 'USC Sigma Chi',
      university: 'University of Southern California',
      members: 85,
      grade: 'A',
      status: 'Free Demo'
    },
    {
      id: 'ucla-sigma-chi',
      name: 'UCLA Sigma Chi',
      university: 'University of California, Los Angeles',
      members: 92,
      grade: 'A',
      status: '100 credits'
    },
    {
      id: 'ohio-state-sigma-chi',
      name: 'Ohio State Sigma Chi',
      university: 'The Ohio State University',
      members: 110,
      grade: 'A+',
      status: '120 credits'
    }
  ];

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

      {/* CREDIT BALANCE - Compact */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-lg shadow-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">Available Credits</span>
            </div>
            <div className="text-3xl font-bold tracking-tight">
              {creditBalance.toLocaleString()}
            </div>
            {lifetimeCredits > 0 && (
              <span className="text-purple-200 text-xs">
                ({lifetimeCredits.toLocaleString()} lifetime)
              </span>
            )}
          </div>
          <Link
            to="/dashboard/credits"
            className="inline-block bg-white text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-colors shadow-lg"
          >
            Buy Credits
          </Link>
        </div>
      </div>

      {/* MY UNLOCKED CHAPTERS - Quick access to purchased data */}
      {unlockedChapters.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border-2 border-green-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Unlock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">My Unlocked Chapters</h2>
                  <p className="text-sm text-gray-600">
                    {unlockedChapters.length} chapter{unlockedChapters.length !== 1 ? 's' : ''} • Access expires 6 months after unlock
                  </p>
                </div>
              </div>
              <Link
                to="/app/chapters"
                className="text-sm text-green-700 font-medium hover:text-green-800"
              >
                Browse More →
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unlockedChapters.map((chapter) => {
                const daysUntilExpiry = chapter.expiresAt
                  ? Math.ceil((new Date(chapter.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : null;

                return (
                  <Link
                    key={chapter.id}
                    to={`/app/chapters/${chapter.id}`}
                    className="block border-2 border-green-200 hover:border-green-400 rounded-lg p-4 bg-gradient-to-br from-white to-green-50 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{chapter.name}</h3>
                        <p className="text-sm text-gray-600">{chapter.university}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                        Grade {chapter.grade}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {chapter.members} members
                      </span>
                      {daysUntilExpiry && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {daysUntilExpiry} days left
                        </span>
                      )}
                      {!daysUntilExpiry && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Permanent access
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        chapter.accessLevel === 'full'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {chapter.accessLevel === 'full' && '✓ Full Access (Names + Emails + Phones)'}
                        {chapter.accessLevel === 'roster' && '✓ Roster Only (Names)'}
                        {chapter.accessLevel === 'emails' && '✓ Roster + Emails'}
                        {chapter.accessLevel === 'phones' && '✓ Roster + Phones'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        Unlocked {new Date(chapter.unlockedAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-green-100 rounded transition-colors" title="Download CSV">
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                        {chapter.accessLevel !== 'roster' && (
                          <>
                            {(chapter.accessLevel === 'emails' || chapter.accessLevel === 'full') && (
                              <Mail className="w-4 h-4 text-green-600" />
                            )}
                            {(chapter.accessLevel === 'phones' || chapter.accessLevel === 'full') && (
                              <Phone className="w-4 h-4 text-green-600" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Browse 240 Sigma Chi chapters • 18,500+ verified contacts • Unlock with credits
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
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
        {/* Recent Activity */}
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

        {/* Top Chapters to Unlock */}
        <div className="bg-white rounded-lg shadow-sm">
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
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${
                      chapter.status === 'Free Demo'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {chapter.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/app/chapters" className="inline-block mt-4 text-primary-600 text-sm font-medium hover:text-primary-700">
              Browse all 240 chapters →
            </Link>
          </div>
        </div>
      </div>

      {/* Credit Usage Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
          Credit Usage Overview
        </h2>
        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Credit usage analytics coming soon</p>
            <p className="text-sm text-gray-500">Track spending patterns across chapters and features</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg shadow-sm p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/app/chapters" className="block bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
            <Users className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Browse 240 Chapters</span>
          </Link>
          <Link to="/dashboard/credits" className="block bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
            <Coins className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Buy Credits</span>
          </Link>
          <button className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
            <DollarSign className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">My Unlocked Data</span>
          </button>
          <button className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
            <Target className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">View Transactions</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;