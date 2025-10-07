-- Update the transaction_type check constraint to include all valid types
ALTER TABLE public.balance_transactions
DROP CONSTRAINT IF EXISTS balance_transactions_transaction_type_check;

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
