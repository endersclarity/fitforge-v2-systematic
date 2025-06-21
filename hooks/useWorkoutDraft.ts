"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { workoutDraftService, WorkoutDraft, WorkoutDraftExercise } from "@/lib/workout-draft-service"

// Use development user ID (replace with actual auth when implemented)
const DEVELOPMENT_USER_ID = '00000000-0000-4000-8000-000000000001'

// Auto-save debounce delay (ms)
const AUTO_SAVE_DELAY = 2000

export function useWorkoutDraft(): [WorkoutDraft | null, (draft: Partial<WorkoutDraft>) => void, { isLoading: boolean; isSaving: boolean; error: string | null }] {
  const [draft, setDraftState] = useState<WorkoutDraft | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Auto-save debouncing
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const realtimeChannelRef = useRef<any>()

  // Load initial draft
  useEffect(() => {
    const loadDraft = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const existingDraft = await workoutDraftService.getOrCreateWorkoutDraft(DEVELOPMENT_USER_ID)
        setDraftState(existingDraft)
      } catch (err) {
        console.error('Error loading workout draft:', err)
        setError('Failed to load workout draft')
      } finally {
        setIsLoading(false)
      }
    }

    loadDraft()
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    if (!draft) return

    const channel = workoutDraftService.subscribeToWorkoutDraft(
      DEVELOPMENT_USER_ID,
      (updatedDraft) => {
        if (updatedDraft && updatedDraft.auto_save_version !== draft.auto_save_version) {
          setDraftState(updatedDraft)
        }
      }
    )

    realtimeChannelRef.current = channel

    return () => {
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.unsubscribe()
      }
    }
  }, [draft?.auto_save_version])

  // Auto-save function with debouncing
  const autoSave = useCallback(async (draftData: Partial<WorkoutDraft>) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true)
        setError(null)
        
        const updatedDraft = await workoutDraftService.saveWorkoutDraft(
          DEVELOPMENT_USER_ID,
          draftData
        )
        
        setDraftState(updatedDraft)
      } catch (err) {
        console.error('Error auto-saving workout draft:', err)
        setError('Failed to save workout draft')
      } finally {
        setIsSaving(false)
      }
    }, AUTO_SAVE_DELAY)
  }, [])

  // Update draft function
  const updateDraft = useCallback((updates: Partial<WorkoutDraft>) => {
    if (!draft) return

    // Optimistic update
    const newDraft = { ...draft, ...updates }
    setDraftState(newDraft)

    // Auto-save to Supabase
    autoSave(updates)
  }, [draft, autoSave])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.unsubscribe()
      }
    }
  }, [])

  return [
    draft,
    updateDraft,
    { isLoading, isSaving, error }
  ]
}

// Utility hook for managing workout draft exercises specifically
export function useWorkoutDraftExercises() {
  const [draft, updateDraft, status] = useWorkoutDraft()

  const addExercise = useCallback((exercise: Omit<WorkoutDraftExercise, 'id'>) => {
    if (!draft) return
    
    const newExercise: WorkoutDraftExercise = {
      ...exercise,
      id: crypto.randomUUID()
    }
    
    updateDraft({
      exercises: [...draft.exercises, newExercise]
    })
  }, [draft, updateDraft])

  const updateExercise = useCallback((exerciseId: string, updates: Partial<WorkoutDraftExercise>) => {
    if (!draft) return
    
    const updatedExercises = draft.exercises.map(ex =>
      ex.id === exerciseId ? { ...ex, ...updates } : ex
    )
    
    updateDraft({ exercises: updatedExercises })
  }, [draft, updateDraft])

  const removeExercise = useCallback((exerciseId: string) => {
    if (!draft) return
    
    const filteredExercises = draft.exercises.filter(ex => ex.id !== exerciseId)
    updateDraft({ exercises: filteredExercises })
  }, [draft, updateDraft])

  const reorderExercises = useCallback((fromIndex: number, toIndex: number) => {
    if (!draft) return
    
    const exercises = [...draft.exercises]
    const [movedExercise] = exercises.splice(fromIndex, 1)
    exercises.splice(toIndex, 0, movedExercise)
    
    updateDraft({ exercises })
  }, [draft, updateDraft])

  return {
    exercises: draft?.exercises || [],
    addExercise,
    updateExercise,
    removeExercise,
    reorderExercises,
    ...status
  }
}