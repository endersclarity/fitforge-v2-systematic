'use client'

import React, { useState } from 'react';
import { X, Search, Dumbbell } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  difficulty: string;
  variation: string;
  muscleEngagement: Record<string, number>;
}

interface ExerciseSelectorModalProps {
  exercises: Exercise[];
  onAddExercise: (exercise: Exercise) => void;
  onClose: () => void;
}

export function ExerciseSelectorModal({ exercises, onAddExercise, onClose }: ExerciseSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Filter exercises based on search and equipment
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEquipment = !selectedEquipment || exercise.equipment === selectedEquipment;
    return matchesSearch && matchesEquipment;
  });

  // Get unique equipment types
  const equipmentTypes = Array.from(new Set(exercises.map(ex => ex.equipment))).sort();

  const handleAddToWorkout = () => {
    if (selectedExercise) {
      onAddExercise(selectedExercise);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="exercise-selector-modal">
      <div className="bg-fitbod-card rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col m-4 border border-fitbod-subtle">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-fitbod-subtle">
          <h2 className="text-xl font-semibold text-fitbod-text">Select Exercises</h2>
          <button
            onClick={onClose}
            className="text-fitbod-text-secondary hover:text-fitbod-text"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-fitbod-subtle">
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fitbod-text-secondary" size={20} />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-fitbod-subtle rounded-lg focus:ring-2 focus:ring-fitbod-accent focus:border-fitbod-accent bg-fitbod-background text-fitbod-text"
              />
            </div>

            {/* Equipment Filter */}
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="px-4 py-2 border border-fitbod-subtle rounded-lg focus:ring-2 focus:ring-fitbod-accent focus:border-fitbod-accent bg-fitbod-background text-fitbod-text"
            >
              <option value="">All Equipment</option>
              {equipmentTypes.map((equipment) => (
                <option key={equipment} value={equipment}>
                  {equipment}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tags */}
          <div className="mt-4 flex gap-2">
            <span className="text-sm text-fitbod-text-secondary">Equipment:</span>
            {equipmentTypes.slice(0, 5).map((equipment) => (
              <button
                key={equipment}
                onClick={() => setSelectedEquipment(selectedEquipment === equipment ? '' : equipment)}
                className={`px-3 py-1 text-sm rounded ${
                  selectedEquipment === equipment
                    ? 'bg-fitbod-accent text-white'
                    : 'bg-fitbod-subtle text-fitbod-text hover:bg-fitbod-subtle/70'
                }`}
              >
                {equipment}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Exercise Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="text-sm text-fitbod-text-secondary mb-4">
                {filteredExercises.length} exercises found
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    onClick={() => setSelectedExercise(exercise)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedExercise?.id === exercise.id
                        ? 'border-fitbod-accent bg-fitbod-accent/10'
                        : 'border-fitbod-subtle hover:border-fitbod-accent/50 hover:bg-fitbod-subtle'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-fitbod-subtle rounded">
                        <Dumbbell size={20} className="text-fitbod-text-secondary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-fitbod-text">{exercise.name}</h3>
                        <div className="text-sm text-fitbod-text-secondary mt-1">
                          <span className="inline-block mr-3">{exercise.equipment}</span>
                          <span className="inline-block">{exercise.difficulty}</span>
                        </div>
                        <div className="text-xs text-fitbod-text-secondary mt-1">
                          {exercise.category}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredExercises.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-fitbod-text-secondary">No exercises found matching your criteria</p>
                </div>
              )}
            </div>

            {/* Exercise Details */}
            {selectedExercise && (
              <div className="w-80 border-l border-fitbod-subtle bg-fitbod-subtle/30 p-6">
                <h3 className="font-semibold text-lg mb-2 text-fitbod-text">{selectedExercise.name}</h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-fitbod-text">Equipment:</span>
                    <span className="ml-2 text-fitbod-text-secondary">{selectedExercise.equipment}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-fitbod-text">Difficulty:</span>
                    <span className="ml-2 text-fitbod-text-secondary">{selectedExercise.difficulty}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-fitbod-text">Category:</span>
                    <span className="ml-2 text-fitbod-text-secondary">{selectedExercise.category}</span>
                  </div>

                  <div>
                    <span className="font-medium text-fitbod-text">Variation:</span>
                    <span className="ml-2 text-fitbod-text-secondary">{selectedExercise.variation}</span>
                  </div>
                </div>

                {/* Muscle Engagement */}
                <div className="mt-4">
                  <h4 className="font-medium text-fitbod-text mb-2">Primary Muscles</h4>
                  <div className="space-y-1">
                    {Object.entries(selectedExercise.muscleEngagement)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([muscle, percentage]) => (
                        <div key={muscle} className="flex justify-between text-sm">
                          <span className="text-fitbod-text">{muscle.replace(/_/g, ' ')}</span>
                          <span className="text-fitbod-text-secondary">{percentage}%</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAddToWorkout}
                  className="w-full mt-6 bg-fitbod-accent text-white py-2 px-4 rounded font-medium hover:bg-fitbod-accent/90"
                >
                  Add to Workout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}