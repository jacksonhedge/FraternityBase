-- Drop the old valid_amount constraint
ALTER TABLE public.balance_transactions
DROP CONSTRAINT IF EXISTS valid_amount;

-- Add updated constraint that works with credits system
-- For credit additions: amount_credits > 0
-- For credit deductions: amount_credits < 0
-- For dollar additions: amount_dollars > 0
-- For dollar deductions: amount_dollars < 0
ALTER TABLE public.balance_transactions
ADD CONSTRAINT valid_amount
CHECK (
    -- Addition transactions (positive amounts)
    (
        transaction_type IN ('credit_purchase', 'credit_grant', 'manual_add', 'top_up', 'auto_reload', 'refund', 'monthly_credit_grant', 'subscription_payment')
        AND (
            (amount_credits IS NOT NULL AND amount_credits > 0) OR
            (amount_dollars IS NOT NULL AND amount_dollars > 0)
        )
    )
    OR
    -- Deduction transactions (negative amounts)
    (
        transaction_type IN ('chapter_unlock', 'five_star_unlock', 'warm_intro', 'ambassador_referral', 'venue_connection')
        AND (
            (amount_credits IS NOT NULL AND amount_credits < 0) OR
            (amount_dollars IS NOT NULL AND amount_dollars < 0)
        )
    )
);
