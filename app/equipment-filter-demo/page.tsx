'use client'

import { useState } from 'react'
import { EquipmentFilter } from '@/components/equipment-filter'
import { EquipmentType } from '@/schemas/typescript-interfaces'
import exercisesData from '@/data/exercises-real.json'
import { filterExercisesByEquipment } from '@/lib/equipment-filter'

export default function EquipmentFilterDemo() {
  const [availableEquipment, setAvailableEquipment] = useState<EquipmentType[]>([])
  const [sortBy, setSortBy] = useState<'alphabetical' | 'most_logged'>('alphabetical')

  // Cast exercise data to proper type (assuming it matches our interface)
  const exercises = exercisesData as any[]
  const filteredExercises = filterExercisesByEquipment(exercises, availableEquipment)
  
  // Sort exercises
  const sortedExercises = [...filteredExercises].sort((a, b) => {
    if (sortBy === 'alphabetical') {
      return a.name.localeCompare(b.name)
    }
    // For 'most_logged', we'll just sort by name for now (no logging data yet)
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Equipment Filter Demo</h1>
          <p className="text-[#A1A1A3]">
            Testing the equipment filtering component with Fitbod-style UI
          </p>
        </div>

        <EquipmentFilter
          onEquipmentChange={setAvailableEquipment}
          onSortChange={setSortBy}
        />

        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">
            Filtered Exercises ({sortedExercises.length} of {exercises.length})
          </h2>
          
          {availableEquipment.length > 0 && (
            <div className="mb-4 p-3 bg-[#2C2C2E] rounded-lg">
              <p className="text-sm text-[#A1A1A3] mb-2">Filtering by equipment:</p>
              <div className="flex flex-wrap gap-2">
                {availableEquipment.map(equipment => (
                  <span
                    key={equipment}
                    className="px-2 py-1 bg-[#FF375F] text-white text-xs rounded-full"
                  >
                    {equipment}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between p-3 bg-[#2C2C2E] rounded-lg hover:bg-[#3C3C3E] transition-colors"
              >
                <div>
                  <h3 className="font-medium text-white">{exercise.name}</h3>
                  <p className="text-sm text-[#A1A1A3]">
                    {exercise.equipment} • {exercise.difficulty}
                  </p>
                </div>
                <div className="text-xs text-[#A1A1A3] bg-[#1C1C1E] px-2 py-1 rounded">
                  {exercise.category}
                </div>
              </div>
            ))}
          </div>
          
          {sortedExercises.length === 0 && availableEquipment.length > 0 && (
            <div className="text-center py-8 text-[#A1A1A3]">
              <p>No exercises found for selected equipment.</p>
              <p className="text-sm mt-1">Try selecting different equipment types.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}