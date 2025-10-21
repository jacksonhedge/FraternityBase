# Map Testing Prompt for Claude Chrome

## Objective
Test the FraternityBase map functionality to identify issues with state clicks, college display, and data consistency.

## Testing Instructions

### 1. Navigate to the Map
- Go to https://fraternitybase.com
- Log in if needed
- Navigate to the Map page

### 2. Test State Click Functionality
For each of the following states, click on the state and report:
- **West Virginia**
- **Virginia**
- **Louisiana**
- **California**
- **Oregon**
- **Washington**

For each state, document:
1. ✅ Does the state highlight when clicked?
2. ✅ Does the right sidebar panel appear?
3. ✅ What does the panel show?
   - State name
   - Number of colleges listed
   - Actual college names visible
4. ✅ Check the browser console for any debug logs (look for 🗺️, 📍, ⚠️, ❌ emojis)
5. ❌ Any errors or issues?

### 3. Test Power 5 Filter
- Click the "Power 5" filter button
- Document which states light up on the map
- Click on the following Power 5 states:
  - **Louisiana** (should show LSU)
  - **California** (should show Stanford, Cal, USC, UCLA)
  - **Tennessee** (should show University of Tennessee)
  - **Texas** (should show University of Texas, Texas A&M)

For each state, report:
- How many colleges appear in the sidebar?
- Which specific colleges are listed?
- Do they match expected Power 5 schools?

### 4. Console Debugging
Open browser console (F12) and look for messages like:
- `⚠️ No abbreviation found for state:` [state name]
- `🗺️ State clicked:` [state name] `Abbr:` [abbreviation]
- `📍 Found X colleges in [state]`

**Report all console messages for the states tested above.**

### 5. Data Consistency Check
For West Virginia specifically:
1. Click on the state
2. Check console for: `📍 Found X colleges in WV`
3. If X = 0, report: "No colleges found in database for West Virginia"
4. If X > 0 but sidebar is empty, report: "Colleges found but not displaying"
5. Check if there's a filter active (Power 5, Big 10, etc.) that might be hiding colleges

### 6. Expected Results
Based on the code, here's what SHOULD happen:

**West Virginia:**
- Should have West Virginia University (WVU) - Big 12 conference
- Should show in Power 5 filter (Big 12 is Power 5)
- Console should show: `📍 Found X colleges in WV` where X ≥ 1

**Virginia:**
- Should show UVA, Virginia Tech (both ACC)
- Should show multiple colleges in sidebar

**Louisiana:**
- Should show LSU (SEC)
- Should appear when Power 5 filter is active

## Report Format

Please provide results in this format:

```
## STATE: [State Name]

### Click Behavior
- Map highlights: YES/NO
- Sidebar appears: YES/NO
- State name in sidebar: [What it shows]

### Colleges Listed
- Count: X colleges
- Names: [List all college names shown]

### Console Output
```
[Paste relevant console messages]
```

### Issues Found
- [List any problems, missing data, or unexpected behavior]

---
```

## Additional Notes
- Test with filters ON and OFF
- Check if some colleges appear only with certain filters
- Note any visual glitches or performance issues
- Report any JavaScript errors in the console

## Priority Issues to Look For
1. States with 0 colleges when they should have some
2. Missing Power 5 schools
3. Console errors or warnings
4. State abbreviation mismatches
5. Filter not working correctly
