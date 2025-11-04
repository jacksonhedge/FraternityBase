import { Check, X, ArrowRight, Zap, Building2, Mail, CreditCard, Landmark, DollarSign, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MarketplacePricingPage = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [standardSeats, setStandardSeats] = useState(1);
  const [enterpriseSeats, setEnterpriseSeats] = useState(1);

  // Pricing constants
  const STANDARD_PRICE_MONTHLY = 99;
  const ANNUAL_DISCOUNT = 0.20; // 20% off for annual

  const calculatePrice = (seats: number, cycle: 'monthly' | 'annual') => {
    const monthlyTotal = STANDARD_PRICE_MONTHLY * seats;
    if (cycle === 'annual') {
      const annualTotal = monthlyTotal * 12 * (1 - ANNUAL_DISCOUNT);
      return {
        total: annualTotal,
        perMonth: annualTotal / 12,
        savings: monthlyTotal * 12 - annualTotal
      };
    }
    return {
      total: monthlyTotal,
      perMonth: monthlyTotal,
      savings: 0
    };
  };

  const standardPricing = calculatePrice(standardSeats, billingCycle);

  const handleSubscribe = async (tier: 'standard' | 'enterprise') => {
    if (tier === 'enterprise') {
      // Redirect to contact sales with seat count
      window.location.href = `mailto:sales@fraternitybase.com?subject=Enterprise%20Plan%20Inquiry&body=I'm%20interested%20in%20${enterpriseSeats}%20seats%20for%20the%20Enterprise%20plan.`;
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

      const response = await fetch(`${API_URL}/marketplace/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: 'standard',
          paymentMethod: 'stripe',
          billingCycle: billingCycle,
          seats: standardSeats
        })
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        alert('Failed to create checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-900">Marketplace Pricing</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Connect with Top Fraternities
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Access 5,000+ verified fraternity chapters. Simple, transparent pricing for businesses.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-4 bg-white rounded-full p-2 shadow-lg border-2 border-purple-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Standard Plan */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-200 overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Standard</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-5xl font-bold">
                  ${Math.round(standardPricing.perMonth)}
                </span>
                <span className="text-xl opacity-90">/month</span>
              </div>
              {billingCycle === 'annual' && (
                <div className="space-y-1">
                  <p className="text-purple-100 text-sm">
                    ${Math.round(standardPricing.total)}/year
                  </p>
                  <p className="text-green-200 text-sm font-semibold">
                    Save ${Math.round(standardPricing.savings)}/year
                  </p>
                </div>
              )}
              <p className="text-purple-100 mt-3">Perfect for growing brands</p>
            </div>

            <div className="p-8">
              {/* Seat Selection */}
              <div className="mb-6 bg-purple-50 rounded-xl p-4">
                <label className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  Number of Seats
                </label>
                <select
                  value={standardSeats}
                  onChange={(e) => setStandardSeats(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {[1, 2, 3, 4].map(num => (
                    <option key={num} value={num}>
                      {num} seat{num > 1 ? 's' : ''} - ${num * STANDARD_PRICE_MONTHLY}/mo
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-2">
                  Up to 4 team members can access your account
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Unlimited Browsing</p>
                    <p className="text-sm text-gray-600">Browse all 5,000+ fraternity chapters</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Apply to Partnerships</p>
                    <p className="text-sm text-gray-600">Submit unlimited partnership applications</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Direct Communication</p>
                    <p className="text-sm text-gray-600">Message fraternities directly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Partnership Dashboard</p>
                    <p className="text-sm text-gray-600">Track all active partnerships</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Analytics & Insights</p>
                    <p className="text-sm text-gray-600">ROI tracking and performance metrics</p>
                  </div>
                </div>
              </div>

              {/* Commission Structure */}
              <div className="bg-purple-50 rounded-xl p-6 mb-6">
                <h4 className="font-bold text-gray-900 mb-4">Commission Structure</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Fixed-Price Deals</span>
                    <span className="font-bold text-purple-900">15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">CPA Deals</span>
                    <span className="font-bold text-purple-900">20%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-4">
                  Commission only applies to successful partnerships
                </p>
              </div>

              <button
                onClick={() => handleSubscribe('standard')}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl border-2 border-gray-700 overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Enterprise</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">Custom</span>
              </div>
              <p className="text-yellow-100 mt-3">For large-scale campaigns</p>
            </div>

            <div className="p-8">
              {/* Seat Selection */}
              <div className="mb-6 bg-gray-700 rounded-xl p-4">
                <label className="flex items-center gap-2 font-semibold text-white mb-3">
                  <Users className="w-5 h-5 text-yellow-400" />
                  Number of Seats
                </label>
                <select
                  value={enterpriseSeats}
                  onChange={(e) => setEnterpriseSeats(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-600 border-2 border-gray-500 rounded-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>
                      {num} seat{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-2">
                  Up to 10 team members can access your account
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Everything in Standard</p>
                    <p className="text-sm text-gray-400">Plus enterprise features</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Dedicated Account Manager</p>
                    <p className="text-sm text-gray-400">Personal support and guidance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Custom Commission Rates</p>
                    <p className="text-sm text-gray-400">Negotiable based on volume</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">API Access</p>
                    <p className="text-sm text-gray-400">Integrate FraternityBase into your platform</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Priority Support</p>
                    <p className="text-sm text-gray-400">24/7 dedicated support line</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">White-Label Options</p>
                    <p className="text-sm text-gray-400">Customize branding for your campaigns</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSubscribe('enterprise')}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 font-bold rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Contact Sales
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Payment Methods</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Stripe - Active */}
            <div className="flex flex-col items-center p-6 border-2 border-purple-200 rounded-xl bg-purple-50">
              <CreditCard className="w-12 h-12 text-purple-600 mb-3" />
              <h4 className="font-bold text-gray-900 mb-2">Credit Card</h4>
              <p className="text-sm text-gray-600 text-center mb-3">Pay with Visa, Mastercard, Amex</p>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                Available Now
              </span>
            </div>

            {/* Bank Transfer - Coming Soon */}
            <div className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-xl bg-gray-50 opacity-60">
              <Landmark className="w-12 h-12 text-gray-400 mb-3" />
              <h4 className="font-bold text-gray-700 mb-2">Bank Transfer</h4>
              <p className="text-sm text-gray-500 text-center mb-3">Direct ACH payments</p>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                Coming Soon
              </span>
            </div>

            {/* Bankroll - Coming Soon */}
            <div className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-xl bg-gray-50 opacity-60">
              <DollarSign className="w-12 h-12 text-gray-400 mb-3" />
              <h4 className="font-bold text-gray-700 mb-2">Bankroll</h4>
              <p className="text-sm text-gray-500 text-center mb-3">Crypto & modern payments</p>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h4 className="font-bold text-gray-900 mb-3">How does pricing work?</h4>
              <p className="text-gray-600">
                You pay a monthly or annual subscription ($99/month/seat for Standard) to access the marketplace.
                Additionally, we charge a small commission only when a partnership is successful: 15% for fixed-price
                deals and 20% for CPA deals.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h4 className="font-bold text-gray-900 mb-3">Can I add more seats later?</h4>
              <p className="text-gray-600">
                Yes! You can upgrade your seat count at any time. Standard plans support up to 4 seats,
                and Enterprise plans support up to 10 seats.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h4 className="font-bold text-gray-900 mb-3">What's included in the annual plan?</h4>
              <p className="text-gray-600">
                The annual plan includes all the same features as monthly billing, but you save 20% by
                paying upfront for the year.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h4 className="font-bold text-gray-900 mb-3">Can I cancel anytime?</h4>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. Monthly plans can be canceled at the end
                of your billing cycle. Annual plans are non-refundable but remain active until the end of your term.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h4 className="font-bold text-gray-900 mb-3">What's the difference between Standard and Enterprise?</h4>
              <p className="text-gray-600">
                Enterprise includes everything in Standard plus dedicated account management, custom commission rates,
                API access, priority support, and white-label options. It also supports up to 10 seats compared to 4 for Standard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePricingPage;
