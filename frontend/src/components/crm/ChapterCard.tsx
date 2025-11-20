import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { getCollegeLogoWithFallback } from '../../utils/collegeLogos';

interface Chapter {
  chapter_id: string;
  chapter_name: string;
  instagram_handle: string;
  university_name: string;
  fraternity_name: string;
  engagement_score: number;
  priority: string;
  last_contact_date: string | null;
  next_follow_up_date: string | null;
  primary_contact_name: string | null;
  followers: number | null;
  posts_last_7_days: number;
  opportunities_last_30_days: number;
  last_post_date: string | null;
  fundraising_goal?: number | null;
  fundraising_benefactor?: string | null;
  fundraising_current?: number | null;
}

interface ChapterCardProps {
  chapter: Chapter;
  onClick: () => void;
  onMoveNext?: () => void;
  onMovePrevious?: () => void;
  showMoveNext?: boolean;
  showMovePrevious?: boolean;
}

export default function ChapterCard({ chapter, onClick, onMoveNext, onMovePrevious, showMoveNext, showMovePrevious }: ChapterCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: chapter.chapter_id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };


  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow relative"
    >
      {/* University Logo - Top Right */}
      <div className="absolute top-3 right-3">
        <img
          src={getCollegeLogoWithFallback(chapter.university_name)}
          alt={chapter.university_name}
          className="w-8 h-8 rounded-lg object-contain"
        />
      </div>

      {/* Chapter Info */}
      <div className="mb-3 pr-10">
        <h4 className="font-semibold text-gray-900 text-sm mb-1">{chapter.fraternity_name}</h4>
        <p className="text-xs text-gray-600">{chapter.university_name}</p>
      </div>

      {/* Instagram */}
      {chapter.instagram_handle && (
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span className="text-xs text-gray-600">{chapter.instagram_handle.startsWith('@') ? chapter.instagram_handle : `@${chapter.instagram_handle}`}</span>
        </div>
      )}

      {/* Metrics */}
      <div className="mb-3">
        <MetricBadge label="Followers" value={chapter.followers ? `${Math.floor(chapter.followers / 1000)}k` : 'N/A'} />
      </div>

      {/* Fundraising Banner */}
      {chapter.fundraising_goal && (
        <div className="mb-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-green-700">💰 FUNDRAISING</span>
          </div>
          <div className="text-xs text-gray-700 font-medium mb-1">
            {chapter.fundraising_benefactor || 'Fundraising Campaign'}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              ${(chapter.fundraising_current || 0).toLocaleString()} / ${chapter.fundraising_goal.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-green-700">
              {Math.round(((chapter.fundraising_current || 0) / chapter.fundraising_goal) * 100)}%
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-green-600 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(((chapter.fundraising_current || 0) / chapter.fundraising_goal) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Contact & Priority */}
      <div className="space-y-2">
        {chapter.primary_contact_name && (
          <div className="text-xs text-gray-600">
            <span className="font-medium">Contact:</span> {chapter.primary_contact_name}
          </div>
        )}
        {chapter.priority && (
          <div>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${priorityColors[chapter.priority as keyof typeof priorityColors] || priorityColors.medium}`}>
              {chapter.priority.charAt(0).toUpperCase() + chapter.priority.slice(1)} Priority
            </span>
          </div>
        )}
      </div>

      {/* Follow-up Date */}
      {chapter.next_follow_up_date && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Follow-up: {new Date(chapter.next_follow_up_date).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* View Details Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClick();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="w-full mt-3 px-3 py-2 text-xs text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg transition-colors cursor-pointer"
      >
        View Details
      </button>

      {/* Move Arrows - Bottom Right */}
      <div className="absolute bottom-3 right-3 flex gap-1">
        {showMovePrevious && onMovePrevious && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onMovePrevious();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer shadow-sm"
            title="Move to previous column"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}
        {showMoveNext && onMoveNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onMoveNext();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors cursor-pointer shadow-sm"
            title="Move to next column"
          >
            <ChevronRight className="w-5 h-5 text-blue-700" />
          </button>
        )}
      </div>
    </div>
  );
}

function MetricBadge({ label, value, isHighlight }: { label: string; value: number | string; isHighlight?: boolean }) {
  return (
    <div className={`text-center py-1 px-2 rounded ${isHighlight ? 'bg-green-100' : 'bg-gray-100'}`}>
      <div className={`text-xs font-bold ${isHighlight ? 'text-green-700' : 'text-gray-900'}`}>{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
}
