'use client';

import React from 'react';

interface OverallProgressHeaderProps {
  sessionProgress: {
    totalTargetSets: number;
    totalCompletedSets: number;
    completionPercentage: number;
    exercisesStarted: number;
    totalExercises: number;
  };
  elapsedTime?: string;
  workoutType?: string;
}

export const OverallProgressHeader: React.FC<OverallProgressHeaderProps> = ({
  sessionProgress,
  elapsedTime = '0 min',
  workoutType = 'Workout'
}) => {
  const getMotivationalBadge = (completionPercentage: number): string => {
    if (completionPercentage === 0) return 'Let\'s Go!';
    if (completionPercentage < 25) return 'Getting Started!';
    if (completionPercentage < 50) return 'On Fire!';
    if (completionPercentage < 75) return 'Crushing It!';
    if (completionPercentage < 100) return 'Almost Done!';
    return 'Workout Complete!';
  };

  const getBadgeColor = (completionPercentage: number): string => {
    if (completionPercentage === 0) return 'bg-blue-100 text-blue-800';
    if (completionPercentage < 25) return 'bg-green-100 text-green-800';
    if (completionPercentage < 50) return 'bg-orange-100 text-orange-800';
    if (completionPercentage < 75) return 'bg-red-100 text-red-800';
    if (completionPercentage < 100) return 'bg-purple-100 text-purple-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="relative mb-6 p-5 bg-gradient-to-r from-[#10B981] via-[#10B981] to-[#374151] rounded-xl overflow-hidden">
      {/* Animated progress stripe overlay */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 progress-gradient-animated"
        style={{ 
          background: sessionProgress.completionPercentage > 0 
            ? `linear-gradient(90deg, #10B981 ${sessionProgress.completionPercentage}%, #374151 ${sessionProgress.completionPercentage}%)`
            : '#374151',
          width: `${sessionProgress.completionPercentage}%`,
          transition: 'width 0.8s ease-out'
        }}
      />
      
      {/* Main progress display */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-2xl font-bold text-white">
              🔥 Workout Progress: {sessionProgress.completionPercentage}% Complete
            </h3>
          </div>
        </div>
        
        {/* Stats row */}
        <div className="flex items-center justify-between text-white/90">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium">
              {sessionProgress.totalCompletedSets} of {sessionProgress.totalTargetSets} sets completed
            </span>
            <span className="text-sm font-medium">
              {sessionProgress.exercisesStarted} of {sessionProgress.totalExercises} exercises started
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Time indicator */}
            <span className="bg-[#374151] text-white/80 px-3 py-1 rounded-full text-xs font-medium">
              {elapsedTime} elapsed
            </span>
            
            {/* Motivational badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeColor(sessionProgress.completionPercentage)}`}>
              {getMotivationalBadge(sessionProgress.completionPercentage)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};