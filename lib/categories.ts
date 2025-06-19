import { getSupabaseClient } from "./supabase"

/**
 * Dynamic Categories Management
 *
 * This module handles fetching categories from the database instead of using hardcoded constants.
 * It provides fallback to hardcoded categories if database is unavailable.
 */

// Fallback categories (same as original constants)
const FALLBACK_INCOME_CATEGORIES = ["Salary", "Commission", "Work", "Investment", "Dividend", "Royalty", "Interest"]

const FALLBACK_EXPENSE_CATEGORIES = [
  "Food",
  "Travel",
  "Transportation",
  "Rent",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Misc",
]

export interface Category {
  id: string
  name: string
  type: "income" | "expense"
  is_active: boolean
  sort_order: number
}

/**
 * Fetch active categories from database
 * @param type - 'income' or 'expense' or undefined for all
 * @returns Promise<Category[]>
 */
export const fetchCategories = async (type?: "income" | "expense"): Promise<Category[]> => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.warn("Supabase not available, using fallback categories")
      return getFallbackCategories(type)
    }

    let query = supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })

    if (type) {
      query = query.eq("type", type)
    }

    const { data, error } = await query

    if (error) {
      console.error("Failed to fetch categories:", error)
      return getFallbackCategories(type)
    }

    return data || getFallbackCategories(type)
  } catch (err) {
    console.error("Error fetching categories:", err)
    return getFallbackCategories(type)
  }
}

/**
 * Get fallback categories when database is unavailable
 */
const getFallbackCategories = (type?: "income" | "expense"): Category[] => {
  const incomeCategories = FALLBACK_INCOME_CATEGORIES.map((name, index) => ({
    id: `fallback-income-${index}`,
    name,
    type: "income" as const,
    is_active: true,
    sort_order: index + 1,
  }))

  const expenseCategories = FALLBACK_EXPENSE_CATEGORIES.map((name, index) => ({
    id: `fallback-expense-${index}`,
    name,
    type: "expense" as const,
    is_active: true,
    sort_order: index + 1,
  }))

  if (type === "income") return incomeCategories
  if (type === "expense") return expenseCategories
  return [...incomeCategories, ...expenseCategories]
}

/**
 * Get category names only (for backward compatibility)
 */
export const getCategoryNames = async (type: "income" | "expense"): Promise<string[]> => {
  const categories = await fetchCategories(type)
  return categories.map((cat) => cat.name)
}

/**
 * Validate if a category exists and is active
 */
export const validateCategory = async (categoryName: string, type: "income" | "expense"): Promise<boolean> => {
  const categories = await fetchCategories(type)
  return categories.some((cat) => cat.name === categoryName && cat.is_active)
}
