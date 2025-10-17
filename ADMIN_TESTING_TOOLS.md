# 🛠️ Admin Tools for Subscription Testing

## 🎯 Quick Admin Commands

### View User's Current Subscription Status
```sql
-- Run in Supabase SQL Editor
SELECT
  ab.balance_credits,
  ab.unlocks_5_star_remaining,
  ab.unlocks_4_star_remaining,
  ab.unlocks_3_star_remaining,
  ab.warm_intros_remaining,
  ab.subscription_tier,
  ab.subscription_period_end,
  c.name as company_name,
  c.email
FROM account_balance ab
JOIN companies c ON ab.company_id = c.id
WHERE c.email = 'jacksonfitzgerald25@gmail.com';
```

---

### Reset Subscription Unlocks to Full (For Testing)
```sql
-- Reset to monthly tier defaults
UPDATE account_balance
SET
  unlocks_5_star_remaining = 5,
  unlocks_4_star_remaining = 5,
  unlocks_3_star_remaining = 10,
  warm_intros_remaining = 1
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
);
```

---

### Set Credits to Specific Amount
```sql
-- Example: Set to 100 credits
UPDATE account_balance
SET balance_credits = 100
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
);
```

---

### Set Credits to Low Amount (Test Insufficient Credits)
```sql
UPDATE account_balance
SET balance_credits = 5
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
);
```

---

### Exhaust Specific Tier Unlocks
```sql
-- Exhaust 5⭐ unlocks only
UPDATE account_balance
SET unlocks_5_star_remaining = 0
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
);

-- Exhaust 4⭐ unlocks only
UPDATE account_balance
SET unlocks_4_star_remaining = 0
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
);

-- Exhaust ALL unlocks
UPDATE account_balance
SET
  unlocks_5_star_remaining = 0,
  unlocks_4_star_remaining = 0,
  unlocks_3_star_remaining = 0
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
);
```

---

### View ALL Unlocks for User
```sql
SELECT
  ch.chapter_name,
  go.name as fraternity_name,
  u.name as university_name,
  ch.grade,
  cu.unlocked_at,
  cu.unlock_type
FROM chapter_unlocks cu
JOIN chapters ch ON cu.chapter_id = ch.id
LEFT JOIN greek_organizations go ON ch.greek_organization_id = go.id
LEFT JOIN universities u ON ch.university_id = u.id
WHERE cu.company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
)
ORDER BY cu.unlocked_at DESC;
```

---

### View Transaction History
```sql
SELECT
  transaction_type,
  credits,
  dollars,
  description,
  created_at
FROM balance_transactions
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
)
ORDER BY created_at DESC
LIMIT 20;
```

---

### Check for Subscription Unlock Transactions
```sql
SELECT
  transaction_type,
  credits,
  dollars,
  description,
  created_at
FROM balance_transactions
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
)
AND transaction_type IN ('subscription_unlock', 'subscription_warm_intro')
ORDER BY created_at DESC;
```

---

### Delete Specific Chapter Unlock (Retest)
```sql
-- Find the unlock ID first
SELECT
  cu.id,
  ch.chapter_name,
  go.name as fraternity_name,
  cu.unlocked_at
FROM chapter_unlocks cu
JOIN chapters ch ON cu.chapter_id = ch.id
LEFT JOIN greek_organizations go ON ch.greek_organization_id = go.id
WHERE cu.company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
)
ORDER BY cu.unlocked_at DESC
LIMIT 5;

-- Then delete it
DELETE FROM chapter_unlocks
WHERE id = 'PASTE_ID_HERE';
```

---

### Clear ALL Unlocks for User (Fresh Start)
```sql
-- WARNING: This deletes ALL chapter unlocks for testing!
DELETE FROM chapter_unlocks
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
);

-- Also clear transaction history (optional)
DELETE FROM balance_transactions
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
);
```

---

## 🧪 Test Scenarios to Run

### Scenario 1: Fresh Monthly Subscriber
```sql
-- Reset everything
UPDATE account_balance
SET
  balance_credits = 100,
  unlocks_5_star_remaining = 5,
  unlocks_4_star_remaining = 5,
  unlocks_3_star_remaining = 10,
  warm_intros_remaining = 1,
  subscription_tier = 'monthly'
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
);

DELETE FROM chapter_unlocks
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
);
```

**Then test:**
- Unlock 5.0⭐, 4.0⭐, 3.0⭐ chapters
- Verify counts decrease correctly
- Verify transactions show "subscription_unlock"

---

### Scenario 2: Partially Used Subscription
```sql
UPDATE account_balance
SET
  balance_credits = 603,
  unlocks_5_star_remaining = 2,  -- Used 3
  unlocks_4_star_remaining = 3,  -- Used 2
  unlocks_3_star_remaining = 7   -- Used 3
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
);
```

**Then test:**
- Unlock remaining subscription unlocks
- When exhausted, verify credit fallback

---

### Scenario 3: All Unlocks Exhausted (Credit-Only Mode)
```sql
UPDATE account_balance
SET
  balance_credits = 50,
  unlocks_5_star_remaining = 0,
  unlocks_4_star_remaining = 0,
  unlocks_3_star_remaining = 0
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
);
```

**Then test:**
- All unlocks should charge credits
- Modal should show BLUE button, NO purple banner
- Transaction type should be "chapter_unlock" (not subscription_unlock)

---

### Scenario 4: Insufficient Credits + No Unlocks
```sql
UPDATE account_balance
SET
  balance_credits = 2,  -- Less than cheapest unlock (3 credits)
  unlocks_5_star_remaining = 0,
  unlocks_4_star_remaining = 0,
  unlocks_3_star_remaining = 0
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
);
```

**Then test:**
- Modal should show "Insufficient Credits" error
- Button should be disabled
- Should prompt to purchase credits

---

## 🔍 Debugging Queries

### Find Chapters by Grade
```sql
-- Find 5.0⭐ chapters
SELECT
  id,
  chapter_name,
  go.name as fraternity,
  u.name as university,
  grade
FROM chapters ch
LEFT JOIN greek_organizations go ON ch.greek_organization_id = go.id
LEFT JOIN universities u ON ch.university_id = u.id
WHERE grade >= 5.0
LIMIT 10;

-- Find 4.0-4.9⭐ chapters
SELECT id, chapter_name, grade
FROM chapters
WHERE grade >= 4.0 AND grade < 5.0
LIMIT 10;

-- Find 3.0-3.9⭐ chapters
SELECT id, chapter_name, grade
FROM chapters
WHERE grade >= 3.0 AND grade < 4.0
LIMIT 10;
```

---

### Check if Chapter is Already Unlocked
```sql
SELECT EXISTS(
  SELECT 1 FROM chapter_unlocks
  WHERE chapter_id = 'PASTE_CHAPTER_ID_HERE'
  AND company_id = (
    SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
  )
) as is_unlocked;
```

---

### See Last 10 Actions
```sql
SELECT
  CASE
    WHEN cu.id IS NOT NULL THEN 'UNLOCK'
    WHEN bt.id IS NOT NULL THEN 'TRANSACTION'
  END as action_type,
  COALESCE(cu.unlocked_at, bt.created_at) as timestamp,
  COALESCE(cu.unlock_type, bt.transaction_type) as type,
  ch.chapter_name,
  bt.credits,
  bt.description
FROM (
  SELECT id, chapter_id, unlocked_at, unlock_type FROM chapter_unlocks
  WHERE company_id = (SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com')
  UNION ALL
  SELECT NULL, NULL, created_at, transaction_type FROM balance_transactions
  WHERE company_id = (SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com')
) combined
LEFT JOIN chapter_unlocks cu ON cu.id = combined.id
LEFT JOIN balance_transactions bt ON bt.created_at = combined.unlocked_at
LEFT JOIN chapters ch ON cu.chapter_id = ch.id
ORDER BY timestamp DESC
LIMIT 10;
```

---

## 🚀 Quick Reset Button (Copy-Paste Ready)

```sql
-- MASTER RESET: Back to fresh monthly subscriber with 603 credits
BEGIN;

-- Reset account balance
UPDATE account_balance
SET
  balance_credits = 603,
  unlocks_5_star_remaining = 5,
  unlocks_4_star_remaining = 5,
  unlocks_3_star_remaining = 10,
  warm_intros_remaining = 1,
  subscription_tier = 'monthly'
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
);

-- Clear all unlocks
DELETE FROM chapter_unlocks
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
);

-- Clear transaction history
DELETE FROM balance_transactions
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
);

COMMIT;

-- Verify reset
SELECT
  balance_credits as credits,
  unlocks_5_star_remaining as five_star,
  unlocks_4_star_remaining as four_star,
  unlocks_3_star_remaining as three_star,
  subscription_tier as tier
FROM account_balance
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
);
```

---

## 📊 Monitoring Dashboard Query

```sql
-- Real-time status summary
SELECT
  c.email,
  ab.balance_credits as credits,
  ab.unlocks_5_star_remaining || '/5' as five_star,
  ab.unlocks_4_star_remaining || '/5' as four_star,
  ab.unlocks_3_star_remaining || '/10' as three_star,
  (ab.unlocks_5_star_remaining + ab.unlocks_4_star_remaining + ab.unlocks_3_star_remaining) as total_unlocks,
  COUNT(DISTINCT cu.id) as chapters_unlocked,
  COUNT(DISTINCT CASE WHEN bt.transaction_type = 'subscription_unlock' THEN bt.id END) as subscription_unlocks_used,
  COUNT(DISTINCT CASE WHEN bt.transaction_type = 'chapter_unlock' THEN bt.id END) as credit_unlocks_used,
  ab.subscription_tier
FROM companies c
JOIN account_balance ab ON c.id = ab.company_id
LEFT JOIN chapter_unlocks cu ON c.id = cu.company_id
LEFT JOIN balance_transactions bt ON c.id = bt.company_id
WHERE c.email = 'jacksonfitzgerald25@gmail.com'
GROUP BY c.email, ab.balance_credits, ab.unlocks_5_star_remaining,
         ab.unlocks_4_star_remaining, ab.unlocks_3_star_remaining, ab.subscription_tier;
```

---

## 🎨 Console Logging

To see backend logs in real-time:

```bash
# In backend terminal
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
npm run dev

# Look for these log messages:
# 🎁 Using subscription unlock for X.X⭐ chapter
# ✅ Subscription unlock used successfully
# POST /api/chapters/:id/unlock
```

To see frontend logs:
- Open browser console (F12)
- Look for: 🎯, ⭐, 💎, 🟢, 🔍, 🔓, 📢, 💰

---

## 🔐 Security Notes

**IMPORTANT:** These admin commands are for LOCAL TESTING ONLY!

- Never run these on production database
- Always backup data before destructive operations
- Use transactions (BEGIN/COMMIT) for multi-step changes
- Verify changes with SELECT before committing

---

**Tools ready! Run these SQL commands in Supabase → SQL Editor** 🚀
