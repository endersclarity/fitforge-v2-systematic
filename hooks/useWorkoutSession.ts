import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WorkoutPlan, PlannedSet, WorkoutExercise } from '@/schemas/typescript-interfaces'

interface EnhancedSetLog {
  id: string
  exerciseId: string
  weight: number
  reps: number
  completed: boolean
  timestamp: string
  rpe?: number
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
  exerciseNotes: Record<string, string>
}

export function useWorkoutSession() {
  const router = useRouter()
  const [workoutQueue, setWorkoutQueue] = useState<WorkoutExercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [startTime] = useState(new Date().toISOString())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false)
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [plannedSets, setPlannedSets] = useState<PlannedSet[]>([])
  const [exerciseNotes, setExerciseNotes] = useState<Record<string, string>>({})

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

  const getCurrentPlannedSet = (exerciseId: string, setNumber: number): PlannedSet | null => {
    return plannedSets.find(set => set.exerciseId === exerciseId && set.setNumber === setNumber) || null
  }

  const getExercisePlannedSets = (exerciseId: string): PlannedSet[] => {
    return plannedSets.filter(set => set.exerciseId === exerciseId).sort((a, b) => a.setNumber - b.setNumber)
  }

  const nextExercise = () => {
    if (currentExerciseIndex < workoutQueue.length - 1) {
      const newIndex = currentExerciseIndex + 1
      setCurrentExerciseIndex(newIndex)
      return newIndex
    }
    return currentExerciseIndex
  }

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      const newIndex = currentExerciseIndex - 1
      setCurrentExerciseIndex(newIndex)
      return newIndex
    }
    return currentExerciseIndex
  }

  const replaceExercise = (newExercise: WorkoutExercise) => {
    const updatedQueue = [...workoutQueue]
    updatedQueue[currentExerciseIndex] = newExercise
    setWorkoutQueue(updatedQueue)
    return updatedQueue
  }

  const updateExerciseNotes = (notes: string) => {
    const currentExercise = workoutQueue[currentExerciseIndex]
    if (currentExercise) {
      setExerciseNotes(prev => ({
        ...prev,
        [currentExercise.id]: notes
      }))
    }
  }

  const finishWorkout = (sets: EnhancedSetLog[]) => {
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

  const currentExercise = workoutQueue[currentExerciseIndex]

  return {
    // State
    workoutQueue,
    currentExerciseIndex,
    currentExercise,
    startTime,
    elapsedTime,
    isWorkoutComplete,
    workoutPlan,
    plannedSets,
    exerciseNotes,
    
    // Actions
    getCurrentPlannedSet,
    getExercisePlannedSets,
    nextExercise,
    previousExercise,
    replaceExercise,
    updateExerciseNotes,
    finishWorkout,
    formatTime,
    
    // Setters for child components
    setWorkoutQueue,
    setCurrentExerciseIndex,
    setExerciseNotes
  }
}