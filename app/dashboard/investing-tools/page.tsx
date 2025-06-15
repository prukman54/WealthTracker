"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AuthGuard from "@/components/auth-guard"
import { signOut } from "@/lib/auth"
import { TrendingUp, ArrowLeft, LogOut, Calculator, PieChart } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { getCurrencySymbol } from "@/lib/constants"

export default function InvestingToolsPage() {
  const [compoundResult, setCompoundResult] = useState<number | null>(null)
  const [rule72Result, setRule72Result] = useState<number | null>(null)
  const [mortgageResult, setMortgageResult] = useState<{ monthly: number; total: number; interest: number } | null>(
    null,
  )
  const [userProfile, setUserProfile] = useState<{ country: string } | null>(null)
  const [currencySymbol, setCurrencySymbol] = useState("$")
  const [dcfResult, setDcfResult] = useState<number | null>(null)
  const [peRatioResult, setPeRatioResult] = useState<number | null>(null)
  const [inflationResult, setInflationResult] = useState<{ nominal: number; real: number; difference: number } | null>(
    null,
  )
  const [dividendYieldResult, setDividendYieldResult] = useState<number | null>(null)

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { data, error } = await supabase.from("users").select("country").eq("user_id", user.id).single()

      if (error) throw error
      setUserProfile(data)
      setCurrencySymbol(getCurrencySymbol(data.country))
    } catch (err) {
      console.error("Failed to load profile:", err)
      setCurrencySymbol("$") // fallback
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

  const calculateDCF = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const cashFlow = Number.parseFloat(formData.get("cashFlow") as string)
    const discountRate = Number.parseFloat(formData.get("discountRate") as string) / 100
    const growthRate = Number.parseFloat(formData.get("growthRate") as string) / 100
    const years = Number.parseFloat(formData.get("years") as string)

    let dcfValue = 0
    for (let year = 1; year <= years; year++) {
      const projectedCashFlow = cashFlow * Math.pow(1 + growthRate, year)
      const presentValue = projectedCashFlow / Math.pow(1 + discountRate, year)
      dcfValue += presentValue
    }

    setDcfResult(dcfValue)
  }

  const calculatePERatio = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const sharePrice = Number.parseFloat(formData.get("sharePrice") as string)
    const eps = Number.parseFloat(formData.get("eps") as string)

    const peRatio = sharePrice / eps
    setPeRatioResult(peRatio)
  }

  const calculateInflationImpact = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const investmentAmount = Number.parseFloat(formData.get("investmentAmount") as string)
    const expectedReturn = Number.parseFloat(formData.get("expectedReturn") as string) / 100
    const inflationRate = Number.parseFloat(formData.get("inflationRate") as string) / 100
    const years = Number.parseFloat(formData.get("inflationYears") as string)

    const nominalValue = investmentAmount * Math.pow(1 + expectedReturn, years)
    const realValue = nominalValue / Math.pow(1 + inflationRate, years)
    const difference = nominalValue - realValue

    setInflationResult({
      nominal: nominalValue,
      real: realValue,
      difference: difference,
    })
  }

  const calculateDividendYield = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const annualDividend = Number.parseFloat(formData.get("annualDividend") as string)
    const sharePrice = Number.parseFloat(formData.get("dividendSharePrice") as string)

    const dividendYield = (annualDividend / sharePrice) * 100
    setDividendYieldResult(dividendYield)
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
                    Calculate how your investment grows exponentially over time by reinvesting interest. This shows the
                    power of compound growth - earning returns on both your initial investment and previously earned
                    interest.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <form onSubmit={calculateCompoundInterest} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="principal">Initial Investment Amount ({currencySymbol})</Label>
                        <Input
                          id="principal"
                          name="principal"
                          type="number"
                          step="0.01"
                          placeholder="e.g., 10000"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                        <Input id="rate" name="rate" type="number" step="0.01" placeholder="e.g., 7.5" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Number of Years</Label>
                        <Input id="time" name="time" type="number" step="0.1" placeholder="e.g., 10" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="compound">Times Compounded per Year</Label>
                        <Input
                          id="compound"
                          name="compound"
                          type="number"
                          defaultValue="12"
                          placeholder="12 for monthly, 4 for quarterly"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Calculate Future Value
                      </Button>
                    </form>

                    {compoundResult && (
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">Future Value</h3>
                        <p className="text-2xl font-bold text-blue-600">
                          {currencySymbol}
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
                  <CardDescription>
                    A simple way to estimate how many years it takes to double your investment. Just divide 72 by your
                    annual rate of return. For example: 72 ÷ 8% = 9 years to double your money.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <form onSubmit={calculateRule72} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="rate">Annual Rate of Return (%)</Label>
                        <Input id="rate" name="rate" type="number" step="0.01" placeholder="e.g., 8.5" required />
                      </div>
                      <Button type="submit" className="w-full">
                        Calculate Doubling Time
                      </Button>
                    </form>

                    {rule72Result && (
                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">Time to Double</h3>
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
                        <Label htmlFor="principal">Loan Amount ({currencySymbol})</Label>
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
                            {currencySymbol}
                            {mortgageResult.monthly.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Amount Paid</p>
                          <p className="text-lg font-semibold">
                            {currencySymbol}
                            {mortgageResult.total.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Interest</p>
                          <p className="text-lg font-semibold text-red-600">
                            {currencySymbol}
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
                  <CardDescription>
                    Shows the real return on your investments after accounting for inflation. This helps you understand
                    your actual purchasing power growth over time.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <form onSubmit={calculateInflationImpact} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="investmentAmount">Investment Amount ({currencySymbol})</Label>
                        <Input
                          id="investmentAmount"
                          name="investmentAmount"
                          type="number"
                          step="0.01"
                          placeholder="e.g., 50000"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expectedReturn">Expected Annual Return (%)</Label>
                        <Input
                          id="expectedReturn"
                          name="expectedReturn"
                          type="number"
                          step="0.01"
                          placeholder="e.g., 10"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inflationRate">Expected Inflation Rate (%)</Label>
                        <Input
                          id="inflationRate"
                          name="inflationRate"
                          type="number"
                          step="0.01"
                          placeholder="e.g., 3"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inflationYears">Number of Years</Label>
                        <Input
                          id="inflationYears"
                          name="inflationYears"
                          type="number"
                          placeholder="e.g., 20"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Calculate Real Returns
                      </Button>
                    </form>

                    {inflationResult && (
                      <div className="bg-orange-50 p-6 rounded-lg space-y-3">
                        <h3 className="font-semibold text-lg mb-2">Results</h3>
                        <div>
                          <p className="text-sm text-gray-600">Nominal Value (Before Inflation)</p>
                          <p className="text-xl font-bold text-orange-600">
                            {currencySymbol}
                            {inflationResult.nominal.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Real Value (After Inflation)</p>
                          <p className="text-xl font-bold text-green-600">
                            {currencySymbol}
                            {inflationResult.real.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Purchasing Power Lost to Inflation</p>
                          <p className="text-lg font-semibold text-red-600">
                            {currencySymbol}
                            {inflationResult.difference.toLocaleString(undefined, {
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

            <TabsContent value="dcf">
              <Card>
                <CardHeader>
                  <CardTitle>Discounted Cash Flow (DCF) Calculator</CardTitle>
                  <CardDescription>
                    Estimates today's value of future cash flows to help decide if an asset is undervalued. This is a
                    fundamental valuation method used by investors to determine intrinsic value.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <form onSubmit={calculateDCF} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cashFlow">Expected Annual Cash Flow ({currencySymbol})</Label>
                        <Input
                          id="cashFlow"
                          name="cashFlow"
                          type="number"
                          step="0.01"
                          placeholder="e.g., 5000"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discountRate">Discount Rate (%)</Label>
                        <Input
                          id="discountRate"
                          name="discountRate"
                          type="number"
                          step="0.01"
                          placeholder="e.g., 10"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="growthRate">Cash Flow Growth Rate (%)</Label>
                        <Input
                          id="growthRate"
                          name="growthRate"
                          type="number"
                          step="0.01"
                          placeholder="e.g., 5"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="years">Number of Years</Label>
                        <Input id="years" name="years" type="number" placeholder="e.g., 10" required />
                      </div>
                      <Button type="submit" className="w-full">
                        Calculate Present Value
                      </Button>
                    </form>

                    {dcfResult && (
                      <div className="bg-purple-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">Present Value</h3>
                        <p className="text-2xl font-bold text-purple-600">
                          {currencySymbol}
                          {dcfResult.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          The estimated present value of all future cash flows.
                        </p>
                      </div>
                    )}
                  </div>
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
                  <CardTitle>Dividend Yield Calculator</CardTitle>
                  <CardDescription>
                    Shows dividend income as a percentage of the share price. Higher yields provide more passive income,
                    but very high yields might indicate company distress. Useful for income-focused investors.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <form onSubmit={calculateDividendYield} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="annualDividend">Annual Dividend Per Share ({currencySymbol})</Label>
                        <Input
                          id="annualDividend"
                          name="annualDividend"
                          type="number"
                          step="0.01"
                          placeholder="e.g., 4.50"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dividendSharePrice">Current Share Price ({currencySymbol})</Label>
                        <Input
                          id="dividendSharePrice"
                          name="dividendSharePrice"
                          type="number"
                          step="0.01"
                          placeholder="e.g., 75.00"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Calculate Dividend Yield
                      </Button>
                    </form>

                    {dividendYieldResult && (
                      <div className="bg-teal-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">Dividend Yield</h3>
                        <p className="text-2xl font-bold text-teal-600">{dividendYieldResult.toFixed(2)}%</p>
                        <p className="text-sm text-gray-600 mt-2">
                          Annual dividend income as a percentage of share price.
                        </p>
                        <div className="mt-3 text-xs text-gray-500">
                          <p>• Low Yield (0-2%): Growth-focused companies</p>
                          <p>• Medium Yield (2-4%): Balanced dividend stocks</p>
                          <p>• High Yield (4%+): Income-focused or potentially risky</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pe">
              <Card>
                <CardHeader>
                  <CardTitle>P/E Ratio Calculator</CardTitle>
                  <CardDescription>
                    Shows how much investors pay per dollar of earnings. A lower P/E might indicate undervaluation,
                    while a higher P/E might suggest growth expectations. Useful for comparing companies in the same
                    industry.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <form onSubmit={calculatePERatio} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="sharePrice">Current Share Price ({currencySymbol})</Label>
                        <Input
                          id="sharePrice"
                          name="sharePrice"
                          type="number"
                          step="0.01"
                          placeholder="e.g., 150.50"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="eps">Earnings Per Share - EPS ({currencySymbol})</Label>
                        <Input id="eps" name="eps" type="number" step="0.01" placeholder="e.g., 12.75" required />
                      </div>
                      <Button type="submit" className="w-full">
                        Calculate P/E Ratio
                      </Button>
                    </form>

                    {peRatioResult && (
                      <div className="bg-indigo-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">P/E Ratio</h3>
                        <p className="text-2xl font-bold text-indigo-600">{peRatioResult.toFixed(2)}x</p>
                        <p className="text-sm text-gray-600 mt-2">
                          Investors pay {peRatioResult.toFixed(2)} times the annual earnings for each share.
                        </p>
                        <div className="mt-3 text-xs text-gray-500">
                          <p>• Low P/E (5-15): Potentially undervalued or slow growth</p>
                          <p>• Medium P/E (15-25): Fair valuation</p>
                          <p>• High P/E (25+): High growth expectations or overvalued</p>
                        </div>
                      </div>
                    )}
                  </div>
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
