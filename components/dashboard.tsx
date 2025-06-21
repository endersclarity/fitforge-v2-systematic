"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Dumbbell, TrendingUp, Plus, Clock, Brain, Activity, Zap, AlertTriangle, CheckCircle, Target } from "lucide-react"
import Link from "next/link"
import { MuscleEngagementChart } from "@/components/muscle-engagement-chart"
import { MuscleRecoveryHeatmap } from "@/components/muscle-recovery-heatmap"
import { LastWorkoutSummary } from "@/components/last-workout-summary"
import { VolumeProgressionCalculator } from "@/components/volume-progression-calculator"
import { BasicMuscleMap } from "@/components/basic-muscle-map"
import { WorkoutPlanningDashboard } from "@/components/workout-planning-dashboard"
import { UserIntakeForm } from "@/components/user-intake-form"
import { WorkoutHistoryAnalyzer } from "@/components/workout-history-analyzer"
import { StrengthProgressionCharts } from "@/components/strength-progression-charts"
import { MuscleBalanceAnalyzer } from "@/components/muscle-balance-analyzer"
import { WorkoutFrequencyOptimizer } from "@/components/workout-frequency-optimizer"
import { AnatomicalMuscleMap } from "@/components/anatomical-muscle-map"
import { WorkoutGenerator, FatigueAnalyzer, ProgressionPlanner } from "@/lib/ai"
import type { GeneratedWorkout, FatigueAnalysis, AIRecommendation } from "@/lib/ai/types"

interface WorkoutSession {
  id: string
  name: string
  date: string
  duration: number
  exercises: any[] // Array of exercise objects
  totalSets: number
}

interface WeeklyStats {
  workouts: number
  totalTime: number
  exercisesCompleted: number
  avgIntensity: number
}

export function Dashboard() {
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSession[]>([])
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    workouts: 0,
    totalTime: 0,
    exercisesCompleted: 0,
    avgIntensity: 0,
  })
  
  // AI-powered features
  const [todaysWorkout, setTodaysWorkout] = useState<GeneratedWorkout | null>(null)
  const [fatigueAnalysis, setFatigueAnalysis] = useState<FatigueAnalysis | null>(null)
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([])
  const [aiLoading, setAiLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [showIntakeForm, setShowIntakeForm] = useState(false)
  
  // AI module instances (lazy loaded to prevent runtime errors)
  const [workoutGenerator, setWorkoutGenerator] = useState<WorkoutGenerator | null>(null)
  const [fatigueAnalyzer, setFatigueAnalyzer] = useState<FatigueAnalyzer | null>(null)
  const [progressionPlanner, setProgressionPlanner] = useState<ProgressionPlanner | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Check if user profile exists
        const profile = JSON.parse(localStorage.getItem("userProfile") || "null")
        setUserProfile(profile)
        setShowIntakeForm(!profile || !profile.name)

        // Load basic workout data from localStorage
        const workouts = JSON.parse(localStorage.getItem("workoutSessions") || "[]")
        const recent = workouts.slice(-5).reverse()
        setRecentWorkouts(recent)

        // Calculate weekly stats
        const thisWeek = workouts.filter((w: WorkoutSession) => {
          const workoutDate = new Date(w.date)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return workoutDate >= weekAgo
        })

        const stats = {
          workouts: thisWeek.length,
          totalTime: thisWeek.reduce((sum: number, w: WorkoutSession) => sum + w.duration, 0),
          exercisesCompleted: thisWeek.reduce((sum: number, w: WorkoutSession) => sum + (w.exercises?.length || 0), 0),
          avgIntensity:
            thisWeek.length > 0
              ? Math.round(thisWeek.reduce((sum: number, w: WorkoutSession) => sum + w.totalSets, 0) / thisWeek.length)
              : 0,
        }
        setWeeklyStats(stats)

        // Load AI-powered insights (with error handling)
        const userId = "demo-user" // In real app, get from auth context
        
        // Skip AI features for now to prevent runtime errors
        console.log('AI features temporarily disabled to prevent runtime errors')
        setAiLoading(false)
        
        // AI features temporarily disabled - using fallback data
        setTodaysWorkout(null)
        setFatigueAnalysis(null)
        setAiRecommendations([])
        
      } catch (error) {
        console.error('Error loading AI dashboard data:', error)
      } finally {
        setAiLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <div className="space-y-8" data-testid="app-loaded">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight" data-testid="dashboard-heading">Dashboard</h1>
        <p className="text-muted-foreground">Your AI-powered fitness coach is ready to help you optimize your training</p>
      </div>

      {/* User Intake Form - Show if profile incomplete */}
      {showIntakeForm && (
        <div className="space-y-4">
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              Complete your profile setup to unlock personalized workout recommendations and AI-powered features.
            </AlertDescription>
          </Alert>
          <UserIntakeForm />
        </div>
      )}

      {/* AI Recommendations Section */}
      {aiRecommendations.length > 0 && (
        <div className="space-y-4">
          {aiRecommendations.map((rec) => (
            <Alert key={rec.id} className={rec.priority === 'high' ? 'border-orange-200 bg-orange-50' : ''}>
              <div className="flex items-center gap-2">
                {rec.type === 'recovery' ? <AlertTriangle className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                <span className="font-medium">{rec.title}</span>
                {rec.priority === 'high' && <Badge variant="destructive">Action Required</Badge>}
              </div>
              <AlertDescription className="mt-2">{rec.description}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* AI-Generated Workout Recommendation */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-900">Today&apos;s AI Workout</CardTitle>
            </div>
            <Badge variant="secondary">AI Generated</Badge>
          </div>
          <CardDescription>
            Personalized workout based on your recovery status and goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aiLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : todaysWorkout ? (
            <div className="space-y-4">
              <div className="grid gap-2">
                <h3 className="font-semibold text-lg">{todaysWorkout.name}</h3>
                <p className="text-muted-foreground">{todaysWorkout.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{todaysWorkout.estimatedDuration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>{todaysWorkout.exercises.length} exercises</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    <span className="capitalize">{todaysWorkout.overallIntensity} intensity</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {todaysWorkout.focusAreas.map((muscle) => (
                  <Badge key={muscle} variant="outline" className="text-blue-700 border-blue-200">
                    {muscle}
                  </Badge>
                ))}
              </div>
              
              <div className="bg-blue-100 p-3 rounded-lg">
                <p className="text-sm text-blue-800">{todaysWorkout.recoveryStatus}</p>
              </div>
              
              <Button className="w-full" asChild>
                <Link href="/workouts">
                  <Zap className="h-4 w-4 mr-2" />
                  Start This Workout
                </Link>
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No workout recommendation available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.workouts || 0}</div>
            <p className="text-xs text-muted-foreground">workouts completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(weeklyStats.totalTime / 60) || 0}h</div>
            <p className="text-xs text-muted-foreground">{(weeklyStats.totalTime % 60) || 0}m this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exercises</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.exercisesCompleted || 0}</div>
            <p className="text-xs text-muted-foreground">exercises completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Intensity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.avgIntensity || 0}</div>
            <p className="text-xs text-muted-foreground">sets per workout</p>
          </CardContent>
        </Card>
      </div>

      {/* Muscle Recovery Heat Map - Full Width */}
      <div className="grid gap-6">
        <MuscleRecoveryHeatmap fatigueAnalysis={fatigueAnalysis} loading={aiLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Recent Workouts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Workouts</CardTitle>
            <CardDescription>Your latest training sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentWorkouts.length === 0 ? (
              <div className="text-center py-8">
                <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No workouts yet</p>
                <Button asChild data-testid="create-workout-btn">
                  <Link href="/workouts">
                    <Plus className="h-4 w-4 mr-2" />
                    Start Your First Workout
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                {recentWorkouts.map((workout) => (
                  <div key={workout.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{workout.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{new Date(workout.date).toLocaleDateString()}</span>
                        <span>{workout.duration}min</span>
                        <span>{workout.exercises?.length || 0} exercises</span>
                      </div>
                    </div>
                    <Badge variant="secondary">{workout.totalSets} sets</Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/workouts">View All Workouts</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* AI Progress Insights */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <CardTitle>AI Progress Insights</CardTitle>
            </div>
            <CardDescription>Performance analysis and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">This Week&apos;s Focus</p>
                      <p className="text-xs text-muted-foreground">Based on recovery analysis</p>
                    </div>
                    <Badge variant="outline" className="text-blue-700">
                      {fatigueAnalysis?.recommendedFocus[0] || 'Full Body'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Training Readiness</p>
                      <p className="text-xs text-muted-foreground">Overall recovery status</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={fatigueAnalysis?.overallRecoveryScore > 70 ? 'text-green-700 border-green-200' : 'text-orange-700 border-orange-200'}
                    >
                      {fatigueAnalysis?.overallRecoveryScore || 0}% Ready
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Next Recommendation</p>
                      <p className="text-xs text-muted-foreground">AI suggested action</p>
                    </div>
                    <Badge variant="outline" className="text-purple-700">
                      {fatigueAnalysis?.deloadRecommended ? 'Deload Week' : 'Continue Training'}
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-800 mb-1">Weekly Muscle Engagement</p>
                  <MuscleEngagementChart />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Last Workout Summary */}
      <LastWorkoutSummary />

      {/* Volume Progression Calculator */}
      <VolumeProgressionCalculator />

      {/* Basic Muscle Map */}
      <BasicMuscleMap />

      {/* Workout Planning Dashboard */}
      <WorkoutPlanningDashboard />

      {/* Advanced Analytics Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Advanced Analytics</h2>
        
        {/* Anatomical Muscle Heat Map */}
        <AnatomicalMuscleMap 
          highlightedMuscles={{
            "Pectoralis Major": 75,
            "Biceps Brachii": 60,
            "Triceps Brachii": 45,
            "Rectus Abdominis": 30,
            "Quadriceps": 85,
            "Hamstrings": 70,
            "Deltoids": 55,
            "Latissimus Dorsi": 40,
            "Trapezius": 25
          }}
          onMuscleClick={(muscle) => console.log("Clicked muscle:", muscle)}
        />
        
        {/* Workout History Analysis */}
        <WorkoutHistoryAnalyzer />
        
        {/* Strength Progression Charts */}
        <StrengthProgressionCharts />
        
        {/* Muscle Balance Analysis */}
        <MuscleBalanceAnalyzer />
        
        {/* Workout Frequency Optimization */}
        <WorkoutFrequencyOptimizer />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump into your fitness routine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button asChild className="h-20 flex-col space-y-2">
              <Link href="/workouts">
                <Plus className="h-6 w-6" />
                <span>Start Workout</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col space-y-2">
              <Link href="/exercises">
                <Dumbbell className="h-6 w-6" />
                <span>Browse Exercises</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col space-y-2">
              <Link href="/progress">
                <TrendingUp className="h-6 w-6" />
                <span>View Progress</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
