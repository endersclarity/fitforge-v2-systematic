/**
 * ProgressDashboard Component
 * Comprehensive progress tracking dashboard for FitForge
 */

import React, { useState, useCallback } from 'react'
import { useProgressData } from '@/hooks/useProgressData'
import { 
  MetricCard, 
  VolumeMetricCard, 
  WorkoutMetricCard, 
  FrequencyMetricCard, 
  StreakMetricCard, 
  PersonalRecordMetricCard 
} from './MetricCard'
import { VolumeChart } from './VolumeChart'
import { PersonalRecords } from './PersonalRecords'
import { WorkoutCalendar } from './WorkoutCalendar'
import { MuscleDistribution } from './MuscleDistribution'
import { ExerciseProgress } from './ExerciseProgress'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Download, 
  Share2, 
  Calendar,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  Image
} from 'lucide-react'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export interface ProgressDashboardProps {
  userId: string
  className?: string
}

export const ProgressDashboard = React.memo(function ProgressDashboard({
  userId,
  className
}: ProgressDashboardProps) {
  const [exportLoading, setExportLoading] = useState(false)
  
  const {
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
    refetch,
    setSelectedExercise,
    setDateRange
  } = useProgressData(userId)

  // Export data as CSV
  const exportToCSV = useCallback(async () => {
    setExportLoading(true)
    try {
      // Prepare CSV data
      const headers = ['Date', 'Total Volume', 'Push Volume', 'Pull Volume', 'Legs Volume', 'Core Volume']
      const rows = volumeData.map(d => [
        d.date,
        d.total,
        d.push,
        d.pull,
        d.legs,
        d.core
      ])
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fitforge-progress-${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Export successful!",
        description: "Your progress data has been downloaded as CSV"
      })
    } catch (err) {
      toast({
        title: "Export failed",
        description: "Unable to export data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setExportLoading(false)
    }
  }, [volumeData])

  // Generate progress report
  const generateReport = useCallback(async () => {
    setExportLoading(true)
    try {
      // This would typically call an API to generate a PDF
      // For now, we'll create a simple text report
      const report = `
FITFORGE PROGRESS REPORT
Generated: ${format(new Date(), 'MMMM d, yyyy')}

SUMMARY
- Total Workouts: ${metrics?.totalWorkouts || 0}
- Total Volume: ${metrics?.totalVolume.toLocaleString() || 0} lbs
- Volume Change: ${metrics?.volumeChange > 0 ? '+' : ''}${metrics?.volumeChange.toFixed(1) || 0}%
- Average Frequency: ${metrics?.averageFrequency.toFixed(1) || 0} workouts/week
- Current Streak: ${metrics?.currentStreak || 0} days
- Personal Records: ${metrics?.personalRecordsCount || 0}

PERSONAL RECORDS
${personalRecords.map(pr => 
  `- ${pr.exerciseName}: ${pr.weight}lbs x ${pr.reps} reps (${pr.volume}lbs volume)`
).join('\n')}

MUSCLE DISTRIBUTION
${muscleDistribution.map(m => 
  `- ${m.name}: ${m.percentage.toFixed(1)}% (${m.volume.toLocaleString()}lbs)`
).join('\n')}
      `.trim()
      
      // Download report
      const blob = new Blob([report], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fitforge-report-${format(new Date(), 'yyyy-MM-dd')}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Report generated!",
        description: "Your progress report has been downloaded"
      })
    } catch (err) {
      toast({
        title: "Report generation failed",
        description: "Unable to generate report. Please try again.",
        variant: "destructive"
      })
    } finally {
      setExportLoading(false)
    }
  }, [metrics, personalRecords, muscleDistribution])

  // Share progress image
  const shareProgress = useCallback(async () => {
    const text = `💪 FitForge Progress Update
📊 Total Volume: ${metrics?.totalVolume.toLocaleString() || 0} lbs
📈 Change: ${metrics?.volumeChange > 0 ? '+' : ''}${metrics?.volumeChange.toFixed(1) || 0}%
🏋️ Workouts: ${metrics?.totalWorkouts || 0}
🏆 PRs: ${metrics?.personalRecordsCount || 0}
#FitForge #FitnessProgress`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FitForge Progress',
          text
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard!",
        description: "Your progress summary is ready to share"
      })
    }
  }, [metrics])

  if (error) {
    return (
      <div className={cn("p-6", className)}>
        <Card className="bg-[#1C1C1E] border-gray-800 p-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Error Loading Progress</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Progress Dashboard</h1>
          <p className="text-gray-400 mt-1">Track your fitness journey and achievements</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Date Range Picker would go here */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newRange = {
                start: new Date(new Date().setMonth(new Date().getMonth() - 3)),
                end: new Date()
              }
              setDateRange(newRange)
            }}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Last 3 Months
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={exportLoading}
          >
            {exportLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export CSV
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={generateReport}
            disabled={exportLoading}
          >
            <FileText className="w-4 h-4 mr-2" />
            Report
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={shareProgress}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={refetch}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <WorkoutMetricCard
          value={metrics?.totalWorkouts || 0}
          change={metrics?.lastPeriodComparison.workouts}
          loading={isLoading}
        />
        <VolumeMetricCard
          value={metrics?.totalVolume ? (metrics.totalVolume / 1000).toFixed(1) + 'k' : '0'}
          change={metrics?.lastPeriodComparison.volume}
          loading={isLoading}
        />
        <MetricCard
          title="Volume Trend"
          value={`${metrics?.volumeChange > 0 ? '+' : ''}${metrics?.volumeChange.toFixed(1) || 0}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          loading={isLoading}
        />
        <FrequencyMetricCard
          value={metrics?.averageFrequency.toFixed(1) || '0'}
          change={metrics?.lastPeriodComparison.frequency}
          loading={isLoading}
        />
        <StreakMetricCard
          value={metrics?.currentStreak || 0}
          loading={isLoading}
        />
        <PersonalRecordMetricCard
          value={metrics?.personalRecordsCount || 0}
          loading={isLoading}
        />
      </div>

      {/* Volume Chart */}
      <VolumeChart
        data={volumeData}
        loading={isLoading}
      />

      {/* Second Row - Calendar and Personal Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkoutCalendar
          data={workoutCalendar}
          loading={isLoading}
        />
        <PersonalRecords
          records={personalRecords}
          loading={isLoading}
          onExerciseClick={setSelectedExercise}
        />
      </div>

      {/* Third Row - Muscle Distribution and Exercise Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MuscleDistribution
          data={muscleDistribution}
          loading={isLoading}
        />
        <ExerciseProgress
          exercises={exerciseProgress}
          selectedExercise={selectedExercise}
          onExerciseSelect={setSelectedExercise}
          loading={isLoading}
        />
      </div>
    </div>
  )
})