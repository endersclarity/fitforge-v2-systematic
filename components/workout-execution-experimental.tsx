'use client'

import { CheckCircle, Dumbbell } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { RestTimer } from './rest-timer'
import { RPERatingModal } from './rpe-rating-modal'
import { BatchRPEModal } from './batch-rpe-modal'
import { ExerciseReplacementModal } from './exercise-replacement-modal'
import { useRealTimeMuscleVolume } from '@/hooks/useRealTimeMuscleVolume'
import { useWorkoutSession } from '@/hooks/useWorkoutSession'
import { useSetLogging } from '@/hooks/useSetLogging'
import { useWorkoutProgress } from '@/hooks/useWorkoutProgress'
import { WorkoutHeader } from './workout-header'
import { SetLoggingForm } from './set-logging-form'
import { WorkoutProgress } from './workout-progress'
import { ExerciseQueue } from './exercise-queue'

export function WorkoutExecutionExperimental() {
  // Custom hooks for state management
  const workoutSession = useWorkoutSession()
  const setLogging = useSetLogging({
    getCurrentPlannedSet: workoutSession.getCurrentPlannedSet,
    getExercisePlannedSets: workoutSession.getExercisePlannedSets
  })
  const workoutProgress = useWorkoutProgress()

  // Real-time muscle volume calculation
  const muscleVolumeData = useRealTimeMuscleVolume(
    workoutSession.workoutQueue.map((exercise, index) => ({
      ...exercise,
      plannedSets: setLogging.sets
        .filter(set => set.exerciseId === exercise.id && set.completed)
        .map((set, setIndex) => ({
          id: set.id,
          exerciseId: set.exerciseId,
          setNumber: setIndex + 1,
          targetWeight: set.weight,
          targetReps: set.reps,
        }))
    }))
  )

  // Derived values
  const currentExercise = workoutSession.currentExercise
  const exerciseSets = setLogging.getExerciseSets(currentExercise?.id || '')

  // Event handlers using hook methods
  const handleAddSet = () => {
    setLogging.addSet(currentExercise)
  }

  const handleCompleteSetWithRPE = (rpe: number) => {
    const setCompleted = setLogging.completeSetWithRPE(rpe, currentExercise)
    if (setCompleted) {
      workoutProgress.startRestTimer()
    }
  }

  const handleLogAllSets = () => {
    setLogging.logAllSets(currentExercise)
  }

  const handleCompleteBatchSetsWithRPE = (rpe: number) => {
    const setsCompleted = setLogging.completeBatchSetsWithRPE(rpe, currentExercise)
    if (setsCompleted) {
      workoutProgress.startRestTimer()
    }
  }

  const handleNextExercise = () => {
    const newIndex = workoutSession.nextExercise()
    const nextExercise = workoutSession.workoutQueue[newIndex]
    if (nextExercise) {
      setLogging.populateFirstPlannedSet(nextExercise)
    }
  }

  const handlePreviousExercise = () => {
    const newIndex = workoutSession.previousExercise()
    const prevExercise = workoutSession.workoutQueue[newIndex]
    if (prevExercise) {
      setLogging.resetSetForm()
    }
  }

  const handleReplaceExercise = (newExercise) => {
    workoutSession.replaceExercise(newExercise)
    
    // Clear current inputs and sets for replaced exercise
    setLogging.resetSetForm()
    setLogging.setSets(prev => prev.filter(set => set.exerciseId !== currentExercise.id))
    
    workoutProgress.closeReplaceModal()
  }

  const handleFinishWorkout = () => {
    workoutSession.finishWorkout(setLogging.sets)
  }

  if (workoutSession.isWorkoutComplete) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <Card className="bg-[#1C1C1E] border-[#2C2C2E] max-w-md w-full text-center">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-[#FF375F] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Experimental Workout Complete!</h2>
            <p className="text-[#A1A1A3] mb-4">
              Great job! You completed {setLogging.sets.length} sets across {workoutSession.workoutQueue.length} exercises with advanced tracking.
            </p>
            <p className="text-[#A1A1A3]">
              Duration: {workoutSession.formatTime(workoutSession.elapsedTime)}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="h-12 w-12 text-[#A1A1A3] mx-auto mb-4" />
          <p className="text-[#A1A1A3]">Loading experimental workout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <WorkoutHeader 
        elapsedTime={workoutSession.elapsedTime}
        onFinishWorkout={handleFinishWorkout}
        isFinishDisabled={setLogging.sets.length === 0}
      />

      {/* Workout Progress */}
      <WorkoutProgress
        currentExerciseIndex={workoutSession.currentExerciseIndex}
        workoutQueue={workoutSession.workoutQueue}
        currentExercise={currentExercise}
        muscleVolumeData={muscleVolumeData}
        exerciseNotes={workoutSession.exerciseNotes}
        showExerciseMenu={workoutProgress.showExerciseMenu}
        setShowExerciseMenu={workoutProgress.setShowExerciseMenu}
        setShowReplaceModal={workoutProgress.setShowReplaceModal}
        updateExerciseNotes={workoutSession.updateExerciseNotes}
      />

      <div className="p-4">
        {/* Set Logging Form */}
        <SetLoggingForm
          currentExercise={currentExercise}
          currentWeight={setLogging.currentWeight}
          setCurrentWeight={setLogging.setCurrentWeight}
          currentReps={setLogging.currentReps}
          setCurrentReps={setLogging.setCurrentReps}
          isWarmupSet={setLogging.isWarmupSet}
          setIsWarmupSet={setLogging.setIsWarmupSet}
          setNotes={setLogging.setNotes}
          setSetNotes={setLogging.setSetNotes}
          exerciseSets={exerciseSets}
          getCurrentPlannedSet={workoutSession.getCurrentPlannedSet}
          onAddSet={handleAddSet}
        />

        {/* Exercise Queue Component - Consolidated UI */}
        <ExerciseQueue
          currentExercise={currentExercise}
          exerciseSets={exerciseSets}
          workoutPlan={workoutSession.workoutPlan}
          currentWeight={setLogging.currentWeight}
          currentReps={setLogging.currentReps}
          currentExerciseIndex={workoutSession.currentExerciseIndex}
          workoutQueue={workoutSession.workoutQueue}
          getExercisePlannedSets={workoutSession.getExercisePlannedSets}
          logAllSets={handleLogAllSets}
          removeSet={setLogging.removeSet}
          getRPEColor={setLogging.getRPEColor}
          previousExercise={handlePreviousExercise}
          nextExercise={handleNextExercise}
        />
      </div>

      {/* Rest Timer */}
      {workoutProgress.showRestTimer && (
        <RestTimer
          onComplete={workoutProgress.handleRestTimerComplete}
        />
      )}

      {/* RPE Rating Modal */}
      {setLogging.showRPEModal && setLogging.pendingSet && (
        <RPERatingModal
          isOpen={setLogging.showRPEModal}
          onClose={() => {
            setLogging.setShowRPEModal(false)
            setLogging.setPendingSet(null)
          }}
          onSubmit={handleCompleteSetWithRPE}
          setDetails={{
            weight: setLogging.pendingSet.weight,
            reps: setLogging.pendingSet.reps,
            exercise: currentExercise.name
          }}
        />
      )}

      {/* Batch RPE Rating Modal */}
      {setLogging.showBatchRPEModal && (
        <BatchRPEModal
          isOpen={setLogging.showBatchRPEModal}
          onClose={() => {
            setLogging.setShowBatchRPEModal(false)
            setLogging.setPendingBatchSets(0)
          }}
          onSubmit={handleCompleteBatchSetsWithRPE}
          setCount={setLogging.pendingBatchSets}
          weight={parseFloat(setLogging.currentWeight)}
          reps={parseInt(setLogging.currentReps)}
          exerciseName={currentExercise.name}
        />
      )}

      {/* Exercise Replacement Modal */}
      {workoutProgress.showReplaceModal && (
        <ExerciseReplacementModal
          isOpen={workoutProgress.showReplaceModal}
          onClose={workoutProgress.closeReplaceModal}
          onReplace={handleReplaceExercise}
          currentExercise={currentExercise}
        />
      )}
    </div>
  )
}