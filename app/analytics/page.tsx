'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Calendar, TrendingUp, Target, Activity, Clock, AlertTriangle } from 'lucide-react';
import exercisesData from '@/data/exercises-real.json';

interface WorkoutSession {
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
  }>;
  totalSets: number;
}

interface ExerciseHistory {
  exerciseId: string;
  exerciseName: string;
  dates: string[];
  lastPerformed: string;
  totalSessions: number;
  avgWeight: number;
  avgReps: number;
  totalVolume: number;
  needsProgression: boolean;
}

interface MuscleStatus {
  muscle: string;
  fatigueLevel: number; // 0-100
  lastWorked: string;
  recoveryStatus: 'recovered' | 'recovering' | 'fatigued';
  daysRested: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistory[]>([]);
  const [muscleStatus, setMuscleStatus] = useState<MuscleStatus[]>([]);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = () => {
    // Load workout history from localStorage
    const history = JSON.parse(localStorage.getItem('fitforge-workout-history') || '[]');
    const sessions = JSON.parse(localStorage.getItem('workoutSessions') || '[]');
    const allHistory = [...history, ...sessions];
    
    // Filter by time range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));
    
    const filteredHistory = allHistory.filter(session => 
      new Date(session.date) >= cutoffDate
    );
    
    setWorkoutHistory(filteredHistory);
    calculateExerciseHistory(filteredHistory);
    calculateMuscleStatus(filteredHistory);
  };

  const calculateExerciseHistory = (history: WorkoutSession[]) => {
    const exerciseMap = new Map<string, ExerciseHistory>();
    
    history.forEach(session => {
      session.exercises?.forEach(exercise => {
        const key = exercise.id || exercise.name;
        if (!exerciseMap.has(key)) {
          exerciseMap.set(key, {
            exerciseId: key,
            exerciseName: exercise.name,
            dates: [],
            lastPerformed: session.date,
            totalSessions: 0,
            avgWeight: 0,
            avgReps: 0,
            totalVolume: 0,
            needsProgression: false
          });
        }
        
        const entry = exerciseMap.get(key)!;
        entry.dates.push(session.date);
        entry.totalSessions++;
        entry.lastPerformed = session.date;
        entry.totalVolume += exercise.totalWeight || 0;
        
        // Calculate if needs progression (simplified 3% rule)
        const daysSinceLastPerformed = Math.floor((Date.now() - new Date(session.date).getTime()) / (1000 * 60 * 60 * 24));
        entry.needsProgression = daysSinceLastPerformed >= 7; // If more than a week, likely needs progression
      });
    });
    
    setExerciseHistory(Array.from(exerciseMap.values()).sort((a, b) => 
      new Date(b.lastPerformed).getTime() - new Date(a.lastPerformed).getTime()
    ));
  };

  const calculateMuscleStatus = (history: WorkoutSession[]) => {
    const muscleGroups = ['Chest', 'Triceps', 'Back', 'Biceps', 'Shoulders', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves'];
    const muscleData = new Map<string, { lastWorked: string; totalVolume: number }>();
    
    // Initialize muscle data
    muscleGroups.forEach(muscle => {
      muscleData.set(muscle, { lastWorked: '', totalVolume: 0 });
    });
    
    // Calculate muscle engagement from workout history
    history.forEach(session => {
      session.exercises?.forEach(exercise => {
        if (exercise.muscleEngagement) {
          Object.entries(exercise.muscleEngagement).forEach(([muscle, engagement]) => {
            const data = muscleData.get(muscle);
            if (data) {
              if (!data.lastWorked || new Date(session.date) > new Date(data.lastWorked)) {
                data.lastWorked = session.date;
              }
              data.totalVolume += engagement * (exercise.totalWeight || 0);
            }
          });
        }
      });
    });
    
    // Convert to status array
    const status: MuscleStatus[] = Array.from(muscleData.entries()).map(([muscle, data]) => {
      const daysRested = data.lastWorked ? 
        Math.floor((Date.now() - new Date(data.lastWorked).getTime()) / (1000 * 60 * 60 * 24)) : 
        99;
      
      let recoveryStatus: 'recovered' | 'recovering' | 'fatigued';
      let fatigueLevel: number;
      
      if (daysRested >= 3) {
        recoveryStatus = 'recovered';
        fatigueLevel = Math.max(0, 100 - (daysRested * 20));
      } else if (daysRested >= 1) {
        recoveryStatus = 'recovering';
        fatigueLevel = 60 - (daysRested * 20);
      } else {
        recoveryStatus = 'fatigued';
        fatigueLevel = 80 + (data.totalVolume / 1000);
      }
      
      return {
        muscle,
        fatigueLevel: Math.min(100, Math.max(0, fatigueLevel)),
        lastWorked: data.lastWorked || 'Never',
        recoveryStatus,
        daysRested
      };
    });
    
    setMuscleStatus(status.sort((a, b) => b.fatigueLevel - a.fatigueLevel));
  };

  const getRecoveryColor = (status: MuscleStatus['recoveryStatus']) => {
    switch (status) {
      case 'recovered': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'recovering': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'fatigued': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  const getFatigueBarColor = (level: number) => {
    if (level >= 70) return 'bg-red-500';
    if (level >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredExerciseHistory = selectedCategory === 'all' 
    ? exerciseHistory 
    : exerciseHistory.filter(exercise => {
        const exerciseData = exercisesData.find(ex => ex.id === exercise.exerciseId || ex.name === exercise.exerciseName);
        return exerciseData?.category === selectedCategory;
      });

  return (
    <div className="min-h-screen bg-fitbod-background text-fitbod-text p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
              <h1 className="text-3xl font-bold text-fitbod-text">Workout Analytics</h1>
              <p className="text-fitbod-text-secondary">
                Track your exercise history and muscle recovery status
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={(value: '7' | '30' | '90') => setTimeRange(value)}>
              <SelectTrigger className="w-32 bg-fitbod-card border-fitbod-subtle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-fitbod-card border-fitbod-subtle">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-fitbod-accent" />
                <div>
                  <p className="text-2xl font-bold text-fitbod-text">{workoutHistory.length}</p>
                  <p className="text-sm text-fitbod-text-secondary">Workouts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-fitbod-card border-fitbod-subtle">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-fitbod-text">
                    {exerciseHistory.reduce((sum, ex) => sum + ex.totalSessions, 0)}
                  </p>
                  <p className="text-sm text-fitbod-text-secondary">Exercise Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-fitbod-card border-fitbod-subtle">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-fitbod-text">
                    {exerciseHistory.filter(ex => ex.needsProgression).length}
                  </p>
                  <p className="text-sm text-fitbod-text-secondary">Need Progression</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-fitbod-card border-fitbod-subtle">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-fitbod-text">
                    {muscleStatus.filter(m => m.recoveryStatus === 'fatigued').length}
                  </p>
                  <p className="text-sm text-fitbod-text-secondary">Fatigued Muscles</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="exercise-history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-fitbod-card">
            <TabsTrigger value="muscle-status">Muscle Status</TabsTrigger>
            <TabsTrigger value="exercise-history">Exercise History</TabsTrigger>
            <TabsTrigger value="progression">Progression</TabsTrigger>
          </TabsList>

          {/* Muscle Status Tab */}
          <TabsContent value="muscle-status" className="space-y-6">
            <Card className="bg-fitbod-card border-fitbod-subtle">
              <CardHeader>
                <CardTitle className="text-fitbod-text">Muscle Recovery Heat Map</CardTitle>
                <p className="text-fitbod-text-secondary">Current fatigue and recovery status for each muscle group</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {muscleStatus.map((muscle) => (
                    <div key={muscle.muscle} className="p-4 rounded-lg border border-fitbod-subtle bg-fitbod-background">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-fitbod-text">{muscle.muscle}</h3>
                        <Badge className={getRecoveryColor(muscle.recoveryStatus)}>
                          {muscle.recoveryStatus}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-fitbod-text-secondary">Fatigue Level</span>
                          <span className="text-fitbod-text">{muscle.fatigueLevel}%</span>
                        </div>
                        <Progress value={muscle.fatigueLevel} className="h-2">
                          <div className={`h-full rounded-full transition-all ${getFatigueBarColor(muscle.fatigueLevel)}`} 
                               style={{ width: `${muscle.fatigueLevel}%` }} />
                        </Progress>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-fitbod-text-secondary">Last Worked</span>
                          <span className="text-fitbod-text">
                            {muscle.lastWorked === 'Never' ? 'Never' : 
                             `${muscle.daysRested} day${muscle.daysRested !== 1 ? 's' : ''} ago`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exercise History Tab */}
          <TabsContent value="exercise-history" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-fitbod-text">Exercise History</h2>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-fitbod-card border-fitbod-subtle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="ChestTriceps">Push (Chest/Triceps)</SelectItem>
                  <SelectItem value="BackBiceps">Pull (Back/Biceps)</SelectItem>
                  <SelectItem value="Legs">Legs</SelectItem>
                  <SelectItem value="Abs">Core/Abs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {workoutHistory.map((workout) => (
                <Card 
                  key={workout.id} 
                  className="bg-fitbod-card border-fitbod-subtle hover:border-fitbod-accent cursor-pointer transition-all"
                  onClick={() => router.push(`/analytics/workout/${workout.id}`)}
                  data-testid="workout-card"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-fitbod-text mb-1">
                          {workout.type ? 
                            `${workout.type.charAt(0).toUpperCase() + workout.type.slice(1)} Day Workout` : 
                            'Workout Session'
                          }
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-fitbod-text-secondary">
                          <span>{formatDate(workout.date)}</span>
                          <span>{workout.exercises?.length || 0} exercises</span>
                          <span>{workout.totalSets || 0} sets</span>
                          <span>{Math.floor((workout.duration || 0) / 60)} minutes</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-fitbod-text-secondary">
                          Click to view details
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {workoutHistory.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-fitbod-text-secondary">No workouts found in the selected time range.</p>
                  <Button 
                    onClick={() => router.push('/push-pull-legs')} 
                    className="mt-4 bg-fitbod-accent hover:bg-red-600 text-white"
                  >
                    Start Your First Workout
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Progression Tab */}
          <TabsContent value="progression" className="space-y-6">
            <Card className="bg-fitbod-card border-fitbod-subtle">
              <CardHeader>
                <CardTitle className="text-fitbod-text">Progressive Overload Recommendations</CardTitle>
                <p className="text-fitbod-text-secondary">Exercises that need weight or rep increases based on the 3% volume rule</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exerciseHistory.filter(ex => ex.needsProgression).map((exercise) => (
                    <div key={exercise.exerciseId} className="flex items-center justify-between p-4 rounded-lg border border-fitbod-subtle bg-fitbod-background">
                      <div>
                        <h3 className="font-semibold text-fitbod-text">{exercise.exerciseName}</h3>
                        <p className="text-sm text-fitbod-text-secondary">
                          Last performed: {formatDate(exercise.lastPerformed)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Ready for Progression
                        </Badge>
                        <p className="text-xs text-fitbod-text-secondary mt-1">
                          Increase weight or reps by 3%
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {exerciseHistory.filter(ex => ex.needsProgression).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-fitbod-text-secondary">No exercises need progression yet. Keep up the consistency!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}