import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Format a JS Date (or date-string) into yyyy-MM-dd for input[type="date"].
 */
export function formatDateForInput(date: Date | string): string {
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
