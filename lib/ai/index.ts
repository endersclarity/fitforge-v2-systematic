/**
 * FitForge Intelligence Layer
 * 
 * This module contains the AI-driven coaching algorithms that transform
 * FitForge from a workout tracker into an automated fitness coach.
 * 
 * Core Philosophy:
 * - Eliminate all workout decision friction for users
 * - Use RPE data and fatigue analysis for scientific recommendations  
 * - Provide progressive overload automation based on performance trends
 * - Generate complete workouts targeting recovered muscle groups
 */

// Core AI Modules
export { FatigueAnalyzer } from './fatigue-analyzer'
export { ProgressionPlanner } from './progression-planner'  
export { WorkoutGenerator } from './workout-generator'

// Shared AI Types
export type {
  MuscleGroup,
  FatigueAnalysis,
  ProgressionPlan,
  WorkoutGenerationRequest,
  GeneratedWorkout,
  AIRecommendation
} from './types'

// AI Utilities
export { AIConfig, createAILogger } from './utils'

/**
 * Intelligence Layer Architecture:
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    User Interface                           │
 * └─────────────────────┬───────────────────────────────────────┘
 *                       │
 * ┌─────────────────────▼───────────────────────────────────────┐
 * │               Intelligence Layer                            │
 * │  ┌─────────────────┬─────────────────┬─────────────────┐   │
 * │  │ FatigueAnalyzer │ ProgressionPlnr │ WorkoutGenerat │   │
 * │  │                 │                 │                 │   │
 * │  │ • Muscle fatigue│ • e1RM trends   │ • Complete      │   │
 * │  │ • Recovery time │ • RPE analysis  │   workouts      │   │
 * │  │ • Volume load   │ • Load increases│ • Exercise      │   │
 * │  │                 │                 │   selection     │   │
 * │  └─────────────────┴─────────────────┴─────────────────┘   │
 * └─────────────────────┬───────────────────────────────────────┘
 *                       │
 * ┌─────────────────────▼───────────────────────────────────────┐
 * │              Data Access Layer                              │
 * │           lib/data-service.ts (PROVEN)                     │
 * └─────────────────────────────────────────────────────────────┘
 */