# Module: Components

## Purpose & Responsibility
Provides React UI components following Fitbod design patterns with comprehensive shadcn/ui integration. Handles interactive exercise selection, workout logging, muscle visualizations, and dashboard analytics with Calm design system tokens.

## Interfaces
* `FitbodHome`: Main workout selection interface
  * `handleMuscleGroupSelect`: Navigate to exercise selection by muscle group
  * `handleQuickStart`: Direct access to workout logger
* `WorkoutLoggerEnhanced`: Complete workout tracking interface
  * `logSet`: Record individual exercise sets with weight/reps
  * `saveWorkout`: Persist workout to localStorage
* `Dashboard Components`: Analytics and progress visualization
  * `ExerciseProgress`: Track individual exercise improvements
  * `VolumeChart`: Display volume progression over time
  * `MuscleDistribution`: Show muscle engagement patterns
* Input: Exercise data, workout logs, user interactions
* Output: Updated workout state, localStorage persistence, navigation events

## Implementation Details
* Files: 
  * `fitbod-home.tsx` - Main workout selection with muscle group cards
  * `workout-logger-enhanced.tsx` - Complete set logging interface
  * `dashboard/` - Analytics components with recharts integration
  * `ui/` - 40+ shadcn/ui components with custom Fitbod styling
  * `visualization/` - Muscle anatomy and heatmap components
* Important algorithms: 
  * Muscle volume calculation from exercise engagement percentages
  * Real-time workout state management with draft persistence
  * Progressive overload suggestion based on previous performance
* Data Models
  * `Exercise`: Name, equipment, muscle engagement percentages
  * `WorkoutSet`: Exercise, weight, reps, duration
  * `WorkoutSession`: Date, exercises, total volume, duration

## Current Implementation Status
* Completed: Core workout logging, dashboard analytics, Fitbod-style UI components
* In Progress: Equipment filtering for exercise selection
* Pending: Workout templates, enhanced set logging with timers

## Implementation Plans & Tasks
* `implementation_plan_equipment_filtering.md`
  * Add equipment filter toggles to exercise selection
  * Integrate with existing exercise database
* `implementation_plan_workout_templates.md`
  * Replace muscle group cards with pre-built routines
  * Implement A/B workout variations
* `implementation_plan_enhanced_set_logging.md`
  * Add rest timers and progress indicators
  * Improve UX flow for set completion

## Mini Dependency Tracker
---mini_tracker_start---
Dependencies: data/exercises-real.json, lib/muscle-volume-calculator.ts, styles/calm-tokens.css
Dependents: app/page.tsx, app/workouts-simple/page.tsx, app/dashboard/page.tsx
---mini_tracker_end---