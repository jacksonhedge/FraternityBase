import { useState } from 'react';
import {
  MessageSquare,
  Handshake,
  Send,
  CheckCircle,
  AlertCircle,
  Building2,
  Users,
  Calendar,
  DollarSign,
  Target
} from 'lucide-react';

const OutreachPage = () => {
  const [showIntroForm, setShowIntroForm] = useState(false);
  const [showSponsorshipForm, setShowSponsorshipForm] = useState(false);
  const [introForm, setIntroForm] = useState({
    chapterId: '',
    message: '',
    purpose: 'general'
  });
  const [sponsorshipForm, setSponsorshipForm] = useState({
    eventType: '',
    budget: '',
    timeline: '',
    chapters: '',
    details: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleIntroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    console.log('Intro request:', introForm);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowIntroForm(false);
      setIntroForm({ chapterId: '', message: '', purpose: 'general' });
    }, 2000);
  };

  const handleSponsorshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    console.log('Sponsorship request:', sponsorshipForm);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowSponsorshipForm(false);
      setSponsorshipForm({ eventType: '', budget: '', timeline: '', chapters: '', details: '' });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Outreach Help</h1>
        <p className="text-gray-600 mt-1">
          Get personalized assistance connecting with chapters
        </p>
      </div>

      {/* Main Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Request an Intro */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Request an Intro</h2>
          </div>
          <p className="text-gray-700 mb-6">
            Let our team facilitate a warm introduction to chapter leadership. We'll handle the initial outreach and coordinate the best time to connect.
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Direct introduction to decision makers</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Context about your company and goals</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Coordinated meeting scheduling</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Response within 48 hours</span>
            </div>
          </div>

          <button
            onClick={() => setShowIntroForm(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            Request Intro
          </button>
        </div>

        {/* Request Sponsorship */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-8 border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Handshake className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Request Sponsorships</h2>
          </div>
          <p className="text-gray-700 mb-6">
            Looking to sponsor events? We'll help match you with chapters hosting events that align with your brand and budget.
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Custom event recommendations</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Budget-aligned opportunities</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Multi-chapter package deals</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>ROI tracking and reporting</span>
            </div>
          </div>

          <button
            onClick={() => setShowSponsorshipForm(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Handshake className="w-5 h-5" />
            Request Sponsorships
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">1. Submit Request</h3>
            <p className="text-sm text-gray-600">Tell us about your goals and target chapters</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">2. We Review</h3>
            <p className="text-sm text-gray-600">Our team analyzes and matches opportunities</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">3. Get Connected</h3>
            <p className="text-sm text-gray-600">Receive introductions or sponsorship options</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">4. Close Deals</h3>
            <p className="text-sm text-gray-600">Build relationships and partnerships</p>
          </div>
        </div>
      </div>

      {/* Intro Form Modal */}
      {showIntroForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Request an Introduction</h2>
                <button onClick={() => setShowIntroForm(false)} className="text-gray-500 hover:text-gray-700">
                  <AlertCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <form onSubmit={handleIntroSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
                <input
                  type="text"
                  value={introForm.chapterId}
                  onChange={(e) => setIntroForm({ ...introForm, chapterId: e.target.value })}
                  placeholder="e.g., Penn State - Sigma Chi Alpha Zeta"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <select
                  value={introForm.purpose}
                  onChange={(e) => setIntroForm({ ...introForm, purpose: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General Partnership</option>
                  <option value="recruitment">Recruitment Event</option>
                  <option value="sponsorship">Event Sponsorship</option>
                  <option value="ambassador">Ambassador Program</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                <textarea
                  value={introForm.message}
                  onChange={(e) => setIntroForm({ ...introForm, message: e.target.value })}
                  rows={4}
                  placeholder="Tell us about your company and what you'd like to discuss..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowIntroForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitted}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitted ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submitted!
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sponsorship Form Modal */}
      {showSponsorshipForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Request Sponsorship Opportunities</h2>
                <button onClick={() => setShowSponsorshipForm(false)} className="text-gray-500 hover:text-gray-700">
                  <AlertCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSponsorshipSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  value={sponsorshipForm.eventType}
                  onChange={(e) => setSponsorshipForm({ ...sponsorshipForm, eventType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select event type...</option>
                  <option value="philanthropy">Philanthropy Event</option>
                  <option value="social">Social Event</option>
                  <option value="recruitment">Recruitment</option>
                  <option value="formal">Formal/Semi-Formal</option>
                  <option value="sports">Sports Tournament</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                <select
                  value={sponsorshipForm.budget}
                  onChange={(e) => setSponsorshipForm({ ...sponsorshipForm, budget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select budget...</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="1000-2500">$1,000 - $2,500</option>
                  <option value="2500-5000">$2,500 - $5,000</option>
                  <option value="5000+">$5,000+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                <input
                  type="text"
                  value={sponsorshipForm.timeline}
                  onChange={(e) => setSponsorshipForm({ ...sponsorshipForm, timeline: e.target.value })}
                  placeholder="e.g., Next 3 months, Fall 2025"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Chapters (Optional)</label>
                <input
                  type="text"
                  value={sponsorshipForm.chapters}
                  onChange={(e) => setSponsorshipForm({ ...sponsorshipForm, chapters: e.target.value })}
                  placeholder="Specific chapters or regions"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                <textarea
                  value={sponsorshipForm.details}
                  onChange={(e) => setSponsorshipForm({ ...sponsorshipForm, details: e.target.value })}
                  rows={4}
                  placeholder="Tell us about your sponsorship goals and any specific requirements..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSponsorshipForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitted}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitted ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submitted!
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutreachPage;
