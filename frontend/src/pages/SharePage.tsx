import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Users,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  ExternalLink,
  Lock,
  Clock,
  Eye,
  AlertCircle,
  Share2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ShareData {
  chapter?: {
    id: string;
    chapter_name: string;
    greek_letter_name?: string;
    founded_year?: number;
    member_count?: number;
    website?: string;
    instagram_handle_official?: string;
    university_name?: string;
    university_logo?: string;
    organization_name?: string;
    greek_letters?: string;
    organization_type?: string;
  };
  members?: Array<{
    name: string;
    position?: string;
    email?: string;
    phone?: string;
    graduation_year?: number;
    major?: string;
    member_type?: string;
  }>;
  isPreview?: boolean;
  totalMemberCount?: number;
  mapConfig?: any;
  isMapShare?: boolean;
  shareInfo?: {
    customMessage?: string;
    customTitle?: string;
    shareType: 'chapter' | 'map';
    createdAt: string;
  };
}

const SharePage = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [viewTracked, setViewTracked] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    const fetchSharedContent = async () => {
      try {
        const response = await fetch(`${API_URL}/shares/${token}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load shared content');
        }

        const result = await response.json();
        setShareData(result.data);
        setLoading(false);

        // Track view after successful load
        trackView();
      } catch (err: any) {
        console.error('Error fetching shared content:', err);
        setError(err.message || 'Failed to load shared content');
        setLoading(false);
      }
    };

    fetchSharedContent();
  }, [token]);

  const trackView = async () => {
    if (viewTracked) return;

    try {
      // Simple fingerprint (could be enhanced with a library like fingerprintjs)
      const fingerprint = `${navigator.userAgent}-${screen.width}x${screen.height}`;

      await fetch(`${API_URL}/shares/${token}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint })
      });

      setViewTracked(true);
    } catch (err) {
      console.error('Error tracking view:', err);
      // Don't show error to user, this is non-critical
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="text-sm text-gray-500">
            This link may have expired, been deactivated, or reached its view limit.
          </div>
        </div>
      </div>
    );
  }

  if (!shareData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No content available</p>
        </div>
      </div>
    );
  }

  // Map Share View
  if (shareData.isMapShare) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="max-w-6xl mx-auto py-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Share2 className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {shareData.shareInfo?.customTitle || 'Shared Map View'}
                </h1>
                {shareData.shareInfo?.customMessage && (
                  <p className="text-gray-600 mt-2">{shareData.shareInfo.customMessage}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-blue-800 mb-4">
                This is a map share link. Map configuration:
              </p>
              <pre className="text-sm text-left bg-white rounded p-4 overflow-auto">
                {JSON.stringify(shareData.mapConfig, null, 2)}
              </pre>
              <p className="text-sm text-blue-600 mt-4">
                Note: Interactive map viewing will be implemented in a future update
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chapter Share View
  const { chapter, members, isPreview, totalMemberCount } = shareData;

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Chapter data not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              {chapter.university_logo ? (
                <img src={chapter.university_logo} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8 text-indigo-600" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {shareData.shareInfo?.customTitle || chapter.chapter_name}
              </h1>
              <p className="text-gray-600 mt-1">
                {chapter.organization_name} {chapter.greek_letters && `(${chapter.greek_letters})`} at {chapter.university_name}
              </p>
            </div>
          </div>

          {shareData.shareInfo?.customMessage && (
            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <p className="text-indigo-900">{shareData.shareInfo.customMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Chapter Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {chapter.founded_year && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Founded</p>
                  <p className="text-2xl font-bold text-gray-900">{chapter.founded_year}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-500">Members</p>
                <p className="text-2xl font-bold text-gray-900">{totalMemberCount || chapter.member_count || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{chapter.organization_type || 'Chapter'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Links */}
        {(chapter.website || chapter.instagram_handle_official) && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Links</h2>
            <div className="flex flex-wrap gap-4">
              {chapter.website && (
                <a
                  href={chapter.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Website</span>
                </a>
              )}
              {chapter.instagram_handle_official && (
                <a
                  href={`https://instagram.com/${chapter.instagram_handle_official.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Instagram</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isPreview ? 'Preview - Leadership' : 'Chapter Roster'}
            </h2>
            {isPreview && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <Lock className="w-4 h-4" />
                <span>Limited Preview</span>
              </div>
            )}
          </div>

          {isPreview && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                This is a preview showing leadership positions only. Full roster access available upon request.
              </p>
            </div>
          )}

          {members && members.length > 0 ? (
            <div className="space-y-3">
              {members.map((member, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        {member.position && (
                          <p className="text-sm text-indigo-600 font-medium">{member.position}</p>
                        )}
                      </div>
                      {member.member_type && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                          {member.member_type}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1">
                      {member.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${member.email}`} className="hover:text-indigo-600">
                            {member.email}
                          </a>
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${member.phone}`} className="hover:text-indigo-600">
                            {member.phone}
                          </a>
                        </div>
                      )}
                      {(member.graduation_year || member.major) && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <GraduationCap className="w-4 h-4" />
                          <span>
                            {member.major && <span>{member.major}</span>}
                            {member.graduation_year && (
                              <span className="text-gray-500">
                                {member.major && ' • '}Class of {member.graduation_year}
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isPreview && totalMemberCount && members.length < totalMemberCount && (
                <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <p className="text-gray-600">
                    + {totalMemberCount - members.length} more members
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Contact the chapter for full roster access
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No member information available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Eye className="w-4 h-4" />
            <span>Shared via secure link</span>
          </div>
          <p>
            Shared on {shareData.shareInfo?.createdAt ? new Date(shareData.shareInfo.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharePage;
