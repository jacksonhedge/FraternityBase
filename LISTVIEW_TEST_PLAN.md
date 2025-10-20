# ListView Test Plan - /app/chapters

## 🎯 Test Objective
Verify that the ListView in `/app/chapters` displays all data correctly, is clickable, and functions properly compared to GridView.

---

## 📊 Test Coverage Areas

### 1. **Data Display Tests**

#### ✅ Column Headers
- [ ] Status column shows "Status" label
- [ ] Grade column shows "Grade" label
- [ ] Fraternity column shows "Fraternity" label
- [ ] University column shows "University" label
- [ ] Chapter column shows "Chapter" label
- [ ] Size column shows "Size" label
- [ ] President column shows "President" label
- [ ] Actions column shows "Actions" label

#### ✅ Row Data - Status Column (Column 1)
- [ ] **Locked chapters**: Shows lock icon + "Locked" badge (gray)
- [ ] **Coming Soon chapters**: Shows clock icon + "Coming [Date]" badge (blue)
- [ ] Dates format correctly using `toLocaleDateString()`
- [ ] Icons are properly sized (w-4 h-4)

#### ✅ Row Data - Grade Column (Column 2)
- [ ] **Grade ≥5.0**: Green background (bg-green-100 text-green-800)
- [ ] **Grade ≥4.0**: Yellow background (bg-yellow-100 text-yellow-800)
- [ ] **Grade ≥3.0**: Orange background (bg-orange-100 text-orange-800)
- [ ] **Grade <3.0**: Gray background (bg-gray-100 text-gray-600)
- [ ] **No grade**: Shows dash "-" in gray
- [ ] Grade displays with 1 decimal place (e.g., "4.5")

#### ✅ Row Data - Fraternity Column (Column 3)
- [ ] Fraternity name displays correctly (e.g., "Sigma Chi")
- [ ] Chapter name displays below in smaller gray text
- [ ] Falls back to "-" if no data

#### ✅ Row Data - University Column (Column 4)
- [ ] University logo displays (w-10 h-10 rounded-lg)
- [ ] Logo uses fallback if missing: `getCollegeLogoWithFallback()`
- [ ] University name displays to the right of logo
- [ ] State abbreviation displays below name in gray
- [ ] Logo and text aligned properly with flex gap-3

#### ✅ Row Data - Chapter Column (Column 5)
- [ ] Founded year displays (e.g., "Founded 1855")
- [ ] House address displays below in gray
- [ ] Falls back to "-" if no data
- [ ] Founded date parses correctly using `new Date().getFullYear()`

#### ✅ Row Data - Size Column (Column 6)
- [ ] Shows "50+ members" (hardcoded for now)
- [ ] Large font for number (text-lg font-semibold)
- [ ] Small gray text for "members" label

#### ✅ Row Data - President Column (Column 7)
- [ ] **Unlocked chapters**: Shows "Contact Unlocked" (green text)
  - [ ] Sub-text: "View chapter details"
- [ ] **Locked chapters**: Shows "Contact Locked" (gray text)
  - [ ] Sub-text: "Unlock to view"

#### ✅ Row Data - Actions Column (Column 8)
- [ ] "View Details" link displays
- [ ] Unlock icon shows next to text
- [ ] Link styled in primary blue color
- [ ] Link navigates to `/app/chapters/${chapter.id}`

---

### 2. **Clickability & Interaction Tests**

#### ✅ Row Hover Effects
- [ ] Row has `hover:bg-gray-50` on hover
- [ ] Hover effect applies to entire row
- [ ] No visual glitches or flickering

#### ✅ "View Details" Link
- [ ] Clicking navigates to chapter detail page
- [ ] URL is correct: `/app/chapters/${chapter.id}`
- [ ] Opens in same tab (not new window)
- [ ] Navigation works from both locked and unlocked chapters

#### ✅ Entire Row Clickability (if implemented)
- [ ] Check if entire row is clickable or just the "View Details" link
- [ ] Ensure click behavior is consistent

---

### 3. **Data Integrity Tests**

#### ✅ Loading State
- [ ] Shows "Loading chapters..." when `loading === true`
- [ ] Loading message spans all 8 columns (colSpan={8})
- [ ] Loading message is centered

#### ✅ Empty State
- [ ] Shows "No chapters found" when `filteredChapters.length === 0`
- [ ] Empty message spans all 8 columns
- [ ] Empty message is centered

#### ✅ Data Filtering
- [ ] Only shows **fraternities** (not sororities)
- [ ] Filters are applied correctly from search term
- [ ] State filter works correctly
- [ ] Sort by grade/name/university works correctly

---

### 4. **Visual Comparison: ListView vs GridView**

| Element | GridView | ListView | Match? |
|---------|----------|----------|--------|
| Fraternity name | ✅ Shows | ✅ Shows | |
| University logo | ✅ Shows | ✅ Shows | |
| Grade badge | ✅ Shows | ✅ Shows | |
| Status (locked/unlocked) | ✅ Shows as badge | ✅ Shows in column | |
| Coming soon date | ✅ Shows as badge | ✅ Shows in column | |
| Founded year | ✅ Shows | ✅ Shows | |
| House address | ✅ Shows | ✅ Shows | |
| Instagram link | ✅ Shows | ❌ Not in table | Different |
| Request Intro button | ✅ Shows (4.0+) | ❌ Not in table | Different |
| View Details link | ✅ Entire card | ✅ Action column | Different |

**Expected Differences:**
- GridView: Instagram handles and "Request Intro" buttons are visible in cards
- ListView: Focused on tabular data, interaction features in detail page

---

### 5. **Responsive Design Tests**

#### ✅ Table Container
- [ ] Table is scrollable horizontally on mobile (overflow-x-auto)
- [ ] All columns visible with horizontal scroll
- [ ] White background and shadow applied (bg-white rounded-lg shadow-sm)

#### ✅ Mobile Experience
- [ ] Table doesn't break layout on small screens
- [ ] Text is readable at all screen sizes
- [ ] Padding is appropriate (px-6 py-4 for cells)

---

### 6. **Logo Fallback Tests**

#### ✅ Missing Logo Handling
- [ ] Uses `getCollegeLogoWithFallback()` when logo_url is null/empty
- [ ] Fallback displays university initials or placeholder
- [ ] Fallback matches same size (w-10 h-10)
- [ ] No broken image icons appear

**Priority Missing Logos** (Universities with conference data):
- Stanford University
- University of Notre Dame
- Northwestern University
- (See full list below)

---

### 7. **Performance Tests**

#### ✅ Rendering Performance
- [ ] Table renders smoothly with all chapters loaded
- [ ] No lag when scrolling through rows
- [ ] Filtering/sorting is instant

#### ✅ Data Loading
- [ ] Chapters load within 2 seconds
- [ ] No duplicate API calls
- [ ] Error handling works if API fails

---

## 🧪 Manual Testing Steps

### Test 1: Basic Display
1. Navigate to `/app/chapters`
2. Switch to ListView using the List icon button
3. Verify all 8 columns display with headers
4. Scroll through at least 10 rows
5. Check that all data fields populate correctly

### Test 2: Status Badges
1. Find a locked chapter → Verify gray "Locked" badge
2. Find a chapter with `coming_soon_date` → Verify blue "Coming [Date]" badge
3. Verify date format is readable (e.g., "12/25/2025")

### Test 3: Grade Colors
1. Find chapter with grade ≥5.0 → Should be green
2. Find chapter with grade 4.0-4.9 → Should be yellow
3. Find chapter with grade 3.0-3.9 → Should be orange
4. Find chapter with grade <3.0 → Should be gray
5. Find chapter with no grade → Should show "-"

### Test 4: University Logos
1. Check if USC logo appears (should be missing based on earlier investigation)
2. Verify fallback logo displays for missing logos
3. Check that logos are sized consistently (w-10 h-10)

### Test 5: Clickability
1. Hover over a row → Verify light gray background appears
2. Click "View Details" → Should navigate to chapter detail page
3. Verify URL changes to `/app/chapters/{id}`
4. Use browser back button → Should return to ListView

### Test 6: Filtering & Sorting
1. Type in search box → Verify table filters in real-time
2. Change sort to "Name" → Verify alphabetical order
3. Change sort to "University" → Verify university alphabetical order
4. Change sort to "Grade" → Verify descending grade order (default)
5. Select a state filter → Verify only chapters from that state show

### Test 7: Empty State
1. Search for "ZZZZZZZ" (nonsense term)
2. Verify "No chapters found" message appears
3. Verify message is centered and spans all columns

### Test 8: Compare with GridView
1. Switch to GridView
2. Note down first 3 chapters visible
3. Switch back to ListView
4. Verify same 3 chapters appear with same data
5. Check that grades, names, universities match exactly

---

## 🐛 Known Issues to Check

Based on code review, verify these potential issues:

1. **Coming Soon Date Display**
   - File: `ChaptersPage.tsx:509`
   - Issue: Date formatting might show full date vs. shortened format
   - Test: Check if "Coming 12/25/2025" displays vs. "Coming Dec 25"

2. **University Logo Fallback**
   - File: `ChaptersPage.tsx:543`
   - Issue: 1,087 universities missing logos (94% of total!)
   - Test: Verify `getCollegeLogoWithFallback()` works for all missing logos

3. **President Column Content**
   - File: `ChaptersPage.tsx:562-573`
   - Issue: Shows "Contact Locked/Unlocked" but column header says "President"
   - Question: Should this show actual president name or unlock status?

4. **Hardcoded Member Count**
   - File: `ChaptersPage.tsx:558`
   - Shows: "50+ members" (hardcoded)
   - Test: Check if actual `chapter.member_count` should be used

---

## ✅ Success Criteria

ListView passes testing if:
- ✅ All 8 columns display correctly
- ✅ All data fields populate (or show "-" as fallback)
- ✅ Grade color coding matches specification
- ✅ Status badges (Locked/Coming Soon) display correctly
- ✅ "View Details" link navigates to correct page
- ✅ Hover effects work smoothly
- ✅ Filtering and sorting work identically to GridView
- ✅ No console errors appear
- ✅ Logo fallbacks work for missing images
- ✅ Responsive design works on mobile

---

## 📝 Testing Checklist

### Before Testing
- [ ] Ensure backend is running (`npm run dev` in backend folder)
- [ ] Ensure frontend is running (`npm run dev` in frontend folder)
- [ ] Clear browser cache and local storage
- [ ] Use Chrome DevTools to check for console errors

### During Testing
- [ ] Test in Chrome
- [ ] Test in Safari (if on Mac)
- [ ] Test on mobile device or responsive mode
- [ ] Check network tab for API call efficiency
- [ ] Monitor console for errors or warnings

### After Testing
- [ ] Document any bugs found
- [ ] Compare results with GridView
- [ ] Note any missing data or broken images
- [ ] Report any UX improvements needed

---

## 🔧 Quick Fixes Needed

If these issues are found, they need immediate fixes:

1. **Column Header Mismatch**: "President" column shows unlock status, not president name
2. **Logo Fallback**: Verify fallback works for 1,087 missing university logos
3. **Hardcoded Data**: Replace "50+ members" with actual `chapter.member_count || 'N/A'`

---

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________
Browser: ___________

| Test Area | Status | Notes |
|-----------|--------|-------|
| Data Display | ☐ Pass ☐ Fail | |
| Clickability | ☐ Pass ☐ Fail | |
| Status Badges | ☐ Pass ☐ Fail | |
| Grade Colors | ☐ Pass ☐ Fail | |
| University Logos | ☐ Pass ☐ Fail | |
| Filtering | ☐ Pass ☐ Fail | |
| Sorting | ☐ Pass ☐ Fail | |
| Responsive Design | ☐ Pass ☐ Fail | |

Overall Result: ☐ PASS ☐ FAIL

Issues Found:
1.
2.
3.
```
