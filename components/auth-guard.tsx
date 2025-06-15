"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, isAdmin } from "@/lib/auth"
import type { User } from "@supabase/supabase-js"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
}

export default function AuthGuard({
  children,
  requireAuth = false,
  requireAdmin = false,
  redirectTo = "/",
}: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        if (requireAuth && !currentUser) {
          router.push("/auth/login")
          return
        }

        if (requireAdmin && (!currentUser || !isAdmin(currentUser.email))) {
          router.push(redirectTo)
          return
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        if (requireAuth || requireAdmin) {
          router.push("/auth/login")
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [requireAuth, requireAdmin, redirectTo, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null
  }

  if (requireAdmin && (!user || !isAdmin(user.email))) {
    return null
  }

  return <>{children}</>
}
