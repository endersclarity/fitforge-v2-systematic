"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Clock, TrendingUp, Dumbbell, Target, Star } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { dataService } from "@/lib/data-service"
import { DetailedWorkoutSession } from "@/types/workout"

export default function WorkoutAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const [workout, setWorkout] = useState<DetailedWorkoutSession | null>(null)
  const [loading, setLoading] = useState(true)
  const workoutId = params.id as string

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const workoutData = await dataService.getDetailedWorkoutSession(workoutId)
        setWorkout(workoutData)
      } catch (error) {
        console.error('Failed to fetch workout:', error)
      } finally {
        setLoading(false)
      }
    }

    if (workoutId) {
      fetchWorkout()
    }
  }, [workoutId])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading workout analytics...</p>
        </div>
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Workout not found</p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const duration = Math.round((new Date(workout.end_time).getTime() - new Date(workout.start_time).getTime()) / (1000 * 60))
  
  // Exercise performance analytics
  const exerciseAnalytics = workout.exercises.map(exercise => {
    const sets = exercise.sets || []
    const totalVolume = sets.reduce((vol, set) => vol + (set.reps * set.weight), 0)
    const avgRPE = sets.filter(s => s.rpe).reduce((sum, s) => sum + (s.rpe || 0), 0) / sets.filter(s => s.rpe).length || 0
    const maxWeight = Math.max(...sets.map(s => s.weight))
    const totalReps = sets.reduce((reps, set) => reps + set.reps, 0)
    
    return {
      name: exercise.name,
      volume: totalVolume,
      sets: sets.length,
      maxWeight,
      totalReps,
      avgRPE: Math.round(avgRPE * 10) / 10,
      setsData: sets.map((set, idx) => ({
        setNumber: idx + 1,
        reps: set.reps,
        weight: set.weight,
        volume: set.reps * set.weight,
        rpe: set.rpe || 0
      }))
    }
  })

  // Volume progression within workout
  const setProgression = workout.exercises.flatMap((exercise, exerciseIdx) => 
    exercise.sets?.map((set, setIdx) => ({
      setNumber: exerciseIdx * 10 + setIdx + 1, // Global set number
      exercise: exercise.name,
      volume: set.reps * set.weight,
      rpe: set.rpe || 0,
      weight: set.weight
    })) || []
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analytics
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{workout.name}</h1>
            <p className="text-muted-foreground">
              {new Date(workout.start_time).toLocaleDateString()} • 
              {new Date(workout.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>
        <Badge variant="secondary">Type {workout.workout_type}</Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{duration}</div>
            <p className="text-xs text-muted-foreground">minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workout.total_volume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">lbs lifted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workout.total_sets}</div>
            <p className="text-xs text-muted-foreground">{workout.total_exercises} exercises</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg RPE</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(exerciseAnalytics.filter(e => e.avgRPE > 0).reduce((sum, e) => sum + e.avgRPE, 0) / exerciseAnalytics.filter(e => e.avgRPE > 0).length * 10) / 10 || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">perceived intensity</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exercise Volume Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Exercise Volume Breakdown</CardTitle>
            <CardDescription>Volume contribution by exercise</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={exerciseAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value.toLocaleString()} lbs`, `Volume`]} />
                <Bar dataKey="volume" fill="#4ECDC4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Set-by-Set Volume Progression */}
        <Card>
          <CardHeader>
            <CardTitle>Volume Progression Throughout Workout</CardTitle>
            <CardDescription>How your performance changed set by set</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={setProgression}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="setNumber" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === `volume` ? `${value} lbs` : value,
                    name === `volume` ? `Volume` : name
                  ]}
                  labelFormatter={(label) => `Set ${label}`}
                />
                <Line dataKey="volume" stroke="#45B7D1" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Exercise Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Exercise-by-Exercise Analysis</CardTitle>
          <CardDescription>Detailed performance metrics for each exercise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {exerciseAnalytics.map((exercise, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{exercise.name}</h3>
                  <div className="flex space-x-4 text-sm text-muted-foreground">
                    <span>{exercise.volume.toLocaleString()} lbs total</span>
                    <span>{exercise.sets} sets</span>
                    <span>Max: {exercise.maxWeight} lbs</span>
                    {exercise.avgRPE > 0 && <span>RPE: {exercise.avgRPE}</span>}
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Set</TableHead>
                      <TableHead>Reps</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>RPE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exercise.setsData.map((set, setIdx) => (
                      <TableRow key={setIdx}>
                        <TableCell>{set.setNumber}</TableCell>
                        <TableCell>{set.reps}</TableCell>
                        <TableCell className="font-mono">{set.weight} lbs</TableCell>
                        <TableCell className="font-mono">{set.volume.toLocaleString()} lbs</TableCell>
                        <TableCell>
                          {set.rpe > 0 ? (
                            <div className="flex items-center space-x-2">
                              <Progress value={set.rpe * 10} className="w-16" />
                              <span className="text-xs">{set.rpe}/10</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not recorded</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {workout.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Workout Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{workout.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}