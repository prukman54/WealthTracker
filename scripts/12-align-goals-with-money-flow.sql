-- Make financial_goals use the EXACT same user_id format as money_flow
-- First, let's see what money_flow is using

-- Step 1: Check current state
SELECT 'CURRENT MONEY FLOW IDS' as step;
SELECT DISTINCT user_id, COUNT(*) as records
FROM money_flow 
GROUP BY user_id;

SELECT 'CURRENT GOALS IDS' as step;  
SELECT DISTINCT user_id, COUNT(*) as records
FROM financial_goals
GROUP BY user_id;

-- Step 2: If they don't match, update goals to match money_flow format
-- Delete any goals that don't have corresponding money_flow records
DELETE FROM financial_goals 
WHERE user_id NOT IN (SELECT DISTINCT user_id FROM money_flow);

-- Step 3: For any remaining goals, make sure they use the same user_id as money_flow
-- This ensures 100% consistency
UPDATE financial_goals 
SET user_id = mf.user_id
FROM (
    SELECT DISTINCT user_id 
    FROM money_flow 
    WHERE user_id IN (SELECT user_id FROM users)
) mf
WHERE financial_goals.user_id != mf.user_id
AND EXISTS (
    SELECT 1 FROM users u 
    WHERE u.user_id = mf.user_id
);

-- Step 4: Verify they now match
SELECT 'VERIFICATION - SHOULD MATCH NOW' as step;
SELECT 
    'Money Flow' as table_name,
    user_id,
    COUNT(*) as records
FROM money_flow 
GROUP BY user_id
UNION ALL
SELECT 
    'Goals' as table_name,
    user_id,
    COUNT(*) as records  
FROM financial_goals
GROUP BY user_id
ORDER BY user_id, table_name;
