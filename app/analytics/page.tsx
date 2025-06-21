"use client"

import { ExcelLikeDashboard } from "@/components/excel-like-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Live Excel-like interface powered by Supabase - your intelligent fitness spreadsheet
        </p>
      </div>
      
      <ExcelLikeDashboard />
    </div>
  )
}