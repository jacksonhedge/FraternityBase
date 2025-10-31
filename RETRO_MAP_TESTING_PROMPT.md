# 🎮 Retro CRT SuperMap - Testing Prompt for Chrome Claude

## Navigation Instructions
1. **Open the map**: Navigate to `http://localhost:5173/dashboard-map`
2. If you see a login page, sign in first, then return to `/dashboard-map`

---

## Testing Checklist

Please test the following features of the Retro CRT SuperMap and report what you observe:

### 🖥️ **Visual Aesthetics**
- [ ] **Black background**: Is the map background pure black with no map tiles visible?
- [ ] **Scanlines**: Do you see animated horizontal scanlines moving across the screen (like a CRT monitor)?
- [ ] **Neon state outlines**: Are all 48 mainland states outlined in different bright neon colors?
- [ ] **Glow effects**: Do the state boundaries have a glowing effect around them?

### 🗺️ **USA Overview (Initial View)**
- [ ] **48 States visible**: Confirm Alaska and Hawaii are NOT visible
- [ ] **Colorful borders**: Each state should have a unique neon color (cyan, magenta, yellow, pink, orange, etc.)
- [ ] **Hover effects**: When you hover over a state, does the border get thicker and glow brighter?
- [ ] **Tooltips**: When hovering, does the state name appear in a green retro-style tooltip?

### 📊 **Right Side Info Boxes**
In USA view, check the two stacked boxes on the right:

**Box 1 - SYSTEM STATUS:**
- [ ] Shows "STATES ONLINE: 48"
- [ ] Shows "COLLEGES TRACKED" count
- [ ] Shows "CHAPTERS ACTIVE" count
- [ ] Shows "USERS ACTIVE NOW" count
- [ ] Has a pulsing green "LIVE" indicator at the bottom

**Box 2 - NETWORK ACTIVITY:**
- [ ] Shows "TOTAL MEMBERS" count
- [ ] Shows "ORGANIZATIONS" count
- [ ] Shows "AVG CHAPTER SIZE"
- [ ] Shows "UPTIME: 99.8%"

### 📂 **Left Sidebar - Organizations**
- [ ] **Collapsed state**: See a vertical tab on the left edge showing "ORGANIZATIONS (X)"
- [ ] **Click to expand**: Click the tab - does the sidebar slide in smoothly from the left?
- [ ] **Organization list**: Do you see a list of Greek organizations with:
  - Organization names
  - Greek letters
  - Chapter counts
  - Green glowing borders on hover
- [ ] **Collapse**: Click the left arrow (←) - does it slide back out?

### 🎯 **State Click & Zoom**
Pick any state (try **California**, **Texas**, or **Florida** as they likely have data):

- [ ] **Smooth zoom**: When you click the state, does it smoothly zoom in over ~1.5 seconds?
- [ ] **State fills screen**: Does the selected state fill most of the viewport?
- [ ] **"RESET VIEW" button appears**: Top-right corner should show a green "RESET VIEW" button

### 📍 **State View - College Markers**
After clicking a state with data:

- [ ] **Cyan markers appear**: Do you see glowing cyan circular markers on the map?
- [ ] **Marker glow**: Do the markers have a cyan glow effect around them?
- [ ] **Hover effect**: When hovering a marker, does it grow larger and glow brighter?
- [ ] **Marker tooltips**: Does hovering show:
  - College name
  - Number of fraternities
  - Number of sororities
  - Total members

### 📊 **State View - Right Panel Changes**
After zooming to a state, the right boxes should change:

**Box 1 - STATE VIEW:**
- [ ] Title shows "[STATE NAME] - STATE VIEW"
- [ ] Shows number of colleges
- [ ] Shows total chapters
- [ ] Shows total members
- [ ] Shows average members per college

**Box 2 - COLLEGE LIST:**
- [ ] Shows "COLLEGES (X)" header
- [ ] Lists up to 10 college names
- [ ] If more than 10, shows "+ X more colleges..."
- [ ] Has cyan border and glow effect
- [ ] OR if no data: Shows "No college data available for this state"

### 🔄 **Reset Functionality**
- [ ] **Click "RESET VIEW"**: Does the map smoothly zoom back out to the full USA view?
- [ ] **Markers disappear**: Do the college markers vanish when zooming out?
- [ ] **Info boxes reset**: Do the right boxes return to showing SYSTEM STATUS and NETWORK ACTIVITY?
- [ ] **Button disappears**: Does "RESET VIEW" button hide when back in USA view?

### 🎨 **Header**
- [ ] **Title visible**: "GREEK LIFE COMMAND CENTER" at the top center
- [ ] **Subtitle**: "REAL-TIME MONITORING SYSTEM v2.5.1"
- [ ] **Green glow**: Header has green border with glow effect
- [ ] **Black background**: Header has semi-transparent black background

### 🕹️ **Map Controls**
Top-right corner (below or above RESET VIEW button):

- [ ] **Zoom In button** (+): Click to zoom in
- [ ] **Zoom Out button** (-): Click to zoom out
- [ ] **Buttons glow green**: Green borders with glow effects
- [ ] **Hover animation**: Buttons scale up slightly on hover

### 🎭 **CRT Effects**
- [ ] **Scanline animation**: Do the horizontal lines continuously scroll?
- [ ] **Screen flicker**: Very subtle pulsing/flickering effect?
- [ ] **Vignette**: Slightly darker corners (like old CRT screens)?
- [ ] **Retro feel**: Overall aesthetic feels like a 1980s computer terminal?

### ⚡ **Performance & Interactions**
- [ ] **Smooth animations**: All zooms, hovers, and transitions feel fluid?
- [ ] **No lag**: Hovering over states/markers responds instantly?
- [ ] **Scrollbar works**: Can scroll the college list smoothly?
- [ ] **Custom scrollbar**: Green-themed scrollbar in sidebar/college list?

---

## 🧪 Specific Test Scenarios

### **Scenario 1: Explore Multiple States**
1. Click California → Zoom in → See markers → Read tooltips
2. Click "RESET VIEW"
3. Click Texas → Zoom in → Compare data with California
4. Click "RESET VIEW"
5. Click Wyoming or Vermont (likely no data) → Confirm "No college data" message

**Expected**: Smooth transitions, different college counts, proper data displays

### **Scenario 2: Sidebar Interaction While Zoomed**
1. Zoom into any state
2. Open the left sidebar (organizations)
3. Scroll through the organization list
4. Close the sidebar
5. Click "RESET VIEW"

**Expected**: Sidebar works independently of map zoom state

### **Scenario 3: Rapid State Switching**
1. Click California (zoom in)
2. Immediately click "RESET VIEW"
3. Immediately click Florida
4. Immediately click "RESET VIEW"
5. Immediately click Texas

**Expected**: No errors, animations queue smoothly, no flickering

---

## 🐛 Bug Reporting Format

If you find any issues, report them like this:

**Issue**: [Brief description]
**Steps to reproduce**:
1. Step one
2. Step two
3. Step three

**Expected behavior**: [What should happen]
**Actual behavior**: [What actually happens]
**Screenshot**: [If applicable]

---

## ✅ Success Criteria

The map passes testing if:
- ✅ All 48 mainland states have unique neon colors
- ✅ Scanlines are visible and animating
- ✅ State click zooms smoothly with college markers appearing
- ✅ Info boxes update correctly between USA/State views
- ✅ Sidebar opens/closes smoothly
- ✅ "RESET VIEW" returns to USA view
- ✅ No console errors when clicking states
- ✅ Tooltips appear on hover for states and colleges
- ✅ Overall retro CRT aesthetic is present (glow, scanlines, monospace fonts)

---

## 🎯 Bonus Tests (Optional)

- [ ] **Try every state**: Click through all 48 states and note which have college data
- [ ] **Browser resize**: Resize the browser window - does the map adapt?
- [ ] **Zoom with scroll wheel**: Use mouse wheel to zoom - does it work?
- [ ] **Pan the map**: Click and drag to pan - does it work smoothly?
- [ ] **Mobile view** (if applicable): Does it work on smaller screens?

---

## 📝 Final Report Template

After testing, provide a summary:

```
RETRO CRT SUPERMAP - TEST REPORT
=================================

Date: [Date]
Browser: [Chrome/Edge/etc + Version]
Screen Resolution: [e.g., 1920x1080]

PASS/FAIL Summary:
- Visual Aesthetics: ✅/❌
- USA Overview: ✅/❌
- Right Info Boxes: ✅/❌
- Left Sidebar: ✅/❌
- State Zoom: ✅/❌
- College Markers: ✅/❌
- State View Panel: ✅/❌
- Reset Function: ✅/❌
- CRT Effects: ✅/❌
- Performance: ✅/❌

Overall Assessment: [PASS/FAIL/NEEDS WORK]

Notable Issues:
1. [Issue 1]
2. [Issue 2]
...

Highlights:
1. [What worked really well]
2. [What was impressive]
...

Suggestions:
1. [Optional improvement ideas]
2. [Enhancement suggestions]
...
```

---

**Ready to test!** Open `http://localhost:5173/dashboard-map` and work through this checklist. Report back with your findings! 🚀
