/**
 * AI Module Utilities and Configuration
 * 
 * Shared utilities, configuration, and logging for the Intelligence Layer
 */

import type { FatigueAnalysisConfig, ProgressionConfig, WorkoutGenerationConfig } from './types'

// ==================== AI CONFIGURATION ====================

export class AIConfig {
  static readonly VERSION = '2.0'
  static readonly MIN_DATA_POINTS_FOR_PROGRESSION = 3
  static readonly MAX_WORKOUT_DURATION = 120 // minutes
  static readonly MIN_WORKOUT_DURATION = 20 // minutes
  
  // Default configurations for AI modules
  static readonly DEFAULT_FATIGUE_CONFIG: FatigueAnalysisConfig = {
    lookbackDays: 7,
    rpeWeighting: 0.4,
    volumeWeighting: 0.3,
    recencyWeighting: 0.3,
    recoveryRates: {
      'Quadriceps': 72,
      'Hamstrings': 72,
      'Gluteus Maximus': 72,
      'Latissimus Dorsi': 60,
      'Pectoralis Major': 60,
      'Erector Spinae': 96,
      'Deltoids': 48,
      'Trapezius': 48,
      'Rhomboids': 48,
      'Triceps Brachii': 48,
      'Biceps Brachii': 48,
      'Forearms': 36,
      'Calves': 36,
      'Core': 48,
      'Abs': 24,
      'Obliques': 36
    }
  }

  static readonly DEFAULT_PROGRESSION_CONFIG: ProgressionConfig = {
    conservativeMode: true,
    plateauDetectionSensitivity: 3,
    deloadThreshold: 0.95,
    maxWeightIncrease: 10,
    maxRepIncrease: 2
  }

  static readonly DEFAULT_WORKOUT_CONFIG: WorkoutGenerationConfig = {
    minExercisesPerWorkout: 4,
    maxExercisesPerWorkout: 8,
    preferredWorkoutDuration: 60,
    muscleBalanceWeighting: 0.7,
    equipmentPreferences: {
      'Barbell': 1.0,
      'Dumbbell': 0.9,
      'Bodyweight': 0.8,
      'Cable': 0.7,
      'Machine': 0.6,
      'Kettlebell': 0.8,
      'Resistance Band': 0.6
    }
  }
}

// ==================== LOGGING UTILITIES ====================

export interface AILogEntry {
  timestamp: Date
  userId: string
  module: 'FatigueAnalyzer' | 'ProgressionPlanner' | 'WorkoutGenerator'
  action: string
  data: any
  confidence?: number
  executionTime?: number
}

export class AILogger {
  private logs: AILogEntry[] = []
  private readonly maxLogs = 1000

  log(entry: Omit<AILogEntry, 'timestamp'>): void {
    const logEntry: AILogEntry = {
      timestamp: new Date(),
      ...entry
    }

    this.logs.push(logEntry)

    // Trim logs if over limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AI ${entry.module}] ${entry.action}:`, {
        userId: entry.userId,
        confidence: entry.confidence,
        executionTime: entry.executionTime
      })
    }
  }

  getLogsForUser(userId: string, limit: number = 50): AILogEntry[] {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(-limit)
      .reverse()
  }

  getLogsForModule(module: AILogEntry['module'], limit: number = 50): AILogEntry[] {
    return this.logs
      .filter(log => log.module === module)
      .slice(-limit)
      .reverse()
  }

  getPerformanceMetrics(): {
    avgExecutionTime: Record<string, number>
    avgConfidence: Record<string, number>
    totalRequests: Record<string, number>
  } {
    const metrics = {
      avgExecutionTime: {} as Record<string, number>,
      avgConfidence: {} as Record<string, number>,
      totalRequests: {} as Record<string, number>
    }

    const groupedLogs = this.logs.reduce((acc, log) => {
      if (!acc[log.module]) acc[log.module] = []
      acc[log.module].push(log)
      return acc
    }, {} as Record<string, AILogEntry[]>)

    for (const [module, logs] of Object.entries(groupedLogs)) {
      metrics.totalRequests[module] = logs.length

      const executionTimes = logs.filter(log => log.executionTime).map(log => log.executionTime!)
      if (executionTimes.length > 0) {
        metrics.avgExecutionTime[module] = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
      }

      const confidences = logs.filter(log => log.confidence).map(log => log.confidence!)
      if (confidences.length > 0) {
        metrics.avgConfidence[module] = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length
      }
    }

    return metrics
  }
}

// Singleton logger instance
const aiLogger = new AILogger()

export function createAILogger() {
  return aiLogger
}

// ==================== VALIDATION UTILITIES ====================

export class AIValidation {
  /**
   * Validate RPE value
   */
  static isValidRPE(rpe: number): boolean {
    return rpe >= 1 && rpe <= 10 && Number.isInteger(rpe)
  }

  /**
   * Validate weight value
   */
  static isValidWeight(weight: number): boolean {
    return weight >= 0 && weight <= 1000 && !isNaN(weight)
  }

  /**
   * Validate rep count
   */
  static isValidReps(reps: number): boolean {
    return reps >= 1 && reps <= 100 && Number.isInteger(reps)
  }

  /**
   * Validate set count
   */
  static isValidSets(sets: number): boolean {
    return sets >= 1 && sets <= 20 && Number.isInteger(sets)
  }

  /**
   * Validate fatigue score
   */
  static isValidFatigueScore(score: number): boolean {
    return score >= 0 && score <= 100 && !isNaN(score)
  }

  /**
   * Validate confidence score
   */
  static isValidConfidence(confidence: number): boolean {
    return confidence >= 0 && confidence <= 1 && !isNaN(confidence)
  }

  /**
   * Validate workout duration
   */
  static isValidDuration(duration: number): boolean {
    return duration >= AIConfig.MIN_WORKOUT_DURATION && 
           duration <= AIConfig.MAX_WORKOUT_DURATION && 
           !isNaN(duration)
  }
}

// ==================== MATHEMATICAL UTILITIES ====================

export class AIMath {
  /**
   * Calculate Brzycki 1RM formula
   */
  static calculateE1RM(weight: number, reps: number): number {
    if (reps === 1) return weight
    if (reps > 10) return weight // Don't estimate for high rep sets
    
    // Brzycki formula: 1RM = weight / (1.0278 - 0.0278 * reps)
    const denominator = 1.0278 - 0.0278 * reps
    if (denominator <= 0) return weight
    
    return Math.round(weight / denominator)
  }

  /**
   * Calculate volume (sets × reps × weight)
   */
  static calculateVolume(sets: number, reps: number, weight: number): number {
    return sets * reps * weight
  }

  /**
   * Calculate exponential decay for recency weighting
   */
  static exponentialDecay(value: number, timeInDays: number, halfLife: number = 3): number {
    return value * Math.exp(-timeInDays * Math.log(2) / halfLife)
  }

  /**
   * Calculate coefficient of variation
   */
  static coefficientOfVariation(values: number[]): number {
    if (values.length === 0) return 0
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    
    return mean === 0 ? 0 : stdDev / mean
  }

  /**
   * Linear interpolation
   */
  static lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * Math.max(0, Math.min(1, factor))
  }

  /**
   * Clamp value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
  }

  /**
   * Calculate moving average
   */
  static movingAverage(values: number[], window: number): number[] {
    const result: number[] = []
    
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - window + 1)
      const windowValues = values.slice(start, i + 1)
      const average = windowValues.reduce((sum, val) => sum + val, 0) / windowValues.length
      result.push(average)
    }
    
    return result
  }
}

// ==================== ERROR HANDLING ====================

export class AIError extends Error {
  constructor(
    message: string,
    public module: string,
    public userId?: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'AIError'
  }
}

export function handleAIError(error: unknown, module: string, userId?: string): AIError {
  if (error instanceof AIError) {
    return error
  }
  
  if (error instanceof Error) {
    return new AIError(error.message, module, userId, error)
  }
  
  return new AIError('Unknown AI error occurred', module, userId)
}

// ==================== PERFORMANCE MONITORING ====================

export class AIPerformanceMonitor {
  private static timers = new Map<string, number>()

  static startTimer(timerName: string): void {
    this.timers.set(timerName, Date.now())
  }

  static endTimer(timerName: string): number {
    const startTime = this.timers.get(timerName)
    if (!startTime) return 0
    
    const executionTime = Date.now() - startTime
    this.timers.delete(timerName)
    return executionTime
  }

  static async measureExecution<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<{ result: T; executionTime: number }> {
    const startTime = Date.now()
    try {
      const result = await operation()
      const executionTime = Date.now() - startTime
      return { result, executionTime }
    } catch (error) {
      const executionTime = Date.now() - startTime
      throw new AIError(
        `Operation ${operationName} failed after ${executionTime}ms`,
        'PerformanceMonitor',
        undefined,
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }
}