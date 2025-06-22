'use client';

import React, { useState, useEffect } from 'react';

// Minimal WorkoutLogger
function MinimalLogger() {
  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState<any[]>([]);

  const addSet = () => {
    if (!exercise || !weight || !reps) return;
    
    const newSet = {
      id: Date.now().toString(),
      exercise,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      timestamp: new Date().toISOString()
    };
    
    setSets([...sets, newSet]);
    setWeight('');
    setReps('');
  };

  const saveWorkout = () => {
    if (sets.length === 0) return;
    
    const workout = {
      id: Date.now().toString(),
      name: `Workout ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      duration: 45,
      exercises: sets.reduce((acc: any[], set) => {
        const existing = acc.find(e => e.name === set.exercise);
        if (existing) {
          existing.sets++;
        } else {
          acc.push({ id: set.exercise, name: set.exercise, sets: 1 });
        }
        return acc;
      }, []),
      totalSets: sets.length,
      sets: sets
    };
    
    const sessions = JSON.parse(localStorage.getItem('workoutSessions') || '[]');
    sessions.push(workout);
    localStorage.setItem('workoutSessions', JSON.stringify(sessions));
    
    alert('Workout saved!');
    setSets([]);
    setExercise('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Log Workout</h2>
      
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Exercise name"
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          className="w-full p-2 border rounded"
        />
        
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={addSet}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Add Set
          </button>
        </div>
        
        {sets.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Current Sets:</h3>
            {sets.map((set, i) => (
              <div key={set.id} className="text-sm text-gray-600">
                {i + 1}. {set.exercise} - {set.weight}lbs × {set.reps} reps
              </div>
            ))}
            <button
              onClick={saveWorkout}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
            >
              Save Workout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Minimal Dashboard
function MinimalDashboard() {
  const [workouts, setWorkouts] = useState<any[]>([]);

  useEffect(() => {
    const loadWorkouts = () => {
      const sessions = JSON.parse(localStorage.getItem('workoutSessions') || '[]');
      setWorkouts(sessions);
    };
    
    loadWorkouts();
    // Refresh every 2 seconds to see updates
    const interval = setInterval(loadWorkouts, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Recent Workouts</h2>
      
      {workouts.length === 0 ? (
        <p className="text-gray-500">No workouts yet. Log one above!</p>
      ) : (
        <div className="space-y-4">
          {workouts.slice(-5).reverse().map((workout) => (
            <div key={workout.id} className="p-4 border rounded">
              <div className="font-semibold">{workout.name}</div>
              <div className="text-sm text-gray-600">
                {new Date(workout.date).toLocaleString()}
              </div>
              <div className="text-sm mt-2">
                {workout.totalSets} sets across {workout.exercises.length} exercises
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button
        onClick={() => {
          localStorage.removeItem('workoutSessions');
          setWorkouts([]);
        }}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded text-sm"
      >
        Clear All Data
      </button>
    </div>
  );
}

// Main Page
export default function MinimalPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">FitForge Minimal Demo</h1>
      
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        <MinimalLogger />
        <MinimalDashboard />
      </div>
      
      <div className="text-center mt-8 text-sm text-gray-600">
        This proves localStorage communication works. The dashboard updates automatically when you save a workout.
      </div>
    </div>
  );
}