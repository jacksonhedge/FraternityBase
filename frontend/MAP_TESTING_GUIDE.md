# 🗺️ FraternityBase Map Testing & Debugging Guide

## 🎯 Quick Test: Florida State Click

### Expected Behavior
When you click on Florida, you should see:
1. **Sidebar slides in from left** with Florida state information
2. **27 colleges listed** in the sidebar (scrollable)
3. **State statistics** displayed:
   - "27 Colleges"
   - Total chapters count
   - Total members count
4. **Map zooms** to focus on Florida
5. **College markers** appear on the Florida map area

---

## 🧪 Complete Test Procedure

### Test 1: State Click (Florida Example)

#### Steps:
1. Open production site: https://fraternitybase.com/app/map
2. Ensure you're logged in
3. Click directly on **Florida** on the USA map

#### ✅ Success Criteria:
- [ ] Console shows: `🗺️ [MapPage - handleStateClick] State clicked: Florida`
- [ ] Console shows: `✅ [MapPage - handleStateClick] Found state abbreviation: FL`
- [ ] Console shows: `✅ [MapPage - handleStateClick] Loaded 27 colleges for FL`
- [ ] Sidebar appears from left side
- [ ] Header shows "Florida"
- [ ] Shows "27 Colleges" stat
- [ ] List shows all 27 FL colleges (scroll to verify)

#### 🔴 Failure Indicators:
- Sidebar doesn't appear
- Shows 0 colleges
- Console error about state abbreviation
- Map doesn't zoom
- Colleges list is empty

---

### Test 2: Verify Florida Colleges List

#### Expected 27 Colleges (in statesGeoData.ts):
1. Barry University
2. Bethune–Cookman University
3. Eckerd College
4. Edward Waters University
5. Embry-Riddle Aeronautical University
6. Flagler College
7. Florida A&M University
8. Florida Atlantic University
9. Florida Gulf Coast University
10. Florida Institute of Technology
11. Florida International University
12. Florida Southern College
13. **Florida State University** ⭐ (SEC, D1)
14. Jacksonville University
15. Lynn University
16. Nova Southeastern University
17. Palm Beach Atlantic University
18. Rollins College
19. Saint Leo University
20. Stetson University
21. University of Central Florida
22. **University of Florida** ⭐ (SEC, D1)
23. **University of Miami** ⭐ (ACC, D1)
24. University of North Florida
25. University of South Florida
26. University of Tampa
27. University of West Florida

#### Steps:
1. After clicking Florida, scroll through the sidebar list
2. Verify each college appears as a clickable card
3. Check that logos load (may have fallback icons)

---

### Test 3: College Click (University of Florida Example)

#### Steps:
1. Click Florida state
2. Wait for sidebar to load with 27 colleges
3. Find and click **"University of Florida"** in the list

#### ✅ Success Criteria:
- [ ] Console shows: `🎓 [MapPage] College clicked: University of Florida`
- [ ] Map zooms into University of Florida location
- [ ] View mode changes from 'state' to 'campus'
- [ ] Sidebar updates to show UF chapters
- [ ] Chapters load with fraternity names
- [ ] "Back to Florida" button appears at top

---

### Test 4: Chapter List Verification

#### Steps:
1. After clicking a college (e.g., University of Florida)
2. Examine the chapters list in the sidebar

#### ✅ Success Criteria:
- [ ] Chapters grouped by fraternity type (IFC, Panhellenic, etc.)
- [ ] Each chapter shows:
  - Fraternity/sorority name
  - Greek letters
  - Star rating (if available)
  - Member count
  - Lock icon (if locked) or "View Details" button
- [ ] Can scroll through all chapters

---

## 🐛 Debugging Checklist

### Issue: Sidebar Doesn't Appear After State Click

#### Check These:
1. **Browser Console Logs** - Look for:
   ```
   🗺️ [MapPage - handleStateClick] State clicked: Florida
   ```
   - If missing: State click event not firing
   - If present: Check next log

2. **State Abbreviation Resolution**:
   ```
   ✅ [MapPage - handleStateClick] Found state abbreviation: FL
   ```
   - If shows error: GeoJSON state name doesn't match lookup table
   - Check `getStateAbbr()` function

3. **College Loading**:
   ```
   ✅ [MapPage - handleStateClick] Loaded 27 colleges for FL
   ```
   - If shows 0 colleges: COLLEGE_LOCATIONS data missing for FL
   - If missing entirely: Code error in handleStateClick

4. **Sidebar State**:
   - Check React DevTools:
     - `selectedState` should be set with FL data
     - `showSidebar` should be `true`
     - `viewMode` should be `'state'`

5. **CSS/Animation Issues**:
   - Check if sidebar exists in DOM but is hidden
   - Look for `translate-x-0` class on sidebar div
   - Check z-index isn't being overridden

---

### Issue: Colleges List is Empty

#### Diagnostic Steps:

**Step 1: Verify Data File**
```bash
# Check if FL colleges exist in data file
grep "FL\":" /Users/jacksonfitzgerald/CollegeOrgNetwork/frontend/src/data/statesGeoData.ts | wc -l
# Should return 27
```

**Step 2: Check Console Logs**
Look for this pattern when clicking Florida:
```javascript
// Should see this in handleStateClick:
console.log(`✅ [MapPage - handleStateClick] Loaded ${collegesInState.length} colleges for FL`);
// Should show: Loaded 27 colleges for FL
```

**Step 3: Inspect selectedState Object**
Open React DevTools → Components → MapPageFullScreen
Check `selectedState` state value:
```javascript
{
  name: "Florida",
  abbr: "FL",
  colleges: [ /* should have 27 items */ ],
  totalChapters: [number],
  totalMembers: [number]
}
```

**Step 4: Check Filter Logic**
In MapPageFullScreen.tsx around line 589:
```typescript
let collegesInState = Object.entries(COLLEGE_LOCATIONS)
  .filter(([name, college]) => college.state === stateAbbr)
```
- Verify `stateAbbr === "FL"`
- Verify `COLLEGE_LOCATIONS` is imported correctly
- Check if any colleges in COLLEGE_LOCATIONS have `state: "FL"`

---

### Issue: Map Doesn't Zoom to State

#### Check:
1. **STATE_BOUNDS defined for FL**:
   ```typescript
   FL: [[24.396308, -87.634938], [31.000968, -80.031362]]
   ```

2. **mapRef exists**:
   - Check `mapRef.current` is not null
   - Leaflet map initialized

3. **fitBounds call**:
   ```javascript
   mapRef.current.fitBounds(bounds, {
     padding: [50, 50],
     animate: true,
     duration: 1.0
   });
   ```

---

### Issue: Colleges Show on Map But Not in Sidebar

#### Likely Causes:
1. **selectedState.colleges array is empty**
   - Data fetch failed
   - Filter logic excluding colleges

2. **Render condition failing**:
   ```tsx
   {selectedState && (
     <div className="...">
       {selectedState.colleges.map((college) => (
         /* College card */
       ))}
     </div>
   )}
   ```

3. **colleges.map() error**:
   - Check browser console for React errors
   - Verify each college has required fields (name, fraternities, etc.)

---

## 🔍 Production Debug Commands

### Open Browser Console (Production Site)

**Test 1: Check if COLLEGE_LOCATIONS data loaded**
```javascript
// In browser console on fraternitybase.com
console.log('FL Colleges:', Object.entries(window.COLLEGE_LOCATIONS || {})
  .filter(([name, data]) => data.state === 'FL')
  .length
);
// Should show: FL Colleges: 27
```

**Test 2: Monitor State Click**
```javascript
// Run before clicking Florida
console.log('Monitoring clicks...');
// Then click Florida and watch console
```

**Test 3: Check React State**
1. Install React DevTools extension
2. Go to Components tab
3. Find `MapPageFullScreen` component
4. Click Florida
5. Watch `selectedState` update in real-time

---

## 📊 Expected Console Output (Success)

When clicking Florida, you should see:
```
==================================================
🗺️ [MapPage - handleStateClick] State clicked: Florida
📍 [MapPage - handleStateClick] Current view mode: usa
✅ [MapPage - handleStateClick] Found state abbreviation: FL
✅ [MapPage - handleStateClick] Loaded 27 colleges for FL
📊 [MapPage - handleStateClick] Total chapters: [number], Total members: [number]
🎯 [MapPage - handleStateClick] Setting sidebar to show state view
==================================================
```

---

## 🚨 Common Errors & Solutions

### Error: "No state abbreviation found"
**Console**: `❌ [MapPage - handleStateClick] No state abbreviation found for: Florida`

**Solution**:
- Check `STATE_COORDINATES` object has "Florida" entry
- Verify spelling matches exactly (case-sensitive)
- File: `src/data/statesGeoData.ts`

---

### Error: College count is 0 but data exists
**Console**: `✅ [MapPage - handleStateClick] Loaded 0 colleges for FL`

**Solution**:
1. Check COLLEGE_LOCATIONS import:
   ```typescript
   import { STATE_COORDINATES, STATE_BOUNDS, COLLEGE_LOCATIONS } from '../data/statesGeoData';
   ```

2. Verify college objects have `state: "FL"` (not "Florida")

3. Check if build is stale:
   ```bash
   npm run build
   vercel --prod
   ```

---

### Error: Sidebar renders but is hidden

**Solution**:
1. Check `showSidebar` state is `true`
2. Verify CSS class: `translate-x-0` (shown) vs `-translate-x-full` (hidden)
3. Check z-index: should be `z-[1000]`
4. Look for conflicting CSS

---

## ✅ Full Test Script (Copy & Paste)

Run this test sequence:

1. **Open Production**: https://fraternitybase.com/app/map
2. **Open Browser Console**: F12 or Cmd+Option+J (Mac)
3. **Click Florida** on the map
4. **Verify Console Output**:
   - ✅ "State clicked: Florida"
   - ✅ "Found state abbreviation: FL"
   - ✅ "Loaded 27 colleges for FL"
5. **Verify UI**:
   - ✅ Sidebar slides in from left
   - ✅ Header shows "Florida"
   - ✅ Shows "27 Colleges"
   - ✅ College list is scrollable with 27 items
6. **Click College**: Click "University of Florida"
7. **Verify Chapter View**:
   - ✅ Map zooms to UF campus
   - ✅ Sidebar shows UF chapters
   - ✅ "Back to Florida" button appears
8. **Test Navigation**:
   - ✅ Click "Back to Florida" - returns to state view
   - ✅ Click "Back to USA Map" - returns to full USA view

---

## 📝 Report Template

If issues persist, gather this info:

```
**Issue**: [Describe what's not working]

**Steps to Reproduce**:
1.
2.
3.

**Console Output**:
[Paste console logs]

**Screenshots**:
[Attach screenshots]

**Browser**: [Chrome/Safari/Firefox + version]

**URL**: https://fraternitybase.com/app/map

**React DevTools State**:
- selectedState: [value]
- showSidebar: [true/false]
- viewMode: [usa/state/campus/chapter]
- selectedState.colleges.length: [number]
```

---

## 🎯 Quick Reference: Data Flow

```
User Clicks Florida
    ↓
handleStateClick(feature) called
    ↓
Gets state abbr: "FL"
    ↓
Filters COLLEGE_LOCATIONS where state === "FL"
    ↓
Creates selectedState object:
  {
    name: "Florida",
    abbr: "FL",
    colleges: [27 college objects],
    totalChapters: [sum],
    totalMembers: [sum]
  }
    ↓
Sets selectedState (React state)
Sets showSidebar = true
Sets viewMode = 'state'
    ↓
Sidebar renders with Florida data
Map zooms to Florida bounds
College markers show on map
```

---

## 🔧 Emergency Debug Mode

Add this to MapPageFullScreen.tsx temporarily for extra logging:

```typescript
// Add after handleStateClick is called
useEffect(() => {
  console.log('🔍 DEBUG selectedState:', selectedState);
  console.log('🔍 DEBUG showSidebar:', showSidebar);
  console.log('🔍 DEBUG viewMode:', viewMode);
  if (selectedState) {
    console.log('🔍 DEBUG colleges count:', selectedState.colleges?.length);
    console.log('🔍 DEBUG first 3 colleges:', selectedState.colleges?.slice(0, 3));
  }
}, [selectedState, showSidebar, viewMode]);
```

Then rebuild and check console.

---

## 📞 Next Steps

If Florida still shows 0 colleges:

1. **Verify Build**: Run `npm run build` and redeploy
2. **Check Import**: Ensure statesGeoData.ts is exporting COLLEGE_LOCATIONS
3. **Inspect Network**: Check if any API calls are failing
4. **Clear Cache**: Hard refresh (Cmd+Shift+R) or clear browser cache
5. **Check Filters**: Verify no division/conference filters are active

---

## 💡 Pro Tip

The map uses **hardcoded data** from `statesGeoData.ts`, not database queries, for showing colleges in state view. This means:

- ✅ Fast loading (no API calls)
- ✅ Works offline once loaded
- ⚠️ Must rebuild/redeploy for data changes
- ⚠️ COLLEGE_LOCATIONS must have `state: "FL"` exactly

File location: `/frontend/src/data/statesGeoData.ts`
Key data structure: Line 589 in MapPageFullScreen.tsx
