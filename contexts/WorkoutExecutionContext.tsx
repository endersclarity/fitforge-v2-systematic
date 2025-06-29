'use client'

import { createContext, useContext, ReactNode } from 'react'
import { WorkoutExercise, WorkoutPlan, PlannedSet } from '@/schemas/typescript-interfaces'

interface EnhancedSetLog {
  id: string
  exerciseId: string
  weight: number
  reps: number
  completed: boolean
  timestamp: string
  rpe?: number
  isWarmup?: boolean
  notes?: string
}

interface WorkoutSessionData {
  // Workout state
  workoutQueue: WorkoutExercise[]
  currentExerciseIndex: number
  currentExercise: WorkoutExercise | undefined
  workoutPlan: WorkoutPlan | null
  exerciseNotes: Record<string, string>
  
  // Methods
  getCurrentPlannedSet: (exerciseId: string, setNumber: number) => PlannedSet | null
  getExercisePlannedSets: (exerciseId: string) => PlannedSet[]
  updateExerciseNotes: (notes: string) => void
}

interface SetLoggingData {
  // Set state
  sets: EnhancedSetLog[]
  currentWeight: string
  currentReps: string
  isWarmupSet: boolean
  setNotes: string
  
  // Methods
  setCurrentWeight: (weight: string) => void
  setCurrentReps: (reps: string) => void
  setIsWarmupSet: (isWarmup: boolean) => void
  setSetNotes: (notes: string) => void
  removeSet: (setId: string) => void
  getExerciseSets: (exerciseId: string) => EnhancedSetLog[]
  getRPEColor: (rpe: number) => string
}

interface WorkoutExecutionContextType {
  session: WorkoutSessionData
  logging: SetLoggingData
}

const WorkoutExecutionContext = createContext<WorkoutExecutionContextType | undefined>(undefined)

export function WorkoutExecutionProvider({ 
  children, 
  session,
  logging 
}: { 
  children: ReactNode
  session: WorkoutSessionData
  logging: SetLoggingData
}) {
  return (
    <WorkoutExecutionContext.Provider value={{ session, logging }}>
      {children}
    </WorkoutExecutionContext.Provider>
  )
}

export function useWorkoutExecution() {
  const context = useContext(WorkoutExecutionContext)
  if (!context) {
    throw new Error('useWorkoutExecution must be used within WorkoutExecutionProvider')
  }
  return context
}