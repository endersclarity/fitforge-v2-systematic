// Test data that matches the actual data structure
export const TEST_EXERCISES = [
  {
    id: "bench_press",
    name: "Bench Press",
    category: "ChestTriceps",
    equipment: "Barbell",
    difficulty: "Intermediate",
    variation: "A/B",
    muscleEngagement: {
      "Pectoralis_Major": 85,
      "Triceps_Brachii": 45,
      "Deltoids_Anterior": 35
    }
  },
  {
    id: "dumbbell_curl",
    name: "Dumbbell Curl",
    category: "BackBiceps",
    equipment: "Dumbbell",
    difficulty: "Beginner",
    variation: "A/B",
    muscleEngagement: {
      "Biceps_Brachii": 90,
      "Brachialis": 50,
      "Brachioradialis": 30
    }
  },
  {
    id: "squat",
    name: "Squat",
    category: "Legs",
    equipment: "Barbell",
    difficulty: "Intermediate",
    variation: "A/B",
    muscleEngagement: {
      "Quadriceps": 80,
      "Gluteus_Maximus": 70,
      "Hamstrings": 40
    }
  },
  // Add more test exercises as needed
];

export const EQUIPMENT_FILTERS = [
  { display: "Barbell", value: "Barbell", expectedCount: 2 },
  { display: "Dumbbell", value: "Dumbbell", expectedCount: 1 },
  { display: "Bodyweight", value: "Bodyweight", expectedCount: 0 }
];

export const MUSCLE_FILTERS = [
  { display: "Chest", value: "Pectoralis_Major", expectedCount: 1 },
  { display: "Biceps", value: "Biceps_Brachii", expectedCount: 1 },
  { display: "Quads", value: "Quadriceps", expectedCount: 1 }
];