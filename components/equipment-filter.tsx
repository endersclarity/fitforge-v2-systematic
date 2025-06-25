'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EquipmentType, EQUIPMENT_OPTIONS } from '@/schemas/typescript-interfaces'
import { 
  saveAvailableEquipment, 
  loadAvailableEquipment,
  getEquipmentPreset,
  EQUIPMENT_PRESETS 
} from '@/lib/equipment-filter'

interface EquipmentFilterProps {
  onEquipmentChange: (availableEquipment: EquipmentType[]) => void
  onSortChange: (sortBy: 'alphabetical' | 'most_logged') => void
  className?: string
}

export function EquipmentFilter({ 
  onEquipmentChange, 
  onSortChange, 
  className = '' 
}: EquipmentFilterProps) {
  const [isEquipmentFilterEnabled, setIsEquipmentFilterEnabled] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType[]>([])
  const [sortBy, setSortBy] = useState<'alphabetical' | 'most_logged'>('alphabetical')
  const [showEquipmentSelection, setShowEquipmentSelection] = useState(false)

  // Load saved equipment preferences on mount
  useEffect(() => {
    const savedEquipment = loadAvailableEquipment()
    if (savedEquipment.length > 0) {
      setSelectedEquipment(savedEquipment)
      setIsEquipmentFilterEnabled(true)
      onEquipmentChange(savedEquipment)
    }
  }, [])

  const handleEquipmentToggle = (enabled: boolean) => {
    setIsEquipmentFilterEnabled(enabled)
    
    if (enabled) {
      // If no equipment selected, show selection UI
      if (selectedEquipment.length === 0) {
        setShowEquipmentSelection(true)
      } else {
        // Use previously selected equipment
        onEquipmentChange(selectedEquipment)
      }
    } else {
      // Disable filtering - show all exercises
      onEquipmentChange([])
      setShowEquipmentSelection(false)
    }
  }

  const handleEquipmentSelection = (equipment: EquipmentType, selected: boolean) => {
    const updated = selected 
      ? [...selectedEquipment, equipment]
      : selectedEquipment.filter(e => e !== equipment)
    
    setSelectedEquipment(updated)
    saveAvailableEquipment(updated)
    
    if (isEquipmentFilterEnabled) {
      onEquipmentChange(updated)
    }
  }

  const handlePresetSelection = (presetName: keyof typeof EQUIPMENT_PRESETS) => {
    const preset = getEquipmentPreset(presetName)
    setSelectedEquipment(preset)
    saveAvailableEquipment(preset)
    
    if (isEquipmentFilterEnabled) {
      onEquipmentChange(preset)
    }
    
    setShowEquipmentSelection(false)
  }

  const handleSortChange = (newSort: 'alphabetical' | 'most_logged') => {
    setSortBy(newSort)
    onSortChange(newSort)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter by Available Equipment */}
      <Card className="bg-[#1C1C1E] border-[#2C2C2E]">
        <CardContent className="p-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#A1A1A3] uppercase tracking-wide">
              Filter by
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">🏋️</span>
                <span className="text-white font-medium">Your available equipment</span>
              </div>
              <Switch
                checked={isEquipmentFilterEnabled}
                onCheckedChange={handleEquipmentToggle}
                className="data-[state=checked]:bg-[#FF375F]"
              />
            </div>
            
            {isEquipmentFilterEnabled && (
              <div className="text-sm text-[#A1A1A3]">
                {selectedEquipment.length === 0 
                  ? "No equipment selected - tap to choose"
                  : `${selectedEquipment.length} equipment type${selectedEquipment.length === 1 ? '' : 's'} selected`
                }
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowEquipmentSelection(!showEquipmentSelection)}
                  className="ml-2 text-[#FF375F] hover:text-[#E63050] p-0 h-auto"
                >
                  {showEquipmentSelection ? 'Hide' : 'Edit'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Equipment Selection (shown when needed) */}
      {showEquipmentSelection && (
        <Card className="bg-[#1C1C1E] border-[#2C2C2E]">
          <CardContent className="p-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white">Select Your Available Equipment</h4>
              
              {/* Quick Presets */}
              <div className="space-y-2">
                <p className="text-xs text-[#A1A1A3] uppercase tracking-wide">Quick Presets</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetSelection('HOME_BASIC')}
                    className="bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white border-[#3C3C3E] text-xs"
                  >
                    🏠 Home Basic
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetSelection('GYM_FULL')}
                    className="bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white border-[#3C3C3E] text-xs"
                  >
                    🏋️ Full Gym
                  </Button>
                </div>
              </div>
              
              {/* Individual Equipment Selection */}
              <div className="space-y-2">
                <p className="text-xs text-[#A1A1A3] uppercase tracking-wide">Individual Equipment</p>
                <div className="space-y-2">
                  {EQUIPMENT_OPTIONS.map((equipment) => (
                    <div key={equipment} className="flex items-center justify-between">
                      <span className="text-white text-sm">{equipment}</span>
                      <Switch
                        checked={selectedEquipment.includes(equipment)}
                        onCheckedChange={(checked) => handleEquipmentSelection(equipment, checked)}
                        className="data-[state=checked]:bg-[#FF375F]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort by Options */}
      <Card className="bg-[#1C1C1E] border-[#2C2C2E]">
        <CardContent className="p-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#A1A1A3] uppercase tracking-wide">
              Sort by
            </h3>
            
            <div className="space-y-2">
              <button
                onClick={() => handleSortChange('alphabetical')}
                className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${
                  sortBy === 'alphabetical' 
                    ? 'bg-[#2C2C2E] text-white' 
                    : 'text-[#A1A1A3] hover:text-white hover:bg-[#2C2C2E]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🔤</span>
                  <span className="font-medium">Alphabetically</span>
                </div>
                {sortBy === 'alphabetical' && (
                  <div className="w-4 h-4 rounded-full bg-[#FF375F]" />
                )}
              </button>
              
              <button
                onClick={() => handleSortChange('most_logged')}
                className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${
                  sortBy === 'most_logged' 
                    ? 'bg-[#2C2C2E] text-white' 
                    : 'text-[#A1A1A3] hover:text-white hover:bg-[#2C2C2E]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">📊</span>
                  <span className="font-medium">Most Logged</span>
                </div>
                {sortBy === 'most_logged' && (
                  <div className="w-4 h-4 rounded-full bg-[#FF375F]" />
                )}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}