# 🏦 WealthTracker - Complete Personal Finance Management System

A comprehensive personal finance management application built with **Next.js 15**, **Supabase**, and **TypeScript**. Features include income/expense tracking, financial goal management, investment calculators, and a complete admin dashboard.

## 🌟 Key Features

### 👤 **User Features**
- **Authentication**: Email/password signup and login with email verification
- **Money Flow Tracking**: Track income and expenses with detailed categorization
- **Financial Goals**: Set, track, and achieve financial milestones
- **Investment Calculators**: Compound interest, Rule of 72, DCF, P/E ratio, and more
- **Multi-Currency Support**: 10 countries with local currency symbols
- **Dark/Light Theme**: Beautiful theme switching with custom color schemes
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### 🛡️ **Admin Features**
- **User Management**: View all registered users and their financial data
- **Quote Management**: Add/remove inspirational quotes for users
- **Financial Overview**: Complete financial summary for each user
- **Database Monitoring**: Real-time connection status and data insights

## 🏗️ Architecture Overview

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │────│   Supabase DB   │────│  Row Level Sec  │
│  (Frontend/API) │    │   (PostgreSQL)  │    │   (RLS Policies)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Authentication │    │  Data Storage   │    │   Security      │
│  - Supabase Auth│    │  - Users        │    │  - User Isolation│
│  - JWT Tokens   │    │  - Money Flow   │    │  - Admin Access │
│  - Email Verify │    │  - Goals        │    │  - Data Privacy │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

## 📊 Database Schema & Security

### 🔐 **Authentication Flow**
\`\`\`
1. User signs up → Supabase Auth creates auth.users record
2. App creates users table record linked to auth.users.id
3. All user data uses auth.users.id as foreign key
4. RLS policies ensure users only see their own data
5. Admin has special policies to view all data
\`\`\`

### 📋 **Database Tables**

#### **1. users** (User Profiles)
\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),           -- Internal table ID
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Links to Supabase Auth
  name TEXT NOT NULL,                                      -- Full name
  email TEXT NOT NULL UNIQUE,                             -- Email address
  phone TEXT,                                             -- Phone number
  country TEXT NOT NULL,                                  -- Country code (US, IN, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),     -- Account creation
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()      -- Last profile update
);
