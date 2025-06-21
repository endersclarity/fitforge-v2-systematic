"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RefreshCw, Database, TrendingUp, BarChart3, Activity } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getUserProgressData } from "@/lib/session-storage"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface Exercise {
  id: string
  name: string
  category: string
  muscle_engagement: Record<string, number>
  difficulty_level: number
}

interface WorkoutSession {
  id: string
  workout_id: string
  start_time: string
  end_time: string | null
  duration_minutes: number | null
  total_volume: number
  adherence_rate: number
  perceived_difficulty: number
}


interface ProgressData {
  totalSessions: number
  totalVolume: number
  averageDuration: number
  recentSessions: any[]
}

const MUSCLE_COLORS = {
  'Chest': '#FF6B6B',
  'Back': '#4ECDC4', 
  'Shoulders': '#45B7D1',
  'Arms': '#96CEB4',
  'Legs': '#FFEAA7',
  'Core': '#DDA0DD'
}

export function ExcelLikeDashboard() {
  const [exercises, setExercises] = useState<Exercise[]>([]) // Keep for muscle engagement lookup
  const [progressData, setProgressData] = useState<ProgressData>({ totalSessions: 0, totalVolume: 0, averageDuration: 0, recentSessions: [] })
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch exercises (for muscle engagement reference in analytics)
      const { data: exercisesData } = await supabase
        .from('exercises')
        .select('*')
        .order('name')

      // Fetch REAL workout progress data
      const workoutProgressData = await getUserProgressData('00000000-0000-4000-8000-000000000001')

      setExercises(exercisesData || [])
      setProgressData(workoutProgressData)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  // ACTUAL USEFUL ANALYTICS: Progressive Overload Tracking
  const getProgressiveOverloadData = () => {
    const exerciseProgressions: Record<string, Array<{ date: string, maxWeight: number, volume: number }>> = {}
    
    progressData.recentSessions.forEach(session => {
      const sessionDate = new Date(session.start_time).toLocaleDateString()
      
      session.exercises?.forEach((exercise: any) => {
        const exerciseName = exercise.name
        if (!exerciseProgressions[exerciseName]) {
          exerciseProgressions[exerciseName] = []
        }
        
        const maxWeight = Math.max(...exercise.sets.map((set: any) => set.weight))
        const totalVolume = exercise.sets.reduce((vol: number, set: any) => vol + (set.reps * set.weight), 0)
        
        exerciseProgressions[exerciseName].push({
          date: sessionDate,
          maxWeight,
          volume: totalVolume
        })
      })
    })

    // Return top 5 exercises by frequency for charts
    return Object.entries(exerciseProgressions)
      .sort(([,a], [,b]) => b.length - a.length)
      .slice(0, 5)
      .map(([exercise, data]) => ({
        exercise,
        data: data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      }))
  }

  // Volume Trends Over Time
  const getVolumeTrends = () => {
    return progressData.recentSessions
      .map(session => ({
        date: new Date(session.start_time).toLocaleDateString(),
        volume: session.total_volume,
        sets: session.total_sets,
        exercises: session.total_exercises,
        duration: Math.round((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60))
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10) // Last 10 sessions
  }

  // RPE Distribution from actual workouts
  const getRPEDistribution = () => {
    const rpeData: Record<string, number> = {}
    let totalSets = 0
    
    progressData.recentSessions.forEach(session => {
      session.exercises?.forEach((exercise: any) => {
        exercise.sets?.forEach((set: any) => {
          if (set.rpe) {
            const rpeRange = set.rpe <= 6 ? 'Easy (5-6)' : 
                           set.rpe <= 8 ? 'Moderate (7-8)' : 'Hard (9-10)'
            rpeData[rpeRange] = (rpeData[rpeRange] || 0) + 1
            totalSets++
          }
        })
      })
    })

    return Object.entries(rpeData).map(([range, count]) => ({
      range,
      count,
      percentage: Math.round((count / totalSets) * 100)
    }))
  }

  // Muscle Group Volume Distribution from ACTUAL workouts
  const getMuscleVolumeDistribution = () => {
    const muscleVolumes: Record<string, number> = {}
    
    progressData.recentSessions.forEach(session => {
      session.exercises?.forEach((exercise: any) => {
        const exerciseData = exercises.find(e => e.name === exercise.name)
        if (exerciseData?.muscle_engagement) {
          // Calculate total exercise volume from sets: reps * weight for each set
          const totalExerciseVolume = exercise.sets?.reduce((total: number, set: any) => 
            total + (set.reps * set.weight), 0) || 0
          
          Object.entries(exerciseData.muscle_engagement).forEach(([muscle, engagement]) => {
            const muscleVolume = totalExerciseVolume * (engagement / 100)
            muscleVolumes[muscle] = (muscleVolumes[muscle] || 0) + muscleVolume
          })
        }
      })
    })

    return Object.entries(muscleVolumes)
      .filter(([muscle, volume]) => volume > 0) // Only include muscles with actual volume
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8) // Top 8 muscle groups
      .map(([muscle, volume]) => ({
        muscle: muscle.replace(/_/g, ' '), // Replace all underscores
        volume: Math.round(volume),
        color: Object.values(MUSCLE_COLORS)[Object.keys(muscleVolumes).indexOf(muscle) % Object.values(MUSCLE_COLORS).length]
      }))
  }

  const progressiveOverloadData = getProgressiveOverloadData()
  const volumeTrends = getVolumeTrends()
  const rpeDistribution = getRPEDistribution()
  const muscleVolumeData = getMuscleVolumeDistribution()

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            Live from Supabase • Last updated: {mounted && lastRefresh ? lastRefresh.toLocaleTimeString() : '--:--:--'}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Volume</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progressData.recentSessions.length > 0 ? 
                progressData.recentSessions[0].total_volume.toLocaleString() : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              lbs in last workout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.totalVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              lbs lifted all time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(progressData.averageDuration)}</div>
            <p className="text-xs text-muted-foreground">
              minutes per workout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workout Sessions</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {progressData.totalSessions === 0 ? 'No logged workouts yet' : `${progressData.totalVolume.toLocaleString()} lbs total volume`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* USEFUL CHARTS: Workout Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Trends Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Training Volume Trends</CardTitle>
            <CardDescription>Your workout volume progression over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === `volume` ? `${value.toLocaleString()} lbs` : value,
                    name === `volume` ? `Total Volume` : 
                    name === `sets` ? `Total Sets` : 
                    name === `duration` ? `Duration (min)` : name
                  ]}
                />
                <Bar dataKey="volume" fill="#4ECDC4" name="volume" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Training Intensity (RPE) Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Training Intensity Distribution</CardTitle>
            <CardDescription>How hard you're training (RPE analysis)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={rpeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, percentage }) => `${range}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {rpeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.range.includes('Easy') ? '#96CEB4' :
                      entry.range.includes('Moderate') ? '#FFEAA7' : '#FF6B6B'
                    } />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} sets`, `Count`]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Muscle Volume Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Muscle Group Volume Distribution</CardTitle>
            <CardDescription>Which muscles you are training the most (by volume)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={muscleVolumeData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="muscle" type="category" width={100} />
                <Tooltip formatter={(value) => [`${value.toLocaleString()} lbs`, `Volume`]} />
                <Bar dataKey="volume" fill="#45B7D1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Progressive Overload Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Progressive Overload Tracking</CardTitle>
            <CardDescription>Strength gains in your most frequent exercises</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressiveOverloadData.slice(0, 5).map((exerciseData, index) => {
                const firstWeight = exerciseData.data[0]?.maxWeight || 0
                const lastWeight = exerciseData.data[exerciseData.data.length - 1]?.maxWeight || 0
                const improvement = lastWeight - firstWeight
                const improvementPercent = firstWeight > 0 ? Math.round((improvement / firstWeight) * 100) : 0
                
                return (
                  <div key={exerciseData.exercise} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{exerciseData.exercise}</div>
                      <div className="text-sm text-muted-foreground">
                        {firstWeight} lbs → {lastWeight} lbs
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {improvement >= 0 ? '+' : ''}{improvement} lbs
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {improvementPercent >= 0 ? '+' : ''}{improvementPercent}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Workout Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Workout History & Detailed Analytics</CardTitle>
          <CardDescription>
            Click any workout to view detailed exercise-by-exercise analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Workout</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Sets</TableHead>
                <TableHead>Top Exercises</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {progressData.recentSessions.slice(0, 15).map((session) => {
                const duration = Math.round((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60))
                const topExercises = session.exercises?.slice(0, 3).map(ex => ex.name).join(', ') || 'No exercises'
                
                return (
                  <TableRow 
                    key={session.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      // Navigate to detailed workout analytics page
                      window.location.href = `/analytics/workout/${session.id}`
                    }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{new Date(session.start_time).toLocaleDateString()}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(session.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Badge variant="secondary" className="w-fit">{session.name}</Badge>
                        <span className="text-xs text-muted-foreground mt-1">
                          Type {session.workout_type || 'A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span className="font-mono">{duration}</span>
                        <span className="text-xs text-muted-foreground">min</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-primary font-bold">
                          {session.total_volume.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">lbs</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{session.total_sets} sets</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-sm text-muted-foreground" title={topExercises}>
                        {topExercises}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        +{Math.max(0, (session.exercises?.length || 0) - 3)} more
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.href = `/analytics/workout/${session.id}`
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {progressData.recentSessions.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No workout sessions found</p>
              <p className="text-sm">Complete some workouts to see detailed analytics</p>
            </div>
          )}

          {progressData.recentSessions.length > 15 && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => window.location.href = '/analytics/workouts'}>
                View All Workout History
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading live data from Supabase...</p>
        </div>
      )}
    </div>
  )
}