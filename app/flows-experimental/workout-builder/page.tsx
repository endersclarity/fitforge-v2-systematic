'use client'

import React, { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import exercisesData from '@/data/exercises-real.json';
import { WORKOUT_DEFAULTS } from '@/lib/workout-constants';

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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [existingTemplateNames, setExistingTemplateNames] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load template if editing
  useEffect(() => {
    const templateId = sessionStorage.getItem('editTemplateId');
    if (templateId) {
      const stored = localStorage.getItem('fitforge_workout_templates');
      if (stored) {
        const templates = JSON.parse(stored);
        const template = templates.find((t: any) => t.id === templateId);
        if (template) {
          setWorkoutName(template.name);
          
          // Convert template exercises to workout exercises
          const loadedExercises = template.exercises.map((ex: any, index: number) => ({
            id: `${ex.exerciseId}-${Date.now()}-${index}`,
            exerciseId: ex.exerciseId,
            name: ex.exerciseName || exercises.find(e => e.id === ex.exerciseId)?.name || ex.exerciseId,
            sets: ex.targetSets,
            reps: ex.targetRepsMin || ex.targetRepsMax || 10,
            weight: ex.targetWeight || 0,
            restTime: ex.restTimeSeconds || 90,
            orderIndex: ex.orderIndex || index,
            isSuperset: ex.isSuperset || false,
            supersetGroup: ex.supersetGroup
          }));
          
          setWorkoutExercises(loadedExercises);
        }
      }
      // Clear the edit template ID
      sessionStorage.removeItem('editTemplateId');
    }
  }, [exercises]);

  // Load existing template names for validation
  useEffect(() => {
    const stored = localStorage.getItem('fitforge_workout_templates');
    if (stored) {
      try {
        const templates = JSON.parse(stored);
        const names = templates.map((t: any) => t.name);
        setExistingTemplateNames(names);
      } catch (error) {
        console.error('Error loading template names:', error);
      }
    }
  }, [showSaveModal]); // Reload when save modal opens

  const handleAddExercise = (exercise: Exercise) => {
    const newWorkoutExercise: WorkoutExerciseData = {
      id: `${exercise.id}-${Date.now()}`,
      exerciseId: exercise.id,
      name: exercise.name,
      sets: WORKOUT_DEFAULTS.SETS,
      reps: WORKOUT_DEFAULTS.REPS,
      weight: exercise.equipment === 'Bodyweight' ? WORKOUT_DEFAULTS.BODYWEIGHT_WEIGHT : WORKOUT_DEFAULTS.DEFAULT_WEIGHT,
      restTime: WORKOUT_DEFAULTS.REST_TIME,
      orderIndex: workoutExercises.length,
      isSuperset: false,
    };

    setWorkoutExercises([...workoutExercises, newWorkoutExercise]);
    setShowExerciseSelector(false);
  };

  const handleDragEnd = (event: any) => {
    try {
      const { active, over } = event;

      // Validate drag operation
      if (!active || !over) {
        console.warn('Drag operation incomplete: missing active or over element');
        return;
      }

      if (active.id !== over.id) {
        setWorkoutExercises((items) => {
          try {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            // Validate indices
            if (oldIndex === -1 || newIndex === -1) {
              console.error('Invalid drag indices:', { oldIndex, newIndex, activeId: active.id, overId: over.id });
              return items; // Return unchanged array
            }

            const reordered = arrayMove(items, oldIndex, newIndex);
            return reordered.map((item, index) => ({ ...item, orderIndex: index }));
          } catch (error) {
            console.error('Error reordering exercises:', error);
            return items; // Return unchanged array on error
          }
        });
      }
    } catch (error) {
      console.error('Error in drag end handler:', error);
      // Could add toast notification here for user feedback
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

  const handleWorkoutSaved = (workoutData: any) => {
    // Create template object
    const template = {
      id: Date.now().toString(),
      name: workoutData.name,
      type: workoutData.type,
      category: workoutData.category,
      exercises: workoutData.exercises.map((ex: any) => ({
        ...ex,
        exerciseName: exercises.find(e => e.id === ex.exerciseId)?.name || ex.exerciseId
      })),
      estimatedDuration: workoutData.estimatedDuration,
      createdAt: new Date().toISOString(),
      timesUsed: 0
    };
    
    // Save to localStorage
    try {
      const existing = localStorage.getItem('fitforge_workout_templates');
      const templates = existing ? JSON.parse(existing) : [];
      templates.push(template);
      localStorage.setItem('fitforge_workout_templates', JSON.stringify(templates));
      
      setShowSuccessMessage(true);
      setShowSaveModal(false);
      setWorkoutExercises([]);
      setWorkoutName('');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving workout template:', error);
      alert('Failed to save workout template');
    }
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
              data-testid="save-workout-button"
            >
              Save Workout
            </button>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
            ✅ Workout saved successfully!
          </div>
        )}

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
                data-testid="add-exercise-button"
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
                data-testid="add-exercise-button"
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
            existingTemplateNames={existingTemplateNames}
          />
        )}
      </div>
    </div>
  );
}