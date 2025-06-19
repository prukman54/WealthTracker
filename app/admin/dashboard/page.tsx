"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getSupabaseClient } from "@/lib/supabase"
import { testSupabaseConnection } from "@/lib/supabase-test"
import { getCurrencySymbol, COUNTRIES } from "@/lib/constants"
import { Shield, Users, MessageSquare, LogOut, Eye, Trash2, Plus, RefreshCw, AlertCircle } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { trackAdmin } from "@/lib/analytics"

interface User {
  id: string
  user_id: string // Add this field
  name: string
  email: string
  phone: string
  country: string
  created_at: string
}

interface MoneyFlowSummary {
  user_id: string
  total_income: number
  total_expenses: number
  net_savings: number
  transaction_count: number
}

interface Quote {
  id: number
  quote: string
  created_at: string
}

interface FinancialGoal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  is_achieved: boolean
  created_at: string
  updated_at: string
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userMoneyFlow, setUserMoneyFlow] = useState<MoneyFlowSummary | null>(null)
  const [newQuote, setNewQuote] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "failed">("checking")
  const router = useRouter()
  const [userGoals, setUserGoals] = useState<FinancialGoal[]>([])
  const [goalsLoading, setGoalsLoading] = useState(false)
  const [userTransactions, setUserTransactions] = useState<any[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      // Check admin session from localStorage
      const adminSession = localStorage.getItem("admin_session")
      if (!adminSession) {
        router.push("/admin")
        return
      }

      const session = JSON.parse(adminSession)
      if (!session.isAdmin || session.email !== "prukman54@gmail.com") {
        router.push("/admin")
        return
      }

      // Check if session is still valid (24 hours)
      const sessionAge = Date.now() - session.loginTime
      if (sessionAge > 24 * 60 * 60 * 1000) {
        localStorage.removeItem("admin_session")
        router.push("/admin")
        return
      }

      setIsAuthorized(true)

      // Test connection first
      const connectionTest = await testSupabaseConnection()
      if (connectionTest) {
        setConnectionStatus("connected")
        await loadDataWithRetry()
      } else {
        setConnectionStatus("failed")
        setError("Database connection failed. Please check your Supabase configuration.")
      }
    } catch (err) {
      console.error("Auth check failed:", err)
      setConnectionStatus("failed")
      setError("Failed to initialize admin dashboard")
    } finally {
      setLoading(false)
    }
  }

  const loadDataWithRetry = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`🔄 Loading data attempt ${i + 1}...`)
        await Promise.all([loadUsers(), loadQuotes()])
        setError("") // Clear any previous errors
        console.log("✅ Data loaded successfully")
        break
      } catch (err: any) {
        console.error(`❌ Data load attempt ${i + 1} failed:`, err)
        if (i === retries - 1) {
          setError(`Failed to load data after ${retries} attempts: ${err.message}`)
        }
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  }

  const loadUsers = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error("Database connection not available")
    }

    console.log("📊 Loading users from database...")

    // Make sure to select the user_id (auth ID) field
    const { data, error, count } = await supabase
      .from("users")
      .select("id, user_id, name, email, phone, country, created_at", { count: "exact" })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Users query error:", error)
      throw new Error(`Users query failed: ${error.message}`)
    }

    console.log(`✅ Users query successful. Found ${count} users:`, data)
    setUsers(data || [])
  }

  const loadQuotes = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error("Database connection not available")
    }

    console.log("💬 Loading quotes from database...")

    const { data, error, count } = await supabase
      .from("quotes")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Quotes query error:", error)
      throw new Error(`Quotes query failed: ${error.message}`)
    }

    console.log(`✅ Quotes query successful. Found ${count} quotes:`, data)
    setQuotes(data || [])
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setError("")
    try {
      // Test connection again
      const connectionTest = await testSupabaseConnection()
      if (connectionTest) {
        setConnectionStatus("connected")
        await loadDataWithRetry()
        setSuccess("Data refreshed successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setConnectionStatus("failed")
        setError("Database connection test failed")
      }
    } catch (err: any) {
      setError(`Failed to refresh data: ${err.message}`)
    } finally {
      setRefreshing(false)
    }
  }

  const loadUserMoneyFlow = async (authUserId: string) => {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error("Database not available")

      console.log("💰 [ADMIN] Loading money flow for auth user ID:", authUserId)

      // Query money_flow directly using the auth user ID
      const { data, error } = await supabase.from("money_flow").select("type, amount").eq("user_id", authUserId)

      if (error) {
        console.error("Money flow query error:", error)
        throw error
      }

      console.log("Money flow data found:", data?.length || 0, "records")

      const income = data?.filter((r) => r.type === "income").reduce((sum, r) => sum + r.amount, 0) || 0
      const expenses = data?.filter((r) => r.type === "expense").reduce((sum, r) => sum + r.amount, 0) || 0

      setUserMoneyFlow({
        user_id: authUserId,
        total_income: income,
        total_expenses: expenses,
        net_savings: income - expenses,
        transaction_count: data?.length || 0,
      })
    } catch (err) {
      console.error("Failed to load user money flow:", err)
      setUserMoneyFlow({
        user_id: authUserId,
        total_income: 0,
        total_expenses: 0,
        net_savings: 0,
        transaction_count: 0,
      })
    }
  }

  const loadUserGoals = async (authUserId: string) => {
    setGoalsLoading(true)
    try {
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error("Database not available")

      console.log("🎯 [ADMIN] Loading goals for auth user ID:", authUserId)

      // Query financial_goals directly using the auth user ID - FIXED QUERY
      const { data: goalsData, error: goalsError } = await supabase
        .from("financial_goals")
        .select("*")
        .eq("user_id", authUserId)
        .order("created_at", { ascending: false })

      if (goalsError) {
        console.error("❌ [ADMIN] Goals query failed:", goalsError)
        // Don't throw error, just log it and show empty goals
        console.log("🔍 [ADMIN] Trying alternative query...")

        // Try alternative query in case of RLS issues
        const { data: altData, error: altError } = await supabase
          .from("financial_goals")
          .select("*")
          .order("created_at", { ascending: false })

        if (altError) {
          console.error("❌ [ADMIN] Alternative query also failed:", altError)
          setUserGoals([])
          return
        }

        // Filter client-side if RLS is blocking
        const filteredGoals = altData?.filter((goal) => goal.user_id === authUserId) || []
        console.log(`✅ [ADMIN] Alternative query found ${filteredGoals.length} goals for user`)
        setUserGoals(filteredGoals)
        return
      }

      console.log(`✅ [ADMIN] Found ${goalsData?.length || 0} goals for user`)
      setUserGoals(goalsData || [])
    } catch (err) {
      console.error("❌ [ADMIN] Failed to load user goals:", err)
      setUserGoals([])
    } finally {
      setGoalsLoading(false)
    }
  }

  const loadUserTransactions = async (authUserId: string) => {
    setTransactionsLoading(true)
    try {
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error("Database not available")

      console.log("💳 [ADMIN] Loading transactions for auth user ID:", authUserId)

      // Query money_flow directly using the auth user ID
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("money_flow")
        .select("*")
        .eq("user_id", authUserId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })

      if (transactionsError) {
        console.error("❌ [ADMIN] Transactions query failed:", transactionsError)
        setUserTransactions([])
        return
      }

      console.log(`✅ [ADMIN] Found ${transactionsData?.length || 0} transactions for user`)
      setUserTransactions(transactionsData || [])
    } catch (err) {
      console.error("❌ [ADMIN] Failed to load user transactions:", err)
      setUserTransactions([])
    } finally {
      setTransactionsLoading(false)
    }
  }

  const handleViewUserFlow = (user: User) => {
    setSelectedUser(user)
    setUserGoals([]) // Clear previous goals
    setUserTransactions([]) // Clear previous transactions

    // Track admin action
    trackAdmin.viewUserData(user.user_id)

    // Pass the auth_user_id from the user object
    loadUserMoneyFlow(user.user_id) // Use auth_user_id
    loadUserGoals(user.user_id) // Use auth_user_id
    loadUserTransactions(user.user_id) // Use auth_user_id
  }

  const handleAddQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!newQuote.trim()) {
      setError("Please enter a quote")
      return
    }

    try {
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error("Database not available")

      console.log("➕ Adding new quote:", newQuote)

      const { data, error } = await supabase.from("quotes").insert({ quote: newQuote.trim() }).select()

      if (error) {
        console.error("❌ Add quote error:", error)
        throw error
      }

      console.log("✅ Quote added successfully:", data)
      setSuccess("Quote added successfully!")
      setNewQuote("")
      await loadQuotes()

      trackAdmin.addQuote()
    } catch (err: any) {
      console.error("❌ Failed to add quote:", err)
      setError(`Failed to add quote: ${err.message}`)
    }
  }

  const handleDeleteQuote = async (id: number) => {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error("Database not available")

      console.log("🗑️ Deleting quote with ID:", id)

      const { error } = await supabase.from("quotes").delete().eq("id", id)

      if (error) {
        console.error("❌ Delete quote error:", error)
        throw error
      }

      console.log("✅ Quote deleted successfully")
      setSuccess("Quote deleted successfully!")
      await loadQuotes()

      trackAdmin.deleteQuote()
    } catch (err: any) {
      console.error("❌ Failed to delete quote:", err)
      setError(`Failed to delete quote: ${err.message}`)
    }
  }

  const handleLogout = async () => {
    try {
      localStorage.removeItem("admin_session")
      router.push("/admin")
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Redirecting to admin login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-destructive" />
              <h1 className="text-2xl font-bold text-gradient">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-border hover:bg-muted"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <ThemeToggle />
              <span className="text-sm text-muted-foreground">prukman54@gmail.com</span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-border hover:bg-muted">
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-2">
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 mb-6">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Connection Status Alert */}
        {connectionStatus === "failed" && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Database connection failed. Please check your Supabase configuration and run the setup scripts.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-card-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-card-foreground">Total Quotes</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quotes.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-card-foreground">Database Status</CardTitle>
              <div
                className={`h-3 w-3 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "failed"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {connectionStatus === "connected"
                  ? "Connected"
                  : connectionStatus === "failed"
                    ? "Disconnected"
                    : "Checking..."}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users Management</span>
            </TabsTrigger>
            <TabsTrigger value="quotes" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Quote Manager</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Registered Users</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage all registered users and view their financial data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No users found. Users will appear here after they sign up.</p>
                    {connectionStatus === "failed" && (
                      <p className="text-red-500 text-sm mt-2">
                        Database connection issue - please check your Supabase setup.
                      </p>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>{COUNTRIES.find((c) => c.code === user.country)?.name || user.country}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => handleViewUserFlow(user)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Financial Overview
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{selectedUser?.name}'s Financial Overview</DialogTitle>
                                  <DialogDescription>
                                    Complete financial summary for {selectedUser?.email}
                                  </DialogDescription>
                                </DialogHeader>
                                {userMoneyFlow && selectedUser && (
                                  <div className="space-y-6">
                                    {/* Money Flow Summary */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3">Money Flow Summary</h3>
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="bg-green-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">Total Income</p>
                                            <p className="text-lg font-bold text-green-600">
                                              {getCurrencySymbol(selectedUser.country)}
                                              {userMoneyFlow.total_income.toLocaleString()}
                                            </p>
                                          </div>
                                          <div className="bg-red-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">Total Expenses</p>
                                            <p className="text-lg font-bold text-red-600">
                                              {getCurrencySymbol(selectedUser.country)}
                                              {userMoneyFlow.total_expenses.toLocaleString()}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                          <p className="text-sm text-gray-600">Net Savings</p>
                                          <p
                                            className={`text-xl font-bold ${userMoneyFlow.net_savings >= 0 ? "text-blue-600" : "text-red-600"}`}
                                          >
                                            {getCurrencySymbol(selectedUser.country)}
                                            {userMoneyFlow.net_savings.toLocaleString()}
                                          </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                          <p className="text-sm text-gray-600">Total Transactions</p>
                                          <p className="text-lg font-semibold">{userMoneyFlow.transaction_count}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Financial Goals */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3">
                                        Financial Goals {goalsLoading ? "(Loading...)" : `(${userGoals.length})`}
                                      </h3>
                                      {goalsLoading ? (
                                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                          <p className="text-gray-500">Loading goals...</p>
                                        </div>
                                      ) : userGoals.length === 0 ? (
                                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                                          <p className="text-gray-500">No financial goals set yet</p>
                                          <p className="text-xs text-gray-400 mt-1">
                                            User hasn't created any goals or there's a database issue
                                          </p>
                                          <p className="text-xs text-gray-400 mt-1">
                                            Check browser console for detailed debugging info
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="space-y-3">
                                          {userGoals.map((goal) => {
                                            const progress =
                                              goal.target_amount > 0
                                                ? (goal.current_amount / goal.target_amount) * 100
                                                : 0
                                            return (
                                              <div key={goal.id} className="bg-white border rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                  <div className="flex items-center space-x-2">
                                                    <h4 className="font-medium">{goal.name}</h4>
                                                    {goal.is_achieved && <span className="text-green-600">✅</span>}
                                                  </div>
                                                  <span className="text-sm text-gray-500">
                                                    {Math.round(progress)}% complete
                                                  </span>
                                                </div>
                                                <div className="space-y-2">
                                                  <div className="flex justify-between text-sm">
                                                    <span>
                                                      Current: {getCurrencySymbol(selectedUser.country)}
                                                      {goal.current_amount.toLocaleString()}
                                                    </span>
                                                    <span>
                                                      Target: {getCurrencySymbol(selectedUser.country)}
                                                      {goal.target_amount.toLocaleString()}
                                                    </span>
                                                  </div>
                                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                      className={`h-2 rounded-full transition-all duration-300 ${
                                                        goal.is_achieved ? "bg-green-500" : "bg-blue-500"
                                                      }`}
                                                      style={{ width: `${Math.min(progress, 100)}%` }}
                                                    />
                                                  </div>
                                                  <p className="text-xs text-gray-500">
                                                    Created: {new Date(goal.created_at).toLocaleDateString()}
                                                  </p>
                                                </div>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )}
                                    </div>

                                    {/* Transaction Details */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3">
                                        Transaction History{" "}
                                        {transactionsLoading ? "(Loading...)" : `(${userTransactions.length})`}
                                      </h3>
                                      {transactionsLoading ? (
                                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                          <p className="text-gray-500">Loading transactions...</p>
                                        </div>
                                      ) : userTransactions.length === 0 ? (
                                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                                          <p className="text-gray-500">No transactions found</p>
                                          <p className="text-xs text-gray-400 mt-1">
                                            User hasn't added any income or expense records yet
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                          <div className="grid grid-cols-5 gap-2 text-xs font-medium text-gray-500 border-b pb-2">
                                            <div>Date</div>
                                            <div>Type</div>
                                            <div>Category</div>
                                            <div>Amount</div>
                                            <div>Description</div>
                                          </div>
                                          {userTransactions.map((transaction) => (
                                            <div
                                              key={transaction.id}
                                              className="grid grid-cols-5 gap-2 text-sm py-2 border-b border-gray-100 hover:bg-gray-50"
                                            >
                                              <div className="text-gray-600">
                                                {new Date(transaction.date).toLocaleDateString()}
                                              </div>
                                              <div>
                                                <span
                                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    transaction.type === "income"
                                                      ? "bg-green-100 text-green-800"
                                                      : "bg-red-100 text-red-800"
                                                  }`}
                                                >
                                                  {transaction.type === "income" ? "💰" : "💸"} {transaction.type}
                                                </span>
                                              </div>
                                              <div className="text-gray-600 capitalize">{transaction.category}</div>
                                              <div
                                                className={`font-medium ${
                                                  transaction.type === "income" ? "text-green-600" : "text-red-600"
                                                }`}
                                              >
                                                {getCurrencySymbol(selectedUser.country)}
                                                {transaction.amount.toLocaleString()}
                                              </div>
                                              <div
                                                className="text-gray-500 text-xs truncate"
                                                title={transaction.description || "No description"}
                                              >
                                                {transaction.description || "—"}
                                              </div>
                                            </div>
                                          ))}

                                          {/* Transaction Summary */}
                                          <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                              <div className="text-center">
                                                <p className="text-gray-500">Total Transactions</p>
                                                <p className="font-semibold">{userTransactions.length}</p>
                                              </div>
                                              <div className="text-center">
                                                <p className="text-gray-500">Income Records</p>
                                                <p className="font-semibold text-green-600">
                                                  {userTransactions.filter((t) => t.type === "income").length}
                                                </p>
                                              </div>
                                              <div className="text-center">
                                                <p className="text-gray-500">Expense Records</p>
                                                <p className="font-semibold text-red-600">
                                                  {userTransactions.filter((t) => t.type === "expense").length}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quote Manager */}
          <TabsContent value="quotes">
            <div className="space-y-6">
              {/* Add Quote Form */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Add New Quote</span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Add inspirational quotes for users to see on their dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddQuote} className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter an inspirational quote..."
                        value={newQuote}
                        onChange={(e) => setNewQuote(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={connectionStatus !== "connected"}>
                      Add Quote
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Quotes List */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">All Quotes ({quotes.length})</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Manage existing quotes displayed to users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quotes.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No quotes available. Add your first quote above!</p>
                        {connectionStatus === "failed" && (
                          <p className="text-red-500 text-sm mt-2">
                            Database connection issue - please check your Supabase setup.
                          </p>
                        )}
                      </div>
                    ) : (
                      quotes.map((quote) => (
                        <div key={quote.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-gray-900 italic">"{quote.quote}"</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Added on {new Date(quote.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteQuote(quote.id)}
                            className="ml-4 text-red-600 hover:text-red-700"
                            disabled={connectionStatus !== "connected"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
