-- Drop existing table if it exists to start fresh
DROP TABLE IF EXISTS financial_goals CASCADE;

-- Create financial_goals table with correct structure
CREATE TABLE financial_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    is_achieved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can view their own goals" ON financial_goals
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert their own goals" ON financial_goals
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own goals" ON financial_goals
    FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete their own goals" ON financial_goals
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- Admin policy to view all goals
CREATE POLICY "Admin can view all goals" ON financial_goals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id::text = auth.uid()::text 
            AND users.email = 'prukman54@gmail.com'
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_financial_goals_updated_at 
    BEFORE UPDATE ON financial_goals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
