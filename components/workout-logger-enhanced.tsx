'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Minus, Clock, CheckCircle, Dumbbell, Timer } from "lucide-react"
import { WorkoutSet, WorkoutSetCreate } from '@/schemas/typescript-interfaces' // Use the real schema
import { RestTimer } from './rest-timer'
import { api } from '@/lib/api-client'

// This local interface is still useful for the workout *plan*
interface WorkoutExercise {
  id: string
  name: string
  category: string
  equipment: string
  difficulty: string
}

export function WorkoutLoggerEnhanced() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [workoutId, setWorkoutId] = useState<string | null>(null)
  const [workoutQueue, setWorkoutQueue] = useState<WorkoutExercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [sets, setSets] = useState<WorkoutSet[]>([]) // Use the real WorkoutSet interface
  const [currentWeight, setCurrentWeight] = useState('')
  const [currentReps, setCurrentReps] = useState('')
  const [currentRpe, setCurrentRpe] = useState('')
  const [startTime] = useState(new Date().toISOString())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false)
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const start = new Date(startTime)
      const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000)
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime])

  // Load workout plan and existing sets on mount
  useEffect(() => {
    const id = searchParams.get('id')
    if (!id) {
      console.error("No workout ID provided, redirecting.")
      router.push('/')
      return
    }
    setWorkoutId(id)

    const loadWorkoutData = async (workoutId: string) => {
      try {
        // Load the plan from localStorage
        const savedPlan = localStorage.getItem(`workout-plan-${workoutId}`)
        if (savedPlan) {
          const queue = JSON.parse(savedPlan)
          if (queue.length > 0) {
            setWorkoutQueue(queue)
          } else {
            throw new Error("Workout plan is empty.")
          }
        } else {
          throw new Error("Workout plan not found in localStorage.")
        }

        // Fetch already logged sets from the backend
        const existingSets = await api.workoutSets.list(workoutId)
        setSets(existingSets)

      } catch (error) {
        console.error("Failed to load workout data:", error)
        // TODO: show error to user
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkoutData(id)
  }, [router, searchParams])

  const currentExercise = workoutQueue[currentExerciseIndex]
  // Filter sets from state for the current exercise
  const exerciseSets = sets.filter(set => set.exercise_id === currentExercise?.id)

  const addSet = async () => {
    if (!currentWeight || !currentReps || !currentExercise || !workoutId) return

    const newSetData: WorkoutSetCreate = {
      exercise_id: currentExercise.id,
      set_number: exerciseSets.length + 1,
      weight_lbs: parseFloat(currentWeight),
      reps: parseInt(currentReps),
      rpe: currentRpe ? parseInt(currentRpe) : undefined,
    }

    try {
      const createdSet = await api.workoutSets.create(workoutId, newSetData)
      setSets(prev => [...prev, createdSet])

      // Clear inputs for next set
      setCurrentReps('')
      setCurrentRpe('')
      // Keep weight for convenience

      setShowRestTimer(true)
    } catch (error) {
      console.error("Failed to add set:", error)
      // TODO: show error to user
    }
  }

  const removeSet = async (setId: string) => {
    if (!workoutId) return
    try {
      await api.workoutSets.delete(workoutId, setId)
      setSets(prev => prev.filter(set => set.id !== setId))
    } catch (error) {
      console.error("Failed to delete set:", error)
      // TODO: show error to user
    }
  }

  const handleRestTimerComplete = () => {
    setShowRestTimer(false)
  }

  const nextExercise = () => {
    if (currentExerciseIndex < workoutQueue.length - 1) {
      const newIndex = currentExerciseIndex + 1
      setCurrentExerciseIndex(newIndex)
      setCurrentWeight('')
      setCurrentReps('')
      setCurrentRpe('')
    }
  }

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1)
      setCurrentWeight('')
      setCurrentReps('')
      setCurrentRpe('')
    }
  }

  const finishWorkout = async () => {
    if (!workoutId || sets.length === 0) return

    try {
      await api.workouts.complete(workoutId)

      // Clean up the plan from localStorage
      localStorage.removeItem(`workout-plan-${workoutId}`)

      setIsWorkoutComplete(true)

      // Redirect to dashboard after a moment
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      console.error("Failed to complete workout:", error)
      // TODO: show error to user
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="h-12 w-12 text-[#A1A1A3] mx-auto mb-4 animate-pulse" />
          <p className="text-[#A1A1A3]">Loading workout...</p>
        </div>
      </div>
    )
  }

  if (isWorkoutComplete) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <Card className="bg-[#1C1C1E] border-[#2C2C2E] max-w-md w-full text-center">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-[#FF375F] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Workout Complete!</h2>
            <p className="text-[#A1A1A3] mb-4">
              Great job! You completed {sets.length} sets across {workoutQueue.length} exercises.
            </p>
            <p className="text-[#A1A1A3]">
              Duration: {formatTime(elapsedTime)}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentExercise) {
     return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="h-12 w-12 text-[#A1A1A3] mx-auto mb-4" />
          <p className="text-[#A1A1A3]">Could not load workout plan.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="sticky top-0 bg-[#121212]/95 backdrop-blur-sm border-b border-[#2C2C2E] z-10">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="text-[#A1A1A3] hover:text-white hover:bg-[#2C2C2E]"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          
          <div className="text-center">
            <h1 className="text-lg font-semibold">Workout</h1>
            <div className="flex items-center space-x-2 text-sm text-[#A1A1A3]">
              <Timer className="h-4 w-4" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
          </div>

          <Button
            onClick={finishWorkout}
            disabled={sets.length === 0}
            className="bg-[#FF375F] hover:bg-[#E63050] text-white text-sm px-3"
          >
            Finish
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#2C2C2E] h-1">
        <div 
          className="bg-[#FF375F] h-1 transition-all duration-300"
          style={{ width: `${((currentExerciseIndex + 1) / workoutQueue.length) * 100}%` }}
        />
      </div>

      <div className="p-4">
        {/* Current Exercise */}
        <Card className="bg-[#1C1C1E] border-[#2C2C2E] mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-white">{currentExercise.name}</CardTitle>
                <CardDescription className="flex items-center space-x-2 mt-1">
                  <span className="text-[#A1A1A3]">{currentExercise.equipment}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getDifficultyColor(currentExercise.difficulty)}`}
                  >
                    {currentExercise.difficulty}
                  </Badge>
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#A1A1A3]">Exercise</p>
                <p className="text-lg font-bold text-white">
                  {currentExerciseIndex + 1}/{workoutQueue.length}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Set Input */}
        <Card className="bg-[#1C1C1E] border-[#2C2C2E] mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              Add Set {exerciseSets.length + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-[#A1A1A3] mb-2 block">Weight (lbs)</label>
                <Input
                  type="number"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  placeholder="135"
                  className="bg-[#2C2C2E] border-[#3C3C3E] text-white"
                />
              </div>
              <div>
                <label className="text-sm text-[#A1A1A3] mb-2 block">Reps</label>
                <Input
                  type="number"
                  value={currentReps}
                  onChange={(e) => setCurrentReps(e.target.value)}
                  placeholder="10"
                  className="bg-[#2C2C2E] border-[#3C3C3E] text-white"
                />
              </div>
               <div>
                <label className="text-sm text-[#A1A1A3] mb-2 block">RPE</label>
                <Input
                  type="number"
                  value={currentRpe}
                  onChange={(e) => setCurrentRpe(e.target.value)}
                  placeholder="8"
                  className="bg-[#2C2C2E] border-[#3C3C3E] text-white"
                />
              </div>
            </div>
            
            <Button
              onClick={addSet}
              disabled={!currentWeight || !currentReps}
              className="w-full bg-[#FF375F] hover:bg-[#E63050] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Set
            </Button>
          </CardContent>
        </Card>

        {/* Rest Timer */}
        {showRestTimer && (
          <div className="mb-6">
            <RestTimer
              onComplete={handleRestTimerComplete}
              autoStart={true}
              className="mx-auto max-w-sm"
            />
          </div>
        )}

        {/* Sets List */}
        {exerciseSets.length > 0 && (
          <Card className="bg-[#1C1C1E] border-[#2C2C2E] mb-6">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                Sets Completed ({exerciseSets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {exerciseSets.map((set, index) => (
                  <div key={set.id} className="flex items-center justify-between p-3 bg-[#2C2C2E] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-[#FF375F]" />
                      <span className="text-white">
                        Set {index + 1}: {set.weight_lbs} lbs × {set.reps} reps {set.rpe && ` @ RPE ${set.rpe}`}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSet(set.id)}
                      className="text-[#A1A1A3] hover:text-[#FF375F]"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={previousExercise}
            disabled={currentExerciseIndex === 0}
            className="flex-1 bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white border-[#3C3C3E]"
          >
            Previous
          </Button>
          <Button
            onClick={nextExercise}
            disabled={currentExerciseIndex === workoutQueue.length - 1}
            className="flex-1 bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white"
          >
            Next Exercise
          </Button>
        </div>
      </div>
    </div>
  )
}