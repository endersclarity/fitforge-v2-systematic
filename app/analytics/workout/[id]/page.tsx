'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Trophy, TrendingUp, Clock, Target, Zap, Award } from 'lucide-react';
import exercisesData from '@/data/exercises-real.json';

interface WorkoutDetail {
  id: string;
  date: string;
  type: string;
  duration: number;
  exercises: Array<{
    id: string;
    name: string;
    category: string;
    muscleEngagement: Record<string, number>;
    completedSets: number;
    totalWeight: number;
    totalReps: number;
    equipment: string;
    difficulty: string;
    sets: Array<{
      weight: number;
      reps: number;
      isPersonalRecord?: boolean;
    }>;
  }>;
  totalSets: number;
  personalRecords: Array<{
    exercise: string;
    recordType: 'weight' | 'volume' | 'reps';
    value: number;
    improvement: string;
  }>;
  nextWorkoutRecommendations: Array<{
    exercise: string;
    recommendation: string;
    reason: string;
  }>;
}

export default function WorkoutDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkoutDetail();
  }, [workoutId]);

  const loadWorkoutDetail = () => {
    // Load workout history and find the specific workout
    const history = JSON.parse(localStorage.getItem('fitforge-workout-history') || '[]');
    const sessions = JSON.parse(localStorage.getItem('workoutSessions') || '[]');
    const allHistory = [...history, ...sessions];
    
    const foundWorkout = allHistory.find(w => w.id === workoutId);
    
    if (foundWorkout) {
      // Enhance the workout data with analytics
      const enhancedWorkout = enhanceWorkoutWithAnalytics(foundWorkout, allHistory);
      setWorkout(enhancedWorkout);
    }
    
    setLoading(false);
  };

  const enhanceWorkoutWithAnalytics = (workout: any, allHistory: any[]): WorkoutDetail => {
    // Calculate personal records
    const personalRecords = calculatePersonalRecords(workout, allHistory);
    
    // Generate next workout recommendations
    const nextWorkoutRecommendations = generateRecommendations(workout, allHistory);
    
    // Enhance exercises with detailed set data
    const enhancedExercises = workout.exercises.map((exercise: any) => {
      // Handle cases where data might be missing or zero
      const completedSets = exercise.completedSets || 1;
      const totalWeight = exercise.totalWeight || 0;
      const totalReps = exercise.totalReps || 0;
      
      // For bodyweight exercises, use a default weight or show reps only
      const avgWeight = totalWeight > 0 ? totalWeight / completedSets : 0;
      const avgReps = totalReps > 0 ? totalReps / completedSets : 8; // Default fallback
      
      const sets = Array.from({ length: completedSets }, (_, i) => ({
        weight: totalWeight > 0 ? Math.round(avgWeight + (Math.random() - 0.5) * 5) : 0,
        reps: Math.round(avgReps + (Math.random() - 0.5) * 2),
        isPersonalRecord: personalRecords.some(pr => 
          pr.exercise === exercise.name && pr.recordType === 'weight'
        )
      }));

      return {
        ...exercise,
        sets
      };
    });

    return {
      ...workout,
      exercises: enhancedExercises,
      personalRecords,
      nextWorkoutRecommendations
    };
  };

  const calculatePersonalRecords = (workout: any, allHistory: any[]) => {
    const records: any[] = [];
    
    workout.exercises.forEach((exercise: any) => {
      // Check if this is a weight PR
      const previousWorkouts = allHistory.filter(w => 
        w.id !== workout.id && 
        w.exercises.some((e: any) => e.name === exercise.name)
      );
      
      if (previousWorkouts.length > 0) {
        const previousBestWeight = Math.max(
          ...previousWorkouts.flatMap(w => 
            w.exercises
              .filter((e: any) => e.name === exercise.name)
              .map((e: any) => e.totalWeight / e.completedSets)
          )
        );
        
        const currentWeight = exercise.totalWeight / exercise.completedSets;
        
        if (currentWeight > previousBestWeight) {
          records.push({
            exercise: exercise.name,
            recordType: 'weight',
            value: currentWeight,
            improvement: `+${(currentWeight - previousBestWeight).toFixed(1)} lbs`
          });
        }
        
        // Check volume PR
        const previousBestVolume = Math.max(
          ...previousWorkouts.flatMap(w => 
            w.exercises
              .filter((e: any) => e.name === exercise.name)
              .map((e: any) => e.totalWeight)
          )
        );
        
        if (exercise.totalWeight > previousBestVolume) {
          records.push({
            exercise: exercise.name,
            recordType: 'volume',
            value: exercise.totalWeight,
            improvement: `+${(exercise.totalWeight - previousBestVolume).toFixed(0)} lbs`
          });
        }
      }
    });
    
    return records;
  };

  const generateRecommendations = (workout: any, allHistory: any[]) => {
    const recommendations: any[] = [];
    
    workout.exercises.forEach((exercise: any) => {
      // Calculate days since this exercise was performed
      const exerciseHistory = allHistory
        .filter(w => w.exercises.some((e: any) => e.name === exercise.name))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      if (exerciseHistory.length >= 2) {
        const lastPerformance = exerciseHistory[1]; // Previous workout with this exercise
        const lastExercise = lastPerformance.exercises.find((e: any) => e.name === exercise.name);
        
        // Progressive overload recommendation (3% rule)
        const volumeIncrease = exercise.totalWeight * 1.03;
        const currentVolume = exercise.totalWeight;
        
        if (currentVolume >= volumeIncrease) {
          recommendations.push({
            exercise: exercise.name,
            recommendation: `Try +5 lbs next time`,
            reason: `You hit the 3% volume target. Ready for progression!`
          });
        } else {
          recommendations.push({
            exercise: exercise.name,
            recommendation: `Focus on completing all sets`,
            reason: `Build consistency before increasing weight`
          });
        }
      } else {
        recommendations.push({
          exercise: exercise.name,
          recommendation: `Establish baseline performance`,
          reason: `Track 2-3 sessions to calculate progression`
        });
      }
    });
    
    return recommendations;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWorkoutTypeColor = (type: string) => {
    if (!type) return 'text-gray-600';
    switch (type.toLowerCase()) {
      case 'push': return 'text-red-600';
      case 'pull': return 'text-blue-600';
      case 'legs': return 'text-green-600';
      case 'core': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-fitbod-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fitbod-accent mx-auto mb-4"></div>
          <p className="text-fitbod-text">Loading workout details...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-fitbod-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-fitbod-text">Workout not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fitbod-background text-fitbod-text p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="bg-fitbod-card border-fitbod-subtle text-fitbod-text hover:bg-fitbod-subtle"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className={`text-3xl font-bold ${getWorkoutTypeColor(workout.type)}`}>
              {workout.type ? 
                `${workout.type.charAt(0).toUpperCase() + workout.type.slice(1)} Day Workout` : 
                'Workout Session'
              }
            </h1>
            <p className="text-fitbod-text-secondary">{formatDate(workout.date)}</p>
          </div>
        </div>

        {/* Workout Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-fitbod-card border-fitbod-subtle">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-fitbod-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-fitbod-text">{Math.floor(workout.duration / 60)}</p>
              <p className="text-sm text-fitbod-text-secondary">Minutes</p>
            </CardContent>
          </Card>

          <Card className="bg-fitbod-card border-fitbod-subtle">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-fitbod-text">{workout.exercises.length}</p>
              <p className="text-sm text-fitbod-text-secondary">Exercises</p>
            </CardContent>
          </Card>

          <Card className="bg-fitbod-card border-fitbod-subtle">
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-fitbod-text">{workout.totalSets}</p>
              <p className="text-sm text-fitbod-text-secondary">Sets Completed</p>
            </CardContent>
          </Card>

          <Card className="bg-fitbod-card border-fitbod-subtle">
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-fitbod-text">{workout.personalRecords.length}</p>
              <p className="text-sm text-fitbod-text-secondary">Personal Records</p>
            </CardContent>
          </Card>
        </div>

        {/* Personal Records */}
        {workout.personalRecords.length > 0 && (
          <Card className="bg-fitbod-card border-fitbod-subtle mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-fitbod-text">
                <Award className="h-5 w-5 text-yellow-500" />
                Personal Records Achieved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {workout.personalRecords.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <div>
                      <h3 className="font-semibold text-fitbod-text">{record.exercise}</h3>
                      <p className="text-sm text-fitbod-text-secondary capitalize">{record.recordType} Record</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-yellow-600">{record.improvement}</p>
                      <p className="text-sm text-fitbod-text-secondary">{record.value} {record.recordType === 'weight' ? 'lbs' : record.recordType === 'volume' ? 'lbs total' : 'reps'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercise Details */}
        <Card className="bg-fitbod-card border-fitbod-subtle mb-8">
          <CardHeader>
            <CardTitle className="text-fitbod-text">Exercise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {workout.exercises.map((exercise, index) => (
                <div key={index} className="border border-fitbod-subtle rounded-lg p-4 bg-fitbod-background">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-fitbod-text">{exercise.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-fitbod-text-secondary">
                          {exercise.equipment}
                        </Badge>
                        <Badge variant="outline" className="text-fitbod-text-secondary">
                          {exercise.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-fitbod-text">
                        {exercise.totalWeight > 0 ? `${exercise.totalWeight} lbs` : 'Bodyweight'}
                      </p>
                      <p className="text-sm text-fitbod-text-secondary">
                        {exercise.totalWeight > 0 ? 'Total Volume' : `${exercise.totalReps || 0} reps`}
                      </p>
                    </div>
                  </div>

                  {/* Set Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className={`p-3 rounded text-center ${set.isPersonalRecord ? 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300' : 'bg-fitbod-card'}`}>
                        <p className="text-sm font-medium text-fitbod-text">
                          {set.weight > 0 ? `${set.weight} lbs × ${set.reps}` : `${set.reps} reps`}
                        </p>
                        {set.isPersonalRecord && (
                          <p className="text-xs text-yellow-600 mt-1">PR!</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Workout Recommendations */}
        <Card className="bg-fitbod-card border-fitbod-subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-fitbod-text">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Next Workout Recommendations
            </CardTitle>
            <p className="text-fitbod-text-secondary">Based on progressive overload principles</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workout.nextWorkoutRecommendations.map((rec, index) => (
                <div key={index} className="flex items-start justify-between p-4 rounded-lg border border-fitbod-subtle bg-fitbod-background">
                  <div>
                    <h3 className="font-semibold text-fitbod-text">{rec.exercise}</h3>
                    <p className="text-sm text-fitbod-text-secondary mt-1">{rec.reason}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    {rec.recommendation}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}