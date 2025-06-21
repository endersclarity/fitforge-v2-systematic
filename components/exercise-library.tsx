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
// Removed unused imports - now using centralized JSON data
import { MuscleEngagementChart } from "@/components/ui/muscle-engagement-chart"
import { QuickWorkoutBuilder } from "@/components/quick-workout-builder"
import exercisesData from "../data/exercises.json"

interface Exercise {
  id: string
  name: string
  category: string
  equipment: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  muscleEngagement: { [key: string]: number }
  instructions: string[]
  tips: string[]
}

// Use centralized exercise data from JSON file
const exercises: Exercise[] = exercisesData;

// Dynamically generated filter arrays from your exercise data
const categories = ["All", ...new Set(exercises.map(e => e.category))];
const equipment = ["All", ...new Set(exercises.map(e => e.equipment))];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

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
    return exercises.filter((exercise) => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "All" || exercise.category === selectedCategory
      const matchesEquipment = selectedEquipment === "All" || exercise.equipment === selectedEquipment
      const matchesDifficulty = selectedDifficulty === "All" || exercise.difficulty === selectedDifficulty

      return matchesSearch && matchesCategory && matchesEquipment && matchesDifficulty
    })
  }, [searchTerm, selectedCategory, selectedEquipment, selectedDifficulty])

  const addToWorkout = (exercise: Exercise) => {
    // Handle duplicate exercises
    if (draft.exercises.some((ex) => ex.name === exercise.name)) {
      // Provide user feedback
      toast.info(`'${exercise.name}' is already in your draft.`)
      return
    }

    // Create the new exercise in the format the WorkoutCreator expects
    const newWorkoutExercise = {
      id: `${Date.now()}-${exercise.id}`,
      name: exercise.name,
      sets: [
        { id: "1", reps: 10, weight: 0, completed: false },
        { id: "2", reps: 10, weight: 0, completed: false },
        { id: "3", reps: 10, weight: 0, completed: false },
      ],
      restTime: 60,
      notes: "",
    }
    
    // Update the draft in localStorage via our hook
    setDraft({
      ...draft,
      exercises: [...draft.exercises, newWorkoutExercise],
    })
    
    // Provide user feedback
    toast.success(`Added '${exercise.name}' to your draft.`)
  }

  const handleStartWorkout = (workout?: any) => {
    let workoutToStart = workout
    
    // If no workout provided, create one from selected exercise (for action dialog)
    if (!workoutToStart && selectedExercise) {
      workoutToStart = {
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
    }
    
    if (!workoutToStart) return
    
    // Call global workout starter (will be set up in workout-creator.tsx)
    if (window.startWorkoutFromExerciseTab) {
      window.startWorkoutFromExerciseTab(workoutToStart)
    }
    
    setShowActionDialog(false)
    toast.success(`Starting workout: ${workoutToStart.name}`)
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
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight" data-testid="exercise-library">Exercise Library</h1>
        <p className="text-muted-foreground">Discover exercises with detailed muscle engagement data</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Equipment</label>
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((eq) => (
                    <SelectItem key={eq} value={eq}>
                      {eq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((diff) => (
                    <SelectItem key={diff} value={diff}>
                      {diff}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Exercise List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Exercises ({filteredExercises.length})</h2>

          {filteredExercises.map((exercise) => (
            <Card
              key={exercise.id}
              className="cursor-pointer transition-colors hover:bg-accent hover:shadow-md"
              onClick={() => {
                setSelectedExercise(exercise)
                setShowActionDialog(true)
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      addToWorkout(exercise)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{exercise.category}</Badge>
                  <Badge variant="outline">{exercise.equipment}</Badge>
                  <Badge
                    variant={
                      exercise.difficulty === "Beginner"
                        ? "default"
                        : exercise.difficulty === "Intermediate"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {exercise.difficulty}
                  </Badge>
                </div>
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

        {/* Quick Workout Builder */}
        <div className="lg:sticky lg:top-6">
          <QuickWorkoutBuilder onStartWorkout={handleStartWorkout} />
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
