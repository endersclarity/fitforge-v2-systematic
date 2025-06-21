/**
 * FatigueAnalyzer - Muscle Recovery & Fatigue Assessment
 * 
 * This module analyzes workout history to determine:
 * - Which muscle groups are recovered and ready for training
 * - Current fatigue levels based on volume × RPE × recency
 * - Estimated recovery times for each muscle group
 * - Overall training readiness recommendations
 * 
 * Scientific Basis:
 * - Higher RPE sessions create more fatigue requiring longer recovery
 * - Volume load (sets × reps × weight) correlates with fatigue accumulation
 * - Different muscle groups have different recovery time constants
 * - Recent sessions have higher impact on current fatigue state
 */

import { dataService } from '../data-service'
import type { 
  FatigueAnalysis, 
  MuscleGroup, 
  FatigueAnalysisConfig,
  WorkoutSession,
  PerformedSet 
} from './types'

// Default muscle group recovery rates (hours for 50% recovery)
const DEFAULT_RECOVERY_RATES: Record<string, number> = {
  // Large muscle groups - slower recovery
  'Quadriceps': 72,
  'Hamstrings': 72,
  'Gluteus Maximus': 72,
  'Latissimus Dorsi': 60,
  'Pectoralis Major': 60,
  'Erector Spinae': 96, // Back muscles need more time
  
  // Medium muscle groups
  'Deltoids': 48,
  'Trapezius': 48,
  'Rhomboids': 48,
  'Triceps Brachii': 48,
  'Biceps Brachii': 48,
  
  // Small muscle groups - faster recovery
  'Forearms': 36,
  'Calves': 36,
  'Abs': 24,
  'Rotator Cuff': 36,
  
  // Core stability
  'Core': 48,
  'Obliques': 36
}

export class FatigueAnalyzer {
  private config: FatigueAnalysisConfig

  constructor(config?: Partial<FatigueAnalysisConfig>) {
    this.config = {
      lookbackDays: 7,
      rpeWeighting: 0.4,
      volumeWeighting: 0.3,
      recencyWeighting: 0.3,
      recoveryRates: DEFAULT_RECOVERY_RATES,
      ...config
    }
  }

  /**
   * Analyze current fatigue state for all muscle groups
   */
  async analyzeFatigue(userId: string, daysBack?: number): Promise<FatigueAnalysis> {
    const lookbackDays = daysBack || this.config.lookbackDays
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - lookbackDays)

    try {
      // Get recent workout sessions with performed sets
      const recentSessions = await this.getRecentWorkoutSessions(userId, cutoffDate)
      
      if (recentSessions.length === 0) {
        return this.createEmptyAnalysis(userId)
      }

      // Analyze fatigue for each muscle group
      const muscleGroups = await this.analyzeMuscleGroupFatigue(recentSessions)
      
      // Calculate overall metrics
      const overallRecoveryScore = this.calculateOverallRecovery(muscleGroups)
      const recommendations = this.generateRecommendations(muscleGroups)

      return {
        userId,
        analysisDate: new Date(),
        muscleGroups,
        overallRecoveryScore,
        recommendedFocus: recommendations.focus,
        deloadRecommended: recommendations.deload,
        readyForTraining: recommendations.ready,
        needingRest: recommendations.rest,
        summary: recommendations.summary
      }

    } catch (error) {
      console.error('Error analyzing fatigue:', error)
      throw new Error(`Failed to analyze fatigue for user ${userId}: ${error}`)
    }
  }

  /**
   * Get recent workout sessions with exercise and set data
   */
  private async getRecentWorkoutSessions(userId: string, cutoffDate: Date) {
    // Use our proven Data Access Layer
    const sessions = await dataService.getWorkoutSessions(userId, 20) // Get recent sessions
    
    // Filter to cutoff date and enrich with set data
    const recentSessions = sessions.filter(session => 
      new Date(session.start_time) >= cutoffDate
    )

    // Enrich each session with performed sets and exercise data
    const enrichedSessions = await Promise.all(
      recentSessions.map(async (session) => {
        const sets = await dataService.getPerformedSets(session.id)
        const exercises = await Promise.all(
          [...new Set(sets.map(set => set.exercise_id))].map(id => 
            dataService.getExerciseById(id)
          )
        )
        
        return {
          ...session,
          performedSets: sets,
          exercises: exercises.filter(Boolean)
        }
      })
    )

    return enrichedSessions
  }

  /**
   * Analyze fatigue for each muscle group based on recent training
   */
  private async analyzeMuscleGroupFatigue(sessions: any[]): Promise<Record<string, MuscleGroup>> {
    const muscleGroupData: Record<string, MuscleGroup> = {}

    // Get all unique muscle groups from exercises
    const allMuscleGroups = new Set<string>()
    sessions.forEach(session => {
      session.exercises.forEach((exercise: any) => {
        Object.keys(exercise.muscle_engagement || {}).forEach(muscle => {
          allMuscleGroups.add(muscle)
        })
      })
    })

    // Analyze each muscle group
    for (const muscleGroup of allMuscleGroups) {
      muscleGroupData[muscleGroup] = await this.calculateMuscleGroupFatigue(
        sessions,
        muscleGroup
      )
    }

    return muscleGroupData
  }

  /**
   * Calculate fatigue for a specific muscle group
   */
  private async calculateMuscleGroupFatigue(
    sessions: any[],
    muscleGroupName: string
  ): Promise<MuscleGroup> {
    let totalVolume = 0
    let totalRPE = 0
    let rpeCount = 0
    let lastTrainedDate: Date | null = null
    const now = new Date()

    // Analyze each session for this muscle group
    for (const session of sessions) {
      const sessionDate = new Date(session.start_time)
      let sessionVolume = 0
      let sessionRPE = 0
      let sessionRPECount = 0

      // Check each exercise in the session
      for (const exercise of session.exercises) {
        const muscleEngagement = exercise.muscle_engagement?.[muscleGroupName] || 0
        
        if (muscleEngagement > 0) {
          // This exercise targets our muscle group
          const exerciseSets = session.performedSets.filter(
            (set: any) => set.exercise_id === exercise.id
          )

          for (const set of exerciseSets) {
            if (set.completed) {
              // Calculate volume contribution (weighted by muscle engagement)
              const setVolume = (set.reps * set.weight * muscleEngagement) / 100
              sessionVolume += setVolume

              // Track RPE if available
              if (set.rpe && set.rpe > 0) {
                sessionRPE += set.rpe
                sessionRPECount++
              }
            }
          }

          // Update last trained date if this exercise significantly targets the muscle
          if (muscleEngagement >= 20 && (!lastTrainedDate || sessionDate > lastTrainedDate)) {
            lastTrainedDate = sessionDate
          }
        }
      }

      // Apply recency weighting (more recent sessions matter more)
      const daysAgo = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      const recencyWeight = Math.exp(-daysAgo / 3) // Exponential decay over 3 days

      totalVolume += sessionVolume * recencyWeight
      
      if (sessionRPECount > 0) {
        const avgSessionRPE = sessionRPE / sessionRPECount
        totalRPE += avgSessionRPE * recencyWeight
        rpeCount += recencyWeight
      }
    }

    // Calculate metrics
    const averageRPE = rpeCount > 0 ? totalRPE / rpeCount : 0
    const daysSinceLastTrained = lastTrainedDate 
      ? (now.getTime() - lastTrainedDate.getTime()) / (1000 * 60 * 60 * 24)
      : 999 // Very large number if never trained

    // Calculate fatigue score (0-100)
    const fatigueScore = this.calculateFatigueScore(
      totalVolume,
      averageRPE,
      daysSinceLastTrained,
      muscleGroupName
    )

    // Determine status and recovery
    const status = this.determineFatigueStatus(fatigueScore, daysSinceLastTrained)
    const estimatedRecoveryDate = this.estimateRecoveryDate(
      fatigueScore,
      muscleGroupName,
      lastTrainedDate
    )

    return {
      name: muscleGroupName,
      fatigueScore,
      status,
      lastTrainedDate,
      estimatedRecoveryDate,
      volumeLastWeek: totalVolume,
      averageRPE,
      daysSinceLastTrained,
      recoveryRecommendation: this.generateRecoveryRecommendation(
        status,
        fatigueScore,
        daysSinceLastTrained
      )
    }
  }

  /**
   * Calculate fatigue score using volume, RPE, and recency
   */
  private calculateFatigueScore(
    volume: number,
    avgRPE: number,
    daysSince: number,
    muscleGroup: string
  ): number {
    // Base fatigue from volume (normalized)
    const volumeFatigue = Math.min(volume / 1000, 100) * this.config.volumeWeighting

    // RPE contribution (higher RPE = more fatigue)
    const rpeFatigue = avgRPE > 0 
      ? (avgRPE / 10) * 100 * this.config.rpeWeighting
      : 0

    // Time-based recovery (fatigue decreases over time)
    const recoveryRate = this.config.recoveryRates[muscleGroup] || 48
    const timeRecovery = Math.max(0, 100 - (daysSince / recoveryRate) * 100)

    // Combine factors
    const rawFatigue = (volumeFatigue + rpeFatigue) * (timeRecovery / 100)
    
    // Apply recency weighting
    const recencyFactor = Math.exp(-daysSince / 2) * this.config.recencyWeighting
    const finalFatigue = rawFatigue * (1 + recencyFactor)

    return Math.max(0, Math.min(100, finalFatigue))
  }

  /**
   * Determine fatigue status based on score and time
   */
  private determineFatigueStatus(fatigueScore: number, daysSince: number): 'Recovered' | 'Recovering' | 'Fatigued' {
    if (fatigueScore < 20 && daysSince >= 2) return 'Recovered'
    if (fatigueScore < 50) return 'Recovering'
    return 'Fatigued'
  }

  /**
   * Estimate when muscle group will be fully recovered
   */
  private estimateRecoveryDate(
    fatigueScore: number,
    muscleGroup: string,
    lastTrained: Date | null
  ): Date | null {
    if (!lastTrained || fatigueScore < 20) return null

    const recoveryRate = this.config.recoveryRates[muscleGroup] || 48
    const hoursToRecovery = (fatigueScore / 100) * recoveryRate
    
    const recoveryDate = new Date(lastTrained)
    recoveryDate.setHours(recoveryDate.getHours() + hoursToRecovery)
    
    return recoveryDate
  }

  /**
   * Generate human-readable recovery recommendation
   */
  private generateRecoveryRecommendation(
    status: string,
    fatigueScore: number,
    daysSince: number
  ): string {
    switch (status) {
      case 'Recovered':
        return `Fully recovered and ready for training`
      case 'Recovering':
        return `Partially recovered (${Math.round(100 - fatigueScore)}%). Light training OK.`
      case 'Fatigued':
        if (daysSince < 1) {
          return `Recently trained hard. Allow 24-48h recovery.`
        }
        return `High fatigue detected. Consider rest or light training only.`
      default:
        return 'Status unknown'
    }
  }

  /**
   * Calculate overall recovery score across all muscle groups
   */
  private calculateOverallRecovery(muscleGroups: Record<string, MuscleGroup>): number {
    const groups = Object.values(muscleGroups)
    if (groups.length === 0) return 100

    const recoveryScores = groups.map(group => 100 - group.fatigueScore)
    return recoveryScores.reduce((sum, score) => sum + score, 0) / groups.length
  }

  /**
   * Generate training recommendations based on fatigue analysis
   */
  private generateRecommendations(muscleGroups: Record<string, MuscleGroup>) {
    const groups = Object.values(muscleGroups)
    
    const ready = groups
      .filter(g => g.status === 'Recovered')
      .map(g => g.name)
    
    const rest = groups
      .filter(g => g.status === 'Fatigued')
      .map(g => g.name)
    
    const focus = groups
      .filter(g => g.status === 'Recovered' && g.daysSinceLastTrained >= 2)
      .sort((a, b) => b.daysSinceLastTrained - a.daysSinceLastTrained)
      .slice(0, 3)
      .map(g => g.name)
    
    // Recommend deload if too many muscle groups are fatigued
    const fatigueRatio = rest.length / groups.length
    const deload = fatigueRatio > 0.6 || groups.some(g => g.fatigueScore > 80)
    
    // Generate summary
    let summary = ''
    if (ready.length > rest.length) {
      summary = `Good recovery state. Ready to train ${ready.slice(0, 2).join(', ')}.`
    } else if (rest.length > 0) {
      summary = `High fatigue in ${rest.slice(0, 2).join(', ')}. Consider lighter training.`
    } else {
      summary = 'Balanced recovery state. Normal training recommended.'
    }

    return {
      focus,
      ready,
      rest,
      deload,
      summary
    }
  }

  /**
   * Create empty analysis for users with no training history
   */
  private createEmptyAnalysis(userId: string): FatigueAnalysis {
    return {
      userId,
      analysisDate: new Date(),
      muscleGroups: {},
      overallRecoveryScore: 100,
      recommendedFocus: [],
      deloadRecommended: false,
      readyForTraining: [],
      needingRest: [],
      summary: 'No recent training data available. All muscle groups ready for training.'
    }
  }
}