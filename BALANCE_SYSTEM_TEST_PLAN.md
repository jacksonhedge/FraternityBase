# Balance System Verification & Test Plan

## ✅ Completed Setup

1. **Database Schema Created** - All tables and functions are now in Supabase
2. **Backend Endpoints Working** - Balance, transactions, checkout, profile endpoints all functional
3. **Frontend UI Ready** - Amount selection, balance display, payment flow implemented

---

## 🧪 Testing Checklist

### Test 1: View Balance (Should show $0.00)
**Steps:**
1. Log in to the app
2. Go to Team page → Billing tab
3. **Expected:** Should see "$0.00" balance (not crashing)
4. **Actual:** ___________

**Status:** ⬜ Pass  ⬜ Fail

---

### Test 2: Purchase Credits via Stripe
**Steps:**
1. On Billing tab, select $50 top-up amount
2. Click "Buy credits"
3. Complete Stripe test checkout with card `4242 4242 4242 4242`
4. Return to app
5. **Expected:** Balance should show $50.00
6. **Actual:** ___________

**Status:** ⬜ Pass  ⬜ Fail

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Auth: `4000 0025 0000 3155`

---

### Test 3: Transaction History
**Steps:**
1. After purchase, check "Invoice history" section
2. **Expected:** Should show the $50.00 credit purchase with date and "Paid" status
3. **Actual:** ___________

**Status:** ⬜ Pass  ⬜ Fail

---

### Test 4: Balance Persistence
**Steps:**
1. Refresh the page
2. **Expected:** Balance should still show $50.00 (not reset to $0)
3. **Actual:** ___________

**Status:** ⬜ Pass  ⬜ Fail

---

### Test 5: Multiple Purchases
**Steps:**
1. Buy another $25
2. **Expected:** Balance should be $75.00 total
3. **Expected:** Invoice history should show 2 transactions
4. **Actual:** ___________

**Status:** ⬜ Pass  ⬜ Fail

---

### Test 6: Custom Amount
**Steps:**
1. Enter custom amount of $100
2. Complete purchase
3. **Expected:** Balance increases by $100
4. **Actual:** ___________

**Status:** ⬜ Pass  ⬜ Fail

---

### Test 7: Auto-Reload Settings
**Steps:**
1. Click "Edit" on auto-reload notice
2. Enable auto-reload
3. Set threshold to $10
4. Set reload amount to $50
5. Click "Save settings"
6. **Expected:** Notice updates to show "Auto reload is enabled..."
7. **Actual:** ___________

**Status:** ⬜ Pass  ⬜ Fail

---

## 🔧 Backend Verification

### Check Supabase Data Directly

**Query 1: View Balance Table**
```sql
SELECT * FROM public.account_balance
ORDER BY created_at DESC
LIMIT 5;
```

**Query 2: View Transactions**
```sql
SELECT
    company_id,
    amount_dollars,
    balance_after,
    transaction_type,
    description,
    created_at
FROM public.balance_transactions
ORDER BY created_at DESC
LIMIT 10;
```

**Query 3: Check for your company**
```sql
-- Replace with your actual company_id from user_profiles table
SELECT
    ab.*,
    COUNT(bt.id) as transaction_count
FROM public.account_balance ab
LEFT JOIN public.balance_transactions bt ON ab.company_id = bt.company_id
GROUP BY ab.id;
```

---

## 🚨 Known Issues to Watch For

### Issue: Balance shows $0 after payment
**Cause:** Stripe webhook not received or `add_balance` function failed
**Fix:** Check backend logs for webhook errors

### Issue: "Insufficient balance" error
**Cause:** RLS policies blocking access or company_id mismatch
**Fix:** Verify user's company_id matches account_balance.company_id

### Issue: Transaction history empty
**Cause:** Transactions table RLS policy or query failing
**Fix:** Check browser console for errors

---

## 📊 Success Criteria

✅ User can view their balance (even if $0)
✅ User can purchase credits via Stripe
✅ Balance updates immediately after payment
✅ Balance persists across page reloads
✅ Transaction history shows all purchases
✅ Multiple purchases accumulate correctly
✅ Auto-reload settings can be configured
✅ Different users can't see each other's balances (RLS working)

---

## 🔐 Security Verification

### Test: Company Isolation
**Steps:**
1. Log in as User A, note company_id
2. Purchase $50
3. Log in as User B (different company)
4. **Expected:** User B should see $0 balance (not User A's $50)
5. **Actual:** ___________

**Status:** ⬜ Pass  ⬜ Fail

---

## 📝 Next Steps After Testing

If all tests pass:
- ✅ Balance system is fully functional
- ✅ Ready to implement chapter unlock deductions
- ✅ Ready to implement warm intro ($59.99)
- ✅ Ready to implement ambassador referrals ($99.99)

If tests fail:
- Check backend logs: `npm run dev` output in terminal
- Check Supabase logs: Dashboard → Logs → Postgres Logs
- Check browser console for frontend errors
- Verify Stripe webhook endpoint is configured correctly
