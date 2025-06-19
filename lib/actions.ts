"use server"

import { revalidatePath } from "next/cache"

/**
 * Basic stub for creating money-flow entries.
 * Replace the body with your real database logic (Supabase, etc.).
 */
export async function createMoneyFlow(formData: FormData) {
  // TODO: persist data in your store
  const payload = Object.fromEntries(formData.entries())
  console.info("[server action] createMoneyFlow", payload)

  /* After writing to the database, revalidate the affected route(s) */
  revalidatePath("/dashboard/money-flow")

  return { success: true }
}
