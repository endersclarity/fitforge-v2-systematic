"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"

interface MuscleGroup {
  name: string
  engagement: number
  color: string
}

export function MuscleEngagementChart() {
  const [muscleData, setMuscleData] = useState<MuscleGroup[]>([])

  useEffect(() => {
    // Mock data based on recent workouts
    // In a real app, this would calculate from actual workout data
    const mockData: MuscleGroup[] = [
      { name: "Chest", engagement: 75, color: "bg-red-500" },
      { name: "Back", engagement: 60, color: "bg-blue-500" },
      { name: "Legs", engagement: 45, color: "bg-green-500" },
      { name: "Shoulders", engagement: 30, color: "bg-yellow-500" },
      { name: "Arms", engagement: 55, color: "bg-purple-500" },
      { name: "Core", engagement: 25, color: "bg-orange-500" },
    ]
    setMuscleData(mockData)
  }, [])

  return (
    <div className="space-y-4">
      {muscleData.map((muscle) => (
        <div key={muscle.name} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{muscle.name}</span>
            <span className="text-sm text-muted-foreground">{muscle.engagement}%</span>
          </div>
          <Progress value={muscle.engagement} className="h-2" />
        </div>
      ))}
    </div>
  )
}
