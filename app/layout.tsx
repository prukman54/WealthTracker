import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"

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
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-M3QEL36KRT" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-M3QEL36KRT');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="light" storageKey="wealth-tracker-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
