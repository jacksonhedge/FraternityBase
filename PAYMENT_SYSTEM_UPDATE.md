# Payment System Migration - Dollar-Based Top-Up Model

**Date:** October 3, 2025
**Status:** ✅ Core Infrastructure Complete

## Overview

Successfully migrated from a credit-based system to an Anthropic-style dollar-based top-up payment model.

---

## ✅ Completed

### 1. Database Schema Migration
- ✅ Renamed `credits` table → `account_balance`
- ✅ Converted to dollar-based system (`balance_dollars`)
- ✅ Added auto-reload settings (`auto_reload_enabled`, `auto_reload_threshold`, `auto_reload_amount`)
- ✅ Created `balance_transactions` table for complete transaction history
- ✅ Created `warm_intro_requests` table ($59.99 service)
- ✅ Created `ambassador_referral_requests` table ($99.99 service)
- ✅ Created `pricing` table for configurable prices
- ✅ Updated `chapter_unlocks` to track `amount_paid` instead of `credits_spent`
- ✅ Created helper functions: `add_balance()` and `deduct_balance()`
- ✅ Set up Row Level Security (RLS) policies

**All existing accounts now have $50.00 starting balance**

### 2. Pricing Configuration
Created `/backend/src/config/pricing.ts`:
- **Chapter Unlock:** $19.99
- **Warm Introduction:** $59.99
- **Ambassador Referral:** $99.99
- **Top-up Presets:** $25, $50, $100, $250, $500
- **Free Trial Balance:** $50.00 (2-3 unlocks)
- **Default Auto-Reload:** Threshold $10, Amount $50

### 3. API Endpoints Updated
**Updated:**
- ✅ `GET /api/credits/balance` → Now returns dollar amounts with auto-reload settings

**Response Format:**
```json
{
  "balance": 50.00,
  "lifetimeSpent": 0.00,
  "lifetimeAdded": 50.00,
  "autoReload": {
    "enabled": false,
    "threshold": 10.00,
    "amount": 50.00
  }
}
```

### 4. Frontend Updates
**Dashboard (`DashboardPage.tsx`):**
- ✅ Changed "Available Credits" → "Account Balance"
- ✅ Display format: `$50.00` instead of `50`
- ✅ Shows lifetime added/spent in subtitle
- ✅ Changed "Buy Credits" button → "Add Funds"

---

## ✅ Backend Implementation Complete

### Stripe Integration (Updated)
**File:** `/backend/src/routes/credits.ts`

#### Top-Up Checkout Endpoint
- ✅ `POST /api/credits/checkout`
  - Accepts custom dollar amounts (min $10)
  - Optional `savePaymentMethod` flag for auto-reload
  - Creates Stripe Checkout Session
  - Metadata includes company_id and amount

#### Webhook Handler
- ✅ `POST /api/credits/webhook`
  - Handles `checkout.session.completed` events
  - Calls `add_balance()` SQL function
  - Saves payment method for auto-reload when applicable
  - Creates transaction records automatically

#### Auto-Reload Endpoints
- ✅ `POST /api/credits/auto-reload/settings`
  - Update auto-reload enabled/threshold/amount
  - Validates minimum thresholds ($5) and amounts ($25)

- ✅ `POST /api/credits/auto-reload/trigger`
  - Manually trigger auto-reload or called by scheduled job
  - Checks if balance < threshold
  - Creates off-session Payment Intent with saved method
  - Calls `add_balance()` on success

### Chapter Unlock Endpoints (Updated)
**File:** `/backend/src/server.ts`

- ✅ `POST /api/chapters/:id/unlock`
  - Now charges $19.99 for full unlock
  - Only accepts `unlockType: "full"`
  - Calls `deduct_balance()` SQL function
  - Creates transaction and unlock records
  - Returns updated balance

- ✅ `GET /api/chapters/:id/unlock-status`
  - Updated to use `company_id` from `user_profiles`
  - Returns `amount_paid` instead of `credits_spent`

### Premium Service Endpoints (New)
**File:** `/backend/src/routes/credits.ts`

#### Warm Introduction Requests ($59.99)
- ✅ `POST /api/credits/warm-intro/request`
  - Checks balance >= $59.99
  - Calls `deduct_balance()` with `transaction_type: 'warm_intro'`
  - Creates request in `warm_intro_requests` table
  - Returns request ID and confirmation message

- ✅ `GET /api/credits/warm-intro/requests?companyId={id}`
  - Fetches all warm intro requests for a company
  - Includes chapter and university details

#### Ambassador Referral Requests ($99.99)
- ✅ `POST /api/credits/ambassador/request`
  - Checks balance >= $99.99
  - Calls `deduct_balance()` with `transaction_type: 'ambassador_referral'`
  - Creates request in `ambassador_referral_requests` table
  - Returns request ID and confirmation message

- ✅ `GET /api/credits/ambassador/requests?companyId={id}`
  - Fetches all ambassador requests for a company
  - Includes chapter and university details

---

## 🚧 Frontend Implementation Needed

### Pages to Create/Update
- ⏳ Credits/Top-Up page with Stripe integration
- ⏳ Auto-reload settings page
- ⏳ Warm intro request form
- ⏳ Ambassador referral request form
- ⏳ Transaction history page

### UI Updates Needed
- ⏳ Update chapter detail pages to show $19.99 unlock price
- ⏳ Add "Request Warm Intro" button on chapter pages
- ⏳ Add "Request Ambassador" button on chapter pages
- ⏳ Show insufficient balance warnings
- ⏳ Add balance warnings/notifications

---

## Database Schema Summary

### `account_balance` Table
```sql
- company_id (UUID, FK to companies)
- balance_dollars (DECIMAL, current balance)
- lifetime_spent_dollars (DECIMAL, total spent)
- lifetime_added_dollars (DECIMAL, total added)
- auto_reload_enabled (BOOLEAN)
- auto_reload_threshold (DECIMAL, trigger point)
- auto_reload_amount (DECIMAL, reload amount)
- stripe_customer_id (VARCHAR)
- stripe_payment_method_id (VARCHAR)
```

### `balance_transactions` Table
```sql
- id (UUID)
- company_id (UUID)
- amount_dollars (DECIMAL, +/- based on type)
- transaction_type (VARCHAR: top_up, chapter_unlock, warm_intro, etc.)
- description (TEXT)
- balance_before (DECIMAL)
- balance_after (DECIMAL)
- chapter_id (UUID, nullable)
- stripe_payment_intent_id (VARCHAR)
```

### `pricing` Table
```sql
- item_type (VARCHAR: chapter_unlock, warm_intro, ambassador_referral)
- price_dollars (DECIMAL)
- description (TEXT)
- is_active (BOOLEAN)
```

---

## Next Steps

### Priority 1: Update Unlock Flow
1. Update chapter unlock endpoint to:
   - Check account balance >= $19.99
   - Call `deduct_balance()` function
   - Create transaction record
   - Grant chapter access

### Priority 2: Payment Integration
1. Set up Stripe for top-ups
2. Create checkout session for custom amounts
3. Implement webhook handler for payment confirmation
4. Add auto-reload trigger logic

### Priority 3: Premium Services
1. Create warm intro request flow
2. Create ambassador referral request flow
3. Build admin interface to manage requests

### Priority 4: Polish
1. Add transaction history page
2. Add auto-reload settings page
3. Update all pricing displays throughout app
4. Add balance warnings/notifications

---

## Testing Checklist

- [ ] Verify balance displays correctly on dashboard
- [ ] Test chapter unlock with new pricing
- [ ] Test top-up payment flow
- [ ] Test auto-reload when balance < threshold
- [ ] Verify transaction history is accurate
- [ ] Test warm intro request flow
- [ ] Test ambassador referral flow
- [ ] Verify RLS policies work correctly

---

## Migration Notes

**Database Migration File:** `/database/migrate_to_dollar_balance_system.sql`

**Backup Created:** `/Users/jacksonfitzgerald/CollegeOrgNetwork_backup_20251003_215157`

**All existing companies automatically received $50.00 starting balance**

---

## Pricing Philosophy

Following the Anthropic API model:
- ✅ Dollar-based (not abstract credits)
- ✅ Top-up system (add funds to account)
- ✅ Auto-reload option (never drop below threshold)
- ✅ Transparent pricing (know exact cost per action)
- ✅ Transaction history (complete audit trail)
- ✅ Flexible amounts (custom top-ups available)

This provides users with:
1. **Clarity:** Know exactly what each action costs
2. **Control:** Set auto-reload preferences
3. **Transparency:** See complete transaction history
4. **Flexibility:** Top up custom amounts as needed
