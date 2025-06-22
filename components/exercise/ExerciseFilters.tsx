/**
 * Exercise Filters Component
 * Filter controls with mobile optimization
 */

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ExerciseFilters as Filters } from '@/hooks/useExerciseSearch'
import { Button } from '@/components/ui/button'
import { X, Filter, ChevronDown } from 'lucide-react'

interface ExerciseFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onClearFilters: () => void
  activeCount: number
  className?: string
  isMobile?: boolean
}

// Filter options (in production, these would come from the API)
const EQUIPMENT_OPTIONS = [
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Kettlebell',
  'Band',
  'TRX',
  'Medicine Ball',
  'Plate'
]

const MUSCLE_GROUP_OPTIONS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Quadriceps',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Core',
  'Forearms'
]

const DIFFICULTY_OPTIONS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' }
]

const MOVEMENT_PATTERN_OPTIONS = [
  'Push',
  'Pull',
  'Squat',
  'Hinge',
  'Lunge',
  'Carry',
  'Rotation'
]

interface FilterChipProps {
  label: string
  value: string | boolean | undefined
  options?: Array<string | { value: string; label: string }>
  onChange: (value: string | boolean | undefined) => void
  type?: 'select' | 'toggle'
}

function FilterChip({ label, value, options, onChange, type = 'select' }: FilterChipProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (newValue: string) => {
    onChange(value === newValue ? undefined : newValue)
    setIsOpen(false)
  }

  const handleToggle = () => {
    onChange(!value)
  }

  const isActive = value !== undefined && value !== ''

  if (type === 'toggle') {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
          'border border-[#2C2C2E]',
          isActive
            ? 'bg-[#FF375F] text-white border-[#FF375F]'
            : 'bg-[#1C1C1E] text-[#A1A1A3] hover:bg-[#2C2C2E]'
        )}
      >
        {label}
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
          'border border-[#2C2C2E] flex items-center gap-1',
          isActive
            ? 'bg-[#FF375F] text-white border-[#FF375F]'
            : 'bg-[#1C1C1E] text-[#A1A1A3] hover:bg-[#2C2C2E]'
        )}
      >
        {label}
        {isActive && value !== true && <span className="text-xs">: {value}</span>}
        <ChevronDown className={cn('w-3 h-3 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && options && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 z-50 min-w-[150px] max-h-[300px] overflow-y-auto bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg shadow-xl">
            {options.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value
              const optionLabel = typeof option === 'string' ? option : option.label
              const isSelected = value === optionValue

              return (
                <button
                  key={optionValue}
                  onClick={() => handleSelect(optionValue)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm transition-colors',
                    isSelected
                      ? 'bg-[#FF375F] text-white'
                      : 'text-[#A1A1A3] hover:bg-[#2C2C2E] hover:text-white'
                  )}
                >
                  {optionLabel}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export function ExerciseFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  activeCount,
  className,
  isMobile = false
}: ExerciseFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof Filters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  // Mobile bottom sheet view
  if (isMobile) {
    return (
      <div className={cn('bg-[#121212] border-t border-[#2C2C2E]', className)}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Filters</h3>
            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-[#FF375F]"
              >
                Clear all ({activeCount})
              </Button>
            )}
          </div>

          {/* Scrollable filter area */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Primary filters */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#A1A1A3]">Equipment</h4>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_OPTIONS.slice(0, 6).map(equipment => (
                  <FilterChip
                    key={equipment}
                    label={equipment}
                    value={filters.equipment}
                    options={[equipment]}
                    onChange={(val) => updateFilter('equipment', val === equipment ? undefined : equipment)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#A1A1A3]">Muscle Group</h4>
              <div className="flex flex-wrap gap-2">
                {MUSCLE_GROUP_OPTIONS.slice(0, 6).map(muscle => (
                  <FilterChip
                    key={muscle}
                    label={muscle}
                    value={filters.muscleGroup}
                    options={[muscle]}
                    onChange={(val) => updateFilter('muscleGroup', val === muscle ? undefined : muscle)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#A1A1A3]">Difficulty</h4>
              <div className="flex gap-2">
                {DIFFICULTY_OPTIONS.map(({ value, label }) => (
                  <FilterChip
                    key={value}
                    label={label}
                    value={filters.difficulty}
                    options={[value]}
                    onChange={(val) => updateFilter('difficulty', val === value ? undefined : value)}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <FilterChip
                label="Compound Only"
                value={filters.isCompound}
                onChange={(val) => updateFilter('isCompound', val)}
                type="toggle"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Desktop view
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#A1A1A3]" />
          <span className="text-sm font-medium text-white">Filters</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-[#FF375F] text-white text-xs rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-xs text-[#FF375F] hover:text-red-400 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter chips - horizontal scrolling on smaller screens */}
      <div className="flex flex-wrap gap-2">
        <FilterChip
          label="Equipment"
          value={filters.equipment}
          options={EQUIPMENT_OPTIONS}
          onChange={(val) => updateFilter('equipment', val)}
        />
        
        <FilterChip
          label="Muscle Group"
          value={filters.muscleGroup}
          options={MUSCLE_GROUP_OPTIONS}
          onChange={(val) => updateFilter('muscleGroup', val)}
        />
        
        <FilterChip
          label="Difficulty"
          value={filters.difficulty}
          options={DIFFICULTY_OPTIONS}
          onChange={(val) => updateFilter('difficulty', val)}
        />
        
        <FilterChip
          label="Compound"
          value={filters.isCompound}
          onChange={(val) => updateFilter('isCompound', val)}
          type="toggle"
        />

        {/* Advanced filters toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all border border-[#2C2C2E] bg-[#1C1C1E] text-[#A1A1A3] hover:bg-[#2C2C2E]"
        >
          {showAdvanced ? 'Less' : 'More'} filters
        </button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#2C2C2E]">
          <FilterChip
            label="Movement"
            value={filters.movementPattern}
            options={MOVEMENT_PATTERN_OPTIONS}
            onChange={(val) => updateFilter('movementPattern', val)}
          />
          
          <FilterChip
            label="Variation"
            value={filters.variation}
            options={['A', 'B', 'A/B']}
            onChange={(val) => updateFilter('variation', val)}
          />
        </div>
      )}

      {/* Active filters summary */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-[#2C2C2E]">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null
            
            const label = key === 'isCompound' ? 'Compound' :
                         key === 'muscleGroup' ? 'Muscle' :
                         key.charAt(0).toUpperCase() + key.slice(1)
            
            return (
              <div
                key={key}
                className="flex items-center gap-1 px-2 py-1 bg-[#2C2C2E] rounded-lg text-xs"
              >
                <span className="text-[#A1A1A3]">{label}:</span>
                <span className="text-white">
                  {typeof value === 'boolean' ? 'Yes' : value}
                </span>
                <button
                  onClick={() => updateFilter(key as keyof Filters, undefined)}
                  className="ml-1 text-[#A1A1A3] hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}