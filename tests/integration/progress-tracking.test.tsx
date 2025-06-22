/**
 * Integration Test: Progress Tracking Dashboard
 * Tests the integration between ProgressDashboard and analytics API
 */

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProgressDashboard } from '@/components/dashboard/ProgressDashboard'
import { api } from '@/lib/api-client'

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  api: {
    analytics: {
      getProgress: jest.fn(),
      calculateFatigue: jest.fn(),
    },
    workouts: {
      list: jest.fn(),
    },
    exercises: {
      list: jest.fn(),
    },
  },
}))

// Mock recharts to avoid canvas rendering issues in tests
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}))

describe('Progress Dashboard Integration', () => {
  const mockProgressData = {
    volume_progression: [
      { week: 'Week 1', total_volume: 45000, workout_count: 4 },
      { week: 'Week 2', total_volume: 48500, workout_count: 5 },
      { week: 'Week 3', total_volume: 52000, workout_count: 5 },
      { week: 'Week 4', total_volume: 51000, workout_count: 4 },
    ],
    strength_gains: {
      'Bench Press': { start_weight: 135, current_weight: 155, improvement: 14.8 },
      'Squat': { start_weight: 185, current_weight: 225, improvement: 21.6 },
      'Deadlift': { start_weight: 225, current_weight: 275, improvement: 22.2 },
    },
    muscle_distribution: [
      { muscle_group: 'Chest', percentage: 25, sessions: 12 },
      { muscle_group: 'Back', percentage: 20, sessions: 10 },
      { muscle_group: 'Legs', percentage: 30, sessions: 15 },
      { muscle_group: 'Arms', percentage: 15, sessions: 8 },
      { muscle_group: 'Shoulders', percentage: 10, sessions: 5 },
    ],
    workout_frequency: {
      average_per_week: 4.5,
      consistency_score: 88,
      streak_days: 21,
      total_workouts: 50,
    },
    personal_records: [
      { exercise: 'Bench Press', weight: 155, reps: 5, date: '2025-06-20' },
      { exercise: 'Squat', weight: 225, reps: 8, date: '2025-06-18' },
      { exercise: 'Pull-ups', weight: 25, reps: 10, date: '2025-06-15' },
    ],
  }

  const mockWorkouts = [
    {
      id: 'w1',
      workout_type: 'A',
      start_time: new Date().toISOString(),
      is_completed: true,
      energy_level: 4,
    },
    {
      id: 'w2',
      workout_type: 'B',
      start_time: new Date(Date.now() - 86400000).toISOString(),
      is_completed: true,
      energy_level: 5,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(api.analytics.getProgress as jest.Mock).mockResolvedValue(mockProgressData)
    ;(api.workouts.list as jest.Mock).mockResolvedValue(mockWorkouts)
  })

  it('should display all progress metrics correctly', async () => {
    render(<ProgressDashboard userId="test-user-123" />)

    // Wait for data to load
    await waitFor(() => {
      expect(api.analytics.getProgress).toHaveBeenCalledWith('test-user-123', 12)
    })

    // Check volume progression chart
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    expect(screen.getByText(/volume progression/i)).toBeInTheDocument()

    // Check strength gains
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.getByText('+14.8%')).toBeInTheDocument()
    expect(screen.getByText('155 lbs')).toBeInTheDocument()

    // Check muscle distribution
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    expect(screen.getByText(/muscle distribution/i)).toBeInTheDocument()

    // Check workout frequency
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText(/workouts per week/i)).toBeInTheDocument()
    expect(screen.getByText('88%')).toBeInTheDocument()
    expect(screen.getByText(/consistency/i)).toBeInTheDocument()
    expect(screen.getByText('21 days')).toBeInTheDocument()
    expect(screen.getByText(/current streak/i)).toBeInTheDocument()

    // Check personal records
    expect(screen.getByText(/personal records/i)).toBeInTheDocument()
    expect(screen.getByText('155 lbs × 5')).toBeInTheDocument()
  })

  it('should allow changing time period', async () => {
    const user = userEvent.setup()
    render(<ProgressDashboard userId="test-user-123" />)

    await waitFor(() => {
      expect(api.analytics.getProgress).toHaveBeenCalledWith('test-user-123', 12)
    })

    // Find and click the time period selector
    const timePeriodButton = screen.getByRole('button', { name: /12 weeks/i })
    await user.click(timePeriodButton)

    // Select 4 weeks
    const fourWeeksOption = await screen.findByRole('option', { name: /4 weeks/i })
    await user.click(fourWeeksOption)

    // Verify API was called with new time period
    await waitFor(() => {
      expect(api.analytics.getProgress).toHaveBeenCalledWith('test-user-123', 4)
    })
  })

  it('should handle empty data gracefully', async () => {
    ;(api.analytics.getProgress as jest.Mock).mockResolvedValue({
      volume_progression: [],
      strength_gains: {},
      muscle_distribution: [],
      workout_frequency: {
        average_per_week: 0,
        consistency_score: 0,
        streak_days: 0,
        total_workouts: 0,
      },
      personal_records: [],
    })

    render(<ProgressDashboard userId="test-user-123" />)

    await waitFor(() => {
      expect(api.analytics.getProgress).toHaveBeenCalled()
    })

    // Should show empty state messages
    expect(screen.getByText(/no workout data available/i)).toBeInTheDocument()
    expect(screen.getByText(/start logging workouts/i)).toBeInTheDocument()
  })

  it('should refresh data when requested', async () => {
    const user = userEvent.setup()
    render(<ProgressDashboard userId="test-user-123" />)

    await waitFor(() => {
      expect(api.analytics.getProgress).toHaveBeenCalledTimes(1)
    })

    // Find and click refresh button
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    await user.click(refreshButton)

    // Also trigger fatigue recalculation
    await waitFor(() => {
      expect(api.analytics.calculateFatigue).toHaveBeenCalled()
      expect(api.analytics.getProgress).toHaveBeenCalledTimes(2)
    })
  })

  it('should show loading state during data fetch', async () => {
    // Make the API call slow
    ;(api.analytics.getProgress as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockProgressData), 100))
    )

    render(<ProgressDashboard userId="test-user-123" />)

    // Check loading state
    expect(screen.getByTestId('progress-dashboard-loading')).toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('progress-dashboard-loading')).not.toBeInTheDocument()
    })
  })

  it('should handle API errors', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    ;(api.analytics.getProgress as jest.Mock).mockRejectedValue(new Error('API Error'))

    render(<ProgressDashboard userId="test-user-123" />)

    await waitFor(() => {
      expect(screen.getByText(/failed to load progress data/i)).toBeInTheDocument()
    })

    // Should show retry button
    const retryButton = screen.getByRole('button', { name: /retry/i })
    expect(retryButton).toBeInTheDocument()

    consoleError.mockRestore()
  })

  it('should export data when requested', async () => {
    const user = userEvent.setup()
    
    // Mock URL.createObjectURL and click simulation
    const mockCreateObjectURL = jest.fn()
    const mockRevokeObjectURL = jest.fn()
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL
    
    // Mock createElement for download link
    const mockClick = jest.fn()
    const mockRemove = jest.fn()
    const originalCreateElement = document.createElement
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const element = originalCreateElement.call(document, tagName)
      if (tagName === 'a') {
        element.click = mockClick
        element.remove = mockRemove
      }
      return element
    })

    render(<ProgressDashboard userId="test-user-123" />)

    await waitFor(() => {
      expect(api.analytics.getProgress).toHaveBeenCalled()
    })

    // Click export button
    const exportButton = screen.getByRole('button', { name: /export data/i })
    await user.click(exportButton)

    // Verify export was triggered
    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockClick).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalled()

    // Restore mocks
    document.createElement = originalCreateElement
  })
})