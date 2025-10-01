import { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Users, Unlock, Award,
  Calendar, Clock, Building2, ChevronDown, ChevronUp,
  ArrowUp, ArrowDown
} from 'lucide-react';
import { getCollegeLogoWithFallback } from '../utils/collegeLogos';

interface OverviewStats {
  totalRevenue: number;
  totalCreditsSold: number;
  totalCreditsUsed: number;
  totalUsers: number;
  totalUnlocks: number;
  utilizationRate: string;
}

interface CollegeStat {
  name: string;
  totalCredits: number;
  unlockCount: number;
  lastUnlock: string;
}

interface UnlockType {
  type: string;
  count: number;
  totalCredits: number;
}

interface TimelineStat {
  date: string;
  purchased: number;
  used: number;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
  companies: { company_name: string; email: string };
}

const AdminAnalyticsDashboard = () => {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [colleges, setColleges] = useState<CollegeStat[]>([]);
  const [unlockTypes, setUnlockTypes] = useState<UnlockType[]>([]);
  const [timeline, setTimeline] = useState<TimelineStat[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'colleges' | 'transactions'>('overview');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch all analytics endpoints
      const [overviewRes, collegesRes, unlockTypesRes, timelineRes, transactionsRes] = await Promise.all([
        fetch(`${API_URL}/admin/analytics/overview`),
        fetch(`${API_URL}/admin/analytics/colleges`),
        fetch(`${API_URL}/admin/analytics/unlock-types`),
        fetch(`${API_URL}/admin/analytics/timeline`),
        fetch(`${API_URL}/admin/analytics/recent-transactions`)
      ]);

      const overviewData = await overviewRes.json();
      const collegesData = await collegesRes.json();
      const unlockTypesData = await unlockTypesRes.json();
      const timelineData = await timelineRes.json();
      const transactionsData = await transactionsRes.json();

      setOverview(overviewData);
      setColleges(collegesData.colleges || []);
      setUnlockTypes(unlockTypesData.unlockTypes || []);
      setTimeline(timelineData.timeline || []);
      setRecentTransactions(transactionsData.transactions || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Admin Analytics Dashboard</h1>
          <p className="text-gray-600">Track credit spending, college demand, and revenue metrics</p>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-lg shadow-sm p-1 mb-6 inline-flex">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-6 py-3 rounded-md transition-colors font-medium ${
              selectedView === 'overview'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedView('colleges')}
            className={`px-6 py-3 rounded-md transition-colors font-medium ${
              selectedView === 'colleges'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            College Demand
          </button>
          <button
            onClick={() => setSelectedView('transactions')}
            className={`px-6 py-3 rounded-md transition-colors font-medium ${
              selectedView === 'transactions'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Transactions
          </button>
        </div>

        {/* Overview Stats Cards */}
        {selectedView === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Total Revenue */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-12 h-12 opacity-80" />
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Revenue</span>
                </div>
                <h3 className="text-4xl font-bold mb-1">${overview?.totalRevenue.toLocaleString()}</h3>
                <p className="text-green-100 text-sm">Total revenue generated</p>
              </div>

              {/* Credits Sold */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-12 h-12 opacity-80" />
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Sold</span>
                </div>
                <h3 className="text-4xl font-bold mb-1">{overview?.totalCreditsSold.toLocaleString()}</h3>
                <p className="text-blue-100 text-sm">Total credits sold</p>
              </div>

              {/* Credits Used */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Unlock className="w-12 h-12 opacity-80" />
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Used</span>
                </div>
                <h3 className="text-4xl font-bold mb-1">{overview?.totalCreditsUsed.toLocaleString()}</h3>
                <p className="text-purple-100 text-sm">Credits spent on unlocks</p>
              </div>

              {/* Utilization Rate */}
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Award className="w-12 h-12 opacity-80" />
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Rate</span>
                </div>
                <h3 className="text-4xl font-bold mb-1">{overview?.utilizationRate}%</h3>
                <p className="text-yellow-100 text-sm">Credit utilization rate</p>
              </div>

              {/* Total Users */}
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-12 h-12 opacity-80" />
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Active</span>
                </div>
                <h3 className="text-4xl font-bold mb-1">{overview?.totalUsers}</h3>
                <p className="text-indigo-100 text-sm">Active customers</p>
              </div>

              {/* Total Unlocks */}
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Building2 className="w-12 h-12 opacity-80" />
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Unlocks</span>
                </div>
                <h3 className="text-4xl font-bold mb-1">{overview?.totalUnlocks}</h3>
                <p className="text-pink-100 text-sm">Chapters unlocked</p>
              </div>
            </div>

            {/* Unlock Types Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-primary-600" />
                Popular Unlock Types
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {unlockTypes.map((type, index) => (
                  <div
                    key={type.type}
                    className="border-2 border-gray-200 hover:border-primary-500 rounded-lg p-4 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                      <span className="text-sm font-medium text-primary-600">{type.count} unlocks</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 capitalize mb-1">{type.type.replace('_', ' ')}</h3>
                    <p className="text-sm text-gray-600">{type.totalCredits} credits spent</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Chart (Simple) */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary-600" />
                Credit Activity Timeline
              </h2>
              <div className="space-y-2">
                {timeline.slice(-7).map((day) => (
                  <div key={day.date} className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 w-28">{day.date}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-8 flex items-center overflow-hidden">
                        <div
                          className="bg-green-500 h-full flex items-center justify-end pr-2"
                          style={{ width: `${Math.min((day.purchased / 1000) * 100, 100)}%` }}
                        >
                          <span className="text-xs font-bold text-white">+{day.purchased}</span>
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full h-8 flex items-center overflow-hidden">
                        <div
                          className="bg-red-500 h-full flex items-center justify-end pr-2"
                          style={{ width: `${Math.min((day.used / 1000) * 100, 100)}%` }}
                        >
                          <span className="text-xs font-bold text-white">-{day.used}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-600">Credits Purchased</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-gray-600">Credits Used</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* College Demand View */}
        {selectedView === 'colleges' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary-600" />
                College Demand Rankings
              </h2>
              <p className="text-gray-600 mt-1">See which colleges are generating the most revenue</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      College
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credits Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unlocks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {colleges.map((college, index) => (
                    <tr key={college.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {index === 0 && <span className="text-2xl">🥇</span>}
                          {index === 1 && <span className="text-2xl">🥈</span>}
                          {index === 2 && <span className="text-2xl">🥉</span>}
                          <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={getCollegeLogoWithFallback(college.name)}
                            alt={college.name}
                            className="w-10 h-10 object-contain"
                          />
                          <span className="font-semibold text-gray-900">{college.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-primary-600">
                          {college.totalCredits} credits
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900">{college.unlockCount} unlocks</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {new Date(college.lastUnlock).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Transactions View */}
        {selectedView === 'transactions' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary-600" />
                Recent Transactions
              </h2>
              <p className="text-gray-600 mt-1">Latest credit purchases and usage</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tx.transaction_type === 'purchase' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <ArrowUp className="w-3 h-3 mr-1" />
                            Purchase
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <ArrowDown className="w-3 h-3 mr-1" />
                            Usage
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {tx.companies?.company_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">{tx.companies?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{tx.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-lg font-bold ${
                          tx.transaction_type === 'purchase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.transaction_type === 'purchase' ? '+' : ''}{tx.amount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(tx.created_at).toLocaleString()}
                        </div>
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
  );
};

export default AdminAnalyticsDashboard;