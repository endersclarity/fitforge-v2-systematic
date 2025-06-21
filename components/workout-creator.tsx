"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Play, Save, Timer, RotateCcw, ArrowLeft, Loader2, Brain, Zap } from "lucide-react"
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft"
import { saveWorkoutSession } from "@/lib/session-storage"
import { toast } from "sonner"
import exercisesData from "../data/exercises.json"

interface WorkoutExercise {
  id: string
  name: string
  sets: ExerciseSet[]
  restTime: number
  notes: string
}

interface ExerciseSet {
  id: string
  reps: number
  weight: number
  completed: boolean
}

interface Workout {
  id: string
  name: string
  type: "A" | "B"
  exercises: WorkoutExercise[]
  createdAt: string
}

interface ActiveWorkout {
  workout: Workout
  currentExerciseIndex: number
  currentSetIndex: number
  startTime: Date
  isResting: boolean
  restStartTime?: Date
}

// Use centralized exercise data from JSON file
const availableExercises = exercisesData.map(item => ({
  id: item.id,
  name: item.name,
  category: item.category
}));

// DISABLED: parseRestTime utility (was used for pre-built workouts)
// const parseRestTime = (restTimeStr: string): number => {
//   if (!restTimeStr || restTimeStr === '') return 60;
//   const cleanStr = restTimeStr.replace("'", "");
//   const [minutes, seconds] = cleanStr.split(':').map(Number);
//   return (minutes * 60) + (seconds || 0);
// };

// DISABLED: Pre-built workout generator (needs enhancedExerciseData)
// const generatePreBuiltWorkouts = (): Workout[] => {
//   return [];
// };

export function WorkoutCreator() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  
  // Use shared draft hook instead of local state
  const [draft, updateDraft, { isLoading, isSaving }] = useWorkoutDraft()

  // Show loading state while draft is loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading workout draft...</span>
      </div>
    )
  }

  // NEW: Global workout starter for exercise tab integration
  useEffect(() => {
    window.startWorkoutFromExerciseTab = (workout) => {
      setActiveWorkout({
        workout: { ...workout },
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        startTime: new Date(),
        isResting: false,
      })
    }
    
    // Cleanup
    return () => {
      delete window.startWorkoutFromExerciseTab
    }
  }, [])

  useEffect(() => {
    // MODIFIED: This useEffect now populates pre-built workouts
    const savedWorkouts = JSON.parse(localStorage.getItem("workouts") || "[]");

    // Check if pre-built workouts already exist (avoid duplicates)
    const hasPreBuilt = savedWorkouts.some((workout: Workout) =>
      workout.id && workout.id.startsWith('prebuilt-')
    );

    // DISABLED: Pre-built workout generation for now
    // if (!hasPreBuilt) {
    //   const preBuiltWorkouts = generatePreBuiltWorkouts();
    //   const combinedWorkouts = [...savedWorkouts, ...preBuiltWorkouts];
    //   localStorage.setItem("workouts", JSON.stringify(combinedWorkouts));
    //   setWorkouts(combinedWorkouts);
    // } else {
      setWorkouts(savedWorkouts);
    // }
  }, []);

  // Auto-open creation dialog if draft exists (temporarily disabled)
  // useEffect(() => {
  //   if (draft.exercises.length > 0 && !isCreating) {
  //     setIsCreating(true)
  //   }
  // }, [draft.exercises.length, isCreating])

  const saveWorkouts = (updatedWorkouts: Workout[]) => {
    setWorkouts(updatedWorkouts)
    localStorage.setItem("workouts", JSON.stringify(updatedWorkouts))
  }

  const createWorkout = () => {
    if (!draft?.name || !draft?.exercises?.length) return

    const workout: Workout = {
      id: Date.now().toString(),
      name: draft.name,
      type: draft.workout_type || "A",
      exercises: draft.exercises,
      createdAt: new Date().toISOString(),
    }

    const updatedWorkouts = [...workouts, workout]
    saveWorkouts(updatedWorkouts)
    
    // Clear the draft from localStorage after creating the workout
    updateDraft({ name: "", workout_type: "A", exercises: [] })
    setIsCreating(false)
  }

  const addExerciseToWorkout = (exerciseName: string) => {
    // Check for duplicates
    if (draft?.exercises?.some((ex) => ex.name === exerciseName)) {
      return // Silently ignore duplicates from this UI
    }
    
    // CORE WORKFLOW: Simple exercise addition with default values
    const exercise: WorkoutExercise = {
      id: Date.now().toString(),
      name: exerciseName,
      sets: [
        { id: "1", reps: 10, weight: 0, completed: false },
        { id: "2", reps: 10, weight: 0, completed: false },
        { id: "3", reps: 10, weight: 0, completed: false },
      ],
      restTime: 60,
      notes: "",
    }

    if (!draft) return
    
    updateDraft({
      exercises: [...(draft?.exercises || []), exercise]
    })
    
    toast.success(`Added: ${exerciseName} - 3 sets of 10 reps`)
  }

  const startWorkout = (workout: Workout) => {
    setActiveWorkout({
      workout: { ...workout },
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      startTime: new Date(),
      isResting: false,
    })
  }

  const completeSet = () => {
    if (!activeWorkout) return

    // Deep copy with proper immutable updates
    const updatedWorkout = {
      ...activeWorkout,
      isResting: true,
      restStartTime: new Date(),
      workout: {
        ...activeWorkout.workout,
        exercises: activeWorkout.workout.exercises.map((exercise, exerciseIndex) => {
          if (exerciseIndex === activeWorkout.currentExerciseIndex) {
            return {
              ...exercise,
              sets: exercise.sets.map((set, setIndex) => {
                if (setIndex === activeWorkout.currentSetIndex) {
                  return { ...set, completed: true }
                }
                return set
              })
            }
          }
          return exercise
        })
      }
    }

    // Move to next set or exercise
    const currentExercise = activeWorkout.workout.exercises[activeWorkout.currentExerciseIndex]
    if (activeWorkout.currentSetIndex < currentExercise.sets.length - 1) {
      updatedWorkout.currentSetIndex++
    } else if (activeWorkout.currentExerciseIndex < activeWorkout.workout.exercises.length - 1) {
      updatedWorkout.currentExerciseIndex++
      updatedWorkout.currentSetIndex = 0
    }

    setActiveWorkout(updatedWorkout)
  }

  const finishWorkout = async () => {
    if (!activeWorkout || isFinishing) return

    setIsFinishing(true)
    
    try {
      const result = await saveWorkoutSession(activeWorkout)
      
      if (result.success) {
        toast.success(
          result.error 
            ? `Workout saved locally (${result.error})` 
            : "Workout completed and saved!"
        )
        setActiveWorkout(null)
      } else {
        toast.error(`Failed to save workout: ${result.error}`)
      }
    } catch (error) {
      console.error('Unexpected error finishing workout:', error)
      toast.error("Unexpected error saving workout")
    } finally {
      setIsFinishing(false)
    }
  }

  if (activeWorkout) {
    return (
      <ActiveWorkoutView
        activeWorkout={activeWorkout}
        onCompleteSet={completeSet}
        onFinishWorkout={finishWorkout}
        isFinishing={isFinishing}
        onBackToWorkouts={() => setActiveWorkout(null)}
        onUpdateSet={(exerciseIndex, setIndex, field, value) => {
          // Proper immutable update with deep copying
          const updatedWorkout = {
            ...activeWorkout,
            workout: {
              ...activeWorkout.workout,
              exercises: activeWorkout.workout.exercises.map((exercise, exIndex) => {
                if (exIndex === exerciseIndex) {
                  return {
                    ...exercise,
                    sets: exercise.sets.map((set, sIndex) => {
                      if (sIndex === setIndex) {
                        return { ...set, [field]: value }
                      }
                      return set
                    })
                  }
                }
                return exercise
              })
            }
          }
          setActiveWorkout(updatedWorkout)
        }}
        onResetSet={() => {
          // Reset current set to default values
          const updatedWorkout = {
            ...activeWorkout,
            workout: {
              ...activeWorkout.workout,
              exercises: activeWorkout.workout.exercises.map((exercise, exIndex) => {
                if (exIndex === activeWorkout.currentExerciseIndex) {
                  return {
                    ...exercise,
                    sets: exercise.sets.map((set, sIndex) => {
                      if (sIndex === activeWorkout.currentSetIndex) {
                        return { ...set, reps: 10, weight: 0, completed: false }
                      }
                      return set
                    })
                  }
                }
                return exercise
              })
            }
          }
          setActiveWorkout(updatedWorkout)
        }}
      />
    )
  }

  return (
    <div className="space-y-6" data-testid="workout-creator">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
        <p className="text-muted-foreground">Create and manage your workout routines</p>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Workouts</h2>
        <Button 
          onClick={() => setIsCreating(true)}
          data-testid="create-workout-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Workout
        </Button>
      </div>

      {/* Workout List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workouts.map((workout) => (
          <Card key={workout.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{workout.name}</CardTitle>
                <Badge variant={workout.type === "A" ? "default" : "secondary"}>{workout.type}</Badge>
              </div>
              <CardDescription>{workout.exercises.length} exercises</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {workout.exercises.slice(0, 3).map((exercise) => (
                  <div key={exercise.id} className="flex items-center justify-between text-sm">
                    <span>{exercise.name}</span>
                    <span className="text-muted-foreground">{exercise.sets.length} sets</span>
                  </div>
                ))}
                {workout.exercises.length > 3 && (
                  <p className="text-sm text-muted-foreground">+{workout.exercises.length - 3} more exercises</p>
                )}
              </div>
              <Button className="w-full" data-testid="start-workout-btn" onClick={() => startWorkout(workout)}>
                <Play className="h-4 w-4 mr-2" />
                Start Workout
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Workout Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Workout</DialogTitle>
            <DialogDescription>Build your custom workout routine</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Workout Name</Label>
                <Input
                  data-testid="workout-name-input"
                  value={draft?.name || ""}
                  onChange={(e) => updateDraft({ name: e.target.value })}
                  placeholder="e.g., Upper Body A"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={draft?.workout_type || "A"}
                  onValueChange={(value) => updateDraft({ workout_type: value as "A" | "B" | "C" | "D" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Workout A</SelectItem>
                    <SelectItem value="B">Workout B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Add Exercises (38 Available)</Label>
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {availableExercises.map((exercise) => (
                  <Button
                    key={exercise.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addExerciseToWorkout(exercise.name)}
                    className="text-xs"
                    data-testid={`quick-add-${exercise.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {exercise.name}
                  </Button>
                ))}
              </div>
            </div>

            {draft?.exercises && draft.exercises.length > 0 && (
              <div className="space-y-3">
                <Label>Selected Exercises</Label>
                <div className="space-y-2">
                  {draft?.exercises?.map((exercise, index) => (
                    <div key={exercise.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{exercise.name}</span>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{exercise.sets.length} sets</span>
                          <span>{exercise.sets[0]?.reps || 0} reps</span>
                          <span>{exercise.sets[0]?.weight || 0}lbs</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = draft?.exercises?.filter((_, i) => i !== index) || []
                          updateDraft({ exercises: updated })
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={createWorkout} disabled={!draft?.name || !draft?.exercises?.length || isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {isSaving ? 'Saving...' : 'Create Workout'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ActiveWorkoutView({
  activeWorkout,
  onCompleteSet,
  onFinishWorkout,
  isFinishing,
  onBackToWorkouts,
  onUpdateSet,
  onResetSet,
}: {
  activeWorkout: ActiveWorkout
  onCompleteSet: () => void
  onFinishWorkout: () => void
  isFinishing: boolean
  onBackToWorkouts: () => void
  onUpdateSet: <K extends keyof ExerciseSet>(exerciseIndex: number, setIndex: number, field: K, value: ExerciseSet[K]) => void
  onResetSet: () => void
}) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [restTime, setRestTime] = useState(0)
  const [currentRPE, setCurrentRPE] = useState<number | null>(null)
  const [rpeCoaching, setRpeCoaching] = useState<string>("")

  // Destructure the values we need from the object
  const { startTime, isResting, restStartTime } = activeWorkout;

  useEffect(() => {
    const interval = setInterval(() => {
      // The logic inside here can still access the full `activeWorkout` object
      // because it's available in the component's scope.
      setElapsedTime(Math.floor((new Date().getTime() - activeWorkout.startTime.getTime()) / 1000))

      if (activeWorkout.isResting && activeWorkout.restStartTime) {
        const restElapsed = Math.floor((new Date().getTime() - activeWorkout.restStartTime.getTime()) / 1000)
        setRestTime(restElapsed)
      }
    }, 1000)

    return () => clearInterval(interval)
    
    // The dependency array now only contains the values that should trigger a reset of the interval.
  }, [startTime, isResting, restStartTime])

  const currentExercise = activeWorkout.workout.exercises[activeWorkout.currentExerciseIndex]
  const currentSet = currentExercise?.sets[activeWorkout.currentSetIndex]
  const isLastExercise = activeWorkout.currentExerciseIndex === activeWorkout.workout.exercises.length - 1
  const isLastSet = activeWorkout.currentSetIndex === currentExercise?.sets.length - 1

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }
  
  // RPE Coaching Logic
  const generateRPECoaching = (rpe: number) => {
    if (rpe <= 5) {
      return "This feels too easy! Consider increasing weight or reps for better stimulus."
    } else if (rpe === 6) {
      return "Good warm-up intensity. You should have 4+ reps left in the tank."
    } else if (rpe === 7) {
      return "Perfect training zone! You should have 2-3 reps left in reserve."
    } else if (rpe === 8) {
      return "Excellent intensity! You should have 1-2 reps left - great training stimulus."
    } else if (rpe === 9) {
      return "High intensity! Only 1 rep left in the tank - push through safely."
    } else if (rpe >= 10) {
      return "Maximum effort! No reps left - consider reducing weight next set if consistency is dropping."
    }
    return ""
  }
  
  // Handle RPE input with real-time coaching
  const handleRPEChange = (rpe: number) => {
    setCurrentRPE(rpe)
    setRpeCoaching(generateRPECoaching(rpe))
  }
  
  // Intelligent Rest Timer based on RPE
  const getOptimalRestTime = (rpe: number | null) => {
    if (!rpe) return 90 // Default
    
    if (rpe <= 6) return 60  // Light intensity - shorter rest
    if (rpe === 7) return 90  // Moderate intensity - standard rest
    if (rpe === 8) return 120 // High intensity - longer rest
    if (rpe === 9) return 150 // Very high intensity - extended rest
    return 180 // Maximum effort - maximum rest
  }
  
  const optimalRestTime = getOptimalRestTime(currentRPE)
  const restProgress = optimalRestTime > 0 ? Math.min((restTime / optimalRestTime) * 100, 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBackToWorkouts}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workouts
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{activeWorkout.workout.name}</h1>
            <p className="text-muted-foreground">
              Exercise {activeWorkout.currentExerciseIndex + 1} of {activeWorkout.workout.exercises.length}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{formatTime(elapsedTime)}</div>
          <p className="text-sm text-muted-foreground">Total Time</p>
        </div>
      </div>

      {activeWorkout.isResting && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Intelligent Rest Timer</span>
                {currentRPE && (
                  <Badge variant="outline" className="text-orange-700 border-orange-300">
                    RPE {currentRPE} → {Math.floor(optimalRestTime / 60)}:{(optimalRestTime % 60).toString().padStart(2, '0')}
                  </Badge>
                )}
              </div>
              <div className="text-xl font-bold text-orange-600">{formatTime(restTime)}</div>
            </div>
            
            {/* Rest Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Rest Progress</span>
                <span>{Math.round(restProgress)}%</span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(restProgress, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-orange-700">
                <span>Start</span>
                <span>Optimal: {formatTime(optimalRestTime)}</span>
              </div>
            </div>
            
            {/* Rest Coaching */}
            {restTime >= optimalRestTime && (
              <div className="bg-orange-100 p-3 rounded border border-orange-300">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-900">Ready to Continue!</span>
                </div>
                <p className="text-sm text-orange-800">
                  Optimal rest achieved based on your RPE {currentRPE}. Your muscles are recovered for the next set.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{currentExercise?.name}</span>
            <Badge>Set {activeWorkout.currentSetIndex + 1}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Label className="text-sm">Reps</Label>
              <Input
                type="number"
                value={currentSet?.reps || 0}
                onChange={(e) =>
                  onUpdateSet(
                    activeWorkout.currentExerciseIndex,
                    activeWorkout.currentSetIndex,
                    "reps",
                    Number.parseInt(e.target.value) || 0,
                  )
                }
                className="text-center text-lg font-bold"
                data-testid="actual-reps-input"
              />
            </div>
            <div className="text-center">
              <Label className="text-sm">Weight (lbs)</Label>
              <Input
                type="number"
                value={currentSet?.weight || 0}
                onChange={(e) =>
                  onUpdateSet(
                    activeWorkout.currentExerciseIndex,
                    activeWorkout.currentSetIndex,
                    "weight",
                    Number.parseFloat(e.target.value) || 0,
                  )
                }
                className="text-center text-lg font-bold"
              />
            </div>
            <div className="text-center">
              <Label className="text-sm">Rest (sec)</Label>
              <div className="text-lg font-bold p-2 border rounded text-center">{currentExercise?.restTime || 60}</div>
            </div>
          </div>

          {/* RPE Coaching Section */}
          <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <Label className="font-medium text-blue-900">Rate of Perceived Exertion (RPE)</Label>
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {[6, 7, 8, 9, 10].map((rpe) => (
                <Button
                  key={rpe}
                  variant={currentRPE === rpe ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRPEChange(rpe)}
                  className={currentRPE === rpe ? "bg-blue-600 text-white" : ""}
                >
                  {rpe}
                </Button>
              ))}
            </div>
            
            <div className="text-xs text-blue-700 grid grid-cols-5 gap-2 text-center">
              <span>Easy</span>
              <span>Moderate</span>
              <span>Hard</span>
              <span>Very Hard</span>
              <span>Maximum</span>
            </div>
            
            {rpeCoaching && (
              <div className="bg-blue-100 p-3 rounded border border-blue-300">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">AI Coach Says:</span>
                </div>
                <p className="text-sm text-blue-800">{rpeCoaching}</p>
              </div>
            )}
          </div>

          <Button 
            className="w-full" 
            size="lg" 
            onClick={onCompleteSet} 
            disabled={currentSet?.completed}
            data-testid="complete-set-btn"
          >
            {currentSet?.completed ? "Set Completed" : "Complete Set"}
          </Button>
        </CardContent>
      </Card>

      {/* All Sets Overview */}
      <Card>
        <CardHeader>
          <CardTitle>All Sets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeWorkout.workout.exercises.map((exercise, exerciseIndex) => (
              <div key={exercise.id} className="space-y-2">
                <h4 className="font-medium">{exercise.name}</h4>
                <div className="grid grid-cols-1 gap-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div
                      key={set.id}
                      className={`flex items-center justify-between p-2 rounded border ${
                        exerciseIndex === activeWorkout.currentExerciseIndex &&
                        setIndex === activeWorkout.currentSetIndex
                          ? "border-primary bg-primary/10"
                          : set.completed
                            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                            : "border-border"
                      }`}
                    >
                      <span className="text-sm">Set {setIndex + 1}</span>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>{set.reps} reps</span>
                        <span>{set.weight} lbs</span>
                        {set.completed && (
                          <Badge variant="secondary" className="text-xs">
                            ✓
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Button variant="outline" className="flex-1" onClick={onResetSet}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Set
        </Button>
        <Button
          className="flex-1"
          onClick={onFinishWorkout}
          variant={isLastExercise && isLastSet ? "default" : "outline"}
          disabled={isFinishing}
        >
          {isFinishing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            isLastExercise && isLastSet ? "Finish Workout" : "End Early"
          )}
        </Button>
      </div>
    </div>
  )
}
