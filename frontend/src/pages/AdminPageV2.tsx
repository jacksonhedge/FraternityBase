import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CSVUploader from '../components/CSVUploader';
import ImageUploader from '../components/ImageUploader';
import {
  Plus,
  Building2,
  Users,
  UserCheck,
  Save,
  X,
  Check,
  Hash,
  Mail,
  Phone,
  Globe,
  Instagram,
  Calendar,
  MapPin,
  Briefcase,
  LogOut,
  Shield,
  Upload,
  FileText,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Award,
  Link2,
  Home,
  ChevronRight,
  Database,
  Image as ImageIcon
} from 'lucide-react';

const AdminPageV2 = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'fraternities' | 'colleges' | 'chapters' | 'contacts'>('fraternities');
  const [uploadMode, setUploadMode] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminLoginTime');
    navigate('/admin-login');
  };

  // Fraternity form state
  const [fraternityData, setFraternityData] = useState({
    name: '',
    greekLetters: '',
    founded: '',
    headquarters: '',
    totalChapters: '',
    totalMembers: '',
    website: '',
    description: '',
    logo: null as File | null,
    logoPreview: null as string | null
  });

  // College form state
  const [collegeData, setCollegeData] = useState({
    name: '',
    city: '',
    state: '',
    studentCount: '',
    greekLifePercentage: '',
    website: '',
    description: '',
    logo: null as File | null,
    logoPreview: null as string | null,
    campusImage: null as File | null,
    campusImagePreview: null as string | null
  });

  // Chapter form state
  const [chapterData, setChapterData] = useState({
    fraternityId: '',
    collegeName: '',
    collegeState: '',
    chapterName: '',
    founded: '',
    size: '',
    avgGPA: '',
    website: '',
    instagram: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // Contact form state
  const [contactData, setContactData] = useState({
    chapterId: '',
    position: 'President',
    name: '',
    emails: [''],
    phone: '',
    major: '',
    year: '',
    linkedIn: ''
  });

  const handleFraternityCSVUpload = (data: any[]) => {
    console.log('Fraternity CSV data:', data);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setUploadMode(false);
  };

  const handleChapterCSVUpload = (data: any[]) => {
    console.log('Chapter CSV data:', data);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setUploadMode(false);
  };

  const handleContactCSVUpload = (data: any[]) => {
    console.log('Contact CSV data:', data);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setUploadMode(false);
  };

  const handleFraternitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Fraternity data:', fraternityData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setFraternityData({
      name: '',
      greekLetters: '',
      founded: '',
      headquarters: '',
      totalChapters: '',
      totalMembers: '',
      website: '',
      description: '',
      logo: null,
      logoPreview: null
    });
  };

  const handleCollegeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('College data:', collegeData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setCollegeData({
      name: '',
      city: '',
      state: '',
      studentCount: '',
      greekLifePercentage: '',
      website: '',
      description: '',
      logo: null,
      logoPreview: null,
      campusImage: null,
      campusImagePreview: null
    });
  };

  const handleChapterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Chapter data:', chapterData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setChapterData({
      fraternityId: '',
      collegeName: '',
      collegeState: '',
      chapterName: '',
      founded: '',
      size: '',
      avgGPA: '',
      website: '',
      instagram: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: ''
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact data:', contactData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setContactData({
      chapterId: '',
      position: 'President',
      name: '',
      emails: [''],
      phone: '',
      major: '',
      year: '',
      linkedIn: ''
    });
  };

  const addEmailField = () => {
    setContactData({
      ...contactData,
      emails: [...contactData.emails, '']
    });
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...contactData.emails];
    newEmails[index] = value;
    setContactData({ ...contactData, emails: newEmails });
  };

  const removeEmail = (index: number) => {
    if (contactData.emails.length > 1) {
      const newEmails = contactData.emails.filter((_, i) => i !== index);
      setContactData({ ...contactData, emails: newEmails });
    }
  };

  // Mock data
  const fraternities = [
    { id: '1', name: 'Sigma Chi' },
    { id: '2', name: 'Phi Delta Theta' },
    { id: '3', name: 'Beta Theta Pi' }
  ];

  const chapters = [
    { id: '1', name: 'Sigma Chi - Penn State' },
    { id: '2', name: 'Phi Delta Theta - Ohio State' }
  ];

  const states = ['PA', 'OH', 'NY', 'CA', 'TX', 'FL', 'IL', 'MI'];
  const positions = ['President', 'Vice President', 'Rush Chair', 'Social Chair', 'Treasurer'];

  // Stats for dashboard
  const stats = [
    { label: 'Total Fraternities', value: '24', icon: Building2, color: 'bg-blue-500' },
    { label: 'Total Colleges', value: '156', icon: GraduationCap, color: 'bg-purple-500' },
    { label: 'Active Chapters', value: '342', icon: Users, color: 'bg-green-500' },
    { label: 'Total Contacts', value: '1,248', icon: UserCheck, color: 'bg-orange-500' }
  ];

  const tabs = [
    { id: 'fraternities', label: 'Fraternities', icon: Building2 },
    { id: 'colleges', label: 'Colleges', icon: GraduationCap },
    { id: 'chapters', label: 'Chapters', icon: Users },
    { id: 'contacts', label: 'Contacts', icon: UserCheck }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {/* Logo placeholder - you can replace with actual logo */}
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">FB</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                      Fraternity Base
                    </h1>
                    <p className="text-sm text-gray-500">Admin Dashboard</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-50 to-orange-50 text-red-700 rounded-full border border-red-200">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Admin Mode</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all hover:shadow-lg flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 z-50 animate-pulse">
          <div className="bg-white bg-opacity-20 rounded-full p-1">
            <Check className="w-5 h-5" />
          </div>
          <span className="font-medium">Data saved successfully!</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
              <div className={`h-1 ${stat.color} opacity-20`}></div>
            </div>
          ))}
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <nav className="flex space-x-1 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Upload Mode Toggle */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <h3 className="text-xl font-bold text-gray-900">
                  {activeTab === 'fraternities' && 'Fraternity Management'}
                  {activeTab === 'colleges' && 'College Management'}
                  {activeTab === 'chapters' && 'Chapter Management'}
                  {activeTab === 'contacts' && 'Contact Management'}
                </h3>
              </div>

              {activeTab !== 'colleges' && (
                <div className="flex items-center space-x-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setUploadMode(false)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      !uploadMode
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Manual Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode(true)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      uploadMode
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Upload className="w-4 h-4 inline mr-2" />
                    CSV Upload
                  </button>
                </div>
              )}
            </div>

            {/* Fraternity Form/Upload */}
            {activeTab === 'fraternities' && (
              <>
                {uploadMode ? (
                  <div className="animate-fadeIn">
                    <CSVUploader type="fraternities" onDataParsed={handleFraternityCSVUpload} />
                  </div>
                ) : (
                  <form onSubmit={handleFraternitySubmit} className="space-y-8 animate-fadeIn">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                        <Plus className="w-5 h-5 mr-2 text-primary-600" />
                        Add New Fraternity
                      </h3>
                      <p className="text-sm text-gray-600">Enter the details for a new fraternity organization</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Basic Info Section */}
                      <div className="space-y-6">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          Basic Information
                        </h4>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fraternity Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={fraternityData.name}
                              onChange={(e) => setFraternityData({ ...fraternityData, name: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                              placeholder="e.g., Sigma Chi"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Greek Letters
                            </label>
                            <input
                              type="text"
                              value={fraternityData.greekLetters}
                              onChange={(e) => setFraternityData({ ...fraternityData, greekLetters: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                              placeholder="e.g., ΣΧ"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Founded Year
                            </label>
                            <input
                              type="text"
                              value={fraternityData.founded}
                              onChange={(e) => setFraternityData({ ...fraternityData, founded: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                              placeholder="e.g., 1855"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Headquarters
                            </label>
                            <input
                              type="text"
                              value={fraternityData.headquarters}
                              onChange={(e) => setFraternityData({ ...fraternityData, headquarters: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                              placeholder="e.g., Evanston, IL"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Statistics Section */}
                      <div className="space-y-6">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-gray-400" />
                          Statistics & Details
                        </h4>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Total Chapters
                            </label>
                            <input
                              type="number"
                              value={fraternityData.totalChapters}
                              onChange={(e) => setFraternityData({ ...fraternityData, totalChapters: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                              placeholder="e.g., 241"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Total Members
                            </label>
                            <input
                              type="number"
                              value={fraternityData.totalMembers}
                              onChange={(e) => setFraternityData({ ...fraternityData, totalMembers: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                              placeholder="e.g., 350000"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Website
                            </label>
                            <div className="relative">
                              <Globe className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                              <input
                                type="url"
                                value={fraternityData.website}
                                onChange={(e) => setFraternityData({ ...fraternityData, website: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="https://www.sigmachi.org"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description
                            </label>
                            <textarea
                              value={fraternityData.description}
                              onChange={(e) => setFraternityData({ ...fraternityData, description: e.target.value })}
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                              placeholder="Brief description of the fraternity..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Logo Upload */}
                      <div className="md:col-span-2">
                        <h4 className="font-medium text-gray-900 flex items-center mb-4">
                          <ImageIcon className="w-4 h-4 mr-2 text-gray-400" />
                          Visual Assets
                        </h4>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                          <ImageUploader
                            label="Fraternity Logo"
                            currentImage={fraternityData.logoPreview || undefined}
                            onImageChange={(file, preview) => setFraternityData({
                              ...fraternityData,
                              logo: file,
                              logoPreview: preview
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
                      >
                        <Save className="w-5 h-5" />
                        <span>Save Fraternity</span>
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* College Form */}
            {activeTab === 'colleges' && (
              <form onSubmit={handleCollegeSubmit} className="space-y-8 animate-fadeIn">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-purple-600" />
                    Add New College
                  </h3>
                  <p className="text-sm text-gray-600">Enter the details for a new college or university</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        College Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={collegeData.name}
                        onChange={(e) => setCollegeData({ ...collegeData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="e.g., Penn State University"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={collegeData.city}
                          onChange={(e) => setCollegeData({ ...collegeData, city: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="State College"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <select
                          required
                          value={collegeData.state}
                          onChange={(e) => setCollegeData({ ...collegeData, state: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select</option>
                          {states.map((state) => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student Count
                      </label>
                      <input
                        type="number"
                        value={collegeData.studentCount}
                        onChange={(e) => setCollegeData({ ...collegeData, studentCount: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="e.g., 46000"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Greek Life %
                      </label>
                      <input
                        type="text"
                        value={collegeData.greekLifePercentage}
                        onChange={(e) => setCollegeData({ ...collegeData, greekLifePercentage: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="e.g., 17%"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={collegeData.website}
                        onChange={(e) => setCollegeData({ ...collegeData, website: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="https://www.psu.edu"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={collegeData.description}
                        onChange={(e) => setCollegeData({ ...collegeData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="Brief description..."
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
                      <ImageUploader
                        label="College Logo"
                        currentImage={collegeData.logoPreview || undefined}
                        onImageChange={(file, preview) => setCollegeData({
                          ...collegeData,
                          logo: file,
                          logoPreview: preview
                        })}
                      />
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                      <ImageUploader
                        label="Campus Image"
                        currentImage={collegeData.campusImagePreview || undefined}
                        onImageChange={(file, preview) => setCollegeData({
                          ...collegeData,
                          campusImage: file,
                          campusImagePreview: preview
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save College</span>
                  </button>
                </div>
              </form>
            )}

            {/* Placeholder for other tabs */}
            {(activeTab === 'chapters' || activeTab === 'contacts') && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Database className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'chapters' ? 'Chapter' : 'Contact'} Management
                </h3>
                <p className="text-gray-500">
                  {uploadMode ? 'Upload CSV data' : 'Add new entries'} for {activeTab}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminPageV2;