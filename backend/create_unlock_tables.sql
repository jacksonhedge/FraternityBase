-- Credits table to track user credit balances
CREATE TABLE IF NOT EXISTS credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id)
);

-- Credit transactions table to track all credit movements
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive for purchases, negative for spends
  transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'unlock', 'refund', 'admin_adjustment'
  description TEXT,
  reference_id UUID, -- chapter_id for unlocks, stripe payment_intent for purchases
  reference_type VARCHAR(50), -- 'chapter', 'payment', etc.
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- Unlocks table to track what chapters have been unlocked
CREATE TABLE IF NOT EXISTS chapter_unlocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  unlock_type VARCHAR(50) NOT NULL, -- 'roster', 'emails', 'phones', 'officers', 'full'
  credits_spent INTEGER NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL for permanent, or 6 months from unlock
  UNIQUE(company_id, chapter_id, unlock_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_credits_company_id ON credits(company_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_company_id ON credit_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chapter_unlocks_company_id ON chapter_unlocks(company_id);
CREATE INDEX IF NOT EXISTS idx_chapter_unlocks_chapter_id ON chapter_unlocks(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_unlocks_expires_at ON chapter_unlocks(expires_at);

-- Enable Row Level Security
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_unlocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only see their own data)
CREATE POLICY "Users can view their own credits"
  ON credits FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM companies WHERE id = company_id));

CREATE POLICY "Users can view their own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM companies WHERE id = company_id));

CREATE POLICY "Users can view their own unlocks"
  ON chapter_unlocks FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM companies WHERE id = company_id));

-- Function to add credits (called from webhook or admin)
CREATE OR REPLACE FUNCTION add_credits(
  p_company_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type VARCHAR DEFAULT 'payment'
)
RETURNS JSONB AS $$
DECLARE
  v_new_balance INTEGER;
  v_lifetime_total INTEGER;
BEGIN
  -- Insert or update credits balance
  INSERT INTO credits (company_id, balance, lifetime_total)
  VALUES (p_company_id, p_amount, p_amount)
  ON CONFLICT (company_id)
  DO UPDATE SET
    balance = credits.balance + p_amount,
    lifetime_total = credits.lifetime_total + p_amount,
    updated_at = CURRENT_TIMESTAMP
  RETURNING balance, lifetime_total INTO v_new_balance, v_lifetime_total;

  -- Record transaction
  INSERT INTO credit_transactions (
    company_id, amount, transaction_type, description,
    reference_id, reference_type, balance_after
  ) VALUES (
    p_company_id, p_amount, 'purchase', p_description,
    p_reference_id, p_reference_type, v_new_balance
  );

  RETURN jsonb_build_object(
    'success', true,
    'balance', v_new_balance,
    'lifetime_total', v_lifetime_total
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to spend credits (unlock chapter)
CREATE OR REPLACE FUNCTION spend_credits(
  p_company_id UUID,
  p_chapter_id UUID,
  p_unlock_type VARCHAR,
  p_credits_cost INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT balance INTO v_current_balance
  FROM credits
  WHERE company_id = p_company_id;

  -- Check if user has enough credits
  IF v_current_balance IS NULL OR v_current_balance < p_credits_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient credits'
    );
  END IF;

  -- Check if already unlocked
  IF EXISTS (
    SELECT 1 FROM chapter_unlocks
    WHERE company_id = p_company_id
    AND chapter_id = p_chapter_id
    AND unlock_type = p_unlock_type
    AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Already unlocked'
    );
  END IF;

  -- Deduct credits
  UPDATE credits
  SET balance = balance - p_credits_cost,
      updated_at = CURRENT_TIMESTAMP
  WHERE company_id = p_company_id
  RETURNING balance INTO v_new_balance;

  -- Record transaction
  INSERT INTO credit_transactions (
    company_id, amount, transaction_type, description,
    reference_id, reference_type, balance_after
  ) VALUES (
    p_company_id, -p_credits_cost, 'unlock',
    'Unlocked ' || p_unlock_type || ' data',
    p_chapter_id, 'chapter', v_new_balance
  );

  -- Record unlock (6 months expiry)
  INSERT INTO chapter_unlocks (
    company_id, chapter_id, unlock_type, credits_spent,
    expires_at
  ) VALUES (
    p_company_id, p_chapter_id, p_unlock_type, p_credits_cost,
    CURRENT_TIMESTAMP + INTERVAL '6 months'
  );

  RETURN jsonb_build_object(
    'success', true,
    'balance', v_new_balance,
    'credits_spent', p_credits_cost
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
