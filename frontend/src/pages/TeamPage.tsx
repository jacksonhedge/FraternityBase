import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Package,
  Check,
  X,
  Calendar,
  CreditCard,
  Users,
  Building,
  Shield,
  Star,
  TrendingUp,
  DollarSign,
  UserPlus,
  Mail,
  Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { RootState } from '../store/store';
import CreditsPage from './CreditsPage';

interface TeamMember {
  id: string;
  member_number: number;
  role: string;
  status: string;
  joined_at: string;
  user_profiles: {
    first_name: string;
    last_name: string;
    email?: string;
  };
}

const TeamPage = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'credits'>('info');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [isInviting, setIsInviting] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<{
    company_name: string;
    created_at: string;
    subscription_tier: string;
    id: string;
  } | null>(null);
  const [companyInfoLoading, setCompanyInfoLoading] = useState(true);
  const [companyInfoError, setCompanyInfoError] = useState<string | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch company info from backend API
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        setCompanyInfoLoading(true);
        setCompanyInfoError(null);

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const token = localStorage.getItem('token');
        if (!token) {
          setCompanyInfoError('No authentication token found');
          setCompanyInfoLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/credits/balance`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('🔍 TeamPage API Response:', data);
          console.log('🔍 companyName value:', data.companyName);
          setCompanyInfo({
            id: data.companyId,
            company_name: data.companyName,
            created_at: data.companyCreatedAt,
            subscription_tier: data.subscriptionTier || 'Free'
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          setCompanyInfoError(errorData.message || `Failed to load company information (${response.status})`);
        }
      } catch (error: any) {
        console.error('Error fetching company info:', error);
        setCompanyInfoError(error.message || 'Failed to load company information');
      } finally {
        setCompanyInfoLoading(false);
      }
    };

    fetchCompanyInfo();
  }, []);

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!user?.companyId) return;

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const token = localStorage.getItem('token');

        if (!token) {
          console.error('No auth token found');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/team/members`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch team members: ${response.status}`);
        }

        const data = await response.json();
        setTeamMembers(data as TeamMember[]);
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, [user?.companyId]);

  // Mock data for current subscription
  const currentPackage = {
    name: 'Pro',
    price: 699,
    billingPeriod: 'monthly',
    startDate: '2024-01-15',
    nextBillingDate: '2025-02-15',
    features: {
      chapters: 50,
      usedChapters: 28,
      ambassadors: 'Unlimited',
      analytics: 'Advanced',
      support: '24/7 Priority',
      customBranding: true,
      apiAccess: true,
      dataExport: true,
    }
  };

  const packageTiers = [
    {
      name: 'Free',
      price: 0,
      features: {
        chapters: 1,
        ambassadors: '5',
        analytics: 'Basic',
        support: 'Community',
        customBranding: false,
        apiAccess: false,
        dataExport: false,
      }
    },
    {
      name: 'Basic',
      price: 99,
      features: {
        chapters: 10,
        ambassadors: '50',
        analytics: 'Standard',
        support: 'Email',
        customBranding: false,
        apiAccess: false,
        dataExport: true,
      }
    },
    {
      name: 'Pro',
      price: 699,
      features: {
        chapters: 50,
        ambassadors: 'Unlimited',
        analytics: 'Advanced',
        support: '24/7 Priority',
        customBranding: true,
        apiAccess: true,
        dataExport: true,
      },
      current: true
    },
    {
      name: 'Enterprise',
      price: 2500,
      features: {
        chapters: 'Unlimited',
        ambassadors: 'Unlimited',
        analytics: 'Custom',
        support: 'Dedicated Manager',
        customBranding: true,
        apiAccess: true,
        dataExport: true,
      }
    }
  ];

  const usageStats = [
    { metric: 'Active Chapters', value: 28, limit: 50, percentage: 56 },
    { metric: 'Monthly Partnerships', value: 142, limit: 'Unlimited', percentage: 100 },
    { metric: 'Ambassador Accounts', value: 347, limit: 'Unlimited', percentage: 100 },
    { metric: 'API Calls (this month)', value: 8420, limit: 50000, percentage: 17 },
  ];

  const billingHistory = [
    { date: '2025-01-15', amount: 699, status: 'Paid', invoice: '#INV-2025-001' },
    { date: '2024-12-15', amount: 699, status: 'Paid', invoice: '#INV-2024-012' },
    { date: '2024-11-15', amount: 699, status: 'Paid', invoice: '#INV-2024-011' },
    { date: '2024-10-15', amount: 699, status: 'Paid', invoice: '#INV-2024-010' },
  ];

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !user?.companyId) return;

    setIsInviting(true);
    try {
      // Get the next member number
      const nextMemberNumber = teamMembers.length + 1;

      // TODO: Send invite email and create pending team member
      // For now, just show success message
      alert(`Invite sent to ${inviteEmail}! They will be team member #${nextMemberNumber}`);

      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('member');
    } catch (error) {
      console.error('Error inviting member:', error);
      alert('Failed to send invite. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-600 mt-2">Manage your team members (up to 3 people)</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { key: 'info', label: 'Info' },
              { key: 'members', label: 'Team Members' },
              { key: 'credits', label: 'Billing' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
                  <p className="text-sm text-gray-600">View your team details</p>
                </div>
              </div>

              {companyInfoLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading company information...</p>
                </div>
              ) : companyInfoError ? (
                <div className="text-center py-12">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="p-2 bg-red-100 rounded-full">
                        <Info className="w-5 h-5 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-red-900">Unable to Load Information</h3>
                    </div>
                    <p className="text-sm text-red-700 mb-4">{companyInfoError}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : companyInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-blue-600" />
                        <h3 className="text-sm font-medium text-gray-600">Company Name</h3>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {companyInfo.company_name || 'Not Available'}
                    </p>
                  </div>

                  {/* Subscription Tier */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-600" />
                        <h3 className="text-sm font-medium text-gray-600">Subscription Tier</h3>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2 capitalize">
                      {companyInfo.subscription_tier || 'Free'}
                    </p>
                  </div>

                  {/* Account Created */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <h3 className="text-sm font-medium text-gray-600">Account Created</h3>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      {companyInfo.created_at && new Date(companyInfo.created_at).getFullYear() > 2000
                        ? new Date(companyInfo.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Date not available'}
                    </p>
                  </div>

                  {/* Team Size */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-orange-600" />
                        <h3 className="text-sm font-medium text-gray-600">Team Size</h3>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {teamMembers.length} / 3 members
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Additional Info Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-2">Need to update your account information?</p>
                    <p className="text-sm text-blue-700">
                      Contact our support team at{' '}
                      <a href="mailto:support@fraternitybase.com" className="underline font-semibold">
                        support@fraternitybase.com
                      </a>
                      {' '}to make changes to your company details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              {/* Team limit notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-900 font-medium">Team Limit: 3 Members</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Need more team members? <a href="mailto:sales@fraternitybase.com" className="underline font-semibold">Contact Sales</a> to upgrade your plan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Team Members ({teamMembers.length}/3)</h3>
                {teamMembers.length < 3 && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Invite Member
                  </button>
                )}
              </div>
              {teamMembers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teamMembers.map((member) => (
                        <tr key={member.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {member.user_profiles.first_name} {member.user_profiles.last_name}
                              </span>
                              {member.member_number === 1 && (
                                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                                  #1
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member.user_profiles.email || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              member.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              member.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : member.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {member.member_number !== 1 && user?.role === 'admin' && (
                              <button className="text-red-600 hover:text-red-700">Remove</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
                  <p className="text-gray-600 mb-4">Invite team members to collaborate on your account.</p>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm flex items-center gap-2 mx-auto"
                  >
                    <UserPlus className="w-4 h-4" />
                    Invite Your First Member
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'credits' && (
            <CreditsPage />
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Invite Team Member</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="teammate@company.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    {inviteRole === 'admin' ? 'Admins can invite members and manage settings' : 'Members can view and unlock chapters'}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Next member:</strong> #{teamMembers.length + 1}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    They will receive an email invitation to join your team.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteMember}
                  disabled={isInviting || !inviteEmail.trim()}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isInviting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Send Invite
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;