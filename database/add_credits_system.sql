-- ADD CREDITS SYSTEM
-- This migration adds credits tracking alongside dollar amounts
-- Run this in Supabase SQL Editor

-- ==========================================
-- ADD CREDITS COLUMNS TO ACCOUNT_BALANCE
-- ==========================================

ALTER TABLE public.account_balance
ADD COLUMN IF NOT EXISTS balance_credits INTEGER DEFAULT 0 CHECK (balance_credits >= 0),
ADD COLUMN IF NOT EXISTS lifetime_spent_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_earned_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_monthly_credit_grant_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'trial'; -- 'trial', 'monthly', 'enterprise'

COMMENT ON COLUMN public.account_balance.balance_credits IS 'Current credits balance (integer)';
COMMENT ON COLUMN public.account_balance.balance_dollars IS 'Current dollar balance for tracking money spent';
COMMENT ON COLUMN public.account_balance.lifetime_spent_credits IS 'Total credits spent on unlocks/services';
COMMENT ON COLUMN public.account_balance.lifetime_spent_dollars IS 'Total money spent (tracked for analytics)';
COMMENT ON COLUMN public.account_balance.lifetime_earned_credits IS 'Total credits earned (monthly grants + purchases)';
COMMENT ON COLUMN public.account_balance.last_monthly_credit_grant_at IS 'Last time monthly credits were granted';
COMMENT ON COLUMN public.account_balance.subscription_tier IS 'Current subscription tier';

-- ==========================================
-- ADD CREDITS COLUMNS TO BALANCE_TRANSACTIONS
-- ==========================================

ALTER TABLE public.balance_transactions
ADD COLUMN IF NOT EXISTS amount_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_before INTEGER,
ADD COLUMN IF NOT EXISTS credits_after INTEGER;

COMMENT ON COLUMN public.balance_transactions.amount_credits IS 'Credits added/deducted (positive for additions, negative for deductions)';
COMMENT ON COLUMN public.balance_transactions.amount_dollars IS 'Dollar amount (for money spent tracking)';

-- ==========================================
-- UPDATE PRICING CONSTANTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.pricing_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(100) UNIQUE NOT NULL,
    credits_cost INTEGER NOT NULL,
    dollar_value DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert pricing (based on your requirements)
INSERT INTO public.pricing_config (service_name, credits_cost, dollar_value, description)
VALUES
    ('five_star_unlock', 30, 9.99, '5-star chapter unlock'),
    ('chapter_unlock', 10, 2.99, 'Standard chapter unlock'),
    ('warm_intro', 200, 59.99, 'Warm introduction request'),
    ('ambassador_referral', 330, 99.99, 'Ambassador referral/matching'),
    ('venue_connection', 160, 49.99, 'Venue/bar connection'),
    ('monthly_subscription_grant', 100, 0.00, 'Monthly credits for subscribers'),
    ('credit_purchase_100', 100, 29.99, 'Purchase 100 credits'),
    ('credit_purchase_500', 500, 139.99, 'Purchase 500 credits (7% bonus)'),
    ('credit_purchase_1000', 1000, 249.99, 'Purchase 1000 credits (17% bonus)')
ON CONFLICT (service_name) DO UPDATE
SET
    credits_cost = EXCLUDED.credits_cost,
    dollar_value = EXCLUDED.dollar_value,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- ==========================================
-- UPDATED FUNCTIONS FOR CREDITS
-- ==========================================

-- Drop existing functions (drop all versions)
DROP FUNCTION IF EXISTS public.add_credits(p_amount DECIMAL, p_company_id UUID, p_description TEXT, p_reference_id VARCHAR, p_reference_type VARCHAR);
DROP FUNCTION IF EXISTS public.add_credits(UUID, INTEGER, DECIMAL, VARCHAR, TEXT, VARCHAR);
DROP FUNCTION IF EXISTS public.deduct_credits(UUID, INTEGER, DECIMAL, VARCHAR, TEXT, UUID);

-- Function to add credits (from monthly grant or purchase)
CREATE OR REPLACE FUNCTION public.add_credits(
    p_company_id UUID,
    p_credits INTEGER,
    p_dollars DECIMAL DEFAULT 0.00,
    p_transaction_type VARCHAR DEFAULT 'credit_purchase',
    p_description TEXT DEFAULT '',
    p_stripe_payment_intent_id VARCHAR DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_credits_before INTEGER;
    v_credits_after INTEGER;
    v_dollars_before DECIMAL(10,2);
    v_dollars_after DECIMAL(10,2);
    v_transaction_id UUID;
BEGIN
    -- Ensure account exists
    INSERT INTO public.account_balance (company_id, balance_credits, balance_dollars)
    VALUES (p_company_id, 0, 0.00)
    ON CONFLICT (company_id) DO NOTHING;

    -- Get current balances with row lock
    SELECT balance_credits, balance_dollars INTO v_credits_before, v_dollars_before
    FROM public.account_balance
    WHERE company_id = p_company_id
    FOR UPDATE;

    -- Calculate new balances
    v_credits_after := v_credits_before + p_credits;
    v_dollars_after := v_dollars_before + p_dollars;

    -- Update balances
    UPDATE public.account_balance
    SET
        balance_credits = v_credits_after,
        balance_dollars = v_dollars_after,
        lifetime_earned_credits = lifetime_earned_credits + p_credits,
        lifetime_added_dollars = lifetime_added_dollars + p_dollars,
        updated_at = CURRENT_TIMESTAMP
    WHERE company_id = p_company_id;

    -- Log transaction
    INSERT INTO public.balance_transactions (
        company_id,
        amount_credits,
        credits_before,
        credits_after,
        amount_dollars,
        balance_before,
        balance_after,
        transaction_type,
        description,
        stripe_payment_intent_id
    ) VALUES (
        p_company_id,
        p_credits,
        v_credits_before,
        v_credits_after,
        p_dollars,
        v_dollars_before,
        v_dollars_after,
        p_transaction_type,
        p_description,
        p_stripe_payment_intent_id
    ) RETURNING id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credits (for unlocks, services)
CREATE OR REPLACE FUNCTION public.deduct_credits(
    p_company_id UUID,
    p_credits INTEGER,
    p_dollars DECIMAL DEFAULT 0.00,
    p_transaction_type VARCHAR DEFAULT 'chapter_unlock',
    p_description TEXT DEFAULT '',
    p_chapter_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_credits_before INTEGER;
    v_credits_after INTEGER;
    v_dollars_before DECIMAL(10,2);
    v_dollars_after DECIMAL(10,2);
    v_transaction_id UUID;
BEGIN
    -- Get current balances with row lock
    SELECT balance_credits, balance_dollars INTO v_credits_before, v_dollars_before
    FROM public.account_balance
    WHERE company_id = p_company_id
    FOR UPDATE;

    -- Check sufficient credits
    IF v_credits_before < p_credits THEN
        RAISE EXCEPTION 'Insufficient credits. Required: %, Available: %', p_credits, v_credits_before;
    END IF;

    -- Calculate new balances
    v_credits_after := v_credits_before - p_credits;
    v_dollars_after := v_dollars_before + p_dollars; -- Track money value spent

    -- Update balances
    UPDATE public.account_balance
    SET
        balance_credits = v_credits_after,
        balance_dollars = v_dollars_after,
        lifetime_spent_credits = lifetime_spent_credits + p_credits,
        lifetime_spent_dollars = lifetime_spent_dollars + p_dollars,
        updated_at = CURRENT_TIMESTAMP
    WHERE company_id = p_company_id;

    -- Log transaction (negative credits for deduction)
    INSERT INTO public.balance_transactions (
        company_id,
        amount_credits,
        credits_before,
        credits_after,
        amount_dollars,
        balance_before,
        balance_after,
        transaction_type,
        description,
        chapter_id
    ) VALUES (
        p_company_id,
        -p_credits,
        v_credits_before,
        v_credits_after,
        p_dollars,
        v_dollars_before,
        v_dollars_after,
        p_transaction_type,
        p_description,
        p_chapter_id
    ) RETURNING id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to grant monthly credits to subscribers
CREATE OR REPLACE FUNCTION public.grant_monthly_credits(
    p_company_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_last_grant TIMESTAMP;
    v_tier VARCHAR(50);
    v_credits_to_grant INTEGER;
BEGIN
    -- Get subscription tier and last grant time
    SELECT subscription_tier, last_monthly_credit_grant_at
    INTO v_tier, v_last_grant
    FROM public.account_balance
    WHERE company_id = p_company_id;

    -- Check if eligible for monthly grant (30 days since last grant)
    IF v_last_grant IS NOT NULL AND v_last_grant > CURRENT_TIMESTAMP - INTERVAL '30 days' THEN
        RETURN FALSE; -- Already granted this month
    END IF;

    -- Determine credits based on tier
    v_credits_to_grant := CASE
        WHEN v_tier = 'monthly' THEN 100
        WHEN v_tier = 'enterprise' THEN 500
        ELSE 0 -- trial gets 0
    END;

    IF v_credits_to_grant > 0 THEN
        -- Grant credits
        PERFORM public.add_credits(
            p_company_id,
            v_credits_to_grant,
            0.00,
            'monthly_credit_grant',
            'Monthly subscription credit grant',
            NULL
        );

        -- Update last grant time
        UPDATE public.account_balance
        SET last_monthly_credit_grant_at = CURRENT_TIMESTAMP
        WHERE company_id = p_company_id;

        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- MIGRATE EXISTING DATA
-- ==========================================

-- For existing accounts, set initial credits to 0 and convert dollar balance if needed
UPDATE public.account_balance
SET balance_credits = 0
WHERE balance_credits IS NULL;

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON FUNCTION public.add_credits IS 'Add credits to account (from purchase or monthly grant)';
COMMENT ON FUNCTION public.deduct_credits IS 'Deduct credits from account (for unlocks/services) and track dollar value';
COMMENT ON FUNCTION public.grant_monthly_credits IS 'Grant monthly credits to active subscribers (100 for monthly, 500 for enterprise)';
COMMENT ON TABLE public.pricing_config IS 'Pricing configuration for services (credits and dollar values)';

-- ==========================================
-- NOTES
-- ==========================================

-- New pricing model:
-- - 5-star chapter unlock: 30 credits ($9.99 value)
-- - Monthly subscription: $29.99/month + 100 free credits
-- - Credits are the currency, dollars track spending for analytics
-- - balance_credits: what users spend
-- - balance_dollars: analytics for total money value
