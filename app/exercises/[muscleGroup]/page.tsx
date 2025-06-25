'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Dumbbell, Users, Clock } from "lucide-react"
import exercisesData from '@/data/exercises-real.json'

interface Exercise {
  id: string
  name: string
  category: string
  equipment: string
  difficulty: string
  muscleEngagement: Record<string, number>
  instructions: string[]
  tips: string[]
}

interface WorkoutExercise {
  id: string
  name: string
  category: string
  equipment: string
  difficulty: string
}

export default function ExerciseSelection() {
  const params = useParams()
  const router = useRouter()
  const muscleGroup = params.muscleGroup as string
  
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [workoutQueue, setWorkoutQueue] = useState<WorkoutExercise[]>([])
  const [addedExercises, setAddedExercises] = useState<Set<string>>(new Set())

  // Map URL movement patterns to exercise categories
  const categoryMapping: Record<string, string[]> = {
    'push': ['ChestTriceps'],
    'pull': ['BackBiceps'],
    'legs': ['Legs'],
    'abs': ['Abs']
  }

  const muscleGroupTitles: Record<string, string> = {
    'push': 'Push',
    'pull': 'Pull',
    'legs': 'Legs', 
    'abs': 'Abs'
  }

  useEffect(() => {
    const categories = categoryMapping[muscleGroup] || []
    const filteredExercises = exercisesData.filter(exercise => 
      categories.some(cat => exercise.category.includes(cat))
    )
    setExercises(filteredExercises)

    // Load existing workout queue from localStorage
    const savedQueue = localStorage.getItem('workoutQueue')
    if (savedQueue) {
      const queue = JSON.parse(savedQueue)
      setWorkoutQueue(queue)
      setAddedExercises(new Set(queue.map((ex: WorkoutExercise) => ex.id)))
    }
  }, [muscleGroup])

  const addToWorkout = (exercise: Exercise) => {
    if (addedExercises.has(exercise.id)) return

    const workoutExercise: WorkoutExercise = {
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty
    }

    const newQueue = [...workoutQueue, workoutExercise]
    setWorkoutQueue(newQueue)
    setAddedExercises(new Set([...addedExercises, exercise.id]))
    
    // Save to localStorage
    localStorage.setItem('workoutQueue', JSON.stringify(newQueue))
  }

  const removeFromWorkout = (exerciseId: string) => {
    const newQueue = workoutQueue.filter(ex => ex.id !== exerciseId)
    setWorkoutQueue(newQueue)
    setAddedExercises(new Set(newQueue.map(ex => ex.id)))
    
    // Update localStorage
    localStorage.setItem('workoutQueue', JSON.stringify(newQueue))
  }

  const goToWorkout = () => {
    if (workoutQueue.length === 0) return
    router.push('/workouts-simple')
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getPrimaryMuscle = (muscleEngagement: Record<string, number>) => {
    return Object.entries(muscleEngagement)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Mixed'
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="sticky top-0 bg-[#121212]/95 backdrop-blur-sm border-b border-[#2C2C2E] z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-[#A1A1A3] hover:text-white hover:bg-[#2C2C2E]"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{muscleGroupTitles[muscleGroup]}</h1>
              <p className="text-[#A1A1A3] text-sm">{exercises.length} exercises available</p>
            </div>
          </div>
          
          {workoutQueue.length > 0 && (
            <Button 
              onClick={goToWorkout}
              className="bg-[#FF375F] hover:bg-[#E63050] text-white font-semibold"
            >
              <Dumbbell className="h-4 w-4 mr-2" />
              Start Workout ({workoutQueue.length})
            </Button>
          )}
        </div>
      </div>

      {/* Exercise Gallery Grid - Calm-Inspired */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {exercises.map((exercise) => {
            const isAdded = addedExercises.has(exercise.id)
            const primaryMuscle = getPrimaryMuscle(exercise.muscleEngagement)
            
            return (
              <Card key={exercise.id} className="bg-[#1C1C1E] border-[#2C2C2E] overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02]">
                <CardContent className="p-0">
                  {/* Large Image Area */}
                  <div className="aspect-square bg-gradient-to-br from-[#2C2C2E] to-[#1C1C1E] flex items-center justify-center">
                    <Dumbbell className="h-16 w-16 text-[#A1A1A3]/70" />
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-4 space-y-3">
                    {/* Exercise Name */}
                    <h3 className="text-lg font-medium text-white leading-tight">
                      {exercise.name}
                    </h3>
                    
                    {/* Difficulty Badge */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className={`text-xs border-opacity-50 ${getDifficultyColor(exercise.difficulty)}`}
                      >
                        {exercise.difficulty}
                      </Badge>
                    </div>
                    
                    {/* Exercise Details */}
                    <div className="space-y-2 text-sm text-[#A1A1A3]">
                      <div className="flex items-center space-x-2">
                        <Users className="h-3.5 w-3.5" />
                        <span>{primaryMuscle}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{exercise.equipment}</span>
                      </div>
                    </div>
                    
                    {/* Add Button */}
                    <div className="pt-2">
                      {isAdded ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromWorkout(exercise.id)}
                          className="w-full bg-[#FF375F]/10 border-[#FF375F]/30 text-[#FF375F] hover:bg-[#FF375F]/20 rounded-xl"
                        >
                          Added ✓
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => addToWorkout(exercise)}
                          className="w-full bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white border-0 rounded-xl transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Exercise
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Empty State */}
      {exercises.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Dumbbell className="h-12 w-12 text-[#A1A1A3] mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No exercises found</h3>
          <p className="text-[#A1A1A3]">No exercises available for this muscle group yet.</p>
        </div>
      )}

      {/* Floating Workout Queue (Mobile-optimized) */}
      {workoutQueue.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-80">
          <Card className="bg-[#1C1C1E] border-[#2C2C2E] shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">Workout Queue</h4>
                <Badge className="bg-[#FF375F] text-white">{workoutQueue.length}</Badge>
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {workoutQueue.slice(-3).map((exercise) => (
                  <div key={exercise.id} className="flex items-center justify-between text-sm">
                    <span className="text-[#A1A1A3] truncate">{exercise.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWorkout(exercise.id)}
                      className="text-[#FF375F] hover:text-[#E63050] h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                {workoutQueue.length > 3 && (
                  <p className="text-xs text-[#A1A1A3] text-center">
                    +{workoutQueue.length - 3} more exercises
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}