"use client"

import { useState, useEffect } from "react"

const wealthQuotes = [
  "The goal isn't more money. The goal is living life on your terms.",
  "Wealth consists not in having great possessions, but in having few wants.",
  "It's not how much money you make, but how much money you keep, how hard it works for you, and how many generations you keep it for.",
  "The rich invest in time, the poor invest in money.",
  "Financial freedom is available to those who learn about it and work for it.",
]

export default function Dashboard() {
  const [currentQuote, setCurrentQuote] = useState(wealthQuotes[0])

  useEffect(() => {
    const intervalId = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * wealthQuotes.length)
      setCurrentQuote(wealthQuotes[randomIndex])
    }, 10000) // Change quote every 10 seconds

    return () => clearInterval(intervalId) // Cleanup interval on unmount
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Wealth Quote</h2>
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border border-border">
          <p className="wealth-quote text-lg font-bold leading-relaxed">{currentQuote}</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Analytics</h2>
        {/* Placeholder for analytics components */}
        <p>Analytics data will be displayed here.</p>
      </section>
    </div>
  )
}
