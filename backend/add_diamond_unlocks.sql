-- Add Diamond unlock columns to account_balance table
ALTER TABLE account_balance
ADD COLUMN IF NOT EXISTS monthly_diamond_unlocks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS diamond_unlocks_remaining INTEGER DEFAULT 0;

-- Update Enterprise Tier 2 accounts with Diamond unlocks
UPDATE account_balance
SET monthly_diamond_unlocks = 10,
    diamond_unlocks_remaining = 10
WHERE subscription_tier = 'enterprise_tier2';
