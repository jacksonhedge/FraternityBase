-- Migration: Convert credit system to dollar-based balance system
-- Created: 2025-10-03

-- =====================================================
-- 1. Modify credits table to become account_balance
-- =====================================================

-- Rename table
ALTER TABLE credits RENAME TO account_balance;

-- Drop old columns and add new ones
ALTER TABLE account_balance
  DROP COLUMN IF EXISTS balance,
  DROP COLUMN IF EXISTS lifetime_total,
  ADD COLUMN IF NOT EXISTS balance_dollars DECIMAL(10, 2) DEFAULT 0.00 CHECK (balance_dollars >= 0),
  ADD COLUMN IF NOT EXISTS lifetime_spent_dollars DECIMAL(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS lifetime_added_dollars DECIMAL(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS auto_reload_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_reload_threshold DECIMAL(10, 2) DEFAULT 10.00,
  ADD COLUMN IF NOT EXISTS auto_reload_amount DECIMAL(10, 2) DEFAULT 50.00,
  ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS stripe_payment_method_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS last_auto_reload_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have $50 starting balance (2-3 free unlocks)
UPDATE account_balance
SET balance_dollars = 50.00,
    lifetime_added_dollars = 50.00
WHERE balance_dollars IS NULL OR balance_dollars = 0;

-- =====================================================
-- 2. Create balance_transactions table
-- =====================================================

CREATE TABLE IF NOT EXISTS balance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  amount_dollars DECIMAL(10, 2) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('top_up', 'manual_add', 'auto_reload', 'chapter_unlock', 'warm_intro', 'ambassador_referral', 'refund', 'adjustment')),
  description TEXT,
  balance_before DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,

  -- Reference data
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),

  -- Metadata
  metadata JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  CONSTRAINT valid_amount CHECK (
    (transaction_type IN ('top_up', 'manual_add', 'auto_reload', 'refund') AND amount_dollars > 0) OR
    (transaction_type IN ('chapter_unlock', 'warm_intro', 'ambassador_referral') AND amount_dollars < 0)
  )
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_balance_transactions_company_id ON balance_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_created_at ON balance_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_type ON balance_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_chapter_id ON balance_transactions(chapter_id);

-- =====================================================
-- 3. Update chapter_unlocks table to track cost
-- =====================================================

ALTER TABLE chapter_unlocks
  DROP COLUMN IF EXISTS credits_spent,
  ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS transaction_id UUID REFERENCES balance_transactions(id) ON DELETE SET NULL;

-- Update existing unlocks to reflect $19.99 cost (or $0 for free unlocks)
UPDATE chapter_unlocks
SET amount_paid = CASE
  WHEN unlock_type = 'free' THEN 0.00
  ELSE 19.99
END;

-- =====================================================
-- 4. Create pricing constants table
-- =====================================================

CREATE TABLE IF NOT EXISTS pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type VARCHAR(100) NOT NULL UNIQUE,
  price_dollars DECIMAL(10, 2) NOT NULL CHECK (price_dollars >= 0),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert pricing
INSERT INTO pricing (item_type, price_dollars, description) VALUES
  ('chapter_unlock', 19.99, 'Full chapter unlock with all contact information'),
  ('warm_intro', 59.99, 'Warm introduction to chapter leadership'),
  ('ambassador_referral', 99.99, 'Ambassador referral and dedicated contact')
ON CONFLICT (item_type) DO UPDATE SET
  price_dollars = EXCLUDED.price_dollars,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- 5. Create requests tables for warm intros and referrals
-- =====================================================

CREATE TABLE IF NOT EXISTS warm_intro_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),

  -- Request details
  message TEXT,
  preferred_contact_method VARCHAR(50),
  urgency VARCHAR(50) DEFAULT 'normal',

  -- Payment
  amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 59.99,
  transaction_id UUID REFERENCES balance_transactions(id) ON DELETE SET NULL,

  -- Response
  admin_notes TEXT,
  introduction_made_at TIMESTAMP,
  contact_person_name VARCHAR(255),
  contact_person_email VARCHAR(255),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ambassador_referral_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'active', 'completed', 'cancelled')),

  -- Request details
  campaign_description TEXT,
  budget_range VARCHAR(100),
  timeline VARCHAR(100),

  -- Payment
  amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 99.99,
  transaction_id UUID REFERENCES balance_transactions(id) ON DELETE SET NULL,

  -- Ambassador details (when matched)
  ambassador_name VARCHAR(255),
  ambassador_email VARCHAR(255),
  ambassador_phone VARCHAR(50),
  matched_at TIMESTAMP,

  -- Admin notes
  admin_notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_warm_intro_company ON warm_intro_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_warm_intro_chapter ON warm_intro_requests(chapter_id);
CREATE INDEX IF NOT EXISTS idx_warm_intro_status ON warm_intro_requests(status);
CREATE INDEX IF NOT EXISTS idx_ambassador_company ON ambassador_referral_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_chapter ON ambassador_referral_requests(chapter_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_status ON ambassador_referral_requests(status);

-- =====================================================
-- 6. Create RLS policies for new tables
-- =====================================================

-- Balance transactions
ALTER TABLE balance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view their own transactions"
  ON balance_transactions FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- Warm intro requests
ALTER TABLE warm_intro_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view their own warm intro requests"
  ON warm_intro_requests FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Companies can create warm intro requests"
  ON warm_intro_requests FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- Ambassador referral requests
ALTER TABLE ambassador_referral_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view their own ambassador requests"
  ON ambassador_referral_requests FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Companies can create ambassador requests"
  ON ambassador_referral_requests FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- Account balance
ALTER TABLE account_balance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view their own balance"
  ON account_balance FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Companies can update their own auto-reload settings"
  ON account_balance FOR UPDATE
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ))
  WITH CHECK (company_id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- =====================================================
-- 7. Create helper functions
-- =====================================================

-- Function to add balance
CREATE OR REPLACE FUNCTION add_balance(
  p_company_id UUID,
  p_amount DECIMAL,
  p_transaction_type VARCHAR,
  p_description TEXT DEFAULT NULL,
  p_stripe_payment_intent_id VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_balance_before DECIMAL;
  v_balance_after DECIMAL;
  v_transaction_id UUID;
BEGIN
  -- Get current balance
  SELECT balance_dollars INTO v_balance_before
  FROM account_balance
  WHERE company_id = p_company_id;

  -- Calculate new balance
  v_balance_after := v_balance_before + p_amount;

  -- Update balance
  UPDATE account_balance
  SET balance_dollars = v_balance_after,
      lifetime_added_dollars = lifetime_added_dollars + p_amount,
      updated_at = CURRENT_TIMESTAMP
  WHERE company_id = p_company_id;

  -- Create transaction record
  INSERT INTO balance_transactions (
    company_id,
    amount_dollars,
    transaction_type,
    description,
    balance_before,
    balance_after,
    stripe_payment_intent_id
  ) VALUES (
    p_company_id,
    p_amount,
    p_transaction_type,
    p_description,
    v_balance_before,
    v_balance_after,
    p_stripe_payment_intent_id
  ) RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct balance (for unlocks/requests)
CREATE OR REPLACE FUNCTION deduct_balance(
  p_company_id UUID,
  p_amount DECIMAL,
  p_transaction_type VARCHAR,
  p_description TEXT DEFAULT NULL,
  p_chapter_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_balance_before DECIMAL;
  v_balance_after DECIMAL;
  v_transaction_id UUID;
BEGIN
  -- Get current balance
  SELECT balance_dollars INTO v_balance_before
  FROM account_balance
  WHERE company_id = p_company_id;

  -- Check if sufficient balance
  IF v_balance_before < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Current: %, Required: %', v_balance_before, p_amount;
  END IF;

  -- Calculate new balance (amount should be positive, we'll make it negative)
  v_balance_after := v_balance_before - p_amount;

  -- Update balance
  UPDATE account_balance
  SET balance_dollars = v_balance_after,
      lifetime_spent_dollars = lifetime_spent_dollars + p_amount,
      updated_at = CURRENT_TIMESTAMP
  WHERE company_id = p_company_id;

  -- Create transaction record (negative amount)
  INSERT INTO balance_transactions (
    company_id,
    amount_dollars,
    transaction_type,
    description,
    balance_before,
    balance_after,
    chapter_id
  ) VALUES (
    p_company_id,
    -p_amount,  -- Negative for deduction
    p_transaction_type,
    p_description,
    v_balance_before,
    v_balance_after,
    p_chapter_id
  ) RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Migration Complete
-- =====================================================

-- Summary
DO $$
BEGIN
  RAISE NOTICE '✅ Migration complete: Dollar-based balance system';
  RAISE NOTICE '📊 Pricing:';
  RAISE NOTICE '   - Chapter Unlock: $19.99';
  RAISE NOTICE '   - Warm Introduction: $59.99';
  RAISE NOTICE '   - Ambassador Referral: $99.99';
  RAISE NOTICE '💰 All companies now have $50 starting balance';
END $$;
