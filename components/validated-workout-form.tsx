'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { WorkoutCreateSchema, WorkoutExerciseCreateSchema, ExerciseSetCreateSchema } from '@/schemas/workout'
import { useValidatedForm, useFieldProps } from '@/hooks/useValidatedForm'
import { toast } from 'sonner'
import exercisesData from '@/data/exercises.json'

// Available exercises from our database
const availableExercises = exercisesData.map(item => ({
  id: item.id.toString(),
  name: item.name,
  category: item.category,
  primaryMuscles: item.primaryMuscles || [],
  secondaryMuscles: item.secondaryMuscles || []
}))

export function ValidatedWorkoutForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with Zod validation
  const form = useValidatedForm({
    schema: WorkoutCreateSchema,
    defaultValues: {
      name: '',
      type: 'A',
      status: 'draft',
      exercises: [],
      notes: ''
    },
    onSubmit: handleSubmit,
    mode: 'onBlur' // Validate fields on blur for better UX
  })

  // Field props helpers
  const nameProps = useFieldProps(form, 'name')
  const typeProps = useFieldProps(form, 'type')
  const notesProps = useFieldProps(form, 'notes')

  async function handleSubmit(data: any) {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save workout')
      }

      const result = await response.json()
      toast.success('Workout saved successfully!')
      
      // Reset form after successful submission
      form.reset()
      
    } catch (error) {
      console.error('Error saving workout:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save workout')
    } finally {
      setIsSubmitting(false)
    }
  }

  function addExercise() {
    const exercises = form.values.exercises || []
    const newExercise = {
      id: `exercise-${Date.now()}`,
      exerciseId: '',
      name: '',
      orderInWorkout: exercises.length + 1,
      sets: [{
        id: `set-${Date.now()}`,
        orderInExercise: 1,
        reps: 10,
        weight: 0,
        completed: false
      }],
      restTimeSeconds: 60,
      notes: ''
    }
    
    form.setValue('exercises', [...exercises, newExercise])
  }

  function removeExercise(index: number) {
    const exercises = form.values.exercises || []
    const updated = exercises.filter((_, i) => i !== index)
    
    // Reorder remaining exercises
    const reordered = updated.map((ex, i) => ({ ...ex, orderInWorkout: i + 1 }))
    form.setValue('exercises', reordered)
  }

  function updateExercise(index: number, field: string, value: any) {
    const exercises = [...(form.values.exercises || [])]
    
    if (field === 'exerciseId') {
      // Find the exercise details
      const exercise = availableExercises.find(ex => ex.id === value)
      if (exercise) {
        exercises[index] = {
          ...exercises[index],
          exerciseId: value,
          name: exercise.name
        }
      }
    } else {
      exercises[index] = { ...exercises[index], [field]: value }
    }
    
    form.setValue('exercises', exercises)
  }

  function addSet(exerciseIndex: number) {
    const exercises = [...(form.values.exercises || [])]
    const exercise = exercises[exerciseIndex]
    const newSet = {
      id: `set-${Date.now()}`,
      orderInExercise: exercise.sets.length + 1,
      reps: 10,
      weight: 0,
      completed: false
    }
    
    exercises[exerciseIndex] = {
      ...exercise,
      sets: [...exercise.sets, newSet]
    }
    
    form.setValue('exercises', exercises)
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    const exercises = [...(form.values.exercises || [])]
    const exercise = exercises[exerciseIndex]
    
    const updatedSets = exercise.sets.filter((_, i) => i !== setIndex)
    // Reorder remaining sets
    const reorderedSets = updatedSets.map((set, i) => ({ ...set, orderInExercise: i + 1 }))
    
    exercises[exerciseIndex] = {
      ...exercise,
      sets: reorderedSets
    }
    
    form.setValue('exercises', exercises)
  }

  function updateSet(exerciseIndex: number, setIndex: number, field: string, value: any) {
    const exercises = [...(form.values.exercises || [])]
    const exercise = exercises[exerciseIndex]
    const sets = [...exercise.sets]
    
    sets[setIndex] = { ...sets[setIndex], [field]: value }
    exercises[exerciseIndex] = { ...exercise, sets }
    
    form.setValue('exercises', exercises)
  }

  // Get exercise-specific errors
  function getExerciseErrors(index: number) {
    return form.errors.filter(err => err.field.startsWith(`exercises.${index}`))
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Create Validated Workout
          </CardTitle>
          <CardDescription>
            Build your workout with automatic validation and error checking
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Form Validation Status */}
          {form.errors.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the following errors:
                <ul className="mt-2 space-y-1">
                  {form.errors.map((error, i) => (
                    <li key={i} className="text-sm">
                      <strong>{error.field}:</strong> {error.message}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workout Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Push Day A"
                  value={nameProps.value}
                  onChange={(e) => nameProps.onChange(e.target.value)}
                  onBlur={nameProps.onBlur}
                  className={nameProps.error ? 'border-red-500' : ''}
                />
                {nameProps.error && (
                  <p className="text-sm text-red-500">{nameProps.errorMessage}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Workout Type *</Label>
                <Select value={typeProps.value} onValueChange={typeProps.onChange}>
                  <SelectTrigger className={typeProps.error ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Workout A</SelectItem>
                    <SelectItem value="B">Workout B</SelectItem>
                  </SelectContent>
                </Select>
                {typeProps.error && (
                  <p className="text-sm text-red-500">{typeProps.errorMessage}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this workout..."
                value={notesProps.value}
                onChange={(e) => notesProps.onChange(e.target.value)}
                rows={3}
              />
            </div>

            <Separator />

            {/* Exercises Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Exercises</h3>
                <Button type="button" onClick={addExercise} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exercise
                </Button>
              </div>

              {(form.values.exercises || []).map((exercise, exerciseIndex) => {
                const exerciseErrors = getExerciseErrors(exerciseIndex)
                
                return (
                  <Card key={exercise.id} className={exerciseErrors.length > 0 ? 'border-red-200' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Exercise {exerciseIndex + 1}
                        </CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExercise(exerciseIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {exerciseErrors.length > 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {exerciseErrors.map(err => err.message).join(', ')}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Exercise Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Exercise *</Label>
                          <Select
                            value={exercise.exerciseId}
                            onValueChange={(value) => updateExercise(exerciseIndex, 'exerciseId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select exercise" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableExercises.map((ex) => (
                                <SelectItem key={ex.id} value={ex.id}>
                                  {ex.name} ({ex.category})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Rest Time (seconds)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="600"
                            value={exercise.restTimeSeconds}
                            onChange={(e) => updateExercise(exerciseIndex, 'restTimeSeconds', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      {/* Sets */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Sets</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSet(exerciseIndex)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Set
                          </Button>
                        </div>

                        {exercise.sets.map((set, setIndex) => (
                          <div key={set.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Badge variant="outline">Set {setIndex + 1}</Badge>
                            
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                type="number"
                                placeholder="Reps"
                                min="1"
                                max="500"
                                value={set.reps}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                                className="w-20"
                              />
                              <span className="text-sm text-gray-500">reps</span>
                              
                              <Input
                                type="number"
                                placeholder="Weight"
                                min="0"
                                max="2000"
                                step="0.5"
                                value={set.weight}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                                className="w-24"
                              />
                              <span className="text-sm text-gray-500">kg</span>
                            </div>

                            {exercise.sets.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSet(exerciseIndex, setIndex)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Exercise Notes */}
                      <div className="space-y-2">
                        <Label>Exercise Notes</Label>
                        <Textarea
                          placeholder="Form cues, modifications, etc..."
                          value={exercise.notes}
                          onChange={(e) => updateExercise(exerciseIndex, 'notes', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {(form.values.exercises || []).length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Plus className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500">No exercises added yet</p>
                    <p className="text-sm text-gray-400">Click "Add Exercise" to get started</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Submit Actions */}
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {form.isValid ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Workout is valid
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Please fix validation errors
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={form.reset}>
                  Reset
                </Button>
                <Button 
                  type="submit" 
                  disabled={!form.isValid || isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Workout
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}