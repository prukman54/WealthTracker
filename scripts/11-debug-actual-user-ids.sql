-- Let's see the EXACT user IDs being used in both tables
SELECT 'MONEY FLOW USER IDS' as table_name;
SELECT DISTINCT 
    user_id,
    length(user_id::text) as id_length,
    COUNT(*) as record_count
FROM money_flow 
GROUP BY user_id
ORDER BY record_count DESC;

SELECT 'FINANCIAL GOALS USER IDS' as table_name;
SELECT DISTINCT 
    user_id,
    length(user_id::text) as id_length,
    COUNT(*) as record_count
FROM financial_goals 
GROUP BY user_id
ORDER BY record_count DESC;

SELECT 'USERS TABLE AUTH IDS' as table_name;
SELECT 
    user_id as auth_user_id,
    length(user_id::text) as id_length,
    name,
    email
FROM users
ORDER BY created_at DESC;

-- Check if money_flow and goals are using the same user_id format
SELECT 'CROSS CHECK' as check_type;
SELECT 
    mf.user_id as money_flow_user_id,
    fg.user_id as goals_user_id,
    u.user_id as auth_user_id,
    u.name,
    CASE 
        WHEN mf.user_id = fg.user_id THEN 'SAME ID FORMAT'
        ELSE 'DIFFERENT ID FORMAT'
    END as id_comparison
FROM money_flow mf
FULL OUTER JOIN financial_goals fg ON mf.user_id = fg.user_id
FULL OUTER JOIN users u ON u.user_id = mf.user_id OR u.user_id = fg.user_id
WHERE u.name IS NOT NULL
GROUP BY mf.user_id, fg.user_id, u.user_id, u.name;
