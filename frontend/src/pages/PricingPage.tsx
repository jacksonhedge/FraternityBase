import { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import Navbar from '../components/Navbar';

const PricingPage = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

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
      id: 'monthly',
      name: 'Monthly Subscription',
      price: 29.99,
      description: 'Full platform access',
      icon: Rocket,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      features: [
        'Unlimited platform access',
        'Browse all 5,000+ chapters',
        'Advanced search & filters',
        'Export data to CSV',
        'Email support',
        'Purchase credits as needed'
      ],
      limitations: [
        'Credits sold separately'
      ],
      highlighted: true,
      buttonText: 'Subscribe Now',
      buttonStyle: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 border-transparent shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
    },
    {
      id: 'credits',
      name: 'Add-On Credits',
      price: 'Pay as you go',
      description: 'Unlock individual chapters',
      icon: Crown,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      features: [
        'Chapter Unlock: $9.99',
        'Warm Introduction: $59.99',
        'Ambassador Referral: $99.99',
        'Buy credits anytime',
        'No monthly commitment',
        'Credits never expire'
      ],
      limitations: [],
      buttonText: 'Buy Credits',
      buttonStyle: 'border-2 border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600 transition-all duration-200'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom Pricing',
      description: 'For large organizations',
      icon: Building2,
      color: 'from-gray-700 to-gray-800',
      bgColor: 'from-gray-50 to-gray-100',
      features: [
        'Unlimited chapter unlocks',
        'Unlimited warm intros',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Custom onboarding & training'
      ],
      limitations: [],
      buttonText: 'Contact Sales',
      buttonStyle: 'border-2 border-gray-800 text-gray-800 hover:bg-gray-100 hover:border-gray-900 transition-all duration-200'
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

          {/* Pricing Grid - 4 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {pricingTiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.id}
                  className={`relative bg-white rounded-3xl shadow-xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden ${
                    tier.highlighted
                      ? 'border-purple-200 shadow-purple-100 scale-105 lg:-mt-4 lg:mb-4'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        Recommended
                      </div>
                    </div>
                  )}

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