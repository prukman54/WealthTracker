"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AuthGuard from "@/components/auth-guard"
import { getCurrentUser, signOut } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { COUNTRIES } from "@/lib/constants"
import { TrendingUp, DollarSign, BarChart3, LogOut, User, RefreshCw, Menu, Plus } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UserProfile {
  name: string
  email: string
  phone: string
  country: string
}

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [currentQuote, setCurrentQuote] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netWorth: 0,
    savingsRate: 0,
    topSpendingCategory: { category: "", amount: 0 },
  })
  const [goals, setGoals] = useState<any[]>([])
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
  })

  useEffect(() => {
    loadUserProfile()
    loadRandomQuote()
    loadFinancialData()
    loadGoals()

    // Set up quote rotation every 30 seconds
    const quoteInterval = setInterval(loadRandomQuote, 30000)
    return () => clearInterval(quoteInterval)
  }, [])

  const loadUserProfile = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { data, error } = await supabase.from("users").select("*").eq("user_id", user.id).single()

      if (error) throw error
      setUserProfile(data)
    } catch (err: any) {
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const loadRandomQuote = async (manual = false) => {
    if (manual) setQuoteLoading(true)

    try {
      const { data, error } = await supabase.from("quotes").select("quote")

      if (error) throw error
      if (data && data.length > 0) {
        const randomQuote = data[Math.floor(Math.random() * data.length)]
        setCurrentQuote(randomQuote.quote)
      }
    } catch (err) {
      console.error("Failed to load quote:", err)
    } finally {
      if (manual) setQuoteLoading(false)
    }
  }

  const loadFinancialData = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      // Get all money flow records
      const { data: records, error } = await supabase.from("money_flow").select("*").eq("user_id", user.id)

      if (error) throw error

      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      const totalIncome = records?.filter((r) => r.type === "income").reduce((sum, r) => sum + r.amount, 0) || 0
      const totalExpenses = records?.filter((r) => r.type === "expense").reduce((sum, r) => sum + r.amount, 0) || 0
      const netWorth = totalIncome - totalExpenses
      const savingsRate = totalIncome > 0 ? (netWorth / totalIncome) * 100 : 0

      // Calculate top spending category for current month
      const thisMonthExpenses =
        records?.filter((r) => {
          const recordDate = new Date(r.date)
          return (
            r.type === "expense" && recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
          )
        }) || []

      const categoryTotals = thisMonthExpenses.reduce(
        (acc, record) => {
          acc[record.category] = (acc[record.category] || 0) + record.amount
          return acc
        },
        {} as Record<string, number>,
      )

      const topCategory = Object.entries(categoryTotals).reduce(
        (max, [category, amount]) => (amount > max.amount ? { category, amount } : max),
        { category: "No expenses", amount: 0 },
      )

      setFinancialData({
        totalIncome,
        totalExpenses,
        netWorth,
        savingsRate,
        topSpendingCategory: topCategory,
      })
    } catch (err) {
      console.error("Failed to load financial data:", err)
    }
  }

  const loadGoals = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { data, error } = await supabase
        .from("financial_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error && error.code !== "PGRST116") throw error
      setGoals(data || [])
    } catch (err) {
      console.error("Failed to load goals:", err)
    }
  }

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { error } = await supabase.from("financial_goals").insert({
        user_id: user.id,
        name: newGoal.name,
        target_amount: Number.parseFloat(newGoal.targetAmount),
        current_amount: Number.parseFloat(newGoal.currentAmount) || 0,
        is_achieved: false,
      })

      if (error) throw error

      setNewGoal({ name: "", targetAmount: "", currentAmount: "" })
      setShowAddGoal(false)
      loadGoals()
    } catch (err: any) {
      console.error("Failed to add goal:", err)
    }
  }

  const updateGoalProgress = async (goalId: string, newAmount: number) => {
    try {
      const { error } = await supabase.from("financial_goals").update({ current_amount: newAmount }).eq("id", goalId)

      if (error) throw error
      loadGoals()
    } catch (err) {
      console.error("Failed to update goal:", err)
    }
  }

  const toggleGoalAchieved = async (goalId: string, isAchieved: boolean) => {
    try {
      const { error } = await supabase.from("financial_goals").update({ is_achieved: !isAchieved }).eq("id", goalId)

      if (error) throw error
      loadGoals()
    } catch (err) {
      console.error("Failed to toggle goal:", err)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = "https://rukman.com.np"
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  const handleQuoteRefresh = () => {
    loadRandomQuote(true)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const getCurrencyInfo = () => {
    if (!userProfile) return { symbol: "$", currency: "USD" }
    const country = COUNTRIES.find((c) => c.code === userProfile.country)
    return { symbol: country?.symbol || "$", currency: country?.currency || "USD" }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AuthGuard requireAuth>
      <div className="min-h-screen gradient-bg">
        {/* Header */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                <h1 className="text-xl md:text-2xl font-bold text-gradient">WealthTracker</h1>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-6">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/dashboard/money-flow"
                  className="text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Money Flow
                </Link>
                <Link
                  href="/dashboard/investing-tools"
                  className="text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Investing Tools
                </Link>
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-medium"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </nav>

              {/* Mobile Navigation */}
              <div className="lg:hidden flex items-center space-x-2">
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-medium"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4">
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/dashboard/money-flow"
                    className="text-muted-foreground hover:text-primary transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Money Flow
                  </Link>
                  <Link
                    href="/dashboard/investing-tools"
                    className="text-muted-foreground hover:text-primary transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Investing Tools
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-medium w-fit"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 md:py-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Welcome Section */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-4xl font-bold text-gradient mb-4">
              {getGreeting()}, {userProfile?.name}!
            </h2>
            <div className="bg-card rounded-lg p-4 md:p-6 shadow-sm border border-border">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-card-foreground mb-3 text-lg">Profile Summary</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-card-foreground">Name:</span> {userProfile?.name}
                    </p>
                    <p>
                      <span className="font-medium text-card-foreground">Phone:</span> {userProfile?.phone}
                    </p>
                    <p>
                      <span className="font-medium text-card-foreground">Country:</span>{" "}
                      {COUNTRIES.find((c) => c.code === userProfile?.country)?.name}
                    </p>
                    <p>
                      <span className="font-medium text-card-foreground">Currency:</span> {getCurrencyInfo().currency} (
                      {getCurrencyInfo().symbol})
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-card-foreground text-lg">💡 Wealth Quote</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleQuoteRefresh}
                      disabled={quoteLoading}
                      className="h-8 w-8 p-0 hover:bg-accent/20 border border-primary/20 hover:border-primary/40"
                      title="Get new quote"
                    >
                      <RefreshCw className={`h-4 w-4 text-primary ${quoteLoading ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border border-primary/20">
                    <p className="wealth-quote text-sm md:text-base leading-relaxed">
                      {currentQuote || "Loading inspirational quote..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Net Worth Card */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Net Worth</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-xl md:text-2xl font-bold ${financialData.netWorth >= 0 ? "text-primary" : "text-destructive"}`}
                >
                  {getCurrencyInfo().symbol}
                  {financialData.netWorth.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {financialData.netWorth >= 0 ? "Positive net worth" : "Negative net worth"}
                </p>
              </CardContent>
            </Card>

            {/* Savings Rate Card */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Savings Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-accent">{financialData.savingsRate.toFixed(1)}%</div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(Math.max(financialData.savingsRate, 0), 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {financialData.savingsRate >= 20
                    ? "Excellent!"
                    : financialData.savingsRate >= 10
                      ? "Good"
                      : "Needs improvement"}
                </p>
              </CardContent>
            </Card>

            {/* Top Spending Card */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Top Spending This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-card-foreground">
                  {financialData.topSpendingCategory.category}
                </div>
                <div className="text-lg font-bold text-destructive">
                  {getCurrencyInfo().symbol}
                  {financialData.topSpendingCategory.amount.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Goals Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-primary">
                  {goals.filter((g) => g.is_achieved).length}/{goals.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Goals achieved</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <Link href="/dashboard/money-flow" className="block">
              <Card className="card-hover bg-card border-border cursor-pointer h-full">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl text-card-foreground">💰 Money Flow Tracker</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm md:text-base">
                    Track your income, expenses, and savings with detailed insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4 text-sm md:text-base">
                    Monitor your financial health with comprehensive income and expense tracking.
                  </p>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 md:py-3">
                    Open Money Flow
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/investing-tools" className="block">
              <Card className="card-hover bg-card border-border cursor-pointer h-full">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-accent" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl text-card-foreground">📈 Investing Tools</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm md:text-base">
                    Access powerful calculators and investment analysis tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4 text-sm md:text-base">
                    Make informed investment decisions with our comprehensive toolkit.
                  </p>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-2 md:py-3">
                    Open Investing Tools
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Financial Goals Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-gradient">💎 Your Financial Goals</h3>
              <Button
                onClick={() => setShowAddGoal(true)}
                className="bg-primary hover:bg-primary/90 text-white font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>

            {/* Add Goal Form */}
            {showAddGoal && (
              <Card className="bg-card border-border mb-6">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Add New Financial Goal</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddGoal} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="goalName">Goal Name</Label>
                        <Input
                          id="goalName"
                          value={newGoal.name}
                          onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                          placeholder="e.g., Emergency Fund"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="targetAmount">Target Amount ({getCurrencyInfo().symbol})</Label>
                        <Input
                          id="targetAmount"
                          type="number"
                          step="0.01"
                          value={newGoal.targetAmount}
                          onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                          placeholder="e.g., 50000"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="currentAmount">Current Amount ({getCurrencyInfo().symbol})</Label>
                        <Input
                          id="currentAmount"
                          type="number"
                          step="0.01"
                          value={newGoal.currentAmount}
                          onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                          placeholder="e.g., 5000"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                        Add Goal
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddGoal(false)}
                        className="border-2 border-primary text-primary hover:bg-primary hover:text-white"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {goals.length === 0 ? (
                <Card className="bg-card border-border col-span-full">
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No financial goals yet. Add your first goal to get started!</p>
                  </CardContent>
                </Card>
              ) : (
                goals.map((goal) => {
                  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
                  const isAchieved = goal.is_achieved || progress >= 100

                  return (
                    <Card
                      key={goal.id}
                      className={`bg-card border-border ${isAchieved ? "ring-2 ring-primary/20" : ""}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg text-card-foreground">{goal.name}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleGoalAchieved(goal.id, goal.is_achieved)}
                            className={`h-6 w-6 p-0 ${isAchieved ? "text-primary" : "text-muted-foreground"}`}
                          >
                            {isAchieved ? "✅" : "⭕"}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium text-card-foreground">{progress.toFixed(1)}%</span>
                          </div>

                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${isAchieved ? "bg-primary" : "bg-accent"}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {getCurrencyInfo().symbol}
                              {goal.current_amount.toLocaleString()}
                            </span>
                            <span className="font-medium text-card-foreground">
                              {getCurrencyInfo().symbol}
                              {goal.target_amount.toLocaleString()}
                            </span>
                          </div>

                          {!isAchieved && (
                            <div className="flex space-x-2 mt-3">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Update amount"
                                className="text-sm"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    const newAmount = Number.parseFloat((e.target as HTMLInputElement).value)
                                    if (newAmount >= 0) {
                                      updateGoalProgress(goal.id, newAmount)
                                      ;(e.target as HTMLInputElement).value = ""
                                    }
                                  }
                                }}
                              />
                            </div>
                          )}

                          {isAchieved && (
                            <div className="text-center">
                              <span className="text-sm font-medium text-primary">🎉 Goal Achieved!</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
