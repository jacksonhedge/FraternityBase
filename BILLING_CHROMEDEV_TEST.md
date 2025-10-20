# Billing & Credits System - Chrome DevTools Test Plan

**Target URL:** `http://localhost:5173/app/credits` (or your production URL)
**Agent:** Claude ChromeDev MCP
**Objective:** Comprehensive testing of Billing page, Subscription system, and Credits functionality

---

## 🤖 Chrome DevTools Agent Instructions

Execute these steps in sequence using the Chrome DevTools MCP tools.

---

## Phase 1: Initial Navigation & Page Structure

### Step 1: Navigate to Billing/Credits Page
```
Tool: mcp__chrome-devtools__navigate_page
URL: http://localhost:5173/app/credits
```

**Expected Result:** Billing page loads showing subscription and credits sections

---

### Step 2: Take Initial Page Snapshot
```
Tool: mcp__chrome-devtools__take_snapshot
```

**Verify:**
- [ ] Page title or header visible
- [ ] Current Subscription section present
- [ ] Subscription Plans section visible
- [ ] Credit packages section exists
- [ ] Transaction history sections present

---

### Step 3: Check Console for Errors
```
Tool: mcp__chrome-devtools__list_console_messages
```

**Verify:**
- [ ] No critical JavaScript errors
- [ ] API calls successful (balance, transactions)
- [ ] No 404 or 500 errors
- [ ] Debug logs show account data loaded

---

## Phase 2: Current Subscription Section

### Step 4: Verify Current Subscription Display
From the snapshot, examine the "Current Subscription" section:

**Check:**
- [ ] Subscription tier displayed (Free/Team/Enterprise)
- [ ] Icon present (CreditCard/Zap/Crown)
- [ ] Pricing information shown ($29.99/month or "3-day trial")
- [ ] "Upgrade Plan" button visible
- [ ] Section has proper styling (white background, shadow, border)

---

### Step 5: Test Upgrade Plan Link
```
Tool: mcp__chrome-devtools__take_snapshot
# Find "Upgrade Plan" button UID
```

```
Tool: mcp__chrome-devtools__click
uid: [UID of "Upgrade Plan" button]
```

**Expected Result:**
- [ ] Navigates to `/app/subscription` page OR
- [ ] Scrolls down to Subscription Plans section

---

## Phase 3: Subscription Plans Section (NEW FEATURE)

### Step 6: Verify Billing Period Toggle
```
Tool: mcp__chrome-devtools__take_snapshot
```

**Verify Monthly/Annual Toggle:**
- [ ] Toggle exists with 2 buttons: "Monthly" and "Annual"
- [ ] "Annual" button shows "Save 10%" badge
- [ ] Toggle is in gray background container (bg-gray-100)
- [ ] One button is active (white background with shadow)

---

### Step 7: Test Annual Toggle Click
```
Tool: mcp__chrome-devtools__take_snapshot
# Find "Annual" button UID
```

```
Tool: mcp__chrome-devtools__click
uid: [UID of "Annual" button]
```

```
Tool: mcp__chrome-devtools__take_snapshot
```

**Expected Result:**
- [ ] Annual button becomes active (white bg)
- [ ] Monthly button becomes inactive (gray text)
- [ ] Pricing updates in subscription cards below
- [ ] Shows annual prices: Team ($323.89/year), Enterprise ($3,239.89/year)
- [ ] Displays "Save $XX/year" text in green

---

### Step 8: Verify Subscription Tier Cards
From the snapshot, examine the 2 subscription tier cards:

**Team Tier (Left Card):**
- [ ] Card has blue border (border-blue-300) if "RECOMMENDED"
- [ ] Shows "RECOMMENDED" badge at top
- [ ] Displays Team name and Zap icon (blue gradient)
- [ ] Shows monthly price: $29.99/mo
- [ ] Shows annual price: $26.99/mo ($323.89 billed annually)
- [ ] Lists 6 features with checkmarks
- [ ] Has subscribe button at bottom

**Enterprise Tier (Right Card):**
- [ ] Card has gray border or purple gradient
- [ ] Shows Crown icon (purple gradient)
- [ ] Shows monthly price: $299.99/mo
- [ ] Shows annual price: $269.99/mo ($3,239.89 billed annually)
- [ ] Lists 7+ features with checkmarks
- [ ] Has subscribe button at bottom

---

### Step 9: Verify Current Plan Badge (if user has subscription)
If user already has a subscription:

**Check:**
- [ ] Current plan card shows green ring (ring-2 ring-green-500)
- [ ] Shows "Current Plan" badge at top (green with checkmark)
- [ ] Subscribe button is disabled (gray, "Current Plan" text)
- [ ] Other tier shows "Upgrade to Enterprise" or "Change to Team"

---

### Step 10: Test Subscription Button Click (if allowed)
```
Tool: mcp__chrome-devtools__take_snapshot
# Find subscribe button UID (for tier user doesn't have)
```

```
Tool: mcp__chrome-devtools__click
uid: [UID of subscribe button]
```

**Expected Result (for NEW subscription):**
- [ ] Redirects to Stripe checkout page OR
- [ ] Shows loading spinner ("Processing...")

**Expected Result (for EXISTING subscriber - upgrade/change):**
- [ ] Shows browser confirmation dialog:
  - "You are upgrading/changing your subscription. You will be charged a prorated amount for the remainder of your billing period. Continue?"
- [ ] If confirmed, makes API call to `/credits/subscription/change`
- [ ] Shows success message with prorated amount
- [ ] Page refreshes to show new subscription tier

---

### Step 11: Verify Subscription Info Box
At bottom of Subscription Plans section:

**Check:**
- [ ] Blue info box present (bg-blue-50 border-blue-200)
- [ ] Contains note about unlock allowances and credits
- [ ] Shows ℹ️ icon
- [ ] Text explains: "Subscriptions include monthly unlock allowances and credits..."

---

## Phase 4: Subscription Benefits Section (if user has paid tier)

### Step 12: Verify Subscription Benefits Display
If user has Team or Enterprise subscription:

**Check:**
- [ ] "📊 Subscription Benefits" section visible
- [ ] Gradient background (from-blue-50 to-purple-50)
- [ ] Shows explanation text about monthly allowances

**Verify 4 Benefit Cards:**

**5.0⭐ Premium Unlocks:**
- [ ] Crown icon (yellow/amber gradient)
- [ ] Shows remaining/monthly count (e.g., "5 / 5")
- [ ] Progress bar filled correctly
- [ ] Shows "∞" if unlimited

**4.0-4.9⭐ Quality Unlocks:**
- [ ] Star icon (blue gradient)
- [ ] Shows remaining/monthly count
- [ ] Progress bar visible
- [ ] Shows "∞" if unlimited

**3.0-3.9⭐ Standard Unlocks:**
- [ ] Unlock icon (green gradient)
- [ ] Shows remaining/monthly count
- [ ] Progress bar visible
- [ ] Shows "∞" if unlimited

**Warm Intros:**
- [ ] Sparkles icon (purple gradient)
- [ ] Shows remaining/monthly count
- [ ] Progress bar visible
- [ ] Shows expiration date if applicable

---

### Step 13: Verify Team Seats Info (if Enterprise tier)
If user has Team or Enterprise subscription:

**Check:**
- [ ] Team Seats card visible
- [ ] Users icon (indigo gradient)
- [ ] Shows "X of Y seats used"
- [ ] Progress bar shows utilization
- [ ] Displays available seats count

---

### Step 14: Verify Reset Info Box
If subscription exists:

**Check:**
- [ ] Shows "Your subscription unlocks will reset on [DATE]"
- [ ] Date is subscription_current_period_end
- [ ] Blue background (bg-blue-50)
- [ ] ℹ️ icon present

---

## Phase 5: Credit Balance & Packages

### Step 15: Verify Current Balance Display
```
Tool: mcp__chrome-devtools__take_snapshot
```

**Check "Current Balance" section:**
- [ ] Large number showing credit balance (5xl font, bold)
- [ ] "credits" label next to number
- [ ] Subtitle: "Credits are used when subscription unlocks are exhausted"
- [ ] White background card with shadow

---

### Step 16: Verify Credit Packages Grid
**Check 5 Credit Packages:**

1. **Trial Package:**
   - [ ] 10 credits for $0.99
   - [ ] Shows $0.099/credit
   - [ ] Lists 3 features

2. **Starter Package:**
   - [ ] 100 credits for $59
   - [ ] Shows $0.59/credit
   - [ ] Lists 4 features

3. **Popular Package:**
   - [ ] 500 credits for $275
   - [ ] Shows $0.55/credit
   - [ ] "MOST POPULAR" badge (yellow gradient)
   - [ ] Gold ring around card (ring-2 ring-yellow-400)
   - [ ] Lists 5 features

4. **Professional Package:**
   - [ ] 1000 credits for $500
   - [ ] Shows $0.50/credit
   - [ ] Lists 5 features

5. **Enterprise Package:**
   - [ ] 5000 credits for $2000
   - [ ] Shows $0.40/credit
   - [ ] Lists 5 features
   - [ ] Mentions "Priority support"

---

### Step 17: Test Package Selection
```
Tool: mcp__chrome-devtools__take_snapshot
# Find a credit package card UID (e.g., Popular)
```

```
Tool: mcp__chrome-devtools__click
uid: [UID of Popular package card]
```

**Expected Result:**
- [ ] Selected package card gets blue border (border-blue-600)
- [ ] Selected package card gets blue background (bg-blue-50)
- [ ] Other packages return to gray border
- [ ] Buy button text updates to show selected package

---

### Step 18: Test Buy Credits Button
```
Tool: mcp__chrome-devtools__take_snapshot
# Find "Buy Credits" button UID
```

```
Tool: mcp__chrome-devtools__click
uid: [UID of Buy Credits button]
```

**Expected Result:**
- [ ] Button shows loading spinner
- [ ] Redirects to Stripe checkout page
- [ ] OR shows error if not authenticated

---

### Step 19: Verify "How Credits Work" Section
**Check 3 Info Cards:**

**💳 One-Time Purchase:**
- [ ] White card with emoji
- [ ] Explains no recurring charges

**♾️ Never Expire:**
- [ ] White card with emoji
- [ ] Explains credits don't expire

**💎 Volume Savings:**
- [ ] White card with emoji
- [ ] Explains "save up to 32%"

---

## Phase 6: Transaction History

### Step 20: Verify Invoice History Section
```
Tool: mcp__chrome-devtools__take_snapshot
```

**Check "Invoice history" table:**
- [ ] Table with 5 columns: Date, Invoice Type, Status, Cost, Actions
- [ ] Shows purchase transactions (top_up, auto_reload, subscription_change)
- [ ] All statuses show green "Paid" badge
- [ ] Costs formatted as currency ($XX.XX)
- [ ] "Download" button in Actions column
- [ ] Dates formatted correctly (MMM DD, YYYY)

**Verify Transaction Types Displayed:**
- [ ] "Credit purchase" for top_up
- [ ] "Auto-reload" for auto_reload
- [ ] "Subscription activated" for subscription_initial_grant
- [ ] "Subscription renewed" for subscription_renewal
- [ ] "Subscription changed" for subscription_change (NEW!)

**If no transactions:**
- [ ] Shows "No invoices yet. Purchase credits to get started."

---

### Step 21: Verify Purchase History Section
**Check "Purchase history" table:**
- [ ] Table with 4 columns: Date, Type, Description, Amount
- [ ] Shows usage transactions (chapter_unlock, warm_intro, ambassador_referral)
- [ ] Transaction types shown with color-coded badges:
  - Purple badges for subscription_ transactions
  - Blue badges for regular transactions
- [ ] Amounts shown in red (-$XX.XX) or "Included" (purple text)
- [ ] Descriptions show chapter names or intro details

**Verify Transaction Types:**
- [ ] "Chapter unlock" for chapter_unlock
- [ ] "Chapter unlock (Subscription)" for subscription_unlock (purple badge)
- [ ] "Warm introduction" for warm_intro
- [ ] "Warm intro (Subscription)" for subscription_warm_intro (purple badge)

**If no unlocks:**
- [ ] Shows "No purchases yet. Unlock chapters to see your purchase history."

---

## Phase 7: Responsive Design Testing

### Step 22: Test Mobile View (375x667)
```
Tool: mcp__chrome-devtools__resize_page
width: 375
height: 667
```

```
Tool: mcp__chrome-devtools__take_screenshot
filePath: /Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/billing_mobile.png
```

**Verify:**
- [ ] Subscription cards stack vertically (grid becomes 1 column)
- [ ] Credit packages stack or scroll horizontally
- [ ] Transaction tables have horizontal scroll (overflow-x-auto)
- [ ] Toggle buttons remain accessible
- [ ] All text remains readable
- [ ] No layout breaking or overlapping elements

---

### Step 23: Test Tablet View (768x1024)
```
Tool: mcp__chrome-devtools__resize_page
width: 768
height: 1024
```

```
Tool: mcp__chrome-devtools__take_screenshot
filePath: /Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/billing_tablet.png
```

**Verify:**
- [ ] Subscription cards show side-by-side (grid-cols-2)
- [ ] Credit packages show 3 columns (grid-cols-3)
- [ ] Tables fit better on screen
- [ ] All interactive elements accessible
- [ ] Proper spacing maintained

---

### Step 24: Reset to Desktop View
```
Tool: mcp__chrome-devtools__resize_page
width: 1920
height: 1080
```

---

## Phase 8: Network & Performance Testing

### Step 25: Check Network Requests
```
Tool: mcp__chrome-devtools__list_network_requests
resourceTypes: ["fetch", "xhr"]
```

**Verify API Calls:**
- [ ] `GET /api/credits/balance` - 200 OK
- [ ] `GET /api/user/profile` - 200 OK
- [ ] `GET /api/credits/transactions` - 200 OK
- [ ] No failed requests (4xx or 5xx)
- [ ] Response times reasonable (<2 seconds)

---

### Step 26: Verify API Response Data
From console logs or network requests:

**Check `/credits/balance` response:**
```json
{
  "balanceCredits": 100,
  "lifetimeSpentCredits": 500,
  "lifetimeEarnedCredits": 600,
  "subscriptionTier": "monthly" | "enterprise" | "trial",
  "subscriptionStatus": "active" | "past_due" | "canceled",
  "subscriptionPeriodEnd": "2025-11-17T...",
  "unlocks": {
    "fiveStar": { "remaining": 5, "monthly": 5, "isUnlimited": false },
    "fourStar": { "remaining": 5, "monthly": 5, "isUnlimited": false },
    "threeStar": { "remaining": 10, "monthly": 10, "isUnlimited": false }
  },
  "warmIntros": {
    "remaining": 1,
    "monthly": 1,
    "expiresAt": "2025-11-17T..."
  },
  "autoReload": {
    "enabled": false,
    "threshold": 10,
    "amount": 50
  }
}
```

**Verify:**
- [ ] All fields present
- [ ] Numbers are valid
- [ ] Dates properly formatted
- [ ] Subscription tier matches displayed tier
- [ ] Unlocks data structure correct

---

## Phase 9: Edge Cases & Error Handling

### Step 27: Test Without Authentication (if possible)
Navigate to billing page in incognito or logged out:

**Expected Result:**
- [ ] Redirects to login page OR
- [ ] Shows authentication error OR
- [ ] Shows loading state indefinitely (should timeout with error)

---

### Step 28: Test with Network Throttling
```
Tool: mcp__chrome-devtools__emulate_network
throttlingOption: "Slow 3G"
```

```
Tool: mcp__chrome-devtools__navigate_page
url: http://localhost:5173/app/credits
```

**Verify:**
- [ ] Loading states display (spinners, skeletons)
- [ ] Page doesn't break during slow load
- [ ] Error messages if API calls timeout
- [ ] Graceful degradation

```
Tool: mcp__chrome-devtools__emulate_network
throttlingOption: "No emulation"
```

---

## Phase 10: Final Screenshots & Comparison

### Step 29: Take Final Full-Page Screenshots
```
Tool: mcp__chrome-devtools__take_screenshot
fullPage: true
filePath: /Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/billing_full_page.png
```

**Capture specific sections:**

**Subscription Plans (Monthly):**
```
Tool: mcp__chrome-devtools__take_snapshot
# Find subscription section UID
```

```
Tool: mcp__chrome-devtools__take_screenshot
uid: [UID of subscription section]
filePath: /Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/subscription_monthly.png
```

**Subscription Plans (Annual):**
```
Tool: mcp__chrome-devtools__click
uid: [UID of Annual toggle button]
```

```
Tool: mcp__chrome-devtools__take_screenshot
uid: [UID of subscription section]
filePath: /Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/subscription_annual.png
```

---

### Step 30: Compare Monthly vs Annual Pricing
From screenshots, verify:

**Team Tier:**
- [ ] Monthly: $29.99/mo
- [ ] Annual: $26.99/mo ($323.89/year)
- [ ] Savings: $36.00/year
- [ ] Discount: 10%

**Enterprise Tier:**
- [ ] Monthly: $299.99/mo
- [ ] Annual: $269.99/mo ($3,239.89/year)
- [ ] Savings: $360.00/year
- [ ] Discount: 10%

---

## 📊 Test Results Summary

After running all tests, compile results:

### ✅ Passed Tests
- [ ] Page loads successfully
- [ ] Current subscription displays correctly
- [ ] Subscription plans section visible with 2 tiers
- [ ] Monthly/Annual toggle works
- [ ] Annual pricing shows 10% discount
- [ ] Pricing updates when toggling billing period
- [ ] Current plan badge shows for active subscription
- [ ] Upgrade/Change button text dynamic
- [ ] Confirmation dialog appears for subscription changes
- [ ] Subscription benefits section displays (if applicable)
- [ ] Unlock allowances show correctly
- [ ] Team seats display (if applicable)
- [ ] Credit balance displays
- [ ] 5 credit packages display correctly
- [ ] Package selection works (border changes)
- [ ] Buy credits button functional
- [ ] Invoice history table populates
- [ ] Purchase history table populates
- [ ] Transaction types labeled correctly
- [ ] Subscription change transactions logged (NEW!)
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] API calls successful
- [ ] No console errors
- [ ] Network requests complete successfully

### ❌ Failed Tests
*(Document any failures here)*

### ⚠️ Warnings/Issues
*(Document any non-critical issues here)*

---

## 🔍 Known Issues to Document

Based on new implementation, check for:

1. **Proration Display:**
   - [ ] Prorated amount shown in success message after subscription change
   - [ ] Prorated charge appears in transaction history
   - [ ] Correct calculation (credit for unused time + charge for new tier)

2. **Button State Management:**
   - [ ] Current plan button stays disabled
   - [ ] Other tier buttons show contextual text (Subscribe/Upgrade/Change)
   - [ ] Loading spinner shows during API calls
   - [ ] Buttons re-enable after API response

3. **Annual Price IDs:**
   - [ ] Are Stripe annual prices configured in `.env`?
   - [ ] Do annual subscriptions redirect to Stripe checkout correctly?
   - [ ] Does backend handle both `STRIPE_PRICE_MONTHLY_ANNUAL` and `STRIPE_PRICE_ENTERPRISE_ANNUAL`?

4. **Subscription Change Logic:**
   - [ ] Does upgrade from Team → Enterprise work?
   - [ ] Does downgrade from Enterprise → Team work?
   - [ ] Does period change (monthly → annual) work?
   - [ ] Does period change (annual → monthly) work?
   - [ ] Are benefits updated immediately after change?

---

## 📁 Output Files

All screenshots should be saved to:
- `/Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/`

Files generated:
1. `billing_full_page.png` - Complete billing page
2. `billing_mobile.png` - Mobile responsive view
3. `billing_tablet.png` - Tablet responsive view
4. `subscription_monthly.png` - Monthly pricing view
5. `subscription_annual.png` - Annual pricing view (10% discount)

---

## 🚀 Running the Tests

### Execute with ChromeDev Agent:

1. **Ensure servers are running:**
   ```bash
   # Backend (terminal 1)
   cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
   npm run dev

   # Frontend (terminal 2)
   cd /Users/jacksonfitzgerald/CollegeOrgNetwork/frontend
   npm run dev
   ```

2. **Login to the app** (if not already logged in)

3. **Give this test plan to ChromeDev Claude:**
   ```
   Execute the Billing & Credits System test plan at:
   /Users/jacksonfitzgerald/CollegeOrgNetwork/BILLING_CHROMEDEV_TEST.md

   Test the complete billing page including:
   - Subscription plans (monthly/annual toggle)
   - Credit packages
   - Transaction history
   - Subscription upgrade/change functionality
   ```

4. **Agent will execute all 30 test steps automatically**

5. **Review results and screenshots**

---

## ✅ Success Criteria

Billing & Credits system passes if:
- All 30 test steps complete without errors
- Subscription plans display correctly with monthly/annual toggle
- Annual pricing shows 10% discount ($323.89/year, $3,239.89/year)
- Current plan badge displays for active subscriptions
- Upgrade/Change buttons show contextual text
- Credit packages all display with correct pricing
- Transaction history shows all transaction types (including subscription_change)
- API calls succeed (balance, transactions, profile)
- No console errors
- Responsive design works on all screen sizes
- Screenshots show proper styling and layout
- Proration logic works for subscription changes (if testable)

---

## 🎯 Production Deployment Checklist

Before deploying to production:
- [ ] Create annual Stripe prices in Stripe Dashboard
- [ ] Update `.env` with `STRIPE_PRICE_MONTHLY_ANNUAL` and `STRIPE_PRICE_ENTERPRISE_ANNUAL`
- [ ] Test new subscription flow
- [ ] Test upgrade flow (Team → Enterprise)
- [ ] Test period change (monthly → annual)
- [ ] Verify webhook handles subscription updates
- [ ] Test proration calculations
- [ ] Verify transaction history logs subscription changes
- [ ] Check admin notifications created
- [ ] Test on production domain
- [ ] Monitor Stripe dashboard for successful checkouts
