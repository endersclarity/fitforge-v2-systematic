/**
 * Muscle anatomy path data for SVG visualization
 * Provides muscle groups, SVG paths, and utility functions for anatomical visualization
 */

// TypeScript interface for muscle path data
export interface MusclePath {
  scientificName: string
  name: string
  path: string
  group: 'Push' | 'Pull' | 'Legs' | 'Core'
  side?: 'left' | 'right'
}

// Front view muscle paths - Major muscle groups
export const frontMusclePaths: MusclePath[] = [
  // CHEST (Push)
  {
    scientificName: 'Pectoralis_Major',
    name: 'Chest',
    group: 'Push',
    path: 'M180 140 C 190 135, 210 135, 220 140 L 220 170 C 215 180, 185 180, 180 170 Z'
  },
  
  // SHOULDERS (Push)
  {
    scientificName: 'Deltoid_Anterior',
    name: 'Front Delts',
    group: 'Push',
    side: 'left',
    path: 'M160 130 C 170 125, 175 130, 170 140 L 165 145 C 160 145, 155 140, 160 130 Z'
  },
  {
    scientificName: 'Deltoid_Anterior',
    name: 'Front Delts', 
    group: 'Push',
    side: 'right',
    path: 'M240 130 C 245 140, 240 145, 235 145 L 230 140 C 225 130, 230 125, 240 130 Z'
  },
  
  // BICEPS (Pull)
  {
    scientificName: 'Biceps_Brachii',
    name: 'Biceps',
    group: 'Pull',
    side: 'left', 
    path: 'M150 150 C 155 145, 160 150, 158 170 L 155 175 C 150 175, 145 170, 150 150 Z'
  },
  {
    scientificName: 'Biceps_Brachii',
    name: 'Biceps',
    group: 'Pull',
    side: 'right',
    path: 'M245 175 C 240 170, 245 175, 250 150 C 255 170, 250 175, 242 170 L 245 175 Z'
  },
  
  // FOREARMS (Pull)
  {
    scientificName: 'Forearm_Flexors',
    name: 'Forearms',
    group: 'Pull',
    side: 'left',
    path: 'M145 180 C 150 175, 155 180, 153 200 L 150 205 C 145 205, 140 200, 145 180 Z'
  },
  {
    scientificName: 'Forearm_Flexors', 
    name: 'Forearms',
    group: 'Pull',
    side: 'right',
    path: 'M255 205 C 250 200, 255 205, 260 180 C 265 200, 260 205, 247 200 L 255 205 Z'
  },
  
  // ABS (Core)
  {
    scientificName: 'Rectus_Abdominis',
    name: 'Abs',
    group: 'Core',
    path: 'M185 185 C 195 180, 205 180, 215 185 L 215 220 C 210 225, 190 225, 185 220 Z'
  },
  
  // OBLIQUES (Core)
  {
    scientificName: 'Obliques',
    name: 'Obliques',
    group: 'Core',
    side: 'left',
    path: 'M170 190 C 175 185, 180 190, 178 210 L 175 215 C 170 215, 165 210, 170 190 Z'
  },
  {
    scientificName: 'Obliques',
    name: 'Obliques', 
    group: 'Core',
    side: 'right',
    path: 'M230 215 C 225 210, 230 215, 235 190 C 240 210, 235 215, 222 210 L 230 215 Z'
  },
  
  // QUADRICEPS (Legs)
  {
    scientificName: 'Quadriceps',
    name: 'Quads',
    group: 'Legs',
    side: 'left',
    path: 'M170 240 C 175 235, 180 240, 178 280 L 175 285 C 170 285, 165 280, 170 240 Z'
  },
  {
    scientificName: 'Quadriceps',
    name: 'Quads',
    group: 'Legs', 
    side: 'right',
    path: 'M230 285 C 225 280, 230 285, 235 240 C 240 280, 235 285, 222 280 L 230 285 Z'
  },
  
  // CALVES (Legs)
  {
    scientificName: 'Gastrocnemius',
    name: 'Calves',
    group: 'Legs',
    side: 'left',
    path: 'M172 300 C 177 295, 182 300, 180 330 L 177 335 C 172 335, 167 330, 172 300 Z'
  },
  {
    scientificName: 'Gastrocnemius',
    name: 'Calves',
    group: 'Legs',
    side: 'right', 
    path: 'M228 335 C 223 330, 228 335, 233 300 C 238 330, 233 335, 220 330 L 228 335 Z'
  }
]

// Back view muscle paths - Major muscle groups  
export const backMusclePaths: MusclePath[] = [
  // LATS (Pull)
  {
    scientificName: 'Latissimus_Dorsi',
    name: 'Lats',
    group: 'Pull',
    side: 'left',
    path: 'M160 150 C 170 145, 175 155, 170 180 L 165 185 C 155 185, 150 175, 160 150 Z'
  },
  {
    scientificName: 'Latissimus_Dorsi', 
    name: 'Lats',
    group: 'Pull',
    side: 'right',
    path: 'M245 185 C 235 175, 245 185, 250 150 C 255 175, 250 185, 240 180 L 245 185 Z'
  },
  
  // RHOMBOIDS/TRAPS (Pull)
  {
    scientificName: 'Rhomboids',
    name: 'Rhomboids',
    group: 'Pull',
    path: 'M185 140 C 195 135, 205 135, 215 140 L 215 165 C 210 170, 190 170, 185 165 Z'
  },
  
  // REAR DELTS (Pull)
  {
    scientificName: 'Deltoid_Posterior',
    name: 'Rear Delts',
    group: 'Pull',
    side: 'left',
    path: 'M155 130 C 165 125, 170 130, 165 140 L 160 145 C 155 145, 150 140, 155 130 Z'
  },
  {
    scientificName: 'Deltoid_Posterior',
    name: 'Rear Delts',
    group: 'Pull', 
    side: 'right',
    path: 'M245 145 C 240 140, 245 145, 250 130 C 255 140, 250 145, 240 140 L 245 145 Z'
  },
  
  // TRICEPS (Push)
  {
    scientificName: 'Triceps_Brachii',
    name: 'Triceps', 
    group: 'Push',
    side: 'left',
    path: 'M150 150 C 155 145, 160 150, 158 175 L 155 180 C 150 180, 145 175, 150 150 Z'
  },
  {
    scientificName: 'Triceps_Brachii',
    name: 'Triceps',
    group: 'Push',
    side: 'right',
    path: 'M250 180 C 245 175, 250 180, 255 150 C 260 175, 255 180, 242 175 L 250 180 Z'
  },
  
  // GLUTES (Legs)
  {
    scientificName: 'Gluteus_Maximus',
    name: 'Glutes',
    group: 'Legs',
    path: 'M180 200 C 190 195, 210 195, 220 200 L 220 225 C 215 230, 185 230, 180 225 Z'
  },
  
  // HAMSTRINGS (Legs)
  {
    scientificName: 'Hamstrings',
    name: 'Hamstrings',
    group: 'Legs',
    side: 'left', 
    path: 'M170 240 C 175 235, 180 240, 178 275 L 175 280 C 170 280, 165 275, 170 240 Z'
  },
  {
    scientificName: 'Hamstrings',
    name: 'Hamstrings',
    group: 'Legs',
    side: 'right',
    path: 'M230 280 C 225 275, 230 280, 235 240 C 240 275, 235 280, 222 275 L 230 280 Z'
  },
  
  // CALVES - BACK VIEW (Legs)
  {
    scientificName: 'Gastrocnemius',
    name: 'Calves',
    group: 'Legs',
    side: 'left',
    path: 'M172 295 C 177 290, 182 295, 180 325 L 177 330 C 172 330, 167 325, 172 295 Z'
  },
  {
    scientificName: 'Gastrocnemius',
    name: 'Calves', 
    group: 'Legs',
    side: 'right',
    path: 'M228 330 C 223 325, 228 330, 233 295 C 238 325, 233 330, 220 325 L 228 330 Z'
  }
]

// Color mapping for fatigue levels (0-100%)
export function getMuscleColor(fatigueLevel: number): string {
  // Input validation
  if (typeof fatigueLevel !== 'number' || isNaN(fatigueLevel)) {
    throw new Error('Fatigue level must be a valid number')
  }
  
  const clampedLevel = Math.max(0, Math.min(100, fatigueLevel))
  
  if (clampedLevel <= 20) return '#10B981' // Green - Recovered
  if (clampedLevel <= 40) return '#F59E0B' // Yellow - Light fatigue  
  if (clampedLevel <= 60) return '#FF8C42' // Orange - Moderate fatigue
  if (clampedLevel <= 80) return '#FF6B6B' // Red - High fatigue
  return '#FF375F' // Dark Red - Severe fatigue
}

// Utility function to get unique muscle names
export function getUniqueMuscleNames(): string[] {
  try {
    const allMuscles = [...frontMusclePaths, ...backMusclePaths]
    const uniqueNames = new Set(allMuscles.map(muscle => muscle.scientificName))
    return Array.from(uniqueNames).sort()
  } catch (error) {
    throw new Error('Failed to get unique muscle names: ' + error.message)
  }
}

// Utility function to get muscles by group
export function getMusclesByGroup(group: 'Push' | 'Pull' | 'Legs' | 'Core'): MusclePath[] {
  // Input validation
  if (!group || !['Push', 'Pull', 'Legs', 'Core'].includes(group)) {
    throw new Error('Group must be one of: Push, Pull, Legs, Core')
  }
  
  try {
    const allMuscles = [...frontMusclePaths, ...backMusclePaths]
    return allMuscles.filter(muscle => muscle.group === group)
  } catch (error) {
    throw new Error('Failed to get muscles by group: ' + error.message)
  }
}

// Human body outline paths for front and back views
export const bodyOutlineFront = 'M200 80 C 210 75, 230 85, 240 100 C 245 120, 250 140, 245 160 L 245 180 C 250 200, 255 220, 250 240 L 250 280 C 245 300, 240 320, 235 340 L 230 360 C 225 365, 220 365, 215 360 L 210 340 C 205 320, 200 300, 200 280 L 200 240 C 195 220, 190 200, 195 180 L 155 160 C 150 140, 155 120, 160 100 C 170 85, 190 75, 200 80 Z'

// Back view outline - anatomically different with shoulder blade prominence and spine curvature
export const bodyOutlineBack = 'M200 80 C 210 75, 230 85, 240 100 C 248 120, 252 140, 248 160 L 248 180 C 252 200, 255 220, 250 240 L 250 280 C 245 300, 240 320, 235 340 L 230 360 C 225 365, 220 365, 215 360 L 210 340 C 205 320, 200 300, 200 280 L 200 240 C 195 220, 188 200, 192 180 L 152 160 C 148 140, 152 120, 160 100 C 170 85, 190 75, 200 80 Z'