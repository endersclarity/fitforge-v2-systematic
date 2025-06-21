/**
 * ProgressionPlanner - Automated Progressive Overload Planning
 * 
 * This module analyzes exercise performance history to recommend optimal
 * weight, reps, and sets for the next training session.
 * 
 * Core Progressive Overload Logic:
 * - If last RPE ≤ 7: Increase weight by 2.5-5lbs (depending on exercise)
 * - If last RPE = 8-9: Maintain weight, potentially increase reps
 * - If last RPE = 10: Maintain or reduce load (prevent overreaching)
 * - If plateau detected: Implement periodization (deload, rep range change)
 * 
 * Scientific Basis:
 * - RPE 6-7: Submaximal, room for progression
 * - RPE 8-9: Near-maximal, good training stimulus
 * - RPE 10: Maximal effort, recovery needed
 * - e1RM trends indicate strength adaptations
 * - Progressive overload must balance stimulus with recovery
 */

import { dataService } from '../data-service'
import type { 
  ProgressionPlan, 
  ProgressionConfig,
  WorkoutSession,
  PerformedSet,
  Exercise 
} from './types'

// Default progression increments by exercise type
const PROGRESSION_INCREMENTS: Record<string, number> = {
  // Large compound movements - conservative increments
  'Squat': 5,
  'Deadlift': 5,
  'Bench Press': 2.5,
  'Overhead Press': 2.5,
  'Row': 2.5,
  
  // Isolation movements - smaller increments
  'Curl': 2.5,
  'Extension': 2.5,
  'Raise': 1.25,
  'Fly': 1.25,
  
  // Default for unknown exercises
  'default': 2.5
}

export class ProgressionPlanner {
  private config: ProgressionConfig

  constructor(config?: Partial<ProgressionConfig>) {
    this.config = {
      conservativeMode: true,
      plateauDetectionSensitivity: 3, // sessions without improvement
      deloadThreshold: 0.95, // 95% of previous best triggers deload consideration
      maxWeightIncrease: 10, // maximum pounds to add in single session
      maxRepIncrease: 2, // maximum reps to add in single session
      ...config
    }
  }

  /**
   * Plan progression for a specific exercise
   */
  async planProgression(userId: string, exerciseId: string): Promise<ProgressionPlan> {
    try {
      // Get exercise information
      const exercise = await dataService.getExerciseById(exerciseId)
      if (!exercise) {
        throw new Error(`Exercise ${exerciseId} not found`)
      }

      // Get recent performance history
      const recentSets = await dataService.getExerciseHistory(userId, exerciseId, 20)
      
      if (recentSets.length === 0) {
        return this.createBeginnerProgression(exercise)
      }

      // Analyze performance trends
      const performanceAnalysis = this.analyzePerformanceTrends(recentSets)
      
      // Calculate current and previous e1RM
      const currentE1RM = this.calculateCurrentE1RM(recentSets)
      const previousBestE1RM = this.findPreviousBestE1RM(recentSets)
      
      // Determine progression strategy
      const progressionStrategy = this.determineProgressionStrategy(
        performanceAnalysis,
        currentE1RM,
        previousBestE1RM
      )
      
      // Calculate recommended load
      const recommendation = this.calculateRecommendedLoad(
        exercise,
        recentSets,
        progressionStrategy,
        performanceAnalysis
      )

      return {
        exerciseId,
        exerciseName: exercise.name,
        currentE1RM,
        previousBestE1RM,
        ...recommendation,
        recentTrend: performanceAnalysis.trend,
        plateauDetected: performanceAnalysis.plateauDetected,
        deloadRecommended: progressionStrategy.deload,
        warmupRecommended: recommendation.weight > (currentE1RM || 0) * 0.8,
        formFocusAreas: this.getFormFocusAreas(exercise, progressionStrategy)
      }

    } catch (error) {
      console.error('Error planning progression:', error)
      throw new Error(`Failed to plan progression for exercise ${exerciseId}: ${error}`)
    }
  }

  /**
   * Analyze recent performance to detect trends and plateaus
   */
  private analyzePerformanceTrends(recentSets: PerformedSet[]) {
    if (recentSets.length < 3) {
      return {
        trend: 'insufficient_data' as const,
        plateauDetected: false,
        averageRPE: 0,
        lastSessionRPE: 0,
        volumeTrend: 'stable' as const,
        consistencyScore: 0
      }
    }

    // Group sets by session (approximate by date)
    const sessionGroups = this.groupSetsBySession(recentSets)
    const recentSessions = sessionGroups.slice(-5) // Last 5 sessions

    // Calculate trend metrics
    const e1rmTrend = this.calculateE1RMTrend(recentSessions)
    const volumeTrend = this.calculateVolumeTrend(recentSessions)
    const rpeTrend = this.calculateRPETrend(recentSessions)
    
    // Detect plateau (no improvement over several sessions)
    const plateauDetected = this.detectPlateau(recentSessions)
    
    // Calculate consistency (how reliable the data is)
    const consistencyScore = this.calculateConsistencyScore(recentSessions)

    return {
      trend: e1rmTrend,
      plateauDetected,
      averageRPE: rpeTrend.average,
      lastSessionRPE: rpeTrend.latest,
      volumeTrend,
      consistencyScore
    }
  }

  /**
   * Group performed sets by training session
   */
  private groupSetsBySession(sets: PerformedSet[]) {
    // Group by session_id or by date if session_id not available
    const groups = sets.reduce((acc, set) => {
      const key = set.session_id || set.completed_at.split('T')[0]
      if (!acc[key]) acc[key] = []
      acc[key].push(set)
      return acc
    }, {} as Record<string, PerformedSet[]>)

    // Convert to array and sort by date
    return Object.values(groups).sort((a, b) => 
      new Date(a[0].completed_at).getTime() - new Date(b[0].completed_at).getTime()
    )
  }

  /**
   * Calculate e1RM trend over recent sessions
   */
  private calculateE1RMTrend(sessionGroups: PerformedSet[][]) {
    const e1rms = sessionGroups.map(session => {
      // Find the best set in the session (highest e1RM or calculated e1RM)
      const bestSet = session.reduce((best, set) => {
        const setE1RM = set.e1rm || this.estimateE1RM(set.weight, set.reps)
        const bestE1RM = best.e1rm || this.estimateE1RM(best.weight, best.reps)
        return setE1RM > bestE1RM ? set : best
      })
      
      return bestSet.e1rm || this.estimateE1RM(bestSet.weight, bestSet.reps)
    })

    if (e1rms.length < 3) return 'insufficient_data' as const

    // Calculate linear trend
    const improvements = e1rms.slice(1).map((e1rm, i) => e1rm - e1rms[i])
    const avgImprovement = improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length
    
    if (avgImprovement > 2) return 'improving' as const
    if (avgImprovement < -2) return 'declining' as const
    return 'plateau' as const
  }

  /**
   * Calculate volume trend over recent sessions
   */
  private calculateVolumeTrend(sessionGroups: PerformedSet[][]) {
    const volumes = sessionGroups.map(session => 
      session.reduce((total, set) => total + (set.reps * set.weight), 0)
    )

    if (volumes.length < 3) return 'stable' as const

    const recent = volumes.slice(-3).reduce((sum, vol) => sum + vol, 0) / 3
    const previous = volumes.slice(-6, -3).reduce((sum, vol) => sum + vol, 0) / 3

    if (recent > previous * 1.1) return 'increasing' as const
    if (recent < previous * 0.9) return 'decreasing' as const
    return 'stable' as const
  }

  /**
   * Calculate RPE trend over recent sessions
   */
  private calculateRPETrend(sessionGroups: PerformedSet[][]) {
    const sessionRPEs = sessionGroups
      .map(session => {
        const validRPEs = session.filter(set => set.rpe && set.rpe > 0).map(set => set.rpe!)
        return validRPEs.length > 0 
          ? validRPEs.reduce((sum, rpe) => sum + rpe, 0) / validRPEs.length
          : 0
      })
      .filter(rpe => rpe > 0)

    return {
      average: sessionRPEs.length > 0 ? sessionRPEs.reduce((sum, rpe) => sum + rpe, 0) / sessionRPEs.length : 0,
      latest: sessionRPEs[sessionRPEs.length - 1] || 0
    }
  }

  /**
   * Detect if the user has hit a plateau
   */
  private detectPlateau(sessionGroups: PerformedSet[][]): boolean {
    if (sessionGroups.length < this.config.plateauDetectionSensitivity) return false

    // Get e1RM for each session
    const recentE1RMs = sessionGroups.slice(-this.config.plateauDetectionSensitivity).map(session => {
      const bestSet = session.reduce((best, set) => {
        const setE1RM = set.e1rm || this.estimateE1RM(set.weight, set.reps)
        const bestE1RM = best.e1rm || this.estimateE1RM(best.weight, best.reps)
        return setE1RM > bestE1RM ? set : best
      })
      return bestSet.e1rm || this.estimateE1RM(bestSet.weight, bestSet.reps)
    })

    // Check if no improvement over the period
    const maxE1RM = Math.max(...recentE1RMs)
    const latestE1RM = recentE1RMs[recentE1RMs.length - 1]
    
    return latestE1RM < maxE1RM * this.config.deloadThreshold
  }

  /**
   * Calculate reliability score for the data
   */
  private calculateConsistencyScore(sessionGroups: PerformedSet[][]): number {
    if (sessionGroups.length < 3) return 0

    // Measure consistency of RPE and rep ranges
    const allRPEs = sessionGroups.flat().filter(set => set.rpe && set.rpe > 0).map(set => set.rpe!)
    const allReps = sessionGroups.flat().map(set => set.reps)

    if (allRPEs.length === 0) return 0.5 // Moderate confidence without RPE data

    // Calculate coefficient of variation for RPE (lower = more consistent)
    const rpeCV = this.coefficientOfVariation(allRPEs)
    const repsCV = this.coefficientOfVariation(allReps)

    // Convert to 0-1 score (lower CV = higher consistency)
    const rpeConsistency = Math.max(0, 1 - rpeCV / 2)
    const repsConsistency = Math.max(0, 1 - repsCV / 0.5)

    return (rpeConsistency + repsConsistency) / 2
  }

  /**
   * Calculate coefficient of variation
   */
  private coefficientOfVariation(values: number[]): number {
    if (values.length === 0) return 0
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    
    return mean === 0 ? 0 : stdDev / mean
  }

  /**
   * Determine the appropriate progression strategy
   */
  private determineProgressionStrategy(
    analysis: any,
    currentE1RM: number | null,
    previousBestE1RM: number | null
  ) {
    // If plateau detected and high RPE, recommend deload
    if (analysis.plateauDetected && analysis.lastSessionRPE >= 9) {
      return {
        type: 'deload' as const,
        deload: true,
        rationale: 'Plateau detected with high RPE - deload recommended'
      }
    }

    // If declining trend, be conservative
    if (analysis.trend === 'declining') {
      return {
        type: 'maintain' as const,
        deload: false,
        rationale: 'Declining performance - maintain current load'
      }
    }

    // If low RPE, progress weight
    if (analysis.lastSessionRPE > 0 && analysis.lastSessionRPE <= 7) {
      return {
        type: 'weight_increase' as const,
        deload: false,
        rationale: `Last RPE ${analysis.lastSessionRPE} - ready for weight increase`
      }
    }

    // If moderate RPE, try rep increase
    if (analysis.lastSessionRPE >= 8 && analysis.lastSessionRPE <= 9) {
      return {
        type: 'rep_increase' as const,
        deload: false,
        rationale: `Last RPE ${analysis.lastSessionRPE} - increase reps before weight`
      }
    }

    // Default to maintaining
    return {
      type: 'maintain' as const,
      deload: false,
      rationale: 'Insufficient data for progression recommendation'
    }
  }

  /**
   * Calculate recommended weight, reps, and sets
   */
  private calculateRecommendedLoad(
    exercise: Exercise,
    recentSets: PerformedSet[],
    strategy: any,
    analysis: any
  ) {
    const lastSession = this.getLastSessionSets(recentSets)
    
    if (lastSession.length === 0) {
      return this.getDefaultRecommendation(exercise)
    }

    // Find the best performing set from last session
    const bestLastSet = lastSession.reduce((best, set) => {
      const setE1RM = set.e1rm || this.estimateE1RM(set.weight, set.reps)
      const bestE1RM = best.e1rm || this.estimateE1RM(best.weight, best.reps)
      return setE1RM > bestE1RM ? set : best
    })

    let weight = bestLastSet.weight
    let reps = bestLastSet.reps
    let sets = lastSession.length
    let targetRPE = 8 // Default target

    switch (strategy.type) {
      case 'weight_increase':
        const increment = this.getProgressionIncrement(exercise.name)
        weight += increment
        targetRPE = analysis.lastSessionRPE + 1 // Expect slightly higher RPE
        break

      case 'rep_increase':
        reps = Math.min(reps + 1, reps + this.config.maxRepIncrease)
        targetRPE = analysis.lastSessionRPE + 0.5
        break

      case 'deload':
        weight *= 0.9 // 10% deload
        targetRPE = 7 // Lower intensity
        break

      case 'maintain':
      default:
        // Keep same load
        targetRPE = analysis.lastSessionRPE || 8
        break
    }

    // Calculate confidence based on data quality and consistency
    const confidence = this.calculateRecommendationConfidence(analysis, recentSets.length)

    return {
      weight: Math.round(weight * 4) / 4, // Round to nearest 0.25lbs
      reps,
      sets,
      targetRPE: Math.max(6, Math.min(9, targetRPE)), // Clamp to reasonable range
      confidence,
      rationale: strategy.rationale,
      progressionType: strategy.type
    }
  }

  /**
   * Get progression increment for an exercise
   */
  private getProgressionIncrement(exerciseName: string): number {
    // Check for exercise name patterns
    for (const [pattern, increment] of Object.entries(PROGRESSION_INCREMENTS)) {
      if (exerciseName.toLowerCase().includes(pattern.toLowerCase())) {
        return increment
      }
    }
    return PROGRESSION_INCREMENTS.default
  }

  /**
   * Calculate confidence in the recommendation
   */
  private calculateRecommendationConfidence(analysis: any, dataPoints: number): number {
    let confidence = 0.5 // Base confidence

    // More data points = higher confidence
    confidence += Math.min(dataPoints / 20, 0.3)

    // Higher consistency = higher confidence
    confidence += analysis.consistencyScore * 0.2

    // Recent trend data = higher confidence
    if (analysis.trend !== 'insufficient_data') {
      confidence += 0.1
    }

    return Math.max(0.1, Math.min(1.0, confidence))
  }

  /**
   * Get sets from the most recent training session
   */
  private getLastSessionSets(sets: PerformedSet[]): PerformedSet[] {
    if (sets.length === 0) return []

    // Sort by completion date and get the most recent session
    const sortedSets = sets.sort((a, b) => 
      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    )

    const mostRecentDate = sortedSets[0].completed_at.split('T')[0]
    return sortedSets.filter(set => set.completed_at.startsWith(mostRecentDate))
  }

  /**
   * Estimate e1RM using Brzycki formula
   */
  private estimateE1RM(weight: number, reps: number): number {
    if (reps === 1) return weight
    if (reps > 10) return weight // Don't estimate for high rep sets
    
    // Brzycki formula: 1RM = weight / (1.0278 - 0.0278 * reps)
    return Math.round(weight / (1.0278 - 0.0278 * reps))
  }

  /**
   * Calculate current e1RM from recent performance
   */
  private calculateCurrentE1RM(recentSets: PerformedSet[]): number | null {
    if (recentSets.length === 0) return null

    // Get the highest e1RM from recent sets
    const e1rms = recentSets
      .map(set => set.e1rm || this.estimateE1RM(set.weight, set.reps))
      .filter(e1rm => e1rm > 0)

    return e1rms.length > 0 ? Math.max(...e1rms) : null
  }

  /**
   * Find the previous best e1RM (before recent sessions)
   */
  private findPreviousBestE1RM(recentSets: PerformedSet[]): number | null {
    if (recentSets.length < 5) return null

    // Look at sets from earlier sessions (exclude most recent 3 sessions)
    const olderSets = recentSets.slice(3)
    return this.calculateCurrentE1RM(olderSets)
  }

  /**
   * Create progression plan for new users
   */
  private createBeginnerProgression(exercise: Exercise): ProgressionPlan {
    // Conservative starting weights based on exercise type
    const defaultWeights: Record<string, number> = {
      'Squat': 45,
      'Deadlift': 95,
      'Bench Press': 45,
      'Overhead Press': 25,
      'Row': 35,
      'default': 25
    }

    let startingWeight = defaultWeights.default
    for (const [pattern, weight] of Object.entries(defaultWeights)) {
      if (exercise.name.toLowerCase().includes(pattern.toLowerCase())) {
        startingWeight = weight
        break
      }
    }

    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      currentE1RM: null,
      previousBestE1RM: null,
      weight: startingWeight,
      reps: 8,
      sets: 3,
      targetRPE: 7,
      confidence: 0.6,
      rationale: 'Conservative starting weight for new exercise',
      progressionType: 'maintain',
      recentTrend: 'insufficient_data',
      plateauDetected: false,
      deloadRecommended: false,
      warmupRecommended: true,
      formFocusAreas: ['Focus on proper form', 'Start with lighter weight']
    }
  }

  /**
   * Get default recommendation when insufficient data
   */
  private getDefaultRecommendation(exercise: Exercise) {
    return {
      weight: 45,
      reps: 8,
      sets: 3,
      targetRPE: 7,
      confidence: 0.3,
      rationale: 'Insufficient training history - conservative recommendation',
      progressionType: 'maintain' as const
    }
  }

  /**
   * Get form focus areas based on progression strategy
   */
  private getFormFocusAreas(exercise: Exercise, strategy: any): string[] {
    const areas = []

    if (strategy.type === 'weight_increase') {
      areas.push('Maintain strict form with increased load')
      areas.push('Focus on controlled eccentric phase')
    }

    if (strategy.deload) {
      areas.push('Perfect technique at lighter weight')
      areas.push('Focus on mind-muscle connection')
    }

    // Exercise-specific cues
    if (exercise.name.toLowerCase().includes('squat')) {
      areas.push('Keep knees tracking over toes')
      areas.push('Maintain neutral spine')
    } else if (exercise.name.toLowerCase().includes('bench')) {
      areas.push('Retract shoulder blades')
      areas.push('Keep feet firmly planted')
    }

    return areas.length > 0 ? areas : ['Focus on proper form and control']
  }
}