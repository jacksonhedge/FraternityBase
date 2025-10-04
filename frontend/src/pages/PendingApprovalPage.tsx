import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    checkApprovalStatus();
    // Check every 30 seconds if approved
    const interval = setInterval(checkApprovalStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkApprovalStatus = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      setUserEmail(user.email || '');

      // Get user profile and company
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, company_id, companies(name, approval_status)')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setUserName(`${profile.first_name} ${profile.last_name}`);

        if (profile.companies) {
          setCompanyName(profile.companies.name);

          // If approved, redirect to dashboard
          if (profile.companies.approval_status === 'approved') {
            navigate('/app/dashboard');
          }
        }
      }
    } catch (error) {
      console.error('Error checking approval status:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            {/* Icon */}
            <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Account Pending Approval
            </h1>

            {/* Message */}
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Thank you for signing up, <span className="font-semibold">{userName}</span>!
              Your account for <span className="font-semibold">{companyName}</span> is currently being reviewed by our team.
            </p>

            {/* Status Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
              <div className="space-y-3 text-left max-w-md mx-auto">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    We'll review your company information within 24 hours
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    You'll receive an email at <span className="font-medium">{currentUser.email}</span> once approved
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    After approval, you'll have full access to your 14-day free trial
                  </p>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="bg-gray-50 rounded-lg p-6 text-left mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">Your Submission</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Company:</dt>
                  <dd className="text-sm font-medium text-gray-900">{companyName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Email:</dt>
                  <dd className="text-sm font-medium text-gray-900">{userEmail}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Status:</dt>
                  <dd className="text-sm font-medium text-yellow-600">Pending Review</dd>
                </div>
              </dl>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleLogout}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Log Out
              </button>
              <button
                onClick={checkApprovalStatus}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Check Status
              </button>
            </div>

            {/* Why We Review */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3 text-sm text-gray-700">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>
                  <span className="font-semibold">Why manual approval?</span> We review all companies to protect our Greek organization partners from spam and ensure legitimate business use only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;