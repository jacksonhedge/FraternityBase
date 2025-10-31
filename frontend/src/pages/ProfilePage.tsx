import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { supabase } from '../lib/supabase';
import {
  Building2,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Video,
  Upload,
  Save,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface CompanyProfile {
  id: string;
  name: string;
  description: string;
  industry: string;
  company_size: string;
  website: string;
  logo_url: string;
  headquarters_location: string;
  instagram_url: string;
  linkedin_url: string;
  twitter_url: string;
  facebook_url: string;
  tiktok_url: string;
  approval_status: string;
}

const ProfilePage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    company_size: '',
    website: '',
    logo_url: '',
    headquarters_location: '',
    instagram_url: '',
    linkedin_url: '',
    twitter_url: '',
    facebook_url: '',
    tiktok_url: ''
  });

  useEffect(() => {
    fetchCompanyProfile();
  }, [user]);

  const fetchCompanyProfile = async () => {
    if (!user?.companyId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', user.companyId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          industry: data.industry || '',
          company_size: data.company_size || '',
          website: data.website || '',
          logo_url: data.logo_url || '',
          headquarters_location: data.headquarters_location || '',
          instagram_url: data.instagram_url || '',
          linkedin_url: data.linkedin_url || '',
          twitter_url: data.twitter_url || '',
          facebook_url: data.facebook_url || '',
          tiktok_url: data.tiktok_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
      setErrorMessage('Failed to load company profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user?.companyId) return;

    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: formData.name,
          description: formData.description,
          industry: formData.industry,
          company_size: formData.company_size,
          website: formData.website,
          logo_url: formData.logo_url,
          headquarters_location: formData.headquarters_location,
          instagram_url: formData.instagram_url,
          linkedin_url: formData.linkedin_url,
          twitter_url: formData.twitter_url,
          facebook_url: formData.facebook_url,
          tiktok_url: formData.tiktok_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.companyId);

      if (error) throw error;

      setSuccessMessage('Company profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
      await fetchCompanyProfile();
    } catch (error) {
      console.error('Error updating company profile:', error);
      setErrorMessage('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isProfileComplete = () => {
    return formData.website &&
           formData.logo_url &&
           formData.instagram_url &&
           formData.linkedin_url &&
           formData.description;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
              <p className="text-gray-600 mt-2">Manage your company's information and social media links</p>
            </div>
            {profile?.approval_status && (
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                profile.approval_status === 'approved'
                  ? 'bg-green-100 text-green-700'
                  : profile.approval_status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {profile.approval_status === 'approved' ? '✓ Approved' :
                 profile.approval_status === 'pending' ? '⏳ Pending Review' :
                 'Not Submitted'}
              </div>
            )}
          </div>

          {/* Profile Completion Alert */}
          {!isProfileComplete() && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">Complete Your Profile</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Please fill in all required fields (website, logo, Instagram, LinkedIn, and description)
                  before your company can be approved and appear on the marketplace.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">{successMessage}</p>
            <button onClick={() => setSuccessMessage('')} className="ml-auto">
              <X className="w-5 h-5 text-green-600" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{errorMessage}</p>
            <button onClick={() => setErrorMessage('')} className="ml-auto">
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Acme Corporation"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us about your company..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select industry...</option>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size
                </label>
                <select
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select size...</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Headquarters Location
              </label>
              <input
                type="text"
                name="headquarters_location"
                value={formData.headquarters_location}
                onChange={handleChange}
                placeholder="San Francisco, CA"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Website & Logo */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Website & Logo
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://www.yourcompany.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL <span className="text-red-500">*</span>
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <input
                    type="url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleChange}
                    placeholder="https://www.yourcompany.com/logo.png"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a direct URL to your company logo (PNG, JPG, or SVG)
                  </p>
                </div>
                {formData.logo_url && (
                  <div className="w-24 h-24 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
                    <img
                      src={formData.logo_url}
                      alt="Logo preview"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Social Media Links
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-500" />
                Instagram <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="instagram_url"
                value={formData.instagram_url}
                onChange={handleChange}
                placeholder="https://www.instagram.com/yourcompany"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-700" />
                LinkedIn <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="https://www.linkedin.com/company/yourcompany"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Twitter className="w-4 h-4 text-blue-400" />
                Twitter / X
              </label>
              <input
                type="url"
                name="twitter_url"
                value={formData.twitter_url}
                onChange={handleChange}
                placeholder="https://twitter.com/yourcompany"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
              </label>
              <input
                type="url"
                name="facebook_url"
                value={formData.facebook_url}
                onChange={handleChange}
                placeholder="https://www.facebook.com/yourcompany"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Video className="w-4 h-4 text-gray-900" />
                TikTok
              </label>
              <input
                type="url"
                name="tiktok_url"
                value={formData.tiktok_url}
                onChange={handleChange}
                placeholder="https://www.tiktok.com/@yourcompany"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {isSaving ? (
              <>
                <span className="animate-spin">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Profile
              </>
            )}
          </button>

          {!isProfileComplete() && (
            <p className="text-sm text-gray-600 text-center mt-3">
              <span className="text-red-500">*</span> Required fields must be completed for admin approval
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
