import { getSupabaseClient } from "./supabase"

/**
 * Authentication utilities for WealthTracker
 * 
 * This module handles all user authentication operations including:
 * - User registration with profile creation
 * - User login with email verification
 * - Session management and logout
 * - Current user retrieval
 * - Admin role checking
 * 
 * IMPORTANT: All user data in the app uses auth.users.id as the foreign key
 * This ensures proper data isolation and RLS policy enforcement
 */

/**
 * Register a new user account
 * 
 * Process:
 * 1. Creates auth.users record via Supabase Auth
 * 2. Creates corresponding users table record with profile data
 * 3. Links both records using auth.users.id as foreign key
 * 
 * @param email - User's email address (must be unique)
 * @param password - User's password (min 6 characters)
 * @param userData - Profile information (name, phone, country)
 * @returns Promise with user data or throws error
 */
export const signUp = async (
  email: string,
  password: string,
  userData: {
    name: string
    phone: string
    country: string
  },
) => {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  // Step 1: Create authentication record
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData, // This goes to auth.users.raw_user_meta_data
    },
  })

  if (error) throw error

  // Step 2: Create profile record in users table
  // CRITICAL: user_id field must reference auth.users.id for RLS to work
  if (data.user) {
    const { error: insertError } = await supabase.from("users").insert({
      user_id: data.user.id, // This is the auth.users.id - NEVER change this!
      name: userData.name,
      email: email,
      phone: userData.phone,
      country: userData.country,
    })

    if (insertError) throw insertError
  }

  return data
}

/**
 * Sign in an existing user
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise with user data or throws error
 */
export const signIn = async (email: string, password: string) => {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

/**
 * Sign out the current user
 * Clears all session data and redirects to login
 */
export const signOut = async () => {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Get the currently authenticated user
 * 
 * This function returns the auth.users record, which contains:
 * - id: The primary key used throughout the app
 * - email: User's email address
 * - email_confirmed_at: Email verification status
 * - created_at: Account creation timestamp
 * 
 * @returns Promise with user object or null if not authenticated
 */
export const getCurrentUser = async () => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Check if a user has admin privileges
 * 
 * SECURITY NOTE: This is a simple email-based check for demo purposes.
 * In production, implement proper role-based access control with:
 * - Custom claims in JWT tokens
 * - Admin role table with proper RLS policies
 * - Server-side role verification
 * 
 * @param email - User's email address to check
 * @returns boolean indicating admin status
 */
export const isAdmin = (email: string | undefined) => {
  return email === "prukman54@gmail.com"
}
