/**
 * Hook for fetching and managing muscle heatmap data
 */

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'

export interface MuscleHeatmapData {
  muscle_states: {
    [muscleName: string]: {
      fatigue_percentage: number
      recovery_percentage: number
      last_trained_date?: string
      days_since_trained?: number
      weekly_volume_lbs: number
      weekly_sets: number
      expected_recovery_date?: string
      recent_exercises: {
        exercise_name: string
        sets: number
        volume: number
        date: string
      }[]
    }
  }
  overall_fatigue: number
  most_fatigued_muscles: string[]
  recovery_ready_muscles: string[]
  last_updated: string
}

export interface MuscleDetail {
  muscleName: string
  scientificName: string
  fatiguePercentage: number
  recoveryPercentage: number
  lastTrainedDate?: string
  daysSinceTrained?: number
  weeklyVolume: number
  weeklySets: number
  expectedRecoveryDate?: string
  recentExercises: {
    name: string
    sets: number
    volume: number
    date: string
  }[]
  recoveryTimeline: {
    day: number
    recoveryLevel: number
  }[]
}

interface UseMuscleDataReturn {
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

export function useMuscleData(userId: string): UseMuscleDataReturn {
  const [heatmapData, setHeatmapData] = useState<MuscleHeatmapData | null>(null)
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { toast } = useToast()

  // Fetch muscle heatmap data
  const fetchHeatmapData = useCallback(async () => {
    if (!userId) {
      setError('No user ID provided')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔥 [useMuscleData] Fetching heatmap data for user:', userId)
      
      const data = await api.analytics.getMuscleHeatmap(userId)
      
      console.log('🔧 [useMuscleData] Received heatmap data:', data)
      
      setHeatmapData(data)
      setLastUpdated(new Date())
      
    } catch (err: any) {
      console.error('🚨 [useMuscleData] Error fetching heatmap data:', err)
      setError(err.message || 'Failed to fetch muscle data')
      
      toast({
        title: "Error loading muscle data",
        description: err.message || "Please try again later",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [userId, toast])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    fetchHeatmapData()
    
    const interval = setInterval(() => {
      fetchHeatmapData()
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(interval)
  }, [fetchHeatmapData])

  // Select a muscle for detailed view
  const selectMuscle = useCallback((muscleName: string) => {
    if (!heatmapData || !heatmapData.muscle_states[muscleName]) {
      console.log('🔧 [useMuscleData] No data for muscle:', muscleName)
      return
    }

    const muscleData = heatmapData.muscle_states[muscleName]
    
    // Calculate recovery timeline (5-day recovery curve)
    const recoveryTimeline = []
    const daysSince = muscleData.days_since_trained || 0
    
    for (let day = 0; day <= 7; day++) {
      const totalDays = daysSince + day
      let recoveryLevel = 0
      
      if (totalDays === 0) {
        recoveryLevel = 0 // Just trained
      } else if (totalDays <= 5) {
        // Recovery curve: exponential recovery over 5 days
        recoveryLevel = Math.min(100, (1 - Math.exp(-totalDays * 0.5)) * 100)
      } else {
        recoveryLevel = 100 // Fully recovered
      }
      
      recoveryTimeline.push({ day, recoveryLevel })
    }

    const detail: MuscleDetail = {
      muscleName: muscleName,
      scientificName: muscleName, // You might want to map this
      fatiguePercentage: muscleData.fatigue_percentage,
      recoveryPercentage: muscleData.recovery_percentage,
      lastTrainedDate: muscleData.last_trained_date,
      daysSinceTrained: muscleData.days_since_trained,
      weeklyVolume: muscleData.weekly_volume_lbs,
      weeklySets: muscleData.weekly_sets,
      expectedRecoveryDate: muscleData.expected_recovery_date,
      recentExercises: muscleData.recent_exercises || [],
      recoveryTimeline
    }
    
    setSelectedMuscle(detail)
    
    console.log('🔧 [useMuscleData] Selected muscle detail:', detail)
  }, [heatmapData])

  // Clear muscle selection
  const clearSelection = useCallback(() => {
    setSelectedMuscle(null)
  }, [])

  // Get muscle color based on fatigue
  const getMuscleColor = useCallback((muscleName: string): string => {
    if (!heatmapData || !heatmapData.muscle_states[muscleName]) {
      return '#E5E7EB' // gray-200 for no data
    }
    
    const fatigue = heatmapData.muscle_states[muscleName].fatigue_percentage
    
    if (fatigue >= 80) return '#FF375F' // severe fatigue
    if (fatigue >= 60) return '#FF6B6B' // high fatigue
    if (fatigue >= 40) return '#FF8C42' // moderate fatigue
    if (fatigue >= 20) return '#F59E0B' // light fatigue
    return '#10B981' // recovered
  }, [heatmapData])

  // Get muscles filtered by group (Push/Pull/Legs/Core)
  const getMuscleFilteredByGroup = useCallback((group: string): string[] => {
    if (!heatmapData) return []
    
    // This would need to be implemented based on your muscle grouping logic
    // For now, returning all muscles
    return Object.keys(heatmapData.muscle_states)
  }, [heatmapData])

  return {
    heatmapData,
    selectedMuscle,
    loading,
    error,
    lastUpdated,
    refreshData: fetchHeatmapData,
    selectMuscle,
    clearSelection,
    getMuscleColor,
    getMuscleFilteredByGroup
  }
}