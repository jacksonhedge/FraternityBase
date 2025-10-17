-- 🔧 FIX SUBSCRIPTION DATA FOR TESTING ACCOUNT
-- Run this in Supabase SQL Editor to ensure subscription unlocks are properly set

-- Step 1: Check current state
SELECT
  c.email,
  c.name as company_name,
  ab.balance_credits,
  ab.unlocks_5_star_remaining,
  ab.unlocks_4_star_remaining,
  ab.unlocks_3_star_remaining,
  ab.warm_intros_remaining,
  ab.subscription_tier,
  ab.subscription_period_end
FROM companies c
LEFT JOIN account_balance ab ON c.id = ab.company_id
WHERE c.email = 'jacksonfitzgerald25@gmail.com';

-- Step 2: Fix account_balance if it doesn't exist
INSERT INTO account_balance (
  company_id,
  balance_credits,
  balance_dollars,
  unlocks_5_star_remaining,
  unlocks_4_star_remaining,
  unlocks_3_star_remaining,
  warm_intros_remaining,
  subscription_tier,
  subscription_period_end,
  subscription_started_at
)
SELECT
  id,
  603, -- credits
  0, -- dollars
  5, -- 5⭐ unlocks
  5, -- 4⭐ unlocks
  10, -- 3⭐ unlocks
  1, -- warm intros
  'monthly', -- tier
  NOW() + INTERVAL '1 month', -- period end
  NOW() -- started at
FROM companies
WHERE email = 'jacksonfitzgerald25@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM account_balance WHERE company_id = companies.id
);

-- Step 3: Update existing account_balance to ensure proper values
UPDATE account_balance
SET
  balance_credits = GREATEST(balance_credits, 603), -- Don't decrease, only increase
  unlocks_5_star_remaining = 5,
  unlocks_4_star_remaining = 5,
  unlocks_3_star_remaining = 10,
  warm_intros_remaining = 1,
  subscription_tier = 'monthly',
  subscription_period_end = NOW() + INTERVAL '1 month',
  subscription_started_at = COALESCE(subscription_started_at, NOW())
WHERE company_id = (
  SELECT id FROM companies WHERE email = 'jacksonfitzgerald25@gmail.com'
);

-- Step 4: Verify the fix
SELECT
  c.email,
  c.name as company_name,
  ab.balance_credits,
  ab.unlocks_5_star_remaining,
  ab.unlocks_4_star_remaining,
  ab.unlocks_3_star_remaining,
  ab.warm_intros_remaining,
  ab.subscription_tier,
  ab.subscription_period_end,
  ab.subscription_started_at
FROM companies c
JOIN account_balance ab ON c.id = ab.company_id
WHERE c.email = 'jacksonfitzgerald25@gmail.com';
