'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 as uuidv4 } from 'uuid'
import { WorkoutSetSchemaV2, WorkoutSetV2 } from './validationV2'

export interface UseWorkoutLoggerV2Options {
  onSuccess?: (set: WorkoutSetV2) => void
}

export function useWorkoutLoggerV2(options: UseWorkoutLoggerV2Options = {}) {
  const [sets, setSets] = useState<WorkoutSetV2[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const sessionIdRef = useRef('')

  const form = useForm<WorkoutSetV2>({
    resolver: zodResolver(WorkoutSetSchemaV2),
    defaultValues: {
      sessionId: '',
      exerciseId: '',
      weight: 0,
      reps: 8,
    },
  })

  // Initialize session and load previous sets
  useEffect(() => {
    let storedId = localStorage.getItem('currentWorkoutSession')
    if (!storedId) {
      storedId = uuidv4()
      localStorage.setItem('currentWorkoutSession', storedId)
    }
    sessionIdRef.current = storedId
    form.setValue('sessionId', storedId)

    const saved = localStorage.getItem(`sessionSets:${storedId}`)
    if (saved) {
      try {
        setSets(JSON.parse(saved))
      } catch {
        /* ignore */
      }
    }
  }, [form])

  // Persist sets to localStorage whenever they change
  useEffect(() => {
    if (sessionIdRef.current) {
      localStorage.setItem(
        `sessionSets:${sessionIdRef.current}`,
        JSON.stringify(sets)
      )
    }
  }, [sets])

  async function submitSet(data: WorkoutSetV2) {
    setIsSaving(true)
    try {
      const res = await fetch('/api/workout-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to save set')
      }
      const savedSet: WorkoutSetV2 = await res.json()
      setSets((prev) => [...prev, savedSet])
      localStorage.setItem(`lastWeight:${data.exerciseId}`, String(data.weight))
      options.onSuccess?.(savedSet)
      form.reset({ exerciseId: data.exerciseId, weight: data.weight, reps: data.reps, sessionId: sessionIdRef.current })
    } catch (err) {
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  const getLastWeight = (exerciseId: string): number | null => {
    const val = localStorage.getItem(`lastWeight:${exerciseId}`)
    return val ? parseFloat(val) : null
  }

  return {
    form,
    sets,
    isSaving,
    sessionId: sessionIdRef.current,
    submitSet,
    getLastWeight,
  }
}
