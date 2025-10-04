import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Download, Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Transaction {
  id: string;
  company_name: string;
  company_email: string;
  amount: number;
  type: string;
  description: string;
  status: string;
  created_at: string;
  payment_method: string;
  confirmation_id?: string;
  user_name: string;
  user_email: string;
}

interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  monthlyGrowth: number;
  averageTransaction: number;
  failedPayments: number;
  transactionCount: number;
}

// Helper to get admin auth headers
const getAdminHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const PaymentsRevenueTab = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    monthlyGrowth: 0,
    averageTransaction: 0,
    failedPayments: 0,
    transactionCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      // Fetch revenue summary statistics
      const statsResponse = await fetch(
        `${API_URL}/admin/revenue/summary?dateRange=${dateRange}`,
        { headers: getAdminHeaders() }
      );

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch revenue stats');
      }

      const statsData = await statsResponse.json();
      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
      }

      // Fetch detailed transaction history
      const transactionsResponse = await fetch(
        `${API_URL}/admin/revenue/transactions?dateRange=${dateRange}&limit=100`,
        { headers: getAdminHeaders() }
      );

      if (!transactionsResponse.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const transactionsData = await transactionsResponse.json();
      if (transactionsData.success && transactionsData.transactions) {
        setTransactions(transactionsData.transactions);
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    // TODO: Implement CSV export
    alert('CSV export coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100 uppercase font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">${stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-100 mt-1">All time</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100 uppercase font-medium">This Month</p>
              <p className="text-3xl font-bold mt-1">${stats.monthlyRevenue.toLocaleString()}</p>
              <p className="text-xs text-blue-100 mt-1">
                {stats.monthlyGrowth >= 0 ? '+' : ''}{stats.monthlyGrowth}% vs last month
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100 uppercase font-medium">Avg Transaction</p>
              <p className="text-3xl font-bold mt-1">${stats.averageTransaction}</p>
              <p className="text-xs text-purple-100 mt-1">Per transaction</p>
            </div>
            <CreditCard className="w-12 h-12 text-purple-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-100 uppercase font-medium">Failed Payments</p>
              <p className="text-3xl font-bold mt-1">{stats.failedPayments}</p>
              <p className="text-xs text-red-100 mt-1">Needs attention</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confirmation</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                      Loading transactions...
                    </div>
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(txn.created_at).toLocaleDateString()} <br />
                      <span className="text-xs text-gray-500">
                        {new Date(txn.created_at).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{txn.company_name}</div>
                      <div className="text-xs text-gray-500">{txn.company_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{txn.user_name}</div>
                      <div className="text-xs text-gray-500">{txn.user_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{txn.type.replace('_', ' ')}</div>
                      {txn.description && (
                        <div className="text-xs text-gray-500">{txn.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${txn.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        txn.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : txn.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {txn.payment_method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                      {txn.confirmation_id ? (
                        <span title={txn.confirmation_id}>
                          {txn.confirmation_id.substring(0, 16)}...
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No transactions found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-green-900 font-medium">Live Payment Data</p>
            <p className="text-sm text-green-700 mt-1">
              This dashboard shows real-time payment data from Stripe, including transaction details, confirmation IDs, and the person who made each purchase. Advanced charts and MRR tracking coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsRevenueTab;
