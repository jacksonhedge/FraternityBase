import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { supabase } from '../lib/supabase';
import {
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Heart,
  Star,
  Search,
  Filter,
  ChevronRight,
  Trophy,
  Sparkles,
  Globe
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  industry?: string;
  website?: string;
  description?: string;
}

interface SponsorshipOpportunity {
  id: string;
  company: Company;
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  event_types?: string[];
  requirements?: string;
  status: string;
  created_at: string;
}

const FraternityMarketplacePage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [opportunities, setOpportunities] = useState<SponsorshipOpportunity[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVertical, setSelectedVertical] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
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

      // TODO: Fetch sponsorship opportunities when that table is created
      // For now, we'll show companies as potential sponsors

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVertical = selectedVertical === 'all' || (company as any).business_vertical === selectedVertical;
    return matchesSearch && matchesVertical;
  });

  const verticals = Array.from(new Set(companies.map((c: any) => c.business_vertical).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-10 h-10" />
              <h1 className="text-4xl font-bold">Sponsorship Marketplace</h1>
            </div>
            <div className="hidden md:block">
              <div className="bg-green-500 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg animate-pulse">
                100% FREE TO JOIN
              </div>
            </div>
          </div>
          <p className="text-xl text-purple-100 mb-2">
            Find brands to sponsor your fraternity's events and philanthropies
          </p>
          <p className="text-lg text-purple-200 font-semibold">
            🎉 Free to sign up • Free to get listed • Free to connect with brands
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5" />
                <span className="font-semibold">Top Brands</span>
              </div>
              <p className="text-3xl font-bold">{companies.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="font-semibold">Avg. Sponsorship</span>
              </div>
              <p className="text-3xl font-bold">$500+</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5" />
                <span className="font-semibold">Your Events</span>
              </div>
              <p className="text-3xl font-bold">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Business Vertical Toggles */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filter by Category</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedVertical('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedVertical === 'all'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Brands
              </button>
              <button
                onClick={() => setSelectedVertical('Fantasy Sports')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedVertical === 'Fantasy Sports'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🏈 Fantasy Sports
              </button>
              <button
                onClick={() => setSelectedVertical('Sportsbook/Casino')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedVertical === 'Sportsbook/Casino'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🎰 Sportsbook/Casino
              </button>
              <button
                onClick={() => setSelectedVertical('Food & Beverage')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedVertical === 'Food & Beverage'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🍔 Food & Beverage
              </button>
              <button
                onClick={() => setSelectedVertical('Apparel')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedVertical === 'Apparel'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👕 Apparel
              </button>
              <button
                onClick={() => setSelectedVertical('Technology')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedVertical === 'Technology'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💻 Technology
              </button>
              <button
                onClick={() => setSelectedVertical('Entertainment')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedVertical === 'Entertainment'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🎬 Entertainment
              </button>
              {verticals
                .filter(v => !['Fantasy Sports', 'Sportsbook/Casino', 'Food & Beverage', 'Apparel', 'Technology', 'Entertainment'].includes(v))
                .map(vertical => (
                  <button
                    key={vertical}
                    onClick={() => setSelectedVertical(vertical)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedVertical === vertical
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {vertical}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Featured Brands Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Featured Brands</h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading brands...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
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
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                >
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-32 flex items-center justify-center">
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
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {company.name}
                      </h3>
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    </div>

                    {(company as any).business_vertical && (
                      <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                        {(company as any).business_vertical}
                      </span>
                    )}

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {company.description || 'Premium brand partner looking to sponsor college events'}
                    </p>

                    {/* Social Media Links */}
                    <div className="flex items-center gap-3 mb-4">
                      {(company as any).instagram_url && (
                        <a
                          href={(company as any).instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-500 hover:text-pink-600 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                      )}
                      {(company as any).linkedin_url && (
                        <a
                          href={(company as any).linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:text-blue-800 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                      {(company as any).twitter_url && (
                        <a
                          href={(company as any).twitter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-500 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                        </a>
                      )}
                      {(company as any).website && (
                        <a
                          href={(company as any).website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-700 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="w-5 h-5" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <DollarSign className="w-4 h-4" />
                        <span>$500 - $2,000</span>
                      </div>
                      <button className="flex items-center gap-1 text-purple-600 font-semibold text-sm hover:gap-2 transition-all">
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Free CTA Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-xl p-8 text-white mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">🎉 Completely Free for Fraternities & Sororities</h2>
            <p className="text-xl text-green-100 mb-6">
              No hidden fees. No credit card required. Get your chapter listed in minutes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-2xl font-bold mb-1">$0</p>
                <p className="text-green-100">Sign Up Fee</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-2xl font-bold mb-1">$0</p>
                <p className="text-green-100">Listing Fee</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-2xl font-bold mb-1">$0</p>
                <p className="text-green-100">Connection Fee</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/fraternity-signup'}
              className="bg-white text-green-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-green-50 transition-colors shadow-lg"
            >
              Get Your Chapter Listed - It's Free! →
            </button>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works (100% Free)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2">1. Sign Up Free</h3>
              <p className="text-purple-100">Create your chapter profile in 2 minutes - no payment needed</p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2">2. Get Listed</h3>
              <p className="text-purple-100">Your chapter appears to brands instantly - 100% free</p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2">3. Connect with Brands</h3>
              <p className="text-purple-100">Brands reach out directly to sponsor your events</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FraternityMarketplacePage;
