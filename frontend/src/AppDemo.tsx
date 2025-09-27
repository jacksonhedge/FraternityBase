import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ChaptersPage from './pages/ChaptersPage';
import ChapterDetailPage from './pages/ChapterDetailPage';
import EventsPage from './pages/EventsPage';
import PartnershipsPage from './pages/PartnershipsPage';
import AmbassadorsPage from './pages/AmbassadorsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';

// Mock auth provider
const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  user: any;
  login: () => void;
  logout: () => void;
}>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {}
});

import React from 'react';

function AppDemo() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to true for demo
  const [user] = useState({
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@collegeorgnetwork.com'
  });

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes - For demo, always accessible */}
          <Route path="/app/dashboard" element={<DashboardPage />} />
          <Route path="/app/chapters" element={<ChaptersPage />} />
          <Route path="/app/chapters/:id" element={<ChapterDetailPage />} />
          <Route path="/app/events" element={<EventsPage />} />
          <Route path="/app/partnerships" element={<PartnershipsPage />} />
          <Route path="/app/ambassadors" element={<AmbassadorsPage />} />
          <Route path="/app/analytics" element={<AnalyticsPage />} />
          <Route path="/app/profile" element={<ProfilePage />} />
          <Route path="/app" element={<Navigate to="/app/dashboard" />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default AppDemo;