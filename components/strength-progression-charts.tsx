"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from "recharts"
import { TrendingUp, TrendingDown, Activity, Calendar, Target, Zap } from "lucide-react"

interface StrengthProgressionChartsProps {
  className?: string
}

interface ProgressionData {
  date: string
  exercise: string
  volume: number
  maxWeight: number
  totalReps: number
  oneRepMax: number
  sets: number
}

interface ChartData {
  date: string
  volume: number
  maxWeight: number
  oneRepMax: number
  totalReps: number
}

interface ExerciseStats {
  name: string
  currentVolume: number
  currentMaxWeight: number
  volumeChange: number
  weightChange: number
  trend: 'up' | 'down' | 'stable'
  sessions: number
}

export function StrengthProgressionCharts({ className }: StrengthProgressionChartsProps) {
  const [selectedExercise, setSelectedExercise] = useState<string>("all")
  const [timeFrame, setTimeFrame] = useState<string>("30")
  const [chartType, setChartType] = useState<string>("volume")
  const [progressionData, setProgressionData] = useState<ProgressionData[]>([])
  const [exerciseStats, setExerciseStats] = useState<ExerciseStats[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    analyzeStrengthProgression()
  }, [selectedExercise, timeFrame])

  const analyzeStrengthProgression = () => {
    setIsLoading(true)
    
    const workouts = JSON.parse(localStorage.getItem("workoutSessions") || "[]")
    
    if (workouts.length === 0) {
      setProgressionData([])
      setExerciseStats([])
      setIsLoading(false)
      return
    }

    // Filter by time frame
    const now = new Date()
    const daysBack = timeFrame === "all" ? 365 : parseInt(timeFrame)
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    const filteredWorkouts = timeFrame === "all" ? workouts : 
      workouts.filter((workout: any) => new Date(workout.date) >= cutoffDate)

    // Process workout data into progression format
    const progressionMap: Record<string, ProgressionData[]> = {}
    
    filteredWorkouts.forEach((workout: any) => {
      workout.exercises?.forEach((exercise: any) => {
        if (!progressionMap[exercise.name]) {
          progressionMap[exercise.name] = []
        }

        // Calculate metrics for this exercise session
        const volume = exercise.exerciseVolume || 0
        const maxWeight = Math.max(...(exercise.sets?.map((set: any) => set.weight) || [0]))
        const totalReps = exercise.sets?.reduce((sum: number, set: any) => sum + (set.reps || 0), 0) || 0
        const oneRepMax = calculateOneRepMax(maxWeight, Math.max(...(exercise.sets?.map((set: any) => set.reps) || [0])))

        progressionMap[exercise.name].push({
          date: workout.date,
          exercise: exercise.name,
          volume,
          maxWeight,
          totalReps,
          oneRepMax,
          sets: exercise.sets?.length || 0
        })
      })
    })

    // Sort data by date for each exercise
    Object.keys(progressionMap).forEach(exerciseName => {
      progressionMap[exerciseName].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    })

    // Generate exercise statistics
    const stats: ExerciseStats[] = Object.entries(progressionMap).map(([exerciseName, data]) => {
      if (data.length < 2) {
        return {
          name: exerciseName,
          currentVolume: data[0]?.volume || 0,
          currentMaxWeight: data[0]?.maxWeight || 0,
          volumeChange: 0,
          weightChange: 0,
          trend: 'stable' as const,
          sessions: data.length
        }
      }

      const firstSession = data[0]
      const lastSession = data[data.length - 1]
      const volumeChange = ((lastSession.volume - firstSession.volume) / firstSession.volume) * 100
      const weightChange = ((lastSession.maxWeight - firstSession.maxWeight) / firstSession.maxWeight) * 100

      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (volumeChange > 5 && weightChange > 0) trend = 'up'
      else if (volumeChange < -5 || weightChange < -5) trend = 'down'

      return {
        name: exerciseName,
        currentVolume: lastSession.volume,
        currentMaxWeight: lastSession.maxWeight,
        volumeChange: Math.round(volumeChange * 10) / 10,
        weightChange: Math.round(weightChange * 10) / 10,
        trend,
        sessions: data.length
      }
    }).sort((a, b) => b.currentVolume - a.currentVolume)

    // Prepare chart data
    if (selectedExercise === "all") {
      // Aggregate data for all exercises by date
      const dateMap: Record<string, ChartData> = {}
      
      Object.values(progressionMap).flat().forEach(session => {
        if (!dateMap[session.date]) {
          dateMap[session.date] = {
            date: session.date,
            volume: 0,
            maxWeight: 0,
            oneRepMax: 0,
            totalReps: 0
          }
        }
        
        dateMap[session.date].volume += session.volume
        dateMap[session.date].maxWeight = Math.max(dateMap[session.date].maxWeight, session.maxWeight)
        dateMap[session.date].oneRepMax = Math.max(dateMap[session.date].oneRepMax, session.oneRepMax)
        dateMap[session.date].totalReps += session.totalReps
      })

      setProgressionData(Object.values(dateMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
    } else {
      // Show data for selected exercise
      const exerciseData = progressionMap[selectedExercise] || []
      setProgressionData(exerciseData.map(session => ({
        date: session.date,
        volume: session.volume,
        maxWeight: session.maxWeight,
        oneRepMax: session.oneRepMax,
        totalReps: session.totalReps
      })))
    }

    setExerciseStats(stats)
    setIsLoading(false)
  }

  const calculateOneRepMax = (weight: number, reps: number): number => {
    if (reps === 1) return weight
    if (reps === 0 || weight === 0) return 0
    // Brzycki formula: 1RM = weight / (1.0278 - 0.0278 × reps)
    return Math.round(weight / (1.0278 - 0.0278 * reps))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-blue-600" />
    }
  }

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50 border-green-200'
      case 'down': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Strength Progression Charts
          </CardTitle>
          <CardDescription>Analyzing strength progression data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading progression data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (exerciseStats.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Strength Progression Charts
          </CardTitle>
          <CardDescription>Track your strength gains over time</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Complete some workouts to see your strength progression charts.</p>
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
                <TrendingUp className="h-5 w-5" />
                Strength Progression Charts
              </CardTitle>
              <CardDescription>Track your strength gains over time with detailed analytics</CardDescription>
            </div>
            <div className="flex items-center gap-2">
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
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Charts</TabsTrigger>
              <TabsTrigger value="exercise-stats">Exercise Stats</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-3 border rounded-lg text-center">
                  <Target className="h-4 w-4 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{exerciseStats.length}</div>
                  <div className="text-sm text-muted-foreground">Exercises Tracked</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <Calendar className="h-4 w-4 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">
                    {exerciseStats.reduce((sum, stat) => sum + stat.sessions, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Sessions</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <TrendingUp className="h-4 w-4 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">
                    {exerciseStats.filter(stat => stat.trend === 'up').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Improving</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <Zap className="h-4 w-4 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold">
                    {Math.round(exerciseStats.reduce((sum, stat) => sum + stat.volumeChange, 0) / exerciseStats.length)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Volume Change</div>
                </div>
              </div>

              {/* Quick Overview Chart */}
              <div className="space-y-3">
                <h4 className="font-medium">Total Volume Progression</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={progressionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        fontSize={12}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        labelFormatter={(value) => `Date: ${formatDate(value)}`}
                        formatter={(value: number) => [value.toLocaleString(), 'Volume']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="volume" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4">
              <div className="flex items-center gap-4">
                <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exercises</SelectItem>
                    {exerciseStats.map(stat => (
                      <SelectItem key={stat.name} value={stat.name}>
                        {stat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volume">Volume</SelectItem>
                    <SelectItem value="weight">Max Weight</SelectItem>
                    <SelectItem value="reps">Total Reps</SelectItem>
                    <SelectItem value="1rm">One Rep Max</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      fontSize={12}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      labelFormatter={(value) => `Date: ${formatDate(value)}`}
                      formatter={(value: number, name: string) => [
                        chartType === 'volume' ? value.toLocaleString() : value,
                        name === 'volume' ? 'Volume' :
                        name === 'maxWeight' ? 'Max Weight (lbs)' :
                        name === 'totalReps' ? 'Total Reps' : 'One Rep Max (lbs)'
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey={chartType === 'volume' ? 'volume' : 
                               chartType === 'weight' ? 'maxWeight' :
                               chartType === 'reps' ? 'totalReps' : 'oneRepMax'} 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: '#8884d8', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="exercise-stats" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Exercise Performance Summary</h4>
                {exerciseStats.map((stat, index) => (
                  <div key={stat.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <span className="font-medium">{stat.name}</span>
                        <div className="text-sm text-muted-foreground">
                          {stat.sessions} sessions • {stat.currentVolume.toLocaleString()} volume
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-right">
                        <div className="font-medium">{stat.currentMaxWeight}lbs</div>
                        <div className="text-muted-foreground">Max Weight</div>
                      </div>
                      <div className={`p-2 border rounded-lg ${getTrendColor(stat.trend)}`}>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(stat.trend)}
                          <span className="text-sm font-medium">
                            {stat.volumeChange > 0 ? '+' : ''}{stat.volumeChange}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}