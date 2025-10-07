-- Verify the grant_monthly_credits function exists and recreate it if needed
DROP FUNCTION IF EXISTS public.grant_monthly_credits(p_company_id UUID);

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
        WHEN v_tier = 'enterprise' THEN 800
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

COMMENT ON FUNCTION public.grant_monthly_credits IS 'Grant monthly credits to active subscribers (100 for monthly, 500 for enterprise)';
