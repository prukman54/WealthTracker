-- Comprehensive fix for financial goals user ID mismatch
-- This will definitely resolve the issue

-- Step 1: Show current state
SELECT 'CURRENT GOALS STATE' as step;
SELECT 
    g.id,
    g.user_id as goal_user_id,
    g.name,
    g.target_amount,
    g.current_amount,
    length(g.user_id::text) as goal_user_id_length
FROM financial_goals g
ORDER BY g.created_at DESC;

-- Step 2: Show current users state  
SELECT 'CURRENT USERS STATE' as step;
SELECT 
    u.id as table_id,
    u.user_id as auth_id, 
    u.name,
    u.email,
    length(u.user_id::text) as auth_id_length,
    length(u.id::text) as table_id_length
FROM users u
ORDER BY u.created_at DESC;

-- Step 3: Check for any existing matches
SELECT 'EXISTING MATCHES CHECK' as step;
SELECT 
    u.name as user_name,
    u.email,
    u.user_id as auth_user_id,
    g.name as goal_name,
    g.target_amount,
    'ALREADY MATCHED' as status
FROM users u
INNER JOIN financial_goals g ON u.user_id::text = g.user_id::text
ORDER BY u.created_at DESC;

-- Step 4: Find goals that need to be fixed (using table ID instead of auth ID)
SELECT 'GOALS NEEDING FIX' as step;
SELECT 
    g.id as goal_id,
    g.user_id as current_wrong_user_id,
    g.name as goal_name,
    u.name as should_belong_to_user,
    u.user_id as correct_auth_user_id,
    'NEEDS UPDATE' as action
FROM financial_goals g
INNER JOIN users u ON g.user_id::text = u.id::text
WHERE g.user_id::text != u.user_id::text;

-- Step 5: Actually fix the goals by updating them to use auth user IDs
UPDATE financial_goals 
SET user_id = users.user_id,
    updated_at = NOW()
FROM users 
WHERE financial_goals.user_id::text = users.id::text
  AND financial_goals.user_id::text != users.user_id::text;

-- Step 6: Verify the fix worked
SELECT 'VERIFICATION AFTER FIX' as step;
SELECT 
    u.name as user_name,
    u.email,
    u.user_id as auth_user_id,
    COUNT(g.id) as goal_count,
    STRING_AGG(g.name, ', ') as goal_names
FROM users u
LEFT JOIN financial_goals g ON u.user_id::text = g.user_id::text
GROUP BY u.id, u.name, u.email, u.user_id
ORDER BY u.created_at DESC;

-- Step 7: Show all goals with their correct user assignments
SELECT 'FINAL GOALS STATE' as step;
SELECT 
    g.id,
    g.user_id,
    g.name as goal_name,
    g.target_amount,
    g.current_amount,
    g.is_achieved,
    u.name as belongs_to_user,
    u.email as user_email
FROM financial_goals g
LEFT JOIN users u ON g.user_id::text = u.user_id::text
ORDER BY g.created_at DESC;
