'use client'

import { UserIntakeForm } from '@/components/user-intake-form'

export default function IntakePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to FitForge
          </h1>
          <p className="text-lg text-gray-600">
            Let's set up your personalized fitness profile
          </p>
        </div>
        
        <UserIntakeForm />
      </div>
    </div>
  )
}