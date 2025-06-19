"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFormStatus } from "react-dom"
import { createMoneyFlow } from "@/lib/actions"
import { formatDateForInput } from "@/lib/utils"
import { getCategoryNames } from "@/lib/categories"

interface State {
  errors?: {
    amount?: string[]
    description?: string[]
    date?: string[]
    type?: string[]
    category?: string[]
  }
  message?: string | null
}

const AddMoneyFlowForm = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: formatDateForInput(new Date()),
    type: "expense",
    category: "",
  })
  const [formState, setFormState] = useState<State>({})
  const [incomeCategories, setIncomeCategories] = useState<string[]>([])
  const [expenseCategories, setExpenseCategories] = useState<string[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const loadCategories = async () => {
    setCategoriesLoading(true)
    try {
      const [incomeNames, expenseNames] = await Promise.all([getCategoryNames("income"), getCategoryNames("expense")])

      setIncomeCategories(incomeNames)
      setExpenseCategories(expenseNames)

      console.log("✅ Categories loaded:", { income: incomeNames.length, expense: expenseNames.length })
    } catch (err) {
      console.error("❌ Failed to load categories:", err)
      // Fallback will be handled by the categories utility
    } finally {
      setCategoriesLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  return (
    <form
      action={async (formData: FormData) => {
        const { message, errors } = await createMoneyFlow(formData)

        if (message) {
          setFormState({ message, errors })
          if (errors) {
            console.error("Validation Errors:", errors)
          } else {
            console.log("Success Message:", message)
          }
        }

        router.refresh()
      }}
    >
      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-foreground">
          Amount
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
        />
        {formState?.errors?.amount &&
          formState.errors.amount.map((error, index) => (
            <p key={index} className="text-red-500 text-sm mt-1">
              {error}
            </p>
          ))}
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
        />
        {formState?.errors?.description &&
          formState.errors.description.map((error, index) => (
            <p key={index} className="text-red-500 text-sm mt-1">
              {error}
            </p>
          ))}
      </div>

      <div className="mb-4">
        <label htmlFor="date" className="block text-sm font-medium text-foreground">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
        />
        {formState?.errors?.date &&
          formState.errors.date.map((error, index) => (
            <p key={index} className="text-red-500 text-sm mt-1">
              {error}
            </p>
          ))}
      </div>

      <div className="mb-4">
        <label htmlFor="type" className="block text-sm font-medium text-foreground">
          Type
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        {formState?.errors?.type &&
          formState.errors.type.map((error, index) => (
            <p key={index} className="text-red-500 text-sm mt-1">
              {error}
            </p>
          ))}
      </div>

      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-medium text-foreground">
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          required
          disabled={categoriesLoading}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="">{categoriesLoading ? "Loading categories..." : "Select category"}</option>
          {(formData.type === "income" ? incomeCategories : expenseCategories).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {formState?.errors?.category &&
          formState.errors.category.map((error, index) => (
            <p key={index} className="text-red-500 text-sm mt-1">
              {error}
            </p>
          ))}
      </div>

      {formState?.message && (
        <div className="mb-4">
          <p className={formState?.errors ? "text-red-500 text-sm mt-1" : "text-green-500 text-sm mt-1"}>
            {formState.message}
          </p>
        </div>
      )}

      <SubmitButton />
    </form>
  )
}

const SubmitButton = () => {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      aria-disabled={pending}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-500"
    >
      {pending ? "Creating..." : "Create Money Flow"}
    </button>
  )
}

export default AddMoneyFlowForm
