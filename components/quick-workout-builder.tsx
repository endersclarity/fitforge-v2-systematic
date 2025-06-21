"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Play, Trash2, GripVertical, Plus, Minus } from "lucide-react"
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft"
import { toast } from "sonner"

interface QuickWorkoutBuilderProps {
  onStartWorkout: (workout: any) => void
}

export function QuickWorkoutBuilder({ onStartWorkout }: QuickWorkoutBuilderProps) {
  const [draft, setDraft] = useWorkoutDraft()

  // FIX: Safely access properties with optional chaining and nullish coalescing
  const exercises = draft?.exercises ?? []
  const totalExercises = exercises.length
  const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0)
  const estimatedTime = totalSets * 2 + (totalExercises > 1 ? totalExercises - 1 : 0)

  const updateExerciseSets = (exerciseId: string, sets: any[]) => {
    setDraft(d => ({
      ...(d ?? { name: "", type: "A" }),
      exercises: (d?.exercises ?? []).map(ex => 
        ex.id === exerciseId ? { ...ex, sets } : ex
      )
    }))
  }

  const removeExercise = (exerciseId: string) => {
    setDraft(d => ({
      ...(d ?? { name: "", type: "A" }),
      exercises: (d?.exercises ?? []).filter(ex => ex.id !== exerciseId)
    }))
    toast.success("Exercise removed from workout")
  }

  const addSet = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId)
    if (!exercise) return

    const newSet = {
      id: `${Date.now()}`,
      reps: 10,
      weight: 0,
      completed: false
    }

    updateExerciseSets(exerciseId, [...exercise.sets, newSet])
  }

  const removeSet = (exerciseId: string, setId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId)
    if (!exercise || exercise.sets.length <= 1) return

    updateExerciseSets(exerciseId, exercise.sets.filter(set => set.id !== setId))
  }

  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) => {
    const exercise = exercises.find(ex => ex.id === exerciseId)
    if (!exercise) return

    updateExerciseSets(exerciseId, exercise.sets.map(set => 
      set.id === setId ? { ...set, [field]: value } : set
    ))
  }

  const handleStartWorkout = () => {
    if (exercises.length === 0) {
      toast.error("Add some exercises to start a workout")
      return
    }

    const quickWorkout = {
      id: `quick-${Date.now()}`,
      name: `Quick Workout - ${new Date().toLocaleDateString()}`,
      type: "A" as const,
      exercises: exercises,
      createdAt: new Date().toISOString()
    }

    onStartWorkout(quickWorkout)
    
    // Clear the draft
    setDraft({
      name: "",
      type: "A",
      exercises: []
    })
  }

  const clearDraft = () => {
    setDraft({
      name: "",
      type: "A", 
      exercises: []
    })
    toast.success("Workout draft cleared")
  }

  if (totalExercises === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GripVertical className="h-5 w-5" />
            Quick Workout Builder
          </CardTitle>
          <CardDescription>
            Add exercises from the library to build your workout in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No exercises added yet</p>
              <p className="text-sm text-muted-foreground">
                Click exercises to add them to your workout
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GripVertical className="h-5 w-5" />
              Quick Workout
            </CardTitle>
            <CardDescription>
              {totalExercises} exercises • {totalSets} sets • ~{estimatedTime} min
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={clearDraft}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Exercise List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {exercises.map((exercise, index) => (
            <div key={exercise.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{exercise.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {exercise.sets.length} sets
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeExercise(exercise.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Sets */}
              <div className="space-y-1">
                {exercise.sets.map((set, setIndex) => (
                  <div key={set.id} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-muted-foreground">
                      {setIndex + 1}.
                    </span>
                    <Input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                      className="h-7 w-16 text-xs"
                      placeholder="Reps"
                    />
                    <span className="text-muted-foreground">×</span>
                    <Input
                      type="number"
                      value={set.weight}
                      onChange={(e) => updateSet(exercise.id, set.id, 'weight', parseInt(e.target.value) || 0)}
                      className="h-7 w-16 text-xs"
                      placeholder="Weight"
                    />
                    <span className="text-muted-foreground text-xs">lbs</span>
                    {exercise.sets.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSet(exercise.id, set.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addSet(exercise.id)}
                  className="h-6 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Set
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Workout Summary */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">{totalExercises}</div>
            <div className="text-xs text-muted-foreground">Exercises</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">{totalSets}</div>
            <div className="text-xs text-muted-foreground">Total Sets</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">{estimatedTime}</div>
            <div className="text-xs text-muted-foreground">Est. Min</div>
          </div>
        </div>

        {/* Start Workout Button */}
        <Button 
          onClick={handleStartWorkout}
          className="w-full"
          size="lg"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Workout
        </Button>
      </CardContent>
    </Card>
  )
}