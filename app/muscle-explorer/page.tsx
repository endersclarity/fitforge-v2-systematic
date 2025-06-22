'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MuscleEngagementDisplay } from '@/components/muscle-engagement-display';
import { Search, Target, Zap } from 'lucide-react';
import exercisesData from '@/data/exercises-real.json';

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment?: string;
  difficulty?: string;
  variation?: string;
  muscleEngagement?: Record<string, number>;
}

export default function MuscleExplorerPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setExercises(exercisesData as Exercise[]);
  }, []);

  // Get all unique muscles from all exercises
  const getAllMuscles = () => {
    const muscleSet = new Set<string>();
    exercises.forEach(exercise => {
      if (exercise.muscleEngagement) {
        Object.keys(exercise.muscleEngagement).forEach(muscle => {
          muscleSet.add(muscle);
        });
      }
    });
    return Array.from(muscleSet).sort();
  };

  // Filter exercises by selected muscle and search term
  const getFilteredExercises = () => {
    let filtered = exercises;

    // Filter by muscle
    if (selectedMuscle !== 'all') {
      filtered = filtered.filter(exercise => 
        exercise.muscleEngagement && 
        exercise.muscleEngagement[selectedMuscle] && 
        exercise.muscleEngagement[selectedMuscle] > 0
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exercise.equipment && exercise.equipment.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort by muscle engagement if a specific muscle is selected
    if (selectedMuscle !== 'all') {
      filtered.sort((a, b) => {
        const aEngagement = a.muscleEngagement?.[selectedMuscle] || 0;
        const bEngagement = b.muscleEngagement?.[selectedMuscle] || 0;
        return bEngagement - aEngagement;
      });
    }

    return filtered;
  };

  const formatMuscleName = (muscleName: string) => {
    return muscleName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getWorkoutTypeColor = (category: string) => {
    switch (category) {
      case 'ChestTriceps': return 'bg-red-100 text-red-700';
      case 'BackBiceps': return 'bg-blue-100 text-blue-700';
      case 'Legs': return 'bg-green-100 text-green-700';
      case 'Abs': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const allMuscles = getAllMuscles();
  const filteredExercises = getFilteredExercises();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            💪 Muscle Engagement Explorer
          </h1>
          <p className="text-lg text-[#A1A1A3] max-w-2xl mx-auto">
            Discover which exercises target specific muscles and explore detailed muscle engagement data.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Filters and Exercise List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <Card className="bg-[#1C1C1E] border-[#2C2C2E]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Search className="w-5 h-5 text-[#FF375F]" />
                  Exercise Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Search Exercises
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, category, or equipment..."
                    className="w-full p-2 border border-[#2C2C2E] rounded-xl focus:ring-4 focus:ring-[#FF375F]/20 focus:border-[#FF375F] bg-[#2C2C2E] text-white placeholder-[#A1A1A3]"
                  />
                </div>

                {/* Muscle Filter */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Target Muscle
                  </label>
                  <select
                    value={selectedMuscle}
                    onChange={(e) => setSelectedMuscle(e.target.value)}
                    className="w-full p-2 border border-[#2C2C2E] rounded-xl focus:ring-4 focus:ring-[#FF375F]/20 focus:border-[#FF375F] bg-[#2C2C2E] text-white"
                  >
                    <option value="all">All Muscles</option>
                    {allMuscles.map(muscle => (
                      <option key={muscle} value={muscle}>
                        {formatMuscleName(muscle)}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Exercise List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Exercises ({filteredExercises.length})
                  {selectedMuscle !== 'all' && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      targeting {formatMuscleName(selectedMuscle)}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {filteredExercises.map(exercise => (
                    <div
                      key={exercise.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedExercise?.id === exercise.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedExercise(exercise)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{exercise.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getWorkoutTypeColor(exercise.category)}>
                              {exercise.category}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {exercise.equipment} • {exercise.difficulty}
                            </span>
                          </div>
                        </div>
                        {selectedMuscle !== 'all' && exercise.muscleEngagement?.[selectedMuscle] && (
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                              {exercise.muscleEngagement[selectedMuscle]}%
                            </div>
                            <div className="text-xs text-gray-500">engagement</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Muscle Engagement Details */}
          <div className="lg:col-span-1">
            {selectedExercise ? (
              <MuscleEngagementDisplay 
                exerciseName={selectedExercise.name}
                muscleEngagement={selectedExercise.muscleEngagement}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Select an Exercise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center py-8">
                    Click on any exercise to see detailed muscle engagement data
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
