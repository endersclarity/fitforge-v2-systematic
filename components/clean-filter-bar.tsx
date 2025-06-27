'use client'

import { useState, useEffect } from 'react'
import { FilterDropdown } from './filter-dropdown'
import { SortDropdown } from './sort-dropdown'
import { EQUIPMENT_OPTIONS } from '@/schemas/typescript-interfaces'
import exercisesData from '@/data/exercises-real.json'
import { 
  MUSCLE_DISPLAY_MAP, 
  DISPLAY_TO_DATA_MAP,
  getUniqueMuscleGroups 
} from '@/lib/muscle-name-constants'

interface CleanFilterBarProps {
  onFilterChange: (filters: FilterState) => void
  className?: string
}

export interface FilterState {
  equipment: string[]
  targetMuscle: string[]
  group: string[]
  fatigueSort: 'all' | 'fresh' | 'fatigued'
}

// Extract unique muscle groups from exercise data
function getMuscleDisplayNames(): string[] {
  const muscleDataNames = new Set<string>()
  
  // Get all unique muscle names from exercise data
  exercisesData.forEach(exercise => {
    if (exercise.muscleEngagement) {
      Object.keys(exercise.muscleEngagement).forEach(muscle => {
        muscleDataNames.add(muscle)
      })
    }
  })
  
  // Convert to display names for UI
  const displayNames = Array.from(muscleDataNames)
    .filter(muscle => MUSCLE_DISPLAY_MAP[muscle]) // Only include mapped muscles
    .map(muscle => MUSCLE_DISPLAY_MAP[muscle])
    .filter((name, index, self) => self.indexOf(name) === index) // Remove duplicates
    .sort()
  
  return displayNames
}

export function CleanFilterBar({ onFilterChange, className = '' }: CleanFilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    equipment: [],
    targetMuscle: [],
    group: [],
    fatigueSort: 'all'
  })

  const muscleDisplayNames = getMuscleDisplayNames()
  console.log('Muscle display names:', muscleDisplayNames)
  const groupOptions = ['Push', 'Pull', 'Legs', 'Abs']
  const fatigueSortOptions = [
    { value: 'fresh', label: 'Fresh Muscles First' },
    { value: 'fatigued', label: 'Fatigued Muscles First' },
    { value: 'all', label: 'All (Default Order)' }
  ]

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  const handleEquipmentChange = (selected: string[]) => {
    setFilters(prev => ({ ...prev, equipment: selected }))
  }

  const handleMuscleChange = (selectedDisplayNames: string[]) => {
    console.log('Muscle filter selected (display names):', selectedDisplayNames)
    // Convert display names back to data names for the filter state
    const dataNames = selectedDisplayNames.map(displayName => 
      DISPLAY_TO_DATA_MAP[displayName] || displayName
    )
    console.log('Muscle filter converted (data names):', dataNames)
    setFilters(prev => ({ ...prev, targetMuscle: dataNames }))
  }

  const handleGroupChange = (selected: string[]) => {
    setFilters(prev => ({ ...prev, group: selected }))
  }

  const handleFatigueSortChange = (value: string) => {
    setFilters(prev => ({ ...prev, fatigueSort: value as FilterState['fatigueSort'] }))
  }

  return (
    <div className={`bg-[#121212] border-b border-[#2C2C2E] p-4 ${className}`}>
      <div className="flex items-center space-x-4 overflow-x-auto">
        <FilterDropdown
          label="Equipment"
          options={EQUIPMENT_OPTIONS}
          selectedOptions={filters.equipment}
          onSelectionChange={handleEquipmentChange}
        />
        
        <FilterDropdown
          label="Target Muscle"
          options={muscleDisplayNames}
          selectedOptions={filters.targetMuscle.map(dataName => 
            MUSCLE_DISPLAY_MAP[dataName] || dataName
          )}
          onSelectionChange={handleMuscleChange}
        />
        
        <FilterDropdown
          label="Group"
          options={groupOptions}
          selectedOptions={filters.group}
          onSelectionChange={handleGroupChange}
        />
        
        <SortDropdown
          label="Fatigue"
          options={fatigueSortOptions}
          selectedValue={filters.fatigueSort}
          onValueChange={handleFatigueSortChange}
          disabled={true}
        />
      </div>
      
      {/* Active Filter Summary */}
      {(filters.equipment.length > 0 || filters.targetMuscle.length > 0 || filters.group.length > 0 || filters.fatigueSort !== 'all') && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-[#A1A1A3]">
            <span>Active filters:</span>
            {filters.equipment.length > 0 && (
              <span className="bg-[#FF375F]/20 text-[#FF375F] px-2 py-1 rounded">
                {filters.equipment.length} Equipment
              </span>
            )}
            {filters.targetMuscle.length > 0 && (
              <span className="bg-[#FF375F]/20 text-[#FF375F] px-2 py-1 rounded">
                {filters.targetMuscle.length} Muscle
              </span>
            )}
            {filters.group.length > 0 && (
              <span className="bg-[#FF375F]/20 text-[#FF375F] px-2 py-1 rounded">
                {filters.group.length} Group
              </span>
            )}
            {filters.fatigueSort !== 'all' && (
              <span className="bg-[#FF375F]/20 text-[#FF375F] px-2 py-1 rounded">
                Fatigue Sort
              </span>
            )}
          </div>
          
          <button
            onClick={() => setFilters({ equipment: [], targetMuscle: [], group: [], fatigueSort: 'all' })}
            className="text-xs text-[#FF375F] hover:text-[#E63050] transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  )
}