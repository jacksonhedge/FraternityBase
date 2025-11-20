import { useState, useEffect } from 'react';
import { Cake, MapPin, Users, Calendar, Instagram, TrendingUp, MessageCircle, Star, DollarSign, CreditCard } from 'lucide-react';
import { getCollegeLogoWithFallback } from '../../utils/collegeLogos';

interface Chapter {
  chapter_id: string;
  chapter_name: string;
  instagram_handle: string;
  university_name: string;
  fraternity_name: string;
  engagement_score: number;
  priority: string;
  last_contact_date: string | null;
  next_follow_up_date: string | null;
  primary_contact_name: string | null;
  notes: string | null;
  followers: number | null;
  posts_last_7_days: number;
  opportunities_last_30_days: number;
  last_post_date: string | null;
  fundraising_goal?: number | null;
  fundraising_benefactor?: string | null;
  fundraising_current?: number | null;
}

interface Post {
  id: string;
  post_url: string;
  caption: string;
  like_count: number;
  comment_count: number;
  posted_at: string;
  is_opportunity: boolean;
  opportunity_reason: string | null;
}

interface Communication {
  id: string;
  type: string;
  direction: string;
  subject: string;
  content: string;
  communicated_at: string;
}

interface Leader {
  id: string;
  name: string;
  position: string;
  email?: string;
  phone?: string;
}

interface RosterMember {
  id: string;
  name: string;
  year: string;
  major?: string;
  hometown?: string;
  birthday?: string;
  state?: string;
  age?: number;
}

interface UpcomingBirthday {
  id: string;
  name: string;
  birthday: string;
  age: number;
  daysUntil: number;
}

interface ChapterDetailModalProps {
  chapter: Chapter;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ChapterDetailModal({ chapter, onClose, onUpdate }: ChapterDetailModalProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [leadership, setLeadership] = useState<Leader[]>([]);
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<UpcomingBirthday[]>([]);
  const [chapterSize, setChapterSize] = useState(0);
  const [travelStats, setTravelStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'roster' | 'posts' | 'communications' | 'payments'>('details');

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [venmoHandle, setVenmoHandle] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [cashappHandle, setCashappHandle] = useState('');
  const [zelleEmail, setZelleEmail] = useState('');
  const [zellePhone, setZellePhone] = useState('');
  const [donationPortalUrl, setDonationPortalUrl] = useState('');
  const [donationPortalProvider, setDonationPortalProvider] = useState('');
  const [preferredMethod, setPreferredMethod] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Form state
  const [primaryContactName, setPrimaryContactName] = useState(chapter.primary_contact_name || '');
  const [notes, setNotes] = useState(chapter.notes || '');
  const [priority, setPriority] = useState(chapter.priority || 'medium');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(chapter.next_follow_up_date || '');
  const [fundraisingGoal, setFundraisingGoal] = useState(chapter.fundraising_goal?.toString() || '');
  const [fundraisingBenefactor, setFundraisingBenefactor] = useState(chapter.fundraising_benefactor || '');
  const [fundraisingCurrent, setFundraisingCurrent] = useState(chapter.fundraising_current?.toString() || '');

  useEffect(() => {
    fetchChapterDetails();
    fetchPaymentMethods();
  }, [chapter.chapter_id]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/chapters/${chapter.chapter_id}/payment-methods`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setPaymentMethods(data.data);
        setVenmoHandle(data.data.venmo_handle || '');
        setPaypalEmail(data.data.paypal_email || '');
        setCashappHandle(data.data.cashapp_handle || '');
        setZelleEmail(data.data.zelle_email || '');
        setZellePhone(data.data.zelle_phone || '');
        setDonationPortalUrl(data.data.donation_portal_url || '');
        setDonationPortalProvider(data.data.donation_portal_provider || '');
        setPreferredMethod(data.data.preferred_method || '');
        setPaymentNotes(data.data.payment_notes || '');
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    }
  };

  const fetchChapterDetails = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/crm/chapters/${chapter.chapter_id}`
      );
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts || []);
        setCommunications(data.communications || []);
        setLeadership(data.leadership || []);
        setRoster(data.roster || []);
        setUpcomingBirthdays(data.upcoming_birthdays || []);
        setTravelStats(data.travel_stats || null);
        setChapterSize(data.chapter_size || data.roster?.length || 0);
      }
    } catch (err) {
      console.error('Error fetching chapter details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/crm/chapters/${chapter.chapter_id}/outreach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            primary_contact_name: primaryContactName,
            notes,
            priority,
            next_follow_up_date: nextFollowUpDate || null,
            fundraising_goal: fundraisingGoal ? parseFloat(fundraisingGoal) : null,
            fundraising_benefactor: fundraisingBenefactor || null,
            fundraising_current: fundraisingCurrent ? parseFloat(fundraisingCurrent) : null,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        onUpdate();
      } else {
        alert(`Failed to update: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Failed to update: ${err.message}`);
    }
  };

  const handleLogCommunication = async () => {
    const type = prompt('Communication type (dm, email, phone, comment):');
    if (!type) return;

    const content = prompt('Communication content:');
    if (!content) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/crm/chapters/${chapter.chapter_id}/communications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type,
            direction: 'outbound',
            content,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchChapterDetails();
      } else {
        alert(`Failed to log communication: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Failed to log communication: ${err.message}`);
    }
  };

  const handleSavePaymentMethods = async () => {
    setPaymentLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/chapters/${chapter.chapter_id}/payment-methods`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            venmo_handle: venmoHandle || null,
            paypal_email: paypalEmail || null,
            cashapp_handle: cashappHandle || null,
            zelle_email: zelleEmail || null,
            zelle_phone: zellePhone || null,
            donation_portal_url: donationPortalUrl || null,
            donation_portal_provider: donationPortalProvider || null,
            preferred_method: preferredMethod || null,
            payment_notes: paymentNotes || null,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Payment methods saved successfully!');
        fetchPaymentMethods();
      } else {
        alert(`Failed to save payment methods: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Failed to save payment methods: ${err.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 text-white">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header Content */}
          <div className="flex items-start gap-4">
            {/* College Logo */}
            <div className="bg-white rounded-lg p-2 shadow-lg">
              <img
                src={getCollegeLogoWithFallback(chapter.university_name)}
                alt={chapter.university_name}
                className="w-16 h-16 object-contain"
              />
            </div>

            {/* Chapter Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{chapter.fraternity_name}</h2>
              <p className="text-blue-100 mb-3">{chapter.university_name}</p>

              {/* Quick Stats Row */}
              <div className="flex items-center gap-4 text-sm">
                {chapter.instagram_handle && (
                  <a
                    href={`https://instagram.com/${chapter.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-white hover:text-blue-100 transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>@{chapter.instagram_handle.replace('@', '')}</span>
                  </a>
                )}
                {chapter.followers && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{(chapter.followers / 1000).toFixed(1)}k followers</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>Score: {chapter.engagement_score}</span>
                </div>
              </div>
            </div>

            {/* Priority Badge */}
            <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${
              priority === 'urgent' ? 'bg-red-500' :
              priority === 'high' ? 'bg-orange-500' :
              priority === 'medium' ? 'bg-yellow-500' :
              'bg-gray-500'
            }`}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <TabButton label="Details" isActive={activeTab === 'details'} onClick={() => setActiveTab('details')} />
          <TabButton label="Roster & Birthdays" isActive={activeTab === 'roster'} onClick={() => setActiveTab('roster')} count={roster.length} />
          <TabButton label="Posts" isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')} count={posts.length} />
          <TabButton label="Communications" isActive={activeTab === 'communications'} onClick={() => setActiveTab('communications')} count={communications.length} />
          <TabButton label="Payment Methods" isActive={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={<DollarSign className="w-4 h-4" />} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'details' && (
                <DetailsTab
                  chapter={chapter}
                  primaryContactName={primaryContactName}
                  setPrimaryContactName={setPrimaryContactName}
                  notes={notes}
                  setNotes={setNotes}
                  priority={priority}
                  setPriority={setPriority}
                  nextFollowUpDate={nextFollowUpDate}
                  setNextFollowUpDate={setNextFollowUpDate}
                  fundraisingGoal={fundraisingGoal}
                  setFundraisingGoal={setFundraisingGoal}
                  fundraisingBenefactor={fundraisingBenefactor}
                  setFundraisingBenefactor={setFundraisingBenefactor}
                  fundraisingCurrent={fundraisingCurrent}
                  setFundraisingCurrent={setFundraisingCurrent}
                  leadership={leadership}
                  chapterSize={chapterSize}
                  travelStats={travelStats}
                />
              )}

              {activeTab === 'roster' && (
                <RosterTab
                  roster={roster}
                  upcomingBirthdays={upcomingBirthdays}
                  travelStats={travelStats}
                />
              )}

              {activeTab === 'posts' && <PostsTab posts={posts} />}

              {activeTab === 'communications' && (
                <CommunicationsTab
                  communications={communications}
                  onLogNew={handleLogCommunication}
                />
              )}

              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900">Payment Methods for Receiving Donations</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Track how this chapter accepts payments and donations from brands and donors.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Digital Payment Methods */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Digital Payment Methods
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Venmo Handle</label>
                        <input
                          type="text"
                          value={venmoHandle}
                          onChange={(e) => setVenmoHandle(e.target.value)}
                          placeholder="@username"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CashApp Handle</label>
                        <input
                          type="text"
                          value={cashappHandle}
                          onChange={(e) => setCashappHandle(e.target.value)}
                          placeholder="$username"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Email</label>
                        <input
                          type="email"
                          value={paypalEmail}
                          onChange={(e) => setPaypalEmail(e.target.value)}
                          placeholder="chapter@paypal.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zelle Email</label>
                        <input
                          type="email"
                          value={zelleEmail}
                          onChange={(e) => setZelleEmail(e.target.value)}
                          placeholder="chapter@zelle.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zelle Phone</label>
                        <input
                          type="tel"
                          value={zellePhone}
                          onChange={(e) => setZellePhone(e.target.value)}
                          placeholder="(555) 123-4567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Online Donation Portal */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Online Donation Portal</h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Donation Portal URL</label>
                        <input
                          type="url"
                          value={donationPortalUrl}
                          onChange={(e) => setDonationPortalUrl(e.target.value)}
                          placeholder="https://gofundme.com/chapter-fundraiser"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Portal Provider</label>
                        <select
                          value={donationPortalProvider}
                          onChange={(e) => setDonationPortalProvider(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select provider...</option>
                          <option value="GoFundMe">GoFundMe</option>
                          <option value="Donorbox">Donorbox</option>
                          <option value="Classy">Classy</option>
                          <option value="GiveWP">GiveWP</option>
                          <option value="Custom">Custom</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Method</label>
                        <select
                          value={preferredMethod}
                          onChange={(e) => setPreferredMethod(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select preferred...</option>
                          <option value="venmo">Venmo</option>
                          <option value="cashapp">CashApp</option>
                          <option value="paypal">PayPal</option>
                          <option value="zelle">Zelle</option>
                          <option value="donation_portal">Donation Portal</option>
                          <option value="bank">Bank Transfer</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Notes</label>
                    <textarea
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Any special instructions or notes about payment methods..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'details' && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Payment Methods Footer */}
        {activeTab === 'payments' && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePaymentMethods}
              disabled={paymentLoading}
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {paymentLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Save Payment Methods</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ label, isActive, onClick, count, icon }: { label: string; isActive: boolean; onClick: () => void; count?: number; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${
        isActive
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
      }`}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}

function DetailsTab({ chapter, primaryContactName, setPrimaryContactName, notes, setNotes, priority, setPriority, nextFollowUpDate, setNextFollowUpDate, fundraisingGoal, setFundraisingGoal, fundraisingBenefactor, setFundraisingBenefactor, fundraisingCurrent, setFundraisingCurrent, leadership, chapterSize, travelStats }: any) {
  return (
    <div className="space-y-6">
      {/* Activity Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{chapter.engagement_score}</span>
          </div>
          <div className="text-xs font-medium text-blue-700">Engagement Score</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{chapterSize || 'N/A'}</span>
          </div>
          <div className="text-xs font-medium text-purple-700">Chapter Size</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{chapter.posts_last_7_days}</span>
          </div>
          <div className="text-xs font-medium text-green-700">Posts (7 days)</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">{chapter.opportunities_last_30_days}</span>
          </div>
          <div className="text-xs font-medium text-orange-700">Opportunities</div>
        </div>
      </div>

      {/* Fundraising Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
          💰 Fundraising Campaign
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Goal Amount ($)</label>
            <input
              type="number"
              value={fundraisingGoal}
              onChange={(e) => setFundraisingGoal(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="10000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Current Amount ($)</label>
            <input
              type="number"
              value={fundraisingCurrent}
              onChange={(e) => setFundraisingCurrent(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="2500"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">Benefactor / Cause</label>
          <input
            type="text"
            value={fundraisingBenefactor}
            onChange={(e) => setFundraisingBenefactor(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="e.g., Children's Hospital, Make-A-Wish Foundation"
          />
        </div>
        {fundraisingGoal && parseFloat(fundraisingGoal) > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-700 mb-1">
              <span>Progress</span>
              <span className="font-bold text-green-700">
                {Math.round(((parseFloat(fundraisingCurrent) || 0) / parseFloat(fundraisingGoal)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(((parseFloat(fundraisingCurrent) || 0) / parseFloat(fundraisingGoal)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Leadership */}
      {leadership && leadership.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Chapter Leadership
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {leadership.slice(0, 6).map((leader: Leader) => (
              <div key={leader.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="font-semibold text-gray-900">{leader.name}</div>
                <div className="text-sm text-blue-600 font-medium mt-1">{leader.position}</div>
                {leader.email && (
                  <a
                    href={`mailto:${leader.email}`}
                    className="text-xs text-gray-600 hover:text-blue-600 mt-2 block truncate"
                  >
                    {leader.email}
                  </a>
                )}
                {leader.phone && (
                  <a
                    href={`tel:${leader.phone}`}
                    className="text-xs text-gray-600 hover:text-blue-600 block"
                  >
                    {leader.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outreach Management Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          Outreach Management
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Contact Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Contact Name</label>
            <input
              type="text"
              value={primaryContactName}
              onChange={(e) => setPrimaryContactName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="e.g., John Doe - President"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Next Follow-up Date */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Next Follow-up Date
          </label>
          <input
            type="date"
            value={nextFollowUpDate.split('T')[0] || ''}
            onChange={(e) => setNextFollowUpDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Notes */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Add notes about conversations, interests, or follow-up reminders..."
          />
        </div>
      </div>
    </div>
  );
}

function PostsTab({ posts }: { posts: Post[] }) {
  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No posts available
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {post.is_opportunity && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                      Opportunity
                    </span>
                  )}
                  <span className="text-xs text-gray-600">
                    {new Date(post.posted_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-900">{post.caption}</p>
                {post.opportunity_reason && (
                  <p className="text-xs text-green-700 mt-2">💡 {post.opportunity_reason}</p>
                )}
              </div>
              <a
                href={post.post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                View →
              </a>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>❤️ {post.like_count} likes</span>
              <span>💬 {post.comment_count} comments</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function CommunicationsTab({ communications, onLogNew }: { communications: Communication[]; onLogNew: () => void }) {
  return (
    <div className="space-y-4">
      <button
        onClick={onLogNew}
        className="w-full px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        + Log New Communication
      </button>

      {communications.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No communications logged
        </div>
      ) : (
        communications.map((comm) => (
          <div key={comm.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                {comm.type}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                {comm.direction}
              </span>
              <span className="text-xs text-gray-600">
                {new Date(comm.communicated_at).toLocaleDateString()}
              </span>
            </div>
            {comm.subject && (
              <p className="text-sm font-medium text-gray-900 mb-1">{comm.subject}</p>
            )}
            <p className="text-sm text-gray-700">{comm.content}</p>
          </div>
        ))
      )}
    </div>
  );
}

function RosterTab({ roster, upcomingBirthdays, travelStats }: { roster: RosterMember[]; upcomingBirthdays: UpcomingBirthday[]; travelStats: any }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'traveling' | 'birthdays'>('all');

  const filteredRoster = roster.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'traveling') {
      return matchesSearch && member.state !== member.hometown;
    }
    if (filter === 'birthdays') {
      const hasBirthdaySoon = upcomingBirthdays.some(b => b.id === member.id);
      return matchesSearch && hasBirthdaySoon;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <div className="text-2xl font-bold text-blue-900">{roster.length}</div>
            <div className="text-xs text-blue-700">Total Members</div>
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 flex items-center gap-3">
          <Cake className="w-8 h-8 text-orange-600" />
          <div>
            <div className="text-2xl font-bold text-orange-900">{upcomingBirthdays.length}</div>
            <div className="text-xs text-orange-700">Birthdays Soon</div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3">
          <MapPin className="w-8 h-8 text-green-600" />
          <div>
            <div className="text-2xl font-bold text-green-900">{travelStats?.traveling_count || 0}</div>
            <div className="text-xs text-green-700">Traveling</div>
          </div>
        </div>
      </div>

      {/* Upcoming Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Cake className="w-5 h-5 text-orange-600" />
            Upcoming Birthdays
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {upcomingBirthdays.slice(0, 6).map((birthday) => (
              <div key={birthday.id} className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-3 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{birthday.name}</div>
                    <div className="text-xs text-gray-600">Turns {birthday.age}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-600">
                      {birthday.daysUntil === 0 ? 'Today!' : `${birthday.daysUntil}d`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(birthday.birthday).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Travel Summary */}
      {travelStats && travelStats.traveling_count > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Travel Summary
          </h3>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-700">Top Destination</div>
                <div className="font-medium text-green-900">{travelStats.top_destination || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-700">Average Distance</div>
                <div className="font-medium text-green-900">{travelStats.avg_distance || 'N/A'} mi</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Members</option>
          <option value="birthdays">Birthdays Soon</option>
          <option value="traveling">Traveling</option>
        </select>
      </div>

      {/* Roster List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Roster ({filteredRoster.length})
        </h3>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredRoster.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No members found
            </div>
          ) : (
            filteredRoster.map((member) => {
              const hasBirthdaySoon = upcomingBirthdays.some(b => b.id === member.id);
              const isTraveling = member.state !== member.hometown;

              return (
                <div
                  key={member.id}
                  className={`border rounded-lg p-3 ${
                    hasBirthdaySoon ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900">{member.name}</div>
                        {hasBirthdaySoon && <Cake className="w-4 h-4 text-orange-600" />}
                        {isTraveling && <MapPin className="w-4 h-4 text-green-600" />}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-600">{member.year}</span>
                        {member.major && (
                          <span className="text-xs text-gray-600">{member.major}</span>
                        )}
                        {member.hometown && (
                          <span className="text-xs text-gray-500">From: {member.hometown}</span>
                        )}
                      </div>
                    </div>
                    {member.age && (
                      <div className="text-sm text-gray-600">Age {member.age}</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );
}
