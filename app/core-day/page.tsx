'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Play, 
  Plus,
  Minus,
  Clock,
  Target
} from "lucide-react"
import { Input } from "@/components/ui/input"
import exercisesData from '@/data/exercises-real.json'
import { useRealTimeMuscleVolume } from '@/hooks/useRealTimeMuscleVolume'
import { WorkoutExercise, PlannedSet } from '@/schemas/typescript-interfaces'

interface Exercise {
  id: string
  name: string
  category: string
  equipment: string
  difficulty: string
  variation: string
  muscleEngagement: Record<string, number>
}

interface ExerciseWithSets extends WorkoutExercise {
  plannedSets: PlannedSet[]
}

export default function CoreDayPage() {
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedExercises, setSelectedExercises] = useState<ExerciseWithSets[]>([])

  // Real-time muscle volume calculation
  const { normalizedVolumes, summary, estimatedDuration } = useRealTimeMuscleVolume(selectedExercises)

  useEffect(() => {
    // Filter Abs exercises
    const coreExercises = (exercisesData as Exercise[]).filter(
      exercise => exercise.category === 'Abs'
    )
    setExercises(coreExercises)
  }, [])

  const createDefaultSets = (exercise: Exercise): PlannedSet[] => {
    const defaultWeight = exercise.equipment === 'Bodyweight' ? 0 : 25
    return [
      { 
        id: `${exercise.id}-set-1`, 
        exerciseId: exercise.id,
        setNumber: 1,
        targetWeight: defaultWeight, 
        targetReps: 15, 
        equipment: exercise.equipment,
        notes: ''
      }
    ]
  }

  const addExercise = (exercise: Exercise) => {
    const workoutExercise: ExerciseWithSets = {
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
      muscleEngagement: exercise.muscleEngagement,
      plannedSets: createDefaultSets(exercise)
    }
    setSelectedExercises(prev => [...prev, workoutExercise])
  }

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises(prev => prev.filter(ex => ex.id !== exerciseId))
  }

  const updateSetValue = (exerciseId: string, setIndex: number, field: 'targetWeight' | 'targetReps', value: number) => {
    setSelectedExercises(prev => prev.map(exercise => {
      if (exercise.id !== exerciseId) return exercise
      
      const updatedSets = [...exercise.plannedSets]
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        [field]: Math.max(0, value)
      }
      
      return {
        ...exercise,
        plannedSets: updatedSets
      }
    }))
  }

  const updateExerciseRestTime = (exerciseId: string, restSeconds: number) => {
    setSelectedExercises(prev => prev.map(exercise => {
      if (exercise.id !== exerciseId) return exercise
      
      // Update all sets to use the new rest time
      const updatedSets = exercise.plannedSets.map(set => ({
        ...set,
        restSeconds: Math.max(0, restSeconds)
      }))
      
      return {
        ...exercise,
        plannedSets: updatedSets
      }
    }))
  }

  const addSet = (exerciseId: string) => {
    setSelectedExercises(prev => prev.map(exercise => {
      if (exercise.id !== exerciseId) return exercise
      
      const lastSet = exercise.plannedSets[exercise.plannedSets.length - 1]
      const newSetNumber = exercise.plannedSets.length + 1
      const newSet: PlannedSet = {
        id: `${exerciseId}-set-${newSetNumber}`,
        exerciseId: exerciseId,
        setNumber: newSetNumber,
        targetWeight: lastSet?.targetWeight || (exercise.equipment === 'Bodyweight' ? 0 : 25),
        targetReps: lastSet?.targetReps || 15,
        equipment: exercise.equipment,
        notes: ''
      }
      
      return {
        ...exercise,
        plannedSets: [...exercise.plannedSets, newSet]
      }
    }))
  }

  const removeSet = (exerciseId: string, setIndex: number) => {
    setSelectedExercises(prev => prev.map(exercise => {
      if (exercise.id !== exerciseId) return exercise
      
      // Don't allow removing the last set
      if (exercise.plannedSets.length <= 1) return exercise
      
      const updatedSets = exercise.plannedSets.filter((_, index) => index !== setIndex)
      
      return {
        ...exercise,
        plannedSets: updatedSets
      }
    }))
  }

  const startWorkout = () => {
    if (selectedExercises.length === 0) {
      alert('Please select at least one exercise before starting your workout.');
      return;
    }

    // Save workout session to localStorage for the execution page
    const workoutSession = {
      exercises: selectedExercises,
      workoutType: 'core',
      startTime: new Date().toISOString()
    };
    
    localStorage.setItem('fitforge-workout-session', JSON.stringify(workoutSession));
    
    // Navigate to dedicated workout execution page
    router.push('/workout-execution');
  }

  return (
    <div className="min-h-screen bg-fitbod-background text-fitbod-text p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="bg-fitbod-card border-fitbod-subtle text-fitbod-text hover:bg-fitbod-subtle"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-fitbod-text">Build Your Core Workout</h1>
            <p className="text-fitbod-text-secondary">
              Add core and abs exercises to strengthen your midsection
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Available Exercises */}
          <Card className="bg-fitbod-card border-fitbod-subtle">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-fitbod-text">Core Exercises</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {exercises.map((exercise) => (
                <div key={exercise.id} className="flex items-center justify-between p-2 hover:bg-fitbod-subtle rounded">
                  <div>
                    <span className="text-sm text-fitbod-text">{exercise.name}</span>
                    <p className="text-xs text-fitbod-text-secondary">{exercise.equipment} • {exercise.difficulty}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addExercise(exercise)}
                    disabled={selectedExercises.some(ex => ex.id === exercise.id)}
                    className="h-6 w-6 p-0 bg-fitbod-accent hover:bg-red-600"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Workout Builder */}
          <Card className="bg-fitbod-card border-fitbod-subtle">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-fitbod-text">Your Workout</CardTitle>
                <div className="flex items-center gap-2 text-xs text-fitbod-text-secondary">
                  <Clock className="h-3 w-3" />
                  {estimatedDuration}min
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedExercises.length === 0 ? (
                <p className="text-sm text-fitbod-text-secondary text-center py-4">
                  Add exercises to build your workout
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedExercises.map((exercise, index) => (
                    <div key={exercise.id} className="p-3 bg-fitbod-subtle rounded">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-fitbod-text">{exercise.name}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => addSet(exercise.id)}
                            className="h-6 w-6 p-0 text-fitbod-accent hover:text-red-400"
                            title="Add set"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeExercise(exercise.id)}
                            className="h-6 w-6 p-0 text-fitbod-text-secondary hover:text-fitbod-text"
                            title="Remove exercise"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Rest Timer Control */}
                      <div className="flex items-center gap-2 mb-3 p-2 bg-fitbod-background rounded">
                        <Clock className="h-3 w-3 text-fitbod-text-secondary" />
                        <span className="text-xs text-fitbod-text-secondary">Rest:</span>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateExerciseRestTime(exercise.id, (exercise.plannedSets[0]?.restSeconds || 60) - 15)}
                            className="h-5 w-5 p-0 text-fitbod-text-secondary hover:text-fitbod-text"
                          >
                            <Minus className="h-2 w-2" />
                          </Button>
                          <Input
                            type="number"
                            value={exercise.plannedSets[0]?.restSeconds || 60}
                            onChange={(e) => updateExerciseRestTime(exercise.id, parseInt(e.target.value) || 60)}
                            className="w-12 h-5 text-xs text-center bg-fitbod-background border-fitbod-subtle text-fitbod-text [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateExerciseRestTime(exercise.id, (exercise.plannedSets[0]?.restSeconds || 60) + 15)}
                            className="h-5 w-5 p-0 text-fitbod-text-secondary hover:text-fitbod-text"
                          >
                            <Plus className="h-2 w-2" />
                          </Button>
                          <span className="text-xs text-fitbod-text-secondary">sec</span>
                        </div>
                      </div>
                      
                      {/* Editable Sets */}
                      <div className="space-y-2">
                        {exercise.plannedSets.map((set, setIndex) => (
                          <div key={setIndex} className="flex items-center gap-2 text-xs">
                            <span className="text-fitbod-text-secondary w-8">Set {setIndex + 1}</span>
                            
                            {/* Weight Input */}
                            {exercise.equipment !== 'Bodyweight' && (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateSetValue(exercise.id, setIndex, 'targetWeight', set.targetWeight - 2.5)}
                                  className="h-6 w-6 p-0 text-fitbod-text-secondary hover:text-fitbod-text"
                                >
                                  <Minus className="h-2 w-2" />
                                </Button>
                                <Input
                                  type="number"
                                  value={set.targetWeight}
                                  onChange={(e) => updateSetValue(exercise.id, setIndex, 'targetWeight', parseFloat(e.target.value) || 0)}
                                  className="w-14 h-7 text-xs text-center bg-fitbod-background border-fitbod-subtle text-fitbod-text [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateSetValue(exercise.id, setIndex, 'targetWeight', set.targetWeight + 2.5)}
                                  className="h-6 w-6 p-0 text-fitbod-text-secondary hover:text-fitbod-text"
                                >
                                  <Plus className="h-2 w-2" />
                                </Button>
                                <span className="text-fitbod-text-secondary">lb</span>
                              </div>
                            )}
                            
                            {/* Reps Input */}
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateSetValue(exercise.id, setIndex, 'targetReps', set.targetReps - 1)}
                                className="h-6 w-6 p-0 text-fitbod-text-secondary hover:text-fitbod-text"
                              >
                                <Minus className="h-2 w-2" />
                              </Button>
                              <Input
                                type="number"
                                value={set.targetReps}
                                onChange={(e) => updateSetValue(exercise.id, setIndex, 'targetReps', parseInt(e.target.value) || 0)}
                                className="w-14 h-7 text-xs text-center bg-fitbod-background border-fitbod-subtle text-fitbod-text [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateSetValue(exercise.id, setIndex, 'targetReps', set.targetReps + 1)}
                                className="h-6 w-6 p-0 text-fitbod-text-secondary hover:text-fitbod-text"
                              >
                                <Plus className="h-2 w-2" />
                              </Button>
                              <span className="text-fitbod-text-secondary">reps</span>
                            </div>
                            
                            {/* Remove Set Button */}
                            {exercise.plannedSets.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeSet(exercise.id, setIndex)}
                                className="h-6 w-6 p-0 text-fitbod-text-secondary hover:text-red-400 ml-auto"
                                title="Remove set"
                              >
                                <Minus className="h-2 w-2" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    onClick={startWorkout}
                    className="w-full mt-4 bg-fitbod-accent hover:bg-red-600 text-white"
                    disabled={selectedExercises.length === 0}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Workout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Muscle Map Card - Horizontal at Bottom */}
        {summary && summary.length > 0 && (
          <Card className="bg-fitbod-card border-fitbod-subtle mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-fitbod-text">Core Activation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {summary.map((muscle) => (
                  <div key={muscle.muscle} className="text-center p-3 bg-fitbod-subtle rounded">
                    <p className="text-sm font-medium text-fitbod-text mb-2">
                      {muscle.muscle}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold text-fitbod-text">
                        {muscle.fatiguePercentage}%
                      </span>
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          muscle.intensity === 'very_high' ? 'bg-red-600' :
                          muscle.intensity === 'high' ? 'bg-red-500' :
                          muscle.intensity === 'medium' ? 'bg-yellow-500' :
                          muscle.intensity === 'low' ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-fitbod-text-secondary mt-1">
                      {muscle.intensity.replace('_', ' ')} activation
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}