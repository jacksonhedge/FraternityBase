import { useState, useEffect } from 'react';
import { X, Save, Globe, Instagram, Linkedin, Twitter, MapPin, Building, Calendar, Users } from 'lucide-react';

interface ChapterEditModalProps {
  chapter: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (chapterId: string, updates: any) => Promise<void>;
}

const ChapterEditModal = ({ chapter, isOpen, onClose, onSave }: ChapterEditModalProps) => {
  const [formData, setFormData] = useState({
    website: '',
    instagram_handle_official: '',
    twitter_handle: '',
    linkedin_url: '',
    tiktok_handle: '',
    city: '',
    state_province: '',
    country: '',
    fraternity_province: '',
    house_address: '',
    member_count: '',
    founded_year: '',
    chapter_name: '',
    greek_letter_name: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (chapter) {
      setFormData({
        website: chapter.website || '',
        instagram_handle_official: chapter.instagram_handle_official || '',
        twitter_handle: chapter.twitter_handle || '',
        linkedin_url: chapter.linkedin_url || '',
        tiktok_handle: chapter.tiktok_handle || '',
        city: chapter.city || '',
        state_province: chapter.state_province || '',
        country: chapter.country || '',
        fraternity_province: chapter.fraternity_province || '',
        house_address: chapter.house_address || '',
        member_count: chapter.member_count || '',
        founded_year: chapter.founded_year || '',
        chapter_name: chapter.chapter_name || '',
        greek_letter_name: chapter.greek_letter_name || '',
      });
    }
  }, [chapter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      await onSave(chapter.id, formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update chapter');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Chapter Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              {chapter?.greek_organizations?.name} - {chapter?.universities?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Chapter Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Chapter Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chapter Name
                </label>
                <input
                  type="text"
                  value={formData.chapter_name}
                  onChange={(e) => handleChange('chapter_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Beta Theta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Greek Letter Name
                </label>
                <input
                  type="text"
                  value={formData.greek_letter_name}
                  onChange={(e) => handleChange('greek_letter_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Gamma"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Founded Year
                </label>
                <input
                  type="number"
                  value={formData.founded_year}
                  onChange={(e) => handleChange('founded_year', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1888"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Member Count
                </label>
                <input
                  type="number"
                  value={formData.member_count}
                  onChange={(e) => handleChange('member_count', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 145"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://pennstatesig.org"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Instagram className="w-4 h-4" />
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={formData.instagram_handle_official}
                    onChange={(e) => handleChange('instagram_handle_official', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="sigmachisc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Twitter className="w-4 h-4" />
                    Twitter Handle
                  </label>
                  <input
                    type="text"
                    value={formData.twitter_handle}
                    onChange={(e) => handleChange('twitter_handle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="sigmachi_psu"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleChange('linkedin_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TikTok Handle
                  </label>
                  <input
                    type="text"
                    value={formData.tiktok_handle}
                    onChange={(e) => handleChange('tiktok_handle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="@sigmachipsu"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="University Park"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  value={formData.state_province}
                  onChange={(e) => handleChange('state_province', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="PA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="United States"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fraternity Province
                </label>
                <input
                  type="text"
                  value={formData.fraternity_province}
                  onChange={(e) => handleChange('fraternity_province', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Central Pennsylvania"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  House Address
                </label>
                <input
                  type="text"
                  value={formData.house_address}
                  onChange={(e) => handleChange('house_address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="420 E Fairmount Ave, State College, PA 16801"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChapterEditModal;
