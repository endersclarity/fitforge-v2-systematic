"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog"
import { Button } from "./button"
import { Play, Info, Plus } from "lucide-react"

interface Exercise {
  id: string
  name: string
  category: string
  equipment: string
  difficulty: string
}

interface ExerciseActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercise: Exercise | null
  onStartWorkout: () => void
  onViewDetails: () => void
  onAddToDraft: () => void
}

export function ExerciseActionDialog({
  open,
  onOpenChange,
  exercise,
  onStartWorkout,
  onViewDetails,
  onAddToDraft
}: ExerciseActionDialogProps) {
  if (!exercise) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {exercise.name}
            <span className="text-sm text-muted-foreground font-normal">
              {exercise.category}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {/* Primary Action: Start Workout */}
          <Button 
            className="w-full h-12" 
            onClick={onStartWorkout}
            size="lg"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Workout
          </Button>
          
          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={onViewDetails}
              className="h-10"
            >
              <Info className="h-4 w-4 mr-2" />
              Details
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onAddToDraft}
              className="h-10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Draft
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}