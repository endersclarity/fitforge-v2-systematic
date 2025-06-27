'use client'

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Minus, Plus } from 'lucide-react';

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

interface WorkoutExerciseProps {
  exercise: WorkoutExerciseData;
  index: number;
  onUpdate: (id: string, updates: Partial<WorkoutExerciseData>) => void;
  onRemove: (id: string) => void;
}

export function WorkoutExercise({ exercise, index, onUpdate, onRemove }: WorkoutExerciseProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const updateField = (field: keyof WorkoutExerciseData, value: number) => {
    onUpdate(exercise.id, { [field]: value });
  };

  const incrementField = (field: keyof WorkoutExerciseData, increment: number = 1) => {
    const currentValue = exercise[field] as number;
    const newValue = Math.max(0, currentValue + increment);
    updateField(field, newValue);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-fitbod-card rounded-lg border border-fitbod-subtle p-4 shadow-sm"
      data-testid={`draggable-exercise-${index}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          className="mt-2 p-1 text-fitbod-text-secondary hover:text-fitbod-text cursor-grab active:cursor-grabbing"
          data-testid="drag-handle"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={20} />
        </button>

        {/* Exercise Content */}
        <div className="flex-1">
          {/* Exercise Name */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-lg text-fitbod-text" data-testid="exercise-name">
                {exercise.name}
              </h3>
              <p className="text-sm text-fitbod-text-secondary">
                {exercise.sets} sets × {exercise.reps} reps
                {exercise.weight > 0 && ` @ ${exercise.weight} lb`}
              </p>
            </div>
            <button
              onClick={() => onRemove(exercise.id)}
              className="text-fitbod-text-secondary hover:text-red-500 p-1"
              aria-label="Remove exercise"
            >
              <X size={20} />
            </button>
          </div>

          {/* Configuration Controls */}
          <div className="grid grid-cols-3 gap-4">
            {/* Sets */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-fitbod-text-secondary uppercase tracking-wide">
                Sets
              </label>
              <div className="flex items-center border border-fitbod-subtle rounded bg-fitbod-background">
                <button
                  onClick={() => incrementField('sets', -1)}
                  className="p-2 hover:bg-fitbod-subtle text-fitbod-text"
                  disabled={exercise.sets <= 1}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={exercise.sets}
                  onChange={(e) => updateField('sets', parseInt(e.target.value) || 1)}
                  className="flex-1 text-center border-0 focus:ring-0 focus:outline-none bg-transparent text-fitbod-text"
                  data-testid="sets-input"
                />
                <button
                  onClick={() => incrementField('sets', 1)}
                  className="p-2 hover:bg-fitbod-subtle text-fitbod-text"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Reps */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-fitbod-text-secondary uppercase tracking-wide">
                Reps
              </label>
              <div className="flex items-center border border-fitbod-subtle rounded bg-fitbod-background">
                <button
                  onClick={() => incrementField('reps', -1)}
                  className="p-2 hover:bg-fitbod-subtle text-fitbod-text"
                  disabled={exercise.reps <= 1}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={exercise.reps}
                  onChange={(e) => updateField('reps', parseInt(e.target.value) || 1)}
                  className="flex-1 text-center border-0 focus:ring-0 focus:outline-none bg-transparent text-fitbod-text"
                  data-testid="reps-input"
                />
                <button
                  onClick={() => incrementField('reps', 1)}
                  className="p-2 hover:bg-fitbod-subtle text-fitbod-text"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-fitbod-text-secondary uppercase tracking-wide">
                Weight (lb)
              </label>
              <div className="flex items-center border border-fitbod-subtle rounded bg-fitbod-background">
                <button
                  onClick={() => incrementField('weight', -5)}
                  className="p-2 hover:bg-fitbod-subtle text-fitbod-text"
                  disabled={exercise.weight <= 0}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={exercise.weight}
                  onChange={(e) => updateField('weight', parseInt(e.target.value) || 0)}
                  className="flex-1 text-center border-0 focus:ring-0 focus:outline-none bg-transparent text-fitbod-text"
                  data-testid="weight-input"
                />
                <button
                  onClick={() => incrementField('weight', 5)}
                  className="p-2 hover:bg-fitbod-subtle text-fitbod-text"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Rest Time */}
          <div className="mt-3">
            <label className="text-xs font-medium text-fitbod-text-secondary uppercase tracking-wide">
              Rest Time (seconds)
            </label>
            <div className="flex gap-2 mt-1">
              {[60, 90, 120, 180].map((seconds) => (
                <button
                  key={seconds}
                  onClick={() => updateField('restTime', seconds)}
                  className={`px-3 py-1 text-sm rounded ${
                    exercise.restTime === seconds
                      ? 'bg-fitbod-accent text-white'
                      : 'bg-fitbod-subtle text-fitbod-text hover:bg-fitbod-subtle/70'
                  }`}
                >
                  {seconds < 120 ? `${seconds}s` : `${seconds / 60}m`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}