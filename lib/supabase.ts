import { createClient } from "@supabase/supabase-js"

/**
 * Supabase Database Client Configuration
 *
 * This module provides a singleton Supabase client for the WealthTracker application.
 *
 * IMPORTANT DESIGN DECISIONS:
 * 1. Client-side only initialization (SSR safe)
 * 2. Singleton pattern to prevent multiple connections
 * 3. Automatic error handling for missing environment variables
 * 4. Type-safe database schema definitions
 *
 * SECURITY CONSIDERATIONS:
 * - Uses anon key (safe for client-side)
 * - RLS policies handle data security
 * - Never expose service role key on client
 */

// Singleton instance to prevent multiple client creations
let supabaseInstance: any = null

/**
 * Get or create the Supabase client instance
 *
 * This function ensures:
 * - Only one client instance exists (singleton pattern)
 * - Client is only created on the browser (not during SSR)
 * - Proper error handling for missing environment variables
 *
 * @returns Supabase client instance or null if unavailable
 */
export const getSupabaseClient = () => {
  // Prevent server-side initialization (Next.js SSR safety)
  if (typeof window === "undefined") {
    return null
  }

  // Return existing instance if already created
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Validate environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables")
      console.error("Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY")
      return null
    }

    // Create new client instance
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseInstance
}

// Legacy export for backward compatibility
export const supabase = getSupabaseClient()

/**
 * TypeScript Database Schema Definitions
 *
 * These types ensure type safety when working with database records.
 * They must be kept in sync with the actual database schema.
 *
 * MAINTENANCE NOTE: Update these types when database schema changes
 */
export type Database = {
  public: {
    Tables: {
      /**
       * users table - User profile information
       *
       * CRITICAL FIELDS:
       * - user_id: References auth.users(id) - used for RLS policies
       * - email: Must match auth.users.email for consistency
       * - country: Determines currency symbol and formatting
       */
      users: {
        Row: {
          id: string // Internal table ID (UUID)
          user_id: string // Links to auth.users(id) - CRITICAL for RLS
          name: string // User's full name
          email: string // Email address (must match auth.users.email)
          phone: string | null // Phone number (optional)
          country: string // Country code (US, IN, JP, etc.)
          created_at: string // Account creation timestamp
          updated_at: string // Last profile update timestamp
        }
        Insert: {
          id?: string // Optional - auto-generated if not provided
          user_id: string // Required - must be auth.users.id
          name: string // Required
          email: string // Required - must be unique
          phone?: string | null // Optional
          country: string // Required
          created_at?: string // Optional - defaults to NOW()
          updated_at?: string // Optional - defaults to NOW()
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          phone?: string | null
          country?: string
          created_at?: string
          updated_at?: string
        }
      }

      /**
       * money_flow table - Income and expense transactions
       *
       * CRITICAL FIELDS:
       * - user_id: Must match auth.users(id) for RLS policies
       * - type: Constrained to 'income' or 'expense'
       * - amount: DECIMAL(12,2) for precise financial calculations
       * - category: Predefined categories for reporting
       */
      money_flow: {
        Row: {
          id: string // Transaction ID (UUID)
          user_id: string // Owner - references auth.users(id)
          type: "income" | "expense" // Transaction type (database constraint)
          amount: number // Transaction amount (DECIMAL in DB)
          category: string // Transaction category
          date: string // Transaction date (DATE type)
          description: string | null // Optional transaction notes
          created_at: string // Record creation timestamp
        }
        Insert: {
          id?: string // Optional - auto-generated
          user_id: string // Required - must be auth.users.id
          type: "income" | "expense" // Required
          amount: number // Required - positive number
          category: string // Required - from predefined list
          date?: string // Optional - defaults to today
          description?: string | null // Optional
          created_at?: string // Optional - defaults to NOW()
        }
        Update: {
          id?: string
          user_id?: string
          type?: "income" | "expense"
          amount?: number
          category?: string
          date?: string
          description?: string | null
          created_at?: string
        }
      }

      /**
       * quotes table - Inspirational quotes for users
       *
       * NOTES:
       * - No user_id - quotes are global content
       * - Admin can add/remove quotes
       * - Displayed randomly to users on dashboard
       */
      quotes: {
        Row: {
          id: number // Auto-incrementing ID (SERIAL)
          quote: string // Quote content
          created_at: string // When quote was added
        }
        Insert: {
          id?: number // Optional - auto-generated
          quote: string // Required
          created_at?: string // Optional - defaults to NOW()
        }
        Update: {
          id?: number
          quote?: string
          created_at?: string
        }
      }
    }
  }
}
