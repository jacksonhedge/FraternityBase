import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Mail, CheckCircle, Heart, ArrowLeft } from 'lucide-react';

const FraternityPendingApprovalPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check every 30 seconds if user has been approved
    const checkApprovalStatus = setInterval(() => {
      // User can manually refresh or we can auto-check
      console.log('Checking approval status...');
    }, 30000);

    return () => clearInterval(checkApprovalStatus);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Clock className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <Heart className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Waiting for Approval
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 text-center mb-8">
            Your chapter application is being reviewed
          </p>

          {/* Status Message */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">Application Submitted Successfully!</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Thank you for signing up with FraternityBase. Our team is reviewing your application
                  and will approve it shortly. You'll receive an email notification once your account is approved.
                </p>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="space-y-4 mb-8">
            <h3 className="font-bold text-gray-900 text-lg mb-4">What happens next?</h3>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Our team reviews your application</h4>
                <p className="text-sm text-gray-600">
                  We verify your chapter information and ensure everything is in order
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">You receive approval notification</h4>
                <p className="text-sm text-gray-600">
                  We'll send you an email as soon as your account is approved (usually within 24 hours)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Start connecting with brands</h4>
                <p className="text-sm text-gray-600">
                  Log in and browse partnership opportunities from brands looking to sponsor chapters like yours
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Reminder */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-gray-900">100% Free Forever</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                No sign-up fees
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                No listing fees
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                No connection fees
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Access to hundreds of brand partnerships
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Login
            </button>
            <button
              onClick={() => window.location.href = 'mailto:support@fraternitybase.com?subject=Approval Status Inquiry'}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Contact Support
            </button>
          </div>

          {/* Estimated Time */}
          <p className="text-center text-sm text-gray-500 mt-6">
            <strong>Average approval time:</strong> Less than 24 hours
          </p>
        </div>

        {/* Bottom Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Questions? Email us at{' '}
          <a href="mailto:support@fraternitybase.com" className="text-purple-600 hover:text-purple-700 font-medium">
            support@fraternitybase.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default FraternityPendingApprovalPage;
