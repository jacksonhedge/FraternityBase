# 🎯 TEST PROMPT: FRATERNITY RATINGS DATA CONSISTENCY

## 🎯 Objective
Verify that fraternity rating counts are **consistent and accurate** across:
1. **Admin Dashboard** - Graded rankings overview
2. **Colleges Page** (`/app/colleges`) - University fraternity ratings breakdown
3. **Fraternities/Chapters Page** (`/app/chapters` or `/app/fraternities`) - Individual chapter listings

## 📋 Test Instructions

---

### PART 1: Colleges Page - Rating Analysis

**Navigate to Colleges:**
1. Go to `http://localhost:5173/app/colleges`
2. Wait for page to fully load
3. Ensure you're in **Grid View** (not List View)

**Analyze First University Card:**
4. Look at the **first university** displayed (should be sorted by most fraternities)
5. Record the university name: _____________________

6. In the "Fraternity Ratings" section, record:
   - **5.0⭐ Chapters**: _____
   - **4.0⭐ Chapters**: _____
   - **3.0⭐ Chapters**: _____
   - **Total Fraternities**: _____ (from the stats grid above)

**Calculate Expected Total:**
7. Add up the ratings: 5.0⭐ + 4.0⭐ + 3.0⭐ = _____
8. **Does this match Total Fraternities?** [ ] YES / [ ] NO
9. If NO, what's the discrepancy? _____________________

**Check Multiple Universities:**
10. Repeat steps 4-8 for **3 more universities** (top 4 total)

**University 2:**
- Name: _____________________
- 5.0⭐: _____ | 4.0⭐: _____ | 3.0⭐: _____ | Total Frats: _____
- Sum matches? [ ] YES / [ ] NO

**University 3:**
- Name: _____________________
- 5.0⭐: _____ | 4.0⭐: _____ | 3.0⭐: _____ | Total Frats: _____
- Sum matches? [ ] YES / [ ] NO

**University 4:**
- Name: _____________________
- 5.0⭐: _____ | 4.0⭐: _____ | 3.0⭐: _____ | Total Frats: _____
- Sum matches? [ ] YES / [ ] NO

**Aggregate Totals from Colleges Page:**
11. Across all 4 universities tested, sum up:
    - **Total 5.0⭐ Fraternities**: _____
    - **Total 4.0⭐ Fraternities**: _____
    - **Total 3.0⭐ Fraternities**: _____
    - **Total Fraternities (all ratings)**: _____

---

### PART 2: Individual University Detail Page

**Click into First University:**
1. From `/app/colleges`, click "View Details" on the **first university**
2. This should navigate to `/app/colleges/{id}`

**Verify Chapter List:**
3. Count the total number of **fraternity** chapters displayed: _____
4. Does this match the "Total Fraternities" from the card? [ ] YES / [ ] NO

**Count by Rating (Manual):**
5. Scroll through the chapter list
6. Count chapters by their displayed rating:
   - **5.0⭐ Chapters**: _____ (count manually)
   - **4.0⭐ - 4.9⭐ Chapters**: _____ (count manually)
   - **3.0⭐ - 3.9⭐ Chapters**: _____ (count manually)
   - **Chapters with NO rating displayed**: _____

7. **Do these counts match the college card?** [ ] YES / [ ] NO
8. If NO, what's the discrepancy? _____________________

---

### PART 3: Fraternities/Chapters Page

**Navigate to Chapters:**
1. Go to `/app/chapters` OR `/app/fraternities` (whichever exists)
2. Wait for page to fully load

**Filter by First University:**
3. Look for a search or filter box
4. Filter by the **first university** you tested (from Part 1)
5. Record total fraternity chapters shown for this university: _____

**Verify Rating Distribution:**
6. If the page shows ratings, count:
   - **5.0⭐ Chapters**: _____
   - **4.0⭐ - 4.9⭐ Chapters**: _____
   - **3.0⭐ - 3.9⭐ Chapters**: _____

7. **Do these match the college card?** [ ] YES / [ ] NO
8. **Do these match the detail page?** [ ] YES / [ ] NO

**Test Without Filter (All Universities):**
9. Clear the university filter (show all fraternities)
10. If the page has aggregate stats, record:
    - **Total 5.0⭐ Fraternities**: _____
    - **Total 4.0⭐ Fraternities**: _____
    - **Total 3.0⭐ Fraternities**: _____
    - **Total Fraternities**: _____

---

### PART 4: Admin Dashboard Comparison

**Navigate to Admin:**
1. Go to `/app/admin` (or wherever the admin dashboard is)
2. Look for "Graded Rankings" or similar section

**Record Admin Dashboard Stats:**
3. Find the fraternity rating statistics
4. Record what the admin dashboard shows:
   - **5.0⭐ Fraternities**: _____
   - **4.0⭐ Fraternities**: _____
   - **3.0⭐ Fraternities**: _____
   - **Total Graded Fraternities**: _____

**Compare to Colleges Page (Part 1):**
5. **Do admin 5.0⭐ counts match colleges page?** [ ] YES / [ ] NO
   - Admin: _____ vs Colleges: _____
6. **Do admin 4.0⭐ counts match colleges page?** [ ] YES / [ ] NO
   - Admin: _____ vs Colleges: _____
7. **Do admin 3.0⭐ counts match colleges page?** [ ] YES / [ ] NO
   - Admin: _____ vs Colleges: _____

**Compare to Chapters Page (Part 3):**
8. **Do admin counts match chapters page?** [ ] YES / [ ] NO
9. If NO, record discrepancies:
   - _____________________

---

### PART 5: Browser Console Analysis

**Check Console Logs:**
1. Open browser console (F12)
2. Go back to `/app/colleges`
3. Look for logs like:
   ```
   ✅ [CollegesPage] Calculated real chapter counts...
   📊 [CollegesPage] Sample fraternity/sorority counts...
   ```

**Verify Data in Console:**
4. Expand the logged data
5. For the first university, check:
   - Does it show the correct number of fraternities? [ ] YES / [ ] NO
   - Does it show rating breakdowns? [ ] YES / [ ] NO
   - Are the ratings being calculated? [ ] YES / [ ] NO

**Check for Errors:**
6. Look for any red error messages in console
7. Record any errors: _____________________

---

### PART 6: Database Direct Query (Optional)

**If you have access to database tools:**
1. Run this query to count fraternities by rating:
```sql
SELECT
  COUNT(*) FILTER (WHERE rating = 5.0) as five_star,
  COUNT(*) FILTER (WHERE rating >= 4.0 AND rating < 5.0) as four_star,
  COUNT(*) FILTER (WHERE rating >= 3.0 AND rating < 4.0) as three_star,
  COUNT(*) as total
FROM chapters c
JOIN greek_organizations go ON c.organization_id = go.id
WHERE go.organization_type = 'fraternity';
```

2. Record database results:
   - **5.0⭐**: _____
   - **4.0⭐**: _____
   - **3.0⭐**: _____
   - **Total**: _____

3. **Do database counts match the UI?** [ ] YES / [ ] NO

---

## ✅ Expected Results (PASS Criteria)

### Data Consistency:
- [ ] **Colleges page rating counts** = **Detail page counts** (for same university)
- [ ] **Colleges page total fraternities** = **Sum of all rating categories**
- [ ] **Chapters/Fraternities page counts** = **Colleges page counts**
- [ ] **Admin dashboard counts** = **All other page counts**
- [ ] **Database query results** = **UI display counts** (if tested)

### Rating Calculation:
- [ ] **5.0⭐** counts only chapters with rating **exactly 5.0**
- [ ] **4.0⭐** counts chapters with rating **4.0 - 4.9**
- [ ] **3.0⭐** counts chapters with rating **3.0 - 3.9**
- [ ] **No overlap** between rating categories

### No Missing Data:
- [ ] **No fraternities with ratings** are excluded from counts
- [ ] **All fraternities** appear in totals
- [ ] **Fraternities without ratings** are not counted in any category

---

## ❌ FAIL Criteria

### Critical Issues:
- Rating counts **don't match** between pages
- Sum of rating categories **doesn't equal** total fraternities
- Admin dashboard shows **different numbers** than colleges page
- Fraternities are **counted multiple times** (in multiple rating categories)
- Fraternities with ratings are **missing** from counts

### Data Integrity Issues:
- **Negative numbers** in any count
- **Null or undefined** values displayed
- **Total fraternities on card** ≠ **Chapters shown on detail page**
- **Console shows errors** during data calculation

---

## 📊 Report Format

```
🎯 FRATERNITY RATINGS CONSISTENCY TEST REPORT
Date: [Date/Time]
Tester: [Name]

═══════════════════════════════════════════════════════════

PART 1: Colleges Page Analysis
University 1: [Name]
  - 5.0⭐: [___] | 4.0⭐: [___] | 3.0⭐: [___] | Total: [___]
  - Sum matches total? [YES/NO]

University 2: [Name]
  - 5.0⭐: [___] | 4.0⭐: [___] | 3.0⭐: [___] | Total: [___]
  - Sum matches total? [YES/NO]

University 3: [Name]
  - 5.0⭐: [___] | 4.0⭐: [___] | 3.0⭐: [___] | Total: [___]
  - Sum matches total? [YES/NO]

University 4: [Name]
  - 5.0⭐: [___] | 4.0⭐: [___] | 3.0⭐: [___] | Total: [___]
  - Sum matches total? [YES/NO]

AGGREGATE (4 universities):
  - Total 5.0⭐: [___]
  - Total 4.0⭐: [___]
  - Total 3.0⭐: [___]
  - Total All: [___]

═══════════════════════════════════════════════════════════

PART 2: Detail Page Verification
University: [Name from Part 1]
  - Chapters displayed: [___]
  - Matches card total? [YES/NO]
  - 5.0⭐ (manual count): [___]
  - 4.0⭐ (manual count): [___]
  - 3.0⭐ (manual count): [___]
  - Matches card ratings? [YES/NO]

═══════════════════════════════════════════════════════════

PART 3: Chapters/Fraternities Page
Filtered by University: [Name]
  - Total chapters: [___]
  - 5.0⭐: [___]
  - 4.0⭐: [___]
  - 3.0⭐: [___]
  - Matches colleges page? [YES/NO]
  - Matches detail page? [YES/NO]

All Fraternities (no filter):
  - Total 5.0⭐: [___]
  - Total 4.0⭐: [___]
  - Total 3.0⭐: [___]
  - Total All: [___]

═══════════════════════════════════════════════════════════

PART 4: Admin Dashboard
Admin Stats:
  - 5.0⭐: [___]
  - 4.0⭐: [___]
  - 3.0⭐: [___]
  - Total: [___]

Comparison:
  - Matches Colleges Page? [YES/NO]
    - 5.0⭐: Admin [___] vs Colleges [___]
    - 4.0⭐: Admin [___] vs Colleges [___]
    - 3.0⭐: Admin [___] vs Colleges [___]

  - Matches Chapters Page? [YES/NO]

═══════════════════════════════════════════════════════════

PART 5: Console Analysis
  - Logs present? [YES/NO]
  - Data calculations visible? [YES/NO]
  - Errors found? [YES/NO]
  - Errors: [List any errors]

═══════════════════════════════════════════════════════════

PART 6: Database Query (Optional)
Database Results:
  - 5.0⭐: [___]
  - 4.0⭐: [___]
  - 3.0⭐: [___]
  - Total: [___]

  - Matches UI? [YES/NO]

═══════════════════════════════════════════════════════════

OVERALL RESULT: [PASS / FAIL]

DISCREPANCIES FOUND:
- [List each discrepancy with specific numbers]

ROOT CAUSE ANALYSIS:
- [Describe what might be causing the mismatch]

RECOMMENDED FIXES:
- [List specific fixes needed]
```

---

## 🔍 Common Issues to Look For

1. **Rating Range Overlap**
   - Is 4.0 being counted in both "4.0⭐" and "5.0⭐" categories?
   - Are boundaries exclusive or inclusive?

2. **Organization Type Filtering**
   - Are sororities being counted in fraternity stats?
   - Is the `organization_type === 'fraternity'` filter working?

3. **Null/Undefined Ratings**
   - What happens to fraternities without ratings?
   - Are they counted in totals but not in rating categories?

4. **Data Source Consistency**
   - Is admin dashboard using same API as colleges page?
   - Is chapters page using same data source?

5. **Calculation Logic**
   - Is the rating breakdown calculated correctly in CollegesPage.tsx?
   - Are the filters using correct operators (`===`, `>=`, `<`)?

---

## 💡 Testing Tips

- **Test on a fresh page load** to avoid cached data
- **Check multiple universities** to identify patterns
- **Compare exact numbers** - even a difference of 1 matters
- **Look at console logs** for calculation details
- **Take screenshots** of any discrepancies
- **Note which page is "correct"** if there's a mismatch

---

**Last Updated:** October 16, 2025
**Purpose:** Identify and fix fraternity rating count discrepancies across the application
