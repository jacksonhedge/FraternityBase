-- Fix account balance system - only create missing parts

-- Drop and recreate the add_balance function to ensure it's correct
DROP FUNCTION IF EXISTS public.add_balance(UUID, DECIMAL, VARCHAR, TEXT, VARCHAR);

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

-- Test: Insert a balance for the Hedge company (e06324d0-6a8c-46f5-b7a1-a01e15dd281f)
-- This will create the initial row with the credits that have already been added
INSERT INTO public.account_balance (company_id, balance_dollars, lifetime_added_dollars)
VALUES ('e06324d0-6a8c-46f5-b7a1-a01e15dd281f', 100.00, 100.00)
ON CONFLICT (company_id)
DO UPDATE SET
    balance_dollars = 100.00,
    lifetime_added_dollars = 100.00;
