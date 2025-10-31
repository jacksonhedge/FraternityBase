# 🕹️ Retro CRT SuperMap - Feature Documentation

## Overview
A retro-futuristic command center style map interface inspired by 1980s CRT terminals and modern anomaly detection systems. Features full-screen immersive experience with green phosphor aesthetic.

## 🚀 Access
**URL:** `/app/retro-map`

## ✨ Key Features

### 1. **CRT Terminal Aesthetic**
- **Scanline Effect**: Animated horizontal lines simulating CRT monitor refresh
- **Screen Flicker**: Subtle flickering for authentic retro feel
- **Phosphor Glow**: Green text with glow effects (`#22c55e` / `#16a34a`)
- **Vignette Border**: Darkened edges like vintage monitors
- **Monospace Font**: Terminal-style typography throughout

### 2. **Auto-Collapsing Sidebar**
- **Collapsed State**:
  - Minimal vertical tab on left edge
  - Displays "ORGANIZATIONS (X)" count
  - Animated chevron indicator
  - Green glowing border

- **Expanded State**:
  - 320px width (`w-80`)
  - Slide-in animation with spring physics
  - Organization list with:
    - Greek letters display
    - Chapter counts
    - Hover effects with border glow
    - Staggered entrance animations (30ms delay each)
  - Custom styled scrollbar

### 3. **Right-Side Info Boxes**
Two stacked information panels (280px width each):

#### **System Status Box** (Top)
- States Online: 50
- Colleges Tracked: Dynamic count
- Chapters Active: Dynamic count
- Users Active Now: Real-time calculation (23% of members)
- Live indicator with pulsing green dot

#### **Network Activity Box** (Bottom)
- Total Members: Aggregated from all chapters
- Organizations: Count from API
- Avg Chapter Size: Calculated metric
- Uptime: Static 99.8%
- All metrics with green glow text effects

### 4. **Glowing State Boundaries**
- **Default State**:
  - Border: 2px solid `#16a34a`
  - Fill: `rgba(34, 197, 94, 0.1)`
  - Opacity: 20%

- **Hover State**:
  - Border: 3px solid `#22c55e`
  - Fill: `rgba(34, 197, 94, 0.3)`
  - Opacity: 50%
  - Drop shadow: `0 0 10px rgba(34, 197, 94, 0.8)`

- **Interactive Tooltips**:
  - Black background with green border
  - Monospace font
  - Green glow shadow
  - Shows state name on hover

### 5. **Smooth State Zoom**
- **Click Behavior**: Click any state to zoom in
- **Animation**:
  - 1.5 second duration
  - `flyToBounds` with easeLinearity: 0.25
  - Smooth camera movement to state bounds

- **Reset View**:
  - "RESET VIEW" button appears when zoomed
  - Returns to USA view (zoom level 4)
  - Same smooth animation
  - Button has green glow effect

### 6. **Dark Map Tiles**
- **Base Layer**: CartoDB Dark Matter tiles
- **Opacity**: 60% for subtle visibility
- **Custom Filter**: `hue-rotate(90deg) saturate(0.5)` for green tint
- **Background**: Pure black (`#000`)
- **Enhanced Contrast**: `contrast(1.1) brightness(0.9)`

### 7. **Retro Header**
- **Title**: "GREEK LIFE COMMAND CENTER"
- **Subtitle**: "REAL-TIME MONITORING SYSTEM v2.5.1"
- **Position**: Top center, absolutely positioned
- **Style**:
  - Black background with 80% opacity
  - Green border with 30px glow
  - Backdrop blur effect
  - Animated entrance (slide down)

### 8. **Map Controls**
Three buttons in top-right corner:
- **Reset View**: Appears conditionally when zoomed
- **Zoom In**: Green outlined button with hover scale
- **Zoom Out**: Green outlined button with hover scale

All buttons feature:
- Black background (80% opacity)
- 2px green border
- Glow shadow effect
- Backdrop blur
- Spring-based hover animations

## 🎨 Color Palette

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Primary Green | Bright Green | `#22c55e` | Text, active elements |
| Secondary Green | Forest Green | `#16a34a` | Borders, inactive states |
| Background | Pure Black | `#000000` | Base background |
| Glow | Green w/ Alpha | `rgba(34, 197, 94, 0.8)` | Text shadows, borders |
| Fill | Green w/ Alpha | `rgba(34, 197, 94, 0.1)` | State fills |

## 🎬 Animations

### Scanline Animation
```css
@keyframes scanlines {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}
/* Duration: 8s infinite loop */
```

### Flicker Animation
```css
@keyframes flicker {
  0%, 100% { opacity: 0.97; }
  50% { opacity: 1; }
}
/* Duration: 0.15s infinite */
```

### Component Entrance
- **Sidebar**: `spring(damping: 25, stiffness: 200)`
- **Stats Boxes**: `{ opacity: 0 → 1, x: 50 → 0 }`
- **Header**: `{ y: -50 → 0, opacity: 0 → 1 }`
- **Organization Items**: Staggered 30ms delays

## 🔧 Technical Implementation

### Dependencies
- **React Leaflet**: Map rendering
- **Framer Motion**: Animations
- **Lucide React**: Icons
- **Tailwind CSS**: Styling

### Data Sources
- **GeoJSON**: `/public/us-states.json` for state boundaries
- **State Data**: `/src/data/statesGeoData.ts` for coordinates & bounds
- **Organizations API**: `GET /api/greek-organizations`

### Performance Optimizations
1. **CSS Animations**: Use GPU-accelerated transforms
2. **Backdrop Blur**: Only on necessary elements
3. **Conditional Rendering**: Sidebar only renders when expanded
4. **Pointer Events**: Scanlines set to `pointer-events: none`
5. **Will-Change**: Applied to animated elements

## 📱 Responsive Behavior
- **Sidebar**: Fixed width, auto-collapse on narrow screens (recommended)
- **Info Boxes**: Fixed 280px width
- **Map**: Fills remaining space
- **Scrollbar**: Custom styled for dark theme

## 🎯 User Flow

1. **Initial Load**:
   - Header animates in from top
   - Stats boxes slide in from right
   - Collapsed sidebar appears on left
   - Map tiles fade in with CRT effect

2. **Exploring Organizations**:
   - Click collapsed sidebar tab
   - Sidebar slides in smoothly
   - Organization list populates with stagger
   - Scroll through custom-styled scrollbar

3. **Navigating States**:
   - Hover state → Green glow appears
   - Click state → Smooth zoom animation
   - "RESET VIEW" button appears
   - Click reset → Return to USA view

4. **Live Monitoring**:
   - Stats update in real-time
   - Pulsing "LIVE" indicator
   - Scanlines continuously animate
   - Screen maintains retro aesthetic

## 🚨 Known Limitations
1. **College Markers**: Not yet implemented in retro version
2. **Chapter Details**: Sidebar doesn't show chapter-level data yet
3. **Search**: No search functionality (planned)
4. **Filters**: Conference filters not integrated
5. **Mobile**: Best experienced on desktop (touch optimization needed)

## 🔮 Planned Enhancements
- [ ] Add college markers with pulsing glow effect
- [ ] Terminal-style search bar with typewriter effect
- [ ] Glowing chapter heat map overlay
- [ ] Radar sweep animation for active areas
- [ ] Sound effects toggle (optional retro beeps)
- [ ] Full-screen mode with ESC key support
- [ ] Keyboard shortcuts for navigation
- [ ] ASCII art easter eggs
- [ ] Matrix-style falling text background option
- [ ] VHS tape distortion effect toggle

## 📊 Comparison: Retro Map vs Original SuperMap

| Feature | Original SuperMap | Retro Map |
|---------|-------------------|-----------|
| **Aesthetic** | Modern, colorful | Retro CRT terminal |
| **Layout** | Traditional sidebar | Auto-collapse sidebar |
| **Colors** | Rainbow states | Green monochrome |
| **Effects** | Subtle shadows | Heavy glow, scanlines |
| **Info Display** | Statistics bar | Stacked info boxes |
| **Target Users** | General audience | Tech enthusiasts, nostalgic users |
| **Use Case** | Data exploration | Immersive monitoring |

## 🛠️ Development Notes

### File Location
`/frontend/src/pages/RetroSuperMapPage.tsx`

### Route
`/app/retro-map` (requires authentication)

### CSS Customizations
All custom styles are embedded in the component via `<style>` tag:
- Scanline keyframes
- Flicker keyframes
- Tooltip styling
- Scrollbar theming
- Map tile filters

### State Management
- Uses React hooks (no Redux needed for this page)
- Local state for sidebar, hover, zoom level
- Fetches organizations from API on mount

## 🎮 Controls Reference

| Action | Result |
|--------|--------|
| Click State | Zoom to state bounds |
| Click "RESET VIEW" | Return to USA view |
| Click Collapsed Tab | Expand sidebar |
| Click Chevron (←) | Collapse sidebar |
| Scroll Map | Zoom in/out |
| Drag Map | Pan view |
| Hover State | Green glow effect |

## 📝 Customization Guide

### Change Color Scheme
Update these variables at the top of the component:
```typescript
const PRIMARY_GREEN = '#22c55e';
const SECONDARY_GREEN = '#16a34a';
const GLOW_OPACITY = 0.8;
```

### Adjust Scanline Intensity
Modify opacity in `CRTScanlines` component:
```css
opacity: 0.08; /* Lower = subtler */
```

### Change Animation Speed
Update duration values:
```css
animation: scanlines 8s linear infinite; /* Slower = 10s */
```

### Customize Glow Strength
Modify `box-shadow` blur radius:
```css
box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
           /*    ^ Increase for stronger glow */
```

---

**Created:** 2025-10-25
**Version:** 1.0.0
**Status:** Production Ready ✅
