'use client'

import { Button } from "@/components/ui/button"
import { ArrowLeft, Timer } from "lucide-react"
import { useRouter } from 'next/navigation'

interface WorkoutHeaderProps {
  elapsedTime: number
  onFinishWorkout: () => void
  isFinishDisabled: boolean
}

export function WorkoutHeader({ elapsedTime, onFinishWorkout, isFinishDisabled }: WorkoutHeaderProps) {
  const router = useRouter()

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="sticky top-0 bg-[#121212]/95 backdrop-blur-sm border-b border-[#2C2C2E] z-10">
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/')}
          className="text-[#A1A1A3] hover:text-white hover:bg-[#2C2C2E]"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        <div className="text-center">
          <h1 className="text-lg font-semibold">Experimental Workout Execution</h1>
          <div className="flex items-center space-x-2 text-sm text-[#A1A1A3]">
            <Timer className="h-4 w-4" />
            <span>{formatTime(elapsedTime)}</span>
          </div>
        </div>

        <Button
          onClick={onFinishWorkout}
          disabled={isFinishDisabled}
          className="bg-[#FF375F] hover:bg-[#E63050] text-white text-sm px-3"
        >
          Finish
        </Button>
      </div>
    </div>
  )
}