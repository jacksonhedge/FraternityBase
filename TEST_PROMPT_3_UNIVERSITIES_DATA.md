# 🎓 TEST PROMPT 3: UNIVERSITIES & COLLEGE DATA

## Context
I'm testing the Universities tab to verify that:
1. Major universities display correctly (Michigan, Alabama, Illinois, etc.)
2. Chapter data is complete and accurate
3. Search functionality works
4. Filtering works properly
5. Chapter details show all necessary information
6. Data quality is high across different universities

## Test Instructions

### PART 1: Universities List Load

**Navigate to Universities:**
1. Go to http://localhost:5173
2. Login as jacksonfitzgerald25@gmail.com (if not already)
3. Click on "Universities" tab in the navigation
4. Wait for university list to load

**Initial Visual Check:**
5. Verify the following:
   - [ ] Universities list displays
   - [ ] University cards/rows are visible
   - [ ] No loading errors
   - [ ] Search box is present
   - [ ] Filter options available (if implemented)

**Count universities:**
6. Scroll through the list
7. Estimate total universities shown: _____
8. Look for pagination or "Load More" button
9. Total universities available (from count/pagination): _____

**Check sorting:**
10. Verify universities are sorted:
    - [ ] Alphabetically by name
    - [ ] By state
    - [ ] By number of chapters
    - [ ] Other sorting (specify): _____

---

### PART 2: Major University Data - Big Ten

**University of Michigan:**
1. Search for "Michigan" or scroll to find "University of Michigan"
2. Verify university card shows:
   - [ ] Full name: "University of Michigan"
   - [ ] State: "MI" or "Michigan"
   - [ ] Chapter count (number shown): _____
   - [ ] University logo or icon (if available)

3. Click "View Details" or click on the university card
4. Verify chapter list appears with:
   - [ ] Multiple fraternities listed
   - [ ] Multiple sororities listed (if available)
   - [ ] Each chapter shows organization name
   - [ ] Each chapter shows star rating
   - [ ] Each chapter shows chapter designation/name

5. Look for specific well-known fraternities at Michigan:
   - [ ] Sigma Chi
   - [ ] Alpha Delta Phi
   - [ ] Phi Kappa Psi
   - [ ] Beta Theta Pi
   - [ ] Others: _____

6. Record total chapters at Michigan: _____

**University of Illinois:**
7. Search for "Illinois"
8. Find "University of Illinois" (or "University of Illinois at Urbana-Champaign")
9. Click on it
10. Verify chapters display, including:
    - [ ] Alpha Delta Phi (we know this exists - 5.0⭐)
    - [ ] Sigma Chi (Kappa Kappa)
    - [ ] Other fraternities

11. Click on "Alpha Delta Phi" chapter
12. Verify chapter details show:
    - [ ] Chapter name
    - [ ] Star rating: 5.0⭐
    - [ ] Platinum badge (if applicable)
    - [ ] Officer information (if unlocked)
    - [ ] "Unlock" button (if not unlocked)

13. Record total chapters at Illinois: _____

**Penn State:**
14. Search for "Penn State" or "Pennsylvania State University"
15. Click on it
16. Verify:
    - [ ] University name displays correctly
    - [ ] Located in PA
    - [ ] Has multiple chapters
    - [ ] Chapter data displays

17. Record total chapters at Penn State: _____

**Ohio State:**
18. Search for "Ohio State"
19. Click on it
20. Verify data displays correctly
21. Record total chapters: _____

---

### PART 3: Major University Data - SEC

**University of Alabama:**
1. Search for "Alabama"
2. Click on "University of Alabama"
3. Verify:
   - [ ] University name correct
   - [ ] State: Alabama or AL
   - [ ] Has chapters listed

4. Look for major Alabama fraternities:
   - [ ] Phi Delta Theta
   - [ ] Sigma Alpha Epsilon
   - [ ] Kappa Alpha
   - [ ] Others: _____

5. Record total chapters at Alabama: _____

**University of Georgia:**
6. Search for "Georgia"
7. Click on "University of Georgia"
8. Verify data displays
9. Record total chapters: _____

**Auburn University:**
10. Search for "Auburn"
11. Click on "Auburn University"
12. Verify:
    - [ ] Located in Alabama
    - [ ] Has chapters
    - [ ] Data displays correctly

13. Record total chapters: _____

**University of Florida:**
14. Search for "Florida"
15. Click on "University of Florida"
16. Verify data displays
17. Record total chapters: _____

---

### PART 4: Major University Data - Pac-12

**USC (University of Southern California):**
1. Search for "USC" or "Southern California"
2. Click on "University of Southern California"
3. Verify:
   - [ ] University name correct
   - [ ] State: California or CA
   - [ ] Located in Los Angeles area (if city shown)
   - [ ] Has chapters

4. Record total chapters at USC: _____

**UCLA:**
5. Search for "UCLA"
6. Click on it
7. Verify data displays
8. Record total chapters: _____

**Stanford University:**
9. Search for "Stanford"
10. Click on it
11. Verify data displays
12. Record total chapters: _____

**University of Washington:**
13. Search for "Washington"
14. Click on "University of Washington" (NOT Washington State)
15. Verify:
    - [ ] Located in Washington state
    - [ ] Has chapters
    - [ ] Data correct

16. Record total chapters: _____

---

### PART 5: Major University Data - Ivy League & East Coast

**Harvard University:**
1. Search for "Harvard"
2. Click on it
3. Verify:
   - [ ] University name: "Harvard University"
   - [ ] State: Massachusetts or MA
   - [ ] Located in Cambridge (if city shown)
   - [ ] Has chapters (even if fewer than state schools)

4. Record total chapters: _____

**Yale University:**
5. Search for "Yale"
6. Click on it
7. Verify data displays
8. Record total chapters: _____

**Princeton University:**
9. Search for "Princeton"
10. Click on it
11. Verify data displays
12. Record total chapters: _____

**Boston University:**
13. Search for "Boston University"
14. Click on it
15. Verify data displays
16. Record total chapters: _____

---

### PART 6: Chapter Detail Deep Dive

**Select University of Michigan:**
1. Go to University of Michigan's chapter list
2. Find a 5.0⭐ chapter (if available)
3. Click "View Details"

**Verify Chapter Detail Page Shows:**
4. Header Information:
   - [ ] Chapter name clearly displayed
   - [ ] Star rating (e.g., "5.0⭐")
   - [ ] University name
   - [ ] Platinum badge (if applicable)

5. Chapter Information:
   - [ ] Greek organization type (Fraternity/Sorority)
   - [ ] Founded date (if available)
   - [ ] Chapter designation (e.g., "Alpha Chapter", "Beta Beta")
   - [ ] Active status

6. Contact Information (if unlocked):
   - [ ] Officer names
   - [ ] Officer positions
   - [ ] Email addresses
   - [ ] Phone numbers (if available)
   - [ ] Social media links (if available)

7. Action Buttons:
   - [ ] "Unlock Full Chapter" button (if not unlocked)
   - [ ] "Unlock Officers" button (if officers locked)
   - [ ] "Request Warm Introduction" (if available)
   - [ ] "View on Map" (if available)

**Test 3 Different Chapters:**
8. Go back to Michigan
9. Click on 3 different chapters
10. For each, verify:
    - [ ] Unique data (not duplicate)
    - [ ] Correct star ratings
    - [ ] Proper unlock states
    - [ ] No missing fields

---

### PART 7: Search Functionality

**Test Search - University Names:**
1. In the Universities search box, type "Michigan"
2. Verify results show:
   - [ ] University of Michigan
   - [ ] Michigan State University
   - [ ] Other Michigan schools
   - [ ] NO non-Michigan schools

3. Clear search
4. Type "Alabama"
5. Verify results show:
   - [ ] University of Alabama
   - [ ] Auburn University (Auburn, AL)
   - [ ] Alabama A&M
   - [ ] Other Alabama schools

**Test Search - Partial Names:**
6. Type "Penn"
7. Verify results include:
   - [ ] Penn State
   - [ ] University of Pennsylvania
   - [ ] Other Penn schools

**Test Search - State Abbreviations:**
8. Type "CA"
9. Verify California schools appear: [ ]

10. Type "TX"
11. Verify Texas schools appear: [ ]

**Test Search - Clear/Reset:**
12. Type "XYZ" (invalid search)
13. Verify:
    - [ ] Shows "No results found" or similar
    - [ ] Doesn't crash
    - [ ] Can clear search and return to full list

---

### PART 8: Filtering (If Available)

**Filter by State:**
1. Look for state filter dropdown
2. If available, select "California"
3. Verify:
   - [ ] Only California schools shown
   - [ ] USC, UCLA, Stanford all appear
   - [ ] Non-CA schools hidden

4. Select "Michigan"
5. Verify only Michigan schools show: [ ]

**Filter by Chapter Count:**
6. If available, filter for "20+ chapters"
7. Verify:
   - [ ] Large schools like Michigan, Alabama show
   - [ ] Small schools filtered out

**Filter by Organization Type:**
8. If available, filter for "Fraternities Only"
9. Verify only fraternities display: [ ]

10. Filter for "Sororities Only"
11. Verify only sororities display: [ ]

**Combine Filters:**
12. Select state "Ohio" + "Fraternities Only"
13. Verify results match both criteria: [ ]

---

### PART 9: Data Quality Spot Checks

**Check 10 Random Universities:**
1. Click on 10 different universities from various states
2. For each, verify:
   - [ ] University name is NOT null/undefined
   - [ ] State is shown correctly
   - [ ] Chapter count matches actual chapters shown
   - [ ] At least 1 chapter exists (or shows "No chapters" message)
   - [ ] Chapters have valid names (not "undefined" or blank)

**Record findings:**
- Universities with complete data: _____ / 10
- Universities with missing/null fields: _____ / 10
- Universities with 0 chapters: _____ / 10

**Check Chapter Ratings:**
3. Across the universities you've viewed, verify:
   - [ ] Star ratings display as numbers (e.g., 5.0, 4.5, 3.7)
   - [ ] Ratings are between 0.0 and 5.0
   - [ ] No invalid ratings (negative, >5.0, null)

**Check Platinum Badges:**
4. Look for chapters marked as "Platinum"
5. Verify:
   - [ ] Platinum badge is visually distinct
   - [ ] Only high-rated chapters have it (4.5+ or 5.0)
   - [ ] Badge placement is consistent

---

### PART 10: Pagination & Loading

**Test Pagination (if applicable):**
1. If universities list is paginated, scroll to bottom
2. Click "Next Page" or "Load More"
3. Verify:
   - [ ] More universities load
   - [ ] No duplicates
   - [ ] Smooth loading (no errors)

**Test Infinite Scroll (if applicable):**
4. If infinite scroll enabled, scroll to bottom
5. Verify:
   - [ ] More universities load automatically
   - [ ] Loading indicator appears
   - [ ] No performance lag

**Test Large Lists:**
6. With full university list loaded:
   - [ ] Page doesn't freeze
   - [ ] Search still works
   - [ ] Clicking universities still works
   - [ ] No memory issues

---

### PART 11: Cross-Reference Check

**Compare Michigan Data Across Features:**
1. View University of Michigan in Universities tab
2. Note the chapters listed: _____
3. Go to Map tab
4. Click on Michigan marker
5. Note the chapters shown in map popup: _____
6. Verify both lists match: [ ]

**Compare Illinois Data:**
7. View University of Illinois in Universities tab
8. Note chapters, especially Alpha Delta Phi
9. Check if same chapters appear on map: [ ]

**Compare with Unlocked Data:**
10. If you've unlocked any Michigan chapters, verify:
    - [ ] Unlocked chapters show full data in Universities tab
    - [ ] Lock icons update to unlocked
    - [ ] Officer data is visible

---

### PART 12: Visual & UX Quality

**University Cards/Rows:**
1. Evaluate the design:
   - [ ] Clean, professional appearance
   - [ ] University names clearly readable
   - [ ] State/location easy to find
   - [ ] Chapter counts displayed prominently
   - [ ] Consistent spacing and alignment

**Chapter Lists:**
2. Within university detail view:
   - [ ] Chapters organized clearly (by type, alphabetically, etc.)
   - [ ] Star ratings visually prominent
   - [ ] Easy to distinguish between chapters
   - [ ] Click targets appropriately sized

**Detail Pages:**
3. Chapter detail pages:
   - [ ] Information hierarchy clear
   - [ ] Contact info well-formatted
   - [ ] Buttons/CTAs obvious
   - [ ] Mobile-friendly (if testing responsiveness)

**Loading States:**
4. When loading universities or chapters:
   - [ ] Loading spinner/indicator shown
   - [ ] No blank screens
   - [ ] Graceful loading (progressive enhancement)

---

## Expected Results Summary

### ✅ PASS Criteria:

**University Coverage:**
- [ ] All major Big Ten universities present (Michigan, Illinois, Penn State, Ohio State, etc.)
- [ ] All major SEC universities present (Alabama, Georgia, Auburn, Florida, etc.)
- [ ] All major Pac-12 universities present (USC, UCLA, Stanford, Washington, etc.)
- [ ] Major Ivy League universities present (Harvard, Yale, Princeton, etc.)
- [ ] At least 500+ total universities in database

**Data Quality:**
- [ ] University names spelled correctly
- [ ] States accurate
- [ ] Chapter counts match actual chapters
- [ ] Chapter names not null/undefined
- [ ] Star ratings valid (0.0-5.0)
- [ ] No major data gaps

**Functionality:**
- [ ] Search works for names, states, abbreviations
- [ ] Filters work (if implemented)
- [ ] Pagination/loading works
- [ ] Chapter details accessible
- [ ] Cross-feature consistency (map vs universities tab)

**UX Quality:**
- [ ] Professional, clean design
- [ ] Easy navigation
- [ ] Fast loading
- [ ] No errors or crashes

### ❌ FAIL Criteria:

- Major universities missing (Michigan, Alabama, etc.)
- Many universities have 0 chapters
- Null/undefined values visible
- Search doesn't work
- Data inconsistent between features
- Significant design/usability issues
- Frequent errors or crashes

---

## Report Format

```
🎓 UNIVERSITIES & COLLEGE DATA TEST REPORT
Date: [Date/Time]
Tester: Dev Chrome Agent

PART 1: Initial Load
- Universities displayed: [COUNT]
- Load time: [< 3sec / > 3sec]
- Errors: [NONE / LIST]

PART 2-5: Major Universities
Big Ten Coverage:
- Michigan chapters: [COUNT]
- Illinois chapters: [COUNT]
- Penn State chapters: [COUNT]
- Ohio State chapters: [COUNT]

SEC Coverage:
- Alabama chapters: [COUNT]
- Georgia chapters: [COUNT]
- Auburn chapters: [COUNT]
- Florida chapters: [COUNT]

Pac-12 Coverage:
- USC chapters: [COUNT]
- UCLA chapters: [COUNT]
- Stanford chapters: [COUNT]
- Washington chapters: [COUNT]

Ivy League Coverage:
- Harvard chapters: [COUNT]
- Yale chapters: [COUNT]
- Princeton chapters: [COUNT]

PART 6: Chapter Details
- Detail pages functional: [PASS/FAIL]
- All data fields present: [PASS/FAIL]
- Unique data per chapter: [PASS/FAIL]

PART 7: Search
- Name search: [PASS/FAIL]
- State search: [PASS/FAIL]
- Partial match: [PASS/FAIL]
- Invalid search handled: [PASS/FAIL]

PART 8: Filtering
- State filter: [PASS/FAIL/N/A]
- Chapter count filter: [PASS/FAIL/N/A]
- Org type filter: [PASS/FAIL/N/A]

PART 9: Data Quality
- Complete data: [___/10 universities]
- Valid ratings: [PASS/FAIL]
- Platinum badges correct: [PASS/FAIL]

PART 10: Pagination
- Works smoothly: [PASS/FAIL/N/A]
- No duplicates: [PASS/FAIL/N/A]

PART 11: Cross-Reference
- Map data matches: [PASS/FAIL]
- Consistency verified: [PASS/FAIL]

PART 12: UX Quality
- Visual design: [1-5 stars]
- Navigation ease: [1-5 stars]
- Performance: [1-5 stars]

OVERALL RESULT: [PASS/FAIL]

Issues Found:
- [List specific issues]

Missing Universities:
- [List any expected universities not found]

Data Issues:
- [List universities with missing/incorrect data]

Recommendations:
- [Suggestions for improvement]
```

---

## Notes for Tester

- Focus on well-known universities first (Michigan, Alabama, etc.)
- Note exact chapter counts for comparison
- Check multiple chapters at each university for data consistency
- Report any null/undefined values immediately
- Compare data across different features (map vs universities tab)
- Test both large universities (20+ chapters) and smaller ones
- If a university seems wrong, double-check against official lists
