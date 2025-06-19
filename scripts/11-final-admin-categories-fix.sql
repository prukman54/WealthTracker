-- Final fix for admin categories access
-- This script ensures admin can properly access and manage categories

-- First, let's completely reset the categories table policies
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view active categories" ON categories;
DROP POLICY IF EXISTS "Admin full access to categories" ON categories;
DROP POLICY IF EXISTS "Service role full access" ON categories;
DROP POLICY IF EXISTS "authenticated_users_read_active" ON categories;
DROP POLICY IF EXISTS "admin_full_access" ON categories;
DROP POLICY IF EXISTS "service_role_bypass" ON categories;

-- Re-enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create a simple, working policy for regular users (read active categories only)
CREATE POLICY "authenticated_users_read_active" ON categories
    FOR SELECT 
    TO authenticated 
    USING (is_active = true);

-- Create a comprehensive admin policy that definitely works
CREATE POLICY "admin_full_access" ON categories
    FOR ALL 
    TO authenticated
    USING (
        -- Multiple ways to check if user is admin
        auth.email() = 'prukman54@gmail.com' OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'prukman54@gmail.com'
        )
    )
    WITH CHECK (
        -- Same check for INSERT/UPDATE operations
        auth.email() = 'prukman54@gmail.com' OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'prukman54@gmail.com'
        )
    );

-- Create a bypass policy for service role
CREATE POLICY "service_role_bypass" ON categories
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON categories TO authenticated;
GRANT ALL ON categories TO service_role;

-- Ensure the sequence is accessible
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Test the policies and show results
DO $$
DECLARE
    test_result TEXT;
    category_count INTEGER;
BEGIN
    -- Test reading categories
    SELECT COUNT(*) INTO category_count FROM categories;
    RAISE NOTICE 'Total categories found: %', category_count;
    
    -- Test admin access specifically
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND email = 'prukman54@gmail.com'
    ) THEN
        RAISE NOTICE 'Admin user detected - should have full access';
        
        -- Try to insert a test category
        BEGIN
            INSERT INTO categories (name, type, sort_order) 
            VALUES ('TEST_ADMIN_ACCESS', 'income', 999);
            
            -- If successful, delete it
            DELETE FROM categories WHERE name = 'TEST_ADMIN_ACCESS';
            RAISE NOTICE 'Admin write access: SUCCESS';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Admin write access: FAILED - %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Current user is not admin or not authenticated';
    END IF;
    
    RAISE NOTICE 'Categories table policies have been reset and reconfigured for admin access';
END $$;

-- Show current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'categories'
ORDER BY policyname;

-- Show current categories by type
SELECT 
    type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count,
    array_agg(name ORDER BY sort_order, name) as category_names
FROM categories 
GROUP BY type
ORDER BY type;

-- Final comment
-- Categories table policies have been reset and reconfigured for admin access
