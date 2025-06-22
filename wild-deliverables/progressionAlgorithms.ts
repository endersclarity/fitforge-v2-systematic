export interface WorkoutHistoryEntry {
  date: string
  exercise: string
  weight: number
  reps: number
}

export interface LinearOptions {
  weeklyIncrement: number
}

export function linearProgression(
  currentWeight: number,
  options: LinearOptions,
  weeks: number = 1
): number {
  return currentWeight + options.weeklyIncrement * weeks
}

export interface DoubleProgressionOptions {
  minReps: number
  maxReps: number
  weightIncrement: number
}

export function doubleProgression(
  currentWeight: number,
  currentReps: number,
  options: DoubleProgressionOptions
): { weight: number; reps: number } {
  if (currentReps < options.maxReps) {
    return {
      weight: currentWeight,
      reps: Math.min(currentReps + 1, options.maxReps),
    }
  }
  return {
    weight: currentWeight + options.weightIncrement,
    reps: options.minReps,
  }
}

export function percentageBasedProgression(
  weight: number,
  percentIncrease: number
): number {
  return Math.round(weight * (1 + percentIncrease / 100))
}

export function autoRegulation(
  targetRpe: number,
  actualRpe: number,
  weight: number
): number {
  const diff = targetRpe - actualRpe
  if (Math.abs(diff) < 0.5) {
    return weight
  }
  const adjustment = weight * 0.015 * diff
  return Math.max(weight + adjustment, 0)
}

export function periodizationSchedule(
  baseWeight: number,
  percentages: number[]
): number[] {
  return percentages.map((p) => Math.round(baseWeight * p))
}
