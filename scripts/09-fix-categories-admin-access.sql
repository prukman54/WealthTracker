-- Fix admin access to categories table
-- This script ensures the admin can properly manage categories

-- First, let's check if the categories table exists and fix any issues
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
    DROP POLICY IF EXISTS "Admin can manage categories" ON categories;
    DROP POLICY IF EXISTS "Users can view active categories" ON categories;
    DROP POLICY IF EXISTS "Admin full access to categories" ON categories;
    DROP POLICY IF EXISTS "Service role full access" ON categories;
    
    -- Recreate policies with proper admin access
    
    -- Policy 1: Allow all authenticated users to read active categories
    CREATE POLICY "Users can view active categories" ON categories
        FOR SELECT 
        TO authenticated 
        USING (is_active = true);
    
    -- Policy 2: Allow admin full access to all categories
    CREATE POLICY "Admin full access to categories" ON categories
        FOR ALL 
        TO authenticated
        USING (
            -- Check if current user is admin by email
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE auth.users.id = auth.uid() 
                AND auth.users.email = 'prukman54@gmail.com'
            )
        )
        WITH CHECK (
            -- Same check for INSERT/UPDATE operations
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE auth.users.id = auth.uid() 
                AND auth.users.email = 'prukman54@gmail.com'
            )
        );

    -- Policy 3: Allow service role full access (for admin operations)
    CREATE POLICY "Service role full access" ON categories
        FOR ALL 
        TO service_role
        USING (true)
        WITH CHECK (true);

    RAISE NOTICE 'Categories table policies updated successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating policies: %', SQLERRM;
END $$;

-- Verify the policies are working by checking current user permissions
DO $$
DECLARE
    current_user_email TEXT;
    is_admin BOOLEAN := false;
BEGIN
    -- Get current user email if authenticated
    SELECT email INTO current_user_email 
    FROM auth.users 
    WHERE id = auth.uid();
    
    -- Check if current user is admin
    IF current_user_email = 'prukman54@gmail.com' THEN
        is_admin := true;
    END IF;
    
    RAISE NOTICE 'Current user: %, Is Admin: %', COALESCE(current_user_email, 'Not authenticated'), is_admin;
    
    -- Test category access
    PERFORM * FROM categories LIMIT 1;
    RAISE NOTICE 'Categories table access: SUCCESS';
    
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'Categories table access: FAILED - Insufficient privileges';
    WHEN OTHERS THEN
        RAISE NOTICE 'Categories table access: FAILED - %', SQLERRM;
END $$;

-- Ensure categories are properly seeded
INSERT INTO categories (name, type, sort_order) VALUES
-- Income categories
('Salary', 'income', 1),
('Commission', 'income', 2),
('Work', 'income', 3),
('Investment', 'income', 4),
('Dividend', 'income', 5),
('Royalty', 'income', 6),
('Interest', 'income', 7),

-- Expense categories  
('Food', 'expense', 1),
('Travel', 'expense', 2),
('Transportation', 'expense', 3),
('Rent', 'expense', 4),
('Utilities', 'expense', 5),
('Entertainment', 'expense', 6),
('Healthcare', 'expense', 7),
('Misc', 'expense', 8)

ON CONFLICT (LOWER(name), type) DO NOTHING;

-- Final verification
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'categories'
ORDER BY policyname;

-- Show category counts
SELECT 
    type,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM categories 
GROUP BY type
ORDER BY type;

-- Script description: Fix admin access to categories table - resolves RLS permission issues
