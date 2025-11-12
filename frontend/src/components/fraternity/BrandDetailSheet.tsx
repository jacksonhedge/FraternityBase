/**
 * BrandDetailSheet Component
 * Immersive full-screen modal with brand details
 */

import { useEffect, useRef, useState } from 'react';
import { X, Heart, ExternalLink, Star } from 'lucide-react';
import { Brand } from './BrandCard';

interface BrandDetailSheetProps {
  brand: Brand | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleBookmark?: (id: string, isBookmarked: boolean) => void;
  isBookmarked?: boolean;
}

export default function BrandDetailSheet({
  brand,
  isOpen,
  onClose,
  onToggleBookmark,
  isBookmarked = false
}: BrandDetailSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  // Sync bookmarked state with prop
  useEffect(() => {
    setBookmarked(isBookmarked);
  }, [isBookmarked]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      const focusableElements = sheetRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [isOpen, brand]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleBookmarkClick = () => {
    if (!brand || !onToggleBookmark) return;
    const newState = !bookmarked;
    setBookmarked(newState);
    onToggleBookmark(brand.id, newState);
  };

  if (!isOpen || !brand) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'var(--overlay)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={handleBackdropClick}
    >
      {/* Sheet Container */}
      <div
        ref={sheetRef}
        className="relative w-full h-full max-w-3xl mx-auto overflow-hidden animate-slide-in"
        style={{
          backgroundColor: 'var(--bg)',
          animation: 'slideIn 0.3s cubic-bezier(0.2, 1.0, 0.2, 1.0)'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-title"
      >
        {/* Header Bar */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-opacity-10 transition-standard"
            style={{ backgroundColor: 'transparent' }}
            aria-label="Close"
          >
            <X size={24} style={{ color: 'var(--text)' }} />
          </button>

          <div className="flex items-center gap-2">
            {onToggleBookmark && (
              <button
                onClick={handleBookmarkClick}
                className="p-2 rounded-full transition-standard"
                style={{
                  backgroundColor: bookmarked ? 'var(--brand)' : 'transparent'
                }}
                aria-label={bookmarked ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  size={20}
                  fill={bookmarked ? 'white' : 'none'}
                  style={{ color: bookmarked ? 'white' : 'var(--text-muted)' }}
                />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-[calc(100%-80px)] pb-24">
          {/* Hero Image */}
          <div
            className="relative w-full h-80 flex items-center justify-center"
            style={{ backgroundColor: 'var(--muted)' }}
          >
            {brand.logo_url ? (
              <img
                src={brand.logo_url}
                alt={`${brand.name} logo`}
                className="max-w-full max-h-full object-contain p-12"
              />
            ) : (
              <div
                className="text-8xl font-bold"
                style={{ color: 'var(--text-muted)' }}
              >
                {brand.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Featured or Pre-approved badge */}
            {brand.is_featured ? (
              <div
                className="absolute top-6 left-6 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%)',
                  color: 'white',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <Star size={16} fill="white" />
                Featured Partner
              </div>
            ) : brand.approval_status === 'approved' ? (
              <div
                className="absolute top-6 left-6 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--surface)',
                  color: 'var(--success)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <Star size={16} fill="currentColor" />
                Pre-approved
              </div>
            ) : null}
          </div>

          {/* Content Sections */}
          <div className="px-6 py-8 space-y-8">
            {/* Title and Category */}
            <div>
              <h1
                id="brand-title"
                className="text-3xl font-bold mb-2"
                style={{ color: 'var(--text)' }}
              >
                {brand.name}
              </h1>
              {brand.brand_industry && (
                <p
                  className="text-lg"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {brand.brand_industry}
                </p>
              )}
            </div>

            {/* Description */}
            {brand.description && (
              <div>
                <h2
                  className="text-xl font-semibold mb-3"
                  style={{ color: 'var(--text)' }}
                >
                  About
                </h2>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {brand.description}
                </p>
              </div>
            )}

            {/* Details Grid */}
            <div>
              <h2
                className="text-xl font-semibold mb-3"
                style={{ color: 'var(--text)' }}
              >
                Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {brand.brand_industry && (
                  <div
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: 'var(--surface)' }}
                  >
                    <div
                      className="text-sm font-medium mb-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Industry
                    </div>
                    <div
                      className="text-base font-semibold"
                      style={{ color: 'var(--text)' }}
                    >
                      {brand.brand_industry}
                    </div>
                  </div>
                )}

                {brand.approval_status && (
                  <div
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: 'var(--surface)' }}
                  >
                    <div
                      className="text-sm font-medium mb-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Status
                    </div>
                    <div
                      className="text-base font-semibold capitalize"
                      style={{ color: 'var(--text)' }}
                    >
                      {brand.approval_status}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Offers Section (Placeholder for future) */}
            <div>
              <h2
                className="text-xl font-semibold mb-3"
                style={{ color: 'var(--text)' }}
              >
                Available Opportunities
              </h2>
              <div
                className="p-8 rounded-lg text-center"
                style={{ backgroundColor: 'var(--surface)' }}
              >
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Offer details coming soon
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky CTA Button */}
        <div
          className="absolute bottom-0 left-0 right-0 p-6 border-t"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <button
            className="w-full py-4 rounded-full font-semibold text-base transition-standard hover:opacity-90"
            style={{
              backgroundColor: 'var(--brand)',
              color: 'white'
            }}
          >
            Express Interest
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.2, 1.0, 0.2, 1.0);
        }
      `}</style>
    </div>
  );
}
