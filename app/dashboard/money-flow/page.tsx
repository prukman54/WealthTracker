"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AuthGuard from "@/components/auth-guard"
import { getCurrentUser, signOut } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { getCurrencySymbol, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/constants"
import { TrendingUp, ArrowLeft, LogOut, Plus, DollarSign, TrendingDown, Wallet } from "lucide-react"

// Add analytics import at the top
import { trackFinancial, trackAuth } from "@/lib/analytics"

interface MoneyFlowRecord {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  date: string
  description: string | null
  created_at: string
}

interface UserProfile {
  country: string
}

export default function MoneyFlowPage() {
  const [records, setRecords] = useState<MoneyFlowRecord[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    type: "income" as "income" | "expense",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadUserProfile()
    loadRecords()
  }, [])

  const loadUserProfile = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { data, error } = await supabase.from("users").select("country").eq("user_id", user.id).single()

      if (error) throw error
      setUserProfile(data)
    } catch (err) {
      console.error("Failed to load profile:", err)
    }
  }

  const loadRecords = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { data, error } = await supabase
        .from("money_flow")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (err: any) {
      setError("Failed to load records")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSaving(true)

    try {
      const user = await getCurrentUser()
      if (!user) return

      const { error } = await supabase.from("money_flow").insert({
        user_id: user.id,
        type: formData.type,
        amount: Number.parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        description: formData.description || null,
      })

      if (error) throw error

      setSuccess("Record added successfully!")
      setFormData({
        type: "income",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
      })
      loadRecords()

      // In the handleSubmit function, after successful record addition, add:
      trackFinancial.addTransaction(formData.type, Number.parseFloat(formData.amount))
    } catch (err: any) {
      setError(err.message || "Failed to add record")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      // In the handleLogout function, before signOut(), add:
      trackAuth.logout()
      await signOut()
      window.location.href = "https://rukman.com.np"
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  const calculateTotals = () => {
    const income = records.filter((r) => r.type === "income").reduce((sum, r) => sum + r.amount, 0)

    const expenses = records.filter((r) => r.type === "expense").reduce((sum, r) => sum + r.amount, 0)

    return { income, expenses, savings: income - expenses }
  }

  const currencySymbol = userProfile ? getCurrencySymbol(userProfile.country) : "$"
  const totals = calculateTotals()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AuthGuard requireAuth>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">Money Flow Tracker</h1>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {currencySymbol}
                  {totals.income.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {currencySymbol}
                  {totals.expenses.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
                <Wallet className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totals.savings >= 0 ? "text-blue-600" : "text-red-600"}`}>
                  {currencySymbol}
                  {totals.savings.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Add Record Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add New Record</span>
                </CardTitle>
                <CardDescription>Track your income and expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}

                  <Tabs
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value as "income" | "expense", category: "" })
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="income">Income</TabsTrigger>
                      <TabsTrigger value="expense">Expense</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ({currencySymbol})</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(formData.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Add a note about this transaction..."
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? "Adding..." : "Add Record"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Recent Records */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Records</CardTitle>
                <CardDescription>Your latest financial transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {records.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No records yet. Add your first transaction!</p>
                  ) : (
                    records.slice(0, 10).map((record) => (
                      <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                record.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {record.type}
                            </span>
                            <span className="font-medium">{record.category}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {record.date} {record.description && `• ${record.description}`}
                          </p>
                        </div>
                        <div className={`font-bold ${record.type === "income" ? "text-green-600" : "text-red-600"}`}>
                          {record.type === "income" ? "+" : "-"}
                          {currencySymbol}
                          {record.amount.toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
