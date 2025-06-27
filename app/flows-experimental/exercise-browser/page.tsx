'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Dumbbell, Info } from 'lucide-react'
import { CleanFilterBar } from '@/components/clean-filter-bar'
import { SortDropdown } from '@/components/sort-dropdown'
import exercisesData from '@/data/exercises-real.json'

interface Exercise {
  id: string
  name: string
  category: string
  equipment: string
  difficulty: string
  variation: string
  muscleEngagement: Record<string, number>
}

interface FilterState {
  equipment: string[]
  targetMuscle: string[]
  group: string[]
  fatigueSort: 'all' | 'fresh' | 'fatigued'
}

export default function ExperimentalExerciseBrowser() {
  const router = useRouter()
  const [exercises] = useState<Exercise[]>(exercisesData as Exercise[])
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showExerciseInfo, setShowExerciseInfo] = useState(false)
  
  // Filter state
  const [filterState, setFilterState] = useState<FilterState>({
    equipment: [],
    targetMuscle: [],
    group: [],
    fatigueSort: 'all'
  })
  
  // Sort state
  const [sortBy, setSortBy] = useState<string>('alphabetical')
  
  // Category to group mapping
  const getExerciseGroup = (category: string): string => {
    if (category.includes('ChestTriceps')) return 'Push'
    if (category.includes('BackBiceps')) return 'Pull'
    if (category.includes('Legs')) return 'Legs'
    if (category.includes('Abs')) return 'Abs'
    return 'Other'
  }
  
  // Apply filters and sorting
  const filteredAndSortedExercises = useMemo(() => {
    console.log('🚨 [useMemo] RECALCULATING filtered exercises')
    let filtered = [...exercises]
    console.log('🔍 FILTER DEBUG:')
    console.log('  Starting with', filtered.length, 'exercises')
    console.log('  Filter state:', JSON.stringify(filterState))
    
    // Apply equipment filter
    if (filterState.equipment.length > 0) {
      const beforeCount = filtered.length
      filtered = filtered.filter(ex => filterState.equipment.includes(ex.equipment))
      console.log('  Equipment filter:', filterState.equipment, 'reduced from', beforeCount, 'to', filtered.length)
    }
    
    // Apply target muscle filter
    if (filterState.targetMuscle.length > 0) {
      const beforeCount = filtered.length
      filtered = filtered.filter(ex => {
        const muscles = Object.keys(ex.muscleEngagement)
        // Direct comparison - filterState.targetMuscle now contains data names
        return filterState.targetMuscle.some(targetMuscle => 
          muscles.includes(targetMuscle)
        )
      })
      console.log('Muscle filter:', filterState.targetMuscle, 'reduced from', beforeCount, 'to', filtered.length)
    }
    
    // Apply group filter
    if (filterState.group.length > 0) {
      filtered = filtered.filter(ex => filterState.group.includes(getExerciseGroup(ex.category)))
    }
    
    // Apply sorting
    if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'mostLogged') {
      // Simulate most logged - in real app this would use actual usage data
      filtered.sort((a, b) => {
        const aScore = a.difficulty === 'Beginner' ? 3 : a.difficulty === 'Intermediate' ? 2 : 1
        const bScore = b.difficulty === 'Beginner' ? 3 : b.difficulty === 'Intermediate' ? 2 : 1
        return bScore - aScore
      })
    }
    
    return filtered
  }, [exercises, filterState, sortBy]) // Dependencies: re-run when any of these change
  
  const handleFilterChange = (newState: FilterState) => {
    console.log('Filter state changed:', newState)
    setFilterState(newState)
  }
  
  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setShowExerciseInfo(true)
  }
  
  const handleAddExercise = (exercise: Exercise) => {
    // In future, this will connect to workout builder (Issue #26)
    console.log('Adding exercise to workout:', exercise.name)
    // For now, just show a message
    alert(`"${exercise.name}" will be added to workout builder (coming soon)`)
  }

  return (
    <div className="min-h-screen bg-fitbod-background text-fitbod-text">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-fitbod-background border-b border-fitbod-subtle">
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="bg-fitbod-card border-fitbod-subtle text-fitbod-text hover:bg-fitbod-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-fitbod-text">Exercise Browser</h1>
              <p className="text-sm text-fitbod-text-secondary">
                {filteredAndSortedExercises.length} exercises available
              </p>
            </div>
            <SortDropdown
              label="Sort"
              options={[
                { value: 'alphabetical', label: 'Alphabetically' },
                { value: 'mostLogged', label: 'Most Logged' }
              ]}
              selectedValue={sortBy}
              onValueChange={setSortBy}
            />
          </div>
          
          {/* Filter Bar */}
          <CleanFilterBar
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>
      
      {/* Exercise Grid */}
      <div className="p-4">
        {filteredAndSortedExercises.length === 0 ? (
          <Card className="bg-fitbod-card border-fitbod-subtle">
            <CardContent className="p-8 text-center">
              <p className="text-fitbod-text-secondary">
                No exercises match your filters. Try adjusting your selections.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedExercises.map((exercise) => (
              <Card
                key={exercise.id}
                className="bg-fitbod-card border-fitbod-subtle hover:bg-fitbod-subtle transition-all cursor-pointer"
                onClick={() => handleExerciseClick(exercise)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-fitbod-text mb-1">{exercise.name}</h3>
                      <p className="text-sm text-fitbod-text-secondary mb-2">{exercise.equipment}</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs bg-fitbod-subtle px-2 py-1 rounded">
                          {exercise.category.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-xs bg-fitbod-subtle px-2 py-1 rounded">
                          {exercise.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="p-2 bg-fitbod-subtle rounded-lg">
                      <Dumbbell className="h-5 w-5 text-fitbod-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Exercise Info Modal */}
      {showExerciseInfo && selectedExercise && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-fitbod-card w-full md:max-w-lg max-h-[80vh] rounded-t-2xl md:rounded-2xl overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="p-4 border-b border-fitbod-subtle">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-fitbod-text">{selectedExercise.name}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExerciseInfo(false)}
                  className="text-fitbod-text-secondary hover:text-fitbod-text"
                >
                  ✕
                </Button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-4 overflow-y-auto">
              {/* Exercise Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-fitbod-text-secondary mb-1">Equipment</p>
                  <p className="text-fitbod-text font-medium">{selectedExercise.equipment}</p>
                </div>
                
                <div>
                  <p className="text-sm text-fitbod-text-secondary mb-1">Difficulty</p>
                  <p className="text-fitbod-text font-medium">{selectedExercise.difficulty}</p>
                </div>
                
                <div>
                  <p className="text-sm text-fitbod-text-secondary mb-1">Category</p>
                  <p className="text-fitbod-text font-medium">
                    {selectedExercise.category.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
                
                {/* Muscle Engagement */}
                <div>
                  <p className="text-sm text-fitbod-text-secondary mb-3">Muscle Engagement</p>
                  <div className="space-y-2">
                    {Object.entries(selectedExercise.muscleEngagement)
                      .sort(([, a], [, b]) => b - a)
                      .map(([muscle, percentage]) => (
                        <div key={muscle} className="flex items-center justify-between">
                          <span className="text-sm text-fitbod-text">
                            {muscle.replace(/_/g, ' ')}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-fitbod-subtle rounded-full overflow-hidden">
                              <div
                                className="h-full bg-fitbod-accent rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-fitbod-text-secondary w-10 text-right">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Actions */}
            <div className="p-4 border-t border-fitbod-subtle">
              <Button
                onClick={() => handleAddExercise(selectedExercise)}
                className="w-full bg-fitbod-accent hover:bg-red-600 text-white"
              >
                Add to Workout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}