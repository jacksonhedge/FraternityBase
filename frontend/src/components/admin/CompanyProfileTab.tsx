import { useState } from 'react';
import { Building2, Globe, Instagram, Linkedin, Twitter, Facebook, Video, Save, Edit2, X } from 'lucide-react';

interface CompanyProfileTabProps {
  company: any;
  onUpdate: () => void;
  apiUrl: string;
  getAdminHeaders: () => Record<string, string>;
}

const CompanyProfileTab = ({ company, onUpdate, apiUrl, getAdminHeaders }: CompanyProfileTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    website: company.website || '',
    logo_url: company.logo_url || '',
    instagram_url: company.instagram_url || '',
    linkedin_url: company.linkedin_url || '',
    twitter_url: company.twitter_url || '',
    facebook_url: company.facebook_url || '',
    tiktok_url: company.tiktok_url || '',
    description: company.description || '',
    business_vertical: company.business_vertical || '',
    industry: company.industry || '',
    company_size: company.company_size || '',
    headquarters_location: company.headquarters_location || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${apiUrl}/admin/companies/${company.id}/profile`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      alert('✅ Company profile updated successfully!');
      setIsEditing(false);
      onUpdate(); // Refresh company data
    } catch (error: any) {
      console.error('Error updating company profile:', error);
      alert(`❌ Failed to update profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      website: company.website || '',
      logo_url: company.logo_url || '',
      instagram_url: company.instagram_url || '',
      linkedin_url: company.linkedin_url || '',
      twitter_url: company.twitter_url || '',
      facebook_url: company.facebook_url || '',
      tiktok_url: company.tiktok_url || '',
      description: company.description || '',
      business_vertical: company.business_vertical || '',
      industry: company.industry || '',
      company_size: company.company_size || '',
      headquarters_location: company.headquarters_location || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Company Profile
        </h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Website */}
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-500 uppercase mb-2 flex items-center gap-2">
            <Globe className="w-3 h-3" />
            Website <span className="text-red-500">*</span>
          </p>
          {isEditing ? (
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.company.com"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : formData.website ? (
            <a
              href={formData.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {formData.website}
            </a>
          ) : (
            <p className="text-sm text-gray-400 italic">Not provided</p>
          )}
        </div>

        {/* Logo */}
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-500 uppercase mb-2">
            Logo URL <span className="text-red-500">*</span>
          </p>
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                placeholder="https://www.company.com/logo.png"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {formData.logo_url && (
                <img
                  src={formData.logo_url}
                  alt="Logo preview"
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          ) : formData.logo_url ? (
            <div className="flex items-center gap-2">
              <img
                src={formData.logo_url}
                alt="Company logo"
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <a
                href={formData.logo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline truncate"
              >
                View logo
              </a>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Not provided</p>
          )}
        </div>

        {/* Instagram */}
        <div className="bg-white p-4 rounded-lg border border-pink-200">
          <p className="text-xs text-gray-500 uppercase mb-2 flex items-center gap-2">
            <Instagram className="w-3 h-3 text-pink-500" />
            Instagram <span className="text-red-500">*</span>
          </p>
          {isEditing ? (
            <input
              type="url"
              name="instagram_url"
              value={formData.instagram_url}
              onChange={handleChange}
              placeholder="https://www.instagram.com/company"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          ) : formData.instagram_url ? (
            <a
              href={formData.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-pink-600 hover:underline break-all"
            >
              {formData.instagram_url}
            </a>
          ) : (
            <p className="text-sm text-gray-400 italic">Not provided</p>
          )}
        </div>

        {/* LinkedIn */}
        <div className="bg-white p-4 rounded-lg border border-blue-300">
          <p className="text-xs text-gray-500 uppercase mb-2 flex items-center gap-2">
            <Linkedin className="w-3 h-3 text-blue-700" />
            LinkedIn <span className="text-red-500">*</span>
          </p>
          {isEditing ? (
            <input
              type="url"
              name="linkedin_url"
              value={formData.linkedin_url}
              onChange={handleChange}
              placeholder="https://www.linkedin.com/company/company"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : formData.linkedin_url ? (
            <a
              href={formData.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-700 hover:underline break-all"
            >
              {formData.linkedin_url}
            </a>
          ) : (
            <p className="text-sm text-gray-400 italic">Not provided</p>
          )}
        </div>

        {/* Twitter */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 uppercase mb-2 flex items-center gap-2">
            <Twitter className="w-3 h-3 text-blue-400" />
            Twitter / X
          </p>
          {isEditing ? (
            <input
              type="url"
              name="twitter_url"
              value={formData.twitter_url}
              onChange={handleChange}
              placeholder="https://twitter.com/company"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : formData.twitter_url ? (
            <a
              href={formData.twitter_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline break-all"
            >
              {formData.twitter_url}
            </a>
          ) : (
            <p className="text-sm text-gray-400 italic">Not provided</p>
          )}
        </div>

        {/* Facebook */}
        <div className="bg-white p-4 rounded-lg border border-blue-400">
          <p className="text-xs text-gray-500 uppercase mb-2 flex items-center gap-2">
            <Facebook className="w-3 h-3 text-blue-600" />
            Facebook
          </p>
          {isEditing ? (
            <input
              type="url"
              name="facebook_url"
              value={formData.facebook_url}
              onChange={handleChange}
              placeholder="https://www.facebook.com/company"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : formData.facebook_url ? (
            <a
              href={formData.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {formData.facebook_url}
            </a>
          ) : (
            <p className="text-sm text-gray-400 italic">Not provided</p>
          )}
        </div>

        {/* TikTok */}
        <div className="bg-white p-4 rounded-lg border border-gray-300">
          <p className="text-xs text-gray-500 uppercase mb-2 flex items-center gap-2">
            <Video className="w-3 h-3 text-gray-900" />
            TikTok
          </p>
          {isEditing ? (
            <input
              type="url"
              name="tiktok_url"
              value={formData.tiktok_url}
              onChange={handleChange}
              placeholder="https://www.tiktok.com/@company"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          ) : formData.tiktok_url ? (
            <a
              href={formData.tiktok_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-900 hover:underline break-all"
            >
              {formData.tiktok_url}
            </a>
          ) : (
            <p className="text-sm text-gray-400 italic">Not provided</p>
          )}
        </div>

        {/* Business Vertical & Company Info */}
        <div className="bg-white p-4 rounded-lg border border-blue-200 md:col-span-2">
          <p className="text-xs text-gray-500 uppercase mb-2">Business Vertical & Company Info</p>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <select
                name="business_vertical"
                value={formData.business_vertical}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select business vertical...</option>
                <option value="Fantasy Sports">Fantasy Sports</option>
                <option value="Sportsbook/Casino">Sportsbook/Casino</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Apparel">Apparel</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Health & Wellness">Health & Wellness</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select industry (legacy)...</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Retail">Retail</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Fashion">Fashion</option>
                <option value="Sports & Fitness">Sports & Fitness</option>
                <option value="Health & Wellness">Health & Wellness</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
              <select
                name="company_size"
                value={formData.company_size}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select size...</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
              <input
                type="text"
                name="headquarters_location"
                value={formData.headquarters_location}
                onChange={handleChange}
                placeholder="HQ Location (e.g., San Francisco, CA)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {formData.business_vertical && (
                <p className="text-sm text-gray-700"><span className="font-medium">Business Vertical:</span> {formData.business_vertical}</p>
              )}
              {formData.industry && (
                <p className="text-sm text-gray-700"><span className="font-medium">Industry:</span> {formData.industry}</p>
              )}
              {formData.company_size && (
                <p className="text-sm text-gray-700"><span className="font-medium">Size:</span> {formData.company_size}</p>
              )}
              {formData.headquarters_location && (
                <p className="text-sm text-gray-700"><span className="font-medium">HQ:</span> {formData.headquarters_location}</p>
              )}
              {!formData.business_vertical && !formData.industry && !formData.company_size && !formData.headquarters_location && (
                <p className="text-sm text-gray-400 italic">Not provided</p>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white p-4 rounded-lg border border-blue-200 md:col-span-2">
          <p className="text-xs text-gray-500 uppercase mb-2">
            Description <span className="text-red-500">*</span>
          </p>
          {isEditing ? (
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about the company..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          ) : formData.description ? (
            <p className="text-sm text-gray-700">{formData.description}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">Not provided</p>
          )}
        </div>
      </div>

      {/* Profile Completeness Indicator */}
      {!isEditing && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          {!formData.website || !formData.logo_url || !formData.instagram_url || !formData.linkedin_url || !formData.description ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">⚠️ Incomplete Profile:</span> Missing required fields (website, logo, Instagram, LinkedIn, description)
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <span className="font-semibold">✓ Profile Complete:</span> All required fields provided
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyProfileTab;
