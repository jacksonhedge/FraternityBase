import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  TrendingUp,
  Calendar,
  SlidersHorizontal,
  X,
  ChevronDown
} from 'lucide-react';
import SponsorshipCard from '../components/sponsorships/SponsorshipCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SponsorshipOpportunity {
  id: string;
  title: string;
  description: string;
  opportunity_type: string;
  budget_needed: number;
  expected_reach: number;
  event_date?: string;
  is_featured?: boolean;
  is_urgent?: boolean;
  status: string;
  chapters?: {
    id: string;
    chapter_name: string;
    member_count?: number;
    grade?: number;
    instagram_handle?: string;
    instagram_followers?: number;
    cover_photo_url?: string;
    greek_organizations?: {
      name: string;
      greek_letters?: string;
    };
    universities?: {
      name: string;
      state: string;
      city?: string;
    };
  };
}

const OPPORTUNITY_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'event_sponsor', label: 'Event Sponsorship' },
  { value: 'social_media', label: 'Social Media Campaign' },
  { value: 'merchandise_partner', label: 'Merchandise Partnership' },
  { value: 'philanthropy', label: 'Philanthropy Event' },
  { value: 'long_term', label: 'Long-term Partnership' },
  { value: 'performance', label: 'Performance Marketing' }
];

const STATES = ['All States', 'CA', 'NY', 'TX', 'FL', 'PA', 'IL', 'OH', 'MI', 'GA', 'NC'];

const BUDGET_RANGES = [
  { value: 'all', label: 'Any Budget' },
  { value: '0-1000', label: 'Under $1k' },
  { value: '1000-2500', label: '$1k - $2.5k' },
  { value: '2500-5000', label: '$2.5k - $5k' },
  { value: '5000-10000', label: '$5k - $10k' },
  { value: '10000+', label: '$10k+' }
];

const SponsorshipMarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [opportunities, setOpportunities] = useState<SponsorshipOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<SponsorshipOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'All States');
  const [selectedBudget, setSelectedBudget] = useState(searchParams.get('budget') || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [savedOpportunities, setSavedOpportunities] = useState<Set<string>>(new Set());

  // Fetch opportunities from API
  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/sponsorships?status=active`);
      const data = await response.json();

      if (data.success) {
        setOpportunities(data.opportunities || []);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...opportunities];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(opp =>
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.chapters?.greek_organizations?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.chapters?.universities?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(opp => opp.opportunity_type === selectedType);
    }

    // State filter
    if (selectedState !== 'All States') {
      filtered = filtered.filter(opp =>
        opp.chapters?.universities?.state === selectedState
      );
    }

    // Budget filter
    if (selectedBudget !== 'all') {
      if (selectedBudget === '10000+') {
        filtered = filtered.filter(opp => opp.budget_needed >= 10000);
      } else {
        const [min, max] = selectedBudget.split('-').map(Number);
        filtered = filtered.filter(opp =>
          opp.budget_needed >= min && opp.budget_needed < max
        );
      }
    }

    // Sort: Featured first, then Urgent, then by reach
    filtered.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      if (a.is_urgent && !b.is_urgent) return -1;
      if (!a.is_urgent && b.is_urgent) return 1;
      return (b.expected_reach || 0) - (a.expected_reach || 0);
    });

    setFilteredOpportunities(filtered);
  }, [opportunities, searchQuery, selectedType, selectedState, selectedBudget]);

  // Update URL params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchQuery) params.q = searchQuery;
    if (selectedType !== 'all') params.type = selectedType;
    if (selectedState !== 'All States') params.state = selectedState;
    if (selectedBudget !== 'all') params.budget = selectedBudget;
    setSearchParams(params);
  }, [searchQuery, selectedType, selectedState, selectedBudget]);

  const handleSaveOpportunity = (id: string) => {
    setSavedOpportunities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    // TODO: Persist to backend
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedState('All States');
    setSelectedBudget('all');
  };

  const activeFiltersCount = [
    searchQuery ? 1 : 0,
    selectedType !== 'all' ? 1 : 0,
    selectedState !== 'All States' ? 1 : 0,
    selectedBudget !== 'all' ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sponsorship Marketplace
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredOpportunities.length} opportunities available
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by chapter, university, or event type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>

            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 transition-all font-medium"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 w-6 h-6 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Active Filters Tags */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:bg-purple-200 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedType !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {OPPORTUNITY_TYPES.find(t => t.value === selectedType)?.label}
                  <button onClick={() => setSelectedType('all')} className="hover:bg-blue-200 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedState !== 'All States' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {selectedState}
                  <button onClick={() => setSelectedState('All States')} className="hover:bg-green-200 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedBudget !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  {BUDGET_RANGES.find(b => b.value === selectedBudget)?.label}
                  <button onClick={() => setSelectedBudget('all')} className="hover:bg-orange-200 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Filter Dropdowns */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 p-4 bg-gray-50 rounded-xl">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Opportunity Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                >
                  {OPPORTUNITY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* State Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                >
                  {STATES.map(state => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget Range
                </label>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                >
                  {BUDGET_RANGES.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          // Loading State
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOpportunities.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No opportunities found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          // Cards Grid - Airbnb Style
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <SponsorshipCard
                key={opportunity.id}
                opportunity={opportunity}
                onSave={() => handleSaveOpportunity(opportunity.id)}
                isSaved={savedOpportunities.has(opportunity.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorshipMarketplacePage;
