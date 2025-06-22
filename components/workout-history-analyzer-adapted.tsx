"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Calendar, Clock, TrendingUp, Activity, Target, Filter } from "lucide-react"

interface WorkoutHistoryAnalyzerProps {
  className?: string
}

interface WorkoutAnalysis {
  totalWorkouts: number
  totalTime: number
  totalSets: number
  avgWorkoutDuration: number
  avgSetsPerWorkout: number
  avgWorkoutsPerWeek: number
  consistencyScore: number
  workoutTrend: 'increasing' | 'decreasing' | 'stable'
  favoriteExercises: Array<{ name: string, frequency: number }>
  periodBreakdown: {
    last7Days: { workouts: number, sets: number, consistency: number }
    last30Days: { workouts: number, sets: number, consistency: number }
    last90Days: { workouts: number, sets: number, consistency: number }
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
    const timeFrameInDays = timeFrame === 'all' ? 365 * 10 : parseInt(timeFrame)
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
    const totalSets = filteredWorkouts.reduce((sum: number, w: any) => sum + (w.totalSets || 0), 0)
    const avgWorkoutDuration = totalTime / totalWorkouts
    const avgSetsPerWorkout = totalSets / totalWorkouts

    // Calculate workouts per week
    const sortedWorkouts = [...filteredWorkouts].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    const firstWorkout = new Date(sortedWorkouts[0].date)
    const lastWorkout = new Date(sortedWorkouts[sortedWorkouts.length - 1].date)
    const daysDiff = Math.max(1, (lastWorkout.getTime() - firstWorkout.getTime()) / (1000 * 60 * 60 * 24))
    const avgWorkoutsPerWeek = (totalWorkouts / daysDiff) * 7

    // Calculate consistency score
    const consistencyScore = calculateConsistencyScore(filteredWorkouts)

    // Workout trend analysis
    const workoutTrend = calculateWorkoutTrend(filteredWorkouts)

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

    // Period breakdown
    const periodBreakdown = {
      last7Days: calculatePeriodMetrics(workouts, 7),
      last30Days: calculatePeriodMetrics(workouts, 30),
      last90Days: calculatePeriodMetrics(workouts, 90)
    }

    const analysisResult: WorkoutAnalysis = {
      totalWorkouts,
      totalTime,
      totalSets,
      avgWorkoutDuration: Math.round(avgWorkoutDuration),
      avgSetsPerWorkout: Math.round(avgSetsPerWorkout),
      avgWorkoutsPerWeek: Math.round(avgWorkoutsPerWeek * 10) / 10,
      consistencyScore: Math.round(consistencyScore),
      workoutTrend,
      favoriteExercises,
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

  const calculateWorkoutTrend = (workouts: any[]): 'increasing' | 'decreasing' | 'stable' => {
    if (workouts.length < 4) return 'stable'

    // Split workouts into first and second half
    const midpoint = Math.floor(workouts.length / 2)
    const firstHalf = workouts.slice(0, midpoint)
    const secondHalf = workouts.slice(midpoint)

    const firstHalfAvg = firstHalf.length
    const secondHalfAvg = secondHalf.length

    // Calculate trend based on frequency
    const firstHalfDays = (new Date(firstHalf[firstHalf.length - 1].date).getTime() - 
                          new Date(firstHalf[0].date).getTime()) / (1000 * 60 * 60 * 24)
    const secondHalfDays = (new Date(secondHalf[secondHalf.length - 1].date).getTime() - 
                           new Date(secondHalf[0].date).getTime()) / (1000 * 60 * 60 * 24)

    const firstHalfFreq = firstHalfAvg / firstHalfDays
    const secondHalfFreq = secondHalfAvg / secondHalfDays

    const percentChange = ((secondHalfFreq - firstHalfFreq) / firstHalfFreq) * 100

    if (percentChange > 10) return 'increasing'
    if (percentChange < -10) return 'decreasing'
    return 'stable'
  }

  const calculatePeriodMetrics = (allWorkouts: any[], days: number) => {
    const cutoff = new Date(Date.now() - (days * 24 * 60 * 60 * 1000))
    const periodWorkouts = allWorkouts.filter((w: any) => new Date(w.date) >= cutoff)
    
    const workouts = periodWorkouts.length
    const sets = periodWorkouts.reduce((sum: number, w: any) => sum + (w.totalSets || 0), 0)
    const consistency = calculateConsistencyScore(periodWorkouts)

    return { workouts, sets, consistency }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
      default: return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'increasing': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'decreasing': return 'text-red-400 bg-red-500/10 border-red-500/20'
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    }
  }

  if (!analysis && !isAnalyzing) {
    return (
      <Card className={`bg-[#1C1C1E] border-[#2C2C2E] ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart className="h-5 w-5 text-[#FF375F]" />
            Workout History Analysis
          </CardTitle>
          <CardDescription className="text-[#A1A1A3]">
            Comprehensive analysis of your training history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[#A1A1A3]">Complete some workouts to see detailed analytics and trends.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-[#1C1C1E] border-[#2C2C2E] ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart className="h-5 w-5 text-[#FF375F]" />
              Workout History Analysis
            </CardTitle>
            <CardDescription className="text-[#A1A1A3]">
              Comprehensive analysis of your training history
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#A1A1A3]" />
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-32 bg-[#2C2C2E] border-[#3C3C3E] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2C2C2E] border-[#3C3C3E]">
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
            <p className="text-[#A1A1A3]">Analyzing workout history...</p>
          </div>
        ) : analysis ? (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-[#2C2C2E] border-[#3C3C3E]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="exercises">Exercises</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-3 border border-[#2C2C2E] bg-[#2C2C2E] rounded-lg text-center">
                  <Calendar className="h-4 w-4 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-white">{analysis.totalWorkouts}</div>
                  <div className="text-sm text-[#A1A1A3]">Total Workouts</div>
                </div>
                <div className="p-3 border border-[#2C2C2E] bg-[#2C2C2E] rounded-lg text-center">
                  <Clock className="h-4 w-4 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold text-white">{analysis.avgWorkoutDuration}m</div>
                  <div className="text-sm text-[#A1A1A3]">Avg Duration</div>
                </div>
                <div className="p-3 border border-[#2C2C2E] bg-[#2C2C2E] rounded-lg text-center">
                  <Activity className="h-4 w-4 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold text-white">{analysis.avgSetsPerWorkout}</div>
                  <div className="text-sm text-[#A1A1A3]">Sets/Workout</div>
                </div>
                <div className="p-3 border border-[#2C2C2E] bg-[#2C2C2E] rounded-lg text-center">
                  <Target className="h-4 w-4 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold text-white">{analysis.avgWorkoutsPerWeek}</div>
                  <div className="text-sm text-[#A1A1A3]">Workouts/Week</div>
                </div>
              </div>

              {/* Performance Indicators */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium text-white">Consistency Score</h4>
                  <div className="flex items-center gap-2">
                    <Progress value={analysis.consistencyScore} className="flex-1" />
                    <span className="text-sm font-medium text-white">{analysis.consistencyScore}%</span>
                  </div>
                  <p className="text-sm text-[#A1A1A3]">
                    {analysis.consistencyScore >= 80 ? 'Excellent consistency!' :
                     analysis.consistencyScore >= 60 ? 'Good workout regularity' :
                     'Room for improvement in consistency'}
                  </p>
                </div>

                <div className={`p-3 border rounded-lg ${getTrendColor(analysis.workoutTrend)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getTrendIcon(analysis.workoutTrend)}
                    <span className="font-medium">Workout Frequency Trend</span>
                  </div>
                  <p className="text-sm capitalize">{analysis.workoutTrend} frequency</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              {/* Period Comparison */}
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(analysis.periodBreakdown).map(([period, data]) => (
                  <div key={period} className="p-3 border border-[#2C2C2E] bg-[#2C2C2E] rounded-lg">
                    <h4 className="font-medium text-white mb-2 capitalize">
                      {period.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#A1A1A3]">Workouts:</span>
                        <span className="font-medium text-white">{data.workouts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A1A1A3]">Total Sets:</span>
                        <span className="font-medium text-white">{data.sets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A1A1A3]">Consistency:</span>
                        <span className="font-medium text-white">{data.consistency}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="exercises" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-white">Most Frequent Exercises</h4>
                {analysis.favoriteExercises.map((exercise, index) => (
                  <div key={exercise.name} className="flex items-center justify-between p-3 border border-[#2C2C2E] bg-[#2C2C2E] rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-white border-[#3C3C3E]">#{index + 1}</Badge>
                      <span className="font-medium text-white">{exercise.name}</span>
                    </div>
                    <Badge className="bg-[#FF375F] text-white border-[#FF375F]">
                      {exercise.frequency} times
                    </Badge>
                  </div>
                ))}
                {analysis.favoriteExercises.length === 0 && (
                  <p className="text-[#A1A1A3] text-center py-4">No exercise data available yet</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : null}
      </CardContent>
    </Card>
  )
}