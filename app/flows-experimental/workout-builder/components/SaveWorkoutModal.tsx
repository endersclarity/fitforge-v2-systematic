'use client'

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface WorkoutExerciseData {
  id: string;
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  restTime: number;
  orderIndex: number;
  isSuperset: boolean;
  supersetGroup?: number;
}

interface SaveWorkoutModalProps {
  workoutExercises: WorkoutExerciseData[];
  onSave: (workoutData: any) => void;
  onClose: () => void;
}

export function SaveWorkoutModal({ workoutExercises, onSave, onClose }: SaveWorkoutModalProps) {
  const [workoutName, setWorkoutName] = useState('');
  const [workoutType, setWorkoutType] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [category, setCategory] = useState<'strength' | 'hypertrophy' | 'endurance' | 'general'>('general');

  const handleSave = () => {
    if (!workoutName.trim()) {
      alert('Please enter a workout name');
      return;
    }

    const workoutData = {
      name: workoutName,
      type: workoutType,
      category,
      exercises: workoutExercises.map(ex => ({
        exerciseId: ex.exerciseId,
        orderIndex: ex.orderIndex,
        targetSets: ex.sets,
        targetRepsMin: ex.reps,
        targetRepsMax: ex.reps,
        targetWeight: ex.weight,
        restTimeSeconds: ex.restTime,
        isSuperset: ex.isSuperset,
        supersetGroup: ex.supersetGroup,
        progressionType: 'weight' as const,
        progressionAmount: 2.5,
      })),
      estimatedDuration: workoutExercises.reduce((total, ex) => {
        // Estimate: sets * (rest time + 30s exercise time)
        return total + (ex.sets * (ex.restTime + 30));
      }, 0) / 60, // Convert to minutes
    };

    onSave(workoutData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="save-workout-modal">
      <div className="bg-fitbod-card rounded-lg max-w-md w-full m-4 border border-fitbod-subtle">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-fitbod-subtle">
          <h2 className="text-xl font-semibold text-fitbod-text">Save Workout Template</h2>
          <button
            onClick={onClose}
            className="text-fitbod-text-secondary hover:text-fitbod-text"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Workout Name */}
          <div>
            <label className="block text-sm font-medium text-fitbod-text mb-1">
              Workout Name
            </label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="Workout name..."
              className="w-full px-3 py-2 border border-fitbod-subtle rounded-md focus:ring-2 focus:ring-fitbod-accent focus:border-fitbod-accent bg-fitbod-background text-fitbod-text"
              data-testid="workout-name-input"
            />
          </div>

          {/* Workout Type */}
          <div>
            <label className="block text-sm font-medium text-fitbod-text mb-1">
              Workout Type
            </label>
            <select
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value as 'A' | 'B' | 'C' | 'D')}
              className="w-full px-3 py-2 border border-fitbod-subtle rounded-md focus:ring-2 focus:ring-fitbod-accent focus:border-fitbod-accent bg-fitbod-background text-fitbod-text"
              data-testid="workout-type-select"
            >
              <option value="A">Type A</option>
              <option value="B">Type B</option>
              <option value="C">Type C</option>
              <option value="D">Type D</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-fitbod-text mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 border border-fitbod-subtle rounded-md focus:ring-2 focus:ring-fitbod-accent focus:border-fitbod-accent bg-fitbod-background text-fitbod-text"
            >
              <option value="general">General Fitness</option>
              <option value="strength">Strength</option>
              <option value="hypertrophy">Hypertrophy</option>
              <option value="endurance">Endurance</option>
            </select>
          </div>

          {/* Summary */}
          <div className="bg-fitbod-subtle/30 rounded-lg p-4">
            <h3 className="font-medium text-fitbod-text mb-2">Workout Summary</h3>
            <div className="text-sm text-fitbod-text-secondary space-y-1">
              <div>{workoutExercises.length} exercises</div>
              <div>
                {workoutExercises.reduce((total, ex) => total + ex.sets, 0)} total sets
              </div>
              <div>
                Est. {Math.round(workoutExercises.reduce((total, ex) => {
                  return total + (ex.sets * (ex.restTime + 30));
                }, 0) / 60)} minutes
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-fitbod-subtle bg-fitbod-subtle/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-fitbod-text-secondary border border-fitbod-subtle rounded hover:bg-fitbod-subtle"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-fitbod-accent text-white rounded hover:bg-fitbod-accent/90"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}