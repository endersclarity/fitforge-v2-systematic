'use client';

import React from 'react';
import { ExerciseProgressSection } from './ExerciseProgressSection';
import { SetRowDisplay } from './SetRowDisplay';

interface WorkoutSet {
  id: string;
  exerciseId: string;
  weight: number;
  reps: number;
  notes?: string;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment?: string;
}

interface WorkoutOverviewDisplayProps {
  exercises: Exercise[];
  currentSession: {
    sets: WorkoutSet[];
  } | null;
  sessionProgress: {
    exerciseProgress: Record<string, {
      completed: number;
      target: number;
      currentSet: number;
    }>;
  } | null;
  selectedExerciseId?: string;
  onExerciseSelect?: (exerciseId: string) => void;
}

export const WorkoutOverviewDisplay: React.FC<WorkoutOverviewDisplayProps> = ({
  exercises,
  currentSession,
  sessionProgress,
  selectedExerciseId,
  onExerciseSelect
}) => {
  if (!currentSession || !sessionProgress) {
    return (
      <div className="p-6 text-center text-[#9CA3AF]">
        <p>Start logging sets to see your workout progress</p>
      </div>
    );
  }

  // Get unique exercises from the current session
  const sessionExerciseIds = Array.from(new Set(currentSession.sets.map(set => set.exerciseId)));
  const sessionExercises = sessionExerciseIds
    .map(id => exercises.find(ex => ex.id === id))
    .filter(Boolean) as Exercise[];

  const getCompletedSetsForExercise = (exerciseId: string) => {
    return currentSession.sets.filter(set => set.exerciseId === exerciseId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Workout Overview</h3>
        <p className="text-[#9CA3AF] text-sm">
          Tap any exercise to switch to it, or continue with your current exercise
        </p>
      </div>

      {sessionExercises.map((exercise) => {
        const progress = sessionProgress.exerciseProgress[exercise.id];
        const completedSets = getCompletedSetsForExercise(exercise.id);
        const isCurrentExercise = selectedExerciseId === exercise.id;
        const isStarted = completedSets.length > 0;

        if (!progress) return null;

        return (
          <div
            key={exercise.id}
            className={`
              p-5 rounded-xl border transition-all duration-300 cursor-pointer
              ${isCurrentExercise 
                ? 'bg-[#262626] border-[#F59E0B]/40 shadow-lg ring-2 ring-[#F59E0B]/20' 
                : isStarted
                ? 'bg-[#1a1a1a] border-[#10B981]/30 hover:border-[#10B981]/50'
                : 'bg-[#1a1a1a] border-[#333] hover:border-[#555]'
              }
            `}
            onClick={() => onExerciseSelect?.(exercise.id)}
          >
            {/* Exercise Progress Bar */}
            <div className="relative mb-4">
              <ExerciseProgressSection
                exerciseId={exercise.id}
                exerciseName={exercise.name}
                progress={progress}
                isCurrentExercise={isCurrentExercise}
              />
              {isCurrentExercise && (
                <div className="absolute -top-2 right-0 bg-[#F59E0B] text-white text-xs px-2 py-1 rounded-full font-medium">
                  Active
                </div>
              )}
            </div>

            {/* Set Rows Display */}
            <SetRowDisplay
              exerciseId={exercise.id}
              exerciseName={exercise.name}
              completedSets={completedSets}
              targetSets={progress.target}
              currentSetNumber={progress.currentSet}
              currentWeight={completedSets.length > 0 ? completedSets[completedSets.length - 1].weight : undefined}
            />

            {/* Exercise Status */}
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-[#9CA3AF]">
                {exercise.equipment} • {exercise.category}
              </span>
              <div className="flex items-center gap-2">
                {progress.completed === progress.target && (
                  <span className="bg-[#10B981] text-white px-2 py-1 rounded-full font-medium">
                    Complete
                  </span>
                )}
                {isCurrentExercise && progress.completed < progress.target && (
                  <span className="bg-[#F59E0B] text-white px-2 py-1 rounded-full font-medium">
                    In Progress
                  </span>
                )}
                {!isStarted && (
                  <span className="bg-[#374151] text-[#9CA3AF] px-2 py-1 rounded-full">
                    Not Started
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {sessionExercises.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[#9CA3AF]">No exercises in current session</p>
          <p className="text-sm text-[#6B7280] mt-1">Select an exercise and log your first set to get started</p>
        </div>
      )}
    </div>
  );
};