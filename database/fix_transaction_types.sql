-- First, drop the old constraint
ALTER TABLE public.balance_transactions
DROP CONSTRAINT IF EXISTS balance_transactions_transaction_type_check;

-- Update any old transaction types to valid ones
-- Map old types to new types
UPDATE public.balance_transactions
SET transaction_type = CASE
    WHEN transaction_type = 'balance_add' THEN 'credit_purchase'
    WHEN transaction_type = 'balance_deduct' THEN 'chapter_unlock'
    WHEN transaction_type = 'unlock' THEN 'chapter_unlock'
    WHEN transaction_type = 'purchase' THEN 'credit_purchase'
    WHEN transaction_type = 'admin_add' THEN 'credit_purchase'
    WHEN transaction_type = 'admin_manual_add' THEN 'credit_purchase'
    ELSE transaction_type
END
WHERE transaction_type NOT IN (
    'credit_purchase',
    'credit_grant',
    'chapter_unlock',
    'five_star_unlock',
    'warm_intro',
    'ambassador_referral',
    'venue_connection',
    'monthly_credit_grant',
    'subscription_payment',
    'refund'
);

-- Now add the constraint with all valid types
ALTER TABLE public.balance_transactions
ADD CONSTRAINT balance_transactions_transaction_type_check
CHECK (transaction_type IN (
    'credit_purchase',
    'credit_grant',
    'chapter_unlock',
    'five_star_unlock',
    'warm_intro',
    'ambassador_referral',
    'venue_connection',
    'monthly_credit_grant',
    'subscription_payment',
    'refund'
));
