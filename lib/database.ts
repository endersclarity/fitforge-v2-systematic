import { supabase } from './supabase'
import { getUserId } from './auth'

// Workout Types
export interface WorkoutExercise {
  id: string
  name: string
  sets: ExerciseSet[]
  restTime: number
  notes: string
}

export interface ExerciseSet {
  id: string
  reps: number
  weight: number
  completed: boolean
}

export interface Workout {
  id: string
  user_id: string
  name: string
  type: 'A' | 'B'
  exercises: WorkoutExercise[]
  created_at: string
  updated_at: string
}

export interface WorkoutSession {
  id: string
  user_id: string
  workout_id: string
  started_at: string
  completed_at: string | null
  duration_minutes: number | null
  exercises_completed: WorkoutExercise[]
  notes: string | null
  created_at: string
}

// Workout Database Operations
export const workoutDB = {
  // Create a new workout
  async createWorkout(workout: Omit<Workout, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const userId = await getUserId()
    if (!userId) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('workouts')
      .insert({
        ...workout,
        user_id: userId,
      })
      .select()
      .single()

    return { data, error }
  },

  // Get all workouts for current user
  async getUserWorkouts() {
    const userId = await getUserId()
    if (!userId) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Get specific workout
  async getWorkout(workoutId: string) {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', workoutId)
      .single()

    return { data, error }
  },

  // Update workout
  async updateWorkout(workoutId: string, updates: Partial<Workout>) {
    const { data, error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', workoutId)
      .select()
      .single()

    return { data, error }
  },

  // Delete workout
  async deleteWorkout(workoutId: string) {
    const { data, error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId)

    return { data, error }
  },
}

// Workout Session Database Operations
export const sessionDB = {
  // Start a new workout session
  async startSession(workoutId: string, notes?: string) {
    const userId = await getUserId()
    if (!userId) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: userId,
        workout_id: workoutId,
        started_at: new Date().toISOString(),
        notes,
      })
      .select()
      .single()

    return { data, error }
  },

  // Complete a workout session
  async completeSession(
    sessionId: string, 
    exercisesCompleted: WorkoutExercise[], 
    notes?: string
  ) {
    const completedAt = new Date()
    const { data: session } = await supabase
      .from('workout_sessions')
      .select('started_at')
      .eq('id', sessionId)
      .single()

    const durationMinutes = session 
      ? Math.round((completedAt.getTime() - new Date(session.started_at).getTime()) / 60000)
      : null

    const { data, error } = await supabase
      .from('workout_sessions')
      .update({
        completed_at: completedAt.toISOString(),
        duration_minutes: durationMinutes,
        exercises_completed: exercisesCompleted,
        notes,
      })
      .eq('id', sessionId)
      .select()
      .single()

    return { data, error }
  },

  // Get user's workout sessions
  async getUserSessions(limit = 20) {
    const userId = await getUserId()
    if (!userId) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        workouts:workout_id (
          name,
          type
        )
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit)

    return { data, error }
  },

  // Get session by ID
  async getSession(sessionId: string) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        workouts:workout_id (
          name,
          type,
          exercises
        )
      `)
      .eq('id', sessionId)
      .single()

    return { data, error }
  },
}

// Exercise Database Operations
export const exerciseDB = {
  // Get all exercises
  async getAllExercises() {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name')

    return { data, error }
  },

  // Get exercises by category
  async getExercisesByCategory(category: string) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('category', category)
      .order('name')

    return { data, error }
  },

  // Search exercises
  async searchExercises(query: string) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name')

    return { data, error }
  },

  // Populate exercises from our existing data
  async populateExercises(exercises: any[]) {
    const { data, error } = await supabase
      .from('exercises')
      .upsert(exercises, { onConflict: 'name' })

    return { data, error }
  },
}

// User Stats Operations
export const statsDB = {
  // Get user stats
  async getUserStats() {
    const userId = await getUserId()
    if (!userId) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    return { data, error }
  },

  // Update user stats
  async updateStats(stats: {
    total_workouts?: number
    total_exercises?: number
    total_volume_pounds?: number
    favorite_exercises?: string[]
    muscle_fatigue?: Record<string, number>
  }) {
    const userId = await getUserId()
    if (!userId) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        ...stats,
      })
      .select()
      .single()

    return { data, error }
  },

  // Increment workout count
  async incrementWorkoutCount() {
    const { data: currentStats } = await this.getUserStats()
    const newCount = (currentStats?.total_workouts || 0) + 1
    
    return this.updateStats({ total_workouts: newCount })
  },
}