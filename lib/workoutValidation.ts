import { z } from 'zod';

export const workoutSetSchema = z.object({
  exerciseId: z.string().min(1, "Exercise must be selected"),
  weight: z.number()
    .min(0, "Weight must be positive")
    .max(500, "Weight cannot exceed 500 lbs")
    .refine(val => (val * 4) % 1 === 0, "Weight must be in 0.25 lb increments"),
  reps: z.number()
    .int("Reps must be whole numbers")
    .min(1, "Must do at least 1 rep")
    .max(50, "Reps cannot exceed 50"),
  notes: z.string().max(200, "Notes cannot exceed 200 characters").optional()
});

export type WorkoutSetFormData = z.infer<typeof workoutSetSchema>;

export const workoutSessionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  date: z.string().min(1, "Date is required")
});

export type WorkoutSessionFormData = z.infer<typeof workoutSessionSchema>;