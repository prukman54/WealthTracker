-- Create RPC function for admin to access categories
-- This bypasses RLS issues by using SECURITY DEFINER

CREATE OR REPLACE FUNCTION get_all_categories_admin()
RETURNS TABLE (
    id UUID,
    name TEXT,
    type TEXT,
    is_active BOOLEAN,
    sort_order INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with the privileges of the function owner
SET search_path = public
AS $$
BEGIN
    -- Verify the caller is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.email = 'prukman54@gmail.com'
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    -- Return all categories for admin
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.type,
        c.is_active,
        c.sort_order,
        c.created_at,
        c.updated_at
    FROM categories c
    ORDER BY c.type ASC, c.sort_order ASC, c.name ASC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_categories_admin() TO authenticated;

-- Create RPC function for admin to manage categories
CREATE OR REPLACE FUNCTION admin_manage_category(
    action TEXT,
    category_id UUID DEFAULT NULL,
    category_name TEXT DEFAULT NULL,
    category_type TEXT DEFAULT NULL,
    is_active_flag BOOLEAN DEFAULT true
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    -- Verify the caller is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.email = 'prukman54@gmail.com'
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    -- Handle different actions
    CASE action
        WHEN 'create' THEN
            INSERT INTO categories (name, type, sort_order)
            VALUES (
                category_name, 
                category_type, 
                (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM categories WHERE type = category_type)
            )
            RETURNING json_build_object('id', id, 'name', name, 'type', type) INTO result;
            
        WHEN 'update' THEN
            UPDATE categories 
            SET is_active = is_active_flag, updated_at = NOW()
            WHERE id = category_id
            RETURNING json_build_object('id', id, 'name', name, 'is_active', is_active) INTO result;
            
        WHEN 'delete' THEN
            DELETE FROM categories WHERE id = category_id
            RETURNING json_build_object('deleted_id', id) INTO result;
            
        ELSE
            RAISE EXCEPTION 'Invalid action: %', action;
    END CASE;
    
    RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION admin_manage_category(TEXT, UUID, TEXT, TEXT, BOOLEAN) TO authenticated;

COMMENT ON FUNCTION get_all_categories_admin() IS 'Admin function to retrieve all categories bypassing RLS';
COMMENT ON FUNCTION admin_manage_category(TEXT, UUID, TEXT, TEXT, BOOLEAN) IS 'Admin function to manage categories bypassing RLS';
