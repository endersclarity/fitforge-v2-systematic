// Simple test to verify the workout data structure
// This would simulate what happens in the actual app flow

// Simulate the data structure from pull-day page
const mockWorkoutSession = {
  exercises: [
    {
      id: "neutral-grip-pullups",
      name: "Neutral Grip Pull-ups",
      category: "BackBiceps",
      equipment: "Pull-up_Bar",
      difficulty: "Advanced",
      muscleEngagement: {
        "Latissimus_Dorsi": 0.85,
        "Rhomboids": 0.70,
        "Biceps_Brachii": 0.60
      },
      plannedSets: [
        {
          id: "neutral-grip-pullups-set-1",
          exerciseId: "neutral-grip-pullups",
          setNumber: 1,
          targetWeight: 0, // Bodyweight
          targetReps: 8,
          equipment: "Pull-up_Bar",
          notes: ""
        },
        {
          id: "neutral-grip-pullups-set-2", 
          exerciseId: "neutral-grip-pullups",
          setNumber: 2,
          targetWeight: 0,
          targetReps: 6,
          equipment: "Pull-up_Bar",
          notes: ""
        }
      ]
    }
  ],
  workoutType: 'pull',
  startTime: new Date().toISOString()
};

// Simulate what workout-execution saves
const completedSets = new Set(['neutral-grip-pullups-neutral-grip-pullups-set-1', 'neutral-grip-pullups-neutral-grip-pullups-set-2']);

const workoutHistory = {
  id: Date.now().toString(),
  date: new Date().toISOString(),
  type: mockWorkoutSession.workoutType,
  duration: 1800, // 30 minutes
  exercises: mockWorkoutSession.exercises.map(exercise => {
    const completedSetCount = exercise.plannedSets.filter(set => 
      completedSets.has(`${exercise.id}-${set.id}`)
    ).length;
    
    // Calculate total weight and reps from completed sets
    const completedSetsData = exercise.plannedSets.filter(set => 
      completedSets.has(`${exercise.id}-${set.id}`)
    );
    
    const totalWeight = completedSetsData.reduce((sum, set) => sum + (set.targetWeight || 0), 0);
    const totalReps = completedSetsData.reduce((sum, set) => sum + (set.targetReps || 0), 0);
    
    return {
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      muscleEngagement: exercise.muscleEngagement || {},
      completedSets: completedSetCount,
      totalWeight,
      totalReps,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty
    };
  }),
  totalSets: completedSets.size
};

console.log("Mock workout session:", JSON.stringify(mockWorkoutSession, null, 2));
console.log("\nCompleted sets:", Array.from(completedSets));
console.log("\nFinal workout history:", JSON.stringify(workoutHistory, null, 2));

// Test the analytics calculations
const exercise = workoutHistory.exercises[0];
console.log("\n=== ANALYTICS CALCULATIONS ===");
console.log("Exercise:", exercise.name);
console.log("Total weight:", exercise.totalWeight);
console.log("Total reps:", exercise.totalReps);
console.log("Completed sets:", exercise.completedSets);

if (exercise.completedSets > 0) {
  const avgWeight = exercise.totalWeight / exercise.completedSets;
  const avgReps = exercise.totalReps / exercise.completedSets;
  console.log("Avg weight per set:", avgWeight);
  console.log("Avg reps per set:", avgReps);
  
  // Simulate what the analytics page does
  const sets = Array.from({ length: exercise.completedSets }, (_, i) => ({
    weight: Math.round(avgWeight + (Math.random() - 0.5) * 10),
    reps: Math.round(avgReps + (Math.random() - 0.5) * 4),
    isPersonalRecord: false
  }));
  
  console.log("Generated sets for display:", sets);
} else {
  console.log("ERROR: No completed sets found\!");
}
EOF < /dev/null
