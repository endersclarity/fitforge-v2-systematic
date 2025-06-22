'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Minus, Dumbbell, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { workoutSetSchema, WorkoutSetFormData } from '../lib/workoutValidation';
import exercisesData from '../data/exercises.json';

interface WorkoutLoggerProps {
  userId: string;
  onSetCompleted?: (set: any) => void;
  onSessionEnd?: (session: any) => void;
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  userId,
  onSetCompleted,
  onSessionEnd
}) => {
  const [exercises, setExercises] = useState<{ id: string; name: string; category: string }[]>([])
  const [currentSession, setCurrentSession] = useState<any | null>(null)
  const [setCounters, setSetCounters] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)

  const [lastWeights, setLastWeights] = useState<Record<string, number>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues
  } = useForm<WorkoutSetFormData>({
    resolver: zodResolver(workoutSetSchema),
    defaultValues: {
      exerciseId: '',
      weight: 0,
      reps: 8,
      notes: ''
    }
  });

  const selectedExerciseId = watch('exerciseId');
  const currentWeight = watch('weight');
  const currentReps = watch('reps');

  // Load exercises and current session on mount
  useEffect(() => {
    setExercises(exercisesData as any);
    const stored = localStorage.getItem('currentWorkoutSession');
    if (stored) {
      try {
        const session = JSON.parse(stored);
        setCurrentSession(session);
        setSetCounters(
          session.exercises.reduce((acc: Record<string, number>, ex: any) => {
            acc[ex.id] = ex.sets.length;
            return acc;
          }, {})
        );
        setStartTime(new Date(session.date).getTime());
      } catch (err) {
        console.error('Failed to parse saved session', err);
      }
    }
  }, []);

  // Auto-fill last weight when exercise changes
  useEffect(() => {
    if (selectedExerciseId && lastWeights[selectedExerciseId]) {
      setValue('weight', lastWeights[selectedExerciseId]);
    }
  }, [selectedExerciseId, lastWeights, setValue]);

  const onSubmit = async (data: WorkoutSetFormData) => {
    setIsLoading(true);
    try {
      let session = currentSession;
      let start = startTime;
      if (!session) {
        start = Date.now();
        session = {
          id: Date.now().toString(),
          name: `Workout ${new Date().toLocaleDateString()}`,
          date: new Date(start).toISOString(),
          duration: 0,
          exercises: [],
          totalSets: 0
        };
      }

      let exercise = session.exercises.find((ex: any) => ex.id === data.exerciseId);
      if (!exercise) {
        const info = exercises.find(ex => ex.id === data.exerciseId);
        exercise = { id: data.exerciseId, name: info?.name || '', category: info?.category || '', sets: [] };
        session.exercises.push(exercise);
      }

      exercise.sets.push({ ...data });
      session.totalSets += 1;
      session.duration = Math.round((Date.now() - (start || Date.now())) / 60000);

      setCurrentSession({ ...session });
      setStartTime(start!);
      setSetCounters(prev => ({ ...prev, [data.exerciseId]: (prev[data.exerciseId] || 0) + 1 }));
      localStorage.setItem('currentWorkoutSession', JSON.stringify(session));

      // Store last weight for this exercise
      setLastWeights(prev => ({ ...prev, [data.exerciseId]: data.weight }));

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);

      reset({ exerciseId: data.exerciseId, weight: data.weight, reps: 8, notes: '' });

      onSetCompleted?.(data);
    } catch (err) {
      console.error('Failed to log set', err);
      setError('Failed to log set');
    } finally {
      setIsLoading(false);
    }
  };

  const adjustWeight = (increment: number) => {
    const newWeight = Math.max(0, Math.min(500, currentWeight + increment));
    setValue('weight', newWeight);
  };

  const adjustReps = (increment: number) => {
    const newReps = Math.max(1, Math.min(50, currentReps + increment));
    setValue('reps', newReps);
  };

  const handleClearSession = () => {
    if (!currentSession) return;
    const finished = {
      ...currentSession,
      duration: Math.round((Date.now() - (startTime || Date.now())) / 60000)
    };
    const sessions = JSON.parse(localStorage.getItem('workoutSessions') || '[]');
    sessions.push(finished);
    localStorage.setItem('workoutSessions', JSON.stringify(sessions));
    localStorage.removeItem('currentWorkoutSession');
    setCurrentSession(null);
    setSetCounters({});
    setStartTime(null);
    reset();
    setLastWeights({});
    onSessionEnd?.(finished);
  };

  const selectedExercise = exercises.find(ex => ex.id === selectedExerciseId);
  const currentSetNumber = selectedExerciseId ? (setCounters[selectedExerciseId] || 0) + 1 : 1;

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Dumbbell className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Workout Logger</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {showSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-700">Set logged successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Exercise Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exercise
          </label>
          <select
            {...register('exerciseId')}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an exercise</option>
            {exercises.map(exercise => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name} ({exercise.category})
              </option>
            ))}
          </select>
          {errors.exerciseId && (
            <p className="mt-1 text-sm text-red-600">{errors.exerciseId.message}</p>
          )}
        </div>

        {/* Weight Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (lbs)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustWeight(-0.25)}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              {...register('weight', { valueAsNumber: true })}
              type="number"
              step="0.25"
              min="0"
              max="500"
              className="flex-1 p-3 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => adjustWeight(0.25)}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {errors.weight && (
            <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
          )}
        </div>

        {/* Reps Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reps
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustReps(-1)}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              {...register('reps', { valueAsNumber: true })}
              type="number"
              min="1"
              max="50"
              className="flex-1 p-3 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => adjustReps(1)}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {errors.reps && (
            <p className="mt-1 text-sm text-red-600">{errors.reps.message}</p>
          )}
        </div>

        {/* Set Number Display */}
        {selectedExercise && (
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{selectedExercise.name}</span> - Set #{currentSetNumber}
            </p>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            {...register('notes')}
            placeholder="How did this set feel?"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging...
              </>
            ) : (
              'Complete Set'
            )}
          </button>
          
          {currentSession && (
            <button
              type="button"
              onClick={handleClearSession}
              className="px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              End Session
            </button>
          )}
        </div>
      </form>

      {/* Current Session Summary */}
      {currentSession && currentSession.totalSets > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium text-gray-900 mb-2">Current Workout</h3>
          <div className="space-y-1">
            {Object.entries(setCounters).map(([exerciseId, count]) => {
              const exercise = exercises.find(ex => ex.id === exerciseId);
              return exercise ? (
                <p key={exerciseId} className="text-sm text-gray-600">
                  {exercise.name}: {count} sets logged
                </p>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
