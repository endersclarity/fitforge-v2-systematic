/**
 * Hook for real-time muscle volume calculation during workout planning
 */

import { useState, useEffect, useMemo } from 'react'
import { PlannedSet, WorkoutExercise } from '@/schemas/typescript-interfaces'
import { 
  calculatePlannedMuscleVolume, 
  normalizeMuscleVolumes,
  getMuscleVolumeSummary,
  estimateWorkoutDuration
} from '@/lib/planned-muscle-volume'
import exercisesData from '@/data/exercises-real.json'

interface ExerciseWithSets extends WorkoutExercise {
  plannedSets: PlannedSet[]
}

interface MuscleVolumeData {
  rawVolumes: Record<string, number>
  normalizedVolumes: Record<string, number>
  summary: Array<{
    muscle: string
    volume: number
    intensity: 'none' | 'low' | 'medium' | 'high' | 'very_high'
  }>
  estimatedDuration: number
}

/**
 * Real-time muscle volume calculation hook
 * @param exercisesWithSets - Current planned exercises with sets
 * @param debounceMs - Debounce delay for performance (default: 100ms)
 * @returns Real-time muscle volume data
 */
export function useRealTimeMuscleVolume(
  exercisesWithSets: ExerciseWithSets[],
  debounceMs: number = 100
): MuscleVolumeData {
  const [debouncedExercises, setDebouncedExercises] = useState(exercisesWithSets)

  // Debounce exercises changes to avoid excessive calculations
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedExercises(exercisesWithSets)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [exercisesWithSets, debounceMs])

  // Memoized calculations for performance
  const muscleVolumeData = useMemo((): MuscleVolumeData => {
    if (debouncedExercises.length === 0) {
      return {
        rawVolumes: {},
        normalizedVolumes: {},
        summary: [],
        estimatedDuration: 0
      }
    }

    // Calculate raw muscle volumes
    const rawVolumes = calculatePlannedMuscleVolume(debouncedExercises, exercisesData as any[])
    
    // Normalize for visualization
    const normalizedVolumes = normalizeMuscleVolumes(rawVolumes)
    
    // Generate summary
    const summary = getMuscleVolumeSummary(rawVolumes)
    
    // Estimate duration
    const estimatedDuration = estimateWorkoutDuration(debouncedExercises)

    return {
      rawVolumes,
      normalizedVolumes,
      summary,
      estimatedDuration
    }
  }, [debouncedExercises])

  return muscleVolumeData
}

/**
 * Hook for muscle volume by muscle group categories
 * @param muscleVolumes - Raw muscle volumes
 * @returns Volumes grouped by body regions
 */
export function useMuscleVolumeByGroup(muscleVolumes: Record<string, number>) {
  return useMemo(() => {
    const groups = {
      chest: 0,
      shoulders: 0,
      back: 0,
      arms: 0,
      legs: 0,
      core: 0
    }

    Object.entries(muscleVolumes).forEach(([muscle, volume]) => {
      const muscleLower = muscle.toLowerCase()
      
      if (muscleLower.includes('pectoralis') || muscleLower.includes('chest')) {
        groups.chest += volume
      } else if (muscleLower.includes('deltoid') || muscleLower.includes('shoulder')) {
        groups.shoulders += volume
      } else if (muscleLower.includes('latissimus') || muscleLower.includes('trapezius') || 
                 muscleLower.includes('rhomboid') || muscleLower.includes('back')) {
        groups.back += volume
      } else if (muscleLower.includes('bicep') || muscleLower.includes('tricep') || 
                 muscleLower.includes('forearm')) {
        groups.arms += volume
      } else if (muscleLower.includes('quadricep') || muscleLower.includes('hamstring') || 
                 muscleLower.includes('glute') || muscleLower.includes('calf')) {
        groups.legs += volume
      } else if (muscleLower.includes('core') || muscleLower.includes('abs') || 
                 muscleLower.includes('rectus')) {
        groups.core += volume
      }
    })

    return groups
  }, [muscleVolumes])
}