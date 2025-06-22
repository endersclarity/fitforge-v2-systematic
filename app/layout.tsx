import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FitForge",
  description: "Advanced fitness tracking with muscle fatigue analytics and progressive overload targeting",
  keywords: "fitness, workout tracker, muscle fatigue, progressive overload, exercise library",
  authors: [{ name: "FitForge Team" }],
  openGraph: {
    title: "FitForge - Advanced Fitness Tracking",
    description: "Track workouts with muscle fatigue analytics and progressive overload intelligence",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            <div className="min-h-screen bg-[#121212]">
              <Navigation />
              <main className="container mx-auto px-4 py-8 max-w-7xl">{children}</main>
            </div>
            <Toaster richColors theme="dark" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
