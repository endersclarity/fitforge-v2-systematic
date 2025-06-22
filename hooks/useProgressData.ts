/**
 * Progress Data Hook
 * Fetches and manages progress tracking data for the dashboard
 */

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api-client'
import { Workout, WorkoutSet, MuscleState } from '@/schemas/typescript-interfaces'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks } from 'date-fns'

export interface ProgressMetrics {
  totalWorkouts: number
  totalVolume: number
  volumeChange: number
  averageFrequency: number
  currentStreak: number
  personalRecordsCount: number
  lastPeriodComparison: {
    workouts: number
    volume: number
    frequency: number
  }
}

export interface VolumeData {
  date: string
  total: number
  push: number
  pull: number
  legs: number
  core: number
}

export interface PersonalRecord {
  id: string
  exerciseName: string
  category: string
  weight: number
  reps: number
  volume: number
  achievedDate: string
  improvement: number
}

export interface WorkoutDay {
  date: string
  workoutCount: number
  totalVolume: number
  workoutTypes: string[]
}

export interface MuscleGroupData {
  name: string
  volume: number
  percentage: number
  sets: number
  color: string
}

export interface ExerciseProgressData {
  exerciseId: string
  exerciseName: string
  data: Array<{
    date: string
    weight: number
    reps: number
    volume: number
    estimated1RM: number
  }>
}

interface UseProgressDataReturn {
  metrics: ProgressMetrics | null
  volumeData: VolumeData[]
  personalRecords: PersonalRecord[]
  workoutCalendar: WorkoutDay[]
  muscleDistribution: MuscleGroupData[]
  exerciseProgress: Map<string, ExerciseProgressData>
  selectedExercise: string | null
  dateRange: { start: Date; end: Date }
  isLoading: boolean
  error: string | null
  refetch: () => void
  setSelectedExercise: (exerciseId: string | null) => void
  setDateRange: (range: { start: Date; end: Date }) => void
}

// Muscle group colors
const MUSCLE_GROUP_COLORS: Record<string, string> = {
  Push: '#FF375F',
  Pull: '#4F46E5',
  Legs: '#10B981',
  Core: '#F59E0B',
  Other: '#6B7280'
}

export function useProgressData(userId: string): UseProgressDataReturn {
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null)
  const [volumeData, setVolumeData] = useState<VolumeData[]>([])
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([])
  const [workoutCalendar, setWorkoutCalendar] = useState<WorkoutDay[]>([])
  const [muscleDistribution, setMuscleDistribution] = useState<MuscleGroupData[]>([])
  const [exerciseProgress, setExerciseProgress] = useState<Map<string, ExerciseProgressData>>(new Map())
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    start: subWeeks(new Date(), 12),
    end: new Date()
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProgressData = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      // Fetch progress data from API
      const weeks = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (7 * 24 * 60 * 60 * 1000))
      const progressData = await api.analytics.getProgress(userId, weeks)

      // Process metrics
      const currentPeriodVolume = progressData.volume_metrics.weekly_trends
        .slice(-4)
        .reduce((sum: number, week: any) => sum + week.total_volume, 0)
      
      const previousPeriodVolume = progressData.volume_metrics.weekly_trends
        .slice(-8, -4)
        .reduce((sum: number, week: any) => sum + week.total_volume, 0)

      const currentPeriodWorkouts = progressData.volume_metrics.weekly_trends
        .slice(-4)
        .reduce((sum: number, week: any) => sum + week.workout_count, 0)
      
      const previousPeriodWorkouts = progressData.volume_metrics.weekly_trends
        .slice(-8, -4)
        .reduce((sum: number, week: any) => sum + week.workout_count, 0)

      // Calculate current streak (simplified - would need more data for accurate calculation)
      const currentStreak = progressData.consistency_metrics.total_workouts > 0 ? 
        Math.min(7, progressData.consistency_metrics.average_workouts_per_week * 2) : 0

      setMetrics({
        totalWorkouts: progressData.consistency_metrics.total_workouts,
        totalVolume: progressData.volume_metrics.weekly_trends.reduce(
          (sum: number, week: any) => sum + week.total_volume, 0
        ),
        volumeChange: progressData.volume_metrics.total_volume_change_percentage,
        averageFrequency: progressData.consistency_metrics.average_workouts_per_week,
        currentStreak: Math.floor(currentStreak),
        personalRecordsCount: progressData.personal_records.length,
        lastPeriodComparison: {
          workouts: previousPeriodWorkouts > 0 ? 
            ((currentPeriodWorkouts - previousPeriodWorkouts) / previousPeriodWorkouts) * 100 : 0,
          volume: previousPeriodVolume > 0 ?
            ((currentPeriodVolume - previousPeriodVolume) / previousPeriodVolume) * 100 : 0,
          frequency: progressData.consistency_metrics.average_workouts_per_week > 0 ?
            ((progressData.consistency_metrics.average_workouts_per_week - 2) / 2) * 100 : 0
        }
      })

      // Process volume data by week and muscle group
      // This would need additional API endpoint or data processing
      const volumeByWeek = progressData.volume_metrics.weekly_trends.map((week: any) => ({
        date: week.week,
        total: week.total_volume,
        // These would need to be calculated from workout data
        push: week.total_volume * 0.3, // Placeholder percentages
        pull: week.total_volume * 0.3,
        legs: week.total_volume * 0.3,
        core: week.total_volume * 0.1
      }))
      setVolumeData(volumeByWeek)

      // Process personal records
      const records = progressData.personal_records.map((pr: any, index: number) => ({
        id: `pr-${index}`,
        exerciseName: pr.exercise_name,
        category: 'Unknown', // Would need exercise data
        weight: pr.max_weight,
        reps: pr.max_reps_single_set,
        volume: pr.max_volume_single_set,
        achievedDate: pr.achieved_date,
        improvement: 0 // Would need previous PR data
      }))
      setPersonalRecords(records)

      // Fetch workouts for calendar heatmap
      const workouts = await api.workouts.list({
        user_id: userId,
        start_date: format(dateRange.start, 'yyyy-MM-dd'),
        end_date: format(dateRange.end, 'yyyy-MM-dd'),
        is_completed: true
      })

      // Process workout calendar data
      const calendarData: WorkoutDay[] = []
      const workoutsByDate = new Map<string, Workout[]>()
      
      workouts.forEach((workout: Workout) => {
        const date = format(new Date(workout.started_at), 'yyyy-MM-dd')
        if (!workoutsByDate.has(date)) {
          workoutsByDate.set(date, [])
        }
        workoutsByDate.get(date)!.push(workout)
      })

      eachDayOfInterval({ start: dateRange.start, end: dateRange.end }).forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const dayWorkouts = workoutsByDate.get(dateStr) || []
        
        calendarData.push({
          date: dateStr,
          workoutCount: dayWorkouts.length,
          totalVolume: dayWorkouts.reduce((sum, w) => sum + w.total_volume_lbs, 0),
          workoutTypes: dayWorkouts.map(w => w.workout_type || 'General').filter(Boolean)
        })
      })
      setWorkoutCalendar(calendarData)

      // Calculate muscle distribution (simplified - would need muscle-specific data)
      const muscleGroups = [
        { name: 'Push', volume: currentPeriodVolume * 0.3, sets: 100, percentage: 30, color: MUSCLE_GROUP_COLORS.Push },
        { name: 'Pull', volume: currentPeriodVolume * 0.3, sets: 100, percentage: 30, color: MUSCLE_GROUP_COLORS.Pull },
        { name: 'Legs', volume: currentPeriodVolume * 0.3, sets: 90, percentage: 30, color: MUSCLE_GROUP_COLORS.Legs },
        { name: 'Core', volume: currentPeriodVolume * 0.1, sets: 30, percentage: 10, color: MUSCLE_GROUP_COLORS.Core }
      ]
      setMuscleDistribution(muscleGroups)

      // Process exercise progress for selected exercises
      if (selectedExercise) {
        // This would need specific exercise history endpoint
        const exerciseData: ExerciseProgressData = {
          exerciseId: selectedExercise,
          exerciseName: 'Exercise Name', // Would come from exercise data
          data: progressData.volume_metrics.weekly_trends.map((week: any) => ({
            date: week.week,
            weight: week.avg_weight,
            reps: Math.floor(week.total_reps / week.total_sets),
            volume: week.total_volume,
            estimated1RM: week.avg_weight * (1 + (Math.floor(week.total_reps / week.total_sets) / 30))
          }))
        }
        setExerciseProgress(new Map([[selectedExercise, exerciseData]]))
      }

    } catch (err: any) {
      console.error('🚨 [useProgressData] Error fetching data:', err)
      setError(err.message || 'Failed to load progress data')
    } finally {
      setIsLoading(false)
    }
  }, [userId, dateRange, selectedExercise])

  useEffect(() => {
    fetchProgressData()
  }, [fetchProgressData])

  return {
    metrics,
    volumeData,
    personalRecords,
    workoutCalendar,
    muscleDistribution,
    exerciseProgress,
    selectedExercise,
    dateRange,
    isLoading,
    error,
    refetch: fetchProgressData,
    setSelectedExercise,
    setDateRange
  }
}