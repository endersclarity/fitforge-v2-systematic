/**
 * Exercise Selector Component
 * Main component for searching and selecting exercises
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Exercise } from '@/schemas/typescript-interfaces'
import { useExerciseSearch } from '@/hooks/useExerciseSearch'
import { ExerciseFilters } from './ExerciseFilters'
import { ExerciseGrid, ExerciseList } from './ExerciseGrid'
import { ExerciseEngagementDetailed } from './ExerciseEngagementChart'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  X, 
  Mic, 
  Filter, 
  ArrowLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  Info
} from 'lucide-react'

interface ExerciseSelectorProps {
  onSelect?: (exercise: Exercise) => void
  selectedExercises?: Exercise[]
  mode?: 'standalone' | 'picker'
  className?: string
  allowMultiple?: boolean
  maxSelections?: number
  onClose?: () => void
}

export function ExerciseSelector({
  onSelect,
  selectedExercises = [],
  mode = 'standalone',
  className,
  allowMultiple = false,
  maxSelections,
  onClose
}: ExerciseSelectorProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Initialize search hook
  const {
    exercises,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    searchSuggestions,
    filters,
    setFilters,
    clearFilters,
    activeFilterCount,
    hasMore,
    loadMore,
    refresh,
    recentExercises,
    frequentExercises,
    isSearching
  } = useExerciseSearch({
    pageSize: 24,
    enableCache: true,
    enableRecent: true,
    enableFrequent: true
  })

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle exercise selection
  const handleExerciseSelect = useCallback((exercise: Exercise) => {
    if (mode === 'picker' && !allowMultiple) {
      // Single selection picker mode
      onSelect?.(exercise)
      onClose?.()
    } else if (mode === 'picker' && allowMultiple) {
      // Multiple selection picker mode
      if (maxSelections && selectedExercises.length >= maxSelections) {
        // Show max selection reached message
        return
      }
      onSelect?.(exercise)
    } else {
      // Standalone mode - show details
      setSelectedExercise(exercise)
    }
  }, [mode, allowMultiple, maxSelections, selectedExercises.length, onSelect, onClose])

  // Handle search clear
  const handleClearSearch = () => {
    setSearchQuery('')
    searchInputRef.current?.focus()
  }

  // Handle voice search (placeholder)
  const handleVoiceSearch = () => {
    console.log('Voice search not implemented yet')
  }

  // Render search bar
  const renderSearchBar = () => (
    <div className="relative">
      <div className={cn(
        'relative flex items-center gap-2 bg-[#1C1C1E] border rounded-lg transition-all',
        searchFocused ? 'border-[#FF375F]' : 'border-[#2C2C2E]'
      )}>
        <Search className="w-5 h-5 text-[#A1A1A3] ml-3" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search exercises..."
          className="flex-1 bg-transparent text-white placeholder-[#A1A1A3] py-3 pr-3 outline-none"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="p-2 hover:bg-[#2C2C2E] rounded transition-colors"
          >
            <X className="w-4 h-4 text-[#A1A1A3]" />
          </button>
        )}
        {isMobile && (
          <button
            onClick={handleVoiceSearch}
            className="p-2 hover:bg-[#2C2C2E] rounded transition-colors mr-2"
          >
            <Mic className="w-4 h-4 text-[#A1A1A3]" />
          </button>
        )}
      </div>

      {/* Search suggestions */}
      {searchFocused && searchSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          {searchSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setSearchQuery(suggestion)
                setSearchFocused(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-[#A1A1A3] hover:bg-[#2C2C2E] hover:text-white transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  // Render special collections (recent/frequent)
  const renderCollections = () => {
    if (isSearching || activeFilterCount > 0) return null

    return (
      <div className="space-y-4 mb-6">
        {/* Recent exercises */}
        {recentExercises.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#A1A1A3]" />
              <h3 className="text-sm font-medium text-white">Recently Used</h3>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {recentExercises.map(exercise => (
                <button
                  key={exercise.id}
                  onClick={() => handleExerciseSelect(exercise)}
                  className="flex-shrink-0 px-3 py-2 bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg hover:bg-[#2C2C2E] transition-colors"
                >
                  <p className="text-sm text-white whitespace-nowrap">{exercise.name}</p>
                  <p className="text-xs text-[#A1A1A3] whitespace-nowrap">
                    {exercise.equipment}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Frequent exercises */}
        {frequentExercises.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[#A1A1A3]" />
              <h3 className="text-sm font-medium text-white">Frequently Used</h3>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {frequentExercises.slice(0, 8).map(exercise => (
                <button
                  key={exercise.id}
                  onClick={() => handleExerciseSelect(exercise)}
                  className="flex-shrink-0 px-3 py-2 bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg hover:bg-[#2C2C2E] transition-colors"
                >
                  <p className="text-sm text-white whitespace-nowrap">{exercise.name}</p>
                  <p className="text-xs text-[#A1A1A3] whitespace-nowrap">
                    {exercise.equipment}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render exercise details (standalone mode)
  if (selectedExercise && mode === 'standalone') {
    return (
      <div className={cn('bg-[#121212] h-full flex flex-col', className)}>
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-[#2C2C2E]">
          <button
            onClick={() => setSelectedExercise(null)}
            className="p-2 hover:bg-[#1C1C1E] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-xl font-semibold text-white flex-1">
            {selectedExercise.name}
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Basic info */}
          <div className="bg-[#1C1C1E] rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-[#A1A1A3]">Equipment</span>
              <span className="text-white font-medium">{selectedExercise.equipment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A1A1A3]">Category</span>
              <span className="text-white font-medium">{selectedExercise.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A1A1A3]">Difficulty</span>
              <span className="text-white font-medium">{selectedExercise.difficulty}</span>
            </div>
            {selectedExercise.is_compound && (
              <div className="flex justify-between">
                <span className="text-[#A1A1A3]">Type</span>
                <span className="text-white font-medium">Compound</span>
              </div>
            )}
          </div>

          {/* Muscle engagement */}
          <div className="bg-[#1C1C1E] rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Muscle Engagement</h3>
            <ExerciseEngagementDetailed muscleEngagement={selectedExercise.muscle_engagement} />
          </div>

          {/* Instructions */}
          {selectedExercise.instructions && selectedExercise.instructions.length > 0 && (
            <div className="bg-[#1C1C1E] rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Instructions</h3>
              <ol className="space-y-2">
                {selectedExercise.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-[#FF375F] font-medium">{index + 1}.</span>
                    <span className="text-[#A1A1A3]">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Tips */}
          {selectedExercise.setup_tips && selectedExercise.setup_tips.length > 0 && (
            <div className="bg-[#1C1C1E] rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Setup Tips</h3>
              <ul className="space-y-2">
                {selectedExercise.setup_tips.map((tip, index) => (
                  <li key={index} className="flex gap-3">
                    <Info className="w-4 h-4 text-[#FF375F] flex-shrink-0 mt-0.5" />
                    <span className="text-[#A1A1A3]">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action button */}
        {onSelect && (
          <div className="p-4 border-t border-[#2C2C2E]">
            <Button
              onClick={() => {
                onSelect(selectedExercise)
                setSelectedExercise(null)
              }}
              className="w-full bg-[#FF375F] hover:bg-[#FF375F]/90"
            >
              Select Exercise
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Main selector view
  return (
    <div className={cn('bg-[#121212] h-full flex flex-col', className)}>
      {/* Header */}
      <div className="p-4 border-b border-[#2C2C2E]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            {mode === 'picker' ? 'Select Exercise' : 'Exercise Library'}
          </h2>
          {mode === 'picker' && onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#1C1C1E] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#A1A1A3]" />
            </button>
          )}
        </div>

        {/* Search bar */}
        {renderSearchBar()}

        {/* Filter toggle for mobile */}
        {isMobile && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'mt-3 w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors',
              'bg-[#1C1C1E] hover:bg-[#2C2C2E]',
              activeFilterCount > 0 && 'border border-[#FF375F]'
            )}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#A1A1A3]" />
              <span className="text-sm text-white">Filters</span>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 bg-[#FF375F] text-white text-xs rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <ChevronRight className={cn(
              'w-4 h-4 text-[#A1A1A3] transition-transform',
              showFilters && 'rotate-90'
            )} />
          </button>
        )}

        {/* Desktop filters */}
        {!isMobile && (
          <div className="mt-4">
            <ExerciseFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
              activeCount={activeFilterCount}
            />
          </div>
        )}
      </div>

      {/* Mobile filter panel */}
      {isMobile && showFilters && (
        <div className="border-b border-[#2C2C2E]">
          <ExerciseFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
            activeCount={activeFilterCount}
            isMobile
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
        {/* Collections */}
        {renderCollections()}

        {/* Exercise grid/list */}
        {isMobile ? (
          <ExerciseList
            exercises={exercises}
            loading={loading}
            error={error}
            onExerciseSelect={handleExerciseSelect}
            onLoadMore={loadMore}
            hasMore={hasMore}
            className="h-full"
          />
        ) : (
          <ExerciseGrid
            exercises={exercises}
            loading={loading}
            error={error}
            onExerciseSelect={handleExerciseSelect}
            onLoadMore={loadMore}
            hasMore={hasMore}
            className="h-full"
          />
        )}
      </div>

      {/* Selection footer for picker mode */}
      {mode === 'picker' && allowMultiple && selectedExercises.length > 0 && (
        <div className="p-4 border-t border-[#2C2C2E]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#A1A1A3]">
              {selectedExercises.length} exercise{selectedExercises.length !== 1 ? 's' : ''} selected
              {maxSelections && ` (max ${maxSelections})`}
            </span>
            <Button
              onClick={onClose}
              className="bg-[#FF375F] hover:bg-[#FF375F]/90"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}