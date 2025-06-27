/**
 * Workout Builder Constants
 * Centralized configuration values to eliminate hardcoded magic numbers
 */

export const WORKOUT_DEFAULTS = {
  // Default exercise configuration
  SETS: 3,
  REPS: 8,
  DEFAULT_WEIGHT: 135, // Default weight for non-bodyweight exercises (lbs)
  BODYWEIGHT_WEIGHT: 0, // Weight for bodyweight exercises
  REST_TIME: 90, // Default rest time in seconds
} as const;

export const REST_TIME_OPTIONS = [
  { value: 60, label: '60s' },
  { value: 90, label: '90s' },
  { value: 120, label: '2m' },
  { value: 180, label: '3m' },
] as const;

export const WEIGHT_LIMITS = {
  MIN: 0,
  MAX: 1000, // Maximum reasonable weight in lbs
  STEP: 2.5, // Weight increment step
} as const;

export const REP_LIMITS = {
  MIN: 1,
  MAX: 50, // Maximum reasonable reps
} as const;

export const SET_LIMITS = {
  MIN: 1,
  MAX: 10, // Maximum reasonable sets
} as const;