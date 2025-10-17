# 🎯 TEST PROMPT: CHAPTERS UI, UNLOCK LOGIC & GRADING

## 🎯 Objective
Verify that the `/app/chapters` page:
1. **Unlock Logic Works Correctly** - Uses subscription unlocks first, only shows "credits" when subscription exhausted
2. **Grading System Works** - Chapters can be graded properly
3. **UI is Clean** - No unnecessary fields (Greek Rank, Chapter GPA should NOT appear)
4. **Display Quality** - Professional, organized, easy to use

---

## 📋 Test Instructions

### PART 1: Chapters Page Initial Load

**Navigate to Chapters:**
1. Go to `http://localhost:5173/app/chapters`
2. Login as `jacksonfitzgerald25@gmail.com` if not already logged in
3. Wait for page to fully load

**Visual Check:**
4. Verify the page displays:
   - [ ] List of fraternity/sorority chapters
   - [ ] University names for each chapter
   - [ ] Organization names (e.g., "Sigma Chi", "Alpha Delta Phi")
   - [ ] Ratings/grades (e.g., "5.0⭐", "4.5⭐")
   - [ ] Unlock status (locked vs unlocked)

**Count Total Chapters:**
5. Record total number of chapters displayed: _____
6. Are they organized/sortable? [ ] YES / [ ] NO
7. If yes, by what? (e.g., university, rating, unlock status): _____

---

### PART 2: UI Field Verification (What Should NOT Appear)

**Scan Each Chapter Card/Row for Unwanted Fields:**

**🚫 These Fields Should NOT Be Visible:**
8. **Greek Rank** - Check: [ ] NOT PRESENT / [ ] ❌ PRESENT (FAIL)
9. **Chapter GPA** - Check: [ ] NOT PRESENT / [ ] ❌ PRESENT (FAIL)
10. **GreekRank URL** - Check: [ ] NOT PRESENT / [ ] ❌ PRESENT (FAIL)
11. **GreekRank Verified** - Check: [ ] NOT PRESENT / [ ] ❌ PRESENT (FAIL)

**If any unwanted fields appear:**
12. Take screenshot: [ ] DONE
13. Note which chapters show them: _____________________
14. Note exact field name/label: _____________________

---

### PART 3: Unlock Logic Test - Subscription Unlocks Available

**Check Current Balance:**
1. Look at navbar balance indicator (top right)
2. Record subscription unlocks available:
   - **5.0⭐ Unlocks**: _____
   - **4.0⭐ Unlocks**: _____
   - **3.0⭐ Unlocks**: _____
   - **Total Subscription Unlocks**: _____
   - **Credits Balance**: _____

**Find a Locked 5.0⭐ Chapter (if you have 5.0⭐ unlocks):**
3. Find a chapter with **exactly 5.0⭐ rating** that is **LOCKED**
4. Record chapter name: _____________________
5. Record university: _____________________

**Click to View/Unlock:**
6. Click on the chapter or "Unlock" button
7. Verify unlock modal appears

**Check Modal Display:**
8. Modal shows:
   - [ ] **Purple/gradient background** (subscription unlock style)
   - [ ] Text: "✨ Using Subscription Unlock" or similar
   - [ ] Shows "5.0⭐ Unlocks: X remaining"
   - [ ] Cost: **$0.00** or "Free"
   - [ ] **NO "Pay with Credits" option shown**

9. **Does it say "Unlock for Credits"?** [ ] NO (PASS) / [ ] YES (FAIL)
10. If YES, this is a **BUG** - should use subscription first!

**Execute Unlock:**
11. Click "Unlock Chapter" to confirm
12. Wait for success message
13. Verify chapter is now unlocked: [ ] YES / [ ] NO

**Check Balance After Unlock:**
14. Check navbar balance:
    - **5.0⭐ Unlocks**: _____ (should decrease by 1)
    - **Credits**: _____ (should be UNCHANGED)

15. **Did subscription unlock decrease?** [ ] YES (PASS) / [ ] NO (FAIL)
16. **Did credits stay the same?** [ ] YES (PASS) / [ ] NO (FAIL)

---

### PART 4: Unlock Logic Test - Credits Only (Subscription Exhausted)

**Scenario: No Subscription Unlocks for This Rating Tier**

**Option A: If You Have 3.0⭐ Unlocks = 0 (Monthly Tier Default)**
1. Find a locked chapter with **3.0⭐ - 3.9⭐ rating**
2. Record chapter name: _____________________
3. Record rating: _____

**Option B: If You've Exhausted All 5.0⭐ Unlocks**
4. If you already used all 5 subscription unlocks for 5.0⭐
5. Find another locked **5.0⭐ chapter**
6. Record chapter name: _____________________

**Click to View/Unlock:**
7. Click on the locked chapter
8. Verify unlock modal appears

**Check Modal Display:**
9. Modal shows:
   - [ ] **Gray/blue background** (credit unlock style, NOT purple)
   - [ ] Text: "💳 Pay with Credits" or similar
   - [ ] Shows credit cost (e.g., "3 credits" or "10 credits")
   - [ ] Shows dollar value (e.g., "$2.97" or "$9.90")
   - [ ] Message explaining no subscription unlocks available
   - [ ] **NO purple subscription unlock section**

10. **Does it show subscription unlock option?** [ ] NO (PASS) / [ ] YES (FAIL)
11. If YES and you have 0 unlocks, this is a **BUG**!

**Execute Credit Unlock:**
12. Record credits before unlock: _____
13. Click "Unlock Chapter" to confirm
14. Record credits after unlock: _____
15. **Did credits decrease correctly?** [ ] YES / [ ] NO
16. Calculate: Credits decreased by: _____

---

### PART 5: Grading Functionality Test

**Find an Unlocked Chapter:**
1. Scroll to find a chapter that is **UNLOCKED**
2. Record chapter name: _____________________
3. Record current grade/rating: _____

**Access Grading Interface:**
4. Look for "Grade" button or similar option
5. Click on grading option
6. Verify grading modal/interface appears: [ ] YES / [ ] NO

**Test Grading:**
7. Select a new grade (1.0 - 5.0)
8. New grade selected: _____
9. Click "Save" or "Submit Grade"
10. Verify success message appears: [ ] YES / [ ] NO

**Verify Grade Updated:**
11. Check if chapter card shows new grade: [ ] YES / [ ] NO
12. If YES, what's the new grade displayed? _____
13. Does it match what you selected? [ ] YES / [ ] NO

**Check Multiple Grading Options:**
14. Can you grade multiple chapters? [ ] YES / [ ] NO
15. Can you re-grade a chapter? [ ] YES / [ ] NO
16. Does grading require unlock? [ ] YES / [ ] NO (should be YES)

---

### PART 6: UI Quality & Organization

**Chapter Display Cards/Rows:**
1. Rate the visual design:
   - [ ] Professional appearance
   - [ ] Clean, uncluttered layout
   - [ ] Easy to read text
   - [ ] Good color contrast
   - [ ] Consistent spacing

**Information Hierarchy:**
2. Most prominent information displayed:
   - [ ] Organization name (e.g., "Sigma Chi")
   - [ ] University name
   - [ ] Rating/grade
   - [ ] Lock status
   - [ ] Other: _____

3. Is the most important info easy to find? [ ] YES / [ ] NO

**Unlock Status Visual:**
4. How are locked chapters indicated?
   - [ ] Lock icon 🔒
   - [ ] Gray overlay
   - [ ] "Locked" text
   - [ ] Blur effect
   - [ ] Other: _____

5. Is it immediately clear which are locked? [ ] YES / [ ] NO

**Search/Filter Functionality:**
6. Is there a search box? [ ] YES / [ ] NO
7. Can you filter by:
   - [ ] University
   - [ ] Organization
   - [ ] Rating
   - [ ] Lock status
   - [ ] Organization type (fraternity/sorority)

8. Do filters work correctly? [ ] YES / [ ] NO / [ ] N/A

**Sorting:**
9. Can you sort chapters? [ ] YES / [ ] NO
10. If yes, sort options available:
    - [ ] By rating (high to low)
    - [ ] By university name (alphabetical)
    - [ ] By unlock status
    - [ ] Other: _____

**Mobile Responsiveness (Optional):**
11. If testing on mobile or can resize browser:
    - [ ] Layout adapts to smaller screens
    - [ ] Text remains readable
    - [ ] Buttons are tappable
    - [ ] No horizontal scrolling

---

### PART 7: Edge Cases & Error Handling

**Test: Try to Grade a Locked Chapter**
1. Find a **LOCKED** chapter
2. Try to access grading: _____________________
3. What happens?
   - [ ] Grading is disabled/hidden
   - [ ] Error message: "Unlock chapter to grade"
   - [ ] Nothing happens
   - [ ] Other: _____

**Test: Invalid Grade Value**
4. If grading interface allows manual input
5. Try entering invalid value (e.g., "0", "6", "abc")
6. What happens?
   - [ ] Input rejected/validated
   - [ ] Error message shown
   - [ ] Nothing happens (BUG)
   - [ ] Other: _____

**Test: Network Error Simulation**
7. Open browser console (F12)
8. Go to Network tab → Throttling → Offline
9. Try to unlock a chapter
10. What happens?
    - [ ] Loading spinner shows indefinitely
    - [ ] Error message: "Network error"
    - [ ] Nothing happens
    - [ ] Other: _____

11. Go back online and retry
12. Does it work now? [ ] YES / [ ] NO

---

### PART 8: Console & API Verification

**Check Browser Console:**
1. Open console (F12)
2. Look for errors (red messages): [ ] NONE / [ ] ERRORS FOUND
3. If errors found, record: _____________________

**Check API Calls:**
4. Go to Network tab in console
5. Reload the /app/chapters page
6. What API endpoints are called?
   - [ ] `/api/chapters`
   - [ ] `/api/balance` or `/api/subscription`
   - [ ] Other: _____

7. Do all API calls succeed (200 status)? [ ] YES / [ ] NO
8. If NO, which failed? _____________________

**Check Data in Console Logs:**
9. Look for logs like:
   - [ ] Chapter data loaded
   - [ ] Subscription status retrieved
   - [ ] Unlock calculations shown

10. Are there useful debug logs? [ ] YES / [ ] NO

---

### PART 9: Cross-Reference with Admin Panel

**Open Admin Panel:**
1. Go to `/app/admin` in a new tab
2. Find "Hedge, Inc." and click "View Details"

**Record Unlock History:**
3. Look at "Recent Chapter Unlocks" section
4. Find the unlock(s) you made in Part 3 and 4

**Verify Unlock from Part 3 (Subscription):**
5. Does it show:
   - [ ] Purple "✨ Subscription Unlock" badge
   - [ ] Cost: $0.00
   - [ ] Correct chapter name
   - [ ] Correct rating tier (e.g., 5.0⭐)

**Verify Unlock from Part 4 (Credits):**
6. Does it show:
   - [ ] Gray "💳 Credits" badge
   - [ ] Correct credit amount charged
   - [ ] Correct dollar value
   - [ ] Correct chapter name

**Check Balance Update:**
7. Admin panel shows current balance:
   - **5.0⭐ Unlocks**: _____
   - **4.0⭐ Unlocks**: _____
   - **Credits**: _____

8. **Does this match navbar balance?** [ ] YES / [ ] NO

---

## ✅ PASS Criteria

### Unlock Logic:
- [ ] **Subscription unlocks used FIRST** before credits
- [ ] **Purple modal** when subscription unlock available
- [ ] **Gray/credit modal** when subscription exhausted or N/A
- [ ] **Credits unchanged** when using subscription unlock
- [ ] **Credits decrease** when using credit unlock
- [ ] **"Unlock for Credits" ONLY shown** when subscription = 0

### UI Quality:
- [ ] **Greek Rank fields NOT visible**
- [ ] **Chapter GPA field NOT visible**
- [ ] **Clean, professional design**
- [ ] **Information easy to find**
- [ ] **Lock status clearly indicated**

### Grading:
- [ ] **Grading works** for unlocked chapters
- [ ] **Grading disabled** for locked chapters
- [ ] **Grade updates** display correctly
- [ ] **Invalid grades rejected**

### Data Consistency:
- [ ] **Admin panel matches** chapters page unlock history
- [ ] **Balance updates** correctly in real-time
- [ ] **API calls successful**
- [ ] **No console errors**

---

## ❌ FAIL Criteria

### Critical Issues:
- **"Unlock for Credits" shown** when subscription unlocks are available
- **Credits charged** when subscription unlock should be used
- **Greek Rank or Chapter GPA** fields visible
- **Grading allowed** on locked chapters
- **Invalid grades accepted** without validation

### Data Integrity:
- **Balance doesn't update** after unlock
- **Admin panel shows wrong unlock type** (subscription vs credits)
- **Unlocks count incorrectly**
- **API calls failing**

### UX Issues:
- **Unlock status unclear**
- **Hard to tell which chapters are locked**
- **Important info buried** or hard to find
- **Buttons too small** or hard to click
- **No error messages** for failures

---

## 📊 Report Format

```
🎯 CHAPTERS UI, UNLOCK LOGIC & GRADING TEST REPORT
Date: [Date/Time]
Tester: [Name]

═══════════════════════════════════════════════════════════

PART 1: Initial Load
  - Total chapters displayed: [___]
  - Page loads correctly: [PASS/FAIL]
  - Organization clear: [PASS/FAIL]

═══════════════════════════════════════════════════════════

PART 2: Unwanted Fields Check
  - Greek Rank present? [NO (PASS) / YES (FAIL)]
  - Chapter GPA present? [NO (PASS) / YES (FAIL)]
  - GreekRank URL present? [NO (PASS) / YES (FAIL)]
  - Overall: [PASS/FAIL]

═══════════════════════════════════════════════════════════

PART 3: Subscription Unlock Test
Chapter: [Name]
Rating: [5.0⭐]
  - Purple modal shown? [YES (PASS) / NO (FAIL)]
  - "✨ Subscription Unlock" text? [YES (PASS) / NO (FAIL)]
  - Cost $0.00? [YES (PASS) / NO (FAIL)]
  - No "credits" option? [YES (PASS) / NO (FAIL)]

Balance Changes:
  - 5.0⭐ unlocks decreased by 1? [YES (PASS) / NO (FAIL)]
  - Credits unchanged? [YES (PASS) / NO (FAIL)]

Overall: [PASS/FAIL]

═══════════════════════════════════════════════════════════

PART 4: Credit Unlock Test (Subscription Exhausted)
Chapter: [Name]
Rating: [___]
  - Gray/blue modal shown? [YES (PASS) / NO (FAIL)]
  - "💳 Credits" text? [YES (PASS) / NO (FAIL)]
  - Credit cost shown? [YES (PASS) / NO (FAIL)]
  - No purple subscription option? [YES (PASS) / NO (FAIL)]

Balance Changes:
  - Credits decreased correctly? [YES (PASS) / NO (FAIL)]
  - Amount: [___]

Overall: [PASS/FAIL]

═══════════════════════════════════════════════════════════

PART 5: Grading Functionality
  - Grading interface accessible? [YES/NO]
  - Grade updates correctly? [YES/NO]
  - Locked chapters grading blocked? [YES (PASS) / NO (FAIL)]
  - Invalid grades rejected? [YES (PASS) / NO (FAIL)]

Overall: [PASS/FAIL]

═══════════════════════════════════════════════════════════

PART 6: UI Quality
  - Visual design: [1-5 stars]
  - Information hierarchy: [CLEAR/UNCLEAR]
  - Lock status clarity: [CLEAR/UNCLEAR]
  - Search/filters work: [YES/NO/N/A]

Overall: [PASS/FAIL]

═══════════════════════════════════════════════════════════

PART 7: Edge Cases
  - Locked chapter grading blocked: [PASS/FAIL]
  - Invalid grade validation: [PASS/FAIL]
  - Network error handling: [PASS/FAIL]

Overall: [PASS/FAIL]

═══════════════════════════════════════════════════════════

PART 8: Console & API
  - Console errors: [NONE/LIST]
  - API calls successful: [YES/NO]
  - Debug logs helpful: [YES/NO]

Overall: [PASS/FAIL]

═══════════════════════════════════════════════════════════

PART 9: Admin Cross-Reference
  - Subscription unlock shows correctly: [PASS/FAIL]
  - Credit unlock shows correctly: [PASS/FAIL]
  - Balance matches navbar: [PASS/FAIL]

Overall: [PASS/FAIL]

═══════════════════════════════════════════════════════════

OVERALL RESULT: [PASS/FAIL]

CRITICAL ISSUES FOUND:
- [List each critical issue]

UI IMPROVEMENTS NEEDED:
- [List UI issues]

RECOMMENDATIONS:
- [List specific fixes]
```

---

## 🔍 Key Things to Look For

1. **"Unlock for Credits" Text**
   - Should ONLY appear when subscription unlocks = 0
   - If you have unlocks available, seeing this text = BUG

2. **Modal Color**
   - Purple/gradient = Subscription unlock (good)
   - Gray/blue = Credit unlock (good)
   - Wrong color for scenario = BUG

3. **Balance Changes**
   - Subscription unlock → subscription count decreases, credits unchanged
   - Credit unlock → credits decrease, subscription unchanged
   - Any other behavior = BUG

4. **Unwanted Fields**
   - "Greek Rank" anywhere = FAIL
   - "Chapter GPA" anywhere = FAIL
   - These should be completely removed

5. **Grading on Locked Chapters**
   - Should be impossible
   - If allowed = SECURITY ISSUE

---

**Last Updated:** October 16, 2025
**Purpose:** Verify chapters page unlock logic, grading system, and UI cleanliness
