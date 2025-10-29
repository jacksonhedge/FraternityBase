/**
 * Partnership Opportunities Page
 * Displays fraternity chapters organized by day of the week
 * Shows limited info: School, Chapter Name, Members
 * Designed for brand partners to discover sponsorship opportunities
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Calendar,
  TrendingUp,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Award,
  Clock,
  Briefcase
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Chapter {
  id: string;
  chapter_name: string;
  member_count?: number;
  grade?: number;
  greek_organizations?: {
    name: string;
    greek_letters?: string;
    organization_type: 'fraternity' | 'sorority';
  };
  universities?: {
    name: string;
    state: string;
    location: string;
  };
}

interface SponsorshipOpportunity {
  id: string;
  chapter_id: string;
  title: string;
  opportunity_type: string;
  budget_range?: string;
  expected_reach?: number;
  posted_at: string;
  chapters?: any;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const OPPORTUNITY_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'event_sponsor', label: 'Event Sponsorship' },
  { value: 'merchandise_partner', label: 'Merchandise Partner' },
  { value: 'philanthropy_partner', label: 'Philanthropy Partner' },
  { value: 'long_term_partnership', label: 'Long-term Partnership' },
  { value: 'venue_rental', label: 'Venue Rental' },
  { value: 'ambassador_program', label: 'Ambassador Program' }
];

const PartnershipOpportunitiesPage = () => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(getCurrentDayIndex());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [opportunities, setOpportunities] = useState<SponsorshipOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Get current day index (0 = Monday, 6 = Sunday)
  function getCurrentDayIndex(): number {
    const today = new Date().getDay();
    // Convert Sunday (0) to 6, and shift others back by 1
    return today === 0 ? 6 : today - 1;
  }

  // Fetch opportunities from API
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (filterType !== 'all') {
          params.append('opportunity_type', filterType);
        }
        if (filterState !== 'all') {
          params.append('state', filterState);
        }

        const url = `${API_URL}/sponsorships${params.toString() ? '?' + params.toString() : ''}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.opportunities) {
          setOpportunities(data.opportunities);
        }
      } catch (error) {
        console.error('Error fetching opportunities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [filterType, filterState]);

  // Organize opportunities by day of week (distribute evenly)
  const organizeByDay = () => {
    const organized: Record<number, SponsorshipOpportunity[]> = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    };

    // Filter by search term
    const filtered = opportunities.filter(opp => {
      const searchLower = searchTerm.toLowerCase();
      const chapterName = opp.chapters?.chapter_name?.toLowerCase() || '';
      const universityName = opp.chapters?.universities?.name?.toLowerCase() || '';
      const orgName = opp.chapters?.greek_organizations?.name?.toLowerCase() || '';

      return chapterName.includes(searchLower) ||
             universityName.includes(searchLower) ||
             orgName.includes(searchLower);
    });

    // Distribute opportunities across days
    filtered.forEach((opp, index) => {
      const dayIndex = index % 7;
      organized[dayIndex].push(opp);
    });

    return organized;
  };

  const organizedOpportunities = organizeByDay();
  const currentDayOpportunities = organizedOpportunities[selectedDay] || [];

  // Navigate between days
  const goToPreviousDay = () => {
    setSelectedDay((prev) => (prev === 0 ? 6 : prev - 1));
  };

  const goToNextDay = () => {
    setSelectedDay((prev) => (prev === 6 ? 0 : prev + 1));
  };

  // Get unique states for filter
  const availableStates = Array.from(
    new Set(
      opportunities
        .map(opp => opp.chapters?.universities?.state)
        .filter(Boolean)
    )
  ).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Partnership Opportunities</h1>
          </div>
          <p className="text-indigo-100 text-lg max-w-3xl">
            Discover sponsorship and partnership opportunities with fraternity chapters nationwide.
            Organized by day of the week for easy browsing.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Total Opportunities</span>
              </div>
              <div className="text-3xl font-bold">{opportunities.length}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5" />
                <span className="text-sm font-medium">Active Chapters</span>
              </div>
              <div className="text-3xl font-bold">
                {new Set(opportunities.map(o => o.chapter_id)).size}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Today's Featured</span>
              </div>
              <div className="text-3xl font-bold">{currentDayOpportunities.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search chapters, universities, organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
              {/* State Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All States</option>
                  {availableStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Opportunity Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opportunity Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {OPPORTUNITY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Day Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <button
              onClick={goToPreviousDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex-1 flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold">
                {DAYS_OF_WEEK[selectedDay]}
              </h2>
              {selectedDay === getCurrentDayIndex() && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Today
                </span>
              )}
            </div>

            <button
              onClick={goToNextDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Day Tabs */}
          <div className="flex overflow-x-auto">
            {DAYS_OF_WEEK.map((day, index) => (
              <button
                key={day}
                onClick={() => setSelectedDay(index)}
                className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-medium transition-colors ${
                  selectedDay === index
                    ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div>{day}</div>
                  <div className="text-xs mt-1 opacity-75">
                    {organizedOpportunities[index]?.length || 0} opportunities
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Opportunities Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : currentDayOpportunities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No opportunities for {DAYS_OF_WEEK[selectedDay]}
            </h3>
            <p className="text-gray-500">
              Check other days or adjust your filters to see more opportunities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentDayOpportunities.map((opportunity) => (
              <ChapterCard
                key={opportunity.id}
                opportunity={opportunity}
                onClick={() => navigate(`/sponsorships/${opportunity.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Chapter Card Component - Shows limited info (School, Name, Members)
interface ChapterCardProps {
  opportunity: SponsorshipOpportunity;
  onClick: () => void;
}

const ChapterCard = ({ opportunity, onClick }: ChapterCardProps) => {
  const chapter = opportunity.chapters;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 hover:border-indigo-300 p-6"
    >
      {/* Organization Name & Type */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Award className={`w-5 h-5 ${
            chapter?.greek_organizations?.organization_type === 'fraternity'
              ? 'text-blue-500'
              : 'text-pink-500'
          }`} />
          <span className="text-xs font-medium text-gray-500 uppercase">
            {chapter?.greek_organizations?.organization_type || 'Chapter'}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {chapter?.greek_organizations?.name || 'Unknown Organization'}
        </h3>

        {chapter?.greek_organizations?.greek_letters && (
          <div className="text-2xl font-serif text-indigo-600 mb-2">
            {chapter?.greek_organizations?.greek_letters}
          </div>
        )}
      </div>

      {/* Chapter Name */}
      <div className="mb-3">
        <div className="text-sm font-medium text-gray-700">
          {chapter?.chapter_name || 'Chapter'}
        </div>
      </div>

      {/* University */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b">
        <Building2 className="w-4 h-4 text-gray-400" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {chapter?.universities?.name || 'Unknown University'}
          </div>
          {chapter?.universities?.location && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <MapPin className="w-3 h-3" />
              {chapter?.universities?.location}
            </div>
          )}
        </div>
      </div>

      {/* Member Count */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Members</span>
        </div>
        <span className="text-lg font-bold text-indigo-600">
          {chapter?.member_count || 'N/A'}
        </span>
      </div>

      {/* Opportunity Type Badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {opportunity.opportunity_type.replace(/_/g, ' ')}
        </span>

        {opportunity.budget_range && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {opportunity.budget_range}
          </span>
        )}
      </div>

      {/* Expected Reach (if available) */}
      {opportunity.expected_reach && (
        <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4" />
          <span>Reach: {opportunity.expected_reach.toLocaleString()} students</span>
        </div>
      )}

      {/* Posted Date */}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <Clock className="w-3 h-3" />
        Posted {new Date(opportunity.posted_at).toLocaleDateString()}
      </div>
    </div>
  );
};

export default PartnershipOpportunitiesPage;
