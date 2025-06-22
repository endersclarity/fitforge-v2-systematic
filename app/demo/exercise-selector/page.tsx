/**
 * Exercise Selector Demo Page
 * Demonstrates the ExerciseSelector component in various modes
 */

'use client'

import React, { useState } from 'react'
import { ExerciseSelector } from '@/components/exercise/ExerciseSelector'
import { Exercise } from '@/schemas/typescript-interfaces'
import { Button } from '@/components/ui/button'

export default function ExerciseSelectorDemo() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [multipleExercises, setMultipleExercises] = useState<Exercise[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [pickerMode, setPickerMode] = useState<'single' | 'multiple'>('single')

  const handleSingleSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setShowPicker(false)
  }

  const handleMultipleSelect = (exercise: Exercise) => {
    setMultipleExercises(prev => {
      const exists = prev.find(e => e.id === exercise.id)
      if (exists) {
        return prev.filter(e => e.id !== exercise.id)
      }
      return [...prev, exercise]
    })
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Demo controls */}
      <div className="p-6 border-b border-[#2C2C2E]">
        <h1 className="text-2xl font-bold text-white mb-6">Exercise Selector Demo</h1>
        
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => {
              setPickerMode('single')
              setShowPicker(true)
            }}
            className="bg-[#FF375F] hover:bg-[#FF375F]/90"
          >
            Open Single Selection Picker
          </Button>
          
          <Button
            onClick={() => {
              setPickerMode('multiple')
              setShowPicker(true)
            }}
            className="bg-[#FF375F] hover:bg-[#FF375F]/90"
          >
            Open Multiple Selection Picker
          </Button>
        </div>

        {/* Selected exercises display */}
        <div className="mt-6 space-y-4">
          {selectedExercise && (
            <div className="bg-[#1C1C1E] rounded-lg p-4">
              <h3 className="text-sm font-medium text-[#A1A1A3] mb-2">
                Selected Exercise (Single):
              </h3>
              <p className="text-white font-semibold">{selectedExercise.name}</p>
              <p className="text-sm text-[#A1A1A3]">
                {selectedExercise.equipment} • {selectedExercise.category}
              </p>
            </div>
          )}

          {multipleExercises.length > 0 && (
            <div className="bg-[#1C1C1E] rounded-lg p-4">
              <h3 className="text-sm font-medium text-[#A1A1A3] mb-2">
                Selected Exercises (Multiple):
              </h3>
              <ul className="space-y-2">
                {multipleExercises.map(exercise => (
                  <li key={exercise.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{exercise.name}</p>
                      <p className="text-xs text-[#A1A1A3]">
                        {exercise.equipment} • {exercise.category}
                      </p>
                    </div>
                    <button
                      onClick={() => handleMultipleSelect(exercise)}
                      className="text-xs text-red-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Standalone mode demo */}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Standalone Mode</h2>
        <div className="h-[600px] bg-[#1C1C1E] rounded-xl overflow-hidden">
          <ExerciseSelector
            mode="standalone"
            className="h-full"
          />
        </div>
      </div>

      {/* Picker modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[80vh] bg-[#121212] rounded-xl overflow-hidden shadow-2xl">
            <ExerciseSelector
              mode="picker"
              onSelect={pickerMode === 'single' ? handleSingleSelect : handleMultipleSelect}
              selectedExercises={pickerMode === 'multiple' ? multipleExercises : []}
              allowMultiple={pickerMode === 'multiple'}
              maxSelections={pickerMode === 'multiple' ? 5 : undefined}
              onClose={() => setShowPicker(false)}
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}