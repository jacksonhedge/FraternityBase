-- First, drop ALL versions of add_credits and deduct_credits
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT proname, oidvectortypes(proargtypes) as args
        FROM pg_proc
        WHERE proname IN ('add_credits', 'deduct_credits')
        AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || r.proname || '(' || r.args || ') CASCADE';
    END LOOP;
END $$;

-- Add credits columns if they don't exist
ALTER TABLE public.account_balance
ADD COLUMN IF NOT EXISTS balance_credits INTEGER DEFAULT 0 CHECK (balance_credits >= 0),
ADD COLUMN IF NOT EXISTS lifetime_spent_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_earned_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_monthly_credit_grant_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'trial';

-- Add credits columns to transactions
ALTER TABLE public.balance_transactions
ADD COLUMN IF NOT EXISTS amount_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_before INTEGER,
ADD COLUMN IF NOT EXISTS credits_after INTEGER;

-- Create the new add_credits function
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

-- Create the deduct_credits function
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
    v_dollars_after := v_dollars_before + p_dollars;

    -- Update balances
    UPDATE public.account_balance
    SET
        balance_credits = v_credits_after,
        balance_dollars = v_dollars_after,
        lifetime_spent_credits = lifetime_spent_credits + p_credits,
        lifetime_spent_dollars = lifetime_spent_dollars + p_dollars,
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

-- Initialize credits for existing accounts
UPDATE public.account_balance
SET balance_credits = 0
WHERE balance_credits IS NULL;
