import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Users, Heart, ArrowRight, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

type AccountType = 'brand' | 'fraternity' | 'ambassador' | null;

const SignUpPage = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<AccountType>(null);

  const handleSelectType = (type: AccountType) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType === 'brand') {
      navigate('/signup/brand');
    } else if (selectedType === 'fraternity') {
      navigate('/signup/fraternity');
    } else if (selectedType === 'ambassador') {
      navigate('/signup/ambassador');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              Sign up for FraternityBase
            </h1>
            <p className="text-2xl text-gray-700 font-medium">
              Connect brands with Greek life
            </p>
            <p className="text-lg text-gray-600 mt-2">
              Choose your account type to get started
            </p>
          </div>

          {/* Account Type Selection - PayPal Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Brand Account */}
            <button
              onClick={() => handleSelectType('brand')}
              className={`relative bg-white rounded-2xl p-8 shadow-lg border-4 transition-all hover:shadow-xl ${
                selectedType === 'brand'
                  ? 'border-blue-600'
                  : 'border-transparent hover:border-blue-200'
              }`}
            >
              {selectedType === 'brand' && (
                <div className="absolute top-4 left-4">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                </div>
              )}
              {selectedType !== 'brand' && (
                <div className="absolute top-4 left-4">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                </div>
              )}

              <div className="flex flex-col items-center text-center mt-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Brand</h2>
                <p className="text-gray-700 mb-4">
                  Find fraternities and ambassadors to promote your brand
                </p>
                <ul className="text-left space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Access 5,000+ Greek chapters nationwide</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Connect with verified campus ambassadors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Sponsor philanthropy events that matter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Track ROI with detailed analytics</span>
                  </li>
                </ul>
              </div>
            </button>

            {/* Fraternity Account */}
            <button
              onClick={() => handleSelectType('fraternity')}
              className={`relative bg-white rounded-2xl p-8 shadow-lg border-4 transition-all hover:shadow-xl ${
                selectedType === 'fraternity'
                  ? 'border-purple-600'
                  : 'border-transparent hover:border-purple-200'
              }`}
            >
              {selectedType === 'fraternity' && (
                <div className="absolute top-4 left-4">
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                </div>
              )}
              {selectedType !== 'fraternity' && (
                <div className="absolute top-4 left-4">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                </div>
              )}

              <div className="flex flex-col items-center text-center mt-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Fraternity</h2>
                <p className="text-gray-700 mb-4">
                  Find sponsors for your events
                </p>
                <ul className="text-left space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Browse sponsorship opportunities from top brands</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Apply for event sponsorships ($500-$5K)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Manage multiple philanthropy campaigns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Track fundraising goals and impact</span>
                  </li>
                </ul>
              </div>
            </button>

            {/* Ambassador Account */}
            <button
              onClick={() => handleSelectType('ambassador')}
              className={`relative bg-white rounded-2xl p-8 shadow-lg border-4 transition-all hover:shadow-xl ${
                selectedType === 'ambassador'
                  ? 'border-green-600'
                  : 'border-transparent hover:border-green-200'
              }`}
            >
              {selectedType === 'ambassador' && (
                <div className="absolute top-4 left-4">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                </div>
              )}
              {selectedType !== 'ambassador' && (
                <div className="absolute top-4 left-4">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                </div>
              )}

              <div className="flex flex-col items-center text-center mt-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Ambassador</h2>
                <p className="text-gray-700 mb-4">
                  Monetize your social following with brand partnerships
                </p>
                <ul className="text-left space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Get paid for social media promotions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Apply for brand ambassador programs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Flexible campaigns starting at $200</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Build your personal brand portfolio</span>
                  </li>
                </ul>
              </div>
            </button>
          </div>

          {/* Continue Button */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleContinue}
              disabled={!selectedType}
              className={`px-12 py-4 rounded-lg font-semibold text-lg transition-all flex items-center gap-3 ${
                selectedType
                  ? selectedType === 'brand'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    : selectedType === 'fraternity'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>

            {!selectedType && (
              <p className="text-sm text-gray-500">Please select an account type to continue</p>
            )}
          </div>

          {/* Login Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SignUpPage;
