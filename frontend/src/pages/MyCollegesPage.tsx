import { Building2, MapPin, Users, GraduationCap, Unlock, Lock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyCollegesPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Colleges</h1>
          <p className="text-gray-600 mt-1">
            View colleges you've unlocked and their chapter networks
          </p>
        </div>
        <Link
          to="/app/colleges"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Lock className="w-4 h-4" />
          Unlock More
        </Link>
      </div>

      {/* Coming Soon State */}
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-lg">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-12 h-12 text-blue-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            My Colleges Coming Soon
          </h2>

          <p className="text-lg text-gray-600 mb-8">
            Track colleges you've unlocked and see all their Greek Life chapters in one place.
            This feature is currently in development.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Campus Overview</h3>
              <p className="text-sm text-gray-600">See all chapters at each college</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Network View</h3>
              <p className="text-sm text-gray-600">View contacts across all chapters</p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              to="/app/my-chapters"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <GraduationCap className="w-5 h-5" />
              View My Chapters Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCollegesPage;
