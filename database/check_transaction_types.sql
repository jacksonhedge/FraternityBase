-- Query to see what transaction types exist
SELECT DISTINCT transaction_type
FROM public.balance_transactions
ORDER BY transaction_type;
