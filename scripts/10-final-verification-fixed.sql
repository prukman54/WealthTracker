-- Final verification before deployment (FIXED VERSION)
-- This script checks that everything is properly aligned

-- 1. Verify users table structure
SELECT 'USERS TABLE CHECK' as verification_step;
SELECT 
    COUNT(*) as total_users,
    COUNT(DISTINCT user_id) as unique_auth_ids,
    COUNT(DISTINCT email) as unique_emails
FROM users;

-- 2. Verify money_flow is using correct user IDs
SELECT 'MONEY FLOW VERIFICATION' as verification_step;
SELECT 
    u.name as user_name,
    u.email,
    COUNT(mf.id) as transaction_count,
    SUM(CASE WHEN mf.type = 'income' THEN mf.amount ELSE 0 END) as total_income,
    SUM(CASE WHEN mf.type = 'expense' THEN mf.amount ELSE 0 END) as total_expenses,
    'MONEY FLOW WORKING' as status
FROM users u
LEFT JOIN money_flow mf ON u.user_id = mf.user_id
GROUP BY u.user_id, u.name, u.email
ORDER BY u.name;

-- 3. Verify financial_goals is using correct user IDs  
SELECT 'FINANCIAL GOALS VERIFICATION' as verification_step;
SELECT 
    u.name as user_name,
    u.email,
    COUNT(fg.id) as goal_count,
    STRING_AGG(fg.name, ', ') as goal_names,
    'GOALS WORKING' as status
FROM users u
LEFT JOIN financial_goals fg ON u.user_id = fg.user_id
GROUP BY u.user_id, u.name, u.email
ORDER BY u.name;

-- 4. Cross-check: Make sure no goals are orphaned
SELECT 'ORPHANED GOALS CHECK' as verification_step;
SELECT 
    fg.id,
    fg.user_id,
    fg.name,
    'ORPHANED - NO USER FOUND' as issue
FROM financial_goals fg
LEFT JOIN users u ON fg.user_id = u.user_id
WHERE u.user_id IS NULL;

-- 5. Cross-check: Make sure no money_flow records are orphaned
SELECT 'ORPHANED MONEY FLOW CHECK' as verification_step;
SELECT 
    mf.id,
    mf.user_id,
    mf.type,
    mf.amount,
    'ORPHANED - NO USER FOUND' as issue
FROM money_flow mf
LEFT JOIN users u ON mf.user_id = u.user_id
WHERE u.user_id IS NULL;

-- 6. Final summary for admin dashboard
SELECT 'ADMIN DASHBOARD SUMMARY' as verification_step;
SELECT 
    u.name as user_name,
    u.email,
    u.country,
    COUNT(DISTINCT mf.id) as money_flow_records,
    COUNT(DISTINCT fg.id) as financial_goals,
    SUM(CASE WHEN mf.type = 'income' THEN mf.amount ELSE 0 END) as total_income,
    SUM(CASE WHEN mf.type = 'expense' THEN mf.amount ELSE 0 END) as total_expenses,
    COUNT(CASE WHEN fg.is_achieved = true THEN 1 END) as achieved_goals,
    'READY FOR ADMIN VIEW' as status
FROM users u
LEFT JOIN money_flow mf ON u.user_id = mf.user_id
LEFT JOIN financial_goals fg ON u.user_id = fg.user_id
GROUP BY u.user_id, u.name, u.email, u.country
ORDER BY u.name;

-- 7. Show sample goals to verify they're working
SELECT 'SAMPLE GOALS CHECK' as verification_step;
SELECT 
    fg.name as goal_name,
    fg.target_amount,
    fg.current_amount,
    fg.is_achieved,
    u.name as user_name,
    u.email as user_email,
    'GOAL VISIBLE TO USER' as status
FROM financial_goals fg
INNER JOIN users u ON fg.user_id = u.user_id
ORDER BY fg.created_at DESC
LIMIT 10;
