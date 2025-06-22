export interface Exercise {
  id: string
  name: string
  category: string
  equipment: string
  difficulty: string
  muscleEngagement: Record<string, number>
}

/**
 * Select exercises while keeping overall muscle group distribution balanced.
 * This is a lightweight heuristic that prevents selecting too many exercises
 * for the same primary muscle group.
 */
export function selectExercisesBalanced(
  exercises: Exercise[],
  count: number
): Exercise[] {
  const selected: Exercise[] = []
  const muscleCounts: Record<string, number> = {}
  const candidates = [...exercises]

  // Shuffle to add randomness
  candidates.sort(() => Math.random() - 0.5)

  while (selected.length < count && candidates.length) {
    const ex = candidates.shift()!
    const muscles = Object.keys(ex.muscleEngagement || {})
    const minCount = Math.min(0, ...Object.values(muscleCounts))
    const isBalanced = muscles.some(m => (muscleCounts[m] || 0) <= minCount)

    if (isBalanced) {
      selected.push(ex)
      muscles.forEach(m => {
        muscleCounts[m] = (muscleCounts[m] || 0) + 1
      })
    }
  }

  // If we didn't reach the desired count, fill with remaining exercises
  while (selected.length < count && candidates.length) {
    selected.push(candidates.shift()!)
  }

  return selected
}
