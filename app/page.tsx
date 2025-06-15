import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { TrendingUp, Shield, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-gradient">WealthTracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-primary hover:bg-primary/90 text-white">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl font-bold text-gradient mb-6">Welcome to Your Financial Future</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Take control of your finances with our comprehensive wealth tracking and investment tools. Monitor your
            money flow, analyze investments, and build lasting wealth.
          </p>
          <div className="space-x-4">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8 py-3 bg-primary hover:bg-primary/90 text-white">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="px-8 py-3 border-primary/20 hover:bg-primary/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="card-hover bg-card border-border">
            <CardContent className="pt-6 text-center">
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Money Flow Tracking</h3>
              <p className="text-muted-foreground">
                Track your income and expenses with detailed categorization and insights.
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover bg-card border-border">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Investment Tools</h3>
              <p className="text-muted-foreground">
                Access powerful calculators and tools to optimize your investment strategy.
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover bg-card border-border">
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your financial data is encrypted and stored securely with bank-level security.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-card rounded-2xl shadow-xl p-8 text-center border border-border">
          <h3 className="text-3xl font-bold text-card-foreground mb-4">Ready to Transform Your Financial Life?</h3>
          <p className="text-lg text-muted-foreground mb-6">
            Join thousands of users who are already building wealth with WealthTracker.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="px-12 py-4 text-lg bg-primary hover:bg-primary/90 text-white">
              Start Your Journey Today
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-border">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 WealthTracker by Rukman. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
