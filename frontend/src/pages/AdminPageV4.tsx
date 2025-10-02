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
  Mail
} from 'lucide-react';
import ChapterEditModal from '../components/ChapterEditModal';

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

interface Officer {
  id: string;
  chapter_id: string;
  name: string;
  position: string;
  email?: string;
  phone?: string;
  linkedin_profile?: string;
  graduation_year?: number;
  major?: string;
  is_primary_contact?: boolean;
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

const AdminPageV4 = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'companies' | 'fraternities' | 'colleges' | 'chapters' | 'contacts' | 'waitlist'>('dashboard');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Data states
  const [greekOrgs, setGreekOrgs] = useState<GreekOrg[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCSVImport, setShowCSVImport] = useState(false);
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
    logoFile: null as File | null
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

  const [officerForm, setOfficerForm] = useState({
    chapter_id: '',
    name: '',
    position: 'President',
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
        const [orgsRes, unisRes, chaptersRes] = await Promise.all([
          fetch(`${API_URL}/admin/greek-organizations`, { headers: getAdminHeaders() }),
          fetch(`${API_URL}/admin/universities`, { headers: getAdminHeaders() }),
          fetch(`${API_URL}/admin/chapters`, { headers: getAdminHeaders() })
        ]);
        const [orgsData, unisData, chaptersData] = await Promise.all([
          orgsRes.json(),
          unisRes.json(),
          chaptersRes.json()
        ]);
        setGreekOrgs(orgsData.data || []);
        setUniversities(unisData.data || []);
        setChapters(chaptersData.data || []);
      } else if (activeTab === 'contacts') {
        const [chaptersRes, officersRes] = await Promise.all([
          fetch(`${API_URL}/admin/chapters`, { headers: getAdminHeaders() }),
          fetch(`${API_URL}/admin/officers`, { headers: getAdminHeaders() })
        ]);
        const [chaptersData, officersData] = await Promise.all([
          chaptersRes.json(),
          officersRes.json()
        ]);
        setChapters(chaptersData.data || []);
        setOfficers(officersData.data || []);
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
        const fileName = `${universityForm.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
        logoUrl = await handleUploadImage(universityForm.logoFile, 'college-logos', fileName);
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
          logo_url: logoUrl || null
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
          logoFile: null
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
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
      logoFile: null
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

  // CRUD Operations for Officers
  const handleOfficerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `${API_URL}/admin/officers/${editingId}`
        : `${API_URL}/admin/officers`;

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify({
          chapter_id: officerForm.chapter_id,
          name: officerForm.name,
          position: officerForm.position,
          email: officerForm.email || null,
          phone: officerForm.phone || null,
          linkedin_profile: officerForm.linkedin_profile || null,
          graduation_year: officerForm.graduation_year ? parseInt(officerForm.graduation_year) : null,
          major: officerForm.major || null,
          is_primary_contact: officerForm.is_primary_contact
        })
      });

      if (res.ok) {
        showSuccessMsg(editingId ? 'Officer updated successfully!' : 'Officer created successfully!');
        setShowForm(false);
        setEditingId(null);
        setOfficerForm({
          chapter_id: '',
          name: '',
          position: 'President',
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

  const handleOfficerEdit = (officer: Officer) => {
    setEditingId(officer.id);
    setOfficerForm({
      chapter_id: officer.chapter_id,
      name: officer.name,
      position: officer.position,
      email: officer.email || '',
      phone: officer.phone || '',
      linkedin_profile: officer.linkedin_profile || '',
      graduation_year: officer.graduation_year?.toString() || '',
      major: officer.major || '',
      is_primary_contact: officer.is_primary_contact || false
    });
    setShowForm(true);
  };

  const handleOfficerDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this officer?')) return;

    try {
      const res = await fetch(`${API_URL}/admin/officers/${id}`, {
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
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        // Import based on active tab
        if (activeTab === 'colleges') {
          await fetch(`${API_URL}/admin/universities`, {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify({
              name: row.name || row.Name,
              location: row.location || row.Location,
              state: row.state || row.State,
              student_count: parseInt(row.student_count || row['Student Count'] || '0'),
              greek_percentage: parseFloat(row.greek_percentage || row['Greek %'] || '0'),
              website: row.website || row.Website,
              logo_url: row.logo_url || row['Logo URL']
            })
          });
        }
        // Add similar logic for other tabs
      }

      showSuccessMsg(`Imported ${lines.length - 1} records successfully!`);
      fetchData();
      setShowCSVImport(false);
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

  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredChapters = chapters.filter(ch =>
    ch.chapter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ch.greek_organizations?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ch.universities?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOfficers = officers.filter(off =>
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
              setActiveTab('companies');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'companies'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="font-medium">Companies</span>
            {companies.length > 0 && (
              <span className="ml-auto bg-gray-700 px-2 py-1 rounded text-xs">{companies.length}</span>
            )}
          </button>

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
              setActiveTab('contacts');
              setShowForm(false);
              setEditingId(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'contacts'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            <span className="font-medium">Officers</span>
            {officers.length > 0 && (
              <span className="ml-auto bg-gray-700 px-2 py-1 rounded text-xs">{officers.length}</span>
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
              {activeTab === 'contacts' && 'Manage chapter officers and contacts'}
              {activeTab === 'waitlist' && 'View and manage waitlist signups'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Companies</p>
                <p className="text-3xl font-bold text-gray-900">{companies.length}</p>
              </div>
              <Briefcase className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fraternities</p>
                <p className="text-3xl font-bold text-gray-900">{greekOrgs.length}</p>
              </div>
              <Building2 className="w-12 h-12 text-purple-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Colleges</p>
                <p className="text-3xl font-bold text-gray-900">{universities.length}</p>
              </div>
              <GraduationCap className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chapters</p>
                <p className="text-3xl font-bold text-gray-900">{chapters.length}</p>
              </div>
              <Users className="w-12 h-12 text-orange-500" />
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
      {(activeTab === 'fraternities' || activeTab === 'colleges' || activeTab === 'chapters' || activeTab === 'contacts' || activeTab === 'waitlist') && (
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
                            setUniversityForm({ ...universityForm, logoFile: file });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      />
                      {universityForm.logo_url && (
                        <div className="mt-2">
                          <img src={universityForm.logo_url} alt="Logo" className="h-16 w-16 object-contain" />
                        </div>
                      )}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chapters</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Greek %</th>
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
                          {uni.student_count ? uni.student_count.toLocaleString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {uni.greek_percentage ? `${(uni.greek_percentage * 100).toFixed(1)}%` : '-'}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ch.member_count || '-'}</td>
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

          {/* Officers Tab Content */}
          {activeTab === 'contacts' && (
            <>
              {showForm && (
                <form onSubmit={handleOfficerSubmit} className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-primary-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Edit' : 'Add New'} Officer</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chapter *</label>
                      <select
                        required
                        value={officerForm.chapter_id}
                        onChange={(e) => setOfficerForm({ ...officerForm, chapter_id: e.target.value })}
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
                        value={officerForm.name}
                        onChange={(e) => setOfficerForm({ ...officerForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                      <select
                        required
                        value={officerForm.position}
                        onChange={(e) => setOfficerForm({ ...officerForm, position: e.target.value })}
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
                        value={officerForm.email}
                        onChange={(e) => setOfficerForm({ ...officerForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="email@university.edu"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={officerForm.phone}
                        onChange={(e) => setOfficerForm({ ...officerForm, phone: e.target.value })}
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
                    {filteredOfficers.map((officer) => (
                      <tr key={officer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{officer.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{officer.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {officer.chapters?.universities.name} - {officer.chapters?.greek_organizations.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{officer.email || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOfficerEdit(officer)}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                          >
                            <Edit className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => handleOfficerDelete(officer.id)}
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
        />
      )}
    </div>
  );
};

export default AdminPageV4;