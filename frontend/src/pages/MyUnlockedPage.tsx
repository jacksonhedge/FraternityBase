import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  Utensils,
  Unlock,
  ArrowRight,
  Users,
  MapPin
} from 'lucide-react';

const MyUnlockedPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Unlocked</h1>
        <p className="text-gray-600 mt-1">
          Access all your unlocked chapters, colleges, and venues
        </p>
      </div>

      {/* Three Main Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* My Chapters */}
        <Link
          to="/app/my-chapters"
          className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg p-8 border border-blue-200 transition-all duration-200 hover:shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <ArrowRight className="w-6 h-6 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chapters</h2>
          <p className="text-gray-700 mb-4">
            View all unlocked Greek Life chapters and their leadership contacts
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Unlock className="w-4 h-4" />
              <span>0 Unlocked</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>0 Contacts</span>
            </div>
          </div>
        </Link>

        {/* My Colleges */}
        <Link
          to="/app/my-colleges"
          className="group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg p-8 border border-purple-200 transition-all duration-200 hover:shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <ArrowRight className="w-6 h-6 text-purple-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Colleges</h2>
          <p className="text-gray-700 mb-4">
            Browse colleges you've unlocked and their Greek Life networks
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Unlock className="w-4 h-4" />
              <span>0 Unlocked</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>0 Campuses</span>
            </div>
          </div>
        </Link>

        {/* My Bars - Coming Soon */}
        <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-8 border border-orange-200 opacity-75">
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 text-xs font-semibold rounded-full text-yellow-700 bg-yellow-100">
              COMING SOON
            </span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-600 rounded-lg">
              <Utensils className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bars & Restaurants</h2>
          <p className="text-gray-700 mb-4">
            Track venues you've unlocked for sponsorship opportunities
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Unlock className="w-4 h-4" />
              <span>Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-600 mt-1">Total Unlocks</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-600 mt-1">Credits Spent</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-600 mt-1">Total Contacts</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-3xl font-bold text-orange-600">0</p>
            <p className="text-sm text-gray-600 mt-1">Active Partnerships</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyUnlockedPage;
