// ADMIN CREDIT DASHBOARD - Complete control center
import React, { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, Gift, AlertCircle, Search, RefreshCw } from 'lucide-react';

const AdminCreditDashboard = () => {
  const [stats, setStats] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Grant credits form
  const [grantForm, setGrantForm] = useState({
    email: '',
    credits: 100,
    reason: ''
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/credit/dashboard', {
        headers: {
          'x-admin-token': localStorage.getItem('adminToken')
        }
      });
      const data = await res.json();
      setStats(data.stats);
      setTransactions(data.recentTransactions);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
    setLoading(false);
  };

  const searchUser = async () => {
    if (!searchEmail) return;

    const res = await fetch(`/api/admin/credit/user/${searchEmail}`, {
      headers: {
        'x-admin-token': localStorage.getItem('adminToken')
      }
    });
    const data = await res.json();
    setSelectedUser(data);
  };

  const grantCredits = async () => {
    const res = await fetch('/api/admin/credit/grant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': localStorage.getItem('adminToken')
      },
      body: JSON.stringify(grantForm)
    });

    if (res.ok) {
      alert(`Granted ${grantForm.credits} credits to ${grantForm.email}`);
      setGrantForm({ email: '', credits: 100, reason: '' });
      loadDashboard();
    }
  };

  const refundTransaction = async (transactionId) => {
    if (!confirm('Refund this transaction?')) return;

    const res = await fetch('/api/admin/credit/refund', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': localStorage.getItem('adminToken')
      },
      body: JSON.stringify({
        transactionId,
        reason: 'Admin refund'
      })
    });

    if (res.ok) {
      alert('Transaction refunded');
      loadDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Credit Management</h1>
        <p className="text-gray-600 mt-1">Complete control over the credit system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-6 mb-8">
        <StatCard
          icon={<Users />}
          label="Total Users"
          value={stats.totalUsers || 0}
          color="blue"
        />
        <StatCard
          icon={<DollarSign />}
          label="Credits in System"
          value={stats.totalCreditsInSystem || 0}
          color="green"
        />
        <StatCard
          icon={<TrendingUp />}
          label="Credits Spent"
          value={stats.totalCreditsSpent || 0}
          color="purple"
        />
        <StatCard
          icon={<DollarSign />}
          label="Monthly Revenue"
          value={`$${stats.monthlyRevenue || 0}`}
          color="yellow"
        />
        <StatCard
          icon={<Users />}
          label="Avg Balance"
          value={Math.round(stats.averageBalance || 0)}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column - Actions */}
        <div className="space-y-6">
          {/* Grant Credits */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600" />
              Grant Credits
            </h2>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="User email"
                value={grantForm.email}
                onChange={(e) => setGrantForm({ ...grantForm, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Credits to grant"
                value={grantForm.credits}
                onChange={(e) => setGrantForm({ ...grantForm, credits: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Reason"
                value={grantForm.reason}
                onChange={(e) => setGrantForm({ ...grantForm, reason: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <button
                onClick={grantCredits}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Grant Credits
              </button>
            </div>
          </div>

          {/* User Lookup */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              User Lookup
            </h2>

            <div className="flex gap-2 mb-4">
              <input
                type="email"
                placeholder="Search by email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                onClick={searchUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
            </div>

            {selectedUser && (
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{selectedUser.balance?.company_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Balance:</span>
                  <span className="font-bold text-lg">{selectedUser.balance?.total_credits || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lifetime Purchased:</span>
                  <span>{selectedUser.balance?.lifetime_credits_purchased || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Spent:</span>
                  <span>{selectedUser.summary?.totalSpent || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chapters Unlocked:</span>
                  <span>{selectedUser.summary?.chaptersUnlocked || 0}</span>
                </div>

                <div className="pt-4 space-y-2">
                  <button className="w-full px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                    Adjust Balance
                  </button>
                  <button className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    Revoke Credits
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

            <div className="space-y-2">
              <button className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 text-left">
                <div className="font-medium">Bulk Grant Credits</div>
                <div className="text-sm text-gray-600">Give credits to multiple users</div>
              </button>
              <button className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 text-left">
                <div className="font-medium">Export Transaction Log</div>
                <div className="text-sm text-gray-600">Download all transactions as CSV</div>
              </button>
              <button className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 text-left">
                <div className="font-medium">Update Credit Pricing</div>
                <div className="text-sm text-gray-600">Change costs for actions</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <button
              onClick={loadDashboard}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                onRefund={() => refundTransaction(tx.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Credit System Health */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">System Health</h2>

        <div className="grid grid-cols-4 gap-4">
          <HealthMetric
            label="Credit Velocity"
            value="324/day"
            status="good"
            description="Credits spent per day"
          />
          <HealthMetric
            label="Purchase Rate"
            value="$1,250/day"
            status="good"
            description="Daily credit purchases"
          />
          <HealthMetric
            label="Refund Rate"
            value="2.3%"
            status="warning"
            description="Credits refunded"
          />
          <HealthMetric
            label="Unused Credits"
            value="45%"
            status="info"
            description="Credits not yet spent"
          />
        </div>
      </div>
    </div>
  );
};

// Component: Stat Card
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className={`flex items-center gap-3 text-${color}-600 mb-2`}>
      {icon}
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
  </div>
);

// Component: Transaction Row
const TransactionRow = ({ transaction, onRefund }) => {
  const isSpend = transaction.transaction_type === 'spend';
  const isPurchase = transaction.transaction_type === 'purchase';

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isSpend ? 'text-red-600' : 'text-green-600'}`}>
            {isSpend ? '-' : '+'}{Math.abs(transaction.credits_amount)}
          </span>
          <span className="text-sm text-gray-900">{transaction.description}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {new Date(transaction.created_at).toLocaleString()}
        </div>
      </div>

      {isSpend && (
        <button
          onClick={onRefund}
          className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
        >
          Refund
        </button>
      )}
    </div>
  );
};

// Component: Health Metric
const HealthMetric = ({ label, value, status, description }) => (
  <div className="border rounded-lg p-4">
    <div className="flex justify-between items-start mb-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className={`text-xs px-2 py-1 rounded ${
        status === 'good' ? 'bg-green-100 text-green-700' :
        status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
        'bg-blue-100 text-blue-700'
      }`}>
        {status}
      </span>
    </div>
    <div className="text-xl font-bold text-gray-900">{value}</div>
    <div className="text-xs text-gray-500 mt-1">{description}</div>
  </div>
);

export default AdminCreditDashboard;