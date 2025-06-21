import { exerciseDB } from './database'

// Raw exercise data from the component (we'll extract this)
const rawExerciseData = [
  { Equipment: "Bodyweight", Weights: "Bodyweight", Rest_Times: "'0:30", Exercise_Name: "Planks", Variation: "A", Muscles_Used: "Rectus_Abdominis:_65%,_Transverse_Abdominis:_40%,_Obliques:_20%,_Erector_Spinae:_10%", Workout_Type: "Abs", Reps: 1 },
  { Equipment: "Bodyweight", Weights: "Bodyweight", Rest_Times: "'0:30", Exercise_Name: "Russian_Twists", Variation: "A", Muscles_Used: "Obliques:_75%,_Rectus_Abdominis:_35%,_Transverse_Abdominis:_25%", Workout_Type: "Abs", Reps: 15 },
  { Equipment: "Bodyweight", Weights: "Bodyweight", Rest_Times: "'0:30", Exercise_Name: "Mountain_Climbers", Variation: "A", Muscles_Used: "Rectus_Abdominis:_60%,_Obliques:_30%,_Hip_Flexors:_45%,_Shoulders:_25%", Workout_Type: "Abs", Reps: 10 },
  { Equipment: "Bodyweight", Weights: "Bodyweight", Rest_Times: "'0:30", Exercise_Name: "Bicycle_Crunches", Variation: "A", Muscles_Used: "Obliques:_80%,_Rectus_Abdominis:_50%,_Hip_Flexors:_30%", Workout_Type: "Abs", Reps: 15 },
  { Equipment: "Bodyweight", Weights: "Bodyweight", Rest_Times: "'0:30", Exercise_Name: "Dead_Bug", Variation: "A", Muscles_Used: "Transverse_Abdominis:_70%,_Rectus_Abdominis:_40%,_Obliques:_25%,_Hip_Flexors:_20%", Workout_Type: "Abs", Reps: 8 },
  { Equipment: "Bodyweight", Weights: "Bodyweight", Rest_Times: "'0:30", Exercise_Name: "Leg_Raises", Variation: "A", Muscles_Used: "Hip_Flexors:_75%,_Rectus_Abdominis:_60%,_Obliques:_20%", Workout_Type: "Abs", Reps: 10 },
  { Equipment: "Barbell", Weights: "185", Rest_Times: "'2:00", Exercise_Name: "Bench_Press", Variation: "A", Muscles_Used: "Pectoralis_Major:_85%,_Anterior_Deltoids:_30%,_Triceps_Brachii:_25%", Workout_Type: "ChestTriceps", Reps: 8 },
  { Equipment: "Barbell", Weights: "155", Rest_Times: "'2:00", Exercise_Name: "Incline_Bench_Press", Variation: "A", Muscles_Used: "Pectoralis_Major:_75%,_Anterior_Deltoids:_45%,_Triceps_Brachii:_30%", Workout_Type: "ChestTriceps", Reps: 8 },
  { Equipment: "Barbell", Weights: "205", Rest_Times: "'2:00", Exercise_Name: "Decline_Bench_Press", Variation: "A", Muscles_Used: "Pectoralis_Major:_80%,_Anterior_Deltoids:_25%,_Triceps_Brachii:_35%", Workout_Type: "ChestTriceps", Reps: 8 },
  { Equipment: "Dumbbell", Weights: "50", Rest_Times: "'1:30", Exercise_Name: "Dumbbell_Flyes", Variation: "A", Muscles_Used: "Pectoralis_Major:_90%,_Anterior_Deltoids:_20%", Workout_Type: "ChestTriceps", Reps: 10 },
  { Equipment: "Dumbbell", Weights: "70", Rest_Times: "'1:30", Exercise_Name: "Dumbbell_Bench_Press", Variation: "A", Muscles_Used: "Pectoralis_Major:_80%,_Anterior_Deltoids:_35%,_Triceps_Brachii:_30%", Workout_Type: "ChestTriceps", Reps: 8 },
  { Equipment: "Bodyweight", Weights: "Bodyweight", Rest_Times: "'1:00", Exercise_Name: "Push_Ups", Variation: "A", Muscles_Used: "Pectoralis_Major:_70%,_Triceps_Brachii:_45%,_Anterior_Deltoids:_25%", Workout_Type: "ChestTriceps", Reps: 12 },
  { Equipment: "Bodyweight", Weights: "Bodyweight", Rest_Times: "'1:00", Exercise_Name: "Tricep_Dips", Variation: "A", Muscles_Used: "Triceps_Brachii:_85%,_Anterior_Deltoids:_20%,_Pectoralis_Major:_15%", Workout_Type: "ChestTriceps", Reps: 10 },
  { Equipment: "Barbell", Weights: "95", Rest_Times: "'1:30", Exercise_Name: "Close_Grip_Bench_Press", Variation: "A", Muscles_Used: "Triceps_Brachii:_70%,_Pectoralis_Major:_45%,_Anterior_Deltoids:_25%", Workout_Type: "ChestTriceps", Reps: 8 },
  { Equipment: "Dumbbell", Weights: "25", Rest_Times: "'1:00", Exercise_Name: "Overhead_Tricep_Extension", Variation: "A", Muscles_Used: "Triceps_Brachii:_90%", Workout_Type: "ChestTriceps", Reps: 10 },
  { Equipment: "Barbell", Weights: "225", Rest_Times: "'2:30", Exercise_Name: "Deadlifts", Variation: "A", Muscles_Used: "Erector_Spinae:_85%,_Gluteus_Maximus:_70%,_Hamstrings:_65%,_Latissimus_Dorsi:_40%,_Rhomboids:_35%,_Trapezius:_30%", Workout_Type: "BackBiceps", Reps: 5 },
  { Equipment: "Barbell", Weights: "135", Rest_Times: "'2:00", Exercise_Name: "Bent_Over_Rows", Variation: "A", Muscles_Used: "Latissimus_Dorsi:_80%,_Rhomboids:_60%,_Middle_Trapezius:_50%,_Posterior_Deltoids:_35%,_Biceps_Brachii:_25%", Workout_Type: "BackBiceps", Reps: 8 },
  { Equipment: "Barbell", Weights: "185", Rest_Times: "'2:00", Exercise_Name: "T_Bar_Rows", Variation: "A", Muscles_Used: "Latissimus_Dorsi:_75%,_Rhomboids:_65%,_Middle_Trapezius:_45%,_Posterior_Deltoids:_30%,_Biceps_Brachii:_20%", Workout_Type: "BackBiceps", Reps: 8 },
  { Equipment: "Cable", Weights: "120", Rest_Times: "'1:30", Exercise_Name: "Lat_Pulldowns", Variation: "A", Muscles_Used: "Latissimus_Dorsi:_85%,_Rhomboids:_40%,_Middle_Trapezius:_35%,_Biceps_Brachii:_30%", Workout_Type: "BackBiceps", Reps: 10 },
  { Equipment: "Cable", Weights: "100", Rest_Times: "'1:30", Exercise_Name: "Seated_Cable_Rows", Variation: "A", Muscles_Used: "Latissimus_Dorsi:_70%,_Rhomboids:_65%,_Middle_Trapezius:_55%,_Posterior_Deltoids:_35%,_Biceps_Brachii:_25%", Workout_Type: "BackBiceps", Reps: 10 },
  { Equipment: "Bodyweight", Weights: "Bodyweight", Rest_Times: "'1:00", Exercise_Name: "Pull_Ups", Variation: "A", Muscles_Used: "Latissimus_Dorsi:_80%,_Biceps_Brachii:_50%,_Rhomboids:_45%,_Middle_Trapezius:_35%", Workout_Type: "BackBiceps", Reps: 6 },
  { Equipment: "Barbell", Weights: "85", Rest_Times: "'1:30", Exercise_Name: "Barbell_Curls", Variation: "A", Muscles_Used: "Biceps_Brachii:_90%,_Brachialis:_30%,_Brachioradialis:_20%", Workout_Type: "BackBiceps", Reps: 10 },
  { Equipment: "Dumbbell", Weights: "30", Rest_Times: "'1:00", Exercise_Name: "Hammer_Curls", Variation: "A", Muscles_Used: "Brachialis:_70%,_Biceps_Brachii:_60%,_Brachioradialis:_50%", Workout_Type: "BackBiceps", Reps: 10 },
  { Equipment: "Dumbbell", Weights: "25", Rest_Times: "'1:00", Exercise_Name: "Concentration_Curls", Variation: "A", Muscles_Used: "Biceps_Brachii:_85%,_Brachialis:_25%", Workout_Type: "BackBiceps", Reps: 10 },
  { Equipment: "Barbell", Weights: "315", Rest_Times: "'3:00", Exercise_Name: "Squats", Variation: "A", Muscles_Used: "Quadriceps:_85%,_Gluteus_Maximus:_70%,_Hamstrings:_40%,_Calves:_25%,_Erector_Spinae:_20%", Workout_Type: "Legs", Reps: 5 },
  { Equipment: "Barbell", Weights: "275", Rest_Times: "'2:30", Exercise_Name: "Romanian_Deadlifts", Variation: "A", Muscles_Used: "Hamstrings:_80%,_Gluteus_Maximus:_65%,_Erector_Spinae:_45%", Workout_Type: "Legs", Reps: 6 },
  { Equipment: "Dumbbell", Weights: "60", Rest_Times: "'2:00", Exercise_Name: "Bulgarian_Split_Squats", Variation: "A", Muscles_Used: "Quadriceps:_75%,_Gluteus_Maximus:_60%,_Hamstrings:_35%,_Calves:_20%", Workout_Type: "Legs", Reps: 8 },
  { Equipment: "Machine", Weights: "180", Rest_Times: "'1:30", Exercise_Name: "Leg_Press", Variation: "A", Muscles_Used: "Quadriceps:_80%,_Gluteus_Maximus:_55%,_Hamstrings:_30%", Workout_Type: "Legs", Reps: 12 },
  { Equipment: "Machine", Weights: "110", Rest_Times: "'1:30", Exercise_Name: "Leg_Curls", Variation: "A", Muscles_Used: "Hamstrings:_90%,_Calves:_15%", Workout_Type: "Legs", Reps: 12 },
  { Equipment: "Machine", Weights: "140", Rest_Times: "'1:30", Exercise_Name: "Leg_Extensions", Variation: "A", Muscles_Used: "Quadriceps:_95%", Workout_Type: "Legs", Reps: 12 },
  { Equipment: "Machine", Weights: "200", Rest_Times: "'1:30", Exercise_Name: "Calf_Raises", Variation: "A", Muscles_Used: "Calves:_95%", Workout_Type: "Legs", Reps: 15 },
  { Equipment: "Dumbbell", Weights: "45", Rest_Times: "'2:00", Exercise_Name: "Shoulder_Press", Variation: "A", Muscles_Used: "Anterior_Deltoids:_80%,_Medial_Deltoids:_60%,_Triceps_Brachii:_35%,_Upper_Trapezius:_25%", Workout_Type: "Shoulders", Reps: 8 },
  { Equipment: "Dumbbell", Weights: "20", Rest_Times: "'1:00", Exercise_Name: "Lateral_Raises", Variation: "A", Muscles_Used: "Medial_Deltoids:_90%,_Anterior_Deltoids:_15%", Workout_Type: "Shoulders", Reps: 12 },
  { Equipment: "Dumbbell", Weights: "20", Rest_Times: "'1:00", Exercise_Name: "Rear_Delt_Flyes", Variation: "A", Muscles_Used: "Posterior_Deltoids:_85%,_Rhomboids:_30%,_Middle_Trapezius:_25%", Workout_Type: "Shoulders", Reps: 12 },
  { Equipment: "Barbell", Weights: "95", Rest_Times: "'1:30", Exercise_Name: "Upright_Rows", Variation: "A", Muscles_Used: "Medial_Deltoids:_70%,_Upper_Trapezius:_60%,_Anterior_Deltoids:_40%,_Biceps_Brachii:_20%", Workout_Type: "Shoulders", Reps: 10 },
  { Equipment: "Barbell", Weights: "135", Rest_Times: "'2:00", Exercise_Name: "Shrugs", Variation: "A", Muscles_Used: "Upper_Trapezius:_95%,_Levator_Scapulae:_30%", Workout_Type: "Shoulders", Reps: 12 },
  { Equipment: "Dumbbell", Weights: "15", Rest_Times: "'1:00", Exercise_Name: "Front_Raises", Variation: "A", Muscles_Used: "Anterior_Deltoids:_90%,_Medial_Deltoids:_20%", Workout_Type: "Shoulders", Reps: 12 },
  { Equipment: "Bodyweight", Weights: "Bodyweight", Rest_Times: "'1:00", Exercise_Name: "Pike_Push_Ups", Variation: "A", Muscles_Used: "Anterior_Deltoids:_75%,_Triceps_Brachii:_45%,_Medial_Deltoids:_35%", Workout_Type: "Shoulders", Reps: 8 }
]

function parseMuscleEngagement(musclesUsedString: string): Record<string, number> {
  if (!musclesUsedString) return {}
  
  const muscles: Record<string, number> = {}
  
  musclesUsedString.split(',').forEach(muscle => {
    const trimmed = muscle.trim()
    if (trimmed.includes(':_') && trimmed.includes('%')) {
      const [nameRaw, percentageRaw] = trimmed.split(':_')
      const name = nameRaw.replace(/_/g, ' ').trim()
      const percentage = parseInt(percentageRaw.replace('%', '').trim())
      
      if (!isNaN(percentage)) {
        muscles[name] = percentage
      }
    }
  })
  
  return muscles
}

function mapDifficulty(variation: string): string {
  switch (variation) {
    case 'A': return 'Beginner'
    case 'B': return 'Intermediate'
    case 'C': return 'Advanced'
    default: return 'Beginner'
  }
}

// Transform raw data for database
export const transformExercisesForDatabase = () => {
  return rawExerciseData.map(item => ({
    name: item.Exercise_Name.replace(/_/g, ' '),
    category: item.Workout_Type === 'ChestTriceps' ? 'Chest/Triceps' : 
              item.Workout_Type === 'BackBiceps' ? 'Back/Biceps' : 
              item.Workout_Type,
    equipment: item.Equipment.replace(/_/g, ' '),
    difficulty: mapDifficulty(item.Variation),
    muscle_engagement: parseMuscleEngagement(item.Muscles_Used),
    muscles_used: item.Muscles_Used,
    rest_time: item.Rest_Times,
    variation: item.Variation,
    workout_type: item.Workout_Type,
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

// Migration function to populate exercises
export const migrateExercises = async () => {
  try {
    const exercises = transformExercisesForDatabase()
    const { data, error } = await exerciseDB.populateExercises(exercises)
    
    if (error) {
      console.error('Migration error:', error)
      return { success: false, error }
    }
    
    console.log('Successfully migrated exercises:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Migration failed:', error)
    return { success: false, error }
  }
}