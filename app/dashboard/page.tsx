"use client"

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
import { TrendingUp, DollarSign, BarChart3, LogOut, User, RefreshCw, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

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

  useEffect(() => {
    loadUserProfile()
    loadRandomQuote()

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
        </main>
      </div>
    </AuthGuard>
  )
}
