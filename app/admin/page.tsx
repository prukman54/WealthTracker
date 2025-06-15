"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const ADMIN_EMAIL = "prukman54@gmail.com"
const ADMIN_PASSWORD = "$$1M_BTC$$"

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Check hardcoded admin credentials
      if (formData.email !== ADMIN_EMAIL || formData.password !== ADMIN_PASSWORD) {
        setError("Invalid admin credentials")
        setLoading(false)
        return
      }

      // Store admin session in localStorage for client-side auth
      localStorage.setItem(
        "admin_session",
        JSON.stringify({
          email: ADMIN_EMAIL,
          loginTime: Date.now(),
          isAdmin: true,
        }),
      )

      // Redirect to admin dashboard
      router.push("/admin/dashboard")
    } catch (err: any) {
      setError("Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-destructive" />
            <span className="text-2xl font-bold text-gradient">Admin Portal</span>
          </div>
          <CardTitle className="text-card-foreground">Administrator Login</CardTitle>
          <CardDescription className="text-muted-foreground">
            Restricted access for authorized administrators only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground">
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-input border-border text-card-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-card-foreground">
                Admin Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-input border-border text-card-foreground"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-destructive hover:bg-destructive/90 text-white"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Access Admin Panel"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Authorized personnel only. All access is logged and monitored.
            </p>
            <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground">
              <p>
                <strong>Admin Credentials:</strong>
              </p>
              <p>Email: p$$$$$$$$$m</p>
              <p>Password: $$$$$$$$$</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
