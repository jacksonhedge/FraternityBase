import { Briefcase, Users, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyAmbassadorsPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="max-w-2xl text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
            <Briefcase className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Ambassadors</h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full mb-6">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Coming Soon</span>
          </div>
        </div>

        <p className="text-xl text-gray-600 mb-8">
          Connect with student ambassadors who are open to hiring or working with brands
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <Users className="w-8 h-8 text-primary-600 mb-3 mx-auto" />
            <h3 className="font-semibold text-gray-900 mb-2">Student Profiles</h3>
            <p className="text-sm text-gray-600">
              Access detailed profiles of student ambassadors from top Greek organizations
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <Briefcase className="w-8 h-8 text-primary-600 mb-3 mx-auto" />
            <h3 className="font-semibold text-gray-900 mb-2">Brand Partnerships</h3>
            <p className="text-sm text-gray-600">
              Find students ready to represent your brand on campus
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <TrendingUp className="w-8 h-8 text-primary-600 mb-3 mx-auto" />
            <h3 className="font-semibold text-gray-900 mb-2">Direct Outreach</h3>
            <p className="text-sm text-gray-600">
              Connect directly with ambassadors for collaborations and campaigns
            </p>
          </div>
        </div>

        <button
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-not-allowed opacity-50"
          disabled
        >
          Browse Ambassadors
        </button>
      </div>
    </div>
  );
};

export default MyAmbassadorsPage;
