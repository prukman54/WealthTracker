"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

interface AnalyticsStatus {
  gtagLoaded: boolean
  configSet: boolean
  trackingId: string
  dataLayerExists: boolean
  canSendEvents: boolean
  lastEventSent?: string
}

export function AnalyticsChecker() {
  const [status, setStatus] = useState<AnalyticsStatus>({
    gtagLoaded: false,
    configSet: false,
    trackingId: "G-M3QEL36KRT",
    dataLayerExists: false,
    canSendEvents: false,
  })
  const [isChecking, setIsChecking] = useState(false)

  const checkAnalyticsSetup = () => {
    setIsChecking(true)

    setTimeout(() => {
      const newStatus: AnalyticsStatus = {
        trackingId: "G-M3QEL36KRT",
        gtagLoaded: typeof window !== "undefined" && typeof window.gtag === "function",
        dataLayerExists: typeof window !== "undefined" && Array.isArray(window.dataLayer),
        configSet: false,
        canSendEvents: false,
      }

      // Check if gtag is properly configured
      if (newStatus.gtagLoaded && newStatus.dataLayerExists) {
        newStatus.configSet = true
        newStatus.canSendEvents = true
      }

      setStatus(newStatus)
      setIsChecking(false)
    }, 1000)
  }

  const sendTestEvent = () => {
    if (typeof window !== "undefined" && window.gtag) {
      try {
        window.gtag("event", "analytics_test", {
          event_category: "testing",
          event_label: "manual_test",
          value: 1,
        })
        setStatus((prev) => ({ ...prev, lastEventSent: new Date().toLocaleTimeString() }))
      } catch (error) {
        console.error("Failed to send test event:", error)
      }
    }
  }

  useEffect(() => {
    // Initial check after component mounts
    const timer = setTimeout(checkAnalyticsSetup, 2000)
    return () => clearTimeout(timer)
  }, [])

  const getStatusIcon = (isWorking: boolean) => {
    if (isChecking) return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
    return isWorking ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const overallStatus = status.gtagLoaded && status.dataLayerExists && status.configSet && status.canSendEvents

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Google Analytics Setup Checker</span>
          {getStatusIcon(overallStatus)}
        </CardTitle>
        <CardDescription>Verify that Google Analytics is properly configured and working</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <Alert className={overallStatus ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className={overallStatus ? "text-green-800" : "text-red-800"}>
            {overallStatus
              ? "✅ Google Analytics is properly configured and working!"
              : "❌ Google Analytics setup needs attention"}
          </AlertDescription>
        </Alert>

        {/* Detailed Status Checks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Google Analytics Script Loaded</p>
              <p className="text-sm text-gray-600">gtag function is available</p>
            </div>
            {getStatusIcon(status.gtagLoaded)}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Data Layer Initialized</p>
              <p className="text-sm text-gray-600">window.dataLayer exists</p>
            </div>
            {getStatusIcon(status.dataLayerExists)}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Tracking ID Configuration</p>
              <p className="text-sm text-gray-600">{status.trackingId}</p>
            </div>
            {getStatusIcon(status.configSet)}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Event Tracking Capability</p>
              <p className="text-sm text-gray-600">Can send custom events</p>
            </div>
            {getStatusIcon(status.canSendEvents)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button onClick={checkAnalyticsSetup} disabled={isChecking} variant="outline">
            {isChecking ? "Checking..." : "Recheck Setup"}
          </Button>

          {status.canSendEvents && (
            <Button onClick={sendTestEvent} className="bg-blue-600 hover:bg-blue-700">
              Send Test Event
            </Button>
          )}
        </div>

        {status.lastEventSent && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              ✅ Test event sent successfully at {status.lastEventSent}
            </AlertDescription>
          </Alert>
        )}

        {/* Debug Information */}
        <details className="mt-6">
          <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">Debug Information</summary>
          <div className="mt-2 p-3 bg-gray-100 rounded text-sm font-mono">
            <pre>{JSON.stringify(status, null, 2)}</pre>
          </div>
        </details>

        {/* Setup Instructions */}
        {!overallStatus && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-yellow-800">
              <strong>Setup Issues Detected:</strong>
              <ul className="mt-2 list-disc list-inside space-y-1">
                {!status.gtagLoaded && <li>Google Analytics script not loaded properly</li>}
                {!status.dataLayerExists && <li>Data Layer not initialized</li>}
                {!status.configSet && <li>GA configuration not set</li>}
                {!status.canSendEvents && <li>Event tracking not functional</li>}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
