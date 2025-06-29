'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Activity, Calendar, TrendingUp, Edit2 } from 'lucide-react'
import { ClientMuscleHeatmap } from '@/components/visualization/ClientMuscleHeatmap'
import { ClientFatigueAnalyzer } from '@/lib/client-fatigue-analyzer'
import exercisesData from '@/data/exercises-real.json'
import { differenceInDays, format } from 'date-fns'
import { dataToDisplayName } from '@/lib/muscle-name-constants'
import { MuscleRecoveryData } from '@/schemas/typescript-interfaces'

interface WorkoutSession {
  id: string
  date: string
  exercises: Array<{
    id: string
    name: string
    sets: Array<{
      weight: number
      reps: number
      completed: boolean
      rpe?: number
    }>
  }>
}

export default function RecoveryDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [muscleData, setMuscleData] = useState<Record<string, MuscleRecoveryData>>({})
  const [lastWorkoutDate, setLastWorkoutDate] = useState<Date | null>(null)
  const [editMode, setEditMode] = useState(false)

  // Calculate fatigue from localStorage workouts
  useEffect(() => {
    const calculateRecovery = async () => {
      try {
        setLoading(true)
        
        // Get workout sessions from localStorage
        const sessionsJson = localStorage.getItem('workoutSessions')
        const sessions: WorkoutSession[] = sessionsJson ? JSON.parse(sessionsJson) : []
        
        if (sessions.length === 0) {
          // Set empty muscle data instead of just returning
          setMuscleData({})
          setLastWorkoutDate(null)
          setLoading(false)
          return
        }

        // Find last workout date
        const sortedSessions = [...sessions].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setLastWorkoutDate(new Date(sortedSessions[0].date))


        // Use ClientFatigueAnalyzer to calculate muscle fatigue
        const analyzer = new ClientFatigueAnalyzer()
        const fatigueAnalysis = await analyzer.analyzeFatigue('demo-user', 7)
        
        // Transform fatigue data for display
        const muscleDataMap: Record<string, MuscleRecoveryData> = {}
        
        Object.entries(fatigueAnalysis.muscleGroups).forEach(([muscleName, data]) => {
          const displayName = dataToDisplayName(muscleName)
          muscleDataMap[muscleName] = {
            name: muscleName,
            displayName,
            fatigueScore: data.fatigueScore,
            recoveryPercentage: 100 - data.fatigueScore,
            lastTrainedDate: data.lastTrainedDate,
            daysSinceLastTrained: data.daysSinceLastTrained,
            volumeLastWeek: data.volumeLastWeek,
            status: data.status
          }
        })
        
        setMuscleData(muscleDataMap)
      } catch (error) {
        console.error('🚨 [RecoveryDashboard] Error calculating recovery:', error)
        // Set empty data on error so page doesn't stay in loading state
        setMuscleData({})
        setLastWorkoutDate(null)
      } finally {
        setLoading(false)
      }
    }

    calculateRecovery()
  }, [])

  // Calculate days since last workout
  const daysSinceLastWorkout = useMemo(() => {
    if (!lastWorkoutDate) return null
    return differenceInDays(new Date(), lastWorkoutDate)
  }, [lastWorkoutDate])

  // Get muscles by recovery status
  const recoveredMuscles = useMemo(() => 
    Object.values(muscleData).filter(m => m.status === 'Recovered'),
    [muscleData]
  )
  
  const recoveringMuscles = useMemo(() => 
    Object.values(muscleData).filter(m => m.status === 'Recovering'),
    [muscleData]
  )
  
  const fatiguedMuscles = useMemo(() => 
    Object.values(muscleData).filter(m => m.status === 'Fatigued'),
    [muscleData]
  )

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="bg-gray-800 border-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Recovery Dashboard</h1>
              <p className="text-gray-400">
                Muscle recovery tracking and fatigue management
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setEditMode(!editMode)}
            className="bg-gray-800 border-gray-700"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            {editMode ? 'Done' : 'Edit'}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading recovery data...</div>
          </div>
        ) : (
          <>
            {/* Days Since Last Workout Card */}
            {daysSinceLastWorkout !== null && (
              <Card className="bg-gray-900 border-gray-800 mb-6">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl font-bold text-fitbod-accent mb-2">
                    {daysSinceLastWorkout}
                  </div>
                  <div className="text-xl text-gray-400">
                    DAYS SINCE YOUR LAST WORKOUT
                  </div>
                  {lastWorkoutDate && (
                    <div className="text-sm text-gray-500 mt-2">
                      Last workout: {format(lastWorkoutDate, 'EEEE, MMM d')}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Fresh Muscles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-green-500">
                      {recoveredMuscles.length}
                    </span>
                    <span className="text-gray-500">ready to train</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Recovering
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-yellow-500">
                      {recoveringMuscles.length}
                    </span>
                    <span className="text-gray-500">partially ready</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Fatigued
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-red-500">
                      {fatiguedMuscles.length}
                    </span>
                    <span className="text-gray-500">need rest</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Muscle Heat Map */}
              <ClientMuscleHeatmap
                muscleData={muscleData}
                className="bg-gray-900 border-gray-800"
              />

              {/* Muscle Recovery List */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Muscle Recovery Status</CardTitle>
                  <CardDescription>
                    Detailed recovery percentages by muscle group
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.values(muscleData)
                      .sort((a, b) => a.fatigueScore - b.fatigueScore)
                      .map((muscle) => (
                        <div key={muscle.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{muscle.displayName}</span>
                              <Badge 
                                variant="outline"
                                className={
                                  muscle.status === 'Recovered' ? 'text-green-500 border-green-500' :
                                  muscle.status === 'Recovering' ? 'text-yellow-500 border-yellow-500' :
                                  'text-red-500 border-red-500'
                                }
                              >
                                {muscle.status}
                              </Badge>
                            </div>
                            <span className="text-sm text-gray-400">
                              {muscle.recoveryPercentage.toFixed(0)}%
                            </span>
                          </div>
                          <Progress 
                            value={muscle.recoveryPercentage} 
                            className="h-2"
                          />
                          {muscle.lastTrainedDate && (
                            <div className="text-xs text-gray-500">
                              Last trained {muscle.daysSinceLastTrained} days ago
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="bg-gray-900 border-gray-800 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-fitbod-accent" />
                  Training Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recoveredMuscles.length > 0 && (
                    <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
                      <h4 className="font-medium text-green-400 mb-1">Ready to Train</h4>
                      <p className="text-sm text-gray-300">
                        {recoveredMuscles.map(m => m.displayName).join(', ')} are fully recovered and ready for training.
                      </p>
                    </div>
                  )}
                  {fatiguedMuscles.length > 0 && (
                    <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                      <h4 className="font-medium text-red-400 mb-1">Rest Recommended</h4>
                      <p className="text-sm text-gray-300">
                        {fatiguedMuscles.map(m => m.displayName).join(', ')} need more recovery time.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}