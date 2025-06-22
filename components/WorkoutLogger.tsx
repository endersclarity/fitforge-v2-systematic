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

interface Exercise {
  id: string;
  name: string;
  category: string;
}

interface WorkoutSet {
  id: string;
  exerciseId: string;
  weight: number;
  reps: number;
  notes?: string;
}

interface CurrentSession {
  id: string;
  startTime: string;
  sets: WorkoutSet[];
}

interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  duration: number;
  exercises: any[];
  totalSets: number;
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  userId,
  onSetCompleted,
  onSessionEnd
}) => {
  const [currentSession, setCurrentSession] = useState<CurrentSession | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setCounters, setSetCounters] = useState<Record<string, number>>({});

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
    setExercises(exercisesData as Exercise[]);
    const stored = localStorage.getItem('currentWorkoutSession');
    if (stored) {
      try {
        const parsed: CurrentSession = JSON.parse(stored);
        setCurrentSession(parsed);
        const counters = parsed.sets.reduce<Record<string, number>>((acc, s) => {
          acc[s.exerciseId] = (acc[s.exerciseId] || 0) + 1;
          return acc;
        }, {});
        setSetCounters(counters);
      } catch {
        /* ignore malformed data */
      }
    }
  }, []);

  // Auto-fill last weight when exercise changes
  useEffect(() => {
    if (selectedExerciseId && lastWeights[selectedExerciseId]) {
      setValue('weight', lastWeights[selectedExerciseId]);
    }
  }, [selectedExerciseId, lastWeights, setValue]);

  const saveCurrent = (session: CurrentSession) => {
    localStorage.setItem('currentWorkoutSession', JSON.stringify(session));
  };

  const logSet = async (data: WorkoutSetFormData) => {
    setIsLoading(true);
    try {
      let session = currentSession;
      if (!session) {
        session = {
          id: Date.now().toString(),
          startTime: new Date().toISOString(),
          sets: []
        };
      }
      const newSet: WorkoutSet = {
        id: Date.now().toString(),
        exerciseId: data.exerciseId,
        weight: data.weight,
        reps: data.reps,
        notes: data.notes
      };
      session.sets.push(newSet);
      setCurrentSession({ ...session });
      setSetCounters(prev => ({
        ...prev,
        [data.exerciseId]: (prev[data.exerciseId] || 0) + 1
      }));
      saveCurrent(session);
      return newSet;
    } catch (err) {
      setError('Failed to log set');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = () => {
    if (!currentSession) return;
    const end = new Date();
    const duration = Math.round(
      (end.getTime() - new Date(currentSession.startTime).getTime()) / 60000
    );
    const sessionSummary: WorkoutSession = {
      id: currentSession.id,
      name: `Workout ${new Date().toLocaleDateString()}`,
      date: end.toISOString(),
      duration,
      exercises: Object.keys(setCounters).map(id => {
        const exercise = exercises.find(e => e.id === id);
        return {
          id,
          name: exercise?.name || '',
          sets: setCounters[id]
        };
      }),
      totalSets: currentSession.sets.length
    };
    const sessions = JSON.parse(localStorage.getItem('workoutSessions') || '[]');
    sessions.push(sessionSummary);
    localStorage.setItem('workoutSessions', JSON.stringify(sessions));
    localStorage.removeItem('currentWorkoutSession');
    setCurrentSession(null);
    setSetCounters({});
    onSessionEnd?.(sessionSummary);
  };

  const onSubmit = async (data: WorkoutSetFormData) => {
    const result = await logSet(data);
    
    if (result) {
      // Store last weight for this exercise
      setLastWeights(prev => ({
        ...prev,
        [data.exerciseId]: data.weight
      }));

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);

      // Reset form but keep exercise selection
      reset({
        exerciseId: data.exerciseId,
        weight: data.weight,
        reps: 8,
        notes: ''
      });

      // Call completion callback
      onSetCompleted?.(result);
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
    clearSession();
    reset();
    setLastWeights({});
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
      {currentSession && currentSession.sets.length > 0 && (
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