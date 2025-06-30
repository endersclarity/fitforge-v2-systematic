import { useState } from 'react'

export interface WorkoutDraft {
  name: string
  exercises: any[]
}

export function useWorkoutDraft() {
  const [draft, setDraft] = useState<WorkoutDraft>({
    name: '',
    exercises: []
  })
  
  const updateDraft = (updates: Partial<WorkoutDraft>) => {
    setDraft(prev => ({ ...prev, ...updates }))
  }
  
  return [
    draft,
    updateDraft,
    { isLoading: false, isSaving: false }
  ] as const
}