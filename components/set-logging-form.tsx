'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { PlannedSet, WorkoutExercise } from '@/schemas/typescript-interfaces'

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

interface SetLoggingFormProps {
  currentExercise: WorkoutExercise
  currentWeight: string
  setCurrentWeight: (weight: string) => void
  currentReps: string
  setCurrentReps: (reps: string) => void
  isWarmupSet: boolean
  setIsWarmupSet: (isWarmup: boolean) => void
  setNotes: string
  setSetNotes: (notes: string) => void
  exerciseSets: EnhancedSetLog[]
  getCurrentPlannedSet: (exerciseId: string, setNumber: number) => PlannedSet | undefined
  onAddSet: () => void
}

export function SetLoggingForm({
  currentExercise,
  currentWeight,
  setCurrentWeight,
  currentReps,
  setCurrentReps,
  isWarmupSet,
  setIsWarmupSet,
  setNotes,
  setSetNotes,
  exerciseSets,
  getCurrentPlannedSet,
  onAddSet
}: SetLoggingFormProps) {
  const nextSetNumber = exerciseSets.length + 1
  const plannedSet = getCurrentPlannedSet(currentExercise.id, nextSetNumber)
  
  const isAddSetDisabled = !currentReps || (currentExercise.equipment !== 'Bodyweight' && !currentWeight)

  return (
    <Card className="bg-[#1C1C1E] border-[#2C2C2E] mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">
            {plannedSet ? `Set ${nextSetNumber} (Planned: ${
              currentExercise.equipment !== 'Bodyweight' ? `${plannedSet.targetWeight} lb × ` : ''
            }${plannedSet.targetReps} reps)` : `Add Set ${nextSetNumber}`}
          </CardTitle>
          {/* Warm-up Toggle */}
          <Button
            variant={isWarmupSet ? "default" : "outline"}
            size="sm"
            onClick={() => setIsWarmupSet(!isWarmupSet)}
            className={`text-xs ${
              isWarmupSet 
                ? "bg-[#FF375F] text-white" 
                : "bg-[#2C2C2E] border-[#3C3C3E] text-[#A1A1A3] hover:bg-[#3C3C3E] hover:text-white"
            }`}
            data-testid="warmup-toggle"
          >
            Warm-up Set
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weight and Reps Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[#A1A1A3] mb-2 block">
              Weight ({currentExercise.equipment === 'Bodyweight' ? 'lbs added' : 'lbs'})
            </label>
            <Input
              type="number"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              placeholder="135"
              className="bg-[#2C2C2E] border-[#3C3C3E] text-white"
              disabled={currentExercise.equipment === 'Bodyweight' && !isWarmupSet}
            />
          </div>
          <div>
            <label className="text-sm text-[#A1A1A3] mb-2 block">Reps</label>
            <Input
              type="number"
              value={currentReps}
              onChange={(e) => setCurrentReps(e.target.value)}
              placeholder="10"
              className="bg-[#2C2C2E] border-[#3C3C3E] text-white"
            />
          </div>
        </div>

        {/* Set Notes */}
        <div>
          <label className="text-sm text-[#A1A1A3] mb-2 block">Set Notes (Optional)</label>
          <Input
            type="text"
            value={setNotes}
            onChange={(e) => setSetNotes(e.target.value)}
            placeholder="Form notes, how it felt..."
            className="bg-[#2C2C2E] border-[#3C3C3E] text-white"
            data-testid="set-notes-input"
          />
        </div>
        
        {/* Quick Fill Planned Values Button */}
        {plannedSet && (
          <Button
            variant="outline"
            onClick={() => {
              setCurrentWeight(plannedSet.targetWeight.toString())
              setCurrentReps(plannedSet.targetReps.toString())
            }}
            className="w-full bg-[#2C2C2E] border-[#3C3C3E] text-[#A1A1A3] hover:bg-[#3C3C3E] hover:text-white"
          >
            Use Planned Values ({currentExercise.equipment !== 'Bodyweight' ? `${plannedSet.targetWeight} lb × ` : ''}{plannedSet.targetReps} reps)
          </Button>
        )}
        
        <Button
          onClick={onAddSet}
          disabled={isAddSetDisabled}
          className="w-full bg-[#FF375F] hover:bg-[#E63050] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Set
        </Button>
      </CardContent>
    </Card>
  )
}