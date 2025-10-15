-- Add tier-specific unlock tracking columns to account_balance
-- This migration adds columns to track monthly unlock allowances by chapter tier

ALTER TABLE account_balance
ADD COLUMN IF NOT EXISTS unlocks_5_star_remaining INTEGER DEFAULT 0 CHECK (unlocks_5_star_remaining >= 0),
ADD COLUMN IF NOT EXISTS unlocks_4_star_remaining INTEGER DEFAULT 0 CHECK (unlocks_4_star_remaining >= 0),
ADD COLUMN IF NOT EXISTS unlocks_3_star_remaining INTEGER DEFAULT 0 CHECK (unlocks_3_star_remaining >= 0),
ADD COLUMN IF NOT EXISTS monthly_unlocks_5_star INTEGER DEFAULT 0 CHECK (monthly_unlocks_5_star >= 0),
ADD COLUMN IF NOT EXISTS monthly_unlocks_4_star INTEGER DEFAULT 0 CHECK (monthly_unlocks_4_star >= 0),
ADD COLUMN IF NOT EXISTS monthly_unlocks_3_star INTEGER DEFAULT 0 CHECK (monthly_unlocks_3_star >= 0),
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS max_team_seats INTEGER DEFAULT 1 CHECK (max_team_seats > 0);

-- Add comments
COMMENT ON COLUMN account_balance.unlocks_5_star_remaining IS 'Remaining 5.0⭐ chapter unlocks for current period';
COMMENT ON COLUMN account_balance.unlocks_4_star_remaining IS 'Remaining 4.0-4.9⭐ chapter unlocks for current period';
COMMENT ON COLUMN account_balance.unlocks_3_star_remaining IS 'Remaining 3.0-3.9⭐ chapter unlocks for current period';
COMMENT ON COLUMN account_balance.monthly_unlocks_5_star IS 'Monthly allowance of 5.0⭐ chapter unlocks';
COMMENT ON COLUMN account_balance.monthly_unlocks_4_star IS 'Monthly allowance of 4.0-4.9⭐ chapter unlocks';
COMMENT ON COLUMN account_balance.monthly_unlocks_3_star IS 'Monthly allowance of 3.0-3.9⭐ chapter unlocks';
COMMENT ON COLUMN account_balance.subscription_started_at IS 'When subscription first started (for first 3 months warm intro tracking)';
COMMENT ON COLUMN account_balance.max_team_seats IS 'Maximum team members allowed (1 for trial, 3 for monthly, 10 for enterprise)';

-- Set default seat limits based on current tiers
UPDATE account_balance
SET max_team_seats = CASE
  WHEN subscription_tier = 'trial' THEN 1
  WHEN subscription_tier = 'monthly' THEN 3
  WHEN subscription_tier = 'enterprise' THEN 10
  ELSE 1
END
WHERE max_team_seats IS NULL OR max_team_seats = 1;
