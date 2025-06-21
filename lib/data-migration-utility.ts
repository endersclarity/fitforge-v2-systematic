/**
 * Data Migration Utility
 * Imports existing JSON data to Supabase normalized schema
 */

import { dataService } from './data-service'
import exercisesData from '@/data/exercises.json'

// Legacy types for existing data
interface LegacyWorkoutSession {
  id: string
  name: string
  date: string
  duration: number
  startTime: string
  endTime: string
  exercises: {
    id: string
    name: string
    sets: {
      id: string
      reps: number
      weight: number
      completed: boolean
      restTime?: number
    }[]
    muscleEngagement: Record<string, number>
    setsCompleted: number
    exerciseVolume: number
  }[]
  totalVolume: number
  totalSets: number
  completionRate?: number
  plannedExercises?: number
  performedExercises?: number
  adherenceRate?: number
}

/**
 * Import exercises from exercises.json to Supabase
 */
export async function migrateExercises(): Promise<void> {
  console.log('Starting exercise migration...')
  
  try {
    // Check if exercises already exist
    const existingExercises = await dataService.getExercises()
    if (existingExercises.length > 0) {
      console.log(`Found ${existingExercises.length} existing exercises, skipping migration`)
      return
    }

    // Import each exercise
    let imported = 0
    for (const exercise of exercisesData) {
      try {
        await dataService.createExercise({
          name: exercise.name,
          category: exercise.category,
          equipment: exercise.equipment,
          difficulty: exercise.difficulty,
          muscle_engagement: exercise.muscleEngagement || {},
          instructions: exercise.instructions || [],
          tips: exercise.tips || []
        })
        imported++
      } catch (error) {
        console.error(`Failed to import exercise ${exercise.name}:`, error)
      }
    }

    console.log(`Successfully imported ${imported} exercises`)
  } catch (error) {
    console.error('Exercise migration failed:', error)
    throw error
  }
}

/**
 * Import workout sessions from workout-sessions.json to Supabase
 */
export async function migrateWorkoutSessions(userId: string, sessionsData: LegacyWorkoutSession[]): Promise<void> {
  console.log(`Starting workout session migration for user ${userId}...`)
  
  try {
    let imported = 0
    let skipped = 0

    for (const session of sessionsData) {
      try {
        // Check if session already exists
        const existing = await dataService.getWorkoutSessionById(session.id)
        if (existing) {
          skipped++
          continue
        }

        // Convert legacy session to new format
        const migratedSession = await convertLegacySession(session, userId)
        
        // Save via Data Access Layer
        await dataService.saveDetailedWorkoutSession(migratedSession)
        imported++
        
      } catch (error) {
        console.error(`Failed to import session ${session.id}:`, error)
      }
    }

    console.log(`Migration complete: ${imported} imported, ${skipped} skipped`)
  } catch (error) {
    console.error('Workout session migration failed:', error)
    throw error
  }
}

/**
 * Convert legacy workout session to new data model
 */
async function convertLegacySession(legacySession: LegacyWorkoutSession, userId: string) {
  // Map exercise names to IDs
  const exercises = await dataService.getExercises()
  const exerciseMap = new Map(exercises.map(ex => [ex.name, ex.id]))

  // Convert exercises and sets
  const convertedExercises = []
  
  for (const exercise of legacySession.exercises) {
    const exerciseId = exerciseMap.get(exercise.name)
    if (!exerciseId) {
      console.warn(`Exercise not found: ${exercise.name}`)
      continue
    }

    // Convert sets to new format with enhanced data
    const convertedSets = exercise.sets.map((set, index) => ({
      id: set.id,
      session_id: '', // Will be set when saving
      exercise_id: exerciseId,
      set_number: index + 1,
      // Legacy data as actuals (no plan vs actual distinction in old data)
      planned_reps: set.reps,
      planned_weight: set.weight,
      reps: set.reps,
      weight: set.weight,
      completed: set.completed,
      // New fields set to null for legacy data
      rpe: null,
      actual_rest_time: set.restTime || null,
      notes: null,
      completed_at: legacySession.endTime
    }))

    convertedExercises.push({
      id: exerciseId,
      name: exercise.name,
      sets: convertedSets,
      muscleEngagement: exercise.muscleEngagement,
      setsCompleted: exercise.setsCompleted,
      exerciseVolume: exercise.exerciseVolume
    })
  }

  // Convert to new session format
  return {
    id: legacySession.id,
    user_id: userId,
    workout_template_id: undefined,
    name: legacySession.name,
    start_time: legacySession.startTime,
    end_time: legacySession.endTime,
    duration: legacySession.duration * 60, // Convert minutes to seconds
    // New fields not in legacy data
    perceived_difficulty: undefined,
    workout_notes: undefined,
    // Adherence tracking (use legacy values or defaults)
    planned_exercises: legacySession.plannedExercises || legacySession.exercises.length,
    performed_exercises: legacySession.performedExercises || convertedExercises.length,
    adherence_rate: legacySession.adherenceRate || 100,
    // Calculated metrics
    total_volume: legacySession.totalVolume,
    total_sets: legacySession.totalSets,
    // Legacy compatibility
    date: legacySession.date,
    exercises: convertedExercises
  }
}

/**
 * Complete migration process
 */
export async function runFullMigration(userId: string): Promise<{
  success: boolean
  exercisesMigrated: number
  sessionsMigrated: number
  errors: string[]
}> {
  const errors: string[] = []
  let exercisesMigrated = 0
  let sessionsMigrated = 0

  try {
    // Step 1: Migrate exercises
    const existingExercises = await dataService.getExercises()
    if (existingExercises.length === 0) {
      await migrateExercises()
      exercisesMigrated = exercisesData.length
    } else {
      console.log('Exercises already migrated')
    }

    // Step 2: Migrate workout sessions from localStorage
    if (typeof window !== 'undefined') {
      const localSessions = localStorage.getItem('workoutSessions')
      if (localSessions) {
        const sessions: LegacyWorkoutSession[] = JSON.parse(localSessions)
        const existingSessions = await dataService.getWorkoutSessions(userId, 1000)
        
        if (existingSessions.length === 0 && sessions.length > 0) {
          await migrateWorkoutSessions(userId, sessions)
          sessionsMigrated = sessions.length
        } else {
          console.log(`Found ${existingSessions.length} existing sessions, migration not needed`)
        }
      }
    }

    return {
      success: true,
      exercisesMigrated,
      sessionsMigrated,
      errors
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    errors.push(errorMessage)
    
    return {
      success: false,
      exercisesMigrated,
      sessionsMigrated,
      errors
    }
  }
}

/**
 * Migration status check
 */
export async function checkMigrationStatus(): Promise<{
  exercisesCount: number
  exercisesMigrated: boolean
  sessionsMigrated: boolean
  localSessionsCount: number
}> {
  try {
    const exercises = await dataService.getExercises()
    const exercisesCount = exercises.length
    const exercisesMigrated = exercisesCount > 0

    // Check for local sessions
    let localSessionsCount = 0
    if (typeof window !== 'undefined') {
      const localSessions = localStorage.getItem('workoutSessions')
      if (localSessions) {
        localSessionsCount = JSON.parse(localSessions).length
      }
    }

    // For sessions, we can't easily check without a user ID
    // This would need to be called after authentication
    
    return {
      exercisesCount,
      exercisesMigrated,
      sessionsMigrated: false, // Would need user context to check
      localSessionsCount
    }
  } catch (error) {
    console.error('Failed to check migration status:', error)
    return {
      exercisesCount: 0,
      exercisesMigrated: false,
      sessionsMigrated: false,
      localSessionsCount: 0
    }
  }
}