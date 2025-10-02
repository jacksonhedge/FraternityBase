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
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/my-unlocks');
      // const data = await response.json();

      // Mock data for now
      setUnlockedChapters([
        {
          id: '1',
          chapter_name: 'Alpha Zeta Chapter',
          greek_organization: 'Sigma Chi',
          university: 'Penn State University',
          state: 'PA',
          member_count: 142,
          unlocked_at: '2025-01-15',
          credits_spent: 50
        },
        // Add more mock data
      ]);

      setUnlockedUsers([
        {
          id: '1',
          name: 'John Smith',
          position: 'President',
          email: 'john@example.com',
          phone: '555-1234',
          linkedin_profile: 'linkedin.com/in/johnsmith',
          graduation_year: 2025,
          major: 'Business',
          chapter_name: 'Alpha Zeta Chapter',
          greek_organization: 'Sigma Chi',
          university: 'Penn State University'
        },
        // Add more mock data
      ]);
    } catch (error) {
      console.error('Error fetching unlocked data:', error);
    } finally {
      setLoading(false);
    }
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
          {unlockedChapters.length === 0 ? (
            <div className="text-center py-12">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No chapters unlocked yet</p>
              <Link
                to="/app/chapters"
                className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Browse Chapters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedChapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedChapter(chapter.chapter_name)}
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
                </div>
              ))}
            </div>
          )}
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
