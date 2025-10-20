# 🗺️ Interactive Map System - Architecture Overview

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [File Structure](#file-structure)
4. [Component Breakdown](#component-breakdown)
5. [Data Flow](#data-flow)
6. [UI/UX Features](#uiux-features)
7. [State Management](#state-management)
8. [Subscription & Access Control](#subscription--access-control)
9. [API Integration](#api-integration)
10. [Styling & Animations](#styling--animations)
11. [Enhancement Opportunities](#enhancement-opportunities)

---

## System Overview

FraternityBase's interactive map is a multi-level zoom interface that allows users to explore Greek life chapters across the United States. The map has **three distinct view modes**:

1. **USA View** - Overview of all 50 states with college density indicators
2. **Campus View** - Zoomed into a specific college showing fraternity/sorority chapters
3. **Chapter View** - Detailed information about a specific chapter with unlock options

### Core Purpose
- Visualize Greek life presence across US colleges
- Enable geographic discovery of fraternities and sororities
- Monetize chapter data access through credit/subscription system
- Provide enterprise-level filtering capabilities (Big 10, D1/D2/D3, Power 5)

---

## Technology Stack

### Mapping Library
- **React-Leaflet** (v4.x) - React wrapper for Leaflet.js
- **Leaflet.js** (v1.9.4) - Open-source interactive map library
- **GeoJSON** - Geographic data format for US state boundaries

### UI Framework
- **React** (v18+) with TypeScript
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Icon library

### Data Sources
- **OpenStreetMap** - Street tiles (shown only in campus view)
- **US States GeoJSON** - State boundary polygons (`/public/us-states.json`)
- **Static Data** - College coordinates and Greek life stats (`statesGeoData.ts`)
- **API Data** - Real-time chapter and university data from backend

---

## File Structure

```
frontend/src/
├── pages/
│   ├── MapPage.tsx                    # Main interactive map (Leaflet-based)
│   ├── MapPageFullScreen.tsx          # Fullscreen version
│   └── ProductRoadmapPage.tsx         # Product roadmap (not map-related)
├── components/
│   ├── USMap.tsx                      # Static SVG US map (deprecated/alternative)
│   └── RoadmapAdmin.tsx               # Admin roadmap editor
├── data/
│   ├── statesGeoData.ts               # College locations & state coordinates
│   └── statesGeoData.ts.backup        # Backup of geographic data
├── utils/
│   └── collegeLogos.ts                # Logo URLs and initials generator
└── public/
    └── us-states.json                 # GeoJSON data for state polygons
```

---

## Component Breakdown

### 1. MapPage.tsx (Main Component)
**Location:** `/frontend/src/pages/MapPage.tsx`
**Lines:** 1536 total

#### Key Sub-Components

**a) MapControls** (lines 84-120)
- Zoom in/out buttons
- "Zoom to USA" button (shows when zoomed into state/campus)
- Fixed position in top-right corner

**b) CoordinateDisplay** (lines 148-173)
- Real-time lat/lng display as mouse moves
- Bottom-left corner
- Formatted to 3 decimal places

**c) CollegeLogo** (lines 123-145)
- Displays college logo from CDN or initials fallback
- Gradient background for initials (blue-500 to purple-600)
- Handles image load errors gracefully

**d) StateShape Component** (USMap.tsx - deprecated alternative)
- SVG-based static map
- Color-coded by college density
- Simpler implementation without Leaflet

#### Main Map Features

**State Layer (lines 1038-1044)**
```typescript
<GeoJSON
  data={statesData}
  style={styleState}
  onEachFeature={onEachState}
/>
```
- Renders US state boundaries from GeoJSON
- Hover effects (gray-400 → gray-500)
- Click to zoom to state and show colleges

**College Markers (lines 1047-1097)**
```typescript
<CircleMarker
  center={[college.lat, college.lng]}
  radius={8}
  fillColor="#8B5CF6" // Purple
  // Hover scales up to radius={18}
/>
```
- Purple circle markers (violet-600)
- Scale animation on hover
- Tooltips with fraternity/sorority counts

**Campus Chapter Markers (lines 1100-1159)**
```typescript
<CircleMarker
  fillColor={chapter.unlocked ? '#10B981' : '#8B5CF6'}
  // Green if unlocked, Purple if locked
  radius={10}
/>
```
- Green = Unlocked chapters (emerald-500)
- Purple = Locked chapters (violet-600)
- Shows cost to unlock in tooltip

---

## Data Flow

### 1. Initial Load Sequence

```
User loads MapPage
    ↓
Check session/subscription (useEffect #1, lines 199-306)
    ↓
Fetch universities from /api/admin/universities
    ↓
Fetch chapters from /api/chapters
    ↓
Aggregate data into realCollegeData state
    ↓
Load GeoJSON state boundaries from /public/us-states.json
    ↓
Render map with state polygons + college markers
```

### 2. User Interaction Flow

**State Click:**
```
User clicks California
    ↓
handleStateClick() (lines 510-543)
    ↓
Filter colleges by state abbreviation
    ↓
Zoom map to state bounds (STATE_BOUNDS['CA'])
    ↓
Show college markers for that state
    ↓
Open sidebar panel with college list
```

**College Click:**
```
User clicks "UCLA"
    ↓
handleCollegeClick() (lines 673-777)
    ↓
setViewMode('campus')
    ↓
Fetch chapters: /api/chapters?universityName=UCLA
    ↓
Map chapters with position offsets (circular pattern)
    ↓
Check hasEnterpriseAccess
    ↓
Set chapter.unlocked = hasEnterpriseAccess
    ↓
Zoom to campus level (zoom: 15)
    ↓
Show street map tiles (OpenStreetMap)
    ↓
Render chapter markers on map
```

**Chapter Click:**
```
User clicks chapter marker
    ↓
setViewMode('chapter')
    ↓
setSelectedChapter(chapter)
    ↓
Show chapter detail sidebar (lines 1380-1529)
    ↓
Display unlock options if locked
```

### 3. API Endpoints Used

| Endpoint | Purpose | When Called |
|----------|---------|-------------|
| `GET /api/balance` | Fetch subscription tier & enterprise status | On component mount (session check) |
| `GET /api/admin/universities` | Get all universities with lat/lng | On component mount |
| `GET /api/chapters` | Get all chapters globally | On component mount |
| `GET /api/chapters?universityName=X` | Get chapters for specific university | When college clicked |

---

## UI/UX Features

### 1. Three-Tier View System

**USA View** (zoom: 4)
- All 50 states visible
- Gray state polygons (gray-400)
- No street tiles
- Statistics bar at top

**Campus View** (zoom: 15)
- Single college campus
- OpenStreetMap street tiles visible
- Chapter markers in circular pattern
- Green/Purple color coding

**Chapter View** (sidebar only)
- Right sidebar panel (w-96)
- Chapter house photo placeholder
- Unlock options (Roster, Emails, Full Access)
- Officer information

### 2. Interactive Elements

**Markers:**
- **Hover Effects:** Scale from radius 8→18 (colleges) or 10→16 (chapters)
- **Glow Effect:** `drop-shadow(0 0 16px rgba(124, 58, 237, 0.8))`
- **Animations:** `markerFadeIn` (0.4s cubic-bezier bounce)

**Tooltips:**
- Custom styled white cards with shadow
- College: Shows frat/sorority count + member count
- Chapter: Shows name, member count, unlock cost
- `.college-tooltip` class with fade-in animation

**State Boundaries:**
- Default: Gray-400 fill, 50% opacity
- Hover: Gray-500 fill, 60% opacity, white border
- Click: Immediate style reset

### 3. Search Functionality (lines 609-638)

```typescript
handleSearch() {
  // 1. Search for state by name or abbreviation
  const stateMatch = Object.entries(STATE_COORDINATES).find(...)

  // 2. If found, zoom to state
  mapRef.current?.setView([data.lat, data.lng], 6)

  // 3. If no state, search for college
  const collegeMatch = Object.entries(collegeData).find(...)

  // 4. If found, zoom to college
  mapRef.current?.setView([data.lat, data.lng], 13)
}
```

**Features:**
- Case-insensitive search
- State abbreviation support (e.g., "CA")
- College name partial matching
- Enter key triggers search
- Clear button (X icon)

### 4. Filter System (lines 839-975)

**Available Filters:**
1. **Big 10** - Free, default
2. **My Chapters** - Enterprise only 🔒
3. **All D1** - Enterprise only 🔒
4. **All D2** - Enterprise only 🔒
5. **All D3** - Enterprise only 🔒
6. **Power 5** - Enterprise only 🔒

**Filter Behavior:**
- Free users see lock icon + overlay blocking access
- Enterprise users see "All Filters Unlocked" badge
- Active filter highlighted with blue background
- Locked filters show credit purchase modal

### 5. Organization Type Toggle (lines 848-870)

```typescript
<button
  onClick={() => setOrganizationType('fraternity')}
  className={organizationType === 'fraternity'
    ? 'bg-blue-600 text-white'
    : 'text-gray-600'
  }
>
  Fraternities
</button>
```

- Blue button for Fraternities
- Pink button for Sororities
- Refetches chapters when toggled in campus view

---

## State Management

### React State Variables

```typescript
const [statesData, setStatesData] = useState<any>(null);
// GeoJSON data for US state boundaries

const [selectedState, setSelectedState] = useState<SelectedState | null>(null);
// Currently selected state (shows sidebar)

const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
// Currently selected college (shows popup)

const [selectedChapter, setSelectedChapter] = useState<any>(null);
// Currently selected chapter (shows detail panel)

const [viewMode, setViewMode] = useState<'usa' | 'campus' | 'chapter'>('usa');
// Controls which view is active

const [campusChapters, setCampusChapters] = useState<any[]>([]);
// Chapters at selected campus

const [hasEnterpriseAccess, setHasEnterpriseAccess] = useState(false);
// Controls filter access + chapter unlock status

const [subscriptionTier, setSubscriptionTier] = useState<string>('trial');
// User's subscription tier (trial/monthly/enterprise)

const [realCollegeData, setRealCollegeData] = useState<any>({});
// API-fetched college data (replaces hardcoded COLLEGE_LOCATIONS)

const [activeFilter, setActiveFilter] = useState<'big10' | ...>('big10');
// Currently active college filter

const [organizationType, setOrganizationType] = useState<'fraternity' | 'sorority'>('fraternity');
// Which organization type to display

const [showLockOverlay, setShowLockOverlay] = useState(false);
// Modal blocking locked filters
```

### Ref Variables

```typescript
const mapRef = useRef<L.Map | null>(null);
// Leaflet map instance for programmatic control
```

---

## Subscription & Access Control

### Enterprise Detection Logic (lines 199-306)

```typescript
useEffect(() => {
  const checkSubscription = async () => {
    const response = await fetch(`${API_URL}/balance`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    });

    const data = await response.json();

    // Check 1: Is tier "enterprise"?
    const check1 = data.subscriptionTier === 'enterprise';

    // Check 2: Is tier "monthly"? (legacy)
    const check2 = data.subscriptionTier === 'monthly';

    // Check 3: Unlimited unlocks (-1)?
    const check3 = data.chapterUnlocksRemaining === -1;

    const isEnterprise = check1 || check2 || check3;
    setHasEnterpriseAccess(isEnterprise);
  };
}, [session]);
```

### Chapter Unlock Status (lines 720-742)

```typescript
const chaptersWithPositions = filteredChapters.map((chapter, index) => ({
  ...chapter,
  lat: collegeData.lat + (Math.cos(index * (Math.PI * 2 / data.data.length)) * 0.002),
  lng: collegeData.lng + (Math.sin(index * (Math.PI * 2 / data.data.length)) * 0.002),
  // ⬇️ KEY LOGIC ⬇️
  unlocked: hasEnterpriseAccess,  // Enterprise = auto-unlock
  cost: hasEnterpriseAccess ? 0 : 100  // Free for Enterprise, 100 credits otherwise
}));
```

### Lock Overlay Modal (lines 978-1011)

Shows when non-enterprise user clicks locked filter:
- Displays lock icon
- Shows filter name
- "Cancel" button → resets to Big 10
- "Add Credits" button → navigates to `/app/credits`

---

## API Integration

### Data Fetching Strategy

**1. Real College Data Fetch (lines 354-437)**
```typescript
useEffect(() => {
  const fetchRealCollegeData = async () => {
    // Fetch all universities
    const universitiesRes = await fetch(`${API_URL}/admin/universities`);
    const universitiesData = await universitiesRes.json();

    // Fetch all chapters
    const chaptersRes = await fetch(`${API_URL}/chapters`);
    const chaptersData = await chaptersRes.json();

    // Aggregate chapter counts per university
    universitiesData.data.forEach((uni) => {
      const uniChapters = chaptersData.data.filter(
        ch => ch.university_id === uni.id
      );

      collegeDataMap[uni.name] = {
        lat: uni.latitude || COLLEGE_LOCATIONS[uni.name]?.lat,
        lng: uni.longitude || COLLEGE_LOCATIONS[uni.name]?.lng,
        fraternities: fraternities.length,
        sororities: sororities.length,
        totalMembers: maleMembers + femaleMembers
      };
    });
  };
}, []);
```

**2. Campus Chapters Fetch (lines 693-777)**
```typescript
const handleCollegeClick = async (collegeName, collegeData) => {
  const response = await fetch(
    `${API_URL}/chapters?universityName=${encodeURIComponent(collegeName)}`
  );

  const data = await response.json();

  const filteredChapters = data.data.filter(
    chapter => chapter.greek_organizations?.organization_type === organizationType
  );

  setCampusChapters(chaptersWithPositions);
};
```

### Data Merging Strategy

**Fallback System:**
```typescript
const getCollegeData = () => {
  // Use real data if available, otherwise fall back to COLLEGE_LOCATIONS
  return Object.keys(realCollegeData).length > 0
    ? realCollegeData
    : COLLEGE_LOCATIONS;
};
```

This allows the map to work even if API fails by using hardcoded data from `statesGeoData.ts`.

---

## Styling & Animations

### CSS-in-JS Styles (lines 1537-1654)

**Custom Leaflet Tooltip Styling:**
```css
.leaflet-tooltip-clean {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.college-tooltip {
  border-radius: 12px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
  animation: fadeIn 0.2s ease-in-out;
}
```

**Marker Animations:**
```css
@keyframes markerFadeIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes markerFadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.5);
  }
}

/* Applied to markers */
.leaflet-interactive.leaflet-circle {
  animation: markerFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

**Hover Glow Effect:**
```css
.leaflet-interactive.leaflet-circle:hover {
  filter: drop-shadow(0 0 16px rgba(124, 58, 237, 0.8))
          drop-shadow(0 0 8px rgba(139, 92, 246, 0.6));
  animation: gentlePulse 2s infinite;
}

@keyframes gentlePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

### Tailwind Classes Used

**Gradients:**
- `bg-gradient-to-r from-blue-500 to-purple-600` - College logo backgrounds
- `bg-gradient-to-r from-purple-600 to-indigo-700` - Enterprise badge, chapter headers
- `bg-gradient-to-br from-purple-50 to-indigo-50` - Unlock card backgrounds

**Hover Effects:**
- `hover:bg-gray-50` - Button hover
- `hover:scale-[1.02]` - College card hover
- `hover:shadow-md` - Shadow on hover

**Transitions:**
- `transition-all` - Smooth property changes
- `transition-colors` - Color-only transitions
- `duration-200` - 200ms timing

---

## Enhancement Opportunities

### 1. Performance Optimizations

**Current Issues:**
- Re-fetches all chapters on every campus view
- No caching of API responses
- Heavy console logging (should be removed in production)

**Suggested Improvements:**
```typescript
// Add React Query for caching
import { useQuery } from '@tanstack/react-query';

const { data: chapters } = useQuery(
  ['chapters', collegeName],
  () => fetchChapters(collegeName),
  {
    staleTime: 5 * 60 * 1000,  // 5 minutes
    cacheTime: 10 * 60 * 1000  // 10 minutes
  }
);
```

### 2. User Experience Enhancements

**a) Clustering**
- Use marker clustering when zoomed out
- Prevents marker overlap in dense areas
- Library: `react-leaflet-cluster`

**b) Search Autocomplete**
```typescript
// Add fuzzy search with suggestions
import Fuse from 'fuse.js';

const fuse = new Fuse(collegeNames, {
  threshold: 0.3,
  keys: ['name']
});

const suggestions = fuse.search(searchQuery).slice(0, 5);
```

**c) Deep Linking**
```typescript
// Enable URL-based state sharing
// Example: /map/california/ucla/sigma-chi

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const state = params.get('state');
  const college = params.get('college');

  if (state) handleStateClick(stateData);
  if (college) handleCollegeClick(collegeData);
}, []);
```

**d) Mobile Optimizations**
- Add touch gesture support (pinch-to-zoom)
- Optimize marker sizes for mobile screens
- Implement bottom sheet instead of sidebar on mobile

### 3. Data Visualization

**a) Heatmap Layer**
```typescript
import { HeatmapLayer } from 'react-leaflet-heatmap-layer';

<HeatmapLayer
  points={colleges.map(c => [c.lat, c.lng, c.totalMembers])}
  longitudeExtractor={m => m[1]}
  latitudeExtractor={m => m[0]}
  intensityExtractor={m => m[2]}
/>
```

**b) Chapter Density Visualization**
- Color-code states by chapter density
- Add graduated symbol sizing for colleges

**c) Conference Overlay**
- Toggle to show Big 10, SEC, etc. boundaries
- Highlight conference schools

### 4. Advanced Filters

**a) Multi-Select Filters**
```typescript
const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['big10']));

// Allow: Big 10 + D1 simultaneously
```

**b) Custom Filters**
- Save custom filter combinations
- "My Favorites" filter
- "Recently Viewed" filter

**c) Advanced Search**
```typescript
interface SearchFilters {
  name: string;
  conference: string[];
  division: string[];
  memberRange: [number, number];
  state: string[];
}
```

### 5. Data Export Features

**a) Export Chapter List**
```typescript
const exportToPDF = () => {
  const pdf = new jsPDF();
  campusChapters.forEach((chapter, i) => {
    pdf.text(chapter.name, 10, 10 + (i * 10));
  });
  pdf.save(`${collegeName}-chapters.pdf`);
};
```

**b) Share Map View**
```typescript
const shareMapView = () => {
  const url = `${window.location.origin}/map?lat=${map.getCenter().lat}&lng=${map.getCenter().lng}&zoom=${map.getZoom()}`;
  navigator.clipboard.writeText(url);
};
```

### 6. Real-Time Features

**a) Live Member Counts**
- WebSocket connection for real-time updates
- Animated count-up when data changes

**b) Collaborative Viewing**
```typescript
// Show other users viewing the same map
const [activeViewers, setActiveViewers] = useState<User[]>([]);
```

### 7. Accessibility Improvements

**a) Keyboard Navigation**
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Escape') handleResetToUSA();
    if (e.key === 'Tab') focusNextMarker();
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

**b) Screen Reader Support**
- Add ARIA labels to markers
- Announce view mode changes
- Provide text alternative to map

### 8. Analytics Integration

**a) Track User Interactions**
```typescript
const trackMapEvent = (action: string, label: string) => {
  gtag('event', action, {
    event_category: 'Map',
    event_label: label
  });
};

// Usage
onClick={() => {
  handleCollegeClick(college);
  trackMapEvent('college_click', college.name);
}}
```

**b) Heatmap of Popular Colleges**
- Track which colleges are viewed most
- Highlight "trending" colleges

### 9. Chapter Detail Enhancements

**a) Photo Gallery**
- Chapter house photos
- Event photos
- Officer photos

**b) Social Media Integration**
- Embed Instagram feed
- Show recent Twitter posts
- Link to TikTok/YouTube

**c) Recruitment Timeline**
- Show rush calendar
- Event dates
- Application deadlines

### 10. Map Styling Options

**a) Theme Switching**
```typescript
const [mapTheme, setMapTheme] = useState<'light' | 'dark' | 'satellite'>('light');

const tileUrls = {
  light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  dark: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
};
```

**b) Custom Map Styles**
- Matching brand colors
- Custom state coloring
- Night mode

---

## Known Issues & Bugs

### 1. Performance Issues
- **Issue:** Map lags when showing 1000+ markers
- **Location:** lines 1100-1159 (campus chapter markers)
- **Fix:** Implement marker clustering or virtualization

### 2. Mobile Responsiveness
- **Issue:** Sidebar overlaps map on mobile
- **Location:** lines 1172-1235 (selected state panel)
- **Fix:** Convert to bottom sheet on mobile breakpoint

### 3. Search Limitations
- **Issue:** Search doesn't support partial matches well
- **Location:** lines 609-638 (handleSearch)
- **Fix:** Implement fuzzy search with Fuse.js

### 4. Hardcoded Data Fallback
- **Issue:** COLLEGE_LOCATIONS is outdated if not synced with DB
- **Location:** `/data/statesGeoData.ts`
- **Fix:** Remove hardcoded data, require API

### 5. Excessive Logging
- **Issue:** Console logs everywhere (debugging artifacts)
- **Location:** Throughout MapPage.tsx (lines 200-776)
- **Fix:** Remove or gate behind `DEBUG` environment variable

---

## API Endpoint Requirements

### Expected Backend Endpoints

1. **GET /api/balance**
   ```json
   {
     "subscriptionTier": "enterprise",
     "subscriptionStatus": "active",
     "chapterUnlocksRemaining": -1,
     "balanceCredits": 500
   }
   ```

2. **GET /api/admin/universities**
   ```json
   {
     "success": true,
     "data": [
       {
         "id": "uuid",
         "name": "UCLA",
         "latitude": 34.0689,
         "longitude": -118.4452,
         "state": "CA",
         "conference": "Pac-12"
       }
     ]
   }
   ```

3. **GET /api/chapters** (all chapters)
   ```json
   {
     "success": true,
     "data": [
       {
         "id": "uuid",
         "university_id": "uuid",
         "greek_organizations": {
           "name": "Sigma Chi",
           "organization_type": "fraternity"
         },
         "member_count": 85
       }
     ]
   }
   ```

4. **GET /api/chapters?universityName=UCLA** (campus-specific)
   ```json
   {
     "success": true,
     "data": [/* filtered chapters */]
   }
   ```

---

## Environment Variables

```bash
# Frontend .env
VITE_API_URL=http://localhost:3001/api  # Backend API base URL
```

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-leaflet": "^4.2.1",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.8"
  }
}
```

---

## Quick Start Guide for Enhancements

### 1. To Add a New Filter

```typescript
// Step 1: Add to activeFilter type (line 187)
const [activeFilter, setActiveFilter] = useState<'big10' | 'power5' | 'ivy-league'>('big10');

// Step 2: Add filter button (lines 839-975)
<button
  onClick={() => setActiveFilter('ivy-league')}
  className={activeFilter === 'ivy-league' ? 'bg-primary-600 text-white' : 'bg-white'}
>
  Ivy League
</button>

// Step 3: Filter logic in getCollegeData()
const filteredColleges = Object.entries(collegeData).filter(([name, data]) => {
  if (activeFilter === 'ivy-league') {
    return ['Harvard', 'Yale', 'Princeton', /* ... */].includes(name);
  }
  // ... other filters
});
```

### 2. To Change Marker Colors

```typescript
// College markers (line 1052)
fillColor="#8B5CF6"  // Change this hex code

// Unlocked chapters (line 1105)
fillColor={chapter.unlocked ? '#10B981' : '#8B5CF6'}
//                             ^^^^^^^^ Change green
//                                       ^^^^^^^^ Change purple
```

### 3. To Add New Map Layers

```typescript
// Add after line 1035
<TileLayer
  url="https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png"
  attribution='Transport tiles'
/>
```

### 4. To Customize Chapter Unlock Costs

```typescript
// Modify lines 727-730
unlocked: hasEnterpriseAccess,
cost: hasEnterpriseAccess
  ? 0
  : calculateChapterCost(chapter.grade)  // Custom pricing logic
```

---

## Summary

The FraternityBase map is a sophisticated, multi-level geographic exploration tool built with React-Leaflet. It combines real-time API data with static geographic information to create an interactive experience for discovering Greek life chapters across US colleges.

**Key Strengths:**
- ✅ Three-tier zoom system (USA → Campus → Chapter)
- ✅ Real-time data integration
- ✅ Subscription-based access control
- ✅ Smooth animations and hover effects
- ✅ Responsive design (with room for improvement)

**Key Weaknesses:**
- ❌ Performance issues with many markers
- ❌ Mobile experience needs work
- ❌ No caching/data persistence
- ❌ Excessive console logging
- ❌ Hardcoded data fallbacks

**Recommended Next Steps:**
1. Implement marker clustering for performance
2. Add React Query for data caching
3. Improve mobile responsiveness (bottom sheets)
4. Add deep linking for shareable map states
5. Remove console.log statements
6. Add comprehensive analytics tracking

---

**Last Updated:** October 17, 2025
**File Version:** 1.0
**Maintainer:** FraternityBase Engineering Team
