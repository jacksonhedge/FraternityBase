/**
 * Sponsorship Opportunity Detail Page
 * Shows full details of a sponsorship opportunity
 * Allows companies to apply
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle,
  Send,
  Phone,
  Mail,
  Instagram,
  Globe,
  Clock,
  Target,
  Package,
  Info
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface SponsorshipOpportunity {
  id: string;
  chapter_id: string;
  title: string;
  description: string;
  opportunity_type: string;
  target_industries: string[];
  geographic_scope: string;
  budget_needed: number;
  budget_range: string;
  event_date: string;
  application_deadline: string;
  timeline_description: string;
  expected_reach: number;
  deliverables: string[];
  status: string;
  is_featured: boolean;
  posted_at: string;
  chapters?: {
    id: string;
    chapter_name: string;
    member_count: number;
    grade: number;
    instagram_handle: string;
    website: string;
    contact_email: string;
    phone: string;
    greek_organizations: {
      name: string;
      greek_letters: string;
      organization_type: string;
      national_website: string;
    };
    universities: {
      name: string;
      state: string;
      location: string;
      student_count: number;
    };
  };
}

const SponsorshipDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<SponsorshipOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  // Application form state
  const [applicationMessage, setApplicationMessage] = useState('');
  const [proposedBudget, setProposedBudget] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const res = await fetch(`${API_URL}/sponsorships/${id}`);
        const data = await res.json();
        setOpportunity(data);
      } catch (error) {
        console.error('Error fetching opportunity:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOpportunity();
    }
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);

    try {
      const token = localStorage.getItem('token');
      const companyData = JSON.parse(localStorage.getItem('company') || '{}');

      const res = await fetch(`${API_URL}/sponsorships/${id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          company_id: companyData.id,
          message: applicationMessage,
          proposed_budget: proposedBudget ? parseFloat(proposedBudget) : null,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone
        })
      });

      if (res.ok) {
        setApplicationSubmitted(true);
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Opportunity Not Found</h2>
          <p className="text-gray-600 mb-4">This sponsorship opportunity doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/partnerships')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Opportunities
          </button>
        </div>
      </div>
    );
  }

  const chapter = opportunity.chapters;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/partnerships')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Opportunities
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              {opportunity.is_featured && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 mb-2">
                  ⭐ Featured Opportunity
                </span>
              )}

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {opportunity.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  <span className="font-medium">{chapter?.universities?.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>{chapter?.greek_organizations?.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Posted {new Date(opportunity.posted_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {!applicationSubmitted && (
              <a
                href="#apply"
                className="hidden md:block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Apply Now
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-2 text-gray-600">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm">Budget</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {opportunity.budget_range || 'Negotiable'}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-2 text-gray-600">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">Expected Reach</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {opportunity.expected_reach?.toLocaleString() || 'N/A'}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-2 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">Members</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {chapter?.member_count || 'N/A'}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Opportunity</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {opportunity.description}
              </p>
            </div>

            {/* Deliverables */}
            {opportunity.deliverables && opportunity.deliverables.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  What's Included
                </h2>
                <ul className="space-y-2">
                  {opportunity.deliverables.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Timeline */}
            {(opportunity.event_date || opportunity.application_deadline) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Timeline
                </h2>
                <div className="space-y-3">
                  {opportunity.event_date && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                      <div>
                        <div className="text-sm text-gray-600">Event Date</div>
                        <div className="font-medium text-gray-900">
                          {new Date(opportunity.event_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {opportunity.application_deadline && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <div>
                        <div className="text-sm text-gray-600">Application Deadline</div>
                        <div className="font-medium text-gray-900">
                          {new Date(opportunity.application_deadline).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {opportunity.timeline_description && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{opportunity.timeline_description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Application Form */}
            {!applicationSubmitted ? (
              <div id="apply" className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Send className="w-6 h-6" />
                  Apply for This Opportunity
                </h2>

                <form onSubmit={handleApply} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proposed Budget
                      </label>
                      <input
                        type="number"
                        value={proposedBudget}
                        onChange={(e) => setProposedBudget(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="5000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message to Chapter
                    </label>
                    <textarea
                      value={applicationMessage}
                      onChange={(e) => setApplicationMessage(e.target.value)}
                      required
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Tell the chapter why you're interested and what you can offer..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={applying}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <h3 className="text-xl font-bold text-green-900">Application Submitted!</h3>
                </div>
                <p className="text-green-800 mb-4">
                  Your application has been sent to the chapter. They will review it and get back to you soon.
                </p>
                <Link
                  to="/partnerships"
                  className="text-green-700 hover:text-green-800 font-medium"
                >
                  ← Browse More Opportunities
                </Link>
              </div>
            )}
          </div>

          {/* Right Column - Chapter Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Chapter Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Chapter Information</h3>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Organization</div>
                    <div className="font-medium text-gray-900">
                      {chapter?.greek_organizations?.name}
                    </div>
                    {chapter?.greek_organizations?.greek_letters && (
                      <div className="text-2xl font-serif text-indigo-600 mt-1">
                        {chapter?.greek_organizations?.greek_letters}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">University</div>
                    <div className="font-medium text-gray-900">
                      {chapter?.universities?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {chapter?.universities?.location}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Members</div>
                    <div className="font-medium text-gray-900">
                      {chapter?.member_count || 'N/A'}
                    </div>
                  </div>

                  {chapter?.grade && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Chapter Grade</div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={i < chapter.grade ? 'text-yellow-400' : 'text-gray-300'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Links */}
                <div className="mt-6 pt-6 border-t space-y-2">
                  {chapter?.instagram_handle && (
                    <a
                      href={`https://instagram.com/${chapter.instagram_handle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-indigo-600"
                    >
                      <Instagram className="w-5 h-5" />
                      <span>Instagram</span>
                    </a>
                  )}

                  {chapter?.website && (
                    <a
                      href={chapter.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-indigo-600"
                    >
                      <Globe className="w-5 h-5" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Opportunity Type */}
              <div className="bg-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Opportunity Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Type</span>
                    <span className="font-medium text-gray-900">
                      {opportunity.opportunity_type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Scope</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {opportunity.geographic_scope}
                    </span>
                  </div>

                  {opportunity.target_industries && opportunity.target_industries.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Target Industries</div>
                      <div className="flex flex-wrap gap-1">
                        {opportunity.target_industries.map((industry, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-white text-xs font-medium text-gray-700 rounded"
                          >
                            {industry}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorshipDetailPage;
