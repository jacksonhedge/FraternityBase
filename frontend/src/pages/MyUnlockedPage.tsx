import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  Utensils,
  Unlock,
  ArrowRight,
  Users,
  MapPin,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const MyUnlockedPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Unlocked</h1>
          <p className="text-gray-600 mt-1">
            Access all your unlocked chapters, colleges, and venues
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
          {/* Three Main Buttons - Compact Version */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* My Chapters */}
            <Link
              to="/app/my-chapters"
              className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg p-4 border border-blue-200 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900">Chapters</h2>
                  <p className="text-xs text-gray-600">0 Unlocked</p>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* My Colleges */}
            <Link
              to="/app/my-colleges"
              className="group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg p-4 border border-purple-200 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900">Colleges</h2>
                  <p className="text-xs text-gray-600">0 Unlocked</p>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* My Bars - Coming Soon */}
            <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200 opacity-75">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900">Bars & Restaurants</h2>
                  <p className="text-xs text-yellow-700 font-semibold">COMING SOON</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview - Compact Version */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-xs text-gray-600 mt-1">Total Unlocks</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-xs text-gray-600 mt-1">Credits Spent</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">0</p>
                <p className="text-xs text-gray-600 mt-1">Total Contacts</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">0</p>
                <p className="text-xs text-gray-600 mt-1">Partnerships</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Unlocked Chapters List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Unlocked Chapters</h2>
        <div className="text-center py-12 text-gray-500">
          <Unlock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-medium mb-2">No chapters unlocked yet</p>
          <p className="text-sm mb-4">Start unlocking chapters to build your partnership network</p>
          <Link
            to="/app/chapters"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Chapters
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyUnlockedPage;
