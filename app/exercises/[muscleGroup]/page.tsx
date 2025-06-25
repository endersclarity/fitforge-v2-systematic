'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Dumbbell, Users, Clock } from "lucide-react"
import { CleanFilterBar, FilterState } from '@/components/clean-filter-bar'
import { WorkoutBuilder } from '@/components/workout-builder'
import { WorkoutExercise } from '@/schemas/typescript-interfaces'
import { filterExercisesByEquipment } from '@/lib/equipment-filter'
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


export default function ExerciseSelection() {
  const params = useParams()
  const router = useRouter()
  const muscleGroup = params.muscleGroup as string
  
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [workoutQueue, setWorkoutQueue] = useState<WorkoutExercise[]>([])
  const [addedExercises, setAddedExercises] = useState<Set<string>>(new Set())
  const [currentFilter, setCurrentFilter] = useState<FilterState>({ 
    equipment: [], 
    targetMuscle: [], 
    muscleFatigue: [] 
  })
  const [showWorkoutBuilder, setShowWorkoutBuilder] = useState(false)

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
    const exercisesByCategory = exercisesData.filter(exercise => 
      categories.some(cat => exercise.category.includes(cat))
    )
    setExercises(exercisesByCategory)
    setFilteredExercises(exercisesByCategory) // Initialize filtered list

    // Load existing workout queue from localStorage
    const savedQueue = localStorage.getItem('workoutQueue')
    if (savedQueue) {
      const queue = JSON.parse(savedQueue)
      setWorkoutQueue(queue)
      setAddedExercises(new Set(queue.map((ex: WorkoutExercise) => ex.id)))
    }
  }, [muscleGroup])

  // Apply filtering when filter state changes
  useEffect(() => {
    let filtered = [...exercises]

    // Filter by equipment
    if (currentFilter.equipment.length > 0) {
      filtered = filtered.filter(exercise => 
        currentFilter.equipment.includes(exercise.equipment)
      )
    }

    // Filter by target muscle
    if (currentFilter.targetMuscle.length > 0) {
      filtered = filtered.filter(exercise => {
        if (!exercise.muscleEngagement) return false
        
        const exerciseMuscles = Object.keys(exercise.muscleEngagement).map(muscle => 
          muscle
            .replace(/_/g, ' ')
            .replace('Pectoralis Major', 'Chest')
            .replace('Deltoids Anterior', 'Front Shoulders')
            .replace('Deltoids Posterior', 'Rear Shoulders')
            .replace('Deltoids Lateral', 'Side Shoulders')
            .replace('Latissimus Dorsi', 'Lats')
            .replace('Triceps Brachii', 'Triceps')
            .replace('Biceps Brachii', 'Biceps')
            .replace('Quadriceps', 'Quads')
            .replace('Hamstrings', 'Hamstrings')
            .replace('Gastrocnemius', 'Calves')
            .replace('Gluteus Maximus', 'Glutes')
            .replace('Erector Spinae', 'Lower Back')
            .replace('Rectus Abdominis', 'Abs')
        )
        
        return currentFilter.targetMuscle.some(targetMuscle => 
          exerciseMuscles.includes(targetMuscle)
        )
      })
    }

    // Future: Filter by muscle fatigue

    setFilteredExercises(filtered)
  }, [exercises, currentFilter])

  const handleFilterChange = (filter: FilterState) => {
    setCurrentFilter(filter)
  }

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

  const handlePlanWorkout = () => {
    if (workoutQueue.length === 0) return
    setShowWorkoutBuilder(true)
  }

  const handleStartPlannedWorkout = () => {
    setShowWorkoutBuilder(false)
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

  const getMuscleTargeting = (muscleEngagement: Record<string, number>) => {
    const muscles = Object.entries(muscleEngagement)
      .sort(([,a], [,b]) => b - a)
      .filter(([,engagement]) => engagement > 0)
    
    const primary = muscles.slice(0, 1).map(([muscle]) => muscle)
    const secondary = muscles.slice(1, 3).map(([muscle]) => muscle)
    
    return {
      primary: primary.length > 0 ? primary : ['Mixed'],
      secondary: secondary.length > 0 ? secondary : []
    }
  }

  const isPectoralisExercise = (muscleEngagement: Record<string, number>) => {
    const muscles = Object.entries(muscleEngagement).sort(([,a], [,b]) => b - a)
    return muscles[0]?.[0] === 'Pectoralis_Major'
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
              <p className="text-[#A1A1A3] text-sm">
                {(currentFilter.equipment.length === 0 && currentFilter.targetMuscle.length === 0)
                  ? `${exercises.length} exercises available`
                  : `${filteredExercises.length} of ${exercises.length} exercises`
                }
              </p>
            </div>
          </div>
          
          {workoutQueue.length > 0 && (
            <div className="flex space-x-2">
              <Button 
                onClick={handlePlanWorkout}
                className="bg-[#FF375F] hover:bg-[#E63050] text-white font-semibold"
              >
                <Dumbbell className="h-4 w-4 mr-2" />
                Plan Workout ({workoutQueue.length})
              </Button>
              <Button
                variant="outline"
                onClick={goToWorkout}
                className="bg-[#2C2C2E] border-[#3C3C3E] text-white hover:bg-[#3C3C3E]"
              >
                Quick Start
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Clean Filter Bar */}
      <CleanFilterBar 
        onFilterChange={handleFilterChange}
        className="sticky top-[73px] z-9"
      />

      {/* Exercise Gallery Grid - ChatGPT Calm Design System */}
      <div style={{ padding: 'var(--calm-space-m)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: 'var(--calm-space-m)' }}>
          {filteredExercises.map((exercise) => {
            const isAdded = addedExercises.has(exercise.id)
            const primaryMuscle = getPrimaryMuscle(exercise.muscleEngagement)
            const muscleTargeting = getMuscleTargeting(exercise.muscleEngagement || {})
            const isChestExercise = isPectoralisExercise(exercise.muscleEngagement || {})
            
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
                {/* Header - Chest Icon for Pectoralis Exercises, Emoji for Others */}
                <div 
                  className="aspect-square flex items-center justify-center calm-gradient-blue"
                  style={{ 
                    position: 'relative',
                    padding: 'var(--calm-space-m)'
                  }}
                >
                  {isChestExercise ? (
                    <img 
                      src="/icons/fitbod-chest.png"
                      alt="Chest muscles"
                      style={{ 
                        width: '80%', 
                        height: '80%',
                        objectFit: 'contain',
                        opacity: 0.95
                      }} 
                    />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div 
                        style={{ 
                          fontSize: '48px',
                          marginBottom: 'var(--calm-space-xs)'
                        }}
                      >
                        {muscleGroup === 'push' ? '💪' : 
                         muscleGroup === 'pull' ? '🤏' : 
                         muscleGroup === 'legs' ? '🏃' : '🔥'}
                      </div>
                      <div 
                        className="calm-text-small"
                        style={{ 
                          color: 'var(--calm-primary-white)',
                          fontWeight: 'var(--calm-weight-medium)',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}
                      >
                        {muscleGroupTitles[muscleGroup]} Day
                      </div>
                    </div>
                  )}
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
                  
                  {/* Muscle Targeting - Clean Text */}
                  <div style={{ marginBottom: 'var(--calm-space-s)' }}>
                    {muscleTargeting.primary.length > 0 && (
                      <div style={{ marginBottom: 'var(--calm-space-xxs)' }}>
                        <span 
                          className="calm-text-small"
                          style={{ 
                            color: 'var(--calm-accent-teal)',
                            fontWeight: 'var(--calm-weight-medium)',
                            fontSize: 'var(--calm-size-small)'
                          }}
                        >
                          Primary: {muscleTargeting.primary.join(', ')}
                        </span>
                      </div>
                    )}
                    {muscleTargeting.secondary.length > 0 && (
                      <div>
                        <span 
                          className="calm-text-small"
                          style={{ 
                            color: 'var(--calm-functional-neutral)',
                            fontSize: 'var(--calm-size-label)'
                          }}
                        >
                          Secondary: {muscleTargeting.secondary.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  
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
      {filteredExercises.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Dumbbell className="h-12 w-12 text-[#A1A1A3] mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {exercises.length === 0 ? 'No exercises found' : 'No exercises match your filters'}
          </h3>
          <p className="text-[#A1A1A3]">
            {exercises.length === 0 
              ? 'No exercises available for this muscle group yet.'
              : 'Try adjusting your filters to see more exercises.'
            }
          </p>
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

      {/* Workout Builder Modal */}
      {showWorkoutBuilder && (
        <WorkoutBuilder
          exercises={workoutQueue}
          onStartWorkout={handleStartPlannedWorkout}
          onClose={() => setShowWorkoutBuilder(false)}
        />
      )}
    </div>
  )
}