"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AuthGuard from "@/components/auth-guard"
import { signOut } from "@/lib/auth"
import { TrendingUp, ArrowLeft, LogOut, Calculator, PieChart } from "lucide-react"

export default function InvestingToolsPage() {
  const [compoundResult, setCompoundResult] = useState<number | null>(null)
  const [rule72Result, setRule72Result] = useState<number | null>(null)
  const [mortgageResult, setMortgageResult] = useState<{ monthly: number; total: number; interest: number } | null>(
    null,
  )

  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = "https://rukman.com.np"
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  const calculateCompoundInterest = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const principal = Number.parseFloat(formData.get("principal") as string)
    const rate = Number.parseFloat(formData.get("rate") as string) / 100
    const time = Number.parseFloat(formData.get("time") as string)
    const compound = Number.parseFloat(formData.get("compound") as string)

    const result = principal * Math.pow(1 + rate / compound, compound * time)
    setCompoundResult(result)
  }

  const calculateRule72 = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const rate = Number.parseFloat(formData.get("rate") as string)

    const result = 72 / rate
    setRule72Result(result)
  }

  const calculateMortgage = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const principal = Number.parseFloat(formData.get("principal") as string)
    const rate = Number.parseFloat(formData.get("rate") as string) / 100 / 12
    const years = Number.parseFloat(formData.get("years") as string)
    const payments = years * 12

    const monthly = (principal * rate * Math.pow(1 + rate, payments)) / (Math.pow(1 + rate, payments) - 1)
    const total = monthly * payments
    const interest = total - principal

    setMortgageResult({ monthly, total, interest })
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
                  <h1 className="text-2xl font-bold text-gray-900">Investing Tools</h1>
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
          <Tabs defaultValue="compound" className="space-y-6">
            <TabsList className="grid grid-cols-3 lg:grid-cols-9 w-full">
              <TabsTrigger value="compound">Compound Interest</TabsTrigger>
              <TabsTrigger value="rule72">Rule of 72</TabsTrigger>
              <TabsTrigger value="inflation">Inflation vs Returns</TabsTrigger>
              <TabsTrigger value="dcf">DCF Calculator</TabsTrigger>
              <TabsTrigger value="sharpe">Sharpe Ratio</TabsTrigger>
              <TabsTrigger value="dividend">Dividend Yield</TabsTrigger>
              <TabsTrigger value="pe">P/E Ratio</TabsTrigger>
              <TabsTrigger value="irr">IRR Calculator</TabsTrigger>
              <TabsTrigger value="mortgage">Mortgage Calculator</TabsTrigger>
            </TabsList>

            {/* Compound Interest Calculator */}
            <TabsContent value="compound">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5" />
                    <span>Compound Interest Calculator</span>
                  </CardTitle>
                  <CardDescription>
                    Calculate how your investment grows over time with compound interest
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <form onSubmit={calculateCompoundInterest} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="principal">Initial Investment ($)</Label>
                        <Input id="principal" name="principal" type="number" step="0.01" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                        <Input id="rate" name="rate" type="number" step="0.01" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Time Period (Years)</Label>
                        <Input id="time" name="time" type="number" step="0.1" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="compound">Compounding Frequency (per year)</Label>
                        <Input id="compound" name="compound" type="number" defaultValue="12" required />
                      </div>
                      <Button type="submit" className="w-full">
                        Calculate
                      </Button>
                    </form>

                    {compoundResult && (
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">Result</h3>
                        <p className="text-2xl font-bold text-blue-600">
                          $
                          {compoundResult.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Your investment will grow to this amount with compound interest.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rule of 72 */}
            <TabsContent value="rule72">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Rule of 72</span>
                  </CardTitle>
                  <CardDescription>Estimate how long it takes for your investment to double</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <form onSubmit={calculateRule72} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="rate">Annual Return Rate (%)</Label>
                        <Input id="rate" name="rate" type="number" step="0.01" required />
                      </div>
                      <Button type="submit" className="w-full">
                        Calculate
                      </Button>
                    </form>

                    {rule72Result && (
                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">Result</h3>
                        <p className="text-2xl font-bold text-green-600">{rule72Result.toFixed(1)} years</p>
                        <p className="text-sm text-gray-600 mt-2">
                          Time needed for your investment to double at this rate.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mortgage Calculator */}
            <TabsContent value="mortgage">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Mortgage Calculator</span>
                  </CardTitle>
                  <CardDescription>Calculate your monthly mortgage payments and total interest</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <form onSubmit={calculateMortgage} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="principal">Loan Amount ($)</Label>
                        <Input id="principal" name="principal" type="number" step="0.01" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                        <Input id="rate" name="rate" type="number" step="0.01" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="years">Loan Term (Years)</Label>
                        <Input id="years" name="years" type="number" defaultValue="30" required />
                      </div>
                      <Button type="submit" className="w-full">
                        Calculate
                      </Button>
                    </form>

                    {mortgageResult && (
                      <div className="bg-purple-50 p-6 rounded-lg space-y-3">
                        <h3 className="font-semibold text-lg mb-2">Results</h3>
                        <div>
                          <p className="text-sm text-gray-600">Monthly Payment</p>
                          <p className="text-xl font-bold text-purple-600">
                            $
                            {mortgageResult.monthly.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Amount Paid</p>
                          <p className="text-lg font-semibold">
                            $
                            {mortgageResult.total.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Interest</p>
                          <p className="text-lg font-semibold text-red-600">
                            $
                            {mortgageResult.interest.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Placeholder tabs for other tools */}
            <TabsContent value="inflation">
              <Card>
                <CardHeader>
                  <CardTitle>Inflation vs Returns Calculator</CardTitle>
                  <CardDescription>Compare your investment returns against inflation</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    This tool is coming soon. It will help you understand the real value of your returns after
                    accounting for inflation.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dcf">
              <Card>
                <CardHeader>
                  <CardTitle>Discounted Cash Flow (DCF) Calculator</CardTitle>
                  <CardDescription>Value investments based on future cash flows</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    This advanced valuation tool is coming soon. It will help you determine the intrinsic value of
                    investments.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sharpe">
              <Card>
                <CardHeader>
                  <CardTitle>Sharpe Ratio Calculator</CardTitle>
                  <CardDescription>Measure risk-adjusted returns</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    This tool is coming soon. It will help you evaluate the risk-adjusted performance of your
                    investments.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dividend">
              <Card>
                <CardHeader>
                  <CardTitle>Dividend Yield & Growth Calculator</CardTitle>
                  <CardDescription>Analyze dividend-paying investments</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    This tool is coming soon. It will help you analyze dividend yields and growth potential.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pe">
              <Card>
                <CardHeader>
                  <CardTitle>P/E Ratio Calculator</CardTitle>
                  <CardDescription>Evaluate stock valuations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    This tool is coming soon. It will help you analyze price-to-earnings ratios for stock valuation.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="irr">
              <Card>
                <CardHeader>
                  <CardTitle>Internal Rate of Return (IRR) Calculator</CardTitle>
                  <CardDescription>Calculate the profitability of investments</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    This advanced tool is coming soon. It will help you calculate the internal rate of return for
                    complex investments.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  )
}
