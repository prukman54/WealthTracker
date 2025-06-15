-- Fix the user_id mismatch in financial_goals table
-- This script will update goals to use the correct auth user IDs

-- First, let's see what we're working with
SELECT 
    'BEFORE FIX' as status,
    g.id as goal_id,
    g.user_id as current_goal_user_id,
    g.name as goal_name,
    u.name as user_name,
    u.user_id as correct_auth_user_id
FROM financial_goals g
LEFT JOIN users u ON u.user_id::text = g.user_id::text
ORDER BY g.created_at DESC;

-- Now let's try to match goals to users by looking for any possible connection
-- Check if goals might be using the table ID instead of auth ID
SELECT 
    'POTENTIAL MATCHES' as status,
    g.id as goal_id,
    g.user_id as goal_user_id,
    g.name as goal_name,
    u.name as user_name,
    u.user_id as auth_user_id,
    u.id as table_user_id,
    CASE 
        WHEN g.user_id::text = u.id::text THEN 'MATCH BY TABLE ID'
        WHEN g.user_id::text = u.user_id::text THEN 'MATCH BY AUTH ID'
        ELSE 'NO MATCH'
    END as match_type
FROM financial_goals g
CROSS JOIN users u
WHERE g.user_id::text = u.id::text OR g.user_id::text = u.user_id::text
ORDER BY g.created_at DESC;

-- If goals are using table IDs, let's fix them
-- Update goals to use the correct auth user IDs
UPDATE financial_goals 
SET user_id = users.user_id
FROM users 
WHERE financial_goals.user_id::text = users.id::text;

-- Verify the fix
SELECT 
    'AFTER FIX' as status,
    g.id as goal_id,
    g.user_id as updated_goal_user_id,
    g.name as goal_name,
    u.name as user_name,
    u.user_id as auth_user_id,
    'SHOULD MATCH NOW' as note
FROM financial_goals g
LEFT JOIN users u ON u.user_id::text = g.user_id::text
ORDER BY g.created_at DESC;

-- Final verification - count goals per user
SELECT 
    'FINAL COUNT' as status,
    u.name as user_name,
    u.email,
    u.user_id as auth_user_id,
    COUNT(g.id) as goal_count
FROM users u
LEFT JOIN financial_goals g ON u.user_id::text = g.user_id::text
GROUP BY u.id, u.name, u.email, u.user_id
ORDER BY u.created_at DESC;
