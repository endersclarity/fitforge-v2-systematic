'use client'

import { SimpleIntakeForm } from '@/components/simple-intake-form'

export default function IntakePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <SimpleIntakeForm />
      </div>
    </div>
  )
}