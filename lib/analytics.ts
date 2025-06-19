/**
 * Minimal Google&nbsp;Analytics wrapper.
 * You can replace the console statements with real gtag() calls
 * once GA is confirmed to be loaded on the client.
 */

type TrackPayload = Record<string, string | number | undefined>

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  const payload: TrackPayload = { event_category: category }
  if (label) payload.event_label = label
  if (value !== undefined) payload.value = value

  /* ------------------------------------------------------------------
     Replace the line below with:  window.gtag("event", action, payload)
     once GA is available. This keeps the build green during preview.
  ------------------------------------------------------------------ */
  console.info(`[analytics] ${action}`, payload)
}

/**
 * Authentication-related events
 */
export const trackAuth = {
  signup: () => trackEvent("sign_up", "auth"),
  login: () => trackEvent("login", "auth"),
  logout: () => trackEvent("logout", "auth"),
}

/**
 * Income / expense events
 */
export const trackFinancial = {
  addTransaction: (type: "income" | "expense", amount: number) =>
    trackEvent("add_transaction", "financial", type, amount),
  addGoal: (target: number) => trackEvent("add_goal", "financial", "goal_created", target),
  updateGoal: (progress: number) => trackEvent("update_goal", "financial", "goal_progress", progress),
  achieveGoal: () => trackEvent("achieve_goal", "financial", "goal_completed"),
}

/**
 * Calculator usage
 */
export const trackCalculator = {
  compoundInterest: (principal: number) => trackEvent("use_calculator", "tools", "compound_interest", principal),
  rule72: (rate: number) => trackEvent("use_calculator", "tools", "rule_72", rate),
  mortgage: (loan: number) => trackEvent("use_calculator", "tools", "mortgage", loan),
  dcf: (cashFlow: number) => trackEvent("use_calculator", "tools", "dcf", cashFlow),
}

/**
 * Admin-only analytics events
 */
export const trackAdmin = {
  // General user-data views
  viewUserData: (userId: string) => trackEvent("view_user_data", "admin", userId),

  // Quote management
  addQuote: () => trackEvent("add_quote", "admin"),
  deleteQuote: () => trackEvent("delete_quote", "admin"),

  // Category management (income / expense)
  addCategory: (type: "income" | "expense") => trackEvent("add_category", "admin", type),
  deleteCategory: () => trackEvent("delete_category", "admin"),
  toggleCategory: () => trackEvent("toggle_category", "admin"),
}

/**
 * General UI interactions — kept from the last fix so existing imports compile.
 */
export const trackUI = {
  themeToggle: (theme: "light" | "dark") => trackEvent("theme_change", "ui", theme),
  profileUpdate: () => trackEvent("profile_update", "user"),
  countryChange: (country: string) => trackEvent("country_change", "user", country),
  mobileMenuToggle: () => trackEvent("mobile_menu_toggle", "ui"),
}
