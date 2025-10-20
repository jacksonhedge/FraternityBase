import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { CreditCard, DollarSign, AlertCircle, Download, Crown, Zap, Unlock, Star, Users, Sparkles, Check, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

interface AccountBalance {
  balance: number;
  lifetimeSpent: number;
  lifetimeAdded: number;
  subscription_tier?: string;
  subscriptionStatus?: string;
  subscriptionPeriodEnd?: string;
  subscriptionStartedAt?: string;
  unlocks?: {
    fiveStar: { remaining: number; monthly: number; isUnlimited: boolean };
    fourStar: { remaining: number; monthly: number; isUnlimited: boolean };
    threeStar: { remaining: number; monthly: number; isUnlimited: boolean };
  };
  warmIntros?: {
    remaining: number;
    monthly: number;
    expiresAt?: string;
  };
  team?: {
    currentSeats: number;
    maxSeats: number;
    available: number;
  };
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

// Credit packages - Priced around Premium unlock value ($27 per unlock)
// 100 credits (10 Premium unlocks) = $270 (matches Team→Enterprise tier difference)
const CREDIT_PACKAGES = [
  {
    id: 'trial',
    name: 'Trial',
    credits: 10,
    price: 30,
    pricePerCredit: 3.00,
    popular: false,
    features: [
      'Perfect for testing',
      '1 Premium unlock',
      'Credits never expire'
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    credits: 100,
    price: 270,
    pricePerCredit: 2.70,
    popular: false,
    features: [
      'Match Enterprise unlocks',
      '10 Premium unlocks',
      'Bridge Team→Enterprise gap',
      'Credits never expire'
    ]
  },
  {
    id: 'popular',
    name: 'Popular',
    credits: 200,
    price: 500,
    pricePerCredit: 2.50,
    popular: true,
    features: [
      'Best value package',
      '20 Premium unlocks',
      '8% volume discount',
      'Ideal for active recruiting',
      'Credits never expire'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    credits: 500,
    price: 1150,
    pricePerCredit: 2.30,
    popular: false,
    features: [
      'High-volume recruiting',
      '50 Premium unlocks',
      '15% volume discount',
      'Perfect for agencies',
      'Credits never expire'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 1000,
    price: 2100,
    pricePerCredit: 2.10,
    popular: false,
    features: [
      'Maximum flexibility',
      '100 Premium unlocks',
      '22% volume discount',
      'Large organizations',
      'Priority support included'
    ]
  }
];

// Subscription tiers configuration
const SUBSCRIPTION_TIERS = [
  {
    id: 'team',
    name: 'Team',
    monthlyPrice: 29.99,
    annualPrice: 323.89, // 10% discount: $29.99 * 12 * 0.9
    monthlyCredits: 0,
    icon: Zap,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-50 to-blue-100',
    popular: true,
    features: [
      '1 Premium (5.0⭐) unlock/mo',
      '4 Quality (4.0-4.9⭐) unlocks/mo',
      '7 Standard (3.0-3.9⭐) unlocks/mo',
      '1 Warm Introduction (new clients only)',
      '3 Team seats',
      'Advanced search & filters',
      'Email support',
      'Purchase additional credits'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 299.99,
    annualPrice: 3239.89, // 10% discount: $299.99 * 12 * 0.9
    monthlyCredits: 1000,
    icon: Crown,
    color: 'from-purple-600 to-purple-700',
    bgColor: 'from-purple-50 to-purple-100',
    popular: false,
    features: [
      '3 Premium (5.0⭐) unlocks/mo',
      '25 Quality (4.0-4.9⭐) unlocks/mo',
      '60 Standard (3.0-3.9⭐) unlocks/mo',
      '1000 monthly credits included',
      '3 Warm Introductions/mo',
      '10 Team seats',
      'FraternityBase API access',
      'Priority support',
      'Early access features'
    ]
  }
];

export default function CreditsPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [accountData, setAccountData] = useState<AccountBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('popular');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [autoReloadSettings, setAutoReloadSettings] = useState({
    enabled: false,
    threshold: 10,
    amount: 50
  });
  const [showAutoReloadEdit, setShowAutoReloadEdit] = useState(false);
  const [subscriptionPlansCollapsed, setSubscriptionPlansCollapsed] = useState(false);

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

      // DEBUG LOGGING
      console.log('🔍 Raw API response:', data);
      console.log('🔍 subscriptionTier:', data.subscriptionTier);
      console.log('🔍 unlocks object:', data.unlocks);
      console.log('🔍 Has unlocks?', !!data.unlocks);

      // Map API response fields to component state
      setAccountData({
        balance: data.balanceCredits || data.balance || 0,
        lifetimeSpent: data.lifetimeSpentCredits || 0,
        lifetimeAdded: data.lifetimeEarnedCredits || 0,
        subscription_tier: data.subscriptionTier,
        subscriptionStatus: data.subscriptionStatus,
        subscriptionPeriodEnd: data.subscriptionPeriodEnd,
        subscriptionStartedAt: data.subscriptionStartedAt,
        unlocks: data.unlocks,
        warmIntros: data.warmIntros,
        team: data.team,
        autoReload: data.autoReload
      });

      console.log('✅ accountData set:', {
        tier: data.subscriptionTier,
        hasUnlocks: !!data.unlocks,
        unlocksData: data.unlocks
      });
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

  const handleBuyCredits = async (packageId: string) => {
    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
    if (!pkg) {
      alert('Invalid package selected');
      return;
    }

    setLoading(true);

    try {
      // Create checkout session with package ID
      const response = await fetch(`${import.meta.env.VITE_API_URL}/credits/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          packageId: packageId,
          priceId: pkg.id // Backend will map this to the Stripe price ID
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

  const handleSubscriptionChange = async (tierId: string, period: 'monthly' | 'annual') => {
    setLoading(true);
    try {
      const profileResponse = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const profile = await profileResponse.json();

      if (!profile.company_id) {
        alert('Unable to find company profile. Please try logging in again.');
        return;
      }

      // Check if user already has an active subscription (not trial/free)
      const currentTier = accountData?.subscription_tier?.toLowerCase();
      const hasActiveSubscription = currentTier && !['trial', 'free'].includes(currentTier);

      if (hasActiveSubscription) {
        // User already has subscription - use change/upgrade endpoint with proration
        const confirmMessage = `You are upgrading/changing your subscription. You will be charged a prorated amount for the remainder of your billing period. Continue?`;
        if (!window.confirm(confirmMessage)) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/credits/subscription/change`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            companyId: profile.company_id,
            newTier: tierId,
            newPeriod: period
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to change subscription');
        }

        const data = await response.json();

        // Refresh the page data to show updated subscription
        await fetchBalance();

        alert(`Subscription updated successfully! ${data.proratedAmount ? `Prorated charge: $${data.proratedAmount.toFixed(2)}` : ''}`);
      } else {
        // New subscription - create Stripe checkout session
        const response = await fetch(`${import.meta.env.VITE_API_URL}/credits/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            tier: tierId,
            period: period,
            companyId: profile.company_id
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create checkout session');
        }

        const data = await response.json();
        if (data.url) {
          // Redirect to Stripe checkout
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL received from server');
        }
      }
    } catch (error) {
      console.error('Failed to initiate subscription:', error);
      alert(`Failed to process subscription: ${error instanceof Error ? error.message : 'Please try again.'}`);
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
      case 'five_star_unlock':
        return 'Chapter unlock';
      case 'subscription_unlock':
        return 'Chapter unlock (Subscription)';
      case 'warm_intro':
      case 'warm_introduction':
        return 'Warm introduction';
      case 'subscription_warm_intro':
        return 'Warm intro (Subscription)';
      case 'ambassador_referral':
        return 'Ambassador referral';
      case 'subscription_initial_grant':
        return 'Subscription activated';
      case 'subscription_renewal':
        return 'Subscription renewed';
      case 'subscription_change':
        return 'Subscription changed';
      default:
        return type;
    }
  };

  const getTransactionBadgeColor = (type: string) => {
    // Subscription-based transactions get purple badges
    if (type.startsWith('subscription_')) {
      return 'bg-purple-100 text-purple-800';
    }
    // Regular unlocks get blue badges
    return 'bg-blue-100 text-blue-800';
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
    ['top_up', 'auto_reload', 'manual_add', 'subscription_change', 'subscription_initial_grant', 'subscription_renewal'].includes(t.transaction_type)
  );
  const unlocks = transactions.filter(t =>
    ['chapter_unlock', 'warm_intro', 'ambassador_referral'].includes(t.transaction_type)
  );

  const getSubscriptionIcon = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'enterprise':
        return Crown;
      case 'monthly':
      case 'team':
        return Zap;
      default:
        return CreditCard;
    }
  };

  const getSubscriptionColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'enterprise':
        return 'from-purple-500 to-purple-600';
      case 'monthly':
      case 'team':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Scroll Indicator - Shows when there's more content below */}
      <div className="sticky top-0 z-10 flex justify-center pointer-events-none">
        <div className="bg-gradient-to-b from-transparent via-blue-50/50 to-transparent py-2 px-4 rounded-full">
          <div className="flex items-center gap-2 text-xs text-gray-500 animate-bounce">
            <ChevronDown className="w-3 h-3" />
            <span>Scroll for more</span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Note: Header removed when embedded in TeamPage */}

      {/* Subscription Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Subscription</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${getSubscriptionColor(accountData?.subscription_tier || 'free')} shadow-lg`}>
              {(() => {
                const Icon = getSubscriptionIcon(accountData?.subscription_tier || 'free');
                return <Icon className="w-6 h-6 text-white" />;
              })()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 capitalize">
                {accountData?.subscription_tier?.toLowerCase() === 'monthly' ? 'Team' :
                 accountData?.subscription_tier?.toLowerCase() === 'enterprise' ? 'Enterprise' :
                 'Free'}
              </h3>
              <p className="text-sm text-gray-600">
                {accountData?.subscription_tier?.toLowerCase() === 'enterprise' ? 'Unlimited features' :
                 accountData?.subscription_tier?.toLowerCase() === 'monthly' || accountData?.subscription_tier?.toLowerCase() === 'team' ? '$29.99/month' :
                 '3-day trial'}
              </p>
            </div>
          </div>
          <a
            href="/app/subscription"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Upgrade Plan
          </a>
        </div>
      </div>

      {/* Subscription Billing Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Subscription Plans</h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose between monthly or annual billing. Annual plans save 10%.
            </p>
          </div>
          <button
            onClick={() => setSubscriptionPlansCollapsed(!subscriptionPlansCollapsed)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {subscriptionPlansCollapsed ? (
              <>
                <ChevronDown className="w-4 h-4" />
                Expand
              </>
            ) : (
              <>
                <ChevronUp className="w-4 h-4" />
                Collapse
              </>
            )}
          </button>
        </div>

        {!subscriptionPlansCollapsed && (
          <>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'annual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>Annual</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                  Save 10%
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Subscription Tiers Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {SUBSCRIPTION_TIERS.map((tier) => {
            const Icon = tier.icon;
            const price = billingPeriod === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
            const pricePerMonth = billingPeriod === 'annual' ? tier.annualPrice / 12 : tier.monthlyPrice;
            const isCurrentTier = accountData?.subscription_tier?.toLowerCase() === tier.id;

            return (
              <div
                key={tier.id}
                className={`relative border-2 rounded-lg p-6 transition-all ${
                  tier.popular
                    ? 'border-blue-300 shadow-blue-100 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isCurrentTier ? 'ring-2 ring-green-500' : ''}`}
              >
                {tier.popular && !isCurrentTier && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      RECOMMENDED
                    </div>
                  </div>
                )}

                {isCurrentTier && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Current Plan
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className={`mb-4 pb-4 border-b border-gray-100`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${tier.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ${pricePerMonth.toFixed(2)}
                    </span>
                    <span className="text-gray-600">/mo</span>
                  </div>

                  {billingPeriod === 'annual' && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        ${price.toFixed(2)} billed annually
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        Save ${(tier.monthlyPrice * 12 - tier.annualPrice).toFixed(2)}/year
                      </p>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button - Only show for higher tiers (upselling) */}
                {(() => {
                  const currentTier = accountData?.subscription_tier?.toLowerCase();

                  // Define tier hierarchy: trial/free < team/monthly < enterprise
                  const getTierLevel = (tier: string) => {
                    if (tier === 'enterprise') return 2;
                    if (tier === 'monthly' || tier === 'team') return 1;
                    return 0; // trial, free
                  };

                  const currentLevel = getTierLevel(currentTier || 'trial');
                  const tierLevel = getTierLevel(tier.id);

                  // Only show button if this tier is higher than current
                  if (tierLevel <= currentLevel) {
                    return null;
                  }

                  return (
                    <button
                      onClick={() => handleSubscriptionChange(tier.id, billingPeriod)}
                      disabled={loading}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all text-sm ${
                        tier.popular
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                          : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (() => {
                        const hasActiveSubscription = currentTier && !['trial', 'free'].includes(currentTier);

                        if (hasActiveSubscription) {
                          // User has subscription - show upgrade/change text
                          if (currentTier === 'monthly' && tier.id === 'enterprise') {
                            return `Upgrade to ${tier.name}`;
                          } else {
                            return `Change to ${tier.name} (${billingPeriod})`;
                          }
                        } else {
                          // New subscription
                          return `Subscribe to ${tier.name}`;
                        }
                      })()}
                    </button>
                  );
                })()}
              </div>
            );
          })}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-900">
            ℹ️ <strong>Note:</strong> Subscriptions include monthly unlock allowances and credits. When unlocks are used up, credits are deducted from your balance.
          </p>
        </div>
        </>
        )}
      </div>

      {/* Subscription Benefits Section - Only show for paid tiers */}
      {(() => {
        const tier = accountData?.subscription_tier?.toLowerCase();
        const hasUnlocks = !!accountData?.unlocks;
        const shouldShow = (tier === 'monthly' || tier === 'team' || tier === 'enterprise') && hasUnlocks;
        console.log('🎨 Subscription Benefits Render Check:', {
          tier,
          hasUnlocks,
          shouldShow,
          accountData
        });
        return shouldShow;
      })() && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-sm border border-blue-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Subscription Benefits</h2>
          <p className="text-sm text-gray-600 mb-6">
            Your subscription includes monthly unlock allowances. When these are exhausted, unlocks will use credits from your balance.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 5-Star Chapter Unlocks */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">5.0⭐ Premium</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {accountData.unlocks.fiveStar.isUnlimited ? '∞' : accountData.unlocks.fiveStar.remaining}
                  </span>
                  <span className="text-sm text-gray-500">
                    / {accountData.unlocks.fiveStar.isUnlimited ? '∞' : accountData.unlocks.fiveStar.monthly}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-amber-600 h-2 rounded-full transition-all"
                    style={{
                      width: accountData.unlocks.fiveStar.isUnlimited
                        ? '100%'
                        : `${Math.min((accountData.unlocks.fiveStar.remaining / accountData.unlocks.fiveStar.monthly) * 100, 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  {accountData.unlocks.fiveStar.isUnlimited ? 'Unlimited unlocks' : 'unlocks remaining'}
                </p>
              </div>
            </div>

            {/* 4-Star Chapter Unlocks */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">4.0-4.9⭐ Quality</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {accountData.unlocks.fourStar.isUnlimited ? '∞' : accountData.unlocks.fourStar.remaining}
                  </span>
                  <span className="text-sm text-gray-500">
                    / {accountData.unlocks.fourStar.isUnlimited ? '∞' : accountData.unlocks.fourStar.monthly}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: accountData.unlocks.fourStar.isUnlimited
                        ? '100%'
                        : `${Math.min((accountData.unlocks.fourStar.remaining / accountData.unlocks.fourStar.monthly) * 100, 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  {accountData.unlocks.fourStar.isUnlimited ? 'Unlimited unlocks' : 'unlocks remaining'}
                </p>
              </div>
            </div>

            {/* 3-Star Chapter Unlocks */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                  <Unlock className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">3.0-3.9⭐ Standard</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {accountData.unlocks.threeStar.isUnlimited ? '∞' : accountData.unlocks.threeStar.remaining}
                  </span>
                  <span className="text-sm text-gray-500">
                    / {accountData.unlocks.threeStar.isUnlimited ? '∞' : accountData.unlocks.threeStar.monthly}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                    style={{
                      width: accountData.unlocks.threeStar.isUnlimited
                        ? '100%'
                        : `${Math.min((accountData.unlocks.threeStar.remaining / accountData.unlocks.threeStar.monthly) * 100, 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  {accountData.unlocks.threeStar.isUnlimited ? 'Unlimited unlocks' : 'unlocks remaining'}
                </p>
              </div>
            </div>

            {/* Warm Intros */}
            {accountData?.warmIntros && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">Warm Intros</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {accountData.warmIntros.remaining}
                    </span>
                    <span className="text-sm text-gray-500">
                      / {accountData.warmIntros.monthly}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{
                        width: accountData.warmIntros.monthly > 0
                          ? `${Math.min((accountData.warmIntros.remaining / accountData.warmIntros.monthly) * 100, 100)}%`
                          : '0%'
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    {accountData.warmIntros.expiresAt
                      ? `Expires ${new Date(accountData.warmIntros.expiresAt).toLocaleDateString()}`
                      : 'intros remaining'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Team Seats Info */}
          {accountData?.team && (
            <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Team Seats</h3>
                    <p className="text-sm text-gray-600">
                      {accountData.team.currentSeats} of {accountData.team.maxSeats} seats used
                      {accountData.team.available > 0 && ` • ${accountData.team.available} available`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {accountData.team.currentSeats}/{accountData.team.maxSeats}
                  </div>
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min((accountData.team.currentSeats / accountData.team.maxSeats) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Reset Info */}
          {accountData?.subscriptionPeriodEnd && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-900">
                ℹ️ Your subscription unlocks will reset on <strong>{new Date(accountData.subscriptionPeriodEnd).toLocaleDateString()}</strong>
              </p>
            </div>
          )}
        </div>
      )}

        {/* Credit Balance Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Current Balance</h2>
          <div className="flex items-baseline gap-3">
            <div className="text-5xl font-bold text-gray-900">
              {Math.floor(accountData?.balance ?? 0)}
            </div>
            <div className="text-lg text-gray-600">credits</div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Credits are used when subscription unlocks are exhausted
          </p>
        </div>

        {/* Credit Packages Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Buy Credit Packages</h2>
          <p className="text-sm text-gray-600 mb-6">
            Choose the package that best fits your needs. All credits never expire and can be used anytime.
          </p>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPackage === pkg.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${pkg.popular ? 'ring-2 ring-yellow-400' : ''}`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900 mb-2">{pkg.name}</div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {pkg.credits}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">credits</div>

                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    ${pkg.price}
                  </div>
                  <div className="text-xs text-gray-500">
                    ${pkg.pricePerCredit.toFixed(2)}/credit
                  </div>

                  <ul className="mt-4 space-y-2 text-left">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => handleBuyCredits(selectedPackage)}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Buy {CREDIT_PACKAGES.find(p => p.id === selectedPackage)?.credits} Credits for ${CREDIT_PACKAGES.find(p => p.id === selectedPackage)?.price}
                </>
              )}
            </button>
          </div>
        </div>

        {/* How Credits Work */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-sm border border-blue-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            How Credits Work
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-3xl mb-2">💳</div>
              <h3 className="font-semibold text-gray-900 mb-2">One-Time Purchase</h3>
              <p className="text-sm text-gray-600">
                Buy credits once and use them whenever you need. No recurring charges.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-3xl mb-2">♾️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Never Expire</h3>
              <p className="text-sm text-gray-600">
                Credits remain in your account forever. No rush, no pressure.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-3xl mb-2">💎</div>
              <h3 className="font-semibold text-gray-900 mb-2">Volume Savings</h3>
              <p className="text-sm text-gray-600">
                Larger packages offer better value - save up to 32% with Enterprise.
              </p>
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
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTransactionBadgeColor(transaction.transaction_type)}`}>
                          {getTransactionLabel(transaction.transaction_type)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {transaction.description}
                      </td>
                      <td className={`py-3 px-2 text-sm text-right font-medium ${
                        transaction.transaction_type.startsWith('subscription_') && transaction.amount_dollars === 0
                          ? 'text-purple-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.transaction_type.startsWith('subscription_') && transaction.amount_dollars === 0
                          ? 'Included'
                          : `-$${Math.abs(transaction.amount_dollars).toFixed(2)}`}
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
