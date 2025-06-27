'use client'

import { useState, useEffect } from 'react'
import { FilterDropdown } from './filter-dropdown'
import { SortDropdown } from './sort-dropdown'
import { EQUIPMENT_OPTIONS } from '@/schemas/typescript-interfaces'
import exercisesData from '@/data/exercises-real.json'

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
function getMuscleGroups(): string[] {
  const muscleSet = new Set<string>()
  
  exercisesData.forEach(exercise => {
    if (exercise.muscleEngagement) {
      Object.keys(exercise.muscleEngagement).forEach(muscle => {
        // Convert scientific names to readable muscle groups
        const readable = muscle
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
        
        muscleSet.add(readable)
      })
    }
  })
  
  return Array.from(muscleSet).sort()
}

export function CleanFilterBar({ onFilterChange, className = '' }: CleanFilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    equipment: [],
    targetMuscle: [],
    group: [],
    fatigueSort: 'all'
  })

  const muscleGroups = getMuscleGroups()
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

  const handleMuscleChange = (selected: string[]) => {
    setFilters(prev => ({ ...prev, targetMuscle: selected }))
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
          options={muscleGroups}
          selectedOptions={filters.targetMuscle}
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