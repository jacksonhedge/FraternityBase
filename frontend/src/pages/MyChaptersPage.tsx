import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Unlock,
  Lock,
  Users,
  Mail,
  Phone,
  Linkedin,
  MapPin,
  Building2,
  GraduationCap,
  Calendar,
  ExternalLink,
  Download,
  Filter
} from 'lucide-react';

interface UnlockedChapter {
  id: string;
  chapter_name: string;
  greek_organization: string;
  university: string;
  state: string;
  member_count: number;
  unlocked_at: string;
  credits_spent: number;
}

interface UnlockedUser {
  id: string;
  name: string;
  position: string;
  email?: string;
  phone?: string;
  linkedin_profile?: string;
  graduation_year?: number;
  major?: string;
  chapter_name: string;
  greek_organization: string;
  university: string;
}

const MyChaptersPage = () => {
  const [unlockedChapters, setUnlockedChapters] = useState<UnlockedChapter[]>([]);
  const [unlockedUsers, setUnlockedUsers] = useState<UnlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  useEffect(() => {
    fetchUnlockedData();
  }, []);

  const fetchUnlockedData = async () => {
    console.log('🚀 === MY CHAPTERS PAGE: FETCH UNLOCKED DATA ===');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');

      console.log('📍 API_URL:', API_URL);
      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token (first 50 chars):', token?.substring(0, 50) + '...');

      if (!token) {
        console.error('❌ No authentication token found');
        setLoading(false);
        return;
      }

      const url = `${API_URL}/chapters/unlocked`;
      console.log('📤 Fetching from:', url);
      console.log('📤 Headers:', { 'Authorization': `Bearer ${token.substring(0, 20)}...` });

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response not OK. Status:', response.status, 'Error text:', errorText);
        throw new Error('Failed to fetch unlocked chapters');
      }

      const result = await response.json();
      console.log('📊 Raw result from API:', JSON.stringify(result, null, 2));
      console.log('📊 result.success:', result.success);
      console.log('📊 result.data:', result.data);
      console.log('📊 result.data length:', result.data?.length);

      if (result.success && result.data) {
        console.log('✅ Result is successful, transforming data...');
        console.log('📋 Raw data before transform:', result.data);

        // Transform backend data to match our component interface
        const transformedChapters = result.data.map((chapter: any, index: number) => {
          console.log(`🔄 Transforming chapter ${index}:`, chapter);
          const transformed = {
            id: chapter.id,
            chapter_name: chapter.chapter,
            greek_organization: chapter.name,
            university: chapter.university,
            state: chapter.state,
            member_count: chapter.memberCount,
            unlocked_at: new Date().toISOString(),
            credits_spent: 0
          };
          console.log(`✨ Transformed chapter ${index}:`, transformed);
          return transformed;
        });

        console.log('✅ All chapters transformed:', transformedChapters);
        console.log('✅ Setting state with', transformedChapters.length, 'chapters');
        setUnlockedChapters(transformedChapters);
      } else {
        console.log('⚠️ Result not successful or no data, setting empty array');
        setUnlockedChapters([]);
      }

      // For now, set unlocked users to empty until we have a backend endpoint
      setUnlockedUsers([]);
      console.log('✅ Fetch completed successfully');
    } catch (error) {
      console.error('❌ ERROR in fetchUnlockedData:', error);
      console.error('❌ Error stack:', (error as Error).stack);
      setUnlockedChapters([]);
      setUnlockedUsers([]);
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
    console.log('🏁 === END FETCH UNLOCKED DATA ===');
  };

  const exportToCSV = () => {
    // TODO: Implement CSV export
    console.log('Exporting to CSV...');
  };

  const filteredUsers = selectedChapter
    ? unlockedUsers.filter(u => u.chapter_name === selectedChapter)
    : unlockedUsers;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show empty state if no chapters unlocked
  if (!loading && unlockedChapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Lock className="w-20 h-20 text-gray-300 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-3">You have not unlocked any chapters yet</h1>
        <p className="text-gray-600 mb-8">Start unlocking chapters to access member data and insights</p>
        <Link
          to="/app/chapters"
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Lock className="w-5 h-5" />
          Browse Chapters
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Chapters</h1>
          <p className="text-gray-600 mt-1">
            View and manage your unlocked chapters and contacts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export All
          </button>
          <Link
            to="/app/chapters"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Lock className="w-4 h-4" />
            Unlock More
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unlocked Chapters</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{unlockedChapters.length}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Unlock className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Contacts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{unlockedUsers.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Credits Spent</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {unlockedChapters.reduce((sum, ch) => sum + ch.credits_spent, 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Unlocked Chapters */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Unlocked Chapters</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedChapters.map((chapter) => (
              <Link
                key={chapter.id}
                to={`/app/my-chapters/${chapter.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{chapter.greek_organization}</h3>
                    <p className="text-sm text-gray-600">{chapter.chapter_name}</p>
                  </div>
                  <Unlock className="w-5 h-5 text-green-600" />
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {chapter.university}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {chapter.state}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {chapter.member_count} members
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <span>Unlocked {new Date(chapter.unlocked_at).toLocaleDateString()}</span>
                  <span>{chapter.credits_spent} credits</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Unlocked Contacts */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Unlocked Contacts</h2>
          {selectedChapter && (
            <button
              onClick={() => setSelectedChapter(null)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Show All
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No contacts available</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chapter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Info</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.chapter_name}</div>
                      <div className="text-xs text-gray-500">{user.greek_organization}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {user.email && (
                          <a href={`mailto:${user.email}`} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </a>
                        )}
                        {user.phone && (
                          <a href={`tel:${user.phone}`} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs text-gray-600">
                        {user.graduation_year && <span>Class of {user.graduation_year}</span>}
                        {user.major && <span>{user.major}</span>}
                        {user.linkedin_profile && (
                          <a
                            href={`https://${user.linkedin_profile}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                          >
                            <Linkedin className="w-3 h-3" />
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyChaptersPage;
