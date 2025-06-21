import { supabase } from './supabase'

export interface WorkoutTemplate {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  
  // Template Info
  name: string
  description?: string
  workout_type: 'A' | 'B' | 'C' | 'D'
  category?: 'strength' | 'hypertrophy' | 'endurance' | 'powerlifting' | 'bodybuilding' | 'general'
  
  // Template Structure
  exercises: WorkoutTemplateExercise[]
  estimated_duration?: number // minutes
  difficulty_level: number // 1-5
  
  // Usage Tracking
  times_used: number
  last_used_at?: string
  is_favorite: boolean
  is_public: boolean
  
  // Metadata
  tags: string[]
  notes?: string
}

export interface WorkoutTemplateExercise {
  id?: string
  exercise_id: string
  exercise_name?: string // populated from join
  order_index: number
  
  // Exercise Configuration
  target_sets: number
  target_reps_min?: number
  target_reps_max?: number
  target_weight?: number
  rest_time_seconds: number
  
  // Progressive Overload Settings
  progression_type: 'weight' | 'reps' | 'sets' | 'time'
  progression_amount: number
  
  // Notes and Modifications
  notes?: string
  is_superset: boolean
  superset_group?: number
}

export interface CreateWorkoutTemplateData {
  user_id: string
  name: string
  description?: string
  workout_type: 'A' | 'B' | 'C' | 'D'
  category?: 'strength' | 'hypertrophy' | 'endurance' | 'powerlifting' | 'bodybuilding' | 'general'
  exercises: Omit<WorkoutTemplateExercise, 'id'>[]
  estimated_duration?: number
  difficulty_level?: number
  tags?: string[]
  notes?: string
}

export interface UpdateWorkoutTemplateData extends Partial<CreateWorkoutTemplateData> {
  id: string
}

class WorkoutTemplateService {
  /**
   * Get all workout templates for a user
   */
  async getUserWorkoutTemplates(userId: string): Promise<WorkoutTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select(`
          *,
          workout_template_exercises (
            *,
            exercises (name)
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      return data.map(template => ({
        ...template,
        exercises: template.workout_template_exercises.map((ex: any) => ({
          ...ex,
          exercise_name: ex.exercises?.name
        }))
      }))
    } catch (error) {
      console.error('Error getting user workout templates:', error)
      throw error
    }
  }

  /**
   * Get single workout template by ID
   */
  async getWorkoutTemplate(templateId: string): Promise<WorkoutTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select(`
          *,
          workout_template_exercises (
            *,
            exercises (name)
          )
        `)
        .eq('id', templateId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }

      return {
        ...data,
        exercises: data.workout_template_exercises.map((ex: any) => ({
          ...ex,
          exercise_name: ex.exercises?.name
        }))
      }
    } catch (error) {
      console.error('Error getting workout template:', error)
      throw error
    }
  }

  /**
   * Create new workout template
   */
  async createWorkoutTemplate(templateData: CreateWorkoutTemplateData): Promise<WorkoutTemplate> {
    try {
      // Create the template
      const { data: template, error: templateError } = await supabase
        .from('workout_templates')
        .insert([{
          user_id: templateData.user_id,
          name: templateData.name,
          description: templateData.description,
          workout_type: templateData.workout_type,
          category: templateData.category,
          estimated_duration: templateData.estimated_duration,
          difficulty_level: templateData.difficulty_level || 3,
          tags: templateData.tags || [],
          notes: templateData.notes,
          exercises: [] // Will be populated via normalized table
        }])
        .select()
        .single()

      if (templateError) throw templateError

      // Create template exercises
      if (templateData.exercises.length > 0) {
        const exerciseData = templateData.exercises.map(ex => ({
          template_id: template.id,
          exercise_id: ex.exercise_id,
          order_index: ex.order_index,
          target_sets: ex.target_sets,
          target_reps_min: ex.target_reps_min,
          target_reps_max: ex.target_reps_max,
          target_weight: ex.target_weight,
          rest_time_seconds: ex.rest_time_seconds,
          progression_type: ex.progression_type,
          progression_amount: ex.progression_amount,
          notes: ex.notes,
          is_superset: ex.is_superset,
          superset_group: ex.superset_group
        }))

        const { error: exerciseError } = await supabase
          .from('workout_template_exercises')
          .insert(exerciseData)

        if (exerciseError) throw exerciseError
      }

      // Return the complete template
      return this.getWorkoutTemplate(template.id) as Promise<WorkoutTemplate>
    } catch (error) {
      console.error('Error creating workout template:', error)
      throw error
    }
  }

  /**
   * Update workout template
   */
  async updateWorkoutTemplate(templateData: UpdateWorkoutTemplateData): Promise<WorkoutTemplate> {
    try {
      // Update the template
      const { error: templateError } = await supabase
        .from('workout_templates')
        .update({
          name: templateData.name,
          description: templateData.description,
          workout_type: templateData.workout_type,
          category: templateData.category,
          estimated_duration: templateData.estimated_duration,
          difficulty_level: templateData.difficulty_level,
          tags: templateData.tags,
          notes: templateData.notes
        })
        .eq('id', templateData.id)

      if (templateError) throw templateError

      // Update exercises if provided
      if (templateData.exercises) {
        // Delete existing exercises
        await supabase
          .from('workout_template_exercises')
          .delete()
          .eq('template_id', templateData.id)

        // Insert new exercises
        if (templateData.exercises.length > 0) {
          const exerciseData = templateData.exercises.map(ex => ({
            template_id: templateData.id,
            exercise_id: ex.exercise_id,
            order_index: ex.order_index,
            target_sets: ex.target_sets,
            target_reps_min: ex.target_reps_min,
            target_reps_max: ex.target_reps_max,
            target_weight: ex.target_weight,
            rest_time_seconds: ex.rest_time_seconds,
            progression_type: ex.progression_type,
            progression_amount: ex.progression_amount,
            notes: ex.notes,
            is_superset: ex.is_superset,
            superset_group: ex.superset_group
          }))

          const { error: exerciseError } = await supabase
            .from('workout_template_exercises')
            .insert(exerciseData)

          if (exerciseError) throw exerciseError
        }
      }

      // Return the updated template
      return this.getWorkoutTemplate(templateData.id) as Promise<WorkoutTemplate>
    } catch (error) {
      console.error('Error updating workout template:', error)
      throw error
    }
  }

  /**
   * Delete workout template
   */
  async deleteWorkoutTemplate(templateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workout_templates')
        .delete()
        .eq('id', templateId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting workout template:', error)
      throw error
    }
  }

  /**
   * Mark template as used (increment usage count)
   */
  async markTemplateUsed(templateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workout_templates')
        .update({
          times_used: supabase.rpc('increment_times_used', { template_id: templateId }),
          last_used_at: new Date().toISOString()
        })
        .eq('id', templateId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking template as used:', error)
      throw error
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(templateId: string): Promise<void> {
    try {
      // Get current favorite status
      const { data: template } = await supabase
        .from('workout_templates')
        .select('is_favorite')
        .eq('id', templateId)
        .single()

      if (!template) throw new Error('Template not found')

      // Toggle favorite
      const { error } = await supabase
        .from('workout_templates')
        .update({ is_favorite: !template.is_favorite })
        .eq('id', templateId)

      if (error) throw error
    } catch (error) {
      console.error('Error toggling favorite:', error)
      throw error
    }
  }

  /**
   * Get public workout templates
   */
  async getPublicWorkoutTemplates(limit: number = 20): Promise<WorkoutTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select(`
          *,
          workout_template_exercises (
            *,
            exercises (name)
          )
        `)
        .eq('is_public', true)
        .order('times_used', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data.map(template => ({
        ...template,
        exercises: template.workout_template_exercises.map((ex: any) => ({
          ...ex,
          exercise_name: ex.exercises?.name
        }))
      }))
    } catch (error) {
      console.error('Error getting public workout templates:', error)
      throw error
    }
  }

  /**
   * Import template from localStorage format
   */
  async importFromLocalStorage(userId: string, localStorageData: any): Promise<WorkoutTemplate> {
    try {
      const templateData: CreateWorkoutTemplateData = {
        user_id: userId,
        name: localStorageData.name || 'Imported Workout',
        description: localStorageData.description,
        workout_type: localStorageData.type || 'A',
        category: localStorageData.category || 'general',
        exercises: localStorageData.exercises?.map((ex: any, index: number) => ({
          exercise_id: ex.id,
          order_index: index,
          target_sets: ex.sets || 3,
          target_reps_min: ex.reps,
          target_reps_max: ex.reps,
          target_weight: ex.weight,
          rest_time_seconds: ex.restTime || 90,
          progression_type: 'weight' as const,
          progression_amount: 2.5,
          notes: ex.notes,
          is_superset: false
        })) || [],
        estimated_duration: localStorageData.estimatedDuration,
        difficulty_level: localStorageData.difficulty || 3,
        notes: localStorageData.notes
      }

      return await this.createWorkoutTemplate(templateData)
    } catch (error) {
      console.error('Error importing template from localStorage:', error)
      throw error
    }
  }
}

// Create RPC function for incrementing usage count
export const createIncrementUsageRPC = async () => {
  await supabase.rpc('create_increment_function', {
    function_sql: `
      CREATE OR REPLACE FUNCTION increment_times_used(template_id UUID)
      RETURNS INTEGER AS $$
      DECLARE
        current_count INTEGER;
      BEGIN
        SELECT times_used INTO current_count FROM workout_templates WHERE id = template_id;
        RETURN current_count + 1;
      END;
      $$ LANGUAGE plpgsql;
    `
  })
}

export const workoutTemplateService = new WorkoutTemplateService()