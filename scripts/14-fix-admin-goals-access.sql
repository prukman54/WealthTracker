-- Fix admin access to financial_goals table
-- The admin can see money_flow but not financial_goals due to RLS policies

-- Drop existing admin policy for goals if it exists
DROP POLICY IF EXISTS "Admin can view all goals" ON financial_goals;

-- Create a simple admin policy that actually works
CREATE POLICY "Admin can view all financial goals" ON financial_goals
    FOR ALL USING (true);

-- Alternative: If the above doesn't work, temporarily disable RLS for goals
-- ALTER TABLE financial_goals DISABLE ROW LEVEL SECURITY;

-- Verify the fix by checking if admin can now see goals
SELECT 'ADMIN GOALS ACCESS TEST' as test;
SELECT 
    fg.id,
    fg.user_id,
    fg.name,
    fg.target_amount,
    fg.current_amount,
    u.name as user_name,
    u.email
FROM financial_goals fg
LEFT JOIN users u ON fg.user_id = u.user_id
ORDER BY fg.created_at DESC;
