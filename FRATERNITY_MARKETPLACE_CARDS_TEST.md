# Fraternity Marketplace Cards - Chrome Testing Instructions

## Overview
Test the **fraternity/sorority chapter cards** displayed in the marketplace grid. Focus on layout, design, information display, and visual presentation.

## Test Environment
- **Frontend URL**: https://fraternitybase.com (or your deployed URL)
- **Local**: http://localhost:5173
- **Your Role**: Browse as a business user looking at chapter cards

---

## Test Objective

Evaluate the chapter cards shown in the marketplace grid, focusing on:
- Grid layout (must be **3 cards per row**)
- Card design and information display
- Visual hierarchy and readability
- Consistency across cards
- Responsive behavior

---

## Test 1: Grid Layout

### Steps:

1. **Navigate to the Chapter Marketplace/Browse Page**
   - Find the main page showing all fraternity/sorority chapters
   - Should see a grid of chapter cards

2. **Count Cards Per Row**
   - **CRITICAL REQUIREMENT**: Must show **exactly 3 cards per row** on desktop
   - Count carefully: How many cards appear in each row?
   - Current bug reported: Showing 4 cards per row (needs to be 3)

3. **Check Grid Spacing**
   - Is spacing between cards consistent?
   - Equal margins on all sides?
   - Cards aligned properly?
   - Any overlapping or awkward gaps?

4. **Test at Different Screen Sizes**
   - Full desktop (1920px wide): 3 cards per row
   - Laptop (1440px wide): Should still be 3 cards
   - Tablet (768px wide): Probably 2 cards per row
   - Mobile (390px wide): Probably 1 card per row

### Screenshots Required:
- [ ] Full desktop view showing multiple rows of cards (labeled: "Desktop - Full Grid")
- [ ] Zoomed view clearly showing 3 cards in one row (labeled: "3-Card Row Close-up")
- [ ] Tablet view (labeled: "Tablet - Grid Layout")
- [ ] Mobile view (labeled: "Mobile - Grid Layout")
- [ ] Screenshot with ruler/measurement showing card count per row

### What to Report:
- ✅ **CORRECT**: Exactly 3 cards per row on desktop
- ❌ **WRONG**: 2, 4, or any other number of cards per row
- Grid spacing measurement (even/uneven)
- Responsive behavior notes

---

## Test 2: Individual Chapter Card Design

### Steps:

1. **Examine a Single Chapter Card**
   - Pick any chapter card from the grid
   - Study all information displayed

2. **Check What Information is Shown**
   Document what appears on each card:
   - [ ] Chapter name (e.g., "Sigma Alpha Epsilon")
   - [ ] University name
   - [ ] Greek letters or symbol
   - [ ] Chapter photo/image
   - [ ] Location (city, state)
   - [ ] Member count
   - [ ] Rating or grade
   - [ ] Badges/tags (verified, popular, etc.)
   - [ ] Brief description/bio
   - [ ] Social media icons
   - [ ] CTA button (e.g., "View Details", "Request Partnership")

3. **Evaluate Information Hierarchy**
   - What's the first thing you notice?
   - Is the chapter name prominent?
   - Is the university name clear?
   - Can you quickly scan key info?

4. **Check Visual Design**
   - [ ] Card has clear borders/shadow
   - [ ] Background color/image
   - [ ] Typography is readable
   - [ ] Colors are professional
   - [ ] Greek life themed?
   - [ ] Icons/imagery appropriate

5. **Examine CTA Button**
   - [ ] What does the button say?
   - [ ] Is it prominent/stands out?
   - [ ] Clear what action it takes?
   - [ ] Does clicking it work?

### Screenshots Required:
- [ ] Single card close-up (front view)
- [ ] Card hover state (if applicable)
- [ ] Card with all information labeled (annotate what each element is)
- [ ] Multiple cards side-by-side for comparison

### What to Report:
- ✅ Professional, polished design
- ✅ Information is scannable and clear
- ✅ CTA is obvious
- ❌ Missing important information
- ❌ Cluttered or hard to read
- ❌ Unprofessional appearance

---

## Test 3: Card Consistency

### Steps:

1. **Compare Multiple Cards**
   - Look at 6-9 different chapter cards
   - Check if they all follow the same design pattern

2. **Check Consistency Across Cards**
   - [ ] Same size/dimensions
   - [ ] Same layout structure
   - [ ] Same information fields
   - [ ] Same typography
   - [ ] Same button placement
   - [ ] Same image dimensions

3. **Check for Variations**
   - Do some cards have features others don't?
   - Different images/photo quality?
   - Some cards more complete than others?
   - Any cards look broken or incomplete?

4. **Test Edge Cases**
   - [ ] Card with very long chapter name
   - [ ] Card with no photo/image
   - [ ] Card with minimal information
   - [ ] Card with lots of information

### Screenshots Required:
- [ ] Grid showing variety of cards (different chapters)
- [ ] Any inconsistencies found (side-by-side comparison)
- [ ] Example of incomplete/broken card (if found)

### What to Report:
- ✅ Consistent design across all cards
- ✅ Handles different content lengths well
- ❌ Inconsistent layouts
- ❌ Some cards look broken
- ❌ Missing data not handled gracefully

---

## Test 4: Card Interactivity

### Steps:

1. **Test Hover Effects**
   - Hover over a card
   - Does anything change?
   - Shadow, scale, color, border?
   - Is the effect subtle and professional?

2. **Test Click Behavior**
   - Click on the card itself (not the button)
   - Does it navigate somewhere?
   - Click on the CTA button
   - Does it work? Where does it go?

3. **Test Other Interactive Elements**
   - Can you click social media icons?
   - Favorite/bookmark functionality?
   - Quick actions?

### Screenshots Required:
- [ ] Card in default state
- [ ] Card in hover state
- [ ] Card in clicked/active state (if applicable)

### What to Report:
- ✅ Smooth, professional hover effects
- ✅ Clear what's clickable
- ✅ Buttons work as expected
- ❌ No hover feedback
- ❌ Unclear what's clickable
- ❌ **Buttons don't work** (CRITICAL - this was reported as broken)

---

## Test 5: Visual Design & Aesthetics

### Steps:

1. **Overall First Impression**
   - Look at the full marketplace grid
   - What's your immediate reaction?
   - Professional? Trustworthy? Modern?

2. **Color Scheme**
   - [ ] Colors appropriate for Greek life?
   - [ ] Consistent color palette?
   - [ ] Good contrast/readability?
   - [ ] Not too bright or harsh?

3. **Typography**
   - [ ] Font choices professional?
   - [ ] Text sizes appropriate?
   - [ ] Readable from normal distance?
   - [ ] Hierarchy clear (titles, subtitles, body)?

4. **Imagery/Photos**
   - [ ] Chapter photos high quality?
   - [ ] Consistent image sizes?
   - [ ] Placeholder images if no photo?
   - [ ] Images load quickly?

5. **Spacing & Whitespace**
   - [ ] Good use of whitespace?
   - [ ] Not too cramped?
   - [ ] Not too sparse?
   - [ ] Comfortable to scan?

### Screenshots Required:
- [ ] Full grid showing overall aesthetic
- [ ] Close-up of typography/text
- [ ] Example of good photo vs. placeholder
- [ ] Color palette (if you can capture it)

### What to Report:
- Overall aesthetic rating (1-10)
- What works well visually
- What could be improved
- Comparison to competitors (if relevant)

---

## Test 6: Card Information Completeness

### Steps:

1. **Identify Key Information Needed**
   As a business looking to partner, what do you need to know?
   - Chapter size/reach
   - Location
   - Contact ability
   - Engagement/activity level
   - Legitimacy/verification

2. **Check if Cards Provide This Info**
   - [ ] Can you assess chapter size?
   - [ ] Can you determine location?
   - [ ] Can you gauge engagement?
   - [ ] Can you verify legitimacy?
   - [ ] Can you understand the value proposition?

3. **Identify Missing Information**
   - What's NOT shown that should be?
   - What questions are left unanswered?
   - What would you want to know before clicking?

### Screenshots Required:
- [ ] Example of well-populated card (lots of info)
- [ ] Example of sparse card (minimal info)
- [ ] Annotated screenshot showing what's missing

### What to Report:
- ✅ Sufficient information to make decisions
- ✅ Value proposition is clear
- ❌ Key information missing
- ❌ Too much information (overwhelming)
- 💡 Suggestions for what to add/remove

---

## Test 7: Comparison & Scanning

### Steps:

1. **Try to Compare Two Chapters**
   - Pick two chapter cards
   - Try to quickly compare them
   - Which has more members?
   - Which is more active?
   - Which is nearby?

2. **Test Scanability**
   - Can you quickly scan 10-15 cards?
   - Can you find specific information fast?
   - Eye naturally drawn to important info?

3. **Test Filtering Impact**
   - Use filters (if available)
   - Do results make sense?
   - Easy to scan filtered results?

### Screenshots Required:
- [ ] Two cards side-by-side for comparison
- [ ] Eye-tracking simulation (what draws your attention first)

### What to Report:
- ✅ Easy to compare chapters
- ✅ Quick to scan and find info
- ❌ Hard to differentiate cards
- ❌ Takes too long to find specific info

---

## Test 8: Mobile Card Experience

### Steps:

1. **View Cards on Mobile**
   - Resize browser to mobile (390px width)
   - Or use Chrome DevTools device mode

2. **Check Mobile Card Layout**
   - How many cards per row? (Should be 1)
   - Do cards stack vertically?
   - Information still readable?
   - Touch targets big enough?

3. **Test Mobile Interactions**
   - Tap on a card
   - Tap on CTA button
   - Scroll through cards
   - Everything work smoothly?

### Screenshots Required:
- [ ] Mobile view of card grid (1 per row)
- [ ] Single card on mobile (close-up)
- [ ] Mobile scrolling behavior

### What to Report:
- ✅ Fully responsive on mobile
- ✅ Easy to use with touch
- ❌ Desktop layout crammed into mobile
- ❌ Hard to interact on small screen

---

## Specific Design Requirements to Verify

### CRITICAL REQUIREMENTS:

1. **Grid Layout: 3 Cards Per Row**
   - [ ] **VERIFIED**: Exactly 3 cards per row on desktop (1200px+ width)
   - [ ] **FAILED**: Currently showing 4 cards per row (needs fix)

2. **Left Sidebar Design**
   - [ ] Left sidebar has independent scrollability
   - [ ] NavBar content pinned at bottom of sidebar (frozen)
   - [ ] NavBar doesn't scroll away when scrolling menu

3. **No "Credit Card Required" Banner**
   - [ ] Confirmed: No "No Credit Card Required" banner visible

### Screenshots Required:
- [ ] Grid clearly showing 3-card layout (or current 4-card bug)
- [ ] Measurement/annotation proving card count per row

---

## Reporting Format

### For Each Test Section:

**Screenshots:** (clearly labeled)
- Provide all requested screenshots
- Annotate images if helpful
- Organize in logical order

**Observations:**
- ✅ What works well
- ❌ What's broken or needs improvement
- 💡 Specific suggestions

**Design Feedback:**
- Professional rating (1-10)
- Aesthetic appeal (1-10)
- Information clarity (1-10)
- Overall usability (1-10)

---

## Summary Questions

After testing the chapter cards, please answer:

1. **Are the cards showing 3 per row?** (CRITICAL)
   - Yes / No
   - If no, how many?

2. **Is the card design professional and appealing?**
   - Rating: __ / 10
   - Why?

3. **Is the information on cards sufficient?**
   - What's missing?
   - What's unnecessary?

4. **Can you quickly scan and compare chapters?**
   - Yes / No / Somewhat
   - Why?

5. **Would you click on a card to learn more?**
   - Yes / No
   - What would make you click?

6. **Do the cards convey trustworthiness?**
   - Yes / No
   - Why or why not?

7. **Overall card design rating: __ / 10**

8. **Top 3 improvements for the cards:**
   1.
   2.
   3.

---

## Deliverables

Please provide:
1. **Screenshots** of card grid and individual cards (labeled)
2. **Grid layout verification** (3 cards per row or current count)
3. **Design feedback** for card appearance
4. **Information completeness** assessment
5. **Top 3-5 specific improvements** for the cards
6. **Overall rating** of card design and usability

---

## Focus Areas

Please pay special attention to:

1. **Grid Layout** - Must be 3 cards per row
2. **Visual Design** - Professional, trustworthy, appealing
3. **Information Display** - Sufficient but not overwhelming
4. **Scanability** - Quick to browse and compare
5. **Consistency** - All cards look cohesive

---

Thank you for testing! Your feedback on the chapter cards will help us create the best marketplace experience. 🙏
