import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SignUpPage from './pages/SignUpPage';
import BrowsePage from './pages/BrowsePage';
import AboutPage from './pages/AboutPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import AdminDashboard from './pages/AdminDashboard';
import DashboardPage from './pages/DashboardPage';
import TeamPage from './pages/TeamPage';
import FraternitiesPage from './pages/FraternitiesPage';
import CollegesPage from './pages/CollegesPage';
import CollegeDetailPage from './pages/CollegeDetailPage';
import MapPage from './pages/MapPage';
import ChaptersPage from './pages/ChaptersPage';
import ChapterDetailPage from './pages/ChapterDetailPage';
import EventsPage from './pages/EventsPage';
import PartnershipsPage from './pages/PartnershipsPage';
import AmbassadorsPage from './pages/AmbassadorsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import PricingPage from './pages/PricingPage';
import AdminPageV3 from './pages/AdminPageV3';
import AdminLoginPage from './pages/AdminLoginPage';

function App() {
  console.log('College Org Network App loaded - Routes available: /, /signup, /pricing, /login - v3');

  // Add a loading check
  if (!store) {
    return <div style={{ padding: '20px', background: '#000', color: '#fff' }}>Loading Store...</div>;
  }

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin-panel" element={<AdminRoute><AdminPageV3 /></AdminRoute>} />

          {/* Private Routes */}
          <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="fraternities" element={<FraternitiesPage />} />
            <Route path="colleges" element={<CollegesPage />} />
            <Route path="colleges/:id" element={<CollegeDetailPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="chapters" element={<ChaptersPage />} />
            <Route path="chapters/:id" element={<ChapterDetailPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="partnerships" element={<PartnershipsPage />} />
            <Route path="ambassadors" element={<AmbassadorsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;