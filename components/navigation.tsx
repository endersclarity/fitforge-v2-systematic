"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Dumbbell, Calendar, TrendingUp, BarChart3, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/push-pull-legs", label: "Start Workout", icon: Dumbbell },
  { href: "/muscle-explorer", label: "Exercise Library", icon: TrendingUp },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/workout-simple", label: "Quick Log", icon: Calendar },
]

export function Navigation() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <nav className="border-b border-[#2C2C2E] bg-[#1C1C1E]/95 backdrop-blur supports-[backdrop-filter]:bg-[#1C1C1E]/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Dumbbell className="h-6 w-6 text-[#FF375F]" />
              <span className="text-xl font-bold text-white">FitForge</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                    className={cn(
                      "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-[#FF375F]",
                      pathname === item.href ? "text-[#FF375F]" : "text-[#A1A1A3]",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-around py-2 border-t">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`nav-mobile-${item.label.toLowerCase().replace(' ', '-')}`}
                className={cn(
                  "flex flex-col items-center space-y-1 p-2 rounded-md transition-colors",
                  pathname === item.href ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
