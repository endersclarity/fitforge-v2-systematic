"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Target, Calendar, TrendingUp, Activity, CheckCircle, AlertTriangle } from "lucide-react"

interface TargetMuscleSelectorProps {
  className?: string
  onMuscleSelectionChange?: (selectedMuscles: string[], fatigueStatus: Record<string, number>) => void
}

interface MuscleStatus {
  name: string
  currentFatigue: number  // 0-100%, based on recent training
  daysSinceLastTrained: number
  totalVolumeLastWeek: number
  recoveryScore: number  // 0-100%, higher = more recovered
  isSelected: boolean
}

// Comprehensive muscle groups for selection
const MUSCLE_GROUPS = {
  'Chest': [
    'Pectoralis Major', 'Pectoralis_Major', 'Upper Chest', 'Lower Chest'
  ],
  'Shoulders': [
    'Anterior Deltoids', 'Anterior_Deltoids', 'Front Deltoids',
    'Lateral Deltoids', 'Lateral_Deltoids', 'Side Deltoids', 
    'Rear Deltoids', 'Rear_Deltoids', 'Posterior Deltoids'
  ],
  'Arms': [
    'Biceps Brachii', 'Biceps_Brachii', 'Biceps',
    'Triceps Brachii', 'Triceps_Brachii', 'Triceps',
    'Forearms', 'Brachialis', 'Brachioradialis'
  ],
  'Back': [
    'Latissimus Dorsi', 'Latissimus_Dorsi', 'Lats',
    'Rhomboids', 'Middle Trapezius', 'Trapezius',
    'Lower Trapezius', 'Upper Trapezius',
    'Erector Spinae', 'Erector_Spinae'
  ],
  'Core': [
    'Rectus Abdominis', 'Rectus_Abdominis', 'Abs',
    'Transverse Abdominis', 'Transverse_Abdominis',
    'Obliques', 'External Obliques', 'Internal Obliques'
  ],
  'Legs': [
    'Quadriceps', 'Quads', 'Rectus Femoris',
    'Hamstrings', 'Biceps Femoris',
    'Glutes', 'Gluteus Maximus', 'Gluteus_Maximus',
    'Calves', 'Gastrocnemius', 'Soleus',
    'Hip Flexors', 'Hip_Flexors'
  ]
}

export function TargetMuscleSelector({ className, onMuscleSelectionChange }: TargetMuscleSelectorProps) {
  const [muscleStatus, setMuscleStatus] = useState<Record<string, MuscleStatus>>({})
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const [workoutGoal, setWorkoutGoal] = useState<'strength' | 'hypertrophy' | 'endurance' | 'balanced'>('balanced')

  useEffect(() => {
    calculateMuscleStatus()
  }, [])

  const calculateMuscleStatus = () => {
    // Load workout history to calculate muscle fatigue and recovery
    const workouts = JSON.parse(localStorage.getItem("workoutSessions") || "[]")
    const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}")
    
    const muscleData: Record<string, MuscleStatus> = {}
    const now = new Date()

    // Initialize all muscle groups
    Object.entries(MUSCLE_GROUPS).forEach(([groupName, muscles]) => {
      muscleData[groupName] = {
        name: groupName,
        currentFatigue: 0,
        daysSinceLastTrained: 7, // Default to fully recovered
        totalVolumeLastWeek: 0,
        recoveryScore: 100,
        isSelected: false
      }
    })

    // Analyze last 7 days of workouts
    const recentWorkouts = workouts.filter((workout: any) => {
      const workoutDate = new Date(workout.date)
      const daysDiff = (now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7
    })

    // Calculate muscle engagement and fatigue for each group
    Object.keys(muscleData).forEach(groupName => {
      const groupMuscles = MUSCLE_GROUPS[groupName as keyof typeof MUSCLE_GROUPS]
      let totalVolume = 0
      let mostRecentTraining = 7
      let fatigueScore = 0

      recentWorkouts.forEach((workout: any) => {
        const workoutDate = new Date(workout.date)
        const daysSince = (now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)

        workout.exercises?.forEach((exercise: any) => {
          if (exercise.muscleEngagement) {
            Object.entries(exercise.muscleEngagement).forEach(([muscle, engagement]) => {
              // Check if this muscle belongs to the current group
              const belongsToGroup = groupMuscles.some(groupMuscle =>
                muscle.toLowerCase().includes(groupMuscle.toLowerCase()) ||
                groupMuscle.toLowerCase().includes(muscle.toLowerCase()) ||
                muscle.replace(/[_\s]/g, '').toLowerCase() === groupMuscle.replace(/[_\s]/g, '').toLowerCase()
              )

              if (belongsToGroup) {
                totalVolume += exercise.exerciseVolume || 0
                if (daysSince < mostRecentTraining) {
                  mostRecentTraining = daysSince
                }
                
                // Calculate fatigue based on volume and recency
                const volumeWeight = (engagement as number) / 100
                const timeWeight = Math.max(0, 1 - (daysSince / 3)) // 3-day decay
                fatigueScore += exercise.exerciseVolume * volumeWeight * timeWeight
              }
            })
          }
        })
      })

      // Calculate recovery score (0-100, higher = more recovered)
      const baseRecovery = Math.min(100, mostRecentTraining * 20) // 20% recovery per day
      const fatigueReduction = Math.max(0, 100 - (fatigueScore / 50)) // Adjust based on fatigue load
      const recoveryScore = Math.round((baseRecovery + fatigueReduction) / 2)

      muscleData[groupName] = {
        ...muscleData[groupName],
        currentFatigue: Math.min(100, Math.round(fatigueScore / 10)),
        daysSinceLastTrained: Math.round(mostRecentTraining * 10) / 10,
        totalVolumeLastWeek: Math.round(totalVolume),
        recoveryScore
      }
    })

    setMuscleStatus(muscleData)
  }

  const toggleMuscleGroup = (groupName: string) => {
    const newSelected = selectedMuscleGroups.includes(groupName)
      ? selectedMuscleGroups.filter(m => m !== groupName)
      : [...selectedMuscleGroups, groupName]
    
    setSelectedMuscleGroups(newSelected)

    // Update muscle status
    const updatedStatus = { ...muscleStatus }
    updatedStatus[groupName].isSelected = !updatedStatus[groupName].isSelected
    setMuscleStatus(updatedStatus)

    // Notify parent component
    if (onMuscleSelectionChange) {
      const fatigueStatus: Record<string, number> = {}
      newSelected.forEach(muscle => {
        fatigueStatus[muscle] = muscleStatus[muscle]?.currentFatigue || 0
      })
      onMuscleSelectionChange(newSelected, fatigueStatus)
    }
  }

  const getStatusColor = (muscle: MuscleStatus): string => {
    if (muscle.recoveryScore >= 80) return "text-green-600 border-green-200 bg-green-50"
    if (muscle.recoveryScore >= 60) return "text-yellow-600 border-yellow-200 bg-yellow-50"
    if (muscle.recoveryScore >= 40) return "text-orange-600 border-orange-200 bg-orange-50"
    return "text-red-600 border-red-200 bg-red-50"
  }

  const getStatusIcon = (muscle: MuscleStatus) => {
    if (muscle.recoveryScore >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (muscle.recoveryScore >= 60) return <Activity className="h-4 w-4 text-yellow-600" />
    return <AlertTriangle className="h-4 w-4 text-red-600" />
  }

  const getRecommendation = (): string => {
    const highRecovery = Object.values(muscleStatus).filter(m => m.recoveryScore >= 80)
    const lowRecovery = Object.values(muscleStatus).filter(m => m.recoveryScore < 40)

    if (highRecovery.length >= 4) {
      return "Great recovery across muscle groups! Ideal for high-intensity full-body training."
    } else if (lowRecovery.length >= 2) {
      return "Some muscle groups need more recovery. Consider lighter training or focus on well-recovered areas."
    } else {
      return "Balanced recovery status. Focus on muscle groups with highest recovery scores for optimal gains."
    }
  }

  const sortedMuscles = Object.values(muscleStatus).sort((a, b) => b.recoveryScore - a.recoveryScore)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Target Muscle Selection
        </CardTitle>
        <CardDescription>Choose which muscle groups to focus on today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Workout Goal Selection */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Workout Goal</h4>
          <div className="flex gap-2 flex-wrap">
            {['balanced', 'strength', 'hypertrophy', 'endurance'].map(goal => (
              <Button
                key={goal}
                size="sm"
                variant={workoutGoal === goal ? "default" : "outline"}
                onClick={() => setWorkoutGoal(goal as any)}
              >
                {goal.charAt(0).toUpperCase() + goal.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Recovery Status Overview */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm text-blue-900">Recovery Analysis</span>
          </div>
          <p className="text-sm text-blue-800">{getRecommendation()}</p>
        </div>

        {/* Muscle Group Selection */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Select Target Muscle Groups</h4>
          <div className="grid gap-3">
            {sortedMuscles.map(muscle => (
              <div
                key={muscle.name}
                className={`p-3 border rounded-lg transition-all cursor-pointer ${
                  muscle.isSelected ? 'border-blue-500 bg-blue-50' : getStatusColor(muscle)
                }`}
                onClick={() => toggleMuscleGroup(muscle.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={muscle.isSelected}
                      onChange={() => toggleMuscleGroup(muscle.name)}
                    />
                    <span className="font-medium">{muscle.name}</span>
                    {getStatusIcon(muscle)}
                  </div>
                  <Badge variant="outline">
                    {muscle.recoveryScore}% recovered
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Recovery Status</span>
                    <Progress value={muscle.recoveryScore} className="w-20 h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{muscle.daysSinceLastTrained.toFixed(1)} days rest</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{muscle.totalVolumeLastWeek} vol/week</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selection Summary */}
        {selectedMuscleGroups.length > 0 && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm text-green-900">Today's Focus</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedMuscleGroups.map(muscle => (
                <Badge key={muscle} variant="secondary" className="text-green-700">
                  {muscle}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-green-800 mt-2">
              {selectedMuscleGroups.length === 1 
                ? "Single muscle group focus - great for isolation and recovery"
                : selectedMuscleGroups.length === 2
                ? "Dual muscle focus - perfect for supersets and efficiency"
                : "Multi-muscle workout - ideal for full-body training"
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}