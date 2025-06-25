'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, Clock, Dumbbell, X, Eye, User } from 'lucide-react'
import { WorkoutExercise, PlannedSet, WorkoutPlan } from '@/schemas/typescript-interfaces'
// import { MuscleAnatomy } from '@/components/visualization/MuscleAnatomy'
import { useRealTimeMuscleVolume } from '@/hooks/useRealTimeMuscleVolume'

interface WorkoutBuilderProps {
  exercises: WorkoutExercise[]
  onStartWorkout: () => void
  onClose: () => void
}

interface ExerciseWithSets extends WorkoutExercise {
  plannedSets: PlannedSet[]
}

export function WorkoutBuilder({ exercises, onStartWorkout, onClose }: WorkoutBuilderProps) {
  const [exercisesWithSets, setExercisesWithSets] = useState<ExerciseWithSets[]>([])
  const [totalEstimatedTime, setTotalEstimatedTime] = useState(0)
  const [anatomyView, setAnatomyView] = useState<'front' | 'back'>('front')
  const [showMuscleLabels, setShowMuscleLabels] = useState(false)
  
  // Real-time muscle volume calculation
  const { normalizedVolumes, summary, estimatedDuration } = useRealTimeMuscleVolume(exercisesWithSets)

  // Initialize exercises with default planned sets
  useEffect(() => {
    const initialized = exercises.map(exercise => ({
      ...exercise,
      plannedSets: createDefaultSets(exercise)
    }))
    setExercisesWithSets(initialized)
  }, [exercises])

  // Update total estimated time from real-time calculation
  useEffect(() => {
    setTotalEstimatedTime(estimatedDuration)
  }, [estimatedDuration])

  function createDefaultSets(exercise: WorkoutExercise): PlannedSet[] {
    const defaultSets = exercise.equipment === 'Bodyweight' ? 3 : 3
    const defaultReps = exercise.equipment === 'Bodyweight' ? 12 : 10
    const defaultWeight = exercise.equipment === 'Bodyweight' ? 0 : getDefaultWeight(exercise.difficulty)

    return Array.from({ length: defaultSets }, (_, index) => ({
      id: `${exercise.id}-set-${index + 1}`,
      exerciseId: exercise.id,
      setNumber: index + 1,
      targetWeight: defaultWeight,
      targetReps: defaultReps,
      equipment: exercise.equipment,
      notes: ''
    }))
  }

  function getDefaultWeight(difficulty: string): number {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 25
      case 'intermediate': return 45
      case 'advanced': return 65
      default: return 35
    }
  }

  function updateSetValue(exerciseId: string, setId: string, field: 'targetWeight' | 'targetReps', value: number) {
    setExercisesWithSets(prev => prev.map(exercise => {
      if (exercise.id !== exerciseId) return exercise
      
      return {
        ...exercise,
        plannedSets: exercise.plannedSets.map(set =>
          set.id === setId ? { ...set, [field]: Math.max(0, value) } : set
        )
      }
    }))
  }

  function addSet(exerciseId: string) {
    setExercisesWithSets(prev => prev.map(exercise => {
      if (exercise.id !== exerciseId) return exercise
      
      const newSetNumber = exercise.plannedSets.length + 1
      const lastSet = exercise.plannedSets[exercise.plannedSets.length - 1]
      
      const newSet: PlannedSet = {
        id: `${exerciseId}-set-${newSetNumber}`,
        exerciseId,
        setNumber: newSetNumber,
        targetWeight: lastSet?.targetWeight || 0,
        targetReps: lastSet?.targetReps || 10,
        equipment: exercise.equipment,
        notes: ''
      }
      
      return {
        ...exercise,
        plannedSets: [...exercise.plannedSets, newSet]
      }
    }))
  }

  function removeSet(exerciseId: string, setId: string) {
    setExercisesWithSets(prev => prev.map(exercise => {
      if (exercise.id !== exerciseId) return exercise
      
      const filteredSets = exercise.plannedSets.filter(set => set.id !== setId)
      // Renumber sets
      const renumberedSets = filteredSets.map((set, index) => ({
        ...set,
        setNumber: index + 1,
        id: `${exerciseId}-set-${index + 1}`
      }))
      
      return {
        ...exercise,
        plannedSets: renumberedSets
      }
    }))
  }

  function handleStartWorkout() {
    // Save planned workout to localStorage
    const allPlannedSets = exercisesWithSets.flatMap(ex => ex.plannedSets)
    
    const workoutPlan: WorkoutPlan = {
      id: `workout-${Date.now()}`,
      exercises,
      plannedSets: allPlannedSets,
      totalEstimatedTime,
      createdAt: new Date().toISOString()
    }
    
    localStorage.setItem('workout-plan', JSON.stringify(workoutPlan))
    onStartWorkout()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-[#121212] border border-[#2C2C2E] rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2C2C2E]">
          <div>
            <h2 className="text-2xl font-bold text-white">Plan Your Workout</h2>
            <p className="text-[#A1A1A3]">Set your target weights and reps for each exercise</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-[#A1A1A3]">
              <Clock className="h-4 w-4" />
              <span className="text-sm">~{totalEstimatedTime} min</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-[#A1A1A3] hover:text-white"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex h-[calc(90vh-200px)]">
          {/* Left Column - Exercise Planning */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-[#2C2C2E]">
            <div className="space-y-6">
            {exercisesWithSets.map((exercise) => (
              <Card key={exercise.id} className="bg-[#1C1C1E] border-[#2C2C2E]">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">{exercise.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className="bg-[#2C2C2E] text-[#A1A1A3]">{exercise.equipment}</Badge>
                        <Badge className="bg-[#2C2C2E] text-[#A1A1A3]">{exercise.difficulty}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addSet(exercise.id)}
                      className="bg-[#2C2C2E] border-[#3C3C3E] text-white hover:bg-[#3C3C3E]"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Set
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {exercise.plannedSets.map((set) => (
                      <div key={set.id} className="flex items-center space-x-4 bg-[#2C2C2E] rounded-lg p-3">
                        <span className="text-[#A1A1A3] text-sm font-medium min-w-[60px]">
                          Set {set.setNumber}
                        </span>
                        
                        {/* Weight Input */}
                        {exercise.equipment !== 'Bodyweight' && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateSetValue(exercise.id, set.id, 'targetWeight', set.targetWeight - 5)}
                              className="h-8 w-8 text-[#A1A1A3] hover:text-white"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center space-x-1">
                              <Input
                                type="number"
                                value={set.targetWeight}
                                onChange={(e) => updateSetValue(exercise.id, set.id, 'targetWeight', parseInt(e.target.value) || 0)}
                                className="w-16 h-8 text-center bg-[#1C1C1E] border-[#3C3C3E] text-white"
                              />
                              <span className="text-[#A1A1A3] text-sm">lb</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateSetValue(exercise.id, set.id, 'targetWeight', set.targetWeight + 5)}
                              className="h-8 w-8 text-[#A1A1A3] hover:text-white"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        
                        {/* Reps Input */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateSetValue(exercise.id, set.id, 'targetReps', set.targetReps - 1)}
                            className="h-8 w-8 text-[#A1A1A3] hover:text-white"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center space-x-1">
                            <Input
                              type="number"
                              value={set.targetReps}
                              onChange={(e) => updateSetValue(exercise.id, set.id, 'targetReps', parseInt(e.target.value) || 0)}
                              className="w-16 h-8 text-center bg-[#1C1C1E] border-[#3C3C3E] text-white"
                            />
                            <span className="text-[#A1A1A3] text-sm">reps</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateSetValue(exercise.id, set.id, 'targetReps', set.targetReps + 1)}
                            className="h-8 w-8 text-[#A1A1A3] hover:text-white"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Remove Set Button */}
                        {exercise.plannedSets.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSet(exercise.id, set.id)}
                            className="h-8 w-8 text-[#FF375F] hover:text-[#E63050] ml-auto"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
          
          {/* Right Column - Muscle Visualization */}
          <div className="w-2/5 p-6 bg-[#1C1C1E] overflow-y-auto">
            <div className="space-y-4">
              {/* Muscle Visualization Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Muscle Loading</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAnatomyView(anatomyView === 'front' ? 'back' : 'front')}
                    className="bg-[#2C2C2E] border-[#3C3C3E] text-white hover:bg-[#3C3C3E]"
                  >
                    <User className="h-4 w-4 mr-1" />
                    {anatomyView === 'front' ? 'Back' : 'Front'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMuscleLabels(!showMuscleLabels)}
                    className="bg-[#2C2C2E] border-[#3C3C3E] text-white hover:bg-[#3C3C3E]"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Labels
                  </Button>
                </div>
              </div>

              {/* Muscle Visualization - Simplified */}
              <div className="bg-[#2C2C2E] rounded-lg p-4 min-h-[400px]">
                {exercisesWithSets.length > 0 && summary.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-center text-white mb-4">
                      <User className="h-16 w-16 mx-auto mb-2 opacity-75" />
                      <p className="text-sm">Muscle Loading Visualization</p>
                    </div>
                    
                    {/* Visual muscle bars */}
                    <div className="space-y-2">
                      {summary.map(({ muscle, volume, intensity }) => (
                        <div key={muscle} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-white">{muscle}</span>
                            <span className="text-[#A1A1A3]">{volume}</span>
                          </div>
                          <div className="w-full bg-[#374151] rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-300" 
                              style={{ 
                                width: `${Math.min(100, (volume / Math.max(...summary.map(s => s.volume))) * 100)}%`,
                                backgroundColor: intensity === 'very_high' ? '#EF4444' :
                                               intensity === 'high' ? '#F97316' :
                                               intensity === 'medium' ? '#F59E0B' :
                                               intensity === 'low' ? '#3B82F6' : '#374151'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-[#A1A1A3] h-full flex items-center justify-center flex-col">
                    <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Add exercises to see muscle engagement</p>
                  </div>
                )}
              </div>

              {/* Volume Summary */}
              {summary.length > 0 && (
                <Card className="bg-[#2C2C2E] border-[#3C3C3E]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white">Volume Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {summary.slice(0, 6).map(({ muscle, volume, intensity }) => (
                      <div key={muscle} className="flex items-center justify-between text-sm">
                        <span className="text-white">{muscle}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[#A1A1A3]">{volume}</span>
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ 
                              backgroundColor: intensity === 'very_high' ? '#EF4444' :
                                             intensity === 'high' ? '#F97316' :
                                             intensity === 'medium' ? '#F59E0B' :
                                             intensity === 'low' ? '#3B82F6' : '#374151'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Color Legend */}
              <Card className="bg-[#2C2C2E] border-[#3C3C3E]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white">Intensity Scale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    <div className="text-center">
                      <div className="w-full h-3 bg-[#374151] rounded mb-1"></div>
                      <span className="text-[#A1A1A3]">None</span>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-3 bg-[#3B82F6] rounded mb-1"></div>
                      <span className="text-[#A1A1A3]">Low</span>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-3 bg-[#F59E0B] rounded mb-1"></div>
                      <span className="text-[#A1A1A3]">Med</span>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-3 bg-[#F97316] rounded mb-1"></div>
                      <span className="text-[#A1A1A3]">High</span>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-3 bg-[#EF4444] rounded mb-1"></div>
                      <span className="text-[#A1A1A3]">Max</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#2C2C2E] bg-[#1C1C1E]">
          <div className="flex items-center justify-between">
            <div className="text-[#A1A1A3] text-sm">
              {exercisesWithSets.reduce((sum, ex) => sum + ex.plannedSets.length, 0)} total sets planned
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="bg-[#2C2C2E] border-[#3C3C3E] text-white hover:bg-[#3C3C3E]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartWorkout}
                className="bg-[#FF375F] hover:bg-[#E63050] text-white font-semibold"
              >
                <Dumbbell className="h-4 w-4 mr-2" />
                Start Planned Workout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}