/**
 * WorkoutLogger Component
 * Main workout logging interface that orchestrates exercise selection,
 * set logging, and workout management with progressive disclosure
 */

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useWorkoutLogger } from '@/hooks/useWorkoutLogger'
import { User, Exercise, Workout } from '@/schemas/typescript-interfaces'
import { ExerciseSelector } from './ExerciseSelector'
import { SetLogger } from './SetLogger'
import { Button } from '@/components/ui/fitforge-button'
import { Card } from '@/components/ui/fitforge-card'
import { Input } from '@/components/ui/fitforge-input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Dumbbell, 
  Plus, 
  Clock, 
  TrendingUp, 
  Activity,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export interface WorkoutLoggerProps {
  /** Current user */
  user: User
  /** Initial workout (if editing existing) */
  initialWorkout?: Workout
  /** Callback when workout is completed */
  onWorkoutComplete?: (workout: Workout) => void
  /** Show in compact mode */
  compact?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * WorkoutLogger - Comprehensive workout logging interface
 * 
 * @example
 * ```tsx
 * <WorkoutLogger
 *   user={currentUser}
 *   onWorkoutComplete={handleWorkoutComplete}
 * />
 * ```
 */
export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  user,
  initialWorkout,
  onWorkoutComplete,
  compact = false,
  className,
}) => {
  // Hook for workout state management
  const {
    workout,
    isCreatingWorkout,
    selectedExercise,
    exerciseHistory,
    workoutSets,
    pendingSets,
    failedSets,
    isLoading,
    isSyncing,
    error,
    createWorkout,
    selectExercise,
    addSet,
    updateSet,
    deleteSet,
    completeWorkout,
    getLastPerformedSet,
    getPersonalBest,
    retryFailedSets,
    clearError,
  } = useWorkoutLogger({ user, initialWorkout })

  // Local UI state
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [workoutName, setWorkoutName] = useState('')
  const [workoutNotes, setWorkoutNotes] = useState('')
  const [energyLevel, setEnergyLevel] = useState(3)
  const [isCompleting, setIsCompleting] = useState(false)
  const [activeTab, setActiveTab] = useState<'current' | 'exercises'>('current')

  console.log('🔥 [WorkoutLogger] ENTRY - props:', {
    userId: user.id,
    hasWorkout: !!workout,
    selectedExerciseId: selectedExercise?.id,
    setsCount: workoutSets.length,
    compact,
  })

  // Online/offline detection
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  /**
   * Start a new workout
   */
  const handleStartWorkout = async () => {
    console.log('🔥 [handleStartWorkout] Starting new workout')
    
    try {
      await createWorkout({
        name: workoutName || undefined,
        notes: workoutNotes || undefined,
      })
      
      setActiveTab('exercises')
    } catch (err) {
      console.log('🚨 FAILURE CONDITION - Failed to start workout:', err)
    }
  }

  /**
   * Complete the workout
   */
  const handleCompleteWorkout = async () => {
    console.log('🔥 [handleCompleteWorkout] Completing workout')
    setIsCompleting(true)
    
    try {
      await completeWorkout(workoutNotes, energyLevel)
      
      if (workout && onWorkoutComplete) {
        onWorkoutComplete(workout)
      }
    } catch (err) {
      console.log('🚨 FAILURE CONDITION - Failed to complete workout:', err)
    } finally {
      setIsCompleting(false)
    }
  }

  /**
   * Handle exercise selection
   */
  const handleSelectExercise = (exercise: Exercise) => {
    console.log('🔥 [handleSelectExercise] Selected:', exercise.id)
    selectExercise(exercise)
    setShowExerciseSelector(false)
    setActiveTab('current')
  }

  /**
   * Get sets for current exercise
   */
  const currentExerciseSets = selectedExercise
    ? workoutSets.filter(set => set.exercise_id === selectedExercise.id)
    : []

  /**
   * Group sets by exercise for summary
   */
  const setsByExercise = workoutSets.reduce((acc, set) => {
    if (!acc[set.exercise_id]) {
      acc[set.exercise_id] = []
    }
    acc[set.exercise_id].push(set)
    return acc
  }, {} as Record<string, typeof workoutSets>)

  /**
   * Calculate workout duration
   */
  const workoutDuration = workout?.started_at
    ? formatDistanceToNow(new Date(workout.started_at), { includeSeconds: true })
    : null

  // Render workout not started state
  if (!workout) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center space-y-4">
          <Dumbbell className="h-12 w-12 text-gray-500 mx-auto" />
          <h3 className="text-lg font-semibold text-white">Ready to start your workout?</h3>
          
          <div className="max-w-sm mx-auto space-y-3">
            <Input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="Workout name (optional)"
              className="text-center"
            />
            
            <Button
              onClick={handleStartWorkout}
              disabled={isCreatingWorkout}
              size="lg"
              fullWidth
            >
              {isCreatingWorkout ? 'Starting...' : 'Start Workout'}
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // Main workout interface
  return (
    <div className={cn('space-y-4', className)}>
      {/* Workout header */}
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">
              {workout.name || 'Current Workout'}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{workoutDuration || 'Just started'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                <span>{workoutSets.length} sets</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>{workout.total_volume_lbs || 0} lbs</span>
              </div>
            </div>
          </div>
          
          {/* Connection status */}
          <div className="flex items-center gap-2">
            {!isOnline && (
              <Badge variant="secondary" className="bg-yellow-900 text-yellow-100">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
            
            {failedSets.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={retryFailedSets}
                disabled={isSyncing}
              >
                <RefreshCw className={cn(
                  'h-4 w-4 mr-1',
                  isSyncing && 'animate-spin'
                )} />
                Sync {failedSets.length}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-2"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">
            Current Exercise
            {selectedExercise && (
              <Badge variant="secondary" className="ml-2">
                {currentExerciseSets.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="exercises">
            All Exercises
            <Badge variant="secondary" className="ml-2">
              {Object.keys(setsByExercise).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Current exercise tab */}
        <TabsContent value="current" className="space-y-4 mt-4">
          {selectedExercise ? (
            <>
              <SetLogger
                exercise={selectedExercise}
                workoutId={workout.id}
                user={user}
                existingSets={currentExerciseSets}
                onAddSet={addSet}
                onUpdateSet={updateSet}
                onDeleteSet={deleteSet}
                lastPerformedSet={getLastPerformedSet(selectedExercise.id)}
                personalBest={getPersonalBest(selectedExercise.id)}
                isLoading={isLoading}
              />
              
              <Button
                variant="secondary"
                onClick={() => setShowExerciseSelector(true)}
                fullWidth
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Different Exercise
              </Button>
            </>
          ) : (
            <Card className="p-8 text-center">
              <Dumbbell className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No exercise selected
              </h3>
              <p className="text-gray-400 mb-4">
                Select an exercise to start logging sets
              </p>
              <Button onClick={() => setShowExerciseSelector(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Select Exercise
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* All exercises tab */}
        <TabsContent value="exercises" className="mt-4">
          {Object.keys(setsByExercise).length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {Object.entries(setsByExercise).map(([exerciseId, sets]) => {
                  const exercise = exerciseHistory.get(exerciseId)
                  if (!exercise) return null
                  
                  const totalVolume = sets.reduce((sum, set) => sum + set.volume_lbs, 0)
                  
                  return (
                    <Card
                      key={exerciseId}
                      className={cn(
                        'p-4 cursor-pointer transition-all',
                        'hover:bg-[#2C2C2E]',
                        selectedExercise?.id === exerciseId && 'ring-2 ring-[#FF375F]'
                      )}
                      onClick={() => selectExercise(exercise)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-white">
                            {exercise.name}
                          </h4>
                          <p className="text-sm text-gray-400 mt-1">
                            {sets.length} sets • {totalVolume} lbs total
                          </p>
                        </div>
                        
                        <Badge variant="secondary">
                          {sets.length}
                        </Badge>
                      </div>
                      
                      {/* Set details */}
                      <div className="mt-3 space-y-1">
                        {sets.map((set, index) => (
                          <div key={set.id} className="text-xs text-gray-500">
                            Set {index + 1}: {set.weight_lbs} lbs × {set.reps} reps
                          </div>
                        ))}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          ) : (
            <Card className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No exercises logged yet
              </h3>
              <p className="text-gray-400 mb-4">
                Add exercises to track your workout
              </p>
              <Button onClick={() => setShowExerciseSelector(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Complete workout section */}
      {workoutSets.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Complete Workout
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-400">Energy Level</label>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <Button
                    key={level}
                    variant={energyLevel === level ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setEnergyLevel(level)}
                    className="flex-1"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
            
            <Input
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="Workout notes (optional)"
              as="textarea"
              rows={3}
            />
            
            <Button
              variant="success"
              onClick={handleCompleteWorkout}
              disabled={isCompleting || isSyncing}
              fullWidth
            >
              {isCompleting ? (
                <>Completing...</>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Workout
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Exercise selector modal/sheet */}
      <ExerciseSelector
        selectedExercise={selectedExercise}
        onSelectExercise={handleSelectExercise}
        userId={user.id}
        isOpen={showExerciseSelector}
        onClose={() => setShowExerciseSelector(false)}
        availableEquipment={user.available_equipment}
      />
    </div>
  )
}