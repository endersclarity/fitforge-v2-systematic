'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import exercisesData from '@/data/exercises.json'
import { workoutSetSchema, WorkoutSetInput } from './validation'

interface ExerciseOption {
  id: string
  name: string
}

const exerciseOptions: ExerciseOption[] = (exercisesData as any[]).map(e => ({
  id: e.id.toString(),
  name: e.name as string
}))

export function useWorkoutLogger() {
  const [error, setError] = useState<string | null>(null)

  const form = useForm<WorkoutSetInput>({
    resolver: zodResolver(workoutSetSchema),
    defaultValues: { exerciseId: '', weight: 0, reps: 0 }
  })

  const onSubmit = form.handleSubmit(async values => {
    setError(null)
    try {
      const res = await fetch('/api/workout-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save workout set')
      }

      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workout set')
    }
  })

  return { form, onSubmit, error, exerciseOptions }
}
