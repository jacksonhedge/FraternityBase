import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import KanbanBoard from '../components/crm/KanbanBoard';
import ChapterDetailModal from '../components/crm/ChapterDetailModal';

interface Chapter {
  chapter_id: string;
  chapter_name: string;
  instagram_handle: string;
  university_name: string;
  fraternity_name: string;
  organization_type?: string;
  outreach_status: string;
  engagement_score: number;
  priority: string;
  last_contact_date: string | null;
  next_follow_up_date: string | null;
  primary_contact_name: string | null;
  notes: string | null;
  followers: number | null;
  posts_last_7_days: number;
  opportunities_last_30_days: number;
  last_post_date: string | null;
  fundraising_goal?: number | null;
  fundraising_benefactor?: string | null;
  fundraising_current?: number | null;
}

interface GroupedChapters {
  not_contacted: Chapter[];
  reached_out: Chapter[];
  responded: Chapter[];
  in_conversation: Chapter[];
  partnership: Chapter[];
  not_interested: Chapter[];
  archived: Chapter[];
}

export default function CRMPage() {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]); // Store all chapters
  const [orgTypeFilter, setOrgTypeFilter] = useState<'fraternity' | 'sorority'>('fraternity');
  const [grouped, setGrouped] = useState<GroupedChapters>({
    not_contacted: [],
    reached_out: [],
    responded: [],
    in_conversation: [],
    partnership: [],
    not_interested: [],
    archived: []
  });
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCRMData();
  }, []);

  const fetchCRMData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/crm/dashboard`);
      const data = await response.json();

      if (data.success) {
        setAllChapters(data.chapters);
        filterChaptersByOrgType(data.chapters, orgTypeFilter);
      } else {
        setError(data.error || 'Failed to load CRM data');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterChaptersByOrgType = (chaptersData: Chapter[], type: 'fraternity' | 'sorority') => {
    const filtered = chaptersData.filter(c =>
      c.organization_type?.toLowerCase() === type ||
      (type === 'fraternity' && !c.organization_type) // Default to fraternity if not set
    );
    setChapters(filtered);
    setGrouped(groupChapters(filtered));
  };

  const handleOrgTypeChange = (type: 'fraternity' | 'sorority') => {
    setOrgTypeFilter(type);
    filterChaptersByOrgType(allChapters, type);
  };

  const updateChapterStatus = async (chapterId: string, newStatus: string) => {
    // Find the chapter
    const chapter = chapters.find(c => c.chapter_id === chapterId);
    if (!chapter) return;

    // If status hasn't changed, do nothing
    if (chapter.outreach_status === newStatus) return;

    // Optimistically update UI
    const updatedChapters = chapters.map(c =>
      c.chapter_id === chapterId ? { ...c, outreach_status: newStatus } : c
    );
    setChapters(updatedChapters);

    // Regroup chapters
    const newGrouped = groupChapters(updatedChapters);
    setGrouped(newGrouped);

    // Update backend
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/crm/chapters/${chapterId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();
      if (!data.success) {
        // Revert on error
        fetchCRMData();
        alert(`Failed to update status: ${data.error}`);
      }
    } catch (err: any) {
      // Revert on error
      fetchCRMData();
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const chapterId = active.id as string;
    const newStatus = over.id as string;

    await updateChapterStatus(chapterId, newStatus);
  };

  const handleMoveChapter = async (chapterId: string, fromStatus: string, toStatus: string) => {
    await updateChapterStatus(chapterId, toStatus);
  };

  const groupChapters = (chapterList: Chapter[]): GroupedChapters => {
    return {
      not_contacted: chapterList.filter(c => !c.outreach_status || c.outreach_status === 'not_contacted'),
      reached_out: chapterList.filter(c => c.outreach_status === 'reached_out'),
      responded: chapterList.filter(c => c.outreach_status === 'responded'),
      in_conversation: chapterList.filter(c => c.outreach_status === 'in_conversation'),
      partnership: chapterList.filter(c => c.outreach_status === 'partnership'),
      not_interested: chapterList.filter(c => c.outreach_status === 'not_interested'),
      archived: chapterList.filter(c => c.outreach_status === 'archived'),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CRM...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => fetchCRMData()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Greek Life CRM</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage outreach and engagement opportunities across {chapters.length} chapters
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Fraternity/Sorority Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleOrgTypeChange('fraternity')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  orgTypeFilter === 'fraternity'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Fraternities
              </button>
              <button
                onClick={() => handleOrgTypeChange('sorority')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  orgTypeFilter === 'sorority'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sororities
              </button>
            </div>

            <button
              onClick={() => fetchCRMData()}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Refresh
            </button>
            <button
              onClick={() => window.open('/app/supermap', '_blank')}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              View Opportunities
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-8 gap-4 mt-6">
          <StatCard label="Currently Fundraising" count={chapters.filter(c => c.fundraising_goal).length} color="green" icon="💰" />
          <StatCard label="Not Contacted" count={grouped.not_contacted.length} color="gray" />
          <StatCard label="Reached Out" count={grouped.reached_out.length} color="blue" />
          <StatCard label="Responded" count={grouped.responded.length} color="yellow" />
          <StatCard label="In Conversation" count={grouped.in_conversation.length} color="purple" />
          <StatCard label="Partnership" count={grouped.partnership.length} color="green" />
          <StatCard label="Not Interested" count={grouped.not_interested.length} color="red" />
          <StatCard label="Archived" count={grouped.archived.length} color="gray" />
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
        <KanbanBoard
          grouped={grouped}
          onChapterClick={(chapter) => setSelectedChapter(chapter)}
          onMoveChapter={handleMoveChapter}
        />
      </DndContext>

      {/* Chapter Detail Modal */}
      {selectedChapter && (
        <ChapterDetailModal
          chapter={selectedChapter}
          onClose={() => setSelectedChapter(null)}
          onUpdate={() => {
            fetchCRMData();
            setSelectedChapter(null);
          }}
        />
      )}
    </div>
  );
}

function StatCard({ label, count, color, icon }: { label: string; count: number; color: string; icon?: string }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
  };

  return (
    <div className={`rounded-lg p-4 ${colors[color as keyof typeof colors]}`}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-xl">{icon}</span>}
        <div className="text-2xl font-bold">{count}</div>
      </div>
      <div className="text-xs font-medium mt-1">{label}</div>
    </div>
  );
}
