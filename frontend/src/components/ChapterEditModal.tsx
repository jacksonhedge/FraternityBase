import { useState, useEffect, useRef } from 'react';
import { X, Save, Globe, Instagram, Linkedin, Twitter, MapPin, Building, Calendar, Users, Star, Upload, Plus, Trash2, Edit2, UserPlus } from 'lucide-react';

interface ChapterEditModalProps {
  chapter: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (chapterId: string, updates: any) => Promise<void>;
  chapterUsers?: any[];
  onTogglePinned?: (userId: string, isPinned: boolean) => Promise<void>;
  onImportRoster?: (chapterId: string, users: any[]) => Promise<void>;
  onAssignPosition?: (userId: string, position: string) => Promise<void>;
}

const ChapterEditModal = ({ chapter, isOpen, onClose, onSave, chapterUsers = [], onTogglePinned, onImportRoster, onAssignPosition }: ChapterEditModalProps) => {
  const [activeTab, setActiveTab] = useState<'info' | 'roster'>('info');
  const [formData, setFormData] = useState({
    website: '',
    instagram_handle_official: '',
    twitter_handle: '',
    linkedin_url: '',
    tiktok_handle: '',
    city: '',
    state_province: '',
    country: '',
    fraternity_province: '',
    house_address: '',
    member_count: '',
    charter_date: '',
    chapter_name: '',
    greek_letter_name: '',
    grade: '',
    is_platinum: false,
    is_diamond: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState('');
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  // POC management
  const [customPOCs, setCustomPOCs] = useState<Array<{id: string, position: string, userId?: string}>>([]);
  const [showAddPOC, setShowAddPOC] = useState(false);
  const [newPOCPosition, setNewPOCPosition] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', position: '', email: '', phone: '' });

  // Leadership assignment tracking
  const [selectedLeadership, setSelectedLeadership] = useState<Record<string, string>>({});
  const [selectedPOC, setSelectedPOC] = useState<Record<string, string>>({});

  // Fixed leadership positions
  const LEADERSHIP_POSITIONS = ['President', 'Vice President', 'Philanthropy Chair'];

  // Key positions to pin
  const KEY_POSITIONS = [
    'President',
    'Vice President',
    'Treasurer',
    'Philanthropy Chair',
    'Social Chair',
    'Secretary',
    'Risk Management'
  ];

  useEffect(() => {
    if (chapter) {
      setFormData({
        website: chapter.website || '',
        instagram_handle_official: chapter.instagram_handle_official || '',
        twitter_handle: chapter.twitter_handle || '',
        linkedin_url: chapter.linkedin_url || '',
        tiktok_handle: chapter.tiktok_handle || '',
        city: chapter.city || '',
        state_province: chapter.state_province || '',
        country: chapter.country || '',
        fraternity_province: chapter.fraternity_province || '',
        house_address: chapter.house_address || '',
        member_count: chapter.member_count || '',
        charter_date: chapter.charter_date || '',
        chapter_name: chapter.chapter_name || '',
        greek_letter_name: chapter.greek_letter_name || '',
        grade: chapter.grade || '',
        is_platinum: chapter.is_platinum || false,
        is_diamond: chapter.is_diamond || false,
      });
    }
  }, [chapter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      await onSave(chapter.id, formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update chapter');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // POC Management Functions
  const handleAddPOC = () => {
    if (newPOCPosition.trim()) {
      setCustomPOCs([...customPOCs, { id: Date.now().toString(), position: newPOCPosition.trim() }]);
      setNewPOCPosition('');
      setShowAddPOC(false);
    }
  };

  const handleRemovePOC = (pocId: string) => {
    setCustomPOCs(customPOCs.filter(poc => poc.id !== pocId));
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportRoster) return;

    setIsImporting(true);
    setError('');
    setImportSuccess('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const users = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          // Map CSV columns to user object
          users.push({
            name: row.name || row.Name || '',
            position: row.position || row.Position || row.title || row.Title || 'Member',
            email: row.email || row.Email || '',
            phone: row.phone || row.Phone || '',
            linkedin_profile: row.linkedin || row.LinkedIn || row.linkedin_profile || '',
            graduation_year: parseInt(row.graduation_year || row['graduation year'] || row.grad_year || '0') || undefined,
            major: row.major || row.Major || '',
            member_type: (row.member_type || row['member type'] || row.type || 'member').toLowerCase(),
            is_primary_contact: (row.is_primary_contact || row.is_primary || row['is primary'] || 'false').toLowerCase() === 'true'
          });
        }

        await onImportRoster(chapter.id, users);
        setImportSuccess(`Successfully imported ${users.length} members!`);

        // Reset file input
        if (csvFileInputRef.current) {
          csvFileInputRef.current.value = '';
        }
      } catch (err: any) {
        setError(err.message || 'Failed to import CSV');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Chapter Details</h2>
              <p className="text-sm text-gray-600 mt-1">
                {chapter?.greek_organizations?.name} - {chapter?.universities?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-t border-gray-200">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'info'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Building className="w-4 h-4 inline mr-2" />
              Chapter Information
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'roster'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Roster and Leadership ({chapterUsers.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Chapter Information Tab */}
          {activeTab === 'info' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Chapter Info */}
              <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Chapter Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chapter Name
                </label>
                <input
                  type="text"
                  value={formData.chapter_name}
                  onChange={(e) => handleChange('chapter_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Beta Theta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Greek Letter Name
                </label>
                <input
                  type="text"
                  value={formData.greek_letter_name}
                  onChange={(e) => handleChange('greek_letter_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Gamma"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Charter Date
                </label>
                <input
                  type="date"
                  value={formData.charter_date}
                  onChange={(e) => handleChange('charter_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Member Count
                </label>
                <input
                  type="number"
                  value={formData.member_count}
                  onChange={(e) => handleChange('member_count', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 145"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Grade (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.grade}
                  onChange={(e) => handleChange('grade', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 4.5"
                />
              </div>
            </div>
          </div>

          {/* Premium Tiers */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Premium Tiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg">
                <input
                  type="checkbox"
                  id="is_platinum"
                  checked={formData.is_platinum}
                  onChange={(e) => handleChange('is_platinum', e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_platinum" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 font-medium text-gray-900">
                    <span className="text-lg">⭐</span>
                    <span>Platinum Chapter</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">$50 unlock (standard access)</p>
                </label>
              </div>
              <div className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg">
                <input
                  type="checkbox"
                  id="is_diamond"
                  checked={formData.is_diamond}
                  onChange={(e) => handleChange('is_diamond', e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_diamond" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 font-medium text-gray-900">
                    <span className="text-lg">💎</span>
                    <span>Diamond Chapter</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">$100 unlock + warm intro (48hr guarantee)</p>
                </label>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://pennstatesig.org"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Instagram className="w-4 h-4" />
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={formData.instagram_handle_official}
                    onChange={(e) => handleChange('instagram_handle_official', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="sigmachisc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Twitter className="w-4 h-4" />
                    Twitter Handle
                  </label>
                  <input
                    type="text"
                    value={formData.twitter_handle}
                    onChange={(e) => handleChange('twitter_handle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="sigmachi_psu"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleChange('linkedin_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TikTok Handle
                  </label>
                  <input
                    type="text"
                    value={formData.tiktok_handle}
                    onChange={(e) => handleChange('tiktok_handle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="@sigmachipsu"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="University Park"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  value={formData.state_province}
                  onChange={(e) => handleChange('state_province', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="PA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="United States"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fraternity Province
                </label>
                <input
                  type="text"
                  value={formData.fraternity_province}
                  onChange={(e) => handleChange('fraternity_province', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Central Pennsylvania"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  House Address
                </label>
                <input
                  type="text"
                  value={formData.house_address}
                  onChange={(e) => handleChange('house_address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="420 E Fairmount Ave, State College, PA 16801"
                />
              </div>
            </div>
          </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Roster Tab */}
          {activeTab === 'roster' && (
            <div className="space-y-6">
              {/* CSV Import Section */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Import Roster from CSV</h3>
                  <p className="text-xs text-gray-500 mt-1">Upload a CSV file with columns: name, position, email, phone, linkedin, graduation_year, major, member_type</p>
                </div>
                <div>
                  <input
                    ref={csvFileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    className="hidden"
                    id="roster-csv-upload"
                  />
                  <label
                    htmlFor="roster-csv-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors cursor-pointer ${
                      isImporting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isImporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Import CSV
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Success/Error Messages */}
              {importSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {importSuccess}
                </div>
              )}

              {/* Chapter Leadership */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-blue-600 fill-blue-600" />
                  Chapter Leadership
                </h3>
                <div className="space-y-2">
                  {LEADERSHIP_POSITIONS.map(position => {
                    const officer = chapterUsers.find(u => u.position === position && u.is_pinned);
                    return (
                      <div key={position} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-blue-900">{position}</div>
                          {officer && onTogglePinned && (
                            <button
                              onClick={() => onTogglePinned(officer.id, false)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Remove from position"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {officer ? (
                          <div className="mt-1">
                            <div className="font-medium text-gray-900">{officer.name}</div>
                            {officer.email && <div className="text-xs text-gray-500">{officer.email}</div>}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            {onAssignPosition && (
                              <>
                                <select
                                  value={selectedLeadership[position] || ''}
                                  onChange={(e) => setSelectedLeadership({ ...selectedLeadership, [position]: e.target.value })}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                  <option value="">Select member for {position}...</option>
                                  {chapterUsers
                                    .filter(u => !u.is_pinned)
                                    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                                    .map(user => (
                                      <option key={user.id} value={user.id}>
                                        {user.name} {user.position ? `(${user.position})` : ''}
                                      </option>
                                    ))}
                                </select>
                                <button
                                  onClick={() => {
                                    if (selectedLeadership[position]) {
                                      onAssignPosition(selectedLeadership[position], position);
                                      setSelectedLeadership({ ...selectedLeadership, [position]: '' });
                                    }
                                  }}
                                  disabled={!selectedLeadership[position]}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                  Save
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Points of Contact */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-purple-600" />
                    Points of Contact
                  </h3>
                  <button
                    onClick={() => setShowAddPOC(!showAddPOC)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add POC Role
                  </button>
                </div>

                {showAddPOC && (
                  <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPOCPosition}
                        onChange={(e) => setNewPOCPosition(e.target.value)}
                        placeholder="e.g., Social Chair, Marketing Lead..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddPOC()}
                      />
                      <button
                        onClick={handleAddPOC}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setShowAddPOC(false); setNewPOCPosition(''); }}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {customPOCs.map(poc => {
                    const officer = chapterUsers.find(u => u.position === poc.position);
                    return (
                      <div key={poc.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-purple-900">{poc.position}</div>
                          <button
                            onClick={() => handleRemovePOC(poc.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Remove POC role"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {officer ? (
                          <div className="mt-1">
                            <div className="font-medium text-gray-900">{officer.name}</div>
                            {officer.email && <div className="text-xs text-gray-500">{officer.email}</div>}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            {onAssignPosition && (
                              <>
                                <select
                                  value={selectedPOC[poc.position] || ''}
                                  onChange={(e) => setSelectedPOC({ ...selectedPOC, [poc.position]: e.target.value })}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                >
                                  <option value="">Select member for {poc.position}...</option>
                                  {chapterUsers
                                    .filter(u => !u.is_pinned)
                                    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                                    .map(user => (
                                      <option key={user.id} value={user.id}>
                                        {user.name} {user.position ? `(${user.position})` : ''}
                                      </option>
                                    ))}
                                </select>
                                <button
                                  onClick={() => {
                                    if (selectedPOC[poc.position]) {
                                      onAssignPosition(selectedPOC[poc.position], poc.position);
                                      setSelectedPOC({ ...selectedPOC, [poc.position]: '' });
                                    }
                                  }}
                                  disabled={!selectedPOC[poc.position]}
                                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                  Save
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {customPOCs.length === 0 && !showAddPOC && (
                    <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                      No custom points of contact. Click "Add POC Role" to create flexible contact positions.
                    </div>
                  )}
                </div>
              </div>

              {/* All Members */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  All Members ({chapterUsers.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {chapterUsers
                    .sort((a, b) => {
                      // Sort pinned first
                      if (a.is_pinned && !b.is_pinned) return -1;
                      if (!a.is_pinned && b.is_pinned) return 1;
                      return (a.name || '').localeCompare(b.name || '');
                    })
                    .map(user => (
                      <div key={user.id} className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-100 transition-colors ${
                        user.is_pinned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            {user.name}
                            {user.is_pinned && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                          </div>
                          <div className="text-sm text-gray-600">{user.position || 'Member'}</div>
                          {user.email && <div className="text-xs text-gray-500">{user.email}</div>}
                        </div>
                        {onTogglePinned && (
                          <button
                            onClick={() => onTogglePinned(user.id, !user.is_pinned)}
                            className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-gray-200 rounded-lg transition-colors"
                            title={user.is_pinned ? "Unpin" : "Pin as officer"}
                          >
                            <Star className={`w-5 h-5 ${user.is_pinned ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterEditModal;
