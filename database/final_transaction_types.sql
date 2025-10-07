-- Drop the old constraint
ALTER TABLE public.balance_transactions
DROP CONSTRAINT IF EXISTS balance_transactions_transaction_type_check;

-- Add the constraint with all valid types including existing ones
ALTER TABLE public.balance_transactions
ADD CONSTRAINT balance_transactions_transaction_type_check
CHECK (transaction_type IN (
    'manual_add',
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
