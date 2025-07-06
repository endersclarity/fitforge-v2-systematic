import exercises from '../data/exercises.json'
import { Exercise, selectExercisesBalanced } from './muscleBalanceLogic'

export type Goal = 'strength' | 'hypertrophy' | 'endurance' | 'general'

export interface UserPreferences {
  goal: Goal
  equipment: string[]
  time: 30 | 45 | 60
  experience: 'Beginner' | 'Intermediate' | 'Advanced'
  focus?: string
}

export interface WorkoutPlan {
  push: Exercise[]
  pull: Exercise[]
  legs: Exercise[]
}

function filterByEquipment(list: Exercise[], equipment: string[]): Exercise[] {
  if (equipment.length === 0) return list as Exercise[]
  return list.filter(ex => {
    if (!ex.equipment) return true
    return (
      equipment.includes(ex.equipment) ||
      ex.equipment.toLowerCase() === 'bodyweight'
    )
  }) as Exercise[]
}

function filterByExperience(list: Exercise[], exp: string): Exercise[] {
  return list.filter(ex => {
    if (!ex.difficulty) return true
    if (exp === 'Advanced') return true
    if (exp === 'Intermediate') return ex.difficulty !== 'Advanced'
    return ex.difficulty === 'Beginner'
  }) as Exercise[]
}

function categorize(exercise: Exercise): 'push' | 'pull' | 'legs' {
  const cat = exercise.category.toLowerCase()
  if (cat.includes('chest') || cat.includes('triceps') || cat.includes('shoulder')) {
    return 'push'
  }
  if (cat.includes('back') || cat.includes('biceps')) {
    return 'pull'
  }
  return 'legs'
}

export function generateWorkoutPlan(prefs: UserPreferences): WorkoutPlan {
  const base = filterByEquipment(exercises as Exercise[], prefs.equipment)
  const eligible = filterByExperience(base, prefs.experience)

  const pushEx = eligible.filter(e => categorize(e) === 'push')
  const pullEx = eligible.filter(e => categorize(e) === 'pull')
  const legEx = eligible.filter(e => categorize(e) === 'legs')

  const exercisesPerGroup = prefs.time >= 60 ? 4 : prefs.time >= 45 ? 3 : 2

  return {
    push: selectExercisesBalanced(pushEx, exercisesPerGroup),
    pull: selectExercisesBalanced(pullEx, exercisesPerGroup),
    legs: selectExercisesBalanced(legEx, exercisesPerGroup)
  }
}
