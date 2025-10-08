# Loading Screen Improvements Plan

## Overview
Currently, the loading screen may not display consistently while data is being fetched. This document outlines the improvements needed to ensure loading states properly reflect actual data loading.

## Issues Identified

### 1. MyUnlockedPage.tsx
- Loading state may complete before all data is fully rendered
- Multiple fetch operations but single loading state

### 2. ChaptersPage.tsx
- Two separate useEffect hooks fetching data independently
- Loading state only tracks the first fetch (chapters), not unlocked chapters
- Users may see incomplete data while unlocked status loads

### 3. Other Pages to Review
- MapPageFullScreen.tsx
- ChapterDetailPage.tsx
- MyChaptersPage.tsx

## Recommended Solutions

### Option 1: Promise.all Pattern
```typescript
useEffect(() => {
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchChapters(),
        fetchUnlockedChapters()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchAllData();
}, []);
```

### Option 2: Multiple Loading States
```typescript
const [loadingChapters, setLoadingChapters] = useState(true);
const [loadingUnlocked, setLoadingUnlocked] = useState(true);

const isLoading = loadingChapters || loadingUnlocked;

// Then use isLoading for your loading screen
```

### Option 3: React Query / SWR
Consider using a data fetching library like React Query or SWR for better loading state management:
- Automatic loading states
- Built-in error handling
- Caching
- Refetching on window focus

## Implementation Checklist

- [ ] Audit all pages with data fetching
- [ ] Identify pages with multiple fetch operations
- [ ] Choose appropriate loading pattern for each page
- [ ] Implement loading state improvements
- [ ] Test loading screens on slow connections (throttle in dev tools)
- [ ] Add skeleton loaders for better UX (optional)
- [ ] Add error states for failed fetches

## Pages Priority

1. **High Priority** (user-facing, multiple fetches):
   - ChaptersPage.tsx
   - MyUnlockedPage.tsx
   - ChapterDetailPage.tsx

2. **Medium Priority**:
   - MapPageFullScreen.tsx
   - MyChaptersPage.tsx

3. **Low Priority**:
   - Other pages with simpler data needs

## Testing

### How to Test Loading States
1. Open Chrome DevTools
2. Go to Network tab
3. Set throttling to "Slow 3G" or "Fast 3G"
4. Navigate to pages and verify:
   - Loading screen shows immediately
   - Loading screen stays visible until ALL data is loaded
   - No flickering or brief incomplete renders
   - Smooth transition from loading to content

### Edge Cases to Test
- No internet connection
- Failed API requests
- Empty data responses
- Partial data (some requests succeed, others fail)
- User navigates away during loading

## Next Steps

When ready to implement:
1. Start with ChaptersPage.tsx as it has the clearest issue
2. Create a reusable loading pattern
3. Apply to other pages consistently
4. Consider adding skeleton loaders for polish
