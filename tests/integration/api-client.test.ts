/**
 * Integration Test: API Client with Error Handling
 * Tests the API client's error handling, retry logic, and timeout behavior
 */

import { api, APIError } from '@/lib/api-client'

// Mock fetch globally
global.fetch = jest.fn()

describe('API Client Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockReset()
  })

  describe('Successful Requests', () => {
    it('should make GET requests successfully', async () => {
      const mockResponse = { id: '123', name: 'Test Exercise' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.exercises.get('123')

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/exercises/123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should make POST requests with data', async () => {
      const mockWorkout = { id: 'w123', workout_type: 'A' }
      const postData = { user_id: 'u123', workout_type: 'A' }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkout,
      })

      const result = await api.workouts.create(postData)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/workouts',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        })
      )
      expect(result).toEqual(mockWorkout)
    })

    it('should handle query parameters correctly', async () => {
      const mockExercises = [{ id: '1', name: 'Squat' }]
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockExercises,
      })

      await api.exercises.list({ 
        category: 'Legs', 
        equipment: 'Barbell',
        limit: 10,
        offset: 0,
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/exercises?category=Legs&equipment=Barbell&limit=10&offset=0',
        expect.any(Object)
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle 400 Bad Request errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error_code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: { weight: 'Must be positive number' },
        }),
      })

      await expect(api.workoutSets.create({
        workout_id: 'w123',
        exercise_id: 'e123',
        set_number: 1,
        weight: -10,
        reps: 10,
      } as any)).rejects.toThrow(APIError)

      try {
        await api.workoutSets.create({
          workout_id: 'w123',
          exercise_id: 'e123',
          set_number: 1,
          weight: -10,
          reps: 10,
        } as any)
      } catch (error: any) {
        expect(error).toBeInstanceOf(APIError)
        expect(error.status).toBe(400)
        expect(error.code).toBe('VALIDATION_ERROR')
        expect(error.message).toBe('Invalid input data')
        expect(error.details).toEqual({ weight: 'Must be positive number' })
      }
    })

    it('should handle 401 Unauthorized errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error_code: 'UNAUTHORIZED',
          message: 'Authentication required',
        }),
      })

      await expect(api.users.getProfile()).rejects.toThrow(APIError)
    })

    it('should handle 404 Not Found errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error_code: 'NOT_FOUND',
          message: 'Workout not found',
        }),
      })

      await expect(api.workouts.get('non-existent')).rejects.toThrow(APIError)
    })

    it('should handle 500 Server errors with retry', async () => {
      // First two calls fail with 500, third succeeds
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({
            error_code: 'INTERNAL_ERROR',
            message: 'Server error',
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({
            error_code: 'INTERNAL_ERROR',
            message: 'Server error',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: '123', name: 'Success after retry' }),
        })

      const result = await api.exercises.get('123')

      expect(global.fetch).toHaveBeenCalledTimes(3)
      expect(result).toEqual({ id: '123', name: 'Success after retry' })
    })

    it('should fail after max retries', async () => {
      // All calls fail with 500
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          error_code: 'INTERNAL_ERROR',
          message: 'Server error',
        }),
      })

      await expect(api.exercises.get('123')).rejects.toThrow(APIError)
      expect(global.fetch).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })
  })

  describe('Network Errors', () => {
    it('should handle network failures with retry', async () => {
      // First call fails with network error, second succeeds
      ;(global.fetch as jest.Mock)
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })

      const result = await api.health.check()

      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(result).toEqual({ success: true })
    })

    it('should handle timeout errors', async () => {
      // Create a promise that never resolves to simulate timeout
      ;(global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      )

      // Use a shorter timeout for testing
      const originalTimeout = process.env.NEXT_PUBLIC_API_TIMEOUT
      process.env.NEXT_PUBLIC_API_TIMEOUT = '100' // 100ms timeout

      await expect(api.exercises.list()).rejects.toThrow(APIError)

      // Restore original timeout
      process.env.NEXT_PUBLIC_API_TIMEOUT = originalTimeout
    })
  })

  describe('Authentication', () => {
    it('should set and use auth token', async () => {
      const mockUser = { id: 'u123', email: 'test@example.com' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      })

      // Set auth token
      api.setAuthToken('test-token-123')

      await api.users.getProfile()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token-123',
          }),
        })
      )
    })

    it('should remove auth token', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'public' }),
      })

      // Set then remove auth token
      api.setAuthToken('test-token')
      api.setAuthToken(null)

      await api.exercises.list()

      const callHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers
      expect(callHeaders).not.toHaveProperty('Authorization')
    })
  })

  describe('Complex Integration Scenarios', () => {
    it('should handle concurrent requests', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      // Make multiple concurrent requests
      const promises = [
        api.exercises.list(),
        api.workouts.list(),
        api.users.getStats(),
        api.analytics.getProgress('u123', 12),
      ]

      const results = await Promise.all(promises)

      expect(global.fetch).toHaveBeenCalledTimes(4)
      expect(results).toHaveLength(4)
      results.forEach(result => {
        expect(result).toEqual({ success: true })
      })
    })

    it('should handle mixed success and failure', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: '1', success: true }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({
            error_code: 'NOT_FOUND',
            message: 'Not found',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: '3', success: true }),
        })

      const results = await Promise.allSettled([
        api.exercises.get('1'),
        api.workouts.get('non-existent'),
        api.users.getProfile(),
      ])

      expect(results[0].status).toBe('fulfilled')
      expect(results[1].status).toBe('rejected')
      expect(results[2].status).toBe('fulfilled')
    })
  })
})