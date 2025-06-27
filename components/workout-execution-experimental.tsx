'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Minus, Clock, CheckCircle, Dumbbell, Timer, MoreHorizontal, Zap, NotebookPen } from "lucide-react"
import { WorkoutPlan, PlannedSet } from '@/schemas/typescript-interfaces'
import { RestTimer } from './rest-timer'
import { RPERatingModal } from './rpe-rating-modal'
import { BatchRPEModal } from './batch-rpe-modal'
import { ExerciseReplacementModal } from './exercise-replacement-modal'
import { useRealTimeMuscleVolume } from '@/hooks/useRealTimeMuscleVolume'

interface WorkoutExercise {
  id: string
  name: string
  category: string
  equipment: string
  difficulty: string
}

interface EnhancedSetLog {
  id: string
  exerciseId: string
  weight: number
  reps: number
  completed: boolean
  timestamp: string
  rpe?: number  // Rate of Perceived Exertion (1-10)
  isWarmup?: boolean
  notes?: string
}

interface WorkoutSession {
  id: string
  name: string
  date: string
  startTime: string
  endTime?: string
  duration: number
  exercises: WorkoutExercise[]
  sets: EnhancedSetLog[]
  totalSets: number
  exerciseNotes: Record<string, string>  // Exercise ID -> Notes
}

export function WorkoutExecutionExperimental() {
  const router = useRouter()
  const [workoutQueue, setWorkoutQueue] = useState<WorkoutExercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [sets, setSets] = useState<EnhancedSetLog[]>([])
  const [currentWeight, setCurrentWeight] = useState('')
  const [currentReps, setCurrentReps] = useState('')
  const [isWarmupSet, setIsWarmupSet] = useState(false)
  const [setNotes, setSetNotes] = useState('')
  const [exerciseNotes, setExerciseNotes] = useState<Record<string, string>>({})
  const [startTime] = useState(new Date().toISOString())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false)
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [plannedSets, setPlannedSets] = useState<PlannedSet[]>([])
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [showRPEModal, setShowRPEModal] = useState(false)
  const [pendingSet, setPendingSet] = useState<EnhancedSetLog | null>(null)
  const [showBatchRPEModal, setShowBatchRPEModal] = useState(false)
  const [pendingBatchSets, setPendingBatchSets] = useState<number>(0)
  const [showExerciseMenu, setShowExerciseMenu] = useState(false)
  const [showReplaceModal, setShowReplaceModal] = useState(false)

  // Real-time muscle volume calculation
  const muscleVolumeData = useRealTimeMuscleVolume(
    workoutQueue.map((exercise, index) => ({
      ...exercise,
      plannedSets: sets
        .filter(set => set.exerciseId === exercise.id && set.completed)
        .map((set, setIndex) => ({
          id: set.id,
          exerciseId: set.exerciseId,
          setNumber: setIndex + 1,
          targetWeight: set.weight,
          targetReps: set.reps,
        }))
    }))
  )

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
    const savedSession = localStorage.getItem('fitforge-workout-session')
    if (savedSession) {
      const session = JSON.parse(savedSession)
      setWorkoutQueue(session.exercises || [])
      
      const savedPlan = localStorage.getItem('workout-plan')
      if (savedPlan) {
        const plan: WorkoutPlan = JSON.parse(savedPlan)
        setWorkoutPlan(plan)
        setPlannedSets(plan.plannedSets)
        
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
        router.push('/')
      }
    } else {
      router.push('/')
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

    const newSet: EnhancedSetLog = {
      id: `set_${Date.now()}_${Math.random()}`,
      exerciseId: currentExercise.id,
      weight: parseFloat(currentWeight),
      reps: parseInt(currentReps),
      completed: true,
      timestamp: new Date().toISOString(),
      isWarmup: isWarmupSet,
      notes: setNotes || undefined
    }

    // Store pending set for RPE rating
    setPendingSet(newSet)
    setShowRPEModal(true)
  }

  const completeSetWithRPE = (rpe: number) => {
    if (pendingSet) {
      const completedSet = { ...pendingSet, rpe }
      setSets(prev => [...prev, completedSet])
      
      // Auto-start rest timer after set completion
      setShowRestTimer(true)
      
      // Auto-populate next planned set values if available
      const nextSetNumber = exerciseSets.length + 2
      const nextPlannedSet = getCurrentPlannedSet(currentExercise.id, nextSetNumber)
      
      if (nextPlannedSet) {
        setCurrentWeight(nextPlannedSet.targetWeight.toString())
        setCurrentReps(nextPlannedSet.targetReps.toString())
      } else {
        setCurrentReps('')
      }
      
      // Reset form
      setSetNotes('')
      if (isWarmupSet) {
        setIsWarmupSet(false) // Auto-reset warm-up toggle
      }
    }
    
    setPendingSet(null)
    setShowRPEModal(false)
  }

  const logAllSets = () => {
    if (!currentWeight || !currentReps || !currentExercise) return
    
    const remainingPlannedSets = getExercisePlannedSets(currentExercise.id)
      .filter((_, index) => index >= exerciseSets.length)
    
    if (remainingPlannedSets.length === 0) return
    
    // Store the number of sets for batch RPE modal
    setPendingBatchSets(remainingPlannedSets.length)
    setShowBatchRPEModal(true)
  }

  const completeBatchSetsWithRPE = (rpe: number) => {
    if (!currentWeight || !currentReps || !currentExercise || pendingBatchSets === 0) return
    
    const remainingPlannedSets = getExercisePlannedSets(currentExercise.id)
      .filter((_, index) => index >= exerciseSets.length)
      .slice(0, pendingBatchSets)
    
    // Create all remaining sets with same weight/reps and chosen RPE
    const allSets: EnhancedSetLog[] = remainingPlannedSets.map((plannedSet, index) => ({
      id: `set_${Date.now()}_${Math.random()}_${index}`,
      exerciseId: currentExercise.id,
      weight: parseFloat(currentWeight),
      reps: parseInt(currentReps),
      completed: true,
      timestamp: new Date().toISOString(),
      isWarmup: false, // Log All Sets is for working sets
      rpe: rpe
    }))
    
    setSets(prev => [...prev, ...allSets])
    setShowRestTimer(true)
    
    // Clear inputs after logging all sets
    setCurrentWeight('')
    setCurrentReps('')
    
    // Reset batch modal state
    setShowBatchRPEModal(false)
    setPendingBatchSets(0)
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
      }
      setIsWarmupSet(false) // Reset warm-up for new exercise
    }
  }

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1)
      setCurrentWeight('')
      setCurrentReps('')
      setIsWarmupSet(false)
    }
  }

  const replaceExercise = (newExercise: WorkoutExercise) => {
    const updatedQueue = [...workoutQueue]
    updatedQueue[currentExerciseIndex] = newExercise
    setWorkoutQueue(updatedQueue)
    
    // Clear current inputs and sets for replaced exercise
    setCurrentWeight('')
    setCurrentReps('')
    setSets(prev => prev.filter(set => set.exerciseId !== currentExercise.id))
    
    setShowReplaceModal(false)
    setShowExerciseMenu(false)
  }

  const updateExerciseNotes = (notes: string) => {
    if (currentExercise) {
      setExerciseNotes(prev => ({
        ...prev,
        [currentExercise.id]: notes
      }))
    }
  }

  const finishWorkout = () => {
    if (sets.length === 0) return

    const endTime = new Date().toISOString()
    const duration = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000 / 60)

    const workoutSession: WorkoutSession = {
      id: `workout_${Date.now()}`,
      name: `Experimental Workout`,
      date: new Date().toISOString().split('T')[0],
      startTime,
      endTime,
      duration,
      exercises: workoutQueue,
      sets,
      totalSets: sets.length,
      exerciseNotes
    }

    const existingSessions = JSON.parse(localStorage.getItem('workoutSessions') || '[]')
    const updatedSessions = [...existingSessions, workoutSession]
    localStorage.setItem('workoutSessions', JSON.stringify(updatedSessions))

    localStorage.removeItem('fitforge-workout-session')
    localStorage.removeItem('workout-plan')

    setIsWorkoutComplete(true)

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

  const getRPEColor = (rpe: number) => {
    if (rpe <= 3) return 'text-green-400'
    if (rpe <= 6) return 'text-yellow-400'
    if (rpe <= 8) return 'text-orange-400'
    return 'text-red-400'
  }

  if (isWorkoutComplete) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <Card className="bg-[#1C1C1E] border-[#2C2C2E] max-w-md w-full text-center">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-[#FF375F] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Experimental Workout Complete!</h2>
            <p className="text-[#A1A1A3] mb-4">
              Great job! You completed {sets.length} sets across {workoutQueue.length} exercises with advanced tracking.
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
          <p className="text-[#A1A1A3]">Loading experimental workout...</p>
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
            <h1 className="text-lg font-semibold">Experimental Workout Execution</h1>
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

      {/* Real-time Muscle Fatigue Visualization */}
      <div className="p-4 pb-2">
        <Card className="bg-[#1C1C1E] border-[#2C2C2E]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[#A1A1A3] flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Real-time Muscle Fatigue
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-2" data-testid="muscle-fatigue-display">
              {muscleVolumeData.summary.length > 0 ? (
                muscleVolumeData.summary.slice(0, 6).map(({ muscle, intensity }) => (
                  <div key={muscle} className="text-center">
                    <div 
                      className={`h-2 rounded-full mb-1 ${
                        intensity === 'very_high' ? 'bg-red-500' :
                        intensity === 'high' ? 'bg-orange-500' :
                        intensity === 'medium' ? 'bg-yellow-500' :
                        intensity === 'low' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}
                      data-testid={`${muscle.toLowerCase()}-muscle-indicator`}
                      data-intensity={intensity}
                    />
                    <span className="text-xs text-[#A1A1A3]">
                      {muscle.replace('_', ' ')}
                    </span>
                  </div>
                ))
              ) : (
                // Show placeholder muscle groups when no volume data yet
                ['Chest', 'Shoulders', 'Back', 'Arms', 'Legs', 'Core'].map((muscle) => (
                  <div key={muscle} className="text-center">
                    <div 
                      className="h-2 rounded-full mb-1 bg-gray-500"
                      data-testid={`${muscle.toLowerCase()}-muscle-indicator`}
                      data-intensity="none"
                    />
                    <span className="text-xs text-[#A1A1A3]">
                      {muscle}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
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
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm text-[#A1A1A3]">Exercise</p>
                  <p className="text-lg font-bold text-white">
                    {currentExerciseIndex + 1}/{workoutQueue.length}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowExerciseMenu(!showExerciseMenu)}
                  className="text-[#A1A1A3] hover:text-white hover:bg-[#2C2C2E]"
                  data-testid="exercise-menu"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Exercise Menu */}
            {showExerciseMenu && (
              <div className="mt-4 p-3 bg-[#2C2C2E] rounded-lg space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplaceModal(true)}
                  className="w-full justify-start text-[#A1A1A3] hover:text-white"
                >
                  Replace Exercise
                </Button>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Exercise Notes */}
        <Card className="bg-[#1C1C1E] border-[#2C2C2E] mb-6">
          <CardHeader>
            <CardTitle className="text-sm text-[#A1A1A3] flex items-center">
              <NotebookPen className="h-4 w-4 mr-2" />
              Exercise Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Form cues, technique notes..."
              value={exerciseNotes[currentExercise?.id] || ''}
              onChange={(e) => updateExerciseNotes(e.target.value)}
              className="bg-[#2C2C2E] border-[#3C3C3E] text-white resize-none"
              rows={2}
              data-testid="exercise-notes"
            />
          </CardContent>
        </Card>

        {/* Planned Sets Preview with Log All Sets */}
        {workoutPlan && getExercisePlannedSets(currentExercise.id).length > 0 && (
          <Card className="bg-[#1C1C1E] border-[#2C2C2E] mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-white">Planned Workout</CardTitle>
                  <CardDescription className="text-[#A1A1A3]">
                    Your planned sets for this exercise
                  </CardDescription>
                </div>
                {/* Log All Sets Button */}
                {exerciseSets.length < getExercisePlannedSets(currentExercise.id).length && 
                 currentWeight && currentReps && (
                  <Button
                    onClick={logAllSets}
                    className="bg-[#FF375F] hover:bg-[#E63050] text-white text-sm"
                  >
                    Log All Sets
                  </Button>
                )}
              </div>
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
                        <div className="text-sm flex items-center space-x-2">
                          <span className="text-green-400">
                            {currentExercise.equipment !== 'Bodyweight' && (
                              <span>{actualSet.weight} lb × </span>
                            )}
                            <span>{actualSet.reps} reps</span>
                          </span>
                          {actualSet.rpe && (
                            <span className={`text-xs ${getRPEColor(actualSet.rpe)}`}>
                              RPE {actualSet.rpe}
                            </span>
                          )}
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">
                {(() => {
                  const nextSetNumber = exerciseSets.length + 1
                  const plannedSet = getCurrentPlannedSet(currentExercise.id, nextSetNumber)
                  return plannedSet ? `Set ${nextSetNumber} (Planned: ${
                    currentExercise.equipment !== 'Bodyweight' ? `${plannedSet.targetWeight} lb × ` : ''
                  }${plannedSet.targetReps} reps)` : `Add Set ${nextSetNumber}`
                })()}
              </CardTitle>
              {/* Warm-up Toggle */}
              <Button
                variant={isWarmupSet ? "default" : "outline"}
                size="sm"
                onClick={() => setIsWarmupSet(!isWarmupSet)}
                className={`text-xs ${
                  isWarmupSet 
                    ? "bg-[#FF375F] text-white" 
                    : "bg-[#2C2C2E] border-[#3C3C3E] text-[#A1A1A3] hover:bg-[#3C3C3E] hover:text-white"
                }`}
                data-testid="warmup-toggle"
              >
                Warm-up Set
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Weight and Reps Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#A1A1A3] mb-2 block">
                  Weight ({currentExercise.equipment === 'Bodyweight' ? 'lbs added' : 'lbs'})
                </label>
                <Input
                  type="number"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  placeholder="135"
                  className="bg-[#2C2C2E] border-[#3C3C3E] text-white"
                  disabled={currentExercise.equipment === 'Bodyweight' && !isWarmupSet}
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

            {/* Set Notes */}
            <div>
              <label className="text-sm text-[#A1A1A3] mb-2 block">Set Notes (Optional)</label>
              <Input
                type="text"
                value={setNotes}
                onChange={(e) => setSetNotes(e.target.value)}
                placeholder="Form notes, how it felt..."
                className="bg-[#2C2C2E] border-[#3C3C3E] text-white"
                data-testid="set-notes-input"
              />
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
              disabled={!currentReps || (currentExercise.equipment !== 'Bodyweight' && !currentWeight)}
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
            <CardContent data-testid="set-list">
              <div className="space-y-2">
                {exerciseSets.map((set, index) => (
                  <div key={set.id} className="flex items-center justify-between p-3 bg-[#2C2C2E] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-[#FF375F]" />
                      <div>
                        <div className="text-white flex items-center space-x-2">
                          <span>
                            Set {index + 1}: {currentExercise.equipment !== 'Bodyweight' ? `${set.weight} lbs × ` : ''}{set.reps} reps
                          </span>
                          {set.isWarmup && (
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              data-testid="warmup-badge"
                            >
                              Warm-up
                            </Badge>
                          )}
                          {set.rpe && (
                            <span className={`text-xs ${getRPEColor(set.rpe)}`}>
                              RPE {set.rpe}
                            </span>
                          )}
                        </div>
                        {set.notes && (
                          <p className="text-sm text-[#A1A1A3] mt-1">{set.notes}</p>
                        )}
                      </div>
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

      {/* RPE Rating Modal */}
      {showRPEModal && pendingSet && (
        <RPERatingModal
          isOpen={showRPEModal}
          onClose={() => {
            setShowRPEModal(false)
            setPendingSet(null)
          }}
          onSubmit={completeSetWithRPE}
          setDetails={{
            weight: pendingSet.weight,
            reps: pendingSet.reps,
            exercise: currentExercise.name
          }}
        />
      )}

      {/* Batch RPE Rating Modal */}
      {showBatchRPEModal && (
        <BatchRPEModal
          isOpen={showBatchRPEModal}
          onClose={() => {
            setShowBatchRPEModal(false)
            setPendingBatchSets(0)
          }}
          onSubmit={completeBatchSetsWithRPE}
          setCount={pendingBatchSets}
          weight={parseFloat(currentWeight)}
          reps={parseInt(currentReps)}
          exerciseName={currentExercise.name}
        />
      )}

      {/* Exercise Replacement Modal */}
      {showReplaceModal && (
        <ExerciseReplacementModal
          isOpen={showReplaceModal}
          onClose={() => setShowReplaceModal(false)}
          onReplace={replaceExercise}
          currentExercise={currentExercise}
        />
      )}
    </div>
  )
}