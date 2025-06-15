-- First, let's completely reset the policies and make sure everything works
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own money flow" ON money_flow;
DROP POLICY IF EXISTS "Users can insert own money flow" ON money_flow;
DROP POLICY IF EXISTS "Users can update own money flow" ON money_flow;
DROP POLICY IF EXISTS "Users can delete own money flow" ON money_flow;
DROP POLICY IF EXISTS "Anyone can view quotes" ON quotes;
DROP POLICY IF EXISTS "Public can view users for admin" ON users;
DROP POLICY IF EXISTS "Public can view money_flow for admin" ON money_flow;
DROP POLICY IF EXISTS "Public can manage quotes" ON quotes;

-- Temporarily disable RLS to test
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE money_flow DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE money_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Create simple policies that allow all operations for now
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on money_flow" ON money_flow FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on quotes" ON quotes FOR ALL USING (true) WITH CHECK (true);

-- Make sure quotes table has some data
INSERT INTO quotes (quote) VALUES 
('The stock market is filled with individuals who know the price of everything, but the value of nothing. - Philip Fisher'),
('An investment in knowledge pays the best interest. - Benjamin Franklin'),
('Risk comes from not knowing what you''re doing. - Warren Buffett'),
('The time to buy is when there''s blood in the streets. - Baron Rothschild'),
('Compound interest is the eighth wonder of the world. - Albert Einstein')
ON CONFLICT DO NOTHING;
