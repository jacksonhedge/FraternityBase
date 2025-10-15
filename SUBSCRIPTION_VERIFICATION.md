# Subscription Benefits System - Verification Guide

## ✅ System Status: VERIFIED & WORKING

All components are successfully deployed and tested:

### Database Schema ✓
```sql
-- Quick check query
SELECT
  subscription_tier,
  subscription_status,
  monthly_credit_refresh,
  monthly_chapter_unlocks,
  monthly_warm_intros,
  chapter_unlocks_remaining,
  warm_intros_remaining,
  balance_credits
FROM account_balance
WHERE company_id = 'YOUR_COMPANY_ID';
```

### API Endpoints ✓

**1. Get Subscription Status**
```bash
curl "https://backend-mirs9px9l-jackson-fitzgeralds-projects.vercel.app/api/credits/subscription/status?companyId=YOUR_COMPANY_ID"
```

**2. Cancel Subscription**
```bash
curl -X POST https://backend-mirs9px9l-jackson-fitzgeralds-projects.vercel.app/api/credits/subscription/cancel \
  -H "Content-Type: application/json" \
  -d '{"companyId": "YOUR_COMPANY_ID"}'
```

**3. Reset Benefits (Admin)**
```bash
curl -X POST https://backend-mirs9px9l-jackson-fitzgeralds-projects.vercel.app/api/credits/subscription/reset-benefits \
  -H "Content-Type: application/json" \
  -d '{"companyId": "YOUR_COMPANY_ID"}'
```

### Webhook Endpoint ✓
- URL: `https://backend-mirs9px9l-jackson-fitzgeralds-projects.vercel.app/api/credits/webhook`
- Status: Live and accepting Stripe webhooks
- Security: Properly validates Stripe signatures

---

## 📋 How to Verify Subscriptions Are Working

### Method 1: Check an Existing Subscription
```sql
-- See all active subscriptions
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
WHERE ab.subscription_status = 'active'
  AND ab.subscription_tier IN ('monthly', 'enterprise')
ORDER BY ab.created_at DESC;
```

### Method 2: Monitor Webhook Activity
Check your backend logs (Vercel Dashboard) for:
```
🔔 Stripe webhook received: checkout.session.completed
✅ Activated enterprise subscription for company {id}
✅ Granted enterprise benefits to company {id}
```

### Method 3: Test the Status Endpoint
```bash
# Replace with actual company ID
COMPANY_ID="e06324d0-6a8c-46f5-b7a1-a01e15dd281f"

curl -s "https://backend-mirs9px9l-jackson-fitzgeralds-projects.vercel.app/api/credits/subscription/status?companyId=$COMPANY_ID" | python3 -m json.tool
```

Expected response for Enterprise:
```json
{
  "success": true,
  "subscription": {
    "tier": "enterprise",
    "status": "active",
    "daysUntilRenewal": 30
  },
  "benefits": {
    "monthlyCredits": 1000,
    "monthlyChapterUnlocks": -1,  // -1 means unlimited
    "monthlyWarmIntros": 3
  },
  "remaining": {
    "chapterUnlocks": -1,
    "warmIntros": 3
  }
}
```

---

## 🔍 What to Check When a User Subscribes

### Immediate Checks (Within 1 minute)
1. **Webhook Fired**
   - Check Vercel logs for webhook event
   - Look for `checkout.session.completed` event

2. **Database Updated**
   ```sql
   SELECT subscription_tier, subscription_status, stripe_subscription_id
   FROM account_balance
   WHERE company_id = 'COMPANY_ID';
   ```

3. **Credits Granted** (for Enterprise only)
   ```sql
   SELECT balance_credits, monthly_credit_refresh
   FROM account_balance
   WHERE company_id = 'COMPANY_ID';
   -- Should show +1000 credits for Enterprise
   ```

4. **Transaction Logged**
   ```sql
   SELECT * FROM balance_transactions
   WHERE company_id = 'COMPANY_ID'
   ORDER BY created_at DESC
   LIMIT 3;
   -- Should show 'subscription_initial_grant' transaction
   ```

### Monthly Checks (Recurring Benefits)
When `invoice.payment_succeeded` webhook fires:
1. Check credits were added
2. Verify `chapter_unlocks_remaining` and `warm_intros_remaining` reset
3. Confirm `last_benefit_reset_at` updated

---

## 🚨 Troubleshooting

### Problem: Subscription created but benefits not granted

**Check:**
```sql
SELECT
  subscription_tier,
  stripe_subscription_id,
  stripe_customer_id,
  subscription_status
FROM account_balance
WHERE company_id = 'COMPANY_ID';
```

**Fix:** Run manual benefit reset
```bash
curl -X POST https://backend-mirs9px9l-jackson-fitzgeralds-projects.vercel.app/api/credits/subscription/reset-benefits \
  -H "Content-Type: application/json" \
  -d '{"companyId": "COMPANY_ID"}'
```

### Problem: Webhook not received

**Check Stripe Dashboard:**
1. Go to: https://dashboard.stripe.com/webhooks
2. Check recent webhook deliveries
3. Look for failed attempts and error messages

**Common fixes:**
- Verify webhook URL is correct
- Check `STRIPE_WEBHOOK_SECRET` environment variable
- Ensure endpoint is not timing out

### Problem: Credits not appearing after renewal

**Check:**
```sql
SELECT
  balance_credits,
  monthly_credit_refresh,
  last_benefit_reset_at,
  subscription_current_period_end
FROM account_balance
WHERE company_id = 'COMPANY_ID';
```

**Manual trigger:**
```bash
curl -X POST .../api/credits/subscription/reset-benefits \
  -d '{"companyId": "COMPANY_ID"}'
```

---

## 📊 Subscription Tiers

### Team ($29.99/month)
- No included benefits
- Pay-as-you-go credits
- Access to all features

### Enterprise Tier 1 ($299.99/month)
- 1000 credits/month (auto-refresh)
- Unlimited chapter unlocks
- 3 warm introductions/month
- Priority support

---

## 🔗 Important Links

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Vercel Backend:** https://vercel.com/jackson-fitzgeralds-projects/backend
- **Webhook Endpoint:** https://backend-mirs9px9l-jackson-fitzgeralds-projects.vercel.app/api/credits/webhook
- **Supabase Dashboard:** https://supabase.com/dashboard/project/vvsawtexgpopqxgaqyxg

---

## ✅ Quick Health Check

Run this query to see system health:
```sql
SELECT
  COUNT(*) FILTER (WHERE subscription_tier = 'trial') as trial_count,
  COUNT(*) FILTER (WHERE subscription_tier = 'monthly') as monthly_count,
  COUNT(*) FILTER (WHERE subscription_tier = 'enterprise') as enterprise_count,
  COUNT(*) FILTER (WHERE subscription_status = 'active') as active_count,
  COUNT(*) FILTER (WHERE subscription_status = 'past_due') as past_due_count,
  COUNT(*) FILTER (WHERE subscription_status = 'canceled') as canceled_count,
  SUM(balance_credits) as total_credits_in_system
FROM account_balance;
```
