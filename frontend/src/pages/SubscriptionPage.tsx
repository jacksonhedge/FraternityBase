import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  Check,
  X,
  Zap,
  Crown,
  Building2,
  Sparkles,
  ArrowLeft,
  Rocket
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SubscriptionPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [currentTier, setCurrentTier] = useState<string>('trial');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('We need full access to everything');
  const [submittingContact, setSubmittingContact] = useState(false);

  // Fetch subscription tier from API
  useEffect(() => {
    const fetchSubscriptionTier = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_URL}/credits/balance`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentTier(data.subscriptionTier?.toLowerCase() || 'trial');
        }
      } catch (error) {
        console.error('Failed to fetch subscription tier:', error);
      }
    };

    fetchSubscriptionTier();
  }, []);

  const pricingTiers = [
    {
      id: 'trial',
      name: 'Basic',
      level: 0,
      price: 4.99,
      description: '3-day free trial, then $4.99/mo',
      icon: Zap,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      features: [
        'Interactive Map access',
        'View all colleges in the U.S.',
        'Browse 5,000+ chapters',
        '3-day free trial included'
      ],
      limitations: [],
      buttonText: 'Current Plan',
      isCurrent: currentTier === 'trial'
    },
    {
      id: 'monthly',
      name: 'Team',
      level: 1,
      price: 29.99,
      description: 'For small teams & startups',
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      goldFeatures: [
        '50 automatic credits/month',
        '1 Warm Introduction/month',
        'Up to 3 team seats'
      ],
      features: [
        'Pay-as-you-go chapter unlocks',
        'Browse all 5,000+ chapters',
        'Advanced search & filters',
        'Interactive Map',
        'Email support',
        'Annual billing: 10% discount'
      ],
      limitations: [],
      highlighted: true,
      buttonText: currentTier === 'monthly' ? 'Current Plan' : 'Upgrade to Team',
      isCurrent: currentTier === 'monthly'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Tier 1',
      level: 2,
      price: 299.99,
      description: 'For growing organizations',
      icon: Building2,
      color: 'from-purple-600 to-purple-700',
      bgColor: 'from-purple-50 to-purple-100',
      goldFeatures: [
        '3 Premium Unlocks (5.0⭐)',
        '25 Quality Unlocks (4.0-4.9⭐)',
        '50 Standard Unlocks (3.0-3.9⭐)',
        '3 Warm Introductions/month'
      ],
      features: [
        'Everything in Team, plus:',
        '100 monthly credits included',
        'Monthly unlock allowances (fraternities only)',
        'Up to 10 team seats',
        'API access',
        'Priority support'
      ],
      limitations: [],
      buttonText: currentTier === 'enterprise' ? 'Current Plan' : 'Upgrade to Enterprise Tier 1',
      isCurrent: currentTier === 'enterprise'
    },
    {
      id: 'super_enterprise',
      name: 'Enterprise Tier 2',
      level: 3,
      price: 2222,
      description: 'Maximum fraternity access',
      icon: Rocket,
      color: 'from-indigo-600 to-violet-700',
      bgColor: 'from-indigo-50 to-violet-100',
      goldFeatures: [
        '50 Premium Unlocks (5.0⭐)',
        '10 Diamond Unlocks (full roster)',
        '10 Warm Introductions/month',
        '500 monthly credits'
      ],
      features: [
        'Everything in Enterprise Tier 1, plus:',
        'Monthly unlock allowances (fraternities only)',
        'Up to 50 team seats',
        'API access',
        'Priority support'
      ],
      limitations: [],
      buttonText: currentTier === 'super_enterprise' ? 'Current Plan' : 'Upgrade to Enterprise Tier 2',
      isCurrent: currentTier === 'super_enterprise',
      isContactSales: false
    }
  ];

  const handleSubscriptionChange = async (tierId: string) => {
    if (tierId === currentTier) return;

    // Handle "Contact Sales" for Enterprise Tier 2
    if (tierId === 'super_enterprise') {
      setShowContactModal(true);
      return;
    }

    // Get company ID from profile
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

      // Create Stripe subscription checkout
      const response = await fetch(`${import.meta.env.VITE_API_URL}/credits/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tier: tierId,
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
    } catch (error) {
      console.error('Failed to initiate subscription:', error);
      alert(`Failed to process subscription: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Back Button */}
        <Link
          to="/app/team"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Team & Billing
        </Link>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h1>
          <p className="text-sm text-gray-600 mb-3">
            Upgrade or change your subscription at any time
          </p>

          {/* Current Subscription Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-md border border-gray-200 mb-4">
            <span className="text-xs text-gray-600">Current Plan:</span>
            <span className="text-xs font-bold text-gray-900 capitalize">{currentTier}</span>
          </div>

          {/* Billing Period Toggle */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                billingPeriod === 'monthly'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 relative ${
                billingPeriod === 'annual'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Save 10%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-start max-w-7xl mx-auto mb-6 mt-8">
          {pricingTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={`relative bg-white rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl ${
                  tier.highlighted
                    ? 'border-blue-300 shadow-blue-100'
                    : tier.isCurrent
                    ? 'border-green-300 shadow-green-100'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                {tier.highlighted && !tier.isCurrent && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                      Recommended
                    </div>
                  </div>
                )}

                {tier.isCurrent && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap">
                      <Check className="w-3 h-3" />
                      Current Plan
                    </div>
                  </div>
                )}

                {/* Header with gradient background */}
                <div className={`p-3 pb-2 bg-gradient-to-r ${tier.bgColor}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-base font-bold text-gray-900">
                      {tier.name}
                    </h3>
                    <div className={`p-1.5 rounded-lg bg-gradient-to-r ${tier.color} shadow-md`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-1">
                    {typeof tier.price === 'number' ? (
                      <div>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold text-gray-900">
                            ${billingPeriod === 'annual' && tier.price > 0
                              ? (tier.price * 0.9).toFixed(2)
                              : tier.price}
                          </span>
                          {tier.price > 0 && (
                            <span className="text-gray-600 ml-1 text-sm">
                              /mo
                            </span>
                          )}
                        </div>
                        {billingPeriod === 'annual' && tier.price > 0 && (
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            ${(tier.price * 12 * 0.9).toFixed(2)} billed annually
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        {tier.price}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-[10px] font-medium leading-tight">
                    {tier.description}
                  </p>
                </div>

                <div className="p-3 pt-2">
                  {/* CTA Button - Only show for higher tiers (upselling) */}
                  {(() => {
                    const currentTierLevel = pricingTiers.find(t => t.id === currentTier)?.level || 0;
                    const shouldShowButton = tier.level > currentTierLevel;

                    if (!shouldShowButton) {
                      return null;
                    }

                    return (
                      <button
                        onClick={() => handleSubscriptionChange(tier.id)}
                        className={`block w-full text-center py-1.5 px-3 rounded-lg font-bold transition-all duration-200 mb-2.5 text-xs ${
                          tier.highlighted
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                            : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        {tier.buttonText}
                      </button>
                    );
                  })()}

                  {/* Features */}
                  <div className="space-y-1.5">
                    {/* Gold Features (if present) */}
                    {tier.goldFeatures?.map((feature, idx) => (
                      <div key={`gold-${idx}`} className="flex items-start gap-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-md p-1.5 -mx-0.5">
                        <div className="flex-shrink-0 w-3.5 h-3.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mt-0.5 shadow-sm">
                          <Check className="w-2 h-2 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-amber-900 leading-tight">{feature}</span>
                      </div>
                    ))}

                    {/* Regular Features */}
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <div className="flex-shrink-0 w-3.5 h-3.5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="w-2 h-2 text-green-600" />
                        </div>
                        <span className="text-[10px] text-gray-700 leading-tight">{feature}</span>
                      </div>
                    ))}
                    {tier.limitations.map((limitation, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <div className="flex-shrink-0 w-3.5 h-3.5 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                          <X className="w-2 h-2 text-gray-400" />
                        </div>
                        <span className="text-[10px] text-gray-500 leading-tight">{limitation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Credits Add-on Section */}
        <div className="max-w-5xl mx-auto mb-4">
          <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-2xl shadow-xl border-2 border-yellow-300 overflow-hidden">
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>

            <div className="relative p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 shadow-lg">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Add-On Credits</h2>
                    <p className="text-xs text-gray-700">Pay as you go - No commitment required</p>
                  </div>
                </div>
                <Link
                  to="/app/team"
                  className="px-5 py-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-white rounded-lg font-bold hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                >
                  Buy Credits
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-4 h-4 text-yellow-600" />
                    <span className="font-bold text-gray-900 text-sm">Chapter Unlock: $0.99 - $6.99</span>
                  </div>
                  <p className="text-xs text-gray-600">Full roster access (pricing varies by chapter quality)</p>
                </div>

                <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-4 h-4 text-yellow-600" />
                    <span className="font-bold text-gray-900 text-sm">Warm Intro: $59.99</span>
                  </div>
                  <p className="text-xs text-gray-600">Connect with ambassadors</p>
                </div>

                <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-4 h-4 text-yellow-600" />
                    <span className="font-bold text-gray-900 text-sm">Referral: $99.99</span>
                  </div>
                  <p className="text-xs text-gray-600">Ambassador referrals</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg p-3 border border-yellow-200">
                <Sparkles className="w-4 h-4 text-yellow-600" />
                <p className="text-xs text-gray-700">
                  <strong>Credits never expire</strong> • Buy anytime • No monthly commitment
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Need help choosing? Contact our sales team
          </p>
          <a
            href="mailto:sales@fraternitybase.com"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            sales@fraternitybase.com
          </a>
        </div>
      </div>

      {/* Add shimmer animation styles */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>

      {/* Contact Sales Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-700 shadow-lg">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Contact Sales</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Tell us what you need and our team will reach out within 24 hours.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={4}
                placeholder="We need full access to everything"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  setSubmittingContact(true);
                  try {
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

                    // Get user info from Redux store
                    const response = await fetch(`${apiUrl}/credits/enterprise/contact-request`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        message: contactMessage,
                        userEmail: user?.email || '',
                        userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
                        companyName: '' // We can add this later if needed
                      })
                    });

                    if (response.ok) {
                      alert('Thank you! Our team will reach out within 24 hours.');
                      setShowContactModal(false);
                      setContactMessage('We need full access to everything'); // Reset
                    } else {
                      const error = await response.json();
                      throw new Error(error.error || 'Failed to submit request');
                    }
                  } catch (error) {
                    console.error('Failed to submit contact request:', error);
                    alert('Failed to submit request. Please try emailing sales@fraternitybase.com directly.');
                  } finally {
                    setSubmittingContact(false);
                  }
                }}
                disabled={submittingContact}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-700 text-white px-6 py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-violet-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingContact ? 'Sending...' : 'Send Message'}
              </button>
              <button
                onClick={() => setShowContactModal(false)}
                disabled={submittingContact}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
