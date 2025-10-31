# 🗺️ Retro CRT SuperMap - Technical Overview

## Quick Summary
A retro CRT terminal-style interactive map showing Greek life chapters across the mainland United States with neon-colored state outlines, college markers, and dynamic data visualization.

---

## 🎯 Core Features

### Visual Design
- **Retro CRT Aesthetic**: Black background, animated scanlines, green phosphor glow
- **Neon State Outlines**: Each of 48 mainland states has unique bright color (cyan, magenta, yellow, pink, orange, purple, etc.)
- **No Map Tiles**: Pure state outlines on black background (no OpenStreetMap tiles)
- **Glowing Effects**: All UI elements have neon glow with drop-shadow filters

### Two View Modes

#### 1. USA Overview (Default)
- All 48 mainland states visible
- Each state outlined in unique neon color
- Hover: State border glows brighter
- Click: Smooth zoom to state view

#### 2. State View (After Clicking State)
- Zooms to selected state bounds
- Shows cyan glowing markers at college locations
- Right panel updates to state-specific stats
- RESET VIEW button appears to return to USA view

---

## 📂 File Structure

**Main Component**: `/frontend/src/pages/RetroSuperMapPage.tsx` (~800 lines)

**Key Sections**:
```
RetroSuperMapPage.tsx
├── Neon Color Palette (48 colors)
├── CRTScanlines Component
├── RetroStatsBox Component
├── CollapsedSidebar Component
├── ExpandedSidebar Component
├── MapControls Component
├── Main RetroSuperMapPage Component
    ├── State Management (viewMode, selectedStateData, organizations)
    ├── Data Fetching (GeoJSON, organizations)
    ├── Event Handlers (handleStateClick, resetView)
    ├── Rendering (Map, Markers, UI)
    └── Custom CSS (scanlines, glow effects)
```

---

## 🎨 Component Breakdown

### 1. **CRTScanlines**
Overlay component creating retro monitor effect:
- Horizontal scanlines (4px repeating gradient)
- Vertical grid lines
- Screen flicker animation
- Vignette darkening at edges

### 2. **RetroStatsBox**
Reusable info box with retro styling:
- Props: `title`, `stats[]`, `icon`
- Green glowing border (`#22c55e`)
- Monospace font
- Pulsing "LIVE" indicator
- Shows 4 stat rows

### 3. **CollapsedSidebar**
Minimal vertical tab on left edge:
- Shows "ORGANIZATIONS (X)"
- Vertical writing mode
- Click to expand

### 4. **ExpandedSidebar**
Full sidebar with organization list:
- 320px width (`w-80`)
- Slides in from left with spring animation
- Scrollable organization list
- Each org shows: name, Greek letters, chapter count
- Custom green-themed scrollbar

### 5. **MapControls**
Zoom controls in top-right corner:
- RESET VIEW button (conditional on `viewMode === 'state'`)
- Zoom In button
- Zoom Out button
- All with green glow styling

---

## 🔧 State Management

### Key State Variables
```typescript
const [statesData, setStatesData] = useState<any>(null); // GeoJSON data
const [viewMode, setViewMode] = useState<'usa' | 'state'>('usa');
const [selectedStateData, setSelectedStateData] = useState<SelectedState | null>(null);
const [hoveredState, setHoveredState] = useState<string | null>(null);
const [sidebarExpanded, setSidebarExpanded] = useState(false);
const [organizations, setOrganizations] = useState<any[]>([]);
const [stats, setStats] = useState({
  states: 48,
  colleges: 0,
  chapters: 0,
  members: 0,
  activeNow: 0
});
```

### SelectedState Interface
```typescript
interface SelectedState {
  name: string;           // "California"
  abbr: string;           // "CA"
  colleges: College[];    // Array of colleges in state
  totalChapters: number;  // Sum of fraternities + sororities
  totalMembers: number;   // Sum of all members
}
```

---

## 🗺️ Map Implementation

### Technology Stack
- **React-Leaflet**: Map rendering library
- **Leaflet.js**: Core mapping library
- **Framer Motion**: Animations
- **Tailwind CSS**: Styling

### GeoJSON Data
- **Source**: `/public/us-states.json`
- **Content**: US state boundary polygons
- **Loaded**: On component mount via fetch

### State Styling
```typescript
const stateStyle = (feature: any) => {
  const neonColor = getStateNeonColor(stateName);
  return {
    fillColor: 'transparent',     // No fill
    weight: isHovered ? 4 : 2.5,  // Border thickness
    opacity: 1,
    color: neonColor,             // Unique neon color per state
    fillOpacity: 0
  };
};
```

### College Markers (State View Only)
```typescript
{viewMode === 'state' && selectedStateData &&
  selectedStateData.colleges.map(college => (
    <CircleMarker
      center={[college.lat, college.lng]}
      radius={8}
      pathOptions={{
        fillColor: '#00ffff',  // Cyan
        color: '#00ffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.6
      }}
    />
  ))
}
```

---

## 📊 Data Flow

### 1. Initial Load
```
Component Mount
  ↓
Fetch us-states.json (GeoJSON)
  ↓
Fetch organizations from API
  ↓
Calculate stats from COLLEGE_LOCATIONS
  ↓
Render USA view with colored state outlines
```

### 2. State Click
```
User clicks state
  ↓
handleStateClick(stateName)
  ↓
Find state abbreviation (e.g., "CA")
  ↓
Filter colleges by state
  ↓
Calculate totals (chapters, members)
  ↓
Set selectedStateData
  ↓
flyToBounds to state
  ↓
setViewMode('state')
  ↓
Render: College markers + state info boxes
```

### 3. Reset View
```
User clicks RESET VIEW
  ↓
resetView()
  ↓
flyTo USA center coordinates
  ↓
setViewMode('usa')
  ↓
setSelectedStateData(null)
  ↓
Render: USA overview + system stats
```

---

## 🎨 Color System

### Neon Palette (48 Colors)
```javascript
const NEON_COLORS = [
  '#00ffff', // Cyan
  '#ff00ff', // Magenta
  '#ffff00', // Yellow
  '#00ff00', // Lime Green
  '#ff0080', // Hot Pink
  '#0080ff', // Electric Blue
  '#ff8000', // Orange
  // ... 41 more unique colors
];
```

### Assignment Strategy
- Each state gets unique color on first render
- Colors stored in `STATE_NEON_COLORS` object
- Round-robin if more than 48 states (shouldn't happen)

### UI Color Scheme
- **Primary**: Green (`#22c55e`) - Headers, main UI
- **Secondary**: Cyan (`#00ffff`) - College markers
- **Background**: Pure black (`#000`)
- **Text**: Monospace font, green/cyan tints

---

## 🎯 Right Panel Info Boxes

### USA View (2 Boxes)
**Box 1 - SYSTEM STATUS**:
```
STATES ONLINE: 48
COLLEGES TRACKED: 1,078
CHAPTERS ACTIVE: 30,963
USERS ACTIVE NOW: 324,760
```

**Box 2 - NETWORK ACTIVITY**:
```
TOTAL MEMBERS: 1,412,000
ORGANIZATIONS: [count]
AVG CHAPTER SIZE: 45
UPTIME: 99.8%
```

### State View (2 Boxes)
**Box 1 - [STATE NAME] - STATE VIEW**:
```
COLLEGES: [X]
TOTAL CHAPTERS: [Y]
TOTAL MEMBERS: [Z]
AVG MEMBERS/COLLEGE: [A]
```

**Box 2 - COLLEGE LIST**:
```
COLLEGES (X)
• University 1
• University 2
...
+ X more colleges...
```

---

## ⚡ Animation System

### Framer Motion Configs
```typescript
SPRING_CONFIGS = {
  snappy: { damping: 30, stiffness: 400 }
}
```

### Key Animations
1. **State Zoom**: 1.5s `flyToBounds` with easing
2. **Sidebar Slide**: Spring physics (damping: 25, stiffness: 200)
3. **Marker Hover**: Scale from 8px → 12px
4. **Button Hover**: Scale 1.0 → 1.1
5. **Scanlines**: Infinite 8s linear scroll

---

## 🔍 Event Handlers

### State Interactions
```typescript
onEachState = (feature, layer) => {
  layer.on({
    mouseover: () => {
      setHoveredState(stateName);
      layer.setStyle({ weight: 4 }); // Thicker border
    },
    mouseout: () => {
      setHoveredState(null);
      layer.setStyle({ weight: 2.5 }); // Normal border
    },
    click: () => handleStateClick(stateName)
  });
};
```

### College Marker Interactions
```typescript
eventHandlers={{
  mouseover: (e) => {
    e.target.setRadius(12);  // Grow
    e.target.setStyle({ fillOpacity: 0.9 }); // Brighter
  },
  mouseout: (e) => {
    e.target.setRadius(8);   // Shrink
    e.target.setStyle({ fillOpacity: 0.6 }); // Dimmer
  }
}}
```

---

## 📍 Coordinates & Bounds

### USA Center
```typescript
center: [39.8283, -98.5795]  // Geographic center of mainland US
zoom: 4.2
```

### State Bounds (Example: California)
```typescript
STATE_BOUNDS.CA = {
  north: 42.0095,
  south: 32.5343,
  west: -124.4096,
  east: -114.1312
}
```

### Zoom Behavior
```typescript
mapRef.current.flyToBounds(
  [[bounds.south, bounds.west], [bounds.north, bounds.east]],
  { duration: 1.5, easeLinearity: 0.25, padding: [50, 50] }
);
```

---

## 🎨 CSS Effects

### Scanline Animation
```css
@keyframes scanlines {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}
/* Duration: 8s infinite */
```

### Neon Glow (States)
```css
path.leaflet-interactive {
  filter: drop-shadow(0 0 8px currentColor)
          drop-shadow(0 0 4px currentColor);
}
path.leaflet-interactive:hover {
  filter: drop-shadow(0 0 15px currentColor)
          drop-shadow(0 0 8px currentColor)
          drop-shadow(0 0 4px currentColor);
}
```

### Retro Tooltips
```css
.retro-tooltip {
  background: rgba(0, 0, 0, 0.9) !important;
  border: 2px solid #22c55e !important;
  color: #22c55e !important;
  font-family: 'Courier New', monospace !important;
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.6) !important;
  text-shadow: 0 0 6px rgba(34, 197, 94, 0.8) !important;
}
```

---

## 🔧 Performance Optimizations

1. **No Tile Loading**: Removed OpenStreetMap tiles = faster load
2. **Coordinate Filtering**: Only render markers with valid lat/lng
3. **Conditional Rendering**: Markers only in state view
4. **GPU Acceleration**: CSS transforms for animations
5. **Array Validation**: Prevent crashes on API failures

---

## 🚀 How to Add New Features

### Example: Add "Ambassador" Toggle

**Step 1**: Add state variable
```typescript
const [showAmbassadors, setShowAmbassadors] = useState(false);
```

**Step 2**: Add toggle button
```typescript
<button onClick={() => setShowAmbassadors(!showAmbassadors)}>
  {showAmbassadors ? 'Hide' : 'Show'} Ambassadors
</button>
```

**Step 3**: Add ambassador markers
```typescript
{viewMode === 'state' && showAmbassadors && ambassadors.map(amb => (
  <CircleMarker
    center={[amb.lat, amb.lng]}
    pathOptions={{ fillColor: '#ff00ff' }} // Different color
  />
))}
```

**Step 4**: Fetch ambassador data
```typescript
useEffect(() => {
  if (selectedStateData) {
    fetchAmbassadors(selectedStateData.abbr)
      .then(data => setAmbassadors(data));
  }
}, [selectedStateData]);
```

---

## 📁 Key Dependencies

```json
{
  "react-leaflet": "^5.0.0",
  "leaflet": "^1.9.4",
  "framer-motion": "^12.23.24",
  "lucide-react": "^0.544.0",
  "tailwindcss": "^3.x"
}
```

---

## 🔍 Debugging Tips

### Enable Debug Logs
Look for these console messages:
```
🗺️ State clicked: California Colleges: 50 ViewMode set to: state
📊 Render - viewMode: state selectedStateData: YES
```

### Common Issues
1. **Markers not showing**: Check `viewMode === 'state'` and `selectedStateData` exists
2. **Sidebar crash**: Verify `organizations` is an array
3. **RESET VIEW missing**: Check `viewMode === 'state'` is true
4. **State not zooming**: Verify `STATE_BOUNDS` has entry for clicked state

---

## 🎯 Next Enhancement: Add Ambassadors

**Goal**: Toggle between Colleges, Ambassadors, or Both in state view

**Suggested Implementation**:
1. Add radio buttons: "Colleges" | "Ambassadors" | "Both"
2. Fetch ambassadors for selected state
3. Render ambassador markers in different color (e.g., magenta)
4. Update info box to show ambassador count
5. Add ambassador tooltips with name/contact info

**Files to Modify**:
- `RetroSuperMapPage.tsx` - Add toggle state + ambassador rendering
- Create `fetchAmbassadors()` function
- Update right panel to show ambassador stats

---

## 📝 Code Style

- **TypeScript**: Strong typing, interfaces defined
- **Functional Components**: React hooks, no class components
- **Monospace Fonts**: `font-mono` class throughout
- **Tailwind Classes**: Utility-first styling
- **Comments**: Emoji prefixes for visual scanning (🗺️ 📊 🎨)

---

**Last Updated**: October 25, 2025
**Version**: 1.1.0
**Route**: `/dashboard-map` (public) or `/app/retro-map` (authenticated)
**Status**: Production Ready with Known Issues
