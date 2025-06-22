/**
 * Anatomically accurate SVG path definitions for all major muscle groups
 * Coordinates based on a 400x600 viewBox for detailed visualization
 */

export interface MusclePath {
  name: string
  scientificName: string
  group: 'Push' | 'Pull' | 'Legs' | 'Core' | 'Arms' | 'Shoulders'
  path: string
  side?: 'left' | 'right' | 'center'
}

// Front view muscle paths
export const frontMusclePaths: MusclePath[] = [
  // Head and Neck
  {
    name: "Neck",
    scientificName: "Sternocleidomastoid",
    group: "Core",
    path: "M 190 80 L 200 80 L 200 100 L 195 110 L 190 100 Z",
    side: "center"
  },
  
  // Shoulders
  {
    name: "Front Deltoid",
    scientificName: "Anterior Deltoid",
    group: "Shoulders",
    path: "M 140 110 L 170 110 L 175 125 L 170 140 L 150 145 L 135 130 L 130 115 Z",
    side: "left"
  },
  {
    name: "Front Deltoid",
    scientificName: "Anterior Deltoid",
    group: "Shoulders",
    path: "M 230 110 L 260 110 L 270 115 L 265 130 L 250 145 L 230 140 L 225 125 Z",
    side: "right"
  },
  
  // Chest
  {
    name: "Upper Chest",
    scientificName: "Pectoralis Major (Clavicular)",
    group: "Push",
    path: "M 170 125 L 230 125 L 235 145 L 230 160 L 200 165 L 170 160 L 165 145 Z",
    side: "center"
  },
  {
    name: "Middle Chest",
    scientificName: "Pectoralis Major (Sternal)",
    group: "Push",
    path: "M 165 160 L 235 160 L 240 180 L 235 200 L 200 210 L 165 200 L 160 180 Z",
    side: "center"
  },
  {
    name: "Lower Chest",
    scientificName: "Pectoralis Major (Costal)",
    group: "Push",
    path: "M 170 200 L 230 200 L 225 215 L 200 220 L 175 215 Z",
    side: "center"
  },
  
  // Arms - Biceps
  {
    name: "Biceps",
    scientificName: "Biceps Brachii",
    group: "Arms",
    path: "M 130 145 L 145 145 L 150 170 L 145 195 L 135 195 L 125 170 Z",
    side: "left"
  },
  {
    name: "Biceps",
    scientificName: "Biceps Brachii",
    group: "Arms",
    path: "M 255 145 L 270 145 L 275 170 L 270 195 L 260 195 L 250 170 Z",
    side: "right"
  },
  {
    name: "Brachialis",
    scientificName: "Brachialis",
    group: "Arms",
    path: "M 125 195 L 140 195 L 135 210 L 130 210 Z",
    side: "left"
  },
  {
    name: "Brachialis",
    scientificName: "Brachialis",
    group: "Arms",
    path: "M 260 195 L 275 195 L 270 210 L 265 210 Z",
    side: "right"
  },
  
  // Forearms
  {
    name: "Forearms",
    scientificName: "Brachioradialis",
    group: "Arms",
    path: "M 125 210 L 135 210 L 130 240 L 125 250 L 120 240 Z",
    side: "left"
  },
  {
    name: "Forearms",
    scientificName: "Brachioradialis",
    group: "Arms",
    path: "M 265 210 L 275 210 L 280 240 L 275 250 L 270 240 Z",
    side: "right"
  },
  {
    name: "Grip",
    scientificName: "Flexor Carpi",
    group: "Arms",
    path: "M 120 250 L 130 250 L 125 265 L 120 265 Z",
    side: "left"
  },
  {
    name: "Grip",
    scientificName: "Flexor Carpi",
    group: "Arms",
    path: "M 270 250 L 280 250 L 275 265 L 270 265 Z",
    side: "right"
  },
  
  // Core
  {
    name: "Upper Abs",
    scientificName: "Rectus Abdominis (Upper)",
    group: "Core",
    path: "M 185 220 L 215 220 L 213 240 L 187 240 Z",
    side: "center"
  },
  {
    name: "Middle Abs",
    scientificName: "Rectus Abdominis (Middle)",
    group: "Core",
    path: "M 187 240 L 213 240 L 211 260 L 189 260 Z",
    side: "center"
  },
  {
    name: "Lower Abs",
    scientificName: "Rectus Abdominis (Lower)",
    group: "Core",
    path: "M 189 260 L 211 260 L 209 280 L 191 280 Z",
    side: "center"
  },
  {
    name: "Obliques",
    scientificName: "External Obliques",
    group: "Core",
    path: "M 160 220 L 185 220 L 187 240 L 189 260 L 191 280 L 175 285 L 165 265 L 162 240 Z",
    side: "left"
  },
  {
    name: "Obliques",
    scientificName: "External Obliques",
    group: "Core",
    path: "M 215 220 L 240 220 L 238 240 L 235 265 L 225 285 L 209 280 L 211 260 L 213 240 Z",
    side: "right"
  },
  {
    name: "Serratus",
    scientificName: "Serratus Anterior",
    group: "Core",
    path: "M 155 180 L 165 185 L 162 200 L 155 195 L 150 185 Z",
    side: "left"
  },
  {
    name: "Serratus",
    scientificName: "Serratus Anterior",
    group: "Core",
    path: "M 245 180 L 235 185 L 238 200 L 245 195 L 250 185 Z",
    side: "right"
  },
  
  // Hip Flexors
  {
    name: "Hip Flexors",
    scientificName: "Iliopsoas",
    group: "Core",
    path: "M 175 285 L 225 285 L 220 300 L 210 305 L 190 305 L 180 300 Z",
    side: "center"
  },
  
  // Quadriceps
  {
    name: "Quad Outer",
    scientificName: "Vastus Lateralis",
    group: "Legs",
    path: "M 155 305 L 175 305 L 170 340 L 165 375 L 155 380 L 150 345 L 152 320 Z",
    side: "left"
  },
  {
    name: "Quad Front",
    scientificName: "Rectus Femoris",
    group: "Legs",
    path: "M 175 305 L 195 305 L 193 340 L 190 375 L 185 380 L 180 380 L 175 375 L 172 340 Z",
    side: "left"
  },
  {
    name: "Quad Inner",
    scientificName: "Vastus Medialis",
    group: "Legs",
    path: "M 195 305 L 215 305 L 210 340 L 205 375 L 195 380 L 190 375 L 193 340 Z",
    side: "left"
  },
  {
    name: "Quad Outer",
    scientificName: "Vastus Lateralis",
    group: "Legs",
    path: "M 245 305 L 225 305 L 230 340 L 235 375 L 245 380 L 250 345 L 248 320 Z",
    side: "right"
  },
  {
    name: "Quad Front",
    scientificName: "Rectus Femoris",
    group: "Legs",
    path: "M 225 305 L 205 305 L 207 340 L 210 375 L 215 380 L 220 380 L 225 375 L 228 340 Z",
    side: "right"
  },
  {
    name: "Quad Inner",
    scientificName: "Vastus Medialis",
    group: "Legs",
    path: "M 205 305 L 185 305 L 190 340 L 195 375 L 205 380 L 210 375 L 207 340 Z",
    side: "right"
  },
  
  // Lower Legs
  {
    name: "Tibialis",
    scientificName: "Tibialis Anterior",
    group: "Legs",
    path: "M 160 385 L 170 385 L 168 420 L 165 445 L 160 445 L 158 420 Z",
    side: "left"
  },
  {
    name: "Tibialis",
    scientificName: "Tibialis Anterior",
    group: "Legs",
    path: "M 240 385 L 230 385 L 232 420 L 235 445 L 240 445 L 242 420 Z",
    side: "right"
  }
]

// Back view muscle paths
export const backMusclePaths: MusclePath[] = [
  // Upper Back/Neck
  {
    name: "Upper Traps",
    scientificName: "Trapezius (Upper)",
    group: "Pull",
    path: "M 160 80 L 240 80 L 250 100 L 240 120 L 200 130 L 160 120 L 150 100 Z",
    side: "center"
  },
  {
    name: "Mid Traps",
    scientificName: "Trapezius (Middle)",
    group: "Pull",
    path: "M 165 120 L 235 120 L 230 140 L 200 145 L 170 140 Z",
    side: "center"
  },
  {
    name: "Lower Traps",
    scientificName: "Trapezius (Lower)",
    group: "Pull",
    path: "M 175 140 L 225 140 L 200 160 Z",
    side: "center"
  },
  
  // Shoulders
  {
    name: "Rear Deltoid",
    scientificName: "Posterior Deltoid",
    group: "Shoulders",
    path: "M 135 115 L 160 115 L 165 130 L 160 145 L 140 140 L 130 125 Z",
    side: "left"
  },
  {
    name: "Rear Deltoid",
    scientificName: "Posterior Deltoid",
    group: "Shoulders",
    path: "M 265 115 L 240 115 L 235 130 L 240 145 L 260 140 L 270 125 Z",
    side: "right"
  },
  {
    name: "Rotator Cuff",
    scientificName: "Rotator Cuff",
    group: "Shoulders",
    path: "M 170 125 L 190 125 L 190 140 L 180 145 L 170 140 Z",
    side: "left"
  },
  {
    name: "Rotator Cuff",
    scientificName: "Rotator Cuff",
    group: "Shoulders",
    path: "M 230 125 L 210 125 L 210 140 L 220 145 L 230 140 Z",
    side: "right"
  },
  
  // Mid Back
  {
    name: "Rhomboids",
    scientificName: "Rhomboids",
    group: "Pull",
    path: "M 185 145 L 215 145 L 210 165 L 200 170 L 190 165 Z",
    side: "center"
  },
  {
    name: "Lats Upper",
    scientificName: "Latissimus Dorsi (Upper)",
    group: "Pull",
    path: "M 140 150 L 180 150 L 175 180 L 160 200 L 145 190 L 135 170 Z",
    side: "left"
  },
  {
    name: "Lats Upper",
    scientificName: "Latissimus Dorsi (Upper)",
    group: "Pull",
    path: "M 260 150 L 220 150 L 225 180 L 240 200 L 255 190 L 265 170 Z",
    side: "right"
  },
  {
    name: "Lats Lower",
    scientificName: "Latissimus Dorsi (Lower)",
    group: "Pull",
    path: "M 145 190 L 160 200 L 165 230 L 155 240 L 140 220 Z",
    side: "left"
  },
  {
    name: "Lats Lower",
    scientificName: "Latissimus Dorsi (Lower)",
    group: "Pull",
    path: "M 255 190 L 240 200 L 235 230 L 245 240 L 260 220 Z",
    side: "right"
  },
  
  // Arms - Triceps
  {
    name: "Triceps Long",
    scientificName: "Triceps Brachii (Long Head)",
    group: "Arms",
    path: "M 125 145 L 140 145 L 135 170 L 130 170 Z",
    side: "left"
  },
  {
    name: "Triceps Long",
    scientificName: "Triceps Brachii (Long Head)",
    group: "Arms",
    path: "M 275 145 L 260 145 L 265 170 L 270 170 Z",
    side: "right"
  },
  {
    name: "Triceps Lateral",
    scientificName: "Triceps Brachii (Lateral Head)",
    group: "Arms",
    path: "M 120 170 L 135 170 L 130 195 L 125 195 Z",
    side: "left"
  },
  {
    name: "Triceps Lateral",
    scientificName: "Triceps Brachii (Lateral Head)",
    group: "Arms",
    path: "M 280 170 L 265 170 L 270 195 L 275 195 Z",
    side: "right"
  },
  
  // Lower Back
  {
    name: "Lower Back",
    scientificName: "Erector Spinae",
    group: "Core",
    path: "M 180 230 L 220 230 L 218 260 L 215 280 L 200 285 L 185 280 L 182 260 Z",
    side: "center"
  },
  
  // Glutes
  {
    name: "Glute Max",
    scientificName: "Gluteus Maximus",
    group: "Legs",
    path: "M 160 285 L 240 285 L 235 315 L 225 330 L 200 335 L 175 330 L 165 315 Z",
    side: "center"
  },
  {
    name: "Glute Med",
    scientificName: "Gluteus Medius",
    group: "Legs",
    path: "M 150 290 L 165 285 L 170 300 L 165 310 L 155 305 Z",
    side: "left"
  },
  {
    name: "Glute Med",
    scientificName: "Gluteus Medius",
    group: "Legs",
    path: "M 250 290 L 235 285 L 230 300 L 235 310 L 245 305 Z",
    side: "right"
  },
  
  // Hamstrings
  {
    name: "Hamstring Outer",
    scientificName: "Biceps Femoris",
    group: "Legs",
    path: "M 165 335 L 180 335 L 175 370 L 170 395 L 160 395 L 165 370 Z",
    side: "left"
  },
  {
    name: "Hamstring Inner",
    scientificName: "Semitendinosus",
    group: "Legs",
    path: "M 180 335 L 195 335 L 190 370 L 185 395 L 175 395 L 180 370 Z",
    side: "left"
  },
  {
    name: "Hamstring Outer",
    scientificName: "Biceps Femoris",
    group: "Legs",
    path: "M 235 335 L 220 335 L 225 370 L 230 395 L 240 395 L 235 370 Z",
    side: "right"
  },
  {
    name: "Hamstring Inner",
    scientificName: "Semitendinosus",
    group: "Legs",
    path: "M 220 335 L 205 335 L 210 370 L 215 395 L 225 395 L 220 370 Z",
    side: "right"
  },
  
  // Calves
  {
    name: "Calf Outer",
    scientificName: "Gastrocnemius (Lateral)",
    group: "Legs",
    path: "M 165 400 L 180 400 L 177 425 L 173 445 L 168 445 L 165 425 Z",
    side: "left"
  },
  {
    name: "Calf Inner",
    scientificName: "Gastrocnemius (Medial)",
    group: "Legs",
    path: "M 180 400 L 195 400 L 192 425 L 188 445 L 183 445 L 180 425 Z",
    side: "left"
  },
  {
    name: "Calf Outer",
    scientificName: "Gastrocnemius (Lateral)",
    group: "Legs",
    path: "M 235 400 L 220 400 L 223 425 L 227 445 L 232 445 L 235 425 Z",
    side: "right"
  },
  {
    name: "Calf Inner",
    scientificName: "Gastrocnemius (Medial)",
    group: "Legs",
    path: "M 220 400 L 205 400 L 208 425 L 212 445 L 217 445 L 220 425 Z",
    side: "right"
  },
  {
    name: "Soleus",
    scientificName: "Soleus",
    group: "Legs",
    path: "M 170 440 L 190 440 L 187 455 L 183 465 L 177 465 L 173 455 Z",
    side: "left"
  },
  {
    name: "Soleus",
    scientificName: "Soleus",
    group: "Legs",
    path: "M 230 440 L 210 440 L 213 455 L 217 465 L 223 465 L 227 455 Z",
    side: "right"
  }
]

// Human body outline paths
export const bodyOutlineFront = `
  M 200 40 
  C 180 40, 170 55, 170 70
  L 170 85
  Q 150 90, 140 110
  L 130 140
  L 125 195
  L 120 250
  L 125 265
  L 120 275
  Q 160 290, 200 290
  Q 240 290, 280 275
  L 275 265
  L 280 250
  L 275 195
  L 270 140
  L 260 110
  Q 250 90, 230 85
  L 230 70
  C 230 55, 220 40, 200 40
  Z
  
  M 175 290
  L 170 380
  L 165 445
  L 170 465
  L 180 465
  L 185 445
  L 180 380
  
  M 225 290
  L 230 380
  L 235 445
  L 230 465
  L 220 465
  L 215 445
  L 220 380
`

export const bodyOutlineBack = `
  M 200 40 
  C 180 40, 170 55, 170 70
  L 170 85
  Q 150 90, 135 115
  L 125 145
  L 120 195
  L 125 250
  L 130 265
  L 125 275
  Q 165 290, 200 290
  Q 235 290, 275 275
  L 270 265
  L 275 250
  L 280 195
  L 275 145
  L 265 115
  Q 250 90, 230 85
  L 230 70
  C 230 55, 220 40, 200 40
  Z
  
  M 180 290
  L 175 335
  L 170 395
  L 165 445
  L 170 465
  L 180 465
  L 185 445
  L 180 395
  
  M 220 290
  L 225 335
  L 230 395
  L 235 445
  L 230 465
  L 220 465
  L 215 445
  L 220 395
`

// Helper function to get muscle color based on fatigue
export function getMuscleColor(fatiguePercentage: number): string {
  if (fatiguePercentage >= 80) return '#FF375F' // severe fatigue - red
  if (fatiguePercentage >= 60) return '#FF6B6B' // high fatigue - light red  
  if (fatiguePercentage >= 40) return '#FF8C42' // moderate fatigue - orange
  if (fatiguePercentage >= 20) return '#F59E0B' // light fatigue - yellow
  return '#10B981' // recovered - green
}

// Helper to get all unique muscle names
export function getUniqueMuscleNames(): string[] {
  const allMuscles = [...frontMusclePaths, ...backMusclePaths]
  const uniqueNames = new Set(allMuscles.map(m => m.scientificName))
  return Array.from(uniqueNames).sort()
}

// Helper to get muscles by group
export function getMusclesByGroup(group: MusclePath['group']): string[] {
  const allMuscles = [...frontMusclePaths, ...backMusclePaths]
  const musclesInGroup = allMuscles
    .filter(m => m.group === group)
    .map(m => m.scientificName)
  return Array.from(new Set(musclesInGroup)).sort()
}