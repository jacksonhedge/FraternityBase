import { Link, useLocation, useNavigate } from 'react-router-dom';
import AnimatedOutlet from './AnimatedOutlet';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';
import {
  Home,
  Users,
  Calendar,
  Handshake,
  UserCheck,
  BarChart,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Building2,
  MapPin,
  UsersIcon,
  Settings,
  GraduationCap,
  Zap,
  Lock,
  Unlock,
  MessageSquare,
  Utensils,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  CreditCard,
  ChevronDown,
  Rocket,
  Check,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSubscriptionDropdownOpen, setIsSubscriptionDropdownOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');
  const [subscriptionTier, setSubscriptionTier] = useState<string>('Free');
  const [credits, setCredits] = useState<number>(0);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const subscriptionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, []);

  // Fetch subscription tier and credits
  useEffect(() => {
    const fetchAccountBalance = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_URL}/credits/balance`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSubscriptionTier(data.subscription_tier || 'Free');
          setCredits(data.balance_credits || 0);
        }
      } catch (error) {
        console.error('Failed to fetch account balance:', error);
      }
    };

    fetchAccountBalance();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAccountBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (subscriptionDropdownRef.current && !subscriptionDropdownRef.current.contains(event.target as Node)) {
        setIsSubscriptionDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navigationSections = [
    {
      items: [
        { name: 'Dashboard', href: '/app/dashboard', icon: Home, badge: null, requiresTeamPlan: true },
        { name: 'Map', href: '/app/map', icon: MapPin, badge: 'NEW', alwaysAccessible: true },
      ]
    },
    {
      title: 'My Chapters',
      items: [
        { name: 'My Chapters', href: '/app/my-unlocked', icon: Unlock, badge: null, requiresTeamPlan: true },
        { name: 'My Ambassadors', href: '/app/my-ambassadors', icon: Briefcase, badge: 'SOON', requiresTeamPlan: true },
      ]
    },
    {
      title: 'All Orgs',
      items: [
        { name: 'Colleges', href: '/app/colleges', icon: Building2, badge: null, requiresTeamPlan: true },
        { name: 'Chapters', href: '/app/chapters', icon: GraduationCap, badge: null, requiresTeamPlan: true },
        { name: 'Fraternities', href: '/app/fraternities', icon: Users, badge: null, requiresTeamPlan: true },
        { name: 'Sororities', href: '/app/sororities', icon: Users, badge: null, requiresTeamPlan: true },
        { name: 'Ambassadors', href: '/app/ambassadors', icon: UserCheck, badge: { text: 'Locked', type: 'lock' }, requiresTeamPlan: true },
      ]
    },
    {
      title: 'Outreach Help',
      items: [
        { name: 'Request Intro', href: '/app/outreach?type=intro', icon: MessageSquare, badge: null, requiresTeamPlan: true },
        { name: 'Request Sponsorship', href: '/app/outreach?type=sponsorship', icon: Handshake, badge: null, requiresTeamPlan: true },
      ]
    },
    {
      title: 'Bars/Restaurants',
      items: [
        { name: 'Browse Venues', href: '/app/bars', icon: Utensils, badge: 'SOON', requiresTeamPlan: true },
      ]
    },
    {
      items: [
        { name: 'Billing', href: '/app/credits', icon: CreditCard, badge: null, alwaysAccessible: true },
        { name: 'Team', href: '/app/team', icon: UsersIcon, badge: null, alwaysAccessible: true },
      ]
    },
    {
      items: [
        { name: 'Product Roadmap', href: '/app/roadmap', icon: Rocket, badge: null, alwaysAccessible: true },
      ]
    },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path.split('?')[0]);

  return (
    <div className="min-h-screen bg-green-50">
      {/* Sidebar for desktop */}
      <div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'} z-30`}>
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 bg-primary-600 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="text-3xl">🧢</div>
              {!isSidebarCollapsed && <h1 className="text-xl font-bold text-white">FraternityBase</h1>}
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-white hover:bg-primary-700 p-1 rounded transition-colors"
            >
              {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-6 overflow-y-auto overflow-x-hidden sidebar-scroll" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#D1D5DB #F3F4F6'
          }}>
            {navigationSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.title && !isSidebarCollapsed && (
                  <div className="px-3 mb-3 mt-2">
                    <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">
                      {section.title}
                    </h3>
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isPendingAndLocked = approvalStatus === 'pending' && item.href !== '/app/dashboard' && !item.alwaysAccessible;

                    // Check if item is locked based on subscription tier
                    const isFreePlan = subscriptionTier?.toLowerCase() === 'free';
                    const isTeamOrHigher = ['team', 'monthly', 'enterprise'].includes(subscriptionTier?.toLowerCase());
                    const isLockedByTier = isFreePlan && item.requiresTeamPlan && !item.alwaysAccessible;

                    return (isPendingAndLocked || isLockedByTier) ? (
                      <div
                        key={item.name}
                        className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-3' : 'justify-between px-3'} py-2.5 text-sm font-medium rounded-lg opacity-50 cursor-not-allowed`}
                        title={isSidebarCollapsed ? `${item.name} (${isPendingAndLocked ? 'Pending Approval' : 'Upgrade Required'})` : (isPendingAndLocked ? 'Pending Approval' : 'Upgrade to Team Plan')}
                      >
                        <div className="flex items-center">
                          <Icon className={`w-5 h-5 flex-shrink-0 ${!isSidebarCollapsed ? 'mr-3' : ''}`} />
                          {!isSidebarCollapsed && <span>{item.name}</span>}
                        </div>
                        {!isSidebarCollapsed && (
                          <Lock className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                    ) : (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-3' : 'justify-between px-3'} py-2.5 text-sm font-medium rounded-lg transition-all ${
                          isActive(item.href)
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        title={isSidebarCollapsed ? item.name : undefined}
                      >
                        <div className="flex items-center">
                          <Icon className={`w-5 h-5 flex-shrink-0 ${!isSidebarCollapsed ? 'mr-3' : ''}`} />
                          {!isSidebarCollapsed && <span>{item.name}</span>}
                        </div>
                        {item.badge && !isSidebarCollapsed && (
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            item.badge === 'SOON'
                              ? 'text-yellow-800 bg-yellow-200'
                              : 'text-emerald-700 bg-emerald-100'
                          }`}>
                            {typeof item.badge === 'object' ? item.badge.text : item.badge}
                          </span>
                        )}
                        {item.badge && isSidebarCollapsed && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-gray-200 flex-shrink-0">
            {isSidebarCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="text-2xl">🧢</div>
            <h1 className="text-lg font-bold text-primary-600">FraternityBase</h1>
          </div>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
            <nav className="fixed top-0 left-0 bottom-0 flex flex-col w-5/6 max-w-sm py-6 bg-white border-r">
              <div className="px-4 pb-4">
                <h2 className="text-lg font-bold text-primary-600">Menu</h2>
              </div>
              <div className="flex-1 px-2 space-y-6 overflow-y-auto">
                {navigationSections.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    {section.title && (
                      <div className="px-3 mb-3 mt-2">
                        <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">
                          {section.title}
                        </h3>
                      </div>
                    )}
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isPendingAndLocked = approvalStatus === 'pending' && item.href !== '/app/dashboard' && !item.alwaysAccessible;

                        // Check if item is locked based on subscription tier
                        const isFreePlan = subscriptionTier?.toLowerCase() === 'free';
                        const isLockedByTier = isFreePlan && item.requiresTeamPlan && !item.alwaysAccessible;

                        return (isPendingAndLocked || isLockedByTier) ? (
                          <div
                            key={item.name}
                            className="flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg opacity-50 cursor-not-allowed"
                          >
                            <div className="flex items-center">
                              <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                              <span>{item.name}</span>
                            </div>
                            <Lock className="w-4 h-4 text-yellow-600" />
                          </div>
                        ) : (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                              isActive(item.href)
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <div className="flex items-center">
                              <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                              <span>{item.name}</span>
                            </div>
                            {item.badge && (
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                item.badge === 'SOON'
                                  ? 'text-yellow-800 bg-yellow-200'
                                  : 'text-emerald-700 bg-emerald-100'
                              }`}>
                                {typeof item.badge === 'object' ? item.badge.text : item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign out
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        <div className="flex flex-col flex-1">
          {/* Top bar */}
          <header className="hidden md:flex items-center justify-end px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {/* Subscription Tier Badge Dropdown */}
              <div className="relative" ref={subscriptionDropdownRef}>
                <button
                  onClick={() => setIsSubscriptionDropdownOpen(!isSubscriptionDropdownOpen)}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold rounded-full hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-1"
                >
                  {subscriptionTier}
                  <ChevronDown className={`w-3 h-3 transition-transform ${isSubscriptionDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Subscription Dropdown Menu */}
                {isSubscriptionDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
                      <h3 className="font-bold text-lg mb-1">{subscriptionTier} Plan</h3>
                      <p className="text-xs opacity-90">
                        {subscriptionTier.toLowerCase() === 'free'
                          ? '3-day trial with limited access'
                          : subscriptionTier.toLowerCase() === 'team' || subscriptionTier.toLowerCase() === 'monthly'
                          ? 'Full platform access'
                          : 'Enterprise-level features'}
                      </p>
                    </div>
                    <div className="p-4">
                      {subscriptionTier.toLowerCase() === 'free' && (
                        <>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">1 Premium chapter unlocked</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">Browse all 5,000+ chapters</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">3 days to explore</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm">
                              <Lock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-500">Limited features</span>
                            </div>
                          </div>
                          <Link
                            to="/app/subscription"
                            onClick={() => setIsSubscriptionDropdownOpen(false)}
                            className="block w-full text-center py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                          >
                            Upgrade Now
                          </Link>
                        </>
                      )}
                      {(subscriptionTier.toLowerCase() === 'team' || subscriptionTier.toLowerCase() === 'monthly') && (
                        <>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">Unlimited platform access</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">100 monthly credits</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">Advanced search & filters</span>
                            </div>
                          </div>
                          <Link
                            to="/app/subscription"
                            onClick={() => setIsSubscriptionDropdownOpen(false)}
                            className="block w-full text-center py-2.5 px-4 border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all"
                          >
                            View Plans
                          </Link>
                        </>
                      )}
                      {subscriptionTier.toLowerCase() === 'enterprise' && (
                        <>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">Unlimited everything</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">500 monthly credits</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">Dedicated support</span>
                            </div>
                          </div>
                          <Link
                            to="/app/team"
                            onClick={() => setIsSubscriptionDropdownOpen(false)}
                            className="block w-full text-center py-2.5 px-4 border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all"
                          >
                            Manage Subscription
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {user?.company?.name || user?.companyName || 'Company'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {credits.toLocaleString()} credits
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/app/team"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <UsersIcon className="w-4 h-4 mr-3 text-gray-500" />
                      Team & Subscription
                    </Link>
                    <Link
                      to="/app/credits"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <CreditCard className="w-4 h-4 mr-3 text-gray-500" />
                      Billing
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page content with animated transitions */}
          <main className="flex-1 p-4 md:p-6">
            <AnimatedOutlet />
          </main>
        </div>
      </div>

      {/* AI Chatbot Button */}
      <button
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-110"
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* AI Chatbot Modal */}
      {isChatbotOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsChatbotOpen(false)}
              className="text-white hover:bg-primary-700 p-1 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-700">
                    Hi! I'm your AI assistant. How can I help you with FraternityBase today?
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled
              />
              <button
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Coming Soon</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;