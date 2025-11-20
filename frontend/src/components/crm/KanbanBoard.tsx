import { useState, useMemo } from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { LayoutGrid, List, ChevronDown } from 'lucide-react';
import ChapterCard from './ChapterCard';
import { getCollegeLogoWithFallback } from '../../utils/collegeLogos';

interface Chapter {
  chapter_id: string;
  chapter_name: string;
  instagram_handle: string;
  university_name: string;
  fraternity_name: string;
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
  state?: string;
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

interface KanbanBoardProps {
  grouped: GroupedChapters;
  onChapterClick: (chapter: Chapter) => void;
  onMoveChapter?: (chapterId: string, fromStatus: string, toStatus: string) => void;
}

type ViewMode = 'grid' | 'list';

interface ColumnViewState {
  [columnId: string]: ViewMode;
}

interface ColumnFilters {
  state: string;
  priority: string;
  chapter: string;
  fundraising: string;
}

export default function KanbanBoard({ grouped, onChapterClick, onMoveChapter }: KanbanBoardProps) {
  // Define the column order
  const columnOrder = ['not_contacted', 'reached_out', 'responded', 'in_conversation', 'partnership', 'not_interested', 'archived'];

  const getNextStatus = (currentStatus: string): string | null => {
    const currentIndex = columnOrder.indexOf(currentStatus);
    return currentIndex < columnOrder.length - 1 ? columnOrder[currentIndex + 1] : null;
  };

  const getPreviousStatus = (currentStatus: string): string | null => {
    const currentIndex = columnOrder.indexOf(currentStatus);
    return currentIndex > 0 ? columnOrder[currentIndex - 1] : null;
  };
  const [viewModes, setViewModes] = useState<ColumnViewState>({
    not_contacted: 'grid',
    reached_out: 'grid',
    responded: 'grid',
    in_conversation: 'grid',
    partnership: 'grid',
    not_interested: 'grid',
    archived: 'grid',
  });

  const [filters, setFilters] = useState<{ [columnId: string]: ColumnFilters }>({
    not_contacted: { state: 'all', priority: 'all', chapter: 'Sigma Chi', fundraising: 'all' },
    reached_out: { state: 'all', priority: 'all', chapter: 'all', fundraising: 'all' },
    responded: { state: 'all', priority: 'all', chapter: 'all', fundraising: 'all' },
    in_conversation: { state: 'all', priority: 'all', chapter: 'all', fundraising: 'all' },
    partnership: { state: 'all', priority: 'all', chapter: 'all', fundraising: 'all' },
    not_interested: { state: 'all', priority: 'all', chapter: 'all', fundraising: 'all' },
    archived: { state: 'all', priority: 'all', chapter: 'all', fundraising: 'all' },
  });

  const toggleViewMode = (columnId: string) => {
    setViewModes(prev => ({
      ...prev,
      [columnId]: prev[columnId] === 'grid' ? 'list' : 'grid'
    }));
  };

  const updateFilter = (columnId: string, filterType: keyof ColumnFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        [filterType]: value
      }
    }));
  };

  // Compute available chapters from all grouped chapters
  const availableChapters = useMemo(() => {
    const allChapters = [
      ...grouped.not_contacted,
      ...grouped.reached_out,
      ...grouped.responded,
      ...grouped.in_conversation,
      ...grouped.partnership,
      ...grouped.not_interested,
      ...grouped.archived,
    ];
    const chapterNames = new Set(allChapters.map(c => c.fraternity_name).filter(Boolean));
    return Array.from(chapterNames).sort();
  }, [grouped]);

  const columns = [
    { id: 'not_contacted', label: 'Not Contacted', chapters: grouped.not_contacted, color: 'gray' },
    { id: 'reached_out', label: 'Reached Out', chapters: grouped.reached_out, color: 'blue' },
    { id: 'responded', label: 'Responded', chapters: grouped.responded, color: 'yellow' },
    { id: 'in_conversation', label: 'In Conversation', chapters: grouped.in_conversation, color: 'purple' },
    { id: 'partnership', label: 'Partnership', chapters: grouped.partnership, color: 'green' },
    { id: 'not_interested', label: 'Not Interested', chapters: grouped.not_interested, color: 'red' },
    { id: 'archived', label: 'Archived', chapters: grouped.archived, color: 'gray' },
  ];

  return (
    <div className="flex gap-4 p-6 overflow-x-auto">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          id={column.id}
          label={column.label}
          chapters={column.chapters}
          color={column.color}
          viewMode={viewModes[column.id]}
          filters={filters[column.id]}
          availableChapters={availableChapters}
          onToggleView={() => toggleViewMode(column.id)}
          onUpdateFilter={(filterType, value) => updateFilter(column.id, filterType, value)}
          onChapterClick={onChapterClick}
          onMoveChapter={onMoveChapter}
          getNextStatus={getNextStatus}
          getPreviousStatus={getPreviousStatus}
        />
      ))}
    </div>
  );
}

interface KanbanColumnProps {
  id: string;
  label: string;
  chapters: Chapter[];
  color: string;
  viewMode: ViewMode;
  filters: ColumnFilters;
  availableChapters: string[];
  onToggleView: () => void;
  onUpdateFilter: (filterType: keyof ColumnFilters, value: string) => void;
  onChapterClick: (chapter: Chapter) => void;
  onMoveChapter?: (chapterId: string, fromStatus: string, toStatus: string) => void;
  getNextStatus: (currentStatus: string) => string | null;
  getPreviousStatus: (currentStatus: string) => string | null;
}

function KanbanColumn({ id, label, chapters, color, viewMode, filters, availableChapters, onToggleView, onUpdateFilter, onChapterClick, onMoveChapter, getNextStatus, getPreviousStatus }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [showFilters, setShowFilters] = useState(false);

  const colorClasses = {
    gray: 'border-gray-300',
    blue: 'border-blue-300',
    yellow: 'border-yellow-300',
    purple: 'border-purple-300',
    green: 'border-green-300',
    red: 'border-red-300',
  };

  // Filter chapters based on selected filters
  const filteredChapters = useMemo(() => {
    const casinoStates = ['New Jersey', 'Michigan', 'Pennsylvania', 'NJ', 'MI', 'PA'];

    return chapters.filter(chapter => {
      // State filter
      if (filters.state === 'casino_states') {
        if (!chapter.state || !casinoStates.includes(chapter.state)) {
          return false;
        }
      } else if (filters.state !== 'all' && chapter.state !== filters.state) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && chapter.priority !== filters.priority) {
        return false;
      }

      // Chapter filter
      if (filters.chapter !== 'all' && chapter.fraternity_name !== filters.chapter) {
        return false;
      }

      // Fundraising filter
      if (filters.fundraising === 'active' && !chapter.fundraising_goal) {
        return false;
      }
      if (filters.fundraising === 'inactive' && chapter.fundraising_goal) {
        return false;
      }

      return true;
    });
  }, [chapters, filters]);

  // Extract unique states and priorities from this column's chapters
  const availableStates = useMemo(() => {
    const states = new Set(chapters.map(c => c.state).filter(Boolean));
    return Array.from(states).sort();
  }, [chapters]);

  const availablePriorities = useMemo(() => {
    const priorities = new Set(chapters.map(c => c.priority).filter(Boolean));
    return Array.from(priorities);
  }, [chapters]);

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 bg-gray-100 rounded-lg ${
        isOver ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}
    >
      {/* Column Header */}
      <div className={`px-4 py-3 border-b-2 ${colorClasses[color as keyof typeof colorClasses]} bg-white rounded-t-lg`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{label}</h3>
          <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-full">
            {filteredChapters.length}
          </span>
        </div>

        {/* View Toggle & Filters */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-md p-1">
            <button
              onClick={onToggleView}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleView}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <span className="text-gray-700">Filters</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>

            {showFilters && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-2 space-y-2">
                {/* State Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                  <select
                    value={filters.state}
                    onChange={(e) => onUpdateFilter('state', e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="all">All States</option>
                    <option value="casino_states">🎰 Casino States (NJ, MI, PA)</option>
                    <option disabled>───────────</option>
                    {availableStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => onUpdateFilter('priority', e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="all">All Priorities</option>
                    {availablePriorities.map(priority => (
                      <option key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chapter Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Chapter</label>
                  <select
                    value={filters.chapter}
                    onChange={(e) => onUpdateFilter('chapter', e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="all">All Chapters</option>
                    {availableChapters.map(chapter => (
                      <option key={chapter} value={chapter}>
                        {chapter}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fundraising Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fundraising</label>
                  <select
                    value={filters.fundraising}
                    onChange={(e) => onUpdateFilter('fundraising', e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="all">All</option>
                    <option value="active">Active Fundraising</option>
                    <option value="inactive">No Fundraising</option>
                  </select>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium py-1"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chapter Cards */}
      <div className="p-3 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
        {filteredChapters.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            {chapters.length === 0 ? 'No chapters' : 'No chapters match filters'}
          </div>
        ) : (
          viewMode === 'grid' ? (
            // Grid View
            filteredChapters.map((chapter) => {
              const nextStatus = getNextStatus(id);
              const previousStatus = getPreviousStatus(id);

              return (
                <ChapterCard
                  key={chapter.chapter_id}
                  chapter={chapter}
                  onClick={() => onChapterClick(chapter)}
                  onMoveNext={nextStatus && onMoveChapter ? () => onMoveChapter(chapter.chapter_id, id, nextStatus) : undefined}
                  onMovePrevious={previousStatus && onMoveChapter ? () => onMoveChapter(chapter.chapter_id, id, previousStatus) : undefined}
                  showMoveNext={!!nextStatus}
                  showMovePrevious={!!previousStatus}
                />
              );
            })
          ) : (
            // List View
            <div className="space-y-1">
              {filteredChapters.map((chapter) => (
                <ChapterListItem
                  key={chapter.chapter_id}
                  chapter={chapter}
                  onClick={() => onChapterClick(chapter)}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// List View Component
interface ChapterListItemProps {
  chapter: Chapter;
  onClick: () => void;
}

function ChapterListItem({ chapter, onClick }: ChapterListItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: chapter.chapter_id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="bg-white rounded border border-gray-200 p-2 cursor-pointer hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center gap-2">
        {/* University Logo - Left */}
        <img
          src={getCollegeLogoWithFallback(chapter.university_name)}
          alt={chapter.university_name}
          className="w-6 h-6 rounded object-contain flex-shrink-0"
        />

        <div className="flex items-center justify-between flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-gray-900 truncate">{chapter.fraternity_name}</div>
            <div className="text-xs text-gray-600 truncate">{chapter.university_name}</div>
          </div>
          <div className="flex items-center gap-2 ml-2">
            {chapter.instagram_handle && (
              <span className="text-xs text-gray-500">@{chapter.instagram_handle.replace('@', '')}</span>
            )}
            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
              {chapter.engagement_score}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
