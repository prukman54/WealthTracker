import { createClient } from "@supabase/supabase-js"

// Only initialize on client side
let supabaseInstance: any = null

export const getSupabaseClient = () => {
  if (typeof window === "undefined") {
    // Return null on server side
    return null
  }

  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables")
      return null
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseInstance
}

// Legacy export for backward compatibility
export const supabase = getSupabaseClient()

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          phone: string | null
          country: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          phone?: string | null
          country: string
          created_at?: string
          updated_at?: string
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
      money_flow: {
        Row: {
          id: string
          user_id: string
          type: "income" | "expense"
          amount: number
          category: string
          date: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: "income" | "expense"
          amount: number
          category: string
          date?: string
          description?: string | null
          created_at?: string
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
      quotes: {
        Row: {
          id: number
          quote: string
          created_at: string
        }
        Insert: {
          id?: number
          quote: string
          created_at?: string
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
