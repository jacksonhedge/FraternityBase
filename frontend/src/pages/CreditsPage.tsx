import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { CreditCard, DollarSign, AlertCircle, Download } from 'lucide-react';

interface AccountBalance {
  balance: number;
  lifetimeSpent: number;
  lifetimeAdded: number;
  autoReload: {
    enabled: boolean;
    threshold: number;
    amount: number;
  };
}

interface Transaction {
  id: string;
  amount_dollars: number;
  transaction_type: string;
  description: string;
  created_at: string;
  chapter_id?: string;
}

const TOP_UP_PRESETS = [25, 50, 100, 250, 500];

export default function CreditsPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [accountData, setAccountData] = useState<AccountBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [autoReloadSettings, setAutoReloadSettings] = useState({
    enabled: false,
    threshold: 10,
    amount: 50
  });
  const [showAutoReloadEdit, setShowAutoReloadEdit] = useState(false);

  useEffect(() => {
    fetchBalance();
    fetchTransactionHistory();
  }, []);

  const fetchBalance = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');

      console.log('Fetching balance from:', `${apiUrl}/credits/balance`);
      console.log('Using token:', token ? 'Token exists' : 'No token');

      const response = await fetch(`${apiUrl}/credits/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAccountData(data);
      setAutoReloadSettings(data.autoReload);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      // Set default values on error to prevent crashes
      setAccountData({
        balance: 0,
        lifetimeSpent: 0,
        lifetimeAdded: 0,
        autoReload: {
          enabled: false,
          threshold: 10,
          amount: 50
        }
      });
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      // This endpoint needs to be created in the backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/credits/transactions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const handleBuyCredits = async () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;

    if (!amount || amount < 10) {
      alert('Minimum top-up is $10');
      return;
    }

    setLoading(true);

    try {
      // Get company_id from user profile
      const profileResponse = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const profile = await profileResponse.json();

      // Create checkout session
      const response = await fetch(`${import.meta.env.VITE_API_URL}/credits/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount,
          companyId: profile.company_id,
          userEmail: user?.email,
          savePaymentMethod: autoReloadSettings.enabled
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.url) {
        throw new Error('No checkout URL received');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Failed to initiate purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAutoReload = async () => {
    try {
      const profileResponse = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const profile = await profileResponse.json();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/credits/auto-reload/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          companyId: profile.company_id,
          ...autoReloadSettings
        })
      });

      if (response.ok) {
        setShowAutoReloadEdit(false);
        fetchBalance();
      }
    } catch (error) {
      console.error('Failed to update auto-reload:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'top_up':
        return 'Credit purchase';
      case 'auto_reload':
        return 'Auto-reload';
      case 'chapter_unlock':
        return 'Chapter unlock';
      case 'warm_intro':
        return 'Warm introduction';
      case 'ambassador_referral':
        return 'Ambassador referral';
      default:
        return type;
    }
  };

  if (!accountData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Separate transactions into purchases (top_ups) and unlocks (usage)
  const purchases = transactions.filter(t =>
    ['top_up', 'auto_reload', 'manual_add'].includes(t.transaction_type)
  );
  const unlocks = transactions.filter(t =>
    ['chapter_unlock', 'warm_intro', 'ambassador_referral'].includes(t.transaction_type)
  );

  return (
    <div className="space-y-6">
      {/* Note: Header removed when embedded in TeamPage */}

        {/* Credit Balance Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Credit balance</h2>
          <p className="text-sm text-gray-600 mb-6">
            Your credit balance will be consumed with chapter unlocks, warm introductions, and ambassador referrals. You can buy credits directly or set up auto-reload thresholds.
          </p>

          <div className="flex items-start gap-6">
            {/* Balance Display */}
            <div className="flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg p-8 min-w-[200px]">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  ${accountData?.balance?.toFixed(2) ?? '0.00'}
                </div>
                <div className="text-sm text-gray-600">Remaining Balance</div>
              </div>
            </div>

            {/* Payment Method & Auto-reload */}
            <div className="flex-1">
              {/* Top-up Amount Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select top-up amount
                </label>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {TOP_UP_PRESETS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setSelectedAmount(amount);
                        setCustomAmount('');
                      }}
                      className={`px-4 py-2 text-sm font-medium rounded-md border-2 transition-colors ${
                        selectedAmount === amount && !customAmount
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    placeholder="Custom amount (min $10)"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CreditCard className="w-4 h-4" />
                  <span>Charged to</span>
                  <span className="font-medium">Link by Stripe</span>
                </div>
                <button
                  onClick={handleBuyCredits}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Buy credits'}
                </button>
              </div>

              {/* Auto-reload Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-amber-900">
                    {autoReloadSettings.enabled ? (
                      <>
                        Auto reload is enabled. We will reload to ${autoReloadSettings.amount} when the balance reaches ${autoReloadSettings.threshold}.
                      </>
                    ) : (
                      <>
                        Auto reload is not enabled. Set up auto-reload to never run out of credits.
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setShowAutoReloadEdit(!showAutoReloadEdit)}
                  className="px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md transition-colors flex-shrink-0"
                >
                  Edit
                </button>
              </div>

              {/* Auto-reload Edit Panel */}
              {showAutoReloadEdit && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={autoReloadSettings.enabled}
                      onChange={(e) => setAutoReloadSettings({ ...autoReloadSettings, enabled: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label className="text-sm font-medium text-gray-900">Enable auto-reload</label>
                  </div>

                  {autoReloadSettings.enabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reload threshold (minimum $5)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500">$</span>
                          <input
                            type="number"
                            min="5"
                            step="5"
                            value={autoReloadSettings.threshold}
                            onChange={(e) => setAutoReloadSettings({ ...autoReloadSettings, threshold: parseFloat(e.target.value) })}
                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reload amount (minimum $25)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500">$</span>
                          <input
                            type="number"
                            min="25"
                            step="25"
                            value={autoReloadSettings.amount}
                            onChange={(e) => setAutoReloadSettings({ ...autoReloadSettings, amount: parseFloat(e.target.value) })}
                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleUpdateAutoReload}
                      className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md transition-colors"
                    >
                      Save settings
                    </button>
                    <button
                      onClick={() => setShowAutoReloadEdit(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice history (Purchases/Top-ups) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice history</h2>
          <p className="text-sm text-gray-600 mb-4">
            Invoices are issued when credits are purchased. All dates are in EDT timezone.
          </p>

          {purchases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-900">Date</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-900">Invoice Type</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-900">Status</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-900">Cost</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100">
                      <td className="py-3 px-2 text-sm text-gray-900">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {getTransactionLabel(transaction.transaction_type)}
                      </td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-900 text-right font-medium">
                        ${Math.abs(transaction.amount_dollars).toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No invoices yet. Purchase credits to get started.
            </div>
          )}
        </div>

        {/* Purchase history (Unlocks/Usage) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase history</h2>
          <p className="text-sm text-gray-600 mb-4">
            Track all your chapter unlocks, warm introductions, and ambassador referrals.
          </p>

          {unlocks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-900">Date</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-900">Type</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-900">Description</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-900">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {unlocks.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100">
                      <td className="py-3 px-2 text-sm text-gray-900">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getTransactionLabel(transaction.transaction_type)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {transaction.description}
                      </td>
                      <td className="py-3 px-2 text-sm text-red-600 text-right font-medium">
                        -${Math.abs(transaction.amount_dollars).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No purchases yet. Unlock chapters to see your purchase history.
            </div>
          )}
        </div>
    </div>
  );
}
