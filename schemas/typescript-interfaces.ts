/**
 * FitForge TypeScript Database Interfaces
 * Generated from: database-schema.sql
 * 
 * CRITICAL: These interfaces MUST match the exact database schema
 * Column names and types are verified against actual database structure
 * 
 * Schema verification command:
 * SELECT column_name, data_type, is_nullable FROM information_schema.columns 
 * WHERE table_name = 'table_name' ORDER BY ordinal_position;
 */

// ============================================================================
// EQUIPMENT TYPES (extracted from exercises-real.json)
// ============================================================================

export const EQUIPMENT_TYPES = {
  BENCH: 'Bench',
  BODYWEIGHT: 'Bodyweight', 
  DUMBBELL: 'Dumbbell',
  KETTLEBELL: 'Kettlebell',
  PLYBOX: 'Plybox',
  PULL_UP_BAR: 'Pull-up_Bar',
  TRX: 'TRX'
} as const;

export type EquipmentType = typeof EQUIPMENT_TYPES[keyof typeof EQUIPMENT_TYPES];

// Equipment type array for filtering UI
export const EQUIPMENT_OPTIONS: EquipmentType[] = [
  EQUIPMENT_TYPES.BODYWEIGHT,
  EQUIPMENT_TYPES.DUMBBELL, 
  EQUIPMENT_TYPES.BENCH,
  EQUIPMENT_TYPES.TRX,
  EQUIPMENT_TYPES.PULL_UP_BAR,
  EQUIPMENT_TYPES.KETTLEBELL,
  EQUIPMENT_TYPES.PLYBOX
];

// Equipment type validation
export function isValidEquipmentType(equipment: string): equipment is EquipmentType {
  return Object.values(EQUIPMENT_TYPES).includes(equipment as EquipmentType);
}

// ============================================================================
// WORKOUT TEMPLATE INTERFACES
// ============================================================================

export type WorkoutType = 'push' | 'pull' | 'legs';
export type WorkoutVariant = 'A' | 'B';

export interface TemplateExercise {
  exerciseId: string;
  sets: number;
  reps: string; // e.g., "6-8", "8-12", "AMRAP"
  restSeconds: number;
  notes?: string;
}

export type TemplateCategory = 'suggested' | 'expert' | 'custom';

export interface TemplateCategoryInfo {
  id: TemplateCategory;
  name: string;
  description: string;
  templates: string[]; // Array of template IDs
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  workoutType: WorkoutType;
  variant: WorkoutVariant;
  exercises: TemplateExercise[];
  targetMuscles: string[];
  estimatedDuration: number; // minutes
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: EquipmentType[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutTemplateInsert {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  workoutType: WorkoutType;
  variant: WorkoutVariant;
  exercises: TemplateExercise[];
  targetMuscles: string[];
  estimatedDuration: number;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment?: EquipmentType[];
  tags?: string[];
}

// Template validation constraints
export const TEMPLATE_CONSTRAINTS = {
  exercises: { min: 3, max: 8 },
  estimatedDuration: { min: 20, max: 120 }, // minutes
  sets: { min: 1, max: 6 },
  restSeconds: { min: 30, max: 300 }
} as const;

// ============================================================================
// WORKOUT PLANNING INTERFACES
// ============================================================================

export interface PlannedSet {
  id: string;
  exerciseId: string;
  setNumber: number;
  targetWeight: number;
  targetReps: number;
  equipment: string;
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  exercises: WorkoutExercise[];
  plannedSets: PlannedSet[];
  totalEstimatedTime: number;
  createdAt: string;
  templateId?: string; // Reference to WorkoutTemplate if based on template
}

export interface WorkoutExercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  difficulty: string;
}

// ============================================================================
// USER PROFILE INTERFACES
// ============================================================================

export interface User {
  id: string; // UUID from auth.users
  email: string;
  display_name?: string;
  
  // Personal metrics for volume calculations
  height_inches?: number; // 1-119
  weight_lbs?: number; // Decimal(5,2), 1-999.99
  age?: number; // 1-149
  sex?: 'M' | 'F' | 'Other';
  
  // Fitness preferences
  experience_level: 'Beginner' | 'Intermediate' | 'Advanced';
  primary_goals: string[]; // Default: ['General Fitness']
  available_equipment: string[]; // Default: []
  
  // Progressive disclosure tracking
  workout_count: number; // Default: 0
  feature_level: 1 | 2 | 3 | 4; // Progressive feature unlock
  
  // Metadata
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  last_active_at: string; // ISO timestamp
}

export interface UserInsert {
  id: string; // Must match auth.users.id
  email: string;
  display_name?: string;
  height_inches?: number;
  weight_lbs?: number;
  age?: number;
  sex?: 'M' | 'F' | 'Other';
  experience_level?: 'Beginner' | 'Intermediate' | 'Advanced';
  primary_goals?: string[];
  available_equipment?: string[];
}

export interface UserUpdate {
  display_name?: string;
  height_inches?: number;
  weight_lbs?: number;
  age?: number;
  sex?: 'M' | 'F' | 'Other';
  experience_level?: 'Beginner' | 'Intermediate' | 'Advanced';
  primary_goals?: string[];
  available_equipment?: string[];
}

// ============================================================================
// EXERCISE LIBRARY INTERFACES
// ============================================================================

export interface MuscleEngagement {
  [muscleName: string]: number; // 0-100 percentage
}

export interface Exercise {
  id: string; // Primary key, e.g., 'single_arm_upright_row'
  name: string;
  category: string; // 'Push', 'Pull', 'Legs', etc.
  equipment: EquipmentType;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  variation?: 'A' | 'B' | 'A/B';
  
  // Instructions and guidance
  instructions?: string[];
  setup_tips?: string[];
  safety_notes?: string[];
  
  // Muscle engagement data (scientific percentages)
  muscle_engagement: MuscleEngagement; // JSONB: {"Biceps_Brachii": 80}
  primary_muscles: string[];
  secondary_muscles: string[];
  
  // Exercise metadata
  is_compound: boolean; // Default: true
  is_unilateral: boolean; // Default: false
  movement_pattern?: string; // 'Push', 'Pull', 'Squat', 'Hinge'
  
  // System fields
  created_at: string;
  updated_at: string;
  is_active: boolean; // Default: true
}

export interface ExerciseInsert {
  id: string;
  name: string;
  category: string;
  equipment: EquipmentType;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  variation?: 'A' | 'B' | 'A/B';
  instructions?: string[];
  setup_tips?: string[];
  safety_notes?: string[];
  muscle_engagement: MuscleEngagement;
  primary_muscles: string[];
  secondary_muscles?: string[];
  is_compound?: boolean;
  is_unilateral?: boolean;
  movement_pattern?: string;
  is_active?: boolean;
}

// ============================================================================
// WORKOUT SESSION INTERFACES
// ============================================================================

export interface Workout {
  id: string; // UUID
  user_id: string; // UUID reference to users
  
  // Session identification
  name?: string;
  workout_type?: string; // 'Push', 'Pull', 'Legs', 'Full Body', 'Custom'
  variation?: 'A' | 'B'; // For A/B periodization
  
  // Session timing
  started_at: string; // ISO timestamp
  ended_at?: string; // ISO timestamp
  duration_seconds?: number; // Generated column
  
  // Session metrics (calculated automatically)
  total_volume_lbs: number; // Decimal(10,2)
  total_sets: number;
  total_reps: number;
  exercises_count: number;
  
  // Session notes and feedback
  notes?: string;
  energy_level?: number; // 1-5
  perceived_exertion?: number; // 1-10
  
  // Progressive overload tracking
  previous_workout_id?: string; // UUID reference
  volume_increase_percentage?: number; // Decimal(5,2)
  
  // System fields
  created_at: string;
  updated_at: string;
  is_completed: boolean; // Default: false
}

export interface WorkoutInsert {
  user_id: string;
  name?: string;
  workout_type?: string;
  variation?: 'A' | 'B';
  started_at?: string; // Default: NOW()
  notes?: string;
  energy_level?: number;
  perceived_exertion?: number;
  previous_workout_id?: string;
}

export interface WorkoutUpdate {
  name?: string;
  ended_at?: string;
  notes?: string;
  energy_level?: number;
  perceived_exertion?: number;
  is_completed?: boolean;
}

// ============================================================================
// WORKOUT SET INTERFACES
// ============================================================================

export interface WorkoutSet {
  id: string; // UUID
  workout_id: string; // UUID reference to workouts
  exercise_id: string; // Text reference to exercises
  user_id: string; // UUID reference to users
  
  // Set data with strict validation
  set_number: number; // 1-20
  reps: number; // 1-50 (prevents impossible rep counts)
  weight_lbs: number; // Decimal(6,2), 0-500, 0.25 increments
  
  // Performance metrics
  time_under_tension_seconds?: number;
  rest_seconds?: number; // 0-600 (max 10 minutes)
  perceived_exertion?: number; // 1-10
  
  // Calculated metrics (generated columns)
  volume_lbs: number; // weight_lbs * reps
  estimated_one_rep_max?: number; // Decimal(6,2)
  
  // Progressive tracking
  is_personal_best: boolean; // Default: false
  improvement_vs_last?: number; // Decimal(5,2) percentage
  
  // System fields
  created_at: string;
  updated_at: string;
}

export interface WorkoutSetInsert {
  workout_id: string;
  exercise_id: string;
  user_id: string;
  set_number: number;
  reps: number;
  weight_lbs: number;
  time_under_tension_seconds?: number;
  rest_seconds?: number;
  perceived_exertion?: number;
}

export interface WorkoutSetUpdate {
  reps?: number;
  weight_lbs?: number;
  time_under_tension_seconds?: number;
  rest_seconds?: number;
  perceived_exertion?: number;
  is_personal_best?: boolean;
  improvement_vs_last?: number;
}

// ============================================================================
// MUSCLE STATE INTERFACES
// ============================================================================

export interface MuscleState {
  id: string; // UUID
  user_id: string; // UUID reference to users
  
  // Muscle identification
  muscle_name: string; // e.g., 'Biceps_Brachii', 'Pectoralis_Major'
  muscle_group: string; // 'Push', 'Pull', 'Legs'
  
  // Fatigue calculation (0-100 scale)
  fatigue_percentage: number; // Decimal(5,2), 0-100
  recovery_percentage: number; // Decimal(5,2), 0-100
  
  // Volume tracking (7-day rolling window)
  weekly_volume_lbs: number; // Decimal(10,2)
  weekly_sets: number;
  weekly_frequency: number; // Days per week
  
  // Recovery modeling (5-day recovery curve)
  last_trained_date?: string; // Date string (YYYY-MM-DD)
  days_since_trained?: number; // Generated column
  expected_recovery_date?: string; // Date string
  
  // Progressive overload recommendations
  target_volume_increase_percentage: number; // Default: 3.0
  recommended_next_weight?: number; // Decimal(6,2)
  recommended_next_reps?: number;
  
  // Calculation metadata
  calculation_timestamp: string; // ISO timestamp
  last_workout_id?: string; // UUID reference
  
  // System fields
  created_at: string;
  updated_at: string;
}

export interface MuscleStateInsert {
  user_id: string;
  muscle_name: string;
  muscle_group: string;
  fatigue_percentage: number;
  recovery_percentage: number;
  weekly_volume_lbs?: number;
  weekly_sets?: number;
  weekly_frequency?: number;
  last_trained_date?: string;
  expected_recovery_date?: string;
  target_volume_increase_percentage?: number;
  recommended_next_weight?: number;
  recommended_next_reps?: number;
  last_workout_id?: string;
}

// ============================================================================
// COMPOSITE INTERFACES FOR COMPLEX OPERATIONS
// ============================================================================

export interface WorkoutWithSets extends Workout {
  sets: WorkoutSet[];
}

export interface ExerciseWithLastPerformance extends Exercise {
  last_workout_set?: WorkoutSet;
  personal_best?: WorkoutSet;
  recent_volume?: number;
}

export interface UserWithMuscleStates extends User {
  muscle_states: MuscleState[];
  fatigue_summary: {
    overall_fatigue: number;
    most_fatigued_muscle: string;
    recovery_ready_muscles: string[];
  };
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

export interface WorkoutSessionResponse {
  workout: Workout;
  sets: WorkoutSet[];
  muscle_impact: {
    [muscleName: string]: {
      volume_added: number;
      fatigue_increase: number;
    };
  };
}

export interface ExerciseRecommendations {
  recommended_exercises: Exercise[];
  rationale: string;
  target_muscles: string[];
  avoid_muscles: string[];
}

export interface ProgressionRecommendation {
  exercise_id: string;
  current_best: WorkoutSet;
  recommended_progression: {
    weight_lbs: number;
    reps: number;
    rationale: string;
    confidence_level: number; // 0-100
  };
}

// ============================================================================
// RECOVERY DASHBOARD INTERFACES
// ============================================================================

export interface MuscleRecoveryData {
  name: string; // Scientific muscle name (e.g., 'Pectoralis_Major')
  displayName: string; // User-friendly name (e.g., 'Chest')
  fatigueScore: number; // 0-100 scale
  recoveryPercentage: number; // 0-100 scale
  lastTrainedDate: Date | null;
  daysSinceLastTrained: number;
  volumeLastWeek: number; // Total volume in lbs
  status: 'Recovered' | 'Recovering' | 'Fatigued';
}

export interface RecoveryDashboardData {
  lastWorkoutDate: Date | null;
  daysSinceLastWorkout: number;
  muscleGroups: Record<string, MuscleRecoveryData>;
  overallRecoveryScore: number; // 0-100 scale
  recommendedFocus: string[]; // Muscle groups ready for training
  needingRest: string[]; // Muscle groups that need more recovery
  deloadRecommended: boolean;
}

// ============================================================================
// VALIDATION SCHEMAS FOR RUNTIME TYPE CHECKING
// ============================================================================

export const VALIDATION_RULES = {
  workout_set: {
    reps: { min: 1, max: 50 },
    weight_lbs: { min: 0, max: 500, increment: 0.25 },
    set_number: { min: 1, max: 20 },
    rest_seconds: { min: 0, max: 600 },
    perceived_exertion: { min: 1, max: 10 }
  },
  user: {
    height_inches: { min: 1, max: 119 },
    weight_lbs: { min: 1, max: 999.99 },
    age: { min: 1, max: 149 }
  },
  muscle_state: {
    fatigue_percentage: { min: 0, max: 100 },
    recovery_percentage: { min: 0, max: 100 },
    target_volume_increase_percentage: { min: 0, max: 50 }
  }
} as const;

// ============================================================================
// DATABASE TABLE NAMES (for Supabase client)
// ============================================================================

export const TABLE_NAMES = {
  USERS: 'users',
  EXERCISES: 'exercises',
  WORKOUTS: 'workouts',
  WORKOUT_SETS: 'workout_sets',
  MUSCLE_STATES: 'muscle_states'
} as const;

// ============================================================================
// TYPE GUARDS FOR RUNTIME VALIDATION
// ============================================================================

export function isValidWorkoutSet(data: any): data is WorkoutSetInsert {
  return (
    typeof data === 'object' &&
    typeof data.workout_id === 'string' &&
    typeof data.exercise_id === 'string' &&
    typeof data.user_id === 'string' &&
    typeof data.set_number === 'number' &&
    data.set_number >= 1 && data.set_number <= 20 &&
    typeof data.reps === 'number' &&
    data.reps >= 1 && data.reps <= 50 &&
    typeof data.weight_lbs === 'number' &&
    data.weight_lbs >= 0 && data.weight_lbs <= 500 &&
    (data.weight_lbs * 4) === Math.floor(data.weight_lbs * 4) // 0.25 increment check
  );
}

export function isValidMuscleEngagement(data: any): data is MuscleEngagement {
  return (
    typeof data === 'object' &&
    Object.values(data).every(value => 
      typeof value === 'number' && value >= 0 && value <= 100
    ) &&
    Object.values(data).some(value => 
      typeof value === 'number' && value > 0
    ) // At least one muscle engaged
  );
}

export function isValidWorkoutTemplate(data: any): data is WorkoutTemplateInsert {
  return (
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.description === 'string' &&
    ['suggested', 'expert', 'custom'].includes(data.category) &&
    ['push', 'pull', 'legs'].includes(data.workoutType) &&
    ['A', 'B'].includes(data.variant) &&
    Array.isArray(data.exercises) &&
    data.exercises.length >= TEMPLATE_CONSTRAINTS.exercises.min &&
    data.exercises.length <= TEMPLATE_CONSTRAINTS.exercises.max &&
    data.exercises.every((ex: any) => 
      typeof ex.exerciseId === 'string' &&
      typeof ex.sets === 'number' &&
      ex.sets >= TEMPLATE_CONSTRAINTS.sets.min &&
      ex.sets <= TEMPLATE_CONSTRAINTS.sets.max &&
      typeof ex.reps === 'string' &&
      typeof ex.restSeconds === 'number' &&
      ex.restSeconds >= TEMPLATE_CONSTRAINTS.restSeconds.min &&
      ex.restSeconds <= TEMPLATE_CONSTRAINTS.restSeconds.max
    ) &&
    Array.isArray(data.targetMuscles) &&
    typeof data.estimatedDuration === 'number' &&
    data.estimatedDuration >= TEMPLATE_CONSTRAINTS.estimatedDuration.min &&
    data.estimatedDuration <= TEMPLATE_CONSTRAINTS.estimatedDuration.max
  );
}

/**
 * SCHEMA VERIFICATION NOTES:
 * 
 * 1. All interfaces match exact database column names and types
 * 2. Validation rules enforce business logic constraints
 * 3. Generated columns (duration_seconds, volume_lbs, days_since_trained) are read-only
 * 4. UUID fields use string type for TypeScript compatibility
 * 5. Decimal fields use number type with documented precision
 * 6. Array fields use TypeScript array syntax
 * 7. JSONB fields use appropriate interface types
 * 
 * BEFORE CREATING PYDANTIC MODELS:
 * Verify these interfaces match database schema exactly using:
 * SELECT column_name, data_type, is_nullable FROM information_schema.columns 
 * WHERE table_name = 'table_name' ORDER BY ordinal_position;
 */