# Claude Chrome Testing Instructions - FraternityBase

## Overview
Test the fraternity sign-up flow, dashboard, and overall UI/UX of the FraternityBase platform.

## Test Environment
- **Frontend URL**: https://fraternitybase.com (or your deployed URL)
- **Local Frontend**: http://localhost:5173 (if testing locally)
- **Backend API**: https://your-backend-url.vercel.app

## Test Scenarios

---

## 1. Fraternity Sign-Up Flow

### Test Objective
Verify that Greek chapters can sign up, create accounts, and onboard successfully.

### Steps to Test:

1. **Navigate to Sign-Up Page**
   - Go to the homepage
   - Look for "Sign Up" or "Get Started" button
   - Identify if there's a separate flow for chapters vs. businesses

2. **Complete Sign-Up Form**
   - Fill in chapter information:
     - Greek organization (e.g., "Sigma Alpha Epsilon")
     - University (e.g., "University of California, Berkeley")
     - Chapter name
     - Contact email
     - Password
   - Check for validation errors
   - Submit the form

3. **Email Verification**
   - Check if email verification is required
   - Note any confirmation messages

4. **Profile Completion**
   - After sign-up, check if there's a profile completion flow:
     - Chapter details (charter date, member count)
     - Social media handles
     - Contact information
     - House address
     - Officer information

5. **Take Screenshots**
   - Sign-up form (empty)
   - Sign-up form (filled)
   - Any validation errors
   - Success/confirmation screen
   - Profile completion screens

### What to Look For:
- ✅ Clear, intuitive form fields
- ✅ Helpful error messages
- ✅ Mobile-responsive design
- ✅ Progress indicators (if multi-step)
- ❌ Confusing language or unclear instructions
- ❌ Broken links or buttons
- ❌ Poor mobile experience
- ❌ "No Credit Card Required" banner (should NOT be present - we require payment now)

---

## 2. Fraternity Dashboard

### Test Objective
Explore the main dashboard that chapters see after logging in.

### Steps to Test:

1. **Login as a Chapter**
   - Use credentials from sign-up (or create a test account)
   - Navigate to dashboard

2. **Dashboard Overview**
   - Identify main sections/widgets
   - Check what data is displayed:
     - Chapter statistics?
     - Partnership requests?
     - Upcoming events?
     - Recent activity?
   - Look for navigation menu

3. **Explore Key Features**
   - **Partnership Requests** (if visible):
     - Can chapters see incoming partnership offers?
     - Can they accept/reject requests?
     - Is compensation clearly displayed?
   - **Profile Management**:
     - Can they edit chapter information?
     - Can they update social media links?
     - Can they manage officer roster?
   - **Payment Methods**:
     - Is there a section to add payment methods?
     - Stripe Connect onboarding?
   - **Analytics/Insights**:
     - Any data about chapter engagement?
     - Profile views?
     - Partnership history?

4. **Navigation & UX**
   - Test all menu items
   - Check if sidebar/header is clear
   - **IMPORTANT DESIGN REQUIREMENT**:
     - Left sidebar menu should have its OWN scrollability (independent scroll from main content)
     - NavBar content should be pinned/frozen at the BOTTOM of the left sidebar (like a frozen row in Google Sheets, but vertical)
     - When you scroll the left menu, the NavBar stays stuck at the bottom
     - NavBar should NOT be a horizontal bar at the top
   - Look for: User account info, settings, logout buttons at the bottom of the left menu, overlaid/frozen there
   - Test: Scroll the left menu to see if NavBar stays pinned at bottom
   - Try mobile view (resize browser)

5. **Take Screenshots**
   - Dashboard home screen
   - Each major section (partnerships, profile, settings, etc.)
   - Mobile view
   - Any empty states (if no data)

### What to Look For:
- ✅ Clear value proposition (why is this useful?)
- ✅ Easy navigation
- ✅ Important info is prominent
- ✅ Actions are clear (buttons, CTAs)
- ✅ Left sidebar has independent scrollability (can scroll menu items separately from main content)
- ✅ NavBar content is pinned at bottom of left sidebar (frozen/overlaid, stays put when scrolling menu)
- ❌ Cluttered or confusing layout
- ❌ Missing or unclear features
- ❌ Slow loading times
- ❌ NavBar is still a horizontal bar at the top (should be moved to left sidebar bottom)
- ❌ Left sidebar doesn't scroll independently
- ❌ NavBar scrolls away when scrolling the left menu (should stay pinned)

---

## 3. Overall UI/UX Assessment

### Test Objective
Provide feedback on the overall design, branding, and user experience.

### Areas to Evaluate:

1. **Visual Design**
   - Color scheme (does it feel trustworthy for Greek life?)
   - Typography (readable, professional?)
   - Use of images/icons
   - Consistency across pages

2. **Branding**
   - Logo placement and quality
   - Brand voice (copy/messaging)
   - Does it feel like a product for Greek organizations?

3. **Navigation & Information Architecture**
   - Is it easy to find things?
   - Logical menu structure?
   - Good use of breadcrumbs/back buttons?

4. **Content & Messaging**
   - Is the value proposition clear?
   - Are instructions helpful?
   - Appropriate tone for audience?

5. **Mobile Experience**
   - Responsive design?
   - Touch targets big enough?
   - Easy to use on phone?

6. **Performance**
   - Page load times
   - Smooth transitions/animations
   - Any errors in console?

### Take Screenshots:
- Homepage
- Any marketing/landing pages
- Sign-up flow (all steps)
- Dashboard (logged in)
- Profile pages
- Settings/account pages
- Mobile views of key screens

---

## 4. Specific UI Elements to Check

### Forms
- [ ] Clear labels
- [ ] Helpful placeholder text
- [ ] Good error messages
- [ ] Validation that makes sense
- [ ] Submit buttons are obvious

### Tables/Lists
- [ ] Easy to scan
- [ ] Sortable/filterable?
- [ ] Good use of whitespace
- [ ] Actions are clear

### Buttons/CTAs
- [ ] Primary actions stand out
- [ ] Consistent styling
- [ ] Hover states work
- [ ] Loading states (spinners?)

### Empty States
- [ ] Helpful when no data
- [ ] Clear next steps
- [ ] Not just blank space

---

## 5. Test Data

If you need to create test accounts, use:

### Test Chapter Account:
- **Organization**: Sigma Alpha Epsilon
- **University**: University of California, Berkeley
- **Email**: test.sae.berkeley@example.com
- **Password**: TestPassword123!

### Test Business Account:
- **Company**: Test Bar & Grill
- **Email**: test.business@example.com
- **Password**: TestPassword123!

---

## 6. Reporting Format

### For Each Test Section, Please Provide:

1. **Screenshots** (labeled clearly)
2. **Observations**:
   - What works well ✅
   - What's confusing or broken ❌
   - Suggestions for improvement 💡

3. **User Flow Commentary**:
   - Describe the experience in your own words
   - Note any friction points
   - Highlight delightful moments

4. **Technical Issues**:
   - Console errors
   - Broken links
   - Missing images
   - Slow loading

5. **Competitive Comparison** (if you want):
   - How does this compare to other marketplace/B2B platforms?
   - What's unique?
   - What's missing?

---

## 7. Specific Questions to Answer

1. **Sign-Up Flow**:
   - How long did it take?
   - Was anything confusing?
   - Would a real chapter complete this?

2. **Dashboard**:
   - What's the first thing you notice?
   - Can you tell what the platform does?
   - What actions can chapters take?

3. **Value Proposition**:
   - Is it clear why a chapter would use this?
   - Is it clear why a business would use this?

4. **Trust & Credibility**:
   - Does it feel professional?
   - Would you trust it with payment info?
   - Any red flags?

5. **Mobile Experience**:
   - Could you use this primarily on mobile?
   - What's better/worse on mobile?

---

## 8. Priority Feedback Areas

Focus especially on:

1. **First Impressions** - What do you see in the first 5 seconds?
2. **Sign-Up Friction** - Any barriers to completing sign-up?
3. **Dashboard Clarity** - Is it immediately useful?
4. **Partnership Flow** - How do partnerships work? Clear?
5. **Missing Features** - What feels incomplete?

---

## Deliverables

Please provide:
- [ ] Screenshots of all major screens
- [ ] Written feedback for each test section
- [ ] List of bugs/issues found
- [ ] 3-5 top priority improvements
- [ ] Overall impression (1-10 rating)

---

## Notes

- **Test in Chrome** (since you're Claude Chrome)
- **Try both desktop and mobile** views
- **Check console for errors** (F12 → Console tab)
- **Feel free to be critical** - honest feedback helps!
- **Think like a user** - would you actually use this?

---

## Questions?

If anything is unclear or you can't access certain areas, just document that and move on. The goal is to get a real user's perspective on the current state of the platform.

Thank you! 🙏
