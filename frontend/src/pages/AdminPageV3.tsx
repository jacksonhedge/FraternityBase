import { useState, useEffect } from 'react';
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
  Image as ImageIcon,
  Activity,
  BarChart3,
  Clock,
  AlertCircle,
  ChevronDown,
  Star,
  Zap,
  Target,
  Layers,
  BookOpen
} from 'lucide-react';

const AdminPageV3 = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'fraternities' | 'colleges' | 'chapters' | 'contacts' | 'waitlist'>('waitlist');
  const [uploadMode, setUploadMode] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

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

  // Waitlist state
  const [waitlistData, setWaitlistData] = useState({
    entries: [],
    stats: {
      total: 0,
      today: 0,
      thisWeek: 0
    }
  });
  const [waitlistLoading, setWaitlistLoading] = useState(false);

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

  // Enhanced stats with animations
  const stats = [
    {
      label: 'Total Fraternities',
      value: '24',
      icon: Building2,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-100 to-cyan-100',
      change: '+12%',
      trend: 'up'
    },
    {
      label: 'Total Colleges',
      value: '156',
      icon: GraduationCap,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-100 to-pink-100',
      change: '+8%',
      trend: 'up'
    },
    {
      label: 'Active Chapters',
      value: '342',
      icon: Users,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'from-emerald-100 to-green-100',
      change: '+23%',
      trend: 'up'
    },
    {
      label: 'Total Contacts',
      value: '1,248',
      icon: UserCheck,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-100 to-red-100',
      change: '+31%',
      trend: 'up'
    }
  ];

  const tabs = [
    { id: 'waitlist', label: 'Waitlist', icon: Mail, color: 'from-green-500 to-emerald-500' },
    { id: 'fraternities', label: 'Fraternities', icon: Building2, color: 'from-blue-500 to-cyan-500' },
    { id: 'colleges', label: 'Colleges', icon: GraduationCap, color: 'from-purple-500 to-pink-500' },
    { id: 'chapters', label: 'Chapters', icon: Users, color: 'from-emerald-500 to-green-500' },
    { id: 'contacts', label: 'Contacts', icon: UserCheck, color: 'from-orange-500 to-red-500' }
  ];

  // Form submission handlers
  const handleFraternitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

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
    setIsLoading(false);
  };

  const handleCollegeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

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
    setIsLoading(false);
  };

  const handleChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

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
    setIsLoading(false);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

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
    setIsLoading(false);
  };

  // Waitlist data fetching
  const fetchWaitlistData = async () => {
    setWaitlistLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/admin/waitlist');
      const data = await response.json();

      if (data.success) {
        setWaitlistData(data.data);
      } else {
        console.error('Failed to fetch waitlist data:', data.error);
      }
    } catch (error) {
      console.error('Error fetching waitlist data:', error);
    } finally {
      setWaitlistLoading(false);
    }
  };

  // Load waitlist data when tab is selected
  useEffect(() => {
    if (activeTab === 'waitlist') {
      fetchWaitlistData();
    }
  }, [activeTab]);

  // CSV handlers
  const handleFraternityCSVUpload = (data: any[]) => {
    console.log('Fraternity CSV data:', data);
  };

  const handleChapterCSVUpload = (data: any[]) => {
    console.log('Chapter CSV data:', data);
  };

  const handleContactCSVUpload = (data: any[]) => {
    console.log('Contact CSV data:', data);
  };

  // Email management
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-purple-100/20 animate-pulse" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239CA3AF' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>
      </div>

      {/* Premium Header */}
      <div className="relative bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-green-500 via-blue-500 to-green-500 animate-shimmer bg-[length:200%_100%]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {/* Logo with baseball cap */}
                <span className="text-4xl">🧢</span>

                <div>
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col -space-y-1">
                      <h1 className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'cursive', letterSpacing: '-0.5px' }}>
                        Fraternity Base
                      </h1>
                    </div>
                    <Zap className="w-5 h-5 text-yellow-500 animate-bounce-subtle" />
                  </div>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin Dashboard
                    <span className="ml-2 text-xs text-green-600 font-medium animate-pulse">● Live</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-full border border-amber-200">
                <Activity className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">System Active</span>
              </div>

              <button
                onClick={handleLogout}
                className="relative group px-6 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full font-medium shadow-lg overflow-hidden"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 animate-scale-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 flex items-center space-x-4 border-l-4 border-green-500">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Success!</p>
              <p className="text-sm text-gray-600">Data has been saved successfully</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredStat(index)}
              onMouseLeave={() => setHoveredStat(null)}
              className="relative group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`
                absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur-xl opacity-20
                group-hover:opacity-40 transition-opacity duration-300
              `} />

              <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`
                    p-3 rounded-xl bg-gradient-to-r ${stat.bgColor}
                    ${hoveredStat === index ? 'animate-float' : ''}
                  `}>
                    <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{
                      fill: 'currentColor',
                      stroke: 'url(#gradient)',
                    }} />
                  </div>

                  <div className="flex items-center space-x-1">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-semibold ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-1 animate-fade-in-up">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-500">{stat.label}</p>

                <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`
                    h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000
                    ${hoveredStat === index ? 'w-full' : 'w-3/4'}
                  `} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Card */}
        <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Tab Navigation */}
          <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-200">
            <div className="flex space-x-2 p-2">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    relative flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300
                    flex items-center justify-center space-x-2 group
                    ${activeTab === tab.id ? '' : 'hover:bg-gray-100'}
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {activeTab === tab.id && (
                    <div className={`
                      absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl
                      animate-scale-in shadow-lg
                    `} />
                  )}

                  <tab.icon className={`
                    w-4 h-4 relative z-10 transition-colors duration-300
                    ${activeTab === tab.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}
                  `} />
                  <span className={`
                    relative z-10 transition-colors duration-300
                    ${activeTab === tab.id ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'}
                  `}>
                    {tab.label}
                  </span>

                  {activeTab === tab.id && (
                    <Star className="w-4 h-4 text-white relative z-10 animate-bounce-subtle" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {/* Section Header */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Sparkles className="w-6 h-6 text-yellow-500 animate-float" />
                  <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-30 animate-pulse" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 animate-fade-in">
                    {activeTab === 'waitlist' && 'Waitlist Management'}
                    {activeTab === 'fraternities' && 'Fraternity Management'}
                    {activeTab === 'colleges' && 'College Management'}
                    {activeTab === 'chapters' && 'Chapter Management'}
                    {activeTab === 'contacts' && 'Contact Management'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Add and manage your {activeTab} data efficiently
                  </p>
                </div>
              </div>

              {activeTab !== 'colleges' && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-20" />
                  <div className="relative flex items-center bg-gradient-to-r from-gray-100 to-gray-50 rounded-full p-1 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setUploadMode(false)}
                      className={`
                        px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                        flex items-center space-x-2
                        ${!uploadMode
                          ? 'bg-white text-gray-900 shadow-lg transform scale-105'
                          : 'text-gray-500 hover:text-gray-700'
                        }
                      `}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Manual Entry</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode(true)}
                      className={`
                        px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                        flex items-center space-x-2
                        ${uploadMode
                          ? 'bg-white text-gray-900 shadow-lg transform scale-105'
                          : 'text-gray-500 hover:text-gray-700'
                        }
                      `}
                    >
                      <Upload className="w-4 h-4" />
                      <span>CSV Upload</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Fraternity Form/Upload */}
            {activeTab === 'waitlist' && (
              <div className="animate-fade-in-up">
                {/* Waitlist Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{waitlistData.stats.total}</span>
                    </div>
                    <h3 className="font-semibold text-gray-700">Total Signups</h3>
                    <p className="text-sm text-gray-500">All time waitlist entries</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{waitlistData.stats.today}</span>
                    </div>
                    <h3 className="font-semibold text-gray-700">Today</h3>
                    <p className="text-sm text-gray-500">New signups today</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{waitlistData.stats.thisWeek}</span>
                    </div>
                    <h3 className="font-semibold text-gray-700">This Week</h3>
                    <p className="text-sm text-gray-500">Past 7 days</p>
                  </div>
                </div>

                {/* Waitlist Table */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Waitlist Entries</h3>
                      <button
                        onClick={fetchWaitlistData}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Activity className="w-4 h-4" />
                        Refresh
                      </button>
                    </div>
                  </div>

                  {waitlistLoading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading waitlist data...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-semibold text-gray-700">Email</th>
                            <th className="text-left p-4 font-semibold text-gray-700">Source</th>
                            <th className="text-left p-4 font-semibold text-gray-700">Signup Date</th>
                            <th className="text-left p-4 font-semibold text-gray-700">Referrer</th>
                          </tr>
                        </thead>
                        <tbody>
                          {waitlistData.entries.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center p-8 text-gray-500">
                                No waitlist entries yet. Start marketing to get your first signups!
                              </td>
                            </tr>
                          ) : (
                            waitlistData.entries.map((entry: any) => (
                              <tr key={entry.id} className="border-t border-gray-100 hover:bg-gray-50">
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">{entry.email}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                    {entry.source || 'landing'}
                                  </span>
                                </td>
                                <td className="p-4 text-gray-600">
                                  {new Date(entry.signup_date).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-gray-500 text-sm truncate max-w-xs">
                                  {entry.referrer || 'Direct'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'fraternities' && (
              <>
                {uploadMode ? (
                  <div className="animate-fade-in-up">
                    <CSVUploader type="fraternities" onDataParsed={handleFraternityCSVUpload} />
                  </div>
                ) : (
                  <form onSubmit={handleFraternitySubmit} className="space-y-8 animate-fade-in-up">
                    {/* Form Header Card */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-white">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-32 -translate-y-32" />
                      <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                            <Plus className="w-6 h-6" />
                          </div>
                          <h3 className="text-2xl font-bold">Add New Fraternity</h3>
                        </div>
                        <p className="text-blue-50 max-w-2xl">
                          Enter the details for a new fraternity organization to expand your network
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Basic Information */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                        </div>

                        <div className="space-y-5">
                          <div className="group">
                            <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                              Fraternity Name *
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={fraternityData.name}
                                onChange={(e) => setFraternityData({ ...fraternityData, name: e.target.value })}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-900 font-medium"
                                placeholder="e.g., Sigma Chi"
                              />
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
                            </div>
                          </div>

                          <div className="group">
                            <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                              Greek Letters
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={fraternityData.greekLetters}
                                onChange={(e) => setFraternityData({ ...fraternityData, greekLetters: e.target.value })}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-900 font-medium"
                                placeholder="e.g., ΣΧ"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                              <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                                Founded Year
                              </label>
                              <input
                                type="text"
                                value={fraternityData.founded}
                                onChange={(e) => setFraternityData({ ...fraternityData, founded: e.target.value })}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                placeholder="e.g., 1855"
                              />
                            </div>

                            <div className="group">
                              <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                                Headquarters
                              </label>
                              <input
                                type="text"
                                value={fraternityData.headquarters}
                                onChange={(e) => setFraternityData({ ...fraternityData, headquarters: e.target.value })}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                placeholder="e.g., Evanston, IL"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Statistics & Details */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Statistics & Details</h4>
                        </div>

                        <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                              <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-purple-600 transition-colors">
                                Total Chapters
                              </label>
                              <div className="relative">
                                <Hash className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                  type="number"
                                  value={fraternityData.totalChapters}
                                  onChange={(e) => setFraternityData({ ...fraternityData, totalChapters: e.target.value })}
                                  className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                                  placeholder="e.g., 241"
                                />
                              </div>
                            </div>

                            <div className="group">
                              <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-purple-600 transition-colors">
                                Total Members
                              </label>
                              <div className="relative">
                                <Users className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                  type="number"
                                  value={fraternityData.totalMembers}
                                  onChange={(e) => setFraternityData({ ...fraternityData, totalMembers: e.target.value })}
                                  className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                                  placeholder="e.g., 350000"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="group">
                            <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-purple-600 transition-colors">
                              Website
                            </label>
                            <div className="relative">
                              <Globe className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                              <input
                                type="url"
                                value={fraternityData.website}
                                onChange={(e) => setFraternityData({ ...fraternityData, website: e.target.value })}
                                className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                                placeholder="https://www.sigmachi.org"
                              />
                            </div>
                          </div>

                          <div className="group">
                            <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-purple-600 transition-colors">
                              Description
                            </label>
                            <div className="relative">
                              <textarea
                                value={fraternityData.description}
                                onChange={(e) => setFraternityData({ ...fraternityData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all resize-none"
                                placeholder="Brief description of the fraternity..."
                              />
                              <BookOpen className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Logo Upload Section */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="p-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg">
                            <ImageIcon className="w-5 h-5 text-amber-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Visual Assets</h4>
                        </div>

                        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-amber-100">
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

                    {/* Form Actions */}
                    <div className="flex justify-between items-center pt-8 border-t-2 border-gray-100">
                      <button
                        type="button"
                        className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900 transition-colors flex items-center space-x-2"
                      >
                        <X className="w-5 h-5" />
                        <span>Cancel</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`
                          relative px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl
                          font-semibold shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5
                          transition-all duration-300 flex items-center space-x-3 group overflow-hidden
                          ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
                        `}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity" />

                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
                            <span className="relative z-10">Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 relative z-10" />
                            <span className="relative z-10">Save Fraternity</span>
                            <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* Add similar enhanced forms for colleges, chapters, and contacts tabs */}
            {/* ... rest of the forms with similar premium styling ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPageV3;