# 🗺️ TEST PROMPT 2: MAP VISUALS & FRATERNITY DATA

## Context
I'm testing the map feature to verify that:
1. Map loads and displays correctly
2. University markers appear in the right locations
3. Clicking markers shows fraternity/sorority data
4. Chapter information displays properly
5. Visual design and UX are smooth
6. Data is accurate and complete

## Test Instructions

### PART 1: Initial Map Load

**Navigate to Map:**
1. Go to http://localhost:5173
2. Login as jacksonfitzgerald25@gmail.com (if not already)
3. Click on "Map" tab in the navigation
4. Wait for map to fully load

**Visual Check:**
5. Verify the following:
   - [ ] Map canvas renders without errors
   - [ ] Base map tiles load (streets, terrain visible)
   - [ ] Map is centered on the United States
   - [ ] Zoom controls are visible and functional
   - [ ] No console errors (check browser dev tools)

**Markers Check:**
6. Look at the map and verify:
   - [ ] University markers appear as pins/dots
   - [ ] Markers are spread across the country (not clustered in one spot)
   - [ ] Marker colors/styles are consistent
   - [ ] Hovering over markers shows tooltip/preview (if implemented)

**Count markers:**
7. Zoom out to see the whole US
8. Estimate approximate number of markers visible: _____
9. Should see markers in multiple states (TX, CA, NY, IL, PA, etc.)

---

### PART 2: Major University Clusters

**Test Midwest (Big Ten):**
1. Zoom into the Midwest region
2. Find University of Michigan (Ann Arbor, MI)
3. Verify marker is present: [ ]
4. Find University of Illinois (Champaign, IL)
5. Verify marker is present: [ ]
6. Find Penn State (State College, PA)
7. Verify marker is present: [ ]

**Test Southeast (SEC):**
8. Zoom into the Southeast region
9. Find University of Alabama (Tuscaloosa, AL)
10. Verify marker is present: [ ]
11. Find University of Georgia (Athens, GA)
12. Verify marker is present: [ ]
13. Find University of Florida (Gainesville, FL)
14. Verify marker is present: [ ]

**Test West Coast (Pac-12):**
15. Zoom into California
16. Find USC (Los Angeles, CA)
17. Verify marker is present: [ ]
18. Find UCLA (Los Angeles, CA)
19. Verify marker is present: [ ]
20. Find Stanford (Stanford, CA)
21. Verify marker is present: [ ]

**Test East Coast (Ivy League):**
22. Zoom into Northeast region
23. Find Harvard (Cambridge, MA)
24. Verify marker is present: [ ]
25. Find Yale (New Haven, CT)
26. Verify marker is present: [ ]

---

### PART 3: Marker Interaction - University of Michigan

**Click on Michigan marker:**
1. Zoom into Michigan and find University of Michigan marker
2. Click on the marker
3. Verify what appears:
   - [ ] Popup/modal opens
   - [ ] University name shown: "University of Michigan"
   - [ ] State shown: "MI" or "Michigan"
   - [ ] List of fraternities/sororities appears
   - [ ] Chapter names are visible

**Verify Chapter Data:**
4. Look at the list of chapters displayed
5. Record how many chapters are shown: _____
6. For each chapter listed, verify you can see:
   - [ ] Greek organization name (e.g., "Sigma Chi", "Alpha Delta Phi")
   - [ ] Chapter name or designation
   - [ ] Star rating (if displayed)
   - [ ] Any status indicators (5-star, platinum, etc.)

**Check Chapter Details:**
7. Click on one of the chapters from the list
8. Verify chapter detail page/modal opens showing:
   - [ ] Chapter name
   - [ ] Star rating (e.g., "5.0⭐")
   - [ ] Officer information
   - [ ] Platinum badge (if applicable)
   - [ ] "View Details" or "Unlock" button

**Test Multiple Chapters:**
9. Go back to the Michigan marker popup
10. Click on 2-3 different chapters
11. Verify each opens correctly with unique data

---

### PART 4: Marker Interaction - University of Illinois

**Click on Illinois marker:**
1. Find University of Illinois (Champaign) marker
2. Click on the marker
3. Verify popup appears with:
   - [ ] University name: "University of Illinois"
   - [ ] List of chapters

**Verify Known Chapters:**
4. Look for these chapters that we know exist:
   - [ ] Alpha Delta Phi (5.0⭐ - if shows rating)
   - [ ] Sigma Chi (Kappa Kappa)
   - [ ] Other fraternities

**Compare with Universities Tab:**
5. Open a new tab or note the chapters shown
6. Go to "Universities" tab
7. Search for "University of Illinois"
8. Click on it
9. Compare chapter list with map popup
10. Verify they match: [ ]

---

### PART 5: Geographic Accuracy

**Test Known University Locations:**

Test these universities and verify they're in the correct geographic region:

**Southern Universities:**
1. University of Alabama → Should be in Alabama (Southeast)
   - [ ] Correct location

2. University of Texas → Should be in Texas (South/Central)
   - [ ] Correct location

**Midwest Universities:**
3. University of Michigan → Should be in Michigan (Upper Midwest)
   - [ ] Correct location

4. Ohio State → Should be in Ohio (Midwest)
   - [ ] Correct location

**West Coast Universities:**
5. USC → Should be in Los Angeles area
   - [ ] Correct location

6. University of Washington → Should be in Seattle area
   - [ ] Correct location

**East Coast Universities:**
7. Penn State → Should be in Pennsylvania
   - [ ] Correct location

8. Boston University → Should be in Massachusetts
   - [ ] Correct location

**Verify Spacing:**
9. Zoom to national view
10. Verify markers are NOT:
    - [ ] All clustered in one state
    - [ ] Overlapping in impossible ways
    - [ ] Located in oceans or outside US

---

### PART 6: Search/Filter on Map (If Available)

**Test search functionality:**
1. Look for search box on map view
2. If available, search for "Michigan"
3. Verify:
   - [ ] Map zooms to Michigan area
   - [ ] University of Michigan marker highlighted
   - [ ] Search results show relevant universities

**Test filters (if available):**
4. Look for filter options (state, region, chapter type)
5. If available, try filtering by:
   - State (e.g., "California")
   - Organization type (Fraternity vs Sorority)
   - Star rating (5-star only)
6. Verify markers update based on filters: [ ]

---

### PART 7: Visual Design & UX

**Marker Design:**
1. Examine the marker pins/dots
2. Rate the following:
   - [ ] Colors are distinct and easy to see
   - [ ] Size is appropriate (not too small/large)
   - [ ] Style matches the app theme
   - [ ] Markers don't obscure each other too much

**Popup Design:**
2. Click on several markers
3. Rate the popup/modal design:
   - [ ] Information is clearly organized
   - [ ] Text is readable
   - [ ] Lists are easy to scan
   - [ ] Click targets are appropriately sized
   - [ ] Popup closes easily

**Map Controls:**
4. Test zoom controls:
   - [ ] Zoom in (+) works smoothly
   - [ ] Zoom out (-) works smoothly
   - [ ] Mouse wheel zoom works (if enabled)
   - [ ] Pinch zoom works on touch devices (if applicable)

**Pan/Drag:**
5. Click and drag the map
6. Verify:
   - [ ] Map pans smoothly
   - [ ] No lag or stuttering
   - [ ] Markers stay in correct positions

**Performance:**
7. With many markers visible:
   - [ ] Map still loads quickly
   - [ ] No significant lag when panning/zooming
   - [ ] Popups open without delay
   - [ ] Browser doesn't freeze or slow down

---

### PART 8: Data Completeness Check

**Sample 10 Universities:**
1. Click on 10 different university markers across the country
2. For each one, check:
   - [ ] Has at least 1 chapter listed
   - [ ] Chapter names are not "null" or "undefined"
   - [ ] University name displays correctly
   - [ ] No broken images or missing data

**Record findings:**
- Universities with data: _____ / 10
- Universities with no chapters: _____ / 10
- Universities with display errors: _____ / 10

**Check Empty States:**
3. Find a university marker with 0 chapters (if any exist)
4. Click on it
5. Verify it shows:
   - [ ] University name still appears
   - [ ] Message like "No chapters available" or similar
   - [ ] Doesn't show errors or crash

---

### PART 9: Cross-Feature Integration

**From Map to Chapter Details:**
1. Click on University of Michigan marker
2. Click on a 5.0⭐ chapter
3. Click "View Details" or similar button
4. Verify:
   - [ ] Chapter detail modal/page opens
   - [ ] All data loads correctly
   - [ ] Can unlock the chapter from here
   - [ ] Can navigate back to map

**From Universities Tab to Map:**
5. Go to "Universities" tab
6. Click on "University of Alabama"
7. Look for "View on Map" button or link (if implemented)
8. If available, click it
9. Verify:
   - [ ] Map tab opens
   - [ ] Zooms to Alabama
   - [ ] Alabama marker is highlighted/selected

---

### PART 10: Mobile Responsiveness (Optional)

**If testing on mobile or can resize browser:**
1. Resize browser to mobile width (375px)
2. Check map view:
   - [ ] Map still visible
   - [ ] Controls accessible
   - [ ] Markers clickable
   - [ ] Popups don't overflow screen
   - [ ] Navigation still works

---

## Expected Results Summary

### ✅ PASS Criteria:

**Map Rendering:**
- [ ] Map loads without errors
- [ ] Markers appear in correct geographic locations
- [ ] At least 100+ university markers visible
- [ ] Major universities all have markers

**Data Display:**
- [ ] University names display correctly
- [ ] Chapter lists appear when clicking markers
- [ ] Chapter data is accurate (matches Universities tab)
- [ ] No null/undefined values visible

**Interaction:**
- [ ] Markers are clickable
- [ ] Popups open reliably
- [ ] Chapter details accessible from map
- [ ] Pan/zoom works smoothly

**Visual Quality:**
- [ ] Clean, professional design
- [ ] Consistent styling
- [ ] Readable text
- [ ] Good color contrast

**Performance:**
- [ ] Map loads in < 3 seconds
- [ ] No lag when interacting
- [ ] Smooth panning/zooming
- [ ] No browser crashes

### ❌ FAIL Criteria:

- Map doesn't load or shows blank screen
- Markers in wrong locations (e.g., all in one state)
- Clicking markers shows no data
- Data doesn't match Universities tab
- Significant lag or performance issues
- Major universities missing (Michigan, Alabama, etc.)
- Popups don't close or work incorrectly

---

## Report Format

```
🗺️ MAP VISUALS & FRATERNITY DATA TEST REPORT
Date: [Date/Time]
Tester: Dev Chrome Agent

PART 1: Initial Load
- Map rendered: [PASS/FAIL]
- Markers visible: [YES/NO - Count: ___]
- Console errors: [NONE/LIST ERRORS]

PART 2: University Clusters
- Big Ten universities found: [___/3]
- SEC universities found: [___/3]
- Pac-12 universities found: [___/3]
- Ivy League universities found: [___/2]

PART 3: Michigan Marker Test
- Popup opens: [PASS/FAIL]
- Chapter data displays: [PASS/FAIL]
- Chapter count: _____
- Detail pages work: [PASS/FAIL]

PART 4: Illinois Marker Test
- Popup opens: [PASS/FAIL]
- Data matches Universities tab: [PASS/FAIL]

PART 5: Geographic Accuracy
- All markers in correct regions: [PASS/FAIL]
- No offshore/ocean markers: [PASS/FAIL]

PART 6: Search/Filter
- Search works: [PASS/FAIL/N/A]
- Filters work: [PASS/FAIL/N/A]

PART 7: UX Quality
- Marker design: [1-5 stars]
- Popup design: [1-5 stars]
- Performance: [1-5 stars]

PART 8: Data Completeness
- Universities with data: ___/10
- Empty states handled: [PASS/FAIL]

OVERALL RESULT: [PASS/FAIL]

Issues Found:
- [List any issues]

Screenshots/Evidence:
- [Describe what you see]

Recommendations:
- [Any suggestions for improvement]
```

---

## Notes for Tester

- The map may take 5-10 seconds to load initially
- Some universities may have more chapters than others
- If a marker doesn't work, try 2-3 others before reporting failure
- Check browser console (F12) for any errors
- Take screenshots of any visual issues
- Note any missing or incorrect data for specific universities
