# WEALTH TRACKER - Complete Project Documentation

## PROJECT OVERVIEW
WealthTracker is a comprehensive personal finance management application built with Next.js, Supabase, and TypeScript. It allows users to track income/expenses, use investment calculators, and manage their financial data with a beautiful dark/light theme interface.

## ADMIN CREDENTIALS
Admin Email: prukman54@gmail.com
Admin Password: $$1M_BTC$$
Admin Access URL: /admin
Admin Dashboard URL: /admin/dashboard

Note: Admin authentication uses localStorage-based session management for demo purposes.

## SUPABASE CREDENTIALS
Supabase URL: https://ejikvbkjbmmtzuotsxgd.supabase.co
Supabase Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqaWt2YmtqYm1tdHp1b3RzeGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NjEwMDksImV4cCI6MjA2NTUzNzAwOX0.V9gAyLpfFc20a6v5cWzLJ-sWrp1FAi9nPgYYGrCoNtU

## DATABASE SETUP (For New Deployments)
Run these scripts in order in your Supabase SQL Editor:

1. scripts/01-create-tables.sql - Creates users, money_flow, and quotes tables with RLS policies
2. scripts/02-seed-data.sql - Adds sample inspirational quotes
3. scripts/03-reset-and-fix-policies.sql - Configures security policies
4. scripts/04-add-financial-goals.sql - Adds financial goals functionality
5. scripts/05-fix-user-id-relationships.sql - Fixes user ID relationships
6. scripts/06-verify-setup.sql - Validates the complete setup
7. scripts/07-enable-admin-access.sql - Enables admin access to goals

For detailed setup instructions, see scripts/00-SETUP-GUIDE.sql

## PROJECT STRUCTURE

### CORE FILES
- app/layout.tsx - Root layout with theme provider and favicon
- app/page.tsx - Landing page with hero section and features
- app/globals.css - Global styles with CSS variables for theming
- tailwind.config.ts - Tailwind configuration with custom colors
- next.config.mjs - Next.js configuration

### AUTHENTICATION PAGES
- app/auth/login/page.tsx - User login page
- app/auth/signup/page.tsx - User registration page
- app/admin/page.tsx - Admin login page (hardcoded credentials)

### USER DASHBOARD
- app/dashboard/page.tsx - Main user dashboard with profile summary
- app/dashboard/profile/page.tsx - User profile management
- app/dashboard/money-flow/page.tsx - Income/expense tracking
- app/dashboard/investing-tools/page.tsx - Financial calculators

### ADMIN DASHBOARD
- app/admin/dashboard/page.tsx - Admin panel for user management and quotes

### COMPONENTS
- components/auth-guard.tsx - Authentication wrapper component
- components/theme-provider.tsx - Dark/light theme context provider
- components/theme-toggle.tsx - Theme toggle button component

### LIBRARY FILES
- lib/supabase.ts - Supabase client configuration with detailed documentation
- lib/auth.ts - Authentication functions with comprehensive comments
- lib/constants.ts - Countries, currencies, and categories data with usage examples

### ASSETS
- public/image/lo.webp - Custom logo/favicon (golden crown with "R")

## COLOR THEME
Light Mode:
- Primary: #013220 (Dark Emerald Green)
- Accent: #cdaf7d (Classic Gold)
- Background: #f4f4f4 (Soft White)
- Surface: #ffffff (White)

Dark Mode:
- Primary: #cdaf7d (Classic Gold)
- Accent: #013220 (Dark Emerald Green)
- Background: #121212 (Luxury Black)
- Surface: #1e1e1e (Dark Surface)

## KEY FEATURES
1. User Authentication (Email/Password with verification)
2. Money Flow Tracking (Income/Expenses with categories)
3. Financial Goals (Set, track, and achieve milestones)
4. Investment Calculators (Compound Interest, Rule of 72, DCF, P/E Ratio, etc.)
5. Admin Panel (User Management, Quote Management)
6. Dark/Light Theme Toggle
7. Multi-currency Support (10 countries)
8. Responsive Design
9. Real-time Database Updates
10. Row Level Security (RLS) for data protection

## DATABASE SCHEMA

### users table
- id: UUID (Primary Key)
- user_id: UUID (References auth.users) - CRITICAL for RLS policies
- name: TEXT
- email: TEXT (Unique)
- phone: TEXT
- country: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### money_flow table
- id: UUID (Primary Key)
- user_id: UUID (References auth.users) - CRITICAL for RLS policies
- type: TEXT ('income' or 'expense')
- amount: DECIMAL(12,2)
- category: TEXT
- date: DATE
- description: TEXT
- created_at: TIMESTAMP

### financial_goals table
- id: UUID (Primary Key)
- user_id: UUID (References auth.users) - CRITICAL for RLS policies
- name: TEXT
- target_amount: DECIMAL(15,2)
- current_amount: DECIMAL(15,2)
- is_achieved: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### quotes table
- id: SERIAL (Primary Key)
- quote: TEXT
- created_at: TIMESTAMP

## ENVIRONMENT VARIABLES
Create .env.local file with:
NEXT_PUBLIC_SUPABASE_URL=https://ejikvbkjbmmtzuotsxgd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqaWt2YmtqYm1tdHp1b3RzeGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NjEwMDksImV4cCI6MjA2NTUzNzAwOX0.V9gAyLpfFc20a6v5cWzLJ-sWrp1FAi9nPgYYGrCoNtU

## INSTALLATION & SETUP
1. Clone/download the project
2. Run: npm install
3. Create .env.local with Supabase credentials
4. Set up Supabase database using provided SQL scripts
5. Run: npm run dev
6. Access at http://localhost:3000

## USER FLOW
1. Landing page (/) - Marketing page with features
2. Sign up (/auth/signup) - User registration
3. Login (/auth/login) - User authentication
4. Dashboard (/dashboard) - Main user interface
5. Profile (/dashboard/profile) - User settings
6. Money Flow (/dashboard/money-flow) - Financial tracking
7. Investing Tools (/dashboard/investing-tools) - Calculators

## ADMIN FLOW
1. Admin login (/admin) - Admin authentication
2. Admin dashboard (/admin/dashboard) - User & quote management

## SUPPORTED COUNTRIES & CURRENCIES
- USA (USD, $)
- Japan (JPY, ¥)
- China (CNY, ¥)
- India (INR, ₹)
- Nepal (NPR, Rs)
- Canada (CAD, C$)
- Australia (AUD, A$)
- New Zealand (NZD, NZ$)
- UAE (AED, د.إ)
- Russia (RUB, ₽)

## INCOME CATEGORIES
Salary, Commission, Work, Investment, Dividend, Royalty, Interest

## EXPENSE CATEGORIES
Food, Travel, Transportation, Rent, Utilities, Entertainment, Healthcare, Misc

## SECURITY FEATURES
- Row Level Security (RLS) on all tables
- User data isolation (users can only see their own data)
- Admin-only access to user management
- Secure authentication with Supabase Auth
- HTTPS enforcement in production
- Email verification required for login

## ARCHITECTURE HIGHLIGHTS

### Authentication Flow
1. User signs up → Supabase Auth creates auth.users record
2. App creates users table record linked to auth.users.id
3. All user data uses auth.users.id as foreign key
4. RLS policies ensure users only see their own data
5. Admin has special policies to view all data

### Data Relationships
- All user tables reference auth.users(id) via user_id field
- This ensures RLS policies work correctly
- Admin access bypasses RLS for management functions
- Quotes table is global (no user association)

## CUSTOMIZATION GUIDE

### Adding New Countries:
Edit lib/constants.ts - Add to COUNTRIES array with code, name, currency, symbol

### Adding New Categories:
Edit lib/constants.ts - Add to INCOME_CATEGORIES or EXPENSE_CATEGORIES arrays

### Changing Colors:
Edit app/globals.css - Modify CSS variables in :root and .dark selectors
Edit tailwind.config.ts - Update color definitions

### Adding New Calculators:
Edit app/dashboard/investing-tools/page.tsx - Add new TabsContent with calculator logic

### Modifying Admin Credentials:
Edit app/admin/page.tsx - Change ADMIN_EMAIL and ADMIN_PASSWORD constants

### Database Schema Changes:
Create new SQL migration files in scripts/ folder
Update TypeScript interfaces in relevant files

## TROUBLESHOOTING

### Database Connection Issues:
- Check Supabase credentials in .env.local
- Verify RLS policies are properly set
- Check browser console for detailed error messages

### Authentication Problems:
- Ensure email verification is completed
- Check Supabase Auth settings
- Verify user exists in both auth.users and public.users tables

### Goals Not Showing:
- Check user_id consistency between tables
- Verify RLS policies allow access
- Run verification scripts to debug

### Admin Access Issues:
- Use exact credentials: prukman54@gmail.com / $$1M_BTC$$
- Clear localStorage if session is corrupted
- Check browser console for JavaScript errors

## DEPLOYMENT NOTES
- Set environment variables in production
- Configure Supabase for production domain
- Update CORS settings in Supabase
- Set up proper SSL certificates
- Configure database backups
- Test all functionality after deployment

## PERFORMANCE OPTIMIZATIONS
- Database indexes on common queries
- Efficient RLS policies
- Optimized component rendering
- Lazy loading where appropriate
- Compressed assets

## FUTURE ENHANCEMENTS
- Google OAuth integration
- Data export (CSV/PDF)
- Email notifications
- Mobile app version
- Advanced financial charts
- Investment portfolio tracking
- Budget planning tools
- Financial goal setting improvements

## SUPPORT
For technical issues or customizations, refer to:
- Next.js documentation: https://nextjs.org/docs
- Supabase documentation: https://supabase.com/docs
- Tailwind CSS documentation: https://tailwindcss.com/docs

## VERSION HISTORY
v1.0 - Initial release with core features
v1.1 - Added dark/light theme toggle
v1.2 - Updated color scheme to emerald green and gold
v1.3 - Added custom logo and favicon
v1.4 - Added financial goals functionality
v1.5 - Improved admin dashboard and RLS policies
v1.6 - Code cleanup and documentation improvements
