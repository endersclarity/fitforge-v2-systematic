'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Search, RefreshCw, Dumbbell } from "lucide-react"
import exercisesData from '@/data/exercises-real.json'

interface WorkoutExercise {
  id: string
  name: string
  category: string
  equipment: string
  difficulty: string
}

interface ExerciseReplacementModalProps {
  isOpen: boolean
  onClose: () => void
  onReplace: (newExercise: WorkoutExercise) => void
  currentExercise: WorkoutExercise
}

export function ExerciseReplacementModal({ 
  isOpen, 
  onClose, 
  onReplace, 
  currentExercise 
}: ExerciseReplacementModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<WorkoutExercise | null>(null)
  const [filteredExercises, setFilteredExercises] = useState<WorkoutExercise[]>([])

  // Filter exercises on mount and search term change
  useEffect(() => {
    if (!isOpen) return

    const exercises = exercisesData as WorkoutExercise[]
    let filtered = exercises.filter(exercise => exercise.id !== currentExercise.id)

    // If search term exists, filter by name
    if (searchTerm.trim()) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.equipment.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } else {
      // If no search term, prioritize same category
      const sameCategory = filtered.filter(ex => ex.category === currentExercise.category)
      const differentCategory = filtered.filter(ex => ex.category !== currentExercise.category)
      filtered = [...sameCategory, ...differentCategory]
    }

    // Limit to 20 results for performance
    setFilteredExercises(filtered.slice(0, 20))
  }, [searchTerm, currentExercise, isOpen])

  const handleReplace = () => {
    if (selectedExercise) {
      onReplace(selectedExercise)
      setSelectedExercise(null)
      setSearchTerm('')
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getCategoryColor = (category: string) => {
    if (category === currentExercise.category) {
      return 'bg-[#FF375F]/20 text-[#FF375F] border-[#FF375F]/30'
    }
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-[#1C1C1E] border-[#2C2C2E] w-full max-w-2xl max-h-[80vh] overflow-hidden" data-testid="replace-exercise-modal">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-[#FF375F]" />
              <CardTitle className="text-lg text-white">Replace Exercise</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-[#A1A1A3] hover:text-white hover:bg-[#2C2C2E]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-[#A1A1A3]">
            Replace "{currentExercise.name}" with a different exercise
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A1A1A3]" />
            <Input
              type="text"
              placeholder="Search exercises by name, category, or equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#2C2C2E] border-[#3C3C3E] text-white"
              data-testid="exercise-search"
            />
          </div>

          {/* Filter Info */}
          {!searchTerm && (
            <div className="p-3 bg-[#2C2C2E] rounded-lg border border-[#3C3C3E]">
              <p className="text-sm text-[#A1A1A3] flex items-center">
                <Dumbbell className="h-4 w-4 mr-2" />
                Showing {currentExercise.category} exercises first, then all others
              </p>
            </div>
          )}

          {/* Exercise List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#A1A1A3]">No exercises found</p>
                <p className="text-sm text-[#A1A1A3]">Try a different search term</p>
              </div>
            ) : (
              filteredExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => setSelectedExercise(exercise)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedExercise?.id === exercise.id
                      ? 'ring-2 ring-[#FF375F] bg-[#FF375F]/10 border-[#FF375F]'
                      : 'border-[#3C3C3E] hover:border-[#4C4C4E] bg-[#2C2C2E] hover:bg-[#3C3C3E]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{exercise.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getCategoryColor(exercise.category)}`}
                        >
                          {exercise.category}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getDifficultyColor(exercise.difficulty)}`}
                        >
                          {exercise.difficulty}
                        </Badge>
                        <span className="text-xs text-[#A1A1A3]">{exercise.equipment}</span>
                      </div>
                      {exercise.category === currentExercise.category && (
                        <p className="text-xs text-[#FF375F] mt-1">Same muscle group</p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Selected Exercise Display */}
          {selectedExercise && (
            <div className="p-4 bg-[#2C2C2E] rounded-lg border border-[#3C3C3E]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium mb-1">
                    Selected: {selectedExercise.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getCategoryColor(selectedExercise.category)}`}
                    >
                      {selectedExercise.category}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getDifficultyColor(selectedExercise.difficulty)}`}
                    >
                      {selectedExercise.difficulty}
                    </Badge>
                    <span className="text-xs text-[#A1A1A3]">{selectedExercise.equipment}</span>
                  </div>
                </div>
                <Badge className="bg-[#FF375F] text-white">
                  Ready to Replace
                </Badge>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-[#2C2C2E] border-[#3C3C3E] text-[#A1A1A3] hover:bg-[#3C3C3E] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReplace}
              disabled={!selectedExercise}
              className="flex-1 bg-[#FF375F] hover:bg-[#E63050] text-white disabled:bg-[#3C3C3E] disabled:text-[#A1A1A3]"
            >
              Replace Exercise
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}