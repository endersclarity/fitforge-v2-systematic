import { WorkoutHistoryEntry } from './progressionAlgorithms'

export function detectPlateau(
  history: WorkoutHistoryEntry[],
  window: number = 3,
  threshold: number = 0.5
): boolean {
  if (history.length < window + 1) return false
  const recent = history.slice(-window - 1)
  const first = recent[0]
  const last = recent[recent.length - 1]
  const weightDiff = last.weight - first.weight
  const repDiff = last.reps - first.reps
  return weightDiff <= threshold && repDiff <= 0
}

export function recommendedDeload(
  history: WorkoutHistoryEntry[],
  plateauWindow: number = 3
): boolean {
  return detectPlateau(history, plateauWindow)
}
