"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Calendar, Clock, TrendingUp, Activity, Target, Zap, Filter } from "lucide-react"

interface WorkoutHistoryAnalyzerProps {
  className?: string
}

interface WorkoutAnalysis {
  totalWorkouts: number
  totalTime: number
  totalVolume: number
  avgWorkoutDuration: number
  avgWorkoutsPerWeek: number
  consistencyScore: number
  volumeTrend: 'increasing' | 'decreasing' | 'stable'
  favoriteExercises: Array<{ name: string, frequency: number }>
  muscleDistribution: Record<string, number>
  strengthProgression: Record<string, Array<{ date: string, volume: number }>>
  periodBreakdown: {
    last7Days: { workouts: number, volume: number, consistency: number }
    last30Days: { workouts: number, volume: number, consistency: number }
    last90Days: { workouts: number, volume: number, consistency: number }
  }
}

export function WorkoutHistoryAnalyzer({ className }: WorkoutHistoryAnalyzerProps) {
  const [analysis, setAnalysis] = useState<WorkoutAnalysis | null>(null)
  const [timeFrame, setTimeFrame] = useState<'7' | '30' | '90' | 'all'>('30')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    analyzeWorkoutHistory()
  }, [timeFrame])

  const analyzeWorkoutHistory = () => {
    setIsAnalyzing(true)
    
    const workouts = JSON.parse(localStorage.getItem("workoutSessions") || "[]")
    
    if (workouts.length === 0) {
      setAnalysis(null)
      setIsAnalyzing(false)
      return
    }

    // Filter workouts by time frame
    const now = new Date()
    const timeFrameInDays = timeFrame === 'all' ? 365 : parseInt(timeFrame)
    const cutoffDate = new Date(now.getTime() - (timeFrameInDays * 24 * 60 * 60 * 1000))
    
    const filteredWorkouts = timeFrame === 'all' ? workouts : 
      workouts.filter((workout: any) => new Date(workout.date) >= cutoffDate)

    if (filteredWorkouts.length === 0) {
      setAnalysis(null)
      setIsAnalyzing(false)
      return
    }

    // Calculate basic metrics
    const totalWorkouts = filteredWorkouts.length
    const totalTime = filteredWorkouts.reduce((sum: number, w: any) => sum + (w.duration || 0), 0)
    const totalVolume = filteredWorkouts.reduce((sum: number, w: any) => sum + (w.total_volume || 0), 0)
    const avgWorkoutDuration = totalTime / totalWorkouts

    // Calculate workouts per week
    const firstWorkout = new Date(filteredWorkouts[0].date)
    const lastWorkout = new Date(filteredWorkouts[filteredWorkouts.length - 1].date)
    const daysDiff = Math.max(1, (lastWorkout.getTime() - firstWorkout.getTime()) / (1000 * 60 * 60 * 24))
    const avgWorkoutsPerWeek = (totalWorkouts / daysDiff) * 7

    // Calculate consistency score (regularity of workouts)
    const consistencyScore = calculateConsistencyScore(filteredWorkouts)

    // Volume trend analysis
    const volumeTrend = calculateVolumeTrend(filteredWorkouts)

    // Favorite exercises analysis
    const exerciseFrequency: Record<string, number> = {}
    filteredWorkouts.forEach((workout: any) => {
      workout.exercises?.forEach((exercise: any) => {
        exerciseFrequency[exercise.name] = (exerciseFrequency[exercise.name] || 0) + 1
      })
    })
    
    const favoriteExercises = Object.entries(exerciseFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, frequency]) => ({ name, frequency }))

    // Muscle distribution analysis
    const muscleEngagement: Record<string, number> = {}
    filteredWorkouts.forEach((workout: any) => {
      workout.exercises?.forEach((exercise: any) => {
        if (exercise.muscleEngagement) {
          Object.entries(exercise.muscleEngagement).forEach(([muscle, engagement]) => {
            muscleEngagement[muscle] = (muscleEngagement[muscle] || 0) + (engagement as number)
          })
        }
      })
    })

    // Normalize muscle distribution to percentages
    const totalMuscleEngagement = Object.values(muscleEngagement).reduce((sum, val) => sum + val, 0)
    const muscleDistribution: Record<string, number> = {}
    Object.entries(muscleEngagement).forEach(([muscle, engagement]) => {
      muscleDistribution[muscle] = Math.round((engagement / totalMuscleEngagement) * 100)
    })

    // Strength progression by exercise
    const strengthProgression = calculateStrengthProgression(filteredWorkouts)

    // Period breakdown
    const periodBreakdown = {
      last7Days: calculatePeriodMetrics(workouts, 7),
      last30Days: calculatePeriodMetrics(workouts, 30),
      last90Days: calculatePeriodMetrics(workouts, 90)
    }

    const analysisResult: WorkoutAnalysis = {
      totalWorkouts,
      totalTime,
      totalVolume,
      avgWorkoutDuration: Math.round(avgWorkoutDuration),
      avgWorkoutsPerWeek: Math.round(avgWorkoutsPerWeek * 10) / 10,
      consistencyScore: Math.round(consistencyScore),
      volumeTrend,
      favoriteExercises,
      muscleDistribution,
      strengthProgression,
      periodBreakdown
    }

    setAnalysis(analysisResult)
    setIsAnalyzing(false)
  }

  const calculateConsistencyScore = (workouts: any[]): number => {
    if (workouts.length < 2) return 100

    // Calculate average days between workouts
    const sortedWorkouts = workouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const gaps: number[] = []
    
    for (let i = 1; i < sortedWorkouts.length; i++) {
      const prevDate = new Date(sortedWorkouts[i-1].date)
      const currDate = new Date(sortedWorkouts[i].date)
      const daysBetween = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      gaps.push(daysBetween)
    }

    // Calculate consistency based on variance from ideal frequency (every 2-3 days)
    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length
    const idealGap = 2.5 // Ideal workout frequency
    const gapVariance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length
    
    // Score based on how close to ideal and how consistent
    const frequencyScore = Math.max(0, 100 - Math.abs(avgGap - idealGap) * 20)
    const varianceScore = Math.max(0, 100 - Math.sqrt(gapVariance) * 10)
    
    return (frequencyScore + varianceScore) / 2
  }

  const calculateVolumeTrend = (workouts: any[]): 'increasing' | 'decreasing' | 'stable' => {
    if (workouts.length < 4) return 'stable'

    // Split workouts into first and second half
    const midpoint = Math.floor(workouts.length / 2)
    const firstHalf = workouts.slice(0, midpoint)
    const secondHalf = workouts.slice(midpoint)

    const firstHalfAvg = firstHalf.reduce((sum: number, w: any) => sum + (w.total_volume || 0), 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum: number, w: any) => sum + (w.total_volume || 0), 0) / secondHalf.length

    const percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100

    if (percentChange > 10) return 'increasing'
    if (percentChange < -10) return 'decreasing'
    return 'stable'
  }

  const calculateStrengthProgression = (workouts: any[]): Record<string, Array<{ date: string, volume: number }>> => {
    const progression: Record<string, Array<{ date: string, volume: number }>> = {}

    workouts.forEach((workout: any) => {
      workout.exercises?.forEach((exercise: any) => {
        if (!progression[exercise.name]) {
          progression[exercise.name] = []
        }
        progression[exercise.name].push({
          date: workout.date,
          volume: exercise.exerciseVolume || 0
        })
      })
    })

    // Sort each exercise progression by date and keep only top exercises
    const topExercises = Object.entries(progression)
      .sort(([,a], [,b]) => b.length - a.length)
      .slice(0, 5)

    const result: Record<string, Array<{ date: string, volume: number }>> = {}
    topExercises.forEach(([exercise, data]) => {
      result[exercise] = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    })

    return result
  }

  const calculatePeriodMetrics = (allWorkouts: any[], days: number) => {
    const cutoff = new Date(Date.now() - (days * 24 * 60 * 60 * 1000))
    const periodWorkouts = allWorkouts.filter((w: any) => new Date(w.date) >= cutoff)
    
    const workouts = periodWorkouts.length
    const volume = periodWorkouts.reduce((sum: number, w: any) => sum + (w.total_volume || 0), 0)
    const consistency = calculateConsistencyScore(periodWorkouts)

    return { workouts, volume, consistency }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      default: return <Activity className="h-4 w-4 text-blue-600" />
    }
  }

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'increasing': return 'text-green-600 bg-green-50 border-green-200'
      case 'decreasing': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  if (!analysis && !isAnalyzing) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Workout History Analysis
          </CardTitle>
          <CardDescription>Comprehensive analysis of your training history</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Complete some workouts to see detailed analytics and trends.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Workout History Analysis
            </CardTitle>
            <CardDescription>Comprehensive analysis of your training history</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Analyzing workout history...</p>
          </div>
        ) : analysis ? (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="muscles">Muscles</TabsTrigger>
              <TabsTrigger value="exercises">Exercises</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-3 border rounded-lg text-center">
                  <Calendar className="h-4 w-4 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{analysis.totalWorkouts}</div>
                  <div className="text-sm text-muted-foreground">Total Workouts</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <Clock className="h-4 w-4 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{Math.round(analysis.totalTime / 60)}h</div>
                  <div className="text-sm text-muted-foreground">Total Time</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <Activity className="h-4 w-4 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{analysis.totalVolume.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Volume</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <Target className="h-4 w-4 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold">{analysis.avgWorkoutsPerWeek}</div>
                  <div className="text-sm text-muted-foreground">Workouts/Week</div>
                </div>
              </div>

              {/* Performance Indicators */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Consistency Score</h4>
                  <div className="flex items-center gap-2">
                    <Progress value={analysis.consistencyScore} className="flex-1" />
                    <span className="text-sm font-medium">{analysis.consistencyScore}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {analysis.consistencyScore >= 80 ? 'Excellent consistency!' :
                     analysis.consistencyScore >= 60 ? 'Good workout regularity' :
                     'Room for improvement in consistency'}
                  </p>
                </div>

                <div className={`p-3 border rounded-lg ${getTrendColor(analysis.volumeTrend)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getTrendIcon(analysis.volumeTrend)}
                    <span className="font-medium">Volume Trend</span>
                  </div>
                  <p className="text-sm capitalize">{analysis.volumeTrend} progression</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              {/* Period Comparison */}
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(analysis.periodBreakdown).map(([period, data]) => (
                  <div key={period} className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-2 capitalize">
                      {period.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Workouts:</span>
                        <span className="font-medium">{data.workouts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volume:</span>
                        <span className="font-medium">{data.volume.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Consistency:</span>
                        <span className="font-medium">{data.consistency}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Strength Progression */}
              <div className="space-y-3">
                <h4 className="font-medium">Strength Progression (Top Exercises)</h4>
                {Object.entries(analysis.strengthProgression).slice(0, 3).map(([exercise, progression]) => (
                  <div key={exercise} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{exercise}</span>
                      <Badge variant="outline">
                        {progression.length} sessions
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>First: {progression[0]?.volume.toLocaleString()}</span>
                      <span>Latest: {progression[progression.length - 1]?.volume.toLocaleString()}</span>
                      <span className="font-medium">
                        {progression.length > 1 ? 
                          `${Math.round(((progression[progression.length - 1]?.volume - progression[0]?.volume) / progression[0]?.volume) * 100)}%` 
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="muscles" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Muscle Group Distribution</h4>
                {Object.entries(analysis.muscleDistribution)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 8)
                  .map(([muscle, percentage]) => (
                    <div key={muscle} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{muscle}</span>
                        <span>{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  ))
                }
              </div>
            </TabsContent>

            <TabsContent value="exercises" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Most Frequent Exercises</h4>
                {analysis.favoriteExercises.map((exercise, index) => (
                  <div key={exercise.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium">{exercise.name}</span>
                    </div>
                    <Badge variant="secondary">
                      {exercise.frequency} times
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : null}
      </CardContent>
    </Card>
  )
}