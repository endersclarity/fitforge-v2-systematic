import { supabase } from './supabase'

export interface WorkoutDraft {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  
  // Draft Info
  name: string
  workout_type: 'A' | 'B' | 'C' | 'D'
  
  // Draft Structure (flexible JSON for iterative building)
  exercises: WorkoutDraftExercise[]
  
  // Session State
  is_active: boolean
  last_accessed_at: string
  
  // Metadata
  notes?: string
  estimated_duration?: number
  
  // Auto-save tracking
  auto_save_version: number
}

export interface WorkoutDraftExercise {
  id: string
  name: string
  sets: WorkoutDraftSet[]
  muscleEngagement?: Record<string, number>
  restTime?: number
  notes?: string
}

export interface WorkoutDraftSet {
  id: string
  reps: number
  weight: number
  completed: boolean
  rpe?: number // Rate of Perceived Exertion
  notes?: string
  restTime?: number
}

export interface CreateWorkoutDraftData {
  user_id: string
  name?: string
  workout_type?: 'A' | 'B' | 'C' | 'D'
  exercises?: WorkoutDraftExercise[]
  notes?: string
}

export interface UpdateWorkoutDraftData {
  name?: string
  workout_type?: 'A' | 'B' | 'C' | 'D'
  exercises?: WorkoutDraftExercise[]
  notes?: string
  estimated_duration?: number
  is_active?: boolean
}

class WorkoutDraftService {
  /**
   * Get user's active workout draft
   */
  async getUserWorkoutDraft(userId: string): Promise<WorkoutDraft | null> {
    try {
      const { data, error } = await supabase
        .from('workout_drafts')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error getting workout draft:', error)
      throw error
    }
  }

  /**
   * Create or update workout draft (upsert)
   */
  async saveWorkoutDraft(userId: string, draftData: UpdateWorkoutDraftData): Promise<WorkoutDraft> {
    try {
      // Update last_accessed_at
      const updateData = {
        ...draftData,
        last_accessed_at: new Date().toISOString(),
        auto_save_version: supabase.rpc('increment_auto_save_version', { user_id: userId })
      }

      const { data, error } = await supabase
        .from('workout_drafts')
        .upsert([{
          user_id: userId,
          ...updateData
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving workout draft:', error)
      throw error
    }
  }

  /**
   * Create new workout draft
   */
  async createWorkoutDraft(draftData: CreateWorkoutDraftData): Promise<WorkoutDraft> {
    try {
      const { data, error } = await supabase
        .from('workout_drafts')
        .insert([{
          user_id: draftData.user_id,
          name: draftData.name || 'New Workout Draft',
          workout_type: draftData.workout_type || 'A',
          exercises: draftData.exercises || [],
          notes: draftData.notes,
          is_active: true,
          last_accessed_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating workout draft:', error)
      throw error
    }
  }

  /**
   * Update workout draft
   */
  async updateWorkoutDraft(userId: string, draftData: UpdateWorkoutDraftData): Promise<WorkoutDraft> {
    try {
      const { data, error } = await supabase
        .from('workout_drafts')
        .update({
          ...draftData,
          last_accessed_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating workout draft:', error)
      throw error
    }
  }

  /**
   * Delete workout draft
   */
  async deleteWorkoutDraft(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workout_drafts')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting workout draft:', error)
      throw error
    }
  }

  /**
   * Mark draft as active/inactive
   */
  async setDraftActiveStatus(userId: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('workout_drafts')
        .update({ 
          is_active: isActive,
          last_accessed_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error setting draft active status:', error)
      throw error
    }
  }

  /**
   * Auto-save draft (debounced in UI)
   */
  async autoSaveWorkoutDraft(userId: string, exercises: WorkoutDraftExercise[]): Promise<void> {
    try {
      await this.saveWorkoutDraft(userId, {
        exercises,
        is_active: true
      })
    } catch (error) {
      console.error('Error auto-saving workout draft:', error)
      // Don't throw - auto-save should be silent
    }
  }

  /**
   * Get or create workout draft (convenience method)
   */
  async getOrCreateWorkoutDraft(userId: string): Promise<WorkoutDraft> {
    try {
      let draft = await this.getUserWorkoutDraft(userId)
      
      if (!draft) {
        draft = await this.createWorkoutDraft({
          user_id: userId
        })
      }
      
      return draft
    } catch (error) {
      console.error('Error getting or creating workout draft:', error)
      throw error
    }
  }

  /**
   * Subscribe to real-time draft changes
   */
  subscribeToWorkoutDraft(userId: string, callback: (draft: WorkoutDraft | null) => void) {
    return supabase
      .channel(`workout_draft_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workout_drafts',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          callback(null)
        } else {
          callback(payload.new as WorkoutDraft)
        }
      })
      .subscribe()
  }

  /**
   * Convert draft to workout session
   */
  async convertDraftToSession(userId: string): Promise<any> {
    try {
      const draft = await this.getUserWorkoutDraft(userId)
      if (!draft) throw new Error('No draft found')

      // Convert draft format to session format
      const sessionData = {
        userId: userId,
        workout: {
          name: draft.name,
          type: draft.workout_type,
          exercises: draft.exercises
        },
        startTime: new Date().toISOString(),
        workoutNotes: draft.notes
      }

      return sessionData
    } catch (error) {
      console.error('Error converting draft to session:', error)
      throw error
    }
  }

  /**
   * Import draft from localStorage format
   */
  async importFromLocalStorage(userId: string, localStorageData: any): Promise<WorkoutDraft> {
    try {
      const draftData: CreateWorkoutDraftData = {
        user_id: userId,
        name: localStorageData.name || 'Imported Draft',
        workout_type: localStorageData.type || 'A',
        exercises: localStorageData.exercises || [],
        notes: localStorageData.notes
      }

      return await this.createWorkoutDraft(draftData)
    } catch (error) {
      console.error('Error importing draft from localStorage:', error)
      throw error
    }
  }
}

// Create RPC function for incrementing auto-save version
export const createIncrementAutoSaveRPC = async () => {
  const { error } = await supabase.rpc('exec', {
    query: `
      CREATE OR REPLACE FUNCTION increment_auto_save_version(user_id UUID)
      RETURNS INTEGER AS $$
      DECLARE
        current_version INTEGER;
      BEGIN
        SELECT auto_save_version INTO current_version 
        FROM workout_drafts 
        WHERE workout_drafts.user_id = increment_auto_save_version.user_id;
        
        IF current_version IS NULL THEN
          RETURN 1;
        ELSE
          RETURN current_version + 1;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `
  })
  
  if (error) {
    console.error('Error creating increment function:', error)
  }
}

export const workoutDraftService = new WorkoutDraftService()