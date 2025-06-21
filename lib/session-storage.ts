import { DetailedWorkoutSession } from '../types/workout'
import { dataService, DataService } from './data-service'

// Browser-compatible UUID generator
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Convert ActiveWorkout to DetailedWorkoutSession with enhanced data model
export function createDetailedSession(activeWorkout: any): DetailedWorkoutSession {
  const endTime = new Date()
  const startTime = new Date(activeWorkout.startTime)
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000) // seconds

  // Filter to only exercises with completed sets
  const performedExercises = activeWorkout.workout.exercises
    .map((exercise: any) => {
      // Get only the sets that were actually completed
      const completedSets = exercise.sets.filter((set: any) => set.completed)
      
      // Only return exercise if it has completed sets
      if (completedSets.length > 0) {
        // Transform sets to include new data model fields
        const enhancedSets = completedSets.map((set: any, index: number) => ({
          id: set.id || generateUUID(),
          session_id: '', // Will be set when saving
          exercise_id: exercise.id,
          set_number: index + 1,
          // Plan vs Actuals (from dev analysis)
          planned_reps: set.plannedReps || set.reps,
          planned_weight: set.plannedWeight || set.weight,
          // Actual performance
          reps: set.reps,
          weight: set.weight,
          completed: set.completed,
          // NEW: Critical AI metrics from dev analysis
          rpe: set.rpe, // Rate of Perceived Exertion (1-10)
          actual_rest_time: set.actualRestTime, // seconds before this set
          notes: set.notes, // set-specific notes
          completed_at: new Date().toISOString()
        }))

        return {
          id: exercise.id,
          name: exercise.name,
          sets: enhancedSets,
          muscleEngagement: parseMuscleEngagement(exercise.name),
          // Add exercise-specific metrics
          setsCompleted: completedSets.length,
          exerciseVolume: completedSets.reduce((vol: number, set: any) => 
            vol + (set.reps * set.weight), 0)
        }
      }
      return null
    })
    .filter(Boolean) // Remove null entries

  // Calculate metrics based on PERFORMED work only
  const totalVolume = performedExercises.reduce((total: number, exercise: any) => 
    total + exercise.exerciseVolume, 0)
  
  const totalPerformedSets = performedExercises.reduce((total: number, exercise: any) => 
    total + exercise.setsCompleted, 0)

  // Adherence tracking for workout plan compliance
  const plannedExercises = activeWorkout.workout.exercises.length
  const performedExerciseCount = performedExercises.length
  const adherenceRate = plannedExercises > 0 ? 
    Math.round((performedExerciseCount / plannedExercises) * 100) : 0

  return {
    id: generateUUID(),
    user_id: activeWorkout.userId || generateUUID(), // Generate proper UUID for demo user
    name: activeWorkout.workout.name,
    workout_type: activeWorkout.workout.type || 'A',
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    total_volume: totalVolume,
    total_sets: totalPerformedSets,
    total_exercises: performedExercises.length,
    notes: activeWorkout.workoutNotes || null,
    // For localStorage compatibility
    date: endTime.toISOString(),
    exercises: performedExercises
  }
}

// Helper: Parse muscle engagement from exercise name (lookup from enhanced data)
function parseMuscleEngagement(exerciseName: string): Record<string, number> {
  // This would lookup from the enhancedExerciseData in the future
  // For now, return empty object as placeholder
  return {}
}

// Enhanced storage: Save directly to Supabase (NO MORE localStorage)
export async function saveWorkoutSession(activeWorkout: any): Promise<{
  success: boolean
  error?: string
  sessionId?: string
}> {
  try {
    const detailedSession = createDetailedSession(activeWorkout)

    // Set development user ID if not provided (use proper UUID format)
    if (!detailedSession.user_id || detailedSession.user_id === 'demo-user') {
      detailedSession.user_id = '00000000-0000-4000-8000-000000000001' // Fixed development user UUID
    }

    // DIRECT SUPABASE SAVE - No localStorage dependency
    console.log('💾 Saving workout session directly to Supabase...')
    
    const savedSession = await dataService.saveDetailedWorkoutSession(detailedSession)
    
    console.log('✅ Workout session saved to Supabase:', savedSession.id)
    
    return {
      success: true,
      sessionId: savedSession.id
    }

  } catch (error) {
    console.error('❌ Supabase save failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database save failed'
    }
  }
}

// Load sessions directly from Supabase (NO MORE localStorage)
export async function loadWorkoutSessions(userId?: string): Promise<DetailedWorkoutSession[]> {
  try {
    // Use development user ID if not provided (proper UUID format)
    const targetUserId = userId || '00000000-0000-4000-8000-000000000001'
    
    console.log('📊 Loading workout sessions from Supabase for user:', targetUserId)
    
    // Load from Supabase database
    const sessions = await dataService.getWorkoutSessions(targetUserId)
    
    // Convert to DetailedWorkoutSession format
    const detailedSessions: DetailedWorkoutSession[] = []
    for (const session of sessions) {
      const detailed = await dataService.getDetailedWorkoutSession(session.id)
      if (detailed) {
        detailedSessions.push(detailed)
      }
    }
    
    console.log(`✅ Loaded ${detailedSessions.length} workout sessions from Supabase`)
    return detailedSessions
    
  } catch (error) {
    console.error('❌ Failed to load workout sessions from Supabase:', error)
    // Return empty array instead of localStorage fallback
    return []
  }
}

// Helper function to get user progress data for analytics
export async function getUserProgressData(userId?: string): Promise<{
  totalSessions: number
  totalVolume: number
  averageDuration: number
  recentSessions: DetailedWorkoutSession[]
}> {
  try {
    const targetUserId = userId || '00000000-0000-4000-8000-000000000001'
    
    // Get basic progress stats
    const progressStats = await dataService.getUserProgressStats(targetUserId, 30)
    
    // Get recent detailed sessions for analytics
    const recentSessions = await loadWorkoutSessions(targetUserId)
    
    return {
      totalSessions: progressStats.totalSessions,
      totalVolume: progressStats.totalVolume,
      averageDuration: progressStats.averageSessionDuration,
      recentSessions: recentSessions.slice(0, 10) // Last 10 sessions
    }
  } catch (error) {
    console.error('Failed to get user progress data:', error)
    return {
      totalSessions: 0,
      totalVolume: 0,
      averageDuration: 0,
      recentSessions: []
    }
  }
}