import { getSupabaseClient } from "./supabase"

/**
 * Supabase Connection Testing Utilities
 *
 * This module provides functions to test and validate the Supabase database connection.
 * Used primarily by the admin dashboard to verify database connectivity and health.
 */

/**
 * Test the Supabase database connection
 *
 * This function performs a simple query to verify that:
 * 1. Supabase client is properly initialized
 * 2. Database connection is working
 * 3. Basic query functionality is available
 *
 * @returns Promise<boolean> - true if connection is successful, false otherwise
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Get the Supabase client
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("❌ Supabase client not available")
      return false
    }

    console.log("🔍 Testing Supabase connection...")

    // Perform a simple query to test the connection
    // We'll query the quotes table since it's always available and doesn't require authentication
    const { data, error, count } = await supabase
      .from("quotes")
      .select("id", { count: "exact", head: true }) // head: true means we only want the count, not the data
      .limit(1)

    if (error) {
      console.error("❌ Supabase connection test failed:", error.message)
      console.error("Error details:", error)
      return false
    }

    console.log("✅ Supabase connection test successful")
    console.log(`📊 Database responsive - quotes table has ${count || 0} records`)

    return true
  } catch (err) {
    console.error("❌ Supabase connection test error:", err)
    return false
  }
}

/**
 * Test database table accessibility
 *
 * This function tests if all required tables are accessible and properly configured.
 * Useful for debugging RLS policy issues or missing tables.
 *
 * @returns Promise<{[tableName: string]: boolean}> - Object with table accessibility status
 */
export const testTableAccess = async (): Promise<{ [tableName: string]: boolean }> => {
  const supabase = getSupabaseClient()
  const results: { [tableName: string]: boolean } = {}

  if (!supabase) {
    console.error("❌ Supabase client not available for table access test")
    return results
  }

  const tables = ["users", "money_flow", "financial_goals", "quotes"]

  for (const table of tables) {
    try {
      console.log(`🔍 Testing access to ${table} table...`)

      const { error } = await supabase.from(table).select("*", { count: "exact", head: true }).limit(1)

      if (error) {
        console.error(`❌ ${table} table access failed:`, error.message)
        results[table] = false
      } else {
        console.log(`✅ ${table} table accessible`)
        results[table] = true
      }
    } catch (err) {
      console.error(`❌ ${table} table test error:`, err)
      results[table] = false
    }
  }

  return results
}

/**
 * Get database health information
 *
 * This function provides detailed information about the database state,
 * including table counts and basic statistics.
 *
 * @returns Promise<object> - Database health information
 */
export const getDatabaseHealth = async () => {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return {
      status: "error",
      message: "Supabase client not available",
      tables: {},
    }
  }

  try {
    console.log("📊 Gathering database health information...")

    const health = {
      status: "healthy",
      message: "Database is operational",
      tables: {} as { [key: string]: any },
      timestamp: new Date().toISOString(),
    }

    // Test each table and get basic stats
    const tables = ["users", "money_flow", "financial_goals", "quotes"]

    for (const table of tables) {
      try {
        const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })

        if (error) {
          health.tables[table] = {
            accessible: false,
            error: error.message,
            count: 0,
          }
          health.status = "warning"
        } else {
          health.tables[table] = {
            accessible: true,
            count: count || 0,
            error: null,
          }
        }
      } catch (err) {
        health.tables[table] = {
          accessible: false,
          error: err instanceof Error ? err.message : "Unknown error",
          count: 0,
        }
        health.status = "warning"
      }
    }

    console.log("✅ Database health check completed:", health)
    return health
  } catch (err) {
    console.error("❌ Database health check failed:", err)
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Unknown error",
      tables: {},
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * USAGE EXAMPLES:
 *
 * // Basic connection test
 * const isConnected = await testSupabaseConnection()
 * if (!isConnected) {
 *   console.log("Database connection failed")
 * }
 *
 * // Test table access
 * const tableAccess = await testTableAccess()
 * console.log("Table accessibility:", tableAccess)
 *
 * // Get detailed health info
 * const health = await getDatabaseHealth()
 * console.log("Database health:", health)
 */
