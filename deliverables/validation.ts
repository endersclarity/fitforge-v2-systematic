import { z } from 'zod'

export const workoutSetSchema = z.object({
  exerciseId: z.string().min(1, 'Exercise is required'),
  weight: z
    .number({ invalid_type_error: 'Weight must be a number' })
    .min(0, 'Weight must be at least 0')
    .max(500, 'Weight must be 500 or less')
    .refine(val => Number.isFinite(val) && val % 0.25 === 0, {
      message: 'Weight must be in 0.25 lb increments'
    }),
  reps: z
    .number({ invalid_type_error: 'Reps must be a number' })
    .int('Reps must be an integer')
    .min(1, 'Reps must be at least 1')
    .max(50, 'Reps must be 50 or less')
})

export type WorkoutSetInput = z.infer<typeof workoutSetSchema>
