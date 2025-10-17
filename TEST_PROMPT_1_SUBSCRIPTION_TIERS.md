# 🧪 TEST PROMPT 1: SUBSCRIPTION TIER STRUCTURE

## Context
I'm testing the subscription unlock tier system to verify that:
1. Monthly tier has 5/5/0 unlocks (5⭐/4⭐/3⭐)
2. Subscription unlocks work for 5⭐ and 4⭐ chapters
3. 3⭐ chapters require credits (no subscription unlock for monthly tier)
4. Admin panel shows correct purple badges for subscription unlocks
5. Credits only decrease when subscription is exhausted or for 3⭐ chapters

## Test Instructions

### PART 1: Verify Current Subscription Status

**Navigate to App:**
1. Go to http://localhost:5173
2. Login as jacksonfitzgerald25@gmail.com (should already be logged in)
3. Look at the navbar balance indicator

**Record Baseline:**
- Credits balance: _____
- Total unlocks shown: _____

**Check Detailed Balance:**
4. Click on the balance/credits indicator in navbar OR go to Admin page
5. Find subscription unlock breakdown
6. Record:
   - 5⭐ unlocks remaining: _____
   - 4⭐ unlocks remaining: _____
   - 3⭐ unlocks remaining: _____

---

### PART 2: Test 4.0-4.9⭐ Chapter Unlock (NEW TEST)

**Find a 4-star chapter:**
1. Go to "Universities" tab
2. Search for "University of Alabama" or "Auburn University"
3. Click on the university
4. Look for a chapter with rating between 4.0-4.9⭐
5. Click "View Details" on that chapter

**Test the unlock modal:**
6. Click "Unlock Full Chapter" button
7. Verify the modal shows:
   - [ ] Purple background/header
   - [ ] "✨ Using Subscription Unlock" text
   - [ ] Shows "4⭐ Unlocks: 5 remaining" (or current count)
   - [ ] Cost: $0.00
   - [ ] Original cost shown with strikethrough (e.g., "5 Credits")

**Execute the unlock:**
8. Click "Unlock Chapter" to confirm
9. Wait for success message

**Verify real-time updates:**
10. Check navbar immediately:
    - [ ] Credits: UNCHANGED (still same as baseline)
    - [ ] 4⭐ unlocks: DECREASED by 1 (should be 4 now if was 5)
    - [ ] Total unlocks: DECREASED by 1

**Verify in Admin Panel:**
11. Go to Admin page
12. Find "Hedge, Inc." and click "View Details"
13. Look at "Recent Chapter Unlocks" section
14. Find the unlock you just made
15. Verify it shows:
    - [ ] Purple badge: "✨ Subscription Unlock"
    - [ ] Rating shown: "4.X⭐" (whatever the rating was)
    - [ ] Cost: "$0.00"
    - [ ] NOT a gray "💳 Credits" badge

---

### PART 3: Test 3.0-3.9⭐ Chapter (Should Use Credits)

**Find a 3-star chapter:**
1. Go back to "Universities" tab
2. Search for universities and find a chapter with 3.0-3.9⭐ rating
3. Click "View Details" on that chapter

**Test the unlock modal:**
4. Click "Unlock Full Chapter" button
5. Verify the modal shows:
   - [ ] Gray/blue background (NOT purple)
   - [ ] "💳 Pay with Credits" section shown
   - [ ] Shows credit cost (e.g., "3 credits")
   - [ ] Shows dollar value (e.g., "$2.97")
   - [ ] NO subscription unlock option shown
   - [ ] Shows current credits balance

**Execute the unlock:**
6. Click "Unlock Chapter" to confirm
7. Wait for success message

**Verify credits were charged:**
8. Check navbar immediately:
    - [ ] Credits: DECREASED by 3 (if 3-star cost is 3 credits)
    - [ ] 3⭐ unlocks: Still 0 (monthly tier has no 3⭐ unlocks)
    - [ ] Total unlocks: DECREASED by 1

**Verify in Admin Panel:**
9. Go to Admin page
10. Find "Hedge, Inc." and click "View Details"
11. Look at "Recent Chapter Unlocks" section
12. Find the unlock you just made
13. Verify it shows:
    - [ ] Gray badge: "💳 Credits"
    - [ ] Credit amount: "3 credits" (or actual cost)
    - [ ] Dollar value: "$2.97" (or actual cost)
    - [ ] NOT a purple subscription unlock badge

---

### PART 4: Test Subscription Exhaustion (5⭐)

**Goal:** Exhaust all 5⭐ subscription unlocks and verify credit fallback

**Current 5⭐ status:**
- You should have 4 remaining (used 1 earlier)

**Unlock 4 more 5-star chapters:**
1. Go to "Universities" tab
2. Search for "University of Illinois" or other universities
3. Find and unlock 4 more chapters with exactly 5.0⭐ rating
4. For each unlock, verify:
   - Purple subscription unlock modal appears
   - Credits don't decrease
   - 5⭐ count decreases: 4→3→2→1→0

**After exhausting (5⭐ remaining = 0):**
5. Try to unlock a 6th 5.0⭐ chapter
6. Verify the modal now shows:
   - [ ] Gray/blue background (NOT purple anymore)
   - [ ] "💳 Pay with Credits" section
   - [ ] Shows credit cost: "10 credits"
   - [ ] Shows dollar value: "$9.90"
   - [ ] Message: "No 5⭐ subscription unlocks remaining"

**Execute the credit unlock:**
7. Click "Unlock Chapter" to confirm
8. Verify:
   - [ ] Credits DECREASED by 10
   - [ ] 5⭐ unlocks: Still 0
   - [ ] Total unlocks decreased

**Verify in Admin Panel:**
9. Check admin panel
10. Find the 6th unlock
11. Verify it shows:
    - [ ] Gray badge: "💳 Credits"
    - [ ] Amount: "10 credits"
    - [ ] Cost: "$9.90"

---

### PART 5: Admin Panel Subscription Overview

**Check company details modal:**
1. Go to Admin page
2. Find "Hedge, Inc." and click "View Details"
3. Look for subscription information section
4. Verify it shows:
   - [ ] Subscription Tier: "Monthly" (or "Trial" if bug still exists)
   - [ ] 5⭐ unlocks: 0/5 remaining (if exhausted)
   - [ ] 4⭐ unlocks: 4/5 remaining (if used 1)
   - [ ] 3⭐ unlocks: 0/0 remaining (monthly has none)
   - [ ] Subscription period end date shown
   - [ ] Subscription started date shown

**Check unlock history badges:**
5. Scroll through "Recent Chapter Unlocks"
6. Count and categorize:
   - Purple "✨ Subscription Unlock" badges: _____ (should be 5⭐ and 4⭐ unlocks)
   - Gray "💳 Credits" badges: _____ (should be 3⭐ and exhausted 5⭐ unlocks)
7. Verify each shows correct cost ($0.00 vs actual cost)

---

## Expected Results Summary

### ✅ PASS Criteria:

**5⭐ Chapters (First 5):**
- [ ] Purple subscription unlock modal
- [ ] Credits unchanged
- [ ] 5⭐ count decreases
- [ ] Admin shows purple badge + $0.00

**5⭐ Chapters (After Exhaustion):**
- [ ] Gray credit unlock modal
- [ ] Credits decrease by 10
- [ ] Admin shows gray badge + actual cost

**4⭐ Chapters:**
- [ ] Purple subscription unlock modal
- [ ] Credits unchanged
- [ ] 4⭐ count decreases
- [ ] Admin shows purple badge + $0.00

**3⭐ Chapters (Monthly Tier):**
- [ ] Gray credit unlock modal (no subscription option)
- [ ] Credits decrease by 3
- [ ] 3⭐ count stays 0
- [ ] Admin shows gray badge + actual cost

**Admin Panel:**
- [ ] Clear visual distinction (purple vs gray badges)
- [ ] Correct costs displayed ($0.00 vs actual)
- [ ] Subscription tier and allowances shown
- [ ] Unlock history accurate

### ❌ FAIL Criteria:

- Any subscription unlock shows gray "💳 Credits" badge
- Any subscription unlock charges credits
- 3⭐ chapters show purple subscription unlock option
- Costs are incorrect ($0.00 when should charge, or vice versa)
- Purple badges show actual cost instead of $0.00

---

## Report Format

```
🧪 SUBSCRIPTION TIER STRUCTURE TEST REPORT
Date: [Date/Time]
Tester: Dev Chrome Agent

PART 1: Current Status
- Credits baseline: _____
- 5⭐ unlocks: _____
- 4⭐ unlocks: _____
- 3⭐ unlocks: _____

PART 2: 4⭐ Chapter Test
- Modal appearance: [PASS/FAIL]
- Purple badge shown: [PASS/FAIL]
- Credits unchanged: [PASS/FAIL]
- Admin panel correct: [PASS/FAIL]

PART 3: 3⭐ Chapter Test (Credit Fallback)
- Gray modal shown: [PASS/FAIL]
- Credits charged: [PASS/FAIL]
- Admin panel correct: [PASS/FAIL]

PART 4: Exhaustion Test
- 5⭐ subscription unlocks used: [PASS/FAIL]
- Credit fallback works: [PASS/FAIL]
- Admin panel shows both types: [PASS/FAIL]

PART 5: Admin Panel Overview
- Subscription tier correct: [PASS/FAIL]
- Unlock counts accurate: [PASS/FAIL]
- Badge colors correct: [PASS/FAIL]

OVERALL RESULT: [PASS/FAIL]

Issues Found:
- [List any issues]

Screenshots/Evidence:
- [Describe what you see]
```

---

## Notes for Tester

- Take your time with each step
- Record baseline numbers before starting
- If you encounter errors, note the exact error message
- Pay special attention to badge colors (purple vs gray)
- Verify costs match expectations ($0.00 vs actual)
- The key fix we're testing is `amount_paid: 0` for subscription unlocks
