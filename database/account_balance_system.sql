-- ACCOUNT BALANCE SYSTEM (Dollar-based)
-- This schema supports the credits/billing system for companies
-- Run this in Supabase SQL Editor

-- ==========================================
-- TABLES
-- ==========================================

-- Company account balances (in dollars)
CREATE TABLE IF NOT EXISTS public.account_balance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL UNIQUE,
    balance_dollars DECIMAL(10,2) DEFAULT 0.00 CHECK (balance_dollars >= 0),
    lifetime_spent_dollars DECIMAL(10,2) DEFAULT 0.00,
    lifetime_added_dollars DECIMAL(10,2) DEFAULT 0.00,

    -- Auto-reload settings
    auto_reload_enabled BOOLEAN DEFAULT FALSE,
    auto_reload_threshold DECIMAL(10,2) DEFAULT 10.00,
    auto_reload_amount DECIMAL(10,2) DEFAULT 50.00,
    last_auto_reload_at TIMESTAMP,

    -- Stripe payment method (for auto-reload)
    stripe_customer_id VARCHAR(255),
    stripe_payment_method_id VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Balance transactions log
CREATE TABLE IF NOT EXISTS public.balance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    amount_dollars DECIMAL(10,2) NOT NULL, -- positive for additions, negative for deductions
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,

    transaction_type VARCHAR(50) NOT NULL, -- 'top_up', 'auto_reload', 'chapter_unlock', 'warm_intro', 'ambassador_referral', 'manual_add'
    description TEXT,

    -- For payments
    stripe_payment_intent_id VARCHAR(255),

    -- For usage
    chapter_id UUID,

    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warm introduction requests
CREATE TABLE IF NOT EXISTS public.warm_intro_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    chapter_id UUID NOT NULL,
    message TEXT,
    preferred_contact_method VARCHAR(50),
    urgency VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high'
    amount_paid DECIMAL(10,2) NOT NULL,
    transaction_id UUID,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ambassador referral requests
CREATE TABLE IF NOT EXISTS public.ambassador_referral_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    chapter_id UUID NOT NULL,
    campaign_description TEXT,
    budget_range VARCHAR(50),
    timeline VARCHAR(50),
    amount_paid DECIMAL(10,2) NOT NULL,
    transaction_id UUID,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'matched', 'active', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_account_balance_company ON public.account_balance(company_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_company ON public.balance_transactions(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_warm_intro_company ON public.warm_intro_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_company ON public.ambassador_referral_requests(company_id);

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Drop existing functions if they exist (to handle parameter changes)
DROP FUNCTION IF EXISTS public.add_balance(UUID, DECIMAL, VARCHAR, TEXT, VARCHAR);
DROP FUNCTION IF EXISTS public.deduct_balance(UUID, DECIMAL, VARCHAR, TEXT, UUID);

-- Function to add balance (from Stripe payment)
CREATE OR REPLACE FUNCTION public.add_balance(
    p_company_id UUID,
    p_amount DECIMAL,
    p_transaction_type VARCHAR,
    p_description TEXT,
    p_stripe_payment_intent_id VARCHAR DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_balance_before DECIMAL(10,2);
    v_balance_after DECIMAL(10,2);
    v_transaction_id UUID;
BEGIN
    -- Ensure account exists
    INSERT INTO public.account_balance (company_id, balance_dollars)
    VALUES (p_company_id, 0.00)
    ON CONFLICT (company_id) DO NOTHING;

    -- Get current balance with row lock
    SELECT balance_dollars INTO v_balance_before
    FROM public.account_balance
    WHERE company_id = p_company_id
    FOR UPDATE;

    -- Calculate new balance
    v_balance_after := v_balance_before + p_amount;

    -- Update balance
    UPDATE public.account_balance
    SET
        balance_dollars = v_balance_after,
        lifetime_added_dollars = lifetime_added_dollars + p_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE company_id = p_company_id;

    -- Log transaction
    INSERT INTO public.balance_transactions (
        company_id,
        amount_dollars,
        balance_before,
        balance_after,
        transaction_type,
        description,
        stripe_payment_intent_id
    ) VALUES (
        p_company_id,
        p_amount,
        v_balance_before,
        v_balance_after,
        p_transaction_type,
        p_description,
        p_stripe_payment_intent_id
    ) RETURNING id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct balance (for chapter unlocks, etc.)
CREATE OR REPLACE FUNCTION public.deduct_balance(
    p_company_id UUID,
    p_amount DECIMAL,
    p_transaction_type VARCHAR,
    p_description TEXT,
    p_chapter_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_balance_before DECIMAL(10,2);
    v_balance_after DECIMAL(10,2);
    v_transaction_id UUID;
BEGIN
    -- Get current balance with row lock
    SELECT balance_dollars INTO v_balance_before
    FROM public.account_balance
    WHERE company_id = p_company_id
    FOR UPDATE;

    -- Check sufficient balance
    IF v_balance_before < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance. Required: %, Available: %', p_amount, v_balance_before;
    END IF;

    -- Calculate new balance
    v_balance_after := v_balance_before - p_amount;

    -- Update balance
    UPDATE public.account_balance
    SET
        balance_dollars = v_balance_after,
        lifetime_spent_dollars = lifetime_spent_dollars + p_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE company_id = p_company_id;

    -- Log transaction (negative amount for deduction)
    INSERT INTO public.balance_transactions (
        company_id,
        amount_dollars,
        balance_before,
        balance_after,
        transaction_type,
        description,
        chapter_id
    ) VALUES (
        p_company_id,
        -p_amount,
        v_balance_before,
        v_balance_after,
        p_transaction_type,
        p_description,
        p_chapter_id
    ) RETURNING id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE public.account_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warm_intro_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_referral_requests ENABLE ROW LEVEL SECURITY;

-- Policies for account_balance
CREATE POLICY "Users can view their own company balance"
    ON public.account_balance FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles
            WHERE user_id = auth.uid()
        )
    );

-- Policies for balance_transactions
CREATE POLICY "Users can view their own company transactions"
    ON public.balance_transactions FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles
            WHERE user_id = auth.uid()
        )
    );

-- Policies for warm_intro_requests
CREATE POLICY "Users can view their own company warm intro requests"
    ON public.warm_intro_requests FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create warm intro requests for their company"
    ON public.warm_intro_requests FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.user_profiles
            WHERE user_id = auth.uid()
        )
    );

-- Policies for ambassador_referral_requests
CREATE POLICY "Users can view their own company ambassador requests"
    ON public.ambassador_referral_requests FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create ambassador requests for their company"
    ON public.ambassador_referral_requests FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.user_profiles
            WHERE user_id = auth.uid()
        )
    );

-- ==========================================
-- INITIAL DATA
-- ==========================================

-- Add some test/demo data if needed
-- INSERT INTO public.account_balance (company_id, balance_dollars) VALUES
-- ('00000000-0000-0000-0000-000000000000', 100.00);
