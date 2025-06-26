"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Zap, Target, Clock, Activity, Plus, CheckCircle, ArrowRight, Sparkles } from "lucide-react"

interface AutoWorkoutCompleterProps {
  className?: string
  targetMuscles?: string[]
  fatigueTargets?: any[]
  exerciseRecommendations?: any[]
}

interface WorkoutExercise {
  name: string
  sets: number
  reps: number
  weight: number
  restTime: number
  muscleContribution: Record<string, number>
  volume: number
  equipment: string
}

interface CompletedWorkout {
  name: string
  estimatedDuration: number
  totalVolume: number
  exercises: WorkoutExercise[]
  musclesCovered: Record<string, number>
  fatigueAchieved: Record<string, number>
  completionStatus: Record<string, 'optimal' | 'near_optimal' | 'needs_more'>
}

export function AutoWorkoutCompleter({ 
  className, 
  targetMuscles = [], 
  fatigueTargets = [],
  exerciseRecommendations = []
}: AutoWorkoutCompleterProps) {
  const router = useRouter()
  const [completedWorkout, setCompletedWorkout] = useState<CompletedWorkout | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [exercises, setExercises] = useState<any[]>([])
  const [currentWorkout, setCurrentWorkout] = useState<any[]>([])

  useEffect(() => {
    loadExerciseData()
    loadCurrentWorkout()
  }, [])

  useEffect(() => {
    if (targetMuscles.length > 0 && exercises.length > 0) {
      generateCompleteWorkout()
    }
  }, [targetMuscles, fatigueTargets, exercises])

  const loadExerciseData = async () => {
    try {
      const response = await fetch('/data/exercises.json')
      const data = await response.json()
      setExercises(data)
    } catch (error) {
      console.error('Error loading exercise data:', error)
    }
  }

  const loadCurrentWorkout = () => {
    const draft = JSON.parse(localStorage.getItem("workoutDraft") || "[]")
    setCurrentWorkout(draft)
  }

  const generateCompleteWorkout = () => {
    setIsGenerating(true)

    // Load user profile for personalization
    const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}")
    const availableEquipment = userProfile.availableEquipment || []
    const sessionDuration = userProfile.sessionDuration || 60
    const experienceLevel = userProfile.experienceLevel || 'intermediate'

    // Calculate current muscle coverage from existing workout
    const currentCoverage: Record<string, number> = {}
    let currentVolume = 0

    currentWorkout.forEach(exercise => {
      if (exercise.muscleEngagement) {
        Object.entries(exercise.muscleEngagement).forEach(([muscle, engagement]) => {
          currentCoverage[muscle] = (currentCoverage[muscle] || 0) + (engagement as number)
        })
      }
      currentVolume += exercise.exerciseVolume || 0
    })

    // Determine gaps to fill based on fatigue targets
    const muscleGaps: Record<string, number> = {}
    const targetFatiguePercentages: Record<string, number> = {}

    targetMuscles.forEach(muscleGroup => {
      const fatigueTarget = fatigueTargets.find(ft => ft.muscleName === muscleGroup)
      if (fatigueTarget) {
        const currentGroupCoverage = getCurrentMuscleGroupCoverage(muscleGroup, currentCoverage)
        const targetPercentage = 85 // Aim for 85% of optimal volume
        const gapPercentage = Math.max(0, targetPercentage - (fatigueTarget.currentFatigue || 0))
        
        muscleGaps[muscleGroup] = gapPercentage
        targetFatiguePercentages[muscleGroup] = targetPercentage
      }
    })

    // Generate exercises to fill gaps
    const autoExercises: WorkoutExercise[] = []
    const timeUsed = currentWorkout.length * 4 // Estimate 4 minutes per existing exercise
    const timeRemaining = Math.max(0, sessionDuration - timeUsed)

    // Sort muscle gaps by priority (largest gaps first)
    const sortedGaps = Object.entries(muscleGaps)
      .filter(([_, gap]) => gap > 10) // Only address significant gaps
      .sort(([,a], [,b]) => b - a)

    sortedGaps.forEach(([muscleGroup, gapPercentage]) => {
      if (timeRemaining > autoExercises.length * 4) { // Ensure we have time
        const suitableExercises = findSuitableExercises(muscleGroup, availableEquipment, autoExercises)
        
        if (suitableExercises.length > 0) {
          const selectedExercise = selectOptimalExercise(suitableExercises, muscleGroup, gapPercentage, experienceLevel)
          if (selectedExercise) {
            autoExercises.push(selectedExercise)
          }
        }
      }
    })

    // Create completed workout summary
    const allExercises = [...currentWorkout, ...autoExercises]
    const totalMusclesCovered: Record<string, number> = {}
    const totalVolume = allExercises.reduce((sum, ex) => sum + (ex.volume || ex.exerciseVolume || 0), 0)

    allExercises.forEach(exercise => {
      const muscles = exercise.muscleEngagement || exercise.muscleContribution || {}
      Object.entries(muscles).forEach(([muscle, engagement]) => {
        totalMusclesCovered[muscle] = (totalMusclesCovered[muscle] || 0) + (engagement as number)
      })
    })

    // Calculate final fatigue achievement
    const fatigueAchieved: Record<string, number> = {}
    const completionStatus: Record<string, 'optimal' | 'near_optimal' | 'needs_more'> = {}

    targetMuscles.forEach(muscleGroup => {
      const groupCoverage = getCurrentMuscleGroupCoverage(muscleGroup, totalMusclesCovered)
      const target = targetFatiguePercentages[muscleGroup] || 85
      
      fatigueAchieved[muscleGroup] = groupCoverage
      
      if (groupCoverage >= target * 0.95) {
        completionStatus[muscleGroup] = 'optimal'
      } else if (groupCoverage >= target * 0.8) {
        completionStatus[muscleGroup] = 'near_optimal'
      } else {
        completionStatus[muscleGroup] = 'needs_more'
      }
    })

    const completed: CompletedWorkout = {
      name: generateWorkoutName(targetMuscles, autoExercises.length),
      estimatedDuration: Math.min(sessionDuration, (allExercises.length * 4) + 10), // 4 min per exercise + warmup
      totalVolume: Math.round(totalVolume),
      exercises: autoExercises,
      musclesCovered: totalMusclesCovered,
      fatigueAchieved,
      completionStatus
    }

    setCompletedWorkout(completed)
    setIsGenerating(false)
  }

  const getCurrentMuscleGroupCoverage = (muscleGroup: string, coverage: Record<string, number>): number => {
    const muscleGroupMap: Record<string, string[]> = {
      'Chest': ['Pectoralis Major', 'Pectoralis_Major'],
      'Back': ['Latissimus Dorsi', 'Latissimus_Dorsi', 'Rhomboids', 'Middle Trapezius'],
      'Legs': ['Quadriceps', 'Hamstrings', 'Glutes', 'Gluteus Maximus', 'Gluteus_Maximus'],
      'Shoulders': ['Anterior Deltoids', 'Lateral Deltoids', 'Rear Deltoids', 'Anterior_Deltoids'],
      'Arms': ['Biceps Brachii', 'Triceps Brachii', 'Biceps_Brachii', 'Triceps_Brachii'],
      'Core': ['Rectus Abdominis', 'Obliques', 'Rectus_Abdominis']
    }

    const groupMuscles = muscleGroupMap[muscleGroup] || [muscleGroup]
    let totalCoverage = 0

    groupMuscles.forEach(muscle => {
      totalCoverage += coverage[muscle] || 0
    })

    return Math.min(100, totalCoverage)
  }

  const findSuitableExercises = (muscleGroup: string, availableEquipment: string[], existingExercises: WorkoutExercise[]): any[] => {
    const existingNames = existingExercises.map(ex => ex.name.toLowerCase())
    
    return exercises.filter(exercise => {
      // Check if exercise targets the muscle group
      if (!exercise.Muscles_Used) return false
      
      const muscleEngagement = parseMuscleEngagement(exercise.Muscles_Used)
      const targetsGroup = muscleEngagement.some(muscle => 
        isMuscleMappedToGroup(muscle.muscleName, muscleGroup) && muscle.engagement >= 30
      )

      // Check equipment availability
      const exerciseEquipment = exercise.Equipment_Needed || 'None'
      const hasEquipment = availableEquipment.length === 0 || 
                          availableEquipment.includes(exerciseEquipment) ||
                          exerciseEquipment === 'None' ||
                          exerciseEquipment.includes('Bodyweight')

      // Avoid duplicates
      const isDuplicate = existingNames.includes(exercise.Exercise_Name.toLowerCase().replace(/_/g, ' '))

      return targetsGroup && hasEquipment && !isDuplicate
    })
  }

  const selectOptimalExercise = (
    exercises: any[], 
    muscleGroup: string, 
    gapPercentage: number, 
    experienceLevel: string
  ): WorkoutExercise | null => {
    if (exercises.length === 0) return null

    // Prioritize compound movements for efficiency
    const exercise = exercises[0] // Take first suitable exercise for now
    const muscleEngagement = parseMuscleEngagement(exercise.Muscles_Used)
    
    // Calculate sets and reps based on gap and experience
    const baseSets = experienceLevel === 'beginner' ? 2 : experienceLevel === 'intermediate' ? 3 : 4
    const sets = Math.min(5, Math.max(1, Math.round(baseSets * (gapPercentage / 50))))
    
    const baseReps = exercise.Exercise_Type === 'Strength' ? 6 : 
                     exercise.Exercise_Type === 'Hypertrophy' ? 10 : 12
    const reps = Math.max(1, baseReps)
    
    // Estimate weight (would need user max data for accuracy)
    const weight = 135 // Default weight, would be personalized in real implementation
    
    const volume = sets * reps * weight

    // Create muscle contribution map
    const muscleContribution: Record<string, number> = {}
    muscleEngagement.forEach(muscle => {
      muscleContribution[muscle.muscleName] = muscle.engagement
    })

    return {
      name: exercise.Exercise_Name.replace(/_/g, ' '),
      sets,
      reps,
      weight,
      restTime: exercise.Exercise_Type === 'Strength' ? 180 : 90,
      muscleContribution,
      volume,
      equipment: exercise.Equipment_Needed || 'None'
    }
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

  const isMuscleMappedToGroup = (muscle: string, group: string): boolean => {
    const muscleGroupMap: Record<string, string[]> = {
      'Chest': ['Pectoralis Major', 'Pectoralis_Major'],
      'Back': ['Latissimus Dorsi', 'Latissimus_Dorsi', 'Rhomboids', 'Middle Trapezius', 'Trapezius'],
      'Legs': ['Quadriceps', 'Hamstrings', 'Glutes', 'Gluteus Maximus', 'Gluteus_Maximus', 'Calves'],
      'Shoulders': ['Anterior Deltoids', 'Lateral Deltoids', 'Rear Deltoids', 'Anterior_Deltoids'],
      'Arms': ['Biceps Brachii', 'Triceps Brachii', 'Biceps_Brachii', 'Triceps_Brachii'],
      'Core': ['Rectus Abdominis', 'Obliques', 'Rectus_Abdominis', 'Transverse Abdominis']
    }

    const groupMuscles = muscleGroupMap[group] || [group]
    return groupMuscles.some(groupMuscle =>
      muscle.toLowerCase().includes(groupMuscle.toLowerCase()) ||
      groupMuscle.toLowerCase().includes(muscle.toLowerCase()) ||
      muscle.replace(/[_\s]/g, '').toLowerCase() === groupMuscle.replace(/[_\s]/g, '').toLowerCase()
    )
  }

  const generateWorkoutName = (muscles: string[], exerciseCount: number): string => {
    if (muscles.length === 1) {
      return `${muscles[0]} Focus Workout`
    } else if (muscles.length === 2) {
      return `${muscles[0]} & ${muscles[1]} Workout`
    } else {
      return `Complete Multi-Muscle Workout`
    }
  }

  const getCompletionColor = (status: string): string => {
    switch (status) {
      case 'optimal': return 'text-green-600 border-green-200 bg-green-50'
      case 'near_optimal': return 'text-yellow-600 border-yellow-200 bg-yellow-50'
      case 'needs_more': return 'text-red-600 border-red-200 bg-red-50'
      default: return 'text-gray-600 border-gray-200 bg-gray-50'
    }
  }

  const addExercisesToWorkout = () => {
    if (!completedWorkout) return

    const currentDraft = JSON.parse(localStorage.getItem("workoutDraft") || "[]")
    const newExercises = completedWorkout.exercises.map(ex => ({
      name: ex.name,
      sets: Array(ex.sets).fill(null).map(() => ({
        reps: ex.reps,
        weight: ex.weight,
        completed: false
      })),
      muscleEngagement: ex.muscleContribution,
      exerciseVolume: ex.volume
    }))

    const updatedDraft = [...currentDraft, ...newExercises]
    localStorage.setItem("workoutDraft", JSON.stringify(updatedDraft))
    
    // Trigger a page refresh or navigation to workout page
    router.push('/workouts')
  }

  if (targetMuscles.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Auto-Complete Workout
          </CardTitle>
          <CardDescription>Automatically fill in exercises to reach 100% muscle coverage</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select target muscle groups to auto-complete your workout.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Auto-Complete Workout
        </CardTitle>
        <CardDescription>Smart exercise recommendations to optimize muscle coverage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isGenerating ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Generating optimal workout completion...</p>
          </div>
        ) : completedWorkout ? (
          <>
            {/* Workout Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{completedWorkout.name}</h3>
                <Badge variant="secondary">
                  {completedWorkout.exercises.length} exercises to add
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-2 border rounded">
                  <Clock className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                  <div>{completedWorkout.estimatedDuration} min</div>
                  <div className="text-muted-foreground">Duration</div>
                </div>
                <div className="text-center p-2 border rounded">
                  <Activity className="h-4 w-4 mx-auto mb-1 text-green-600" />
                  <div>{completedWorkout.totalVolume.toLocaleString()}</div>
                  <div className="text-muted-foreground">Total Volume</div>
                </div>
                <div className="text-center p-2 border rounded">
                  <Target className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                  <div>{Object.keys(completedWorkout.completionStatus).length}</div>
                  <div className="text-muted-foreground">Muscles</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Muscle Coverage Analysis */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Muscle Coverage Analysis</h4>
              {Object.entries(completedWorkout.completionStatus).map(([muscle, status]) => (
                <div key={muscle} className={`p-3 border rounded-lg ${getCompletionColor(status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{muscle}</span>
                    <Badge variant="outline" className="capitalize">
                      {status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Fatigue Achievement</span>
                    <span>{Math.round(completedWorkout.fatigueAchieved[muscle] || 0)}%</span>
                  </div>
                  <Progress value={completedWorkout.fatigueAchieved[muscle] || 0} className="h-2 mt-1" />
                </div>
              ))}
            </div>

            <Separator />

            {/* Recommended Exercises */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Exercises to Add ({completedWorkout.exercises.length})</h4>
              {completedWorkout.exercises.map((exercise, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{exercise.name}</span>
                    <Badge variant="outline">{exercise.equipment}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground mb-2">
                    <div>{exercise.sets} sets</div>
                    <div>{exercise.reps} reps</div>
                    <div>{exercise.weight} lbs</div>
                  </div>
                  
                  <div className="text-xs">
                    <span className="text-muted-foreground">Targets: </span>
                    {Object.entries(exercise.muscleContribution)
                      .filter(([_, engagement]) => engagement >= 30)
                      .map(([muscle, engagement]) => (
                        <Badge key={muscle} variant="secondary" className="text-xs mr-1">
                          {muscle} ({engagement}%)
                        </Badge>
                      ))
                    }
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={addExercisesToWorkout} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add to Workout
              </Button>
              <Button variant="outline" onClick={generateCompleteWorkout}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </div>

            {/* Completion Summary */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Adding these {completedWorkout.exercises.length} exercises will optimize your muscle coverage 
                and bring you closer to 100% fatigue targets. Estimated workout completion: {completedWorkout.estimatedDuration} minutes.
              </AlertDescription>
            </Alert>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No workout completion needed - targets already optimized!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}