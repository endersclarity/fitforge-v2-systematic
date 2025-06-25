'use client'

import { useState, useEffect } from 'react'
import { FilterDropdown } from './filter-dropdown'
import { EQUIPMENT_OPTIONS } from '@/schemas/typescript-interfaces'
import exercisesData from '@/data/exercises-real.json'

interface CleanFilterBarProps {
  onFilterChange: (filters: FilterState) => void
  className?: string
}

export interface FilterState {
  equipment: string[]
  targetMuscle: string[]
  muscleFatigue: string[]
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
    muscleFatigue: []
  })

  const muscleGroups = getMuscleGroups()
  const fatigueOptions = ['Fresh', 'Moderately Fatigued', 'Highly Fatigued']

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

  const handleFatigueChange = (selected: string[]) => {
    setFilters(prev => ({ ...prev, muscleFatigue: selected }))
  }

  return (
    <div className={`bg-[#121212] border-b border-[#2C2C2E] p-4 ${className}`}>
      <div className="flex items-center space-x-4 overflow-visible">
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
          label="Muscle Fatigue"
          options={fatigueOptions}
          selectedOptions={filters.muscleFatigue}
          onSelectionChange={handleFatigueChange}
          disabled={true}
        />
      </div>
      
      {/* Active Filter Summary */}
      {(filters.equipment.length > 0 || filters.targetMuscle.length > 0 || filters.muscleFatigue.length > 0) && (
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
          </div>
          
          <button
            onClick={() => setFilters({ equipment: [], targetMuscle: [], muscleFatigue: [] })}
            className="text-xs text-[#FF375F] hover:text-[#E63050] transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  )
}