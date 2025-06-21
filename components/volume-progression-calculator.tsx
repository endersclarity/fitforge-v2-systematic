"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Plus, Target, Calculator } from "lucide-react"

interface VolumeProgressionProps {
  className?: string
}

interface ExerciseVolume {
  name: string
  currentVolume: number
  sets: number
  reps: number
  weight: number
}

interface ProgressionOption {
  type: 'weight' | 'reps'
  description: string
  newSets: number
  newReps: number
  newWeight: number
  newVolume: number
  increase: number
}

export function VolumeProgressionCalculator({ className }: VolumeProgressionProps) {
  const [lastWorkoutExercises, setLastWorkoutExercises] = useState<ExerciseVolume[]>([])
  const [progressionOptions, setProgressionOptions] = useState<Record<string, ProgressionOption[]>>({})

  useEffect(() => {
    // Load last workout data
    const workouts = JSON.parse(localStorage.getItem("workoutSessions") || "[]")
    if (workouts.length > 0) {
      const lastWorkout = workouts[workouts.length - 1]
      
      const exercises: ExerciseVolume[] = lastWorkout.exercises?.map((exercise: any) => {
        // Calculate average sets/reps/weight from completed sets
        const completedSets = exercise.sets.filter((set: any) => set.completed)
        const avgReps = completedSets.reduce((sum: number, set: any) => sum + set.reps, 0) / completedSets.length
        const avgWeight = completedSets.reduce((sum: number, set: any) => sum + set.weight, 0) / completedSets.length
        
        return {
          name: exercise.name,
          currentVolume: exercise.exerciseVolume,
          sets: completedSets.length,
          reps: Math.round(avgReps),
          weight: Math.round(avgWeight * 10) / 10 // Round to 1 decimal
        }
      }) || []
      
      setLastWorkoutExercises(exercises)
      
      // Calculate progression options for each exercise
      const options: Record<string, ProgressionOption[]> = {}
      exercises.forEach(exercise => {
        options[exercise.name] = calculateProgressionOptions(exercise)
      })
      setProgressionOptions(options)
    }
  }, [])

  const calculateProgressionOptions = (exercise: ExerciseVolume): ProgressionOption[] => {
    const targetIncrease = exercise.currentVolume * 0.03 // 3% increase
    const options: ProgressionOption[] = []

    // Option 1: Increase weight (most common progression)
    const weightIncrease = Math.ceil(targetIncrease / (exercise.sets * exercise.reps) * 4) / 4 // Round to nearest 0.25 lbs
    const newWeight = exercise.weight + weightIncrease
    const newVolumeWeight = exercise.sets * exercise.reps * newWeight
    
    options.push({
      type: 'weight',
      description: `Add ${weightIncrease}lbs per set`,
      newSets: exercise.sets,
      newReps: exercise.reps,
      newWeight,
      newVolume: newVolumeWeight,
      increase: ((newVolumeWeight - exercise.currentVolume) / exercise.currentVolume) * 100
    })

    // Option 2: Increase reps (alternative progression)
    const repsIncrease = Math.ceil(targetIncrease / (exercise.sets * exercise.weight))
    const newReps = exercise.reps + repsIncrease
    const newVolumeReps = exercise.sets * newReps * exercise.weight
    
    options.push({
      type: 'reps',
      description: `Add ${repsIncrease} reps per set`,
      newSets: exercise.sets,
      newReps,
      newWeight: exercise.weight,
      newVolume: newVolumeReps,
      increase: ((newVolumeReps - exercise.currentVolume) / exercise.currentVolume) * 100
    })

    return options
  }

  if (lastWorkoutExercises.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Volume Progression Calculator
          </CardTitle>
          <CardDescription>3% volume increase suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Complete your first workout to see progression recommendations.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Next Workout Progression
        </CardTitle>
        <CardDescription>3% volume increase options for each exercise</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {lastWorkoutExercises.map(exercise => (
          <div key={exercise.name} className="space-y-3 border-b pb-4 last:border-b-0">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{exercise.name}</h4>
              <Badge variant="outline">
                Current: {exercise.currentVolume} vol
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Last: {exercise.sets} sets × {exercise.reps} reps × {exercise.weight}lbs
            </div>
            
            <div className="grid gap-3">
              {progressionOptions[exercise.name]?.map((option, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">
                        {option.type === 'weight' ? 'Add Weight' : 'Add Reps'}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-green-700">
                      +{option.increase.toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {option.newSets} × {option.newReps} × {option.newWeight}lbs
                    </span>
                    <span className="font-medium">
                      = {Math.round(option.newVolume)} vol
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-700">
                      +{Math.round(option.newVolume - exercise.currentVolume)} volume increase
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="font-medium text-sm text-green-900">Progressive Overload Strategy</span>
          </div>
          <p className="text-sm text-green-800">
            Choose weight increases for strength gains or rep increases for endurance. 
            3% weekly volume increase ensures consistent progress while avoiding overtraining.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}