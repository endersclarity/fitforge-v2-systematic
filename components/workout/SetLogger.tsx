/**
 * SetLogger Component
 * Interface for logging workout sets with progressive disclosure
 * Shows weight, reps, and optionally RPE based on user experience
 */

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { 
  WorkoutSet, 
  WorkoutSetInsert,
  Exercise,
  User,
  VALIDATION_RULES 
} from '@/schemas/typescript-interfaces'
import { StepperInput } from './StepperInput'
import { Button } from '@/components/ui/fitforge-button'
import { Card } from '@/components/ui/fitforge-card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Check, X, Edit2, Trash2, Trophy, TrendingUp, Clock, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export interface SetLoggerProps {
  /** Currently selected exercise */
  exercise: Exercise
  /** Current workout ID */
  workoutId: string
  /** User profile for progressive disclosure */
  user: User
  /** Existing sets for this exercise in current workout */
  existingSets: WorkoutSet[]
  /** Callback when a new set is added */
  onAddSet: (set: WorkoutSetInsert) => Promise<void>
  /** Callback when a set is updated */
  onUpdateSet: (setId: string, updates: Partial<WorkoutSetInsert>) => Promise<void>
  /** Callback when a set is deleted */
  onDeleteSet: (setId: string) => Promise<void>
  /** Last performed set for this exercise (from previous workouts) */
  lastPerformedSet?: WorkoutSet
  /** Personal best for this exercise */
  personalBest?: WorkoutSet
  /** Loading state */
  isLoading?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * SetLogger - Log workout sets with smart defaults and progressive disclosure
 * 
 * @example
 * ```tsx
 * <SetLogger
 *   exercise={selectedExercise}
 *   workoutId={currentWorkout.id}
 *   user={currentUser}
 *   existingSets={workoutSets}
 *   onAddSet={handleAddSet}
 *   onUpdateSet={handleUpdateSet}
 *   onDeleteSet={handleDeleteSet}
 *   lastPerformedSet={lastSet}
 *   personalBest={pbSet}
 * />
 * ```
 */
export const SetLogger: React.FC<SetLoggerProps> = ({
  exercise,
  workoutId,
  user,
  existingSets = [],
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  lastPerformedSet,
  personalBest,
  isLoading = false,
  className,
}) => {
  // Form state
  const [weight, setWeight] = useState(0)
  const [reps, setReps] = useState(10)
  const [rpe, setRpe] = useState(7)
  const [restSeconds, setRestSeconds] = useState(90)
  
  // UI state
  const [editingSetId, setEditingSetId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  console.log('🔥 [SetLogger] ENTRY - props:', {
    exercise: exercise.id,
    workoutId,
    existingSetsCount: existingSets.length,
    userFeatureLevel: user.feature_level,
    workoutCount: user.workout_count,
  })

  // Progressive disclosure flags
  const showRPE = user.workout_count >= 3
  const showRestTimer = user.workout_count >= 10
  const showVolumeCalculations = user.feature_level >= 2
  const showProgressIndicators = user.feature_level >= 3

  /**
   * Initialize form with smart defaults
   */
  useEffect(() => {
    console.log('🔧 [SetLogger] Setting smart defaults')
    
    // If we have existing sets, use the last one as default
    if (existingSets.length > 0) {
      const lastSet = existingSets[existingSets.length - 1]
      setWeight(lastSet.weight_lbs)
      setReps(lastSet.reps)
      if (lastSet.perceived_exertion) setRpe(lastSet.perceived_exertion)
      if (lastSet.rest_seconds) setRestSeconds(lastSet.rest_seconds)
    }
    // Otherwise, use last performed set from previous workouts
    else if (lastPerformedSet) {
      setWeight(lastPerformedSet.weight_lbs)
      setReps(lastPerformedSet.reps)
      if (lastPerformedSet.perceived_exertion) setRpe(lastPerformedSet.perceived_exertion)
    }
    // For unilateral exercises, start with lower weight
    else if (exercise.is_unilateral) {
      setWeight(25) // Default for unilateral
    }
    // Default for bilateral
    else {
      setWeight(45) // Standard barbell weight
    }
  }, [exercise, existingSets, lastPerformedSet])

  /**
   * Validate set data
   */
  const validateSet = (): string | null => {
    const rules = VALIDATION_RULES.workout_set

    if (weight < rules.weight_lbs.min || weight > rules.weight_lbs.max) {
      return `Weight must be between ${rules.weight_lbs.min} and ${rules.weight_lbs.max} lbs`
    }

    if (weight % rules.weight_lbs.increment !== 0) {
      return `Weight must be in ${rules.weight_lbs.increment} lb increments`
    }

    if (reps < rules.reps.min || reps > rules.reps.max) {
      return `Reps must be between ${rules.reps.min} and ${rules.reps.max}`
    }

    if (showRPE && (rpe < rules.perceived_exertion.min || rpe > rules.perceived_exertion.max)) {
      return `RPE must be between ${rules.perceived_exertion.min} and ${rules.perceived_exertion.max}`
    }

    return null
  }

  /**
   * Handle adding a new set
   */
  const handleAddSet = async () => {
    console.log('🔥 [handleAddSet] Starting with:', { weight, reps, rpe })
    
    const validationError = validateSet()
    if (validationError) {
      console.log('🚨 FAILURE CONDITION - Validation error:', validationError)
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const newSet: WorkoutSetInsert = {
        workout_id: workoutId,
        exercise_id: exercise.id,
        user_id: user.id,
        set_number: existingSets.length + 1,
        weight_lbs: weight,
        reps: reps,
        ...(showRPE && { perceived_exertion: rpe }),
        ...(showRestTimer && { rest_seconds: restSeconds }),
      }

      await onAddSet(newSet)

      // Check if this is a personal best
      const volume = weight * reps
      if (!personalBest || volume > personalBest.volume_lbs) {
        setSuccessMessage('🎉 New Personal Best!')
      } else {
        setSuccessMessage('Set logged successfully!')
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)

      console.log('🔧 [handleAddSet] SUCCESS')
    } catch (err: any) {
      console.log('🚨 FAILURE CONDITION - Add set error:', err)
      setError(err.message || 'Failed to add set')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handle updating an existing set
   */
  const handleUpdateSet = async (setId: string, updates: Partial<WorkoutSetInsert>) => {
    console.log('🔥 [handleUpdateSet] Updating:', { setId, updates })
    
    try {
      await onUpdateSet(setId, updates)
      setEditingSetId(null)
      console.log('🔧 [handleUpdateSet] SUCCESS')
    } catch (err: any) {
      console.log('🚨 FAILURE CONDITION - Update set error:', err)
      setError(err.message || 'Failed to update set')
    }
  }

  /**
   * Handle deleting a set
   */
  const handleDeleteSet = async (setId: string) => {
    console.log('🔥 [handleDeleteSet] Deleting:', setId)
    
    try {
      await onDeleteSet(setId)
      console.log('🔧 [handleDeleteSet] SUCCESS')
    } catch (err: any) {
      console.log('🚨 FAILURE CONDITION - Delete set error:', err)
      setError(err.message || 'Failed to delete set')
    }
  }

  /**
   * Calculate total volume
   */
  const totalVolume = existingSets.reduce((sum, set) => sum + set.volume_lbs, 0)
  const averageRPE = showRPE && existingSets.length > 0
    ? existingSets.reduce((sum, set) => sum + (set.perceived_exertion || 0), 0) / existingSets.length
    : null

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Exercise header */}
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{exercise.name}</h3>
            <p className="text-sm text-gray-400 mt-1">
              {exercise.equipment} • {exercise.category}
            </p>
          </div>
          <Badge variant="secondary">
            {existingSets.length} {existingSets.length === 1 ? 'set' : 'sets'}
          </Badge>
        </div>

        {/* Progress indicators */}
        {showProgressIndicators && (
          <div className="flex flex-wrap gap-4 mt-4">
            {lastPerformedSet && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-400">
                  Last: {lastPerformedSet.weight_lbs} × {lastPerformedSet.reps}
                </span>
              </div>
            )}
            {personalBest && (
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-[#FFD700]" />
                <span className="text-gray-400">
                  PB: {personalBest.weight_lbs} × {personalBest.reps}
                </span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Set entry form */}
      <Card className="p-4">
        <h4 className="text-sm font-medium text-gray-400 mb-4">Add New Set</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <StepperInput
            value={weight}
            onChange={setWeight}
            min={0}
            max={500}
            step={0.25}
            label="Weight"
            unit="lbs"
            decimalPlaces={2}
          />
          
          <StepperInput
            value={reps}
            onChange={setReps}
            min={1}
            max={50}
            step={1}
            label="Reps"
            unit="reps"
          />
        </div>

        {/* Progressive disclosure fields */}
        {showRPE && (
          <div className="mt-4">
            <StepperInput
              value={rpe}
              onChange={setRpe}
              min={1}
              max={10}
              step={1}
              label="RPE (Rate of Perceived Exertion)"
              unit="/10"
            />
            <p className="text-xs text-gray-500 mt-1">
              1-3: Easy • 4-6: Moderate • 7-8: Hard • 9-10: Maximum
            </p>
          </div>
        )}

        {showRestTimer && (
          <div className="mt-4">
            <StepperInput
              value={restSeconds}
              onChange={setRestSeconds}
              min={0}
              max={600}
              step={30}
              label="Rest Time"
              unit="sec"
            />
          </div>
        )}

        {/* Error/success messages */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mt-4 border-green-600 bg-green-900/20">
            <Zap className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-100">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Add set button */}
        <Button
          onClick={handleAddSet}
          disabled={isSubmitting}
          fullWidth
          className="mt-4"
        >
          {isSubmitting ? 'Adding...' : 'Add Set'}
        </Button>
      </Card>

      {/* Existing sets */}
      {existingSets.length > 0 && (
        <Card className="p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-4">Completed Sets</h4>
          
          <div className="space-y-2">
            {existingSets.map((set, index) => (
              <div
                key={set.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg',
                  'bg-[#2C2C2E] border border-[#3C3C3E]',
                  'transition-all duration-200',
                  editingSetId === set.id && 'ring-2 ring-[#FF375F]'
                )}
              >
                {editingSetId === set.id ? (
                  // Edit mode
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                    <input
                      type="number"
                      value={set.weight_lbs}
                      onChange={(e) => handleUpdateSet(set.id, { 
                        weight_lbs: parseFloat(e.target.value) 
                      })}
                      className="w-20 px-2 py-1 bg-[#1C1C1E] rounded text-sm"
                    />
                    <span className="text-gray-500">×</span>
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => handleUpdateSet(set.id, { 
                        reps: parseInt(e.target.value) 
                      })}
                      className="w-16 px-2 py-1 bg-[#1C1C1E] rounded text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingSetId(null)}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">#{index + 1}</span>
                      <div>
                        <span className="font-medium text-white">
                          {set.weight_lbs} lbs × {set.reps} reps
                        </span>
                        {showVolumeCalculations && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({set.volume_lbs} lbs total)
                          </span>
                        )}
                      </div>
                      
                      {/* Personal best indicator */}
                      {set.is_personal_best && (
                        <Trophy className="h-4 w-4 text-[#FFD700]" />
                      )}
                      
                      {/* Improvement indicator */}
                      {showProgressIndicators && set.improvement_vs_last && set.improvement_vs_last > 0 && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-500">
                            +{set.improvement_vs_last.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingSetId(set.id)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSet(set.id)}
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Summary stats */}
          {showVolumeCalculations && (
            <div className="mt-4 pt-4 border-t border-[#2C2C2E]">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Volume:</span>
                <span className="font-medium text-white">{totalVolume} lbs</span>
              </div>
              {averageRPE && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">Average RPE:</span>
                  <span className="font-medium text-white">{averageRPE.toFixed(1)}/10</span>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}