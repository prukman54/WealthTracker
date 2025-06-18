"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { trackUI } from "@/lib/analytics"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  const handleToggle = () => {
    toggleTheme()
    trackUI.themeToggle(theme === "light" ? "dark" : "light")
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className="h-9 w-9 p-0 border-accent/20 hover:bg-accent/10 hover:border-accent/30 transition-all duration-300"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
