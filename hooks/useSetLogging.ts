import { useState } from 'react'
import { PlannedSet, WorkoutExercise } from '@/schemas/typescript-interfaces'

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

interface UseSetLoggingProps {
  getCurrentPlannedSet: (exerciseId: string, setNumber: number) => PlannedSet | null
  getExercisePlannedSets: (exerciseId: string) => PlannedSet[]
}

export function useSetLogging({ getCurrentPlannedSet, getExercisePlannedSets }: UseSetLoggingProps) {
  const [sets, setSets] = useState<EnhancedSetLog[]>([])
  const [currentWeight, setCurrentWeight] = useState('')
  const [currentReps, setCurrentReps] = useState('')
  const [isWarmupSet, setIsWarmupSet] = useState(false)
  const [setNotes, setSetNotes] = useState('')
  const [pendingSet, setPendingSet] = useState<EnhancedSetLog | null>(null)
  const [showRPEModal, setShowRPEModal] = useState(false)
  const [showBatchRPEModal, setShowBatchRPEModal] = useState(false)
  const [pendingBatchSets, setPendingBatchSets] = useState<number>(0)

  const addSet = (currentExercise: WorkoutExercise) => {
    if (!currentWeight || !currentReps || !currentExercise) return

    const newSet: EnhancedSetLog = {
      id: `set_${Date.now()}_${Math.random()}`,
      exerciseId: currentExercise.id,
      weight: parseFloat(currentWeight),
      reps: parseInt(currentReps),
      completed: true,
      timestamp: new Date().toISOString(),
      isWarmup: isWarmupSet,
      notes: setNotes || undefined
    }

    // Store pending set for RPE rating
    setPendingSet(newSet)
    setShowRPEModal(true)
  }

  const completeSetWithRPE = (rpe: number, currentExercise: WorkoutExercise) => {
    if (pendingSet) {
      const completedSet = { ...pendingSet, rpe }
      setSets(prev => [...prev, completedSet])
      
      // Auto-populate next planned set values if available
      const exerciseSets = sets.filter(set => set.exerciseId === currentExercise.id)
      const nextSetNumber = exerciseSets.length + 2
      const nextPlannedSet = getCurrentPlannedSet(currentExercise.id, nextSetNumber)
      
      if (nextPlannedSet) {
        setCurrentWeight(nextPlannedSet.targetWeight.toString())
        setCurrentReps(nextPlannedSet.targetReps.toString())
      } else {
        setCurrentReps('')
      }
      
      // Reset form
      setSetNotes('')
      if (isWarmupSet) {
        setIsWarmupSet(false) // Auto-reset warm-up toggle
      }
    }
    
    setPendingSet(null)
    setShowRPEModal(false)
    
    return true // Indicates set was completed - can trigger rest timer
  }

  const logAllSets = (currentExercise: WorkoutExercise) => {
    if (!currentWeight || !currentReps || !currentExercise) return
    
    const exerciseSets = sets.filter(set => set.exerciseId === currentExercise.id)
    const remainingPlannedSets = getExercisePlannedSets(currentExercise.id)
      .filter((_, index) => index >= exerciseSets.length)
    
    if (remainingPlannedSets.length === 0) return
    
    // Store the number of sets for batch RPE modal
    setPendingBatchSets(remainingPlannedSets.length)
    setShowBatchRPEModal(true)
  }

  const completeBatchSetsWithRPE = (rpe: number, currentExercise: WorkoutExercise) => {
    if (!currentWeight || !currentReps || !currentExercise || pendingBatchSets === 0) return
    
    const exerciseSets = sets.filter(set => set.exerciseId === currentExercise.id)
    const remainingPlannedSets = getExercisePlannedSets(currentExercise.id)
      .filter((_, index) => index >= exerciseSets.length)
      .slice(0, pendingBatchSets)
    
    // Create all remaining sets with same weight/reps and chosen RPE
    const allSets: EnhancedSetLog[] = remainingPlannedSets.map((plannedSet, index) => ({
      id: `set_${Date.now()}_${Math.random()}_${index}`,
      exerciseId: currentExercise.id,
      weight: parseFloat(currentWeight),
      reps: parseInt(currentReps),
      completed: true,
      timestamp: new Date().toISOString(),
      isWarmup: false, // Log All Sets is for working sets
      rpe: rpe
    }))
    
    setSets(prev => [...prev, ...allSets])
    
    // Clear inputs after logging all sets
    setCurrentWeight('')
    setCurrentReps('')
    
    // Reset batch modal state
    setShowBatchRPEModal(false)
    setPendingBatchSets(0)
    
    return true // Indicates sets were completed - can trigger rest timer
  }

  const removeSet = (setId: string) => {
    setSets(prev => prev.filter(set => set.id !== setId))
  }

  const getExerciseSets = (exerciseId: string) => {
    return sets.filter(set => set.exerciseId === exerciseId)
  }

  const getRPEColor = (rpe: number) => {
    if (rpe <= 3) return 'text-green-400'
    if (rpe <= 6) return 'text-yellow-400'
    if (rpe <= 8) return 'text-orange-400'
    return 'text-red-400'
  }

  // Auto-populate first planned set values when switching exercises
  const populateFirstPlannedSet = (exercise: WorkoutExercise) => {
    const firstPlannedSet = getCurrentPlannedSet(exercise.id, 1)
    if (firstPlannedSet) {
      setCurrentWeight(firstPlannedSet.targetWeight.toString())
      setCurrentReps(firstPlannedSet.targetReps.toString())
    } else {
      setCurrentWeight('')
      setCurrentReps('')
    }
    setIsWarmupSet(false)
  }

  const resetSetForm = () => {
    setCurrentWeight('')
    setCurrentReps('')
    setIsWarmupSet(false)
    setSetNotes('')
  }

  return {
    // State
    sets,
    currentWeight,
    currentReps,
    isWarmupSet,
    setNotes,
    pendingSet,
    showRPEModal,
    showBatchRPEModal,
    pendingBatchSets,
    
    // Actions
    addSet,
    completeSetWithRPE,
    logAllSets,
    completeBatchSetsWithRPE,
    removeSet,
    getExerciseSets,
    getRPEColor,
    populateFirstPlannedSet,
    resetSetForm,
    
    // Setters for components
    setCurrentWeight,
    setCurrentReps,
    setIsWarmupSet,
    setSetNotes,
    setShowRPEModal,
    setPendingSet,
    setShowBatchRPEModal,
    setPendingBatchSets,
    setSets
  }
}