"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Search, Plus, Dumbbell } from "lucide-react"
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft"
import { toast } from "sonner"
import { ExerciseActionDialog } from "@/components/ui/exercise-action-dialog"
import { createExerciseDataMap, getMuscleDataForExercise } from "@/lib/muscle-engagement-parser"
import { MuscleEngagementChart } from "@/components/ui/muscle-engagement-chart"

interface Exercise {
  id: string
  name: string
  category: string
  equipment: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  muscleEngagement: Record<string, number>
  instructions: string[]
  tips: string[]
  variation: string
  rest_times: string
}

// Google Jewels exercise data (cleaned and enhanced)
const googleJewelsExercises: Exercise[] = [
  {
    id: "1",
    name: "Planks",
    category: "Abs",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    muscleEngagement: {
      "Rectus Abdominis": 65,
      "Transverse Abdominis": 40,
      "Obliques": 20,
      "Erector Spinae": 10
    },
    instructions: ["Assume a push-up position", "Keep body straight from head to heels", "Hold position"],
    tips: ["Keep core tight", "Don't let hips sag"],
    variation: "A",
    rest_times: "0:30"
  },
  {
    id: "2",
    name: "Spider Planks",
    category: "Abs",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    muscleEngagement: {
      "Rectus Abdominis": 60,
      "Transverse Abdominis": 30,
      "Obliques": 30,
      "Erector Spinae": 10,
      "Shoulders": 10
    },
    instructions: ["Start in plank position", "Bring knee to elbow", "Alternate sides"],
    tips: ["Control the movement", "Keep hips level"],
    variation: "A",
    rest_times: "1:00"
  },
  {
    id: "3",
    name: "Bench Situps",
    category: "Abs",
    equipment: "Bench",
    difficulty: "Beginner",
    muscleEngagement: {
      "Rectus Abdominis": 60,
      "Hip Flexors": 25,
      "Obliques": 15
    },
    instructions: ["Lie on bench", "Feet secured", "Sit up to knees"],
    tips: ["Don't pull on neck", "Control the descent"],
    variation: "A",
    rest_times: "1:30"
  },
  {
    id: "4",
    name: "Hanging Knee Raises",
    category: "Abs",
    equipment: "Pull-up Bar",
    difficulty: "Beginner",
    muscleEngagement: {
      "Rectus Abdominis": 80,
      "Hip Flexors": 23,
      "Obliques": 40,
      "Grip/Forearms": 10
    },
    instructions: ["Hang from bar", "Raise knees to chest", "Lower with control"],
    tips: ["Avoid swinging", "Focus on core contraction"],
    variation: "A",
    rest_times: "2:00"
  },
  {
    id: "5",
    name: "Shoulder Shrugs",
    category: "Back/Biceps",
    equipment: "Dumbbell",
    difficulty: "Intermediate",
    muscleEngagement: {
      "Trapezius": 80,
      "Levator Scapulae": 20
    },
    instructions: ["Hold weights at sides", "Shrug shoulders up", "Hold and lower"],
    tips: ["Don't roll shoulders", "Squeeze at top"],
    variation: "A/B",
    rest_times: "2:30"
  },
  {
    id: "6",
    name: "T Row",
    category: "Back/Biceps",
    equipment: "Barbell",
    difficulty: "Intermediate",
    muscleEngagement: {
      "Latissimus Dorsi": 85,
      "Rhomboids": 25,
      "Trapezius": 15,
      "Biceps Brachii": 12,
      "Grip/Forearms": 8
    },
    instructions: ["Bend at hips", "Pull bar to chest", "Squeeze shoulder blades"],
    tips: ["Keep back straight", "Control the weight"],
    variation: "B",
    rest_times: "3:00"
  },
  {
    id: "7",
    name: "Incline Hammer Curl",
    category: "Back/Biceps",
    equipment: "Dumbbell",
    difficulty: "Intermediate",
    muscleEngagement: {
      "Biceps Brachii": 70,
      "Brachialis": 20,
      "Brachioradialis": 10,
      "Grip/Forearms": 10
    },
    instructions: ["Sit on incline bench", "Curl with neutral grip", "Control the movement"],
    tips: ["Don't swing weights", "Full range of motion"],
    variation: "B",
    rest_times: "3:30"
  },
  {
    id: "8",
    name: "Neutral Grip Pull-ups",
    category: "Back/Biceps",
    equipment: "Pull-up Bar",
    difficulty: "Intermediate",
    muscleEngagement: {
      "Latissimus Dorsi": 85,
      "Biceps Brachii": 25,
      "Rhomboids": 15,
      "Trapezius": 15,
      "Grip/Forearms": 10
    },
    instructions: ["Grip bar with palms facing", "Pull up to chin", "Lower with control"],
    tips: ["Full hang at bottom", "Chest to bar"],
    variation: "B",
    rest_times: "4:00"
  },
  {
    id: "9",
    name: "Bent Over Rows",
    category: "Back/Biceps",
    equipment: "Barbell",
    difficulty: "Beginner",
    muscleEngagement: {
      "Latissimus Dorsi": 90,
      "Rhomboids": 25,
      "Trapezius": 20,
      "Biceps Brachii": 15,
      "Grip/Forearms": 10
    },
    instructions: ["Bend at hips", "Pull bar to lower chest", "Squeeze back"],
    tips: ["Keep core tight", "Don't round back"],
    variation: "A",
    rest_times: "4:30"
  },
  {
    id: "10",
    name: "Row",
    category: "Back/Biceps",
    equipment: "Barbell",
    difficulty: "Intermediate",
    muscleEngagement: {
      "Latissimus Dorsi": 85,
      "Rhomboids": 25,
      "Trapezius": 20,
      "Biceps Brachii": 15,
      "Core": 10,
      "Grip/Forearms": 10
    },
    instructions: ["Seated or bent position", "Pull to torso", "Control return"],
    tips: ["Steady torso", "Feel the squeeze"],
    variation: "B",
    rest_times: "5:00"
  },
  {
    id: "11",
    name: "Renegade Rows",
    category: "Back/Biceps",
    equipment: "Dumbbell",
    difficulty: "Intermediate",
    muscleEngagement: {
      "Latissimus Dorsi": 70,
      "Rhomboids": 25,
      "Trapezius": 20,
      "Biceps Brachii": 15,
      "Core": 30,
      "Grip/Forearms": 10
    },
    instructions: ["Plank on dumbbells", "Row one arm up", "Alternate sides"],
    tips: ["Keep hips square", "Core engaged"],
    variation: "A/B",
    rest_times: "5:30"
  },
  {
    id: "12",
    name: "Single Arm Upright Row",
    category: "Back/Biceps",
    equipment: "Dumbbell",
    difficulty: "Intermediate",
    muscleEngagement: {
      "Trapezius": 60,
      "Deltoids": 40,
      "Biceps Brachii": 20,
      "Core": 15,
      "Grip/Forearms": 10
    },
    instructions: ["Pull weight to chin", "Lead with elbow", "Control descent"],
    tips: ["Don't go too high", "Smooth motion"],
    variation: "A/B",
    rest_times: "6:00"
  },
  {
    id: "13",
    name: "TRX Bicep Curl",
    category: "Back/Biceps",
    equipment: "TRX",
    difficulty: "Intermediate",
    muscleEngagement: {
      "Biceps Brachii": 80,
      "Brachialis": 15,
      "Brachioradialis": 5,
      "Core": 15,
      "Grip/Forearms": 10
    },
    instructions: ["Lean back on TRX", "Curl body up", "Control return"],
    tips: ["Adjust angle for difficulty", "Keep elbows steady"],
    variation: "A/B",
    rest_times: "6:30"
  },
  {
    id: "14",
    name: "Chin-Ups",
    category: "Back/Biceps",
    equipment: "Pull-up Bar",
    difficulty: "Intermediate",
    muscleEngagement: {
      "Latissimus Dorsi": 85,
      "Biceps Brachii": 30,
      "Rhomboids": 20,
      "Trapezius": 15,
      "Grip/Forearms": 10
    },
    instructions: ["Underhand grip", "Pull chin over bar", "Lower slowly"],
    tips: ["Full range of motion", "Don't kip"],
    variation: "B",
    rest_times: "7:00"
  },
  {
    id: "15",
    name: "Face Pull",
    category: "Back/Biceps",
    equipment: "Cable",
    difficulty: "Intermediate",
    muscleEngagement: {
      "Trapezius": 50,
      "Rhomboids": 40,
      "Rear Deltoids": 40,
      "Rotator Cuff": 15
    },
    instructions: ["Pull rope to face", "Elbows high", "Squeeze rear delts"],
    tips: ["Don't go heavy", "Focus on form"],
    variation: "A/B",
    rest_times: "7:30"
  },
  {
    id: "16",
    name: "Concentration Curl",
    category: "Back/Biceps",
    equipment: "Dumbbell",
    difficulty: "Beginner",
    muscleEngagement: {
      "Biceps Brachii": 90,
      "Brachialis": 10,
      "Grip/Forearms": 10
    },
    instructions: ["Sit, brace elbow", "Curl weight up", "Slow negative"],
    tips: ["Full contraction", "Don't swing"],
    variation: "A",
    rest_times: "8:00"
  },
  {
    id: "17",
    name: "Wide Grip Pullups",
    category: "Back/Biceps",
    equipment: "Pull-up Bar",
    difficulty: "Beginner",
    muscleEngagement: {
      "Latissimus Dorsi": 90,
      "Biceps Brachii": 20,
      "Rhomboids": 15,
      "Trapezius": 15,
      "Grip/Forearms": 10
    },
    instructions: ["Wide overhand grip", "Pull chest to bar", "Control descent"],
    tips: ["Lead with chest", "Full hang"],
    variation: "A",
    rest_times: "8:30"
  },
  {
    id: "18",
    name: "Bench Press",
    category: "Chest/Triceps",
    equipment: "Barbell",
    difficulty: "Beginner",
    muscleEngagement: {
      "Pectoralis Major": 85,
      "Triceps Brachii": 25,
      "Anterior Deltoids": 30,
      "Serratus Anterior": 10
    },
    instructions: ["Lie on bench", "Lower bar to chest", "Press up"],
    tips: ["Arch back slightly", "Control the weight"],
    variation: "A",
    rest_times: "9:00"
  },
  {
    id: "19",
    name: "TRX Reverse Flys",
    category: "Chest/Triceps",
    equipment: "TRX",
    difficulty: "Intermediate",
    muscleEngagement: {
      "Rhomboids": 70,
      "Trapezius": 40,
      "Rear Deltoids": 30,
      "Core": 15
    },
    instructions: ["Lean forward", "Fly arms back", "Squeeze shoulder blades"],
    tips: ["Control the movement", "Feel the squeeze"],
    variation: "A/B",
    rest_times: "9:30"
  },
  {
    id: "20",
    name: "Tricep Extension",
    category: "Chest/Triceps",
    equipment: "Cable",
    difficulty: "Beginner",
    muscleEngagement: {
      "Triceps Brachii": 85,
      "Anconeus": 30
    },
    instructions: ["Push cable down", "Extend arms fully", "Control return"],
    tips: ["Keep elbows at side", "Full extension"],
    variation: "A",
    rest_times: "10:00"
  },
  // Continue with remaining exercises...
  {
    id: "32",
    name: "Goblet Squats",
    category: "Legs",
    equipment: "Kettlebell",
    difficulty: "Beginner",
    muscleEngagement: {
      "Quadriceps": 65,
      "Gluteus Maximus": 50,
      "Hamstrings": 20,
      "Core": 25,
      "Grip/Forearms": 5
    },
    instructions: ["Hold weight at chest", "Squat down", "Drive through heels"],
    tips: ["Chest up", "Knees track toes"],
    variation: "A",
    rest_times: "2:00"
  },
  {
    id: "33",
    name: "Deadlifts",
    category: "Legs",
    equipment: "Barbell",
    difficulty: "Intermediate",
    muscleEngagement: {
      "Hamstrings": 70,
      "Gluteus Maximus": 90,
      "Erector Spinae": 60,
      "Core": 30,
      "Grip/Forearms": 25
    },
    instructions: ["Lift bar from floor", "Drive hips forward", "Stand tall"],
    tips: ["Keep bar close", "Don't round back"],
    variation: "A",
    rest_times: "3:00"
  }
]

// Convert Google Jewels format to our raw data format for compatibility
const rawData = googleJewelsExercises.map(exercise => ({
  Equipment: exercise.equipment,
  Weights: "Variable",
  Rest_Times: exercise.rest_times,
  Exercise_Name: exercise.name.replace(/ /g, '_'),
  Variation: exercise.variation,
  Muscles_Used: Object.entries(exercise.muscleEngagement)
    .map(([muscle, percentage]) => `${muscle.replace(/ /g, '_')}:_${percentage}%`)
    .join(',_'),
  Workout_Type: exercise.category.replace('/', ''),
  Reps: parseInt(exercise.id)
}))

// Helper function to parse muscle engagement from the improved format
function parseMuscleEngagement(exercise: Exercise): Record<string, number> {
  return exercise.muscleEngagement
}

// Performance optimization: Create exercise data map for O(1) lookups
const exerciseDataMap = createExerciseDataMap(rawData)

// Dynamically generated filter arrays from Google Jewels exercise data
const categories = ["All", ...new Set(googleJewelsExercises.map(e => e.category))]
const equipment = ["All", ...new Set(googleJewelsExercises.map(e => e.equipment))]
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"]

export function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedEquipment, setSelectedEquipment] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // Use the hook to get the current draft and a function to update it
  const [draft, setDraft] = useWorkoutDraft()

  const filteredExercises = useMemo(() => {
    return googleJewelsExercises.filter((exercise) => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "All" || exercise.category === selectedCategory
      const matchesEquipment = selectedEquipment === "All" || exercise.equipment === selectedEquipment
      const matchesDifficulty = selectedDifficulty === "All" || exercise.difficulty === selectedDifficulty
      
      return matchesSearch && matchesCategory && matchesEquipment && matchesDifficulty
    })
  }, [searchTerm, selectedCategory, selectedEquipment, selectedDifficulty])

  const addToWorkout = (exercise: Exercise) => {
    // Create a workout exercise in the format expected by the draft
    const workoutExercise = {
      id: `${Date.now()}-${exercise.id}`,
      name: exercise.name,
      sets: [
        { id: "1", reps: 10, weight: 0, completed: false },
        { id: "2", reps: 10, weight: 0, completed: false },
        { id: "3", reps: 10, weight: 0, completed: false }
      ],
      restTime: parseInt(exercise.rest_times.split(':')[0]) * 60 + parseInt(exercise.rest_times.split(':')[1] || '0'),
      notes: ""
    }

    // Add to the current draft
    setDraft({
      ...draft,
      exercises: [...draft.exercises, workoutExercise]
    })

    // Provide user feedback
    toast.success(`Added '${exercise.name}' to your draft.`)
  }

  const handleStartWorkout = () => {
    if (!selectedExercise) return
    
    // Create minimal workout with single exercise
    const singleExerciseWorkout = {
      id: `quick-${Date.now()}`,
      name: `Quick ${selectedExercise.name}`,
      type: "A" as const,
      exercises: [{
        id: `${Date.now()}-${selectedExercise.id}`,
        name: selectedExercise.name,
        sets: [
          { id: "1", reps: 10, weight: 0, completed: false },
          { id: "2", reps: 10, weight: 0, completed: false },
          { id: "3", reps: 10, weight: 0, completed: false }
        ],
        restTime: 60,
        notes: ""
      }],
      createdAt: new Date().toISOString()
    }
    
    // Call global workout starter (will be set up in workout-creator.tsx)
    if (window.startWorkoutFromExerciseTab) {
      window.startWorkoutFromExerciseTab(singleExerciseWorkout)
    }
    setShowActionDialog(false)
  }
  
  const handleViewDetails = () => {
    setShowActionDialog(false)
    setShowDetailModal(true)
  }
  
  const handleAddToDraft = () => {
    if (selectedExercise) {
      addToWorkout(selectedExercise)
    }
    setShowActionDialog(false)
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Equipment" />
            </SelectTrigger>
            <SelectContent>
              {equipment.map((eq) => (
                <SelectItem key={eq} value={eq}>
                  {eq}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Exercise List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredExercises.map((exercise) => (
            <Card
              key={exercise.id}
              className="cursor-pointer transition-colors hover:bg-accent hover:shadow-md"
              onClick={() => {
                setSelectedExercise(exercise)
                setShowActionDialog(true)
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {exercise.category} • {exercise.equipment} • {exercise.difficulty}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    addToWorkout(exercise)
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Primary Muscles:</p>
                  <div className="space-y-1">
                    {Object.entries(exercise.muscleEngagement)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 2)
                      .map(([muscle, percentage]) => (
                        <div key={muscle} className="flex items-center justify-between text-sm">
                          <span>{muscle}</span>
                          <span className="font-medium">{percentage}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Exercise Details */}
        <div className="lg:sticky lg:top-6">
          {selectedExercise && showDetailModal ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedExercise.name}</CardTitle>
                <CardDescription>
                  {selectedExercise.category} • {selectedExercise.equipment} • {selectedExercise.difficulty}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enhanced Muscle Engagement */}
                {(() => {
                  const muscleData = getMuscleDataForExercise(selectedExercise.name, exerciseDataMap)
                  
                  return (
                    <>
                      <MuscleEngagementChart 
                        muscleData={muscleData}
                        title="Muscle Activation"
                      />

                      {/* Exercise Overview Stats */}
                      {muscleData.total.length > 0 && (
                        <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {muscleData.primary.length}
                            </div>
                            <div className="text-xs text-muted-foreground">Primary Muscles</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {muscleData.secondary.length}
                            </div>
                            <div className="text-xs text-muted-foreground">Secondary Muscles</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {muscleData.total.length > 0 ? Math.max(...muscleData.total.map(m => m.percentage)) : 0}%
                            </div>
                            <div className="text-xs text-muted-foreground">Peak Activation</div>
                          </div>
                        </div>
                      )}

                      {/* Rest Time Info */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Recommended Rest</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedExercise.rest_times} between sets
                        </p>
                      </div>
                    </>
                  )
                })()}

                {/* Instructions & Tips */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Instructions</h4>
                    <ol className="space-y-1 text-sm">
                      {selectedExercise.instructions.map((instruction, index) => (
                        <li key={index} className="flex">
                          <span className="font-medium text-primary mr-2">{index + 1}.</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Tips & Form Cues</h4>
                    <ul className="space-y-1 text-sm">
                      {selectedExercise.tips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button className="w-full" onClick={() => addToWorkout(selectedExercise)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Workout
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">Click an exercise to choose your action</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* NEW: Action Dialog */}
      <ExerciseActionDialog
        open={showActionDialog}
        onOpenChange={setShowActionDialog}
        exercise={selectedExercise}
        onStartWorkout={handleStartWorkout}
        onViewDetails={handleViewDetails}
        onAddToDraft={handleAddToDraft}
      />
    </div>
  )
}