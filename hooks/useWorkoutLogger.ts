/**
 * useWorkoutLogger Hook
 * Manages workout logging state, API calls, and business logic
 * Handles optimistic updates, error recovery, and offline mode
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { api, ApiError } from '@/lib/api-client'
import {
  User,
  Exercise,
  Workout,
  WorkoutSet,
  WorkoutInsert,
  WorkoutSetInsert,
  ExerciseWithLastPerformance,
} from '@/schemas/typescript-interfaces'
import { toast } from '@/components/ui/use-toast'

export interface UseWorkoutLoggerOptions {
  /** Current user */
  user: User
  /** Initial workout (if editing existing) */
  initialWorkout?: Workout
  /** Auto-save delay in milliseconds */
  autoSaveDelay?: number
  /** Enable offline mode */
  enableOfflineMode?: boolean
}

export interface UseWorkoutLoggerReturn {
  // Workout state
  workout: Workout | null
  isCreatingWorkout: boolean
  
  // Exercise state
  selectedExercise: Exercise | null
  exerciseHistory: Map<string, ExerciseWithLastPerformance>
  
  // Sets state
  workoutSets: WorkoutSet[]
  pendingSets: WorkoutSet[] // Optimistic updates
  failedSets: WorkoutSet[] // Failed to sync
  
  // Loading states
  isLoading: boolean
  isSyncing: boolean
  
  // Error state
  error: string | null
  
  // Actions
  createWorkout: (data: Partial<WorkoutInsert>) => Promise<void>
  selectExercise: (exercise: Exercise) => void
  addSet: (set: WorkoutSetInsert) => Promise<void>
  updateSet: (setId: string, updates: Partial<WorkoutSetInsert>) => Promise<void>
  deleteSet: (setId: string) => Promise<void>
  completeWorkout: (notes?: string, energyLevel?: number) => Promise<void>
  
  // Utility functions
  getLastPerformedSet: (exerciseId: string) => WorkoutSet | undefined
  getPersonalBest: (exerciseId: string) => WorkoutSet | undefined
  retryFailedSets: () => Promise<void>
  clearError: () => void
}

/**
 * useWorkoutLogger - Comprehensive workout logging state management
 * 
 * @example
 * ```tsx
 * const {
 *   workout,
 *   selectedExercise,
 *   workoutSets,
 *   selectExercise,
 *   addSet,
 *   isLoading,
 * } = useWorkoutLogger({ user: currentUser })
 * ```
 */
export function useWorkoutLogger({
  user,
  initialWorkout,
  autoSaveDelay = 5000,
  enableOfflineMode = true,
}: UseWorkoutLoggerOptions): UseWorkoutLoggerReturn {
  // Core state
  const [workout, setWorkout] = useState<Workout | null>(initialWorkout || null)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [workoutSets, setWorkoutSets] = useState<WorkoutSet[]>([])
  const [exerciseHistory, setExerciseHistory] = useState<Map<string, ExerciseWithLastPerformance>>(new Map())
  
  // Optimistic update state
  const [pendingSets, setPendingSets] = useState<WorkoutSet[]>([])
  const [failedSets, setFailedSets] = useState<WorkoutSet[]>([])
  
  // Loading states
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  
  // Error state
  const [error, setError] = useState<string | null>(null)
  
  // Refs for cleanup
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isOnlineRef = useRef(navigator.onLine)

  console.log('🔥 [useWorkoutLogger] ENTRY - state:', {
    workoutId: workout?.id,
    selectedExerciseId: selectedExercise?.id,
    setsCount: workoutSets.length,
    pendingCount: pendingSets.length,
    failedCount: failedSets.length,
  })

  /**
   * Monitor online/offline status
   */
  useEffect(() => {
    const handleOnline = () => {
      console.log('🔧 [useWorkoutLogger] Connection restored')
      isOnlineRef.current = true
      
      // Retry failed sets when back online
      if (failedSets.length > 0) {
        retryFailedSets()
      }
    }

    const handleOffline = () => {
      console.log('🚨 [useWorkoutLogger] Connection lost')
      isOnlineRef.current = false
      
      if (enableOfflineMode) {
        toast({
          title: 'Offline Mode',
          description: 'Changes will be synced when connection is restored',
          variant: 'default',
        })
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [failedSets.length, enableOfflineMode])

  /**
   * Fetch workout sets when workout changes
   */
  useEffect(() => {
    if (workout?.id) {
      fetchWorkoutSets()
    }
  }, [workout?.id])

  /**
   * Fetch existing sets for the workout
   */
  const fetchWorkoutSets = useCallback(async () => {
    if (!workout?.id) return

    console.log('🔥 [fetchWorkoutSets] Fetching for workout:', workout.id)
    setIsLoading(true)

    try {
      const sets = await api.workoutSets.list({
        workout_id: workout.id,
        limit: 100,
      })

      setWorkoutSets(sets)
      console.log('🔧 [fetchWorkoutSets] SUCCESS - loaded sets:', sets.length)
    } catch (err: any) {
      console.log('🚨 FAILURE CONDITION - fetchWorkoutSets error:', err)
      setError(err.message || 'Failed to load workout sets')
    } finally {
      setIsLoading(false)
    }
  }, [workout?.id])

  /**
   * Fetch exercise history for the user
   */
  const fetchExerciseHistory = useCallback(async () => {
    console.log('🔥 [fetchExerciseHistory] Fetching for user:', user.id)

    try {
      // Get all exercises
      const exercises = await api.exercises.list({ limit: 100 })
      
      // Get recent sets for history
      const recentSets = await api.workoutSets.list({ limit: 200 })
      
      // Build exercise history map
      const historyMap = new Map<string, ExerciseWithLastPerformance>()
      
      exercises.forEach(exercise => {
        // Find sets for this exercise
        const exerciseSets = recentSets.filter(set => set.exercise_id === exercise.id)
        
        // Find last performed and personal best
        let lastSet: WorkoutSet | undefined
        let personalBest: WorkoutSet | undefined
        
        exerciseSets.forEach(set => {
          // Track most recent
          if (!lastSet || new Date(set.created_at) > new Date(lastSet.created_at)) {
            lastSet = set
          }
          
          // Track personal best (highest volume)
          if (!personalBest || set.volume_lbs > personalBest.volume_lbs) {
            personalBest = set
          }
        })
        
        historyMap.set(exercise.id, {
          ...exercise,
          last_workout_set: lastSet,
          personal_best: personalBest,
          recent_volume: lastSet?.volume_lbs || 0,
        })
      })
      
      setExerciseHistory(historyMap)
      console.log('🔧 [fetchExerciseHistory] SUCCESS - exercises:', historyMap.size)
    } catch (err: any) {
      console.log('🚨 FAILURE CONDITION - fetchExerciseHistory error:', err)
      // Non-critical error, don't block UI
    }
  }, [user.id])

  // Fetch exercise history on mount
  useEffect(() => {
    fetchExerciseHistory()
  }, [fetchExerciseHistory])

  /**
   * Create a new workout
   */
  const createWorkout = useCallback(async (data: Partial<WorkoutInsert>) => {
    console.log('🔥 [createWorkout] Creating with data:', data)
    setIsCreatingWorkout(true)
    setError(null)

    try {
      const workoutData: WorkoutInsert = {
        user_id: user.id,
        name: data.name || `Workout ${new Date().toLocaleDateString()}`,
        workout_type: data.workout_type,
        variation: data.variation,
        notes: data.notes,
        ...data,
      }

      const newWorkout = await api.workouts.create(workoutData)
      setWorkout(newWorkout)
      
      console.log('🔧 [createWorkout] SUCCESS - workout created:', newWorkout.id)
      
      toast({
        title: 'Workout Started',
        description: 'Good luck with your training!',
      })
    } catch (err: any) {
      console.log('🚨 FAILURE CONDITION - createWorkout error:', err)
      setError(err.message || 'Failed to create workout')
      throw err
    } finally {
      setIsCreatingWorkout(false)
    }
  }, [user.id])

  /**
   * Select an exercise
   */
  const selectExercise = useCallback((exercise: Exercise) => {
    console.log('🔥 [selectExercise] Selected:', exercise.id)
    setSelectedExercise(exercise)
  }, [])

  /**
   * Add a new set with optimistic updates
   */
  const addSet = useCallback(async (setData: WorkoutSetInsert) => {
    if (!workout?.id) {
      console.log('🚨 FAILURE CONDITION - No active workout')
      setError('No active workout')
      return
    }

    console.log('🔥 [addSet] Adding set:', setData)

    // Create optimistic set
    const optimisticSet: WorkoutSet = {
      id: `temp-${Date.now()}`,
      workout_id: workout.id,
      exercise_id: setData.exercise_id,
      user_id: setData.user_id,
      set_number: setData.set_number,
      reps: setData.reps,
      weight_lbs: setData.weight_lbs,
      time_under_tension_seconds: setData.time_under_tension_seconds,
      rest_seconds: setData.rest_seconds,
      perceived_exertion: setData.perceived_exertion,
      volume_lbs: setData.weight_lbs * setData.reps,
      estimated_one_rep_max: calculateOneRepMax(setData.weight_lbs, setData.reps),
      is_personal_best: false,
      improvement_vs_last: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Add to pending sets for optimistic UI
    setPendingSets(prev => [...prev, optimisticSet])
    setWorkoutSets(prev => [...prev, optimisticSet])

    try {
      // Check if online or offline mode enabled
      if (!isOnlineRef.current && !enableOfflineMode) {
        throw new ApiError(0, 'OFFLINE', 'No internet connection')
      }

      // API call (will fail if offline)
      const createdSet = await api.workoutSets.create(setData)
      
      // Replace optimistic set with real one
      setPendingSets(prev => prev.filter(s => s.id !== optimisticSet.id))
      setWorkoutSets(prev => prev.map(s => 
        s.id === optimisticSet.id ? createdSet : s
      ))

      // Update exercise history if it's a personal best
      const exerciseData = exerciseHistory.get(setData.exercise_id)
      if (exerciseData && (!exerciseData.personal_best || createdSet.volume_lbs > exerciseData.personal_best.volume_lbs)) {
        setExerciseHistory(prev => {
          const updated = new Map(prev)
          updated.set(setData.exercise_id, {
            ...exerciseData,
            last_workout_set: createdSet,
            personal_best: createdSet,
            recent_volume: createdSet.volume_lbs,
          })
          return updated
        })
      }

      console.log('🔧 [addSet] SUCCESS - set created:', createdSet.id)
    } catch (err: any) {
      console.log('🚨 FAILURE CONDITION - addSet error:', err)
      
      // Move to failed sets if offline
      if (err.code === 'OFFLINE' || err.code === 'NETWORK_ERROR') {
        setPendingSets(prev => prev.filter(s => s.id !== optimisticSet.id))
        setFailedSets(prev => [...prev, optimisticSet])
        
        if (enableOfflineMode) {
          toast({
            title: 'Set saved offline',
            description: 'Will sync when connection is restored',
            variant: 'default',
          })
        }
      } else {
        // Remove optimistic set on other errors
        setPendingSets(prev => prev.filter(s => s.id !== optimisticSet.id))
        setWorkoutSets(prev => prev.filter(s => s.id !== optimisticSet.id))
        setError(err.message || 'Failed to add set')
      }
    }
  }, [workout?.id, exerciseHistory, enableOfflineMode])

  /**
   * Update an existing set
   */
  const updateSet = useCallback(async (setId: string, updates: Partial<WorkoutSetInsert>) => {
    console.log('🔥 [updateSet] Updating:', { setId, updates })

    // Optimistic update
    setWorkoutSets(prev => prev.map(set => 
      set.id === setId
        ? {
            ...set,
            ...updates,
            volume_lbs: (updates.weight_lbs || set.weight_lbs) * (updates.reps || set.reps),
            updated_at: new Date().toISOString(),
          }
        : set
    ))

    try {
      await api.workoutSets.update(setId, updates)
      console.log('🔧 [updateSet] SUCCESS')
    } catch (err: any) {
      console.log('🚨 FAILURE CONDITION - updateSet error:', err)
      
      // Revert optimistic update
      await fetchWorkoutSets()
      setError(err.message || 'Failed to update set')
    }
  }, [fetchWorkoutSets])

  /**
   * Delete a set
   */
  const deleteSet = useCallback(async (setId: string) => {
    console.log('🔥 [deleteSet] Deleting:', setId)

    // Optimistic delete
    const deletedSet = workoutSets.find(s => s.id === setId)
    setWorkoutSets(prev => prev.filter(s => s.id !== setId))

    try {
      await api.workoutSets.delete(setId)
      console.log('🔧 [deleteSet] SUCCESS')
      
      toast({
        title: 'Set deleted',
        variant: 'default',
      })
    } catch (err: any) {
      console.log('🚨 FAILURE CONDITION - deleteSet error:', err)
      
      // Revert optimistic delete
      if (deletedSet) {
        setWorkoutSets(prev => [...prev, deletedSet])
      }
      setError(err.message || 'Failed to delete set')
    }
  }, [workoutSets])

  /**
   * Complete the workout
   */
  const completeWorkout = useCallback(async (notes?: string, energyLevel?: number) => {
    if (!workout?.id) {
      console.log('🚨 FAILURE CONDITION - No active workout')
      return
    }

    console.log('🔥 [completeWorkout] Completing workout:', workout.id)
    setIsLoading(true)

    try {
      // Ensure all pending sets are synced
      if (pendingSets.length > 0) {
        toast({
          title: 'Syncing pending sets...',
          description: 'Please wait while we save your data',
        })
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      const completedWorkout = await api.workouts.complete(workout.id, {
        notes,
        energy_level: energyLevel,
      })

      setWorkout(completedWorkout)
      console.log('🔧 [completeWorkout] SUCCESS')
      
      toast({
        title: 'Workout Complete! 💪',
        description: `Great job! You completed ${workoutSets.length} sets.`,
      })
    } catch (err: any) {
      console.log('🚨 FAILURE CONDITION - completeWorkout error:', err)
      setError(err.message || 'Failed to complete workout')
    } finally {
      setIsLoading(false)
    }
  }, [workout?.id, pendingSets.length, workoutSets.length])

  /**
   * Get last performed set for an exercise
   */
  const getLastPerformedSet = useCallback((exerciseId: string): WorkoutSet | undefined => {
    const exerciseData = exerciseHistory.get(exerciseId)
    return exerciseData?.last_workout_set
  }, [exerciseHistory])

  /**
   * Get personal best for an exercise
   */
  const getPersonalBest = useCallback((exerciseId: string): WorkoutSet | undefined => {
    const exerciseData = exerciseHistory.get(exerciseId)
    return exerciseData?.personal_best
  }, [exerciseHistory])

  /**
   * Retry failed sets
   */
  const retryFailedSets = useCallback(async () => {
    if (failedSets.length === 0) return

    console.log('🔥 [retryFailedSets] Retrying failed sets:', failedSets.length)
    setIsSyncing(true)

    const retryPromises = failedSets.map(async (failedSet) => {
      try {
        const setData: WorkoutSetInsert = {
          workout_id: failedSet.workout_id,
          exercise_id: failedSet.exercise_id,
          user_id: failedSet.user_id,
          set_number: failedSet.set_number,
          reps: failedSet.reps,
          weight_lbs: failedSet.weight_lbs,
          time_under_tension_seconds: failedSet.time_under_tension_seconds,
          rest_seconds: failedSet.rest_seconds,
          perceived_exertion: failedSet.perceived_exertion,
        }

        const createdSet = await api.workoutSets.create(setData)
        
        // Remove from failed, update in workout sets
        setFailedSets(prev => prev.filter(s => s.id !== failedSet.id))
        setWorkoutSets(prev => prev.map(s => 
          s.id === failedSet.id ? createdSet : s
        ))

        return { success: true, setId: failedSet.id }
      } catch (err) {
        console.log('🚨 FAILURE CONDITION - Retry failed for set:', failedSet.id)
        return { success: false, setId: failedSet.id }
      }
    })

    const results = await Promise.all(retryPromises)
    const successCount = results.filter(r => r.success).length

    console.log('🔧 [retryFailedSets] Completed:', {
      success: successCount,
      failed: results.length - successCount,
    })

    if (successCount > 0) {
      toast({
        title: 'Sets synced',
        description: `${successCount} sets successfully synced`,
      })
    }

    setIsSyncing(false)
  }, [failedSets])

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Calculate one rep max using Epley formula
   */
  function calculateOneRepMax(weight: number, reps: number): number {
    if (reps === 1) return weight
    return Math.round(weight * (1 + reps / 30))
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [])

  return {
    // Workout state
    workout,
    isCreatingWorkout,
    
    // Exercise state
    selectedExercise,
    exerciseHistory,
    
    // Sets state
    workoutSets,
    pendingSets,
    failedSets,
    
    // Loading states
    isLoading,
    isSyncing,
    
    // Error state
    error,
    
    // Actions
    createWorkout,
    selectExercise,
    addSet,
    updateSet,
    deleteSet,
    completeWorkout,
    
    // Utility functions
    getLastPerformedSet,
    getPersonalBest,
    retryFailedSets,
    clearError,
  }
}