export interface Exercise {
  id: string
  name: string
  category: string
  equipment?: string
  difficulty?: string
  muscleEngagement?: Record<string, number>
}

export interface FilterOptions {
  categories?: string[]
  equipment?: string[]
  difficulties?: string[]
  muscleGroups?: string[]
  favorites?: string[]
}

export function applyFilters(exercises: Exercise[], options: FilterOptions): Exercise[] {
  return exercises.filter(ex => {
    const categoryMatch = !options.categories || options.categories.length === 0 || options.categories.includes(ex.category)
    const equipmentMatch = !options.equipment || options.equipment.length === 0 || (ex.equipment && options.equipment.includes(ex.equipment))
    const difficultyMatch = !options.difficulties || options.difficulties.length === 0 || (ex.difficulty && options.difficulties.includes(ex.difficulty))
    const favoritesMatch = !options.favorites || options.favorites.length === 0 || options.favorites.includes(ex.id)
    const muscleGroupMatch = !options.muscleGroups || options.muscleGroups.length === 0 ||
      (ex.muscleEngagement && Object.keys(ex.muscleEngagement).some(m => options.muscleGroups!.includes(m)))
    return categoryMatch && equipmentMatch && difficultyMatch && favoritesMatch && muscleGroupMatch
  })
}
