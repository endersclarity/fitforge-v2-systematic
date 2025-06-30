'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Edit, Copy, Trash2, Play, Search } from 'lucide-react'
import exercisesData from '@/data/exercises-real.json'

interface WorkoutTemplate {
  id: string
  name: string
  type: 'A' | 'B' | 'C' | 'D'
  category: 'strength' | 'hypertrophy' | 'endurance' | 'general'
  exercises: Array<{
    exerciseId: string
    exerciseName?: string
    targetSets: number
    targetRepsMin: number
    targetRepsMax: number
    targetWeight: number
    restTimeSeconds: number
  }>
  estimatedDuration: number
  createdAt: string
  lastUsedAt?: string
  timesUsed: number
}

export default function SavedWorkoutsPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<WorkoutTemplate[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  // IMPORTANT: localStorage has a 5MB limit across all stored data
  // With average template size of ~2KB, this allows for ~2500 templates
  // Future implementation should migrate to IndexedDB or server storage

  // Load templates from localStorage
  useEffect(() => {
    const loadTemplates = () => {
      try {
        const stored = localStorage.getItem('fitforge_workout_templates')
        if (stored) {
          const parsed = JSON.parse(stored)
          setTemplates(parsed)
          setFilteredTemplates(parsed)
        }
      } catch (error) {
        console.error('Error loading templates:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadTemplates()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...templates]
    
    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter)
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredTemplates(filtered)
  }, [templates, categoryFilter, searchTerm])

  const handleDelete = (id: string) => {
    // For now, use confirm. In production, would use a proper modal
    if (confirm('Are you sure you want to delete this template?')) {
      const updated = templates.filter(t => t.id !== id)
      setTemplates(updated)
      localStorage.setItem('fitforge_workout_templates', JSON.stringify(updated))
    }
  }

  const handleDuplicate = (template: WorkoutTemplate) => {
    const duplicate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      timesUsed: 0,
      lastUsedAt: undefined
    }
    const updated = [...templates, duplicate]
    setTemplates(updated)
    localStorage.setItem('fitforge_workout_templates', JSON.stringify(updated))
  }

  const handleEdit = (id: string) => {
    // Store template ID for loading in workout builder
    sessionStorage.setItem('editTemplateId', id)
    router.push('/flows-experimental/workout-builder')
  }

  const handleStartWorkout = (template: WorkoutTemplate) => {
    // Convert template to workout session format
    const workoutSession = {
      exercises: template.exercises.map(ex => {
        // Find the exercise in the database to get full details
        const exerciseInfo = exercisesData.find(e => e.id === ex.exerciseId)
        return {
          id: ex.exerciseId,
          name: ex.exerciseName || exerciseInfo?.name || ex.exerciseId,
          category: exerciseInfo?.category || 'General',
          equipment: exerciseInfo?.equipment || 'Unknown',
          difficulty: exerciseInfo?.difficulty || 'Intermediate'
        }
      })
    }
    
    // Store for workout execution
    localStorage.setItem('fitforge-workout-session', JSON.stringify(workoutSession))
    
    // Also store the full template for reference
    sessionStorage.setItem('workoutTemplate', JSON.stringify(template))
    
    // Update usage stats
    const updated = templates.map(t => {
      if (t.id === template.id) {
        return {
          ...t,
          timesUsed: t.timesUsed + 1,
          lastUsedAt: new Date().toISOString()
        }
      }
      return t
    })
    setTemplates(updated)
    localStorage.setItem('fitforge_workout_templates', JSON.stringify(updated))
    
    router.push('/flows-experimental/workout-execution')
  }

  return (
    <div className="min-h-screen bg-fitbod-background text-fitbod-text">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-fitbod-background border-b border-fitbod-subtle">
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-fitbod-subtle rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold">Saved Workouts</h1>
            <Link 
              href="/flows-experimental/workout-builder"
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-fitbod-accent text-white rounded-lg hover:bg-fitbod-accent/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Workout</span>
            </Link>
          </div>
          
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fitbod-text-secondary" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-fitbod-card border border-fitbod-subtle rounded-lg focus:ring-2 focus:ring-fitbod-accent focus:border-fitbod-accent"
                  data-testid="template-search-input"
                />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-fitbod-card border border-fitbod-subtle rounded-lg focus:ring-2 focus:ring-fitbod-accent"
              data-testid="category-filter"
            >
              <option value="all">All Categories</option>
              <option value="strength">Strength</option>
              <option value="hypertrophy">Hypertrophy</option>
              <option value="endurance">Endurance</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-fitbod-text-secondary">Loading templates...</div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-xl font-medium mb-2">
              {templates.length === 0 ? 'No saved workouts yet' : 'No templates match your filters'}
            </div>
            <div className="text-fitbod-text-secondary mb-6">
              {templates.length === 0 ? 'Create your first workout template' : 'Try adjusting your search or filters'}
            </div>
            {templates.length === 0 && (
              <Link
                href="/flows-experimental/workout-builder"
                className="inline-flex items-center gap-2 px-6 py-3 bg-fitbod-accent text-white rounded-lg hover:bg-fitbod-accent/90 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Create Workout</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-fitbod-card border border-fitbod-subtle rounded-lg p-4 hover:border-fitbod-accent/50 transition-all"
                data-testid="workout-template-card"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <div className="flex gap-2 mt-1 text-sm text-fitbod-text-secondary">
                      <span>Type {template.type}</span>
                      <span>•</span>
                      <span className="capitalize">{template.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-fitbod-text-secondary">Exercises</span>
                    <span>{template.exercises.length} {template.exercises.length === 1 ? 'exercise' : 'exercises'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fitbod-text-secondary">Duration</span>
                    <span>~{template.estimatedDuration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fitbod-text-secondary">Times Used</span>
                    <span>{template.timesUsed}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartWorkout(template)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-fitbod-accent text-white rounded hover:bg-fitbod-accent/90 transition-colors"
                    data-testid="start-workout-button"
                  >
                    <Play className="h-4 w-4" />
                    <span>Start</span>
                  </button>
                  <button
                    onClick={() => handleEdit(template.id)}
                    className="p-2 hover:bg-fitbod-subtle rounded transition-colors"
                    data-testid="edit-template-button"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="p-2 hover:bg-fitbod-subtle rounded transition-colors"
                    data-testid="duplicate-template-button"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 hover:bg-fitbod-subtle rounded transition-colors text-red-500"
                    data-testid="delete-template-button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}