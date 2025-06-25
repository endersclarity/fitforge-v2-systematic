/**
 * Real-time muscle volume calculator for workout planning
 * Calculates projected muscle volume as user plans their workout
 */

import { PlannedSet, WorkoutExercise } from '@/schemas/typescript-interfaces'

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
 * Calculate total volume summary by muscle group
 * @param muscleVolumes - Raw muscle volumes
 * @returns Formatted volume summary
 */
export function getMuscleVolumeSummary(muscleVolumes: Record<string, number>) {
  const summary = Object.entries(muscleVolumes)
    .filter(([_, volume]) => volume > 0)
    .map(([muscle, volume]) => ({
      muscle: muscle.replace(/_/g, ' '),
      volume: Math.round(volume),
      intensity: getVolumeIntensity(volume)
    }))
    .sort((a, b) => b.volume - a.volume)
  
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