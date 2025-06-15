-- Drop existing table if it exists with wrong name
DROP TABLE IF EXISTS financial_goals CASCADE;

-- Create financial_goals table with correct structure
CREATE TABLE IF NOT EXISTS financial_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_name TEXT NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    is_achieved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own goals" ON financial_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON financial_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON financial_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON financial_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Admin policy to view all goals
CREATE POLICY "Admin can view all goals" ON financial_goals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = auth.uid() 
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

-- Insert some test data to verify it works
-- (This will be inserted with a dummy user_id, replace with actual user_id)
-- INSERT INTO financial_goals (user_id, goal_name, target_amount, current_amount) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Emergency Fund', 50000, 15000);
