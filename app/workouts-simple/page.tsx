'use client';

import { WorkoutLogger } from "@/components/WorkoutLogger"

export default function WorkoutsSimplePage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Log Your Workout</h1>
      <WorkoutLogger 
        userId="user-123"
        onSetCompleted={(set) => {
          console.log('Set completed:', set);
        }}
        onSessionEnd={(session) => {
          console.log('Workout saved:', session);
          // Redirect to dashboard after saving
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        }}
      />
    </div>
  );
}