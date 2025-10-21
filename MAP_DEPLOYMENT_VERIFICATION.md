# FraternityBase Map - Post-Deployment Verification Test

## Purpose
Verify that the Power 5 conference updates have been successfully deployed to production and that previously missing colleges now appear correctly.

## Pre-Test Checklist
1. ✅ Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
2. ✅ Hard refresh https://fraternitybase.com
3. ✅ Verify you're testing the PRODUCTION site (not localhost)
4. ✅ Open browser console (F12) to monitor debug messages

---

## CRITICAL TESTS - Power 5 Schools That Were Missing

### TEST 1: West Virginia ⭐ PRIORITY
**Expected Result:** Should now show West Virginia University

**Steps:**
1. Navigate to Map page
2. Click "Power 5" filter button
3. Click on West Virginia state
4. Check sidebar panel

**What to Report:**
- Colleges shown: [number]
- College names: [list all]
- Console message: Look for `📍 Found X colleges in WV`
- **PASS/FAIL:** Does West Virginia University appear? YES/NO

**Expected Console Output:**
```
🗺️ State clicked: West Virginia Abbr: WV
📍 Found 1 colleges in WV
```

---

### TEST 2: Louisiana (LSU) ⭐ PRIORITY
**Expected Result:** Should show Louisiana State University (LSU)

**Steps:**
1. Keep "Power 5" filter active
2. Click on Louisiana state
3. Check sidebar panel

**What to Report:**
- Colleges shown: [number]
- College names: [list all]
- Console message: `📍 Found X colleges in LA`
- **PASS/FAIL:** Does LSU appear? YES/NO

**Expected:**
- 1 college: Louisiana State University and Agricultural and Mechanical College (LSU)
- Conference: SEC

---

### TEST 3: California (Stanford, Cal, USC, UCLA) ⭐ PRIORITY
**Expected Result:** Should show 4 Power 5 schools

**Steps:**
1. Keep "Power 5" filter active
2. Click on California state
3. Check sidebar panel

**What to Report:**
- Total colleges shown: [number]
- College names visible: [list all]
- Console message: `📍 Found X colleges in CA`
- **PASS/FAIL:** Do Stanford and Cal appear? YES/NO

**Expected Schools:**
1. ✅ Leland Stanford Junior University (Stanford) - ACC
2. ✅ University of California, Berkeley (Cal) - ACC
3. ✅ University of Southern California (USC) - BIG 10
4. ✅ University of California, Los Angeles (UCLA) - BIG 10

---

### TEST 4: Virginia (UVA, Virginia Tech)
**Expected Result:** Should show 2 ACC schools

**Steps:**
1. Keep "Power 5" filter active
2. Click on Virginia state
3. Check sidebar panel

**What to Report:**
- Colleges shown: [number]
- College names: [list all]
- **PASS/FAIL:** Do both UVA and Virginia Tech appear? YES/NO

**Expected Schools:**
1. ✅ University of Virginia (UVA) - ACC
2. ✅ Virginia Polytechnic Institute and State University (Virginia Tech) - ACC

---

### TEST 5: Tennessee
**Expected Result:** Should show University of Tennessee

**Steps:**
1. Keep "Power 5" filter active
2. Click on Tennessee state
3. Check sidebar panel

**What to Report:**
- Colleges shown: [number]
- College names: [list all]
- **PASS/FAIL:** Does University of Tennessee appear? YES/NO

**Expected:**
- The University of Tennessee, Knoxville - SEC

---

### TEST 6: Texas
**Expected Result:** Should show University of Texas and Texas A&M

**Steps:**
1. Keep "Power 5" filter active
2. Click on Texas state
3. Check sidebar panel

**What to Report:**
- Colleges shown: [number]
- College names: [list all]
- **PASS/FAIL:** Do both UT Austin and Texas A&M appear? YES/NO

**Expected Schools:**
1. ✅ The University of Texas at Austin - SEC
2. ✅ Texas A&M University - SEC

---

## FILTER VERIFICATION TESTS

### TEST 7: Power 5 Conference Breakdown
**Purpose:** Verify all Power 5 conferences show correctly

**Steps:**
1. Activate "Power 5" filter
2. Count total colleges visible on map
3. Test each conference individually:
   - Click "Big 10" button → Count colleges
   - Reset → Click "Power 5" again
4. Spot check a few states from each conference region

**What to Report:**
- Total Power 5 colleges visible on map: [number]
- Big 10 schools visible: [number]
- Notable schools you see: [list 5-10 examples]

**Expected Distribution:**
- BIG 10: ~22 schools (including UCLA, USC, Oregon, Washington)
- ACC: ~18 schools (including Stanford, Cal)
- SEC: ~17 schools (including Texas, Oklahoma)
- BIG 12: ~16 schools

---

### TEST 8: "Coming Soon" Display
**Purpose:** Verify colleges with 0 chapters show "Coming Soon"

**Steps:**
1. Turn OFF all filters (click "All" button)
2. Click on a smaller state (e.g., Delaware, Rhode Island, Vermont)
3. Look for any colleges with 0 fraternities AND 0 sororities

**What to Report:**
- Do you see any colleges displaying "Coming Soon"? YES/NO
- If YES, which college(s): [list]
- Screenshot if possible

**Expected:**
- Some colleges may show "Coming Soon" instead of "0 Fraternities, 0 Sororities"

---

## CONSOLE DEBUGGING

### TEST 9: Console Messages
**Purpose:** Verify debug logging is working

**Steps:**
1. Open browser console (F12)
2. Click on any 3 different states
3. Copy all console messages with emojis (🗺️, 📍, ⚠️, ❌)

**What to Report:**
Paste ALL console messages here:
```
[Console output]
```

**Expected Messages:**
- `🗺️ State clicked: [State Name] Abbr: [XX]`
- `📍 Found X colleges in [XX]`
- NO `⚠️` or `❌` errors for valid states

---

## REGRESSION TESTS

### TEST 10: States That Previously Worked
**Purpose:** Ensure our updates didn't break anything

**Quick Test States:**
- Pennsylvania → Should still show Penn State
- Illinois → Should still show Northwestern, UIUC
- Ohio → Should still show Ohio State
- Alabama → Should still show University of Alabama

**What to Report:**
- Do these states still work correctly? YES/NO
- Any states that broke: [list if any]

---

## DEPLOYMENT VERIFICATION SUMMARY

### Quick Checklist
Mark each with ✅ PASS or ❌ FAIL:

- [ ] West Virginia shows WVU
- [ ] Louisiana shows LSU
- [ ] California shows Stanford
- [ ] California shows Cal (Berkeley)
- [ ] Virginia shows UVA
- [ ] Virginia shows Virginia Tech
- [ ] Tennessee shows UT Knoxville
- [ ] Texas shows UT Austin
- [ ] Texas shows Texas A&M
- [ ] Console shows debug messages
- [ ] No JavaScript errors in console
- [ ] Previously working states still work

---

## FINAL REPORT FORMAT

```
# DEPLOYMENT VERIFICATION - [Date/Time]

## Critical Tests Results
West Virginia: PASS/FAIL - [Details]
Louisiana (LSU): PASS/FAIL - [Details]
California: PASS/FAIL - [Details]
Virginia: PASS/FAIL - [Details]
Tennessee: PASS/FAIL - [Details]
Texas: PASS/FAIL - [Details]

## Power 5 Count
Total colleges visible with Power 5 filter: [number]
Expected: ~75 schools

## Console Output
[Paste relevant console messages]

## Issues Found
[List any problems, or write "None - all tests passed!"]

## Deployment Status
✅ VERIFIED - All updates deployed successfully
❌ ISSUES - [Describe problems]
⏳ PENDING - Deployment may still be in progress

## Screenshots
[Attach any relevant screenshots of issues or successes]
```

---

## TROUBLESHOOTING

If tests fail:

1. **Hard Refresh Again:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Check Deployment:** Vercel may still be deploying (wait 5 minutes)
3. **Clear All Cache:** Go to browser settings → Clear browsing data → Cached files
4. **Try Incognito:** Test in a private/incognito window
5. **Check Console:** Look for any red error messages
6. **Verify URL:** Make sure you're on fraternitybase.com (not localhost)

---

## SUCCESS CRITERIA

**Test is SUCCESSFUL if:**
- ✅ All 6 critical states show their Power 5 schools
- ✅ Total Power 5 count is ~75 schools (up from ~57)
- ✅ Console shows debug messages without errors
- ✅ No regressions (previously working states still work)

**Test FAILS if:**
- ❌ West Virginia still shows 0 colleges
- ❌ LSU, Stanford, or Cal don't appear
- ❌ Console shows `⚠️ No abbreviation found` errors
- ❌ Previously working states are broken
