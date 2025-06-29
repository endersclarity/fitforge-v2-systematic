import { useState } from 'react'

export function useWorkoutProgress() {
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [showExerciseMenu, setShowExerciseMenu] = useState(false)
  const [showReplaceModal, setShowReplaceModal] = useState(false)

  const handleRestTimerComplete = () => {
    setShowRestTimer(false)
  }

  const startRestTimer = () => {
    setShowRestTimer(true)
  }

  const openExerciseMenu = () => {
    setShowExerciseMenu(true)
  }

  const closeExerciseMenu = () => {
    setShowExerciseMenu(false)
  }

  const openReplaceModal = () => {
    setShowReplaceModal(true)
    setShowExerciseMenu(false) // Close menu when opening modal
  }

  const closeReplaceModal = () => {
    setShowReplaceModal(false)
  }

  const toggleExerciseMenu = () => {
    setShowExerciseMenu(prev => !prev)
  }

  return {
    // State
    showRestTimer,
    showExerciseMenu,
    showReplaceModal,
    
    // Actions
    handleRestTimerComplete,
    startRestTimer,
    openExerciseMenu,
    closeExerciseMenu,
    openReplaceModal,
    closeReplaceModal,
    toggleExerciseMenu,
    
    // Setters for components
    setShowRestTimer,
    setShowExerciseMenu,
    setShowReplaceModal
  }
}