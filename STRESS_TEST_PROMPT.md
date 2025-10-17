# 🧪 FraternityBase Subscription Unlock System - Comprehensive Stress Test

## 📋 Your Mission
Test the tier-specific subscription unlock system end-to-end and identify ALL bugs, edge cases, and UX issues.

---

## 🔐 Test Account Details
- **URL:** http://localhost:5173
- **Email:** jacksonfitzgerald25@gmail.com
- **Password:** [Use stored password]
- **Current Status:**
  - 603 credits
  - Monthly subscription ACTIVE
  - 5×5⭐ unlocks remaining
  - 5×4⭐ unlocks remaining
  - 10×3⭐ unlocks remaining
  - 1 warm intro remaining

---

## 🎯 Test Matrix: ALL Scenarios

### Test Group 1: Modal Display & UI

#### Test 1.1: 5.0⭐ Chapter Modal
**Steps:**
1. Navigate to Browse Fraternities
2. Filter by grade to find a 5.0⭐ chapter
3. Click "Click to unlock" button
4. Open browser console (F12)

**What to Check:**
- [ ] Modal IS VISIBLE on screen (not just blurred background)
- [ ] Purple banner shows "✨ Using Subscription Unlock"
- [ ] Shows "You have 5 Premium subscription unlocks remaining this month"
- [ ] Regular cost (9 credits) is STRUCK THROUGH
- [ ] Button is PURPLE and says "✨ Unlock (Subscription)"
- [ ] Console shows: `🔍 Modal props:` with subscription data
- [ ] Console shows: `⭐ 5.0 chapter:` with unlock data

**Copy all console logs starting with:** 🎯, ⭐, 🔍, ✅

#### Test 1.2: 4.0⭐ Chapter Modal
**Steps:**
1. Find a 4.0-4.9⭐ rated chapter
2. Click unlock

**What to Check:**
- [ ] Modal visible
- [ ] Purple banner shows "You have 5 Quality subscription unlocks remaining"
- [ ] Cost (5-7 credits) struck through
- [ ] Purple subscription button

#### Test 1.3: 3.0⭐ Chapter Modal
**Steps:**
1. Find a 3.0-3.9⭐ rated chapter
2. Click unlock

**What to Check:**
- [ ] Modal visible
- [ ] Purple banner shows "You have 10 Standard subscription unlocks remaining"
- [ ] Cost (2-3 credits) struck through
- [ ] Purple subscription button

---

### Test Group 2: Subscription Unlock Execution

#### Test 2.1: Unlock 5.0⭐ Chapter (Subscription)
**Steps:**
1. Open console
2. Note current values:
   - Credits: ___
   - Total unlocks in navbar: ___
   - 5⭐ unlocks on Billing page: ___/5
3. Click unlock on 5.0⭐ chapter
4. Click "✨ Unlock (Subscription)" button

**Expected Results:**
- [ ] Console shows: `🔓 Unlocking chapter: [id]`
- [ ] Console shows: `🔓 Unlock response: { success: true, usedSubscriptionUnlock: true, ... }`
- [ ] Console shows: `📢 Dispatched balanceUpdated event`
- [ ] Console shows: `📢 Received balanceUpdated event in Layout`
- [ ] Console shows: `💰 Balance updated in Layout`
- [ ] Modal closes
- [ ] Navigate to chapter detail page
- [ ] Credits STAY at 603 (NOT 602!)
- [ ] Navbar shows "603 credits • 19 unlocks" (decreased from 20)
- [ ] 5⭐ unlocks show 4/5 on Billing page (decreased from 5/5)

**Actual Results:**
- Credits after unlock: ___
- Navbar unlocks: ___
- 5⭐ unlocks: ___/5
- **Did it work correctly?** YES / NO

**Copy backend console logs** (from terminal running backend)

#### Test 2.2: Unlock 4.0⭐ Chapter (Subscription)
**Repeat Test 2.1 for 4.0⭐ chapter**

**Expected:**
- 4⭐ unlocks: 5/5 → 4/5
- Total unlocks: 19 → 18
- Credits stay 603

**Actual Results:**
- 4⭐ unlocks: ___/5
- Total unlocks: ___
- Credits: ___

#### Test 2.3: Unlock 3.0⭐ Chapter (Subscription)
**Repeat for 3.0⭐ chapter**

**Expected:**
- 3⭐ unlocks: 10/10 → 9/10
- Total unlocks: 18 → 17
- Credits stay 603

**Actual Results:**
- 3⭐ unlocks: ___/10
- Total unlocks: ___
- Credits: ___

---

### Test Group 3: Transaction History

After EACH unlock above, check Transaction History:

**Navigate to:** Team & Billing page → Purchase History section

#### For Subscription Unlocks:
**Expected:**
- [ ] New transaction appears at top
- [ ] Badge is PURPLE (not blue)
- [ ] Label: "Chapter unlock (Subscription)" OR "subscription_unlock"
- [ ] Amount: "Included" (NOT "-$2.70" or negative credits)
- [ ] Description shows chapter name
- [ ] Timestamp is current

**Actual:**
- Badge color: ___
- Label: ___
- Amount: ___
- Present in history? YES / NO

---

### Test Group 4: Credit Fallback (After Exhausting Subscription)

#### Test 4.1: Exhaust 5⭐ Subscription Unlocks
**Steps:**
1. Unlock 4 MORE 5.0⭐ chapters (you should have already unlocked 1)
2. After 5th unlock, verify navbar shows "15 unlocks" (5+5+10-5=15)
3. Verify 5⭐ shows 0/5

#### Test 4.2: Try 6th 5.0⭐ Chapter (Credit Fallback)
**Steps:**
1. Find ANOTHER 5.0⭐ chapter
2. Click unlock

**Expected Modal:**
- [ ] NO purple banner
- [ ] Cost shown as "9 Credits" (NOT struck through)
- [ ] Shows "Current Balance: 603 Credits"
- [ ] Shows "After Unlock: 594 Credits"
- [ ] Button is BLUE and says "Unlock for 9 Credits"

**After clicking unlock:**
- [ ] Credits DECREASE: 603 → 594
- [ ] Navbar shows same unlock count (15) - subscription unlocks exhausted
- [ ] Transaction shows BLUE badge
- [ ] Label: "Chapter unlock" (NO "Subscription")
- [ ] Amount: "-$2.70" or "-9 credits"

**Actual Results:**
- Modal showed subscription? YES / NO
- Credits after: ___
- Transaction badge color: ___
- Transaction amount: ___

---

### Test Group 5: Real-Time Updates

#### Test 5.1: Navbar Update Speed
**Steps:**
1. Unlock any chapter using subscription
2. Watch the navbar (top-right) WITHOUT refreshing page

**Timing Test:**
- [ ] Unlock count updates IMMEDIATELY (within 1 second)
- [ ] No page refresh required
- [ ] Update happens while still on unlock confirmation page OR after navigation

**Actual:** Updated in ___ seconds

#### Test 5.2: Subscription Benefits Update
**Steps:**
1. Unlock a chapter
2. Navigate to Team & Billing page
3. Check Subscription Benefits section

**Expected:**
- [ ] Updated counts show immediately
- [ ] Progress bars update correctly
- [ ] No page refresh required

**Actual:** Shows correct counts? YES / NO

---

### Test Group 6: Edge Cases

#### Test 6.1: Rapid Unlock Attempts (Double-Click Protection)
**Steps:**
1. Click unlock on a chapter
2. When modal appears, RAPIDLY click unlock button 5+ times

**Expected:**
- [ ] Only ONE unlock occurs
- [ ] No duplicate charges
- [ ] Button disables after first click
- [ ] Shows "Unlocking..." spinner

**Actual:** Created ___ unlocks (should be 1)

#### Test 6.2: Network Failure Handling
**Steps:**
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Try to unlock a chapter
4. Set back to "No throttling"

**Expected:**
- [ ] Shows error message
- [ ] Credits NOT deducted
- [ ] Modal doesn't close
- [ ] Can retry after restoring connection

#### Test 6.3: Already Unlocked Chapter
**Steps:**
1. Unlock a chapter successfully
2. Go back to Browse Fraternities
3. Find the SAME chapter
4. Try to unlock again

**Expected:**
- [ ] Shows "Unlocked" badge (NOT "Click to unlock")
- [ ] No unlock button visible
- [ ] Direct navigation to chapter details

#### Test 6.4: Insufficient Credits (After All Unlocks Used)
**Steps:**
1. After exhausting all subscription unlocks (20 total)
2. Set credits to 5 (ask admin to do this)
3. Try to unlock a 5.0⭐ chapter (costs 9 credits)

**Expected:**
- [ ] Modal shows "❌ Insufficient Credits"
- [ ] Button disabled
- [ ] Shows "You need 4 more credits"
- [ ] Prompts to purchase credits or upgrade

---

### Test Group 7: Mixed Tier Unlocks

#### Test 7.1: Unlock Pattern Testing
**Unlock in this specific order:**
1. 5.0⭐ chapter → Check counts
2. 3.0⭐ chapter → Check counts
3. 4.0⭐ chapter → Check counts
4. 5.0⭐ chapter → Check counts
5. 5.0⭐ chapter → Check counts

**Track the math:**
- Start: 5×5⭐ + 5×4⭐ + 10×3⭐ = 20 total
- After step 1: 4×5⭐ + 5×4⭐ + 10×3⭐ = 19 total ✓
- After step 2: 4×5⭐ + 5×4⭐ + 9×3⭐ = 18 total ✓
- After step 3: 4×5⭐ + 4×4⭐ + 9×3⭐ = 17 total ✓
- After step 4: 3×5⭐ + 4×4⭐ + 9×3⭐ = 16 total ✓
- After step 5: 2×5⭐ + 4×4⭐ + 9×3⭐ = 15 total ✓

**Does the math work?** YES / NO
**Discrepancies found:** ___

---

## 🐛 Bug Report Template

For EACH bug found, report:

```
BUG #___: [Short title]
SEVERITY: Critical / High / Medium / Low
COMPONENT: Frontend / Backend / Database / UI

STEPS TO REPRODUCE:
1.
2.
3.

EXPECTED BEHAVIOR:


ACTUAL BEHAVIOR:


CONSOLE LOGS:
[Paste relevant console logs]

SCREENSHOTS:
[Describe what you see]

IMPACT:
[How does this affect users?]
```

---

## 📊 Summary Report Format

At the end, provide:

```
✅ TOTAL TESTS RUN: ___
✅ TESTS PASSED: ___
❌ TESTS FAILED: ___
🐛 CRITICAL BUGS: ___
⚠️  HIGH PRIORITY BUGS: ___
💡 UX IMPROVEMENTS: ___

BLOCKING ISSUES (Cannot release):
-

NON-BLOCKING ISSUES (Can release with notes):
-

OVERALL ASSESSMENT:
[ ] READY FOR PRODUCTION
[ ] NEEDS FIXES - Can release in 1-2 days
[ ] MAJOR ISSUES - Do not release
```

---

## 🔍 Console Logs to Collect

**ALWAYS copy these when they appear:**
- 🎯 Modal render check
- ⭐ 5.0 chapter / 💎 4.0 chapter / 🟢 3.0 chapter
- 🔍 Modal props
- 🔓 Unlocking chapter
- 🔓 Unlock response
- 📢 Dispatched balanceUpdated event
- 📢 Received balanceUpdated event
- 💰 Balance updated in Layout
- ❌ Any errors

**Backend logs to check:**
- Open terminal running backend
- Look for: `POST /api/chapters/:id/unlock`
- Look for: `🎁 Using subscription unlock for X.X⭐ chapter`
- Look for: `✅ Subscription unlock used successfully`

---

## ⏱️ Time Estimate
- Basic testing (Groups 1-3): 20 minutes
- Comprehensive testing (All groups): 45-60 minutes
- Bug documentation: +15 minutes per bug found

---

## 📝 IMPORTANT NOTES

1. **Test methodically** - Don't skip tests even if previous ones passed
2. **Document everything** - Screenshots, console logs, actual vs expected
3. **Check backend logs** - Many bugs only visible in server console
4. **Test real-time updates** - Verify counts update without page refresh
5. **Break it creatively** - Try things users might do accidentally

---

**Ready? Open http://localhost:5173 and let's stress test this system! 🚀**
