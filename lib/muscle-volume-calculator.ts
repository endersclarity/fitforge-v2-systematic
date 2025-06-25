/**
 * Calculate total workout volume per muscle group from workout sessions
 */

interface WorkoutSet {
  id: string
  exerciseId: string
  weight: number
  reps: number
  notes?: string
}

interface Exercise {
  id: string
  name: string
  category: string
  muscleEngagement?: Record<string, number>
}

interface WorkoutSession {
  id: string
  date: string
  sets: WorkoutSet[]
}

export function calculateMuscleVolume(
  sessions: WorkoutSession[],
  exercises: Exercise[],
  daysBack: number = 7
): Record<string, number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysBack)

  const muscleVolume: Record<string, number> = {}

  // Filter recent sessions
  const recentSessions = sessions.filter(session => 
    new Date(session.date) >= cutoffDate
  )

  // Calculate volume per muscle group
  recentSessions.forEach(session => {
    if (!session.sets || !Array.isArray(session.sets)) return
    session.sets.forEach(set => {
      // Find the exercise
      const exercise = exercises.find(ex => ex.id === set.exerciseId)
      if (!exercise?.muscleEngagement) return

      // Calculate set volume (weight × reps)
      const setVolume = set.weight * set.reps

      // Distribute volume across engaged muscles based on engagement percentage
      Object.entries(exercise.muscleEngagement).forEach(([muscle, engagement]) => {
        const muscleVolume_contribution = (setVolume * engagement) / 100
        muscleVolume[muscle] = (muscleVolume[muscle] || 0) + muscleVolume_contribution
      })
    })
  })

  return muscleVolume
}

export function getMuscleIntensity(volume: number): number {
  // Convert volume to 0-10 intensity scale
  if (volume === 0) return 0
  if (volume < 100) return 2
  if (volume < 250) return 4
  if (volume < 500) return 6
  if (volume < 1000) return 8
  return 10
}

export function getRecentWorkoutData(): { sessions: WorkoutSession[], exercises: Exercise[] } {
  try {
    const sessions = JSON.parse(localStorage.getItem('workoutSessions') || '[]')
    const exercises = JSON.parse(localStorage.getItem('exercises') || '[]')
    
    // Ensure sessions is an array and has proper structure
    const validSessions = Array.isArray(sessions) ? sessions.filter(session => 
      session && typeof session === 'object' && session.id
    ) : []
    
    return { sessions: validSessions, exercises: Array.isArray(exercises) ? exercises : [] }
  } catch (error) {
    console.error('Error loading workout data:', error)
    return { sessions: [], exercises: [] }
  }
}