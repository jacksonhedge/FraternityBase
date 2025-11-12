/**
 * BrandGrid Component
 * Responsive grid with virtualization and infinite scroll
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import BrandCard, { Brand } from './BrandCard';

interface BrandGridProps {
  brands: Brand[];
  isLoading?: boolean;
  onOpen: (id: string) => void;
  onToggleBookmark?: (id: string, isBookmarked: boolean) => void;
  bookmarkedBrandIds?: Set<string>;
  emptyMessage?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

/**
 * Skeleton card for loading state
 */
function SkeletonCard() {
  return (
    <div
      className="animate-pulse"
      style={{
        borderRadius: 'var(--radius-2xl)',
        backgroundColor: 'var(--surface)',
        overflow: 'hidden'
      }}
    >
      {/* Image skeleton */}
      <div
        className="w-full aspect-square"
        style={{ backgroundColor: 'var(--muted)' }}
      />

      {/* Content skeleton */}
      <div className="p-4 space-y-2">
        <div
          className="h-5 rounded"
          style={{ backgroundColor: 'var(--muted)', width: '70%' }}
        />
        <div
          className="h-4 rounded"
          style={{ backgroundColor: 'var(--muted)', width: '50%' }}
        />
        <div className="flex items-center justify-between mt-2">
          <div
            className="h-4 rounded"
            style={{ backgroundColor: 'var(--muted)', width: '30%' }}
          />
        </div>
      </div>
    </div>
  );
}

export default function BrandGrid({
  brands,
  isLoading = false,
  onOpen,
  onToggleBookmark,
  bookmarkedBrandIds = new Set(),
  emptyMessage = 'No brands found',
  hasMore = false,
  onLoadMore
}: BrandGridProps) {
  const [displayCount, setDisplayCount] = useState(20);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Load more items when the sentinel comes into view
          if (displayCount < brands.length) {
            setDisplayCount((prev) => Math.min(prev + 20, brands.length));
          } else if (onLoadMore) {
            onLoadMore();
          }
        }
      },
      {
        rootMargin: '200px' // Start loading before reaching the bottom
      }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [displayCount, brands.length, hasMore, isLoading, onLoadMore]);

  // Reset display count when brands change (e.g., filter/search)
  useEffect(() => {
    setDisplayCount(20);
  }, [brands]);

  const visibleBrands = brands.slice(0, displayCount);

  // Empty state
  if (!isLoading && brands.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 px-4 text-center"
        style={{ color: 'var(--text-muted)' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: 'var(--muted)' }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <h3
          className="text-lg font-semibold mb-1"
          style={{ color: 'var(--text)' }}
        >
          {emptyMessage}
        </h3>
        <p className="text-sm max-w-sm">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Responsive Grid */}
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))'
        }}
      >
        {/* Render visible brands */}
        {visibleBrands.map((brand) => (
          <BrandCard
            key={brand.id}
            brand={brand}
            isBookmarked={bookmarkedBrandIds.has(brand.id)}
            onOpen={onOpen}
            onToggleBookmark={onToggleBookmark}
          />
        ))}

        {/* Skeleton loading cards */}
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))}
      </div>

      {/* Infinite scroll sentinel */}
      {(hasMore || displayCount < brands.length) && !isLoading && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          <div
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            Loading more...
          </div>
        </div>
      )}

      {/* Loading more indicator */}
      {isLoading && visibleBrands.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: 'var(--brand)' }}
          />
        </div>
      )}
    </div>
  );
}
