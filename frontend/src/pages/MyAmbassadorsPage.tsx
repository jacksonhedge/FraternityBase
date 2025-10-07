import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Star,
  TrendingUp
} from 'lucide-react';

const MyAmbassadorsPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Ambassadors</h1>
          <p className="text-gray-600 mt-1">
            Manage your unlocked student ambassadors and brand partners
          </p>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {isCollapsed ? (
            <>
              <ChevronDown className="w-4 h-4" />
              Expand
            </>
          ) : (
            <>
              <ChevronUp className="w-4 h-4" />
              Collapse
            </>
          )}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Stats Overview - Compact Version */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">0</p>
                <p className="text-xs text-gray-600 mt-1">Total Ambassadors</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-xs text-gray-600 mt-1">Active Campaigns</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-xs text-gray-600 mt-1">Credits Spent</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">0</p>
                <p className="text-xs text-gray-600 mt-1">Avg Rating</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Unlocked Ambassadors List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Unlocked Ambassadors</h2>
        <div className="text-center py-12 text-gray-500">
          <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-medium mb-2">No ambassadors unlocked yet</p>
          <p className="text-sm mb-4">Start unlocking student ambassadors to build your campus marketing network</p>
          <Link
            to="/app/ambassadors"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Browse Ambassadors
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* What You Can Do Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Student Profiles</h3>
          </div>
          <p className="text-sm text-gray-700">
            Access detailed profiles with contact info, skills, and experience
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Brand Partnerships</h3>
          </div>
          <p className="text-sm text-gray-700">
            Connect with students ready to represent your brand on campus
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Track Performance</h3>
          </div>
          <p className="text-sm text-gray-700">
            Monitor campaign results and ambassador performance metrics
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyAmbassadorsPage;
