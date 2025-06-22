import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FitForge - Smart Fitness Tracking",
  description: "localStorage-first fitness tracker with Push/Pull/Legs organization, progressive overload intelligence, and muscle engagement visualization",
  keywords: "fitness, workout tracker, progressive overload, push pull legs, muscle engagement, localStorage",
  authors: [{ name: "FitForge Team" }],
  openGraph: {
    title: "FitForge - Smart Fitness Tracking",
    description: "Track workouts with Push/Pull/Legs organization and progressive overload intelligence",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} bg-[#121212] text-white`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            <div className="min-h-screen bg-[#121212] flex flex-col">
              <Navigation />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster richColors theme="dark" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
