# Fraternity Partnership Marketplace - Chrome Testing Instructions

## Overview
Test the **partnership marketplace** feature where businesses can browse fraternities/sororities and submit partnership requests.

## Test Environment
- **Frontend URL**: https://fraternitybase.com (or your deployed URL)
- **Local**: http://localhost:5173
- **Your Role**: Test as a BUSINESS user looking to partner with Greek chapters

---

## Pre-Test Setup

### Create a Business Account
1. Sign up as a business (not a chapter)
2. Company name: "Test Sports Bar & Grill" (or similar)
3. Email: test.business.[yourname]@example.com
4. Complete onboarding

### Expected Starting State
- You should have a subscription tier (Starter, Growth, or Enterprise)
- You should have partnership request quota visible
- You should be able to browse chapters

---

## Test 1: Browse Chapter Marketplace

### Objective
Test the main marketplace where businesses can discover and filter chapters.

### Steps:

1. **Navigate to Marketplace/Browse Chapters**
   - Look for "Browse Chapters", "Marketplace", "Find Chapters", or similar
   - Should be a main navigation item

2. **Check Chapter Grid Layout**
   - **CRITICAL**: Verify chapters display **3 cards per row** (not 2, not 4, exactly 3)
   - Check card spacing and alignment
   - Resize browser - does it adapt responsively?

3. **Examine Chapter Cards**
   Each chapter card should display:
   - [ ] Chapter name (e.g., "Sigma Alpha Epsilon")
   - [ ] University name
   - [ ] Chapter photo/logo
   - [ ] Key stats (member count, rating, etc.)
   - [ ] "Request Partnership" or "Contact" button
   - [ ] Any badges/indicators (verified, popular, etc.)

4. **Test Filtering/Search**
   - [ ] Can you search by chapter name?
   - [ ] Can you filter by university?
   - [ ] Can you filter by Greek organization?
   - [ ] Can you filter by location/state?
   - [ ] Can you sort (by rating, member count, etc.)?
   - [ ] Do filters work instantly or require "Apply"?

5. **Test Pagination/Loading**
   - [ ] How many chapters load initially?
   - [ ] Is there pagination or infinite scroll?
   - [ ] Does it show total chapter count?
   - [ ] Loading states when fetching data?

### Screenshots Needed:
- [ ] Full marketplace view (showing 3-card grid)
- [ ] Single chapter card (close-up)
- [ ] Filters panel
- [ ] Search in action
- [ ] Mobile view of marketplace

### What to Look For:
- ✅ Clean, scannable grid layout
- ✅ Exactly 3 chapter cards per row
- ✅ Easy to compare chapters side-by-side
- ✅ Clear CTAs on each card
- ✅ Fast loading/filtering
- ❌ Too many or too few cards per row
- ❌ Cluttered information
- ❌ Unclear how to take action

---

## Test 2: Chapter Detail Page

### Objective
View detailed information about a specific chapter before requesting partnership.

### Steps:

1. **Click on a Chapter Card**
   - Should navigate to chapter detail page
   - Or open a modal/drawer?

2. **Check Chapter Details Displayed**
   - [ ] Full chapter name and university
   - [ ] Greek organization info
   - [ ] Chapter description/bio
   - [ ] Member count
   - [ ] Location (city, state)
   - [ ] Social media links (Instagram, TikTok, etc.)
   - [ ] Contact email
   - [ ] Photos/gallery
   - [ ] Chapter statistics/achievements
   - [ ] Past partnerships (if any)

3. **Check "Request Partnership" CTA**
   - [ ] Is it prominently displayed?
   - [ ] Does it show your current quota?
   - [ ] Any info about pricing/compensation?

4. **Test Navigation**
   - [ ] Can you go back to marketplace easily?
   - [ ] Can you navigate to next/previous chapter?
   - [ ] Breadcrumbs or back button?

### Screenshots Needed:
- [ ] Full chapter detail page
- [ ] Request Partnership button/CTA
- [ ] Chapter stats/info section
- [ ] Mobile view

### What to Look For:
- ✅ Comprehensive chapter information
- ✅ Clear value proposition (why partner with this chapter?)
- ✅ Professional presentation
- ✅ Easy to request partnership
- ❌ Missing key information
- ❌ Unclear how to proceed
- ❌ Unprofessional or incomplete profiles

---

## Test 3: Submit Partnership Request

### Objective
Test the flow of submitting a partnership request to a chapter.

### Steps:

1. **Click "Request Partnership"**
   - Should open a form/modal

2. **Check Form Fields**
   Required fields should include:
   - [ ] Message to chapter (textarea)
   - [ ] Proposed compensation amount ($)
   - [ ] Partnership details/description
   - [ ] Timeline/duration
   - [ ] Any other relevant fields

3. **Check Platform Fee Display**
   - [ ] Does it show the 20% platform fee?
   - [ ] Example: If you enter $1,000 compensation, does it show:
     - Chapter receives: $1,000
     - Platform fee (20%): $200
     - Total you pay: $1,200
   - [ ] Is this calculation clear and automatic?

4. **Check Quota Display**
   - [ ] Does it show your remaining partnership requests?
   - [ ] Example: "You have 4 of 5 requests remaining this month"
   - [ ] Warning if you're running low?
   - [ ] What happens if you're at quota limit?

5. **Submit the Request**
   - [ ] Fill out the form with test data
   - [ ] Proposed compensation: $1,000
   - [ ] Message: "We'd love to partner with your chapter for our spring promotion..."
   - [ ] Click Submit

6. **Check Confirmation**
   - [ ] Success message displayed?
   - [ ] Shows request details?
   - [ ] Quota decremented?
   - [ ] Redirected somewhere?
   - [ ] Email confirmation sent?

### Test Data:
```
Proposed Compensation: $1,000.00
Message: "Hi [Chapter Name], we're a local sports bar and would love to partner with your chapter for our upcoming spring promotion. We're offering $1,000 for social media posts and event hosting. Let us know if you're interested!"
```

### Screenshots Needed:
- [ ] Partnership request form (empty)
- [ ] Partnership request form (filled)
- [ ] Platform fee calculation display
- [ ] Quota indicator
- [ ] Success confirmation
- [ ] Any error states

### What to Look For:
- ✅ Simple, clear form
- ✅ Platform fee calculation is automatic and transparent
- ✅ Quota is visible and updates
- ✅ Helpful placeholder text
- ✅ Clear success confirmation
- ❌ Confusing fee structure
- ❌ Hidden or unclear costs
- ❌ Quota not displayed
- ❌ No confirmation after submission

---

## Test 4: View Partnership Requests Dashboard

### Objective
Test the dashboard where businesses can see all their partnership requests.

### Steps:

1. **Navigate to "My Partnerships" or "Requests"**
   - Look for menu item like "My Requests", "Partnerships", "Proposals", etc.

2. **Check Request List View**
   Should display all your partnership requests with:
   - [ ] Chapter name
   - [ ] University
   - [ ] Status (Pending, Accepted, Rejected, Completed)
   - [ ] Compensation amount
   - [ ] Date submitted
   - [ ] Actions (View, Cancel, etc.)

3. **Check Status Indicators**
   - [ ] Pending requests clearly marked
   - [ ] Accepted requests highlighted
   - [ ] Rejected requests visible
   - [ ] Completed partnerships shown

4. **Test Filtering/Sorting**
   - [ ] Can you filter by status?
   - [ ] Can you sort by date?
   - [ ] Can you search by chapter name?

5. **View Request Details**
   - [ ] Click on a request to see full details
   - [ ] Shows your original message?
   - [ ] Shows compensation breakdown?
   - [ ] Shows chapter response (if any)?
   - [ ] Payment status?

6. **Test Cancel Request**
   - [ ] Can you cancel a pending request?
   - [ ] Does quota get refunded?
   - [ ] Confirmation dialog?

### Screenshots Needed:
- [ ] Partnership requests list/dashboard
- [ ] Individual request detail view
- [ ] Different status indicators
- [ ] Empty state (if no requests yet)

### What to Look For:
- ✅ Easy to track all requests
- ✅ Clear status indicators
- ✅ Can take action on requests
- ✅ Historical record of partnerships
- ❌ Confusing layout
- ❌ Can't find requests
- ❌ No way to cancel/edit

---

## Test 5: Subscription & Quota Management

### Objective
Test how subscription tiers and partnership quotas are displayed and managed.

### Steps:

1. **Find Subscription Info**
   - Look in account settings, billing, or dashboard
   - Should show current tier

2. **Check What's Displayed**
   - [ ] Current tier (Starter, Growth, Enterprise)
   - [ ] Monthly price
   - [ ] Partnership request quota
   - [ ] Requests used this month
   - [ ] Requests remaining
   - [ ] Reset date (when quota refreshes)

3. **Check Quota Warnings**
   - [ ] Warning when running low on requests?
   - [ ] What happens when quota is exhausted?
   - [ ] Prompt to upgrade tier?

4. **Test Upgrade Flow**
   - [ ] Can you upgrade from Starter → Growth?
   - [ ] Is pricing clear?
   - [ ] Stripe checkout?
   - [ ] Proration explained?

5. **Check Tier Comparison**
   - [ ] Can you see all tier options?
   - [ ] Feature comparison table?
   - [ ] Clear differences between tiers?

### Screenshots Needed:
- [ ] Subscription info/settings
- [ ] Quota display
- [ ] Tier comparison/upgrade options
- [ ] Quota exhausted state (if you can trigger it)

### What to Look For:
- ✅ Always visible quota status
- ✅ Clear pricing and tier benefits
- ✅ Easy to upgrade
- ✅ Transparent about limits
- ❌ Hidden quota information
- ❌ Confusing tier differences
- ❌ Hard to understand pricing

---

## Test 6: Mobile Experience

### Objective
Test the entire partnership marketplace on mobile/small screens.

### Steps:

1. **Resize Browser to Mobile** (or use Chrome DevTools device mode)
   - iPhone 13 Pro (390px width)
   - iPad (768px width)

2. **Test Chapter Grid on Mobile**
   - **CRITICAL**: How many cards per row on mobile?
   - Should likely be 1 card per row on phone
   - Maybe 2 on tablet
   - Is it readable and usable?

3. **Test Navigation on Mobile**
   - [ ] Does left sidebar work on mobile?
   - [ ] Hamburger menu?
   - [ ] Can you access all features?

4. **Test Forms on Mobile**
   - [ ] Partnership request form usable?
   - [ ] Keyboard covers form fields?
   - [ ] Can you scroll and submit?

5. **Test Overall UX**
   - [ ] Touch targets big enough?
   - [ ] No horizontal scrolling?
   - [ ] Readable text sizes?

### Screenshots Needed:
- [ ] Mobile marketplace (chapter grid)
- [ ] Mobile navigation
- [ ] Mobile partnership request form
- [ ] Mobile requests dashboard

### What to Look For:
- ✅ Fully responsive
- ✅ Easy to use on phone
- ✅ No broken layouts
- ❌ Desktop layout crammed into mobile
- ❌ Unusable on small screens

---

## Test 7: Edge Cases & Error Handling

### Objective
Test how the system handles edge cases and errors.

### Steps:

1. **No Chapters Available**
   - What if marketplace is empty?
   - Good empty state message?

2. **Quota Exceeded**
   - Try to submit request when quota is 0
   - What happens?
   - Clear error message?
   - Prompt to upgrade?

3. **Invalid Compensation Amount**
   - Try $0
   - Try $50 (below minimum of $100)
   - Try negative number
   - Try non-numeric input
   - Good validation?

4. **Form Errors**
   - Submit empty form
   - Missing required fields
   - Error messages helpful?

5. **Network Errors**
   - What if API is slow?
   - Loading states?
   - Error messages if request fails?

### Screenshots Needed:
- [ ] Empty state
- [ ] Quota exceeded error
- [ ] Validation errors
- [ ] Any other error states

---

## Test 8: Design & UI Consistency

### Specific Design Requirements to Verify:

1. **Left Sidebar Navigation**
   - [ ] **Left sidebar has independent scrollability** (can scroll menu separately from main content)
   - [ ] **NavBar content pinned at bottom of sidebar** (like frozen row in Google Sheets, but vertical)
   - [ ] When you scroll the left menu, NavBar stays at bottom (doesn't scroll away)
   - [ ] User info, settings, logout at bottom of left sidebar
   - [ ] NOT a horizontal NavBar at top

2. **Chapter Cards Grid**
   - [ ] **Exactly 3 cards per row** on desktop
   - [ ] Proper spacing between cards
   - [ ] Cards are equal height
   - [ ] Responsive on smaller screens

3. **No "Credit Card Required" Banner**
   - [ ] Should NOT see "No Credit Card Required" anywhere
   - [ ] (System now requires payment/subscription)

4. **Color Scheme & Branding**
   - [ ] Consistent colors throughout
   - [ ] Professional look for B2B marketplace
   - [ ] Greek life themed?

### Screenshots Needed:
- [ ] Left sidebar showing independent scroll
- [ ] NavBar pinned at bottom of sidebar
- [ ] Chapter grid showing 3-card layout
- [ ] Overall page design

---

## Reporting Format

For each test section, please provide:

### 1. Screenshots
Label each screenshot clearly (e.g., "Marketplace - 3 card grid", "Partnership request form")

### 2. Observations

**What Works Well ✅:**
- List positive findings
- Good UX patterns
- Delightful features

**What's Broken or Confusing ❌:**
- Bugs or errors
- Unclear flows
- Missing features
- Design issues

**Suggestions for Improvement 💡:**
- How to fix issues
- Feature enhancements
- UX improvements

### 3. Priority Issues

List top 5 most critical issues to fix:
1. [Critical issue]
2. [Important issue]
3. [Medium priority]
4. [Nice to have]
5. [Polish/refinement]

---

## Summary Questions

After testing everything, please answer:

1. **Would you use this as a business?** Why or why not?

2. **Is the value proposition clear?** (Browse chapters → Request partnership → Pay with fee)

3. **Is the pricing model transparent?** (Subscription + 20% platform fee)

4. **What's the biggest UX issue?**

5. **What's the most impressive feature?**

6. **Overall rating: __ / 10**

7. **Would you recommend this to a friend running a bar/restaurant?**

---

## Test Completion Checklist

- [ ] Browsed chapter marketplace
- [ ] Viewed chapter details
- [ ] Submitted partnership request
- [ ] Viewed requests dashboard
- [ ] Checked subscription/quota info
- [ ] Tested on mobile
- [ ] Tested edge cases
- [ ] Verified design requirements (3 cards, pinned navbar, scrollable sidebar)
- [ ] Took comprehensive screenshots
- [ ] Documented bugs and suggestions

---

## Deliverables

Please provide:
1. **Screenshots** of all major screens (organized in folders)
2. **Written report** covering all test sections
3. **Bug list** with severity ratings
4. **Top 5 priority improvements**
5. **Overall assessment** and rating

---

Thank you for testing! Your feedback will directly improve the FraternityBase partnership marketplace. 🙏
