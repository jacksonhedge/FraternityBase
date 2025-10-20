# ListView Automated Test Plan - Chrome DevTools Agent

**Target URL:** `http://localhost:5173/app/chapters`
**Agent:** Claude ChromeDev MCP
**Objective:** Automated testing of ListView functionality, data display, and interactions

---

## 🤖 Chrome DevTools Agent Instructions

Execute these steps in sequence using the Chrome DevTools MCP tools.

---

## Phase 1: Initial Navigation & Setup

### Step 1: Navigate to Chapters Page
```
Tool: mcp__chrome-devtools__navigate_page
URL: http://localhost:5173/app/chapters
```

**Expected Result:** Page loads showing chapters (default GridView)

---

### Step 2: Take Initial Snapshot (GridView)
```
Tool: mcp__chrome-devtools__take_snapshot
```

**Verify:**
- [ ] Page shows "Browse Fraternities" header
- [ ] Stats cards display (4 cards: Chapters, Members, Avg Size, States)
- [ ] View toggle buttons present (List and Grid icons)
- [ ] Grid icon is highlighted (default view)
- [ ] Chapter cards displayed in grid layout

---

### Step 3: Switch to ListView
```
Tool: mcp__chrome-devtools__take_snapshot
# Find the List view button UID from snapshot
```

```
Tool: mcp__chrome-devtools__click
uid: [UID of List button from snapshot]
```

**Expected Result:** View switches from grid to table layout

---

### Step 4: Take ListView Snapshot
```
Tool: mcp__chrome-devtools__take_snapshot
```

**Verify:**
- [ ] Table is visible with 8 columns
- [ ] Column headers: Status, Grade, Fraternity, University, Chapter, Size, President, Actions
- [ ] Rows of data populate the table
- [ ] List button is now highlighted (active state)

---

## Phase 2: Table Structure Verification

### Step 5: Verify Table Headers
From the snapshot, identify and verify all 8 column headers:

1. **Status** - Lock/unlock status column
2. **Grade** - Chapter grade/rating column
3. **Fraternity** - Fraternity name column
4. **University** - University name with logo column
5. **Chapter** - Chapter details (founded, address) column
6. **Size** - Member count column
7. **President** - Contact status column
8. **Actions** - View details link column

**Check:**
- [ ] All 8 headers are present
- [ ] Headers are properly aligned
- [ ] Text is uppercase and gray-500 color

---

### Step 6: Verify First Row Data
From the snapshot, examine the first row and verify:

**Status Column:**
- [ ] Shows lock icon OR clock icon
- [ ] Shows "Locked" badge (gray) OR "Coming [Date]" badge (blue)
- [ ] Badge has proper styling (rounded, px-2 py-1)

**Grade Column:**
- [ ] Shows numeric grade (e.g., "5.0", "4.5") OR "-"
- [ ] Color coding:
  - Green background = 5.0+
  - Yellow background = 4.0-4.9
  - Orange background = 3.0-3.9
  - Gray background = <3.0
- [ ] Font is bold

**Fraternity Column:**
- [ ] Shows fraternity name in larger text
- [ ] Shows chapter name in smaller gray text below
- [ ] Text is left-aligned

**University Column:**
- [ ] Shows university logo (w-10 h-10, rounded)
- [ ] Shows university name to right of logo
- [ ] Shows state abbreviation below name in gray
- [ ] Logo and text aligned with gap-3

**Chapter Column:**
- [ ] Shows "Founded [YEAR]" in top line
- [ ] Shows house address in gray text below
- [ ] Shows "-" if no data

**Size Column:**
- [ ] Shows "50+" in large text
- [ ] Shows "members" in small gray text below

**President Column:**
- [ ] Shows "Contact Unlocked" (green) OR "Contact Locked" (gray)
- [ ] Shows sub-text: "View chapter details" or "Unlock to view"

**Actions Column:**
- [ ] Shows "View Details" link
- [ ] Shows unlock icon next to text
- [ ] Link is styled in primary blue color

---

## Phase 3: Interactive Testing

### Step 7: Test Row Hover Effect
```
Tool: mcp__chrome-devtools__hover
uid: [UID of a table row from snapshot]
```

```
Tool: mcp__chrome-devtools__take_screenshot
filePath: /Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/listview_row_hover.png
```

**Expected Result:**
- [ ] Row background changes to light gray (hover:bg-gray-50)
- [ ] Hover effect applies to entire row
- [ ] No flickering or visual glitches

---

### Step 8: Test "View Details" Link Click
```
Tool: mcp__chrome-devtools__take_snapshot
# Find "View Details" link UID from first row
```

```
Tool: mcp__chrome-devtools__click
uid: [UID of "View Details" link]
```

```
Tool: mcp__chrome-devtools__take_snapshot
```

**Expected Result:**
- [ ] Page navigates to `/app/chapters/[chapter-id]`
- [ ] Chapter detail page loads
- [ ] URL changes correctly
- [ ] No 404 errors

---

### Step 9: Navigate Back to Chapters List
```
Tool: mcp__chrome-devtools__navigate_page_history
navigate: back
```

```
Tool: mcp__chrome-devtools__take_snapshot
```

**Expected Result:**
- [ ] Returns to chapters page
- [ ] ListView is still active (not reset to GridView)
- [ ] Scroll position maintained (if applicable)

---

## Phase 4: Data Integrity Testing

### Step 10: Test Search Filter
```
Tool: mcp__chrome-devtools__take_snapshot
# Find search input UID
```

```
Tool: mcp__chrome-devtools__fill
uid: [UID of search input]
value: Sigma Chi
```

```
Tool: mcp__chrome-devtools__take_snapshot
```

**Expected Result:**
- [ ] Table filters to show only "Sigma Chi" chapters
- [ ] Filtering happens in real-time (no page reload)
- [ ] Filtered results show in table
- [ ] No "No chapters found" if Sigma Chi exists

---

### Step 11: Test Empty Search Results
```
Tool: mcp__chrome-devtools__fill
uid: [UID of search input]
value: ZZZZZZZZZ
```

```
Tool: mcp__chrome-devtools__take_snapshot
```

**Expected Result:**
- [ ] Table shows "No chapters found" message
- [ ] Message is centered and spans all 8 columns
- [ ] Search icon displayed above message

---

### Step 12: Clear Search Filter
```
Tool: mcp__chrome-devtools__fill
uid: [UID of search input]
value:
```

```
Tool: mcp__chrome-devtools__take_snapshot
```

**Expected Result:**
- [ ] All chapters display again
- [ ] Table repopulates with full dataset

---

### Step 13: Test Sort by Grade
```
Tool: mcp__chrome-devtools__take_snapshot
# Find sort dropdown UID
```

```
Tool: mcp__chrome-devtools__fill
uid: [UID of sort select]
value: grade
```

```
Tool: mcp__chrome-devtools__take_snapshot
```

**Expected Result:**
- [ ] Chapters sorted by grade (highest first)
- [ ] First row shows highest grade chapter
- [ ] Grades descend down the table

---

### Step 14: Test Sort by Name
```
Tool: mcp__chrome-devtools__fill
uid: [UID of sort select]
value: name
```

```
Tool: mcp__chrome-devtools__take_snapshot
```

**Expected Result:**
- [ ] Chapters sorted alphabetically by fraternity name
- [ ] Names in alphabetical order (A → Z)

---

### Step 15: Test Sort by University
```
Tool: mcp__chrome-devtools__fill
uid: [UID of sort select]
value: university
```

```
Tool: mcp__chrome-devtools__take_snapshot
```

**Expected Result:**
- [ ] Chapters sorted alphabetically by university name
- [ ] University names in alphabetical order

---

### Step 16: Test State Filter
```
Tool: mcp__chrome-devtools__take_snapshot
# Find state filter dropdown UID
```

```
Tool: mcp__chrome-devtools__fill
uid: [UID of state select]
value: CA
```

```
Tool: mcp__chrome-devtools__take_snapshot
```

**Expected Result:**
- [ ] Table shows only California chapters
- [ ] All visible rows show "CA" in University column
- [ ] Count of chapters decreases

---

### Step 17: Reset State Filter
```
Tool: mcp__chrome-devtools__fill
uid: [UID of state select]
value: all
```

```
Tool: mcp__chrome-devtools__take_snapshot
```

**Expected Result:**
- [ ] All states display again

---

## Phase 5: Visual & Console Testing

### Step 18: Check Console for Errors
```
Tool: mcp__chrome-devtools__list_console_messages
```

**Verify:**
- [ ] No JavaScript errors
- [ ] No 404 network errors
- [ ] No React warnings
- [ ] Debug logs show correct data (if present)

---

### Step 19: Check Network Requests
```
Tool: mcp__chrome-devtools__list_network_requests
```

**Verify:**
- [ ] `/api/chapters` request succeeded (200 OK)
- [ ] `/api/chapters/unlocked` request succeeded (200 OK)
- [ ] `/api/credits/balance` request succeeded (200 OK)
- [ ] No failed image requests (missing logos should use fallback)

---

### Step 20: Test Responsive Design (Mobile)
```
Tool: mcp__chrome-devtools__resize_page
width: 375
height: 667
```

```
Tool: mcp__chrome-devtools__take_screenshot
filePath: /Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/listview_mobile.png
```

**Expected Result:**
- [ ] Table has horizontal scroll (overflow-x-auto)
- [ ] All columns still accessible via scrolling
- [ ] Layout doesn't break
- [ ] Text remains readable

---

### Step 21: Test Responsive Design (Tablet)
```
Tool: mcp__chrome-devtools__resize_page
width: 768
height: 1024
```

```
Tool: mcp__chrome-devtools__take_screenshot
filePath: /Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/listview_tablet.png
```

**Expected Result:**
- [ ] Table fits better on tablet width
- [ ] Columns are more visible
- [ ] No horizontal scroll needed (or minimal)

---

### Step 22: Reset to Desktop View
```
Tool: mcp__chrome-devtools__resize_page
width: 1920
height: 1080
```

---

## Phase 6: Data-Specific Tests

### Step 23: Verify "Coming Soon" Badge
From the snapshot, find a chapter with `coming_soon_date` set:

**Verify:**
- [ ] Clock icon is visible (text-blue-500)
- [ ] Badge shows "Coming [Date]"
- [ ] Badge has blue background (bg-blue-50 text-blue-700)
- [ ] Date formats correctly using `toLocaleDateString()`

---

### Step 24: Verify Grade Color Coding
From the snapshot, find chapters with different grades:

**5.0+ Chapter (Green):**
- [ ] Background: bg-green-100
- [ ] Text: text-green-800
- [ ] Shows grade like "5.0"

**4.0-4.9 Chapter (Yellow):**
- [ ] Background: bg-yellow-100
- [ ] Text: text-yellow-800

**3.0-3.9 Chapter (Orange):**
- [ ] Background: bg-orange-100
- [ ] Text: text-orange-800

**<3.0 Chapter (Gray):**
- [ ] Background: bg-gray-100
- [ ] Text: text-gray-600

---

### Step 25: Verify University Logo Display
From the snapshot, check university logo column:

**For universities WITH logos:**
- [ ] Logo displays correctly (w-10 h-10)
- [ ] Logo is rounded (rounded-lg)
- [ ] Logo is object-contain (maintains aspect ratio)

**For universities WITHOUT logos:**
- [ ] Fallback logo displays (from `getCollegeLogoWithFallback()`)
- [ ] No broken image icon
- [ ] Fallback maintains same size (w-10 h-10)

---

## Phase 7: Comparison with GridView

### Step 26: Switch Back to GridView
```
Tool: mcp__chrome-devtools__take_snapshot
# Find Grid button UID
```

```
Tool: mcp__chrome-devtools__click
uid: [UID of Grid button]
```

```
Tool: mcp__chrome-devtools__take_snapshot
```

**Expected Result:**
- [ ] View switches from table to card grid
- [ ] Grid button is now highlighted
- [ ] Same chapters display in grid format

---

### Step 27: Compare Data Between Views
Compare first 3 chapters between ListView and GridView:

**Chapter 1:**
- [ ] Fraternity name matches
- [ ] University name matches
- [ ] Grade matches
- [ ] Status (locked/unlocked) matches

**Chapter 2:**
- [ ] Same data verification

**Chapter 3:**
- [ ] Same data verification

---

### Step 28: Take Final Screenshots
```
Tool: mcp__chrome-devtools__take_screenshot
filePath: /Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/gridview_final.png
```

```
Tool: mcp__chrome-devtools__click
uid: [UID of List button]
```

```
Tool: mcp__chrome-devtools__take_screenshot
filePath: /Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/listview_final.png
```

---

## 📊 Test Results Summary

After running all tests, compile results:

### ✅ Passed Tests
- [ ] Navigation to /app/chapters
- [ ] ListView toggle works
- [ ] All 8 columns display
- [ ] Row hover effects work
- [ ] "View Details" navigation works
- [ ] Search filter works
- [ ] Sort by grade/name/university works
- [ ] State filter works
- [ ] Empty state displays correctly
- [ ] Console has no errors
- [ ] Network requests succeed
- [ ] Responsive design works
- [ ] "Coming Soon" badges display
- [ ] Grade color coding correct
- [ ] University logos display or use fallback
- [ ] Data matches between ListView and GridView

### ❌ Failed Tests
*(Document any failures here)*

### ⚠️ Warnings/Issues
*(Document any non-critical issues here)*

---

## 🔧 Known Issues to Document

Based on code review, check for these specific issues:

1. **Hardcoded Member Count**
   - [ ] ListView shows "50+ members" for all chapters
   - **Expected:** Should use actual `chapter.member_count` from database

2. **Column Header Mismatch**
   - [ ] "President" column header
   - **Actual content:** Shows "Contact Unlocked/Locked" status
   - **Question:** Should this be renamed to "Contact Status"?

3. **Missing Logo Fallback**
   - [ ] 94% of universities (1,087 out of 1,157) missing logos
   - **Check:** Does `getCollegeLogoWithFallback()` work correctly?

4. **Instagram/Request Intro Missing**
   - [ ] GridView shows Instagram handles
   - [ ] GridView shows "Request an Intro" button
   - [ ] ListView does NOT show these features
   - **Question:** Is this intentional?

---

## 📁 Output Files

All screenshots should be saved to:
- `/Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/`

Files generated:
1. `listview_row_hover.png` - Row hover state
2. `listview_mobile.png` - Mobile responsive view
3. `listview_tablet.png` - Tablet responsive view
4. `gridview_final.png` - GridView for comparison
5. `listview_final.png` - ListView final state

---

## 🚀 Running the Tests

### Execute with ChromeDev Agent:

1. **Ensure both servers are running:**
   ```bash
   # Backend (terminal 1)
   cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
   npm run dev

   # Frontend (terminal 2)
   cd /Users/jacksonfitzgerald/CollegeOrgNetwork/frontend
   npm run dev
   ```

2. **Open Chrome DevTools MCP:**
   ```
   Ask Claude to execute this test plan using the chrome-devtools MCP tools
   ```

3. **Agent will execute all 28 test steps automatically**

4. **Review results and screenshots**

---

## ✅ Success Criteria

ListView passes if:
- All 28 test steps complete without errors
- All data displays correctly in table format
- All interactive elements work (click, hover, filter, sort)
- No console errors
- Network requests succeed
- Responsive design works on all screen sizes
- Data consistency between ListView and GridView
- Screenshots show proper styling and layout
