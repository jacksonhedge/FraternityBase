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
import { getCollegeLogoWithFallback } from '../utils/collegeLogos';

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
  const [selectedOpportunity, setSelectedOpportunity] = useState<SponsorshipOpportunity | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  // Filter opportunities by search term
  const filteredOpportunities = opportunities.filter(opp => {
    const searchLower = searchTerm.toLowerCase();
    const chapterName = opp.chapters?.chapter_name?.toLowerCase() || '';
    const universityName = opp.chapters?.universities?.name?.toLowerCase() || '';
    const orgName = opp.chapters?.greek_organizations?.name?.toLowerCase() || '';

    return chapterName.includes(searchLower) ||
           universityName.includes(searchLower) ||
           orgName.includes(searchLower);
  });

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
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Simple Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Partnership Marketplace</h1>
          <p className="text-gray-600 mt-2">
            Discover sponsorship and partnership opportunities with fraternity chapters nationwide.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
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

        {/* Opportunities Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No opportunities found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or search terms to see more opportunities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity, index) => (
              <ChapterCard
                key={opportunity.id}
                opportunity={opportunity}
                index={index}
                onClick={() => {
                  setSelectedOpportunity(opportunity);
                  setShowModal(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Partnership Opportunity Modal */}
      {showModal && selectedOpportunity && (
        <PartnershipModal
          opportunity={selectedOpportunity}
          onClose={() => {
            setShowModal(false);
            setSelectedOpportunity(null);
          }}
        />
      )}
    </div>
  );
};

// Chapter Card Component - Shows fraternity info in colorful college-card style
interface ChapterCardProps {
  opportunity: SponsorshipOpportunity;
  onClick: () => void;
  index: number;
}

const ChapterCard = ({ opportunity, onClick, index }: ChapterCardProps) => {
  const chapter = opportunity.chapters;

  // Get college logo
  const collegeLogo = getCollegeLogoWithFallback(chapter?.universities?.name || '');

  // Generate vibrant gradient colors (same as college cards)
  const gradients = [
    'from-blue-500 via-blue-600 to-indigo-600',
    'from-purple-500 via-purple-600 to-pink-600',
    'from-green-500 via-emerald-600 to-teal-600',
    'from-orange-500 via-red-500 to-pink-600',
    'from-cyan-500 via-blue-600 to-purple-600',
    'from-yellow-500 via-orange-500 to-red-600',
    'from-pink-500 via-rose-600 to-purple-600',
    'from-indigo-500 via-purple-600 to-pink-600',
  ];
  const gradient = gradients[index % gradients.length];

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer transform transition-all duration-300 hover:-translate-y-2"
    >
      {/* Colorful Card */}
      <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-lg group-hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          {/* College Logo */}
          <div className="w-20 h-20 rounded-2xl bg-white shadow-xl p-2.5 transform group-hover:rotate-3 transition-transform duration-300">
            <img
              src={collegeLogo}
              alt={chapter?.universities?.name || 'College'}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Organization Type Badge */}
          <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
            <Award className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white uppercase">
              {chapter?.greek_organizations?.organization_type || 'Chapter'}
            </span>
          </div>

          {/* Organization Name */}
          <div>
            <h3 className="font-bold text-white text-lg leading-tight mb-2">
              {chapter?.greek_organizations?.name || 'Unknown Organization'}
            </h3>

            {chapter?.greek_organizations?.greek_letters && (
              <div className="text-2xl font-serif text-white/90 mb-2">
                {chapter?.greek_organizations?.greek_letters}
              </div>
            )}

            <div className="text-sm font-medium text-white/80">
              {chapter?.chapter_name || 'Chapter'}
            </div>
          </div>

          {/* University */}
          <div className="w-full">
            <div className="flex items-center justify-center gap-2 text-white/90 text-sm mb-1">
              <Building2 className="w-4 h-4" />
              <span className="font-medium">{chapter?.universities?.name || 'Unknown University'}</span>
            </div>
            {chapter?.universities?.location && (
              <div className="flex items-center justify-center gap-1 text-white/80 text-xs">
                <MapPin className="w-3 h-3" />
                {chapter?.universities?.location}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="w-full space-y-2 pt-2">
            <div className="w-full h-px bg-white/20"></div>

            {/* Member Count */}
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-white/90">
                <Users className="w-4 h-4" />
                <span>Members</span>
              </div>
              <span className="font-bold text-white text-lg">
                {chapter?.member_count || 'N/A'}
              </span>
            </div>

            {/* Opportunity Type */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/80">Partnership Type</span>
              <span className="font-semibold text-white">
                {opportunity.opportunity_type.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Social Following */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/80">Social Following</span>
              <span className="font-semibold text-white">
                {chapter?.instagram_followers ? chapter.instagram_followers.toLocaleString() : 'N/A'}
              </span>
            </div>

            {opportunity.budget_range && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/80">Payment Range</span>
                <span className="font-semibold text-white">{opportunity.budget_range}</span>
              </div>
            )}
          </div>

          {/* View Details Button */}
          <div className="w-full pt-2">
            <div className="bg-white/20 backdrop-blur-sm text-white text-sm font-bold py-3 px-4 rounded-lg group-hover:bg-white/40 group-hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-md group-hover:shadow-lg">
              <span className="group-hover:translate-x-[-4px] transition-transform duration-300">View Opportunity</span>
              <Award className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Partnership Modal Component
interface PartnershipModalProps {
  opportunity: SponsorshipOpportunity;
  onClose: () => void;
}

const PartnershipModal = ({ opportunity, onClose }: PartnershipModalProps) => {
  const [message, setMessage] = useState('');
  const [compensation, setCompensation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const chapter = opportunity.chapters;
  const collegeLogo = getCollegeLogoWithFallback(chapter?.universities?.name || '');

  // Calculate platform fee (20%) and total
  const compensationAmount = parseFloat(compensation) || 0;
  const platformFee = Math.round(compensationAmount * 0.20 * 100) / 100;
  const totalAmount = Math.round((compensationAmount + platformFee) * 100) / 100;

  const handleRequestPartnership = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }
    if (!compensation || compensationAmount < 100) {
      setError('Minimum compensation is $100');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to submit partnership requests');
        setIsSubmitting(false);
        return;
      }

      // Get company ID from token or user context
      const userRes = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userRes.json();

      if (!userData.success || !userData.user?.company_id) {
        setError('Company account required to submit partnership requests');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`${API_URL}/partnerships/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          companyId: userData.user.company_id,
          chapterId: chapter?.id || opportunity.chapter_id,
          message: message.trim(),
          proposedCompensation: compensationAmount
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(data.error || 'Failed to submit partnership request');
      }
    } catch (err: any) {
      console.error('Partnership request error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header with College Logo */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-t-2xl">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-white rounded-2xl p-3 shadow-xl flex-shrink-0">
                <img
                  src={collegeLogo}
                  alt={chapter?.universities?.name || 'College'}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-3">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">
                    {chapter?.greek_organizations?.organization_type || 'Chapter'}
                  </span>
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  {chapter?.greek_organizations?.name || 'Unknown Organization'}
                </h2>
                {chapter?.greek_organizations?.greek_letters && (
                  <div className="text-xl font-serif mb-2 text-white/90">
                    {chapter?.greek_organizations?.greek_letters}
                  </div>
                )}
                <div className="flex items-center gap-2 text-white/90">
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">{chapter?.universities?.name}</span>
                </div>
                {chapter?.universities?.location && (
                  <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{chapter?.universities?.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Opportunity Details */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Partnership Opportunity</h3>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Opportunity Type</div>
                    <div className="font-semibold text-gray-900 capitalize">
                      {opportunity.opportunity_type.replace(/_/g, ' ')}
                    </div>
                  </div>
                  {opportunity.budget_range && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Payment Range</div>
                      <div className="font-semibold text-gray-900">{opportunity.budget_range}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chapter Stats */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Chapter Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium">Members</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {chapter?.member_count || 'N/A'}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm font-medium">Social Following</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {chapter?.instagram_followers ? chapter.instagram_followers.toLocaleString() : 'N/A'}
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <Award className="w-5 h-5" />
                    <span className="text-sm font-medium">Rating</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {chapter?.grade ? `${chapter.grade}⭐` : '5.0⭐'}
                  </div>
                </div>
              </div>
            </div>

            {/* About This Chapter */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About This Chapter</h3>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>{chapter?.greek_organizations?.name || 'This chapter'}</strong> at <strong>{chapter?.universities?.name || 'this university'}</strong>
                  {' '}is an active Greek organization with {chapter?.member_count || 'a dedicated group of'} members.
                  Partner with this chapter to reach engaged students through authentic brand experiences.
                </p>

                {/* Chapter Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-4 border border-indigo-200">
                    <div className="text-sm font-semibold text-indigo-600 mb-2">📍 Location</div>
                    <div className="text-gray-800">{chapter?.universities?.location || 'Campus location'}</div>
                  </div>

                  {chapter?.instagram_handle && (
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <div className="text-sm font-semibold text-purple-600 mb-2">📱 Instagram</div>
                      <a
                        href={`https://instagram.com/${chapter.instagram_handle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-700 hover:text-purple-900 font-medium"
                      >
                        {chapter.instagram_handle}
                      </a>
                    </div>
                  )}

                  {opportunity.opportunity_type && (
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="text-sm font-semibold text-green-600 mb-2">🎯 Partnership Type</div>
                      <div className="text-gray-800 capitalize">{opportunity.opportunity_type.replace(/_/g, ' ')}</div>
                    </div>
                  )}

                  {opportunity.budget_range && (
                    <div className="bg-white rounded-lg p-4 border border-yellow-200">
                      <div className="text-sm font-semibold text-yellow-600 mb-2">💰 Payment Range</div>
                      <div className="text-gray-800 font-semibold">{opportunity.budget_range}</div>
                    </div>
                  )}
                </div>

                {/* Partnership Benefits */}
                <div className="mt-4 pt-4 border-t border-indigo-200">
                  <div className="text-sm font-semibold text-gray-700 mb-3">Why Partner with This Chapter:</div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Access to {chapter?.member_count || 'dozens of'} engaged college students</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Social media reach of {chapter?.instagram_followers ? chapter.instagram_followers.toLocaleString() : 'thousands of'} followers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Authentic brand engagement through chapter events and activities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Professional chapter with a strong campus presence</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Partnership Request Form */}
            <div className="mb-8 bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Submit Partnership Request</h3>

              {/* Success Message */}
              {isSuccess && (
                <div className="mb-4 p-6 bg-green-50 border-2 border-green-300 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-green-600 text-2xl">✅</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-green-900 text-lg mb-2">Partnership Request Submitted!</h4>
                      <p className="text-green-800 text-sm mb-3">
                        Your partnership request has been sent to {chapter?.greek_organizations?.name || 'this chapter'}.
                      </p>
                      <div className="bg-white rounded-lg p-3 mb-3 text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Chapter Receives:</span>
                          <span className="font-bold text-green-600">${compensationAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Platform Fee (20%):</span>
                          <span className="font-semibold text-gray-700">${platformFee.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-2"></div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-900">Total Charged:</span>
                          <span className="font-bold text-indigo-600">${totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      <p className="text-green-700 text-xs">
                        The chapter will be notified and can review your request. This modal will close automatically...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && !isSuccess && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  ❌ {error}
                </div>
              )}

              {/* Form Fields - Hidden when success */}
              {!isSuccess && (
                <>
                  {/* Message Field */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Partnership Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your partnership proposal and what you can offer to the chapter..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      rows={4}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Compensation Field */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Proposed Compensation (USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                        $
                      </span>
                      <input
                        type="number"
                        value={compensation}
                        onChange={(e) => setCompensation(e.target.value)}
                        placeholder="1000"
                        min="100"
                        step="50"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum: $100</p>
                  </div>

                  {/* Fee Calculation */}
                  {compensationAmount >= 100 && (
                    <div className="bg-white border-2 border-indigo-300 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Payment Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Chapter Receives:</span>
                          <span className="font-bold text-green-600">${compensationAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Platform Fee (20%):</span>
                          <span className="font-semibold text-gray-700">${platformFee.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-2"></div>
                        <div className="flex justify-between text-base">
                          <span className="font-semibold text-gray-900">Total You Pay:</span>
                          <span className="font-bold text-indigo-600 text-lg">${totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons - Hidden when success */}
            {!isSuccess && (
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Close
                </button>
                <button
                  onClick={handleRequestPartnership}
                  disabled={isSubmitting || !message.trim() || !compensation || compensationAmount < 100}
                  className={`flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2 ${
                    isSubmitting || !message.trim() || !compensation || compensationAmount < 100
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                    <Briefcase className="w-5 h-5" />
                    Request Partnership
                  </>
                )}
              </button>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnershipOpportunitiesPage;
