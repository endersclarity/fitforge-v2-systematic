'use client'

import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { workoutSetSchema, WorkoutSetInput } from './validation'

export function useWorkoutLogger(onSuccess?: (data: any) => void) {
  const form = useForm<WorkoutSetInput>({
    resolver: zodResolver(workoutSetSchema),
    defaultValues: {
      exerciseId: '',
      weight: 0,
      reps: 0,
    },
  })

  const submit = useCallback(
    async (values: WorkoutSetInput) => {
      const res = await fetch('/api/workout-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to save set')
      }

      const data = await res.json().catch(() => ({}))
      onSuccess?.(data)
      return data
    },
    [onSuccess]
  )

  return { ...form, submit }
}
