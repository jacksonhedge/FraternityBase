import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  Check,
  X,
  Zap,
  Building2,
  Sparkles,
  ArrowLeft,
  Rocket,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SubscriptionPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [currentTier, setCurrentTier] = useState<string>('trial');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [expandedSection, setExpandedSection] = useState<string | null>('Billing');

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

  const steps = [
    { name: 'Plan', active: true },
    { name: 'Add-ons', active: false },
    { name: 'Billing details', active: false },
    { name: 'Payment', active: false },
    { name: 'Review', active: false }
  ];

  const pricingTiers = [
    {
      id: 'trial',
      name: 'Free',
      badge: null,
      price: 0,
      monthlyPrice: 0,
      annualPrice: 0,
      description: '3-day trial included',
      features: {
        credits: '$5 free credits',
        mapAccess: true,
        collegeView: 'View all colleges',
        chapterView: 'Browse 5,000+ chapters',
        support: 'Community (Discord)',
        teamSeats: '1 seat'
      },
      isCurrent: currentTier === 'trial'
    },
    {
      id: 'monthly',
      name: 'Starter',
      badge: '🥉',
      price: 29.99,
      monthlyPrice: 29.99,
      annualPrice: 26.99,
      description: 'For small teams',
      features: {
        credits: '50 automatic credits/month',
        mapAccess: true,
        collegeView: 'Advanced search & filters',
        chapterView: 'Pay-as-you-go unlocks',
        support: 'Chat',
        teamSeats: 'Up to 3 seats',
        warmIntros: '1 Warm Introduction/month'
      },
      isCurrent: currentTier === 'monthly'
    },
    {
      id: 'enterprise',
      name: 'Scale',
      badge: '🥈',
      price: 299.99,
      monthlyPrice: 299.99,
      annualPrice: 269.99,
      description: 'For growing organizations',
      features: {
        credits: '100 monthly credits',
        mapAccess: true,
        collegeView: 'API access',
        chapterView: 'Monthly unlock allowances',
        support: 'Priority chat',
        teamSeats: 'Up to 10 seats',
        warmIntros: '3 Warm Introductions/month',
        unlocks: '3 Premium + 25 Quality + 50 Standard'
      },
      isCurrent: currentTier === 'enterprise'
    },
    {
      id: 'super_enterprise',
      name: 'Business',
      badge: '🥇',
      price: 2222.22,
      monthlyPrice: 2222.22,
      annualPrice: 1999.99,
      description: 'Maximum access',
      features: {
        credits: '500 monthly credits',
        mapAccess: true,
        collegeView: 'Full API access',
        chapterView: 'Unlimited unlocks',
        support: 'Account manager',
        teamSeats: 'Up to 50 seats',
        warmIntros: '10 Warm Introductions/month',
        unlocks: '50 Premium + 10 Diamond unlocks',
        training: '1 hour / month included'
      },
      isCurrent: currentTier === 'super_enterprise'
    }
  ];

  const featureRows = [
    {
      category: 'Billing',
      features: [
        {
          name: 'Monthly subscription cost',
          info: 'Base subscription price per month',
          free: '$0',
          starter: '$29.99 / month',
          scale: '$299.99 / month',
          business: '$2,222.22 / month'
        },
        {
          name: 'Annual subscription cost',
          info: 'Discounted annual pricing (10% off)',
          free: '$0',
          starter: '$323.89 / year',
          scale: '$3,239.89 / year',
          business: '$23,999.93 / year'
        },
        {
          name: 'Monthly credits included',
          info: 'Credits automatically added each billing cycle',
          free: '$5 one-time',
          starter: '50 credits/mo',
          scale: '100 credits/mo',
          business: '500 credits/mo'
        },
        {
          name: 'Additional credit purchases',
          info: 'Buy credits anytime at standard rates',
          free: <Check className="w-5 h-5 text-green-600" />,
          starter: <Check className="w-5 h-5 text-green-600" />,
          scale: <Check className="w-5 h-5 text-green-600" />,
          business: <Check className="w-5 h-5 text-green-600" />
        },
        {
          name: 'Credits rollover',
          info: 'Unused credits carry to next month',
          free: <Check className="w-5 h-5 text-green-600" />,
          starter: <Check className="w-5 h-5 text-green-600" />,
          scale: <Check className="w-5 h-5 text-green-600" />,
          business: <Check className="w-5 h-5 text-green-600" />
        },
        {
          name: 'Billing frequency',
          info: 'How often you are charged',
          free: 'N/A',
          starter: 'Monthly or Annual',
          scale: 'Monthly or Annual',
          business: 'Monthly or Annual'
        }
      ]
    },
    {
      category: 'Access & Features',
      features: [
        {
          name: 'Interactive Map access',
          info: 'View colleges across all 48 states',
          free: <Check className="w-5 h-5 text-green-600" />,
          starter: <Check className="w-5 h-5 text-green-600" />,
          scale: <Check className="w-5 h-5 text-green-600" />,
          business: <Check className="w-5 h-5 text-green-600" />
        },
        {
          name: 'Browse all chapters',
          info: 'View all 5,000+ Greek organizations',
          free: <Check className="w-5 h-5 text-green-600" />,
          starter: <Check className="w-5 h-5 text-green-600" />,
          scale: <Check className="w-5 h-5 text-green-600" />,
          business: <Check className="w-5 h-5 text-green-600" />
        },
        {
          name: 'Team seats',
          info: 'Number of users on your account',
          free: '1 seat',
          starter: 'Up to 3 seats',
          scale: 'Up to 10 seats',
          business: 'Up to 50 seats'
        },
        {
          name: 'Warm Introductions',
          info: 'Connect with campus ambassadors',
          free: <X className="w-5 h-5 text-gray-400" />,
          starter: '1 per month',
          scale: '3 per month',
          business: '10 per month'
        },
        {
          name: 'Advanced search & filters',
          info: 'Filter by state, Greek letters, size, etc.',
          free: 'Basic',
          starter: <Check className="w-5 h-5 text-green-600" />,
          scale: <Check className="w-5 h-5 text-green-600" />,
          business: <Check className="w-5 h-5 text-green-600" />
        }
      ]
    },
    {
      category: 'Chapter Unlocks',
      features: [
        {
          name: 'Pay-as-you-go unlocks',
          info: 'Unlock individual chapter rosters with credits',
          free: <X className="w-5 h-5 text-gray-400" />,
          starter: <Check className="w-5 h-5 text-green-600" />,
          scale: <Check className="w-5 h-5 text-green-600" />,
          business: <Check className="w-5 h-5 text-green-600" />
        },
        {
          name: 'Standard unlocks (3.0-3.9⭐)',
          info: 'Decent quality chapter rosters',
          free: <X className="w-5 h-5 text-gray-400" />,
          starter: <X className="w-5 h-5 text-gray-400" />,
          scale: '50 per month',
          business: 'Unlimited'
        },
        {
          name: 'Quality unlocks (4.0-4.9⭐)',
          info: 'High quality chapter rosters',
          free: <X className="w-5 h-5 text-gray-400" />,
          starter: <X className="w-5 h-5 text-gray-400" />,
          scale: '25 per month',
          business: 'Unlimited'
        },
        {
          name: 'Premium unlocks (5.0⭐)',
          info: 'Top-rated chapter rosters',
          free: <X className="w-5 h-5 text-gray-400" />,
          starter: <X className="w-5 h-5 text-gray-400" />,
          scale: '3 per month',
          business: '50 per month'
        },
        {
          name: 'Diamond unlocks (full roster)',
          info: 'Complete historical data with all members',
          free: <X className="w-5 h-5 text-gray-400" />,
          starter: <X className="w-5 h-5 text-gray-400" />,
          scale: <X className="w-5 h-5 text-gray-400" />,
          business: '10 per month'
        },
        {
          name: 'Unlock scope',
          info: 'Which organizations can be unlocked',
          free: 'N/A',
          starter: 'All',
          scale: 'Fraternities only',
          business: 'All organizations'
        }
      ]
    },
    {
      category: 'Credits',
      features: [
        {
          name: 'Monthly credits included',
          info: 'Credits automatically added each billing cycle',
          free: '$5 one-time',
          starter: '50 credits',
          scale: '100 credits',
          business: '500 credits'
        },
        {
          name: 'Credit cost per unlock',
          info: 'How many credits to unlock a chapter',
          free: 'N/A',
          starter: '$0.99 - $6.99',
          scale: '$0.99 - $6.99',
          business: '$0.99 - $6.99'
        },
        {
          name: 'Additional credits purchase',
          info: 'Buy more credits anytime',
          free: <Check className="w-5 h-5 text-green-600" />,
          starter: <Check className="w-5 h-5 text-green-600" />,
          scale: <Check className="w-5 h-5 text-green-600" />,
          business: <Check className="w-5 h-5 text-green-600" />
        },
        {
          name: 'Credits rollover',
          info: 'Unused credits carry to next month',
          free: <Check className="w-5 h-5 text-green-600" />,
          starter: <Check className="w-5 h-5 text-green-600" />,
          scale: <Check className="w-5 h-5 text-green-600" />,
          business: <Check className="w-5 h-5 text-green-600" />
        },
        {
          name: 'Credits expiration',
          info: 'When do credits expire',
          free: 'Never',
          starter: 'Never',
          scale: 'Never',
          business: 'Never'
        }
      ]
    },
    {
      category: 'Warm Introductions',
      features: [
        {
          name: 'Monthly introductions included',
          info: 'Connect with campus ambassadors each month',
          free: <X className="w-5 h-5 text-gray-400" />,
          starter: '1 per month',
          scale: '3 per month',
          business: '10 per month'
        },
        {
          name: 'Additional introductions cost',
          info: 'Price to purchase extra introductions',
          free: '$59.99 each',
          starter: '$59.99 each',
          scale: '$59.99 each',
          business: '$59.99 each'
        },
        {
          name: 'Ambassador referrals',
          info: 'Get direct referrals to chapter contacts',
          free: <X className="w-5 h-5 text-gray-400" />,
          starter: '$99.99 each',
          scale: '$99.99 each',
          business: '$99.99 each'
        },
        {
          name: 'Introduction rollover',
          info: 'Unused introductions carry to next month',
          free: 'N/A',
          starter: <X className="w-5 h-5 text-gray-400" />,
          scale: <X className="w-5 h-5 text-gray-400" />,
          business: <Check className="w-5 h-5 text-green-600" />
        }
      ]
    },
    {
      category: 'Support & Services',
      features: [
        {
          name: 'Support level',
          info: 'How we help you',
          free: 'Community (Discord)',
          starter: 'Chat',
          scale: 'Priority chat',
          business: 'Account manager'
        },
        {
          name: 'Personal tech training',
          info: 'One-on-one platform training',
          free: <X className="w-5 h-5 text-gray-400" />,
          starter: '$150 / hour',
          scale: '1 hour / quarter included',
          business: '1 hour / month included'
        },
        {
          name: 'API access',
          info: 'Programmatic access to data',
          free: <X className="w-5 h-5 text-gray-400" />,
          starter: <X className="w-5 h-5 text-gray-400" />,
          scale: <Check className="w-5 h-5 text-green-600" />,
          business: <Check className="w-5 h-5 text-green-600" />
        },
        {
          name: 'Single sign-on (SSO)',
          info: 'Enterprise authentication',
          free: <X className="w-5 h-5 text-gray-400" />,
          starter: <X className="w-5 h-5 text-gray-400" />,
          scale: <X className="w-5 h-5 text-gray-400" />,
          business: <X className="w-5 h-5 text-gray-400" />
        }
      ]
    }
  ];

  const handleSubscriptionChange = async (tierId: string) => {
    if (tierId === currentTier) return;

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
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (error) {
      console.error('Failed to initiate subscription:', error);
      alert(`Failed to process subscription: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  const InfoTooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-block ml-1">
      <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
      <div className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
        {text}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/app/team" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">New subscription</h1>
            <button className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.name} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    index === 0
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {index === 0 ? (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    ) : (
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    index === 0 ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-12 h-0.5 bg-gray-300 mx-2 mb-6"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Billing Period Toggle */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-5 py-2 rounded-md font-medium transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
            }`}
          >
            Monthly billing
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={`px-5 py-2 rounded-md font-medium transition-all relative ${
              billingPeriod === 'annual'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
            }`}
          >
            Annual billing
          </button>
          <span className="text-sm text-green-600 font-semibold flex items-center gap-1">
            <Info className="w-4 h-4" />
            Save 10%
          </span>
        </div>

        {/* Current Plan Badge */}
        {currentTier !== 'trial' && (
          <div className="text-center mb-6">
            <div className="inline-block bg-blue-50 border border-blue-200 rounded-md px-4 py-2">
              <span className="text-sm text-blue-900 font-medium">CURRENT PLAN</span>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {pricingTiers.map((tier) => {
            const displayPrice = billingPeriod === 'annual' ? tier.annualPrice : tier.monthlyPrice;

            return (
              <div
                key={tier.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  tier.isCurrent
                    ? 'border-blue-600 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Color bar */}
                <div className={`h-1 ${
                  tier.id === 'trial' ? 'bg-orange-500' :
                  tier.id === 'monthly' ? 'bg-yellow-500' :
                  tier.id === 'enterprise' ? 'bg-blue-500' :
                  'bg-green-500'
                }`}></div>

                <div className="p-5">
                  {/* Plan Name & Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
                    {tier.badge && <span className="text-xl">{tier.badge}</span>}
                  </div>

                  {/* Price */}
                  <div className="mb-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">
                        ${displayPrice}
                      </span>
                      <span className="text-sm text-gray-600">/ month</span>
                    </div>
                    {billingPeriod === 'annual' && tier.price > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        ${(displayPrice * 12).toFixed(2)} billed annually
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4">{tier.description}</p>

                  {/* CTA Button */}
                  {tier.isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2 px-4 rounded-md bg-gray-100 text-gray-500 font-medium border border-gray-300 cursor-not-allowed"
                    >
                      Current plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscriptionChange(tier.id)}
                      className="w-full py-2 px-4 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                    >
                      Choose plan
                    </button>
                  )}

                  {/* Pricing info */}
                  <div className="mt-3 text-xs text-gray-600">
                    {tier.price > 0 ? (
                      <div>
                        <span className="font-medium">${tier.price}</span> then
                        <div className="font-medium text-gray-900">Pay as you go</div>
                      </div>
                    ) : (
                      <div className="h-8"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {featureRows.map((section, sectionIdx) => (
            <div key={section.category}>
              {/* Category Header */}
              <button
                onClick={() => setExpandedSection(
                  expandedSection === section.category ? null : section.category
                )}
                className="w-full bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-sm font-bold text-gray-900">{section.category}</h3>
                {expandedSection === section.category ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {/* Features */}
              {expandedSection === section.category && (
                <>
                  {section.features.map((feature, featureIdx) => (
                    <div
                      key={feature.name}
                      className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <span className="text-sm text-gray-700 font-medium">
                          {feature.name}
                        </span>
                        <InfoTooltip text={feature.info} />
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-700">
                        {typeof feature.free === 'string' ? feature.free : feature.free}
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-700">
                        {typeof feature.starter === 'string' ? feature.starter : feature.starter}
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-700">
                        {typeof feature.scale === 'string' ? feature.scale : feature.scale}
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-700">
                        {typeof feature.business === 'string' ? feature.business : feature.business}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a
              href="mailto:support@fraternitybase.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
