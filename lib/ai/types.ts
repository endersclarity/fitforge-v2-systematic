/**
 * Shared types for the Intelligence Layer
 * 
 * These interfaces define the data structures used by AI modules
 * to provide coaching recommendations and workout generation.
 */

// ==================== FATIGUE ANALYSIS ====================

export interface MuscleGroup {
  name: string
  fatigueScore: number // 0-100 (0 = fully recovered, 100 = maximal fatigue)
  status: 'Recovered' | 'Recovering' | 'Fatigued'
  lastTrainedDate: Date | null
  estimatedRecoveryDate: Date | null
  volumeLastWeek: number // total volume (sets × reps × weight)
  averageRPE: number // average RPE for this muscle group
  daysSinceLastTrained: number
  recoveryRecommendation: string // human-readable explanation
}

export interface FatigueAnalysis {
  userId: string
  analysisDate: Date
  muscleGroups: Record<string, MuscleGroup>
  overallRecoveryScore: number // 0-100 aggregate recovery
  recommendedFocus: string[] // muscle groups ready for high intensity
  deloadRecommended: boolean
  readyForTraining: string[] // muscles that can be trained today
  needingRest: string[] // muscles that should be rested
  summary: string // "Upper body recovered, legs still fatigued"
}

// ==================== PROGRESSION PLANNING ====================

export interface ProgressionPlan {
  exerciseId: string
  exerciseName: string
  currentE1RM: number | null
  previousBestE1RM: number | null
  
  // Recommended progression
  weight: number
  reps: number
  sets: number
  targetRPE: number
  
  // AI confidence and reasoning
  confidence: number // 0-1 (how confident the AI is in this recommendation)
  rationale: string // "Last session RPE 7, increase weight 2.5lbs"
  progressionType: 'weight_increase' | 'rep_increase' | 'maintain' | 'deload'
  
  // Trend analysis
  recentTrend: 'improving' | 'plateau' | 'declining'
  deloadRecommended: boolean
  plateauDetected: boolean
  
  // Safety factors
  warmupRecommended: boolean
  formFocusAreas: string[] // specific technique cues
}

// ==================== WORKOUT GENERATION ====================

export interface WorkoutGenerationRequest {
  userId: string
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'general_fitness'
  availableTime: number // minutes
  equipment: string[] // available equipment
  preferredSplit?: 'full_body' | 'push_pull_legs' | 'upper_lower' | 'auto'
  targetBodyParts?: string[] // focus areas if specified
  intensityPreference?: 'low' | 'moderate' | 'high' | 'auto'
}

export interface ExerciseRecommendation {
  exerciseId: string
  exerciseName: string
  progression: ProgressionPlan
  rationale: string // why this exercise was selected
  muscleTargets: string[] // primary muscles targeted
  estimatedDuration: number // minutes including rest
  priority: 'high' | 'medium' | 'low' // importance in workout
}

export interface GeneratedWorkout {
  id: string
  userId: string
  name: string
  description: string
  goal: string
  
  // Workout structure
  exercises: ExerciseRecommendation[]
  warmupExercises: ExerciseRecommendation[]
  cooldownExercises: ExerciseRecommendation[]
  
  // Timing and logistics
  estimatedDuration: number // total minutes
  actualStartTime?: Date
  
  // AI insights
  focusAreas: string[] // muscle groups being targeted
  overallIntensity: 'low' | 'moderate' | 'high'
  recoveryStatus: string // "Good recovery, ready for intensity"
  coachingNotes: string[] // tips for this specific workout
  
  // Metadata
  generatedAt: Date
  aiVersion: string
  confidence: number // overall confidence in the workout plan
}

// ==================== GENERAL AI TYPES ====================

export interface AIRecommendation {
  id: string
  userId: string
  type: 'workout' | 'progression' | 'fatigue' | 'recovery'
  title: string
  description: string
  actionRequired: boolean
  priority: 'low' | 'medium' | 'high'
  data: any // specific recommendation data
  validUntil: Date
  createdAt: Date
}

export interface UserAIPreferences {
  userId: string
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'general_fitness'
  availableDays: number // days per week
  preferredSessionDuration: number // minutes
  equipmentAccess: string[]
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  autoProgressionEnabled: boolean
  rpeTargetRange: [number, number] // [min, max] preferred RPE
  updatedAt: Date
}

// ==================== ALGORITHM CONFIGURATION ====================

export interface FatigueAnalysisConfig {
  lookbackDays: number // how many days to analyze
  rpeWeighting: number // how much RPE affects fatigue calculation
  volumeWeighting: number // how much volume affects fatigue
  recencyWeighting: number // how much recent sessions matter
  recoveryRates: Record<string, number> // muscle group recovery rates
}

export interface ProgressionConfig {
  conservativeMode: boolean // err on side of caution
  plateauDetectionSensitivity: number // how quickly to detect plateaus
  deloadThreshold: number // when to recommend deloads
  maxWeightIncrease: number // maximum weight increase per session
  maxRepIncrease: number // maximum rep increase per session
}

export interface WorkoutGenerationConfig {
  minExercisesPerWorkout: number
  maxExercisesPerWorkout: number
  preferredWorkoutDuration: number // minutes
  muscleBalanceWeighting: number // importance of balanced muscle training
  equipmentPreferences: Record<string, number> // preference weights for equipment
}