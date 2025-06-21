"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, TrendingDown, Target, Plus, AlertTriangle, CheckCircle } from "lucide-react"

interface ExerciseGapAnalyzerProps {
  className?: string
  targetMuscles?: string[]
  onExerciseRecommendations?: (recommendations: ExerciseRecommendation[]) => void
}

interface ExerciseRecommendation {
  exerciseName: string
  targetMuscles: string[]
  missingEngagement: number
  priority: 'high' | 'medium' | 'low'
  reason: string
  equipment: string[]
}

interface MuscleDeficit {
  muscleName: string
  currentCoverage: number  // 0-100% based on recent training
  targetCoverage: number   // Desired level based on goals
  deficit: number          // How much more is needed
  daysSinceWorked: number
}

export function ExerciseGapAnalyzer({ className, targetMuscles = [], onExerciseRecommendations }: ExerciseGapAnalyzerProps) {
  const [muscleDeficits, setMuscleDeficits] = useState<MuscleDeficit[]>([])
  const [exerciseRecommendations, setExerciseRecommendations] = useState<ExerciseRecommendation[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [exercises, setExercises] = useState<any[]>([])

  useEffect(() => {
    loadExerciseData()
  }, [])

  useEffect(() => {
    if (targetMuscles.length > 0) {
      analyzeGaps()
    }
  }, [targetMuscles, exercises])

  const loadExerciseData = async () => {
    try {
      const response = await fetch('/data/exercises.json')
      const data = await response.json()
      setExercises(data)
    } catch (error) {
      console.error('Error loading exercise data:', error)
    }
  }

  const analyzeGaps = () => {
    setIsAnalyzing(true)
    
    // Load workout history and user profile
    const workouts = JSON.parse(localStorage.getItem("workoutSessions") || "[]")
    const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}")
    
    // Analyze recent muscle engagement (last 7 days)
    const recentWorkouts = workouts.filter((workout: any) => {
      const workoutDate = new Date(workout.date)
      const daysDiff = (new Date().getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7
    })

    // Calculate current muscle coverage for target muscles
    const muscleAnalysis: Record<string, MuscleDeficit> = {}
    
    targetMuscles.forEach(targetGroup => {
      // Map muscle groups to specific muscles
      const specificMuscles = getSpecificMusclesFromGroup(targetGroup)
      
      specificMuscles.forEach(muscleName => {
        let currentVolume = 0
        let lastWorkedDays = 7
        
        // Calculate current coverage from recent workouts
        recentWorkouts.forEach((workout: any) => {
          const workoutDate = new Date(workout.date)
          const daysSince = (new Date().getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
          
          workout.exercises?.forEach((exercise: any) => {
            if (exercise.muscleEngagement && exercise.muscleEngagement[muscleName]) {
              currentVolume += exercise.exerciseVolume * (exercise.muscleEngagement[muscleName] / 100)
              if (daysSince < lastWorkedDays) {
                lastWorkedDays = daysSince
              }
            }
          })
        })

        // Calculate target coverage based on user goals
        const targetVolume = getTargetVolumeForMuscle(muscleName, userProfile)
        const currentCoverage = Math.min(100, (currentVolume / targetVolume) * 100)
        const deficit = Math.max(0, 100 - currentCoverage)

        muscleAnalysis[muscleName] = {
          muscleName,
          currentCoverage,
          targetCoverage: 100,
          deficit,
          daysSinceWorked: lastWorkedDays
        }
      })
    })

    const deficits = Object.values(muscleAnalysis)
      .filter(deficit => deficit.deficit > 10) // Only show significant gaps
      .sort((a, b) => b.deficit - a.deficit)

    setMuscleDeficits(deficits)

    // Generate exercise recommendations to fill gaps
    const recommendations = generateExerciseRecommendations(deficits, userProfile)
    setExerciseRecommendations(recommendations)
    
    if (onExerciseRecommendations) {
      onExerciseRecommendations(recommendations)
    }

    setIsAnalyzing(false)
  }

  const getSpecificMusclesFromGroup = (group: string): string[] => {
    const muscleMap: Record<string, string[]> = {
      'Chest': ['Pectoralis Major', 'Pectoralis_Major'],
      'Shoulders': ['Anterior Deltoids', 'Lateral Deltoids', 'Rear Deltoids', 'Anterior_Deltoids'],
      'Arms': ['Biceps Brachii', 'Triceps Brachii', 'Biceps_Brachii', 'Triceps_Brachii'],
      'Back': ['Latissimus Dorsi', 'Rhomboids', 'Middle Trapezius', 'Latissimus_Dorsi'],
      'Core': ['Rectus Abdominis', 'Obliques', 'Rectus_Abdominis'],
      'Legs': ['Quadriceps', 'Hamstrings', 'Glutes', 'Gluteus Maximus', 'Gluteus_Maximus']
    }
    return muscleMap[group] || [group]
  }

  const getTargetVolumeForMuscle = (muscleName: string, userProfile: any): number => {
    // Base target volume based on muscle size and training frequency
    const baseMuscleVolumes: Record<string, number> = {
      'Pectoralis Major': 800,
      'Pectoralis_Major': 800,
      'Latissimus Dorsi': 1000,
      'Latissimus_Dorsi': 1000,
      'Quadriceps': 1200,
      'Hamstrings': 800,
      'Glutes': 900,
      'Gluteus Maximus': 900,
      'Gluteus_Maximus': 900,
      'Biceps Brachii': 400,
      'Biceps_Brachii': 400,
      'Triceps Brachii': 600,
      'Triceps_Brachii': 600,
      'Anterior Deltoids': 500,
      'Anterior_Deltoids': 500,
      'Rectus Abdominis': 300,
      'Rectus_Abdominis': 300
    }

    const baseVolume = baseMuscleVolumes[muscleName] || 500
    
    // Adjust based on user goals and training frequency
    const goalMultiplier = userProfile.primaryGoal === 'hypertrophy' ? 1.3 :
                          userProfile.primaryGoal === 'strength' ? 1.1 :
                          userProfile.primaryGoal === 'endurance' ? 0.8 : 1.0

    const frequencyMultiplier = (userProfile.weeklyWorkouts || 3) / 3

    return Math.round(baseVolume * goalMultiplier * frequencyMultiplier)
  }

  const generateExerciseRecommendations = (deficits: MuscleDeficit[], userProfile: any): ExerciseRecommendation[] => {
    const recommendations: ExerciseRecommendation[] = []
    const userEquipment = userProfile.availableEquipment || []

    deficits.forEach(deficit => {
      // Find exercises that target this muscle effectively
      const suitableExercises = exercises.filter(exercise => {
        if (!exercise.Muscles_Used) return false

        // Check if exercise targets the deficit muscle
        const muscleEngagement = parseMuscleEngagement(exercise.Muscles_Used)
        const hasTargetMuscle = muscleEngagement.some(muscle => 
          muscle.muscleName === deficit.muscleName && muscle.engagement >= 30
        )

        // Check equipment availability
        const exerciseEquipment = exercise.Equipment_Needed || 'None'
        const hasEquipment = userEquipment.length === 0 || 
                            userEquipment.includes(exerciseEquipment) ||
                            exerciseEquipment === 'None' ||
                            exerciseEquipment.includes('Bodyweight')

        return hasTargetMuscle && hasEquipment
      })

      // Select best exercises based on engagement and priority
      suitableExercises
        .slice(0, 2) // Top 2 exercises per muscle deficit
        .forEach(exercise => {
          const muscleEngagement = parseMuscleEngagement(exercise.Muscles_Used)
          const targetMuscleEng = muscleEngagement.find(m => m.muscleName === deficit.muscleName)
          
          recommendations.push({
            exerciseName: exercise.Exercise_Name.replace(/_/g, ' '),
            targetMuscles: [deficit.muscleName],
            missingEngagement: deficit.deficit,
            priority: deficit.deficit > 60 ? 'high' : deficit.deficit > 30 ? 'medium' : 'low',
            reason: `${deficit.muscleName} needs ${deficit.deficit.toFixed(0)}% more volume (${deficit.daysSinceWorked.toFixed(1)} days since last trained)`,
            equipment: [exercise.Equipment_Needed || 'None']
          })
        })
    })

    return recommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
      .slice(0, 8) // Limit to top 8 recommendations
  }

  const parseMuscleEngagement = (musclesUsedString: string): Array<{muscleName: string, engagement: number}> => {
    if (!musclesUsedString) return []
    
    return musclesUsedString
      .split(',')
      .map(muscle => muscle.trim())
      .filter(muscle => muscle.includes(':_') && muscle.includes('%'))
      .map(muscle => {
        const [nameRaw, percentageRaw] = muscle.split(':_')
        const muscleName = nameRaw.replace(/_/g, ' ').trim()
        const engagement = parseInt(percentageRaw.replace('%', '').trim())
        return { muscleName, engagement }
      })
      .filter(muscle => !isNaN(muscle.engagement))
  }

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 text-red-900'
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-900'
      case 'low': return 'border-green-200 bg-green-50 text-green-900'
      default: return 'border-gray-200 bg-gray-50 text-gray-900'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'medium': return <Target className="h-4 w-4 text-yellow-600" />
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />
      default: return <Target className="h-4 w-4" />
    }
  }

  if (targetMuscles.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Exercise Gap Analysis
          </CardTitle>
          <CardDescription>Identify missing exercises to reach 100% muscle coverage</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select target muscle groups to analyze training gaps.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Exercise Gap Analysis
        </CardTitle>
        <CardDescription>Exercises needed to complete your target muscle coverage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAnalyzing ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Analyzing muscle coverage...</p>
          </div>
        ) : (
          <>
            {/* Muscle Deficit Summary */}
            {muscleDeficits.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Muscle Coverage Gaps</h4>
                {muscleDeficits.map(deficit => (
                  <div key={deficit.muscleName} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{deficit.muscleName}</span>
                      <Badge variant="outline" className="text-red-700">
                        {deficit.deficit.toFixed(0)}% deficit
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Current Coverage</span>
                        <span>{deficit.currentCoverage.toFixed(0)}%</span>
                      </div>
                      <Progress value={deficit.currentCoverage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        Last trained {deficit.daysSinceWorked.toFixed(1)} days ago
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Excellent! All target muscle groups have adequate recent training coverage.
                </AlertDescription>
              </Alert>
            )}

            {/* Exercise Recommendations */}
            {exerciseRecommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Recommended Exercises</h4>
                <div className="grid gap-3">
                  {exerciseRecommendations.map((rec, index) => (
                    <div key={index} className={`p-3 border rounded-lg ${getPriorityColor(rec.priority)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(rec.priority)}
                          <span className="font-medium">{rec.exerciseName}</span>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {rec.priority} Priority
                        </Badge>
                      </div>
                      
                      <p className="text-sm mb-2">{rec.reason}</p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex gap-1">
                          {rec.equipment.map(eq => (
                            <Badge key={eq} variant="secondary" className="text-xs">
                              {eq}
                            </Badge>
                          ))}
                        </div>
                        <Button size="sm" variant="outline">
                          <Plus className="h-3 w-3 mr-1" />
                          Add to Workout
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Summary */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm text-blue-900">Gap Analysis Summary</span>
              </div>
              <p className="text-sm text-blue-800">
                {muscleDeficits.length === 0 
                  ? "Your target muscles have been well-trained recently. Consider progressive overload or new movement patterns."
                  : `Found ${muscleDeficits.length} muscle groups with coverage gaps. Adding ${exerciseRecommendations.length} recommended exercises will optimize your muscle development.`
                }
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}