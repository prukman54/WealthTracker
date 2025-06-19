"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AnalyticsChecker } from "@/components/analytics-checker"
import { trackEvent, trackAuth, trackFinancial, trackCalculator, trackUI } from "@/lib/analytics"
import { ArrowLeft, TestTube } from "lucide-react"
import Link from "next/link"

export default function AnalyticsTestPage() {
  const [customEvent, setCustomEvent] = useState({
    action: "",
    category: "",
    label: "",
    value: "",
  })
  const [eventsSent, setEventsSent] = useState<string[]>([])

  const sendCustomEvent = () => {
    if (customEvent.action && customEvent.category) {
      trackEvent(
        customEvent.action,
        customEvent.category,
        customEvent.label || undefined,
        customEvent.value ? Number(customEvent.value) : undefined,
      )

      const eventDescription = `${customEvent.action} (${customEvent.category})`
      setEventsSent((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${eventDescription}`])

      // Reset form
      setCustomEvent({ action: "", category: "", label: "", value: "" })
    }
  }

  const testPredefinedEvents = () => {
    const events = [
      { name: "Auth - Test Login", fn: () => trackAuth.login() },
      { name: "Financial - Test Transaction", fn: () => trackFinancial.addTransaction("income", 1000) },
      { name: "Calculator - Test Compound Interest", fn: () => trackCalculator.compoundInterest(5000) },
      { name: "UI - Test Theme Toggle", fn: () => trackUI.themeToggle("dark") },
    ]

    events.forEach((event, index) => {
      setTimeout(() => {
        event.fn()
        setEventsSent((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${event.name}`])
      }, index * 500)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <TestTube className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Analytics Testing</h1>
            </div>
          </div>
          <p className="text-gray-600">
            Test and verify that Google Analytics is working properly in your WealthTracker application.
          </p>
        </div>

        <div className="space-y-8">
          {/* Analytics Setup Checker */}
          <AnalyticsChecker />

          {/* Manual Event Testing */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Event Testing</CardTitle>
              <CardDescription>Send custom events to test the analytics integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="action">Event Action</Label>
                  <Input
                    id="action"
                    value={customEvent.action}
                    onChange={(e) => setCustomEvent({ ...customEvent, action: e.target.value })}
                    placeholder="e.g., button_click"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Event Category</Label>
                  <Input
                    id="category"
                    value={customEvent.category}
                    onChange={(e) => setCustomEvent({ ...customEvent, category: e.target.value })}
                    placeholder="e.g., user_interaction"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Event Label (Optional)</Label>
                  <Input
                    id="label"
                    value={customEvent.label}
                    onChange={(e) => setCustomEvent({ ...customEvent, label: e.target.value })}
                    placeholder="e.g., header_navigation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Event Value (Optional)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={customEvent.value}
                    onChange={(e) => setCustomEvent({ ...customEvent, value: e.target.value })}
                    placeholder="e.g., 100"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={sendCustomEvent} disabled={!customEvent.action || !customEvent.category}>
                  Send Custom Event
                </Button>
                <Button onClick={testPredefinedEvents} variant="outline">
                  Test All Predefined Events
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Event Log */}
          {eventsSent.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Events Sent</CardTitle>
                <CardDescription>Log of analytics events sent during this session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {eventsSent.map((event, index) => (
                    <div key={index} className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                      ✅ {event}
                    </div>
                  ))}
                </div>
                <Button onClick={() => setEventsSent([])} variant="outline" size="sm" className="mt-3">
                  Clear Log
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Setup Verification Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Checklist</CardTitle>
              <CardDescription>Steps to verify your Google Analytics setup is working</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert>
                  <AlertDescription>
                    <strong>1. Real-time Reports:</strong> Go to your Google Analytics dashboard → Reports → Realtime →
                    Overview. You should see active users when testing events.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertDescription>
                    <strong>2. DebugView (Recommended):</strong> In GA4, go to Configure → DebugView to see events in
                    real-time with detailed information.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertDescription>
                    <strong>3. Browser Console:</strong> Open browser dev tools and check for any GA-related errors in
                    the console.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertDescription>
                    <strong>4. Network Tab:</strong> In dev tools Network tab, look for requests to
                    "google-analytics.com" or "googletagmanager.com" when events are sent.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle>Common Issues & Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded">
                  <h4 className="font-medium text-red-600">Issue: gtag is not defined</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Solution: Ensure the Google Analytics script is loaded before any tracking calls. Check that the
                    Script component in layout.tsx is properly configured.
                  </p>
                </div>

                <div className="p-3 border border-gray-200 rounded">
                  <h4 className="font-medium text-red-600">Issue: Events not showing in GA</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Solution: Check your GA4 property ID (G-M3QEL36KRT) is correct. Events may take a few minutes to
                    appear in reports.
                  </p>
                </div>

                <div className="p-3 border border-gray-200 rounded">
                  <h4 className="font-medium text-red-600">Issue: Ad blockers blocking GA</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Solution: Test with ad blockers disabled. Consider using a privacy-friendly analytics alternative if
                    this affects many users.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
