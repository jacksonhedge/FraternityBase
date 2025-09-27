import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  X,
  Zap,
  Rocket,
  Crown,
  Building2
} from 'lucide-react';
import Navbar from '../components/Navbar';

const PricingPage = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const pricingTiers = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Get started with basic features',
      icon: Zap,
      features: [
        '1 chapter lookup',
        'Basic organization info',
        'Limited search filters',
        'Community support',
        '14-day trial period'
      ],
      limitations: [
        'No scheduling with orgs',
        'No contact information',
        'No export features',
        'No API access',
        'No priority support'
      ],
      buttonText: 'Start Free',
      buttonStyle: 'border-gray-300 text-gray-700 hover:bg-gray-50'
    },
    {
      id: 'basic',
      name: 'Basic',
      price: billingPeriod === 'monthly' ? 99 : 79,
      description: 'Perfect for small businesses',
      icon: Rocket,
      features: [
        '10 chapter lookups/month',
        'Schedule with 3 organizations',
        'Full organization profiles',
        'Advanced search filters',
        'Contact information',
        'Export to CSV',
        'Email support',
        'Basic analytics',
        'Member demographics'
      ],
      limitations: [
        'No API access',
        'No bulk operations',
        'No custom integrations',
        'No priority support'
      ],
      buttonText: 'Get Basic',
      buttonStyle: 'border-blue-600 text-blue-600 hover:bg-blue-50'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingPeriod === 'monthly' ? 699 : 559,
      description: 'For growing companies',
      icon: Crown,
      features: [
        '100 chapter lookups/month',
        'Schedule with 50 organizations',
        'Full contact information',
        'API access (5000 calls/month)',
        'Advanced analytics & insights',
        'Priority email & chat support',
        'Export to Excel, CSV & PDF',
        'Bulk search & operations',
        'Custom reports',
        'Event calendars',
        'Partnership tracking',
        'Multi-user accounts (5 seats)'
      ],
      limitations: [
        'No white-label options',
        'No dedicated account manager',
        'No custom data fields'
      ],
      highlighted: true,
      buttonText: 'Get Pro',
      buttonStyle: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 border-transparent shadow-md hover:shadow-lg transform hover:scale-105 transition-all'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '2500+',
      description: 'For large organizations',
      icon: Building2,
      features: [
        'Unlimited chapter lookups',
        'Unlimited scheduling with orgs',
        'Unlimited API calls',
        'Custom integrations & webhooks',
        'Dedicated account manager',
        'Custom onboarding & training',
        '99.9% SLA guarantee',
        'White-label options',
        'SSO & advanced security',
        'Custom data fields',
        'Phone, video & Slack support',
        'Unlimited user seats',
        'Priority data requests',
        'Custom reporting dashboards',
        'Compliance certifications'
      ],
      limitations: [],
      buttonText: 'Contact Sales',
      buttonStyle: 'border-gray-900 text-gray-900 hover:bg-gray-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Choose the plan that fits your partnership needs
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  billingPeriod === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                Annual
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid - 4 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {pricingTiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.id}
                  className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                    tier.highlighted
                      ? 'border-blue-600 ring-2 ring-blue-600 ring-opacity-50 shadow-lg scale-105 lg:-mt-4 lg:mb-4'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg">
                        🔥 Recommended
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Icon and Name */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {tier.name}
                      </h3>
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      {typeof tier.price === 'number' ? (
                        <>
                          <span className="text-3xl font-bold text-gray-900">
                            ${tier.price}
                          </span>
                          {tier.price > 0 && (
                            <span className="text-gray-600">
                              /{billingPeriod === 'monthly' ? 'mo' : 'mo'}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-gray-900">
                          Custom
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-6">
                      {tier.description}
                    </p>

                    {/* CTA Button */}
                    <Link
                      to={tier.id === 'enterprise' ? '/contact' : '/signup'}
                      className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-colors border-2 ${tier.buttonStyle}`}
                    >
                      {tier.buttonText}
                    </Link>

                    {/* Features */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="space-y-3">
                        {tier.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                        {tier.limitations.map((limitation, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-500">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ or Additional Info */}
          <div className="mt-16 text-center">
            <p className="text-gray-600">
              All plans include secure data handling, regular updates, and access to our growing database.
            </p>
            <p className="mt-4">
              <Link to="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                Have questions? Contact our sales team →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;