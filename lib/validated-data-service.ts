/**
 * FitForge Validated Data Service
 * Type-safe data access layer with Zod schema validation
 * Ensures all data going in/out of the database is validated
 */

import { createClient } from '@supabase/supabase-js'
import { 
  WorkoutSchema, 
  WorkoutCreateSchema, 
  WorkoutSessionSchema, 
  WorkoutSessionCreateSchema,
  ExerciseSchema,
  type Workout,
  type WorkoutCreate,
  type WorkoutSession,
  type WorkoutSessionCreate,
  type Exercise
} from '@/schemas/workout'
import { ZodError } from 'zod'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
)

export class ValidatedDataService {
  // Workout Operations
  async createWorkout(data: WorkoutCreate, userId: string): Promise<Workout> {
    try {
      // Validate input with Zod
      const validatedData = WorkoutCreateSchema.parse({ ...data, userId })

      const { data: workout, error } = await supabase
        .from('workouts')
        .insert({
          id: validatedData.id,
          user_id: validatedData.userId,
          name: validatedData.name,
          type: validatedData.type,
          status: validatedData.status,
          notes: validatedData.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)

      // Insert exercises
      if (validatedData.exercises.length > 0) {
        const { error: exercisesError } = await supabase
          .from('workout_exercises')
          .insert(
            validatedData.exercises.map(ex => ({
              id: ex.id,
              workout_id: validatedData.id,
              exercise_id: ex.exerciseId,
              order_in_workout: ex.orderInWorkout,
              rest_time_seconds: ex.restTimeSeconds,
              notes: ex.notes
            }))
          )

        if (exercisesError) throw new Error(`Exercise insert error: ${exercisesError.message}`)

        // Insert sets for each exercise
        for (const exercise of validatedData.exercises) {
          if (exercise.sets.length > 0) {
            const { error: setsError } = await supabase
              .from('exercise_sets')
              .insert(
                exercise.sets.map(set => ({
                  id: set.id,
                  workout_exercise_id: exercise.id,
                  order_in_exercise: set.orderInExercise,
                  planned_reps: set.reps,
                  planned_weight: set.weight,
                  actual_reps: set.completed ? set.reps : null,
                  actual_weight: set.completed ? set.weight : null,
                  completed: set.completed,
                  duration_seconds: set.durationSeconds,
                  distance_meters: set.distanceMeters
                }))
              )

            if (setsError) throw new Error(`Sets insert error: ${setsError.message}`)
          }
        }
      }

      // Fetch and return complete workout
      const completeWorkout = await this.getWorkout(validatedData.id, userId)
      if (!completeWorkout) throw new Error('Failed to retrieve created workout')

      return completeWorkout

    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`)
      }
      throw error
    }
  }

  async getWorkout(id: string, userId: string): Promise<Workout | null> {
    try {
      const { data: workout, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            *,
            exercise_sets (*),
            exercises (*)
          )
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (error || !workout) return null

      // Transform database structure to our schema format
      const transformedWorkout = {
        id: workout.id,
        userId: workout.user_id,
        name: workout.name,
        type: workout.type,
        status: workout.status,
        notes: workout.notes,
        createdAt: new Date(workout.created_at),
        updatedAt: new Date(workout.updated_at),
        completedAt: workout.completed_at ? new Date(workout.completed_at) : undefined,
        exercises: workout.workout_exercises
          .sort((a: any, b: any) => a.order_in_workout - b.order_in_workout)
          .map((we: any) => ({
            id: we.id,
            exerciseId: we.exercise_id,
            name: we.exercises.name,
            orderInWorkout: we.order_in_workout,
            restTimeSeconds: we.rest_time_seconds,
            notes: we.notes,
            sets: we.exercise_sets
              .sort((a: any, b: any) => a.order_in_exercise - b.order_in_exercise)
              .map((set: any) => ({
                id: set.id,
                orderInExercise: set.order_in_exercise,
                reps: set.planned_reps,
                weight: set.planned_weight,
                completed: set.completed,
                actualReps: set.actual_reps,
                actualWeight: set.actual_weight,
                durationSeconds: set.duration_seconds,
                distanceMeters: set.distance_meters
              }))
          }))
      }

      // Validate with Zod before returning
      return WorkoutSchema.parse(transformedWorkout)

    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Data validation error in getWorkout:', error.errors)
        throw new Error('Invalid workout data from database')
      }
      throw error
    }
  }

  async getWorkouts(
    userId: string, 
    options: { limit?: number; status?: 'draft' | 'completed' | 'template' } = {}
  ): Promise<Workout[]> {
    try {
      let query = supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            *,
            exercise_sets (*),
            exercises (*)
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (options.status) {
        query = query.eq('status', options.status)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data: workouts, error } = await query

      if (error) throw new Error(`Database error: ${error.message}`)
      if (!workouts) return []

      // Transform and validate each workout
      const validatedWorkouts = workouts.map(workout => {
        const transformed = {
          id: workout.id,
          userId: workout.user_id,
          name: workout.name,
          type: workout.type,
          status: workout.status,
          notes: workout.notes,
          createdAt: new Date(workout.created_at),
          updatedAt: new Date(workout.updated_at),
          completedAt: workout.completed_at ? new Date(workout.completed_at) : undefined,
          exercises: workout.workout_exercises
            .sort((a: any, b: any) => a.order_in_workout - b.order_in_workout)
            .map((we: any) => ({
              id: we.id,
              exerciseId: we.exercise_id,
              name: we.exercises.name,
              orderInWorkout: we.order_in_workout,
              restTimeSeconds: we.rest_time_seconds,
              notes: we.notes,
              sets: we.exercise_sets
                .sort((a: any, b: any) => a.order_in_exercise - b.order_in_exercise)
                .map((set: any) => ({
                  id: set.id,
                  orderInExercise: set.order_in_exercise,
                  reps: set.planned_reps,
                  weight: set.planned_weight,
                  completed: set.completed,
                  actualReps: set.actual_reps,
                  actualWeight: set.actual_weight,
                  durationSeconds: set.duration_seconds,
                  distanceMeters: set.distance_meters
                }))
            }))
        }

        return WorkoutSchema.parse(transformed)
      })

      return validatedWorkouts

    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Data validation error in getWorkouts:', error.errors)
        throw new Error('Invalid workout data from database')
      }
      throw error
    }
  }

  async updateWorkout(data: Workout, userId: string): Promise<Workout> {
    try {
      // Validate input with Zod
      const validatedData = WorkoutSchema.parse(data)

      // Ensure user owns the workout
      const existingWorkout = await this.getWorkout(validatedData.id, userId)
      if (!existingWorkout) {
        throw new Error('Workout not found or access denied')
      }

      // Update main workout record
      const { error: workoutError } = await supabase
        .from('workouts')
        .update({
          name: validatedData.name,
          type: validatedData.type,
          status: validatedData.status,
          notes: validatedData.notes,
          completed_at: validatedData.completedAt?.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', validatedData.id)
        .eq('user_id', userId)

      if (workoutError) throw new Error(`Workout update error: ${workoutError.message}`)

      // Handle exercise updates (simplified - could be more sophisticated)
      // Delete existing exercises and recreate (transaction would be better)
      await supabase.from('exercise_sets').delete().in(
        'workout_exercise_id',
        existingWorkout.exercises.map(ex => ex.id)
      )
      
      await supabase.from('workout_exercises').delete().eq('workout_id', validatedData.id)

      // Re-insert exercises and sets
      if (validatedData.exercises.length > 0) {
        const { error: exercisesError } = await supabase
          .from('workout_exercises')
          .insert(
            validatedData.exercises.map(ex => ({
              id: ex.id,
              workout_id: validatedData.id,
              exercise_id: ex.exerciseId,
              order_in_workout: ex.orderInWorkout,
              rest_time_seconds: ex.restTimeSeconds,
              notes: ex.notes
            }))
          )

        if (exercisesError) throw new Error(`Exercise update error: ${exercisesError.message}`)

        // Insert sets
        for (const exercise of validatedData.exercises) {
          if (exercise.sets.length > 0) {
            const { error: setsError } = await supabase
              .from('exercise_sets')
              .insert(
                exercise.sets.map(set => ({
                  id: set.id,
                  workout_exercise_id: exercise.id,
                  order_in_exercise: set.orderInExercise,
                  planned_reps: set.reps,
                  planned_weight: set.weight,
                  actual_reps: set.actualReps,
                  actual_weight: set.actualWeight,
                  completed: set.completed,
                  duration_seconds: set.durationSeconds,
                  distance_meters: set.distanceMeters
                }))
              )

            if (setsError) throw new Error(`Sets update error: ${setsError.message}`)
          }
        }
      }

      // Return updated workout
      const updatedWorkout = await this.getWorkout(validatedData.id, userId)
      if (!updatedWorkout) throw new Error('Failed to retrieve updated workout')

      return updatedWorkout

    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`)
      }
      throw error
    }
  }

  async deleteWorkout(id: string, userId: string): Promise<void> {
    try {
      // Verify ownership
      const workout = await this.getWorkout(id, userId)
      if (!workout) {
        throw new Error('Workout not found or access denied')
      }

      // Business rule: prevent deletion of completed workouts
      if (workout.status === 'completed') {
        throw new Error('Cannot delete completed workouts')
      }

      // Delete in order: sets -> exercises -> workout
      await supabase.from('exercise_sets').delete().in(
        'workout_exercise_id',
        workout.exercises.map(ex => ex.id)
      )
      
      await supabase.from('workout_exercises').delete().eq('workout_id', id)
      
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw new Error(`Delete error: ${error.message}`)

    } catch (error) {
      throw error
    }
  }

  // Exercise Operations
  async getExercises(): Promise<Exercise[]> {
    try {
      const { data: exercises, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name')

      if (error) throw new Error(`Database error: ${error.message}`)
      if (!exercises) return []

      // Transform and validate
      const validatedExercises = exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        category: ex.category,
        equipment: ex.equipment,
        difficulty: ex.difficulty,
        primaryMuscles: ex.primary_muscles || [],
        secondaryMuscles: ex.secondary_muscles || [],
        instructions: ex.instructions || [],
        tips: ex.tips || [],
        muscleEngagement: ex.muscle_engagement || {},
        createdAt: ex.created_at ? new Date(ex.created_at) : undefined,
        updatedAt: ex.updated_at ? new Date(ex.updated_at) : undefined
      }))

      return validatedExercises.map(ex => ExerciseSchema.parse(ex))

    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Data validation error in getExercises:', error.errors)
        throw new Error('Invalid exercise data from database')
      }
      throw error
    }
  }

  // Workout Session Operations (for completed workouts)
  async createWorkoutSession(data: WorkoutSessionCreate, userId: string): Promise<WorkoutSession> {
    try {
      const validatedData = WorkoutSessionCreateSchema.parse({ ...data, userId })

      const { data: session, error } = await supabase
        .from('workout_sessions')
        .insert({
          id: validatedData.id,
          user_id: validatedData.userId,
          workout_id: validatedData.workoutId,
          started_at: validatedData.startedAt.toISOString(),
          completed_at: validatedData.completedAt?.toISOString(),
          duration_seconds: validatedData.durationSeconds,
          perceived_difficulty: validatedData.perceivedDifficulty,
          notes: validatedData.notes,
          body_weight: validatedData.bodyWeight
        })
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)

      return WorkoutSessionSchema.parse({
        id: session.id,
        userId: session.user_id,
        workoutId: session.workout_id,
        startedAt: new Date(session.started_at),
        completedAt: session.completed_at ? new Date(session.completed_at) : undefined,
        durationSeconds: session.duration_seconds,
        perceivedDifficulty: session.perceived_difficulty,
        notes: session.notes,
        bodyWeight: session.body_weight
      })

    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`)
      }
      throw error
    }
  }
}

// Export singleton instance
export const validatedDataService = new ValidatedDataService()