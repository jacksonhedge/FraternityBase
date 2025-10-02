import { Utensils, MapPin, Star, Lock, Unlock, Building2, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyBarsPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bars & Restaurants</h1>
          <p className="text-gray-600 mt-1">
            View venues you've unlocked and partnership opportunities
          </p>
        </div>
        <Link
          to="/app/bars"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Lock className="w-4 h-4" />
          Unlock More
        </Link>
      </div>

      {/* Coming Soon State */}
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-lg">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Utensils className="w-12 h-12 text-orange-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            My Venues Coming Soon
          </h2>

          <p className="text-lg text-gray-600 mb-8">
            Track bars and restaurants you've connected with for sponsorships and partnerships.
            This feature is currently in development.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Location Data</h3>
              <p className="text-sm text-gray-600">Venues near your chapters</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Partnerships</h3>
              <p className="text-sm text-gray-600">Track sponsorship deals</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <Unlock className="w-6 h-6 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Contact Info</h3>
              <p className="text-sm text-gray-600">Direct venue connections</p>
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

export default MyBarsPage;
