import React, { useState, useEffect } from 'react';
import { Upload, FileJson, Sparkles, Loader, Database, Filter, Star, TrendingUp, Users, GraduationCap, Mail, Phone, Linkedin } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Chapter {
  id: string;
  chapter_name: string;
  member_count?: number;
  grade?: number;
  status: string;
  instagram_handle?: string;
  greek_organizations?: {
    name: string;
    organization_type: 'fraternity' | 'sorority';
  };
  universities?: {
    name: string;
    state: string;
  };
  is_diamond?: boolean;
}

const OutreachPortalTab = () => {
  const [activeTab, setActiveTab] = useState<'input' | 'chapters'>('input');
  const [jsonInput, setJsonInput] = useState('');
  const [filterPrompt, setFilterPrompt] = useState('Posts about recruitment, rush week, or new member events');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  // Chapter data states
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [chapterFilter, setChapterFilter] = useState<'all' | 'diamond' | 'high-grade' | 'with-instagram'>('all');
  const [chapterContacts, setChapterContacts] = useState<Record<string, any>>({});

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setJsonInput(text);
        setError('');
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setResults(null);

    // Validate JSON
    let parsedData;
    try {
      parsedData = JSON.parse(jsonInput);
    } catch (err) {
      setError('Invalid JSON format. Please check your input.');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`${API_URL}/admin/outreach/filter-posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': sessionStorage.getItem('adminToken') || '',
        },
        body: JSON.stringify({
          posts: parsedData,
          filterPrompt: filterPrompt
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process posts');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Error processing posts. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fetch chapters
  useEffect(() => {
    if (activeTab === 'chapters' && chapters.length === 0) {
      fetchChapters();
    }
  }, [activeTab]);

  const fetchChapters = async () => {
    setIsLoadingChapters(true);
    try {
      const response = await fetch(`${API_URL}/admin/chapters`, {
        headers: {
          'x-admin-token': sessionStorage.getItem('adminToken') || '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch chapters');
      const data = await response.json();

      // Handle both array and object responses
      const chaptersArray = Array.isArray(data) ? data : (data.data || data.chapters || []);

      setChapters(chaptersArray);
      setFilteredChapters(chaptersArray);

      // Fetch contacts for chapters
      if (chaptersArray.length > 0) {
        await fetchContactsForChapters(chaptersArray);
      }
    } catch (err) {
      console.error('Error fetching chapters:', err);
      setChapters([]);
      setFilteredChapters([]);
    } finally {
      setIsLoadingChapters(false);
    }
  };

  const fetchContactsForChapters = async (chaptersData: Chapter[]) => {
    try {
      // Prepare chapter data for contact matching
      const chaptersToMatch = chaptersData.slice(0, 20).map(chapter => ({
        greek_organization: chapter.greek_organizations?.name || '',
        university: chapter.universities?.name || '',
        chapter_name: chapter.chapter_name,
        instagram_handle: chapter.instagram_handle
      }));

      const response = await fetch(`${API_URL}/admin/outreach/match-contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': sessionStorage.getItem('adminToken') || '',
        },
        body: JSON.stringify({ chapters: chaptersToMatch }),
      });

      if (!response.ok) throw new Error('Failed to fetch contacts');

      const data = await response.json();

      // Map contacts by chapter ID
      const contactsMap: Record<string, any> = {};
      data.matches.forEach((match: any) => {
        contactsMap[match.matched_chapter.id] = match.contacts;
      });

      setChapterContacts(contactsMap);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...chapters];

    switch (chapterFilter) {
      case 'diamond':
        filtered = filtered.filter(c => c.is_diamond);
        break;
      case 'high-grade':
        filtered = filtered.filter(c => c.grade && c.grade >= 4.0);
        break;
      case 'with-instagram':
        filtered = filtered.filter(c => c.instagram_handle);
        break;
      default:
        break;
    }

    setFilteredChapters(filtered);
  }, [chapterFilter, chapters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Outreach Portal</h2>
        </div>
        <p className="text-purple-100">
          AI-powered tools for identifying and analyzing potential chapters for outreach campaigns
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('input')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'input'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>Input Data</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('chapters')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'chapters'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span>Chapter Data</span>
          </div>
        </button>
      </div>

      {/* Input Data Tab */}
      {activeTab === 'input' && (
        <>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Post Data</h3>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload JSON File
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-gray-500">or paste JSON below</span>
              </div>
            </div>

            {/* Filter Prompt */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Criteria
              </label>
              <input
                type="text"
                value={filterPrompt}
                onChange={(e) => setFilterPrompt(e.target.value)}
                placeholder="e.g., Posts about recruitment, rush week, or philanthropy events"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-xs text-gray-500">
                Describe what types of posts you want to find (e.g., "Posts mentioning recruitment" or "Posts about philanthropy events")
              </p>
            </div>

            {/* Text Area */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste JSON Data
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setError('');
                }}
                placeholder='{"posts": [{"caption": "...", "hashtags": ["..."], ...}]}'
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!jsonInput || isProcessing}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Analyzing Posts...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze Posts</span>
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          {results && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileJson className="w-5 h-5 text-green-600" />
                Analysis Results
              </h3>

              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </>
      )}

      {/* Chapter Data Tab */}
      {activeTab === 'chapters' && (
        <>
          {/* Filter Buttons */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setChapterFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chapterFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>All Chapters ({chapters.length})</span>
                </div>
              </button>
              <button
                onClick={() => setChapterFilter('diamond')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chapterFilter === 'diamond'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Diamond ({chapters.filter(c => c.is_diamond).length})</span>
                </div>
              </button>
              <button
                onClick={() => setChapterFilter('high-grade')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chapterFilter === 'high-grade'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>High Grade 4.0+ ({chapters.filter(c => c.grade && c.grade >= 4.0).length})</span>
                </div>
              </button>
              <button
                onClick={() => setChapterFilter('with-instagram')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chapterFilter === 'with-instagram'
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Has Instagram ({chapters.filter(c => c.instagram_handle).length})</span>
                </div>
              </button>
            </div>
          </div>

          {/* Chapter Cards */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Chapters ({filteredChapters.length})
              </h3>

              {/* Size Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-red-500 to-red-600"></div>
                  <span className="text-gray-600">Big Chapters (50+ members)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-500 to-purple-600"></div>
                  <span className="text-gray-600">Small Chapters {'(<50 members)'}</span>
                </div>
              </div>
            </div>

            {isLoadingChapters ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChapters.map((chapter) => {
                  // Determine background color based on member count
                  const memberCount = chapter.member_count || 0;
                  const isBigChapter = memberCount >= 50; // Threshold for "big" chapter

                  const cardBgClass = isBigChapter
                    ? 'bg-gradient-to-br from-red-500 to-red-600'
                    : 'bg-gradient-to-br from-purple-500 to-purple-600';

                  return (
                    <div
                      key={chapter.id}
                      className={`${cardBgClass} rounded-lg p-4 hover:shadow-xl transition-all transform hover:scale-105`}
                    >
                      {/* Chapter Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">
                            {chapter.greek_organizations?.name || 'Unknown'}
                          </h4>
                          <p className="text-sm text-white/90">
                            {chapter.universities?.name}
                          </p>
                          <p className="text-xs text-white/75">
                            {chapter.universities?.state}
                          </p>
                        </div>
                        {chapter.is_diamond && (
                          <Sparkles className="w-5 h-5 text-yellow-300" />
                        )}
                      </div>

                    {/* Chapter Info */}
                    <div className="space-y-2">
                      {chapter.grade && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/80">Grade:</span>
                          <span className={`font-semibold px-2 py-1 rounded ${
                            chapter.grade >= 4.0 ? 'bg-white/90 text-green-700' :
                            chapter.grade >= 3.5 ? 'bg-white/90 text-blue-700' :
                            'bg-white/90 text-yellow-700'
                          }`}>
                            {chapter.grade.toFixed(1)}
                          </span>
                        </div>
                      )}
                      {chapter.member_count && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/80">Members:</span>
                          <span className="font-semibold text-white bg-white/20 px-2 py-1 rounded">{chapter.member_count}</span>
                        </div>
                      )}
                      {chapter.instagram_handle && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/80">Instagram:</span>
                          <a
                            href={`https://instagram.com/${chapter.instagram_handle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-yellow-200 font-medium underline"
                          >
                            {chapter.instagram_handle}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/80">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          chapter.status === 'active'
                            ? 'bg-white/90 text-green-700'
                            : 'bg-white/50 text-gray-700'
                        }`}>
                          {chapter.status}
                        </span>
                      </div>

                      {/* Contact Information */}
                      {chapterContacts[chapter.id] && (
                        <div className="mt-3 pt-3 border-t border-white/30">
                          <div className="text-xs font-semibold text-white mb-2 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>Primary Contact</span>
                          </div>
                          {chapterContacts[chapter.id].primary ? (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-white">
                                {chapterContacts[chapter.id].primary.name}
                              </div>
                              <div className="text-xs text-white/80">
                                {chapterContacts[chapter.id].primary.position}
                              </div>
                              {chapterContacts[chapter.id].primary.email && (
                                <a
                                  href={`mailto:${chapterContacts[chapter.id].primary.email}`}
                                  className="flex items-center gap-1 text-xs text-yellow-200 hover:text-yellow-100 underline"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>{chapterContacts[chapter.id].primary.email}</span>
                                </a>
                              )}
                              {chapterContacts[chapter.id].primary.phone && (
                                <a
                                  href={`tel:${chapterContacts[chapter.id].primary.phone}`}
                                  className="flex items-center gap-1 text-xs text-yellow-200 hover:text-yellow-100 underline"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{chapterContacts[chapter.id].primary.phone}</span>
                                </a>
                              )}
                            </div>
                          ) : chapterContacts[chapter.id].leadership?.length > 0 ? (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-white">
                                {chapterContacts[chapter.id].leadership[0].name}
                              </div>
                              <div className="text-xs text-white/80">
                                {chapterContacts[chapter.id].leadership[0].position}
                              </div>
                              {chapterContacts[chapter.id].leadership[0].email && (
                                <a
                                  href={`mailto:${chapterContacts[chapter.id].leadership[0].email}`}
                                  className="flex items-center gap-1 text-xs text-yellow-200 hover:text-yellow-100 underline"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>{chapterContacts[chapter.id].leadership[0].email}</span>
                                </a>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-white/60 italic">
                              No contact info available
                            </div>
                          )}
                          {chapterContacts[chapter.id].all_officers_count > 0 && (
                            <div className="text-xs text-white/70 mt-1">
                              +{chapterContacts[chapter.id].all_officers_count - 1} more officers
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isLoadingChapters && filteredChapters.length === 0 && (
              <div className="text-center py-12">
                <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No chapters found with current filters</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OutreachPortalTab;
