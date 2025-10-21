# Chrome Agent Test Prompt for FraternityBase Map

Copy and paste this entire prompt to your Claude Chrome agent:

---

Please test the FraternityBase map functionality in production. Here's what I need you to do:

## Test Objective
Test that clicking Florida on the map shows 27 colleges in the sidebar menu.

## Step-by-Step Test:

1. **Navigate to the production map**:
   - Go to: https://fraternitybase.com/app/map
   - Wait for the page to fully load
   - Take a screenshot of the initial USA map view

2. **Click on Florida**:
   - Find the state of Florida on the USA map
   - Click directly on Florida
   - Wait 2 seconds for the sidebar to appear

3. **Verify the sidebar appears**:
   - Check if a sidebar slides in from the left side
   - Take a screenshot showing the sidebar
   - The sidebar should show "Florida" as the header

4. **Verify colleges are listed**:
   - Look for a list of colleges in the sidebar
   - Count how many colleges are visible
   - Scroll down in the sidebar to see all colleges
   - Take a screenshot of the scrolled list

5. **Check the stats**:
   - At the top of the sidebar, look for stats showing:
     - "X Colleges" (should say "27 Colleges")
     - "X Chapters" (total number)
     - "X Members" (total number)
   - Report these exact numbers

6. **Verify specific colleges**:
   - Look for these specific colleges in the list:
     - University of Florida
     - Florida State University
     - University of Miami
     - University of Central Florida
   - Confirm they are visible in the list

7. **Test college click**:
   - Click on "University of Florida" in the list
   - Wait for the map to zoom
   - Check if the sidebar updates to show UF chapters
   - Take a screenshot of the chapter view

8. **Check console for errors**:
   - Open browser console (F12)
   - Look for any console logs that say:
     - "🗺️ [MapPage - handleStateClick] State clicked: Florida"
     - "✅ [MapPage - handleStateClick] Loaded 27 colleges for FL"
   - Report any errors or warnings in red

9. **Test navigation back**:
   - Look for a "Back to Florida" or "Back to USA Map" button
   - Click it to return to the previous view
   - Verify it works

## Expected Results:
- ✅ Florida sidebar shows "27 Colleges"
- ✅ Sidebar contains a scrollable list of all 27 FL colleges
- ✅ Clicking a college zooms the map and shows chapters
- ✅ No console errors
- ✅ Navigation buttons work properly

## If Issues Found:
Please report:
1. What doesn't work (be specific)
2. What you see instead of expected behavior
3. Any console errors (copy exact error messages)
4. Screenshots showing the problem
5. The exact number of colleges shown (if not 27)

## Additional Notes:
- The 27 colleges should include major schools like UF, FSU, Miami, UCF, USF, etc.
- Each college card should show fraternity/sorority counts
- The map should zoom smoothly into Florida when clicked
- Make sure you're logged in to see full functionality
