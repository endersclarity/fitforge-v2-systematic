'use client'

import { WorkoutExecutionExperimental } from '@/components/workout-execution-experimental'

/**
 * Experimental Workout Execution Page
 * 
 * Advanced workout execution interface with experimental features:
 * - RPE (Rate of Perceived Exertion) ratings after each set
 * - "Log All Sets" quick action for consistent workouts
 * - Exercise replacement mid-workout
 * - Warm-up vs working set distinction
 * - Exercise and set notes
 * - Real-time muscle fatigue visualization
 * 
 * Based on Fitbod's comprehensive 15-screen set logging flow patterns.
 */
export default function ExperimentalWorkoutExecutionPage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-md mx-auto">
        <h1 className="sr-only">Experimental Workout Execution</h1>
        <WorkoutExecutionExperimental />
      </div>
    </div>
  )
}