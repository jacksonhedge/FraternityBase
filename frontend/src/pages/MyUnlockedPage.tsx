import { useState, useEffect } from 'react';
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
  ChevronUp,
  Star
} from 'lucide-react';
import { getCollegeLogoWithFallback } from '../utils/collegeLogos';

interface UnlockedChapter {
  id: string;
  name: string;
  chapter: string;
  university: string;
  state: string;
  memberCount: number;
  unlockedTypes: string[];
  chapterScore?: number;
}

const MyUnlockedPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [unlockedChapters, setUnlockedChapters] = useState<UnlockedChapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 === MY UNLOCKED PAGE: FETCHING DATA ===');
    fetchUnlockedData();
  }, []);

  const fetchUnlockedData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');

      console.log('📍 API_URL:', API_URL);
      console.log('🔑 Token exists:', !!token);

      if (!token) {
        console.error('❌ No authentication token found');
        setLoading(false);
        return;
      }

      const url = `${API_URL}/chapters/unlocked`;
      console.log('📤 Fetching from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response not OK:', errorText);
        throw new Error('Failed to fetch unlocked chapters');
      }

      const result = await response.json();
      console.log('📊 Raw result from API:', JSON.stringify(result, null, 2));
      console.log('📊 result.success:', result.success);
      console.log('📊 result.data:', result.data);
      console.log('📊 result.data.length:', result.data?.length);

      if (result.success && result.data) {
        const count = result.data.length;
        console.log('✅ Setting unlocked count to:', count);
        console.log('✅ Setting unlocked chapters data:', result.data);
        setUnlockedCount(count);
        setUnlockedChapters(result.data);
      } else {
        console.log('⚠️ No data, setting count to 0');
        setUnlockedCount(0);
        setUnlockedChapters([]);
      }
    } catch (error) {
      console.error('❌ ERROR fetching unlocked data:', error);
      setUnlockedCount(0);
      setUnlockedChapters([]);
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
    console.log('🏁 === END FETCH ===');
  };

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
                  <p className="text-xs text-gray-600">{loading ? 'Loading...' : `${unlockedCount} Unlocked`}</p>
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
                <p className="text-2xl font-bold text-blue-600">{loading ? '-' : unlockedCount}</p>
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

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : unlockedChapters.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedChapters.map((chapter) => {
              const collegeLogo = getCollegeLogoWithFallback(chapter.university);

              return (
                <Link
                  key={chapter.id}
                  to={`/app/my-chapters/${chapter.id}`}
                  className="relative border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all bg-white overflow-hidden group"
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  {/* Content */}
                  <div className="relative">
                    {/* Header with Logo */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 bg-white shadow-sm">
                        <img
                          src={collegeLogo}
                          alt={chapter.university}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{chapter.name}</h3>
                            <p className="text-sm text-gray-600 mt-0.5">{chapter.chapter}</p>
                          </div>
                          <Unlock className="w-5 h-5 text-green-600 flex-shrink-0" />
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-2.5 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="truncate">{chapter.university}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {chapter.state}
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-700">{chapter.memberCount} members</span>
                        <span className="text-xs text-gray-500 ml-auto">in database</span>
                      </div>
                    </div>

                    {/* Score Badge */}
                    {chapter.chapterScore != null && (
                      <div className="flex items-center justify-end">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-sm">
                          <Star className="w-4 h-4 text-yellow-900 fill-yellow-900" />
                          <span className="text-sm font-bold text-yellow-900">{chapter.chapterScore.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyUnlockedPage;
