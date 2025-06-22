/**
 * ExerciseSelector Component
 * Search and select exercises with filtering by equipment and muscle group
 * Shows recently used exercises and last performed stats
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api-client'
import { 
  Exercise, 
  ExerciseWithLastPerformance,
  WorkoutSet 
} from '@/schemas/typescript-interfaces'
import { Input } from '@/components/ui/fitforge-input'
import { Button } from '@/components/ui/fitforge-button'
import { Card } from '@/components/ui/fitforge-card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Dumbbell, Trophy, Clock, Filter, X } from 'lucide-react'
import { useMediaQuery } from '@/components/ui/use-mobile'

export interface ExerciseSelectorProps {
  /** Currently selected exercise */
  selectedExercise?: Exercise | null
  /** Callback when exercise is selected */
  onSelectExercise: (exercise: Exercise) => void
  /** User ID for fetching recent exercises */
  userId: string
  /** Show selector as modal/sheet on mobile */
  isOpen?: boolean
  /** Callback to close mobile sheet */
  onClose?: () => void
  /** Available equipment to filter by */
  availableEquipment?: string[]
  /** Additional CSS classes */
  className?: string
}

/**
 * ExerciseSelector - Search and select exercises with smart filtering
 * 
 * @example
 * ```tsx
 * <ExerciseSelector
 *   selectedExercise={currentExercise}
 *   onSelectExercise={handleExerciseSelect}
 *   userId={user.id}
 *   availableEquipment={user.available_equipment}
 * />
 * ```
 */
export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  selectedExercise,
  onSelectExercise,
  userId,
  isOpen = false,
  onClose,
  availableEquipment = [],
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null)
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null)
  const [exercises, setExercises] = useState<ExerciseWithLastPerformance[]>([])
  const [recentExercises, setRecentExercises] = useState<ExerciseWithLastPerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const isMobile = useMediaQuery('(max-width: 768px)')

  console.log('🔥 [ExerciseSelector] ENTRY - props:', { 
    selectedExercise: selectedExercise?.id, 
    userId, 
    isOpen 
  })

  /**
   * Fetch exercises with last performance data
   */
  const fetchExercises = useCallback(async () => {
    console.log('🔥 [fetchExercises] Starting fetch')
    setIsLoading(true)
    setError(null)

    try {
      // Fetch all exercises
      const allExercises = await api.exercises.list({
        limit: 100, // Get all exercises
      })

      // Fetch recent workout sets for the user
      const recentSets = await api.workoutSets.list({
        limit: 50, // Get recent sets
      })

      // Group sets by exercise to find last performance
      const lastPerformanceMap = new Map<string, WorkoutSet>()
      const personalBestMap = new Map<string, WorkoutSet>()
      
      recentSets.forEach(set => {
        // Track last performance
        const existing = lastPerformanceMap.get(set.exercise_id)
        if (!existing || new Date(set.created_at) > new Date(existing.created_at)) {
          lastPerformanceMap.set(set.exercise_id, set)
        }

        // Track personal best (highest volume)
        const currentBest = personalBestMap.get(set.exercise_id)
        if (!currentBest || set.volume_lbs > currentBest.volume_lbs) {
          personalBestMap.set(set.exercise_id, set)
        }
      })

      // Enhance exercises with performance data
      const enhancedExercises: ExerciseWithLastPerformance[] = allExercises.map(exercise => ({
        ...exercise,
        last_workout_set: lastPerformanceMap.get(exercise.id),
        personal_best: personalBestMap.get(exercise.id),
        recent_volume: lastPerformanceMap.get(exercise.id)?.volume_lbs || 0,
      }))

      // Sort by recency (exercises with recent sets first)
      enhancedExercises.sort((a, b) => {
        const aDate = a.last_workout_set?.created_at || '1970-01-01'
        const bDate = b.last_workout_set?.created_at || '1970-01-01'
        return new Date(bDate).getTime() - new Date(aDate).getTime()
      })

      setExercises(enhancedExercises)
      
      // Extract recently used exercises (top 5)
      const recent = enhancedExercises
        .filter(ex => ex.last_workout_set)
        .slice(0, 5)
      setRecentExercises(recent)

      console.log('🔧 [fetchExercises] SUCCESS:', {
        totalExercises: enhancedExercises.length,
        recentExercises: recent.length,
      })
    } catch (err: any) {
      console.log('🚨 FAILURE CONDITION - fetchExercises error:', err)
      setError(err.message || 'Failed to load exercises')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Fetch exercises on mount
  useEffect(() => {
    fetchExercises()
  }, [fetchExercises])

  /**
   * Get unique equipment types from exercises
   */
  const equipmentTypes = useMemo(() => {
    const types = new Set<string>()
    exercises.forEach(ex => types.add(ex.equipment))
    return Array.from(types).sort()
  }, [exercises])

  /**
   * Get unique muscle groups from exercises
   */
  const muscleGroups = useMemo(() => {
    const groups = new Set<string>()
    exercises.forEach(ex => {
      ex.primary_muscles.forEach(muscle => groups.add(muscle))
    })
    return Array.from(groups).sort()
  }, [exercises])

  /**
   * Filter exercises based on search and filters
   */
  const filteredExercises = useMemo(() => {
    console.log('🔧 [filteredExercises] Filtering with:', {
      searchQuery,
      selectedEquipment,
      selectedMuscleGroup,
    })

    return exercises.filter(exercise => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          exercise.name.toLowerCase().includes(query) ||
          exercise.category.toLowerCase().includes(query) ||
          exercise.primary_muscles.some(muscle => 
            muscle.toLowerCase().includes(query)
          )
        
        if (!matchesSearch) return false
      }

      // Equipment filter
      if (selectedEquipment && exercise.equipment !== selectedEquipment) {
        return false
      }

      // Muscle group filter
      if (selectedMuscleGroup && !exercise.primary_muscles.includes(selectedMuscleGroup)) {
        return false
      }

      return true
    })
  }, [exercises, searchQuery, selectedEquipment, selectedMuscleGroup])

  /**
   * Handle exercise selection
   */
  const handleSelectExercise = (exercise: Exercise) => {
    console.log('🔥 [handleSelectExercise] Selected:', exercise.id)
    onSelectExercise(exercise)
    
    // Clear search and close mobile sheet
    setSearchQuery('')
    if (onClose) {
      onClose()
    }
  }

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedEquipment(null)
    setSelectedMuscleGroup(null)
  }

  /**
   * Render exercise card
   */
  const renderExerciseCard = (exercise: ExerciseWithLastPerformance) => {
    const isSelected = selectedExercise?.id === exercise.id
    const lastSet = exercise.last_workout_set
    const personalBest = exercise.personal_best

    return (
      <Card
        key={exercise.id}
        className={cn(
          'p-4 cursor-pointer transition-all duration-200',
          'hover:bg-[#2C2C2E] active:scale-[0.98]',
          isSelected && 'ring-2 ring-[#FF375F] bg-[#2C2C2E]'
        )}
        onClick={() => handleSelectExercise(exercise)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white truncate">
              {exercise.name}
            </h4>
            <p className="text-sm text-gray-400 mt-1">
              {exercise.equipment} • {exercise.category}
            </p>
            
            {/* Last performance */}
            {lastSet && (
              <div className="flex items-center gap-2 mt-2">
                <Clock className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">
                  Last: {lastSet.weight_lbs} lbs × {lastSet.reps} reps
                </span>
              </div>
            )}

            {/* Personal best indicator */}
            {personalBest && personalBest.id === lastSet?.id && (
              <div className="flex items-center gap-1 mt-1">
                <Trophy className="h-3 w-3 text-[#FFD700]" />
                <span className="text-xs text-[#FFD700]">Personal Best!</span>
              </div>
            )}
          </div>

          {/* Difficulty badge */}
          <Badge 
            variant="secondary"
            className={cn(
              'text-xs',
              exercise.difficulty === 'Beginner' && 'bg-green-900 text-green-100',
              exercise.difficulty === 'Intermediate' && 'bg-yellow-900 text-yellow-100',
              exercise.difficulty === 'Advanced' && 'bg-red-900 text-red-100'
            )}
          >
            {exercise.difficulty}
          </Badge>
        </div>

        {/* Primary muscles */}
        <div className="flex flex-wrap gap-1 mt-3">
          {exercise.primary_muscles.slice(0, 3).map(muscle => (
            <Badge
              key={muscle}
              variant="outline"
              className="text-xs border-gray-700 text-gray-300"
            >
              {muscle}
            </Badge>
          ))}
          {exercise.primary_muscles.length > 3 && (
            <Badge
              variant="outline"
              className="text-xs border-gray-700 text-gray-400"
            >
              +{exercise.primary_muscles.length - 3}
            </Badge>
          )}
        </div>
      </Card>
    )
  }

  /**
   * Render content (shared between desktop and mobile)
   */
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-400">{error}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchExercises}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      )
    }

    return (
      <>
        {/* Search and filters */}
        <div className="space-y-3 sticky top-0 bg-[#121212] pb-4 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="pl-10"
            />
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            {/* Equipment filter */}
            <select
              value={selectedEquipment || ''}
              onChange={(e) => setSelectedEquipment(e.target.value || null)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm',
                'bg-[#1C1C1E] border border-[#2C2C2E]',
                'text-gray-300 focus:outline-none focus:border-[#FF375F]'
              )}
            >
              <option value="">All Equipment</option>
              {equipmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Muscle group filter */}
            <select
              value={selectedMuscleGroup || ''}
              onChange={(e) => setSelectedMuscleGroup(e.target.value || null)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm',
                'bg-[#1C1C1E] border border-[#2C2C2E]',
                'text-gray-300 focus:outline-none focus:border-[#FF375F]'
              )}
            >
              <option value="">All Muscles</option>
              {muscleGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>

            {/* Clear filters */}
            {(searchQuery || selectedEquipment || selectedMuscleGroup) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8"
              >
                Clear
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Recently used exercises */}
        {recentExercises.length > 0 && !searchQuery && !selectedEquipment && !selectedMuscleGroup && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Recently Used</h3>
            <div className="space-y-2">
              {recentExercises.map(renderExerciseCard)}
            </div>
          </div>
        )}

        {/* All exercises */}
        <div>
          {filteredExercises.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No exercises found</p>
              {(searchQuery || selectedEquipment || selectedMuscleGroup) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                All Exercises ({filteredExercises.length})
              </h3>
              <div className="space-y-2">
                {filteredExercises.map(renderExerciseCard)}
              </div>
            </>
          )}
        </div>
      </>
    )
  }

  // Mobile: Render as sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
        <SheetContent side="bottom" className="h-[85vh] bg-[#121212]">
          <SheetHeader>
            <SheetTitle>Select Exercise</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full mt-4 pr-4">
            {renderContent()}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: Render inline
  return (
    <div className={cn('w-full', className)}>
      {renderContent()}
    </div>
  )
}