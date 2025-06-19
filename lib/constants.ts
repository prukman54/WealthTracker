/**
 * Application Constants for WealthTracker
 *
 * This module contains all static configuration data used throughout the application.
 * These constants ensure consistency and make the app easy to maintain and extend.
 */

/**
 * Supported Countries and Currencies
 *
 * Each country object contains:
 * - code: ISO country code (used in database)
 * - name: Display name with flag emoji
 * - currency: ISO currency code
 * - symbol: Currency symbol for display
 *
 * ADDING NEW COUNTRIES:
 * 1. Add new object to this array
 * 2. Test currency formatting in different locales
 * 3. Verify flag emoji displays correctly
 * 4. Update any country-specific business logic
 */
export const COUNTRIES = [
  { code: "US", name: "USA 🇺🇸", currency: "USD", symbol: "$" },
  { code: "JP", name: "Japan 🇯🇵", currency: "JPY", symbol: "¥" },
  { code: "CN", name: "China 🇨🇳", currency: "CNY", symbol: "¥" },
  { code: "IN", name: "India 🇮🇳", currency: "INR", symbol: "₹" },
  { code: "NP", name: "Nepal 🇳🇵", currency: "NPR", symbol: "Rs" },
  { code: "CA", name: "Canada 🇨🇦", currency: "CAD", symbol: "C$" },
  { code: "AU", name: "Australia 🇦🇺", currency: "AUD", symbol: "A$" },
  { code: "NZ", name: "New Zealand 🇳🇿", currency: "NZD", symbol: "NZ$" },
  { code: "AE", name: "UAE 🇦🇪", currency: "AED", symbol: "د.إ" },
  { code: "RU", name: "Russia 🇷🇺", currency: "RUB", symbol: "₽" },
]

/**
 * DEPRECATED: Income and Expense Categories
 *
 * These categories are now managed dynamically through the admin panel.
 * They remain here as fallbacks only when the database is unavailable.
 *
 * To manage categories:
 * 1. Go to Admin Dashboard → Categories Manager
 * 2. Add/remove/activate/deactivate categories as needed
 * 3. Changes take effect immediately for all users
 */

/**
 * Income Categories
 *
 * Predefined categories for income transactions.
 * These help with:
 * - Consistent data entry
 * - Financial reporting and analysis
 * - Tax categorization
 *
 * USAGE: Used in money-flow form dropdowns
 */
export const INCOME_CATEGORIES = [
  "Salary", // Regular employment income
  "Commission", // Sales commissions
  "Work", // Freelance/contract work
  "Investment", // Investment returns
  "Dividend", // Stock dividends
  "Royalty", // Intellectual property income
  "Interest", // Bank interest, bonds
]

/**
 * Expense Categories
 *
 * Predefined categories for expense transactions.
 * Organized by common spending patterns for easy selection.
 *
 * USAGE: Used in money-flow form dropdowns
 */
export const EXPENSE_CATEGORIES = [
  "Food", // Groceries, restaurants
  "Travel", // Vacation, business travel
  "Transportation", // Gas, public transport, car maintenance
  "Rent", // Housing costs
  "Utilities", // Electricity, water, internet
  "Entertainment", // Movies, games, hobbies
  "Healthcare", // Medical expenses, insurance
  "Misc", // Miscellaneous expenses
]

/**
 * Get currency symbol for a country
 *
 * This function provides a safe way to get currency symbols
 * with fallback to USD if country is not found.
 *
 * @param country - Country code or name to look up
 * @returns Currency symbol string
 *
 * EXAMPLES:
 * getCurrencySymbol("US") → "$"
 * getCurrencySymbol("India 🇮🇳") → "₹"
 * getCurrencySymbol("INVALID") → "$" (fallback)
 */
export const getCurrencySymbol = (country: string) => {
  const countryData = COUNTRIES.find((c) => c.code === country || c.name.includes(country))
  return countryData?.symbol || "$"
}

/**
 * USAGE EXAMPLES:
 *
 * // In a component
 * import { COUNTRIES, getCurrencySymbol } from '@/lib/constants'
 *
 * // Display country dropdown
 * {COUNTRIES.map(country => (
 *   <option key={country.code} value={country.code}>
 *     {country.name}
 *   </option>
 * ))}
 *
 * // Show amount with currency
 * const symbol = getCurrencySymbol(user.country)
 * return <span>{symbol}{amount.toLocaleString()}</span>
 *
 * // Category selection
 * {INCOME_CATEGORIES.map(category => (
 *   <option key={category} value={category}>{category}</option>
 * ))}
 */
