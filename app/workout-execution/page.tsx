'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Pause, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkoutExercise, PlannedSet } from '@/schemas/typescript-interfaces';

interface ExerciseWithSets extends WorkoutExercise {
  plannedSets: PlannedSet[];
}

interface WorkoutSession {
  exercises: ExerciseWithSets[];
  workoutType: string;
  startTime: string;
}

export default function WorkoutExecutionPage() {
  const router = useRouter();
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set());
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // Load workout session from localStorage
    const savedSession = localStorage.getItem('fitforge-workout-session');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setWorkoutSession(session);
      setWorkoutStartTime(new Date());
      setIsWorkoutActive(true);
    } else {
      // No workout session found, redirect back to workout selection
      router.push('/push-pull-legs');
    }
  }, [router]);

  useEffect(() => {
    // Timer for elapsed time
    let interval: NodeJS.Timeout;
    if (isWorkoutActive && workoutStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - workoutStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, workoutStartTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getWorkoutTitle = () => {
    if (!workoutSession) return 'Workout';
    switch (workoutSession.workoutType) {
      case 'pull': return 'Pull Day Workout';
      case 'push': return 'Push Day Workout';
      case 'legs': return 'Legs Day Workout';
      case 'core': return 'Core Day Workout';
      default: return 'Workout';
    }
  };

  const getWorkoutColor = () => {
    if (!workoutSession) return 'text-gray-900';
    switch (workoutSession.workoutType) {
      case 'pull': return 'text-blue-600';
      case 'push': return 'text-red-600';
      case 'legs': return 'text-green-600';
      case 'core': return 'text-purple-600';
      default: return 'text-gray-900';
    }
  };

  const markSetComplete = (exerciseId: string, setId: string) => {
    const setKey = `${exerciseId}-${setId}`;
    setCompletedSets(prev => new Set([...prev, setKey]));
  };

  const isSetComplete = (exerciseId: string, setId: string): boolean => {
    const setKey = `${exerciseId}-${setId}`;
    return completedSets.has(setKey);
  };

  const finishWorkout = () => {
    if (!workoutSession) return;

    // Save workout to history
    const workoutHistory = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: workoutSession.workoutType,
      duration: elapsedTime,
      exercises: workoutSession.exercises.map(exercise => ({
        ...exercise,
        completedSets: exercise.plannedSets.filter(set => 
          isSetComplete(exercise.id, set.id)
        ).length
      })),
      totalSets: completedSets.size
    };

    // Save to localStorage workout history
    const existingHistory = localStorage.getItem('fitforge-workout-history');
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    history.push(workoutHistory);
    localStorage.setItem('fitforge-workout-history', JSON.stringify(history));

    // Clear current session
    localStorage.removeItem('fitforge-workout-session');

    // Navigate to completion page or dashboard
    router.push('/dashboard');
  };

  if (!workoutSession) {
    return (
      <div className="min-h-screen bg-fitbod-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-fitbod-text">Loading workout...</p>
        </div>
      </div>
    );
  }

  const currentExercise = workoutSession.exercises[currentExerciseIndex];
  const totalExercises = workoutSession.exercises.length;
  const completedExercises = workoutSession.exercises.filter(exercise => 
    exercise.plannedSets.every(set => isSetComplete(exercise.id, set.id))
  ).length;

  return (
    <div className="min-h-screen bg-fitbod-background text-fitbod-text p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="bg-fitbod-card border-fitbod-subtle text-fitbod-text hover:bg-fitbod-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className={`text-2xl font-bold ${getWorkoutColor()}`}>
                {getWorkoutTitle()}
              </h1>
              <p className="text-fitbod-text-secondary">
                {completedExercises}/{totalExercises} exercises completed
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-fitbod-text-secondary">
              <Clock className="h-4 w-4" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
            <Button
              onClick={finishWorkout}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Finish Workout
            </Button>
          </div>
        </div>

        {/* Workout Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-fitbod-text-secondary mb-2">
            <span>Workout Progress</span>
            <span>{completedSets.size} sets completed</span>
          </div>
          <div className="w-full bg-fitbod-subtle rounded-full h-2">
            <div 
              className="bg-fitbod-accent h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(completedSets.size / workoutSession.exercises.reduce((total, ex) => total + ex.plannedSets.length, 0)) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          {workoutSession.exercises.map((exercise, exerciseIndex) => (
            <Card key={exercise.id} className="bg-fitbod-card border-fitbod-subtle">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-fitbod-text">
                    {exercise.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-fitbod-text-secondary">
                      {exercise.equipment}
                    </Badge>
                    <Badge variant="outline" className="text-fitbod-text-secondary">
                      {exercise.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {exercise.plannedSets.map((set, setIndex) => {
                    const isCompleted = isSetComplete(exercise.id, set.id);
                    return (
                      <div
                        key={set.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          isCompleted 
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                            : 'bg-fitbod-background border-fitbod-subtle hover:border-fitbod-accent'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-fitbod-subtle flex items-center justify-center text-sm font-medium">
                            {setIndex + 1}
                          </div>
                          <div className="text-fitbod-text">
                            {set.targetWeight > 0 ? `${set.targetWeight} lbs` : 'Bodyweight'} × {set.targetReps} reps
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => markSetComplete(exercise.id, set.id)}
                          disabled={isCompleted}
                          variant={isCompleted ? "default" : "outline"}
                          size="sm"
                          className={isCompleted ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Done
                            </>
                          ) : (
                            'Mark Complete'
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}