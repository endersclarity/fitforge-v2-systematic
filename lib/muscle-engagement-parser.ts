export interface MuscleEngagement {
  name: string
  percentage: number
  category: 'primary' | 'secondary' | 'stabilizer'
}

export interface ParsedMuscleData {
  primary: MuscleEngagement[]      // >50%
  secondary: MuscleEngagement[]    // 20-50%
  stabilizer: MuscleEngagement[]   // <20%
  total: MuscleEngagement[]
}

export function parseMuscleEngagement(musclesUsedString: string): ParsedMuscleData {
  if (!musclesUsedString) {
    return { primary: [], secondary: [], stabilizer: [], total: [] }
  }

  // Parse "Pectoralis_Major:_85%,_Triceps_Brachii:_25%,_Anterior_Deltoids:_30%"
  const muscles: MuscleEngagement[] = musclesUsedString
    .split(',')
    .map(muscle => muscle.trim())
    .filter(muscle => muscle.includes(':_') && muscle.includes('%'))
    .map(muscle => {
      const [nameRaw, percentageRaw] = muscle.split(':_')
      const name = nameRaw.replace(/_/g, ' ').trim()
      const percentage = parseInt(percentageRaw.replace('%', '').trim())
      
      const category: MuscleEngagement['category'] = 
        percentage > 50 ? 'primary' :
        percentage >= 20 ? 'secondary' : 'stabilizer'
      
      return { name, percentage, category }
    })
    .filter(muscle => !isNaN(muscle.percentage))
    .sort((a, b) => b.percentage - a.percentage) // Sort by engagement descending

  return {
    primary: muscles.filter(m => m.category === 'primary'),
    secondary: muscles.filter(m => m.category === 'secondary'), 
    stabilizer: muscles.filter(m => m.category === 'stabilizer'),
    total: muscles
  }
}

// Performance optimization: Create a Map for O(1) exercise data lookups
export function createExerciseDataMap(exerciseData: any[]): Map<string, any> {
  return new Map(
    exerciseData.map(item => {
      const key = item.Exercise_Name.replace(/_/g, ' ')
      return [key, item]
    })
  )
}

// Helper function to get muscle data for a specific exercise
export function getMuscleDataForExercise(
  exerciseName: string, 
  exerciseDataMap: Map<string, any>
): ParsedMuscleData {
  const enhancedData = exerciseDataMap.get(exerciseName)
  
  if (!enhancedData?.Muscles_Used) {
    return { primary: [], secondary: [], stabilizer: [], total: [] }
  }
  
  return parseMuscleEngagement(enhancedData.Muscles_Used)
}