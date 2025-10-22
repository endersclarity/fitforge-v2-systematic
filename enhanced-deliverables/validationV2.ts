import { z } from 'zod'

export const WorkoutSetSchemaV2 = z.object({
  sessionId: z.string().uuid(),
  exerciseId: z.string().min(1, 'Exercise is required'),
  weight: z
    .number({ invalid_type_error: 'Enter a valid weight' })
    .min(0, 'Weight must be at least 0')
    .max(500, 'Weight limit is 500 lbs'),
  reps: z
    .number({ invalid_type_error: 'Enter a valid rep count' })
    .min(1, 'Reps must be at least 1')
    .max(50, 'Reps limit is 50'),
})

export type WorkoutSetV2 = z.infer<typeof WorkoutSetSchemaV2>
