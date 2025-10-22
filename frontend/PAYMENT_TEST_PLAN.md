# FraternityBase Production Payment Flow Test Plan

## Pre-Test Setup

1. **Environment**: Production at https://frontend-3a4vtxptg-jackson-fitzgeralds-projects.vercel.app
2. **Login**: Ensure you're logged in with a valid account
3. **Browser**: Use Chrome/Safari with DevTools open (Console + Network tabs)
4. **Stripe Test Mode**: Verify if you're using Stripe test mode or live mode

## Test 1: Page Load & Authentication

### Steps:
1. Navigate to https://frontend-3a4vtxptg-jackson-fitzgeralds-projects.vercel.app/app/team
2. Open browser DevTools (Console tab)

### Expected Results:
✅ Page loads without errors
✅ "Current Subscription" section appears first
✅ "Buy Credit Packages" section appears below subscription
✅ BEST VALUE badge visible on 3000 credit package with:
   - ✨ Sparkles icon
   - Pulsing animation
   - Green gradient with white border
✅ No 401 authentication errors in console
✅ Credit balance displays correctly

### What to Check:
```
Console should show:
- No "Using token: No token" errors
- No 401 HTTP errors
- Balance loaded successfully
```

## Test 2: Credit Package Display Verification

### Steps:
1. Scroll to "Buy Credit Packages" section
2. Verify all package pricing

### Expected Results:
✅ **Trial Package**: 10 credits for $30.00 ($3.00/credit)
✅ **Starter Package**: 100 credits for $270.00 ($2.70/credit)
✅ **Popular Package**: 200 credits for $500.00 ($2.50/credit)
✅ **Professional Package**: 500 credits for $1,150.00 ($2.30/credit)
✅ **Enterprise Package**: 3,000 credits for $3,000.00 ($1.00/credit) - **BEST VALUE badge**

### Visual Checks:
- BEST VALUE badge is prominent and eye-catching
- All prices match exactly
- Purchase buttons are clickable

## Test 3: Stripe Checkout Flow (Small Purchase)

### Steps:
1. Click "Purchase" on the **Trial Package** (10 credits / $30)
2. Monitor Network tab for API calls

### Expected Network Calls:
```
POST /api/credits/purchase
Request Body:
{
  "amount": 30,
  "credits": 10
}

Response:
{
  "sessionId": "cs_test_..." or "cs_live_...",
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

### Expected Results:
✅ Redirects to Stripe Checkout page
✅ Shows correct amount: **$30.00**
✅ Shows description: "10 Credits"
✅ Stripe form loads properly

### If Using Test Mode:
Use test card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### If Using Live Mode:
⚠️ **WARNING**: This will charge your real card $30
- Use your actual payment method
- Verify you're okay with the charge

## Test 4: Complete Purchase & Verify Credit Addition

### Steps:
1. Complete the Stripe checkout form
2. Submit payment
3. Wait for redirect back to FraternityBase

### Expected Results:
✅ Redirects to success page or back to /app/team
✅ Success message displays
✅ Credit balance increases by **10 credits**
✅ Transaction appears in transaction history

### What to Verify:
```
Before purchase: X credits
After purchase: X + 10 credits
```

## Test 5: Backend Webhook Processing

### Steps:
1. Check backend logs (if accessible)
2. Verify database was updated

### Expected Backend Actions:
```
Stripe webhook received: checkout.session.completed
- Session ID: cs_test_xxx or cs_live_xxx
- Amount: 3000 (cents) = $30.00
- Credits: 10

Database updates:
- account_balance.credits increased by 10
- balance_transactions row created with:
  - type: 'purchase'
  - amount: 30.00
  - credits: 10
  - stripe_session_id: cs_xxx
```

### Where to Check:
- Backend logs: `vercel logs` or Vercel dashboard
- Database: Supabase dashboard → account_balance table
- Slack notifications (if configured)

## Test 6: Larger Package Test (Optional)

### Steps:
1. Repeat Test 3-5 with **Starter Package** (100 credits / $270)
2. Verify amount shows as **$270.00**
3. Verify credits increase by **100**

## Test 7: Edge Cases

### Test 7a: Cancelled Payment
1. Click Purchase on any package
2. On Stripe checkout page, click "Back" or close tab
3. Verify you return to /app/team
4. Verify no credits were added
5. Verify no charge occurred

### Test 7b: Network Interruption
1. Click Purchase on any package
2. Turn off WiFi during redirect
3. Verify error handling is graceful
4. Verify no partial charge/credit addition

## Test 8: Verify Credit Pricing Consistency

### Steps:
1. Navigate to /app/credits-system
2. Verify service costs match:

### Expected Costs:
✅ **5.0⭐ Premium Chapter**: 10 credits (or 5 for Enterprise Tier 1)
✅ **4.5⭐ Chapter**: 7 credits
✅ **4.0⭐ Chapter**: 5 credits
✅ **3.5⭐ Chapter**: 3 credits
✅ **3.0⭐ Chapter**: 2 credits
✅ **<3.0⭐ Chapter**: 1 credit
✅ **Warm Introduction**: 100 credits
✅ **Ambassador Connection**: 200 credits
✅ **💎 Diamond Unlock**: 100 credits

## Test 9: Auto-Reload Feature (If Enabled)

### Steps:
1. Navigate to /app/team
2. Check if auto-reload is configured
3. If yes, verify settings:
   - Threshold (minimum $5)
   - Reload amount (minimum $25)
   - Payment method saved

### Expected Results:
✅ Auto-reload settings display correctly
✅ Can update threshold/amount
✅ Can disable auto-reload

## Common Issues & Troubleshooting

### Issue: 401 Authentication Error
**Cause**: Not logged in or token expired
**Fix**: Log out and log back in

### Issue: Stripe Checkout Won't Load
**Cause**: Backend API error or Stripe misconfiguration
**Fix**: Check backend logs, verify STRIPE_SECRET_KEY is set

### Issue: Credits Not Added After Payment
**Cause**: Webhook not received or processing failed
**Fix**: Check Stripe webhook logs, verify STRIPE_WEBHOOK_SECRET

### Issue: Wrong Amount Charged
**Cause**: Pricing mismatch between frontend/backend
**Fix**: Verify pricing.ts constants match frontend display

### Issue: Redirect Loop
**Cause**: Session handling error
**Fix**: Clear cookies, check Supabase auth configuration

## Success Criteria

✅ All 6 credit packages display correct pricing
✅ BEST VALUE badge is prominent on 3000 credit package
✅ Stripe checkout loads without errors
✅ Payment processes successfully (test or live mode)
✅ Credits added to account balance immediately
✅ Transaction recorded in database
✅ No console errors throughout flow
✅ All 3 pages show consistent credit costs:
   - /app/team (pricing section)
   - /app/credits-system
   - /app/pricing

## Post-Test Verification

1. **Database Check**:
   ```sql
   SELECT * FROM account_balance WHERE company_id = 'YOUR_COMPANY_ID';
   SELECT * FROM balance_transactions WHERE company_id = 'YOUR_COMPANY_ID' ORDER BY created_at DESC LIMIT 5;
   ```

2. **Stripe Dashboard Check**:
   - Go to Stripe Dashboard → Payments
   - Verify payment appears with correct amount
   - Check webhook delivery (Webhooks → Events)

3. **Email Notification Check**:
   - Verify purchase confirmation email sent (if configured)
   - Check Slack notification sent to admin channel (if configured)

## Test Results Template

```
Date: ___________
Tester: ___________
Environment: Production

Test 1 (Page Load): ✅ PASS / ❌ FAIL
Test 2 (Pricing Display): ✅ PASS / ❌ FAIL
Test 3 (Stripe Checkout): ✅ PASS / ❌ FAIL
Test 4 (Credit Addition): ✅ PASS / ❌ FAIL
Test 5 (Webhook Processing): ✅ PASS / ❌ FAIL
Test 6 (Larger Package): ✅ PASS / ❌ FAIL
Test 7 (Edge Cases): ✅ PASS / ❌ FAIL
Test 8 (Consistency Check): ✅ PASS / ❌ FAIL

Notes:
_________________________________
_________________________________
_________________________________

Issues Found:
_________________________________
_________________________________
_________________________________
```

## Important Notes

1. **Test Mode vs Live Mode**:
   - Check which Stripe mode you're using
   - Test mode uses `sk_test_...` keys
   - Live mode uses `sk_live_...` keys
   - DO NOT test live mode unless you're okay with real charges

2. **Webhook Endpoint**:
   - Production webhook: `https://backend-gc7bnyif9-jackson-fitzgeralds-projects.vercel.app/api/webhook`
   - Verify this endpoint is configured in Stripe Dashboard

3. **Price IDs**:
   - One-time purchases don't need Stripe Price IDs
   - Subscriptions use Price IDs (already configured)

4. **Currency**:
   - All prices in USD
   - Stripe processes in cents (multiply by 100)

## Quick Test Command

If you want to test the API directly:

```bash
# Get your auth token
TOKEN=$(cat ~/.fraternitybase_token)  # Or from browser localStorage

# Test purchase endpoint
curl -X POST https://backend-gc7bnyif9-jackson-fitzgeralds-projects.vercel.app/api/credits/purchase \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 30, "credits": 10}'

# Should return:
# {"sessionId": "cs_test_...", "checkoutUrl": "https://checkout.stripe.com/..."}
```

---

**Ready to start testing!** Begin with Test 1 and work through sequentially. Stop immediately if any test fails and document the error.
