"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Calculator, Zap, Target, TrendingUp, AlertTriangle, CheckCircle, Activity } from "lucide-react"

interface FatigueCalculatorProps {
  className?: string
  targetMuscles?: string[]
  onFatigueTargetsCalculated?: (targets: FatigueTarget[]) => void
}

interface FatigueTarget {
  muscleName: string
  targetVolume: number
  currentVolume: number
  currentFatigue: number  // 0-100%
  optimalVolume: number
  maxRecoverableVolume: number
  recommendedSets: number
  fatigueStatus: 'undertrained' | 'optimal' | 'approaching_limit' | 'overtrained'
}

interface FatigueParameters {
  userWeight: number
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  recoveryCapacity: number  // 1-10 scale
  weeklyFrequency: number
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'general_fitness'
}

// Science-based fatigue thresholds per muscle group
const MUSCLE_VOLUME_STANDARDS = {
  // Large muscle groups (sets per week)
  'Chest': { beginner: 12, intermediate: 16, advanced: 22 },
  'Back': { beginner: 14, intermediate: 18, advanced: 25 },
  'Legs': { beginner: 16, intermediate: 20, advanced: 28 },
  'Shoulders': { beginner: 10, intermediate: 14, advanced: 20 },
  
  // Smaller muscle groups
  'Arms': { beginner: 8, intermediate: 12, advanced: 16 },
  'Core': { beginner: 6, intermediate: 10, advanced: 14 }
}

export function FatigueCalculator({ className, targetMuscles = [], onFatigueTargetsCalculated }: FatigueCalculatorProps) {
  const [fatigueTargets, setFatigueTargets] = useState<FatigueTarget[]>([])
  const [parameters, setParameters] = useState<FatigueParameters>({
    userWeight: 150,
    experienceLevel: 'intermediate',
    recoveryCapacity: 7,
    weeklyFrequency: 4,
    goal: 'general_fitness'
  })
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    loadUserParameters()
  }, [])

  useEffect(() => {
    if (targetMuscles.length > 0) {
      calculateFatigueTargets()
    }
  }, [targetMuscles, parameters])

  const loadUserParameters = () => {
    const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}")
    
    setParameters({
      userWeight: userProfile.bodyWeight || 150,
      experienceLevel: userProfile.experienceLevel || 'intermediate',
      recoveryCapacity: userProfile.motivationLevel || 7,
      weeklyFrequency: userProfile.weeklyWorkouts || 4,
      goal: userProfile.primaryGoal || 'general_fitness'
    })
  }

  const calculateFatigueTargets = () => {
    setIsCalculating(true)

    // Load recent workout data
    const workouts = JSON.parse(localStorage.getItem("workoutSessions") || "[]")
    const recentWorkouts = workouts.filter((workout: any) => {
      const workoutDate = new Date(workout.date)
      const daysDiff = (new Date().getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7
    })

    const targets: FatigueTarget[] = targetMuscles.map(muscleGroup => {
      // Calculate current volume for this muscle group
      let currentVolume = 0
      let currentSets = 0

      recentWorkouts.forEach((workout: any) => {
        workout.exercises?.forEach((exercise: any) => {
          if (exercise.muscleEngagement) {
            Object.entries(exercise.muscleEngagement).forEach(([muscle, engagement]) => {
              if (isMuscleMappedToGroup(muscle, muscleGroup)) {
                const engagementFactor = (engagement as number) / 100
                currentVolume += exercise.exerciseVolume * engagementFactor
                currentSets += exercise.sets.length * engagementFactor
              }
            })
          }
        })
      })

      // Calculate optimal and maximum volumes based on science
      const baseStandards = MUSCLE_VOLUME_STANDARDS[muscleGroup as keyof typeof MUSCLE_VOLUME_STANDARDS] || 
                           { beginner: 10, intermediate: 14, advanced: 18 }
      
      const baseSets = baseStandards[parameters.experienceLevel]
      
      // Adjust for individual factors
      const recoveryMultiplier = parameters.recoveryCapacity / 7 // Normalize to 1.0
      const frequencyMultiplier = Math.sqrt(parameters.weeklyFrequency / 4) // Frequency effect
      const goalMultiplier = getGoalMultiplier(parameters.goal)
      
      const optimalSets = Math.round(baseSets * recoveryMultiplier * frequencyMultiplier * goalMultiplier)
      const maxSets = Math.round(optimalSets * 1.5) // 50% above optimal = overreach territory
      
      // Convert sets to volume (rough estimation)
      const avgVolumePerSet = 150 // lbs * reps average
      const optimalVolume = optimalSets * avgVolumePerSet
      const maxRecoverableVolume = maxSets * avgVolumePerSet

      // Calculate current fatigue percentage
      const currentFatigue = Math.min(100, (currentVolume / maxRecoverableVolume) * 100)
      
      // Determine fatigue status
      const fatigueStatus = getFatigueStatus(currentVolume, optimalVolume, maxRecoverableVolume)

      return {
        muscleName: muscleGroup,
        targetVolume: optimalVolume,
        currentVolume: Math.round(currentVolume),
        currentFatigue: Math.round(currentFatigue),
        optimalVolume,
        maxRecoverableVolume,
        recommendedSets: Math.max(0, optimalSets - currentSets),
        fatigueStatus
      }
    })

    setFatigueTargets(targets)
    
    if (onFatigueTargetsCalculated) {
      onFatigueTargetsCalculated(targets)
    }

    setIsCalculating(false)
  }

  const isMuscleMappedToGroup = (muscle: string, group: string): boolean => {
    const muscleGroupMap: Record<string, string[]> = {
      'Chest': ['Pectoralis Major', 'Pectoralis_Major', 'Upper Chest', 'Lower Chest'],
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

  const getGoalMultiplier = (goal: string): number => {
    switch (goal) {
      case 'strength': return 0.85      // Lower volume, higher intensity
      case 'hypertrophy': return 1.2    // Higher volume for muscle growth
      case 'endurance': return 1.1      // Moderate-high volume
      default: return 1.0               // Balanced approach
    }
  }

  const getFatigueStatus = (current: number, optimal: number, maximum: number): FatigueTarget['fatigueStatus'] => {
    if (current < optimal * 0.7) return 'undertrained'
    if (current <= optimal * 1.1) return 'optimal'
    if (current <= maximum) return 'approaching_limit'
    return 'overtrained'
  }

  const getStatusColor = (status: FatigueTarget['fatigueStatus']): string => {
    switch (status) {
      case 'undertrained': return 'text-blue-600 border-blue-200 bg-blue-50'
      case 'optimal': return 'text-green-600 border-green-200 bg-green-50'
      case 'approaching_limit': return 'text-yellow-600 border-yellow-200 bg-yellow-50'
      case 'overtrained': return 'text-red-600 border-red-200 bg-red-50'
    }
  }

  const getStatusIcon = (status: FatigueTarget['fatigueStatus']) => {
    switch (status) {
      case 'undertrained': return <TrendingUp className="h-4 w-4 text-blue-600" />
      case 'optimal': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'approaching_limit': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'overtrained': return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusMessage = (status: FatigueTarget['fatigueStatus']): string => {
    switch (status) {
      case 'undertrained': return 'Room for more volume - can handle additional work'
      case 'optimal': return 'Perfect training zone - maintain current volume'
      case 'approaching_limit': return 'Near maximum recoverable volume - proceed carefully'
      case 'overtrained': return 'Excessive volume - reduce training or increase recovery'
    }
  }

  const calculateToOptimal = (target: FatigueTarget): number => {
    return Math.max(0, target.optimalVolume - target.currentVolume)
  }

  const calculateTo100Percent = (target: FatigueTarget): number => {
    return Math.max(0, target.maxRecoverableVolume - target.currentVolume)
  }

  if (targetMuscles.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            100% Fatigue Calculator
          </CardTitle>
          <CardDescription>Science-based optimal training volume calculator</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select target muscle groups to calculate optimal fatigue levels.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          100% Fatigue Calculator
        </CardTitle>
        <CardDescription>Optimal training volume based on recovery capacity and goals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Parameter Adjustments */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Training Parameters</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recovery Capacity: {parameters.recoveryCapacity}/10</label>
              <Slider
                value={[parameters.recoveryCapacity]}
                onValueChange={([value]) => setParameters(prev => ({ ...prev, recoveryCapacity: value }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Weekly Frequency: {parameters.weeklyFrequency}</label>
              <Slider
                value={[parameters.weeklyFrequency]}
                onValueChange={([value]) => setParameters(prev => ({ ...prev, weeklyFrequency: value }))}
                max={7}
                min={2}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Fatigue Analysis Results */}
        {isCalculating ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Calculating optimal fatigue levels...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Fatigue Analysis</h4>
            
            {fatigueTargets.map(target => (
              <div key={target.muscleName} className={`p-4 border rounded-lg ${getStatusColor(target.fatigueStatus)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(target.fatigueStatus)}
                    <span className="font-medium">{target.muscleName}</span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {target.fatigueStatus.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Current Fatigue Level</span>
                      <span>{target.currentFatigue}%</span>
                    </div>
                    <Progress value={target.currentFatigue} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Current Volume</div>
                      <div className="font-medium">{target.currentVolume.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Optimal Volume</div>
                      <div className="font-medium">{target.optimalVolume.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {getStatusMessage(target.fatigueStatus)}
                  </div>

                  {/* Volume to targets */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        To Optimal (85-100%)
                      </span>
                      <span className={calculateToOptimal(target) > 0 ? 'text-blue-600 font-medium' : 'text-green-600'}>
                        {calculateToOptimal(target) > 0 ? `+${calculateToOptimal(target).toLocaleString()}` : 'Achieved ✓'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        To 100% Fatigue
                      </span>
                      <span className={calculateTo100Percent(target) > 0 ? 'text-yellow-600 font-medium' : 'text-red-600'}>
                        {calculateTo100Percent(target) > 0 ? `+${calculateTo100Percent(target).toLocaleString()}` : 'Exceeded!'}
                      </span>
                    </div>

                    {target.recommendedSets > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          Recommended Sets
                        </span>
                        <span className="text-blue-600 font-medium">
                          +{target.recommendedSets} sets
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Science-Based Summary */}
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-sm text-purple-900">100% Fatigue Definition</span>
          </div>
          <p className="text-sm text-purple-800">
            100% fatigue represents the maximum weekly volume a muscle group can handle while maintaining 
            recovery. Based on {parameters.experienceLevel} level, {parameters.recoveryCapacity}/10 recovery capacity, 
            and {parameters.goal} goals. Optimal zone is 85-100% for maximum gains without overtraining.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}