import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  X,
  Zap,
  Rocket,
  Crown,
  Building2,
  Star,
  Users,
  TrendingUp,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const PricingPage = () => {
  const { session } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [currentTier, setCurrentTier] = useState<string | null>(null);

  // Fetch user's current subscription tier
  useEffect(() => {
    const fetchSubscriptionTier = async () => {
      if (!session?.access_token) {
        setCurrentTier(null);
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_URL}/balance`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentTier(data.subscriptionTier || 'trial');
        }
      } catch (error) {
        console.error('Error fetching subscription tier:', error);
      }
    };

    fetchSubscriptionTier();
  }, [session]);

  const pricingTiers = [
    {
      id: 'trial',
      name: '3-Day Trial',
      price: 0,
      description: 'Try FraternityBase risk-free',
      icon: Zap,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      features: [
        '1 Premium chapter unlocked',
        'Full platform access',
        'Browse all 5,000+ chapters',
        'Advanced search filters',
        '3 days to explore'
      ],
      limitations: [
        'Limited to 1 unlocked chapter'
      ],
      buttonText: 'Start Free Trial',
      buttonStyle: 'border-2 border-green-500 text-green-700 hover:bg-green-50 hover:border-green-600 transition-all duration-200'
    },
    {
      id: 'team',
      name: 'Team',
      price: 29.99,
      description: 'Full platform access',
      icon: Rocket,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      features: [
        'Unlimited platform access',
        'Browse all 5,000+ chapters',
        'Advanced search & filters',
        '50 monthly credits',
        '1 Warm Introduction/month',
        '3 team seats',
        'Email support',
        'Purchase credits as needed'
      ],
      limitations: [],
      highlighted: true,
      buttonText: 'Subscribe Now',
      buttonStyle: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 border-transparent shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
    },
    {
      id: 'enterprise-tier-1',
      name: 'Enterprise Tier 1',
      price: 299.99,
      description: 'For agencies and large teams',
      icon: Crown,
      color: 'from-purple-600 to-purple-700',
      bgColor: 'from-purple-50 to-purple-100',
      features: [
        '100 credits/month',
        '3 Premium (5.0⭐) unlocks/month',
        '25 Quality (4.0⭐) unlocks/month',
        '50 Standard (3.0⭐) unlocks/month',
        '3 Warm Introductions/month',
        'FraternityBase API access',
        'Priority support',
        'Early access to new features',
        'Advanced analytics',
        'Export to CSV'
      ],
      limitations: [],
      premium: true,
      buttonText: 'Upgrade to Tier 1',
      buttonStyle: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 border-transparent shadow-lg hover:shadow-xl transition-all duration-200'
    },
    {
      id: 'billing',
      name: 'Add On Credits',
      price: 'Pay as you go',
      description: 'Unlock individual chapters',
      icon: Sparkles,
      color: 'from-yellow-400 via-yellow-500 to-amber-500',
      bgColor: 'from-amber-50 via-yellow-50 to-amber-100',
      features: [
        '5.0⭐ chapters: 10 credits',
        '4.5⭐ chapters: 7 credits',
        '4.0⭐ chapters: 5 credits',
        'Warm Introduction: 200 credits',
        'Ambassador Referral: 330 credits',
        'Buy credits anytime',
        'No monthly commitment',
        'Credits never expire'
      ],
      limitations: [],
      buttonText: 'Buy Credits',
      buttonStyle: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-white hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-600 border-transparent shadow-lg hover:shadow-xl transition-all duration-200'
    },
    {
      id: 'enterprise-tier-2',
      name: 'Enterprise Tier 2',
      price: 2222,
      description: 'Maximum fraternity access',
      icon: Building2,
      color: 'from-indigo-700 to-violet-800',
      bgColor: 'from-indigo-50 to-violet-100',
      features: [
        '50 Premium (5.0⭐) unlocks/month',
        '10 Diamond unlocks/month',
        '500 monthly credits',
        '10 Warm Introductions/month',
        '50 team seats',
        'FraternityBase API access',
        'Priority support',
        'Advanced analytics',
        'Fraternities only (bars & sororities sold separately)'
      ],
      limitations: [],
      buttonText: 'Upgrade to Tier 2',
      buttonStyle: 'bg-gradient-to-r from-indigo-600 to-violet-700 text-white hover:from-indigo-700 hover:to-violet-800 border-transparent shadow-lg hover:shadow-xl transition-all duration-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Simple, Transparent Pricing
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Choose the plan that fits your partnership needs
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-white rounded-xl p-1 shadow-lg border border-gray-200">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  billingPeriod === 'monthly'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  billingPeriod === 'annual'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual
                <span className="ml-2 text-xs bg-gradient-to-r from-green-400 to-green-500 text-white px-2 py-1 rounded-full font-semibold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid - 5 tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-stretch">
            {pricingTiers.map((tier) => {
              const Icon = tier.icon;
              // Map subscription tiers: 'monthly' -> 'team', 'enterprise' -> 'enterprise-tier-1'
              const isCurrentPlan = currentTier && (
                (currentTier === 'monthly' && tier.id === 'team') ||
                (currentTier === 'enterprise' && tier.id === 'enterprise-tier-1') ||
                (currentTier === tier.id)
              );

              return (
                <div
                  key={tier.id}
                  className={`relative bg-white rounded-3xl shadow-xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden ${
                    tier.highlighted
                      ? 'border-blue-400 shadow-blue-200 scale-105 lg:-mt-4 lg:mb-4 ring-4 ring-blue-100'
                      : isCurrentPlan
                      ? 'border-green-300 shadow-green-100 ring-2 ring-green-200'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {/* Show "Current Plan" badge if this is the user's plan, otherwise show "Recommended" if highlighted */}
                  {isCurrentPlan ? (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Current Plan
                      </div>
                    </div>
                  ) : tier.highlighted ? (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white text-sm font-bold px-6 py-2 rounded-full shadow-xl flex items-center gap-2 animate-pulse">
                        <Crown className="w-4 h-4" />
                        Recommended
                      </div>
                    </div>
                  ) : null}

                  {/* Header with gradient background */}
                  <div className={`p-6 pb-4 bg-gradient-to-r ${tier.bgColor || 'from-gray-50 to-gray-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {tier.name}
                      </h3>
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${tier.color} shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-2">
                      {typeof tier.price === 'number' ? (
                        <div className="flex items-baseline">
                          <span className="text-4xl font-bold text-gray-900">
                            ${tier.price}
                          </span>
                          {tier.price > 0 && (
                            <span className="text-gray-600 ml-1 text-lg">
                              /mo
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-4xl font-bold text-gray-900">
                          {tier.price}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm font-medium">
                      {tier.description}
                    </p>
                  </div>

                  <div className="p-6 pt-2">
                    {/* CTA Button */}
                    <Link
                      to={tier.id === 'enterprise' ? '/contact' : '/signup'}
                      className={`block w-full text-center py-4 px-6 rounded-xl font-bold transition-all duration-200 mb-6 ${tier.buttonStyle}`}
                    >
                      {tier.buttonText}
                    </Link>

                    {/* Features */}
                    <div className="space-y-4">
                      {tier.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-700 font-medium leading-relaxed">{feature}</span>
                        </div>
                      ))}
                      {tier.limitations.map((limitation, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                            <X className="w-3 h-3 text-gray-400" />
                          </div>
                          <span className="text-sm text-gray-500 leading-relaxed">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust badges and additional info */}
          <div className="mt-20">
            {/* Trust badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100 mb-4 inline-block">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">5,000+ Organizations</h3>
                <p className="text-gray-600 text-sm">Complete database of Greek life across 250+ universities</p>
              </div>

              <div className="text-center">
                <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100 mb-4 inline-block">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">95% Success Rate</h3>
                <p className="text-gray-600 text-sm">Our clients see successful partnerships within 30 days</p>
              </div>

              <div className="text-center">
                <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100 mb-4 inline-block">
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">4.9/5 Rating</h3>
                <p className="text-gray-600 text-sm">Trusted by marketing teams at 500+ companies</p>
              </div>
            </div>

            {/* FAQ or Additional Info */}
            <div className="text-center bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to get started?
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  All plans include secure data handling, regular updates, and access to our growing database.
                  Start building partnerships with Greek organizations today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Start Free Trial
                  </Link>
                  <Link
                    to="/contact"
                    className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  >
                    Contact Sales
                  </Link>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  No credit card required • Cancel anytime • 14-day free trial
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;