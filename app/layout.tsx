import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Wealth Tracker by - Rukman",
  description: "Take control of your finances with comprehensive wealth tracking and investment tools",
  icons: {
    icon: "/image/lo.webp",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/image/lo.webp" type="image/x-icon" />
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="light" storageKey="wealth-tracker-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
