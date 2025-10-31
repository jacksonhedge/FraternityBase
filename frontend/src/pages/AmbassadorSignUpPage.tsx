import { Link } from 'react-router-dom';
import { Rocket, ArrowLeft, Bell, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AmbassadorSignUpPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Coming Soon Content */}
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-6">
              <Rocket className="w-10 h-10 text-green-600" />
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Campus Ambassadors
            </h1>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Coming Soon!
            </h2>

            {/* Message */}
            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
              We're building an amazing platform for campus ambassadors to monetize their social media presence and connect with top brands.
            </p>

            {/* Features Preview */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                What's coming for ambassadors:
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Get paid for social media promotions ($200+ per campaign)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Apply for exclusive brand ambassador programs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Connect with top brands in sports betting, fashion, and more</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Build your personal brand portfolio</span>
                </li>
              </ul>
            </div>

            {/* Notify Me */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 justify-center mb-3">
                <Bell className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Want to be notified when we launch?</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Join our waitlist and be the first to know when ambassador sign-ups open!
              </p>
              <a
                href="mailto:hello@fraternitybase.com?subject=Ambassador Waitlist&body=I'm interested in becoming a campus ambassador!"
                className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
              >
                Join Waitlist
              </a>
            </div>

            {/* Back Link */}
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign Up Options
            </Link>
          </div>

          {/* Already have account */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Looking for something else?{' '}
              <Link to="/signup/fraternity" className="text-purple-600 hover:text-purple-700 font-medium">
                Sign up as a Fraternity
              </Link>
              {' or '}
              <Link to="/signup/brand" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up as a Brand
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AmbassadorSignUpPage;
