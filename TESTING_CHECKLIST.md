# Power 5 Conference & Map Testing Checklist

## Test 1: Power 5 Filter on Chapters Page
**Prompt for customer:**
```
Go to /app/chapters page. Click the "Division" dropdown and select "Power 5".
You should see exactly 73 colleges listed (SEC, BIG 10, BIG 12, ACC schools only).

✅ Pass if: Shows ~73 colleges from Power 5 conferences
❌ Fail if: Shows 0 colleges or wrong schools
```

## Test 2: Oklahoma Schools - Map Visibility
**Prompt for customer:**
```
Go to /app/map page. Look at the Oklahoma state on the map.
You should see 2 circular markers/logos:
- University of Oklahoma (OU)
- Oklahoma State University (OSU)

✅ Pass if: Both logos are visible when zoomed in on Oklahoma
❌ Fail if: No logos appear or only 1 appears
```

## Test 3: Oklahoma State Detail Panel
**Prompt for customer:**
```
Go to /app/map page. Click directly on the Oklahoma state (the gray shape).
A right-side panel should open showing:
- Title: "Oklahoma"
- Should show: "2 Colleges, X Chapters, X Members" (NOT "0 Colleges")
- Should list both: University of Oklahoma and Oklahoma State University

✅ Pass if: Panel shows 2 colleges with names and stats
❌ Fail if: Panel shows "0 Colleges, 0 Chapters, 0 Members"
```

## Test 4: University of Oklahoma - Conference Assignment
**Prompt for customer:**
```
Go to /app/chapters page. Search for "University of Oklahoma".
Check the conference column - it should show "SEC".

✅ Pass if: Conference = "SEC"
❌ Fail if: Conference is blank or shows different value
```

## Test 5: Oklahoma State University - Conference Assignment
**Prompt for customer:**
```
Go to /app/chapters page. Search for "Oklahoma State".
Check the conference column - it should show "BIG 12".

✅ Pass if: Conference = "BIG 12"
❌ Fail if: Conference is blank or shows different value
```

## Test 6: West Virginia University - Map & List
**Prompt for customer:**
```
Part A: Go to /app/chapters, select Division: "Power 5"
You should see "West Virginia University" in the list.

Part B: Go to /app/map, click on West Virginia state.
Right panel should show West Virginia University with stats.

✅ Pass if: WVU appears in both locations with BIG 12 conference
❌ Fail if: Missing from either location
```

## Test 7: Big 10 Schools Count
**Prompt for customer:**
```
Go to /app/chapters page.
Filter by Division: "Power 5"
Count how many schools show "BIG 10" in conference column.

Expected: Should be around 18 schools (includes USC, UCLA, Oregon, Washington, Penn State, Ohio State, Michigan, etc.)

✅ Pass if: Shows 18 BIG 10 schools
❌ Fail if: Shows significantly different number
```

## Test 8: SEC Schools Count
**Prompt for customer:**
```
Go to /app/chapters page.
Filter by Division: "Power 5"
Count how many schools show "SEC" in conference column.

Expected: Should be 16 schools (includes Alabama, Georgia, Florida, LSU, Texas, Oklahoma, etc.)

✅ Pass if: Shows 16 SEC schools
❌ Fail if: Shows significantly different number
```

## Test 9: ACC Schools Count
**Prompt for customer:**
```
Go to /app/chapters page.
Filter by Division: "Power 5"
Count how many schools show "ACC" in conference column.

Expected: Should be around 17 schools (includes Clemson, FSU, Miami, UNC, Duke, Notre Dame, Stanford, Cal, etc.)

✅ Pass if: Shows 17 ACC schools
❌ Fail if: Shows significantly different number
```

## Test 10: Big 12 Schools Count
**Prompt for customer:**
```
Go to /app/chapters page.
Filter by Division: "Power 5"
Count how many schools show "BIG 12" in conference column.

Expected: Should be around 16 schools (includes Kansas, Baylor, TCU, Texas Tech, Oklahoma State, West Virginia, BYU, Colorado, Arizona, etc.)

✅ Pass if: Shows 16 BIG 12 schools
❌ Fail if: Shows significantly different number
```

## Test 11: Map - Click College Logo (Oklahoma)
**Prompt for customer:**
```
Go to /app/map. Click on Oklahoma state to open the detail panel.
Then click on one of the college logos (OU or OSU circular markers).

Expected: Should zoom into campus view and show chapter markers in a circle pattern.

✅ Pass if: Zooms to campus and shows fraternity/sorority chapter markers
❌ Fail if: Nothing happens or error occurs
```

## Test 12: Power 5 Filter - No Non-Power 5 Schools
**Prompt for customer:**
```
Go to /app/chapters. Select Division: "Power 5".
Scroll through the list and verify NO schools from other conferences appear.

Schools that should NOT appear:
- Any MAC schools (like Ball State, Bowling Green)
- Any Mountain West schools (like Boise State)
- Any AAC schools (like Memphis, Tulane)
- Any Sun Belt schools
- Any FCS/D2/D3 schools

✅ Pass if: Only SEC, BIG 10, BIG 12, ACC schools appear
❌ Fail if: Any non-Power 5 schools are listed
```

## Test 13: Conference Column Exists
**Prompt for customer:**
```
Go to /app/chapters page.
Look at the table headers. You should see a column labeled "Conference".

✅ Pass if: "Conference" column is visible in table
❌ Fail if: Column is missing
```

## Test 14: Map Markers - All States
**Prompt for customer:**
```
Go to /app/map. Click on these states one by one and verify colleges appear:
- Texas (should show many colleges)
- California (should show many colleges)
- Pennsylvania (should show Penn State, Pitt, etc.)
- Florida (should show UF, FSU, Miami, etc.)
- Ohio (should show Ohio State, etc.)

✅ Pass if: All states show their colleges in the right panel when clicked
❌ Fail if: Any state shows "0 Colleges"
```

## Test 15: Search Functionality with Conference Filter
**Prompt for customer:**
```
Go to /app/chapters.
1. Select Division: "Power 5"
2. In search box, type "Alabama"
3. You should see University of Alabama with Conference: "SEC"

✅ Pass if: University of Alabama appears with SEC conference
❌ Fail if: No results or wrong conference
```

## Test 16: Database Conference Values - Spot Check
**Prompt for customer:**
```
Go to /app/chapters. Select Division: "Power 5".
Verify these specific schools have correct conferences:

- Penn State → BIG 10
- Ohio State → BIG 10
- Alabama → SEC
- Georgia → SEC
- Clemson → ACC
- Florida State → ACC
- Kansas → BIG 12
- Texas Tech → BIG 12
- Texas → SEC (recently moved from BIG 12)
- Oklahoma → SEC (recently moved from BIG 12)
- USC → BIG 10 (recently moved from PAC-12)
- UCLA → BIG 10 (recently moved from PAC-12)

✅ Pass if: All conferences match the list above
❌ Fail if: Any conference is wrong or blank
```

## Test 17: Map Statistics Bar
**Prompt for customer:**
```
Go to /app/map. Look at the statistics bar at the top showing:
- X States
- X Colleges
- X Chapters
- X Members

All numbers should be greater than 0.

✅ Pass if: All stats show positive numbers
❌ Fail if: Any stat shows 0
```

## Test 18: Filter Persistence After Navigation
**Prompt for customer:**
```
1. Go to /app/chapters
2. Select Division: "Power 5"
3. Click on a college to view details
4. Click back button
5. Verify "Power 5" filter is still selected

✅ Pass if: Filter stays selected after navigation
❌ Fail if: Filter resets to "All" or another value
```

## Test 19: Conference Data in College Details
**Prompt for customer:**
```
Go to /app/chapters. Click on "University of Alabama" to open details.
Look for conference information displayed in the college details view.

✅ Pass if: Shows Conference: SEC somewhere in the details
❌ Fail if: No conference info shown
```

## Test 20: Power 5 Total Count
**Prompt for customer:**
```
Go to /app/chapters. Select Division: "Power 5".
Look at the count showing "Showing X of Y colleges" or similar.

Expected: Should show approximately 73 colleges total
(16 SEC + 18 BIG 10 + 16 BIG 12 + 17 ACC = ~67-73 depending on exact data)

✅ Pass if: Shows between 65-75 colleges
❌ Fail if: Shows significantly different number (like <50 or >100)
```

---

## Summary Report Template

After testing, fill out this summary:

**Total Tests:** 20
**Passed:** ___
**Failed:** ___
**Blocked/Unable to Test:** ___

**Critical Failures (if any):**
- Test #___ - Description of issue

**Notes:**
[Any additional observations or issues found during testing]

**Overall Status:**
- [ ] All tests passed - Ready for production
- [ ] Minor issues found - Needs fixes before release
- [ ] Major issues found - Needs significant work

---

## Quick Test (If Short on Time)

If you only have 5 minutes, run these critical tests:
1. Test #3 (Oklahoma State Detail Panel)
2. Test #1 (Power 5 Filter)
3. Test #4 (OU Conference = SEC)
4. Test #5 (OSU Conference = BIG 12)
5. Test #20 (Total Power 5 count)
