'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Minus, Dumbbell, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { workoutSetSchema, WorkoutSetFormData } from '../lib/workoutValidation';
import { MuscleEngagementDisplay } from './muscle-engagement-display';
import { VolumeProgressionCalculator } from './volume-progression-calculator-adapted';
import { OverallProgressHeader } from './workout-progress/OverallProgressHeader';
import { ExerciseProgressSection } from './workout-progress/ExerciseProgressSection';
import { WorkoutOverviewDisplay } from './workout-progress/WorkoutOverviewDisplay';
import exercisesData from '../data/exercises-real.json';

interface WorkoutLoggerProps {
  userId: string;
  initialCategory?: string;
  onSetCompleted?: (set: any) => void;
  onSessionEnd?: (session: any) => void;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment?: string;
  difficulty?: string;
  variation?: string;
  muscleEngagement?: Record<string, number>;
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

interface WorkoutPlan {
  exercises: {
    exerciseId: string;
    targetSets: number;
    order: number;
  }[];
}

interface ExerciseProgress {
  completed: number;
  target: number;
  currentSet: number;
}

interface SessionProgress {
  totalTargetSets: number;
  totalCompletedSets: number;
  completionPercentage: number;
  exerciseProgress: Record<string, ExerciseProgress>;
  exercisesStarted: number;
  totalExercises: number;
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  userId,
  initialCategory,
  onSetCompleted,
  onSessionEnd
}) => {
  const [currentSession, setCurrentSession] = useState<CurrentSession | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setCounters, setSetCounters] = useState<Record<string, number>>({});

  const [lastWeights, setLastWeights] = useState<Record<string, number>>({});
  const [lastPerformance, setLastPerformance] = useState<Record<string, any>>({});
  const [progressionRecommendations, setProgressionRecommendations] = useState<Record<string, any>>({});
  const [weeklyVolume, setWeeklyVolume] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Progress tracking state
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [sessionProgress, setSessionProgress] = useState<SessionProgress | null>(null);
  const [showWorkoutOverview, setShowWorkoutOverview] = useState(false);

  // Push/Pull/Legs category mapping
  const categoryMapping = {
    'all': 'All Exercises',
    'push': 'Push Day (Chest, Shoulders, Triceps)',
    'pull': 'Pull Day (Back, Biceps)',
    'legs': 'Legs Day',
    'core': 'Core & Abs'
  };

  const getWorkoutType = (category: string): string => {
    switch (category) {
      case 'ChestTriceps': return 'push';
      case 'BackBiceps': return 'pull';
      case 'Legs': return 'legs';
      case 'Abs': return 'core';
      default: return 'other';
    }
  };

  // Progressive overload calculation functions
  const getProgressionIncrement = (exerciseId: string): number => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return 5;

    const workoutType = getWorkoutType(exercise.category);
    // Upper body: +5 lbs, Lower body: +10 lbs, Core: +2.5 lbs
    switch (workoutType) {
      case 'legs': return 10;
      case 'core': return 2.5;
      default: return 5; // push/pull
    }
  };

  const calculateProgression = (exerciseId: string, lastWeight: number, lastReps: number, targetReps: number): any => {
    const increment = getProgressionIncrement(exerciseId);

    // If user completed all target reps, recommend weight increase
    if (lastReps >= targetReps) {
      return {
        type: 'weight_increase',
        recommendedWeight: lastWeight + increment,
        reason: `Completed ${lastReps}/${targetReps} reps - increase weight by ${increment} lbs`
      };
    }

    // If user missed reps, maintain weight
    if (lastReps < targetReps) {
      return {
        type: 'maintain_weight',
        recommendedWeight: lastWeight,
        reason: `Completed ${lastReps}/${targetReps} reps - maintain current weight`
      };
    }

    return {
      type: 'maintain_weight',
      recommendedWeight: lastWeight,
      reason: 'Continue with current weight'
    };
  };

  // Progress calculation utilities
  const createDefaultWorkoutPlan = (exerciseIds: string[]): WorkoutPlan => {
    return {
      exercises: exerciseIds.map((exerciseId, index) => ({
        exerciseId,
        targetSets: 3, // Default to 3 sets per exercise
        order: index
      }))
    };
  };

  const calculateSessionProgress = (
    currentSession: CurrentSession | null,
    workoutPlan: WorkoutPlan | null
  ): SessionProgress | null => {
    if (!currentSession || !workoutPlan) {
      return null;
    }

    const exerciseProgress: Record<string, ExerciseProgress> = {};
    let totalTargetSets = 0;
    let totalCompletedSets = currentSession.sets.length;
    let exercisesStarted = 0;

    // Calculate progress for each planned exercise
    workoutPlan.exercises.forEach(planExercise => {
      const exerciseId = planExercise.exerciseId;
      const completedSets = currentSession.sets.filter(set => set.exerciseId === exerciseId).length;
      const targetSets = planExercise.targetSets;
      
      totalTargetSets += targetSets;
      
      if (completedSets > 0) {
        exercisesStarted++;
      }

      exerciseProgress[exerciseId] = {
        completed: completedSets,
        target: targetSets,
        currentSet: completedSets < targetSets ? completedSets + 1 : targetSets
      };
    });

    const completionPercentage = totalTargetSets > 0 ? Math.round((totalCompletedSets / totalTargetSets) * 100) : 0;

    return {
      totalTargetSets,
      totalCompletedSets,
      completionPercentage,
      exerciseProgress,
      exercisesStarted,
      totalExercises: workoutPlan.exercises.length
    };
  };

  const getMotivationalBadge = (completionPercentage: number, exercisesStarted: number): string => {
    if (completionPercentage === 0) return 'Let\'s Go!';
    if (completionPercentage < 25) return 'Getting Started!';
    if (completionPercentage < 50) return 'On Fire!';
    if (completionPercentage < 75) return 'Crushing It!';
    if (completionPercentage < 100) return 'Almost Done!';
    return 'Workout Complete!';
  };

  const getElapsedTime = (startTime: string): string => {
    const start = new Date(startTime);
    const now = new Date();
    const elapsedMs = now.getTime() - start.getTime();
    const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
    
    if (elapsedMinutes < 60) {
      return `${elapsedMinutes} min`;
    } else {
      const hours = Math.floor(elapsedMinutes / 60);
      const minutes = elapsedMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  const loadLastPerformanceData = () => {
    try {
      const sessions = JSON.parse(localStorage.getItem('workoutSessions') || '[]');
      const lastPerformanceData: Record<string, any> = {};
      const recommendations: Record<string, any> = {};

      // Find the most recent performance for each exercise
      sessions.forEach((session: any) => {
        if (session.sets && Array.isArray(session.sets)) {
          session.sets.forEach((set: any) => {
            const exerciseId = set.exerciseId;
            if (exerciseId && !lastPerformanceData[exerciseId]) {
              lastPerformanceData[exerciseId] = {
                weight: set.weight,
                reps: set.reps,
                date: session.date,
                sessionName: session.name
              };

              // Calculate progression recommendation
              const progression = calculateProgression(exerciseId, set.weight, set.reps, 8);
              recommendations[exerciseId] = progression;
            }
          });
        }
      });

      setLastPerformance(lastPerformanceData);
      setProgressionRecommendations(recommendations);

      // Calculate weekly volume
      calculateWeeklyVolume(sessions);
    } catch (error) {
      console.error('Error loading last performance data:', error);
    }
  };

  const calculateWeeklyVolume = (sessions: any[]) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let totalVolume = 0;
    sessions.forEach((session: any) => {
      const sessionDate = new Date(session.date);
      if (sessionDate >= oneWeekAgo && session.sets && Array.isArray(session.sets)) {
        session.sets.forEach((set: any) => {
          if (set.weight && set.reps) {
            totalVolume += set.weight * set.reps;
          }
        });
      }
    });

    setWeeklyVolume(totalVolume);
  };

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
    const loadedExercises = exercisesData as Exercise[];
    setExercises(loadedExercises);
    setFilteredExercises(loadedExercises); // Initially show all exercises

    // Set initial category if provided
    if (initialCategory && initialCategory !== 'all') {
      setSelectedCategory(initialCategory);
    }

    // Load last performance data for progression recommendations
    loadLastPerformanceData();

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
  }, [initialCategory]);

  // Filter exercises by selected category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredExercises(exercises);
    } else {
      const filtered = exercises.filter(exercise =>
        getWorkoutType(exercise.category) === selectedCategory
      );
      setFilteredExercises(filtered);
    }
  }, [selectedCategory, exercises]);

  // Auto-fill last weight when exercise changes
  useEffect(() => {
    if (selectedExerciseId && lastWeights[selectedExerciseId]) {
      setValue('weight', lastWeights[selectedExerciseId]);
    }
  }, [selectedExerciseId, lastWeights, setValue]);

  // Create workout plan when exercises are used
  useEffect(() => {
    if (currentSession && currentSession.sets.length > 0) {
      const uniqueExerciseIds = Array.from(new Set(currentSession.sets.map(set => set.exerciseId)));
      
      // Only create a new plan if we don't have one or if exercises have changed
      if (!workoutPlan || !arraysEqual(
        workoutPlan.exercises.map(e => e.exerciseId).sort(),
        uniqueExerciseIds.sort()
      )) {
        const newPlan = createDefaultWorkoutPlan(uniqueExerciseIds);
        setWorkoutPlan(newPlan);
      }
    }
  }, [currentSession, workoutPlan]);

  // Update progress when session or workout plan changes
  useEffect(() => {
    const progress = calculateSessionProgress(currentSession, workoutPlan);
    setSessionProgress(progress);
  }, [currentSession, workoutPlan]);

  // Utility function to compare arrays
  const arraysEqual = (a: string[], b: string[]): boolean => {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  };

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
      
      // Also save to set history for progression tracking
      const setHistory = JSON.parse(localStorage.getItem('workoutSetHistory') || '[]');
      const today = new Date().toISOString().split('T')[0];
      let todaySession = setHistory.find((s: any) => s.date === today);
      if (!todaySession) {
        todaySession = { date: today, sets: [] };
        setHistory.push(todaySession);
      }
      todaySession.sets.push(newSet);
      localStorage.setItem('workoutSetHistory', JSON.stringify(setHistory));
      
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

      {/* Overall Progress Header */}
      {sessionProgress && currentSession && (
        <OverallProgressHeader
          sessionProgress={sessionProgress}
          elapsedTime={getElapsedTime(currentSession.startTime)}
          workoutType={selectedCategory !== 'all' ? categoryMapping[selectedCategory] : 'Mixed Workout'}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Workout Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Workout Type
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
          >
            {Object.entries(categoryMapping).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Exercise Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exercise ({filteredExercises.length} available)
          </label>
          <select
            {...register('exerciseId')}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an exercise</option>
            {filteredExercises.map(exercise => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name} - {exercise.equipment} ({exercise.difficulty})
              </option>
            ))}
          </select>
          {errors.exerciseId && (
            <p className="mt-1 text-sm text-red-600">{errors.exerciseId.message}</p>
          )}
        </div>

        {/* Weight Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Weight (lbs)
            </label>
            {selectedExerciseId && progressionRecommendations[selectedExerciseId] && (
              <button
                type="button"
                onClick={() => setValue('weight', progressionRecommendations[selectedExerciseId].recommendedWeight)}
                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
              >
                Use Recommended ({progressionRecommendations[selectedExerciseId].recommendedWeight} lbs)
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustWeight(-0.25)}
              className="p-2 border border-[#2C2C2E] rounded-xl hover:bg-[#2C2C2E] bg-[#1C1C1E]"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              {...register('weight', { valueAsNumber: true })}
              type="number"
              step="0.25"
              min="0"
              max="500"
              className="flex-1 p-3 border border-[#2C2C2E] rounded-xl text-center focus:ring-4 focus:ring-[#FF375F]/20 focus:border-[#FF375F] bg-[#2C2C2E] text-white"
            />
            <button
              type="button"
              onClick={() => adjustWeight(0.25)}
              className="p-2 border border-[#2C2C2E] rounded-xl hover:bg-[#2C2C2E] bg-[#1C1C1E]"
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
              className="p-2 border border-[#2C2C2E] rounded-xl hover:bg-[#2C2C2E] bg-[#1C1C1E]"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              {...register('reps', { valueAsNumber: true })}
              type="number"
              min="1"
              max="50"
              className="flex-1 p-3 border border-[#2C2C2E] rounded-xl text-center focus:ring-4 focus:ring-[#FF375F]/20 focus:border-[#FF375F] bg-[#2C2C2E] text-white"
            />
            <button
              type="button"
              onClick={() => adjustReps(1)}
              className="p-2 border border-[#2C2C2E] rounded-xl hover:bg-[#2C2C2E] bg-[#1C1C1E]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {errors.reps && (
            <p className="mt-1 text-sm text-red-400">{errors.reps.message}</p>
          )}
        </div>

        {/* Exercise Progress Display */}
        {selectedExercise && sessionProgress && (
          <div className="p-4 bg-[#2C2C2E] rounded-xl">
            {/* Exercise Progress Section */}
            {sessionProgress.exerciseProgress[selectedExercise.id] && (
              <ExerciseProgressSection
                exerciseId={selectedExercise.id}
                exerciseName={selectedExercise.name}
                progress={sessionProgress.exerciseProgress[selectedExercise.id]}
                isCurrentExercise={true}
                className="mb-4"
              />
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">
                  <span className="font-medium">{selectedExercise.name}</span> - Set #{currentSetNumber}
                </p>
                <p className="text-xs text-[#A1A1A3]">
                  {categoryMapping[getWorkoutType(selectedExercise.category)]} • {selectedExercise.equipment}
                </p>

                {/* Progressive Overload Recommendations */}
                {lastPerformance[selectedExercise.id] && (
                  <div className="mt-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                    <p className="text-xs font-medium text-blue-400 mb-1">Last Performance:</p>
                    <p className="text-xs text-blue-300">
                      {lastPerformance[selectedExercise.id].weight} lbs × {lastPerformance[selectedExercise.id].reps} reps
                    </p>
                    {progressionRecommendations[selectedExercise.id] && (
                      <div className="mt-1">
                        <p className="text-xs font-medium text-green-400">Recommendation:</p>
                        <p className="text-xs text-green-300">
                          {progressionRecommendations[selectedExercise.id].recommendedWeight} lbs
                          {progressionRecommendations[selectedExercise.id].type === 'weight_increase' && (
                            <span className="ml-1 text-green-400">↗️ +{getProgressionIncrement(selectedExercise.id)} lbs</span>
                          )}
                        </p>
                        <p className="text-xs text-[#A1A1A3] mt-1">
                          {progressionRecommendations[selectedExercise.id].reason}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {!lastPerformance[selectedExercise.id] && (
                  <div className="mt-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                    <p className="text-xs text-yellow-400">
                      🆕 First time doing this exercise - start with a comfortable weight
                    </p>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  getWorkoutType(selectedExercise.category) === 'push' ? 'bg-red-500/20 text-red-400' :
                  getWorkoutType(selectedExercise.category) === 'pull' ? 'bg-blue-500/20 text-blue-400' :
                  getWorkoutType(selectedExercise.category) === 'legs' ? 'bg-green-500/20 text-green-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {getWorkoutType(selectedExercise.category).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Notes (optional)
          </label>
          <textarea
            {...register('notes')}
            placeholder="How did this set feel?"
            className="w-full p-3 border border-[#2C2C2E] rounded-xl focus:ring-4 focus:ring-[#FF375F]/20 focus:border-[#FF375F] bg-[#2C2C2E] text-white placeholder-[#A1A1A3]"
            rows={2}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-400">{errors.notes.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-[#FF375F] text-white py-3 px-4 rounded-xl hover:bg-[#E63050] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
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
              className="px-4 py-3 border border-[#2C2C2E] rounded-xl hover:bg-[#2C2C2E] bg-[#1C1C1E] text-white"
            >
              End Session
            </button>
          )}
        </div>
      </form>

      {/* Workout Overview Toggle */}
      {currentSession && currentSession.sets.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowWorkoutOverview(!showWorkoutOverview)}
            className="px-4 py-2 bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white rounded-lg border border-[#4B5563] transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            <Dumbbell className="w-4 h-4" />
            {showWorkoutOverview ? 'Hide' : 'Show'} Workout Overview
          </button>
        </div>
      )}

      {/* Workout Overview Display */}
      {showWorkoutOverview && currentSession && sessionProgress && (
        <div className="mt-6 p-4 bg-[#1a1a1a] rounded-xl border border-[#2C2C2E]">
          <WorkoutOverviewDisplay
            exercises={exercises}
            currentSession={currentSession}
            sessionProgress={sessionProgress}
            selectedExerciseId={selectedExerciseId}
            onExerciseSelect={(exerciseId) => {
              setValue('exerciseId', exerciseId);
              setShowWorkoutOverview(false); // Hide overview after selection
            }}
          />
        </div>
      )}

      {/* Weekly Volume Tracking */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-[#2C2C2E]">
        <h3 className="font-medium text-white mb-2 flex items-center gap-2">
          📊 Weekly Training Volume
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[#A1A1A3]">Total Volume (7 days)</p>
            <p className="text-2xl font-bold text-blue-400">{weeklyVolume.toLocaleString()} lbs</p>
          </div>
          <div>
            <p className="text-sm text-[#A1A1A3]">Current Session Volume</p>
            <p className="text-2xl font-bold text-purple-400">
              {currentSession ?
                currentSession.sets.reduce((total: number, set: any) =>
                  total + (set.weight * set.reps), 0
                ).toLocaleString() : 0} lbs
            </p>
          </div>
        </div>
        <div className="mt-2 text-xs text-[#A1A1A3]">
          Volume = Weight × Reps for all exercises. Higher volume indicates more training stimulus.
        </div>
      </div>

      {/* Current Session Summary */}
      {currentSession && currentSession.sets.length > 0 && (
        <div className="mt-6 p-4 bg-[#2C2C2E] rounded-xl">
          <h3 className="font-medium text-white mb-3">Current Workout</h3>

          {/* Workout Type Breakdown */}
          <div className="mb-3">
            {(() => {
              const workoutTypes = {};
              Object.entries(setCounters).forEach(([exerciseId, count]) => {
                const exercise = exercises.find(ex => ex.id === exerciseId);
                if (exercise) {
                  const type = getWorkoutType(exercise.category);
                  workoutTypes[type] = (workoutTypes[type] || 0) + count;
                }
              });

              return Object.entries(workoutTypes).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {Object.entries(workoutTypes).map(([type, sets]) => (
                    <div key={type} className={`px-2 py-1 rounded text-xs font-medium ${
                      type === 'push' ? 'bg-red-500/20 text-red-400' :
                      type === 'pull' ? 'bg-blue-500/20 text-blue-400' :
                      type === 'legs' ? 'bg-green-500/20 text-green-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {type.toUpperCase()}: {sets} sets
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Exercise Progress Details */}
          <div className="space-y-4">
            {sessionProgress && workoutPlan && workoutPlan.exercises.map((planExercise) => {
              const exercise = exercises.find(ex => ex.id === planExercise.exerciseId);
              const progress = sessionProgress.exerciseProgress[planExercise.exerciseId];
              const isCurrentExercise = selectedExerciseId === planExercise.exerciseId;
              
              if (!exercise || !progress) return null;
              
              return (
                <div 
                  key={planExercise.exerciseId} 
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    isCurrentExercise 
                      ? 'bg-[#2a2a1a] border-[#F59E0B]/30 shadow-sm' 
                      : 'bg-[#1a1a1a] border-[#333]'
                  }`}
                >
                  <ExerciseProgressSection
                    exerciseId={planExercise.exerciseId}
                    exerciseName={exercise.name}
                    progress={progress}
                    isCurrentExercise={isCurrentExercise}
                  />
                  {isCurrentExercise && (
                    <div className="mt-2 text-xs text-[#F59E0B] font-medium">
                      ← Currently active
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Muscle Engagement Visualization */}
      {selectedExercise && (
        <div className="mt-6">
          <MuscleEngagementDisplay
            exerciseName={selectedExercise.name}
            muscleEngagement={selectedExercise.muscleEngagement}
          />
        </div>
      )}

      {/* Volume Progression Calculator */}
      <div className="mt-6">
        <VolumeProgressionCalculator />
      </div>
    </div>
  );
};