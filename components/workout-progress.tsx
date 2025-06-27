'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { MoreHorizontal, Zap, NotebookPen } from "lucide-react"

interface WorkoutExercise {
  id: string
  name: string
  category: string
  equipment: string
  difficulty: string
}

interface MuscleVolumeData {
  summary: Array<{
    muscle: string
    intensity: 'very_high' | 'high' | 'medium' | 'low' | 'none'
  }>
}

interface WorkoutProgressProps {
  currentExerciseIndex: number
  workoutQueue: WorkoutExercise[]
  currentExercise: WorkoutExercise
  muscleVolumeData: MuscleVolumeData
  exerciseNotes: Record<string, string>
  showExerciseMenu: boolean
  setShowExerciseMenu: (show: boolean) => void
  setShowReplaceModal: (show: boolean) => void
  updateExerciseNotes: (notes: string) => void
}

export function WorkoutProgress({
  currentExerciseIndex,
  workoutQueue,
  currentExercise,
  muscleVolumeData,
  exerciseNotes,
  showExerciseMenu,
  setShowExerciseMenu,
  setShowReplaceModal,
  updateExerciseNotes
}: WorkoutProgressProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <>
      {/* Progress Bar */}
      <div className="bg-[#2C2C2E] h-1">
        <div 
          className="bg-[#FF375F] h-1 transition-all duration-300"
          style={{ width: `${((currentExerciseIndex + 1) / workoutQueue.length) * 100}%` }}
        />
      </div>

      {/* Real-time Muscle Fatigue Visualization */}
      <div className="p-4 pb-2">
        <Card className="bg-[#1C1C1E] border-[#2C2C2E]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[#A1A1A3] flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Real-time Muscle Fatigue
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-2" data-testid="muscle-fatigue-display">
              {muscleVolumeData.summary.length > 0 ? (
                muscleVolumeData.summary.slice(0, 6).map(({ muscle, intensity }) => (
                  <div key={muscle} className="text-center">
                    <div 
                      className={`h-2 rounded-full mb-1 ${
                        intensity === 'very_high' ? 'bg-red-500' :
                        intensity === 'high' ? 'bg-orange-500' :
                        intensity === 'medium' ? 'bg-yellow-500' :
                        intensity === 'low' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}
                      data-testid={`${muscle.toLowerCase()}-muscle-indicator`}
                      data-intensity={intensity}
                    />
                    <span className="text-xs text-[#A1A1A3]">
                      {muscle.replace('_', ' ')}
                    </span>
                  </div>
                ))
              ) : (
                // Show placeholder muscle groups when no volume data yet
                ['Chest', 'Shoulders', 'Back', 'Arms', 'Legs', 'Core'].map((muscle) => (
                  <div key={muscle} className="text-center">
                    <div 
                      className="h-2 rounded-full mb-1 bg-gray-500"
                      data-testid={`${muscle.toLowerCase()}-muscle-indicator`}
                      data-intensity="none"
                    />
                    <span className="text-xs text-[#A1A1A3]">
                      {muscle}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4">
        {/* Current Exercise */}
        <Card className="bg-[#1C1C1E] border-[#2C2C2E] mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-white">{currentExercise.name}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-[#A1A1A3]">{currentExercise.equipment}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getDifficultyColor(currentExercise.difficulty)}`}
                  >
                    {currentExercise.difficulty}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm text-[#A1A1A3]">Exercise</p>
                  <p className="text-lg font-bold text-white">
                    {currentExerciseIndex + 1}/{workoutQueue.length}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowExerciseMenu(!showExerciseMenu)}
                  className="text-[#A1A1A3] hover:text-white hover:bg-[#2C2C2E]"
                  data-testid="exercise-menu"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Exercise Menu */}
            {showExerciseMenu && (
              <div className="mt-4 p-3 bg-[#2C2C2E] rounded-lg space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplaceModal(true)}
                  className="w-full justify-start text-[#A1A1A3] hover:text-white"
                >
                  Replace Exercise
                </Button>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Exercise Notes */}
        <Card className="bg-[#1C1C1E] border-[#2C2C2E] mb-6">
          <CardHeader>
            <CardTitle className="text-sm text-[#A1A1A3] flex items-center">
              <NotebookPen className="h-4 w-4 mr-2" />
              Exercise Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Form cues, technique notes..."
              value={exerciseNotes[currentExercise?.id] || ''}
              onChange={(e) => updateExerciseNotes(e.target.value)}
              className="bg-[#2C2C2E] border-[#3C3C3E] text-white resize-none"
              rows={2}
              data-testid="exercise-notes"
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}