"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Calendar, Clock, Target, TrendingUp, AlertCircle, CheckCircle, Zap, Activity } from "lucide-react"

interface WorkoutFrequencyOptimizerProps {
  className?: string
}

interface FrequencyData {
  day: string
  workouts: number
  avgDuration: number
  avgVolume: number
  restQuality: number
}

interface WeeklyPattern {
  week: string
  workouts: number
  totalVolume: number
  avgIntensity: number
  recoveryScore: number
}

interface OptimizationRecommendation {
  type: 'frequency' | 'timing' | 'recovery' | 'intensity'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  expectedImprovement: string
  actionSteps: string[]
}

interface FrequencyMetrics {
  weeklyAverage: number
  consistency: number
  optimalFrequency: number
  currentEfficiency: number
  recoveryRating: number
  recommendations: OptimizationRecommendation[]
}

export function WorkoutFrequencyOptimizer({ className }: WorkoutFrequencyOptimizerProps) {
  const [timeFrame, setTimeFrame] = useState<string>("30")
  const [optimizationGoal, setOptimizationGoal] = useState<string>("balanced")
  const [frequencyData, setFrequencyData] = useState<FrequencyData[]>([])
  const [weeklyPatterns, setWeeklyPatterns] = useState<WeeklyPattern[]>([])
  const [metrics, setMetrics] = useState<FrequencyMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    analyzeWorkoutFrequency()
  }, [timeFrame, optimizationGoal])

  const analyzeWorkoutFrequency = () => {
    setIsLoading(true)
    
    const workouts = JSON.parse(localStorage.getItem("workoutSessions") || "[]")
    
    if (workouts.length === 0) {
      setFrequencyData([])
      setWeeklyPatterns([])
      setMetrics(null)
      setIsLoading(false)
      return
    }

    // Filter by time frame
    const now = new Date()
    const daysBack = parseInt(timeFrame)
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    const filteredWorkouts = workouts.filter((workout: any) => new Date(workout.date) >= cutoffDate)

    // Analyze daily patterns
    const dailyData: Record<string, any> = {}
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    dayNames.forEach(day => {
      dailyData[day] = {
        workouts: 0,
        totalDuration: 0,
        totalVolume: 0,
        sessions: []
      }
    })

    filteredWorkouts.forEach((workout: any) => {
      const workoutDate = new Date(workout.date)
      const dayName = dayNames[workoutDate.getDay()]
      
      dailyData[dayName].workouts++
      dailyData[dayName].totalDuration += workout.duration || 60 // Default 60 min if not recorded
      dailyData[dayName].totalVolume += workout.totalVolume || 0
      dailyData[dayName].sessions.push(workout)
    })

    // Calculate daily averages and rest quality
    const dailyFrequency: FrequencyData[] = dayNames.map(day => {
      const data = dailyData[day]
      const avgDuration = data.workouts > 0 ? data.totalDuration / data.workouts : 0
      const avgVolume = data.workouts > 0 ? data.totalVolume / data.workouts : 0
      
      // Calculate rest quality based on spacing between workouts
      let restQuality = 100 // Default good rest
      if (data.workouts > 1) {
        // Penalize if multiple workouts on same day too often
        const weekCount = Math.ceil(daysBack / 7)
        const workoutsPerWeek = data.workouts / weekCount
        if (workoutsPerWeek > 1) {
          restQuality = Math.max(50, 100 - (workoutsPerWeek - 1) * 25)
        }
      }

      return {
        day,
        workouts: data.workouts,
        avgDuration: Math.round(avgDuration),
        avgVolume: Math.round(avgVolume),
        restQuality: Math.round(restQuality)
      }
    })

    // Analyze weekly patterns
    const weeklyData: Record<string, any> = {}
    const weekCount = Math.ceil(daysBack / 7)

    for (let i = 0; i < weekCount; i++) {
      const weekStart = new Date(now.getTime() - ((i + 1) * 7 * 24 * 60 * 60 * 1000))
      const weekEnd = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000))
      const weekKey = `Week ${weekCount - i}`
      
      const weekWorkouts = filteredWorkouts.filter((workout: any) => {
        const workoutDate = new Date(workout.date)
        return workoutDate >= weekStart && workoutDate < weekEnd
      })

      weeklyData[weekKey] = {
        workouts: weekWorkouts.length,
        totalVolume: weekWorkouts.reduce((sum: number, w: any) => sum + (w.totalVolume || 0), 0),
        avgIntensity: calculateAverageIntensity(weekWorkouts),
        recoveryScore: calculateRecoveryScore(weekWorkouts)
      }
    }

    const weeklyPatterns: WeeklyPattern[] = Object.entries(weeklyData).map(([week, data]: [string, any]) => ({
      week,
      workouts: data.workouts,
      totalVolume: data.totalVolume,
      avgIntensity: Math.round(data.avgIntensity),
      recoveryScore: Math.round(data.recoveryScore)
    }))

    // Calculate optimization metrics
    const totalWorkouts = filteredWorkouts.length
    const weeklyAverage = totalWorkouts / weekCount
    const consistency = calculateConsistency(weeklyPatterns)
    const optimalFrequency = calculateOptimalFrequency(optimizationGoal, weeklyAverage)
    const currentEfficiency = calculateEfficiency(weeklyPatterns)
    const recoveryRating = calculateOverallRecovery(dailyFrequency)
    const recommendations = generateRecommendations(weeklyAverage, optimalFrequency, consistency, recoveryRating, optimizationGoal)

    const frequencyMetrics: FrequencyMetrics = {
      weeklyAverage: Math.round(weeklyAverage * 10) / 10,
      consistency: Math.round(consistency),
      optimalFrequency: optimalFrequency,
      currentEfficiency: Math.round(currentEfficiency),
      recoveryRating: Math.round(recoveryRating),
      recommendations
    }

    setFrequencyData(dailyFrequency)
    setWeeklyPatterns(weeklyPatterns)
    setMetrics(frequencyMetrics)
    setIsLoading(false)
  }

  const calculateAverageIntensity = (workouts: any[]): number => {
    if (workouts.length === 0) return 0
    
    // Estimate intensity based on volume and duration
    const totalIntensity = workouts.reduce((sum, workout) => {
      const volume = workout.totalVolume || 0
      const duration = workout.duration || 60
      const intensity = volume / duration // Volume per minute as intensity proxy
      return sum + Math.min(intensity, 100) // Cap at 100
    }, 0)
    
    return totalIntensity / workouts.length
  }

  const calculateRecoveryScore = (workouts: any[]): number => {
    if (workouts.length === 0) return 100
    
    // Calculate based on spacing between workouts
    const sortedDates = workouts.map(w => new Date(w.date)).sort((a, b) => a.getTime() - b.getTime())
    
    let totalRecovery = 0
    let recoveryCount = 0
    
    for (let i = 1; i < sortedDates.length; i++) {
      const daysBetween = (sortedDates[i].getTime() - sortedDates[i-1].getTime()) / (1000 * 60 * 60 * 24)
      
      // Optimal recovery is 1-2 days between workouts
      let recoveryScore = 100
      if (daysBetween < 1) recoveryScore = 40 // Too frequent
      else if (daysBetween < 0.5) recoveryScore = 20 // Same day
      else if (daysBetween > 3) recoveryScore = 70 // Too much gap
      
      totalRecovery += recoveryScore
      recoveryCount++
    }
    
    return recoveryCount > 0 ? totalRecovery / recoveryCount : 100
  }

  const calculateConsistency = (patterns: WeeklyPattern[]): number => {
    if (patterns.length === 0) return 0
    
    const workoutCounts = patterns.map(p => p.workouts)
    const average = workoutCounts.reduce((sum, count) => sum + count, 0) / workoutCounts.length
    
    const variance = workoutCounts.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / workoutCounts.length
    const standardDeviation = Math.sqrt(variance)
    
    // Higher consistency = lower standard deviation
    const consistency = Math.max(0, 100 - (standardDeviation * 20))
    return consistency
  }

  const calculateOptimalFrequency = (goal: string, current: number): number => {
    switch (goal) {
      case 'strength':
        return Math.max(3, Math.min(5, Math.ceil(current * 1.2))) // 3-5 workouts for strength
      case 'hypertrophy':
        return Math.max(4, Math.min(6, Math.ceil(current * 1.3))) // 4-6 workouts for muscle growth
      case 'endurance':
        return Math.max(4, Math.min(7, Math.ceil(current * 1.4))) // 4-7 workouts for endurance
      case 'weight-loss':
        return Math.max(4, Math.min(6, Math.ceil(current * 1.5))) // 4-6 workouts for weight loss
      case 'balanced':
      default:
        return Math.max(3, Math.min(5, Math.ceil(current * 1.1))) // 3-5 balanced workouts
    }
  }

  const calculateEfficiency = (patterns: WeeklyPattern[]): number => {
    if (patterns.length === 0) return 0
    
    // Efficiency based on volume per workout and recovery scores
    const avgVolumePerWorkout = patterns.reduce((sum, p) => {
      return sum + (p.workouts > 0 ? p.totalVolume / p.workouts : 0)
    }, 0) / patterns.length
    
    const avgRecovery = patterns.reduce((sum, p) => sum + p.recoveryScore, 0) / patterns.length
    
    // Normalize efficiency score (0-100)
    const volumeScore = Math.min(100, avgVolumePerWorkout / 50) // Assuming 5000 volume is excellent
    const efficiency = (volumeScore * 0.7) + (avgRecovery * 0.3)
    
    return efficiency
  }

  const calculateOverallRecovery = (dailyData: FrequencyData[]): number => {
    const totalRestQuality = dailyData.reduce((sum, day) => sum + day.restQuality, 0)
    return totalRestQuality / dailyData.length
  }

  const generateRecommendations = (
    current: number, 
    optimal: number, 
    consistency: number, 
    recovery: number, 
    goal: string
  ): OptimizationRecommendation[] => {
    const recommendations: OptimizationRecommendation[] = []

    // Frequency recommendations
    if (Math.abs(current - optimal) > 0.5) {
      const isIncrease = optimal > current
      recommendations.push({
        type: 'frequency',
        priority: 'high',
        title: `${isIncrease ? 'Increase' : 'Decrease'} Workout Frequency`,
        description: `Your current ${current} workouts/week should be adjusted to ${optimal} for optimal ${goal} results.`,
        expectedImprovement: `${Math.round(Math.abs(optimal - current) * 15)}% improvement in progress`,
        actionSteps: [
          isIncrease 
            ? `Add ${Math.ceil(optimal - current)} more workout${optimal - current > 1 ? 's' : ''} per week`
            : `Reduce workouts by ${Math.ceil(current - optimal)} per week`,
          'Focus on progressive overload rather than just frequency',
          'Monitor recovery between sessions'
        ]
      })
    }

    // Consistency recommendations
    if (consistency < 75) {
      recommendations.push({
        type: 'frequency',
        priority: 'medium',
        title: 'Improve Workout Consistency',
        description: `Your workout consistency is ${consistency}%. More regular training leads to better results.`,
        expectedImprovement: '25% faster progress with consistent training',
        actionSteps: [
          'Schedule specific workout days and times',
          'Set up accountability systems',
          'Start with a sustainable routine'
        ]
      })
    }

    // Recovery recommendations
    if (recovery < 70) {
      recommendations.push({
        type: 'recovery',
        priority: 'high',
        title: 'Improve Recovery Between Workouts',
        description: `Recovery score is ${recovery}%. Poor recovery can limit progress and increase injury risk.`,
        expectedImprovement: '30% better performance with adequate recovery',
        actionSteps: [
          'Allow at least 48 hours between intense sessions',
          'Include active recovery days',
          'Prioritize sleep and nutrition',
          'Consider deload weeks every 4-6 weeks'
        ]
      })
    }

    // Timing recommendations
    const hasWeekendGap = true // Simplified logic
    if (hasWeekendGap) {
      recommendations.push({
        type: 'timing',
        priority: 'low',
        title: 'Optimize Workout Timing',
        description: 'Consider spreading workouts more evenly throughout the week.',
        expectedImprovement: '15% better muscle protein synthesis',
        actionSteps: [
          'Avoid consecutive rest days when possible',
          'Schedule at least one weekend workout',
          'Maintain consistent workout times'
        ]
      })
    }

    // Goal-specific recommendations
    if (goal === 'strength' && current > 5) {
      recommendations.push({
        type: 'intensity',
        priority: 'medium',
        title: 'Focus on Quality Over Quantity',
        description: 'For strength goals, fewer high-intensity sessions are more effective than frequent moderate workouts.',
        expectedImprovement: '20% better strength gains',
        actionSteps: [
          'Reduce frequency to 3-5 sessions per week',
          'Increase weight and decrease reps',
          'Ensure full recovery between sessions'
        ]
      })
    }

    return recommendations.slice(0, 4) // Limit to top 4 recommendations
  }

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4" />
      case 'medium': return <Clock className="h-4 w-4" />
      case 'low': return <CheckCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Workout Frequency Optimizer
          </CardTitle>
          <CardDescription>Analyzing workout frequency patterns...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading frequency analysis...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics || frequencyData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Workout Frequency Optimizer
          </CardTitle>
          <CardDescription>Optimize your workout frequency for maximum results</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Complete some workouts to see your frequency optimization recommendations.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Workout Frequency Optimizer
              </CardTitle>
              <CardDescription>Optimize your training schedule for maximum results and recovery</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={optimizationGoal} onValueChange={setOptimizationGoal}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="hypertrophy">Muscle Growth</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="weight-loss">Weight Loss</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeFrame} onValueChange={setTimeFrame}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 60 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 border rounded-lg text-center">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{metrics.weeklyAverage}</div>
                  <div className="text-sm text-muted-foreground">Workouts/Week</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{metrics.optimalFrequency}</div>
                  <div className="text-sm text-muted-foreground">Optimal Frequency</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{metrics.consistency}%</div>
                  <div className="text-sm text-muted-foreground">Consistency</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold">{metrics.currentEfficiency}%</div>
                  <div className="text-sm text-muted-foreground">Efficiency</div>
                </div>
              </div>

              {/* Frequency Status Alert */}
              {Math.abs(metrics.weeklyAverage - metrics.optimalFrequency) > 0.5 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Frequency Adjustment Needed:</strong>{' '}
                    {metrics.weeklyAverage < metrics.optimalFrequency 
                      ? `Consider increasing to ${metrics.optimalFrequency} workouts per week`
                      : `Consider reducing to ${metrics.optimalFrequency} workouts per week`
                    } for optimal {optimizationGoal} results.
                  </AlertDescription>
                </Alert>
              )}

              {/* Daily Distribution Chart */}
              <div className="space-y-3">
                <h4 className="font-medium">Weekly Distribution</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={frequencyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'workouts' ? `${value} workouts` :
                          name === 'avgDuration' ? `${value} min` :
                          name === 'avgVolume' ? `${value} volume` :
                          `${value}%`,
                          name === 'workouts' ? 'Workouts' :
                          name === 'avgDuration' ? 'Avg Duration' :
                          name === 'avgVolume' ? 'Avg Volume' : 'Rest Quality'
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="workouts" fill="#8884d8" name="Workouts" />
                      <Bar dataKey="restQuality" fill="#82ca9d" name="Rest Quality %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="patterns" className="space-y-4">
              {/* Weekly Trends */}
              <div className="space-y-3">
                <h4 className="font-medium">Weekly Trends</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyPatterns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="workouts" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        name="Workouts"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="recoveryScore" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        name="Recovery Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Pattern Details */}
              <div className="space-y-3">
                <h4 className="font-medium">Weekly Pattern Analysis</h4>
                {weeklyPatterns.map((week, index) => (
                  <div key={week.week} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{week.week}</Badge>
                      <div>
                        <span className="font-medium">{week.workouts} workouts</span>
                        <div className="text-sm text-muted-foreground">
                          {week.totalVolume.toLocaleString()} volume • {week.avgIntensity}% intensity
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-right">
                      <div className="font-medium">Recovery: {week.recoveryScore}%</div>
                      <div className={`text-muted-foreground ${
                        week.recoveryScore >= 80 ? 'text-green-600' :
                        week.recoveryScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {week.recoveryScore >= 80 ? 'Excellent' :
                         week.recoveryScore >= 60 ? 'Good' : 'Needs Improvement'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">Optimization Recommendations</h4>
                
                {metrics.recommendations.map((rec, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <Badge className={getPriorityColor(rec.priority)}>
                          <div className="flex items-center gap-1">
                            {getPriorityIcon(rec.priority)}
                            <span className="capitalize">{rec.priority}</span>
                          </div>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-muted-foreground">{rec.description}</p>
                      
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-900">Expected Improvement</p>
                        <p className="text-sm text-green-800">{rec.expectedImprovement}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Action Steps:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {rec.actionSteps.map((step, stepIndex) => (
                            <li key={stepIndex}>• {step}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">General Frequency Guidelines</h5>
                  <div className="text-sm text-blue-800 space-y-2">
                    <div><strong>Strength:</strong> 3-5 sessions/week with full recovery</div>
                    <div><strong>Muscle Growth:</strong> 4-6 sessions/week with adequate volume</div>
                    <div><strong>Endurance:</strong> 4-7 sessions/week with varied intensity</div>
                    <div><strong>Weight Loss:</strong> 4-6 sessions/week combining cardio and strength</div>
                    <div><strong>Balanced:</strong> 3-5 sessions/week with progressive overload</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}