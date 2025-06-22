/**
 * Progress Dashboard Page
 * Comprehensive progress tracking dashboard for FitForge
 */

'use client'

import { ProgressDashboard } from '@/components/dashboard/ProgressDashboard'
import { Loader2 } from 'lucide-react'

export default function ProgressDashboardPage() {
  // In a real app, this would come from authentication
  const mockUserId = 'user-123'
  
  // Simulating auth check
  const isAuthenticated = true
  const isLoading = false

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF375F] animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Authentication Required</h1>
          <p className="text-gray-400">Please log in to view your progress</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="container mx-auto px-4 py-8">
        <ProgressDashboard userId={mockUserId} />
      </div>
    </div>
  )
}