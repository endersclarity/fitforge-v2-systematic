'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Minus, ArrowLeft, ArrowRight } from "lucide-react"
import { WorkoutPlan, PlannedSet } from '@/schemas/typescript-interfaces'

interface WorkoutExercise {
  id: string
  name: string
  category: string
  equipment: string
  difficulty: string
}

interface EnhancedSetLog {
  id: string
  exerciseId: string
  weight: number
  reps: number
  completed: boolean
  timestamp: string
  rpe?: number
  isWarmup?: boolean
  notes?: string
}

interface ExerciseQueueProps {
  currentExercise: WorkoutExercise
  exerciseSets: EnhancedSetLog[]
  workoutPlan: WorkoutPlan | null
  currentWeight: string
  currentReps: string
  currentExerciseIndex: number
  workoutQueue: WorkoutExercise[]
  getExercisePlannedSets: (exerciseId: string) => PlannedSet[]
  logAllSets: () => void
  removeSet: (setId: string) => void
  getRPEColor: (rpe: number) => string
  previousExercise: () => void
  nextExercise: () => void
}

export function ExerciseQueue({
  currentExercise,
  exerciseSets,
  workoutPlan,
  currentWeight,
  currentReps,
  currentExerciseIndex,
  workoutQueue,
  getExercisePlannedSets,
  logAllSets,
  removeSet,
  getRPEColor,
  previousExercise,
  nextExercise
}: ExerciseQueueProps) {
  return (
    <>
      {/* Planned Sets Preview with Log All Sets */}
      {workoutPlan && getExercisePlannedSets(currentExercise.id).length > 0 && (
        <Card className="bg-[#1C1C1E] border-[#2C2C2E] mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-white">Planned Workout</CardTitle>
                <CardDescription className="text-[#A1A1A3]">
                  Your planned sets for this exercise
                </CardDescription>
              </div>
              {/* Log All Sets Button */}
              {exerciseSets.length < getExercisePlannedSets(currentExercise.id).length && 
               currentWeight && currentReps && (
                <Button
                  onClick={logAllSets}
                  className="bg-[#FF375F] hover:bg-[#E63050] text-white text-sm"
                >
                  Log All Sets
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getExercisePlannedSets(currentExercise.id).map((plannedSet, index) => {
                const isCompleted = exerciseSets.length > index
                const actualSet = exerciseSets[index]
                
                return (
                  <div key={plannedSet.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                    isCompleted 
                      ? 'bg-[#1E3A1E] border-green-800/30' 
                      : 'bg-[#2C2C2E] border-[#3C3C3E]'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-white">Set {plannedSet.setNumber}</span>
                      <div className="text-sm text-[#A1A1A3]">
                        {currentExercise.equipment !== 'Bodyweight' && (
                          <span>{plannedSet.targetWeight} lb × </span>
                        )}
                        <span>{plannedSet.targetReps} reps</span>
                      </div>
                    </div>
                    
                    {isCompleted && actualSet && (
                      <div className="text-sm flex items-center space-x-2">
                        <span className="text-green-400">
                          {currentExercise.equipment !== 'Bodyweight' && (
                            <span>{actualSet.weight} lb × </span>
                          )}
                          <span>{actualSet.reps} reps</span>
                        </span>
                        {actualSet.rpe && (
                          <span className={`text-xs ${getRPEColor(actualSet.rpe)}`}>
                            RPE {actualSet.rpe}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sets List */}
      {exerciseSets.length > 0 && (
        <Card className="bg-[#1C1C1E] border-[#2C2C2E] mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              Sets Completed ({exerciseSets.length})
            </CardTitle>
          </CardHeader>
          <CardContent data-testid="set-list">
            <div className="space-y-2">
              {exerciseSets.map((set, index) => (
                <div key={set.id} className="flex items-center justify-between p-3 bg-[#2C2C2E] rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-[#FF375F]" />
                    <div>
                      <div className="text-white flex items-center space-x-2">
                        <span>
                          Set {index + 1}: {currentExercise.equipment !== 'Bodyweight' ? `${set.weight} lbs × ` : ''}{set.reps} reps
                        </span>
                        {set.isWarmup && (
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            data-testid="warmup-badge"
                          >
                            Warm-up
                          </Badge>
                        )}
                        {set.rpe && (
                          <span className={`text-xs ${getRPEColor(set.rpe)}`}>
                            RPE {set.rpe}
                          </span>
                        )}
                      </div>
                      {set.notes && (
                        <p className="text-sm text-[#A1A1A3] mt-1">{set.notes}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSet(set.id)}
                    className="text-[#A1A1A3] hover:text-[#FF375F]"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={previousExercise}
          disabled={currentExerciseIndex === 0}
          className="flex-1 bg-[#2C2C2E] border-[#3C3C3E] text-[#A1A1A3] hover:bg-[#3C3C3E] hover:text-white disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous Exercise
        </Button>
        <Button
          variant="outline"
          onClick={nextExercise}
          disabled={currentExerciseIndex >= workoutQueue.length - 1}
          className="flex-1 bg-[#2C2C2E] border-[#3C3C3E] text-[#A1A1A3] hover:bg-[#3C3C3E] hover:text-white disabled:opacity-50"
        >
          Next Exercise
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </>
  )
}