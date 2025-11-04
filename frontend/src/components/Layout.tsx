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
import { useInactivityWarning } from '../hooks/useInactivityWarning';
import InactivityWarningModal from './InactivityWarningModal';
import BusinessTopNav from './business/BusinessTopNav';

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
  const [subscriptionTier, setSubscriptionTier] = useState<string>('trial');
  const [credits, setCredits] = useState<number>(0);
  const [companyName, setCompanyName] = useState<string>('');
  const [unlockedChaptersCount, setUnlockedChaptersCount] = useState<number>(0);
  const [unlocks, setUnlocks] = useState<{
    fiveStar: { remaining: number; isUnlimited: boolean };
    fourStar: { remaining: number; isUnlimited: boolean };
    threeStar: { remaining: number; isUnlimited: boolean };
  } | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const subscriptionDropdownRef = useRef<HTMLDivElement>(null);

  // Inactivity warning system
  const { showWarning, timeLeft, handleStayLoggedIn, handleLogout: handleInactivityLogout } = useInactivityWarning({
    warningTime: 15 * 60 * 1000, // 15 minutes of inactivity
    logoutTime: 2 * 60 * 1000, // 2 minutes warning period
  });

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
          setSubscriptionTier(data.subscriptionTier || 'trial');
          setCredits(data.balanceCredits || 0);
          setCompanyName(data.companyName || '');
          setUnlocks(data.unlocks || null);
          console.log('💰 Balance updated in Layout:', { credits: data.balanceCredits, unlocks: data.unlocks });
        }
      } catch (error) {
        console.error('Failed to fetch account balance:', error);
      }
    };

    fetchAccountBalance();

    // Listen for balance update events from other components
    const handleBalanceUpdate = (event: CustomEvent) => {
      console.log('📢 Received balanceUpdated event in Layout:', event.detail);
      fetchAccountBalance(); // Refresh immediately
    };

    window.addEventListener('balanceUpdated', handleBalanceUpdate as EventListener);

    // Refresh every 30 seconds
    const interval = setInterval(fetchAccountBalance, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
    };
  }, []);

  // Fetch unlocked chapters count
  useEffect(() => {
    const fetchUnlockedCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_URL}/chapters/unlocked`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setUnlockedChaptersCount(result.data.length);
          }
        }
      } catch (error) {
        console.error('Failed to fetch unlocked chapters count:', error);
      }
    };

    fetchUnlockedCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnlockedCount, 30000);
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

  // Define which items are accessible for business users
  const businessAccessiblePaths = ['/app/dashboard', '/app/map', '/app/sponsorships'];

  const navigationSections = [
    {
      items: [
        { name: 'Dashboard', href: '/app/dashboard', icon: Home, badge: null, requiresTeamPlan: true, businessAccessible: true },
        { name: 'Partnership Marketplace', href: '/app/sponsorships', icon: Briefcase, badge: { text: 'NEW', type: 'success' }, requiresTeamPlan: true, businessAccessible: true },
      ]
    },
    {
      title: 'Visualization',
      items: [
        { name: 'Map', href: '/app/map', icon: MapPin, badge: null, comingSoon: false, alwaysAccessible: true, iconColor: 'text-yellow-500', businessAccessible: true },
        { name: 'SuperMap', href: '/app/supermap', icon: MapPin, badge: import.meta.env.PROD ? 'SOON' : 'BETA', comingSoon: true, alwaysAccessible: true, businessAccessible: false },
      ]
    },
    {
      title: 'My Chapters',
      items: [
        {
          name: 'My Chapters',
          href: '/app/my-unlocked',
          icon: Unlock,
          badge: unlockedChaptersCount > 0 ? { text: String(unlockedChaptersCount), type: 'gold' } : null,
          requiresTeamPlan: true,
          businessAccessible: false
        },
        { name: 'Requested Introductions', href: '/app/requested-introductions', icon: Handshake, badge: null, requiresTeamPlan: true, businessAccessible: false },
        { name: 'My Ambassadors', href: '/app/my-ambassadors', icon: Briefcase, badge: 'SOON', requiresTeamPlan: true, businessAccessible: false },
      ]
    },
    {
      title: 'All Orgs',
      items: [
        { name: 'Colleges', href: '/app/colleges', icon: Building2, badge: null, requiresTeamPlan: true, businessAccessible: false },
        { name: 'Fraternities', href: '/app/chapters', icon: GraduationCap, badge: null, requiresTeamPlan: true, businessAccessible: false },
        { name: 'Sororities', href: '/app/sororities', icon: Users, badge: '834 • SOON', requiresTeamPlan: true, comingSoon: true, businessAccessible: false },
        { name: 'Ambassadors', href: '/app/ambassadors', icon: UserCheck, badge: { text: 'Locked', type: 'lock' }, requiresTeamPlan: true, businessAccessible: false },
      ]
    },
    {
      title: 'Bars/Restaurants',
      items: [
        { name: 'Browse Venues', href: '/app/bars', icon: Utensils, badge: 'SOON', requiresTeamPlan: true, businessAccessible: false },
      ]
    },
    {
      items: [
        { name: 'Billing', href: '/app/marketplace-pricing', icon: CreditCard, badge: null, alwaysAccessible: true, businessAccessible: true },
        { name: 'Credit System', href: '/app/credit-system', icon: Zap, badge: null, alwaysAccessible: true, businessAccessible: true },
        { name: 'Team', href: '/app/team', icon: UsersIcon, badge: null, alwaysAccessible: true, businessAccessible: true },
      ]
    },
    {
      items: [
        { name: 'Product Roadmap', href: '/app/roadmap', icon: Rocket, badge: null, alwaysAccessible: true, businessAccessible: true },
      ]
    },
  ];

  const isActive = (path: string) => {
    const basePath = path.split('?')[0];
    // Special case: "My Chapters" nav item should be active for both /app/my-unlocked and /app/my-unlocked
    if (basePath === '/app/my-unlocked' && location.pathname.startsWith('/app/my-unlocked')) {
      return true;
    }
    return location.pathname.startsWith(basePath);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* New Top Navigation */}
      <BusinessTopNav
        userName={user?.email?.split('@')[0] || 'User'}
        notificationCount={0}
        unlockedChaptersCount={unlockedChaptersCount}
      />

      {/* Main Content - No sidebar offset */}
      <main className="w-full">
        <AnimatedOutlet />
      </main>

      {/* Inactivity Warning Modal */}
      {showWarning && (
        <InactivityWarningModal
          onContinue={handleStayLoggedIn}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default Layout;

