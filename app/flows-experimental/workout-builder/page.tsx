'use client'

import React, { useState } from 'react';
import { Metadata } from 'next';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import exercisesData from '@/data/exercises-real.json';

import { WorkoutExercise } from './components/WorkoutExercise';
import { ExerciseSelectorModal } from './components/ExerciseSelectorModal';
import { SaveWorkoutModal } from './components/SaveWorkoutModal';

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  difficulty: string;
  variation: string;
  muscleEngagement: Record<string, number>;
}

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

export default function WorkoutBuilderPage() {
  const [exercises] = useState<Exercise[]>(exercisesData as Exercise[]);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExerciseData[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [workoutName, setWorkoutName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddExercise = (exercise: Exercise) => {
    const newWorkoutExercise: WorkoutExerciseData = {
      id: `${exercise.id}-${Date.now()}`,
      exerciseId: exercise.id,
      name: exercise.name,
      sets: 3,
      reps: 8,
      weight: exercise.equipment === 'Bodyweight' ? 0 : 135,
      restTime: 90,
      orderIndex: workoutExercises.length,
      isSuperset: false,
    };

    setWorkoutExercises([...workoutExercises, newWorkoutExercise]);
    setShowExerciseSelector(false);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setWorkoutExercises((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((item, index) => ({ ...item, orderIndex: index }));
      });
    }
  };

  const handleExerciseUpdate = (id: string, updates: Partial<WorkoutExerciseData>) => {
    setWorkoutExercises(prev => 
      prev.map(ex => ex.id === id ? { ...ex, ...updates } : ex)
    );
  };

  const handleRemoveExercise = (id: string) => {
    setWorkoutExercises(prev => prev.filter(ex => ex.id !== id));
  };

  const handleSaveWorkout = () => {
    setShowSaveModal(true);
  };

  const handleWorkoutSaved = () => {
    // Could integrate with workout template service here
    alert('Workout saved successfully!');
    setShowSaveModal(false);
    setWorkoutExercises([]);
    setWorkoutName('');
  };

  return (
    <div className="min-h-screen bg-fitbod-background text-fitbod-text">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-fitbod-text">Workout Builder</h1>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 text-fitbod-text-secondary border border-fitbod-subtle rounded bg-fitbod-card hover:bg-fitbod-subtle"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-fitbod-accent text-white rounded disabled:opacity-50 hover:bg-fitbod-accent/90"
              onClick={handleSaveWorkout}
              disabled={workoutExercises.length === 0}
            >
              Save Workout
            </button>
          </div>
        </div>

        {/* Workout Content */}
        {workoutExercises.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-lg font-semibold mb-2 text-fitbod-text">Start building your workout</h2>
              <p className="text-fitbod-text-secondary mb-6">Add exercises to create your custom workout</p>
              <button 
                className="px-6 py-3 bg-fitbod-accent text-white rounded-lg font-medium hover:bg-fitbod-accent/90"
                onClick={() => setShowExerciseSelector(true)}
              >
                Add an exercise
              </button>
            </div>
          </div>
        ) : (
          /* Workout Exercises */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-fitbod-text">
                {workoutExercises.length} {workoutExercises.length === 1 ? 'Exercise' : 'Exercises'}
              </h3>
              <button 
                className="px-4 py-2 bg-fitbod-accent text-white rounded font-medium hover:bg-fitbod-accent/90"
                onClick={() => setShowExerciseSelector(true)}
              >
                Add an exercise
              </button>
            </div>

            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={workoutExercises.map(ex => ex.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {workoutExercises.map((exercise, index) => (
                    <WorkoutExercise
                      key={exercise.id}
                      exercise={exercise}
                      index={index}
                      onUpdate={handleExerciseUpdate}
                      onRemove={handleRemoveExercise}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Exercise Selector Modal */}
        {showExerciseSelector && (
          <ExerciseSelectorModal
            exercises={exercises}
            onAddExercise={handleAddExercise}
            onClose={() => setShowExerciseSelector(false)}
          />
        )}

        {/* Save Workout Modal */}
        {showSaveModal && (
          <SaveWorkoutModal
            workoutExercises={workoutExercises}
            onSave={handleWorkoutSaved}
            onClose={() => setShowSaveModal(false)}
          />
        )}
      </div>
    </div>
  );
}