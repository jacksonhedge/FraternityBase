import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import AuthProvider from './components/AuthProvider';
import { useEffect, useRef } from 'react';
import { animate, set } from 'animejs';
import { DURATIONS, EASINGS, shouldAnimate } from './animations/constants';
import { useActivityTracking } from './hooks/useActivityTracking';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BrowsePage from './pages/BrowsePage';
import AboutPage from './pages/AboutPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import AdminDashboard from './pages/AdminDashboard';
import DashboardPage from './pages/DashboardPage';
import TeamPage from './pages/TeamPage';
import FraternitiesPage from './pages/FraternitiesPage';
import SororitiesPage from './pages/SororitiesPage';
import CollegesPage from './pages/CollegesPage';
import CollegeDetailPage from './pages/CollegeDetailPage';
import MapPage from './pages/MapPage';
import MapPageFullScreen from './pages/MapPageFullScreen';
import ChaptersPage from './pages/ChaptersPage';
import ChapterDetailPage from './pages/ChapterDetailPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import PartnershipsPage from './pages/PartnershipsPage';
import PartnershipDetailPage from './pages/PartnershipDetailPage';
import AmbassadorsPage from './pages/AmbassadorsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import PricingPage from './pages/PricingPage';
import CreditsPage from './pages/CreditsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AdminPageV3 from './pages/AdminPageV3';
import AdminPageV4 from './pages/AdminPageV4';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminAnalyticsDashboard from './pages/AdminAnalyticsDashboard';
import AdminCSVUploadPage from './pages/AdminCSVUploadPage';
import MyChaptersPage from './pages/MyChaptersPage';
import MyCollegesPage from './pages/MyCollegesPage';
import MyBarsPage from './pages/MyBarsPage';
import MyUnlockedPage from './pages/MyUnlockedPage';
import RequestedIntroductionsPage from './pages/RequestedIntroductionsPage';
import MyAmbassadorsPage from './pages/MyAmbassadorsPage';
import OutreachPage from './pages/OutreachPage';
import BarsPage from './pages/BarsPage';
import ProductRoadmapPage from './pages/ProductRoadmapPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import SharePage from './pages/SharePage';
import CreditSystemPage from './pages/CreditSystemPage';

// Animated wrapper for all routes
function AnimatedRoutes() {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const previousLocation = useRef(location.pathname);

  // Initialize activity tracking (logs page views automatically)
  const { trackClick } = useActivityTracking();

  // Global click tracking
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Only track specific elements with data-track attribute or important elements
      const trackableElement = target.closest('[data-track], button, a, [role="button"]');

      if (trackableElement && trackableElement instanceof HTMLElement) {
        trackClick(trackableElement);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [trackClick]);

  useEffect(() => {
    if (!containerRef.current || !shouldAnimate()) return;
    if (previousLocation.current === location.pathname) return;

    const container = containerRef.current;

    // Set initial state
    set(container, {
      opacity: 0,
      translateY: 20,
    });

    // Animate in
    animate(container, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: DURATIONS.normal,
      ease: EASINGS.easeOut,
    });

    previousLocation.current = location.pathname;
  }, [location.pathname]);

  return (
    <div ref={containerRef} style={{ willChange: shouldAnimate() ? 'transform, opacity' : 'auto' }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />

          {/* Admin Routes - Nested with specific paths */}
          <Route path="/admin" element={<AdminRoute><AdminPageV4 /></AdminRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
          <Route path="/admin/dashboard" element={<AdminRoute><AdminPageV4 /></AdminRoute>} />
          <Route path="/admin/companies" element={<AdminRoute><AdminPageV4 /></AdminRoute>} />
          <Route path="/admin/fraternities" element={<AdminRoute><AdminPageV4 /></AdminRoute>} />
          <Route path="/admin/colleges" element={<AdminRoute><AdminPageV4 /></AdminRoute>} />
          <Route path="/admin/chapters" element={<AdminRoute><AdminPageV4 /></AdminRoute>} />
          <Route path="/admin/ambassadors" element={<AdminRoute><AdminPageV4 /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminPageV4 /></AdminRoute>} />
          <Route path="/admin/waitlist" element={<AdminRoute><AdminPageV4 /></AdminRoute>} />
          <Route path="/admin/payments" element={<AdminRoute><AdminPageV4 /></AdminRoute>} />
          <Route path="/admin/unlocks" element={<AdminRoute><AdminPageV4 /></AdminRoute>} />
          <Route path="/admin/credits" element={<AdminRoute><AdminPageV4 /></AdminRoute>} />
          <Route path="/admin/intelligence" element={<AdminRoute><AdminPageV4 /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminPageV4 /></AdminRoute>} />
          <Route path="/admin/activity" element={<AdminRoute><AdminPageV4 /></AdminRoute>} />
          <Route path="/admin/roadmap" element={<AdminRoute><AdminPageV4 /></AdminRoute>} />
          <Route path="/admin/csv-upload" element={<AdminRoute><AdminCSVUploadPage /></AdminRoute>} />
          <Route path="/admin-analytics" element={<AdminRoute><AdminAnalyticsDashboard /></AdminRoute>} />

          {/* Public Map Route */}
          <Route path="/dashboard-map" element={<MapPageFullScreen />} />

          {/* Public Share Route */}
          <Route path="/share/:token" element={<SharePage />} />

          {/* Private Routes */}
          <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/app/map" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="my-unlocked" element={<MyUnlockedPage />} />
            <Route path="my-unlocked" element={<MyChaptersPage />} />
            <Route path="my-unlocked/:id" element={<ChapterDetailPage />} />
            <Route path="requested-introductions" element={<RequestedIntroductionsPage />} />
            <Route path="my-ambassadors" element={<MyAmbassadorsPage />} />
            <Route path="my-colleges" element={<MyCollegesPage />} />
            <Route path="my-bars" element={<MyBarsPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="fraternities" element={<FraternitiesPage />} />
            <Route path="sororities" element={<SororitiesPage />} />
            <Route path="colleges" element={<CollegesPage />} />
            <Route path="colleges/:id" element={<CollegeDetailPage />} />
            <Route path="map" element={<MapPageFullScreen />} />
            <Route path="chapters" element={<ChaptersPage />} />
            <Route path="chapters/:id" element={<ChapterDetailPage />} />
            <Route path="outreach" element={<OutreachPage />} />
            <Route path="bars" element={<BarsPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="partnerships" element={<PartnershipsPage />} />
            <Route path="partnerships/:id" element={<PartnershipDetailPage />} />
            <Route path="ambassadors" element={<AmbassadorsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="credits" element={<CreditsPage />} />
            <Route path="credit-system" element={<CreditSystemPage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
            <Route path="roadmap" element={<ProductRoadmapPage />} />
          </Route>
        </Routes>
      </div>
    );
}

function App() {
  console.log('🧢 FraternityBase App loaded - Routes available: /, /signup, /pricing, /login - v3 [TEST]');

  // Add a loading check
  if (!store) {
    return <div style={{ padding: '20px', background: '#000', color: '#fff' }}>Loading Store...</div>;
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
          <Router>
            <AnimatedRoutes />
          </Router>
        </AuthProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;