'use client'

import { WorkoutLoggerEnhanced } from '@/components/workout-logger-enhanced'

/**
 * Workout Execution Page
 * 
 * This page provides the main workout execution interface with:
 * - Real-time set logging with weight/reps input
 * - Auto-starting rest timer after set completion
 * - Progress tracking and workout navigation
 * - Integration with planned workout data from localStorage
 * 
 * Replaces the simple set-marking interface with the enhanced
 * workout logger that includes the rest timer functionality.
 */
export default function WorkoutExecutionPage() {
  return <WorkoutLoggerEnhanced />
}