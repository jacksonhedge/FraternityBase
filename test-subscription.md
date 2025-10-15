# Subscription Benefits Testing Guide

## Test Scenario 1: Create New Enterprise Subscription

### Step 1: Subscribe via Frontend
1. Go to your pricing page
2. Click "Subscribe to Enterprise" ($299.99/mo)
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout

### Step 2: Verify Webhook Received
Check backend logs for:
```
🔔 Stripe webhook received: checkout.session.completed
✅ Activated enterprise subscription for company {companyId}
✅ Granted enterprise benefits to company {companyId}
```

### Step 3: Check Database
```sql
-- Check subscription was applied
SELECT
  subscription_tier,
  subscription_status,
  monthly_credit_refresh,
  monthly_chapter_unlocks,
  monthly_warm_intros,
  chapter_unlocks_remaining,
  warm_intros_remaining,
  balance_credits,
  stripe_subscription_id,
  subscription_current_period_end
FROM account_balance
WHERE company_id = 'YOUR_COMPANY_ID';

-- Expected for Enterprise:
-- monthly_credit_refresh: 1000
-- monthly_chapter_unlocks: -1 (unlimited)
-- monthly_warm_intros: 3
-- chapter_unlocks_remaining: -1
-- warm_intros_remaining: 3
-- balance_credits: 1000 (initial grant)
```

### Step 4: Test Subscription Status Endpoint
```bash
curl "https://backend-mirs9px9l-jackson-fitzgeralds-projects.vercel.app/api/credits/subscription/status?companyId=YOUR_COMPANY_ID"
```

Expected response:
```json
{
  "success": true,
  "subscription": {
    "tier": "enterprise",
    "status": "active",
    "stripeSubscriptionId": "sub_xxxxx",
    "currentPeriodEnd": "2025-11-10T...",
    "daysUntilRenewal": 30,
    "lastBenefitResetAt": "2025-10-10T..."
  },
  "benefits": {
    "monthlyCredits": 1000,
    "monthlyChapterUnlocks": -1,
    "monthlyWarmIntros": 3
  },
  "remaining": {
    "chapterUnlocks": -1,
    "warmIntros": 3
  }
}
```

## Test Scenario 2: Monthly Renewal (Simulate)

### Option A: Use Stripe Test Clock
1. Go to Stripe Dashboard → Test Clocks
2. Create a test clock
3. Fast-forward 30 days
4. Check if `invoice.payment_succeeded` webhook fires

### Option B: Manual Test (Admin Only)
```bash
curl -X POST https://backend-mirs9px9l-jackson-fitzgeralds-projects.vercel.app/api/credits/subscription/reset-benefits \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "YOUR_COMPANY_ID"
  }'
```

Then verify credits were added:
```sql
SELECT balance_credits, last_benefit_reset_at
FROM account_balance
WHERE company_id = 'YOUR_COMPANY_ID';
```

## Test Scenario 3: Cancel Subscription

```bash
curl -X POST https://backend-mirs9px9l-jackson-fitzgeralds-projects.vercel.app/api/credits/subscription/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "YOUR_COMPANY_ID"
  }'
```

Expected webhook:
```
🔔 Stripe webhook received: customer.subscription.deleted
⚠️ Subscription cancelled for company {companyId}
```

Verify downgrade:
```sql
SELECT
  subscription_tier,
  subscription_status,
  monthly_credit_refresh,
  monthly_chapter_unlocks,
  monthly_warm_intros,
  chapter_unlocks_remaining,
  warm_intros_remaining
FROM account_balance
WHERE company_id = 'YOUR_COMPANY_ID';

-- Expected after cancellation:
-- subscription_tier: 'trial'
-- subscription_status: 'canceled'
-- All benefits reset to 0
```

## Test Scenario 4: Failed Payment

Use Stripe test card that declines: `4000 0000 0000 0341`

Expected webhook:
```
🔔 Stripe webhook received: invoice.payment_failed
⚠️ Payment failed for company {companyId} - marked past_due
```

Verify status:
```sql
SELECT subscription_status
FROM account_balance
WHERE company_id = 'YOUR_COMPANY_ID';

-- Expected: 'past_due'
```

## Quick Database Checks

### View All Subscriptions
```sql
SELECT
  c.name as company_name,
  ab.subscription_tier,
  ab.subscription_status,
  ab.balance_credits,
  ab.monthly_credit_refresh,
  ab.chapter_unlocks_remaining,
  ab.warm_intros_remaining,
  ab.subscription_current_period_end
FROM account_balance ab
JOIN companies c ON c.id = ab.company_id
WHERE ab.subscription_tier != 'trial'
ORDER BY ab.created_at DESC;
```

### View Recent Transactions
```sql
SELECT
  c.name,
  bt.transaction_type,
  bt.amount_credits,
  bt.description,
  bt.created_at
FROM balance_transactions bt
JOIN companies c ON c.id = bt.company_id
WHERE bt.transaction_type IN ('subscription_initial_grant', 'subscription_renewal')
ORDER BY bt.created_at DESC
LIMIT 10;
```

## Webhook Testing

### Test Webhook Locally (Optional)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3001/api/credits/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

## Common Issues & Solutions

### Issue: Webhook not firing
**Solution:**
1. Check webhook URL in Stripe Dashboard
2. Verify webhook secret in environment variables
3. Check backend logs for signature errors

### Issue: Benefits not granted
**Solution:**
1. Check if `grantSubscriptionBenefits` function was called
2. Verify company has `stripe_customer_id` set
3. Check `metadata.tier` in checkout session

### Issue: Credits not appearing
**Solution:**
1. Verify `add_credits` RPC function exists in database
2. Check transaction logs: `SELECT * FROM balance_transactions ORDER BY created_at DESC LIMIT 5`
3. Ensure `monthly_credit_refresh > 0` for the tier

## Production Checklist

- [ ] Stripe webhook configured with production endpoint
- [ ] Webhook secret set in production environment variables
- [ ] Test subscription with real card (refund immediately)
- [ ] Verify email notifications work (if configured)
- [ ] Monitor webhook logs for 24 hours
- [ ] Set up Stripe Dashboard alerts for failed payments
