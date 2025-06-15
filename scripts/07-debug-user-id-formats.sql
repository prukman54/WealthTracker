-- Debug script to check exact user ID formats and find the mismatch

-- 1. Check the exact format of user IDs in the users table
SELECT 
    'USERS TABLE' as table_name,
    id as table_user_id,
    user_id as auth_user_id,
    name,
    email,
    length(user_id::text) as auth_id_length,
    length(id::text) as table_id_length
FROM users
ORDER BY created_at DESC;

-- 2. Check the exact format of user IDs in financial_goals
SELECT 
    'GOALS TABLE' as table_name,
    id as goal_id,
    user_id as goal_user_id,
    name as goal_name,
    length(user_id::text) as goal_user_id_length
FROM financial_goals
ORDER BY created_at DESC;

-- 3. Check if there are any goals that match users by auth.users ID
SELECT 
    'MATCHING CHECK' as check_type,
    u.name as user_name,
    u.email,
    u.user_id as user_auth_id,
    g.user_id as goal_user_id,
    g.name as goal_name,
    CASE 
        WHEN u.user_id::text = g.user_id::text THEN 'MATCH'
        ELSE 'NO MATCH'
    END as match_status
FROM users u
FULL OUTER JOIN financial_goals g ON u.user_id::text = g.user_id::text
ORDER BY u.created_at DESC;

-- 4. Show all goals with their user_id values
SELECT 
    'ALL GOALS' as info,
    g.id,
    g.user_id,
    g.name,
    g.target_amount,
    g.current_amount,
    'Goal exists but may not match any user' as note
FROM financial_goals g
ORDER BY g.created_at DESC;

-- 5. Check if goals are using the wrong ID (table ID instead of auth ID)
SELECT 
    'WRONG ID CHECK' as check_type,
    u.name as user_name,
    u.email,
    u.id as user_table_id,
    g.user_id as goal_user_id,
    g.name as goal_name,
    CASE 
        WHEN u.id::text = g.user_id::text THEN 'GOALS USING TABLE ID (WRONG)'
        ELSE 'NOT USING TABLE ID'
    END as id_usage_status
FROM users u
FULL OUTER JOIN financial_goals g ON u.id::text = g.user_id::text
ORDER BY u.created_at DESC;
