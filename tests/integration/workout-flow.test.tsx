/**
 * Integration Test: Complete Workout Flow
 * Tests the integration between WorkoutLogger, ExerciseSelector, and API client
 */

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkoutLogger } from '@/components/workout/WorkoutLogger'
import { api } from '@/lib/api-client'

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  api: {
    workouts: {
      create: jest.fn(),
      get: jest.fn(),
      complete: jest.fn(),
    },
    workoutSets: {
      create: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    exercises: {
      list: jest.fn(),
      search: jest.fn(),
    },
  },
}))

// Mock the auth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-123', email: 'test@fitforge.app', displayName: 'Test User' },
    isLoading: false,
    isAuthenticated: true,
  }),
}))

describe('Workout Flow Integration', () => {
  const mockExercises = [
    {
      id: 'ex-1',
      name: 'Bench Press',
      category: 'Push',
      muscle_groups: ['Chest', 'Triceps', 'Shoulders'],
      equipment: 'Barbell',
      difficulty: 'intermediate',
      instructions: 'Press the bar',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ex-2',
      name: 'Squat',
      category: 'Legs',
      muscle_groups: ['Quadriceps', 'Glutes', 'Hamstrings'],
      equipment: 'Barbell',
      difficulty: 'intermediate',
      instructions: 'Squat down',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  const mockWorkout = {
    id: 'workout-123',
    user_id: 'test-user-123',
    workout_type: 'A',
    start_time: new Date().toISOString(),
    end_time: null,
    is_completed: false,
    notes: null,
    energy_level: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(api.exercises.list as jest.Mock).mockResolvedValue(mockExercises)
    ;(api.exercises.search as jest.Mock).mockResolvedValue(mockExercises)
    ;(api.workouts.create as jest.Mock).mockResolvedValue(mockWorkout)
    ;(api.workouts.get as jest.Mock).mockResolvedValue(mockWorkout)
    ;(api.workoutSets.list as jest.Mock).mockResolvedValue([])
  })

  it('should complete a full workout flow from creation to completion', async () => {
    const user = userEvent.setup()
    
    render(<WorkoutLogger userId="test-user-123" />)

    // Step 1: Start a new workout
    const startButton = await screen.findByRole('button', { name: /start workout/i })
    await user.click(startButton)

    // Select workout type A
    const typeAButton = await screen.findByRole('button', { name: /workout a/i })
    await user.click(typeAButton)

    // Verify workout was created
    await waitFor(() => {
      expect(api.workouts.create).toHaveBeenCalledWith({
        user_id: 'test-user-123',
        workout_type: 'A',
      })
    })

    // Step 2: Add an exercise
    const addExerciseButton = await screen.findByRole('button', { name: /add exercise/i })
    await user.click(addExerciseButton)

    // Search for bench press
    const searchInput = await screen.findByPlaceholderText(/search exercises/i)
    await user.type(searchInput, 'bench')

    await waitFor(() => {
      expect(api.exercises.search).toHaveBeenCalledWith('bench')
    })

    // Select bench press from results
    const benchPressOption = await screen.findByText('Bench Press')
    await user.click(benchPressOption)

    // Step 3: Log a set
    const setWeightInput = await screen.findByLabelText(/weight/i)
    const setRepsInput = await screen.findByLabelText(/reps/i)
    
    await user.clear(setWeightInput)
    await user.type(setWeightInput, '135')
    await user.clear(setRepsInput)
    await user.type(setRepsInput, '10')

    const logSetButton = await screen.findByRole('button', { name: /log set/i })
    await user.click(logSetButton)

    // Verify set was created
    await waitFor(() => {
      expect(api.workoutSets.create).toHaveBeenCalledWith({
        workout_id: 'workout-123',
        exercise_id: 'ex-1',
        set_number: 1,
        weight: 135,
        reps: 10,
        rest_time_seconds: null,
        notes: null,
      })
    })

    // Step 4: Complete the workout
    const completeButton = await screen.findByRole('button', { name: /complete workout/i })
    await user.click(completeButton)

    // Add workout notes
    const notesTextarea = await screen.findByPlaceholderText(/workout notes/i)
    await user.type(notesTextarea, 'Great workout!')

    // Select energy level
    const energyLevel4 = await screen.findByRole('button', { name: /4/i })
    await user.click(energyLevel4)

    // Confirm completion
    const confirmButton = await screen.findByRole('button', { name: /confirm/i })
    await user.click(confirmButton)

    // Verify workout was completed
    await waitFor(() => {
      expect(api.workouts.complete).toHaveBeenCalledWith('workout-123', {
        notes: 'Great workout!',
        energy_level: 4,
      })
    })
  })

  it('should handle API errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    ;(api.workouts.create as jest.Mock).mockRejectedValue(new Error('Network error'))

    const user = userEvent.setup()
    render(<WorkoutLogger userId="test-user-123" />)

    const startButton = await screen.findByRole('button', { name: /start workout/i })
    await user.click(startButton)

    const typeAButton = await screen.findByRole('button', { name: /workout a/i })
    await user.click(typeAButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to start workout/i)).toBeInTheDocument()
    })

    consoleError.mockRestore()
  })

  it('should allow editing and deleting sets', async () => {
    const mockSet = {
      id: 'set-123',
      workout_id: 'workout-123',
      exercise_id: 'ex-1',
      set_number: 1,
      weight: 135,
      reps: 10,
      rest_time_seconds: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    ;(api.workoutSets.list as jest.Mock).mockResolvedValue([mockSet])
    ;(api.workoutSets.update as jest.Mock).mockResolvedValue({ ...mockSet, weight: 145 })
    ;(api.workoutSets.delete as jest.Mock).mockResolvedValue(undefined)

    const user = userEvent.setup()
    render(<WorkoutLogger userId="test-user-123" workoutId="workout-123" />)

    // Wait for sets to load
    await waitFor(() => {
      expect(screen.getByText(/135 lbs x 10/i)).toBeInTheDocument()
    })

    // Edit the set
    const editButton = await screen.findByRole('button', { name: /edit/i })
    await user.click(editButton)

    const weightInput = await screen.findByDisplayValue('135')
    await user.clear(weightInput)
    await user.type(weightInput, '145')

    const saveButton = await screen.findByRole('button', { name: /save/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(api.workoutSets.update).toHaveBeenCalledWith('set-123', {
        weight: 145,
        reps: 10,
      })
    })

    // Delete the set
    const deleteButton = await screen.findByRole('button', { name: /delete/i })
    await user.click(deleteButton)

    // Confirm deletion
    const confirmDeleteButton = await screen.findByRole('button', { name: /confirm delete/i })
    await user.click(confirmDeleteButton)

    await waitFor(() => {
      expect(api.workoutSets.delete).toHaveBeenCalledWith('set-123')
    })
  })
})