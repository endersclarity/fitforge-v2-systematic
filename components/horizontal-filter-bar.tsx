'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EquipmentFilter } from '@/components/equipment-filter'
import { EquipmentType } from '@/schemas/typescript-interfaces'

interface HorizontalFilterBarProps {
  onFilterChange: (filter: FilterState) => void
  className?: string
}

export interface FilterState {
  type: 'all' | 'equipment' | 'target_muscle' | 'available_equipment' | 'muscle_fatigue'
  availableEquipment?: EquipmentType[]
  targetMuscle?: string
  muscleFatigue?: 'ascending' | 'descending'
}

export function HorizontalFilterBar({ onFilterChange, className = '' }: HorizontalFilterBarProps) {
  const [activeFilter, setActiveFilter] = useState<FilterState['type']>('all')
  const [showEquipmentPanel, setShowEquipmentPanel] = useState(false)

  const filterOptions = [
    { id: 'all', label: 'All', icon: '🔍' },
    { id: 'equipment', label: 'Equipment', icon: '🏋️', disabled: true },
    { id: 'target_muscle', label: 'Target Muscle', icon: '🎯', disabled: true },
    { id: 'available_equipment', label: 'Available Equipment', icon: '✅' },
    { id: 'muscle_fatigue', label: 'Muscle Fatigue', icon: '⚡', disabled: true, beta: true }
  ] as const

  const handleFilterSelect = (filterId: FilterState['type']) => {
    setActiveFilter(filterId)
    
    if (filterId === 'available_equipment') {
      setShowEquipmentPanel(true)
    } else {
      setShowEquipmentPanel(false)
      onFilterChange({ type: filterId })
    }
  }

  const handleEquipmentChange = (availableEquipment: EquipmentType[]) => {
    onFilterChange({ 
      type: 'available_equipment', 
      availableEquipment 
    })
  }

  const handleSortChange = (sortBy: 'alphabetical' | 'most_logged') => {
    // Future: Could tie into muscle fatigue sorting
  }

  return (
    <div className={`bg-[#121212] border-b border-[#2C2C2E] ${className}`}>
      {/* Horizontal Filter Tabs */}
      <div className="px-4 py-3">
        <div className="flex space-x-2 overflow-x-auto">
          {filterOptions.map((option) => (
            <Button
              key={option.id}
              variant="ghost"
              size="sm"
              disabled={option.disabled}
              onClick={() => handleFilterSelect(option.id as FilterState['type'])}
              className={`
                flex items-center space-x-2 whitespace-nowrap px-4 py-2 rounded-full transition-all
                ${activeFilter === option.id 
                  ? 'bg-[#FF375F] text-white shadow-lg' 
                  : 'bg-[#2C2C2E] text-[#A1A1A3] hover:bg-[#3C3C3E] hover:text-white'
                }
                ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span className="text-sm">{option.icon}</span>
              <span className="text-sm font-medium">{option.label}</span>
              {option.beta && (
                <span className="text-xs bg-[#FF375F]/20 text-[#FF375F] px-1.5 py-0.5 rounded-full">
                  BETA
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Equipment Filter Panel (Collapsible) */}
      {showEquipmentPanel && activeFilter === 'available_equipment' && (
        <div className="px-4 pb-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg p-4">
            <EquipmentFilter
              onEquipmentChange={handleEquipmentChange}
              onSortChange={handleSortChange}
              className="space-y-3"
            />
          </div>
        </div>
      )}

      {/* Filter Status Indicator */}
      {activeFilter !== 'all' && (
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#A1A1A3]">
              {activeFilter === 'available_equipment' && showEquipmentPanel
                ? 'Select your available equipment to filter exercises'
                : `Filtering by: ${filterOptions.find(f => f.id === activeFilter)?.label}`
              }
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveFilter('all')
                setShowEquipmentPanel(false)
                onFilterChange({ type: 'all' })
              }}
              className="text-xs text-[#FF375F] hover:text-[#E63050] p-0 h-auto"
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}