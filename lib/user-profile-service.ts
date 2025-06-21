import { supabase } from './supabase'

export interface UserProfile {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  
  // Basic Info
  name?: string
  age?: number
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  
  // Physical Stats
  height_inches?: number
  weight_lbs?: number
  body_fat_percentage?: number
  
  // Fitness Goals
  primary_goal?: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general_fitness'
  target_weight_lbs?: number
  weekly_workout_frequency?: number
  
  // Experience & Preferences
  experience_level?: 'beginner' | 'intermediate' | 'advanced'
  preferred_workout_duration?: number // minutes
  rest_time_preference?: number // seconds between sets
  
  // Equipment Access
  has_home_gym?: boolean
  has_gym_membership?: boolean
  available_equipment?: string[] // JSON array of equipment
  
  // Training Preferences
  preferred_split?: 'full_body' | 'upper_lower' | 'push_pull_legs' | 'body_part_split'
  injury_limitations?: string
  notes?: string
  
  // Calculated/Derived Fields
  bmr?: number // Basal Metabolic Rate
  tdee?: number // Total Daily Energy Expenditure
}

export interface CreateUserProfileData {
  user_id: string
  name?: string
  age?: number
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  height_inches?: number
  weight_lbs?: number
  body_fat_percentage?: number
  primary_goal?: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general_fitness'
  target_weight_lbs?: number
  weekly_workout_frequency?: number
  experience_level?: 'beginner' | 'intermediate' | 'advanced'
  preferred_workout_duration?: number
  rest_time_preference?: number
  has_home_gym?: boolean
  has_gym_membership?: boolean
  available_equipment?: string[]
  preferred_split?: 'full_body' | 'upper_lower' | 'push_pull_legs' | 'body_part_split'
  injury_limitations?: string
  notes?: string
}

export interface UpdateUserProfileData extends Partial<CreateUserProfileData> {
  id: string
}

class UserProfileService {
  /**
   * Get user profile by user_id
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw error
    }
  }

  /**
   * Create new user profile
   */
  async createUserProfile(profileData: CreateUserProfileData): Promise<UserProfile> {
    try {
      // Calculate BMR and TDEE if we have the necessary data
      let bmr, tdee
      if (profileData.age && profileData.weight_lbs && profileData.height_inches && profileData.gender) {
        bmr = this.calculateBMR(
          profileData.weight_lbs,
          profileData.height_inches,
          profileData.age,
          profileData.gender
        )
        tdee = this.calculateTDEE(bmr, profileData.weekly_workout_frequency || 3)
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          ...profileData,
          bmr,
          tdee,
          available_equipment: profileData.available_equipment || []
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  /**
   * Update existing user profile
   */
  async updateUserProfile(profileData: UpdateUserProfileData): Promise<UserProfile> {
    try {
      // Recalculate BMR and TDEE if relevant fields changed
      let updateData = { ...profileData }
      
      if (profileData.age || profileData.weight_lbs || profileData.height_inches || 
          profileData.gender || profileData.weekly_workout_frequency) {
        // Get current profile to fill in missing data for calculations
        const currentProfile = await this.getUserProfileById(profileData.id)
        if (currentProfile) {
          const age = profileData.age ?? currentProfile.age
          const weight = profileData.weight_lbs ?? currentProfile.weight_lbs
          const height = profileData.height_inches ?? currentProfile.height_inches
          const gender = profileData.gender ?? currentProfile.gender
          const frequency = profileData.weekly_workout_frequency ?? currentProfile.weekly_workout_frequency

          if (age && weight && height && gender) {
            const bmr = this.calculateBMR(weight, height, age, gender)
            const tdee = this.calculateTDEE(bmr, frequency || 3)
            updateData = { ...updateData, bmr, tdee }
          }
        }
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', profileData.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  /**
   * Get user profile by profile ID
   */
  async getUserProfileById(profileId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', profileId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error getting user profile by ID:', error)
      throw error
    }
  }

  /**
   * Delete user profile
   */
  async deleteUserProfile(profileId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', profileId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting user profile:', error)
      throw error
    }
  }

  /**
   * Get or create user profile (convenience method)
   */
  async getOrCreateUserProfile(userId: string, defaultData?: Partial<CreateUserProfileData>): Promise<UserProfile> {
    try {
      let profile = await this.getUserProfile(userId)
      
      if (!profile) {
        profile = await this.createUserProfile({
          user_id: userId,
          ...defaultData
        })
      }
      
      return profile
    } catch (error) {
      console.error('Error getting or creating user profile:', error)
      throw error
    }
  }

  /**
   * Get available equipment from exercises database
   */
  async getAvailableEquipment(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('equipment')
        .not('equipment', 'is', null)

      if (error) throw error

      // Get unique equipment types and sort alphabetically
      const uniqueEquipment = [...new Set(data.map(item => item.equipment))]
        .sort()

      return uniqueEquipment
    } catch (error) {
      console.error('Error getting available equipment:', error)
      // Fallback to basic equipment list
      return ['Barbell', 'Bodyweight', 'Cable', 'Dumbbell', 'Kettlebell', 'Pull-up Bar']
    }
  }

  /**
   * Get exercises filtered by user's available equipment
   */
  async getExercisesForEquipment(availableEquipment: string[]): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name, equipment, category')
        .in('equipment', availableEquipment)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting exercises for equipment:', error)
      return []
    }
  }

  /**
   * Check if an exercise should track weight (true) or reps (false)
   */
  isWeightedExercise(equipment: string): boolean {
    const weightedEquipment = ['Barbell', 'Dumbbell', 'Kettlebell', 'Cable', 'Bench']
    return weightedEquipment.includes(equipment)
  }

  /**
   * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
   */
  private calculateBMR(weightLbs: number, heightInches: number, age: number, gender: string): number {
    // Convert to metric
    const weightKg = weightLbs * 0.453592
    const heightCm = heightInches * 2.54

    let bmr: number
    if (gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161
    }

    return Math.round(bmr)
  }

  /**
   * Calculate Total Daily Energy Expenditure
   */
  private calculateTDEE(bmr: number, weeklyWorkoutFrequency: number): number {
    // Activity multipliers based on workout frequency
    let activityMultiplier: number
    
    if (weeklyWorkoutFrequency <= 1) {
      activityMultiplier = 1.2 // Sedentary
    } else if (weeklyWorkoutFrequency <= 3) {
      activityMultiplier = 1.375 // Lightly active
    } else if (weeklyWorkoutFrequency <= 5) {
      activityMultiplier = 1.55 // Moderately active
    } else if (weeklyWorkoutFrequency <= 6) {
      activityMultiplier = 1.725 // Very active
    } else {
      activityMultiplier = 1.9 // Extra active
    }

    return Math.round(bmr * activityMultiplier)
  }

  /**
   * Import profile from localStorage format
   */
  async importFromLocalStorage(userId: string, localStorageData: any): Promise<UserProfile> {
    try {
      // Map localStorage format to Supabase format
      const profileData: CreateUserProfileData = {
        user_id: userId,
        name: localStorageData.name,
        age: localStorageData.age,
        gender: localStorageData.gender,
        height_inches: localStorageData.height,
        weight_lbs: localStorageData.weight,
        primary_goal: localStorageData.fitnessGoal,
        target_weight_lbs: localStorageData.targetWeight,
        weekly_workout_frequency: localStorageData.workoutFrequency,
        experience_level: localStorageData.experienceLevel,
        preferred_workout_duration: localStorageData.workoutDuration,
        has_home_gym: localStorageData.hasHomeGym,
        has_gym_membership: localStorageData.hasGymMembership,
        available_equipment: localStorageData.availableEquipment || [],
        preferred_split: localStorageData.preferredSplit,
        injury_limitations: localStorageData.injuryLimitations,
        notes: localStorageData.notes
      }

      return await this.createUserProfile(profileData)
    } catch (error) {
      console.error('Error importing profile from localStorage:', error)
      throw error
    }
  }
}

export const userProfileService = new UserProfileService()