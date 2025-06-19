-- Create categories table for dynamic income/expense categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to prevent duplicate category names per type
CREATE UNIQUE INDEX IF NOT EXISTS categories_name_type_unique 
ON categories (LOWER(name), type);

-- Enable RLS for categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read active categories
CREATE POLICY "Anyone can view active categories" ON categories
  FOR SELECT TO authenticated USING (is_active = true);

-- Admin can manage all categories
CREATE POLICY "Admin can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'prukman54@gmail.com'
    )
  );

-- Seed with existing categories from constants
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

-- Add helpful comment
COMMENT ON TABLE categories IS 'Dynamic categories for income and expense transactions, manageable by admin';
