-- Debug script to check user IDs and goals mapping
-- Run this to see the user ID mappings

-- Check all users and their IDs
SELECT 
    id as table_user_id,
    user_id as auth_user_id,
    name,
    email
FROM users
ORDER BY created_at DESC;

-- Check all goals and their user IDs
SELECT 
    id as goal_id,
    user_id as goal_user_id,
    name as goal_name,
    target_amount,
    current_amount,
    is_achieved
FROM financial_goals
ORDER BY created_at DESC;

-- Check if there are any goals that match users
SELECT 
    u.name as user_name,
    u.email,
    u.user_id as auth_user_id,
    g.name as goal_name,
    g.target_amount,
    g.current_amount
FROM users u
LEFT JOIN financial_goals g ON u.user_id = g.user_id
ORDER BY u.created_at DESC;

-- Show goals that don't match any user (orphaned goals)
SELECT 
    g.id,
    g.user_id,
    g.name,
    'ORPHANED - No matching user found' as status
FROM financial_goals g
LEFT JOIN users u ON g.user_id = u.user_id
WHERE u.user_id IS NULL;
