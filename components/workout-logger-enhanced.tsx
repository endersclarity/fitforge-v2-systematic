'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Minus, Clock, CheckCircle, Dumbbell, Timer } from "lucide-react"
import { WorkoutPlan, PlannedSet } from '@/schemas/typescript-interfaces'
import { RestTimer } from './rest-timer'

interface WorkoutExercise {
  id: string
  name: string
  category: string
  equipment: string
  difficulty: string
}

interface SetLog {
  id: string
  exerciseId: string
  weight: number
  reps: number
  completed: boolean
  timestamp: string
}

interface WorkoutSession {
  id: string
  name: string
  date: string
  startTime: string
  endTime?: string
  duration: number
  exercises: WorkoutExercise[]
  sets: SetLog[]
  totalSets: number
}

export function WorkoutLoggerEnhanced() {
  const router = useRouter()
  const [workoutQueue, setWorkoutQueue] = useState<WorkoutExercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [sets, setSets] = useState<SetLog[]>([])
  const [currentWeight, setCurrentWeight] = useState('')
  const [currentReps, setCurrentReps] = useState('')
  const [startTime] = useState(new Date().toISOString())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false)
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [plannedSets, setPlannedSets] = useState<PlannedSet[]>([])
  const [showRestTimer, setShowRestTimer] = useState(false)

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

  // Load workout queue and planned sets on mount
  useEffect(() => {
    // First try the new format from pull/push/legs pages
    const savedSession = localStorage.getItem('fitforge-workout-session')
    if (savedSession) {
      const session = JSON.parse(savedSession)
      setWorkoutQueue(session.exercises || [])
      
      // Load planned workout if available
      const savedPlan = localStorage.getItem('workout-plan')
      if (savedPlan) {
        const plan: WorkoutPlan = JSON.parse(savedPlan)
        setWorkoutPlan(plan)
        setPlannedSets(plan.plannedSets)
        
        // Set initial weight/reps from first planned set if available
        if (plan.plannedSets.length > 0 && session.exercises.length > 0) {
          const firstExercisePlannedSets = plan.plannedSets.filter(set => set.exerciseId === session.exercises[0].id)
          if (firstExercisePlannedSets.length > 0) {
            const firstSet = firstExercisePlannedSets[0]
            setCurrentWeight(firstSet.targetWeight.toString())
            setCurrentReps(firstSet.targetReps.toString())
          }
        }
      }
      
      if (session.exercises.length === 0) {
        // No exercises selected, redirect back
        router.push('/')
      }
    } else {
      // Fallback to legacy workoutQueue format
      const savedQueue = localStorage.getItem('workoutQueue')
      if (savedQueue) {
        const queue = JSON.parse(savedQueue)
        setWorkoutQueue(queue)
        
        if (queue.length === 0) {
          router.push('/')
        }
      } else {
        router.push('/')
      }
    }
  }, [router])

  // Get planned values for current exercise and set
  const getCurrentPlannedSet = (exerciseId: string, setNumber: number): PlannedSet | null => {
    return plannedSets.find(set => set.exerciseId === exerciseId && set.setNumber === setNumber) || null
  }

  const getExercisePlannedSets = (exerciseId: string): PlannedSet[] => {
    return plannedSets.filter(set => set.exerciseId === exerciseId).sort((a, b) => a.setNumber - b.setNumber)
  }

  const currentExercise = workoutQueue[currentExerciseIndex]
  const exerciseSets = sets.filter(set => set.exerciseId === currentExercise?.id)

  const addSet = () => {
    if (!currentWeight || !currentReps || !currentExercise) return

    const newSet: SetLog = {
      id: `set_${Date.now()}_${Math.random()}`,
      exerciseId: currentExercise.id,
      weight: parseFloat(currentWeight),
      reps: parseInt(currentReps),
      completed: true,
      timestamp: new Date().toISOString()
    }

    setSets(prev => [...prev, newSet])
    
    // Auto-start rest timer after set completion
    setShowRestTimer(true)
    
    // Auto-populate next planned set values if available
    const nextSetNumber = exerciseSets.length + 2 // +2 because we just added one
    const nextPlannedSet = getCurrentPlannedSet(currentExercise.id, nextSetNumber)
    
    if (nextPlannedSet) {
      setCurrentWeight(nextPlannedSet.targetWeight.toString())
      setCurrentReps(nextPlannedSet.targetReps.toString())
    } else {
      setCurrentReps('')
      // Keep weight for convenience if no planned set
    }
  }

  const removeSet = (setId: string) => {
    setSets(prev => prev.filter(set => set.id !== setId))
  }

  const handleRestTimerComplete = () => {
    setShowRestTimer(false)
  }

  const nextExercise = () => {
    if (currentExerciseIndex < workoutQueue.length - 1) {
      const newIndex = currentExerciseIndex + 1
      setCurrentExerciseIndex(newIndex)
      
      // Load planned values for first set of next exercise
      const nextExercise = workoutQueue[newIndex]
      if (nextExercise) {
        const firstPlannedSet = getCurrentPlannedSet(nextExercise.id, 1)
        if (firstPlannedSet) {
          setCurrentWeight(firstPlannedSet.targetWeight.toString())
          setCurrentReps(firstPlannedSet.targetReps.toString())
        } else {
          setCurrentWeight('')
          setCurrentReps('')
        }
      } else {
        setCurrentWeight('')
        setCurrentReps('')
      }
    }
  }

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1)
      setCurrentWeight('')
      setCurrentReps('')
    }
  }

  const finishWorkout = () => {
    if (sets.length === 0) return

    const endTime = new Date().toISOString()
    const duration = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000 / 60)

    const workoutSession: WorkoutSession = {
      id: `workout_${Date.now()}`,
      name: `Custom Workout`,
      date: new Date().toISOString().split('T')[0],
      startTime,
      endTime,
      duration,
      exercises: workoutQueue,
      sets,
      totalSets: sets.length
    }

    // Save to localStorage
    const existingSessions = JSON.parse(localStorage.getItem('workoutSessions') || '[]')
    const updatedSessions = [...existingSessions, workoutSession]
    localStorage.setItem('workoutSessions', JSON.stringify(updatedSessions))

    // Clear workout queue
    localStorage.removeItem('workoutQueue')

    setIsWorkoutComplete(true)

    // Redirect to dashboard after a moment
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
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
          <p className="text-[#A1A1A3]">Loading workout...</p>
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
            <h1 className="text-lg font-semibold">Custom Workout</h1>
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

        {/* Planned Sets Preview */}
        {workoutPlan && getExercisePlannedSets(currentExercise.id).length > 0 && (
          <Card className="bg-[#1C1C1E] border-[#2C2C2E] mb-6">
            <CardHeader>
              <CardTitle className="text-lg text-white">Planned Workout</CardTitle>
              <CardDescription className="text-[#A1A1A3]">
                Your planned sets for this exercise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getExercisePlannedSets(currentExercise.id).map((plannedSet, index) => {
                  const isCompleted = exerciseSets.length > index
                  const actualSet = exerciseSets[index]
                  
                  return (
                    <div key={plannedSet.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                      isCompleted 
                        ? 'bg-[#1E3A1E] border-green-800/30' 
                        : 'bg-[#2C2C2E] border-[#3C3C3E]'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-white">Set {plannedSet.setNumber}</span>
                        <div className="text-sm text-[#A1A1A3]">
                          {currentExercise.equipment !== 'Bodyweight' && (
                            <span>{plannedSet.targetWeight} lb × </span>
                          )}
                          <span>{plannedSet.targetReps} reps</span>
                        </div>
                      </div>
                      
                      {isCompleted && actualSet && (
                        <div className="text-sm">
                          <span className="text-green-400">
                            {currentExercise.equipment !== 'Bodyweight' && (
                              <span>{actualSet.weight} lb × </span>
                            )}
                            <span>{actualSet.reps} reps</span>
                          </span>
                        </div>
                      )}
                      
                      {!isCompleted && exerciseSets.length === index && (
                        <Badge className="bg-[#FF375F] text-white text-xs">Current</Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Set Input */}
        <Card className="bg-[#1C1C1E] border-[#2C2C2E] mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              {(() => {
                const nextSetNumber = exerciseSets.length + 1
                const plannedSet = getCurrentPlannedSet(currentExercise.id, nextSetNumber)
                return plannedSet ? `Set ${nextSetNumber} (Planned: ${
                  currentExercise.equipment !== 'Bodyweight' ? `${plannedSet.targetWeight} lb × ` : ''
                }${plannedSet.targetReps} reps)` : `Add Set ${nextSetNumber}`
              })()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            
            {/* Quick Fill Planned Values Button */}
            {(() => {
              const nextSetNumber = exerciseSets.length + 1
              const plannedSet = getCurrentPlannedSet(currentExercise.id, nextSetNumber)
              return plannedSet ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentWeight(plannedSet.targetWeight.toString())
                    setCurrentReps(plannedSet.targetReps.toString())
                  }}
                  className="w-full bg-[#2C2C2E] border-[#3C3C3E] text-[#A1A1A3] hover:bg-[#3C3C3E] hover:text-white"
                >
                  Use Planned Values ({currentExercise.equipment !== 'Bodyweight' ? `${plannedSet.targetWeight} lb × ` : ''}{plannedSet.targetReps} reps)
                </Button>
              ) : null
            })()}
            
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
                        Set {index + 1}: {set.weight} lbs × {set.reps} reps
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