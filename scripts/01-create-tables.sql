-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  country TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create money_flow table
CREATE TABLE IF NOT EXISTS money_flow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12,2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  quote TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE money_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for money_flow table
CREATE POLICY "Users can view own money flow" ON money_flow
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own money flow" ON money_flow
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own money flow" ON money_flow
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own money flow" ON money_flow
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for quotes table (read-only for all authenticated users)
CREATE POLICY "Anyone can view quotes" ON quotes
  FOR SELECT TO authenticated USING (true);

-- Admin policies (for prukman54@gmail.com)
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'prukman54@gmail.com'
    )
  );

CREATE POLICY "Admin can view all money flow" ON money_flow
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'prukman54@gmail.com'
    )
  );

CREATE POLICY "Admin can manage quotes" ON quotes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'prukman54@gmail.com'
    )
  );
