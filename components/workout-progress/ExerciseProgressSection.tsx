'use client';

import React from 'react';
import { SetStatusIndicator } from './SetStatusIndicator';

interface ExerciseProgressSectionProps {
  exerciseId: string;
  exerciseName: string;
  progress: {
    completed: number;
    target: number;
    currentSet: number;
  };
  isCurrentExercise?: boolean;
  className?: string;
}

export const ExerciseProgressSection: React.FC<ExerciseProgressSectionProps> = ({
  exerciseId,
  exerciseName,
  progress,
  isCurrentExercise = false,
  className = ''
}) => {
  const progressPercentage = progress.target > 0 ? Math.round((progress.completed / progress.target) * 100) : 0;
  
  // Generate array for set indicators
  const setIndicators = Array.from({ length: progress.target }, (_, index) => {
    const setNumber = index + 1;
    let status: 'completed' | 'current' | 'remaining' = 'remaining';
    
    if (setNumber <= progress.completed) {
      status = 'completed';
    } else if (setNumber === progress.currentSet && isCurrentExercise) {
      status = 'current';
    }
    
    return {
      setNumber,
      status
    };
  });

  return (
    <div className={`relative ${className}`}>
      {/* Exercise progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#374151] rounded-t-lg overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Exercise header */}
      <div className="flex items-center justify-between pt-4 mb-4">
        <h4 className="text-lg font-semibold text-[#10B981]">
          {exerciseName}
        </h4>
        <span className="text-sm font-medium text-[#9CA3AF]">
          {progress.completed} of {progress.target} sets
        </span>
      </div>
      
      {/* Set status indicators */}
      <div className="flex justify-center gap-2 mb-4">
        {setIndicators.map((indicator, index) => (
          <SetStatusIndicator
            key={`${exerciseId}-set-${indicator.setNumber}`}
            setNumber={indicator.setNumber}
            status={indicator.status}
          />
        ))}
      </div>
    </div>
  );
};