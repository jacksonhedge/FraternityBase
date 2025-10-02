import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { CreditCard, Zap, TrendingUp, Award, Check } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  priceId: string;
  yearlyPriceId?: string;
  popular?: boolean;
  savings?: string;
  features: string[];
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    credits: 10,
    price: 0.99,
    priceId: import.meta.env.VITE_STRIPE_PRICE_TRIAL || 'price_trial',
    features: [
      '10 credits',
      'Test the platform',
      'Unlock 1 chapter',
      'Never expires'
    ]
  },
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 89,
    priceId: import.meta.env.VITE_STRIPE_PRICE_STARTER || 'price_starter',
    features: [
      '100 credits',
      'Unlock 10 chapters',
      'Basic contact access',
      'Never expires'
    ]
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    credits: 500,
    price: 339,
    priceId: import.meta.env.VITE_STRIPE_PRICE_POPULAR || 'price_1SCo7uGCEQehRVO2aeKPhB5D',
    popular: true,
    savings: 'Save 7%',
    features: [
      '500 credits',
      'Unlock 50 chapters',
      'Full contact access',
      'Priority support',
      'Never expires'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 5000,
    price: 0,
    priceId: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
    savings: 'Custom pricing',
    features: [
      '5,000+ credits',
      'Unlimited chapter unlocks',
      'Complete data access',
      'Dedicated support',
      'Custom integrations',
      'API access',
      'Never expires'
    ]
  }
];

export default function CreditsPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    // Fetch current credit balance
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/credits/balance`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setBalance(data.balance || 0);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const handlePurchase = async (packageId: string, priceId: string) => {
    setLoading(packageId);

    try {
      // Create checkout session
      const response = await fetch(`${import.meta.env.VITE_API_URL}/credits/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          packageId,
          priceId,
          companyId: user?.id,
          userEmail: user?.email
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Checkout response:', data);

      if (!data.url) {
        throw new Error('No checkout URL received');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Failed to initiate purchase. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Purchase Credits
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Unlock chapter data and gain competitive insights
          </p>

          {/* Current Balance */}
          <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-6 py-3">
            <Zap className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <div className="text-sm text-gray-600">Your Balance</div>
              <div className="text-2xl font-bold text-blue-600">{balance.toLocaleString()} credits</div>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isYearly ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
            </span>
            {isYearly && (
              <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Save 12%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                pkg.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
              )}

              <div className="p-6">
                {/* Package Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {pkg.name}
                </h3>

                {/* Pricing */}
                <div className="mb-4">
                  {pkg.id === 'enterprise' ? (
                    <>
                      <div className="text-2xl font-bold text-gray-900">
                        Contact Sales
                      </div>
                      {pkg.savings && (
                        <div className="text-sm font-semibold text-blue-600 mt-1">
                          {pkg.savings}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">
                          ${isYearly ? Math.round(pkg.price * 12 * 0.88) : pkg.price}
                        </span>
                        <span className="text-sm text-gray-500">
                          /{isYearly ? 'year' : 'month'}
                        </span>
                      </div>
                      {isYearly && (
                        <div className="text-sm font-semibold text-green-600 mt-1">
                          Save 12% (${Math.round(pkg.price * 12 * 0.12)}/year)
                        </div>
                      )}
                      {!isYearly && pkg.savings && (
                        <div className="text-sm font-semibold text-green-600 mt-1">
                          {pkg.savings}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Credits */}
                <div className="flex items-center gap-2 mb-4 py-3 px-4 bg-blue-50 rounded-lg">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-blue-600">
                    {isYearly ? 'To Be Determined' : `${pkg.credits.toLocaleString()} Credits`}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Purchase Button */}
                <button
                  onClick={() => pkg.id === 'enterprise' ? window.location.href = 'mailto:jacksonfitzgerald25@gmail.com?subject=Enterprise%20Plan%20Inquiry' : handlePurchase(pkg.id, pkg.priceId)}
                  disabled={loading === pkg.id}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                    pkg.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  } ${loading === pkg.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading === pkg.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      {pkg.id === 'enterprise' ? 'Contact Sales' : 'Purchase Now'}
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How Credits Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Purchase Credits</h3>
              <p className="text-sm text-gray-600">
                Choose a package that fits your needs. Credits never expire.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Unlock Data</h3>
              <p className="text-sm text-gray-600">
                Use credits to unlock chapter rosters, contact info, and more.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Grow Your Business</h3>
              <p className="text-sm text-gray-600">
                Connect with Greek life members and expand your reach.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ or Credit Costs */}
        <div className="mt-8 bg-gray-100 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Credit Costs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Chapter Roster (view only)</span>
              <span className="font-semibold text-gray-900">10 credits</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Officer Contacts</span>
              <span className="font-semibold text-gray-900">8 credits</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Full Chapter Contacts</span>
              <span className="font-semibold text-gray-900">50 credits</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Export to CSV</span>
              <span className="font-semibold text-gray-900">20 credits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}