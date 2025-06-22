/**
 * Integration Test: Muscle Visualization and Fatigue Display
 * Tests the integration between MuscleHeatmap component and analytics API
 */

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MuscleHeatmap } from '@/components/visualization/MuscleHeatmap'
import { api } from '@/lib/api-client'

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  api: {
    analytics: {
      getMuscleFatigue: jest.fn(),
      getMuscleHeatmap: jest.fn(),
    },
  },
}))

describe('Muscle Visualization Integration', () => {
  const mockMuscleFatigue = [
    {
      muscle_name: 'Pectoralis_Major',
      fatigue_level: 75,
      recovery_percentage: 25,
      last_worked: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      next_ready: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
    },
    {
      muscle_name: 'Triceps_Brachii',
      fatigue_level: 50,
      recovery_percentage: 50,
      last_worked: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      next_ready: new Date(Date.now() + 43200000).toISOString(), // 12 hours from now
    },
    {
      muscle_name: 'Quadriceps',
      fatigue_level: 90,
      recovery_percentage: 10,
      last_worked: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      next_ready: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
    },
  ]

  const mockHeatmapData = {
    fatigue_data: mockMuscleFatigue,
    recommended_muscles: ['Latissimus_Dorsi', 'Biceps_Brachii', 'Hamstrings'],
    overall_readiness: 65,
    workout_suggestion: 'Focus on back and biceps today',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(api.analytics.getMuscleFatigue as jest.Mock).mockResolvedValue(mockMuscleFatigue)
    ;(api.analytics.getMuscleHeatmap as jest.Mock).mockResolvedValue(mockHeatmapData)
  })

  it('should display muscle fatigue levels with correct colors', async () => {
    render(<MuscleHeatmap userId="test-user-123" />)

    // Wait for data to load
    await waitFor(() => {
      expect(api.analytics.getMuscleHeatmap).toHaveBeenCalledWith('test-user-123')
    })

    // Check that muscles are displayed with appropriate fatigue indicators
    const pectoralisMajor = await screen.findByTestId('muscle-Pectoralis_Major')
    expect(pectoralisMajor).toHaveClass('muscle-fatigue-high') // 75% fatigue

    const triceps = await screen.findByTestId('muscle-Triceps_Brachii')
    expect(triceps).toHaveClass('muscle-fatigue-medium') // 50% fatigue

    const quadriceps = await screen.findByTestId('muscle-Quadriceps')
    expect(quadriceps).toHaveClass('muscle-fatigue-critical') // 90% fatigue

    // Check readiness score
    expect(screen.getByText('65%')).toBeInTheDocument()
    expect(screen.getByText(/overall readiness/i)).toBeInTheDocument()

    // Check workout suggestion
    expect(screen.getByText('Focus on back and biceps today')).toBeInTheDocument()
  })

  it('should show muscle details on hover', async () => {
    render(<MuscleHeatmap userId="test-user-123" />)

    await waitFor(() => {
      expect(api.analytics.getMuscleHeatmap).toHaveBeenCalled()
    })

    // Hover over a muscle
    const pectoralisMajor = await screen.findByTestId('muscle-Pectoralis_Major')
    fireEvent.mouseEnter(pectoralisMajor)

    // Check tooltip content
    await waitFor(() => {
      expect(screen.getByText('Pectoralis Major')).toBeInTheDocument()
      expect(screen.getByText('75% fatigued')).toBeInTheDocument()
      expect(screen.getByText(/last worked: 1 day ago/i)).toBeInTheDocument()
      expect(screen.getByText(/ready in: 1 day/i)).toBeInTheDocument()
    })

    // Mouse leave should hide tooltip
    fireEvent.mouseLeave(pectoralisMajor)
    await waitFor(() => {
      expect(screen.queryByText('75% fatigued')).not.toBeInTheDocument()
    })
  })

  it('should toggle between front and back views', async () => {
    render(<MuscleHeatmap userId="test-user-123" />)

    await waitFor(() => {
      expect(api.analytics.getMuscleHeatmap).toHaveBeenCalled()
    })

    // Initially showing front view
    expect(screen.getByTestId('muscle-view-front')).toBeInTheDocument()
    expect(screen.queryByTestId('muscle-view-back')).not.toBeInTheDocument()

    // Click toggle to show back view
    const toggleButton = screen.getByRole('button', { name: /view back/i })
    fireEvent.click(toggleButton)

    // Now showing back view
    await waitFor(() => {
      expect(screen.queryByTestId('muscle-view-front')).not.toBeInTheDocument()
      expect(screen.getByTestId('muscle-view-back')).toBeInTheDocument()
    })

    // Toggle button text should update
    expect(screen.getByRole('button', { name: /view front/i })).toBeInTheDocument()
  })

  it('should handle loading and error states', async () => {
    // Test loading state
    render(<MuscleHeatmap userId="test-user-123" />)
    
    expect(screen.getByTestId('muscle-heatmap-loading')).toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('muscle-heatmap-loading')).not.toBeInTheDocument()
    })

    // Test error state
    ;(api.analytics.getMuscleHeatmap as jest.Mock).mockRejectedValue(new Error('API Error'))
    
    const { rerender } = render(<MuscleHeatmap userId="test-user-123" />)

    await waitFor(() => {
      expect(screen.getByText(/failed to load muscle data/i)).toBeInTheDocument()
    })

    // Test retry
    const retryButton = screen.getByRole('button', { name: /retry/i })
    ;(api.analytics.getMuscleHeatmap as jest.Mock).mockResolvedValue(mockHeatmapData)
    
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.queryByText(/failed to load muscle data/i)).not.toBeInTheDocument()
      expect(screen.getByTestId('muscle-view-front')).toBeInTheDocument()
    })
  })

  it('should update when user changes', async () => {
    const { rerender } = render(<MuscleHeatmap userId="user-1" />)

    await waitFor(() => {
      expect(api.analytics.getMuscleHeatmap).toHaveBeenCalledWith('user-1')
    })

    jest.clearAllMocks()

    // Change user
    rerender(<MuscleHeatmap userId="user-2" />)

    await waitFor(() => {
      expect(api.analytics.getMuscleHeatmap).toHaveBeenCalledWith('user-2')
    })
  })

  it('should show recommended muscles with special styling', async () => {
    render(<MuscleHeatmap userId="test-user-123" />)

    await waitFor(() => {
      expect(api.analytics.getMuscleHeatmap).toHaveBeenCalled()
    })

    // Check recommended muscles have special styling
    const latissimus = await screen.findByTestId('muscle-Latissimus_Dorsi')
    expect(latissimus).toHaveClass('muscle-recommended')

    const biceps = await screen.findByTestId('muscle-Biceps_Brachii')
    expect(biceps).toHaveClass('muscle-recommended')

    const hamstrings = await screen.findByTestId('muscle-Hamstrings')
    expect(hamstrings).toHaveClass('muscle-recommended')

    // Check legend shows recommended indicator
    expect(screen.getByText(/recommended for today/i)).toBeInTheDocument()
  })
})