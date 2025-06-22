import { useState } from 'react'
import exercisesData from '../data/exercises.json'
import { WorkoutSetFormData } from '../lib/workoutValidation'

interface WorkoutSession {
  id: string
  name: string
  date: string
  duration: number
  exercises: any[]
  totalSets: number
}

export function useWorkoutLogger(userId: string) {
  const [exercises, setExercises] = useState<any[]>([])
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null)
  const [setCounters, setSetCounters] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)

  const loadExercises = () => {
    setExercises(exercisesData as any)
  }

  const getCurrentSession = () => {
    const stored = localStorage.getItem('currentWorkoutSession')
    if (stored) {
      try {
        const session: WorkoutSession = JSON.parse(stored)
        setCurrentSession(session)
        setSetCounters(
          session.exercises.reduce((acc: Record<string, number>, ex: any) => {
            acc[ex.id] = ex.sets.length
            return acc
          }, {})
        )
        setStartTime(new Date(session.date).getTime())
      } catch (err) {
        console.error('Failed to parse saved session', err)
      }
    }
  }

  const logSet = async (data: WorkoutSetFormData) => {
    setIsLoading(true)
    try {
      let session = currentSession
      let start = startTime
      if (!session) {
        start = Date.now()
        session = {
          id: Date.now().toString(),
          name: `Workout ${new Date().toLocaleDateString()}`,
          date: new Date(start).toISOString(),
          duration: 0,
          exercises: [],
          totalSets: 0
        }
      }
      let exercise = session.exercises.find((ex: any) => ex.id === data.exerciseId)
      if (!exercise) {
        const info = (exercises as any[]).find(ex => ex.id === data.exerciseId)
        exercise = { id: data.exerciseId, name: info?.name || '', category: info?.category || '', sets: [] }
        session.exercises.push(exercise)
      }
      exercise.sets.push({ ...data })
      session.totalSets += 1
      session.duration = Math.round((Date.now() - (start || Date.now())) / 60000)
      setCurrentSession({ ...session })
      setStartTime(start!)
      setSetCounters(prev => ({ ...prev, [data.exerciseId]: (prev[data.exerciseId] || 0) + 1 }))
      localStorage.setItem('currentWorkoutSession', JSON.stringify(session))
      return data
    } catch (err) {
      console.error('Failed to log set', err)
      setError('Failed to log set')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const clearSession = () => {
    if (!currentSession) return null
    const finished = {
      ...currentSession,
      duration: Math.round((Date.now() - (startTime || Date.now())) / 60000)
    }
    const sessions = JSON.parse(localStorage.getItem('workoutSessions') || '[]')
    sessions.push(finished)
    localStorage.setItem('workoutSessions', JSON.stringify(sessions))
    localStorage.removeItem('currentWorkoutSession')
    setCurrentSession(null)
    setSetCounters({})
    setStartTime(null)
    return finished
  }

  return {
    currentSession,
    exercises,
    isLoading,
    error,
    setCounters,
    logSet,
    clearSession,
    loadExercises,
    getCurrentSession,
  }
}

