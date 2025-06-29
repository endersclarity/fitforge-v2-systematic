/**
 * Client-side hook for muscle heatmap data from localStorage
 * This is a simplified version that works without backend integration
 */

import { useState, useEffect, useCallback } from 'react'
import { MuscleHeatmapData, MuscleDetail } from './useMuscleData'

interface UseClientMuscleDataReturn {
  heatmapData: MuscleHeatmapData | null
  selectedMuscle: MuscleDetail | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  refreshData: () => Promise<void>
  selectMuscle: (muscleName: string) => void
  clearSelection: () => void
  getMuscleColor: (muscleName: string) => string
  getMuscleFilteredByGroup: (group: string) => string[]
}

export function useClientMuscleData(muscleData: any): UseClientMuscleDataReturn {
  const [heatmapData, setHeatmapData] = useState<MuscleHeatmapData | null>(null)
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Transform client muscle data to heatmap format
  const transformData = useCallback(() => {
    try {
      if (!muscleData || Object.keys(muscleData).length === 0) {
        setHeatmapData(null)
        setLoading(false)
        return
      }

      // Transform muscleData to heatmap format
      const muscle_states: MuscleHeatmapData['muscle_states'] = {}
      const fatigued_muscles: string[] = []
      const ready_muscles: string[] = []
      let totalFatigue = 0
      let muscleCount = 0

      Object.entries(muscleData).forEach(([muscleName, data]: [string, any]) => {
        const fatiguePercentage = data.fatigueScore || 0
        const recoveryPercentage = data.recoveryPercentage || (100 - fatiguePercentage)
        
        muscle_states[muscleName] = {
          fatigue_percentage: fatiguePercentage,
          recovery_percentage: recoveryPercentage,
          last_trained_date: data.lastTrainedDate?.toISOString(),
          days_since_trained: data.daysSinceLastTrained,
          weekly_volume_lbs: data.volumeLastWeek || 0,
          weekly_sets: 0, // Not tracked in our client data
          expected_recovery_date: data.lastTrainedDate 
            ? new Date(data.lastTrainedDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
          recent_exercises: []
        }

        totalFatigue += fatiguePercentage
        muscleCount++

        if (fatiguePercentage >= 60) {
          fatigued_muscles.push(muscleName)
        } else if (fatiguePercentage <= 20) {
          ready_muscles.push(muscleName)
        }
      })

      const heatmap: MuscleHeatmapData = {
        muscle_states,
        overall_fatigue: muscleCount > 0 ? totalFatigue / muscleCount : 0,
        most_fatigued_muscles: fatigued_muscles,
        recovery_ready_muscles: ready_muscles,
        last_updated: new Date().toISOString()
      }

      setHeatmapData(heatmap)
      setLastUpdated(new Date())
      setLoading(false)
    } catch (err: any) {
      console.error('Error transforming muscle data:', err)
      setError('Failed to process muscle data')
      setLoading(false)
    }
  }, [muscleData])

  // Transform data when muscleData changes
  useEffect(() => {
    transformData()
  }, [transformData])

  // Select a muscle for detailed view
  const selectMuscle = useCallback((muscleName: string) => {
    if (!heatmapData || !heatmapData.muscle_states[muscleName]) {
      return
    }

    const muscleData = heatmapData.muscle_states[muscleName]
    
    // Calculate recovery timeline
    const recoveryTimeline = []
    const daysSince = muscleData.days_since_trained || 0
    
    for (let day = 0; day <= 7; day++) {
      const totalDays = daysSince + day
      let recoveryLevel = 0
      
      if (totalDays === 0) {
        recoveryLevel = 0
      } else if (totalDays <= 5) {
        recoveryLevel = Math.min(100, (1 - Math.exp(-totalDays * 0.5)) * 100)
      } else {
        recoveryLevel = 100
      }
      
      recoveryTimeline.push({ day, recoveryLevel })
    }

    const detail: MuscleDetail = {
      muscleName: muscleName,
      scientificName: muscleName,
      fatiguePercentage: muscleData.fatigue_percentage,
      recoveryPercentage: muscleData.recovery_percentage,
      lastTrainedDate: muscleData.last_trained_date,
      daysSinceTrained: muscleData.days_since_trained,
      weeklyVolume: muscleData.weekly_volume_lbs,
      weeklySets: muscleData.weekly_sets,
      expectedRecoveryDate: muscleData.expected_recovery_date,
      recentExercises: [],
      recoveryTimeline
    }
    
    setSelectedMuscle(detail)
  }, [heatmapData])

  // Clear muscle selection
  const clearSelection = useCallback(() => {
    setSelectedMuscle(null)
  }, [])

  // Get muscle color based on fatigue
  const getMuscleColor = useCallback((muscleName: string): string => {
    if (!heatmapData || !heatmapData.muscle_states[muscleName]) {
      return '#E5E7EB'
    }
    
    const fatigue = heatmapData.muscle_states[muscleName].fatigue_percentage
    
    if (fatigue >= 80) return '#FF375F'
    if (fatigue >= 60) return '#FF6B6B'
    if (fatigue >= 40) return '#FF8C42'
    if (fatigue >= 20) return '#F59E0B'
    return '#10B981'
  }, [heatmapData])

  // Get muscles filtered by group
  const getMuscleFilteredByGroup = useCallback((group: string): string[] => {
    if (!heatmapData) return []
    return Object.keys(heatmapData.muscle_states)
  }, [heatmapData])

  return {
    heatmapData,
    selectedMuscle,
    loading,
    error,
    lastUpdated,
    refreshData: transformData,
    selectMuscle,
    clearSelection,
    getMuscleColor,
    getMuscleFilteredByGroup
  }
}