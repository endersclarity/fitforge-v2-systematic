export interface MusclePath {
  name: string
  path: string
}

export const frontMuscles: MusclePath[] = [
  { name: 'Chest', path: 'M 145 110 L 205 110 L 210 140 L 200 155 L 175 165 L 150 155 L 140 140 Z' },
  { name: 'Shoulders', path: 'M 120 95 L 145 95 L 150 115 L 145 125 L 125 120 L 115 105 Z' },
  { name: 'Biceps', path: 'M 115 125 L 130 125 L 135 145 L 130 165 L 120 165 L 110 145 Z' },
  { name: 'Forearms', path: 'M 105 190 L 120 190 L 115 210 L 105 210 L 100 200 Z' },
  { name: 'Core', path: 'M 160 165 L 190 165 L 188 185 L 186 205 L 184 225 L 175 235 L 166 225 L 164 205 L 162 185 Z' },
  { name: 'Quadriceps', path: 'M 145 255 L 175 255 L 170 280 L 168 305 L 165 330 L 155 335 L 152 305 L 150 280 Z' },
  { name: 'Calves', path: 'M 145 335 L 165 335 L 162 360 L 158 380 L 152 380 L 148 360 Z' }
]

export const backMuscles: MusclePath[] = [
  { name: 'Traps', path: 'M 140 60 L 210 60 L 220 90 L 205 120 L 175 130 L 145 120 L 130 90 Z' },
  { name: 'Rear Delts', path: 'M 115 95 L 140 95 L 145 110 L 140 125 L 120 120 L 110 105 Z' },
  { name: 'Triceps', path: 'M 110 125 L 125 125 L 130 145 L 125 165 L 115 165 L 105 145 Z' },
  { name: 'Rhomboids', path: 'M 165 120 L 185 120 L 180 140 L 175 145 L 170 140 Z' },
  { name: 'Lats', path: 'M 125 130 L 225 130 L 215 180 L 200 200 L 175 210 L 150 200 L 135 180 Z' },
  { name: 'Glutes', path: 'M 140 250 L 210 250 L 205 280 L 195 295 L 175 300 L 155 295 L 145 280 Z' },
  { name: 'Hamstrings', path: 'M 145 300 L 205 300 L 200 330 L 195 355 L 175 360 L 155 355 L 150 330 Z' },
  { name: 'Calves', path: 'M 150 360 L 200 360 L 195 375 L 190 385 L 180 390 L 170 390 L 160 385 L 155 375 Z' }
]
