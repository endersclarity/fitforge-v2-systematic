/**
 * FitForge API Client
 * Type-safe API client with error handling and retry logic
 */

import { 
  User, 
  Exercise, 
  Workout, 
  WorkoutSet, 
  MuscleState,
  UserUpdate,
  WorkoutInsert,
  WorkoutSetInsert 
} from '@/schemas/typescript-interfaces'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const API_TIMEOUT = 30000 // 30 seconds

// Custom error class for API errors
export class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Response wrapper for consistent error handling
interface APIResponse<T> {
  data?: T
  error?: APIError
}

// Request configuration
interface RequestConfig extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

/**
 * Base API client with error handling and retry logic
 */
class APIClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null) {
    if (token) {
      this.defaultHeaders = {
        ...this.defaultHeaders,
        'Authorization': `Bearer ${token}`,
      }
    } else {
      const { Authorization, ...headers } = this.defaultHeaders as Record<string, string>
      this.defaultHeaders = headers
    }
  }

  /**
   * Make HTTP request with timeout and retry logic
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      timeout = API_TIMEOUT,
      retries = 3,
      retryDelay = 1000,
      headers = {},
      ...fetchConfig
    } = config

    const url = `${this.baseURL}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const makeRequest = async (attempt: number): Promise<T> => {
      try {
        console.log(`🔥 [API] REQUEST - ${fetchConfig.method || 'GET'} ${endpoint}`)
        
        const response = await fetch(url, {
          ...fetchConfig,
          headers: {
            ...this.defaultHeaders,
            ...headers,
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        const data = await response.json()

        if (!response.ok) {
          throw new APIError(
            response.status,
            data.error_code || 'UNKNOWN_ERROR',
            data.message || 'An error occurred',
            data.details
          )
        }

        console.log(`🔧 [API] SUCCESS - ${endpoint}`, data)
        return data
      } catch (error: any) {
        clearTimeout(timeoutId)

        // Handle abort error
        if (error.name === 'AbortError') {
          throw new APIError(408, 'TIMEOUT', 'Request timeout')
        }

        // Handle network errors
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          throw new APIError(0, 'NETWORK_ERROR', 'Network connection failed')
        }

        // Retry logic for specific errors
        if (
          attempt < retries &&
          (error.status >= 500 || error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT')
        ) {
          console.log(`🔧 [API] RETRY - Attempt ${attempt + 1}/${retries} after ${retryDelay}ms`)
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
          return makeRequest(attempt + 1)
        }

        // Re-throw API errors
        if (error instanceof APIError) {
          throw error
        }

        // Wrap unknown errors
        throw new APIError(500, 'UNKNOWN_ERROR', error.message || 'Unknown error occurred')
      }
    }

    return makeRequest(1)
  }

  // HTTP method helpers
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

// Create singleton instance
const apiClient = new APIClient()

/**
 * FitForge API methods
 */
export const api = {
  // Set authentication token
  setAuthToken: (token: string | null) => apiClient.setAuthToken(token),

  // User endpoints
  users: {
    getProfile: () => apiClient.get<User>('/users/me'),
    updateProfile: (data: UserUpdate) => apiClient.put<User>('/users/me', data),
    getStats: () => apiClient.get<any>('/users/me/stats'),
  },

  // Exercise endpoints
  exercises: {
    list: (params?: {
      category?: string
      equipment?: string
      difficulty?: string
      muscle_group?: string
      limit?: number
      offset?: number
    }) => {
      const query = new URLSearchParams(params as any).toString()
      return apiClient.get<Exercise[]>(`/exercises${query ? `?${query}` : ''}`)
    },
    get: (id: string) => apiClient.get<Exercise>(`/exercises/${id}`),
    search: (query: string) => apiClient.get<Exercise[]>(`/exercises/search?q=${encodeURIComponent(query)}`),
    getMuscleEngagement: (id: string) => apiClient.get<any>(`/exercises/${id}/muscle-engagement`),
  },

  // Workout endpoints
  workouts: {
    list: (params?: {
      user_id?: string
      workout_type?: string
      start_date?: string
      end_date?: string
      is_completed?: boolean
      limit?: number
      offset?: number
    }) => {
      const query = new URLSearchParams(params as any).toString()
      return apiClient.get<Workout[]>(`/workouts${query ? `?${query}` : ''}`)
    },
    get: (id: string) => apiClient.get<Workout>(`/workouts/${id}`),
    create: (data: WorkoutInsert) => apiClient.post<Workout>('/workouts', data),
    complete: (id: string, data?: { notes?: string, energy_level?: number }) => 
      apiClient.post<Workout>(`/workouts/${id}/complete`, data),
  },

  // Workout set endpoints
  workoutSets: {
    list: (params?: {
      workout_id?: string
      exercise_id?: string
      limit?: number
      offset?: number
    }) => {
      const query = new URLSearchParams(params as any).toString()
      return apiClient.get<WorkoutSet[]>(`/workout-sets${query ? `?${query}` : ''}`)
    },
    get: (id: string) => apiClient.get<WorkoutSet>(`/workout-sets/${id}`),
    create: (data: WorkoutSetInsert) => apiClient.post<WorkoutSet>('/workout-sets', data),
    update: (id: string, data: Partial<WorkoutSetInsert>) => 
      apiClient.put<WorkoutSet>(`/workout-sets/${id}`, data),
    delete: (id: string) => apiClient.delete<void>(`/workout-sets/${id}`),
  },

  // Analytics endpoints
  analytics: {
    getMuscleFatigue: (userId: string) => 
      apiClient.get<MuscleState[]>(`/analytics/muscle-fatigue/${userId}`),
    getWorkoutRecommendations: (userId: string, params?: { available_minutes?: number }) => {
      const query = new URLSearchParams(params as any).toString()
      return apiClient.get<any>(`/analytics/workout-recommendations/${userId}${query ? `?${query}` : ''}`)
    },
    getProgress: (userId: string, weeks: number = 12) => 
      apiClient.get<any>(`/analytics/progress/${userId}?weeks=${weeks}`),
    getMuscleHeatmap: (userId: string) => 
      apiClient.get<any>(`/analytics/muscle-heatmap/${userId}`),
    calculateFatigue: () => 
      apiClient.post<any>('/analytics/calculate-fatigue'),
  },

  // Health check
  health: {
    check: () => apiClient.get<any>('/health'),
  },
}

// Export error class for external use
export { APIError as ApiError }