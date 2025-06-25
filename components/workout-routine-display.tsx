'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Edit2, Plus } from "lucide-react"
import workoutTemplates from '@/data/workout-templates.json'
import exercisesData from '@/data/exercises-real.json'

interface WorkoutTemplate {
  id: string
  name: string
  description: string
  category: string
  workoutType: string
  variant: string
  exercises: Array<{
    exerciseId: string
    sets: number
    reps: string
    restSeconds: number
    notes?: string
  }>
  targetMuscles: string[]
  estimatedDuration: number
  difficulty: string
  equipment: string[]
  tags?: string[]
  fatigueScore: number
}

interface Exercise {
  id: string
  name: string
  category: string
  equipment: string
}

export function WorkoutRoutineDisplay({ 
  onBack, 
  onStartWorkout,
  selectedTemplate = 'pushA' // Default to Push A template
}: { 
  onBack: () => void
  onStartWorkout?: (template: WorkoutTemplate) => void
  selectedTemplate?: string
}) {
  const [template, setTemplate] = useState<WorkoutTemplate | null>(null)
  const [exerciseMap, setExerciseMap] = useState<Record<string, Exercise>>({})

  useEffect(() => {
    // Load the selected template
    const templateData = (workoutTemplates as any)[selectedTemplate]
    if (templateData) {
      setTemplate(templateData)
    }

    // Create exercise lookup map
    const exerciseMapData = exercisesData.reduce((acc, exercise) => {
      acc[exercise.id] = exercise
      return acc
    }, {} as Record<string, Exercise>)
    setExerciseMap(exerciseMapData)
  }, [selectedTemplate])

  if (!template) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <p className="text-lg text-[#A1A1A3]">Loading workout...</p>
      </div>
    )
  }

  const getExerciseName = (exerciseId: string): string => {
    return exerciseMap[exerciseId]?.name || exerciseId.replace(/_/g, ' ')
  }

  const getRecoveryPercentage = (muscle: string): number => {
    // Mock recovery data - in real app would come from muscle state calculations
    // For demo, show 100% recovery for all muscles
    return 100
  }

  const formatTargetMuscles = (muscles: string[]): string => {
    return muscles.map(muscle => muscle.replace(/_/g, ' ')).join(', ')
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header with Back Button and Gym Name */}
      <div className="px-6 py-4 border-b border-[#2C2C2E]">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="p-2 hover:bg-[#2C2C2E] mr-3"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">YOUR GYM</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#FF375F] hover:bg-[#2C2C2E]"
          >
            Edit
          </Button>
        </div>
      </div>

      {/* Target Muscles with Recovery Status */}
      <div className="px-6 py-4">
        <p className="text-lg text-white mb-3">{formatTargetMuscles(template.targetMuscles)}</p>
        
        {/* Recovery Status Indicators - Fitbod shows these as 100% bars */}
        <div className="flex space-x-2 mb-4">
          {template.targetMuscles.map((muscle) => {
            const recoveryPercentage = getRecoveryPercentage(muscle)
            return (
              <div key={muscle} className="flex flex-col items-center">
                <div className="w-8 h-12 bg-[#2C2C2E] rounded-sm relative overflow-hidden">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-green-500 transition-all"
                    style={{ height: `${recoveryPercentage}%` }}
                  />
                </div>
                <span className="text-xs text-[#A1A1A3] mt-1">{recoveryPercentage}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Exercise Button - Following Fitbod pattern */}
      <div className="px-6 mb-4">
        <Button 
          variant="ghost"
          className="w-full justify-start text-[#FF375F] hover:bg-[#2C2C2E] p-4"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add an exercise
        </Button>
      </div>

      {/* Workout Exercises - Following Fitbod's exercise list pattern */}
      <div className="px-6 space-y-3">
        <h2 className="text-lg font-semibold text-white mb-3">Workout</h2>
        
        {template.exercises.map((exercise, index) => (
          <Card key={exercise.exerciseId} className="bg-[#1C1C1E] border-[#2C2C2E]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">
                    {getExerciseName(exercise.exerciseId)}
                  </h3>
                  <p className="text-[#A1A1A3] text-sm">
                    {exercise.sets} sets • {exercise.reps} reps
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#A1A1A3] text-sm">
                    {Math.floor(exercise.restSeconds / 60)}:{String(exercise.restSeconds % 60).padStart(2, '0')} rest
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Start Workout Button - Prominent action */}
      <div className="px-6 py-8">
        <Button 
          onClick={() => {
            if (!template) return
            
            // Convert template exercises to workout queue format expected by WorkoutLoggerEnhanced
            const workoutQueue = template.exercises.map((templateExercise) => {
              const exerciseData = exerciseMap[templateExercise.exerciseId]
              return {
                id: templateExercise.exerciseId,
                name: exerciseData?.name || templateExercise.exerciseId.replace(/_/g, ' '),
                category: exerciseData?.category || 'Unknown',
                equipment: exerciseData?.equipment || 'Unknown',
                difficulty: exerciseData?.difficulty || 'Intermediate'
              }
            })

            // Save workout queue to localStorage for WorkoutLoggerEnhanced
            localStorage.setItem('workoutQueue', JSON.stringify(workoutQueue))
            
            // Navigate to the workout logger
            window.location.href = '/workouts-simple'
          }}
          className="w-full bg-[#FF375F] hover:bg-[#E63050] text-white h-14 text-lg font-semibold"
        >
          Start Workout
        </Button>
      </div>

      {/* Workout Info Footer */}
      <div className="px-6 pb-8 text-center">
        <p className="text-[#A1A1A3] text-sm">
          {template.estimatedDuration} min • {template.difficulty} • {template.exercises.length} exercises
        </p>
        <p className="text-[#A1A1A3] text-xs mt-1">
          {template.equipment.join(', ')} required
        </p>
      </div>

      {/* Bottom spacing for mobile */}
      <div className="h-8" />
    </div>
  )
}