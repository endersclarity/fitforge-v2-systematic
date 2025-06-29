'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Minus, Clock, CheckCircle, Dumbbell, Timer, MoreHorizontal, Zap, NotebookPen } from "lucide-react"
import { WorkoutPlan, PlannedSet, WorkoutExercise } from '@/schemas/typescript-interfaces'
import { RestTimer } from './rest-timer'
import { RPERatingModal } from './rpe-rating-modal'
import { BatchRPEModal } from './batch-rpe-modal'
import { ExerciseReplacementModal } from './exercise-replacement-modal'
import { useRealTimeMuscleVolume } from '@/hooks/useRealTimeMuscleVolume'
import { WorkoutHeader } from './workout-header'
import { SetLoggingForm } from './set-logging-form'
import { WorkoutProgress } from './workout-progress'
import { ExerciseQueue } from './exercise-queue'

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
      // Demo mode: Create sample workout for testing
      const demoWorkout = {
        exercises: [
          {
            id: 'bench_press',
            name: 'Bench Press',
            category: 'ChestTriceps',
            equipment: 'Barbell',
            difficulty: 'Intermediate'
          },
          {
            id: 'bicep_curl',
            name: 'Bicep Curl',
            category: 'BackBiceps',
            equipment: 'Dumbbell',
            difficulty: 'Beginner'
          }
        ]
      }
      setWorkoutQueue(demoWorkout.exercises)
      
      // Set demo localStorage for persistence
      localStorage.setItem('fitforge-workout-session', JSON.stringify(demoWorkout))
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

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
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
      <WorkoutHeader 
        elapsedTime={elapsedTime}
        onFinishWorkout={finishWorkout}
        isFinishDisabled={sets.length === 0}
      />

      {/* Workout Progress */}
      <WorkoutProgress
        currentExerciseIndex={currentExerciseIndex}
        workoutQueue={workoutQueue}
        currentExercise={currentExercise}
        muscleVolumeData={muscleVolumeData}
        exerciseNotes={exerciseNotes}
        showExerciseMenu={showExerciseMenu}
        setShowExerciseMenu={setShowExerciseMenu}
        setShowReplaceModal={setShowReplaceModal}
        updateExerciseNotes={updateExerciseNotes}
      />

      <div className="p-4">

        {/* Exercise Queue Component - Consolidated UI */}
        <ExerciseQueue
          currentExercise={currentExercise}
          exerciseSets={exerciseSets}
          workoutPlan={workoutPlan}
          currentWeight={currentWeight}
          currentReps={currentReps}
          currentExerciseIndex={currentExerciseIndex}
          workoutQueue={workoutQueue}
          getExercisePlannedSets={getExercisePlannedSets}
          logAllSets={logAllSets}
          removeSet={removeSet}
          getRPEColor={getRPEColor}
          previousExercise={previousExercise}
          nextExercise={nextExercise}
        />
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