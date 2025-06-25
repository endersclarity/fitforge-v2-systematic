'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import { calculateMuscleVolume, getRecentWorkoutData } from "@/lib/muscle-volume-calculator"
import { WorkoutRoutineDisplay } from "@/components/workout-routine-display"
import exercisesData from '@/data/exercises-real.json'

interface MuscleGroup {
  id: string
  name: string
  exercises: string[]
  icon: string
}

const muscleGroups: MuscleGroup[] = [
  {
    id: 'push',
    name: 'Push',
    exercises: ['Bench Press', 'Push-ups', 'Overhead Press', 'Tricep Dips'],
    icon: '💪'
  },
  {
    id: 'pull', 
    name: 'Pull',
    exercises: ['Pull-ups', 'Rows', 'Lat Pulldowns', 'Deadlifts'],
    icon: '🤏'
  },
  {
    id: 'legs',
    name: 'Legs', 
    exercises: ['Squats', 'Lunges', 'Leg Press', 'Calf Raises'],
    icon: '🏃'
  },
  {
    id: 'abs',
    name: 'Abs',
    exercises: ['Crunches', 'Planks', 'Russian Twists', 'Leg Raises'],
    icon: '🔥'
  }
]

export function FitbodHome() {
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null)
  const [muscleVolumes, setMuscleVolumes] = useState<Record<string, number>>({})
  const [showWorkoutRoutine, setShowWorkoutRoutine] = useState(false)

  // Calculate muscle volumes from recent workouts
  useEffect(() => {
    const { sessions } = getRecentWorkoutData()
    const volumes = calculateMuscleVolume(sessions, exercisesData as any[], 7)
    setMuscleVolumes(volumes)
  }, [])

  const handleMuscleGroupSelect = (muscleGroupId: string) => {
    setSelectedMuscleGroup(muscleGroupId)
    // Navigate to exercise selection for this muscle group
    window.location.href = `/exercises/${muscleGroupId}`
  }

  const handleQuickStart = () => {
    // Navigate to the existing working workout logger
    window.location.href = '/workouts-simple'
  }

  const handleStartWorkout = () => {
    setShowWorkoutRoutine(true)
  }

  const handleWorkoutStart = (template: any) => {
    console.log('Starting workout with template:', template)
    // TODO: Navigate to workout builder with selected template
    alert(`Starting workout: ${template.name}`)
  }

  // Show workout routine if user clicked "Start Workout"
  if (showWorkoutRoutine) {
    return (
      <WorkoutRoutineDisplay 
        onBack={() => setShowWorkoutRoutine(false)}
        onStartWorkout={handleWorkoutStart}
        selectedTemplate="pushA" // Default to Push A routine
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">Ready to workout?</h1>
        <p className="text-[#A1A1A3] text-lg">Choose a muscle group to get started</p>
      </div>

      {/* Start Workout Button */}
      <div className="px-6 mb-6">
        <Button 
          onClick={handleStartWorkout}
          className="w-full bg-[#FF375F] hover:bg-[#E63050] text-white h-16 text-lg font-semibold"
        >
          🏋️ Start Workout
        </Button>
      </div>

      {/* Muscle Group Selection */}
      <div className="px-6 space-y-3">
        {muscleGroups.map((group) => (
          <Card key={group.id} className="bg-[#1C1C1E] border-[#2C2C2E] hover:bg-[#2C2C2E] transition-colors">
            <CardContent className="p-0">
              <Button 
                variant="ghost" 
                className="w-full h-auto p-6 justify-between text-left hover:bg-transparent"
                onClick={() => handleMuscleGroupSelect(group.id)}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{group.icon}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{group.name}</h3>
                    <p className="text-[#A1A1A3] text-sm">
                      {group.exercises.slice(0, 2).join(', ')} + {group.exercises.length - 2} more
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-[#A1A1A3]" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Summary */}
      <div className="px-6 mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <Card className="bg-[#1C1C1E] border-[#2C2C2E]">
          <CardContent className="p-4">
            <div className="text-center text-[#A1A1A3]">
              <p className="text-lg">Ready to start logging workouts</p>
              <p className="text-sm mt-1">Your muscle activity will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mt-8 space-y-4">
        <Button 
          onClick={handleQuickStart}
          className="w-full bg-[#FF375F] hover:bg-[#E63050] text-white h-14 text-lg font-semibold"
        >
          Quick Start Workout
        </Button>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/analytics'}
            className="bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white border-[#3C3C3E] h-12"
          >
            📊 Analytics
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white border-[#3C3C3E] h-12"
          >
            📈 Dashboard
          </Button>
        </div>
      </div>

      {/* Bottom spacing for mobile */}
      <div className="h-8" />
    </div>
  )
}