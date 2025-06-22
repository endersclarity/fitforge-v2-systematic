'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkoutLogger } from '@/components/WorkoutLogger';

export default function WorkoutSimplePage() {
  const searchParams = useSearchParams();
  const [workoutType, setWorkoutType] = useState<string | null>(null);

  useEffect(() => {
    const category = searchParams.get('category');
    setWorkoutType(category);
  }, [searchParams]);

  const getWorkoutTitle = () => {
    switch (workoutType) {
      case 'push': return 'Push Day Workout - Chest, Shoulders, Triceps';
      case 'pull': return 'Pull Day Workout - Back, Biceps';
      case 'legs': return 'Legs Day Workout - Quads, Glutes, Hamstrings';
      case 'core': return 'Core Day Workout - Abs, Core Stability';
      default: return 'Simple Workout Logger';
    }
  };

  const getWorkoutColor = () => {
    switch (workoutType) {
      case 'push': return 'text-red-600';
      case 'pull': return 'text-blue-600';
      case 'legs': return 'text-green-600';
      case 'core': return 'text-purple-600';
      default: return 'text-gray-900';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-3xl font-bold text-center mb-8 ${getWorkoutColor()}`}>
          {getWorkoutTitle()}
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <WorkoutLogger
            userId="demo-user"
            initialCategory={workoutType || 'all'}
            onSetCompleted={(set) => {
              console.log('Set completed:', set);
            }}
            onSessionEnd={(session) => {
              console.log('Session ended:', session);
            }}
          />
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>This page tests the WorkoutLogger component with the full exercise database.</p>
          <p>Data is saved to localStorage and should appear in the Dashboard.</p>
        </div>
      </div>
    </div>
  );
}
