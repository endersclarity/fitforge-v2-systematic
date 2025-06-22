'use client';

import { useEffect, useState } from 'react';

export default function DiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState<any>({});

  useEffect(() => {
    // Test localStorage
    const testData = { test: 'data', timestamp: new Date().toISOString() };
    localStorage.setItem('diagnosticTest', JSON.stringify(testData));
    const retrieved = localStorage.getItem('diagnosticTest');
    
    // Check for workout data
    const workoutSessions = localStorage.getItem('workoutSessions');
    const userProfile = localStorage.getItem('userProfile');
    
    setDiagnostics({
      localStorage: {
        working: retrieved === JSON.stringify(testData),
        testData: JSON.parse(retrieved || '{}'),
        hasWorkouts: !!workoutSessions,
        workoutCount: workoutSessions ? JSON.parse(workoutSessions).length : 0,
        hasProfile: !!userProfile,
      },
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
      },
      timestamp: new Date().toISOString(),
    });
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">FitForge Diagnostics</h1>
      
      <div className="space-y-6">
        <section className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">localStorage Status</h2>
          <pre className="bg-white p-4 rounded overflow-auto">
            {JSON.stringify(diagnostics.localStorage, null, 2)}
          </pre>
        </section>

        <section className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={() => {
                const mockSession = {
                  id: Date.now().toString(),
                  name: 'Test Workout',
                  date: new Date().toISOString(),
                  duration: 45,
                  exercises: [
                    { id: 'bench-press', name: 'Bench Press', sets: 3 },
                    { id: 'squat', name: 'Squat', sets: 4 }
                  ],
                  totalSets: 7
                };
                const sessions = JSON.parse(localStorage.getItem('workoutSessions') || '[]');
                sessions.push(mockSession);
                localStorage.setItem('workoutSessions', JSON.stringify(sessions));
                window.location.reload();
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Test Workout
            </button>
            
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Clear All Data
            </button>
          </div>
        </section>

        <section className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Navigation Links</h2>
          <div className="space-y-2">
            <a href="/" className="block text-blue-600 hover:underline">Home</a>
            <a href="/workouts" className="block text-blue-600 hover:underline">Workouts</a>
            <a href="/dashboard" className="block text-blue-600 hover:underline">Dashboard (might 404)</a>
          </div>
        </section>
      </div>
    </div>
  );
}