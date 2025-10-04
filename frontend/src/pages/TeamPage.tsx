import { useState } from 'react';
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
  DollarSign
} from 'lucide-react';
import CreditsPage from './CreditsPage';

const TeamPage = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'credits'>('members');

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

  // TODO: Fetch real team members from API
  const teamMembers: any[] = [];

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
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
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
                      {teamMembers.map((member, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              member.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button className="text-primary-600 hover:text-primary-700 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-700">Remove</button>
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
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
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
    </div>
  );
};

export default TeamPage;