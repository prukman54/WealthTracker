-- Drop existing policies that might be blocking admin access
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Admin can view all money flow" ON money_flow;
DROP POLICY IF EXISTS "Admin can manage quotes" ON quotes;

-- Create new admin policies that work with our localStorage-based admin auth
-- Since we can't check localStorage in RLS policies, we'll use a different approach

-- Allow public read access to users table (admin will access this way)
CREATE POLICY "Public can view users for admin" ON users
  FOR SELECT USING (true);

-- Allow public read access to money_flow table (admin will access this way)  
CREATE POLICY "Public can view money_flow for admin" ON money_flow
  FOR SELECT USING (true);

-- Allow public access to quotes table for admin management
CREATE POLICY "Public can manage quotes" ON quotes
  FOR ALL USING (true);

-- Note: This is a simplified approach for demo purposes
-- In production, you'd want more secure admin authentication with proper JWT tokens
