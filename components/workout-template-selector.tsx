'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Clock, Target, Dumbbell } from "lucide-react"
import workoutTemplates from '@/data/workout-templates.json'

interface WorkoutTemplate {
  id: string
  name: string
  description: string
  category: string
  workoutType: string
  variant: string
  exercises: Array<{
    exerciseId: string
    sets: number
    reps: string
    restSeconds: number
    notes?: string
  }>
  targetMuscles: string[]
  estimatedDuration: number
  difficulty: string
  equipment: string[]
  tags?: string[]
  fatigueScore: number
}

interface TemplateCategoryInfo {
  id: string
  name: string
  description: string
  templates: string[]
}

export function WorkoutTemplateSelector({ onBack, onTemplateSelect }: { 
  onBack: () => void
  onTemplateSelect: (template: WorkoutTemplate) => void 
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Get categories and templates from the data
  const categories = workoutTemplates.templateCategories as Record<string, TemplateCategoryInfo>
  const templates = workoutTemplates as Record<string, WorkoutTemplate>

  // Get templates for selected category
  const getTemplatesForCategory = (categoryId: string): WorkoutTemplate[] => {
    const category = categories[categoryId]
    if (!category) return []
    
    return category.templates
      .map(templateId => templates[templateId])
      .filter(template => template) // Filter out undefined templates
  }

  const handleTemplateSelect = (template: WorkoutTemplate) => {
    onTemplateSelect(template)
  }

  // Category selection view
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        {/* Header */}
        <div className="px-6 py-8">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="p-2 hover:bg-[#2C2C2E] mr-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Choose Workout Type</h1>
          </div>
          <p className="text-[#A1A1A3] text-lg">Select from suggested, expert, or custom workouts</p>
        </div>

        {/* Category Cards */}
        <div className="px-6 space-y-4">
          {Object.values(categories).map((category) => (
            <Card key={category.id} className="bg-[#1C1C1E] border-[#2C2C2E] hover:bg-[#2C2C2E] transition-colors">
              <CardContent className="p-0">
                <Button 
                  variant="ghost" 
                  className="w-full h-auto p-6 text-left hover:bg-transparent"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                      <Badge variant="secondary" className="bg-[#2C2C2E] text-[#A1A1A3]">
                        {category.templates.length} templates
                      </Badge>
                    </div>
                    <p className="text-[#A1A1A3] text-sm">{category.description}</p>
                  </div>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Template selection view
  const categoryTemplates = getTemplatesForCategory(selectedCategory)
  const categoryInfo = categories[selectedCategory]

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="px-6 py-8">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedCategory(null)}
            className="p-2 hover:bg-[#2C2C2E] mr-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{categoryInfo?.name}</h1>
        </div>
        <p className="text-[#A1A1A3] text-lg">{categoryInfo?.description}</p>
      </div>

      {/* Template Cards */}
      <div className="px-6 space-y-4">
        {categoryTemplates.length === 0 ? (
          <Card className="bg-[#1C1C1E] border-[#2C2C2E]">
            <CardContent className="p-6 text-center">
              <p className="text-[#A1A1A3] text-lg">No templates available yet</p>
              <p className="text-[#A1A1A3] text-sm mt-1">
                {selectedCategory === 'expert' ? 'Add your proven workout templates here' : 'Templates coming soon'}
              </p>
            </CardContent>
          </Card>
        ) : (
          categoryTemplates.map((template) => (
            <Card key={template.id} className="bg-[#1C1C1E] border-[#2C2C2E] hover:bg-[#2C2C2E] transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-white">{template.name}</CardTitle>
                    <p className="text-[#A1A1A3] text-sm mt-1">{template.description}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`ml-2 ${
                      template.difficulty === 'Beginner' ? 'border-green-500 text-green-400' :
                      template.difficulty === 'Intermediate' ? 'border-orange-500 text-orange-400' :
                      'border-red-500 text-red-400'
                    }`}
                  >
                    {template.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Template Info */}
                <div className="flex items-center space-x-4 mb-4 text-sm text-[#A1A1A3]">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{template.estimatedDuration} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>{template.exercises.length} exercises</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Dumbbell className="h-4 w-4" />
                    <span>{template.workoutType} {template.variant}</span>
                  </div>
                </div>

                {/* Target Muscles */}
                <div className="mb-4">
                  <p className="text-sm text-[#A1A1A3] mb-2">Target Muscles:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.targetMuscles.map((muscle) => (
                      <Badge key={muscle} variant="secondary" className="bg-[#2C2C2E] text-[#A1A1A3] text-xs">
                        {muscle.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div className="mb-4">
                  <p className="text-sm text-[#A1A1A3] mb-2">Equipment:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.equipment.map((item) => (
                      <Badge key={item} variant="outline" className="border-[#3C3C3E] text-[#A1A1A3] text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Select Button */}
                <Button 
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full bg-[#FF375F] hover:bg-[#E63050] text-white"
                >
                  Select This Template
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Bottom spacing */}
      <div className="h-8" />
    </div>
  )
}