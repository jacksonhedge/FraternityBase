/**
 * ChapterDetailSheet Component
 * Airbnb-inspired detail sheet for fraternity chapters
 * Slides in from the right with chapter information
 */

import { X, MapPin, Users, Award, Instagram, Globe, Mail, Phone, Heart, Lock, Unlock, Star, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
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

interface ChapterDetailSheetProps {
  chapter: Chapter | null;
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onUnlock?: () => void;
}

export default function ChapterDetailSheet({
  chapter,
  isOpen,
  onClose,
  isUnlocked,
  isFavorited,
  onToggleFavorite,
  onUnlock
}: ChapterDetailSheetProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!chapter) return null;

  const fraternityName = chapter.greek_organizations?.name || 'Unknown';
  const chapterName = chapter.chapter_name || 'Chapter';
  const universityName = chapter.universities?.name || 'University';
  const stateName = chapter.universities?.state || '';
  const grade = chapter.grade || 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isOpen && isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full md:w-[600px] lg:w-[700px] shadow-2xl transition-transform duration-300 overflow-y-auto ${
          isOpen && isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--surface)' }}
      >
        {/* Header Image */}
        <div className="relative h-[300px] md:h-[400px]">
          <img
            src={chapter.header_image_url || '/default-chapter-bg.jpg'}
            alt={`${fraternityName} at ${universityName}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full transition-all hover:scale-110"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)'
            }}
            aria-label="Close"
          >
            <X size={24} style={{ color: 'var(--text)' }} />
          </button>

          {/* Actions - Top Right */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {/* Favorite */}
            <button
              onClick={onToggleFavorite}
              className="p-2 rounded-full transition-all hover:scale-110"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)'
              }}
              aria-label="Favorite"
            >
              <Heart
                size={20}
                className={`transition-colors ${
                  isFavorited ? 'fill-red-500 stroke-red-500' : 'stroke-gray-700'
                }`}
              />
            </button>
          </div>

          {/* Lock/Unlock Badge - Bottom Left */}
          <div className="absolute bottom-4 left-4">
            <div
              className={`px-4 py-2 rounded-full flex items-center gap-2 font-semibold ${
                isUnlocked
                  ? 'bg-green-500/90 text-white border border-green-600'
                  : 'bg-white/90 text-gray-700 border border-gray-200'
              }`}
              style={{ backdropFilter: 'blur(8px)' }}
            >
              {isUnlocked ? (
                <>
                  <Unlock size={16} />
                  <span>Unlocked</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Locked</span>
                </>
              )}
            </div>
          </div>

          {/* Diamond Badge */}
          {chapter.is_diamond && (
            <div className="absolute bottom-4 right-4">
              <div
                className="px-4 py-2 rounded-full flex items-center gap-2 font-bold bg-purple-600/90 text-white border-2 border-purple-400"
                style={{ backdropFilter: 'blur(8px)' }}
              >
                <span className="text-lg">💎</span>
                <span>Diamond</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Title Section */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                {fraternityName}
              </h1>
              {stateName && (
                <span
                  className="flex-shrink-0 px-3 py-1.5 text-sm font-semibold rounded-lg"
                  style={{
                    backgroundColor: 'var(--muted)',
                    color: 'var(--text)'
                  }}
                >
                  {stateName}
                </span>
              )}
            </div>
            <p className="text-xl" style={{ color: 'var(--text-muted)' }}>
              {chapterName}
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-6 flex-wrap pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
            {/* Grade */}
            <div className="flex items-center gap-2">
              <Award size={20} style={{ color: 'var(--brand)' }} />
              <span className="font-semibold" style={{ color: 'var(--text)' }}>
                {grade.toFixed(1)}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>rating</span>
            </div>

            {/* Members */}
            {chapter.member_count && (
              <>
                <span style={{ color: 'var(--border)' }}>•</span>
                <div className="flex items-center gap-2">
                  <Users size={20} style={{ color: 'var(--text-muted)' }} />
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>
                    {chapter.member_count}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>members</span>
                </div>
              </>
            )}

            {/* Founded */}
            {chapter.founded_date && (
              <>
                <span style={{ color: 'var(--border)' }}>•</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  Founded {new Date(chapter.founded_date).getFullYear()}
                </span>
              </>
            )}
          </div>

          {/* University Info */}
          <div className="flex items-center gap-4 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <img
              src={chapter.universities?.logo_url || getCollegeLogoWithFallback(universityName)}
              alt={universityName}
              className="w-16 h-16 object-contain rounded-lg border"
              style={{ borderColor: 'var(--border)' }}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                <span className="font-semibold" style={{ color: 'var(--text)' }}>
                  {universityName}
                </span>
              </div>
              {chapter.universities?.conference && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {chapter.universities.conference}
                  {chapter.universities.division && ` • ${chapter.universities.division}`}
                </p>
              )}
            </div>
          </div>

          {/* Contact Information (if unlocked) */}
          {isUnlocked ? (
            <div className="space-y-4 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                Contact Information
              </h2>
              {chapter.contact_email && (
                <a
                  href={`mailto:${chapter.contact_email}`}
                  className="flex items-center gap-3 p-4 rounded-lg transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: 'var(--muted)',
                    color: 'var(--text)'
                  }}
                >
                  <Mail size={20} style={{ color: 'var(--brand)' }} />
                  <span>{chapter.contact_email}</span>
                  <ExternalLink size={16} className="ml-auto" style={{ color: 'var(--text-muted)' }} />
                </a>
              )}
              {chapter.phone && (
                <a
                  href={`tel:${chapter.phone}`}
                  className="flex items-center gap-3 p-4 rounded-lg transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: 'var(--muted)',
                    color: 'var(--text)'
                  }}
                >
                  <Phone size={20} style={{ color: 'var(--brand)' }} />
                  <span>{chapter.phone}</span>
                  <ExternalLink size={16} className="ml-auto" style={{ color: 'var(--text-muted)' }} />
                </a>
              )}
              {chapter.house_address && (
                <div
                  className="flex items-start gap-3 p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  <MapPin size={20} style={{ color: 'var(--brand)' }} className="mt-0.5" />
                  <span style={{ color: 'var(--text)' }}>{chapter.house_address}</span>
                </div>
              )}
            </div>
          ) : (
            /* Locked State */
            <div className="pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <div
                className="p-6 rounded-lg text-center space-y-4"
                style={{
                  backgroundColor: 'var(--muted)',
                  borderColor: 'var(--border)'
                }}
              >
                <Lock size={48} className="mx-auto" style={{ color: 'var(--text-muted)' }} />
                <p className="font-semibold" style={{ color: 'var(--text)' }}>
                  Unlock to view contact information
                </p>
                {onUnlock && (
                  <button
                    onClick={onUnlock}
                    className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                    style={{
                      backgroundColor: 'var(--brand)',
                      color: 'white'
                    }}
                  >
                    Unlock Chapter
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              Links
            </h2>
            <div className="flex flex-wrap gap-3">
              {chapter.instagram_handle && (
                <a
                  href={`https://instagram.com/${chapter.instagram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'var(--muted)',
                    color: 'var(--text)'
                  }}
                >
                  <Instagram size={18} />
                  <span>Instagram</span>
                  <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
                </a>
              )}
              {chapter.website && (
                <a
                  href={chapter.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'var(--muted)',
                    color: 'var(--text)'
                  }}
                >
                  <Globe size={18} />
                  <span>Website</span>
                  <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
                </a>
              )}
            </div>
          </div>

          {/* Bottom Action Button */}
          {!isUnlocked && onUnlock && (
            <div className="sticky bottom-0 pt-6 pb-4" style={{ backgroundColor: 'var(--surface)' }}>
              <button
                onClick={onUnlock}
                className="w-full py-4 rounded-lg font-semibold text-lg transition-all hover:scale-[1.02] shadow-lg"
                style={{
                  backgroundColor: 'var(--brand)',
                  color: 'white'
                }}
              >
                Unlock Full Access
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
