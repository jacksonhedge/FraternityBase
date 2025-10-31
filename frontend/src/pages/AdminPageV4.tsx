import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Building2,
  Users,
  UserCheck,
  Save,
  X,
  Edit,
  Edit2,
  Check,
  Trash2,
  LogOut,
  Shield,
  Upload,
  GraduationCap,
  Eye,
  EyeOff,
  Search,
  Briefcase,
  Home,
  BarChart3,
  Lock,
  Mail,
  DollarSign,
  TrendingUp,
  CreditCard,
  UserPlus,
  Star,
  Activity,
  ShoppingCart,
  Unlock,
  Handshake,
  FileUp,
  Rocket,
  ChevronDown,
  Loader,
  Sparkles,
  AlertCircle,
  Heart
} from 'lucide-react';
import ChapterEditModal from '../components/ChapterEditModal';
import PaymentsRevenueTab from '../components/admin/PaymentsRevenueTab';
import ActivityLogsTab from '../components/admin/ActivityLogsTab';
import AmbassadorsAdmin from '../components/AmbassadorsAdmin';
import RoadmapAdmin from '../components/RoadmapAdmin';
import AdminNotificationCenter from '../components/AdminNotificationCenter';
import UnlocksTab from '../components/admin/UnlocksTab';
import IntroductionRequestsTab from '../components/admin/IntroductionRequestsTab';
import FraternityUsersTab from '../components/admin/FraternityUsersTab';
import CompanyProfileTab from '../components/admin/CompanyProfileTab';
import { getCollegeLogoWithFallback } from '../utils/collegeLogos';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get admin headers with token
const getAdminHeaders = (contentType = 'application/json') => {
  const adminToken = sessionStorage.getItem('adminToken') || import.meta.env.VITE_ADMIN_TOKEN || '';
  return {
    'Content-Type': contentType,
    'x-admin-token': adminToken
  };
};

interface GreekOrg {
  id: string;
  name: string;
  greek_letters?: string;
  organization_type: 'fraternity' | 'sorority';
  founded_year?: number;
  national_website?: string;
  topColleges?: Array<{
    id: string;
    name: string;
    logo_url: string;
    chapterCount: number;
  }>;
}

interface University {
  id: string;
  name: string;
  location: string;
  state: string;
  student_count?: number;
  greek_percentage?: number;
  website?: string;
  logo_url?: string;
  chapter_count?: number;
  bars_nearby?: number;
  unlock_count?: number;
  conference?: string;
  division?: string;
  show_in_dashboard?: boolean;
  created_at?: string;
}

interface Chapter {
  id: string;
  greek_organization_id: string;
  university_id: string;
  chapter_name: string;
  member_count?: number;
  status: string;
  charter_date?: string;
  house_address?: string;
  instagram_handle?: string;
  website?: string;
  contact_email?: string;
  phone?: string;
  engagement_score?: number;
  partnership_openness?: string;
  event_frequency?: number;
  grade?: number;
  is_favorite?: boolean;
  is_viewable?: boolean;
  is_platinum?: boolean;
  is_diamond?: boolean;
  coming_soon_date?: string;
  show_in_dashboard?: boolean;
  created_at?: string;
  greek_organizations?: { name: string; organization_type: 'fraternity' | 'sorority' };
  universities?: { name: string; state: string };
}

interface User {
  id: string;
  chapter_id: string;
  name: string;
  position: string;
  member_type?: 'user' | 'member' | 'alumni' | 'advisor';
  email?: string;
  phone?: string;
  linkedin_profile?: string;
  graduation_year?: number;
  major?: string;
  is_primary_contact?: boolean;
  is_pinned?: boolean;
  created_at?: string;
  chapters?: {
    chapter_name: string;
    greek_organizations: { name: string; organization_type: 'fraternity' | 'sorority' };
    universities: { name: string };
  };
}

interface Company {
  id: string;
  company_name: string;
  email: string;
  credits_balance: number;
  created_at: string;
  total_spent?: number;
  unlocks?: ChapterUnlock[];
  approval_status?: 'pending' | 'approved' | 'rejected';
  subscription_tier?: string;
  description?: string;
}

interface ChapterUnlock {
  id: string;
  chapter_id: string;
  unlock_type: string;
  amount_paid: number;
  unlocked_at: string;
  chapters?: {
    chapter_name: string;
    grade?: number;
    greek_organizations: { name: string; organization_type: 'fraternity' | 'sorority' };
    universities: { name: string };
  };
}

interface WaitlistEntry {
  id: string;
  email: string;
  source?: string;
  referrer?: string;
  signup_date: string;
}

interface ActivityLogEntry {
  id: string;
  event_type: 'purchase' | 'new_client' | 'unlock' | 'warm_intro_request' | 'admin_upload';
  event_title: string;
  event_description: string;
  company_id?: string;
  company_name?: string;
  reference_id?: string;
  reference_type?: string;
  metadata?: any;
  created_at: string;
}

interface CompanyUser {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  member_number?: number;
  role: string;
  status?: string;
  joined_at?: string;
  created_at: string;
}

interface BalanceTransaction {
  id: string;
  amount: number;
  description: string;
  reference_type: string;
  created_at: string;
}

interface CompanyDetail extends Company {
  users: CompanyUser[];
  transactions: BalanceTransaction[];
}

const AdminPageV4 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Define tab type
  type AdminTab =
    'dashboard' | 'companies' | 'fraternities' | 'colleges' | 'chapters' | 'ambassadors' | 'users' | 'fraternity-users' | 'waitlist' |
    'payments' | 'unlocks' | 'credits' | 'intelligence' | 'analytics' | 'activity' | 'roadmap' | 'coming-tomorrow' |
    'wizard-admin' | 'college-clubs' | 'intro-requests' | 'diamond-chapters' | string;

  // Derive active tab from URL path
  const activeTab: AdminTab = (location.pathname.split('/')[2] || 'dashboard') as AdminTab;
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Data states
  const [greekOrgs, setGreekOrgs] = useState<GreekOrg[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [diamondChapters, setDiamondChapters] = useState<Chapter[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [comingTomorrowItems, setComingTomorrowItems] = useState<any[]>([]);
  const [editingComingTomorrowItem, setEditingComingTomorrowItem] = useState<any | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [activityVisibleCount, setActivityVisibleCount] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [pendingIntroRequests, setPendingIntroRequests] = useState(0);

  // Introduction requests state
  const [introRequests, setIntroRequests] = useState<any[]>([]);
  const [introRequestsLoading, setIntroRequestsLoading] = useState(false);
  const [introRequestsFilter, setIntroRequestsFilter] = useState<string>('all');

  // Wizard admin states
  const [isWizardAdmin, setIsWizardAdmin] = useState(false);
  const [wizardCompanies, setWizardCompanies] = useState<any[]>([]);
  const [wizardSession, setWizardSession] = useState<any>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [collegeOrderBy, setCollegeOrderBy] = useState<'name' | 'state' | 'chapters' | 'big10' | 'conference' | 'recent'>('name');
  const [collegeFilter, setCollegeFilter] = useState<string>('all');
  const [chapterOrderBy, setChapterOrderBy] = useState<'name' | 'university' | 'grade' | 'recent'>('grade');
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetail | null>(null);
  const [showCompanyDetail, setShowCompanyDetail] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<{ connected: boolean; model: string } | null>(null);
  const [aiConversationId, setAiConversationId] = useState<string | null>(null);
  const [aiHistory, setAiHistory] = useState<Array<{role: string; content: string; timestamp: number}>>([]);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // CSV Paste Modal states
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteChapterId, setPasteChapterId] = useState('');
  const [pasteCSVText, setPasteCSVText] = useState('');
  const [pasteLoading, setPasteLoading] = useState(false);
  const [pasteResult, setPasteResult] = useState<any>(null);
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [universitySearchTerm, setUniversitySearchTerm] = useState('');
  const [chapterSearchTerm, setChapterSearchTerm] = useState('');
  const [orgTypeFilter, setOrgTypeFilter] = useState<'all' | 'fraternity' | 'sorority'>('all');
  const [selectedFraternityFilter, setSelectedFraternityFilter] = useState<string>('all');
  const [recentFilter, setRecentFilter] = useState<'all' | '24h' | '7d' | '30d'>('all');

  // Form states
  const [fraternityForm, setFraternityForm] = useState({
    name: '',
    greek_letters: '',
    organization_type: 'fraternity' as 'fraternity' | 'sorority',
    founded_year: '',
    national_website: '',
    total_chapters: '',
    colors: '',
    symbols: '',
    philanthropy: ''
  });

  const [universityForm, setUniversityForm] = useState({
    name: '',
    location: '',
    state: '',
    conference: '',
    student_count: '',
    greek_percentage: '',
    website: '',
    logo_url: '',
    logoFile: null as File | null,
    bars_nearby: '',
    unlock_count: ''
  });

  const [chapterForm, setChapterForm] = useState({
    greek_organization_id: '',
    university_id: '',
    chapter_name: '',
    charter_date: '',
    member_count: '',
    status: 'active',
    house_address: '',
    instagram_handle: '',
    website: '',
    contact_email: '',
    phone: '',
    engagement_score: '75',
    partnership_openness: 'open',
    event_frequency: '20',
    grade: '',
    is_favorite: false,
    is_viewable: false,
    is_platinum: false,
    is_diamond: false,
    coming_soon_date: ''
  });

  const [quickAddText, setQuickAddText] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const [userForm, setUserForm] = useState({
    chapter_id: '',
    name: '',
    position: 'President',
    member_type: 'member' as 'user' | 'member' | 'alumni' | 'advisor',
    email: '',
    phone: '',
    linkedin_profile: '',
    graduation_year: '',
    major: '',
    is_primary_contact: false
  });

  const [comingTomorrowForm, setComingTomorrowForm] = useState({
    college_name: '',
    university_id: '',
    anticipated_score: '',
    update_type: 'new_chapter' as 'new_chapter' | 'roster_update' | 'new_sorority',
    expected_member_count: '',
    chapter_name: '',
    scheduled_date: ''
  });

  // Fetch data on mount and tab change
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // 🔧 FIX: Clear search when tab changes to prevent search state persistence
  useEffect(() => {
    setSearchTerm('');
  }, [activeTab]);

  // Check AI status on mount
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/ai-status`, { headers: getAdminHeaders() });
        const data = await res.json();
        setAiStatus(data);
      } catch (error) {
        console.error('AI status check failed:', error);
        setAiStatus({ connected: false, model: 'Unknown' });
      }
    };
    checkAIStatus();
  }, []);

  // Check wizard admin status
  useEffect(() => {
    const checkWizardStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/wizard/status`, {
          headers: getAdminHeaders()
        });
        const data = await response.json();
        setIsWizardAdmin(data.isWizardAdmin);
      } catch (error) {
        console.error('Error checking wizard status:', error);
      }
    };
    checkWizardStatus();
  }, []);

  // Fetch pending introduction requests count for notification badge
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/introduction-requests/pending-count`, {
          headers: getAdminHeaders()
        });
        const data = await response.json();
        if (data.success) {
          setPendingIntroRequests(data.count);
        }
      } catch (error) {
        console.error('Error fetching pending intro requests count:', error);
      }
    };

    fetchPendingCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      if (activeTab === 'dashboard') {
        // Fetch summary stats for dashboard
        const activityRes = await fetch(`${API_URL}/admin/activity-feed?limit=20`, { headers: getAdminHeaders() });
        const activityData = await activityRes.json();
        setActivityLog(activityData.data || []);
      } else if (activeTab === 'companies') {
        const res = await fetch(`${API_URL}/admin/companies`, { headers: getAdminHeaders() });
        const data = await res.json();
        setCompanies(data.data || []);
      } else if (activeTab === 'fraternities') {
        const res = await fetch(`${API_URL}/admin/greek-organizations`, { headers: getAdminHeaders() });
        const data = await res.json();
        setGreekOrgs(data.data || []);
      } else if (activeTab === 'colleges') {
        const res = await fetch(`${API_URL}/admin/universities`, { headers: getAdminHeaders() });
        const data = await res.json();
        console.log('🏫 Loaded universities:', data.data?.length || 0);
        console.log('🏫 USC check:', data.data?.find((u: any) => u.name.includes('Southern California')));

        // Check for West Virginia University
        const wvuData = data.data?.filter((u: any) => u.name.includes('West Virginia'));
        console.log('🏈 WVU Data Check:', {
          totalUniversities: data.data?.length || 0,
          wvuFound: wvuData?.length || 0,
          wvuEntries: wvuData
        });

        setUniversities(data.data || []);
      } else if (activeTab === 'chapters') {
        console.log('[Chapters View] 📊 Fetching chapters data...');
        const [orgsRes, unisRes, chaptersRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/admin/greek-organizations`, { headers: getAdminHeaders() }),
          fetch(`${API_URL}/admin/universities`, { headers: getAdminHeaders() }),
          fetch(`${API_URL}/admin/chapters`, { headers: getAdminHeaders() }),
          fetch(`${API_URL}/admin/officers`, { headers: getAdminHeaders() })
        ]);
        const [orgsData, unisData, chaptersData, usersData] = await Promise.all([
          orgsRes.json(),
          unisRes.json(),
          chaptersRes.json(),
          usersRes.json()
        ]);
        console.log('[Chapters View] ✅ Data fetched:', {
          greekOrgs: orgsData.data?.length || 0,
          universities: unisData.data?.length || 0,
          chapters: chaptersData.data?.length || 0,
          officers: usersData.data?.length || 0
        });
        console.log('[Chapters View] Sample chapters:', chaptersData.data?.slice(0, 3));
        setGreekOrgs(orgsData.data || []);
        setUniversities(unisData.data || []);
        setChapters(chaptersData.data || []);
        setUsers(usersData.data || []);
      } else if (activeTab === 'users') {
        console.log('📊 Loading Users tab data...');
        const [chaptersRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/admin/chapters`, { headers: getAdminHeaders() }),
          fetch(`${API_URL}/admin/officers`, { headers: getAdminHeaders() })
        ]);
        const [chaptersData, usersData] = await Promise.all([
          chaptersRes.json(),
          usersRes.json()
        ]);
        console.log('✅ Users data loaded:', {
          totalUsers: usersData.data?.length || 0,
          sampleUser: usersData.data?.[0],
          totalChapters: chaptersData.data?.length || 0
        });
        setChapters(chaptersData.data || []);
        setUsers(usersData.data || []);
      } else if (activeTab === 'waitlist') {
        const res = await fetch(`${API_URL}/admin/waitlist`, { headers: getAdminHeaders() });
        const data = await res.json();
        setWaitlistEntries(data.data || []);
      } else if (activeTab === 'coming-tomorrow') {
        const [comingRes, unisRes] = await Promise.all([
          fetch(`${API_URL}/admin/coming-tomorrow`, { headers: getAdminHeaders() }),
          fetch(`${API_URL}/admin/universities`, { headers: getAdminHeaders() })
        ]);
        const [comingData, unisData] = await Promise.all([
          comingRes.json(),
          unisRes.json()
        ]);
        setComingTomorrowItems(comingData.data || []);
        setUniversities(unisData.data || []);
      } else if (activeTab === 'wizard-admin' && isWizardAdmin) {
        // Fetch companies and current session
        const [companiesRes, sessionRes] = await Promise.all([
          fetch(`${API_URL}/wizard/companies`, {
            headers: getAdminHeaders()
          }),
          fetch(`${API_URL}/wizard/current-session`, {
            headers: getAdminHeaders()
          })
        ]);
        const companiesData = await companiesRes.json();
        const sessionData = await sessionRes.json();
        setWizardCompanies(companiesData.companies || []);
        setWizardSession(sessionData.session);
      } else if (activeTab === 'intro-requests') {
        setIntroRequestsLoading(true);
        const res = await fetch(`${API_URL}/credits/warm-intro/admin/all`, { headers: getAdminHeaders() });
        const data = await res.json();
        setIntroRequests(data.requests || []);
        setIntroRequestsLoading(false);
      } else if (activeTab === 'diamond-chapters') {
        console.log('[Diamond Chapters View] 💎 Fetching diamond chapters data...');
        const res = await fetch(`${API_URL}/admin/chapters?is_diamond=true`, { headers: getAdminHeaders() });
        const data = await res.json();
        console.log('💎 Loaded diamond chapters:', data.data?.length || 0);
        setDiamondChapters(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setIntroRequestsLoading(false);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchCompanyDetails = async (companyId: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/companies/${companyId}`, { headers: getAdminHeaders() });
      const data = await res.json();
      console.log('Fetched company details:', data);
      if (data.success) {
        console.log('Credits balance from API:', data.data.credits_balance);
        setSelectedCompany(data.data);
        setShowCompanyDetail(true);
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      alert('Failed to load company details');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminLoginTime');
    navigate('/admin-login');
  };

  const showSuccessMsg = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleUploadImage = async (file: File, bucket: string, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await fetch(`${API_URL}/admin/upload-image`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify({
              file: reader.result,
              bucket,
              path
            })
          });
          const data = await res.json();
          if (data.success) {
            resolve(data.url);
          } else {
            reject(new Error('Upload failed'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // CRUD Operations for Greek Organizations
  const handleFraternitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `${API_URL}/admin/greek-organizations/${editingId}`
        : `${API_URL}/admin/greek-organizations`;

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify({
          ...fraternityForm,
          founded_year: fraternityForm.founded_year ? parseInt(fraternityForm.founded_year) : null,
          total_chapters: fraternityForm.total_chapters ? parseInt(fraternityForm.total_chapters) : null
        })
      });

      if (res.ok) {
        showSuccessMsg(editingId ? 'Updated successfully!' : 'Created successfully!');
        setShowForm(false);
        setEditingId(null);
        setFraternityForm({
          name: '',
          greek_letters: '',
          organization_type: 'fraternity',
          founded_year: '',
          national_website: '',
          total_chapters: '',
          colors: '',
          symbols: '',
          philanthropy: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFraternityEdit = (org: GreekOrg) => {
    setEditingId(org.id);
    setFraternityForm({
      name: org.name,
      greek_letters: org.greek_letters || '',
      organization_type: org.organization_type,
      founded_year: org.founded_year?.toString() || '',
      national_website: org.national_website || '',
      total_chapters: '',
      colors: '',
      symbols: '',
      philanthropy: ''
    });
    setShowForm(true);
  };

  const handleFraternityDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organization?')) return;

    try {
      const res = await fetch(`${API_URL}/admin/greek-organizations/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });

      if (res.ok) {
        showSuccessMsg('Deleted successfully!');
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // CRUD Operations for Universities
  const handleUniversitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Handle logo upload if file is present
      let logoUrl = universityForm.logo_url;
      if (universityForm.logoFile) {
        console.log('📤 Uploading logo...', universityForm.logoFile.name);
        const fileExt = universityForm.logoFile.name.split('.').pop();
        // Sanitize filename: remove all non-alphanumeric characters except hyphens and underscores
        const sanitizedName = universityForm.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
          .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
        const fileName = `${sanitizedName}-${Date.now()}.${fileExt}`;
        try {
          logoUrl = await handleUploadImage(universityForm.logoFile, 'college-logos', fileName);
          console.log('✅ Logo uploaded:', logoUrl);
        } catch (uploadError: any) {
          console.error('❌ Logo upload failed:', uploadError);
          alert(`Logo upload failed: ${uploadError.message || 'Unknown error'}. The college will be saved without a logo.`);
          logoUrl = null; // Continue without logo
        }
      }

      const url = editingId
        ? `${API_URL}/admin/universities/${editingId}`
        : `${API_URL}/admin/universities`;

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify({
          name: universityForm.name,
          location: universityForm.location,
          state: universityForm.state,
          conference: universityForm.conference || null,
          student_count: universityForm.student_count ? parseInt(universityForm.student_count) : null,
          greek_percentage: universityForm.greek_percentage ? parseFloat(universityForm.greek_percentage) : null,
          website: universityForm.website || null,
          logo_url: logoUrl || null,
          bars_nearby: universityForm.bars_nearby ? parseInt(universityForm.bars_nearby) : null,
          unlock_count: universityForm.unlock_count ? parseInt(universityForm.unlock_count) : null
        })
      });

      if (res.ok) {
        showSuccessMsg(editingId ? 'University updated successfully!' : 'University created successfully!');
        setShowForm(false);
        setEditingId(null);
        setUniversityForm({
          name: '',
          location: '',
          state: '',
          conference: '',
          student_count: '',
          greek_percentage: '',
          website: '',
          logo_url: '',
          logoFile: null,
          bars_nearby: '',
          unlock_count: ''
        });
        fetchData();
      } else {
        const errorData = await res.json();
        alert(`Failed to save university: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Error saving university: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUniversityEdit = (uni: University) => {
    setEditingId(uni.id);
    setUniversityForm({
      name: uni.name,
      location: uni.location,
      state: uni.state,
      conference: uni.conference || '',
      student_count: uni.student_count?.toString() || '',
      greek_percentage: uni.greek_percentage?.toString() || '',
      website: uni.website || '',
      logo_url: uni.logo_url || '',
      logoFile: null,
      bars_nearby: uni.bars_nearby?.toString() || '',
      unlock_count: uni.unlock_count?.toString() || ''
    });
    setShowForm(true);
  };

  const handleUniversityDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this university?')) return;

    try {
      const res = await fetch(`${API_URL}/admin/universities/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });

      if (res.ok) {
        showSuccessMsg('University deleted successfully!');
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // CRUD Operations for Chapters
  const handleChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `${API_URL}/admin/chapters/${editingId}`
        : `${API_URL}/admin/chapters`;

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify({
          greek_organization_id: chapterForm.greek_organization_id,
          university_id: chapterForm.university_id,
          chapter_name: chapterForm.chapter_name,
          charter_date: chapterForm.charter_date || null,
          member_count: chapterForm.member_count ? parseInt(chapterForm.member_count) : null,
          status: chapterForm.status,
          house_address: chapterForm.house_address || null,
          instagram_handle: chapterForm.instagram_handle || null,
          website: chapterForm.website || null,
          contact_email: chapterForm.contact_email || null,
          phone: chapterForm.phone || null,
          engagement_score: chapterForm.engagement_score ? parseInt(chapterForm.engagement_score) : null,
          partnership_openness: chapterForm.partnership_openness,
          event_frequency: chapterForm.event_frequency ? parseInt(chapterForm.event_frequency) : null,
          grade: chapterForm.grade ? parseFloat(chapterForm.grade) : null,
          is_favorite: chapterForm.is_favorite,
          is_viewable: chapterForm.is_viewable,
          is_platinum: chapterForm.is_platinum,
          is_diamond: chapterForm.is_diamond,
          coming_soon_date: chapterForm.coming_soon_date || null
        })
      });

      if (res.ok) {
        showSuccessMsg(editingId ? 'Chapter updated successfully!' : 'Chapter created successfully!');
        setShowForm(false);
        setEditingId(null);
        setChapterForm({
          greek_organization_id: '',
          university_id: '',
          chapter_name: '',
          charter_date: '',
          member_count: '',
          status: 'active',
          house_address: '',
          instagram_handle: '',
          website: '',
          contact_email: '',
          phone: '',
          engagement_score: '75',
          partnership_openness: 'open',
          event_frequency: '20',
          grade: '',
          is_favorite: false,
          is_viewable: false,
          is_platinum: false,
          is_diamond: false,
          coming_soon_date: ''
        });
        fetchData();
      } else {
        const errorData = await res.json();
        alert(`❌ Error: ${errorData.error || 'Failed to create chapter'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Network error. Please check your connection and try again.');
    }
  };

  const handleQuickAddChapter = async () => {
    const lines = quickAddText.trim().split('\n').filter(line => line.trim());

    for (const line of lines) {
      // Expected format: "Organization at University" or "Organization, University" or "Organization | University"
      const separators = [' at ', ', ', ' | ', ' - '];
      let parts: string[] = [];

      for (const sep of separators) {
        if (line.includes(sep)) {
          parts = line.split(sep).map(p => p.trim());
          break;
        }
      }

      if (parts.length !== 2) {
        alert(`Invalid format for line: "${line}". Please use format: "Organization at University"`);
        continue;
      }

      const [organization_name, university_name] = parts;

      try {
        const res = await fetch(`${API_URL}/admin/chapters/quick-add`, {
          method: 'POST',
          headers: getAdminHeaders(),
          body: JSON.stringify({
            organization_name,
            university_name
          })
        });

        const data = await res.json();

        if (res.ok) {
          console.log(`✅ Created: ${data.message}`);
        } else {
          alert(`❌ Error for "${line}": ${data.error}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert(`❌ Network error for "${line}"`);
      }
    }

    showSuccessMsg('Quick add complete! Check console for details.');
    setQuickAddText('');
    setShowQuickAdd(false);
    fetchData();
  };

  const handleChapterEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setShowEditModal(true);
  };

  const handleChapterSave = async (chapterId: string, updates: any) => {
    try {
      const response = await fetch(`${API_URL}/admin/chapters/${chapterId}`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to update chapter');
      }

      const result = await response.json();

      // Update the local state
      setChapters(chapters.map(ch =>
        ch.id === chapterId ? { ...ch, ...result.data } : ch
      ));

      alert('Chapter updated successfully!');
    } catch (error: any) {
      console.error('Error updating chapter:', error);
      throw error; // Re-throw so modal can handle it
    }
  };

  const handleRosterImport = async (chapterId: string, users: any[]) => {
    try {
      console.log(`🚀 Starting roster import for chapter ${chapterId}`);
      console.log(`📊 Total users to import: ${users.length}`);

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          console.log(`📝 Importing: ${user.name} (${user.position || 'Member'})`);
          const response = await fetch(`${API_URL}/admin/officers`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify({
              chapter_id: chapterId,
              ...user
            })
          });

          if (response.ok) {
            successCount++;
            console.log(`✅ Successfully added: ${user.name}`);
          } else {
            const errorData = await response.json();
            errorCount++;
            console.error(`❌ Failed to add ${user.name}:`, errorData);
          }
        } catch (err) {
          errorCount++;
          console.error(`❌ Error importing ${user.name}:`, err);
        }
      }

      console.log(`\n🎉 ROSTER IMPORT COMPLETE!`);
      console.log(`✅ Successfully imported: ${successCount} members`);
      console.log(`❌ Failed imports: ${errorCount} members`);
      console.log(`📈 Success rate: ${Math.round((successCount / users.length) * 100)}%\n`);

      showSuccessMsg(`Roster imported! ✅ ${successCount} members added, ❌ ${errorCount} errors`);
      fetchData();
    } catch (error: any) {
      console.error('❌ FATAL ERROR during roster import:', error);
      throw error;
    }
  };

  const handleTogglePinned = async (userId: string, isPinned: boolean) => {
    try {
      const response = await fetch(`${API_URL}/admin/officers/${userId}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({ is_pinned: isPinned })
      });

      if (!response.ok) throw new Error('Failed to toggle pinned status');

      showSuccessMsg(isPinned ? 'Officer pinned' : 'Officer unpinned');
      fetchData();
    } catch (error: any) {
      console.error('Error toggling pinned:', error);
    }
  };

  const handleAssignPosition = async (userId: string, position: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/officers/${userId}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          position,
          is_pinned: true // Auto-pin when assigned to a position
        })
      });

      if (!response.ok) throw new Error('Failed to assign position');

      showSuccessMsg(`Assigned to ${position}`);
      fetchData();
    } catch (error: any) {
      console.error('Error assigning position:', error);
    }
  };

  const handleChapterDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;

    try {
      const res = await fetch(`${API_URL}/admin/chapters/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });

      if (res.ok) {
        showSuccessMsg('Chapter deleted successfully!');
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleToggleFavorite = async (chapterId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/admin/chapters/${chapterId}`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ is_favorite: !currentStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      showSuccessMsg(currentStatus ? 'Removed from favorites' : 'Added to favorites');
      fetchData();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleToggleViewable = async (chapterId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/admin/chapters/${chapterId}`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ is_viewable: !currentStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle viewable');
      }

      showSuccessMsg(currentStatus ? 'Chapter hidden from dashboard' : 'Chapter visible in dashboard');
      fetchData();
    } catch (error) {
      console.error('Error toggling viewable:', error);
    }
  };

  // CRUD Operations for Users
  const handleOfficerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `${API_URL}/admin/users/${editingId}`
        : `${API_URL}/admin/users`;

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify({
          chapter_id: userForm.chapter_id,
          name: userForm.name,
          position: userForm.position,
          member_type: userForm.member_type || 'member',
          email: userForm.email || null,
          phone: userForm.phone || null,
          linkedin_profile: userForm.linkedin_profile || null,
          graduation_year: userForm.graduation_year ? parseInt(userForm.graduation_year) : null,
          major: userForm.major || null,
          is_primary_contact: userForm.is_primary_contact
        })
      });

      if (res.ok) {
        showSuccessMsg(editingId ? 'User updated successfully!' : 'User created successfully!');
        setShowForm(false);
        setEditingId(null);
        setUserForm({
          chapter_id: '',
          name: '',
          position: 'President',
          member_type: 'member' as 'user' | 'member' | 'alumni' | 'advisor',
          email: '',
          phone: '',
          linkedin_profile: '',
          graduation_year: '',
          major: '',
          is_primary_contact: false
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUserEdit = (user: User) => {
    setEditingId(user.id);
    setUserForm({
      chapter_id: user.chapter_id,
      name: user.name,
      position: user.position,
      member_type: user.member_type || 'member',
      email: user.email || '',
      phone: user.phone || '',
      linkedin_profile: user.linkedin_profile || '',
      graduation_year: user.graduation_year?.toString() || '',
      major: user.major || '',
      is_primary_contact: user.is_primary_contact || false
    });
    setShowForm(true);
  };

  const handleUserDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });

      if (res.ok) {
        showSuccessMsg('Officer deleted successfully!');
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // CSV Import Handler
  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('[CSV Import] No file selected');
      return;
    }

    console.log('[CSV Import] 📁 File selected:', {
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.type
    });

    const reader = new FileReader();
    reader.onload = async (event) => {
      console.log('[CSV Import] 📖 File reading completed');

      const text = event.target?.result as string;
      console.log('[CSV Import] File content length:', text.length, 'characters');
      console.log('[CSV Import] First 200 characters:', text.substring(0, 200));

      const lines = text.split('\n').filter(line => line.trim());
      console.log('[CSV Import] 📊 Total lines (excluding empty):', lines.length);
      console.log('[CSV Import] Data rows:', lines.length - 1, '(excluding header)');

      const headers = lines[0].split(',').map(h => h.trim());
      console.log('[CSV Import] 📋 Headers detected:', headers);
      console.log('[CSV Import] Header count:', headers.length);

      let successCount = 0;
      let errorCount = 0;
      let skippedDuplicates = 0;
      const errorDetails: Array<{row: number, data: any, error: string}> = [];
      const duplicateDetails: Array<{row: number, data: any}> = [];

      console.log('[CSV Import] 🎯 Active tab:', activeTab);
      console.log('[CSV Import] ⚙️ Starting row processing...\n');

      for (let i = 1; i < lines.length; i++) {
        console.log(`\n[CSV Import] ━━━ Processing Row ${i}/${lines.length - 1} ━━━`);

        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        console.log(`[CSV Import] Row ${i} parsed data:`, row);

        try {
          // Import based on active tab
          if (activeTab === 'colleges') {
            console.log(`[CSV Import] Row ${i} - Importing as UNIVERSITY`);
            let logoUrl = row.logo_url || row['Logo URL'] || '';
            console.log(`[CSV Import] Row ${i} - Logo URL:`, logoUrl || '(none)');

            // If logo_url is provided and it's a URL, download and upload it
            if (logoUrl && logoUrl.startsWith('http')) {
              console.log(`[CSV Import] Row ${i} - 🖼️ Downloading logo from:`, logoUrl);
              try {
                const response = await fetch(logoUrl);
                const blob = await response.blob();
                console.log(`[CSV Import] Row ${i} - Logo downloaded:`, {
                  size: `${(blob.size / 1024).toFixed(2)} KB`,
                  type: blob.type
                });

                // Sanitize filename: remove all non-alphanumeric characters except hyphens and underscores
                const sanitizedName = (row.name || row.Name).toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
                  .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
                const fileName = `${sanitizedName}-${Date.now()}.${blob.type.split('/')[1]}`;
                console.log(`[CSV Import] Row ${i} - Uploading as:`, fileName);

                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve) => {
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(blob);
                });
                const base64Data = await base64Promise;

                logoUrl = await handleUploadImage(blob as File, 'college-logos', fileName);
                console.log(`[CSV Import] Row ${i} - ✅ Logo uploaded successfully:`, logoUrl);
              } catch (uploadError) {
                console.error(`[CSV Import] Row ${i} - ❌ Failed to upload logo:`, uploadError);
                logoUrl = ''; // Continue without logo
              }
            }

            const universityPayload = {
              name: row.name || row.Name,
              location: row.location || row.Location,
              state: row.state || row.State,
              student_count: parseInt(row.student_count || row['Student Count'] || '0'),
              greek_percentage: parseFloat(row.greek_percentage || row['Greek %'] || '0'),
              website: row.website || row.Website || '',
              logo_url: logoUrl,
              conference: row.conference || row.Conference || '',
              bars_nearby: parseInt(row.bars_nearby || row['Bars Nearby'] || '0'),
              unlock_count: parseInt(row.unlock_count || row['Unlock Count'] || '0')
            };

            console.log(`[CSV Import] Row ${i} - 🚀 Creating university with payload:`, universityPayload);

            const universityResponse = await fetch(`${API_URL}/admin/universities`, {
              method: 'POST',
              headers: getAdminHeaders(),
              body: JSON.stringify(universityPayload)
            });

            console.log(`[CSV Import] Row ${i} - API response status:`, universityResponse.status);

            if (!universityResponse.ok) {
              const errorText = await universityResponse.text();
              console.error(`[CSV Import] Row ${i} - ❌ API error:`, errorText);
              throw new Error(`API returned ${universityResponse.status}: ${errorText}`);
            }

            successCount++;
            console.log(`[CSV Import] Row ${i} - ✅ SUCCESS! Total successes: ${successCount}`);
          } else if (activeTab === 'users') {
            console.log(`[CSV Import] Row ${i} - Importing as OFFICER/ROSTER`);

            // Officer/Roster CSV import
            const chapterName = row.chapter || row.Chapter;
            const universityName = row.university || row.University || row.college || row.College;

            console.log(`[CSV Import] Row ${i} - Looking up chapter:`, {
              chapterName,
              universityName
            });

            // Need to look up chapter_id from chapter name and university
            if (!chapterName || !universityName) {
              const errorMsg = 'Missing chapter or university name';
              console.error(`[CSV Import] Row ${i} - ❌ ${errorMsg}`);
              errorDetails.push({row: i, data: row, error: errorMsg});
              errorCount++;
              console.log(`[CSV Import] Row ${i} - ERROR! Total errors: ${errorCount}`);
              continue;
            }

            // First, find the chapter
            console.log(`[CSV Import] Row ${i} - 🔍 Fetching all chapters to find match...`);
            const chaptersRes = await fetch(`${API_URL}/admin/chapters`, {
              headers: getAdminHeaders()
            });
            const chaptersResponse = await chaptersRes.json();
            const chaptersData = chaptersResponse.data || chaptersResponse;
            console.log(`[CSV Import] Row ${i} - Found ${chaptersData.length} total chapters`);

            const chapter = chaptersData.find((ch: any) =>
              ch.chapter_name?.toLowerCase().includes(chapterName.toLowerCase()) &&
              ch.universities?.name?.toLowerCase().includes(universityName.toLowerCase())
            );

            if (!chapter) {
              const errorMsg = `Could not find chapter: ${chapterName} at ${universityName}`;
              console.error(`[CSV Import] Row ${i} - ❌ ${errorMsg}`);
              console.log(`[CSV Import] Row ${i} - Available chapters:`, chaptersData.map((ch: any) => ({
                name: ch.chapter_name,
                university: ch.universities?.name
              })));
              errorDetails.push({row: i, data: row, error: errorMsg});
              errorCount++;
              console.log(`[CSV Import] Row ${i} - ERROR! Total errors: ${errorCount}`);
              continue;
            }

            console.log(`[CSV Import] Row ${i} - ✅ Found chapter:`, {
              id: chapter.id,
              name: chapter.chapter_name,
              university: chapter.universities?.name
            });

            const officerPayload = {
              chapter_id: chapter.id,
              name: row.name || row.Name,
              position: row.position || row.Position || 'Member',
              member_type: (row.member_type || row['Member Type'] || row.type || 'member').toLowerCase(),
              email: row.email || row.Email || '',
              phone: row.phone || row.Phone || '',
              linkedin_profile: row.linkedin || row.LinkedIn || row.linkedin_profile || '',
              graduation_year: parseInt(row.graduation_year || row['Graduation Year'] || row.grad_year || '0') || undefined,
              major: row.major || row.Major || '',
              is_primary_contact: (row.is_primary || row['Primary Contact'] || '').toLowerCase() === 'true'
            };

            console.log(`[CSV Import] Row ${i} - 🚀 Creating officer with payload:`, officerPayload);

            const officerResponse = await fetch(`${API_URL}/admin/officers`, {
              method: 'POST',
              headers: getAdminHeaders(),
              body: JSON.stringify(officerPayload)
            });

            console.log(`[CSV Import] Row ${i} - API response status:`, officerResponse.status);

            if (!officerResponse.ok) {
              const errorText = await officerResponse.text();
              console.error(`[CSV Import] Row ${i} - ❌ API error:`, errorText);
              throw new Error(`API returned ${officerResponse.status}: ${errorText}`);
            }

            successCount++;
            console.log(`[CSV Import] Row ${i} - ✅ SUCCESS! Total successes: ${successCount}`);
          } else if (activeTab === 'chapters') {
            console.log(`[CSV Import] Row ${i} - Importing as CHAPTER`);

            // Chapter CSV import (organization, university, chapter_name, grade)
            const organizationName = row.organization || row.Organization;
            const universityName = row.university || row.University;
            const chapterName = row.chapter_name || row['Chapter Name'] || row.chapter || row.Chapter;
            const grade = parseFloat(row.grade || row.Grade || '3.0');

            console.log(`[CSV Import] Row ${i} - Looking up:`, {
              organization: organizationName,
              university: universityName,
              chapter_name: chapterName,
              grade
            });

            // Validate required fields
            if (!organizationName || !universityName || !chapterName) {
              const errorMsg = 'Missing required fields (organization, university, or chapter_name)';
              console.error(`[CSV Import] Row ${i} - ❌ ${errorMsg}`);
              errorDetails.push({row: i, data: row, error: errorMsg});
              errorCount++;
              console.log(`[CSV Import] Row ${i} - ERROR! Total errors: ${errorCount}`);
              continue;
            }

            // Fetch universities to find university_id
            console.log(`[CSV Import] Row ${i} - 🔍 Fetching universities to find match...`);
            const universitiesRes = await fetch(`${API_URL}/admin/universities`, {
              headers: getAdminHeaders()
            });
            const universitiesResponse = await universitiesRes.json();
            const universitiesData = universitiesResponse.data || universitiesResponse;
            console.log(`[CSV Import] Row ${i} - Found ${universitiesData.length} total universities`);

            const university = universitiesData.find((u: any) =>
              u.name?.toLowerCase().includes(universityName.toLowerCase()) ||
              universityName.toLowerCase().includes(u.name?.toLowerCase())
            );

            if (!university) {
              const errorMsg = `Could not find university: ${universityName}`;
              console.error(`[CSV Import] Row ${i} - ❌ ${errorMsg}`);
              console.log(`[CSV Import] Row ${i} - Available universities sample:`, universitiesData.slice(0, 5).map((u: any) => u.name));
              errorDetails.push({row: i, data: row, error: errorMsg});
              errorCount++;
              console.log(`[CSV Import] Row ${i} - ERROR! Total errors: ${errorCount}`);
              continue;
            }

            console.log(`[CSV Import] Row ${i} - ✅ Found university:`, {
              id: university.id,
              name: university.name
            });

            // Fetch greek organizations to find greek_organization_id
            console.log(`[CSV Import] Row ${i} - 🔍 Fetching greek organizations to find match...`);
            const greekOrgsRes = await fetch(`${API_URL}/admin/greek-organizations`, {
              headers: getAdminHeaders()
            });
            const greekOrgsResponse = await greekOrgsRes.json();
            const greekOrgsData = greekOrgsResponse.data || greekOrgsResponse;
            console.log(`[CSV Import] Row ${i} - Found ${greekOrgsData.length} total greek organizations`);

            const greekOrg = greekOrgsData.find((g: any) =>
              g.name?.toLowerCase() === organizationName.toLowerCase() ||
              g.name?.toLowerCase().includes(organizationName.toLowerCase()) ||
              organizationName.toLowerCase().includes(g.name?.toLowerCase())
            );

            if (!greekOrg) {
              const errorMsg = `Could not find greek organization: ${organizationName}`;
              console.error(`[CSV Import] Row ${i} - ❌ ${errorMsg}`);
              console.log(`[CSV Import] Row ${i} - Available organizations:`, greekOrgsData.map((g: any) => g.name));
              errorDetails.push({row: i, data: row, error: errorMsg});
              errorCount++;
              console.log(`[CSV Import] Row ${i} - ERROR! Total errors: ${errorCount}`);
              continue;
            }

            console.log(`[CSV Import] Row ${i} - ✅ Found greek organization:`, {
              id: greekOrg.id,
              name: greekOrg.name
            });

            // Check for duplicates - fetch existing chapters
            console.log(`[CSV Import] Row ${i} - 🔍 Checking for duplicate chapter...`);
            const existingChaptersRes = await fetch(`${API_URL}/admin/chapters`, {
              headers: getAdminHeaders()
            });
            const existingChaptersResponse = await existingChaptersRes.json();
            const existingChapters = existingChaptersResponse.data || existingChaptersResponse;

            const duplicate = existingChapters.find((ch: any) =>
              ch.greek_organization_id === greekOrg.id && ch.university_id === university.id
            );

            if (duplicate) {
              console.log(`[CSV Import] Row ${i} - ⏭️ SKIPPED - Duplicate chapter already exists:`, {
                existing_id: duplicate.id,
                existing_name: duplicate.chapter_name
              });
              duplicateDetails.push({row: i, data: row});
              skippedDuplicates++;
              console.log(`[CSV Import] Row ${i} - SKIPPED! Total duplicates: ${skippedDuplicates}`);
              continue;
            }

            const chapterPayload = {
              chapter_name: chapterName,
              university_id: university.id,
              greek_organization_id: greekOrg.id,
              grade: grade,
              status: 'active'
            };

            console.log(`[CSV Import] Row ${i} - 🚀 Creating chapter with payload:`, chapterPayload);

            const chapterResponse = await fetch(`${API_URL}/admin/chapters`, {
              method: 'POST',
              headers: getAdminHeaders(),
              body: JSON.stringify(chapterPayload)
            });

            console.log(`[CSV Import] Row ${i} - API response status:`, chapterResponse.status);

            if (!chapterResponse.ok) {
              const errorText = await chapterResponse.text();
              console.error(`[CSV Import] Row ${i} - ❌ API error:`, errorText);
              throw new Error(`API returned ${chapterResponse.status}: ${errorText}`);
            }

            successCount++;
            console.log(`[CSV Import] Row ${i} - ✅ SUCCESS! Total successes: ${successCount}`);
          } else if (activeTab === 'coming-tomorrow') {
            console.log(`[CSV Import] Row ${i} - Importing as COMING TOMORROW`);

            // Coming Tomorrow CSV import
            const collegeName = row.college_name || row['College Name'] || row['college name'];
            const anticipatedScore = parseFloat(row.anticipated_score || row['Anticipated Score'] || row['anticipated score'] || '0');
            const updateType = row.update_type || row['Update Type'] || row['update type'] || 'new_chapter';
            const chapterName = row.chapter_name || row['Chapter Name'] || row['chapter name'] || null;
            const expectedMemberCount = row.expected_member_count || row['Expected Member Count'] || row['expected member count'];
            const scheduledDate = row.scheduled_date || row['Scheduled Date'] || row['scheduled date'] || null;

            console.log(`[CSV Import] Row ${i} - Parsed fields:`, {
              collegeName,
              anticipatedScore,
              updateType,
              chapterName,
              expectedMemberCount,
              scheduledDate
            });

            // Validate required fields
            if (!collegeName || !anticipatedScore || !updateType) {
              const errorMsg = 'Missing required fields (college_name, anticipated_score, or update_type)';
              console.error(`[CSV Import] Row ${i} - ❌ ${errorMsg}`);
              errorDetails.push({row: i, data: row, error: errorMsg});
              errorCount++;
              console.log(`[CSV Import] Row ${i} - ERROR! Total errors: ${errorCount}`);
              continue;
            }

            // Validate update_type
            const validUpdateTypes = ['new_chapter', 'roster_update', 'new_sorority'];
            if (!validUpdateTypes.includes(updateType)) {
              const errorMsg = `Invalid update_type: ${updateType}. Must be one of: ${validUpdateTypes.join(', ')}`;
              console.error(`[CSV Import] Row ${i} - ❌ ${errorMsg}`);
              errorDetails.push({row: i, data: row, error: errorMsg});
              errorCount++;
              console.log(`[CSV Import] Row ${i} - ERROR! Total errors: ${errorCount}`);
              continue;
            }

            // Look up university_id from college name
            console.log(`[CSV Import] Row ${i} - 🔍 Fetching universities to find match for: ${collegeName}`);
            const universitiesRes = await fetch(`${API_URL}/admin/universities`, {
              headers: getAdminHeaders()
            });
            const universitiesResponse = await universitiesRes.json();
            const universitiesData = universitiesResponse.data || universitiesResponse;
            console.log(`[CSV Import] Row ${i} - Found ${universitiesData.length} total universities`);

            const university = universitiesData.find((u: any) =>
              u.name?.toLowerCase().includes(collegeName.toLowerCase()) ||
              collegeName.toLowerCase().includes(u.name?.toLowerCase())
            );

            if (!university) {
              const errorMsg = `Could not find university: ${collegeName}`;
              console.error(`[CSV Import] Row ${i} - ❌ ${errorMsg}`);
              console.log(`[CSV Import] Row ${i} - Available universities sample:`, universitiesData.slice(0, 5).map((u: any) => u.name));
              errorDetails.push({row: i, data: row, error: errorMsg});
              errorCount++;
              console.log(`[CSV Import] Row ${i} - ERROR! Total errors: ${errorCount}`);
              continue;
            }

            console.log(`[CSV Import] Row ${i} - ✅ Found university:`, {
              id: university.id,
              name: university.name
            });

            const comingTomorrowPayload = {
              college_name: collegeName,
              university_id: university.id,
              anticipated_score: anticipatedScore,
              update_type: updateType,
              expected_member_count: expectedMemberCount ? parseInt(expectedMemberCount) : null,
              chapter_name: chapterName,
              scheduled_date: scheduledDate
            };

            console.log(`[CSV Import] Row ${i} - 🚀 Creating coming tomorrow item with payload:`, comingTomorrowPayload);

            const comingTomorrowResponse = await fetch(`${API_URL}/admin/coming-tomorrow`, {
              method: 'POST',
              headers: getAdminHeaders(),
              body: JSON.stringify(comingTomorrowPayload)
            });

            console.log(`[CSV Import] Row ${i} - API response status:`, comingTomorrowResponse.status);

            if (!comingTomorrowResponse.ok) {
              const errorText = await comingTomorrowResponse.text();
              console.error(`[CSV Import] Row ${i} - ❌ API error:`, errorText);
              throw new Error(`API returned ${comingTomorrowResponse.status}: ${errorText}`);
            }

            successCount++;
            console.log(`[CSV Import] Row ${i} - ✅ SUCCESS! Total successes: ${successCount}`);
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error(`[CSV Import] Row ${i} - ❌ ERROR:`, error);
          errorDetails.push({row: i, data: row, error: errorMsg});
          errorCount++;
          console.log(`[CSV Import] Row ${i} - ERROR! Total errors: ${errorCount}`);
        }
      }

      console.log('\n[CSV Import] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('[CSV Import] 🏁 IMPORT COMPLETE!');
      console.log('[CSV Import] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('[CSV Import] 📊 Final Results:');
      console.log('[CSV Import]   ✅ Successes:', successCount);
      console.log('[CSV Import]   ⏭️ Skipped (Duplicates):', skippedDuplicates);
      console.log('[CSV Import]   ❌ Errors:', errorCount);
      console.log('[CSV Import]   📝 Total rows processed:', lines.length - 1);
      console.log('[CSV Import]   📈 Success rate:', `${((successCount / (lines.length - 1)) * 100).toFixed(1)}%`);
      console.log('[CSV Import] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Display skipped duplicates in orange
      if (duplicateDetails.length > 0) {
        console.log('\n[CSV Import] ⏭️⏭️⏭️ SKIPPED ROWS (Already Exists) ⏭️⏭️⏭️\n');
        duplicateDetails.forEach(({row, data}) => {
          console.log(`%c[CSV Import] Row ${row} - DUPLICATE ⏭️`, 'color: orange; font-weight: bold; font-size: 14px');
          console.log(`%c  Organization: ${data.organization || data.Organization || 'N/A'}`, 'color: orange');
          console.log(`%c  University: ${data.university || data.University || 'N/A'}`, 'color: orange');
          console.log(`%c  Chapter: ${data.chapter_name || data['Chapter Name'] || 'N/A'}`, 'color: orange');
          console.log(`%c  Reason: This chapter already exists in the database`, 'color: orange; font-weight: bold');
          console.log('');
        });
        console.log('[CSV Import] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }

      // Display failed rows with 0.0 grade in red
      if (errorDetails.length > 0) {
        console.log('\n[CSV Import] ❌❌❌ FAILED ROWS (Grade: 0.0) ❌❌❌\n');
        errorDetails.forEach(({row, data, error}) => {
          console.log(`%c[CSV Import] Row ${row} - Grade: 0.0 ❌`, 'color: red; font-weight: bold; font-size: 14px');
          console.log(`%c  Organization: ${data.organization || data.Organization || 'N/A'}`, 'color: red');
          console.log(`%c  University: ${data.university || data.University || 'N/A'}`, 'color: red');
          console.log(`%c  Chapter: ${data.chapter_name || data['Chapter Name'] || 'N/A'}`, 'color: red');
          console.log(`%c  Error: ${error}`, 'color: red; font-weight: bold');
          console.log('');
        });
        console.log('[CSV Import] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }

      showSuccessMsg(`CSV Import Complete!\n✅ Success: ${successCount}\n⏭️ Skipped: ${skippedDuplicates}\n❌ Errors: ${errorCount}`);
      fetchData();
      e.target.value = ''; // Reset file input
    };

    console.log('[CSV Import] 📖 Starting file read...');
    reader.readAsText(file);
  };

  // CSV Paste Handler
  const handleCSVPaste = async () => {
    if (!pasteChapterId || !pasteCSVText.trim()) {
      showSuccessMsg('Please select a chapter and paste CSV data');
      return;
    }

    setPasteLoading(true);
    setPasteResult(null);

    try {
      console.log('[CSV Paste] Uploading roster for chapter:', pasteChapterId);

      const response = await fetch(`${API_URL}/admin/chapters/${pasteChapterId}/paste-roster`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ csvText: pasteCSVText })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('[CSV Paste] Success:', result);
        setPasteResult(result);
        showSuccessMsg(
          `Roster Updated!\n✅ Inserted: ${result.insertedCount}\n🔄 Updated: ${result.updatedCount}\n⏭️ Skipped: ${result.skippedCount}`
        );
        fetchData(); // Refresh data
      } else {
        throw new Error(result.error || 'Failed to paste roster');
      }
    } catch (error: any) {
      console.error('[CSV Paste] Error:', error);
      showSuccessMsg(`Error: ${error.message}`);
      setPasteResult({ success: false, error: error.message });
    } finally {
      setPasteLoading(false);
    }
  };

  // AI Assistant Handler with conversation memory
  const handleAIAssist = async () => {
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    const userMessage = { role: 'user', content: aiPrompt, timestamp: Date.now() };
    setAiHistory(prev => [...prev, userMessage]);

    try {
      const res = await fetch(`${API_URL}/admin/ai-assist`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          prompt: aiPrompt,
          context: activeTab,
          conversationId: aiConversationId,
          universities: universities.map(u => ({ id: u.id, name: u.name, state: u.state })),
          greekOrgs: greekOrgs.map(g => ({ id: g.id, name: g.name, organization_type: g.organization_type })),
          chapters: chapters.map(c => ({
            id: c.id,
            chapter_name: c.chapter_name,
            university_name: c.universities?.name,
            organization_name: c.greek_organizations?.name
          })),
          existingData: {
            universities,
            greekOrgs,
            chapters
          }
        })
      });

      const data = await res.json();

      if (data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: data.response || data.suggestion || 'No response',
          timestamp: Date.now()
        };
        setAiHistory(prev => [...prev, assistantMessage]);

        // Store full response object to show tools used
        setAiResponse(data);

        // Store conversation ID for continuity
        if (data.conversationId && !aiConversationId) {
          setAiConversationId(data.conversationId);
        }

        console.log(`🤖 AI conversation [${data.conversationId}]: ${data.historyLength} messages | Tools: ${data.toolsUsed || 0}`);

        // If tools were used, refresh the data
        if (data.toolsUsed && data.toolsUsed > 0) {
          console.log('🔄 AI executed actions - refreshing data...');
          setTimeout(() => fetchData(), 500); // Refresh after a short delay
        }
      } else {
        setAiResponse('Error: ' + (data.error || 'Could not get AI assistance'));
      }
    } catch (error) {
      console.error('AI assist error:', error);
      setAiResponse('Error: Could not connect to AI assistant');
    } finally {
      setAiLoading(false);
      setAiPrompt(''); // Clear input after sending
    }
  };

  const filteredGreekOrgs = greekOrgs.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const BIG_10_SCHOOLS = [
    'University of Illinois', 'Indiana University', 'University of Iowa', 'University of Maryland',
    'University of Michigan', 'Michigan State University', 'University of Minnesota', 'University of Nebraska',
    'Northwestern University', 'Ohio State University', 'Penn State University', 'Purdue University',
    'Rutgers University', 'University of Wisconsin', 'UCLA', 'USC', 'University of Oregon', 'University of Washington'
  ];

  // Debug: Log filter state
  React.useEffect(() => {
    if (activeTab === 'colleges') {
      console.log('🎛️ Filter State:', {
        collegeFilter,
        searchTerm,
        totalUniversities: universities.length
      });
    }
  }, [collegeFilter, searchTerm, universities.length, activeTab]);

  const filteredUniversities = universities
    .filter(uni => {
      // Search filter
      const matchesSearch = uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (uni.conference || '').toLowerCase().includes(searchTerm.toLowerCase());

      // Conference filter
      let matchesFilter = true;
      if (collegeFilter === 'division1') {
        matchesFilter = uni.division === 'Division 1' || uni.division === 'Division I' || uni.division === 'D1';
      } else if (collegeFilter === 'power5') {
        const power4Conferences = ['SEC', 'BIG 10', 'BIG 12', 'ACC'];
        matchesFilter = power4Conferences.includes(uni.conference || '');
      } else if (collegeFilter === 'sec') {
        matchesFilter = uni.conference === 'SEC';
      } else if (collegeFilter === 'big10') {
        matchesFilter = uni.conference === 'BIG 10';
      } else if (collegeFilter === 'big12') {
        matchesFilter = uni.conference === 'BIG 12';
      } else if (collegeFilter === 'acc') {
        matchesFilter = uni.conference === 'ACC';
      }

      // Debug logs removed to prevent console spam

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (collegeOrderBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (collegeOrderBy === 'state') {
        return a.state.localeCompare(b.state);
      } else if (collegeOrderBy === 'chapters') {
        return (b.chapter_count || 0) - (a.chapter_count || 0);
      } else if (collegeOrderBy === 'big10') {
        const aIsBig10 = BIG_10_SCHOOLS.some(school => a.name.includes(school));
        const bIsBig10 = BIG_10_SCHOOLS.some(school => b.name.includes(school));
        if (aIsBig10 && !bIsBig10) return -1;
        if (!aIsBig10 && bIsBig10) return 1;
        return a.name.localeCompare(b.name);
      } else if (collegeOrderBy === 'conference') {
        const aConf = a.conference || 'ZZZ';
        const bConf = b.conference || 'ZZZ';
        return aConf.localeCompare(bConf);
      } else if (collegeOrderBy === 'recent') {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bDate - aDate; // Most recent first
      }
      return 0;
    });

  // Debug: Log filtered results
  React.useEffect(() => {
    if (activeTab === 'colleges' && universities.length > 0) {
      const wvuInFiltered = filteredUniversities.filter(u => u.name.includes('West Virginia'));
      console.log('📊 Filtered Results:', {
        totalUniversities: universities.length,
        filteredCount: filteredUniversities.length,
        collegeFilter,
        searchTerm,
        wvuInFiltered: wvuInFiltered.length,
        wvuData: wvuInFiltered
      });

      // Also check raw universities array for WVU
      const wvuInRaw = universities.filter(u => u.name.includes('West Virginia'));
      console.log('🏈 WVU in raw universities array:', wvuInRaw);
    }
  }, [filteredUniversities.length, universities.length, collegeFilter, searchTerm, activeTab]);

  const filteredChapters = chapters
    .filter(ch => {
      const matchesSearch =
        ch.chapter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ch.greek_organizations?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ch.universities?.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by organization type - use embedded data
      if (orgTypeFilter !== 'all') {
        const matchesType = ch.greek_organizations?.organization_type === orgTypeFilter;
        if (!matchesType) return false;
      }

      // Filter by specific fraternity/sorority
      if (selectedFraternityFilter !== 'all') {
        const matchesFraternity = ch.greek_organization_id === selectedFraternityFilter;
        if (!matchesFraternity) return false;
      }

      // Filter by recent date
      if (recentFilter !== 'all' && ch.created_at) {
        const createdDate = new Date(ch.created_at);
        const now = new Date();
        const hoursDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

        if (recentFilter === '24h' && hoursDiff > 24) return false;
        if (recentFilter === '7d' && hoursDiff > 24 * 7) return false;
        if (recentFilter === '30d' && hoursDiff > 24 * 30) return false;
      }

      return matchesSearch;
    })
    .sort((a, b) => {
      // First, sort by favorite status (favorites first)
      const aFav = a.is_favorite || false;
      const bFav = b.is_favorite || false;
      if (aFav !== bFav) {
        return bFav ? 1 : -1; // Favorites come first
      }

      // Then sort by selected order
      if (chapterOrderBy === 'grade') {
        return (b.grade || 0) - (a.grade || 0); // Sort descending (5.0 first)
      } else if (chapterOrderBy === 'name') {
        const aName = a.greek_organizations?.name || '';
        const bName = b.greek_organizations?.name || '';
        return aName.localeCompare(bName);
      } else if (chapterOrderBy === 'university') {
        const aUni = a.universities?.name || '';
        const bUni = b.universities?.name || '';
        return aUni.localeCompare(bUni);
      } else if (chapterOrderBy === 'recent') {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bDate - aDate; // Most recent first
      }
      return 0;
    });

  const filteredUsers = users.filter(off => {
    const matchesSearch =
      off.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      off.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      off.chapters?.chapter_name.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by specific fraternity/sorority
    if (selectedFraternityFilter !== 'all') {
      const chapter = chapters.find(ch => ch.id === off.chapter_id);
      const matchesFraternity = chapter?.greek_organization_id === selectedFraternityFilter;
      if (!matchesFraternity) return false;
    }

    // Filter by recent date
    if (recentFilter !== 'all' && off.created_at) {
      const createdDate = new Date(off.created_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

      if (recentFilter === '24h' && hoursDiff > 24) return false;
      if (recentFilter === '7d' && hoursDiff > 24 * 7) return false;
      if (recentFilter === '30d' && hoursDiff > 24 * 30) return false;
    }

    return matchesSearch;
  });

  // Helper function to get initials from university name
  const getInitials = (name: string) => {
    const words = name.split(' ').filter(word =>
      word.length > 0 && !['of', 'the', 'and', 'at'].includes(word.toLowerCase())
    );
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words.slice(0, 2).map(word => word[0].toUpperCase()).join('');
  };

  // Helper function to generate color from string
  const getColorFromString = (str: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
      'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">FraternityBase</h1>
          <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
        </div>

        {/* AI Status Badge */}
        {aiStatus && (
          <div className="mx-4 mt-4">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              aiStatus.connected ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${aiStatus.connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-xs font-medium">
                AI: {aiStatus.connected ? aiStatus.model : 'Disconnected'}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <button
            onClick={() => {
              navigate('/admin/dashboard');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => {
              navigate('/admin/companies');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'companies'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-medium">Users & Accounts</span>
            {companies.length > 0 && (
              <span className="ml-auto bg-gray-700 px-2 py-1 rounded text-xs">{companies.length}</span>
            )}
          </button>

          <button
            onClick={() => {
              navigate('/admin/colleges');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'colleges'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="font-medium">Colleges</span>
            {universities.length > 0 && (
              <span className="ml-auto bg-gray-700 px-2 py-1 rounded text-xs">{universities.length}</span>
            )}
          </button>

          <button
            onClick={() => {
              navigate('/admin/chapters');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'chapters'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Chapters</span>
            {chapters.length > 0 && (
              <span className="ml-auto bg-gray-700 px-2 py-1 rounded text-xs">{chapters.length}</span>
            )}
          </button>

          <button
            onClick={() => {
              navigate('/admin/diamond-chapters');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'diamond-chapters'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Diamond Chapters</span>
            {diamondChapters.length > 0 && (
              <span className="ml-auto bg-gray-700 px-2 py-1 rounded text-xs">{diamondChapters.length}</span>
            )}
          </button>

          <button
            onClick={() => {
              navigate('/admin/ambassadors');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'ambassadors'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Star className="w-5 h-5" />
            <span className="font-medium">Ambassadors</span>
          </button>

          <button
            onClick={() => {
              navigate('/admin/users');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'users'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            <span className="font-medium">Users</span>
            {users.length > 0 && (
              <span className="ml-auto bg-gray-700 px-2 py-1 rounded text-xs">{users.length}</span>
            )}
          </button>

          <button
            onClick={() => {
              navigate('/admin/fraternity-users');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'fraternity-users'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span className="font-medium">Fraternity Users</span>
          </button>

          <button
            onClick={() => {
              navigate('/admin/waitlist');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'waitlist'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Mail className="w-5 h-5" />
            <span className="font-medium">Waitlist</span>
            {waitlistEntries.length > 0 && (
              <span className="ml-auto bg-gray-700 px-2 py-1 rounded text-xs">{waitlistEntries.length}</span>
            )}
          </button>

          <button
            onClick={() => {
              navigate('/admin/coming-tomorrow');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'coming-tomorrow'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Coming Tomorrow</span>
            {comingTomorrowItems.length > 0 && (
              <span className="ml-auto bg-gray-700 px-2 py-1 rounded text-xs">{comingTomorrowItems.length}</span>
            )}
          </button>

          {isWizardAdmin && (
            <button
              onClick={() => navigate('/admin/wizard-admin')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'wizard-admin'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Wizard Admin</span>
            </button>
          )}

          <button
            onClick={() => navigate('/admin/roadmap')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'roadmap'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Rocket className="w-5 h-5" />
            <span className="font-medium">Product Roadmap</span>
          </button>

          <button
            onClick={() => navigate('/admin/college-clubs')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'college-clubs'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="font-medium">College Clubs</span>
          </button>

          <a
            href="/admin/csv-upload"
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-800 border-t border-gray-700 mt-2 pt-4"
          >
            <Upload className="w-5 h-5" />
            <span className="font-medium">AI CSV Upload</span>
            <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-full">
              AI
            </span>
          </a>

          <button
            onClick={() => {
              navigate('/admin/fraternities');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'fraternities'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="font-medium">Fraternities</span>
            {greekOrgs.length > 0 && (
              <span className="ml-auto bg-gray-700 px-2 py-1 rounded text-xs">{greekOrgs.length}</span>
            )}
          </button>

          {/* Divider - Business Analytics Section */}
          <div className="border-t border-gray-700 my-2 pt-2">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Business Analytics</p>
          </div>

          <button
            onClick={() => {
              navigate('/admin/payments');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'payments'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="font-medium">Payments & Revenue</span>
          </button>

          <button
            onClick={() => {
              navigate('/admin/unlocks');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'unlocks'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Unlock className="w-5 h-5" />
            <span className="font-medium">Chapter Unlocks</span>
          </button>

          <button
            onClick={() => {
              navigate('/admin/intro-requests');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'intro-requests'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Handshake className="w-5 h-5" />
              <span className="font-medium">Introduction Requests</span>
            </div>
            {pendingIntroRequests > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {pendingIntroRequests}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              navigate('/admin/credits');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'credits'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5" />
              <span className="font-medium">Credits & Pricing</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500 text-yellow-900 font-medium">Soon</span>
          </button>

          <button
            onClick={() => {
              navigate('/admin/intelligence');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'intelligence'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Company Intelligence</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500 text-yellow-900 font-medium">Soon</span>
          </button>

          <button
            onClick={() => {
              navigate('/admin/analytics');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'analytics'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Business Analytics</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500 text-yellow-900 font-medium">Soon</span>
          </button>

          <button
            onClick={() => {
              navigate('/admin/activity');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'activity'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="font-medium">User Activity</span>
          </button>

          <button
            onClick={() => {
              navigate('/admin/intro-requests');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'intro-requests'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Handshake className="w-5 h-5" />
            <span className="font-medium">Introduction Requests</span>
            {introRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-auto bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                {introRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-2 px-3 py-2 bg-red-900 text-red-200 rounded-lg mb-3">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Admin Mode</span>
          </div>

          {/* Notification Center */}
          <div className="mb-3 flex justify-center">
            <AdminNotificationCenter />
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 capitalize">{activeTab}</h2>
            <p className="text-gray-600 mt-1">
              {activeTab === 'dashboard' && 'Overview of system statistics'}
              {activeTab === 'companies' && 'Manage all user accounts, credits, approval status, and unlock history'}
              {activeTab === 'fraternities' && 'Manage Greek organizations'}
              {activeTab === 'colleges' && 'Manage universities and colleges'}
              {activeTab === 'chapters' && 'Manage individual chapters'}
              {activeTab === 'diamond-chapters' && 'View and manage all introducable (diamond) chapters available for warm introductions'}
              {activeTab === 'ambassadors' && 'Manage ambassador profiles and partnerships'}
              {activeTab === 'users' && 'Manage chapter users and contacts'}
              {activeTab === 'fraternity-users' && 'Manage fraternity and sorority sign-ups for sponsorships'}
              {activeTab === 'waitlist' && 'View and manage waitlist signups'}
              {activeTab === 'coming-tomorrow' && 'Manage upcoming chapters and roster updates for Dashboard'}
              {activeTab === 'wizard-admin' && 'Platform super admin - impersonate any company account'}
              {activeTab === 'payments' && 'Track revenue, transactions, and financial analytics'}
              {activeTab === 'unlocks' && 'Analyze chapter unlock trends and popular content'}
              {activeTab === 'credits' && 'Monitor credit usage and pricing performance'}
              {activeTab === 'intelligence' && 'Deep dive into company behavior and health metrics'}
              {activeTab === 'analytics' && 'Business intelligence and growth analytics'}
              {activeTab === 'activity' && 'Track user clicks and interaction analytics'}
              {activeTab === 'roadmap' && 'Manage product roadmap features and data coverage'}
              {activeTab === 'college-clubs' && 'Manage college investment groups, blockchain groups, and poker clubs'}
              {activeTab === 'intro-requests' && 'View and manage all warm introduction requests from companies'}
            </p>
          </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Save className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">{successMessage}</p>
              <button
                onClick={() => setShowSuccess(false)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top Row - Revenue & Financial KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100 uppercase font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold mt-1">
                    ${companies.reduce((sum, c) => sum + (c.total_spent || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-100 mt-1">Credits spent</p>
                </div>
                <DollarSign className="w-12 h-12 text-green-200 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100 uppercase font-medium">Active Credits</p>
                  <p className="text-3xl font-bold mt-1">
                    {companies.reduce((sum, c) => sum + (c.credits_balance || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-100 mt-1">Total balance</p>
                </div>
                <CreditCard className="w-12 h-12 text-blue-200 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100 uppercase font-medium">Total Unlocks</p>
                  <p className="text-3xl font-bold mt-1">
                    {companies.reduce((sum, c) => sum + (c.unlocks?.length || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-purple-100 mt-1">Chapter unlocks</p>
                </div>
                <Lock className="w-12 h-12 text-purple-200 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-100 uppercase font-medium">Avg Revenue/Company</p>
                  <p className="text-3xl font-bold mt-1">
                    ${companies.length > 0
                      ? (companies.reduce((sum, c) => sum + (c.total_spent || 0), 0) / companies.length).toFixed(0)
                      : '0'}
                  </p>
                  <p className="text-xs text-orange-100 mt-1">Per company</p>
                </div>
                <TrendingUp className="w-12 h-12 text-orange-200 opacity-80" />
              </div>
            </div>
          </div>

          {/* Second Row - Core Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Companies</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{companies.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Registered accounts</p>
                </div>
                <Briefcase className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Fraternities</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{greekOrgs.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Greek organizations</p>
                </div>
                <Building2 className="w-10 h-10 text-purple-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Colleges</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{universities.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Universities listed</p>
                </div>
                <GraduationCap className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Chapters</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{chapters.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Active chapters</p>
                </div>
                <Users className="w-10 h-10 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Third Row - Additional KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{users.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Chapter contacts</p>
                </div>
                <UserCheck className="w-10 h-10 text-indigo-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-pink-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Waitlist</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{waitlistEntries.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Pending signups</p>
                </div>
                <UserPlus className="w-10 h-10 text-pink-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-teal-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Active Companies</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {companies.filter(c => (c.unlocks?.length || 0) > 0).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">With unlocks</p>
                </div>
                <BarChart3 className="w-10 h-10 text-teal-500" />
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Companies by Revenue</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits Balance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unlocks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {companies
                    .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
                    .slice(0, 5)
                    .map((company) => (
                      <tr key={company.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{company.company_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <span className="font-semibold text-green-600">{company.total_spent || 0}</span> credits
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">${(company.credits_balance || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{company.unlocks?.length || 0}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {companies.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No companies registered yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Recent Activity
              </h3>
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Events</option>
                <option value="purchase">Purchases</option>
                <option value="new_client">New Clients</option>
                <option value="unlock">Unlocks</option>
                <option value="warm_intro_request">Warm Intros</option>
                <option value="admin_upload">Admin Uploads</option>
              </select>
            </div>
            <div className="space-y-3">
              {activityLog
                .filter(log => activityFilter === 'all' || log.event_type === activityFilter)
                .slice(0, activityVisibleCount)
                .map((log) => {
                  const getEventIcon = () => {
                    switch (log.event_type) {
                      case 'purchase': return <ShoppingCart className="w-5 h-5 text-green-600" />;
                      case 'new_client': return <UserPlus className="w-5 h-5 text-blue-600" />;
                      case 'unlock': return <Unlock className="w-5 h-5 text-purple-600" />;
                      case 'warm_intro_request': return <Handshake className="w-5 h-5 text-orange-600" />;
                      case 'admin_upload': return <FileUp className="w-5 h-5 text-teal-600" />;
                      default: return <Activity className="w-5 h-5 text-gray-600" />;
                    }
                  };

                  const getEventBadgeColor = () => {
                    switch (log.event_type) {
                      case 'purchase': return 'bg-green-100 text-green-800';
                      case 'new_client': return 'bg-blue-100 text-blue-800';
                      case 'unlock': return 'bg-purple-100 text-purple-800';
                      case 'warm_intro_request': return 'bg-orange-100 text-orange-800';
                      case 'admin_upload': return 'bg-teal-100 text-teal-800';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  };

                  return (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="mt-0.5">{getEventIcon()}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{log.event_title}</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getEventBadgeColor()}`}>
                            {log.event_type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{log.event_description}</p>
                        {log.company_name && (
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">Company:</span> {log.company_name}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              {activityLog.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>

            {/* Load More Button */}
            {activityLog.filter(log => activityFilter === 'all' || log.event_type === activityFilter).length > activityVisibleCount && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setActivityVisibleCount(prev => prev + 10)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <ChevronDown className="w-4 h-4" />
                  Load More Activity ({activityLog.filter(log => activityFilter === 'all' || log.event_type === activityFilter).length - activityVisibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Companies Tab Content */}
      {activeTab === 'companies' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unlocks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => fetchCompanyDetails(company.id)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <div className="text-sm font-medium text-gray-900">{company.company_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{company.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={company.approval_status || 'approved'}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            const response = await fetch(`${API_URL}/admin/companies/${company.id}/status`, {
                              method: 'PATCH',
                              headers: getAdminHeaders(),
                              body: JSON.stringify({ approval_status: newStatus })
                            });

                            if (response.ok) {
                              setCompanies(companies.map(c =>
                                c.id === company.id ? { ...c, approval_status: newStatus as 'pending' | 'approved' | 'rejected' } : c
                              ));
                              setSuccessMessage(`Status updated to ${newStatus}`);
                              setShowSuccess(true);
                              setTimeout(() => setShowSuccess(false), 3000);
                            } else {
                              alert('Failed to update status');
                            }
                          } catch (error) {
                            alert('Error updating status');
                          }
                        }}
                        className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${
                          company.approval_status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : company.approval_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <option value="pending">pending</option>
                        <option value="approved">approved</option>
                        <option value="rejected">rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={company.subscription_tier || 'trial'}
                        onChange={async (e) => {
                          const newTier = e.target.value;
                          try {
                            const response = await fetch(`${API_URL}/admin/companies/${company.id}/subscription-tier`, {
                              method: 'POST',
                              headers: getAdminHeaders(),
                              body: JSON.stringify({ tier: newTier })
                            });

                            if (response.ok) {
                              setCompanies(companies.map(c =>
                                c.id === company.id ? { ...c, subscription_tier: newTier } : c
                              ));
                              setSuccessMessage(`Subscription updated to ${newTier}`);
                              setShowSuccess(true);
                              setTimeout(() => setShowSuccess(false), 3000);
                            } else {
                              alert('Failed to update subscription tier');
                            }
                          } catch (error) {
                            alert('Error updating subscription tier');
                          }
                        }}
                        className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${
                          company.subscription_tier === 'enterprise'
                            ? 'bg-purple-100 text-purple-700'
                            : company.subscription_tier === 'monthly'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <option value="trial">Trial</option>
                        <option value="monthly">Team</option>
                        <option value="enterprise">Enterprise T1</option>
                        <option value="super_enterprise">Enterprise T2</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        {company.credits_balance || 0} credits
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {company.total_spent || 0} credits
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          alert(`Unlocked Chapters:\n\n${company.unlocks?.map(u =>
                            `• ${u.chapters?.universities.name} - ${u.chapters?.greek_organizations.name} (${u.chapters?.chapter_name})\n  ${u.amount_paid === 0 ? '✨ Subscription Unlock - $0.00' : `💳 ${u.amount_paid} credits - $${(u.amount_paid * 0.99).toFixed(2)}`}`
                          ).join('\n\n') || 'No unlocks yet'}`);
                        }}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                      >
                        <Unlock className="w-4 h-4" />
                        <span className="text-sm font-medium">{company.unlocks?.length || 0}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(company.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            const amount = prompt('How many credits to add?');
                            if (!amount || isNaN(parseInt(amount))) return;

                            try {
                              const response = await fetch(`${API_URL}/admin/companies/${company.id}/add-credits`, {
                                method: 'POST',
                                headers: getAdminHeaders(),
                                body: JSON.stringify({ credits: parseInt(amount) })
                              });

                              if (response.ok) {
                                alert(`Successfully added ${amount} credits to ${company.company_name}`);
                                fetchData();
                              } else {
                                alert('Failed to add credits');
                              }
                            } catch (error) {
                              alert('Error adding credits');
                            }
                          }}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add Credits
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Are you sure you want to DELETE the account for ${company.company_name}? This action CANNOT be undone!`)) return;

                            try {
                              const response = await fetch(`${API_URL}/admin/companies/${company.id}`, {
                                method: 'DELETE',
                                headers: getAdminHeaders()
                              });

                              if (response.ok) {
                                alert(`Successfully deleted account for ${company.company_name}`);
                                fetchData();
                              } else {
                                const error = await response.json();
                                alert(`Failed to delete account: ${error.message || 'Unknown error'}`);
                              }
                            } catch (error) {
                              alert('Error deleting account');
                              console.error(error);
                            }
                          }}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {companies.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No companies registered yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Company Detail Modal */}
      {showCompanyDetail && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCompany.company_name}</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedCompany.email}</p>
              </div>
              <button
                onClick={() => setShowCompanyDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Company Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
                  <select
                    value={selectedCompany.approval_status || 'approved'}
                    onChange={async (e) => {
                      const newStatus = e.target.value as 'pending' | 'approved' | 'rejected';
                      try {
                        const response = await fetch(`${API_URL}/admin/companies/${selectedCompany.id}/status`, {
                          method: 'PATCH',
                          headers: getAdminHeaders(),
                          body: JSON.stringify({ approval_status: newStatus })
                        });

                        if (!response.ok) {
                          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                          throw new Error(errorData.error || `HTTP ${response.status}`);
                        }

                        // Update local state
                        setCompanies(companies.map(c =>
                          c.id === selectedCompany.id ? { ...c, approval_status: newStatus } : c
                        ));
                        setSelectedCompany({ ...selectedCompany, approval_status: newStatus });
                      } catch (error: any) {
                        console.error('Error updating status:', error);
                        const errorMsg = error.message || error.toString() || 'Unknown error';
                        alert(`Failed to update status: ${errorMsg}`);
                      }
                    }}
                    className={`px-3 py-1 text-sm font-medium rounded-md border-2 ${
                      (selectedCompany.approval_status || 'approved') === 'approved'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : (selectedCompany.approval_status || 'approved') === 'pending'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                  </select>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase mb-1">Credits Balance</p>
                  <p className="text-lg font-semibold text-gray-900">${(selectedCompany.credits_balance || 0).toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase mb-1">Total Spent</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCompany.total_spent || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase mb-1">Unlocks</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCompany.unlocks?.length || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase mb-1">Subscription Tier</p>
                  <select
                    value={selectedCompany.subscription_tier || 'trial'}
                    onChange={async (e) => {
                      const newTier = e.target.value;
                      try {
                        const response = await fetch(`${API_URL}/admin/companies/${selectedCompany.id}/subscription-tier`, {
                          method: 'POST',
                          headers: getAdminHeaders(),
                          body: JSON.stringify({ tier: newTier })
                        });

                        if (response.ok) {
                          const result = await response.json();
                          const benefitsMsg = result.benefits && result.benefits.length > 0
                            ? `\n\nAuto-provisioned:\n• ${result.benefits.join('\n• ')}`
                            : '';
                          alert(`Successfully updated to ${newTier} tier!${benefitsMsg}`);
                          await fetchCompanyDetails(selectedCompany.id);
                        } else {
                          const result = await response.json();
                          alert(`Failed to update tier: ${result.error || 'Unknown error'}`);
                        }
                      } catch (error) {
                        console.error('Error updating tier:', error);
                        alert('Error updating subscription tier');
                      }
                    }}
                    className="mt-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold bg-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="trial">Trial</option>
                    <option value="monthly">Monthly (Team)</option>
                    <option value="enterprise">Enterprise Tier 1</option>
                    <option value="super_enterprise">Enterprise Tier 2</option>
                  </select>
                </div>
              </div>

              {/* Unlock Limits Section */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  Chapter Unlock Limits (Monthly)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 5.0 Star Unlocks */}
                  <div className="bg-white p-4 rounded-lg border border-purple-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      5.0⭐ Premium Unlocks/Month
                    </label>
                    <input
                      type="number"
                      min="0"
                      defaultValue={(selectedCompany as any).monthly_unlocks_5_star || 0}
                      onBlur={async (e) => {
                        const newLimit = parseInt(e.target.value) || 0;
                        console.log('[Unlock Limits] 🎯 Updating 5.0⭐ limit to:', newLimit);
                        try {
                          const response = await fetch(`${API_URL}/admin/companies/${selectedCompany.id}/unlock-limits`, {
                            method: 'PATCH',
                            headers: getAdminHeaders(),
                            body: JSON.stringify({
                              monthly_unlocks_5_star: newLimit
                            })
                          });

                          console.log('[Unlock Limits] Response status:', response.status);
                          const result = await response.json();
                          console.log('[Unlock Limits] Response data:', result);

                          if (response.ok) {
                            alert(`Successfully updated 5.0⭐ unlock limit to ${newLimit}/month`);
                            console.log('[Unlock Limits] ✅ Fetching updated company details...');
                            await fetchCompanyDetails(selectedCompany.id);
                            console.log('[Unlock Limits] ✅ Company details refreshed');
                          } else {
                            alert(`Failed to update limit: ${result.error || 'Unknown error'}`);
                          }
                        } catch (error) {
                          console.error('[Unlock Limits] ❌ Error:', error);
                          alert('Error updating unlock limit');
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Remaining: {(selectedCompany as any).unlocks_5_star_remaining || 0}
                    </p>
                  </div>

                  {/* 4.0 Star Unlocks */}
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      4.0⭐ Quality Unlocks/Month
                    </label>
                    <input
                      type="number"
                      min="0"
                      defaultValue={(selectedCompany as any).monthly_unlocks_4_star || 0}
                      onBlur={async (e) => {
                        const newLimit = parseInt(e.target.value) || 0;
                        console.log('[Unlock Limits] 🎯 Updating 4.0⭐ limit to:', newLimit);
                        try {
                          const response = await fetch(`${API_URL}/admin/companies/${selectedCompany.id}/unlock-limits`, {
                            method: 'PATCH',
                            headers: getAdminHeaders(),
                            body: JSON.stringify({
                              monthly_unlocks_4_star: newLimit
                            })
                          });

                          console.log('[Unlock Limits] Response status:', response.status);
                          const result = await response.json();
                          console.log('[Unlock Limits] Response data:', result);

                          if (response.ok) {
                            alert(`Successfully updated 4.0⭐ unlock limit to ${newLimit}/month`);
                            console.log('[Unlock Limits] ✅ Fetching updated company details...');
                            await fetchCompanyDetails(selectedCompany.id);
                            console.log('[Unlock Limits] ✅ Company details refreshed');
                          } else {
                            alert(`Failed to update limit: ${result.error || 'Unknown error'}`);
                          }
                        } catch (error) {
                          console.error('[Unlock Limits] ❌ Error:', error);
                          alert('Error updating unlock limit');
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Remaining: {(selectedCompany as any).unlocks_4_star_remaining || 0}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-4 italic">
                  Note: Roster info and warm introductions can only be unlocked via credits (no monthly allowances).
                </p>
              </div>

              {/* Company Profile Section */}
              <CompanyProfileTab
                company={selectedCompany}
                onUpdate={() => fetchCompanyDetails(selectedCompany.id)}
                apiUrl={API_URL}
                getAdminHeaders={getAdminHeaders}
              />

              {/* Users Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members ({selectedCompany.users?.length || 0})
                </h3>
                {selectedCompany.users && selectedCompany.users.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCompany.users.map((user, idx) => (
                      <div key={user.user_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-lg">
                              {user.first_name ? user.first_name[0].toUpperCase() : user.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">
                                {user.first_name && user.last_name
                                  ? `${user.first_name} ${user.last_name}`
                                  : user.email}
                              </p>
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                #{user.member_number}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                user.role === 'owner'
                                  ? 'bg-purple-100 text-purple-700'
                                  : user.role === 'admin'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {user.role || 'member'}
                              </span>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                user.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {user.status || 'active'}
                              </span>
                              <span className="text-xs text-gray-500">
                                · Joined {new Date(user.joined_at || user.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No team members yet</p>
                )}
              </div>

              {/* Unlock History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Unlock className="w-5 h-5" />
                  Unlock History
                </h3>
                {selectedCompany.unlocks && selectedCompany.unlocks.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedCompany.unlocks.map((unlock) => (
                      <div key={unlock.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {unlock.chapters?.universities?.name} - {unlock.chapters?.greek_organizations?.name}
                            </p>
                            <p className="text-sm text-gray-600">{unlock.chapters?.chapter_name}</p>
                            <p className="text-xs mt-1 flex items-center gap-2">
                              {unlock.amount_paid === 0 ? (
                                <>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                    ✨ Subscription Unlock
                                  </span>
                                  {unlock.chapters?.grade && (
                                    <span className="text-gray-600">
                                      {unlock.chapters.grade >= 5.0 ? '5.0⭐' :
                                       unlock.chapters.grade >= 4.0 ? '4.0⭐' :
                                       unlock.chapters.grade >= 3.0 ? '3.0⭐' :
                                       `${unlock.chapters.grade}⭐`}
                                    </span>
                                  )}
                                  <span className="text-gray-500">· $0.00</span>
                                </>
                              ) : (
                                <>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    💳 Credits
                                  </span>
                                  <span className="text-gray-600">{unlock.amount_paid} credits</span>
                                  <span className="text-gray-500">· ${(unlock.amount_paid * 0.99).toFixed(2)}</span>
                                </>
                              )}
                              <span className="text-gray-400">· {new Date(unlock.unlocked_at).toLocaleDateString()}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No unlocks yet</p>
                )}
              </div>

              {/* Transaction History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Recent Transactions
                </h3>
                {selectedCompany.transactions && selectedCompany.transactions.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedCompany.transactions.map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{tx.description}</p>
                          <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleString()}</p>
                        </div>
                        <span className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No transactions yet</p>
                )}
              </div>

              {/* Company Info */}
              {selectedCompany.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-600 text-sm">{selectedCompany.description}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCompanyDetail(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  try {
                    // Save button just closes the modal since changes are saved immediately via the dropdown
                    alert('Changes saved successfully');
                    setShowCompanyDetail(false);
                  } catch (error) {
                    alert('Error saving changes');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save
              </button>
              <button
                onClick={async () => {
                  const amount = prompt('How many credits to add?');
                  if (!amount || isNaN(parseInt(amount))) return;

                  try {
                    const response = await fetch(`${API_URL}/admin/companies/${selectedCompany.id}/add-credits`, {
                      method: 'POST',
                      headers: getAdminHeaders(),
                      body: JSON.stringify({ credits: parseInt(amount) })
                    });

                    const result = await response.json();
                    console.log('Add credits response:', result);

                    if (response.ok) {
                      alert(`Successfully added ${amount} credits`);
                      console.log('Refreshing company details...');
                      await fetchCompanyDetails(selectedCompany.id); // Refresh
                      await fetchData(); // Refresh list
                      console.log('Refresh complete. New balance:', selectedCompany.credits_balance);
                    } else {
                      alert(`Failed to add credits: ${result.error || 'Unknown error'}`);
                    }
                  } catch (error) {
                    console.error('Error adding credits:', error);
                    alert('Error adding credits');
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Area with Action Bar */}
      {(activeTab === 'fraternities' || activeTab === 'colleges' || activeTab === 'chapters' || activeTab === 'ambassadors' || activeTab === 'users' || activeTab === 'fraternity-users' || activeTab === 'waitlist' || activeTab === 'coming-tomorrow' || activeTab === 'payments' || activeTab === 'unlocks' || activeTab === 'credits' || activeTab === 'intelligence' || activeTab === 'analytics' || activeTab === 'activity' || activeTab === 'roadmap') && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Action Bar */}
          <div className="flex justify-between items-center mb-6 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {activeTab === 'colleges' && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by:</label>
                  <select
                    value={collegeFilter}
                    onChange={(e) => setCollegeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                  >
                    <option value="all">All Colleges</option>
                    <option value="division1">Division 1</option>
                    <option value="power5">Power 5</option>
                    <option value="sec">SEC</option>
                    <option value="big10">Big 10</option>
                    <option value="big12">Big 12</option>
                    <option value="acc">ACC</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Order by:</label>
                  <select
                    value={collegeOrderBy}
                    onChange={(e) => setCollegeOrderBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="state">State</option>
                    <option value="chapters">Most Chapters</option>
                    <option value="conference">Conference</option>
                    <option value="recent">Recently Added</option>
                  </select>
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              {activeTab !== 'waitlist' && (
                <>
                  <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>CSV Import</span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVImport}
                      className="hidden"
                    />
                  </label>
                  {activeTab === 'chapters' && (
                    <button
                      onClick={() => {
                        setShowPasteModal(true);
                        setPasteChapterId('');
                        setPasteCSVText('');
                        setPasteResult(null);
                        setSelectedUniversityId('');
                        setUniversitySearchTerm('');
                        setChapterSearchTerm('');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <FileUp className="w-4 h-4" />
                      <span>Paste Roster</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowForm(!showForm);
                      setEditingId(null);
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                  >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{showForm ? 'Cancel' : 'Add New'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* CSV Format Helper - Show Claude Prompt */}
          {activeTab !== 'waitlist' && (activeTab === 'colleges' || activeTab === 'users' || activeTab === 'chapters' || activeTab === 'coming-tomorrow') && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📋</div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">CSV Format Helper - Copy this prompt to Claude</h3>
                  <div className="bg-white border border-blue-200 rounded-lg p-3 text-xs font-mono text-gray-700 overflow-x-auto">
                    {activeTab === 'colleges' && (
                      <pre className="whitespace-pre-wrap">
{`Please format the following data into a CSV with these exact column headers:

Required columns:
- name (or Name): University name
- location (or Location): City, State
- state (or State): Two-letter state code

Optional columns:
- student_count (or Student Count): Number of students
- greek_percentage (or Greek %): Percentage in Greek life
- website (or Website): University website URL
- logo_url (or Logo URL): URL to university logo image
- conference (or Conference): Athletic conference (e.g., SEC, Big Ten)
- bars_nearby (or Bars Nearby): Number of bars near campus
- unlock_count (or Unlock Count): Number of chapter unlocks

Example CSV format:
name,location,state,student_count,greek_percentage,website,logo_url,conference
University of Alabama,Tuscaloosa AL,AL,38100,27.5,https://www.ua.edu,https://...,SEC`}
                      </pre>
                    )}
                    {activeTab === 'users' && (
                      <pre className="whitespace-pre-wrap">
{`Please format the following data into a CSV with these exact column headers:

Required columns:
- chapter (or Chapter): Chapter name (e.g., "Alpha Sigma")
- university (or University or college or College): University name
- name (or Name): Full name of member

Optional columns:
- position (or Position): Officer position (defaults to "Member")
- member_type (or Member Type or type): Either "officer" or "member"
- email (or Email): Email address
- phone (or Phone): Phone number
- linkedin (or LinkedIn or linkedin_profile): LinkedIn profile URL
- graduation_year (or Graduation Year or grad_year): Year of graduation
- major (or Major): Academic major
- is_primary (or Primary Contact): "true" or "false"

Example CSV format:
chapter,university,name,position,member_type,email,phone,graduation_year,major
Alpha Sigma,University of Florida,John Doe,President,officer,john@example.com,555-1234,2024,Business`}
                      </pre>
                    )}
                    {activeTab === 'chapters' && (
                      <pre className="whitespace-pre-wrap">
{`Please format the following data into a CSV with these exact column headers:

Required columns:
- organization (or Organization): Greek organization name (e.g., "Sigma Chi", "Delta Gamma")
- university (or University): University name
- chapter_name (or Chapter Name or chapter or Chapter): Chapter designation (e.g., "Alpha Sigma", "Beta Chapter")

Optional columns:
- grade (or Grade): Chapter rating/grade (0.0-5.0, defaults to 3.0)

Example CSV format:
organization,university,chapter_name,grade
Sigma Chi,University of Florida,Alpha Sigma,4.5
Delta Gamma,Florida State University,Beta Chapter,4.2`}
                      </pre>
                    )}
                    {activeTab === 'coming-tomorrow' && (
                      <pre className="whitespace-pre-wrap">
{`Please format the following data into a CSV with these exact column headers:

Required columns:
- college_name (or College Name): University/college name (e.g., "Michigan", "Florida State")
- anticipated_score (or Anticipated Score): Expected chapter score/rating (0.0-5.0)
- update_type (or Update Type): Type of update - must be one of: "new_chapter", "roster_update", or "new_sorority"

Optional columns:
- chapter_name (or Chapter Name): Chapter name if applicable (e.g., "Delta Tau Delta")
- expected_member_count (or Expected Member Count): Number of expected members
- scheduled_date (or Scheduled Date): Date in YYYY-MM-DD format (e.g., "2024-03-15")

Example CSV format:
college_name,anticipated_score,update_type,chapter_name,expected_member_count,scheduled_date
Michigan,4.8,new_chapter,Delta Tau Delta,112,2024-03-15
Ohio State,4.5,roster_update,Sigma Chi,95,2024-03-20`}
                      </pre>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const promptText = document.querySelector('.bg-white.border.border-blue-200 pre')?.textContent || '';
                      navigator.clipboard.writeText(promptText);
                      alert('Prompt copied to clipboard! Paste this into Claude with your data.');
                    }}
                    className="mt-3 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    📋 Copy Prompt to Clipboard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Assistant Bar - Only show when connected */}
          {aiStatus?.connected && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🤖</span>
                    <h3 className="text-sm font-semibold text-gray-900">AI Data Assistant</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      Online
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && aiPrompt.trim()) {
                          handleAIAssist();
                        }
                      }}
                      placeholder='Ask AI to help with data... (e.g., "Add top 10 Big Ten universities" or "Find all chapters in California")'
                      className="flex-1 px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAIAssist}
                      disabled={aiLoading || !aiPrompt.trim()}
                      className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {aiLoading ? (
                        <>
                          <span className="animate-spin">⚙️</span>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          <span>Ask AI</span>
                        </>
                      )}
                    </button>
                  </div>
                  {aiResponse && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-semibold text-purple-700">AI Response:</p>
                        <button
                          onClick={() => setAiResponse('')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiResponse}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fraternity Tab Content */}
          {activeTab === 'fraternities' && (
            <>
              {showForm && (
                <form onSubmit={handleFraternitySubmit} className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-primary-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingId ? 'Edit' : 'Add New'} Fraternity/Sorority
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        required
                        value={fraternityForm.name}
                        onChange={(e) => setFraternityForm({ ...fraternityForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., Sigma Chi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Greek Letters</label>
                      <input
                        type="text"
                        value={fraternityForm.greek_letters}
                        onChange={(e) => setFraternityForm({ ...fraternityForm, greek_letters: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., ΣΧ"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={fraternityForm.organization_type}
                        onChange={(e) => setFraternityForm({ ...fraternityForm, organization_type: e.target.value as 'fraternity' | 'sorority' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="fraternity">Fraternity</option>
                        <option value="sorority">Sorority</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                      <input
                        type="number"
                        value={fraternityForm.founded_year}
                        onChange={(e) => setFraternityForm({ ...fraternityForm, founded_year: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., 1855"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">National Website</label>
                      <input
                        type="url"
                        value={fraternityForm.national_website}
                        onChange={(e) => setFraternityForm({ ...fraternityForm, national_website: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="https://www.sigmachi.org"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingId ? 'Update' : 'Create'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Data Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative">
                {isLoadingData && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-3">
                      <Loader className="w-8 h-8 text-primary-600 animate-spin" />
                      <p className="text-sm text-gray-600">Loading data...</p>
                    </div>
                  </div>
                )}
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Colleges</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Greek Letters</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Founded</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredGreekOrgs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="text-gray-400">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-medium">No fraternities or sororities found</p>
                            <p className="text-xs mt-1">Try adjusting your search criteria</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredGreekOrgs.map((org) => (
                        <tr key={org.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              {org.topColleges && org.topColleges.length > 0 ? (
                                org.topColleges.map((college: any, idx: number) => (
                                  <div key={college.id} className="relative group">
                                    <img
                                      src={college.logo_url || getCollegeLogoWithFallback(college.name)}
                                      alt={college.name}
                                      className="w-8 h-8 rounded-full object-contain bg-white border border-gray-200"
                                      title={`${college.name} (${college.chapterCount} chapter${college.chapterCount !== 1 ? 's' : ''})`}
                                    />
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                      {college.name} ({college.chapterCount})
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400">No chapters</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{org.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{org.greek_letters || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              org.organization_type === 'fraternity' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                            }`}>
                              {org.organization_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {org.founded_year || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleFraternityEdit(org)}
                              className="text-primary-600 hover:text-primary-900 mr-3"
                            >
                              <Edit className="w-4 h-4 inline" />
                            </button>
                            <button
                              onClick={() => handleFraternityDelete(org.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Colleges Tab Content */}
          {activeTab === 'colleges' && (
            <>
              {showForm && (
                <form onSubmit={handleUniversitySubmit} className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-primary-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingId ? 'Edit' : 'Add New'} University
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        required
                        value={universityForm.name}
                        onChange={(e) => setUniversityForm({ ...universityForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., Penn State University"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                      <input
                        type="text"
                        required
                        value={universityForm.location}
                        onChange={(e) => setUniversityForm({ ...universityForm, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., University Park"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={universityForm.state}
                        onChange={(e) => setUniversityForm({ ...universityForm, state: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., PA"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Conference</label>
                      <select
                        value={universityForm.conference}
                        onChange={(e) => setUniversityForm({ ...universityForm, conference: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select Conference</option>
                        <option value="ACC">ACC (Atlantic Coast Conference)</option>
                        <option value="Big Ten">Big Ten</option>
                        <option value="Big 12">Big 12</option>
                        <option value="SEC">SEC (Southeastern Conference)</option>
                        <option value="Pac-12">Pac-12</option>
                        <option value="American">American Athletic Conference</option>
                        <option value="Mountain West">Mountain West</option>
                        <option value="Conference USA">Conference USA</option>
                        <option value="MAC">MAC (Mid-American Conference)</option>
                        <option value="Sun Belt">Sun Belt</option>
                        <option value="Independent">Independent</option>
                        <option value="FCS">FCS (Football Championship Subdivision)</option>
                        <option value="Division II">Division II</option>
                        <option value="Division III">Division III</option>
                        <option value="NAIA">NAIA</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student Count</label>
                      <input
                        type="number"
                        value={universityForm.student_count}
                        onChange={(e) => setUniversityForm({ ...universityForm, student_count: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., 46000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Greek % (decimal)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={universityForm.greek_percentage}
                        onChange={(e) => setUniversityForm({ ...universityForm, greek_percentage: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., 0.18 for 18%"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bars Nearby</label>
                      <input
                        type="number"
                        value={universityForm.bars_nearby}
                        onChange={(e) => setUniversityForm({ ...universityForm, bars_nearby: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., 15"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unlock Count</label>
                      <input
                        type="number"
                        value={universityForm.unlock_count}
                        onChange={(e) => setUniversityForm({ ...universityForm, unlock_count: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., 5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="url"
                        value={universityForm.website}
                        onChange={(e) => setUniversityForm({ ...universityForm, website: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="https://www.psu.edu"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Logo Upload</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Validate file type
                            const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif'];
                            if (!validTypes.includes(file.type)) {
                              alert(`Invalid file type: ${file.type}. Please upload PNG, JPG, SVG, WebP, or GIF images.`);
                              return;
                            }
                            // Validate file size (5MB limit)
                            const maxSize = 5 * 1024 * 1024; // 5MB
                            if (file.size > maxSize) {
                              alert(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 5MB.`);
                              return;
                            }
                            // Create preview URL
                            const previewUrl = URL.createObjectURL(file);
                            setUniversityForm({
                              ...universityForm,
                              logoFile: file,
                              logo_url: previewUrl // Show preview immediately
                            });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Accepts PNG, JPG, SVG, WebP, or GIF. Max size: 5MB. Recommended: 200x200px</p>
                      {(universityForm.logo_url || universityForm.logoFile) && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-2">Logo Preview:</p>
                          <div className="flex items-center gap-3">
                            <img
                              src={universityForm.logo_url}
                              alt="Logo preview"
                              className="h-20 w-20 object-contain border border-gray-300 rounded bg-white p-2"
                            />
                            {universityForm.logoFile && (
                              <div className="text-xs text-gray-600">
                                <p><strong>File:</strong> {universityForm.logoFile.name}</p>
                                <p><strong>Size:</strong> {(universityForm.logoFile.size / 1024).toFixed(1)} KB</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fraternities & Sororities Section */}
                  {editingId && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Fraternities & Sororities at this College</h4>
                      <div className="space-y-3">
                        {/* List existing chapters */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Current Greek Organizations:</p>
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {chapters
                              .filter(ch => ch.university_id === editingId)
                              .map(ch => (
                                <div key={ch.id} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                                  <div className="flex-1">
                                    <span className="text-sm font-medium">{ch.greek_organizations?.name || 'Unknown'}</span>
                                    {ch.chapter_name && <span className="text-xs text-gray-500 ml-2">({ch.chapter_name})</span>}
                                    {ch.member_count && <span className="text-xs text-gray-500 ml-2">• {ch.member_count} members</span>}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleChapterDelete(ch.id)}
                                    className="text-red-600 hover:text-red-900 text-xs"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            {chapters.filter(ch => ch.university_id === editingId).length === 0 && (
                              <p className="text-sm text-gray-400 italic">No Greek organizations yet</p>
                            )}
                          </div>
                        </div>

                        {/* Add new organization */}
                        <div className="border-t pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-700">Add Greek Organizations:</p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const bulkOrgs = greekOrgs.filter(org => !chapters.some(ch =>
                                    ch.university_id === editingId && ch.greek_organization_id === org.id
                                  ));
                                  if (bulkOrgs.length === 0) {
                                    alert('All organizations are already added to this college!');
                                    return;
                                  }
                                  if (confirm(`Add all ${bulkOrgs.length} available Greek organizations to this college?`)) {
                                    Promise.all(bulkOrgs.map(org =>
                                      fetch(`${API_URL}/admin/chapters`, {
                                        method: 'POST',
                                        headers: getAdminHeaders(),
                                        body: JSON.stringify({
                                          greek_organization_id: org.id,
                                          university_id: editingId,
                                          chapter_name: '',
                                          status: 'active'
                                        })
                                      })
                                    )).then(() => {
                                      showSuccessMsg(`Added ${bulkOrgs.length} Greek organizations!`);
                                      fetchData();
                                    });
                                  }
                                }}
                                className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                              >
                                Bulk Add All
                              </button>
                            </div>
                          </div>

                          {/* Multi-select list */}
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 mb-2">Select multiple organizations to add (hold Ctrl/Cmd to select multiple):</p>
                            <select
                              multiple
                              size={8}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
                              id="bulk-select-orgs"
                            >
                              {greekOrgs
                                .filter(org => !chapters.some(ch =>
                                  ch.university_id === editingId && ch.greek_organization_id === org.id
                                ))
                                .map(org => (
                                  <option key={org.id} value={org.id}>
                                    {org.name} ({org.organization_type})
                                  </option>
                                ))}
                            </select>
                            <button
                              type="button"
                              onClick={async () => {
                                const select = document.getElementById('bulk-select-orgs') as HTMLSelectElement;
                                const selectedIds = Array.from(select.selectedOptions).map(opt => opt.value);
                                if (selectedIds.length === 0) {
                                  alert('Please select at least one organization');
                                  return;
                                }
                                if (confirm(`Add ${selectedIds.length} selected Greek organization(s) to this college?`)) {
                                  try {
                                    await Promise.all(selectedIds.map(orgId =>
                                      fetch(`${API_URL}/admin/chapters`, {
                                        method: 'POST',
                                        headers: getAdminHeaders(),
                                        body: JSON.stringify({
                                          greek_organization_id: orgId,
                                          university_id: editingId,
                                          chapter_name: '',
                                          status: 'active'
                                        })
                                      })
                                    ));
                                    showSuccessMsg(`Added ${selectedIds.length} Greek organizations!`);
                                    await fetchData();
                                    select.selectedIndex = -1;
                                  } catch (err) {
                                    console.error('Error adding organizations:', err);
                                  }
                                }
                              }}
                              className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Add Selected Organizations
                            </button>
                          </div>

                          <p className="text-xs text-gray-500 mt-1">Tip: Select specific organizations above, or use "Bulk Add All" to add everything. Edit chapter details later in the Chapters tab.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingId ? 'Update' : 'Create'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Data Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative">
                {isLoadingData && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-3">
                      <Loader className="w-8 h-8 text-primary-600 animate-spin" />
                      <p className="text-sm text-gray-600">Loading data...</p>
                    </div>
                  </div>
                )}
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chapters</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bars</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unlocks</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Show in Dashboard</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUniversities.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="text-gray-400">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-medium">No colleges or universities found</p>
                            <p className="text-xs mt-1">Try adjusting your search or filter criteria</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUniversities.map((uni) => (
                        <tr key={uni.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {uni.logo_url ? (
                              <img src={uni.logo_url} alt={uni.name} className="h-8 w-8 object-contain mr-3" />
                            ) : (
                              <div className={`h-8 w-8 rounded mr-3 flex items-center justify-center text-white text-xs font-bold ${getColorFromString(uni.name)}`}>
                                {getInitials(uni.name)}
                              </div>
                            )}
                            <div className="text-sm font-medium text-gray-900">{uni.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{uni.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{uni.state}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            (uni.chapter_count || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {uni.chapter_count || 0} chapter{(uni.chapter_count || 0) !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {uni.bars_nearby || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {uni.unlock_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={async () => {
                              const newValue = !uni.show_in_dashboard;
                              try {
                                const res = await fetch(`${API_URL}/admin/universities/${uni.id}/dashboard-visibility`, {
                                  method: 'PATCH',
                                  headers: getAdminHeaders(),
                                  body: JSON.stringify({ show_in_dashboard: newValue })
                                });
                                if (res.ok) {
                                  fetchData();
                                }
                              } catch (error) {
                                console.error('Error toggling dashboard visibility:', error);
                              }
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              uni.show_in_dashboard ? 'bg-green-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                uni.show_in_dashboard ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleUniversityEdit(uni)}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                          >
                            <Edit className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => handleUniversityDelete(uni.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Chapters Tab Content */}
          {activeTab === 'chapters' && (
            <>
              {/* Quick Add Section */}
              <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-blue-600" />
                      Quick Add Chapters
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Just paste "Organization at University" - we'll match them automatically!
                    </p>
                  </div>
                  <button
                    onClick={() => setShowQuickAdd(!showQuickAdd)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {showQuickAdd ? 'Hide' : 'Show'} Quick Add
                  </button>
                </div>

                {showQuickAdd && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paste chapters (one per line):
                      </label>
                      <textarea
                        value={quickAddText}
                        onChange={(e) => setQuickAddText(e.target.value)}
                        placeholder={"Sigma Chi at Penn State\nPhi Delta Theta, Ohio State\nKappa Sigma | University of Michigan"}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        rows={6}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Supported formats: "Org at Uni", "Org, Uni", "Org | Uni", "Org - Uni"
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleQuickAddChapter}
                        disabled={!quickAddText.trim()}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Create All Chapters
                      </button>
                      <button
                        onClick={() => { setQuickAddText(''); setShowQuickAdd(false); }}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Chapter Verification Tool */}
              {aiStatus?.connected && (
                <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        🤖 AI Chapter Verification
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Check chapter info, validate data, find duplicates, or ask about chapter details
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && aiPrompt.trim()) {
                            handleAIAssist();
                          }
                        }}
                        placeholder='e.g., "Check if Sigma Chi at Penn State is a duplicate" or "Validate the Rutgers Sigma Chi chapter info" or "Find all chapters with missing member counts"'
                        className="flex-1 px-4 py-3 text-sm border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleAIAssist}
                        disabled={aiLoading || !aiPrompt.trim()}
                        className="px-6 py-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {aiLoading ? (
                          <>
                            <span className="animate-spin">⚙️</span>
                            <span>Checking...</span>
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            <span>Verify</span>
                          </>
                        )}
                      </button>
                    </div>

                    {aiResponse && (
                      <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-xs font-semibold text-purple-700">
                            AI Response:
                            {(aiResponse as any).toolsUsed > 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                {(aiResponse as any).toolsUsed} action{(aiResponse as any).toolsUsed > 1 ? 's' : ''} executed
                              </span>
                            )}
                          </p>
                          <button
                            onClick={() => setAiResponse('')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">{typeof aiResponse === 'string' ? aiResponse : (aiResponse as any).response || JSON.stringify(aiResponse)}</div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setAiPrompt('Check for duplicate chapters')}
                        className="px-3 py-1.5 bg-white border border-purple-300 text-purple-700 text-xs rounded-full hover:bg-purple-50 transition-colors"
                      >
                        Find Duplicates
                      </button>
                      <button
                        onClick={() => setAiPrompt('List chapters with missing member counts')}
                        className="px-3 py-1.5 bg-white border border-purple-300 text-purple-700 text-xs rounded-full hover:bg-purple-50 transition-colors"
                      >
                        Missing Data
                      </button>
                      <button
                        onClick={() => setAiPrompt('Show chapters needing grades')}
                        className="px-3 py-1.5 bg-white border border-purple-300 text-purple-700 text-xs rounded-full hover:bg-purple-50 transition-colors"
                      >
                        Need Grades
                      </button>
                      <button
                        onClick={() => setAiPrompt('Validate all chapter data quality')}
                        className="px-3 py-1.5 bg-white border border-purple-300 text-purple-700 text-xs rounded-full hover:bg-purple-50 transition-colors"
                      >
                        Data Quality Check
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showForm && (
                <form onSubmit={handleChapterSubmit} className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-primary-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Edit' : 'Add New'} Chapter</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fraternity/Sorority *</label>
                      <select
                        required
                        value={chapterForm.greek_organization_id}
                        onChange={(e) => setChapterForm({ ...chapterForm, greek_organization_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select organization...</option>
                        {greekOrgs.map(org => (
                          <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">University *</label>
                      <select
                        required
                        value={chapterForm.university_id}
                        onChange={(e) => setChapterForm({ ...chapterForm, university_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select university...</option>
                        {universities.map(uni => (
                          <option key={uni.id} value={uni.id}>{uni.name} ({uni.state})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Name *</label>
                      <input
                        type="text"
                        required
                        value={chapterForm.chapter_name}
                        onChange={(e) => setChapterForm({ ...chapterForm, chapter_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., Beta Theta"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Member Count</label>
                      <input
                        type="number"
                        value={chapterForm.member_count}
                        onChange={(e) => setChapterForm({ ...chapterForm, member_count: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., 95"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">House Address</label>
                      <input
                        type="text"
                        value={chapterForm.house_address}
                        onChange={(e) => setChapterForm({ ...chapterForm, house_address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., 420 E Prospect Ave"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={chapterForm.status}
                        onChange={(e) => setChapterForm({ ...chapterForm, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                      <select
                        value={chapterForm.grade || ''}
                        onChange={(e) => setChapterForm({ ...chapterForm, grade: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">No Grade</option>
                        <option value="5.0">5.0 - Full Roster</option>
                        <option value="4.0">4.0 - Some Contacts</option>
                        <option value="3.0">3.0 - Social Links Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Coming Soon Date</label>
                      <input
                        type="date"
                        value={chapterForm.coming_soon_date}
                        onChange={(e) => setChapterForm({ ...chapterForm, coming_soon_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">If set, shows "Coming [Date]" to clients when chapter is locked</p>
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <input
                        type="checkbox"
                        id="is_favorite"
                        checked={chapterForm.is_favorite}
                        onChange={(e) => setChapterForm({ ...chapterForm, is_favorite: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label htmlFor="is_favorite" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Mark as Favorite (for auto-assignment on signup)
                      </label>
                    </div>
                    <div className="flex items-center gap-3 pt-3">
                      <input
                        type="checkbox"
                        id="is_viewable"
                        checked={chapterForm.is_viewable}
                        onChange={(e) => setChapterForm({ ...chapterForm, is_viewable: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label htmlFor="is_viewable" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-500" />
                        Viewable in Dashboard (clients can see this chapter)
                      </label>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200 mt-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="is_platinum"
                          checked={chapterForm.is_platinum}
                          onChange={(e) => setChapterForm({ ...chapterForm, is_platinum: e.target.checked })}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="is_platinum" className="text-sm font-medium text-gray-700">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">⭐</span>
                            <span>Platinum Chapter</span>
                          </div>
                          <p className="text-xs text-gray-500 ml-6">$50 unlock (standard access)</p>
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="is_diamond"
                          checked={chapterForm.is_diamond}
                          onChange={(e) => setChapterForm({ ...chapterForm, is_diamond: e.target.checked })}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="is_diamond" className="text-sm font-medium text-gray-700">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">💎</span>
                            <span>Diamond Chapter</span>
                          </div>
                          <p className="text-xs text-gray-500 ml-6">$100 unlock + warm intro (48hr guarantee)</p>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingId(null); }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingId ? 'Update' : 'Create'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Grade Key */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Chapter Grade Key</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 font-bold rounded">5.0</span>
                        <span className="text-gray-700">Full roster (all contacts)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 font-bold rounded">4.0</span>
                        <span className="text-gray-700">Some contacts available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 font-bold rounded">3.0</span>
                        <span className="text-gray-700">Social links & websites only</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organization Type Toggle - BIG BUTTONS */}
              <div className="mb-6 flex flex-col gap-3">
                <h3 className="text-base font-semibold text-gray-900">Filter Chapters</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setOrgTypeFilter('fraternity')}
                    className={`flex-1 px-8 py-4 text-lg font-bold rounded-xl transition-all shadow-md hover:shadow-lg ${
                      orgTypeFilter === 'fraternity'
                        ? 'bg-blue-600 text-white scale-105'
                        : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    🏛️ FRATERNITIES
                    <div className="text-sm font-normal mt-1">
                      ({chapters.filter(ch => ch.greek_organizations?.organization_type === 'fraternity').length} chapters)
                    </div>
                  </button>
                  <button
                    onClick={() => setOrgTypeFilter('sorority')}
                    className={`flex-1 px-8 py-4 text-lg font-bold rounded-xl transition-all shadow-md hover:shadow-lg ${
                      orgTypeFilter === 'sorority'
                        ? 'bg-pink-600 text-white scale-105'
                        : 'bg-white text-pink-600 border-2 border-pink-600 hover:bg-pink-50'
                    }`}
                  >
                    💎 SORORITIES
                    <div className="text-sm font-normal mt-1">
                      ({chapters.filter(ch => ch.greek_organizations?.organization_type === 'sorority').length} chapters)
                    </div>
                  </button>
                </div>
                {orgTypeFilter !== 'all' && (
                  <button
                    onClick={() => setOrgTypeFilter('all')}
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Show All Chapters ({chapters.length})
                  </button>
                )}
              </div>

              {/* Filters Row */}
              <div className="mb-4 flex flex-wrap items-center gap-4">
                {/* Order By Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Order by:</label>
                  <select
                    value={chapterOrderBy}
                    onChange={(e) => setChapterOrderBy(e.target.value as 'name' | 'university' | 'grade' | 'recent')}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="grade">Grade (Highest First)</option>
                    <option value="name">Fraternity Name</option>
                    <option value="university">University Name</option>
                    <option value="recent">Recently Added</option>
                  </select>
                </div>

                {/* Fraternity Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Fraternity:</label>
                  <select
                    value={selectedFraternityFilter}
                    onChange={(e) => setSelectedFraternityFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 min-w-[200px]"
                  >
                    <option value="all">All Fraternities</option>
                    {greekOrgs
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(org => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))
                    }
                  </select>
                </div>

                {/* Recent Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Recently Added:</label>
                  <select
                    value={recentFilter}
                    onChange={(e) => setRecentFilter(e.target.value as 'all' | '24h' | '7d' | '30d')}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Time</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>

                {/* Clear Filters Button */}
                {(selectedFraternityFilter !== 'all' || recentFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSelectedFraternityFilter('all');
                      setRecentFilter('all');
                    }}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Clear Filters
                  </button>
                )}

                {/* Results Count */}
                <div className="ml-auto text-sm text-gray-600">
                  Showing {filteredChapters.length} {filteredChapters.length === 1 ? 'chapter' : 'chapters'}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16">
                        <Eye className="w-4 h-4 mx-auto" />
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fraternity</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">University</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chapter</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Added</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Dashboard</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredChapters.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center">
                          <div className="text-gray-400">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-medium">No chapters found</p>
                            <p className="text-xs mt-1">Try adjusting your search or filter criteria</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredChapters.map((ch) => (
                      <tr key={ch.id} className="hover:bg-gray-50">
                        <td className="px-2 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleViewable(ch.id, ch.is_viewable ?? true);
                            }}
                            className="hover:opacity-70 transition-opacity"
                            title={ch.is_viewable !== false ? 'Visible to clients - click to hide' : 'Hidden from clients - click to show'}
                          >
                            {ch.is_viewable !== false ? (
                              <Eye className="w-5 h-5 text-green-600" />
                            ) : (
                              <EyeOff className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          {ch.grade ? (
                            <span className={`px-2 py-1 font-bold rounded text-sm ${
                              ch.grade >= 5.0 ? 'bg-green-100 text-green-800' :
                              ch.grade >= 4.0 ? 'bg-yellow-100 text-yellow-800' :
                              ch.grade >= 3.0 ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {ch.grade.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ch.greek_organizations?.name || '-'}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ch.universities?.name || '-'} ({ch.universities?.state || '-'})
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{ch.chapter_name}</td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                          {(() => {
                            const actualCount = users.filter(u => u.chapter_id === ch.id).length;
                            const targetCount = ch.member_count || 0;
                            const percentage = targetCount > 0 ? Math.round((actualCount / targetCount) * 100) : 0;
                            const isComplete = actualCount >= targetCount && targetCount > 0;

                            return (
                              <div className="flex items-center gap-2">
                                <span className={isComplete ? 'text-green-600 font-medium' : 'text-gray-900'}>
                                  {actualCount}
                                </span>
                                <span className="text-gray-400">/</span>
                                <span className="text-gray-500">{targetCount || '?'}</span>
                                {targetCount > 0 && (
                                  <span className={`text-xs ${percentage >= 80 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    ({percentage}%)
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                          {ch.created_at ? new Date(ch.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={async () => {
                              const newValue = !ch.show_in_dashboard;
                              try {
                                const res = await fetch(`${API_URL}/admin/chapters/${ch.id}/dashboard-visibility`, {
                                  method: 'PATCH',
                                  headers: getAdminHeaders(),
                                  body: JSON.stringify({ show_in_dashboard: newValue })
                                });
                                if (res.ok) {
                                  fetchData();
                                }
                              } catch (error) {
                                console.error('Error toggling dashboard visibility:', error);
                              }
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              ch.show_in_dashboard ? 'bg-green-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                ch.show_in_dashboard ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(ch.id, ch.is_favorite || false);
                            }}
                            className={`mr-2 ${ch.is_favorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                            title={ch.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star className={`w-4 h-4 inline ${ch.is_favorite ? 'fill-yellow-500' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleChapterEdit(ch)}
                            className="text-primary-600 hover:text-primary-900 mr-2"
                          >
                            <Edit className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => handleChapterDelete(ch.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Ambassadors Tab Content */}
          {activeTab === 'ambassadors' && (
            <AmbassadorsAdmin />
          )}

          {/* Users Tab Content */}
          {activeTab === 'users' && (
            <>
              {showForm && (
                <form onSubmit={handleOfficerSubmit} className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-primary-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Edit' : 'Add New'} Officer</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chapter *</label>
                      <select
                        required
                        value={userForm.chapter_id}
                        onChange={(e) => setUserForm({ ...userForm, chapter_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select chapter...</option>
                        {chapters.map(ch => (
                          <option key={ch.id} value={ch.id}>
                            {ch.universities?.name} - {ch.greek_organizations?.name} ({ch.chapter_name})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        required
                        value={userForm.name}
                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                      <select
                        required
                        value={userForm.position}
                        onChange={(e) => setUserForm({ ...userForm, position: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="President">President</option>
                        <option value="Vice President">Vice President</option>
                        <option value="Treasurer">Treasurer</option>
                        <option value="Secretary">Secretary</option>
                        <option value="Rush Chair">Rush Chair</option>
                        <option value="Social Chair">Social Chair</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="email@university.edu"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={userForm.phone}
                        onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingId(null); }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingId ? 'Update' : 'Create'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Filters Row for Users */}
              <div className="mb-4 flex flex-wrap items-center gap-4">
                {/* Fraternity Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Fraternity:</label>
                  <select
                    value={selectedFraternityFilter}
                    onChange={(e) => setSelectedFraternityFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 min-w-[200px]"
                  >
                    <option value="all">All Fraternities</option>
                    {greekOrgs
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(org => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))
                    }
                  </select>
                </div>

                {/* Recent Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Recently Added:</label>
                  <select
                    value={recentFilter}
                    onChange={(e) => setRecentFilter(e.target.value as 'all' | '24h' | '7d' | '30d')}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Time</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>

                {/* Clear Filters Button */}
                {(selectedFraternityFilter !== 'all' || recentFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSelectedFraternityFilter('all');
                      setRecentFilter('all');
                    }}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Clear Filters
                  </button>
                )}

                {/* Results Count */}
                <div className="ml-auto text-sm text-gray-600">
                  Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chapter</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-lg font-medium">No users found</p>
                          <p className="text-sm mt-1">
                            {searchTerm ? 'Try adjusting your search' : 'Import a roster CSV or add users manually'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.position}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {user.chapters?.chapter_name || '-'}
                            {user.chapters?.greek_organizations?.name && (
                              <span className="text-gray-400 ml-2">• {user.chapters.greek_organizations.name}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleUserEdit(user)}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                          >
                            <Edit className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => handleUserDelete(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Waitlist Tab Content */}
          {activeTab === 'waitlist' && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Signup Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {waitlistEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.source || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.referrer || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(entry.signup_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {waitlistEntries.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No waitlist entries yet
                </div>
              )}
            </div>
          )}

          {/* Coming Tomorrow Tab */}
          {activeTab === 'coming-tomorrow' && (
            <div className="space-y-6">
              {/* Add New Item Form */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New "Coming Tomorrow" Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">College Name *</label>
                    <input
                      type="text"
                      value={comingTomorrowForm.college_name}
                      onChange={(e) => setComingTomorrowForm({ ...comingTomorrowForm, college_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Michigan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Name</label>
                    <input
                      type="text"
                      value={comingTomorrowForm.chapter_name}
                      onChange={(e) => setComingTomorrowForm({ ...comingTomorrowForm, chapter_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Delta Tau Delta"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anticipated Score *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={comingTomorrowForm.anticipated_score}
                      onChange={(e) => setComingTomorrowForm({ ...comingTomorrowForm, anticipated_score: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., 4.8"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Update Type *</label>
                    <select
                      value={comingTomorrowForm.update_type}
                      onChange={(e) => setComingTomorrowForm({ ...comingTomorrowForm, update_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="new_chapter">New Chapter</option>
                      <option value="roster_update">Roster Update</option>
                      <option value="new_sorority">New Sorority</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Member Count</label>
                    <input
                      type="number"
                      value={comingTomorrowForm.expected_member_count}
                      onChange={(e) => setComingTomorrowForm({ ...comingTomorrowForm, expected_member_count: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., 112"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                    <input
                      type="date"
                      value={comingTomorrowForm.scheduled_date}
                      onChange={(e) => setComingTomorrowForm({ ...comingTomorrowForm, scheduled_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_URL}/admin/coming-tomorrow`, {
                        method: 'POST',
                        headers: getAdminHeaders(),
                        body: JSON.stringify({
                          college_name: comingTomorrowForm.college_name,
                          anticipated_score: parseFloat(comingTomorrowForm.anticipated_score),
                          update_type: comingTomorrowForm.update_type,
                          expected_member_count: comingTomorrowForm.expected_member_count ? parseInt(comingTomorrowForm.expected_member_count) : null,
                          chapter_name: comingTomorrowForm.chapter_name || null,
                          scheduled_date: comingTomorrowForm.scheduled_date || null
                        })
                      });
                      const data = await res.json();
                      if (data.success) {
                        setSuccessMessage('Coming tomorrow item added successfully!');
                        setShowSuccess(true);
                        setComingTomorrowForm({
                          college_name: '',
                          university_id: '',
                          anticipated_score: '',
                          update_type: 'new_chapter',
                          expected_member_count: '',
                          chapter_name: '',
                          scheduled_date: ''
                        });
                        fetchData();
                      }
                    } catch (error) {
                      console.error('Error adding coming tomorrow item:', error);
                    }
                  }}
                  className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Item
                </button>
              </div>

              {/* Existing Items Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">College</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chapter</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {comingTomorrowItems.map((item) => {
                      const isEditing = editingComingTomorrowItem?.id === item.id;
                      return (
                      <tr key={item.id} className={isEditing ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingComingTomorrowItem.college_name}
                              onChange={(e) => setEditingComingTomorrowItem({ ...editingComingTomorrowItem, college_name: e.target.value })}
                              className="border rounded px-2 py-1 w-full"
                            />
                          ) : item.college_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingComingTomorrowItem.chapter_name || ''}
                              onChange={(e) => setEditingComingTomorrowItem({ ...editingComingTomorrowItem, chapter_name: e.target.value })}
                              className="border rounded px-2 py-1 w-full"
                            />
                          ) : (item.chapter_name || '-')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.1"
                              value={editingComingTomorrowItem.anticipated_score}
                              onChange={(e) => setEditingComingTomorrowItem({ ...editingComingTomorrowItem, anticipated_score: parseFloat(e.target.value) })}
                              className="border rounded px-2 py-1 w-20"
                            />
                          ) : `${item.anticipated_score}⭐`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {isEditing ? (
                            <select
                              value={editingComingTomorrowItem.update_type}
                              onChange={(e) => setEditingComingTomorrowItem({ ...editingComingTomorrowItem, update_type: e.target.value })}
                              className="border rounded px-2 py-1"
                            >
                              <option value="new_chapter">New Chapter</option>
                              <option value="roster_update">Roster Update</option>
                              <option value="new_sorority">New Sorority</option>
                            </select>
                          ) : (
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              item.update_type === 'new_chapter' ? 'bg-orange-100 text-orange-700' :
                              item.update_type === 'roster_update' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-pink-100 text-pink-700'
                            }`}>
                              {item.update_type === 'new_chapter' ? 'New Chapter' :
                               item.update_type === 'roster_update' ? 'Roster Update' :
                               'New Sorority'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editingComingTomorrowItem.expected_member_count || ''}
                              onChange={(e) => setEditingComingTomorrowItem({ ...editingComingTomorrowItem, expected_member_count: e.target.value })}
                              className="border rounded px-2 py-1 w-20"
                            />
                          ) : (item.expected_member_count || '-')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editingComingTomorrowItem.scheduled_date?.split('T')[0]}
                              onChange={(e) => setEditingComingTomorrowItem({ ...editingComingTomorrowItem, scheduled_date: e.target.value })}
                              className="border rounded px-2 py-1"
                            />
                          ) : new Date(item.scheduled_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={async () => {
                                    try {
                                      // Only send fields that exist in the database table
                                      const updatePayload = {
                                        college_name: editingComingTomorrowItem.college_name,
                                        chapter_name: editingComingTomorrowItem.chapter_name,
                                        anticipated_score: editingComingTomorrowItem.anticipated_score,
                                        update_type: editingComingTomorrowItem.update_type,
                                        expected_member_count: editingComingTomorrowItem.expected_member_count,
                                        scheduled_date: editingComingTomorrowItem.scheduled_date,
                                      };

                                      const res = await fetch(`${API_URL}/admin/coming-tomorrow/${item.id}`, {
                                        method: 'PUT',
                                        headers: {
                                          ...getAdminHeaders(),
                                          'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(updatePayload)
                                      });
                                      if (res.ok) {
                                        setEditingComingTomorrowItem(null);
                                        fetchData();
                                        setSuccessMessage('Item updated successfully!');
                                        setShowSuccess(true);
                                      }
                                    } catch (error) {
                                      console.error('Error updating item:', error);
                                    }
                                  }}
                                  className="text-green-600 hover:text-green-800"
                                  title="Save"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingComingTomorrowItem(null)}
                                  className="text-gray-600 hover:text-gray-800"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingComingTomorrowItem({ ...item })}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm('Delete this item?')) {
                                      try {
                                        await fetch(`${API_URL}/admin/coming-tomorrow/${item.id}`, {
                                          method: 'DELETE',
                                          headers: getAdminHeaders()
                                        });
                                        fetchData();
                                      } catch (error) {
                                        console.error('Error deleting item:', error);
                                      }
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
                {comingTomorrowItems.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No coming tomorrow items yet
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wizard Admin Tab */}
          {/* @ts-expect-error TypeScript type narrowing issue - activeTab does include 'wizard-admin' */}
          {activeTab === 'wizard-admin' && isWizardAdmin && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Wizard Admin</h2>
                </div>
                <p className="opacity-90">Platform super admin with access to all company accounts</p>
              </div>

              {wizardSession && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <h3 className="font-bold text-yellow-900">Active Impersonation</h3>
                      </div>
                      <p className="text-yellow-800">Currently impersonating: <span className="font-semibold">{wizardSession.company?.name}</span></p>
                    </div>
                    <button
                      onClick={async () => {
                        await fetch(`${API_URL}/wizard/end-impersonation`, {
                          method: 'POST',
                          headers: getAdminHeaders()
                        });
                        setWizardSession(null);
                        window.location.reload();
                      }}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      End Impersonation
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Impersonate Company</h3>
                <div className="flex gap-4">
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a company...</option>
                    {wizardCompanies.map((company: any) => (
                      <option key={company.id} value={company.id}>
                        {company.name} ({company.balance?.[0]?.balance_credits || 0} credits)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={async () => {
                      if (!selectedCompanyId) return;
                      const res = await fetch(`${API_URL}/wizard/impersonate`, {
                        method: 'POST',
                        headers: getAdminHeaders(),
                        body: JSON.stringify({ companyId: selectedCompanyId })
                      });
                      const data = await res.json();
                      if (data.success) {
                        setWizardSession(data.session);
                        window.location.reload();
                      }
                    }}
                    disabled={!selectedCompanyId}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Impersonation
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900">All Companies</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {wizardCompanies.map((company: any) => (
                        <tr key={company.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{company.name}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {company.balance?.[0]?.balance_credits || 0}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {company.team_members?.[0]?.count || 0}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(company.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={async () => {
                                const res = await fetch(`${API_URL}/wizard/impersonate`, {
                                  method: 'POST',
                                  headers: getAdminHeaders(),
                                  body: JSON.stringify({ companyId: company.id })
                                });
                                const data = await res.json();
                                if (data.success) {
                                  setWizardSession(data.session);
                                  window.location.reload();
                                }
                              }}
                              className="text-purple-600 hover:text-purple-800 font-medium"
                            >
                              Impersonate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Payments & Revenue Tab */}
          {activeTab === 'payments' && <PaymentsRevenueTab />}

          {/* Chapter Unlocks Tab */}
          {activeTab === 'unlocks' && (
            <UnlocksTab />
          )}

          {/* Introduction Requests Tab */}
          {/* Diamond Chapters Tab */}
          {(activeTab as string) === 'diamond-chapters' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                    Diamond Chapters - Introducable
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Chapters marked as available for warm introductions
                  </p>
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-lg">
                  <span className="text-2xl font-bold text-gray-900">{diamondChapters.length}</span>
                  <span className="text-gray-600 ml-2">chapters</span>
                </div>
              </div>

              {diamondChapters.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No diamond chapters yet</p>
                  <p className="text-gray-400 mt-2">Chapters can be marked as diamond in the Chapters tab</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chapter</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {diamondChapters.map((chapter) => (
                        <tr key={chapter.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {chapter.greek_organizations?.name || 'N/A'}
                              </div>
                              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                chapter.greek_organizations?.organization_type === 'fraternity'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-pink-100 text-pink-800'
                              }`}>
                                {chapter.greek_organizations?.organization_type || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{chapter.universities?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{chapter.universities?.state || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {chapter.chapter_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {chapter.member_count || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {chapter.grade ? (
                              <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                chapter.grade >= 4.0 ? 'bg-green-100 text-green-800' :
                                chapter.grade >= 3.5 ? 'bg-blue-100 text-blue-800' :
                                chapter.grade >= 3.0 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {chapter.grade.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              chapter.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {chapter.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {(activeTab as string) === 'intro-requests' && (
            <IntroductionRequestsTab />
          )}

          {/* Credits & Pricing Tab - Coming Soon */}
          {activeTab === 'credits' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <CreditCard className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Credits & Pricing Analytics</h3>
              <p className="text-gray-600">Coming soon - Monitor credit usage, pricing performance, and revenue per credit</p>
            </div>
          )}

          {/* Company Intelligence Tab - Coming Soon */}
          {activeTab === 'intelligence' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <TrendingUp className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Intelligence</h3>
              <p className="text-gray-600">Coming soon - Deep dive into customer behavior, health metrics, and LTV analysis</p>
            </div>
          )}

          {/* Business Analytics Tab - Coming Soon */}
          {activeTab === 'analytics' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <BarChart3 className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Analytics</h3>
              <p className="text-gray-600">Coming soon - Growth metrics, engagement analytics, and business intelligence dashboards</p>
            </div>
          )}

          {/* User Activity Tab */}
          {activeTab === 'activity' && <ActivityLogsTab />}

          {/* Introduction Requests Tab */}
          {/* @ts-expect-error TypeScript type narrowing issue - activeTab does include 'intro-requests' */}
          {activeTab === 'intro-requests' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{introRequests.length}</p>
                      <p className="text-sm text-gray-600 mt-1">Total Requests</p>
                    </div>
                    <Handshake className="w-10 h-10 text-emerald-500" />
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-yellow-900">
                        {introRequests.filter(r => r.status === 'pending').length}
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">Pending</p>
                    </div>
                    <AlertCircle className="w-10 h-10 text-yellow-500" />
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-blue-900">
                        {introRequests.filter(r => r.status === 'in_progress').length}
                      </p>
                      <p className="text-sm text-blue-700 mt-1">In Progress</p>
                    </div>
                    <Loader className="w-10 h-10 text-blue-500" />
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-green-900">
                        {introRequests.filter(r => r.status === 'completed').length}
                      </p>
                      <p className="text-sm text-green-700 mt-1">Completed</p>
                    </div>
                    <Star className="w-10 h-10 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Filter */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Filter by status:</label>
                  <select
                    value={introRequestsFilter}
                    onChange={(e) => setIntroRequestsFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Requests</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Requests List */}
              {introRequestsLoading ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <Loader className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Loading introduction requests...</p>
                </div>
              ) : introRequests.filter(r => introRequestsFilter === 'all' || r.status === introRequestsFilter).length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <Handshake className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {introRequestsFilter === 'all'
                      ? 'No introduction requests yet'
                      : `No ${introRequestsFilter} requests`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {introRequests
                    .filter(r => introRequestsFilter === 'all' || r.status === introRequestsFilter)
                    .map((request) => {
                      const [isUpdating, setIsUpdating] = useState(false);
                      const [adminNotes, setAdminNotes] = useState(request.admin_notes || '');
                      const [showNotesInput, setShowNotesInput] = useState(false);

                      const updateStatus = async (newStatus: string) => {
                        if (!confirm(`Update request status to "${newStatus}"?`)) return;

                        setIsUpdating(true);
                        try {
                          const response = await fetch(
                            `${API_URL}/credits/warm-intro/admin/${request.id}/status`,
                            {
                              method: 'PATCH',
                              headers: getAdminHeaders(),
                              body: JSON.stringify({ status: newStatus, adminNotes })
                            }
                          );

                          if (!response.ok) {
                            throw new Error('Failed to update status');
                          }

                          // Refresh data
                          fetchData();
                          setShowNotesInput(false);
                        } catch (error) {
                          console.error('Error updating status:', error);
                          alert('Failed to update status');
                        } finally {
                          setIsUpdating(false);
                        }
                      };

                      const getStatusBadge = (status: string) => {
                        const styles = {
                          pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                          in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
                          completed: 'bg-green-100 text-green-800 border-green-300',
                          cancelled: 'bg-red-100 text-red-800 border-red-300'
                        };
                        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-300';
                      };

                      return (
                        <div
                          key={request.id}
                          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {request.chapters?.chapter_name || 'Chapter'}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(request.status)}`}>
                                  {request.status.replace('_', ' ').toUpperCase()}
                                </span>
                                {request.chapters?.universities && (
                                  <span className="text-sm text-gray-600">
                                    @ {request.chapters.universities.name}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {request.companies?.company_name || 'Unknown Company'}
                                </span>
                                {request.requestedBy && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {request.requestedBy.firstName} {request.requestedBy.lastName} ({request.requestedBy.email})
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  ${request.amount_paid}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(request.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Request Message */}
                          {request.message && (
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-1">
                                Partnership Proposal
                              </p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.message}</p>
                            </div>
                          )}

                          {/* Request Details */}
                          <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                                Contact Method
                              </p>
                              <p className="text-sm text-gray-900 capitalize">
                                {request.preferred_contact_method}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                                Greek Organization
                              </p>
                              <p className="text-sm text-gray-900">
                                {request.chapters?.greek_organizations?.name || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Admin Notes Section */}
                          {(request.admin_notes || showNotesInput) && (
                            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                              <p className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-2">
                                Admin Notes
                              </p>
                              {showNotesInput ? (
                                <textarea
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                  rows={3}
                                  placeholder="Add internal notes about this request..."
                                />
                              ) : (
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.admin_notes}</p>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateStatus('in_progress')}
                                  disabled={isUpdating}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                                >
                                  Start Processing
                                </button>
                                <button
                                  onClick={() => updateStatus('cancelled')}
                                  disabled={isUpdating}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-medium"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {request.status === 'in_progress' && (
                              <>
                                <button
                                  onClick={() => updateStatus('completed')}
                                  disabled={isUpdating}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                                >
                                  Mark as Completed
                                </button>
                                <button
                                  onClick={() => updateStatus('pending')}
                                  disabled={isUpdating}
                                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm font-medium"
                                >
                                  Move to Pending
                                </button>
                              </>
                            )}
                            {request.status === 'completed' && (
                              <button
                                onClick={() => updateStatus('in_progress')}
                                disabled={isUpdating}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                              >
                                Reopen
                              </button>
                            )}
                            {!showNotesInput && (
                              <button
                                onClick={() => setShowNotesInput(true)}
                                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                              >
                                {request.admin_notes ? 'Edit Notes' : 'Add Notes'}
                              </button>
                            )}
                            {showNotesInput && (
                              <button
                                onClick={() => {
                                  updateStatus(request.status);
                                }}
                                disabled={isUpdating}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-medium"
                              >
                                Save Notes
                              </button>
                            )}
                          </div>

                          {/* Completion Info */}
                          {request.status === 'completed' && request.completed_at && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                              <Star className="w-5 h-5 text-green-600" />
                              <span className="text-sm text-green-900">
                                Completed on {new Date(request.completed_at).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Ambassadors Tab */}
          {activeTab === 'ambassadors' && <AmbassadorsAdmin />}

          {/* Fraternity Users Tab */}
          {activeTab === 'fraternity-users' && <FraternityUsersTab />}

          {/* Product Roadmap Tab */}
          {activeTab === 'roadmap' && <RoadmapAdmin />}

          {/* College Clubs Tab */}
          {/* @ts-expect-error TypeScript type narrowing issue - activeTab does include 'college-clubs' */}
          {activeTab === 'college-clubs' && (
            <div className="space-y-6">
              {/* Investment Groups Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Investment Groups</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No investment groups added yet</p>
                </div>
              </div>

              {/* Blockchain Groups Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Blockchain Groups</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <Handshake className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No blockchain groups added yet</p>
                </div>
              </div>

              {/* Poker Clubs Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Poker Clubs</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No poker clubs added yet</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
        </div>
      </div>

      {/* Chapter Edit Modal */}
      {editingChapter && (
        <ChapterEditModal
          chapter={editingChapter}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingChapter(null);
          }}
          onSave={handleChapterSave}
          chapterUsers={users.filter(u => u.chapter_id === editingChapter.id)}
          onImportRoster={handleRosterImport}
          onTogglePinned={handleTogglePinned}
          onAssignPosition={handleAssignPosition}
        />
      )}

      {/* CSV Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileUp className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Paste Roster CSV</h2>
                </div>
                <button
                  onClick={() => {
                    setShowPasteModal(false);
                    setPasteChapterId('');
                    setPasteCSVText('');
                    setPasteResult(null);
                    setSelectedUniversityId('');
                    setUniversitySearchTerm('');
                    setChapterSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Step 1: School Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step 1: Select School *
                  </label>
                  {/* School Search Input */}
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={universitySearchTerm}
                      onChange={(e) => setUniversitySearchTerm(e.target.value)}
                      placeholder="Search schools..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={pasteLoading}
                    />
                    {universitySearchTerm && (
                      <button
                        onClick={() => setUniversitySearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {/* Filtered School Select */}
                  <select
                    value={selectedUniversityId}
                    onChange={(e) => {
                      setSelectedUniversityId(e.target.value);
                      setPasteChapterId(''); // Clear chapter selection when school changes
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={pasteLoading}
                    size={6}
                  >
                    <option value="">Choose a school...</option>
                    {universities
                      .filter(u => {
                        if (!universitySearchTerm) return true;
                        return u.name?.toLowerCase().includes(universitySearchTerm.toLowerCase());
                      })
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.state})
                        </option>
                      ))}
                  </select>
                  {universitySearchTerm && (
                    <p className="mt-1 text-xs text-gray-500">
                      Showing {universities.filter(u => u.name?.toLowerCase().includes(universitySearchTerm.toLowerCase())).length} of {universities.length} schools
                    </p>
                  )}
                </div>

                {/* Step 2: Chapter Selector (only shown after school is selected) */}
                {selectedUniversityId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Step 2: Select Chapter *
                    </label>
                    {/* Chapter Search Input */}
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={chapterSearchTerm}
                        onChange={(e) => setChapterSearchTerm(e.target.value)}
                        placeholder="Search chapters at this school..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={pasteLoading}
                      />
                      {chapterSearchTerm && (
                        <button
                          onClick={() => setChapterSearchTerm('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {/* Filtered Chapter Select */}
                    <select
                      value={pasteChapterId}
                      onChange={(e) => setPasteChapterId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={pasteLoading}
                      size={6}
                    >
                      <option value="">Choose a chapter...</option>
                      {chapters
                        .filter(ch => ch.university_id === selectedUniversityId)
                        .filter(ch => {
                          if (!chapterSearchTerm) return true;
                          const searchLower = chapterSearchTerm.toLowerCase();
                          const orgMatch = ch.greek_organizations?.name?.toLowerCase().includes(searchLower);
                          const chapterMatch = ch.chapter_name?.toLowerCase().includes(searchLower);
                          return orgMatch || chapterMatch;
                        })
                        .map(ch => (
                          <option key={ch.id} value={ch.id}>
                            {ch.greek_organizations?.name} ({ch.chapter_name})
                          </option>
                        ))}
                    </select>
                    {chapterSearchTerm && (
                      <p className="mt-1 text-xs text-gray-500">
                        Showing {chapters.filter(ch => {
                          if (ch.university_id !== selectedUniversityId) return false;
                          const searchLower = chapterSearchTerm.toLowerCase();
                          return ch.greek_organizations?.name?.toLowerCase().includes(searchLower) ||
                                 ch.chapter_name?.toLowerCase().includes(searchLower);
                        }).length} chapters
                      </p>
                    )}
                  </div>
                )}

                {/* CSV Text Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste CSV Data *
                  </label>
                  <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800 font-mono">
                      Expected format:<br />
                      name,position,email,phone,linkedin,graduation_year,major,member_type,is_primary_contact<br />
                      John Doe,President,john@example.com,555-1234,https://linkedin.com/in/john,2025,Business,officer,TRUE
                    </p>
                  </div>
                  <textarea
                    value={pasteCSVText}
                    onChange={(e) => setPasteCSVText(e.target.value)}
                    placeholder="Paste your CSV data here..."
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    disabled={pasteLoading}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {pasteCSVText.split('\n').filter(line => line.trim()).length - 1} data rows (excluding header)
                  </p>
                </div>

                {/* Result Display */}
                {pasteResult && (
                  <div className={`p-4 rounded-lg ${pasteResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      {pasteResult.success ? (
                        <>
                          <span className="text-green-600">✅</span>
                          <span className="text-green-800">Upload Successful!</span>
                        </>
                      ) : (
                        <>
                          <span className="text-red-600">❌</span>
                          <span className="text-red-800">Upload Failed</span>
                        </>
                      )}
                    </h3>
                    {pasteResult.success && (
                      <div className="text-sm space-y-1">
                        <p className="text-gray-700">
                          <strong>Total Records:</strong> {pasteResult.totalRecords}
                        </p>
                        <p className="text-green-700">
                          <strong>✅ Inserted:</strong> {pasteResult.insertedCount} new members
                        </p>
                        <p className="text-blue-700">
                          <strong>🔄 Updated:</strong> {pasteResult.updatedCount} existing members
                        </p>
                        {pasteResult.skippedCount > 0 && (
                          <p className="text-orange-700">
                            <strong>⏭️ Skipped:</strong> {pasteResult.skippedCount} rows
                          </p>
                        )}
                        {pasteResult.errors && pasteResult.errors.length > 0 && (
                          <div className="mt-2">
                            <p className="text-red-700 font-semibold">Errors:</p>
                            <ul className="list-disc list-inside text-xs text-red-600">
                              {pasteResult.errors.map((err: string, idx: number) => (
                                <li key={idx}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    {!pasteResult.success && (
                      <p className="text-sm text-red-700">{pasteResult.error}</p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowPasteModal(false);
                      setPasteChapterId('');
                      setPasteCSVText('');
                      setPasteResult(null);
                      setSelectedUniversityId('');
                      setUniversitySearchTerm('');
                      setChapterSearchTerm('');
                    }}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={pasteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCSVPaste}
                    disabled={pasteLoading || !pasteChapterId || !pasteCSVText.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {pasteLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Roster</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPageV4;