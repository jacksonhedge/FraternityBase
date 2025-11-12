import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Users,
  Award,
  CheckCircle,
  Briefcase,
  Target,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

const GetSponsoredPage = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Earn Money for Your Chapter",
      description: "Connect with businesses willing to pay $500-$5,000+ for partnerships and sponsorships"
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Partnership Opportunities",
      description: "Local bars, restaurants, brands, and businesses actively seeking Greek partnerships"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "You Choose the Partnerships",
      description: "Review requests, set your own rates, and only accept partnerships that fit your chapter"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Trusted Platform",
      description: "All payments handled securely through Stripe. Your chapter gets paid directly."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Quick Setup",
      description: "Create your chapter profile in 5 minutes. Start receiving partnership requests immediately."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Build Your Brand",
      description: "Showcase your chapter to businesses and grow your social media presence"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Create Your Chapter Profile",
      description: "Sign up and add your chapter details, social media, and partnership preferences"
    },
    {
      step: "2",
      title: "Get Discovered",
      description: "Businesses browse our marketplace and find chapters that match their target audience"
    },
    {
      step: "3",
      title: "Review Partnership Requests",
      description: "Receive requests with compensation offers. Review and accept the ones you like."
    },
    {
      step: "4",
      title: "Get Paid",
      description: "Complete the partnership activities and receive payment directly to your chapter account"
    }
  ];

  const partnershipTypes = [
    "Event Sponsorships",
    "Social Media Promotions",
    "Bar & Restaurant Partnerships",
    "Brand Ambassadorships",
    "Merchandise Collaborations",
    "Fundraising Events",
    "Campus Activations",
    "Product Launches"
  ];

  const testimonials = [
    {
      chapter: "Sigma Alpha Epsilon",
      university: "University of Illinois",
      quote: "We've earned over $10,000 through FraternityBase partnerships this semester alone!",
      amount: "$10,000+"
    },
    {
      chapter: "Delta Tau Delta",
      university: "Penn State",
      quote: "The platform makes it so easy to connect with local businesses and earn money for philanthropy.",
      amount: "$7,500+"
    },
    {
      chapter: "Phi Delta Theta",
      university: "Ohio State",
      quote: "We get multiple partnership requests every week. It's completely changed our chapter's finances.",
      amount: "$15,000+"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative z-0">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <div className="text-8xl mb-4">🤝</div>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            Get Your Org Sponsored
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Connect with businesses willing to pay <span className="font-bold text-yellow-300">$500-$5,000+</span> for
            partnerships with your fraternity, sorority, or student organization. 100% free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/signup/fraternity')}
              className="px-8 py-4 bg-yellow-400 text-indigo-900 font-bold text-lg rounded-xl hover:bg-yellow-300 transition-all shadow-2xl hover:shadow-yellow-400/50 hover:scale-105 transform duration-300 flex items-center gap-2"
            >
              <Zap className="w-6 h-6" />
              Sign Up Free - Get Sponsored
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white text-white font-semibold text-lg rounded-xl hover:bg-white/30 transition-all"
            >
              Learn How It Works
            </button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-8 text-white text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>100% Free for Orgs</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>No Hidden Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>You Set Your Rates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">$2,500</div>
              <div className="text-gray-600">Average Partnership Value</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">Active Businesses</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">$250K+</div>
              <div className="text-gray-600">Paid to Chapters</div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Student Orgs Love FraternityBase
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The easiest way to fund your organization's activities, philanthropy, and events
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Start earning money for your chapter in 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-yellow-400 text-indigo-900 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-indigo-100">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/signup/fraternity')}
              className="px-8 py-4 bg-yellow-400 text-indigo-900 font-bold text-lg rounded-xl hover:bg-yellow-300 transition-all shadow-2xl hover:shadow-yellow-400/50 hover:scale-105 transform duration-300"
            >
              Get Started - It's Free
            </button>
          </div>
        </div>
      </div>

      {/* Partnership Types */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Partnership Opportunities
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Businesses are looking for chapters to partner on all types of activations
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {partnershipTypes.map((type, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 text-center border-2 border-indigo-200 hover:border-indigo-400 transition-all"
            >
              <div className="font-semibold text-gray-900">{type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Chapters Are Already Earning
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join hundreds of chapters generating revenue through partnerships
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg border-t-4 border-green-500"
              >
                <div className="text-3xl font-bold text-green-600 mb-4">{testimonial.amount}</div>
                <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
                <div className="border-t pt-4">
                  <div className="font-bold text-gray-900">{testimonial.chapter}</div>
                  <div className="text-sm text-gray-600">{testimonial.university}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Is it really free for chapters?</h3>
            <p className="text-gray-600">
              Yes! 100% free. We charge businesses a platform fee, but your organization keeps 100% of the compensation you negotiate.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-2">How much can we earn?</h3>
            <p className="text-gray-600">
              Partnership values typically range from $500-$5,000 depending on the type of partnership and your org's size/engagement. Some organizations earn $10,000+ per semester.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-2">How do we get paid?</h3>
            <p className="text-gray-600">
              You'll add your organization's bank account or payment method during setup. After completing a partnership, funds are transferred directly to your account via Stripe.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-2">What types of partnerships are available?</h3>
            <p className="text-gray-600">
              Event sponsorships, social media promotions, bar/restaurant partnerships, brand ambassadorships, merchandise collabs, and more. You choose what fits your organization.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Can we reject partnership requests?</h3>
            <p className="text-gray-600">
              Absolutely! You're in complete control. Review each request, and only accept partnerships that align with your organization's values and interests.
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join hundreds of student organizations already generating revenue through FraternityBase partnerships
          </p>
          <button
            onClick={() => navigate('/signup/fraternity')}
            className="px-10 py-5 bg-yellow-400 text-indigo-900 font-bold text-xl rounded-xl hover:bg-yellow-300 transition-all shadow-2xl hover:shadow-yellow-400/50 hover:scale-105 transform duration-300 flex items-center gap-3 mx-auto"
          >
            <Zap className="w-6 h-6" />
            Sign Up Free - Get Sponsored
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetSponsoredPage;
