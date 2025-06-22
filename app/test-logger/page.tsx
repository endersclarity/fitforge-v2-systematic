'use client';

import { WorkoutLogger } from "@/components/WorkoutLogger"

export default function TestLoggerPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Test WorkoutLogger</h1>
      <WorkoutLogger 
        userId="test-user-123"
        onSetCompleted={(set) => console.log('Set completed:', set)}
        onSessionEnd={(session) => {
          console.log('Session ended:', session);
          alert('Workout saved! Check the console and localStorage.');
        }}
      />
    </div>
  );
}