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
  Star,
  Handshake,
  ChevronLeft,
  ChevronRight
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    console.log('🚀 === MY UNLOCKED PAGE: FETCHING DATA ===');
    fetchUnlockedData(currentPage);
  }, [currentPage]);

  const fetchUnlockedData = async (page: number = 1) => {
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

      const url = `${API_URL}/chapters/unlocked?page=${page}&limit=${itemsPerPage}`;
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
      console.log('📊 result.pagination:', result.pagination);

      if (result.success && result.data) {
        console.log('✅ Setting unlocked chapters data:', result.data);
        setUnlockedChapters(result.data);

        if (result.pagination) {
          setTotalCount(result.pagination.total);
          setTotalPages(result.pagination.totalPages);
          setUnlockedCount(result.pagination.total);
          console.log('✅ Pagination:', result.pagination);
        } else {
          // Backward compatibility if pagination is not present
          setUnlockedCount(result.data.length);
        }
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
              to="/app/my-unlocked"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {unlockedChapters.map((chapter, index) => {
              const collegeLogo = getCollegeLogoWithFallback(chapter.university);

              // Generate vibrant gradient colors
              const gradients = [
                'from-blue-500 via-blue-600 to-indigo-600',
                'from-purple-500 via-purple-600 to-pink-600',
                'from-green-500 via-emerald-600 to-teal-600',
                'from-orange-500 via-red-500 to-pink-600',
                'from-cyan-500 via-blue-600 to-purple-600',
                'from-yellow-500 via-orange-500 to-red-600',
                'from-pink-500 via-rose-600 to-purple-600',
                'from-indigo-500 via-purple-600 to-pink-600',
              ];
              const gradient = gradients[index % gradients.length];

              return (
                <div
                  key={chapter.id}
                  className="group relative"
                >
                  {/* Colorful Card */}
                  <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden`}>
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                    {/* Rating Badge - Top Left */}
                    {chapter.chapterScore !== null && chapter.chapterScore !== undefined && (
                      <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-white/50">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold text-gray-900">{Number(chapter.chapterScore).toFixed(1)}</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                      {/* College Logo */}
                      <div className="w-24 h-24 rounded-2xl bg-white shadow-xl p-3 transform group-hover:rotate-3 transition-transform duration-300">
                        <img
                          src={collegeLogo}
                          alt={chapter.university}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* College Name */}
                      <div>
                        <h3 className="font-bold text-white text-lg leading-tight mb-1">
                          {chapter.university}
                        </h3>
                        <p className="text-white/90 text-sm font-medium">
                          {chapter.name}
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-col gap-2 w-full pt-2">
                        <Link
                          to={`/app/my-unlocked/${chapter.id}`}
                          className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md flex items-center justify-center gap-2"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/app/my-unlocked/${chapter.id}#intro`}
                          className="w-full px-4 py-2.5 bg-black hover:bg-gray-900 text-yellow-400 rounded-lg font-semibold transition-colors shadow-md flex items-center justify-center gap-2"
                        >
                          <Handshake className="w-4 h-4" />
                          Request an Intro
                        </Link>
                        <Link
                          to={`/app/map?state=${encodeURIComponent(chapter.state)}`}
                          className="w-full px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/30 flex items-center justify-center gap-2"
                        >
                          <MapPin className="w-4 h-4" />
                          View in Map
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {!loading && unlockedChapters.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
              <div className="text-sm text-gray-600">
                Showing page {currentPage} of {totalPages} ({totalCount} total chapters)
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        )}
      </div>
    </div>
  );
};

export default MyUnlockedPage;
