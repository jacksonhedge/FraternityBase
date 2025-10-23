# FraternityBase Stress Tests for Claude Chrome

## Test 1: New User Registration & Basic Tier Navigation

**Objective:** Test account creation and basic navigation as a trial/basic user

**Prompt for Claude Chrome:**
```
Go to https://fraternitybase.com and complete the following test:

1. ACCOUNT CREATION:
   - Click "Sign Up" or "Register"
   - Create a new account with:
     - Email: test_basic_[timestamp]@example.com
     - Company Name: "Test Company Basic [timestamp]"
     - Password: TestPassword123!
   - Complete the registration process
   - Note any errors or issues

2. DASHBOARD EXPLORATION:
   - Navigate to the main dashboard
   - Check if the map loads properly
   - Try zooming in/out on the map
   - Click on 2-3 different colleges on the map
   - Take screenshots of the map and dashboard

3. BROWSE CHAPTERS:
   - Navigate to /app/chapters
   - Use the search bar to search for "Alpha"
   - Try filtering by:
     - Fraternity type
     - Grade/rating
     - State/location
   - Click on 3 different chapter cards to view details
   - Note which information is visible vs. locked

4. VIEW COLLEGES:
   - Navigate to /app/colleges
   - Browse the college list
   - Click on 2-3 different colleges
   - Check what information is available

5. TEST SUBSCRIPTION PAGE:
   - Navigate to /app/subscription
   - Verify all 4 tiers are visible:
     - Basic ($4.99/mo)
     - Team ($29.99/mo)
     - Enterprise Tier 1 ($299.99/mo)
     - Enterprise Tier 2 ($2,222/mo)
   - Toggle between Monthly and Annual billing
   - Verify pricing changes with 10% discount for annual
   - DO NOT click any purchase buttons

6. PROFILE & SETTINGS:
   - Navigate to /app/profile
   - Check what settings are available
   - Try updating company information (if allowed)

7. CREDITS PAGE:
   - Navigate to /app/credits
   - Check credit balance
   - View pricing for different unlock types
   - DO NOT purchase any credits

REPORT:
- List any broken links or 404 errors
- Note any UI bugs or visual issues
- Document loading time issues
- Report any features that don't work as expected
- Take screenshots of each major page
```

---

## Test 2: Team Tier User - Chapter Unlock Simulation

**Objective:** Test chapter unlock functionality and advanced search features

**Prompt for Claude Chrome:**
```
Go to https://fraternitybase.com and complete the following test as a Team tier user:

SETUP:
1. Log in to the admin panel at https://fraternitybase.com/admin-login
   - Use admin credentials (you'll need to provide these)
2. Navigate to /admin/companies
3. Create or find a test company
4. Set subscription_tier to "monthly" (Team tier)
5. Add 100 credits to the company balance
6. Log out of admin panel

MAIN TEST:
1. ACCOUNT LOGIN:
   - Go to https://fraternitybase.com/login
   - Log in with the test company credentials
   - Verify you see "Team" subscription tier

2. ADVANCED SEARCH & FILTERING:
   - Navigate to /app/chapters
   - Test advanced filters:
     - Filter by Grade (5.0⭐, 4.0-4.9⭐, 3.0-3.9⭐)
     - Filter by state (try 3 different states)
     - Filter by specific fraternity/sorority
     - Combine multiple filters
   - Search for specific chapter names
   - Sort by different criteria (name, grade, university)

3. CHAPTER DETAIL VIEWS:
   - Click on 5 different chapters
   - For each chapter, note:
     - What information is visible without unlock
     - What information requires unlock
     - The unlock price
     - Chapter grade/rating

4. SIMULATE CHAPTER UNLOCK:
   - Find a chapter with grade 4.0 or higher
   - Click "Unlock" button
   - GO THROUGH the unlock flow (payment modal, confirmation)
   - STOP before final payment confirmation
   - Take screenshots of the unlock modal/flow
   - Click "Cancel" and verify nothing was charged

5. TEST MAP FEATURES:
   - Navigate to /app/map
   - Use the following map features:
     - Zoom to different states
     - Click on multiple chapter markers
     - Test clustering behavior (zoom in/out)
     - Try the search/filter on the map view
   - Check if map performance is good with many markers

6. COLLEGES DEEP DIVE:
   - Navigate to /app/colleges
   - Use college filters:
     - Division 1 filter
     - Conference filters (SEC, Big 10, etc.)
     - Power 5 filter
   - Click on 5 different colleges
   - View which chapters are listed for each college

7. MY UNLOCKED PAGE:
   - Navigate to /app/my-unlocked
   - This should be empty (since we didn't complete unlocks)
   - Verify the empty state looks correct

REPORT:
- Document the unlock flow step-by-step
- Note any pricing inconsistencies
- Report filter performance issues
- Document any crashes or errors
- Verify credit balance didn't change (since no purchase made)
```

---

## Test 3: Enterprise Tier 1 - Full Feature Access

**Objective:** Test advanced features available to Enterprise Tier 1 users

**Prompt for Claude Chrome:**
```
Go to https://fraternitybase.com and test Enterprise Tier 1 features:

SETUP:
1. Access admin panel at https://fraternitybase.com/admin-login
2. Create or modify a test company:
   - Set subscription_tier to "enterprise"
   - Add 500 credits
   - Note the company ID
3. Log out and log in as that company

MAIN TEST:
1. VERIFY ENTERPRISE ACCESS:
   - Check /app/team page shows "Enterprise Tier 1"
   - Verify credit balance shows 500 credits
   - Check for any "Enterprise" badges or indicators

2. AMBASSADOR ACCESS:
   - Navigate to /app/ambassadors
   - Browse available ambassadors
   - Click on 3-5 ambassador profiles
   - Check what information is available
   - Note if warm introduction options are visible

3. INTRODUCTION REQUESTS:
   - Navigate to /app/requested-introductions
   - Check if there's a way to request introductions
   - View the introduction request flow (don't submit)
   - Note the pricing and process

4. ADVANCED ANALYTICS (if available):
   - Navigate to /app/analytics
   - Check what analytics are available
   - Try different time ranges
   - Export options (if available)

5. BULK OPERATIONS:
   - Navigate to /app/chapters
   - Test if bulk unlock or batch operations are available
   - Check for any Enterprise-only features
   - Try selecting multiple chapters (if possible)

6. API ACCESS (UI indication):
   - Navigate to /app/profile or /app/team
   - Look for API key section
   - Check for API documentation links
   - Note any API-related features

7. PRIORITY SUPPORT:
   - Look for support/help sections
   - Check if Enterprise tier gets special support options
   - Note any "Priority Support" badges or contact methods

8. UNLOCK ALLOWANCES:
   - Navigate to /app/chapters
   - Try to unlock chapters at different grade levels:
     - 1 Premium chapter (5.0⭐) - should see allowance
     - 1 Quality chapter (4.0-4.9⭐) - should see allowance
     - 1 Standard chapter (3.0-3.9⭐) - should see allowance
   - STOP before completing payment
   - Verify monthly allowances are displayed correctly

9. TEAM MANAGEMENT:
   - Navigate to /app/team
   - Check for team member management
   - Verify it shows "Up to 10 team seats"
   - Test adding a team member (cancel before saving)

REPORT:
- List all Enterprise-only features found
- Document any features that don't work
- Note UI differences from lower tiers
- Report on allowance system clarity
- Document API access UI/UX
```

---

## Test 4: Admin Panel & Data Integrity

**Objective:** Test admin panel functionality and data management

**Prompt for Claude Chrome:**
```
Go to https://fraternitybase.com/admin-login and test admin functionality:

ADMIN LOGIN:
1. Navigate to https://fraternitybase.com/admin-login
2. Enter admin credentials (you'll provide these)
3. Verify successful login to admin panel

ADMIN DASHBOARD:
1. Main Dashboard:
   - Check if dashboard loads
   - Verify key metrics are displayed
   - Note any errors in console

2. COMPANIES TAB:
   - Navigate to /admin/companies
   - Browse company list
   - Sort by different fields
   - Search for specific companies
   - Click on 2-3 companies to view details
   - Check credit balances and subscription tiers

3. FRATERNITIES TAB:
   - Navigate to /admin/fraternities
   - View list of Greek organizations
   - Click on 2-3 organizations
   - Check chapter counts for each

4. COLLEGES TAB:
   - Navigate to /admin/colleges
   - Test filters:
     - Division 1
     - Power 5
     - Conference filters (SEC, Big 10, etc.)
   - Sort by different criteria
   - Click on 3 colleges
   - View chapter counts per college

5. CHAPTERS TAB:
   - Navigate to /admin/chapters
   - Test filtering system:
     - Filter by fraternity
     - Filter by date added (24h, 7d, 30d)
     - Order by grade, name, university, recent
   - Clear filters and verify it works
   - Check results count updates properly
   - View chapter details for 3 chapters

6. DIAMOND CHAPTERS TAB:
   - Navigate to /admin/diamond-chapters
   - Check how many diamond chapters exist
   - If any exist, view their details
   - Note how diamond status is indicated

7. USERS/MEMBERS TAB:
   - Navigate to /admin/users
   - Browse member list
   - Filter by fraternity
   - Filter by recent additions
   - Sort by different fields
   - Check member counts

8. WAITLIST TAB:
   - Navigate to /admin/waitlist
   - View waitlist entries
   - Check entry details and timestamps

9. PAYMENTS TAB:
   - Navigate to /admin/payments
   - View recent transactions
   - Check payment amounts and statuses
   - Verify no test payments went through

10. UNLOCKS TAB:
    - Navigate to /admin/unlocks
    - View chapter unlock history
    - Filter by company or date
    - Check unlock prices and types

11. ANALYTICS TAB:
    - Navigate to /admin/analytics
    - View activity ticker tape
    - Check if recent activities are displayed
    - Verify ticker tape scrolls correctly (should NOT freeze on hover)

12. ACTIVITY LOG:
    - Navigate to /admin/activity
    - View recent system activities
    - Filter by activity type
    - Check timestamps and user info

DATA INTEGRITY CHECKS:
13. Cross-Reference Data:
    - Pick a company from Companies tab
    - Find their unlocks in Unlocks tab
    - Verify credit balance matches transaction history
    - Check for any data inconsistencies

14. Chapter Data Validation:
    - Pick 3 chapters
    - For each, verify:
      - University name matches Colleges tab
      - Fraternity name matches Fraternities tab
      - Member count makes sense
      - Grade is between 0-5.0
      - Status is valid

15. Recent Upload Tracking:
    - Check Chapters tab "Recently Added" filter
    - Verify Sigma Chi chapters show up (if uploaded recently)
    - Check member counts for recently uploaded chapters

REPORT:
- List any data inconsistencies
- Note any broken admin features
- Document performance issues with large datasets
- Report any security concerns
- Verify all filters and sorts work correctly
- Note if ticker tape freezes on hover (should be fixed)
- List any missing or incomplete data
```

---

## Test 5: Mobile Responsiveness & Cross-Browser

**Objective:** Test site responsiveness and cross-browser compatibility

**Prompt for Claude Chrome:**
```
Test FraternityBase responsiveness and compatibility:

MOBILE VIEWPORT TESTING:
1. Resize browser to mobile size (375x667 - iPhone SE)
2. Navigate through these pages:
   - Landing page (/)
   - Login page
   - Dashboard (/app/map)
   - Chapters list (/app/chapters)
   - Subscription page (/app/subscription)
   - Team page (/app/team)

3. For each page, check:
   - Does navigation menu work on mobile?
   - Are buttons accessible?
   - Is text readable?
   - Do forms work properly?
   - Are images/logos sized correctly?
   - Does the map work on mobile?

TABLET VIEWPORT (768x1024 - iPad):
4. Resize to tablet dimensions
5. Check same pages as mobile
6. Verify layout adapts properly

DESKTOP (1920x1080):
7. Test at full desktop resolution
8. Verify no layout issues at large screen sizes

RESPONSIVE FEATURES:
9. Test subscription page toggle at different sizes
10. Check if filters/dropdowns work on mobile
11. Verify modal dialogs display correctly on small screens
12. Test map zoom/pan on touch vs mouse

REPORT:
- Screenshot issues at each viewport size
- Note any responsive design breaks
- Document mobile usability issues
- List features that don't work well on mobile
```

---

## GENERAL TESTING NOTES:

### For All Tests:
- Clear browser cache before each test
- Use incognito/private browsing mode
- Take screenshots of any errors
- Record console errors (F12 > Console)
- Note page load times
- Test on both Chrome and Firefox if possible

### DO NOT:
- Complete actual purchases
- Use real credit card information
- Submit real company information
- Create more than 2-3 test accounts
- Upload any files unless instructed
- Modify production data

### Success Criteria:
✅ All pages load within 3 seconds
✅ No 404 or 500 errors
✅ All filters and sorts work
✅ Navigation is intuitive
✅ Forms validate properly
✅ No console errors on page load
✅ Mobile responsive design works
✅ Data displays consistently
✅ Unlock flow works (stops before payment)
✅ Annual/monthly toggle works correctly

### Report Format:
For each test, provide:
1. **Test Summary**: Pass/Fail with % completion
2. **Issues Found**: List all bugs/problems
3. **Screenshots**: Key pages and any errors
4. **Performance**: Load times, slow pages
5. **Suggestions**: UX improvements
6. **Severity**: Critical, High, Medium, Low for each issue

---

## Quick Test Commands

If you want Claude Chrome to run a specific quick test:

### Quick Test 1: Login & Navigation Flow (5 min)
```
Test basic login and navigation at https://fraternitybase.com:
1. Create account
2. Navigate to dashboard, chapters, colleges, subscription
3. Screenshot each page
4. Report any errors
```

### Quick Test 2: Subscription Page Verification (2 min)
```
Go to https://fraternitybase.com/app/subscription and verify:
1. All 4 tiers visible
2. Monthly/Annual toggle works
3. Pricing shows 10% discount for annual
4. Take screenshot
```

### Quick Test 3: Chapter Search & Filter (5 min)
```
Go to https://fraternitybase.com/app/chapters and test:
1. Search for "Alpha"
2. Filter by grade (5.0⭐)
3. Filter by state (Texas)
4. Sort by different options
5. Report any issues
```

### Quick Test 4: Map Performance (3 min)
```
Go to https://fraternitybase.com/app/map and test:
1. Map loads properly
2. Zoom in/out smoothly
3. Click on 5 chapter markers
4. Search works on map
5. Report performance
```
