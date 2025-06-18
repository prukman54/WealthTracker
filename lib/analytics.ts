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
  }
}

/**
 * Track page views
 * @param url - The page URL
 * @param title - The page title
 */
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", "G-M3QEL36KRT", {
      page_location: url,
      page_title: title,
    })
  }
}

/**
 * Track custom events
 * @param action - The action being tracked
 * @param category - The category of the event
 * @param label - Optional label for the event
 * @param value - Optional numeric value
 */
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

/**
 * Track user authentication events
 */
export const trackAuth = {
  signup: () => trackEvent("sign_up", "auth"),
  login: () => trackEvent("login", "auth"),
  logout: () => trackEvent("logout", "auth"),
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
}

/**
 * Track calculator usage
 */
export const trackCalculator = {
  compoundInterest: (principal: number) => trackEvent("use_calculator", "tools", "compound_interest", principal),

  rule72: (rate: number) => trackEvent("use_calculator", "tools", "rule_72", rate),

  mortgage: (loanAmount: number) => trackEvent("use_calculator", "tools", "mortgage", loanAmount),

  dcf: (cashFlow: number) => trackEvent("use_calculator", "tools", "dcf", cashFlow),
}

/**
 * Track theme and UI interactions
 */
export const trackUI = {
  themeToggle: (theme: "light" | "dark") => trackEvent("theme_change", "ui", theme),

  profileUpdate: () => trackEvent("profile_update", "user"),

  countryChange: (country: string) => trackEvent("country_change", "user", country),
}

/**
 * Track admin actions (for admin users only)
 */
export const trackAdmin = {
  viewUserData: (userId: string) => trackEvent("view_user_data", "admin", userId),

  addQuote: () => trackEvent("add_quote", "admin"),

  deleteQuote: () => trackEvent("delete_quote", "admin"),
}
