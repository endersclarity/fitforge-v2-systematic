/**
 * WorkoutGenerator - Automated Workout Creation
 * 
 * This module generates complete, optimized workouts by:
 * - Analyzing muscle fatigue to select exercises for recovered muscle groups
 * - Applying progressive overload recommendations from ProgressionPlanner
 * - Balancing volume distribution across muscle groups
 * - Considering available time, equipment, and user goals
 * 
 * Workout Generation Strategy:
 * 1. Identify recovered muscle groups from FatigueAnalyzer
 * 2. Select exercises that target those muscle groups
 * 3. Apply progression plans from ProgressionPlanner
 * 4. Balance volume and time constraints
 * 5. Add appropriate warmup and cooldown
 * 
 * Goals:
 * - Eliminate "what should I do today?" decision fatigue
 * - Ensure optimal recovery-based exercise selection
 * - Provide scientific progressive overload
 * - Create time-efficient, balanced workouts
 */

import { dataService } from '../data-service'
import { FatigueAnalyzer } from './fatigue-analyzer'
import { ProgressionPlanner } from './progression-planner'
import type { 
  WorkoutGenerationRequest,
  GeneratedWorkout,
  ExerciseRecommendation,
  FatigueAnalysis,
  ProgressionPlan,
  Exercise,
  WorkoutGenerationConfig 
} from './types'

// Exercise timing estimates (minutes including rest)
const EXERCISE_DURATION_ESTIMATES: Record<string, number> = {
  // Compound movements (longer setup and rest)
  'Squat': 8,
  'Deadlift': 10,
  'Bench Press': 8,
  'Overhead Press': 7,
  'Row': 7,
  'Pull-up': 6,
  'Chin-up': 6,
  
  // Isolation movements (shorter setup and rest)
  'Curl': 4,
  'Extension': 4,
  'Raise': 3,
  'Fly': 4,
  'Calf': 3,
  'Plank': 2,
  
  // Default timing
  'default': 5
}

// Muscle group priorities for different goals
const GOAL_MUSCLE_PRIORITIES: Record<string, Record<string, number>> = {
  strength: {
    'Quadriceps': 1.0,
    'Hamstrings': 1.0,
    'Gluteus Maximus': 1.0,
    'Pectoralis Major': 1.0,
    'Latissimus Dorsi': 1.0,
    'Deltoids': 0.8,
    'Triceps Brachii': 0.6,
    'Biceps Brachii': 0.6
  },
  hypertrophy: {
    'Pectoralis Major': 1.0,
    'Latissimus Dorsi': 1.0,
    'Deltoids': 1.0,
    'Quadriceps': 1.0,
    'Hamstrings': 0.9,
    'Triceps Brachii': 0.8,
    'Biceps Brachii': 0.8,
    'Calves': 0.6
  },
  general_fitness: {
    'Quadriceps': 1.0,
    'Pectoralis Major': 1.0,
    'Latissimus Dorsi': 1.0,
    'Deltoids': 0.9,
    'Core': 0.8,
    'Hamstrings': 0.8,
    'Gluteus Maximus': 0.8
  }
}

export class WorkoutGenerator {
  private fatigueAnalyzer: FatigueAnalyzer
  private progressionPlanner: ProgressionPlanner
  private config: WorkoutGenerationConfig

  constructor(config?: Partial<WorkoutGenerationConfig>) {
    this.fatigueAnalyzer = new FatigueAnalyzer()
    this.progressionPlanner = new ProgressionPlanner()
    this.config = {
      minExercisesPerWorkout: 4,
      maxExercisesPerWorkout: 8,
      preferredWorkoutDuration: 60,
      muscleBalanceWeighting: 0.7,
      equipmentPreferences: {
        'Barbell': 1.0,
        'Dumbbell': 0.9,
        'Bodyweight': 0.8,
        'Cable': 0.7,
        'Machine': 0.6
      },
      ...config
    }
  }

  /**
   * Generate a complete workout based on user requirements
   */
  async generateWorkout(request: WorkoutGenerationRequest): Promise<GeneratedWorkout> {
    try {
      // Analyze current fatigue state
      const fatigueAnalysis = await this.fatigueAnalyzer.analyzeFatigue(request.userId)
      
      // Get user's exercise library
      const allExercises = await dataService.getExercises()
      
      // Filter exercises by available equipment
      const availableExercises = this.filterByEquipment(allExercises, request.equipment)
      
      // Select exercises based on recovery state and goals
      const selectedExercises = await this.selectOptimalExercises(
        availableExercises,
        fatigueAnalysis,
        request
      )
      
      // Generate progression plans for each exercise
      const exerciseRecommendations = await this.generateExerciseRecommendations(
        selectedExercises,
        request.userId,
        request.goal
      )
      
      // Balance workout timing and volume
      const balancedWorkout = this.balanceWorkoutTiming(
        exerciseRecommendations,
        request.availableTime
      )
      
      // Add warmup and cooldown
      const warmupExercises = await this.generateWarmup(balancedWorkout, allExercises)
      const cooldownExercises = await this.generateCooldown(balancedWorkout, allExercises)
      
      // Calculate overall workout metrics
      const workoutMetrics = this.calculateWorkoutMetrics(balancedWorkout, fatigueAnalysis)

      return {
        id: `workout_${Date.now()}`,
        userId: request.userId,
        name: this.generateWorkoutName(request.goal, fatigueAnalysis),
        description: this.generateWorkoutDescription(balancedWorkout, fatigueAnalysis),
        goal: request.goal,
        exercises: balancedWorkout,
        warmupExercises,
        cooldownExercises,
        estimatedDuration: workoutMetrics.totalDuration,
        focusAreas: workoutMetrics.focusAreas,
        overallIntensity: workoutMetrics.intensity,
        recoveryStatus: fatigueAnalysis.summary,
        coachingNotes: workoutMetrics.coachingNotes,
        generatedAt: new Date(),
        aiVersion: '2.0',
        confidence: workoutMetrics.confidence
      }

    } catch (error) {
      console.error('Error generating workout:', error)
      throw new Error(`Failed to generate workout: ${error}`)
    }
  }

  /**
   * Filter exercises by available equipment
   */
  private filterByEquipment(exercises: Exercise[], availableEquipment: string[]): Exercise[] {
    if (availableEquipment.length === 0) return exercises

    return exercises.filter(exercise => {
      const exerciseEquipment = exercise.equipment?.toLowerCase() || 'bodyweight'
      return availableEquipment.some(equipment => 
        exerciseEquipment.includes(equipment.toLowerCase()) ||
        equipment.toLowerCase() === 'bodyweight'
      )
    })
  }

  /**
   * Select optimal exercises based on recovery state and goals
   */
  private async selectOptimalExercises(
    availableExercises: Exercise[],
    fatigueAnalysis: FatigueAnalysis,
    request: WorkoutGenerationRequest
  ): Promise<Exercise[]> {
    
    // Score each exercise based on multiple factors
    const exerciseScores = availableExercises.map(exercise => ({
      exercise,
      score: this.calculateExerciseScore(exercise, fatigueAnalysis, request)
    }))

    // Sort by score and apply selection logic
    exerciseScores.sort((a, b) => b.score - a.score)

    // Select exercises ensuring muscle group balance
    const selectedExercises: Exercise[] = []
    const targetedMuscles = new Set<string>()
    const goalPriorities = GOAL_MUSCLE_PRIORITIES[request.goal] || GOAL_MUSCLE_PRIORITIES.general_fitness

    for (const { exercise } of exerciseScores) {
      if (selectedExercises.length >= this.config.maxExercisesPerWorkout) break

      // Check if this exercise adds value (targets new muscles or high-priority muscles)
      const exerciseMuscles = Object.keys(exercise.muscle_engagement || {})
      const newMuscles = exerciseMuscles.filter(muscle => !targetedMuscles.has(muscle))
      const highPriorityMuscles = exerciseMuscles.filter(muscle => 
        (goalPriorities[muscle] || 0) >= 0.8
      )

      // Select if it targets new muscles or high-priority muscles
      if (newMuscles.length > 0 || highPriorityMuscles.length > 0) {
        selectedExercises.push(exercise)
        exerciseMuscles.forEach(muscle => targetedMuscles.add(muscle))
      }

      // Ensure minimum exercises
      if (selectedExercises.length < this.config.minExercisesPerWorkout) {
        continue // Keep adding until minimum reached
      }
    }

    // Ensure we have at least the minimum number of exercises
    while (selectedExercises.length < this.config.minExercisesPerWorkout && exerciseScores.length > selectedExercises.length) {
      const remaining = exerciseScores.filter(({ exercise }) => 
        !selectedExercises.includes(exercise)
      )
      if (remaining.length > 0) {
        selectedExercises.push(remaining[0].exercise)
      } else {
        break
      }
    }

    return selectedExercises
  }

  /**
   * Calculate score for exercise selection
   */
  private calculateExerciseScore(
    exercise: Exercise,
    fatigueAnalysis: FatigueAnalysis,
    request: WorkoutGenerationRequest
  ): number {
    let score = 0

    // Base score from muscle engagement quality
    const muscleEngagement = exercise.muscle_engagement || {}
    const primaryMuscles = Object.entries(muscleEngagement)
      .filter(([_, engagement]) => engagement >= 50)
      .map(([muscle, _]) => muscle)

    // Recovery score - higher if muscles are recovered
    const recoveryScore = primaryMuscles.reduce((total, muscle) => {
      const muscleData = fatigueAnalysis.muscleGroups[muscle]
      if (!muscleData) return total
      
      return total + (muscleData.status === 'Recovered' ? 30 : 
                     muscleData.status === 'Recovering' ? 15 : 0)
    }, 0)
    
    score += recoveryScore

    // Goal alignment score
    const goalPriorities = GOAL_MUSCLE_PRIORITIES[request.goal] || GOAL_MUSCLE_PRIORITIES.general_fitness
    const goalScore = primaryMuscles.reduce((total, muscle) => {
      return total + (goalPriorities[muscle] || 0) * 20
    }, 0)
    
    score += goalScore

    // Equipment preference score
    const equipmentScore = this.config.equipmentPreferences[exercise.equipment || 'Bodyweight'] || 0.5
    score += equipmentScore * 10

    // Compound vs isolation preference (favor compounds for efficiency)
    const compoundScore = primaryMuscles.length > 1 ? 15 : 5
    score += compoundScore

    // Time efficiency (favor exercises that work multiple muscles)
    const efficiencyScore = Object.values(muscleEngagement).reduce((sum, eng) => sum + eng, 0) / 100 * 10
    score += efficiencyScore

    return score
  }

  /**
   * Generate progression recommendations for selected exercises
   */
  private async generateExerciseRecommendations(
    exercises: Exercise[],
    userId: string,
    goal: string
  ): Promise<ExerciseRecommendation[]> {
    
    const recommendations = await Promise.all(
      exercises.map(async (exercise, index) => {
        try {
          // Get progression plan for this exercise
          const progression = await this.progressionPlanner.planProgression(userId, exercise.id)
          
          // Calculate estimated duration
          const duration = this.estimateExerciseDuration(exercise, progression)
          
          // Determine priority based on exercise selection order and type
          const priority = index < 2 ? 'high' : 
                          index < 4 ? 'medium' : 'low'
          
          // Generate rationale
          const rationale = this.generateExerciseRationale(exercise, progression, goal)

          return {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            progression,
            rationale,
            muscleTargets: Object.keys(exercise.muscle_engagement || {}),
            estimatedDuration: duration,
            priority: priority as 'high' | 'medium' | 'low'
          }
        } catch (error) {
          console.error(`Error generating recommendation for ${exercise.name}:`, error)
          
          // Fallback recommendation
          return {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            progression: {
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              currentE1RM: null,
              previousBestE1RM: null,
              weight: 45,
              reps: 8,
              sets: 3,
              targetRPE: 7,
              confidence: 0.3,
              rationale: 'Conservative fallback recommendation',
              progressionType: 'maintain',
              recentTrend: 'insufficient_data',
              plateauDetected: false,
              deloadRecommended: false,
              warmupRecommended: true,
              formFocusAreas: ['Focus on proper form']
            },
            rationale: `${exercise.name} selected for muscle development`,
            muscleTargets: Object.keys(exercise.muscle_engagement || {}),
            estimatedDuration: 5,
            priority: 'medium' as const
          }
        }
      })
    )

    return recommendations
  }

  /**
   * Estimate exercise duration including rest time
   */
  private estimateExerciseDuration(exercise: Exercise, progression: ProgressionPlan): number {
    // Base duration from exercise type
    let baseDuration = EXERCISE_DURATION_ESTIMATES.default
    
    for (const [pattern, duration] of Object.entries(EXERCISE_DURATION_ESTIMATES)) {
      if (exercise.name.toLowerCase().includes(pattern.toLowerCase())) {
        baseDuration = duration
        break
      }
    }

    // Adjust for number of sets
    const setMultiplier = progression.sets / 3 // 3 sets is baseline
    
    // Adjust for intensity (higher RPE = longer rest)
    const intensityMultiplier = progression.targetRPE >= 8 ? 1.2 : 1.0

    return Math.round(baseDuration * setMultiplier * intensityMultiplier)
  }

  /**
   * Generate rationale for exercise selection
   */
  private generateExerciseRationale(exercise: Exercise, progression: ProgressionPlan, goal: string): string {
    const primaryMuscles = Object.entries(exercise.muscle_engagement || {})
      .filter(([_, engagement]) => engagement >= 50)
      .map(([muscle, _]) => muscle)
      .slice(0, 2)

    let rationale = `Targets ${primaryMuscles.join(' and ')}`

    // Add progression context
    if (progression.progressionType === 'weight_increase') {
      rationale += `. Ready for weight progression.`
    } else if (progression.progressionType === 'rep_increase') {
      rationale += `. Progressing with rep increases.`
    } else if (progression.deloadRecommended) {
      rationale += `. Deload for recovery.`
    }

    // Add goal context
    if (goal === 'strength' && primaryMuscles.length > 1) {
      rationale += ` Compound movement for strength gains.`
    } else if (goal === 'hypertrophy') {
      rationale += ` Optimal for muscle growth.`
    }

    return rationale
  }

  /**
   * Balance workout timing to fit available time
   */
  private balanceWorkoutTiming(
    recommendations: ExerciseRecommendation[],
    availableTime: number
  ): ExerciseRecommendation[] {
    
    // Calculate total estimated time
    const totalTime = recommendations.reduce((sum, rec) => sum + rec.estimatedDuration, 0)
    
    // If we're over time, prioritize and potentially remove exercises
    if (totalTime > availableTime * 0.8) { // Leave 20% buffer for warmup/cooldown
      
      // Sort by priority and fit within time
      const prioritized = [...recommendations].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })

      const balanced: ExerciseRecommendation[] = []
      let runningTime = 0

      for (const rec of prioritized) {
        if (runningTime + rec.estimatedDuration <= availableTime * 0.8) {
          balanced.push(rec)
          runningTime += rec.estimatedDuration
        }
      }

      return balanced
    }

    return recommendations
  }

  /**
   * Generate warmup exercises
   */
  private async generateWarmup(
    workoutExercises: ExerciseRecommendation[],
    allExercises: Exercise[]
  ): Promise<ExerciseRecommendation[]> {
    
    // Find bodyweight/light warmup exercises
    const warmupExercises = allExercises.filter(exercise => 
      exercise.equipment === 'Bodyweight' && 
      (exercise.name.toLowerCase().includes('walk') ||
       exercise.name.toLowerCase().includes('march') ||
       exercise.name.toLowerCase().includes('circle') ||
       exercise.name.toLowerCase().includes('stretch'))
    ).slice(0, 3)

    return warmupExercises.map(exercise => ({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      progression: {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        currentE1RM: null,
        previousBestE1RM: null,
        weight: 0,
        reps: 10,
        sets: 1,
        targetRPE: 3,
        confidence: 1.0,
        rationale: 'Warmup and activation',
        progressionType: 'maintain',
        recentTrend: 'insufficient_data',
        plateauDetected: false,
        deloadRecommended: false,
        warmupRecommended: false,
        formFocusAreas: ['Focus on range of motion']
      },
      rationale: 'Warmup and muscle activation',
      muscleTargets: Object.keys(exercise.muscle_engagement || {}),
      estimatedDuration: 2,
      priority: 'low' as const
    }))
  }

  /**
   * Generate cooldown exercises
   */
  private async generateCooldown(
    workoutExercises: ExerciseRecommendation[],
    allExercises: Exercise[]
  ): Promise<ExerciseRecommendation[]> {
    
    // Find stretching/recovery exercises
    const cooldownExercises = allExercises.filter(exercise => 
      exercise.equipment === 'Bodyweight' && 
      (exercise.name.toLowerCase().includes('stretch') ||
       exercise.name.toLowerCase().includes('hold') ||
       exercise.name.toLowerCase().includes('foam'))
    ).slice(0, 2)

    return cooldownExercises.map(exercise => ({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      progression: {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        currentE1RM: null,
        previousBestE1RM: null,
        weight: 0,
        reps: 1,
        sets: 1,
        targetRPE: 2,
        confidence: 1.0,
        rationale: 'Recovery and flexibility',
        progressionType: 'maintain',
        recentTrend: 'insufficient_data',
        plateauDetected: false,
        deloadRecommended: false,
        warmupRecommended: false,
        formFocusAreas: ['Focus on relaxation and breathing']
      },
      rationale: 'Cooldown and recovery',
      muscleTargets: Object.keys(exercise.muscle_engagement || {}),
      estimatedDuration: 3,
      priority: 'low' as const
    }))
  }

  /**
   * Calculate overall workout metrics
   */
  private calculateWorkoutMetrics(
    exercises: ExerciseRecommendation[],
    fatigueAnalysis: FatigueAnalysis
  ) {
    const totalDuration = exercises.reduce((sum, ex) => sum + ex.estimatedDuration, 0) + 10 // Add warmup/cooldown time
    
    // Determine intensity based on average target RPE
    const avgRPE = exercises.reduce((sum, ex) => sum + ex.progression.targetRPE, 0) / exercises.length
    const intensity = avgRPE >= 8.5 ? 'high' : avgRPE >= 7 ? 'moderate' : 'low'
    
    // Get focus areas from targeted muscles
    const allTargets = new Set<string>()
    exercises.forEach(ex => ex.muscleTargets.forEach(muscle => allTargets.add(muscle)))
    const focusAreas = Array.from(allTargets).slice(0, 4)
    
    // Calculate confidence based on individual exercise confidence
    const confidence = exercises.reduce((sum, ex) => sum + ex.progression.confidence, 0) / exercises.length
    
    // Generate coaching notes
    const coachingNotes = this.generateCoachingNotes(exercises, fatigueAnalysis, intensity)

    return {
      totalDuration,
      intensity: intensity as 'low' | 'moderate' | 'high',
      focusAreas,
      confidence,
      coachingNotes
    }
  }

  /**
   * Generate workout name based on focus and goals
   */
  private generateWorkoutName(goal: string, fatigueAnalysis: FatigueAnalysis): string {
    const readyMuscles = fatigueAnalysis.readyForTraining.slice(0, 2)
    
    if (readyMuscles.length === 0) {
      return `${goal.charAt(0).toUpperCase() + goal.slice(1)} Workout`
    }

    // Create name based on primary recovered muscles
    const muscleNames = readyMuscles.map(muscle => muscle.replace(/([A-Z])/g, ' $1').trim())
    return `${muscleNames.join(' & ')} Focus`
  }

  /**
   * Generate workout description
   */
  private generateWorkoutDescription(
    exercises: ExerciseRecommendation[],
    fatigueAnalysis: FatigueAnalysis
  ): string {
    const exerciseCount = exercises.length
    const primaryMuscles = fatigueAnalysis.readyForTraining.slice(0, 3)
    
    let description = `${exerciseCount}-exercise workout targeting `
    
    if (primaryMuscles.length > 0) {
      description += `${primaryMuscles.join(', ')}.`
    } else {
      description += `multiple muscle groups.`
    }
    
    description += ` ${fatigueAnalysis.summary}`
    
    return description
  }

  /**
   * Generate coaching notes for the workout
   */
  private generateCoachingNotes(
    exercises: ExerciseRecommendation[],
    fatigueAnalysis: FatigueAnalysis,
    intensity: string
  ): string[] {
    const notes: string[] = []

    // Intensity-based notes
    if (intensity === 'high') {
      notes.push('High intensity session - ensure proper warmup and rest between sets')
    } else if (intensity === 'low') {
      notes.push('Focus on form and mind-muscle connection today')
    }

    // Recovery-based notes
    if (fatigueAnalysis.deloadRecommended) {
      notes.push('Your body is showing signs of fatigue - prioritize recovery')
    }

    // Progression notes
    const progressingExercises = exercises.filter(ex => ex.progression.progressionType === 'weight_increase')
    if (progressingExercises.length > 0) {
      notes.push(`Ready for weight increases in ${progressingExercises[0].exerciseName}`)
    }

    // Form focus notes
    const formFocusExercises = exercises.filter(ex => ex.progression.formFocusAreas.length > 0)
    if (formFocusExercises.length > 0) {
      notes.push('Pay special attention to form on compound movements')
    }

    // Default encouraging note
    if (notes.length === 0) {
      notes.push('Great workout selection based on your recovery state!')
    }

    return notes
  }
}