# Module: AI Analytics

## Purpose & Responsibility
Implements sophisticated muscle fatigue analytics using 5-day recovery models, progressive overload calculations with 3% volume targeting, and AI-powered workout generation based on muscle engagement percentages and recovery patterns.

## Interfaces
* `FatigueAnalyzer`: Muscle recovery and fatigue calculation
  * `calculateMuscleVolume`: Process workout sessions to determine muscle engagement
  * `assessRecoveryStatus`: Evaluate muscle readiness based on 5-day recovery model
  * `predictOptimalWorkout`: Suggest exercises targeting recovered muscle groups
* `ProgressionPlanner`: Progressive overload optimization
  * `calculateVolumeProgression`: Determine weight/rep increases for 3% volume growth
  * `analyzePROpportunities`: Identify personal record breakthrough potential
  * `optimizeWorkoutSplit`: Balance muscle group distribution across workout days
* `WorkoutGenerator`: AI-powered routine creation
  * `generateWorkoutPlan`: Create balanced workouts based on available equipment
  * `suggestExerciseReplacements`: Recommend alternatives for unavailable equipment
  * `adaptToFatigueState`: Modify workout intensity based on muscle recovery
* Input: Workout history, exercise database, muscle engagement data, equipment availability
* Output: Fatigue assessments, progressive overload recommendations, generated workout plans

## Implementation Details
* Files:
  * `lib/ai/fatigue-analyzer.ts` - Core muscle fatigue calculation algorithms
  * `lib/ai/progression-planner.ts` - Progressive overload optimization logic
  * `lib/ai/workout-generator.ts` - AI workout creation with equipment constraints
  * `lib/ai/utils.ts` - Mathematical utilities for volume and percentage calculations
  * `lib/muscle-volume-calculator.ts` - Integration layer for dashboard analytics
* Important algorithms:
  * 5-day muscle recovery model with engagement percentage weighting
  * Progressive overload targeting 3% weekly volume increase
  * Equipment-constrained workout generation with muscle balance optimization
* Data Models
  * `MuscleVolumeState`: Engagement levels, recovery timestamps, fatigue percentages
  * `ProgressionTarget`: Current volume, target increase, recommended adjustments
  * `WorkoutPlan`: Exercise selection, set/rep schemes, equipment requirements

## Current Implementation Status
* Completed: Basic muscle volume calculation, 5-day recovery model, dashboard integration
* In Progress: Equipment-aware workout generation algorithms
* Pending: Advanced progressive overload optimization, AI-powered exercise suggestions

## Implementation Plans & Tasks
* `implementation_plan_ai_workout_generation.md`
  * Enhance workout generator to consider equipment availability
  * Implement muscle balance optimization for generated routines
* `implementation_plan_progressive_overload_enhancement.md`
  * Add intelligent volume progression based on performance patterns
  * Implement PR prediction and breakthrough targeting

## Mini Dependency Tracker
---mini_tracker_start---
Dependencies: data/exercises-real.json, lib/session-storage.ts, schemas/typescript-interfaces.ts
Dependents: components/dashboard/, components/workout-logger-enhanced.tsx, app/analytics/
---mini_tracker_end---