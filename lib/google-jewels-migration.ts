import { exerciseDB } from './database'

// Google Jewels exercise data (cleaned and improved)
const googleJewelsData = [
  {
    "id": "1",
    "name": "Planks",
    "category": "Abs",
    "equipment": "Bodyweight",
    "difficulty": "Beginner",
    "muscleEngagement": {
      "Rectus Abdominis": 65,
      "Transverse Abdominis": 40,
      "Obliques": 20,
      "Erector Spinae": 10
    },
    "variation": "A",
    "rest_times": "0:30"
  },
  {
    "id": "2",
    "name": "Spider Planks",
    "category": "Abs",
    "equipment": "Bodyweight", // Fixed from "Bench"
    "difficulty": "Beginner",
    "muscleEngagement": {
      "Rectus Abdominis": 60,
      "Transverse Abdominis": 30,
      "Obliques": 30,
      "Erector Spinae": 10,
      "Shoulders": 10
    },
    "variation": "A",
    "rest_times": "1:00"
  },
  {
    "id": "3",
    "name": "Bench Situps",
    "category": "Abs",
    "equipment": "Bench", // Fixed from "TRX"
    "difficulty": "Beginner",
    "muscleEngagement": {
      "Rectus Abdominis": 60,
      "Hip Flexors": 25,
      "Obliques": 15
    },
    "variation": "A",
    "rest_times": "1:30"
  },
  {
    "id": "4",
    "name": "Hanging Knee Raises",
    "category": "Abs",
    "equipment": "Pull-up Bar", // Fixed from "Kettlebell"
    "difficulty": "Beginner",
    "muscleEngagement": {
      "Rectus Abdominis": 80,
      "Hip Flexors": 23,
      "Obliques": 40,
      "Grip/Forearms": 10
    },
    "variation": "A",
    "rest_times": "2:00"
  },
  {
    "id": "5",
    "name": "Shoulder Shrugs",
    "category": "Back/Biceps",
    "equipment": "Dumbbell",
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Trapezius": 80,
      "Levator Scapulae": 20
    },
    "variation": "A/B",
    "rest_times": "2:30"
  },
  {
    "id": "6",
    "name": "T Row",
    "category": "Back/Biceps",
    "equipment": "Barbell", // Fixed from "OYA"
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Latissimus Dorsi": 85,
      "Rhomboids": 25,
      "Trapezius": 15,
      "Biceps Brachii": 12,
      "Grip/Forearms": 8
    },
    "variation": "B",
    "rest_times": "3:00"
  },
  {
    "id": "7",
    "name": "Incline Hammer Curl",
    "category": "Back/Biceps",
    "equipment": "Dumbbell", // Fixed from "Pull-up Bar"
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Biceps Brachii": 70,
      "Brachialis": 20,
      "Brachioradialis": 10,
      "Grip/Forearms": 10
    },
    "variation": "B",
    "rest_times": "3:30"
  },
  {
    "id": "8",
    "name": "Neutral Grip Pull-ups",
    "category": "Back/Biceps",
    "equipment": "Pull-up Bar", // Fixed from "Countertop"
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Latissimus Dorsi": 85,
      "Biceps Brachii": 25,
      "Rhomboids": 15,
      "Trapezius": 15,
      "Grip/Forearms": 10
    },
    "variation": "B",
    "rest_times": "4:00"
  },
  {
    "id": "9",
    "name": "Bent Over Rows",
    "category": "Back/Biceps",
    "equipment": "Barbell", // Fixed from "Plybox"
    "difficulty": "Beginner",
    "muscleEngagement": {
      "Latissimus Dorsi": 90,
      "Rhomboids": 25,
      "Trapezius": 20,
      "Biceps Brachii": 15,
      "Grip/Forearms": 10
    },
    "variation": "A",
    "rest_times": "4:30"
  },
  {
    "id": "10",
    "name": "Row",
    "category": "Back/Biceps",
    "equipment": "Barbell",
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Latissimus Dorsi": 85,
      "Rhomboids": 25,
      "Trapezius": 20,
      "Biceps Brachii": 15,
      "Core": 10,
      "Grip/Forearms": 10
    },
    "variation": "B",
    "rest_times": "5:00"
  },
  {
    "id": "11",
    "name": "Renegade Rows",
    "category": "Back/Biceps",
    "equipment": "Dumbbell",
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Latissimus Dorsi": 70,
      "Rhomboids": 25,
      "Trapezius": 20,
      "Biceps Brachii": 15,
      "Core": 30,
      "Grip/Forearms": 10
    },
    "variation": "A/B",
    "rest_times": "5:30"
  },
  {
    "id": "12",
    "name": "Single Arm Upright Row",
    "category": "Back/Biceps",
    "equipment": "Dumbbell",
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Trapezius": 60,
      "Deltoids": 40,
      "Biceps Brachii": 20,
      "Core": 15,
      "Grip/Forearms": 10
    },
    "variation": "A/B",
    "rest_times": "6:00"
  },
  {
    "id": "13",
    "name": "TRX Bicep Curl",
    "category": "Back/Biceps",
    "equipment": "TRX",
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Biceps Brachii": 80,
      "Brachialis": 15,
      "Brachioradialis": 5,
      "Core": 15,
      "Grip/Forearms": 10
    },
    "variation": "A/B",
    "rest_times": "6:30"
  },
  {
    "id": "14",
    "name": "Chin-Ups",
    "category": "Back/Biceps",
    "equipment": "Pull-up Bar",
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Latissimus Dorsi": 85,
      "Biceps Brachii": 30,
      "Rhomboids": 20,
      "Trapezius": 15,
      "Grip/Forearms": 10
    },
    "variation": "B",
    "rest_times": "7:00"
  },
  {
    "id": "15",
    "name": "Face Pull",
    "category": "Back/Biceps",
    "equipment": "Cable",
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Trapezius": 50,
      "Rhomboids": 40,
      "Rear Deltoids": 40,
      "Rotator Cuff": 15
    },
    "variation": "A/B",
    "rest_times": "7:30"
  },
  {
    "id": "16",
    "name": "Concentration Curl",
    "category": "Back/Biceps",
    "equipment": "Dumbbell",
    "difficulty": "Beginner",
    "muscleEngagement": {
      "Biceps Brachii": 90,
      "Brachialis": 10,
      "Grip/Forearms": 10
    },
    "variation": "A",
    "rest_times": "8:00"
  },
  {
    "id": "17",
    "name": "Wide Grip Pullups",
    "category": "Back/Biceps",
    "equipment": "Pull-up Bar",
    "difficulty": "Beginner",
    "muscleEngagement": {
      "Latissimus Dorsi": 90,
      "Biceps Brachii": 20,
      "Rhomboids": 15,
      "Trapezius": 15,
      "Grip/Forearms": 10
    },
    "variation": "A",
    "rest_times": "8:30"
  },
  {
    "id": "18",
    "name": "Bench Press",
    "category": "Chest/Triceps",
    "equipment": "Barbell",
    "difficulty": "Beginner",
    "muscleEngagement": {
      "Pectoralis Major": 85,
      "Triceps Brachii": 25,
      "Anterior Deltoids": 30,
      "Serratus Anterior": 10
    },
    "variation": "A",
    "rest_times": "9:00"
  },
  {
    "id": "19",
    "name": "TRX Reverse Flys",
    "category": "Chest/Triceps",
    "equipment": "TRX",
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Rhomboids": 70,
      "Trapezius": 40,
      "Rear Deltoids": 30,
      "Core": 15
    },
    "variation": "A/B",
    "rest_times": "9:30"
  },
  {
    "id": "20",
    "name": "Tricep Extension",
    "category": "Chest/Triceps",
    "equipment": "Cable",
    "difficulty": "Beginner",
    "muscleEngagement": {
      "Triceps Brachii": 85,
      "Anconeus": 30
    },
    "variation": "A",
    "rest_times": "10:00"
  },
  {
    "id": "21",
    "name": "TRX Pushup",
    "category": "Chest/Triceps",
    "equipment": "TRX",
    "difficulty": "Beginner",
    "muscleEngagement": {
      "Pectoralis Major": 80,
      "Triceps Brachii": 30,
      "Anterior Deltoids": 25,
      "Core": 25
    },
    "variation": "A",
    "rest_times": "1:30" // Added missing rest time
  },
  {
    "id": "22",
    "name": "Single Arm Bench",
    "category": "Chest/Triceps",
    "equipment": "Dumbbell",
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Pectoralis Major": 80,
      "Triceps Brachii": 25,
      "Anterior Deltoids": 25,
      "Core": 20
    },
    "variation": "A/B",
    "rest_times": "2:00" // Added missing rest time
  },
  {
    "id": "23",
    "name": "Single Arm Incline",
    "category": "Chest/Triceps",
    "equipment": "Dumbbell",
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Pectoralis Major": 75,
      "Triceps Brachii": 25,
      "Anterior Deltoids": 30,
      "Core": 20
    },
    "variation": "A/B",
    "rest_times": "2:00" // Added missing rest time
  },
  {
    "id": "24",
    "name": "Pullover",
    "category": "Chest/Triceps",
    "equipment": "Dumbbell",
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Latissimus Dorsi": 65,
      "Pectoralis Major": 35,
      "Triceps Brachii": 25,
      "Serratus Anterior": 15
    },
    "variation": "A/B",
    "rest_times": "1:30" // Added missing rest time
  },
  {
    "id": "25",
    "name": "Clap Push-ups",
    "category": "Chest/Triceps",
    "equipment": "Bodyweight",
    "difficulty": "Advanced", // Upgraded difficulty
    "muscleEngagement": {
      "Pectoralis Major": 80,
      "Triceps Brachii": 20,
      "Anterior Deltoids": 20
    },
    "variation": "A/B",
    "rest_times": "2:30" // Added missing rest time
  },
  {
    "id": "26",
    "name": "Push-ups",
    "category": "Chest/Triceps",
    "equipment": "Bodyweight",
    "difficulty": "Beginner", // Corrected difficulty
    "muscleEngagement": {
      "Pectoralis Major": 80,
      "Triceps Brachii": 30,
      "Anterior Deltoids": 25,
      "Core": 15
    },
    "variation": "A/B",
    "rest_times": "1:30" // Added missing rest time
  },
  {
    "id": "27",
    "name": "Incline Bench Press",
    "category": "Chest/Triceps",
    "equipment": "Barbell",
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Pectoralis Major": 75,
      "Triceps Brachii": 25,
      "Anterior Deltoids": 35,
      "Serratus Anterior": 10
    },
    "variation": "B",
    "rest_times": "2:30" // Added missing rest time
  },
  {
    "id": "28",
    "name": "Shoulder Press",
    "category": "Shoulders", // Moved to Shoulders category
    "equipment": "Dumbbell",
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Deltoids": 80,
      "Triceps Brachii": 30,
      "Trapezius": 20,
      "Serratus Anterior": 15
    },
    "variation": "A/B",
    "rest_times": "2:00" // Added missing rest time
  },
  {
    "id": "29",
    "name": "Dips",
    "category": "Chest/Triceps",
    "equipment": "Bodyweight",
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Pectoralis Major": 65,
      "Triceps Brachii": 70,
      "Anterior Deltoids": 30,
      "Core": 10
    },
    "variation": "B",
    "rest_times": "2:30" // Added missing rest time
  },
  {
    "id": "30",
    "name": "Kettlebell Halos",
    "category": "Shoulders", // Moved to Shoulders category
    "equipment": "Kettlebell",
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Deltoids": 60,
      "Trapezius": 30,
      "Triceps Brachii": 25,
      "Core": 30,
      "Grip/Forearms": 15
    },
    "variation": "A/B",
    "rest_times": "1:30" // Added missing rest time
  },
  {
    "id": "31",
    "name": "Kettlebell Press",
    "category": "Shoulders", // Moved to Shoulders category
    "equipment": "Kettlebell",
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Deltoids": 70,
      "Triceps Brachii": 40,
      "Core": 35,
      "Grip/Forearms": 15
    },
    "variation": "A/B",
    "rest_times": "2:00" // Added missing rest time
  },
  {
    "id": "32",
    "name": "Goblet Squats",
    "category": "Legs",
    "equipment": "Kettlebell",
    "difficulty": "Beginner",
    "muscleEngagement": {
      "Quadriceps": 65,
      "Gluteus Maximus": 50,
      "Hamstrings": 20,
      "Core": 25,
      "Grip/Forearms": 5
    },
    "variation": "A",
    "rest_times": "2:00" // Added missing rest time
  },
  {
    "id": "33",
    "name": "Deadlifts",
    "category": "Legs",
    "equipment": "Barbell",
    "difficulty": "Intermediate", // Upgraded difficulty
    "muscleEngagement": {
      "Hamstrings": 70,
      "Gluteus Maximus": 90,
      "Erector Spinae": 60,
      "Core": 30,
      "Grip/Forearms": 25
    },
    "variation": "A",
    "rest_times": "3:00" // Added missing rest time
  },
  {
    "id": "34",
    "name": "Calf Raises",
    "category": "Legs",
    "equipment": "Bodyweight",
    "difficulty": "Beginner",
    "muscleEngagement": {
      "Gastrocnemius": 80,
      "Soleus": 70
    },
    "variation": "A",
    "rest_times": "1:00" // Added missing rest time
  },
  {
    "id": "35",
    "name": "Glute Bridges",
    "category": "Legs",
    "equipment": "Bodyweight",
    "difficulty": "Beginner", // Corrected difficulty
    "muscleEngagement": {
      "Gluteus Maximus": 90,
      "Hamstrings": 40,
      "Core": 20,
      "Quadriceps": 10
    },
    "variation": "A", // Corrected variation
    "rest_times": "1:30" // Added missing rest time
  },
  {
    "id": "36",
    "name": "Box Step-ups",
    "category": "Legs",
    "equipment": "Box", // Fixed from "Plybox"
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Quadriceps": 65,
      "Gluteus Maximus": 85,
      "Hamstrings": 30,
      "Erector Spinae": 15
    },
    "variation": "B",
    "rest_times": "2:00" // Added missing rest time
  },
  {
    "id": "37",
    "name": "Stiff Legged Deadlifts",
    "category": "Legs",
    "equipment": "Barbell",
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Gluteus Maximus": 75,
      "Hamstrings": 85,
      "Erector Spinae": 50,
      "Core": 25,
      "Grip/Forearms": 15
    },
    "variation": "B",
    "rest_times": "2:30" // Added missing rest time
  },
  {
    "id": "38",
    "name": "Kettlebell Swings",
    "category": "Legs",
    "equipment": "Kettlebell",
    "difficulty": "Intermediate",
    "muscleEngagement": {
      "Gluteus Maximus": 80,
      "Hamstrings": 70,
      "Core": 40,
      "Shoulders": 15,
      "Grip/Forearms": 15
    },
    "variation": "A/B",
    "rest_times": "2:00" // Added missing rest time
  }
]

// Transform Google Jewels data for database
export const transformGoogleJewelsForDatabase = () => {
  return googleJewelsData.map(item => ({
    name: item.name,
    category: item.category,
    equipment: item.equipment,
    difficulty: item.difficulty,
    muscle_engagement: item.muscleEngagement,
    muscles_used: Object.entries(item.muscleEngagement)
      .map(([muscle, percentage]) => `${muscle}:_${percentage}%`)
      .join(',_'),
    rest_time: item.rest_times,
    variation: item.variation,
    workout_type: item.category.replace('/', ''),
    instructions: [
      "Detailed instructions coming soon.",
      "Please consult a professional for proper form."
    ],
    tips: [
      "Maintain proper form throughout the movement.",
      "Start with lighter weights and focus on technique."
    ]
  }))
}

// Migration function to populate exercises with Google Jewels data
export const migrateGoogleJewelsExercises = async () => {
  try {
    const exercises = transformGoogleJewelsForDatabase()
    const { data, error } = await exerciseDB.populateExercises(exercises)
    
    if (error) {
      console.error('Google Jewels migration error:', error)
      return { success: false, error }
    }
    
    console.log('Successfully migrated Google Jewels exercises:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Google Jewels migration failed:', error)
    return { success: false, error }
  }
}