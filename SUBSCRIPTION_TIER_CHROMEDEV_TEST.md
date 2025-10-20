# Subscription Tier Update Verification - Chrome DevTools Test

**Target URL:** `http://localhost:5173/app/billing`
**Agent:** Claude ChromeDev MCP
**Objective:** Verify subscription tier unlock allocations display correctly after October 17, 2025 updates

---

## Expected Values

### Team Tier ($29.99/month)
- ✅ 2 Premium (5.0⭐) unlocks/mo
- ✅ 8 Quality (4.0-4.9⭐) unlocks/mo
- ✅ 10 Standard (3.0-3.9⭐) unlocks/mo
- ✅ 1 Warm Introduction/mo
- ✅ 3 Team seats

### Enterprise Tier ($299.99/month)
- ✅ 12 Premium (5.0⭐) unlocks/mo
- ✅ Unlimited Quality (4.0-4.9⭐) unlocks
- ✅ Unlimited Standard (3.0-3.9⭐) unlocks
- ✅ 1000 monthly credits included
- ✅ 3 Warm Introductions/mo
- ✅ 10 Team seats

---

## Test Execution

### Step 1: Navigate to Billing Page
```
Tool: mcp__chrome-devtools__navigate_page
URL: http://localhost:5173/app/billing
```

**Expected Result:** Page loads showing subscription plans and credit packages

---

### Step 2: Take Full Page Snapshot
```
Tool: mcp__chrome-devtools__take_snapshot
```

**Verify Page Structure:**
- [ ] Page loads without errors
- [ ] "Subscription Plans" section visible
- [ ] Monthly/Annual billing toggle visible
- [ ] Two subscription tier cards visible (Team and Enterprise)

---

### Step 3: Verify Billing Period Toggle (Monthly)
Ensure "Monthly" billing period is selected by default.

```
Tool: mcp__chrome-devtools__take_snapshot
```

**Verify:**
- [ ] "Monthly" button is highlighted/active
- [ ] Team tier shows: "$29.99/mo"
- [ ] Enterprise tier shows: "$299.99/mo"

---

### Step 4: Locate Team Tier Card
From the snapshot, identify the Team tier card elements.

**Verify Team Tier Header:**
- [ ] Title: "Team"
- [ ] Icon: Zap (lightning bolt)
- [ ] Price: "$29.99/mo"
- [ ] Badge: "RECOMMENDED" (if popular: true)

---

### Step 5: Verify Team Tier Features List
From the snapshot, examine the Team tier features list.

**Expected Features (in order):**
1. [ ] "2 Premium (5.0⭐) unlocks/mo"
2. [ ] "8 Quality (4.0-4.9⭐) unlocks/mo"
3. [ ] "10 Standard (3.0-3.9⭐) unlocks/mo"
4. [ ] "1 Warm Introduction/mo"
5. [ ] "3 Team seats"
6. [ ] "Advanced search & filters"
7. [ ] "Email support"
8. [ ] "Purchase additional credits"

**Critical Check:**
- [ ] ❌ Does NOT show "5 Premium unlocks" (old value)
- [ ] ❌ Does NOT show "5 Quality unlocks" (old value)
- [ ] ✅ Shows "2 Premium unlocks" (new value)
- [ ] ✅ Shows "8 Quality unlocks" (new value)

---

### Step 6: Take Screenshot of Team Tier Card
```
Tool: mcp__chrome-devtools__take_screenshot
filePath: /Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/team_tier_monthly.png
uid: [UID of Team tier card from snapshot]
```

---

### Step 7: Locate Enterprise Tier Card
From the snapshot, identify the Enterprise tier card elements.

**Verify Enterprise Tier Header:**
- [ ] Title: "Enterprise"
- [ ] Icon: Crown
- [ ] Price: "$299.99/mo"
- [ ] Purple gradient styling

---

### Step 8: Verify Enterprise Tier Features List
From the snapshot, examine the Enterprise tier features list.

**Expected Features (in order):**
1. [ ] "12 Premium (5.0⭐) unlocks/mo"
2. [ ] "Unlimited Quality (4.0-4.9⭐) unlocks"
3. [ ] "Unlimited Standard (3.0-3.9⭐) unlocks"
4. [ ] "1000 monthly credits included"
5. [ ] "3 Warm Introductions/mo"
6. [ ] "10 Team seats"
7. [ ] "FraternityBase API access"
8. [ ] "Priority support"
9. [ ] "Early access features"

**Critical Check:**
- [ ] ❌ Does NOT show "Unlimited chapter unlocks (all tiers)" (old value)
- [ ] ✅ Shows "12 Premium (5.0⭐) unlocks/mo" (new value)
- [ ] ✅ Shows "Unlimited Quality (4.0-4.9⭐) unlocks" (new value)
- [ ] ✅ Shows "Unlimited Standard (3.0-3.9⭐) unlocks" (new value)

---

### Step 9: Take Screenshot of Enterprise Tier Card
```
Tool: mcp__chrome-devtools__take_screenshot
filePath: /Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/enterprise_tier_monthly.png
uid: [UID of Enterprise tier card from snapshot]
```

---

### Step 10: Switch to Annual Billing
```
Tool: mcp__chrome-devtools__take_snapshot
# Find the "Annual" button UID
```

```
Tool: mcp__chrome-devtools__click
uid: [UID of Annual button]
```

**Expected Result:**
- [ ] "Annual" button becomes highlighted/active
- [ ] "Monthly" button becomes inactive
- [ ] Prices update to annual amounts
- [ ] "Save 10%" badge visible on Annual button

---

### Step 11: Verify Annual Pricing
```
Tool: mcp__chrome-devtools__take_snapshot
```

**Verify Team Tier (Annual):**
- [ ] Shows: "$26.99/mo" (effective monthly rate)
- [ ] Shows: "$323.89 billed annually"
- [ ] Shows: "Save $35.99/year"

**Verify Enterprise Tier (Annual):**
- [ ] Shows: "$269.99/mo" (effective monthly rate)
- [ ] Shows: "$3239.89 billed annually"
- [ ] Shows: "Save $359.99/year"

---

### Step 12: Verify Features Don't Change with Billing Period
Features list should remain the same regardless of monthly/annual selection.

**Team Tier Annual - Features:**
- [ ] Still shows "2 Premium (5.0⭐) unlocks/mo"
- [ ] Still shows "8 Quality (4.0-4.9⭐) unlocks/mo"
- [ ] Still shows "10 Standard (3.0-3.9⭐) unlocks/mo"

**Enterprise Tier Annual - Features:**
- [ ] Still shows "12 Premium (5.0⭐) unlocks/mo"
- [ ] Still shows "Unlimited Quality (4.0-4.9⭐) unlocks"
- [ ] Still shows "Unlimited Standard (3.0-3.9⭐) unlocks"

---

### Step 13: Take Annual Billing Screenshots
```
Tool: mcp__chrome-devtools__take_screenshot
filePath: /Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/team_tier_annual.png
uid: [UID of Team tier card]
```

```
Tool: mcp__chrome-devtools__take_screenshot
filePath: /Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/enterprise_tier_annual.png
uid: [UID of Enterprise tier card]
```

---

### Step 14: Check Console for Errors
```
Tool: mcp__chrome-devtools__list_console_messages
```

**Verify:**
- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] No 404 network errors
- [ ] No type errors related to subscription tiers

---

### Step 15: Verify Network Requests
```
Tool: mcp__chrome-devtools__list_network_requests
```

**Verify:**
- [ ] `/api/credits/balance` request succeeded (200 OK)
- [ ] No failed API requests
- [ ] All static assets loaded successfully

---

### Step 16: Test Team Tier CTA Button Text
```
Tool: mcp__chrome-devtools__take_snapshot
```

**Verify Button Text (No Active Subscription):**
- [ ] Team tier button: "Subscribe to Team"
- [ ] Enterprise tier button: "Subscribe to Enterprise"

**Verify Button Styling:**
- [ ] Team tier (popular): Blue gradient background
- [ ] Enterprise tier: Gray border, transparent background
- [ ] Both buttons have hover states

---

### Step 17: Test Responsive Design - Mobile
```
Tool: mcp__chrome-devtools__resize_page
width: 375
height: 812
```

```
Tool: mcp__chrome-devtools__take_snapshot
```

**Verify Mobile Layout:**
- [ ] Subscription tier cards stack vertically
- [ ] Cards maintain readability
- [ ] Billing toggle still accessible
- [ ] Features list remains readable
- [ ] No horizontal overflow

```
Tool: mcp__chrome-devtools__take_screenshot
filePath: /Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/subscription_mobile.png
```

---

### Step 18: Test Responsive Design - Tablet
```
Tool: mcp__chrome-devtools__resize_page
width: 768
height: 1024
```

```
Tool: mcp__chrome-devtools__take_screenshot
filePath: /Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/subscription_tablet.png
```

**Verify Tablet Layout:**
- [ ] Cards may stack or show side-by-side (2 columns)
- [ ] Pricing clearly visible
- [ ] Features list readable
- [ ] No layout breaking

---

### Step 19: Reset to Desktop View
```
Tool: mcp__chrome-devtools__resize_page
width: 1920
height: 1080
```

---

### Step 20: Switch Back to Monthly and Take Final Screenshot
```
Tool: mcp__chrome-devtools__take_snapshot
# Find Monthly button UID
```

```
Tool: mcp__chrome-devtools__click
uid: [UID of Monthly button]
```

```
Tool: mcp__chrome-devtools__take_screenshot
filePath: /Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/subscription_final_desktop.png
fullPage: true
```

---

## 📊 Validation Checklist

### Team Tier Validation
- [ ] **2 Premium unlocks** displayed (not 5)
- [ ] **8 Quality unlocks** displayed (not 5)
- [ ] **10 Standard unlocks** displayed (correct)
- [ ] 1 Warm Introduction shown
- [ ] 3 Team seats shown
- [ ] Monthly price: $29.99
- [ ] Annual price: $323.89 ($26.99/mo)

### Enterprise Tier Validation
- [ ] **12 Premium unlocks** displayed (not unlimited)
- [ ] **Unlimited Quality unlocks** displayed
- [ ] **Unlimited Standard unlocks** displayed
- [ ] 1000 monthly credits shown
- [ ] 3 Warm Introductions shown
- [ ] 10 Team seats shown
- [ ] Monthly price: $299.99
- [ ] Annual price: $3,239.89 ($269.99/mo)

### UI/UX Validation
- [ ] Billing period toggle works smoothly
- [ ] Pricing updates correctly between monthly/annual
- [ ] Features list remains consistent across billing periods
- [ ] "Save 10%" badge visible on annual option
- [ ] Savings amount calculated correctly
- [ ] Cards have proper styling (gradients, borders)
- [ ] Icons display correctly (Zap for Team, Crown for Enterprise)
- [ ] Responsive design works on mobile/tablet/desktop

### Technical Validation
- [ ] No console errors
- [ ] No network failures
- [ ] Page loads quickly
- [ ] All images/icons load
- [ ] Hover states work on buttons

---

## 🚨 Known Issues to Check

### Critical Issues (Must Fix)
1. **Wrong unlock numbers displayed**
   - Team shows 5/5/10 instead of 2/8/10
   - Enterprise shows "Unlimited chapter unlocks" instead of specific breakdown

2. **Pricing calculation errors**
   - Annual prices don't reflect 10% discount correctly
   - Monthly vs annual toggle doesn't update prices

### Non-Critical Issues (Nice to Fix)
1. **UI Polish**
   - Card spacing inconsistent
   - Button hover states could be smoother
   - Mobile layout could be improved

---

## 📁 Output Files

All screenshots saved to: `/Users/jacksonfitzgerald/CollegeOrgNetwork/tests/screenshots/`

### Generated Files:
1. `team_tier_monthly.png` - Team tier card (monthly billing)
2. `enterprise_tier_monthly.png` - Enterprise tier card (monthly billing)
3. `team_tier_annual.png` - Team tier card (annual billing)
4. `enterprise_tier_annual.png` - Enterprise tier card (annual billing)
5. `subscription_mobile.png` - Mobile responsive view
6. `subscription_tablet.png` - Tablet responsive view
7. `subscription_final_desktop.png` - Full page desktop view

---

## 🚀 Running the Test

### Prerequisites:
```bash
# Ensure backend is running
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
npm run dev

# Ensure frontend is running
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/frontend
npm run dev

# Ensure frontend is accessible at http://localhost:5173
```

### Execute Test:
Ask Claude to execute this Chrome DevTools test plan step by step.

---

## ✅ Success Criteria

Test passes if:
1. ✅ Team tier shows **2 Premium, 8 Quality, 10 Standard** unlocks
2. ✅ Enterprise tier shows **12 Premium, Unlimited Quality, Unlimited Standard** unlocks
3. ✅ Monthly and annual pricing is correct
4. ✅ Billing toggle works without errors
5. ✅ Responsive design works on all screen sizes
6. ✅ No console errors or network failures
7. ✅ All screenshots captured successfully

---

**Created:** October 17, 2025
**Status:** Ready to Execute
**Estimated Duration:** 5-10 minutes
