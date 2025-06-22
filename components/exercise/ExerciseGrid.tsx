/**
 * Exercise Grid Component
 * Virtualized grid layout for exercises with responsive design
 */

import React, { useCallback, useRef, useEffect, CSSProperties } from 'react'
import { VariableSizeGrid as Grid } from 'react-window'
import AutoSizer from 'react-window-autosizer'
import { Exercise } from '@/schemas/typescript-interfaces'
import { ExerciseCard } from '@/components/ui/fitforge-card'
import { ExerciseEngagementMini } from './ExerciseEngagementChart'
import { cn } from '@/lib/utils'
import { Loader2, AlertCircle, Search } from 'lucide-react'

interface ExerciseGridProps {
  exercises: Exercise[]
  loading?: boolean
  error?: string | null
  onExerciseSelect?: (exercise: Exercise) => void
  onLoadMore?: () => void
  hasMore?: boolean
  className?: string
  emptyMessage?: string
  gridCols?: {
    mobile: number
    tablet: number
    desktop: number
  }
}

// Enhanced exercise card for the grid
interface GridExerciseCardProps {
  exercise: Exercise
  onClick?: () => void
  lastPerformed?: {
    weight: number
    reps: number
    date: string
  }
}

function GridExerciseCard({ exercise, onClick, lastPerformed }: GridExerciseCardProps) {
  // Convert muscle engagement to array format
  const muscleEngagements = Object.entries(exercise.muscle_engagement || {})
    .map(([muscle, percentage]) => ({ muscle, percentage }))
    .filter(e => e.percentage > 0)

  return (
    <div
      className={cn(
        'h-full p-2 cursor-pointer',
        'transform transition-all duration-200',
        'hover:scale-[1.02] active:scale-[0.98]'
      )}
      onClick={onClick}
    >
      <div className="h-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-4 hover:bg-[#2C2C2E]">
        <div className="flex flex-col h-full">
          {/* Exercise name and equipment */}
          <div className="flex-1">
            <h4 className="font-semibold text-white line-clamp-2 mb-1">
              {exercise.name}
            </h4>
            <p className="text-sm text-[#A1A1A3] mb-2">
              {exercise.equipment} • {exercise.category}
            </p>
          </div>

          {/* Muscle engagement visualization */}
          {muscleEngagements.length > 0 && (
            <div className="mb-3">
              <ExerciseEngagementMini engagements={muscleEngagements} />
            </div>
          )}

          {/* Primary muscles */}
          <div className="flex flex-wrap gap-1 mb-3">
            {exercise.primary_muscles.slice(0, 3).map(muscle => (
              <span
                key={muscle}
                className="px-2 py-0.5 bg-[#2C2C2E] text-xs text-[#A1A1A3] rounded"
              >
                {muscle.replace(/_/g, ' ')}
              </span>
            ))}
            {exercise.primary_muscles.length > 3 && (
              <span className="px-2 py-0.5 bg-[#2C2C2E] text-xs text-[#A1A1A3] rounded">
                +{exercise.primary_muscles.length - 3}
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 text-xs">
            {exercise.is_compound && (
              <span className="px-2 py-0.5 bg-[#10B981] bg-opacity-20 text-[#10B981] rounded">
                Compound
              </span>
            )}
            <span className={cn(
              'px-2 py-0.5 rounded',
              exercise.difficulty === 'Beginner' && 'bg-blue-500 bg-opacity-20 text-blue-500',
              exercise.difficulty === 'Intermediate' && 'bg-yellow-500 bg-opacity-20 text-yellow-500',
              exercise.difficulty === 'Advanced' && 'bg-red-500 bg-opacity-20 text-red-500'
            )}>
              {exercise.difficulty}
            </span>
          </div>

          {/* Last performed info */}
          {lastPerformed && (
            <div className="mt-3 pt-3 border-t border-[#2C2C2E]">
              <p className="text-xs text-[#A1A1A3]">
                Last: {lastPerformed.weight} lbs × {lastPerformed.reps} • {lastPerformed.date}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ExerciseGrid({
  exercises,
  loading = false,
  error,
  onExerciseSelect,
  onLoadMore,
  hasMore = false,
  className,
  emptyMessage = 'No exercises found',
  gridCols = { mobile: 1, tablet: 2, desktop: 3 }
}: ExerciseGridProps) {
  const gridRef = useRef<Grid>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Determine grid columns based on window width
  const getColumnCount = (width: number) => {
    if (width < 640) return gridCols.mobile
    if (width < 1024) return gridCols.tablet
    return gridCols.desktop
  }

  // Cell renderer
  const Cell = ({ columnIndex, rowIndex, style, data }: {
    columnIndex: number
    rowIndex: number
    style: CSSProperties
    data: { exercises: Exercise[]; columnCount: number; onSelect?: (exercise: Exercise) => void }
  }) => {
    const { exercises, columnCount, onSelect } = data
    const index = rowIndex * columnCount + columnIndex
    const exercise = exercises[index]

    if (!exercise) return null

    return (
      <div style={style}>
        <GridExerciseCard
          exercise={exercise}
          onClick={() => onSelect?.(exercise)}
        />
      </div>
    )
  }

  // Handle scroll for infinite loading
  const handleScroll = useCallback(({ scrollTop, scrollHeight, clientHeight }: {
    scrollTop: number
    scrollHeight: number
    clientHeight: number
  }) => {
    if (
      onLoadMore &&
      hasMore &&
      !loading &&
      scrollHeight - scrollTop - clientHeight < 200
    ) {
      onLoadMore()
    }
  }, [onLoadMore, hasMore, loading])

  // Loading state
  if (loading && exercises.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#FF375F] animate-spin mx-auto mb-4" />
          <p className="text-[#A1A1A3]">Loading exercises...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-white font-medium mb-2">Failed to load exercises</p>
          <p className="text-[#A1A1A3] text-sm">{error}</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (exercises.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <div className="text-center">
          <Search className="w-8 h-8 text-[#A1A1A3] mx-auto mb-4" />
          <p className="text-white font-medium mb-2">{emptyMessage}</p>
          <p className="text-[#A1A1A3] text-sm">Try adjusting your filters or search query</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative h-full', className)} ref={containerRef}>
      <AutoSizer>
        {({ height, width }) => {
          const columnCount = getColumnCount(width)
          const rowCount = Math.ceil(exercises.length / columnCount)
          const columnWidth = width / columnCount
          const rowHeight = 200 // Adjust based on card content

          return (
            <>
              <Grid
                ref={gridRef}
                className="scrollbar-thin scrollbar-thumb-[#2C2C2E] scrollbar-track-transparent"
                columnCount={columnCount}
                columnWidth={() => columnWidth}
                height={height}
                rowCount={rowCount}
                rowHeight={() => rowHeight}
                width={width}
                itemData={{
                  exercises,
                  columnCount,
                  onSelect: onExerciseSelect
                }}
                onScroll={({ scrollTop }) => {
                  handleScroll({
                    scrollTop,
                    scrollHeight: rowCount * rowHeight,
                    clientHeight: height
                  })
                }}
              >
                {Cell}
              </Grid>

              {/* Loading more indicator */}
              {loading && exercises.length > 0 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg px-4 py-2 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#FF375F]" />
                    <span className="text-sm text-[#A1A1A3]">Loading more...</span>
                  </div>
                </div>
              )}
            </>
          )
        }}
      </AutoSizer>
    </div>
  )
}

// List view for mobile
export function ExerciseList({
  exercises,
  loading = false,
  error,
  onExerciseSelect,
  onLoadMore,
  hasMore = false,
  className,
  emptyMessage = 'No exercises found'
}: ExerciseGridProps) {
  const observerRef = useRef<IntersectionObserver>()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Infinite scroll observer
  useEffect(() => {
    if (!onLoadMore || !hasMore) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [onLoadMore, hasMore, loading])

  // Error and empty states same as grid
  if (loading && exercises.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#FF375F] animate-spin mx-auto mb-4" />
          <p className="text-[#A1A1A3]">Loading exercises...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-white font-medium mb-2">Failed to load exercises</p>
          <p className="text-[#A1A1A3] text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <div className="text-center">
          <Search className="w-8 h-8 text-[#A1A1A3] mx-auto mb-4" />
          <p className="text-white font-medium mb-2">{emptyMessage}</p>
          <p className="text-[#A1A1A3] text-sm">Try adjusting your filters or search query</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          name={exercise.name}
          equipment={exercise.equipment}
          category={exercise.category}
          onClick={() => onExerciseSelect?.(exercise)}
        />
      ))}

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-4 text-center">
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-[#FF375F] mx-auto" />
          ) : (
            <span className="text-sm text-[#A1A1A3]">Scroll for more</span>
          )}
        </div>
      )}
    </div>
  )
}