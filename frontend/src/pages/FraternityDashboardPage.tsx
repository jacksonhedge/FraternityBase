import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Heart,
  FileText,
  BarChart3,
  Settings,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Building2,
  Star,
  Search,
  Filter,
  ChevronRight,
  Trophy,
  Sparkles,
  LogOut,
  Menu,
  X,
  Handshake,
  Image,
  Package
} from 'lucide-react';

type Tab = 'my-listings' | 'marketplace' | 'my-brands' | 'assets' | 'analytics' | 'events' | 'settings';

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  industry?: string;
  website?: string;
  description?: string;
}

interface FraternityUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  college: string;
  fraternity_or_sorority: string;
  position: string;
  sponsorship_type: string;
  instagram?: string;
  website?: string;
}

const FraternityDashboardPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('my-listings');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [fraternityProfile, setFraternityProfile] = useState<FraternityUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) {
      console.log('No user ID available yet');
      return;
    }

    console.log('Fetching fraternity profile for user ID:', user.id);
    setIsLoading(true);

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        navigate('/login');
        return;
      }

      // Fetch fraternity user profile via API (bypasses RLS)
      const response = await fetch('http://localhost:3001/api/fraternity/me', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();

      if (!data.success || !data.user) {
        console.error('No profile found for user ID:', user.id);
        setError('Profile not found. Please contact support.');
        setIsLoading(false);
        return;
      }

      const profile = data.user;

      // Check if user is approved
      if (profile.approval_status !== 'approved') {
        console.log('User is not approved yet, redirecting to pending page');
        navigate('/fraternity/pending-approval');
        return;
      }

      console.log('✅ Fraternity profile loaded successfully:', profile);
      setFraternityProfile(profile);

      // Fetch approved companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('approval_status', 'approved')
        .order('name');

      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
      } else {
        setCompanies(companiesData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const industries = Array.from(new Set(companies.map(c => c.industry).filter(Boolean)));

  const menuItems = [
    { id: 'my-listings' as Tab, label: 'My Listings', icon: FileText },
    { id: 'marketplace' as Tab, label: 'Browse Brands', icon: Store },
    { id: 'my-brands' as Tab, label: 'My Sponsorships', icon: Handshake },
    { id: 'assets' as Tab, label: 'Assets & Media', icon: Image },
    { id: 'events' as Tab, label: 'My Events', icon: Calendar },
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ];

  // Show error state with retry
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                fetchData();
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
            >
              Try Again
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            <p>User ID: {user?.id}</p>
            <p className="mt-1">Check browser console for details</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state if no user or profile yet
  if (isLoading || !user || !fraternityProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">User ID: {user?.id || 'Waiting...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-40 w-64 bg-white border-r border-gray-200 h-screen transition-transform duration-300 ease-in-out`}>
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm">
                  {fraternityProfile?.fraternity_or_sorority?.substring(0, 12) || 'Chapter'}
                </h2>
                <p className="text-xs text-gray-500">{fraternityProfile?.college?.substring(0, 15) || 'Loading...'}</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-purple-50 text-purple-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Profile Section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
              {fraternityProfile?.first_name?.[0]}{fraternityProfile?.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {fraternityProfile?.first_name} {fraternityProfile?.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{fraternityProfile?.position}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'my-listings' && 'My Listings'}
                  {activeTab === 'marketplace' && 'Browse Brands'}
                  {activeTab === 'my-brands' && 'My Sponsorships'}
                  {activeTab === 'assets' && 'Assets & Media'}
                  {activeTab === 'events' && 'My Events'}
                  {activeTab === 'analytics' && 'Analytics'}
                  {activeTab === 'settings' && 'Settings'}
                </h1>
                <p className="text-sm text-gray-500">
                  {activeTab === 'my-listings' && 'Create sponsorship opportunities for brands to discover'}
                  {activeTab === 'marketplace' && 'Discover brands looking to sponsor chapters'}
                  {activeTab === 'my-brands' && 'Manage your brand partnerships'}
                  {activeTab === 'assets' && 'Logos, photos, and promotional materials'}
                  {activeTab === 'events' && 'Track and manage your events'}
                  {activeTab === 'analytics' && 'View your sponsorship performance'}
                  {activeTab === 'settings' && 'Manage your chapter profile'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                fraternityProfile?.sponsorship_type === 'event'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {fraternityProfile?.sponsorship_type === 'event' ? 'Event Sponsorship' : 'Chapter Sponsorship'}
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* My Listings Tab */}
          {activeTab === 'my-listings' && (
            <div className="space-y-6">
              {/* Existing Listings Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Your Listings</h3>
                  <span className="text-sm text-gray-500">0 active listings</span>
                </div>

                {/* Empty state for now - we'll fetch actual listings later */}
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h4>
                  <p className="text-gray-600 mb-6">Create your first sponsorship listing to start attracting brands</p>
                  <button
                    onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-medium"
                  >
                    Create Your First Listing
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 my-8"></div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create a New Listing</h3>
                <p className="text-gray-600">Choose what type of sponsorship opportunity you want to offer to brands</p>
              </div>

              {/* Sponsor Type Cards - Airbnb Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Semester Long Sponsorship */}
                <button
                  onClick={() => navigate('/app/marketplace/create')}
                  className="group cursor-pointer text-left"
                >
                  <div className="relative overflow-hidden rounded-xl mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1564982819069-0f2c8f7a8f03?w=800&h=600&fit=crop"
                      alt="Semester Long"
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white text-xs font-medium">Upload your chapter house or group photo</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Semester Long Partnership</h3>
                  <p className="text-sm text-gray-600 mb-2">Full semester brand presence</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>4-5 months</span>
                  </div>
                </button>

                {/* Charity Event */}
                <button
                  onClick={() => navigate('/app/marketplace/create')}
                  className="group cursor-pointer text-left"
                >
                  <div className="relative overflow-hidden rounded-xl mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop"
                      alt="Charity Event"
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Charity Event Sponsor</h3>
                  <p className="text-sm text-gray-600 mb-2">Philanthropic event partnership</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Heart className="w-4 h-4 mr-1" />
                    <span>Fundraiser</span>
                  </div>
                </button>

                {/* Event Sponsor */}
                <button
                  onClick={() => navigate('/app/marketplace/create')}
                  className="group cursor-pointer text-left"
                >
                  <div className="relative overflow-hidden rounded-xl mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop"
                      alt="Event Sponsor"
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Event Sponsorship</h3>
                  <p className="text-sm text-gray-600 mb-2">Single event with tiered options</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Sparkles className="w-4 h-4 mr-1" />
                    <span>Multiple tiers</span>
                  </div>
                </button>

                {/* Intramural Sports */}
                <button
                  onClick={() => navigate('/app/marketplace/create')}
                  className="group cursor-pointer text-left"
                >
                  <div className="relative overflow-hidden rounded-xl mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop"
                      alt="Intramural Sports"
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Intramural Sports</h3>
                  <p className="text-sm text-gray-600 mb-2">Jersey & game day branding</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Trophy className="w-4 h-4 mr-1" />
                    <span>Season long</span>
                  </div>
                </button>

                {/* March Madness */}
                <button
                  onClick={() => navigate('/app/marketplace/create')}
                  className="group cursor-pointer text-left"
                >
                  <div className="relative overflow-hidden rounded-xl mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop"
                      alt="March Madness"
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">March Madness Pool</h3>
                  <p className="text-sm text-gray-600 mb-2">NCAA bracket sponsorship</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>March event</span>
                  </div>
                </button>

                {/* Super Bowl Squares */}
                <button
                  onClick={() => navigate('/app/marketplace/create')}
                  className="group cursor-pointer text-left"
                >
                  <div className="relative overflow-hidden rounded-xl mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=600&fit=crop"
                      alt="Super Bowl"
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Super Bowl Squares</h3>
                  <p className="text-sm text-gray-600 mb-2">Squares pool & watch party</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Building2 className="w-4 h-4 mr-1" />
                    <span>February event</span>
                  </div>
                </button>

                {/* Fantasy Football */}
                <button
                  onClick={() => navigate('/app/marketplace/create')}
                  className="group cursor-pointer text-left"
                >
                  <div className="relative overflow-hidden rounded-xl mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=600&fit=crop"
                      alt="Fantasy Football"
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Fantasy Football League</h3>
                  <p className="text-sm text-gray-600 mb-2">Season-long league sponsor</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    <span>Full season</span>
                  </div>
                </button>

                {/* Casino Night/Poker */}
                <button
                  onClick={() => navigate('/app/marketplace/create')}
                  className="group cursor-pointer text-left"
                >
                  <div className="relative overflow-hidden rounded-xl mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800&h=600&fit=crop"
                      alt="Casino Night"
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Casino Night / Poker</h3>
                  <p className="text-sm text-gray-600 mb-2">Tournament event sponsor</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="w-4 h-4 mr-1" />
                    <span>Single event</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Brands Marketplace Tab */}
          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm">Available Brands</span>
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{companies.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm">Avg. Sponsorship</span>
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">$750</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm">Active Requests</span>
                    <Handshake className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">0</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm">Total Earned</span>
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">$0</p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search brands..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                    >
                      <option value="all">All Industries</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Brands Grid */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading brands...</p>
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                  <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No brands found</h3>
                  <p className="text-gray-600">
                    {searchQuery || selectedIndustry !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Check back soon for sponsorship opportunities'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 group cursor-pointer"
                    >
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-32 flex items-center justify-center">
                        {company.logo_url ? (
                          <img
                            src={company.logo_url}
                            alt={company.name}
                            className="w-24 h-24 object-contain bg-white rounded-lg p-2"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center">
                            <Building2 className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                            {company.name}
                          </h3>
                          <Star className="w-5 h-5 text-yellow-400 fill-current flex-shrink-0" />
                        </div>

                        {company.industry && (
                          <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                            {company.industry}
                          </span>
                        )}

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {company.description || 'Premium brand partner looking to sponsor college events and chapters'}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <DollarSign className="w-4 h-4" />
                            <span>$500 - $2,000</span>
                          </div>
                          <button className="flex items-center gap-1 text-purple-600 font-semibold text-sm hover:gap-2 transition-all">
                            Request
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Sponsorships Tab */}
          {activeTab === 'my-brands' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                <Handshake className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Sponsorships</h3>
                <p className="text-gray-600 mb-6">
                  You haven't connected with any brands yet. Start exploring the marketplace!
                </p>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                >
                  <Store className="w-5 h-5" />
                  Browse Brands
                </button>
              </div>
            </div>
          )}

          {/* Assets Tab */}
          {activeTab === 'assets' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Assets & Media</h3>
                <p className="text-gray-600 mb-6">
                  Upload your chapter logo, event photos, and promotional materials that brands can use.
                </p>
                <button className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium">
                  <Image className="w-5 h-5" />
                  Upload Assets
                </button>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Yet</h3>
                <p className="text-gray-600 mb-6">
                  Create events to attract sponsors and track your philanthropy activities.
                </p>
                <button className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium">
                  <Calendar className="w-5 h-5" />
                  Create Event
                </button>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">
                  Track sponsorship performance, event engagement, and earnings over time.
                </p>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chapter Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Name</label>
                    <input
                      type="text"
                      value={fraternityProfile?.fraternity_or_sorority || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                    <input
                      type="text"
                      value={fraternityProfile?.college || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                    <input
                      type="text"
                      value={fraternityProfile?.instagram || 'Not provided'}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="text"
                      value={fraternityProfile?.website || 'Not provided'}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FraternityDashboardPage;
