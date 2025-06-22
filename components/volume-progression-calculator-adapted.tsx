"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Calculator, Info } from "lucide-react"
import exercisesData from "@/data/exercises-real.json"

interface VolumeProgressionProps {
  className?: string
}

interface ExerciseVolume {
  name: string
  currentVolume: number
  sets: number
  avgReps: number
  avgWeight: number
  lastPerformed: string
}

interface ProgressionOption {
  type: 'weight' | 'reps' | 'sets'
  description: string
  newSets: number
  newReps: number
  newWeight: number
  newVolume: number
  increase: number
  recommendation: string
}

export function VolumeProgressionCalculator({ className }: VolumeProgressionProps) {
  const [exerciseVolumes, setExerciseVolumes] = useState<ExerciseVolume[]>([])
  const [progressionOptions, setProgressionOptions] = useState<Record<string, ProgressionOption[]>>({})

  useEffect(() => {
    analyzeRecentWorkouts()
  }, [])

  const analyzeRecentWorkouts = () => {
    const workouts = JSON.parse(localStorage.getItem("workoutSessions") || "[]")
    const sessions = JSON.parse(localStorage.getItem("workoutSetHistory") || "[]")
    
    if (workouts.length === 0 && sessions.length === 0) {
      setExerciseVolumes([])
      return
    }

    // Get exercises from exercise data
    const exerciseMap: Record<string, any> = {}
    exercisesData.forEach((ex: any) => {
      exerciseMap[ex.id] = ex
    })

    // Analyze last 7 days of workouts
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Group sets by exercise from recent sessions
    const exerciseData: Record<string, { sets: any[], lastDate: string }> = {}
    
    // Process from workoutSetHistory if available
    sessions.forEach((session: any) => {
      const sessionDate = new Date(session.date)
      if (sessionDate >= sevenDaysAgo) {
        session.sets?.forEach((set: any) => {
          const exercise = exerciseMap[set.exerciseId]
          if (exercise) {
            if (!exerciseData[exercise.name]) {
              exerciseData[exercise.name] = { sets: [], lastDate: session.date }
            }
            exerciseData[exercise.name].sets.push(set)
            exerciseData[exercise.name].lastDate = session.date
          }
        })
      }
    })

    // Calculate volume for each exercise
    const volumes: ExerciseVolume[] = []
    Object.entries(exerciseData).forEach(([exerciseName, data]) => {
      const sets = data.sets
      if (sets.length > 0) {
        const totalWeight = sets.reduce((sum, set) => sum + set.weight, 0)
        const totalReps = sets.reduce((sum, set) => sum + set.reps, 0)
        const avgWeight = totalWeight / sets.length
        const avgReps = totalReps / sets.length
        const totalVolume = totalWeight * totalReps / sets.length // Average volume per set * number of sets

        volumes.push({
          name: exerciseName,
          currentVolume: Math.round(totalVolume),
          sets: sets.length,
          avgReps: Math.round(avgReps),
          avgWeight: Math.round(avgWeight * 4) / 4, // Round to nearest 0.25
          lastPerformed: data.lastDate
        })
      }
    })

    // Sort by last performed date
    volumes.sort((a, b) => new Date(b.lastPerformed).getTime() - new Date(a.lastPerformed).getTime())
    
    setExerciseVolumes(volumes.slice(0, 5)) // Show top 5 most recent exercises

    // Calculate progression options for each exercise
    const options: Record<string, ProgressionOption[]> = {}
    volumes.slice(0, 5).forEach(exercise => {
      options[exercise.name] = calculateProgressionOptions(exercise)
    })
    setProgressionOptions(options)
  }

  const calculateProgressionOptions = (exercise: ExerciseVolume): ProgressionOption[] => {
    const targetIncrease = exercise.currentVolume * 0.03 // 3% increase
    const options: ProgressionOption[] = []

    // Determine exercise type for smart recommendations
    const isUpperBody = exercise.name.toLowerCase().includes('press') || 
                       exercise.name.toLowerCase().includes('curl') ||
                       exercise.name.toLowerCase().includes('row') ||
                       exercise.name.toLowerCase().includes('pull')
    
    const isLowerBody = exercise.name.toLowerCase().includes('squat') ||
                       exercise.name.toLowerCase().includes('deadlift') ||
                       exercise.name.toLowerCase().includes('lunge')

    // Option 1: Increase weight (most common progression)
    const baseIncrement = isUpperBody ? 2.5 : (isLowerBody ? 5 : 2.5)
    const weightIncrease = Math.ceil(targetIncrease / (exercise.sets * exercise.avgReps) / baseIncrement) * baseIncrement
    const newWeight = exercise.avgWeight + weightIncrease
    const newVolumeWeight = exercise.sets * exercise.avgReps * newWeight
    
    options.push({
      type: 'weight',
      description: `Add ${weightIncrease} lbs to each set`,
      newSets: exercise.sets,
      newReps: exercise.avgReps,
      newWeight,
      newVolume: Math.round(newVolumeWeight),
      increase: ((newVolumeWeight - exercise.currentVolume) / exercise.currentVolume) * 100,
      recommendation: isUpperBody ? 'Best for upper body strength gains' : 
                      isLowerBody ? 'Ideal for lower body power development' :
                      'Recommended for strength progression'
    })

    // Option 2: Increase reps (for endurance/hypertrophy)
    const repsIncrease = Math.max(1, Math.round(targetIncrease / (exercise.sets * exercise.avgWeight)))
    const newReps = exercise.avgReps + repsIncrease
    const newVolumeReps = exercise.sets * newReps * exercise.avgWeight
    
    if (newReps <= 15) { // Don't suggest more than 15 reps
      options.push({
        type: 'reps',
        description: `Add ${repsIncrease} rep${repsIncrease > 1 ? 's' : ''} to each set`,
        newSets: exercise.sets,
        newReps,
        newWeight: exercise.avgWeight,
        newVolume: Math.round(newVolumeReps),
        increase: ((newVolumeReps - exercise.currentVolume) / exercise.currentVolume) * 100,
        recommendation: 'Good for muscular endurance and hypertrophy'
      })
    }

    // Option 3: Add a set (for volume accumulation)
    if (exercise.sets < 5) { // Don't suggest more than 5 sets
      const newSets = exercise.sets + 1
      const newVolumeSets = newSets * exercise.avgReps * exercise.avgWeight
      
      options.push({
        type: 'sets',
        description: `Add 1 more set at same weight/reps`,
        newSets,
        newReps: exercise.avgReps,
        newWeight: exercise.avgWeight,
        newVolume: Math.round(newVolumeSets),
        increase: ((newVolumeSets - exercise.currentVolume) / exercise.currentVolume) * 100,
        recommendation: 'Increases total volume for size gains'
      })
    }

    // Sort by closest to 3% target
    options.sort((a, b) => Math.abs(a.increase - 3) - Math.abs(b.increase - 3))

    return options
  }

  if (exerciseVolumes.length === 0) {
    return (
      <Card className={`bg-[#1C1C1E] border-[#2C2C2E] ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calculator className="h-5 w-5 text-[#FF375F]" />
            Volume Progression Calculator
          </CardTitle>
          <CardDescription className="text-[#A1A1A3]">
            Smart progression recommendations based on 3% volume increase principle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[#A1A1A3]">Complete some workouts to see personalized progression recommendations.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-[#1C1C1E] border-[#2C2C2E] ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Calculator className="h-5 w-5 text-[#FF375F]" />
          Progressive Overload Calculator
        </CardTitle>
        <CardDescription className="text-[#A1A1A3]">
          Optimal progression paths for your recent exercises
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {exerciseVolumes.map(exercise => (
          <div key={exercise.name} className="space-y-3 border-b border-[#2C2C2E] pb-4 last:border-b-0">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-white">{exercise.name}</h4>
              <Badge variant="outline" className="text-white border-[#3C3C3E]">
                Current: {exercise.currentVolume} lbs total
              </Badge>
            </div>
            
            <div className="text-sm text-[#A1A1A3]">
              Recent average: {exercise.sets} sets × {exercise.avgReps} reps × {exercise.avgWeight} lbs
            </div>
            
            <div className="grid gap-3">
              {progressionOptions[exercise.name]?.map((option, index) => (
                <div key={index} className={`p-3 border rounded-lg space-y-2 ${
                  index === 0 ? 'border-[#FF375F]/50 bg-[#FF375F]/10' : 'border-[#2C2C2E] bg-[#2C2C2E]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className={`h-4 w-4 ${index === 0 ? 'text-[#FF375F]' : 'text-blue-500'}`} />
                      <span className="font-medium text-sm text-white">
                        {option.type === 'weight' ? 'Increase Weight' : 
                         option.type === 'reps' ? 'Add Reps' : 'Add Set'}
                      </span>
                      {index === 0 && (
                        <Badge className="bg-[#FF375F] text-white text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                      +{option.increase.toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-white">{option.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#A1A1A3]">
                      {option.newSets} × {option.newReps} × {option.newWeight} lbs
                    </span>
                    <span className="font-medium text-white">
                      = {option.newVolume} lbs
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Info className="h-3 w-3 text-[#A1A1A3]" />
                    <span className="text-xs text-[#A1A1A3]">
                      {option.recommendation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="font-medium text-sm text-white">Progressive Overload Strategy</span>
          </div>
          <p className="text-sm text-[#A1A1A3]">
            The 3% weekly volume increase is scientifically proven for optimal strength and muscle gains. 
            Choose weight increases for strength, rep increases for endurance, or add sets for hypertrophy.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}