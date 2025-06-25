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

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'var(--calm-functional-success)'
      case 'intermediate': return 'var(--calm-functional-warning)'
      case 'advanced': return '#FF6B6B'
      default: return 'var(--calm-functional-neutral)'
    }
  }

  const getPrimaryMuscle = (muscleEngagement: Record<string, number>) => {
    return Object.entries(muscleEngagement)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Mixed'
  }

  const getMuscleGroupImage = (category: string) => {
    const workoutType = categoryMapping[muscleGroup]?.[0] || 'ChestTriceps'
    
    if (workoutType.includes('ChestTriceps')) return '/muscle-icons/push-muscles.svg'
    if (workoutType.includes('BackBiceps')) return '/muscle-icons/pull-muscles.svg'
    if (workoutType.includes('Legs')) return '/muscle-icons/legs-muscles.svg'
    if (workoutType.includes('Abs')) return '/muscle-icons/abs-muscles.svg'
    
    return '/muscle-icons/push-muscles.svg' // default
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

      {/* Exercise Gallery Grid - ChatGPT Calm Design System */}
      <div style={{ padding: 'var(--calm-space-m)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: 'var(--calm-space-m)' }}>
          {exercises.map((exercise) => {
            const isAdded = addedExercises.has(exercise.id)
            const primaryMuscle = getPrimaryMuscle(exercise.muscleEngagement)
            
            return (
              <div 
                key={exercise.id} 
                className="calm-card calm-transition-hover overflow-hidden"
                style={{
                  backgroundColor: 'var(--calm-dark-card)',
                  borderColor: 'var(--calm-functional-border)',
                  transform: 'scale(1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'var(--calm-elevation-card)';
                }}
              >
                {/* Large Image Area with Muscle Group Visualization */}
                <div 
                  className="aspect-square flex items-center justify-center"
                  style={{ 
                    position: 'relative',
                    background: 'var(--calm-secondary-gradient-blue)',
                    padding: 'var(--calm-space-s)'
                  }}
                >
                  <img 
                    src={getMuscleGroupImage(exercise.category)}
                    alt={`${muscleGroup} muscles`}
                    style={{ 
                      width: '80%', 
                      height: '80%',
                      objectFit: 'contain',
                      opacity: 0.95
                    }} 
                  />
                </div>
                
                {/* Card Content */}
                <div style={{ padding: 'var(--calm-space-s)' }}>
                  {/* Exercise Name */}
                  <h3 
                    className="calm-text-h2"
                    style={{ 
                      color: 'var(--calm-dark-text)', 
                      marginBottom: 'var(--calm-space-xs)',
                      fontWeight: 'var(--calm-weight-medium)'
                    }}
                  >
                    {exercise.name}
                  </h3>
                  
                  {/* Difficulty Badge */}
                  <div style={{ marginBottom: 'var(--calm-space-s)' }}>
                    <span 
                      className="calm-text-label"
                      style={{
                        backgroundColor: getDifficultyBadgeColor(exercise.difficulty),
                        color: 'var(--calm-primary-white)',
                        padding: 'var(--calm-space-xxs) var(--calm-space-xs)',
                        borderRadius: 'calc(var(--calm-radius-card) / 2)',
                        fontSize: 'var(--calm-size-label)'
                      }}
                    >
                      {exercise.difficulty}
                    </span>
                  </div>
                  
                  {/* Exercise Details */}
                  <div style={{ marginBottom: 'var(--calm-space-s)' }}>
                    <div 
                      className="calm-text-small"
                      style={{ 
                        color: 'var(--calm-functional-neutral)', 
                        marginBottom: 'var(--calm-space-xxs)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--calm-space-xs)'
                      }}
                    >
                      <Users style={{ width: 'var(--calm-size-small)', height: 'var(--calm-size-small)' }} />
                      <span>{primaryMuscle}</span>
                    </div>
                    <div 
                      className="calm-text-small"
                      style={{ 
                        color: 'var(--calm-functional-neutral)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--calm-space-xs)'
                      }}
                    >
                      <Clock style={{ width: 'var(--calm-size-small)', height: 'var(--calm-size-small)' }} />
                      <span>{exercise.equipment}</span>
                    </div>
                  </div>
                  
                  {/* Add Button */}
                  <div style={{ paddingTop: 'var(--calm-space-xs)' }}>
                    {isAdded ? (
                      <button
                        onClick={() => removeFromWorkout(exercise.id)}
                        className="calm-text-small calm-transition-standard"
                        style={{
                          width: '100%',
                          padding: 'var(--calm-space-xs) var(--calm-space-s)',
                          backgroundColor: 'var(--calm-functional-success)',
                          color: 'var(--calm-primary-white)',
                          border: 'none',
                          borderRadius: 'var(--calm-radius-card)',
                          fontWeight: 'var(--calm-weight-medium)',
                          cursor: 'pointer'
                        }}
                      >
                        Added ✓
                      </button>
                    ) : (
                      <button
                        onClick={() => addToWorkout(exercise)}
                        className="calm-text-small calm-transition-standard"
                        style={{
                          width: '100%',
                          padding: 'var(--calm-space-xs) var(--calm-space-s)',
                          backgroundColor: 'var(--calm-accent-teal)',
                          color: 'var(--calm-primary-white)',
                          border: 'none',
                          borderRadius: 'var(--calm-radius-card)',
                          fontWeight: 'var(--calm-weight-medium)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 'var(--calm-space-xs)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--calm-accent-lavender)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--calm-accent-teal)';
                        }}
                      >
                        <Plus style={{ width: 'var(--calm-size-small)', height: 'var(--calm-size-small)' }} />
                        Add Exercise
                      </button>
                    )}
                  </div>
                </div>
              </div>
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