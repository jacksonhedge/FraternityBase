import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Building2, MapPin, Calendar, TrendingUp, Award, Star, ExternalLink, ChevronRight, Mail, Phone, Info, UserPlus, Grid, List as ListIcon, Unlock, Lock, Clock, Instagram } from 'lucide-react';
import { getCollegeLogoWithFallback } from '../utils/collegeLogos';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const CollegeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'fraternities' | 'sororities' | 'map' | 'events' | 'partnerships'>('fraternities');
  const [fraternityViewMode, setFraternityViewMode] = useState<'grid' | 'list'>('grid');
  const [sororityViewMode, setSororityViewMode] = useState<'grid' | 'list'>('grid');
  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unlockedChapterIds, setUnlockedChapterIds] = useState<Set<string>>(new Set());
  const [interestedChapterIds, setInterestedChapterIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    console.log('==================================================');
    console.log('🏛️ [CollegeDetailPage] Component mounted');
    console.log('📍 [CollegeDetailPage] College ID from URL:', id);

    const fetchCollege = async () => {
      if (!id) {
        console.error('❌ [CollegeDetailPage] No college ID provided');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        console.log(`🌐 [CollegeDetailPage] Fetching all colleges from: ${API_URL}/admin/universities`);
        const res = await fetch(`${API_URL}/admin/universities`, { headers });
        const data = await res.json();

        console.log('📊 [CollegeDetailPage] API Response:', {
          success: data.success,
          totalCount: data.data?.length || 0
        });

        if (data.success && data.data) {
          // Find the specific university by ID
          const uni = data.data.find((u: any) => u.id === id);

          if (!uni) {
            console.error(`❌ [CollegeDetailPage] College with ID ${id} not found in database`);
            console.log('==================================================');
            setLoading(false);
            return;
          }
          console.log('✅ [CollegeDetailPage] Loaded college:', uni.name);

          // Fetch chapters for this college
          const chaptersRes = await fetch(`${API_URL}/chapters`, { headers });
          const chaptersData = await chaptersRes.json();

          let fraternities: any[] = [];
          let sororities: any[] = [];

          if (chaptersData.success && chaptersData.data) {
            // Filter chapters by university ID, not name (more reliable)
            const chapters = chaptersData.data.filter((ch: any) => ch.university_id === uni.id);

            fraternities = chapters.filter((ch: any) =>
              ch.greek_organizations?.organization_type === 'fraternity'
            );
            sororities = chapters.filter((ch: any) =>
              ch.greek_organizations?.organization_type === 'sorority'
            );

            console.log(`📊 [CollegeDetailPage] Found ${fraternities.length} fraternities, ${sororities.length} sororities`);
          }

          // Calculate knowledge score (0-100) based on available data
          const maleMembers = fraternities.reduce((sum: number, f: any) => sum + (f.member_count || 0), 0);
          const femaleMembers = sororities.reduce((sum: number, s: any) => sum + (s.member_count || 0), 0);
          const totalChapters = fraternities.length + sororities.length;
          const chaptersWithData = [...fraternities, ...sororities].filter((ch: any) => ch.member_count > 0).length;
          const knowledgeScore = totalChapters > 0 ? Math.round((chaptersWithData / totalChapters) * 100) : 0;

          setCollege({
            id: uni.id,
            name: uni.name,
            location: `${uni.state}`,
            state: uni.state,
            division: 'Division I',
            conference: uni.conference || 'Independent',
            students: uni.student_count || 30000,
            founded: 1831,
            mascot: '',
            greekLife: fraternities.length + sororities.length,
            greekPercentage: uni.student_count ? Math.round(((fraternities.length + sororities.length) / uni.student_count) * 100) : 0,
            image: uni.logo_url || getCollegeLogoWithFallback(uni.name),
            website: '',
            greekWebsite: '',
            greekContact: {
              name: 'Greek Life Office',
              title: 'Director of Fraternity and Sorority Life',
              email: '',
              phone: ''
            },
            stats: {
              fraternitiesCount: fraternities.length,
              sororitiesCount: sororities.length,
              maleMembers: maleMembers || 'N/A',
              femaleMembers: femaleMembers || 'N/A',
              knowledgeScore: knowledgeScore
            },
            fraternities: fraternities.map((ch: any) => ({
              id: ch.id,
              name: ch.greek_organizations?.name || 'Unknown',
              greekLetters: ch.greek_organizations?.greek_letters || '',
              chapterName: ch.chapter_name || '',
              founded: ch.founded_date ? new Date(ch.founded_date).getFullYear() : 0,
              members: ch.member_count || 0,
              house: ch.house_address || 'Unknown',
              gpa: 3.4,
              grade: ch.grade || 0,
              instagram: ch.instagram_handle || '',
              comingSoonDate: ch.coming_soon_date || null,
              headerImage: ch.header_image_url || ''
            })),
            sororities: sororities.map((ch: any) => ({
              id: ch.id,
              name: ch.greek_organizations?.name || 'Unknown',
              greekLetters: ch.greek_organizations?.greek_letters || '',
              chapterName: ch.chapter_name || '',
              founded: ch.founded_date ? new Date(ch.founded_date).getFullYear() : 0,
              members: ch.member_count || 0,
              house: ch.house_address || 'Unknown',
              gpa: 3.5,
              grade: ch.grade || 0,
              instagram: ch.instagram_handle || '',
              comingSoonDate: ch.coming_soon_date || null,
              headerImage: ch.header_image_url || ''
            })),
            upcomingEvents: []
          });

          console.log('==================================================');
        } else {
          console.error('❌ [CollegeDetailPage] Failed to load college');
        }
      } catch (error) {
        console.error('❌ [CollegeDetailPage] Error fetching college:', error);
        console.error('❌ [CollegeDetailPage] Error details:', error instanceof Error ? error.message : 'Unknown error');
        console.log('==================================================');
      } finally {
        setLoading(false);
      }
    };

    fetchCollege();
    fetchUnlockedChapters();
  }, [id]);

  const fetchUnlockedChapters = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const res = await fetch(`${API_URL}/chapters/unlocked`, { headers });
      const data = await res.json();

      if (data.success && data.data) {
        const unlockedIds = new Set<string>(data.data.map((chapter: any) => chapter.id as string));
        setUnlockedChapterIds(unlockedIds);
        console.log('🔓 [CollegeDetailPage] Loaded unlocked chapters:', unlockedIds.size);
      }
    } catch (error) {
      console.error('❌ [CollegeDetailPage] Error fetching unlocked chapters:', error);
    }
  };

  const handleChapterClick = (chapterId: string) => {
    if (unlockedChapterIds.has(chapterId)) {
      // If unlocked, go to My Chapters page
      navigate('/app/my-unlocked');
    } else {
      // If locked, go to chapter detail page
      navigate(`/app/chapters/${chapterId}`);
    }
  };

  const handleToggleInterested = (e: React.MouseEvent, chapterId: string) => {
    e.stopPropagation();
    setInterestedChapterIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading college details...</p>
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">College not found</p>
          <button
            onClick={() => navigate('/app/colleges')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to Colleges
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Animation */}
      <div className="relative h-80 bg-gradient-to-br from-blue-900 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute -inset-40 opacity-20">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute border border-white/20 rounded-full animate-pulse"
                style={{
                  width: `${300 + i * 100}px`,
                  height: `${300 + i * 100}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-8">
            <img
              src={college.image}
              alt={college.name}
              className="w-32 h-32 rounded-2xl shadow-2xl border-4 border-white/20 animate-fadeIn"
            />
            <div className="text-white animate-slideInRight">
              <h1 className="text-5xl font-bold mb-2">{college.name}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {college.location}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {college.division}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {college.conference}
                </span>
              </div>
              <div className="flex gap-6 mt-4">
                <div>
                  <p className="text-3xl font-bold">{college.greekLife}</p>
                  <p className="text-sm text-white/80">Greek Organizations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8 overflow-x-auto">
            {['overview', 'fraternities', 'sororities', 'map', 'events', 'partnerships'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-2 border-b-2 transition-colors capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="animate-fadeIn space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-2xl font-bold text-gray-900">{college.stats.fraternitiesCount}</p>
                <p className="text-sm text-gray-600">Fraternities</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-2xl font-bold text-gray-900">{college.stats.sororitiesCount}</p>
                <p className="text-sm text-gray-600">Sororities</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-2xl font-bold text-gray-900">{typeof college.stats.maleMembers === 'number' ? college.stats.maleMembers.toLocaleString() : college.stats.maleMembers}</p>
                <p className="text-sm text-gray-600">Male Members</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-2xl font-bold text-gray-900">{typeof college.stats.femaleMembers === 'number' ? college.stats.femaleMembers.toLocaleString() : college.stats.femaleMembers}</p>
                <p className="text-sm text-gray-600">Female Members</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 relative group">
                <p className="text-2xl font-bold text-gray-900">{college.stats.knowledgeScore}%</p>
                <div className="flex items-center gap-1">
                  <p className="text-sm text-gray-600">Knowledge Score</p>
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  How much data and insights we have on this Greek life community
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Greek Life Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold text-gray-900">{college.greekContact.name}</p>
                  <p className="text-gray-600">{college.greekContact.title}</p>
                  <div className="mt-3 space-y-2">
                    <a href={`mailto:${college.greekContact.email}`} className="flex items-center text-blue-600 hover:text-blue-700">
                      <Mail className="w-4 h-4 mr-2" />
                      {college.greekContact.email}
                    </a>
                    <a href={`tel:${college.greekContact.phone}`} className="flex items-center text-blue-600 hover:text-blue-700">
                      <Phone className="w-4 h-4 mr-2" />
                      {college.greekContact.phone}
                    </a>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Greek Life Website</p>
                  <a href={`https://${college.greekWebsite}`} target="_blank" rel="noopener noreferrer"
                     className="flex items-center text-blue-600 hover:text-blue-700">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {college.greekWebsite}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fraternities Tab */}
        {activeTab === 'fraternities' && (
          <div className="animate-fadeIn space-y-4">
            {/* Header with View Toggle */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Fraternities ({college.fraternities.length})
              </h3>
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFraternityViewMode('grid')}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    fraternityViewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setFraternityViewMode('list')}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    fraternityViewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List View"
                >
                  <ListIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Grid View */}
            {fraternityViewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {college.fraternities
                  .sort((a, b) => (b.grade || 0) - (a.grade || 0))
                  .map((frat, index) => {
                    const isUnlocked = unlockedChapterIds.has(frat.id);
                    return (
                      <div
                        key={frat.id}
                        onClick={() => handleChapterClick(frat.id)}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200 hover:border-blue-300 cursor-pointer group"
                      >
                        {/* Header Image */}
                        <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-700 relative">
                          {frat.headerImage ? (
                            <img
                              src={frat.headerImage}
                              alt={`${frat.name} header`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600" />
                          )}

                          {/* Status Badge */}
                          <div className="absolute top-2 right-2">
                            {isUnlocked ? (
                              <div className="bg-green-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-green-600">
                                <Unlock className="w-3.5 h-3.5 text-white" />
                                <span className="text-xs font-semibold text-white">Unlocked</span>
                              </div>
                            ) : frat.comingSoonDate ? (
                              <div className="bg-blue-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-blue-600">
                                <Clock className="w-3.5 h-3.5 text-white" />
                                <span className="text-xs font-semibold text-white">
                                  Coming {new Date(frat.comingSoonDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            ) : (
                              <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-gray-200">
                                <Lock className="w-3.5 h-3.5 text-gray-600" />
                                <span className="text-xs font-semibold text-gray-700">Locked</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {frat.name}
                              </h3>
                              {frat.chapterName && (
                                <p className="text-sm text-gray-600">{frat.chapterName}</p>
                              )}
                            </div>
                            {frat.grade > 0 && (
                              <span className={`px-2 py-1 font-bold rounded text-sm ${
                                frat.grade >= 5.0 ? 'bg-green-100 text-green-800' :
                                frat.grade >= 4.0 ? 'bg-yellow-100 text-yellow-800' :
                                frat.grade >= 3.0 ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {frat.grade.toFixed(1)}
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 mb-4">
                            {/* Member Icons with Fan Effect */}
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span className="flex items-center">
                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                Members
                              </span>
                              <div className="relative h-6 w-16 group">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className="absolute w-5 h-5 bg-blue-100 border border-blue-300 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-blue-200"
                                    style={{
                                      left: `${i * 8}px`,
                                      transform: `translateY(0px) rotate(0deg)`,
                                      zIndex: 5 - i,
                                    }}
                                    onMouseEnter={(e) => {
                                      const angle = (i - 2) * 15;
                                      const yOffset = Math.abs(i - 2) * 6;
                                      e.currentTarget.style.transform = `translateY(-${yOffset}px) rotate(${angle}deg)`;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = `translateY(0px) rotate(0deg)`;
                                    }}
                                  >
                                    <Users className="w-2.5 h-2.5 text-blue-600" />
                                  </div>
                                ))}
                              </div>
                            </div>
                            {frat.house && frat.house !== 'Unknown' && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                                {frat.house}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2 border-t border-gray-200">
                            {!isUnlocked && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChapterClick(frat.id);
                                }}
                                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                Click to Unlock
                              </button>
                            )}
                            <button
                              onClick={(e) => handleToggleInterested(e, frat.id)}
                              className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1.5 ${
                                interestedChapterIds.has(frat.id)
                                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${interestedChapterIds.has(frat.id) ? 'fill-white' : ''}`} />
                              {interestedChapterIds.has(frat.id) ? 'Interested' : 'Mark Interested'}
                            </button>
                          </div>

                          {frat.instagram && (
                            <div className="pt-4 border-t border-gray-200">
                              <div className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                                <Instagram className="w-4 h-4 mr-2" />
                                {frat.instagram.startsWith('@') ? frat.instagram : `@${frat.instagram}`}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* List View */}
            {fraternityViewMode === 'list' && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Organization
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Founded
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Members
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          House
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {college.fraternities
                        .sort((a, b) => (b.grade || 0) - (a.grade || 0))
                        .map((frat, index) => {
                          const isUnlocked = unlockedChapterIds.has(frat.id);
                          return (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {isUnlocked ? (
                                    <>
                                      <Unlock className="w-4 h-4 text-green-500" />
                                      <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                                        Unlocked
                                      </span>
                                    </>
                                  ) : frat.comingSoonDate ? (
                                    <>
                                      <Clock className="w-4 h-4 text-blue-500" />
                                      <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                        Coming {new Date(frat.comingSoonDate).toLocaleDateString()}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-4 h-4 text-gray-400" />
                                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                        Locked
                                      </span>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {frat.grade > 0 ? (
                                  <span className={`px-2 py-1 font-bold rounded text-sm ${
                                    frat.grade >= 5.0 ? 'bg-green-100 text-green-800' :
                                    frat.grade >= 4.0 ? 'bg-yellow-100 text-yellow-800' :
                                    frat.grade >= 3.0 ? 'bg-orange-100 text-orange-800' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {frat.grade.toFixed(1)}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-sm">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div
                                  className="flex items-center cursor-pointer"
                                  onClick={() => handleChapterClick(frat.id)}
                                >
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-blue-600 font-bold text-sm">
                                      {frat.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                      {frat.name}
                                    </div>
                                    {frat.chapterName && (
                                      <div className="text-sm text-gray-500">{frat.chapterName}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {frat.founded || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-semibold text-gray-900">
                                  {frat.members > 0 ? frat.members : '50+'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {frat.house && frat.house !== 'Unknown' ? frat.house : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleChapterClick(frat.id)}
                                  className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center gap-1"
                                >
                                  View
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sororities Tab */}
        {activeTab === 'sororities' && (
          <div className="animate-fadeIn space-y-4">
            {/* Header with View Toggle */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Sororities ({college.sororities.length})
              </h3>
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setSororityViewMode('grid')}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    sororityViewMode === 'grid'
                      ? 'bg-white text-pink-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSororityViewMode('list')}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    sororityViewMode === 'list'
                      ? 'bg-white text-pink-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List View"
                >
                  <ListIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Grid View */}
            {sororityViewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {college.sororities
                  .sort((a, b) => (b.grade || 0) - (a.grade || 0))
                  .map((sorority, index) => {
                    const isUnlocked = unlockedChapterIds.has(sorority.id);
                    return (
                      <div
                        key={sorority.id}
                        onClick={() => handleChapterClick(sorority.id)}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200 hover:border-pink-300 cursor-pointer group"
                      >
                        {/* Header Image */}
                        <div className="h-24 bg-gradient-to-r from-pink-500 to-purple-700 relative">
                          {sorority.headerImage ? (
                            <img
                              src={sorority.headerImage}
                              alt={`${sorority.name} header`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600" />
                          )}

                          {/* Status Badge */}
                          <div className="absolute top-2 right-2">
                            {isUnlocked ? (
                              <div className="bg-green-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-green-600">
                                <Unlock className="w-3.5 h-3.5 text-white" />
                                <span className="text-xs font-semibold text-white">Unlocked</span>
                              </div>
                            ) : sorority.comingSoonDate ? (
                              <div className="bg-blue-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-blue-600">
                                <Clock className="w-3.5 h-3.5 text-white" />
                                <span className="text-xs font-semibold text-white">
                                  Coming {new Date(sorority.comingSoonDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            ) : (
                              <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-gray-200">
                                <Lock className="w-3.5 h-3.5 text-gray-600" />
                                <span className="text-xs font-semibold text-gray-700">Locked</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                                {sorority.name}
                              </h3>
                              {sorority.chapterName && (
                                <p className="text-sm text-gray-600">{sorority.chapterName}</p>
                              )}
                            </div>
                            {sorority.grade > 0 && (
                              <span className={`px-2 py-1 font-bold rounded text-sm ${
                                sorority.grade >= 5.0 ? 'bg-green-100 text-green-800' :
                                sorority.grade >= 4.0 ? 'bg-yellow-100 text-yellow-800' :
                                sorority.grade >= 3.0 ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {sorority.grade.toFixed(1)}
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 mb-4">
                            {/* Member Icons with Fan Effect */}
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span className="flex items-center">
                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                Members
                              </span>
                              <div className="relative h-6 w-16 group">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className="absolute w-5 h-5 bg-pink-100 border border-pink-300 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-pink-200"
                                    style={{
                                      left: `${i * 8}px`,
                                      transform: `translateY(0px) rotate(0deg)`,
                                      zIndex: 5 - i,
                                    }}
                                    onMouseEnter={(e) => {
                                      const angle = (i - 2) * 15;
                                      const yOffset = Math.abs(i - 2) * 6;
                                      e.currentTarget.style.transform = `translateY(-${yOffset}px) rotate(${angle}deg)`;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = `translateY(0px) rotate(0deg)`;
                                    }}
                                  >
                                    <Users className="w-2.5 h-2.5 text-pink-600" />
                                  </div>
                                ))}
                              </div>
                            </div>
                            {sorority.house && sorority.house !== 'Unknown' && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                                {sorority.house}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2 border-t border-gray-200">
                            {!isUnlocked && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChapterClick(sorority.id);
                                }}
                                className="flex-1 px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                Click to Unlock
                              </button>
                            )}
                            <button
                              onClick={(e) => handleToggleInterested(e, sorority.id)}
                              className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1.5 ${
                                interestedChapterIds.has(sorority.id)
                                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${interestedChapterIds.has(sorority.id) ? 'fill-white' : ''}`} />
                              {interestedChapterIds.has(sorority.id) ? 'Interested' : 'Mark Interested'}
                            </button>
                          </div>

                          {sorority.instagram && (
                            <div className="pt-4 border-t border-gray-200">
                              <div className="flex items-center text-sm text-pink-600 hover:text-pink-700">
                                <Instagram className="w-4 h-4 mr-2" />
                                {sorority.instagram.startsWith('@') ? sorority.instagram : `@${sorority.instagram}`}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* List View */}
            {sororityViewMode === 'list' && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Organization
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Founded
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Members
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          House
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {college.sororities
                        .sort((a, b) => (b.grade || 0) - (a.grade || 0))
                        .map((sorority, index) => {
                          const isUnlocked = unlockedChapterIds.has(sorority.id);
                          return (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {isUnlocked ? (
                                    <>
                                      <Unlock className="w-4 h-4 text-green-500" />
                                      <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                                        Unlocked
                                      </span>
                                    </>
                                  ) : sorority.comingSoonDate ? (
                                    <>
                                      <Clock className="w-4 h-4 text-blue-500" />
                                      <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                        Coming {new Date(sorority.comingSoonDate).toLocaleDateString()}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-4 h-4 text-gray-400" />
                                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                        Locked
                                      </span>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {sorority.grade > 0 ? (
                                  <span className={`px-2 py-1 font-bold rounded text-sm ${
                                    sorority.grade >= 5.0 ? 'bg-green-100 text-green-800' :
                                    sorority.grade >= 4.0 ? 'bg-yellow-100 text-yellow-800' :
                                    sorority.grade >= 3.0 ? 'bg-orange-100 text-orange-800' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {sorority.grade.toFixed(1)}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-sm">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div
                                  className="flex items-center cursor-pointer"
                                  onClick={() => handleChapterClick(sorority.id)}
                                >
                                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-pink-600 font-bold text-sm">
                                      {sorority.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 hover:text-pink-600 transition-colors">
                                      {sorority.name}
                                    </div>
                                    {sorority.chapterName && (
                                      <div className="text-sm text-gray-500">{sorority.chapterName}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {sorority.founded || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-semibold text-gray-900">
                                  {sorority.members > 0 ? sorority.members : '50+'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {sorority.house && sorority.house !== 'Unknown' ? sorority.house : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleChapterClick(sorority.id)}
                                  className="text-pink-600 hover:text-pink-900 text-sm font-medium flex items-center gap-1"
                                >
                                  View
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-600">Interactive campus map will be available soon.</p>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-600">Greek life events and calendar will be available soon.</p>
            </div>
          </div>
        )}

        {/* Partnerships Tab */}
        {activeTab === 'partnerships' && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-600">Partnership opportunities and collaborations will be available soon.</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CollegeDetailPage;