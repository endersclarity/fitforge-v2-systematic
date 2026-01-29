import { z } from 'zod'

export const workoutSetSchema = z.object({
  exerciseId: z.string().nonempty('Exercise is required'),
  weight: z
    .number({ invalid_type_error: 'Weight is required' })
    .min(0, 'Weight must be at least 0')
    .max(500, 'Weight must be 500 lbs or less')
    .refine((v) => Number.isInteger(v * 4), {
      message: 'Weight must be in 0.25 lb increments',
    }),
  reps: z
    .number({ invalid_type_error: 'Reps is required' })
    .int('Reps must be a whole number')
    .min(1, 'Reps must be at least 1')
    .max(50, 'Reps must be 50 or less'),
})

export type WorkoutSetInput = z.infer<typeof workoutSetSchema>
