import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  Check,
  X,
  Zap,
  Crown,
  Building2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SubscriptionPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const currentTier = user?.subscriptionTier?.toLowerCase() || 'free';

  const pricingTiers = [
    {
      id: 'free',
      name: 'Basic',
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
      isCurrent: currentTier === 'free'
    },
    {
      id: 'team',
      name: 'Team',
      price: 29.99,
      description: 'Full platform access',
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      goldFeatures: [
        '1 Premium Chapter Unlocked',
        '1 Chapter Introduction'
      ],
      features: [
        'Unlimited platform access',
        'Browse all 5,000+ chapters',
        'Advanced search & filters',
        'Interactive Map',
        'Email support',
        '100 monthly credits included',
        'Purchase additional credits'
      ],
      limitations: [],
      highlighted: true,
      buttonText: currentTier === 'team' || currentTier === 'monthly' ? 'Current Plan' : 'Upgrade to Team',
      isCurrent: currentTier === 'team' || currentTier === 'monthly'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299.99,
      description: 'For large organizations',
      icon: Building2,
      color: 'from-purple-600 to-purple-700',
      bgColor: 'from-purple-50 to-purple-100',
      features: [
        'Everything in Team, plus:',
        'Unlimited chapter unlocks',
        'Unlimited warm intros',
        '500 monthly credits included',
        'Export data to CSV',
        'FraternityBase API access',
        'CRM & tool integrations',
        'Dedicated account manager',
        'Custom onboarding & training',
        'Priority support'
      ],
      limitations: [],
      buttonText: currentTier === 'enterprise' ? 'Current Plan' : 'Upgrade to Enterprise',
      isCurrent: currentTier === 'enterprise'
    }
  ];

  const handleSubscriptionChange = async (tierId: string) => {
    if (tierId === currentTier) return;

    // TODO: Implement Stripe subscription checkout
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          plan: tierId,
          billingPeriod
        })
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to initiate subscription:', error);
      alert('Failed to process subscription. Please try again.');
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-md border border-gray-200">
            <span className="text-xs text-gray-600">Current Plan:</span>
            <span className="text-xs font-bold text-gray-900 capitalize">{currentTier}</span>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start max-w-6xl mx-auto mb-6 mt-8">
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
                <div className={`p-4 pb-3 bg-gradient-to-r ${tier.bgColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {tier.name}
                    </h3>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${tier.color} shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-1">
                    {typeof tier.price === 'number' ? (
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">
                          ${tier.price}
                        </span>
                        {tier.price > 0 && (
                          <span className="text-gray-600 ml-1 text-base">
                            /mo
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-3xl font-bold text-gray-900">
                        {tier.price}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-xs font-medium">
                    {tier.description}
                  </p>
                </div>

                <div className="p-4 pt-2">
                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscriptionChange(tier.id)}
                    disabled={tier.isCurrent}
                    className={`block w-full text-center py-2 px-4 rounded-lg font-bold transition-all duration-200 mb-3 text-sm ${
                      tier.isCurrent
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : tier.highlighted
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                        : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    {tier.buttonText}
                  </button>

                  {/* Features */}
                  <div className="space-y-2">
                    {/* Gold Features (if present) */}
                    {tier.goldFeatures?.map((feature, idx) => (
                      <div key={`gold-${idx}`} className="flex items-start gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-lg p-2 -mx-1">
                        <div className="flex-shrink-0 w-4 h-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mt-0.5 shadow-sm">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-xs font-bold text-amber-900 leading-tight">{feature}</span>
                      </div>
                    ))}

                    {/* Regular Features */}
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="w-2.5 h-2.5 text-green-600" />
                        </div>
                        <span className="text-xs text-gray-700 leading-tight">{feature}</span>
                      </div>
                    ))}
                    {tier.limitations.map((limitation, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                          <X className="w-2.5 h-2.5 text-gray-400" />
                        </div>
                        <span className="text-xs text-gray-500 leading-tight">{limitation}</span>
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
                    <span className="font-bold text-gray-900 text-sm">Chapter Unlock: $9.99</span>
                  </div>
                  <p className="text-xs text-gray-600">Full roster access</p>
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
    </div>
  );
};

export default SubscriptionPage;
