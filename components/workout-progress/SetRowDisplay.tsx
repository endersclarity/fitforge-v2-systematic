'use client';

import React from 'react';

interface SetData {
  id: string;
  weight: number;
  reps: number;
  notes?: string;
}

interface SetRowDisplayProps {
  exerciseId: string;
  exerciseName: string;
  completedSets: SetData[];
  targetSets: number;
  currentSetNumber: number;
  currentWeight?: number;
  onSetClick?: (setIndex: number) => void;
}

export const SetRowDisplay: React.FC<SetRowDisplayProps> = ({
  exerciseId,
  exerciseName,
  completedSets,
  targetSets,
  currentSetNumber,
  currentWeight = 0,
  onSetClick
}) => {
  const renderSetRow = (setIndex: number) => {
    const setNumber = setIndex + 1;
    const completedSet = completedSets[setIndex];
    const isCompleted = !!completedSet;
    const isCurrent = setNumber === currentSetNumber && !isCompleted;
    const isFuture = setNumber > currentSetNumber;

    const getRowClasses = () => {
      if (isCompleted) {
        return 'bg-[#1a3a2a] border-l-4 border-[#10B981] transform scale-[0.98] opacity-80 hover:opacity-90 transition-all duration-300';
      }
      if (isCurrent) {
        return 'bg-[#2a2a1a] border-l-4 border-[#F59E0B] shadow-[0_0_0_2px_rgba(245,158,11,0.2)] transition-all duration-300';
      }
      return 'bg-[#1a1a1a] border border-[#333] hover:bg-[#2a2a2a] transition-all duration-200';
    };

    const renderSetContent = () => {
      if (isCompleted) {
        return (
          <div className="flex items-center justify-between w-full">
            <span className="text-white/90">
              Set {setNumber}: {completedSet.weight} lbs × {completedSet.reps} reps
            </span>
            <span className="text-[#10B981] font-bold text-lg">✓</span>
          </div>
        );
      }

      if (isCurrent) {
        return (
          <div className="flex items-center justify-between w-full">
            <span className="text-[#F59E0B] font-medium">
              Set {setNumber}: ← CURRENT SET
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="lbs"
                defaultValue={currentWeight || ''}
                className="w-20 p-2 bg-[#3a3a2a] border border-[#F59E0B] text-white text-center rounded focus:ring-2 focus:ring-[#F59E0B]/30"
              />
              <span className="text-white/70">×</span>
              <input
                type="number"
                placeholder="reps"
                className="w-20 p-2 bg-[#3a3a2a] border border-[#F59E0B] text-white text-center rounded focus:ring-2 focus:ring-[#F59E0B]/30"
              />
            </div>
          </div>
        );
      }

      return (
        <div className="flex items-center justify-between w-full">
          <span className="text-white/70">Set {setNumber}:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="lbs"
              className="w-20 p-2 bg-[#333] border border-[#555] text-white text-center rounded focus:ring-2 focus:ring-blue-500/30"
            />
            <span className="text-white/50">×</span>
            <input
              type="number"
              placeholder="reps"
              className="w-20 p-2 bg-[#333] border border-[#555] text-white text-center rounded focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>
      );
    };

    return (
      <div
        key={`${exerciseId}-set-${setNumber}`}
        className={`p-3 rounded-lg cursor-pointer ${getRowClasses()}`}
        onClick={() => onSetClick?.(setIndex)}
      >
        {renderSetContent()}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-[#10B981]">{exerciseName}</h4>
        <span className="text-sm text-[#9CA3AF]">
          {completedSets.length} of {targetSets} sets completed
        </span>
      </div>
      
      <div className="space-y-2">
        {Array.from({ length: targetSets }, (_, index) => renderSetRow(index))}
      </div>
    </div>
  );
};