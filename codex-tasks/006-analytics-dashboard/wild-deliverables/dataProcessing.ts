export interface WorkoutSet {
  exercise: string
  weight: number
  reps: number
  date: string
  muscles: Record<string, number>
}

export function groupByDate(data: WorkoutSet[]) {
  const map: Record<string, { volume: number; exercises: number }> = {}
  data.forEach(item => {
    if (!map[item.date]) {
      map[item.date] = { volume: 0, exercises: 0 }
    }
    map[item.date].volume += item.weight * item.reps
    map[item.date].exercises += 1
  })
  return Object.entries(map).map(([date, vals]) => ({ date, ...vals }))
}

export function muscleBalance(data: WorkoutSet[]) {
  const muscleMap: Record<string, number> = {}
  data.forEach(item => {
    Object.entries(item.muscles).forEach(([muscle, pct]) => {
      muscleMap[muscle] = (muscleMap[muscle] || 0) + pct
    })
  })
  return Object.entries(muscleMap).map(([muscle, engagement]) => ({ muscle, engagement }))
}
