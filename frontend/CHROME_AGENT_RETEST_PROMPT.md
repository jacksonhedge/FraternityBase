# Chrome Agent Retest Prompt - Florida Colleges Fix

Copy and paste this to your Claude Chrome agent:

---

**RETEST REQUIRED - Florida Colleges Fix Deployed**

I've just deployed a fix to production that should now show all 27 Florida colleges instead of 13. Please retest to verify the fix worked.

## Quick Retest Steps:

1. **Clear browser cache** (Important!):
   - Press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows) for hard refresh
   - OR open DevTools → Network tab → check "Disable cache"

2. **Navigate to**: https://fraternitybase.com/app/map

3. **Click Florida** on the map

4. **Check the college count**:
   - Should now show "**27 Colleges**" in the sidebar header stats
   - Previously showed 13 colleges ❌
   - Should now show 27 colleges ✅

5. **Verify these additional colleges appear** (these were missing before):
   - Barry University
   - Eckerd College
   - Edward Waters University
   - Embry-Riddle Aeronautical University
   - Flagler College
   - Florida Institute of Technology
   - Florida Southern College
   - Lynn University
   - Nova Southeastern University
   - Palm Beach Atlantic University
   - Rollins College
   - Saint Leo University
   - University of Tampa
   - University of West Florida

6. **Take screenshot** showing:
   - Sidebar header with "27 Colleges" stat
   - Scrolled list showing multiple colleges

7. **Report**:
   - ✅ PASS if showing 27 colleges
   - ❌ FAIL if still showing 13 or any other number
   - Include exact college count found
   - Screenshot proof

## Expected Result:
**Florida should show exactly 27 colleges** in the sidebar list.

The 13 colleges you found before should still be there, PLUS 14 additional colleges that were missing.

---

**IMPORTANT**: Make sure to hard refresh the page to bypass cached JavaScript files!
