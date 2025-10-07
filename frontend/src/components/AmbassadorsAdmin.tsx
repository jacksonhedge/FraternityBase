import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Search, Users, Award, Lock, Unlock } from 'lucide-react';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN;

interface Ambassador {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  position: string;
  email: string;
  linkedin_profile: string;
  graduation_year: number;
  major: string;
  is_ambassador: boolean;
  ambassador_status: string;
  is_fraternity_member: boolean;
  previous_brands: string[];
  open_to_work: boolean;
  profile_photo_url: string | null;
  chapter_id: string;
  chapters: {
    chapter_name: string;
    universities: { name: string };
    greek_organizations: { name: string; greek_letters: string };
  };
}

const AmbassadorsAdmin = () => {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unlockedAmbassadors, setUnlockedAmbassadors] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    age: 21,
    position: '',
    email: '',
    linkedin_profile: '',
    graduation_year: new Date().getFullYear() + 1,
    major: '',
    chapter_id: '',
    is_fraternity_member: true,
    previous_brands: '',
    open_to_work: true,
    profile_photo_url: ''
  });

  useEffect(() => {
    fetchAmbassadors();
    fetchChapters();
  }, []);

  const fetchAmbassadors = async () => {
    try {
      const { data, error } = await supabase
        .from('chapter_officers')
        .select(`
          *,
          chapters (
            chapter_name,
            universities (name),
            greek_organizations (name, greek_letters)
          )
        `)
        .eq('is_ambassador', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAmbassadors(data || []);
    } catch (error) {
      console.error('Error fetching ambassadors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChapters = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select(`
          id,
          chapter_name,
          universities (name),
          greek_organizations (name, greek_letters)
        `)
        .order('chapter_name');

      if (error) throw error;
      setChapters(data || []);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const brandsArray = formData.previous_brands
      .split(',')
      .map(b => b.trim())
      .filter(b => b.length > 0);

    const payload = {
      ...formData,
      name: `${formData.first_name} ${formData.last_name}`,
      previous_brands: brandsArray,
      is_ambassador: true,
      ambassador_status: 'active',
      member_type: 'officer'
    };

    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('chapter_officers')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
        alert('Ambassador updated successfully!');
      } else {
        // Create new
        const { error } = await supabase
          .from('chapter_officers')
          .insert([payload]);

        if (error) throw error;
        alert('Ambassador created successfully!');
      }

      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        age: 21,
        position: '',
        email: '',
        linkedin_profile: '',
        graduation_year: new Date().getFullYear() + 1,
        major: '',
        chapter_id: '',
        is_fraternity_member: true,
        previous_brands: '',
        open_to_work: true,
        profile_photo_url: ''
      });
      setShowForm(false);
      setEditingId(null);
      fetchAmbassadors();
    } catch (error: any) {
      console.error('Error saving ambassador:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEdit = (ambassador: Ambassador) => {
    setFormData({
      first_name: ambassador.first_name,
      last_name: ambassador.last_name,
      age: ambassador.age,
      position: ambassador.position,
      email: ambassador.email,
      linkedin_profile: ambassador.linkedin_profile || '',
      graduation_year: ambassador.graduation_year,
      major: ambassador.major || '',
      chapter_id: ambassador.chapter_id,
      is_fraternity_member: ambassador.is_fraternity_member,
      previous_brands: ambassador.previous_brands?.join(', ') || '',
      open_to_work: ambassador.open_to_work,
      profile_photo_url: ambassador.profile_photo_url || ''
    });
    setEditingId(ambassador.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ambassador?')) return;

    try {
      const { error } = await supabase
        .from('chapter_officers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Ambassador deleted successfully!');
      fetchAmbassadors();
    } catch (error: any) {
      console.error('Error deleting ambassador:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleUnlock = (id: string) => {
    setUnlockedAmbassadors(prev => new Set([...prev, id]));
  };

  // Tyler Alesso is always unlocked (check by first name)
  const isTyler = (amb: Ambassador) =>
    amb.first_name.toLowerCase() === 'tyler' && amb.last_name.toLowerCase() === 'alesso';

  const isUnlocked = (amb: Ambassador) =>
    isTyler(amb) || unlockedAmbassadors.has(amb.id);

  const filteredAmbassadors = ambassadors.filter(amb =>
    `${amb.first_name} ${amb.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    amb.chapters?.universities?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    amb.chapters?.greek_organizations?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort Tyler first
  const sortedAmbassadors = [...filteredAmbassadors].sort((a, b) => {
    if (isTyler(a)) return -1;
    if (isTyler(b)) return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ambassadors</h2>
          <p className="text-gray-600 mt-1">Manage ambassador profiles</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              first_name: '',
              last_name: '',
              age: 21,
              position: '',
              email: '',
              linkedin_profile: '',
              graduation_year: new Date().getFullYear() + 1,
              major: '',
              chapter_id: '',
              is_fraternity_member: true,
              previous_brands: '',
              open_to_work: true,
              profile_photo_url: ''
            });
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Ambassador
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search ambassadors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-4">
            {editingId ? 'Edit Ambassador' : 'Add New Ambassador'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
              <input
                type="number"
                required
                min="18"
                max="30"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
              <input
                type="text"
                required
                placeholder="e.g., Social Chair"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chapter *</label>
              <select
                required
                value={formData.chapter_id}
                onChange={(e) => setFormData({ ...formData, chapter_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select Chapter</option>
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.greek_organizations?.name || 'Unknown'} - {chapter.universities?.name || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={formData.linkedin_profile}
                onChange={(e) => setFormData({ ...formData, linkedin_profile: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year *</label>
              <input
                type="number"
                required
                value={formData.graduation_year}
                onChange={(e) => setFormData({ ...formData, graduation_year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
              <input
                type="text"
                placeholder="e.g., Marketing"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Previous Brands (comma-separated)</label>
              <input
                type="text"
                placeholder="Nike, Red Bull, Celsius"
                value={formData.previous_brands}
                onChange={(e) => setFormData({ ...formData, previous_brands: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.profile_photo_url}
                onChange={(e) => setFormData({ ...formData, profile_photo_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="open_to_work"
                checked={formData.open_to_work}
                onChange={(e) => setFormData({ ...formData, open_to_work: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="open_to_work" className="text-sm font-medium text-gray-700">Open to Work</label>
            </div>

            <div className="col-span-2 flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {editingId ? 'Update' : 'Create'} Ambassador
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ambassador Cards Grid */}
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ambassadors...</p>
        </div>
      ) : sortedAmbassadors.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ambassadors found</h3>
          <p className="text-gray-600">Add your first ambassador to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAmbassadors.map((ambassador) => {
            const unlocked = isUnlocked(ambassador);
            const displayName = unlocked
              ? `${ambassador.first_name} ${ambassador.last_name}`
              : `${ambassador.first_name} ${ambassador.last_name.charAt(0)}.`;

            return (
              <div
                key={ambassador.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 relative"
              >
                {/* Admin Controls */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(ambassador)}
                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ambassador.id)}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    {ambassador.profile_photo_url ? (
                      <img
                        src={ambassador.profile_photo_url}
                        alt={displayName}
                        className={`w-16 h-16 rounded-full object-cover border-2 border-primary-200 ${
                          !unlocked ? 'blur-sm' : ''
                        }`}
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center ${
                        !unlocked ? 'blur-sm' : ''
                      }`}>
                        <Award className="w-8 h-8 text-white" />
                      </div>
                    )}
                    {ambassador.open_to_work && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full border-2 border-white font-semibold">
                        Open
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{displayName}</h3>
                    <p className="text-sm text-gray-600">{ambassador.age} years old</p>
                    {unlocked && ambassador.position && (
                      <p className="text-sm text-gray-500">{ambassador.position}</p>
                    )}
                  </div>
                </div>

                {/* University */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {ambassador.chapters?.universities?.name}
                    </span>
                  </div>

                  {/* Locked/Unlocked Content */}
                  {unlocked ? (
                    <>
                      {ambassador.is_fraternity_member && ambassador.chapters?.greek_organizations && (
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-primary-500" />
                          <span className="text-sm text-gray-700">
                            {ambassador.chapters.greek_organizations.greek_letters || ambassador.chapters.greek_organizations.name}
                          </span>
                        </div>
                      )}

                      {ambassador.previous_brands && ambassador.previous_brands.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Previous brands:</p>
                          <div className="flex flex-wrap gap-1">
                            {ambassador.previous_brands.map((brand, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
                              >
                                {brand}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {ambassador.linkedin_profile && (
                        <a
                          href={ambassador.linkedin_profile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-2"
                        >
                          View LinkedIn →
                        </a>
                      )}
                    </>
                  ) : (
                    <div className="relative">
                      <div className="blur-sm select-none pointer-events-none">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Unlock Button */}
                {!unlocked && (
                  <button
                    onClick={() => handleUnlock(ambassador.id)}
                    className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    Unlock Profile - 50 credits
                  </button>
                )}

                {unlocked && isTyler(ambassador) && (
                  <div className="mt-3 text-center text-xs text-green-600 font-medium">
                    ✨ Featured Ambassador
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600">Total Ambassadors</p>
          <p className="text-2xl font-bold text-gray-900">{ambassadors.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600">Open to Work</p>
          <p className="text-2xl font-bold text-green-600">
            {ambassadors.filter(a => a.open_to_work).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600">Fraternity Members</p>
          <p className="text-2xl font-bold text-primary-600">
            {ambassadors.filter(a => a.is_fraternity_member).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AmbassadorsAdmin;
