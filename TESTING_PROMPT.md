# FraternityBase Subscription System Testing Guide

## 🎯 Testing Objective
Thoroughly test the tier-specific subscription unlock system to verify:
1. Subscription unlock counts display correctly
2. Unlock modal shows subscription vs credit usage
3. Subscription unlocks are used first, credits as fallback
4. Unlock counts update in real-time after unlocking
5. Transaction history distinguishes subscription from credit unlocks

## 🔐 Login Credentials
- **URL:** http://localhost:5173
- **Email:** jacksonfitzgerald25@gmail.com
- **Account Status:** Monthly subscription ACTIVE with:
  - 5×5⭐ unlocks remaining
  - 5×4⭐ unlocks remaining
  - 10×3⭐ unlocks remaining
  - 603 credits
  - 1 warm intro

## 📋 Testing Checklist

### Test 1: Verify Subscription Display in Navigation
**Steps:**
1. Navigate to http://localhost:5173 and login
2. Look at the top-right corner next to the profile dropdown
3. Verify you see: `603 credits • 20 unlocks` (in purple)

**Expected Result:**
- ✅ Credits show: "603 credits"
- ✅ Unlock count shows: "20 unlocks" in purple color
- ✅ Separated by bullet point (•)

**Screenshots:** Take screenshot of top navigation showing credits + unlocks

---

### Test 2: Verify Subscription Benefits on Team & Billing Page
**Steps:**
1. Navigate to Team & Billing page
2. Scroll to find "📊 Subscription Benefits" section
3. Verify progress bars and unlock counts

**Expected Result:**
- ✅ Section titled "📊 Subscription Benefits" appears
- ✅ Shows 4 cards: 5⭐ Premium, 4⭐ Quality, 3⭐ Standard, Warm Intros
- ✅ Each card shows: X/Y remaining with progress bar
- ✅ 5⭐: 5/5 remaining (yellow/gold progress bar)
- ✅ 4⭐: 5/5 remaining (blue progress bar)
- ✅ 3⭐: 10/10 remaining (green progress bar)
- ✅ Warm Intros: 1/1 remaining with expiry date
- ✅ Team Seats: Shows current usage

**Screenshots:** Take screenshot of entire Subscription Benefits section

---

### Test 3: Test Subscription Unlock for 5⭐ Chapter
**Steps:**
1. Navigate to Fraternities page (Browse Fraternities)
2. Find a 5.0⭐ rated chapter that is LOCKED
3. Click "Click to unlock" button
4. Observe the unlock modal that appears

**Expected Result - Modal Display:**
- ✅ Modal title: "Unlock Chapter"
- ✅ Purple banner appears with crown icon (👑)
- ✅ Banner text: "✨ Using Subscription Unlock"
- ✅ Shows: "You have 5 5⭐ subscription unlocks remaining this month"
- ✅ Regular credit cost is shown but STRUCK THROUGH
- ✅ Modal shows "Subscription Unlocks: 5 remaining"
- ✅ Button is PURPLE and says "✨ Unlock (Subscription)"

**Screenshots:**
- Screenshot of unlock modal showing subscription unlock details
- Screenshot of purple button

**Steps (continued):**
5. Click "✨ Unlock (Subscription)" button
6. Wait for unlock to complete

**Expected Result - After Unlock:**
- ✅ Modal shows spinner: "Unlocking..."
- ✅ Modal closes automatically
- ✅ Navigates to chapter detail page
- ✅ Chapter is now unlocked
- ✅ Credit balance DOES NOT decrease (still 603)
- ✅ Navigation shows: `603 credits • 19 unlocks` (decreased by 1)

**Screenshots:**
- Screenshot showing credits still at 603
- Screenshot showing 19 unlocks remaining

---

### Test 4: Verify Transaction History Shows Subscription Unlock
**Steps:**
1. Go back to Team & Billing page
2. Scroll to "Purchase history" section
3. Find the most recent unlock transaction

**Expected Result:**
- ✅ Transaction badge is PURPLE (not blue)
- ✅ Label says: "Chapter unlock (Subscription)"
- ✅ Amount shows: "Included" (not $0.00 or negative)
- ✅ Description shows chapter name
- ✅ Date is today's date

**Screenshots:** Screenshot of transaction history showing purple subscription unlock

---

### Test 5: Test Subscription Unlock for 4⭐ Chapter
**Steps:**
1. Navigate to Fraternities page
2. Find a 4.0-4.9⭐ rated chapter
3. Click "Click to unlock"
4. Verify modal shows 4⭐ subscription unlock
5. Click unlock

**Expected Result:**
- ✅ Purple banner shows "You have 5 4⭐ subscription unlocks remaining"
- ✅ After unlock: shows "4 remaining"
- ✅ Navigation updates to show 18 total unlocks
- ✅ Credits still 603 (unchanged)

---

### Test 6: Test Subscription Unlock for 3⭐ Chapter
**Steps:**
1. Find a 3.0-3.9⭐ rated chapter
2. Click unlock
3. Verify 3⭐ subscription unlock is used

**Expected Result:**
- ✅ Purple banner shows "You have 10 3⭐ subscription unlocks remaining"
- ✅ After unlock: shows "9 remaining"
- ✅ Navigation updates to show 17 total unlocks
- ✅ Credits still 603

---

### Test 7: Exhaust 5⭐ Unlocks and Test Credit Fallback
**Steps:**
1. Unlock 4 more 5⭐ chapters (total 5 unlocked)
2. Verify navigation shows 13 unlocks remaining
3. Try to unlock a 6th 5⭐ chapter

**Expected Result:**
- ✅ Modal NO LONGER shows purple banner
- ✅ Modal shows credit cost (NOT struck through)
- ✅ Shows: "Current Balance: 603 Credits"
- ✅ Shows: "After Unlock: 594 Credits" (or similar)
- ✅ Button is BLUE and says "Unlock for 9 Credits"
- ✅ After unlock: Credits DECREASE by 9
- ✅ Transaction history shows BLUE badge: "Chapter unlock"
- ✅ Amount shows: "-$2.70" (or credit equivalent)

**Screenshots:**
- Screenshot of modal showing BLUE (credit) unlock
- Screenshot of decreased credits after unlock

---

### Test 8: Verify Real-Time Updates
**Steps:**
1. Open browser console (F12 → Console)
2. Unlock a chapter using subscription
3. Watch console logs

**Expected Result:**
- ✅ Console shows: "🔓 Unlocking chapter: [chapter-id]"
- ✅ Console shows: "🔓 Unlock response: { success: true, usedSubscriptionUnlock: true, ... }"
- ✅ Navigation unlock count updates immediately (no page refresh needed)

---

### Test 9: Verify Subscription Benefits Section Rendering
**Steps:**
1. Open browser console
2. Navigate to Team & Billing
3. Look for console logs

**Expected Result:**
- ✅ Console shows: "🔍 Raw API response: { ... }"
- ✅ Console shows: "🔍 subscriptionTier: monthly"
- ✅ Console shows: "🔍 unlocks object: { fiveStar: {...}, fourStar: {...}, threeStar: {...} }"
- ✅ Console shows: "🎨 Subscription Benefits Render Check: { tier: 'monthly', hasUnlocks: true, shouldShow: true }"

**If Section is MISSING:**
- ❌ Console shows: "shouldShow: false"
- Copy ALL console logs and report what `tier` and `hasUnlocks` values show

---

## 📊 Summary Report Template

After testing, provide this summary:

```
✅ PASSED TESTS:
- [ ] Navigation shows credits + unlocks
- [ ] Subscription Benefits section displays
- [ ] 5⭐ subscription unlock works
- [ ] 4⭐ subscription unlock works
- [ ] 3⭐ subscription unlock works
- [ ] Purple modal for subscription unlocks
- [ ] Transaction history shows purple badges
- [ ] Credit fallback works after exhausting subscription
- [ ] Real-time unlock count updates

❌ FAILED TESTS:
- [ ] List any failed tests here with error details

📸 SCREENSHOTS:
- Attach all screenshots taken during testing

🐛 BUGS FOUND:
- List any unexpected behavior

💡 SUGGESTIONS:
- Any UX improvements noticed
```

---

## 🔧 Troubleshooting

**If unlock counts don't show:**
1. Check browser console for errors
2. Copy ALL console logs starting with 🔍 or 🎨
3. Report the subscriptionTier and unlocks values

**If modal doesn't appear:**
1. Check browser console for errors
2. Report any "Unlocking chapter" or "Unlock response" logs
3. Check Network tab for failed API calls

**If Subscription Benefits section missing:**
1. Check console for "🎨 Subscription Benefits Render Check"
2. Report tier, hasUnlocks, and shouldShow values
3. Check if tier is exactly "monthly" (case-sensitive)

---

## 🎯 Success Criteria

Test is SUCCESSFUL if:
- ✅ All 9 tests pass
- ✅ Unlock counts display and update correctly
- ✅ Subscription unlocks are free (don't use credits)
- ✅ Credits only used when subscription exhausted
- ✅ Purple UI for subscription, blue for credits
- ✅ Real-time updates work without page refresh

---

**Backend:** http://localhost:3001 (already running)
**Frontend:** http://localhost:5173 (already running)
**Email:** jacksonfitzgerald25@gmail.com
