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

const TeamPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'usage' | 'members'>('overview');

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

  const teamMembers = [
    { name: 'Jackson Fitzgerald', email: 'jacksonfitzgerald25@gmail.com', role: 'Admin', status: 'Active' },
    { name: 'Sarah Johnson', email: 'sarah@collegeorg.com', role: 'Manager', status: 'Active' },
    { name: 'Mike Chen', email: 'mike@collegeorg.com', role: 'Viewer', status: 'Active' },
    { name: 'Emily Davis', email: 'emily@collegeorg.com', role: 'Manager', status: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team & Subscription</h1>
          <p className="text-gray-600 mt-2">Manage your team and software package</p>
        </div>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
          <TrendingUp className="w-4 h-4" />
          <span>Upgrade Plan</span>
        </button>
      </div>

      {/* Current Package Overview */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2">
              <Package className="w-6 h-6" />
              <span className="text-sm font-medium opacity-90">CURRENT PACKAGE</span>
            </div>
            <h2 className="text-3xl font-bold mt-2">{currentPackage.name} Plan</h2>
            <p className="text-xl mt-1">${currentPackage.price}/month</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 opacity-75" />
                <span className="text-sm">Member since {currentPackage.startDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 opacity-75" />
                <span className="text-sm">Next billing: {currentPackage.nextBillingDate}</span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm font-medium mb-2">Quick Stats</div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Chapters:</span>
                <span className="font-semibold">{currentPackage.features.usedChapters}/{currentPackage.features.chapters}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Support:</span>
                <span className="font-semibold">{currentPackage.features.support}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['overview', 'billing', 'usage', 'members'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-3 px-6 text-sm font-medium capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Compare Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {packageTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={`relative rounded-lg border-2 p-6 ${
                      tier.current
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {tier.current && (
                      <span className="absolute -top-3 left-4 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                        Current Plan
                      </span>
                    )}
                    <h4 className="text-lg font-bold text-gray-900">{tier.name}</h4>
                    <p className="mt-2">
                      <span className="text-3xl font-bold text-gray-900">${tier.price}</span>
                      {tier.price > 0 && <span className="text-gray-500">/month</span>}
                    </p>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center text-sm">
                        <Building className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{tier.features.chapters} Chapters</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{tier.features.ambassadors} Ambassadors</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{tier.features.analytics} Analytics</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <Shield className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{tier.features.support} Support</span>
                      </li>
                      <li className="flex items-center text-sm">
                        {tier.features.customBranding ? (
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 mr-2 text-red-500" />
                        )}
                        <span>Custom Branding</span>
                      </li>
                      <li className="flex items-center text-sm">
                        {tier.features.apiAccess ? (
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 mr-2 text-red-500" />
                        )}
                        <span>API Access</span>
                      </li>
                    </ul>
                    {!tier.current && (
                      <button className="mt-4 w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        {tier.price < currentPackage.price ? 'Downgrade' : 'Upgrade'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
                <button className="text-sm text-primary-600 hover:text-primary-700">
                  Update payment method
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {billingHistory.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.invoice}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-primary-600 hover:text-primary-700">Download</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Usage Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {usageStats.map((stat) => (
                  <div key={stat.metric} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-600">{stat.metric}</span>
                      <span className="text-sm text-gray-500">
                        {stat.value} / {stat.limit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          stat.percentage > 80 ? 'bg-yellow-500' : 'bg-primary-500'
                        }`}
                        style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {stat.percentage}% used
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
                  Invite Member
                </button>
              </div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;