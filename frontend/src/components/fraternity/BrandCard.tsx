/**
 * BrandCard Component
 * Minimal card in the grid (Airbnb aesthetic)
 */

import { Heart, Star, Sparkles } from 'lucide-react';
import { useState } from 'react';

export interface Brand {
  id: string;
  name: string;
  brand_industry?: string;
  description?: string;
  logo_url?: string;
  is_brand?: boolean;
  approval_status?: string;
  is_featured?: boolean;
}

interface BrandCardProps {
  brand: Brand;
  isBookmarked?: boolean;
  onOpen: (id: string) => void;
  onToggleBookmark?: (id: string, next: boolean) => void;
}

export default function BrandCard({
  brand,
  isBookmarked = false,
  onOpen,
  onToggleBookmark
}: BrandCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const newState = !bookmarked;
    setBookmarked(newState);
    onToggleBookmark?.(brand.id, newState);
  };

  const handleCardClick = () => {
    onOpen(brand.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(brand.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer transition-all duration-200"
      style={{
        transform: isHovered ? 'scale(1.01)' : 'scale(1)',
        boxShadow: isHovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        borderRadius: 'var(--radius-2xl)',
        backgroundColor: 'var(--surface)',
        overflow: 'hidden'
      }}
      aria-label={`View ${brand.name} details`}
    >
      {/* Logo/Image Container */}
      <div
        className="relative w-full aspect-square flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: 'var(--muted)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {brand.logo_url ? (
          <img
            src={brand.logo_url}
            alt={`${brand.name} logo`}
            className="w-full h-full object-contain p-8"
            loading="lazy"
          />
        ) : (
          // Placeholder with brand initial
          <div
            className="w-full h-full flex items-center justify-center text-6xl font-bold"
            style={{
              color: 'var(--text-muted)',
              background: `linear-gradient(135deg, var(--muted) 0%, var(--border) 100%)`
            }}
          >
            {brand.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Featured badge (priority over pre-approved) */}
        {brand.is_featured ? (
          <div
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
            style={{
              background: 'linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%)',
              color: 'white',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <Star size={12} fill="white" />
            Featured
          </div>
        ) : brand.approval_status === 'approved' ? (
          <div
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
            style={{
              backgroundColor: 'var(--surface)',
              color: 'var(--success)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Sparkles size={12} />
            Pre-approved
          </div>
        ) : null}

        {/* Bookmark button */}
        {onToggleBookmark && (
          <button
            onClick={handleBookmarkClick}
            className="absolute top-3 right-3 p-2 rounded-full transition-all"
            style={{
              backgroundColor: bookmarked ? 'var(--brand)' : 'var(--surface)',
              boxShadow: 'var(--shadow-sm)'
            }}
            aria-label={bookmarked ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={bookmarked}
          >
            <Heart
              size={18}
              fill={bookmarked ? 'white' : 'none'}
              style={{ color: bookmarked ? 'white' : 'var(--text-muted)' }}
            />
          </button>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Brand name (truncate to 1 line) */}
        <h3
          className="font-semibold text-base mb-1 truncate-1"
          style={{ color: 'var(--text)' }}
        >
          {brand.name}
        </h3>

        {/* Category */}
        {brand.brand_industry && (
          <p
            className="text-sm truncate-1 mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {brand.brand_industry}
          </p>
        )}

        {/* Bottom row: placeholder for future rating/price */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Star size={14} />
            <span className="text-sm">New</span>
          </div>
          {/* Future: Add offer pricing here */}
        </div>
      </div>
    </div>
  );
}
