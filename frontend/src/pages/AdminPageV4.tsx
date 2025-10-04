import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Building2,
  Users,
  UserCheck,
  Save,
  X,
  Edit,
  Trash2,
  LogOut,
  Shield,
  Upload,
  GraduationCap,
  Eye,
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
  FileUp
} from 'lucide-react';
import ChapterEditModal from '../components/ChapterEditModal';
import PaymentsRevenueTab from '../components/admin/PaymentsRevenueTab';

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
  greek_organizations?: { name: string };
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
  chapters?: {
    chapter_name: string;
    greek_organizations: { name: string };
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
}

interface ChapterUnlock {
  id: string;
  chapter_id: string;
  unlock_type: string;
  credits_spent: number;
  unlocked_at: string;
  chapters?: {
    chapter_name: string;
    greek_organizations: { name: string };
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

const AdminPageV4 = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'companies' | 'fraternities' | 'colleges' | 'chapters' | 'users' | 'waitlist' |
    'payments' | 'unlocks' | 'credits' | 'intelligence' | 'analytics'
  >('dashboard');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Data states
  const [greekOrgs, setGreekOrgs] = useState<GreekOrg[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [collegeOrderBy, setCollegeOrderBy] = useState<'name' | 'state' | 'chapters' | 'big10' | 'conference'>('name');
  const [collegeFilter, setCollegeFilter] = useState<string>('all');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<{ connected: boolean; model: string } | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

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
    event_frequency: '20'
  });

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

  // Fetch data on mount and tab change
  useEffect(() => {
    fetchData();
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

  const fetchData = async () => {
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
        setUniversities(data.data || []);
      } else if (activeTab === 'chapters') {
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
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
          event_frequency: chapterForm.event_frequency ? parseInt(chapterForm.event_frequency) : null
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
          event_frequency: '20'
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
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
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());

      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        try {
          // Import based on active tab
          if (activeTab === 'colleges') {
            let logoUrl = row.logo_url || row['Logo URL'] || '';

            // If logo_url is provided and it's a URL, download and upload it
            if (logoUrl && logoUrl.startsWith('http')) {
              try {
                const response = await fetch(logoUrl);
                const blob = await response.blob();
                // Sanitize filename: remove all non-alphanumeric characters except hyphens and underscores
                const sanitizedName = (row.name || row.Name).toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
                  .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
                const fileName = `${sanitizedName}-${Date.now()}.${blob.type.split('/')[1]}`;

                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve) => {
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(blob);
                });
                const base64Data = await base64Promise;

                logoUrl = await handleUploadImage(blob as File, 'college-logos', fileName);
              } catch (uploadError) {
                console.error(`Failed to upload logo for ${row.name}:`, uploadError);
                logoUrl = ''; // Continue without logo
              }
            }

            await fetch(`${API_URL}/admin/universities`, {
              method: 'POST',
              headers: getAdminHeaders(),
              body: JSON.stringify({
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
              })
            });
            successCount++;
          } else if (activeTab === 'users') {
            // Officer/Roster CSV import
            const chapterName = row.chapter || row.Chapter;
            const universityName = row.university || row.University || row.college || row.College;

            // Need to look up chapter_id from chapter name and university
            if (!chapterName || !universityName) {
              console.error('Missing chapter or university name for user import');
              errorCount++;
              continue;
            }

            // First, find the chapter
            const chaptersRes = await fetch(`${API_URL}/admin/chapters`, {
              headers: getAdminHeaders()
            });
            const chaptersData = await chaptersRes.json();
            const chapter = chaptersData.find((ch: any) =>
              ch.chapter_name?.toLowerCase().includes(chapterName.toLowerCase()) &&
              ch.universities?.name?.toLowerCase().includes(universityName.toLowerCase())
            );

            if (!chapter) {
              console.error(`Could not find chapter: ${chapterName} at ${universityName}`);
              errorCount++;
              continue;
            }

            await fetch(`${API_URL}/admin/officers`, {
              method: 'POST',
              headers: getAdminHeaders(),
              body: JSON.stringify({
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
              })
            });
            successCount++;
          }
        } catch (error) {
          console.error(`Error importing row ${i}:`, error);
          errorCount++;
        }
      }

      showSuccessMsg(`CSV Import Complete!\n✅ Success: ${successCount}\n❌ Errors: ${errorCount}`);
      fetchData();
      e.target.value = ''; // Reset file input
    };
    reader.readAsText(file);
  };

  // AI Assistant Handler
  const handleAIAssist = async () => {
    setAiLoading(true);
    try {
      // This would call your backend endpoint that uses Claude API
      const res = await fetch(`${API_URL}/admin/ai-assist`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          prompt: aiPrompt,
          context: activeTab,
          existingData: activeTab === 'colleges' ? universities : activeTab === 'fraternities' ? greekOrgs : []
        })
      });
      const data = await res.json();
      setAiResponse(data.response || data.suggestion || 'No response');
    } catch (error) {
      console.error('AI assist error:', error);
      setAiResponse('Error: Could not get AI assistance');
    } finally {
      setAiLoading(false);
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

  const filteredUniversities = universities
    .filter(uni => {
      // Search filter
      const matchesSearch = uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (uni.conference || '').toLowerCase().includes(searchTerm.toLowerCase());

      // Conference filter
      let matchesFilter = true;
      if (collegeFilter === 'power5') {
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
      }
      return 0;
    });

  const filteredChapters = chapters.filter(ch =>
    ch.chapter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ch.greek_organizations?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ch.universities?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(off =>
    off.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    off.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    off.chapters?.chapter_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              setActiveTab('dashboard');
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
              setActiveTab('colleges');
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
              setActiveTab('chapters');
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
              setActiveTab('users');
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
              setActiveTab('waitlist');
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
              setActiveTab('fraternities');
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
              setActiveTab('payments');
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
              setActiveTab('unlocks');
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
              setActiveTab('credits');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'credits'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="font-medium">Credits & Pricing</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('intelligence');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'intelligence'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Company Intelligence</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('analytics');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'analytics'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Business Analytics</span>
          </button>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-2 px-3 py-2 bg-red-900 text-red-200 rounded-lg mb-3">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Admin Mode</span>
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
              {activeTab === 'companies' && 'Manage registered companies and their unlock history'}
              {activeTab === 'fraternities' && 'Manage Greek organizations'}
              {activeTab === 'colleges' && 'Manage universities and colleges'}
              {activeTab === 'chapters' && 'Manage individual chapters'}
              {activeTab === 'users' && 'Manage chapter users and contacts'}
              {activeTab === 'waitlist' && 'View and manage waitlist signups'}
              {activeTab === 'payments' && 'Track revenue, transactions, and financial analytics'}
              {activeTab === 'unlocks' && 'Analyze chapter unlock trends and popular content'}
              {activeTab === 'credits' && 'Monitor credit usage and pricing performance'}
              {activeTab === 'intelligence' && 'Deep dive into company behavior and health metrics'}
              {activeTab === 'analytics' && 'Business intelligence and growth analytics'}
            </p>
          </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-in slide-in-from-top">
          <Save className="w-5 h-5" />
          <span>{successMessage}</span>
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
                        <td className="px-4 py-3 text-sm text-gray-600">{company.credits_balance || 0} credits</td>
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
                .slice(0, 10)
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unlocks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{company.company_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{company.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        {company.credits_balance} credits
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {company.total_spent || 0} credits
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          alert(`Unlocked Chapters:\n\n${company.unlocks?.map(u =>
                            `• ${u.chapters?.universities.name} - ${u.chapters?.greek_organizations.name} (${u.chapters?.chapter_name})\n  ${u.unlock_type} - ${u.credits_spent} credits`
                          ).join('\n\n') || 'No unlocks yet'}`);
                        }}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                      >
                        <Lock className="w-4 h-4" />
                        <span className="text-sm font-medium">{company.unlocks?.length || 0}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(company.created_at).toLocaleDateString()}
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

      {/* Content Area with Action Bar */}
      {(activeTab === 'fraternities' || activeTab === 'colleges' || activeTab === 'chapters' || activeTab === 'users' || activeTab === 'waitlist' || activeTab === 'payments' || activeTab === 'unlocks' || activeTab === 'credits' || activeTab === 'intelligence' || activeTab === 'analytics') && (
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

          {/* AI Assistant Bar - Always Visible */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🤖</span>
                  <h3 className="text-sm font-semibold text-gray-900">AI Data Assistant</h3>
                  {aiStatus && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      aiStatus.connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {aiStatus.connected ? 'Online' : 'Offline'}
                    </span>
                  )}
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
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Greek Letters</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Founded</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredGreekOrgs.map((org) => (
                      <tr key={org.id} className="hover:bg-gray-50">
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
                    ))}
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
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
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
                      <p className="text-xs text-gray-500 mt-1">Accepts PNG, JPG, or SVG. Recommended size: 200x200px</p>
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
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chapters</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bars</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unlocks</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUniversities.map((uni) => (
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
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Chapters Tab Content */}
          {activeTab === 'chapters' && (
            <>
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
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fraternity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">University</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chapter</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredChapters.map((ch) => (
                      <tr key={ch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ch.greek_organizations?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ch.universities?.name || '-'} ({ch.universities?.state || '-'})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ch.chapter_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleChapterEdit(ch)}
                            className="text-primary-600 hover:text-primary-900 mr-3"
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
                    ))}
                  </tbody>
                </table>
              </div>
            </>
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
                    )))}
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

          {/* Payments & Revenue Tab */}
          {activeTab === 'payments' && <PaymentsRevenueTab />}

          {/* Chapter Unlocks Tab - Coming Soon */}
          {activeTab === 'unlocks' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <Unlock className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chapter Unlocks Analytics</h3>
              <p className="text-gray-600">Coming soon - Track popular chapters, unlock trends, and content analytics</p>
            </div>
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
        />
      )}
    </div>
  );
};

export default AdminPageV4;