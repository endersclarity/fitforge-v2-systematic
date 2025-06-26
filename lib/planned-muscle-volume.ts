/**
 * Real-time muscle volume calculator for workout planning
 * Calculates projected muscle volume as user plans their workout
 */

import { PlannedSet, WorkoutExercise } from '@/schemas/typescript-interfaces'
import userCapacityBaselines from '@/data/user-capacity-baselines.json'

interface ExerciseWithSets extends WorkoutExercise {
  plannedSets: PlannedSet[]
}

interface ExerciseData {
  id: string
  name: string
  muscleEngagement?: Record<string, number>
}

/**
 * Calculate projected muscle volume from planned workout
 * @param exercisesWithSets - Exercises with their planned sets
 * @param exerciseDatabase - Exercise database with muscle engagement data
 * @returns Record mapping muscle names to projected volume units
 */
export function calculatePlannedMuscleVolume(
  exercisesWithSets: ExerciseWithSets[],
  exerciseDatabase: ExerciseData[]
): Record<string, number> {
  const muscleVolumes: Record<string, number> = {}
  
  exercisesWithSets.forEach(exercise => {
    // Find exercise data with muscle engagement
    const exerciseData = exerciseDatabase.find(ex => ex.id === exercise.id)
    if (!exerciseData?.muscleEngagement) return
    
    // Calculate volume for each planned set
    exercise.plannedSets.forEach(set => {
      Object.entries(exerciseData.muscleEngagement!).forEach(([muscle, engagement]) => {
        // Volume = weight × reps × (muscle engagement percentage / 100)
        // For bodyweight exercises, use bodyweight estimate of 150 lbs
        const effectiveWeight = set.targetWeight || (exercise.equipment === 'Bodyweight' ? 150 : 0)
        const volume = effectiveWeight * set.targetReps * (engagement / 100)
        
        muscleVolumes[muscle] = (muscleVolumes[muscle] || 0) + volume
      })
    })
  })
  
  return muscleVolumes
}

/**
 * Normalize muscle volumes to 0-100 scale for visualization
 * @param muscleVolumes - Raw volume calculations
 * @returns Normalized volumes suitable for color mapping
 */
export function normalizeMuscleVolumes(muscleVolumes: Record<string, number>): Record<string, number> {
  const volumes = Object.values(muscleVolumes)
  if (volumes.length === 0) return {}
  
  const maxVolume = Math.max(...volumes)
  if (maxVolume === 0) return muscleVolumes
  
  // Scale to 0-100 range for consistent visualization
  const normalized: Record<string, number> = {}
  Object.entries(muscleVolumes).forEach(([muscle, volume]) => {
    normalized[muscle] = Math.round((volume / maxVolume) * 100)
  })
  
  return normalized
}

/**
 * Get volume intensity category for color mapping
 * @param normalizedVolume - Volume scaled 0-100
 * @returns Intensity category
 */
export function getVolumeIntensity(normalizedVolume: number): 'none' | 'low' | 'medium' | 'high' | 'very_high' {
  if (normalizedVolume === 0) return 'none'
  if (normalizedVolume <= 20) return 'low'
  if (normalizedVolume <= 50) return 'medium'
  if (normalizedVolume <= 80) return 'high'
  return 'very_high'
}

/**
 * Get color for volume intensity
 * @param intensity - Volume intensity category
 * @returns Hex color code
 */
export function getVolumeColor(intensity: ReturnType<typeof getVolumeIntensity>): string {
  switch (intensity) {
    case 'none': return '#374151' // Gray
    case 'low': return '#3B82F6' // Light Blue
    case 'medium': return '#F59E0B' // Yellow
    case 'high': return '#F97316' // Orange
    case 'very_high': return '#EF4444' // Red
    default: return '#374151'
  }
}

/**
 * Get muscle capacity baseline from user data
 * @param muscleName - Name of muscle (with underscores)
 * @returns Capacity baseline or null if not found
 */
function getMuscleCapacityBaseline(muscleName: string): number | null {
  const baselineName = muscleName.toLowerCase().replace(/_/g, '_')
  const baselines = userCapacityBaselines.user_data.muscle_capacity_baselines
  
  // Map muscle names to baseline keys
  const muscleMapping: Record<string, string> = {
    'trapezius': 'trapezius_upper',
    'trapezius_upper': 'trapezius_upper',
    'trapezius_lower': 'trapezius_lower',
    'latissimus_dorsi': 'latissimus_dorsi',
    'biceps_brachii': 'biceps_brachii',
    'rhomboids': 'rhomboids',
    'pectoralis_major': 'pectoralis_major',
    'triceps_brachii': 'triceps_brachii',
    'deltoids': 'deltoids',
    'anterior_deltoids': 'deltoids',
    'rear_deltoids': 'deltoids',
    'quadriceps': 'quadriceps',
    'hamstrings': 'hamstrings_glutes',
    'glutes': 'hamstrings_glutes',
    'gluteus_maximus': 'hamstrings_glutes',
    'core': 'core_abs',
    'abs': 'core_abs',
    'rectus_abdominis': 'core_abs',
    'calves': 'calves',
    'gastrocnemius': 'calves',
    'soleus': 'calves',
    'grip_forearms': 'forearms_grip',
    'forearms': 'forearms_grip'
  }
  
  const mappedKey = muscleMapping[baselineName]
  if (mappedKey && (baselines as any)[mappedKey]) {
    return (baselines as any)[mappedKey].capacity_volume_units
  }
  
  return null
}

/**
 * Calculate fatigue percentage based on user capacity baselines
 * @param muscleName - Name of muscle
 * @param currentVolume - Current workout volume
 * @returns Fatigue percentage (0-100+)
 */
export function calculateMuscleFatiguePercentage(muscleName: string, currentVolume: number): number {
  const baseline = getMuscleCapacityBaseline(muscleName)
  if (!baseline || baseline === 0) return 0
  
  return Math.round((currentVolume / baseline) * 100)
}

/**
 * Get fatigue intensity category based on percentage
 * @param fatiguePercentage - Fatigue percentage (0-100+)
 * @returns Intensity category
 */
export function getFatigueIntensity(fatiguePercentage: number): 'none' | 'low' | 'medium' | 'high' | 'very_high' {
  if (fatiguePercentage === 0) return 'none'
  if (fatiguePercentage < 30) return 'low'
  if (fatiguePercentage < 70) return 'medium'
  if (fatiguePercentage < 90) return 'high'
  return 'very_high'
}

/**
 * Calculate total volume summary by muscle group with meaningful fatigue percentages
 * @param muscleVolumes - Raw muscle volumes
 * @returns Formatted volume summary with fatigue percentages
 */
export function getMuscleVolumeSummary(muscleVolumes: Record<string, number>) {
  const summary = Object.entries(muscleVolumes)
    .filter(([_, volume]) => volume > 0)
    .map(([muscle, volume]) => {
      const fatiguePercentage = calculateMuscleFatiguePercentage(muscle, volume)
      return {
        muscle: muscle.replace(/_/g, ' '),
        volume: Math.round(volume),
        fatiguePercentage,
        intensity: getFatigueIntensity(fatiguePercentage)
      }
    })
    .sort((a, b) => b.fatiguePercentage - a.fatiguePercentage)
  
  return summary
}

/**
 * Estimate workout duration based on planned sets
 * @param exercisesWithSets - Exercises with planned sets
 * @returns Estimated duration in minutes
 */
export function estimateWorkoutDuration(exercisesWithSets: ExerciseWithSets[]): number {
  const totalSets = exercisesWithSets.reduce((sum, ex) => sum + ex.plannedSets.length, 0)
  const exerciseCount = exercisesWithSets.length
  
  // Estimate: 2.5 minutes per set + 2 minutes transition between exercises
  const estimatedMinutes = totalSets * 2.5 + (exerciseCount - 1) * 2
  
  return Math.round(estimatedMinutes)
}