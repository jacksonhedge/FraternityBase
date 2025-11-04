/**
 * ChapterCard Component
 * Airbnb-inspired card design for fraternity chapters
 */

import { Star, MapPin, Users, Heart, Lock, Unlock, Award } from 'lucide-react';
import { useState } from 'react';
import { getCollegeLogoWithFallback } from '../utils/collegeLogos';

interface Chapter {
  id: string;
  chapter_name: string;
  member_count?: number;
  status: string;
  founded_date?: string;
  house_address?: string;
  instagram_handle?: string;
  website?: string;
  contact_email?: string;
  phone?: string;
  header_image_url?: string;
  grade?: number;
  coming_soon_date?: string;
  is_diamond?: boolean;
  updated_at?: string;
  expected_update_date?: string;
  greek_organizations?: {
    id: string;
    name: string;
    greek_letters?: string;
    organization_type: 'fraternity' | 'sorority';
  };
  universities?: {
    id: string;
    name: string;
    location: string;
    state: string;
    student_count?: number;
    logo_url?: string;
    conference?: string;
    division?: string;
  };
}

interface ChapterCardProps {
  chapter: Chapter;
  isUnlocked: boolean;
  isFavorited: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onUnlock?: (e: React.MouseEvent) => void;
  onClick: () => void;
}

export default function ChapterCard({
  chapter,
  isUnlocked,
  isFavorited,
  onToggleFavorite,
  onUnlock,
  onClick
}: ChapterCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get display values
  const fraternityName = chapter.greek_organizations?.name || 'Unknown';
  const chapterName = chapter.chapter_name || 'Chapter';
  const universityName = chapter.universities?.name || 'University';
  const stateName = chapter.universities?.state || '';
  const grade = chapter.grade || 0;
  const memberCount = chapter.member_count || 0;

  // Grade badge styling
  const getGradeBadge = () => {
    if (grade >= 5.0) return { text: '5.0', color: 'text-green-600', bg: 'bg-green-50' };
    if (grade >= 4.5) return { text: grade.toFixed(1), color: 'text-blue-600', bg: 'bg-blue-50' };
    if (grade >= 4.0) return { text: grade.toFixed(1), color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { text: grade.toFixed(1), color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const gradeBadge = getGradeBadge();

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer transition-standard"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3">
        {/* Chapter Header Image */}
        <img
          src={chapter.header_image_url || '/default-chapter-bg.jpg'}
          alt={`${fraternityName} at ${universityName}`}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            // Fallback to gradient if image fails
            e.currentTarget.style.display = 'none';
            setImageLoaded(true);
          }}
        />

        {/* Gradient overlay for fallback */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600" />
        )}

        {/* Favorite Button - Top Right */}
        <button
          onClick={onToggleFavorite}
          className="absolute top-3 right-3 p-2 rounded-full transition-all hover:scale-110"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)'
          }}
          aria-label="Favorite"
        >
          <Heart
            size={18}
            className={`transition-colors ${
              isFavorited ? 'fill-red-500 stroke-red-500' : 'stroke-gray-700'
            }`}
          />
        </button>

        {/* Lock/Unlock Badge - Top Left */}
        <div className="absolute top-3 left-3">
          <div
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 font-semibold text-xs transition-all ${
              isUnlocked
                ? 'bg-green-500/90 text-white border border-green-600'
                : 'bg-white/90 text-gray-700 border border-gray-200'
            }`}
            style={{ backdropFilter: 'blur(8px)' }}
          >
            {isUnlocked ? (
              <>
                <Unlock size={12} />
                <span>Unlocked</span>
              </>
            ) : (
              <>
                <Lock size={12} />
                <span>Locked</span>
              </>
            )}
          </div>
        </div>

        {/* Diamond Badge - Bottom Left */}
        {chapter.is_diamond && (
          <div className="absolute bottom-3 left-3">
            <div
              className="px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold text-xs bg-purple-600/90 text-white border-2 border-purple-400"
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <span>💎</span>
              <span>Diamond</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        {/* Location and State */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-base truncate transition-standard"
              style={{ color: 'var(--text)' }}
            >
              {fraternityName}
            </h3>
            <p
              className="text-sm truncate"
              style={{ color: 'var(--text-muted)' }}
            >
              {chapterName}
            </p>
          </div>
          {stateName && (
            <span
              className="flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-md"
              style={{
                backgroundColor: 'var(--muted)',
                color: 'var(--text)'
              }}
            >
              {stateName}
            </span>
          )}
        </div>

        {/* University */}
        <div className="flex items-center gap-2">
          <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
            {universityName}
          </span>
        </div>

        {/* Members Count */}
        {memberCount > 0 && (
          <div className="flex items-center gap-2">
            <Users size={14} style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {memberCount} members
            </span>
          </div>
        )}

        {/* Grade and Price */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5">
            <Award size={14} style={{ color: 'var(--brand)' }} />
            <span className={`text-sm font-semibold px-2 py-0.5 rounded ${gradeBadge.bg} ${gradeBadge.color}`}>
              {gradeBadge.text}
            </span>
          </div>
          {!isUnlocked && onUnlock && (
            <button
              onClick={onUnlock}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
              style={{
                backgroundColor: 'var(--brand)',
                color: 'white'
              }}
            >
              Unlock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
