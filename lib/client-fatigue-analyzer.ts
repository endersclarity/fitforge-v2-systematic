/**
 * Client-side Fatigue Analyzer for localStorage data
 * Simplified version that works without backend dependencies
 */

import exercisesData from '@/data/exercises-real.json'

interface LocalStorageWorkoutSession {
  id: string
  date: string
  exercises: Array<{
    id: string
    name: string
    sets: Array<{
      weight: number
      reps: number
      completed: boolean
      rpe?: number
    }>
  }>
}

interface MuscleGroup {
  name: string
  fatigueScore: number
  status: 'Recovered' | 'Recovering' | 'Fatigued'
  lastTrainedDate: Date | null
  estimatedRecoveryDate: Date | null
  volumeLastWeek: number
  averageRPE: number
  daysSinceLastTrained: number
  recoveryRecommendation: string
}

interface FatigueAnalysis {
  userId: string
  analysisDate: Date
  muscleGroups: Record<string, MuscleGroup>
  overallRecoveryScore: number
  recommendedFocus: string[]
  deloadRecommended: boolean
  readyForTraining: string[]
  needingRest: string[]
  summary: string
}

// Default muscle group recovery rates (hours for 50% recovery)
const DEFAULT_RECOVERY_RATES: Record<string, number> = {
  // Large muscle groups - slower recovery
  'Quadriceps': 72,
  'Hamstrings': 72,
  'Gluteus_Maximus': 72,
  'Latissimus_Dorsi': 60,
  'Pectoralis_Major': 60,
  'Erector_Spinae': 96,
  
  // Medium muscle groups
  'Deltoids': 48,
  'Trapezius': 48,
  'Rhomboids': 48,
  'Triceps_Brachii': 48,
  'Biceps_Brachii': 48,
  
  // Small muscle groups - faster recovery
  'Forearms': 36,
  'Gastrocnemius': 36,
  'Abs': 24,
  'Rotator_Cuff': 36,
  
  // Core stability
  'Core': 48,
  'Obliques': 36
}

export class ClientFatigueAnalyzer {
  private recoveryRates: Record<string, number>

  constructor() {
    this.recoveryRates = DEFAULT_RECOVERY_RATES
  }

  /**
   * Analyze fatigue from localStorage workout data
   */
  async analyzeFatigue(userId: string = 'demo-user', daysBack: number = 7): Promise<FatigueAnalysis> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysBack)

    try {
      // Get workout sessions from localStorage
      const sessionsJson = localStorage.getItem('workoutSessions')
      const sessions: LocalStorageWorkoutSession[] = sessionsJson ? JSON.parse(sessionsJson) : []
      
      if (sessions.length === 0) {
        return this.createEmptyAnalysis(userId)
      }

      // Filter to recent sessions
      const recentSessions = sessions.filter(session => 
        new Date(session.date) >= cutoffDate
      )

      // Analyze fatigue for each muscle group
      const muscleGroups = this.analyzeMuscleGroupFatigue(recentSessions)
      
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
      return this.createEmptyAnalysis(userId)
    }
  }

  /**
   * Analyze fatigue for each muscle group
   */
  private analyzeMuscleGroupFatigue(sessions: LocalStorageWorkoutSession[]): Record<string, MuscleGroup> {
    const muscleGroupData: Record<string, MuscleGroup> = {}
    const now = new Date()

    // Process each session
    sessions.forEach(session => {
      const sessionDate = new Date(session.date)
      
      session.exercises.forEach(exercise => {
        // Find exercise data with muscle engagement
        const exerciseData = exercisesData.find(ex => 
          ex.name.toLowerCase() === exercise.name.toLowerCase() ||
          ex.id === exercise.id
        )
        
        if (!exerciseData || !exerciseData.muscleEngagement) return
        
        // Process each muscle engagement
        Object.entries(exerciseData.muscleEngagement).forEach(([muscle, engagement]) => {
          if (engagement === 0) return
          
          // Initialize muscle data if not exists
          if (!muscleGroupData[muscle]) {
            muscleGroupData[muscle] = {
              name: muscle,
              fatigueScore: 0,
              status: 'Recovered',
              lastTrainedDate: null,
              estimatedRecoveryDate: null,
              volumeLastWeek: 0,
              averageRPE: 0,
              daysSinceLastTrained: 999,
              recoveryRecommendation: ''
            }
          }
          
          // Calculate volume from completed sets
          const completedSets = exercise.sets.filter(set => set.completed)
          const sessionVolume = completedSets.reduce((sum, set) => 
            sum + (set.weight * set.reps * (engagement / 100)), 0
          )
          
          // Update muscle data
          muscleGroupData[muscle].volumeLastWeek += sessionVolume
          
          // Update last trained date
          if (!muscleGroupData[muscle].lastTrainedDate || sessionDate > muscleGroupData[muscle].lastTrainedDate) {
            muscleGroupData[muscle].lastTrainedDate = sessionDate
          }
          
          // Track RPE
          const setRPEs = completedSets.map(set => set.rpe || 5).filter(rpe => rpe > 0)
          if (setRPEs.length > 0) {
            const avgRPE = setRPEs.reduce((sum, rpe) => sum + rpe, 0) / setRPEs.length
            muscleGroupData[muscle].averageRPE = avgRPE
          }
        })
      })
    })

    // Calculate fatigue scores based on time since last trained
    Object.values(muscleGroupData).forEach(muscle => {
      if (muscle.lastTrainedDate) {
        const daysSince = (now.getTime() - muscle.lastTrainedDate.getTime()) / (1000 * 60 * 60 * 24)
        muscle.daysSinceLastTrained = Math.floor(daysSince)
        
        // Calculate fatigue based on recovery rate
        const recoveryRate = this.recoveryRates[muscle.name] || 48
        const recoveryPerDay = 100 / (recoveryRate / 24) // Convert hours to days
        const recoveryPercentage = Math.min(100, daysSince * recoveryPerDay)
        
        muscle.fatigueScore = Math.max(0, 100 - recoveryPercentage)
        
        // Determine status
        if (muscle.fatigueScore < 20) {
          muscle.status = 'Recovered'
          muscle.recoveryRecommendation = 'Fully recovered and ready for training'
        } else if (muscle.fatigueScore < 50) {
          muscle.status = 'Recovering'
          muscle.recoveryRecommendation = `Partially recovered (${Math.round(100 - muscle.fatigueScore)}%). Light training OK.`
        } else {
          muscle.status = 'Fatigued'
          muscle.recoveryRecommendation = 'High fatigue detected. Consider rest or light training only.'
        }
        
        // Estimate recovery date
        if (muscle.fatigueScore > 20) {
          const hoursToRecovery = (muscle.fatigueScore / 100) * recoveryRate
          muscle.estimatedRecoveryDate = new Date(now.getTime() + hoursToRecovery * 60 * 60 * 1000)
        }
      }
    })

    return muscleGroupData
  }

  /**
   * Calculate overall recovery score
   */
  private calculateOverallRecovery(muscleGroups: Record<string, MuscleGroup>): number {
    const groups = Object.values(muscleGroups)
    if (groups.length === 0) return 100
    
    const recoveryScores = groups.map(group => 100 - group.fatigueScore)
    return recoveryScores.reduce((sum, score) => sum + score, 0) / groups.length
  }

  /**
   * Generate training recommendations
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
    
    const fatigueRatio = rest.length / groups.length
    const deload = fatigueRatio > 0.6 || groups.some(g => g.fatigueScore > 80)
    
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