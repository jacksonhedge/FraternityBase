-- Migration: Remove Credits System, Add Subscription + Partnership Request Model
-- Date: 2025-10-31
-- Description: Complete business model overhaul from credits to subscriptions

-- ============================================================================
-- STEP 1: Create new partnership_requests table
-- ============================================================================

CREATE TABLE IF NOT EXISTS partnership_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,

  -- Request details
  message TEXT,
  proposed_compensation NUMERIC(10, 2), -- What the chapter will receive
  platform_fee NUMERIC(10, 2), -- 20% fee (calculated)
  total_amount NUMERIC(10, 2), -- Total charged to business (compensation + fee)

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- pending, accepted, rejected, completed, cancelled

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Payment tracking
  stripe_payment_intent_id VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, paid, failed
  paid_at TIMESTAMP WITH TIME ZONE,

  -- Chapter response
  chapter_response TEXT,

  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_partnership_requests_company_id ON partnership_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_partnership_requests_chapter_id ON partnership_requests(chapter_id);
CREATE INDEX IF NOT EXISTS idx_partnership_requests_status ON partnership_requests(status);
CREATE INDEX IF NOT EXISTS idx_partnership_requests_created_at ON partnership_requests(created_at DESC);

-- Enable RLS
ALTER TABLE partnership_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Companies can view their own partnership requests"
  ON partnership_requests FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM team_members WHERE company_id = partnership_requests.company_id));

CREATE POLICY "Chapters can view requests sent to them"
  ON partnership_requests FOR SELECT
  USING (chapter_id IN (SELECT id FROM chapters WHERE user_id = auth.uid()));


-- ============================================================================
-- STEP 2: Add new subscription model columns to account_balance
-- ============================================================================

-- Add partnership request quota columns (if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='account_balance' AND column_name='partnership_requests_quota') THEN
    ALTER TABLE account_balance ADD COLUMN partnership_requests_quota INTEGER DEFAULT 5;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='account_balance' AND column_name='partnership_requests_used') THEN
    ALTER TABLE account_balance ADD COLUMN partnership_requests_used INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='account_balance' AND column_name='partnership_requests_reset_at') THEN
    ALTER TABLE account_balance ADD COLUMN partnership_requests_reset_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- Update subscription_tier to use new pricing
-- Values: 'starter' ($29.99), 'growth' ($99.99), 'enterprise' ($999)
-- Default to starter for existing accounts
UPDATE account_balance
SET subscription_tier = 'starter'
WHERE subscription_tier IS NULL OR subscription_tier = 'trial';

UPDATE account_balance
SET subscription_tier = 'starter'
WHERE subscription_tier = 'monthly';

UPDATE account_balance
SET subscription_tier = 'enterprise'
WHERE subscription_tier LIKE 'enterprise%';


-- ============================================================================
-- STEP 3: Add payment method table for chapters (Stripe Connect)
-- ============================================================================

CREATE TABLE IF NOT EXISTS chapter_payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Stripe Connect account
  stripe_account_id VARCHAR(255),
  stripe_account_status VARCHAR(50), -- pending, verified, restricted

  -- Payment preferences
  payment_method_type VARCHAR(50) DEFAULT 'stripe_connect', -- stripe_connect, bank_transfer, etc

  -- Bank account info (encrypted or tokenized via Stripe)
  last_4_digits VARCHAR(4),
  bank_name VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT valid_payment_method_type CHECK (payment_method_type IN ('stripe_connect', 'bank_transfer'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chapter_payment_methods_chapter_id ON chapter_payment_methods(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_payment_methods_stripe_account_id ON chapter_payment_methods(stripe_account_id);

-- Enable RLS
ALTER TABLE chapter_payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Chapters can view their own payment methods"
  ON chapter_payment_methods FOR SELECT
  USING (chapter_id IN (SELECT id FROM chapters WHERE user_id = auth.uid()));

CREATE POLICY "Chapters can update their own payment methods"
  ON chapter_payment_methods FOR UPDATE
  USING (chapter_id IN (SELECT id FROM chapters WHERE user_id = auth.uid()));


-- ============================================================================
-- STEP 4: Remove old credits/unlocks columns from account_balance
-- ============================================================================

-- Note: We're keeping these for now to allow for data migration if needed
-- You can run these ALTER TABLE DROP COLUMN commands after confirming data is migrated

-- ALTER TABLE account_balance DROP COLUMN IF EXISTS balance_credits;
-- ALTER TABLE account_balance DROP COLUMN IF EXISTS lifetime_spent_credits;
-- ALTER TABLE account_balance DROP COLUMN IF EXISTS lifetime_earned_credits;
-- ALTER TABLE account_balance DROP COLUMN IF EXISTS last_monthly_credit_grant_at;
-- ALTER TABLE account_balance DROP COLUMN IF EXISTS monthly_chapter_unlocks;
-- ALTER TABLE account_balance DROP COLUMN IF EXISTS chapter_unlocks_remaining;
-- ALTER TABLE account_balance DROP COLUMN IF EXISTS unlocks_5_star_remaining;
-- ALTER TABLE account_balance DROP COLUMN IF EXISTS unlocks_4_star_remaining;
-- ALTER TABLE account_balance DROP COLUMN IF EXISTS unlocks_3_star_remaining;
-- ALTER TABLE account_balance DROP COLUMN IF EXISTS monthly_unlocks_5_star;
-- ALTER TABLE account_balance DROP COLUMN IF EXISTS monthly_unlocks_4_star;
-- ALTER TABLE account_balance DROP COLUMN IF EXISTS monthly_unlocks_3_star;
-- ALTER TABLE account_balance DROP COLUMN IF EXISTS monthly_diamond_unlocks;
-- ALTER TABLE account_balance DROP COLUMN IF EXISTS diamond_unlocks_remaining;

-- Comment: Run the above commands manually after confirming the migration is successful


-- ============================================================================
-- STEP 5: Drop old tables (CAREFUL - this deletes data!)
-- ============================================================================

-- Note: Dropping these tables will delete all historical data
-- Consider backing up or archiving this data first

-- DROP TABLE IF EXISTS chapter_unlocks CASCADE;
-- DROP TABLE IF EXISTS credit_transactions CASCADE;
-- DROP TABLE IF EXISTS ambassador_unlocks CASCADE;
-- DROP TABLE IF EXISTS unlocked_data CASCADE;

-- Comment: Run the above commands manually after confirming the migration is successful


-- ============================================================================
-- STEP 6: Create helper functions
-- ============================================================================

-- Function to check if a company can submit a partnership request
CREATE OR REPLACE FUNCTION can_submit_partnership_request(p_company_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_quota INTEGER;
  v_used INTEGER;
  v_subscription_tier VARCHAR(50);
BEGIN
  SELECT
    partnership_requests_quota,
    partnership_requests_used,
    subscription_tier
  INTO v_quota, v_used, v_subscription_tier
  FROM account_balance
  WHERE company_id = p_company_id;

  -- Enterprise has unlimited requests
  IF v_subscription_tier = 'enterprise' THEN
    RETURN TRUE;
  END IF;

  -- Check if under quota
  RETURN (v_used < v_quota);
END;
$$ LANGUAGE plpgsql;

-- Function to increment partnership request usage
CREATE OR REPLACE FUNCTION increment_partnership_request_usage(p_company_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE account_balance
  SET partnership_requests_used = partnership_requests_used + 1
  WHERE company_id = p_company_id;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly partnership requests
CREATE OR REPLACE FUNCTION reset_monthly_partnership_requests()
RETURNS VOID AS $$
BEGIN
  UPDATE account_balance
  SET
    partnership_requests_used = 0,
    partnership_requests_reset_at = CURRENT_TIMESTAMP
  WHERE partnership_requests_reset_at < (CURRENT_TIMESTAMP - INTERVAL '1 month');
END;
$$ LANGUAGE plpgsql;

-- Function to calculate platform fee (20%)
CREATE OR REPLACE FUNCTION calculate_platform_fee(p_compensation NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN ROUND(p_compensation * 0.20, 2);
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- STEP 7: Update subscription quotas based on tier
-- ============================================================================

-- Starter: 5 requests/month
UPDATE account_balance
SET partnership_requests_quota = 5
WHERE subscription_tier = 'starter';

-- Growth: 20 requests/month
UPDATE account_balance
SET partnership_requests_quota = 20
WHERE subscription_tier = 'growth';

-- Enterprise: 999 (unlimited)
UPDATE account_balance
SET partnership_requests_quota = 999
WHERE subscription_tier = 'enterprise';


-- ============================================================================
-- STEP 8: Grant existing companies with a starting tier
-- ============================================================================

-- All existing companies start with Starter tier
UPDATE account_balance
SET
  subscription_tier = 'starter',
  partnership_requests_quota = 5,
  partnership_requests_used = 0,
  partnership_requests_reset_at = CURRENT_TIMESTAMP
WHERE subscription_tier IS NULL;


-- ============================================================================
-- Migration Complete!
-- ============================================================================

-- Summary of changes:
-- ✅ Created partnership_requests table
-- ✅ Added partnership request quota tracking to account_balance
-- ✅ Created chapter_payment_methods table for Stripe Connect
-- ✅ Updated subscription tiers to new pricing model
-- ✅ Created helper functions for quota management
-- ✅ Preserved old credits data for reference (can be dropped later)

-- Next steps:
-- 1. Update backend API routes (/credits → /subscriptions, /partnerships)
-- 2. Update Stripe webhook to handle new subscription prices
-- 3. Implement Stripe Connect onboarding for chapters
-- 4. Update frontend UI to remove credits and show subscriptions/partnerships
-- 5. Test thoroughly before dropping old tables
