import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  Unlock,
  Handshake,
  UserPlus,
  Sparkles,
  Crown,
  Star,
  ArrowLeft,
  Check,
  TrendingUp,
  Zap,
  Shield
} from 'lucide-react';

const CreditSystemPage = () => {
  const [subscriptionTier, setSubscriptionTier] = useState<string>('trial');

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
          setSubscriptionTier(data.subscriptionTier?.toLowerCase() || 'trial');
        }
      } catch (error) {
        console.error('Failed to fetch subscription tier:', error);
      }
    };

    fetchSubscriptionTier();
  }, []);

  const isEnterprise = subscriptionTier === 'enterprise';

  const pricingItems = [
    {
      id: 'chapter-5star',
      name: '5.0⭐ Premium Chapter Unlock',
      icon: Crown,
      color: 'from-yellow-500 to-amber-600',
      bgColor: 'from-yellow-50 to-amber-50',
      credits: isEnterprise ? 5 : 10,
      originalCredits: 10,
      description: 'Top-tier chapters with verified data',
      features: [
        'Full officer roster with contact info',
        'Complete member list with LinkedIn profiles',
        'Chapter house address & social media',
        'GPA data & historical records',
        'Verified, premium quality data'
      ],
      badge: isEnterprise ? '50% OFF' : null,
      isPremium: true
    },
    {
      id: 'chapter-4.5star',
      name: '4.5⭐ High-Quality Chapter Unlock',
      icon: Star,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      credits: 7,
      description: 'Highly active chapters with strong engagement',
      features: [
        'Full officer roster with contact info',
        'Complete member list',
        'Chapter details & social links',
        'Event history & GPA data'
      ]
    },
    {
      id: 'chapter-4star',
      name: '4.0⭐ Quality Chapter Unlock',
      icon: Unlock,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      credits: 5,
      description: 'Solid chapters with verified information',
      features: [
        'Officer contact information',
        'Member roster',
        'Chapter basic details',
        'Social media links'
      ]
    },
    {
      id: 'chapter-3.5star',
      name: '3.5⭐ Standard Chapter Unlock',
      icon: Unlock,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'from-gray-50 to-gray-100',
      credits: 3,
      description: 'Established chapters with basic data',
      features: [
        'Officer names & emails',
        'Basic member list',
        'Chapter information'
      ]
    },
    {
      id: 'chapter-3star',
      name: '3.0⭐ Basic Chapter Unlock',
      icon: Unlock,
      color: 'from-gray-400 to-gray-500',
      bgColor: 'from-gray-50 to-gray-100',
      credits: 2,
      description: 'Growing chapters with limited data',
      features: [
        'Primary contact information',
        'Basic chapter details'
      ]
    },
    {
      id: 'chapter-budget',
      name: 'Below 3.0⭐ Budget Chapter',
      icon: Unlock,
      color: 'from-gray-300 to-gray-400',
      bgColor: 'from-gray-50 to-gray-100',
      credits: 1,
      description: 'Smaller/newer chapters',
      features: [
        'Limited contact data',
        'Basic information'
      ]
    },
    {
      id: 'warm-intro',
      name: 'Warm Introduction',
      icon: Handshake,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'from-indigo-50 to-indigo-100',
      credits: 200,
      description: 'Personal introduction to chapter leadership',
      features: [
        'Personal email introduction from our team',
        '70% response rate (vs 10% cold outreach)',
        'Follow-up coordination included',
        'Much higher success than cold outreach'
      ]
    },
    {
      id: 'ambassador',
      name: 'Ambassador Connection',
      icon: UserPlus,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'from-pink-50 to-pink-100',
      credits: 333,
      description: 'Get matched with chapter influencer for campaigns',
      features: [
        'Matched with verified ambassador',
        'Influencer campaign coordination',
        'Social media reach metrics',
        'Campaign performance tracking'
      ]
    },
    {
      id: 'diamond-unlock',
      name: '💎 Diamond Unlock (Full Roster)',
      icon: Crown,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'from-cyan-50 to-blue-50',
      credits: 0,
      description: 'Enterprise Tier 2 exclusive - complete member data',
      features: [
        'Complete member roster with full contact info',
        'All officer details with direct contacts',
        'Historical member data & LinkedIn profiles',
        'Chapter analytics & GPA records',
        'Only available with Enterprise Tier 2 subscription',
        '10 Diamond unlocks included per month'
      ],
      badge: 'ENTERPRISE ONLY',
      isPremium: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Back Button */}
        <Link
          to="/app/team"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Team & Billing
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Coins className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Credit System Guide
            </span>
          </h1>
          <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
            Understand how credits work and what each service costs. Paid subscribers get monthly unlock allowances that are used first - credits are only consumed when your subscription unlocks are exhausted.
          </p>

          {/* Current Tier Badge */}
          {isEnterprise && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full shadow-lg mb-6">
              <Crown className="w-5 h-5" />
              <span className="font-bold">Enterprise Member</span>
              <span className="text-sm opacity-90">- Enjoy 50% off 5.0⭐ chapters!</span>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            How Credits Work
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Coins className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Purchase Credits</h3>
                <p className="text-sm text-gray-600">Buy credit packages anytime - subscription unlocks are always used first</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Never Expire</h3>
                <p className="text-sm text-gray-600">Credits never expire - use them whenever you're ready</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Pay for Value</h3>
                <p className="text-sm text-gray-600">Only spend credits when subscription unlocks are exhausted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {pricingItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`relative bg-white rounded-xl shadow-md border transition-all duration-300 hover:shadow-xl ${
                  item.isPremium ? 'border-yellow-300 shadow-yellow-100' : 'border-gray-100'
                }`}
              >
                {item.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className={`${
                      item.badge === '50% OFF'
                        ? 'bg-gradient-to-r from-green-600 to-green-700'
                        : 'bg-gradient-to-r from-yellow-500 to-amber-600'
                    } text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
                      {item.badge}
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className={`p-4 bg-gradient-to-r ${item.bgColor} rounded-t-xl`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        {item.originalCredits && item.credits !== item.originalCredits && (
                          <span className="text-lg text-gray-400 line-through">
                            {item.originalCredits}
                          </span>
                        )}
                        <span className="text-3xl font-bold text-gray-900">
                          {item.credits}
                        </span>
                        <span className="text-sm text-gray-600">credits</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>

                {/* Features */}
                <div className="p-4">
                  <div className="space-y-2">
                    {item.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ / Additional Info */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg border border-blue-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Pro Tips</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">Subscription Unlocks First</h3>
              <p className="text-sm text-gray-600">
                With a paid subscription (Team or Enterprise), your monthly unlock allowances are always used first. Credits are only consumed when you've exhausted your subscription unlocks for that tier.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">Graduated Pricing = Fair Value</h3>
              <p className="text-sm text-gray-600">
                Pay based on chapter quality. Top-tier 5.0⭐ chapters cost 10 credits (or use 1 subscription unlock), while smaller chapters cost as little as 1 credit.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">Platinum Chapters = Premium Quality</h3>
              <p className="text-sm text-gray-600">
                Platinum chapters are pre-vetted partners we've worked with before. Warm intros cost 100 credits (vs 75 for standard chapters) with a 70% response rate and verified data.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">Enterprise Tier 1 Benefits</h3>
              <p className="text-sm text-gray-600">
                Enterprise Tier 1 subscribers get 3 Premium (5.0⭐), 25 Quality (4.0-4.9⭐), and 50 Standard (3.0-3.9⭐) fraternity chapter unlocks monthly, plus 100 credits, 3 warm intros, 10 team seats, and API access.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">Enterprise Tier 2 Benefits ($2,222/mo)</h3>
              <p className="text-sm text-gray-600">
                Enterprise Tier 2 subscribers get 50 Premium (5.0⭐) fraternity unlocks monthly, 10 Diamond unlocks (full roster data access), 500 monthly credits, 10 warm intros, 50 team seats, and API access. Note: Fraternities only - bars and sororities sold separately.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">Team Plan Benefits</h3>
              <p className="text-sm text-gray-600">
                Team subscribers get 50 monthly credits, 1 warm introduction, 3 team seats, and advanced search. Purchase chapter unlocks as needed using credits.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">Credits Never Expire</h3>
              <p className="text-sm text-gray-600">
                Buy credits anytime and use them when you're ready. Perfect as a backup when you've used all your subscription unlocks. No rush, no pressure, no expiration dates.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            to="/app/team"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            Buy Credits
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreditSystemPage;
