"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Dumbbell, TrendingUp, Timer, Target } from "lucide-react"

interface LastWorkoutSummaryProps {
  className?: string
}

interface WorkoutSession {
  id: string
  name: string
  date: string
  duration: number
  total_volume: number
  total_sets: number
  exercises: Array<{
    id: string
    name: string
    sets: Array<{
      reps: number
      weight: number
      completed: boolean
    }>
    exerciseVolume: number
    muscleEngagement?: Record<string, number>
  }>
}

export function LastWorkoutSummary({ className }: LastWorkoutSummaryProps) {
  const [lastWorkout, setLastWorkout] = useState<WorkoutSession | null>(null)
  const [musclesSummary, setMusclesSummary] = useState<Record<string, number>>({})

  useEffect(() => {
    // Load last workout from localStorage
    const workouts = JSON.parse(localStorage.getItem("workoutSessions") || "[]")
    if (workouts.length > 0) {
      const latest = workouts[workouts.length - 1]
      setLastWorkout(latest)
      
      // Calculate muscle engagement summary
      const allMuscles: Record<string, number> = {}
      latest.exercises?.forEach((exercise: any) => {
        if (exercise.muscleEngagement) {
          Object.entries(exercise.muscleEngagement).forEach(([muscle, engagement]) => {
            allMuscles[muscle] = (allMuscles[muscle] || 0) + (engagement as number)
          })
        }
      })
      setMusclesSummary(allMuscles)
    }
  }, [])

  if (!lastWorkout) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Last Workout</CardTitle>
          <CardDescription>No workouts completed yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Complete your first workout to see detailed analysis here.</p>
        </CardContent>
      </Card>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    return `${mins} min`
  }

  const sortedMuscles = Object.entries(musclesSummary)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6) // Top 6 muscles

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Last Workout Summary
        </CardTitle>
        <CardDescription>{lastWorkout.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Workout Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{new Date(lastWorkout.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formatTime(lastWorkout.duration)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{lastWorkout.total_sets} sets</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{lastWorkout.total_volume} lb-reps</span>
          </div>
        </div>

        {/* Exercises Performed */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Exercises Performed</h4>
          <div className="space-y-1">
            {lastWorkout.exercises?.map((exercise, index) => (
              <div key={exercise.id} className="flex items-center justify-between text-sm">
                <span>{exercise.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{exercise.sets.length} sets</span>
                  <Badge variant="outline" className="text-xs">
                    {exercise.exerciseVolume} vol
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Muscles Worked */}
        {sortedMuscles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Muscles Worked</h4>
            <div className="space-y-2">
              {sortedMuscles.map(([muscle, engagement]) => (
                <div key={muscle} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{muscle}</span>
                    <span className="text-muted-foreground">{engagement}% engagement</span>
                  </div>
                  <Progress value={Math.min(engagement, 100)} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Volume Analysis */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm text-blue-900">Volume Analysis</span>
          </div>
          <p className="text-sm text-blue-800">
            Total volume: {lastWorkout.total_volume} lb-reps across {lastWorkout.exercises?.length || 0} exercises.
            Average per exercise: {Math.round(lastWorkout.total_volume / (lastWorkout.exercises?.length || 1))} lb-reps.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}