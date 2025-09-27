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
  GraduationCap
} from 'lucide-react';

const AdminPage = () => {
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
    // Process multiple fraternities from CSV
    console.log('Fraternity CSV data:', data);

    // Here you would typically save all the data to your backend
    // For now, we'll just show success and reset
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
    // Reset form
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
    // Reset form
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
    // Reset form
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
    // Reset form
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

  // Mock data for dropdowns
  const fraternities = [
    { id: '1', name: 'Sigma Chi' },
    { id: '2', name: 'Phi Delta Theta' },
    { id: '3', name: 'Beta Theta Pi' },
    { id: '4', name: 'Alpha Tau Omega' },
    { id: '5', name: 'Sigma Alpha Epsilon' }
  ];

  const chapters = [
    { id: '1', name: 'Sigma Chi - Penn State' },
    { id: '2', name: 'Phi Delta Theta - Ohio State' },
    { id: '3', name: 'Beta Theta Pi - Michigan' },
    { id: '4', name: 'Alpha Tau Omega - Alabama' },
    { id: '5', name: 'Sigma Alpha Epsilon - Texas' }
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const positions = [
    'President', 'Vice President', 'Rush Chair', 'Social Chair',
    'Treasurer', 'Secretary', 'Risk Manager', 'Alumni Relations'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Add and manage fraternity data</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Admin Mode</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <Check className="w-5 h-5" />
          <span>Data saved successfully!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('fraternities')}
              className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'fraternities'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-4 h-4 inline mr-2" />
              Fraternities
            </button>
            <button
              onClick={() => setActiveTab('colleges')}
              className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'colleges'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <GraduationCap className="w-4 h-4 inline mr-2" />
              Colleges
            </button>
            <button
              onClick={() => setActiveTab('chapters')}
              className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'chapters'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Chapters
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'contacts'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserCheck className="w-4 h-4 inline mr-2" />
              Contacts
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Upload Mode Toggle */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === 'fraternities' && 'Manage Fraternities'}
              {activeTab === 'colleges' && 'Manage Colleges'}
              {activeTab === 'chapters' && 'Manage Chapters'}
              {activeTab === 'contacts' && 'Manage Contacts'}
            </h3>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setUploadMode(false)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  !uploadMode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-1.5" />
                Manual Entry
              </button>
              <button
                type="button"
                onClick={() => setUploadMode(true)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  uploadMode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-1.5" />
                CSV Upload
              </button>
            </div>
          </div>

          {/* Fraternity Form/Upload */}
          {activeTab === 'fraternities' && (
            <>
              {uploadMode ? (
                <CSVUploader type="fraternities" onDataParsed={handleFraternityCSVUpload} />
              ) : (
                <form onSubmit={handleFraternitySubmit} className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Fraternity</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fraternity Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fraternityData.name}
                    onChange={(e) => setFraternityData({ ...fraternityData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Sigma Chi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Greek Letters
                  </label>
                  <input
                    type="text"
                    value={fraternityData.greekLetters}
                    onChange={(e) => setFraternityData({ ...fraternityData, greekLetters: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., ΣΧ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Founded Year
                  </label>
                  <input
                    type="text"
                    value={fraternityData.founded}
                    onChange={(e) => setFraternityData({ ...fraternityData, founded: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., 1855"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Headquarters
                  </label>
                  <input
                    type="text"
                    value={fraternityData.headquarters}
                    onChange={(e) => setFraternityData({ ...fraternityData, headquarters: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Evanston, IL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Chapters
                  </label>
                  <input
                    type="number"
                    value={fraternityData.totalChapters}
                    onChange={(e) => setFraternityData({ ...fraternityData, totalChapters: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., 241"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Members
                  </label>
                  <input
                    type="number"
                    value={fraternityData.totalMembers}
                    onChange={(e) => setFraternityData({ ...fraternityData, totalMembers: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., 350000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={fraternityData.website}
                    onChange={(e) => setFraternityData({ ...fraternityData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://www.sigmachi.org"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={fraternityData.description}
                    onChange={(e) => setFraternityData({ ...fraternityData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Brief description of the fraternity..."
                  />
                </div>

                <div className="md:col-span-2">
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

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Fraternity</span>
                </button>
              </div>
            </form>
              )}
            </>
          )}

          {/* College Form */}
          {activeTab === 'colleges' && (
            <form onSubmit={handleCollegeSubmit} className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New College</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    College Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={collegeData.name}
                    onChange={(e) => setCollegeData({ ...collegeData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Penn State University"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={collegeData.city}
                    onChange={(e) => setCollegeData({ ...collegeData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., State College"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <select
                    required
                    value={collegeData.state}
                    onChange={(e) => setCollegeData({ ...collegeData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Count
                  </label>
                  <input
                    type="number"
                    value={collegeData.studentCount}
                    onChange={(e) => setCollegeData({ ...collegeData, studentCount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., 46000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Greek Life Percentage
                  </label>
                  <input
                    type="text"
                    value={collegeData.greekLifePercentage}
                    onChange={(e) => setCollegeData({ ...collegeData, greekLifePercentage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., 17%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={collegeData.website}
                    onChange={(e) => setCollegeData({ ...collegeData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://www.psu.edu"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={collegeData.description}
                    onChange={(e) => setCollegeData({ ...collegeData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Brief description of the college..."
                  />
                </div>

                <div>
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

                <div>
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

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save College</span>
                </button>
              </div>
            </form>
          )}

          {/* Chapter Form/Upload */}
          {activeTab === 'chapters' && (
            <>
              {uploadMode ? (
                <CSVUploader type="chapters" onDataParsed={handleChapterCSVUpload} />
              ) : (
            <form onSubmit={handleChapterSubmit} className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Chapter</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fraternity *
                  </label>
                  <select
                    required
                    value={chapterData.fraternityId}
                    onChange={(e) => setChapterData({ ...chapterData, fraternityId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Fraternity</option>
                    {fraternities.map((frat) => (
                      <option key={frat.id} value={frat.id}>{frat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chapter Name
                  </label>
                  <input
                    type="text"
                    value={chapterData.chapterName}
                    onChange={(e) => setChapterData({ ...chapterData, chapterName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Beta Psi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    College Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={chapterData.collegeName}
                    onChange={(e) => setChapterData({ ...chapterData, collegeName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Penn State University"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    College State *
                  </label>
                  <select
                    required
                    value={chapterData.collegeState}
                    onChange={(e) => setChapterData({ ...chapterData, collegeState: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Founded Year
                  </label>
                  <input
                    type="text"
                    value={chapterData.founded}
                    onChange={(e) => setChapterData({ ...chapterData, founded: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., 1994"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chapter Size
                  </label>
                  <input
                    type="number"
                    value={chapterData.size}
                    onChange={(e) => setChapterData({ ...chapterData, size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., 156"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Average GPA
                  </label>
                  <input
                    type="text"
                    value={chapterData.avgGPA}
                    onChange={(e) => setChapterData({ ...chapterData, avgGPA: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., 3.45"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={chapterData.website}
                    onChange={(e) => setChapterData({ ...chapterData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://www.pennstatesigmachi.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={chapterData.instagram}
                    onChange={(e) => setChapterData({ ...chapterData, instagram: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="@psusigmachi"
                  />
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Chapter House Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        value={chapterData.addressLine1}
                        onChange={(e) => setChapterData({ ...chapterData, addressLine1: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., 618 W College Ave"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={chapterData.addressLine2}
                        onChange={(e) => setChapterData({ ...chapterData, addressLine2: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={chapterData.city}
                        onChange={(e) => setChapterData({ ...chapterData, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., State College"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <select
                          value={chapterData.state}
                          onChange={(e) => setChapterData({ ...chapterData, state: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Select</option>
                          {states.map((state) => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={chapterData.zipCode}
                          onChange={(e) => setChapterData({ ...chapterData, zipCode: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., 16801"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Chapter</span>
                </button>
              </div>
            </form>
              )}
            </>
          )}

          {/* Contact Form/Upload */}
          {activeTab === 'contacts' && (
            <>
              {uploadMode ? (
                <CSVUploader type="contacts" onDataParsed={handleContactCSVUpload} />
              ) : (
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Chapter Contact</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chapter *
                  </label>
                  <select
                    required
                    value={contactData.chapterId}
                    onChange={(e) => setContactData({ ...contactData, chapterId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map((chapter) => (
                      <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <select
                    required
                    value={contactData.position}
                    onChange={(e) => setContactData({ ...contactData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    {positions.map((position) => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactData.name}
                    onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={contactData.phone}
                    onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Major
                  </label>
                  <input
                    type="text"
                    value={contactData.major}
                    onChange={(e) => setContactData({ ...contactData, major: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Business Administration"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    value={contactData.year}
                    onChange={(e) => setContactData({ ...contactData, year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Year</option>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={contactData.linkedIn}
                    onChange={(e) => setContactData({ ...contactData, linkedIn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Addresses *
                  </label>
                  {contactData.emails.map((email, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="email@university.edu"
                      />
                      {contactData.emails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEmail(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addEmailField}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Another Email</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Contact</span>
                </button>
              </div>
            </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;