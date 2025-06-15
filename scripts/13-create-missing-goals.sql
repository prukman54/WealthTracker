-- Create test goals for users who have money_flow but no goals
-- This will make the admin panel show goals for all active users

-- First, let's see who needs goals
SELECT 'USERS NEEDING GOALS' as step;
SELECT 
    u.name,
    u.email,
    u.user_id,
    COUNT(mf.id) as money_flow_records,
    COUNT(fg.id) as existing_goals,
    CASE 
        WHEN COUNT(fg.id) = 0 THEN 'NEEDS GOALS'
        ELSE 'HAS GOALS'
    END as status
FROM users u
LEFT JOIN money_flow mf ON u.user_id = mf.user_id
LEFT JOIN financial_goals fg ON u.user_id = fg.user_id
GROUP BY u.user_id, u.name, u.email
HAVING COUNT(mf.id) > 0;

-- Create sample goals for users who have money_flow but no goals
INSERT INTO financial_goals (user_id, name, target_amount, current_amount, is_achieved)
SELECT 
    u.user_id,
    'Emergency Fund',
    50000.00,
    CASE 
        WHEN u.name = 'Siru Sapkota' THEN 15000.00
        WHEN u.name = 'Amrit' THEN 8000.00
        WHEN u.name = 'Fony' THEN 12000.00
        ELSE 5000.00
    END,
    false
FROM users u
LEFT JOIN financial_goals fg ON u.user_id = fg.user_id
WHERE fg.id IS NULL  -- Only for users with no goals
AND EXISTS (SELECT 1 FROM money_flow mf WHERE mf.user_id = u.user_id); -- But who have money flow

-- Add a second goal for variety
INSERT INTO financial_goals (user_id, name, target_amount, current_amount, is_achieved)
SELECT 
    u.user_id,
    CASE 
        WHEN u.name = 'Siru Sapkota' THEN 'New Car Fund'
        WHEN u.name = 'Amrit' THEN 'Vacation Fund'
        WHEN u.name = 'Fony' THEN 'Investment Goal'
        ELSE 'Savings Goal'
    END,
    CASE 
        WHEN u.name = 'Siru Sapkota' THEN 200000.00
        WHEN u.name = 'Amrit' THEN 75000.00
        WHEN u.name = 'Fony' THEN 100000.00
        ELSE 25000.00
    END,
    CASE 
        WHEN u.name = 'Siru Sapkota' THEN 45000.00
        WHEN u.name = 'Amrit' THEN 15000.00
        WHEN u.name = 'Fony' THEN 25000.00
        ELSE 5000.00
    END,
    false
FROM users u
LEFT JOIN financial_goals fg ON u.user_id = fg.user_id
WHERE fg.id IS NULL  -- Only for users with no goals
AND EXISTS (SELECT 1 FROM money_flow mf WHERE mf.user_id = u.user_id); -- But who have money flow

-- Verify the results
SELECT 'FINAL VERIFICATION' as step;
SELECT 
    u.name,
    u.email,
    COUNT(mf.id) as money_flow_records,
    COUNT(fg.id) as goals_count,
    STRING_AGG(fg.name, ', ') as goal_names
FROM users u
LEFT JOIN money_flow mf ON u.user_id = mf.user_id
LEFT JOIN financial_goals fg ON u.user_id = fg.user_id
GROUP BY u.user_id, u.name, u.email
ORDER BY u.name;
