-- Add introduction transaction types to the allowed types
-- This migration adds 'fraternity_introduction' and 'ambassador_introduction' to the transaction_type constraint

-- Drop the existing constraint
ALTER TABLE public.balance_transactions
DROP CONSTRAINT IF EXISTS balance_transactions_transaction_type_check;

-- Add the updated constraint with new introduction types
ALTER TABLE public.balance_transactions
ADD CONSTRAINT balance_transactions_transaction_type_check
CHECK (transaction_type IN (
    -- Credit additions
    'manual_add',
    'credit_purchase',
    'credit_grant',
    'monthly_credit_grant',
    'subscription_credit',
    'free_trial_unlock',

    -- Credit deductions
    'chapter_unlock',
    'five_star_unlock',
    'fraternity_introduction',
    'ambassador_introduction',

    -- Other
    'refund',
    'adjustment'
));

COMMENT ON CONSTRAINT balance_transactions_transaction_type_check ON public.balance_transactions IS
'Allowed transaction types: manual_add, credit_purchase, credit_grant, monthly_credit_grant, subscription_credit, free_trial_unlock, chapter_unlock, five_star_unlock, fraternity_introduction, ambassador_introduction, refund, adjustment';
