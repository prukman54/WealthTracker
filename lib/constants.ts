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

export const INCOME_CATEGORIES = ["Salary", "Commission", "Work", "Investment", "Dividend", "Royalty", "Interest"]

export const EXPENSE_CATEGORIES = [
  "Food",
  "Travel",
  "Transportation",
  "Rent",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Misc",
]

export const getCurrencySymbol = (country: string) => {
  const countryData = COUNTRIES.find((c) => c.code === country || c.name.includes(country))
  return countryData?.symbol || "$"
}
