// Test file to check Supabase connection
import { getSupabaseClient } from "./supabase"

export const testSupabaseConnection = async () => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.error("❌ Supabase client not initialized")
      return false
    }

    console.log("🔍 Testing Supabase connection...")

    // Test basic connection
    const { data: testData, error: testError } = await supabase.from("quotes").select("count", { count: "exact" })

    if (testError) {
      console.error("❌ Supabase connection test failed:", testError)
      return false
    }

    console.log("✅ Supabase connection successful")
    console.log("📊 Quotes count:", testData)

    // Test users table
    const { data: usersData, error: usersError } = await supabase.from("users").select("count", { count: "exact" })

    if (usersError) {
      console.error("❌ Users table access failed:", usersError)
    } else {
      console.log("✅ Users table accessible, count:", usersData)
    }

    return true
  } catch (error) {
    console.error("❌ Connection test error:", error)
    return false
  }
}
