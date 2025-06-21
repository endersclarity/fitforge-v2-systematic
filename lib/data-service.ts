/**
 * FitForge Data Access Layer
 * Centralized service for all Supabase database operations
 * Provides type-safe interface for workout data management
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

// TypeScript interfaces for our data models
export interface Exercise {
  id: string
  name: string
  category: string
  equipment?: string
  difficulty?: string
  muscle_engagement: Record<string, number>
  instructions?: string[]
  tips?: string[]
  created_at?: string
  updated_at?: string
}

export interface WorkoutTemplate {
  id: string
  user_id: string
  name: string
  type: 'A' | 'B'
  description?: string
  exercises: Array<{
    exerciseId: string
    plannedSets: Array<{
      reps: number
      weight: number
      restTime?: number
    }>
  }>
  created_at?: string
  updated_at?: string
}

export interface WorkoutSession {
  id: string
  user_id: string
  workout_template_id?: string
  name: string
  start_time: string
  end_time?: string
  duration?: number // seconds
  perceived_difficulty?: 'Easy' | 'Moderate' | 'Hard' | 'Max Effort'
  workout_notes?: string
  planned_exercises: number
  performed_exercises: number
  adherence_rate: number
  total_volume: number
  total_sets: number
  created_at?: string
  updated_at?: string
}

export interface PerformedSet {
  id: string
  session_id: string
  exercise_id: string
  set_number: number
  planned_reps: number
  planned_weight: number
  reps: number
  weight: number
  completed: boolean
  rpe?: number | null // 1-10 Rate of Perceived Exertion
  e1rm?: number | null // Auto-calculated Estimated 1-Rep Max
  actual_rest_time?: number | null // seconds
  notes?: string | null
  completed_at: string
}

export interface UserStats {
  id: string
  user_id: string
  date: string
  weight?: number
  body_fat_percentage?: number
  sleep_quality?: number // 1-5
  energy_level?: number // 1-5
  soreness_level?: number // 1-5
  muscle_fatigue: Record<string, { fatigueScore: number; recoveryDate: string }>
  created_at?: string
}

// Enhanced workout session for legacy compatibility
export interface DetailedWorkoutSession extends WorkoutSession {
  date: string // Legacy compatibility field
  exercises: Array<{
    id: string
    name: string
    sets: PerformedSet[]
    muscleEngagement: Record<string, number>
    setsCompleted: number
    exerciseVolume: number
  }>
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Data Access Layer Class
 * Provides all CRUD operations for FitForge data
 */
export class DataService {
  
  // ==================== EXERCISE OPERATIONS ====================
  
  async getExercises(): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name')
    
    if (error) throw new Error(`Failed to fetch exercises: ${error.message}`)
    return data || []
  }

  async getExerciseById(id: string): Promise<Exercise | null> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch exercise: ${error.message}`)
    }
    return data
  }

  async createExercise(exercise: Omit<Exercise, 'id' | 'created_at' | 'updated_at'>): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .insert(exercise)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create exercise: ${error.message}`)
    return data
  }

  // ==================== WORKOUT TEMPLATE OPERATIONS ====================
  
  async getWorkoutTemplates(userId: string): Promise<WorkoutTemplate[]> {
    const { data, error } = await supabase
      .from('workouts') // Using existing table name
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw new Error(`Failed to fetch workout templates: ${error.message}`)
    return data || []
  }

  async createWorkoutTemplate(template: Omit<WorkoutTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<WorkoutTemplate> {
    const { data, error } = await supabase
      .from('workouts')
      .insert(template)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create workout template: ${error.message}`)
    return data
  }

  async updateWorkoutTemplate(id: string, updates: Partial<WorkoutTemplate>): Promise<WorkoutTemplate> {
    const { data, error } = await supabase
      .from('workouts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to update workout template: ${error.message}`)
    return data
  }

  async deleteWorkoutTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)
    
    if (error) throw new Error(`Failed to delete workout template: ${error.message}`)
  }

  // ==================== WORKOUT SESSION OPERATIONS ====================
  
  async getWorkoutSessions(userId: string, limit = 50): Promise<WorkoutSession[]> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(limit)
    
    if (error) throw new Error(`Failed to fetch workout sessions: ${error.message}`)
    return data || []
  }

  async getWorkoutSessionById(id: string): Promise<WorkoutSession | null> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch workout session: ${error.message}`)
    }
    return data
  }

  async createWorkoutSession(session: Omit<WorkoutSession, 'id' | 'created_at' | 'updated_at'>): Promise<WorkoutSession> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert(session)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create workout session: ${error.message}`)
    return data
  }

  async updateWorkoutSession(id: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to update workout session: ${error.message}`)
    return data
  }

  // ==================== PERFORMED SETS OPERATIONS ====================
  
  async getSetsBySession(sessionId: string): Promise<PerformedSet[]> {
    const { data, error } = await supabase
      .from('performed_sets')
      .select('*')
      .eq('session_id', sessionId)
      .order('set_number')
    
    if (error) throw new Error(`Failed to fetch sets: ${error.message}`)
    return data || []
  }

  async createPerformedSets(sets: Omit<PerformedSet, 'id' | 'created_at' | 'e1rm'>[]): Promise<PerformedSet[]> {
    const { data, error } = await supabase
      .from('performed_sets')
      .insert(sets)
      .select()
    
    if (error) throw new Error(`Failed to create performed sets: ${error.message}`)
    return data || []
  }

  async updatePerformedSet(id: string, updates: Partial<PerformedSet>): Promise<PerformedSet> {
    const { data, error } = await supabase
      .from('performed_sets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to update performed set: ${error.message}`)
    return data
  }

  async deletePerformedSet(id: string): Promise<void> {
    const { error } = await supabase
      .from('performed_sets')
      .delete()
      .eq('id', id)
    
    if (error) throw new Error(`Failed to delete performed set: ${error.message}`)
  }

  // ==================== ANALYTICS & REPORTING ====================
  
  async getExerciseHistory(userId: string, exerciseId: string, limit = 20): Promise<PerformedSet[]> {
    const { data, error } = await supabase
      .from('performed_sets')
      .select(`
        *,
        workout_sessions!inner(user_id, start_time)
      `)
      .eq('exercise_id', exerciseId)
      .eq('workout_sessions.user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit)
    
    if (error) throw new Error(`Failed to fetch exercise history: ${error.message}`)
    return data || []
  }

  async getUserProgressStats(userId: string, days = 30): Promise<{
    totalSessions: number
    totalVolume: number
    totalSets: number
    averageSessionDuration: number
    strongestLifts: Array<{ exercise: string; maxE1RM: number }>
  }> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    // Get session stats
    const { data: sessions, error: sessionsError } = await supabase
      .from('workout_sessions')
      .select('total_volume, total_sets, duration')
      .eq('user_id', userId)
      .gte('start_time', cutoffDate.toISOString())
    
    if (sessionsError) throw new Error(`Failed to fetch progress stats: ${sessionsError.message}`)
    
    // Get strongest lifts
    const { data: strongestLifts, error: liftsError } = await supabase
      .from('performed_sets')
      .select(`
        e1rm,
        exercises!inner(name),
        workout_sessions!inner(user_id)
      `)
      .eq('workout_sessions.user_id', userId)
      .gte('completed_at', cutoffDate.toISOString())
      .order('e1rm', { ascending: false })
      .limit(5)
    
    if (liftsError) throw new Error(`Failed to fetch strongest lifts: ${liftsError.message}`)
    
    const totalSessions = sessions?.length || 0
    const totalVolume = sessions?.reduce((sum, s) => sum + (s.total_volume || 0), 0) || 0
    const totalSets = sessions?.reduce((sum, s) => sum + (s.total_sets || 0), 0) || 0
    const averageSessionDuration = sessions?.length 
      ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length 
      : 0
    
    return {
      totalSessions,
      totalVolume,
      totalSets,
      averageSessionDuration,
      strongestLifts: strongestLifts?.map((lift: any) => ({
        exercise: lift.exercises?.name || 'Unknown',
        maxE1RM: lift.e1rm || 0
      })) || []
    }
  }

  // ==================== USER STATS OPERATIONS ====================
  
  async getUserStats(userId: string, date: string): Promise<UserStats | null> {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch user stats: ${error.message}`)
    }
    return data
  }

  async upsertUserStats(stats: Omit<UserStats, 'id' | 'created_at'>): Promise<UserStats> {
    const { data, error } = await supabase
      .from('user_stats')
      .upsert(stats, { onConflict: 'user_id,date' })
      .select()
      .single()
    
    if (error) throw new Error(`Failed to save user stats: ${error.message}`)
    return data
  }

  // ==================== LEGACY COMPATIBILITY ====================
  
  /**
   * Create a detailed workout session from active workout data
   * Maintains compatibility with existing UI components
   */
  async saveDetailedWorkoutSession(detailedSession: Omit<DetailedWorkoutSession, 'id' | 'created_at' | 'updated_at'>): Promise<DetailedWorkoutSession> {
    // Start transaction-like behavior (Supabase handles atomicity per operation)
    try {
      // 1. Create the workout session (map fields correctly)
      const session = await this.createWorkoutSession({
        user_id: detailedSession.user_id,
        name: detailedSession.name,
        start_time: detailedSession.start_time,
        end_time: detailedSession.end_time,
        duration: detailedSession.duration ? Math.round(detailedSession.duration / 60) : undefined, // Convert to minutes
        workout_notes: detailedSession.notes,
        planned_exercises: detailedSession.exercises.length, // Use actual exercise count
        performed_exercises: detailedSession.total_exercises,
        adherence_rate: Math.round((detailedSession.total_exercises / detailedSession.exercises.length) * 100),
        total_volume: detailedSession.total_volume,
        total_sets: detailedSession.total_sets
      })

      // 2. Create all performed sets
      const allSets: Omit<PerformedSet, 'id' | 'created_at' | 'e1rm'>[] = []
      
      for (const exercise of detailedSession.exercises) {
        exercise.sets.forEach((set, index) => {
          allSets.push({
            session_id: session.id,
            exercise_id: exercise.id,
            set_number: index + 1,
            planned_reps: set.planned_reps,
            planned_weight: set.planned_weight,
            reps: set.reps,
            weight: set.weight,
            completed: set.completed,
            rpe: set.rpe,
            actual_rest_time: set.actual_rest_time,
            notes: set.notes,
            completed_at: set.completed_at
          })
        })
      }

      await this.createPerformedSets(allSets)

      // 3. Return the detailed session (fetch fresh data to get calculated fields)
      return await this.getDetailedWorkoutSession(session.id) as DetailedWorkoutSession
      
    } catch (error) {
      throw new Error(`Failed to save detailed workout session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get a detailed workout session with all exercise and set data
   */
  async getDetailedWorkoutSession(sessionId: string): Promise<DetailedWorkoutSession | null> {
    const session = await this.getWorkoutSessionById(sessionId)
    if (!session) return null

    const sets = await this.getSetsBySession(sessionId)
    
    // Group sets by exercise
    const exerciseGroups = new Map<string, PerformedSet[]>()
    for (const set of sets) {
      if (!exerciseGroups.has(set.exercise_id)) {
        exerciseGroups.set(set.exercise_id, [])
      }
      exerciseGroups.get(set.exercise_id)!.push(set)
    }

    // Build exercise data with sets
    const exercises = []
    for (const [exerciseId, exerciseSets] of exerciseGroups) {
      const exercise = await this.getExerciseById(exerciseId)
      if (exercise) {
        const setsCompleted = exerciseSets.length
        const exerciseVolume = exerciseSets.reduce((sum, set) => sum + (set.reps * set.weight), 0)
        
        exercises.push({
          id: exercise.id,
          name: exercise.name,
          sets: exerciseSets,
          muscleEngagement: exercise.muscle_engagement,
          setsCompleted,
          exerciseVolume
        })
      }
    }

    return {
      ...session,
      date: session.start_time, // Legacy compatibility field
      exercises
    }
  }
}

// Export singleton instance
export const dataService = new DataService()
export default dataService