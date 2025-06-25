# Module: Data Management

## Purpose & Responsibility
Manages exercise database with 38 real exercises including muscle engagement percentages, equipment requirements, and difficulty levels. Handles workout tracking via localStorage with session persistence and data migration utilities for development iterations.

## Interfaces
* `ExerciseDatabase`: Complete exercise information system
  * `getExercisesByEquipment`: Filter exercises by available equipment
  * `getExercisesByMuscleGroup`: Group exercises by target muscles
  * `getMuscleEngagement`: Retrieve engagement percentages for fatigue calculation
* `WorkoutStorage`: localStorage-based workout persistence
  * `saveWorkoutSession`: Store completed workout with metadata
  * `getRecentSessions`: Retrieve workout history for analytics
  * `getDraftWorkout`: Access in-progress workout state
* `DataMigration`: Development utilities for data consistency
  * `migrateToNewSchema`: Update stored data to match current interfaces
  * `validateExerciseData`: Ensure data integrity for muscle calculations
* Input: Exercise queries, workout sessions, filter criteria
* Output: Structured exercise data, persisted workout history, validation results

## Implementation Details
* Files:
  * `data/exercises-real.json` - 38 exercises with complete muscle engagement data
  * `lib/session-storage.ts` - localStorage interface with type safety
  * `lib/data-migration.ts` - Schema migration utilities
  * `lib/muscle-volume-calculator.ts` - Processes exercise data for analytics
  * `schemas/typescript-interfaces.ts` - Type definitions for all data structures
* Important algorithms:
  * Exercise filtering by equipment/muscle groups with fuzzy matching
  * Workout session aggregation for volume calculations
  * Data validation ensuring muscle percentages sum correctly
* Data Models
  * `Exercise`: id, name, category, equipment, difficulty, variation, muscleEngagement
  * `WorkoutSession`: sessionId, date, exercises, sets, totalVolume, duration
  * `Set`: exerciseId, weight, reps, restTime, completed

## Current Implementation Status
* Completed: Exercise database with muscle engagement, localStorage workout tracking, basic data migration
* In Progress: Equipment filtering integration with UI components
* Pending: Advanced analytics data aggregation, workout template data structures

## Implementation Plans & Tasks
* `implementation_plan_equipment_filtering.md`
  * Add equipment filter logic to exercise queries
  * Update UI components to use filtered exercise lists
* `implementation_plan_analytics_enhancement.md`
  * Expand data aggregation for advanced muscle fatigue tracking
  * Implement progressive overload data analysis

## Mini Dependency Tracker
---mini_tracker_start---
Dependencies: schemas/typescript-interfaces.ts
Dependents: components/fitbod-home.tsx, components/workout-logger-enhanced.tsx, lib/ai/fatigue-analyzer.ts
---mini_tracker_end---