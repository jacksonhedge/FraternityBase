import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  Heart,
  Share2,
  Instagram,
  Facebook,
  Globe,
  Mail,
  Star,
  Award,
  CheckCircle,
  MessageCircle,
  ExternalLink,
  Clock,
  Target,
  BarChart3,
  Badge
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SponsorshipOpportunity {
  id: string;
  title: string;
  description: string;
  opportunity_type: string;
  budget_needed: number;
  budget_range?: string;
  expected_reach: number;
  event_date?: string;
  event_name?: string;
  event_venue?: string;
  expected_attendance?: number;
  deliverables?: string[];
  geographic_scope?: string;
  is_featured?: boolean;
  is_urgent?: boolean;
  status: string;
  posted_at: string;
  applications_count?: number;
  views_count?: number;
  chapters?: {
    id: string;
    chapter_name: string;
    member_count?: number;
    grade?: number;
    chapter_description?: string;
    instagram_handle?: string;
    instagram_followers?: number;
    instagram_engagement_rate?: number;
    tiktok_handle?: string;
    tiktok_followers?: number;
    facebook_page?: string;
    website_url?: string;
    cover_photo_url?: string;
    chapter_gpa?: number;
    philanthropy_name?: string;
    philanthropy_amount_raised?: number;
    greek_organizations?: {
      name: string;
      greek_letters?: string;
    };
    universities?: {
      name: string;
      state: string;
      city?: string;
      logo_url?: string;
    };
  };
}

const SponsorshipOpportunityDetailPageNew = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<SponsorshipOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOpportunity(id);
      // Track view
      trackView(id);
    }
  }, [id]);

  const fetchOpportunity = async (opportunityId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/sponsorships/${opportunityId}`);
      const data = await response.json();

      if (data.success) {
        setOpportunity(data.opportunity);
      }
    } catch (error) {
      console.error('Error fetching opportunity:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async (opportunityId: string) => {
    try {
      await fetch(`${API_URL}/api/sponsorships/${opportunityId}/view`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleApply = () => {
    setShowContactModal(true);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // TODO: Persist to backend
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: opportunity?.title,
        text: opportunity?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading opportunity...</p>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Opportunity not found</h2>
          <button
            onClick={() => navigate('/app/sponsorships')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to marketplace
          </button>
        </div>
      </div>
    );
  }

  const chapter = opportunity.chapters;
  const totalReach = (opportunity.expected_reach || 0) + ((chapter?.member_count || 0) * 750);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/app/sponsorships')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to marketplace</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleSave}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative h-96 rounded-2xl overflow-hidden bg-gray-200 shadow-xl">
              <img
                src={chapter?.cover_photo_url || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80'}
                alt={opportunity.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="flex items-center gap-2 mb-3">
                  {opportunity.is_featured && (
                    <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      FEATURED
                    </span>
                  )}
                  {opportunity.is_urgent && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      URGENT
                    </span>
                  )}
                  {chapter?.grade && chapter.grade >= 4 && (
                    <div className="flex items-center gap-1 bg-yellow-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      {Array.from({ length: Math.floor(chapter.grade) }, (_, i) => (
                        <Star key={i} className="w-4 h-4 fill-white text-white" />
                      ))}
                    </div>
                  )}
                </div>
                <h1 className="text-4xl font-bold mb-2">{opportunity.title}</h1>
                <p className="text-xl text-white/90">
                  {chapter?.greek_organizations?.name} • {chapter?.universities?.name}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Opportunity</h2>
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                {opportunity.description}
              </p>

              {opportunity.event_name && (
                <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                  <h3 className="font-bold text-purple-900 mb-2">Event Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-purple-800">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{opportunity.event_name}</span>
                    </div>
                    {opportunity.event_venue && (
                      <div className="flex items-center gap-2 text-purple-700">
                        <MapPin className="w-4 h-4" />
                        <span>{opportunity.event_venue}</span>
                      </div>
                    )}
                    {opportunity.expected_attendance && (
                      <div className="flex items-center gap-2 text-purple-700">
                        <Users className="w-4 h-4" />
                        <span>{opportunity.expected_attendance} expected attendees</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Deliverables */}
            {opportunity.deliverables && opportunity.deliverables.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What You'll Get</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {opportunity.deliverables.map((deliverable, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-900 font-medium">{deliverable}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reach & Impact */}
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reach & Impact</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {(opportunity.expected_reach || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Social Reach</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {chapter?.member_count || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Members</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {totalReach.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Reach</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {chapter?.instagram_engagement_rate ? `${chapter.instagram_engagement_rate}%` : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Engagement</div>
                </div>
              </div>
            </div>

            {/* Chapter Profile */}
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <div className="flex items-center gap-4 mb-6">
                {chapter?.universities?.logo_url && (
                  <img
                    src={chapter.universities.logo_url}
                    alt={chapter.universities.name}
                    className="w-16 h-16 object-contain"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    About {chapter?.greek_organizations?.name}
                  </h2>
                  <p className="text-gray-600">{chapter?.universities?.name}</p>
                </div>
              </div>

              {chapter?.chapter_description && (
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {chapter.chapter_description}
                </p>
              )}

              {/* Chapter Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {chapter?.chapter_gpa && (
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-900">{chapter.chapter_gpa}</div>
                    <div className="text-sm text-blue-700">Chapter GPA</div>
                  </div>
                )}
                {chapter?.philanthropy_amount_raised && (
                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-900">
                      ${(chapter.philanthropy_amount_raised / 1000).toFixed(0)}k
                    </div>
                    <div className="text-sm text-green-700">Raised for {chapter.philanthropy_name}</div>
                  </div>
                )}
                {chapter?.member_count && (
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-900">{chapter.member_count}</div>
                    <div className="text-sm text-purple-700">Active Members</div>
                  </div>
                )}
              </div>

              {/* Social Media */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 mb-3">Social Channels</h3>
                {chapter?.instagram_handle && (
                  <a
                    href={`https://instagram.com/${chapter.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500 rounded-lg flex items-center justify-center">
                      <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-purple-600">
                        @{chapter.instagram_handle}
                      </div>
                      {chapter.instagram_followers && (
                        <div className="text-sm text-gray-600">
                          {chapter.instagram_followers.toLocaleString()} followers
                        </div>
                      )}
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                  </a>
                )}
                {chapter?.tiktok_handle && (
                  <a
                    href={`https://tiktok.com/@${chapter.tiktok_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">TT</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-purple-600">
                        @{chapter.tiktok_handle}
                      </div>
                      {chapter.tiktok_followers && (
                        <div className="text-sm text-gray-600">
                          {chapter.tiktok_followers.toLocaleString()} followers
                        </div>
                      )}
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                  </a>
                )}
                {chapter?.website_url && (
                  <a
                    href={chapter.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                        Chapter Website
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar - Right 1/3 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Pricing Card */}
              <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-purple-100">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      ${opportunity.budget_needed.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-600">Sponsorship Investment</p>
                </div>

                <button
                  onClick={handleApply}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Apply to Sponsor
                </button>

                <div className="mt-4 text-center text-sm text-gray-500">
                  You won't be charged yet
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Response Rate</span>
                    <span className="font-semibold text-gray-900">Within 24 hours</span>
                  </div>
                  {opportunity.views_count && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Views</span>
                      <span className="font-semibold text-gray-900">{opportunity.views_count}</span>
                    </div>
                  )}
                  {opportunity.applications_count && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Applications</span>
                      <span className="font-semibold text-gray-900">{opportunity.applications_count}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Posted</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(opportunity.posted_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Report/Contact */}
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <button className="text-sm text-gray-600 hover:text-gray-900 underline">
                  Report this listing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Apply to Sponsor
            </h3>
            <p className="text-gray-600 mb-6">
              Send a message to {chapter?.greek_organizations?.name} about this opportunity.
            </p>
            <textarea
              rows={4}
              placeholder="Tell them why you're interested in this sponsorship..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Submit application
                  alert('Application submitted!');
                  setShowContactModal(false);
                }}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorshipOpportunityDetailPageNew;
