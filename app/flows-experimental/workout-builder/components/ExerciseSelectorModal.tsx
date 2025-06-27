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
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Select Exercises</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b">
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Equipment Filter */}
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <span className="text-sm text-gray-600">Equipment:</span>
            {equipmentTypes.slice(0, 5).map((equipment) => (
              <button
                key={equipment}
                onClick={() => setSelectedEquipment(selectedEquipment === equipment ? '' : equipment)}
                className={`px-3 py-1 text-sm rounded ${
                  selectedEquipment === equipment
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              <div className="text-sm text-gray-600 mb-4">
                {filteredExercises.length} exercises found
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    onClick={() => setSelectedExercise(exercise)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedExercise?.id === exercise.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded">
                        <Dumbbell size={20} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{exercise.name}</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="inline-block mr-3">{exercise.equipment}</span>
                          <span className="inline-block">{exercise.difficulty}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {exercise.category}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredExercises.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No exercises found matching your criteria</p>
                </div>
              )}
            </div>

            {/* Exercise Details */}
            {selectedExercise && (
              <div className="w-80 border-l bg-gray-50 p-6">
                <h3 className="font-semibold text-lg mb-2">{selectedExercise.name}</h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Equipment:</span>
                    <span className="ml-2">{selectedExercise.equipment}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Difficulty:</span>
                    <span className="ml-2">{selectedExercise.difficulty}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="ml-2">{selectedExercise.category}</span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Variation:</span>
                    <span className="ml-2">{selectedExercise.variation}</span>
                  </div>
                </div>

                {/* Muscle Engagement */}
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Primary Muscles</h4>
                  <div className="space-y-1">
                    {Object.entries(selectedExercise.muscleEngagement)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([muscle, percentage]) => (
                        <div key={muscle} className="flex justify-between text-sm">
                          <span>{muscle.replace(/_/g, ' ')}</span>
                          <span className="text-gray-600">{percentage}%</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAddToWorkout}
                  className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700"
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