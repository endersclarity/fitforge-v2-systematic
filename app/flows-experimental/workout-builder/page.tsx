import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workout Builder - FitForge',
  description: 'Create custom workouts with drag-and-drop exercise builder',
};

export default function WorkoutBuilderPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Workout Builder</h1>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded">
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded">
              Save Workout
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-2">Start building your workout</h2>
            <p className="text-gray-600 mb-6">Add exercises to create your custom workout</p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium">
              Add an exercise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}