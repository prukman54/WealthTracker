/**
 * Google Analytics Utilities for WealthTracker
 *
 * This module provides functions to track user interactions and events
 * for analytics and optimization purposes.
 */

// Extend the Window interface to include gtag
declare global {
  interface Window {
    gtag: (command: "config" | "event" | "js" | "set", targetId: string | Date, config?: Record<string, any>) => void
    dataLayer: any[]
  }
}

const GA_TRACKING_ID = "G-M3QEL36KRT"
const DEBUG_MODE = process.env.NODE_ENV === "development"

/**
 * Check if Google Analytics is properly loaded
 */
export const isAnalyticsReady = (): boolean => {
  if (typeof window === "undefined") return false
  return typeof window.gtag === "function" && Array.isArray(window.dataLayer)
}

/**
 * Log analytics events in development mode
 */
const debugLog = (eventName: string, parameters?: Record<string, any>) => {
  if (DEBUG_MODE) {
    console.log(`🔍 Analytics Event: ${eventName}`, parameters)
  }
}

/**
 * Safe wrapper for gtag calls with error handling
 */
const safeGtag = (command: string, eventName: string, parameters?: Record<string, any>) => {
  try {
    if (!isAnalyticsReady()) {
      if (DEBUG_MODE) {
        console.warn("⚠️ Google Analytics not ready, event queued:", eventName)
      }
      return
    }

    debugLog(eventName, parameters)
    window.gtag(command as any, eventName, parameters)
  } catch (error) {
    console.error("❌ Analytics error:", error)
  }
}

/**
 * Track page views
 * @param url - The page URL
 * @param title - The page title
 */
export const trackPageView = (url: string, title?: string) => {
  safeGtag("config", GA_TRACKING_ID, {
    page_location: url,
    page_title: title,
  })
}

/**
 * Track custom events
 * @param action - The action being tracked
 * @param category - The category of the event
 * @param label - Optional label for the event
 * @param value - Optional numeric value
 */
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  const parameters: Record<string, any> = {
    event_category: category,
  }

  if (label) parameters.event_label = label
  if (value !== undefined) parameters.value = value

  safeGtag("event", action, parameters)
}

/**
 * Track user authentication events
 */
export const trackAuth = {
  signup: () => trackEvent("sign_up", "auth"),
  login: () => trackEvent("login", "auth"),
  logout: () => trackEvent("logout", "auth"),
  emailVerification: () => trackEvent("email_verification", "auth"),
}

/**
 * Track financial actions
 */
export const trackFinancial = {
  addTransaction: (type: "income" | "expense", amount: number) =>
    trackEvent("add_transaction", "financial", type, amount),

  addGoal: (targetAmount: number) => trackEvent("add_goal", "financial", "goal_created", targetAmount),

  updateGoal: (progress: number) => trackEvent("update_goal", "financial", "goal_progress", progress),

  achieveGoal: () => trackEvent("achieve_goal", "financial", "goal_completed"),

  deleteTransaction: (type: "income" | "expense") => trackEvent("delete_transaction", "financial", type),

  exportData: (format: string) => trackEvent("export_data", "financial", format),
}

/**
 * Track calculator usage
 */
export const trackCalculator = {
  compoundInterest: (principal: number) => trackEvent("use_calculator", "tools", "compound_interest", principal),

  rule72: (rate: number) => trackEvent("use_calculator", "tools", "rule_72", rate),

  mortgage: (loanAmount: number) => trackEvent("use_calculator", "tools", "mortgage", loanAmount),

  dcf: (cashFlow: number) => trackEvent("use_calculator", "tools", "dcf", cashFlow),

  peRatio: (sharePrice: number) => trackEvent("use_calculator", "tools", "pe_ratio", sharePrice),

  dividendYield: (dividend: number) => trackEvent("use_calculator", "tools", "dividend_yield", dividend),

  inflationImpact: (amount: number) => trackEvent("use_calculator", "tools", "inflation_impact", amount),
}

/**
 * Track theme and UI interactions
 */
export const trackUI = {
  themeToggle: (theme: "light" | "dark") => trackEvent("theme_change", "ui", theme),

  profileUpdate: () => trackEvent("profile_update", "user"),

  countryChange: (country: string) => trackEvent("country_change", "user", country),

  mobileMenuToggle: () => trackEvent("mobile_menu_toggle", "ui"),

  searchUsage: (query: string) => trackEvent("search", "ui", query.length > 0 ? "with_query" : "empty"),

  navigationClick: (destination: string) => trackEvent("navigation_click", "ui", destination),
}

/**
 * Track admin actions (for admin users only)
 */
export const trackAdmin = {
  viewUserData: (userId: string) => trackEvent("view_user_data", "admin", userId),

  addQuote: () => trackEvent("add_quote", "admin"),

  deleteQuote: () => trackEvent("delete_quote", "admin"),

  userManagement: (action: string) => trackEvent("user_management", "admin", action),

  systemSettings: (setting: string) => trackEvent("system_settings", "admin", setting),
}

/**
 * Track errors and performance
 */
export const trackError = {
  authError: (errorType: string) => trackEvent("auth_error", "error", errorType),

  apiError: (endpoint: string) => trackEvent("api_error", "error", endpoint),

  validationError: (field: string) => trackEvent("validation_error", "error", field),

  performanceIssue: (issue: string) => trackEvent("performance_issue", "error", issue),
}

/**
 * Track business metrics
 */
export const trackBusiness = {
  featureUsage: (feature: string) => trackEvent("feature_usage", "business", feature),

  userRetention: (daysActive: number) => trackEvent("user_retention", "business", "days_active", daysActive),

  goalCompletion: (goalType: string, timeToComplete: number) =>
    trackEvent("goal_completion", "business", goalType, timeToComplete),

  calculatorPopularity: (calculatorType: string) => trackEvent("calculator_popularity", "business", calculatorType),
}

/**
 * Initialize analytics with user properties
 */
export const initializeAnalytics = (userId?: string, userProperties?: Record<string, any>) => {
  if (!isAnalyticsReady()) return

  try {
    if (userId) {
      window.gtag("config", GA_TRACKING_ID, {
        user_id: userId,
        custom_map: userProperties,
      })
    }

    debugLog("Analytics initialized", { userId, userProperties })
  } catch (error) {
    console.error("❌ Analytics initialization error:", error)
  }
}

/**
 * Get analytics status for debugging
 */
export const getAnalyticsStatus = () => {
  return {
    isReady: isAnalyticsReady(),
    hasGtag: typeof window !== "undefined" && typeof window.gtag === "function",
    hasDataLayer: typeof window !== "undefined" && Array.isArray(window.dataLayer),
    trackingId: GA_TRACKING_ID,
    debugMode: DEBUG_MODE,
  }
}
