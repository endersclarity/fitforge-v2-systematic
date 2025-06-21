"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Calendar, TrendingUp, Target, Award } from "lucide-react"

interface WorkoutSession {
  id: string
  name: string
  date: string
  duration: number
  exercises: number
  totalSets: number
}

interface ProgressData {
  date: string
  duration: number
  exercises: number
  sets: number
}

interface MuscleGroupData {
  name: string
  sessions: number
  percentage: number
}

export function ProgressTracker() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [muscleGroupData, setMuscleGroupData] = useState<MuscleGroupData[]>([])
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalTime: 0,
    avgDuration: 0,
    longestStreak: 0,
    currentStreak: 0,
  })

  useEffect(() => {
    // Load workout sessions from localStorage
    const workoutSessions = JSON.parse(localStorage.getItem("workoutSessions") || "[]")
    setSessions(workoutSessions)

    // Process data for charts
    const chartData = workoutSessions
      .slice(-30) // Last 30 sessions
      .map((session: WorkoutSession) => ({
        date: new Date(session.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        duration: session.duration,
        exercises: session.exercises,
        sets: session.totalSets,
      }))
    setProgressData(chartData)

    // Calculate muscle group distribution (mock data for now)
    const muscleGroups = [
      { name: "Chest/Triceps", sessions: Math.floor(Math.random() * 20) + 5, percentage: 0 },
      { name: "Back/Biceps", sessions: Math.floor(Math.random() * 20) + 5, percentage: 0 },
      { name: "Legs", sessions: Math.floor(Math.random() * 15) + 3, percentage: 0 },
      { name: "Abs", sessions: Math.floor(Math.random() * 10) + 2, percentage: 0 },
    ]

    const totalSessions = muscleGroups.reduce((sum, group) => sum + group.sessions, 0)
    muscleGroups.forEach((group) => {
      group.percentage = Math.round((group.sessions / totalSessions) * 100)
    })
    setMuscleGroupData(muscleGroups)

    // Calculate stats
    const totalWorkouts = workoutSessions.length
    const totalTime = workoutSessions.reduce((sum: number, session: WorkoutSession) => sum + session.duration, 0)
    const avgDuration = totalWorkouts > 0 ? Math.round(totalTime / totalWorkouts) : 0

    // Calculate streaks
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    const sortedSessions = [...workoutSessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    for (let i = 0; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].date)
      const today = new Date()
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))

      if (i === 0 && daysDiff <= 1) {
        currentStreak = 1
        tempStreak = 1
      } else if (i > 0) {
        const prevSessionDate = new Date(sortedSessions[i - 1].date)
        const daysBetween = Math.floor((prevSessionDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysBetween <= 2) {
          tempStreak++
          if (i === 1 || currentStreak > 0) currentStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
          if (currentStreak > 0) currentStreak = 0
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    setStats({
      totalWorkouts,
      totalTime,
      avgDuration,
      longestStreak,
      currentStreak,
    })
  }, [])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Progress Tracker</h1>
        <p className="text-muted-foreground">Monitor your fitness journey and achievements</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">sessions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.totalTime)}</div>
            <p className="text-xs text-muted-foreground">time invested</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration}m</div>
            <p className="text-xs text-muted-foreground">per workout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">days (best: {stats.longestStreak})</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress">Progress Charts</TabsTrigger>
          <TabsTrigger value="muscle-groups">Muscle Groups</TabsTrigger>
          <TabsTrigger value="history">Workout History</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Workout Duration Trend</CardTitle>
                <CardDescription>Track your workout duration over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="duration"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exercise Volume</CardTitle>
                <CardDescription>Number of exercises per workout</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="exercises" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="muscle-groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Muscle Group Distribution</CardTitle>
              <CardDescription>See which muscle groups you&apos;ve been focusing on</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {muscleGroupData.map((group) => (
                <div key={group.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{group.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{group.sessions} sessions</span>
                      <Badge variant="secondary">{group.percentage}%</Badge>
                    </div>
                  </div>
                  <Progress value={group.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workout History</CardTitle>
              <CardDescription>Complete log of your training sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No workout sessions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions
                    .slice()
                    .reverse()
                    .map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{session.name}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{new Date(session.date).toLocaleDateString()}</span>
                            <span>{session.duration}min</span>
                            <span>{session.exercises} exercises</span>
                          </div>
                        </div>
                        <Badge variant="secondary">{session.totalSets} sets</Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
