'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, Calendar, Dumbbell, TrendingUp, Clock } from "lucide-react"

interface WorkoutSession {
  id: string
  name: string
  date: string
  duration: number
  exercises: any[]
  totalSets: number
}

interface WeeklyStats {
  workouts: number
  totalTime: number
  exercisesCompleted: number
  avgIntensity: number
}

export function DashboardSimple() {
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSession[]>([])
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    workouts: 0,
    totalTime: 0,
    exercisesCompleted: 0,
    avgIntensity: 0,
  })

  useEffect(() => {
    const loadDashboardData = () => {
      try {
        // Load workouts from localStorage
        const workouts = JSON.parse(localStorage.getItem("workoutSessions") || "[]")
        const recent = workouts.slice(-5).reverse()
        setRecentWorkouts(recent)

        // Calculate weekly stats
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        
        const thisWeek = workouts.filter((w: WorkoutSession) => {
          return new Date(w.date) >= weekAgo
        })

        const stats = {
          workouts: thisWeek.length,
          totalTime: thisWeek.reduce((sum: number, w: WorkoutSession) => sum + w.duration, 0),
          exercisesCompleted: thisWeek.reduce((sum: number, w: WorkoutSession) => sum + (w.exercises?.length || 0), 0),
          avgIntensity: thisWeek.length > 0
            ? Math.round(thisWeek.reduce((sum: number, w: WorkoutSession) => sum + w.totalSets, 0) / thisWeek.length)
            : 0,
        }
        setWeeklyStats(stats)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      }
    }

    loadDashboardData()
    // Refresh every 2 seconds
    const interval = setInterval(loadDashboardData, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8 p-4 md:p-8" data-testid="app-loaded">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">FitForge Dashboard</h1>
        <p className="text-muted-foreground">Your fitness journey at a glance</p>
      </div>

      {/* Welcome Message for New Users */}
      {recentWorkouts.length === 0 && (
        <Alert>
          <Dumbbell className="h-4 w-4" />
          <AlertDescription>
            Welcome to FitForge! Ready to start your fitness journey? Choose a workout type below to begin logging your exercises with smart progression tracking.
          </AlertDescription>
        </Alert>
      )}

      {/* Weekly Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workouts This Week</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.workouts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.totalTime} min</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exercises Done</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.exercisesCompleted}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sets/Workout</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.avgIntensity}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Workouts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
          <CardDescription>Your last 5 workout sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentWorkouts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No workouts logged yet</p>
              <Button onClick={() => window.location.href = "/push-pull-legs"}>
                Start Your First Workout
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentWorkouts.map((workout) => (
                <div key={workout.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{workout.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(workout.date).toLocaleDateString()} • {workout.duration} min
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {workout.totalSets} sets
                    </Badge>
                    <Badge>
                      {workout.exercises.length} exercises
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Highlights for New Users */}
      {recentWorkouts.length === 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">🎯 Smart Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700">
                Push/Pull/Legs workout system with 37 exercises organized by muscle groups for optimal training.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-800">📈 Progressive Overload</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700">
                Formula-based progression recommendations. Automatically suggests weight increases based on your performance.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">💪 Muscle Targeting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-700">
                Visual muscle engagement maps show exactly which muscles each exercise targets for better planning.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => window.location.href = "/push-pull-legs"} className="flex-1">
          🏋️ Start Workout
        </Button>
        <Button variant="outline" onClick={() => window.location.href = "/muscle-explorer"} className="flex-1">
          📚 Browse Exercises
        </Button>
        <Button variant="outline" onClick={() => window.location.href = "/workout-simple"} className="flex-1">
          ⚡ Quick Log
        </Button>
      </div>
    </div>
  )
}