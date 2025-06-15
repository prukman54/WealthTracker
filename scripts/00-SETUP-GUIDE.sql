-- ============================================================================
-- WEALTHTRACKER DATABASE SETUP GUIDE
-- ============================================================================
-- 
-- This file explains the complete database setup process for WealthTracker.
-- Follow these steps in order for a successful deployment.
--
-- IMPORTANT: Run these scripts in your Supabase SQL Editor
-- ============================================================================

-- STEP 1: UNDERSTANDING THE ARCHITECTURE
-- ======================================
-- 
-- WealthTracker uses a 3-table design with Row Level Security (RLS):
--
-- 1. auth.users (Supabase managed) - Authentication records
--    └── Contains: id, email, password_hash, email_confirmed_at
--
-- 2. public.users - User profile data
--    └── Links to auth.users via user_id field
--    └── Contains: name, phone, country, profile info
--
-- 3. public.money_flow - Financial transactions
--    └── Links to auth.users via user_id field  
--    └── Contains: income/expense records
--
-- 4. public.financial_goals - User financial goals
--    └── Links to auth.users via user_id field
--    └── Contains: goal tracking data
--
-- 5. public.quotes - Inspirational quotes (global)
--    └── No user linking - shared content
--
-- KEY PRINCIPLE: All user data uses auth.users.id as the foreign key
-- This ensures RLS policies work correctly for data isolation

-- STEP 2: REQUIRED SCRIPTS (Run in this order)
-- =============================================

-- Script 1: Create all tables and basic RLS policies
-- File: scripts/01-create-tables.sql
-- Purpose: Sets up the core database structure

-- Script 2: Add sample quotes for users
-- File: scripts/02-seed-data.sql  
-- Purpose: Populates the quotes table with inspirational content

-- Script 3: Fix RLS policies for production use
-- File: scripts/03-reset-and-fix-policies.sql
-- Purpose: Ensures proper data isolation and security

-- Script 4: Add financial goals functionality
-- File: scripts/04-add-financial-goals.sql
-- Purpose: Creates the goals tracking system

-- Script 5: Fix user ID relationships
-- File: scripts/05-fix-user-id-relationships.sql
-- Purpose: Ensures proper data linking between tables

-- Script 6: Verify complete setup
-- File: scripts/06-verify-setup.sql
-- Purpose: Validates that everything is working correctly

-- Script 7: Enable admin access to goals
-- File: scripts/07-enable-admin-access.sql
-- Purpose: Allows admin dashboard to view all user goals

-- STEP 3: VERIFICATION QUERIES
-- =============================

-- After running all scripts, verify the setup:

-- Check table structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'money_flow', 'financial_goals', 'quotes')
ORDER BY table_name, ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('users', 'money_flow', 'financial_goals', 'quotes');

-- Verify quotes were added
SELECT COUNT(*) as quote_count FROM quotes;

-- STEP 4: UNDERSTANDING RLS POLICIES
-- ===================================

-- User Isolation Policies:
-- These ensure users only see their own data

-- Example: Users table policy
-- CREATE POLICY "Users can view own profile" ON users
--   FOR SELECT USING (auth.uid() = user_id);

-- How it works:
-- 1. auth.uid() returns the current authenticated user's ID
-- 2. Policy compares this to the user_id column in each row
-- 3. Only matching rows are returned to the user
-- 4. This happens automatically on every query

-- Admin Policies:
-- These allow admin users to see all data for management

-- Example: Admin goals policy  
-- CREATE POLICY "Admin can view all financial goals" ON financial_goals
--   FOR ALL USING (true);

-- How it works:
-- 1. USING (true) means no restrictions
-- 2. Admin can see all rows regardless of user_id
-- 3. Admin authentication is handled in the application layer

-- STEP 5: TROUBLESHOOTING COMMON ISSUES
-- ======================================

-- Issue: Goals not showing for users
-- Cause: User ID mismatch between tables
-- Solution: Run this query to check consistency

SELECT 
    'money_flow' as table_name, 
    user_id, 
    COUNT(*) as records
FROM money_flow 
GROUP BY user_id
UNION ALL
SELECT 
    'financial_goals' as table_name, 
    user_id, 
    COUNT(*) as records
FROM financial_goals 
GROUP BY user_id
ORDER BY user_id;

-- Issue: Admin can't see user data
-- Cause: Missing admin RLS policies
-- Solution: Check if admin policies exist

SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'financial_goals' 
AND policyname LIKE '%admin%';

-- Issue: Users can see other users' data
-- Cause: Incorrect RLS policies
-- Solution: Verify user isolation policies

SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'money_flow' 
AND cmd = 'SELECT';

-- STEP 6: PRODUCTION CONSIDERATIONS
-- ==================================

-- 1. Backup Strategy
--    - Enable Point-in-Time Recovery in Supabase
--    - Regular database backups
--    - Test restore procedures

-- 2. Performance Optimization
--    - Add indexes for common queries:
CREATE INDEX IF NOT EXISTS idx_money_flow_user_date ON money_flow(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user ON financial_goals(user_id);

-- 3. Security Hardening
--    - Regularly audit RLS policies
--    - Monitor for policy bypass attempts
--    - Use service role key only for admin operations

-- 4. Monitoring
--    - Set up alerts for failed authentication attempts
--    - Monitor database performance metrics
--    - Track user activity patterns

-- STEP 7: MAINTENANCE PROCEDURES
-- ===============================

-- Monthly: Check for orphaned records
SELECT 'Orphaned money_flow records' as issue, COUNT(*) as count
FROM money_flow mf
LEFT JOIN auth.users au ON mf.user_id = au.id
WHERE au.id IS NULL

UNION ALL

SELECT 'Orphaned financial_goals records' as issue, COUNT(*) as count  
FROM financial_goals fg
LEFT JOIN auth.users au ON fg.user_id = au.id
WHERE au.id IS NULL;

-- Quarterly: Analyze user engagement
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(*) as total_transactions
FROM money_flow 
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;

-- ============================================================================
-- END OF SETUP GUIDE
-- ============================================================================
--
-- After completing this setup:
-- 1. Your database will be fully configured
-- 2. RLS policies will protect user data
-- 3. Admin access will work correctly
-- 4. The application will function as designed
--
-- For support, check the troubleshooting section or review the application
-- logs for specific error messages.
-- ============================================================================
