'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Zap, Target, TrendingUp } from 'lucide-react';
import exercisesData from '@/data/exercises-real.json';

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment?: string;
  difficulty?: string;
  variation?: string;
  muscleEngagement?: Record<string, number>;
}

export default function PushPullLegsPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string | null>(null);

  useEffect(() => {
    setExercises(exercisesData as Exercise[]);
  }, []);

  // Categorize exercises by workout type
  const categorizeExercises = () => {
    const categories = {
      push: exercises.filter(ex => ex.category === 'ChestTriceps'),
      pull: exercises.filter(ex => ex.category === 'BackBiceps'),
      legs: exercises.filter(ex => ex.category === 'Legs'),
      core: exercises.filter(ex => ex.category === 'Abs')
    };
    return categories;
  };

  const categories = categorizeExercises();

  const workoutTypes = [
    {
      id: 'push',
      name: 'Push Day',
      description: 'Chest, Shoulders, Triceps',
      color: 'bg-red-500',
      lightColor: 'bg-red-50 border-red-200',
      textColor: 'text-red-700',
      icon: '💪',
      exercises: categories.push,
      muscles: ['Chest', 'Shoulders', 'Triceps']
    },
    {
      id: 'pull',
      name: 'Pull Day', 
      description: 'Back, Biceps',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700',
      icon: '🏋️',
      exercises: categories.pull,
      muscles: ['Back', 'Biceps', 'Rear Delts']
    },
    {
      id: 'legs',
      name: 'Legs Day',
      description: 'Quads, Glutes, Hamstrings, Calves',
      color: 'bg-green-500',
      lightColor: 'bg-green-50 border-green-200',
      textColor: 'text-green-700',
      icon: '🦵',
      exercises: categories.legs,
      muscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Calves']
    },
    {
      id: 'core',
      name: 'Core Day',
      description: 'Abs, Core Stability',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-700',
      icon: '🎯',
      exercises: categories.core,
      muscles: ['Abs', 'Core', 'Obliques']
    }
  ];

  const startWorkout = (workoutType: string) => {
    // Route to specific workout type pages for better UX
    if (workoutType === 'pull') {
      window.location.href = '/pull-day';
    } else {
      // For now, other workout types still go to simple logger
      const url = `/workout-simple?category=${workoutType}`;
      window.location.href = url;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Push / Pull / Legs Training
          </h1>
          <p className="text-lg text-[#A1A1A3] max-w-2xl mx-auto">
            Choose your workout type for optimal muscle group targeting and recovery.
            Each workout focuses on specific muscle groups for maximum effectiveness.
          </p>
        </div>

        {/* Workout Type Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {workoutTypes.map((type) => (
            <Card key={type.id} className="bg-[#1C1C1E] border-[#2C2C2E] hover:bg-[#2C2C2E] transition-all cursor-pointer">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">{type.icon}</div>
                <CardTitle className="text-white">{type.name}</CardTitle>
                <CardDescription className="text-[#A1A1A3]">{type.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge variant="outline" className="text-white border-[#3C3C3E]">
                    {type.exercises.length} exercises
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-[#A1A1A3]">Target Muscles:</h4>
                  <div className="flex flex-wrap gap-1">
                    {type.muscles.map((muscle) => (
                      <span key={muscle} className="text-xs bg-[#2C2C2E] text-white px-2 py-1 rounded">
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full bg-[#FF375F] hover:bg-[#E63050] text-white"
                  onClick={() => startWorkout(type.id)}
                >
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Start {type.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Training Tips */}
        <Card className="bg-[#1C1C1E] border-[#2C2C2E]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="w-5 h-5 text-[#FF375F]" />
              Push/Pull/Legs Training Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-[#FF375F] mb-2">Push Day Strategy</h3>
              <p className="text-sm text-[#A1A1A3]">
                Focus on pressing movements. Start with compound exercises like bench press, 
                then move to isolation work for triceps and shoulders.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#3B82F6] mb-2">Pull Day Strategy</h3>
              <p className="text-sm text-[#A1A1A3]">
                Emphasize pulling movements. Begin with pull-ups or rows, then target 
                biceps and rear delts with focused exercises.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#10B981] mb-2">Legs Day Strategy</h3>
              <p className="text-sm text-[#A1A1A3]">
                Train the largest muscle groups. Start with squats or deadlifts, 
                then work on isolation exercises for complete leg development.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
