-- Check what the valid_amount constraint is
SELECT pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'valid_amount';

-- Drop the old valid_amount constraint
ALTER TABLE public.balance_transactions
DROP CONSTRAINT IF EXISTS valid_amount;

-- Add a new constraint that allows both credits and dollars
-- At least one must be non-zero
ALTER TABLE public.balance_transactions
ADD CONSTRAINT valid_amount
CHECK (
    (amount_dollars IS NOT NULL AND amount_dollars != 0) OR
    (amount_credits IS NOT NULL AND amount_credits != 0)
);
