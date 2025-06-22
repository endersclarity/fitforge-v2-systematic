/**
 * Exercise Search Hook
 * Handles search, filtering, caching, and pagination for exercises
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Exercise } from '@/schemas/typescript-interfaces'
import { api } from '@/lib/api-client'
import { useDebounce } from '@/hooks/useDebounce'

// Cache configuration
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes
const SEARCH_DEBOUNCE_MS = 300
const RECENT_EXERCISES_KEY = 'fitforge:recent_exercises'
const FREQUENT_EXERCISES_KEY = 'fitforge:frequent_exercises'
const MAX_RECENT_EXERCISES = 10
const MAX_FREQUENT_EXERCISES = 20

interface ExerciseFilters {
  category?: string
  equipment?: string
  difficulty?: string
  muscleGroup?: string
  variation?: string
  isCompound?: boolean
  movementPattern?: string
}

interface UseExerciseSearchOptions {
  initialFilters?: ExerciseFilters
  pageSize?: number
  enableCache?: boolean
  enableRecent?: boolean
  enableFrequent?: boolean
}

interface CacheEntry<T> {
  data: T
  timestamp: number
}

interface ExerciseSearchResult {
  exercises: Exercise[]
  loading: boolean
  error: string | null
  
  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchSuggestions: string[]
  
  // Filters
  filters: ExerciseFilters
  setFilters: (filters: ExerciseFilters) => void
  clearFilters: () => void
  activeFilterCount: number
  
  // Pagination
  page: number
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
  
  // Special collections
  recentExercises: Exercise[]
  frequentExercises: Exercise[]
  
  // Metadata
  totalCount: number
  isSearching: boolean
}

// Simple in-memory cache
const cache = new Map<string, CacheEntry<Exercise[]>>()

function getCacheKey(query: string, filters: ExerciseFilters): string {
  return JSON.stringify({ query, filters })
}

function isValidCache(entry: CacheEntry<any> | undefined): boolean {
  if (!entry) return false
  return Date.now() - entry.timestamp < CACHE_DURATION
}

export function useExerciseSearch(options: UseExerciseSearchOptions = {}): ExerciseSearchResult {
  const {
    initialFilters = {},
    pageSize = 20,
    enableCache = true,
    enableRecent = true,
    enableFrequent = true
  } = options

  // State
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ExerciseFilters>(initialFilters)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [recentExercises, setRecentExercises] = useState<Exercise[]>([])
  const [frequentExercises, setFrequentExercises] = useState<Exercise[]>([])

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null)
  const loadingRef = useRef(false)

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS)

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== undefined && value !== '').length
  }, [filters])

  // Load recent and frequent exercises from localStorage
  useEffect(() => {
    if (!enableRecent && !enableFrequent) return

    try {
      if (enableRecent) {
        const recentData = localStorage.getItem(RECENT_EXERCISES_KEY)
        if (recentData) {
          setRecentExercises(JSON.parse(recentData))
        }
      }

      if (enableFrequent) {
        const frequentData = localStorage.getItem(FREQUENT_EXERCISES_KEY)
        if (frequentData) {
          setFrequentExercises(JSON.parse(frequentData))
        }
      }
    } catch (err) {
      console.error('Failed to load exercise history:', err)
    }
  }, [enableRecent, enableFrequent])

  // Fetch exercises
  const fetchExercises = useCallback(async (
    query: string,
    currentFilters: ExerciseFilters,
    currentPage: number,
    append: boolean = false
  ) => {
    // Prevent duplicate requests
    if (loadingRef.current) return
    loadingRef.current = true

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    const cacheKey = getCacheKey(query, currentFilters)
    
    // Check cache for first page
    if (enableCache && currentPage === 0 && !append) {
      const cached = cache.get(cacheKey)
      if (isValidCache(cached)) {
        console.log('🔥 [useExerciseSearch] CACHE HIT:', cacheKey)
        setExercises(cached.data)
        setHasMore(cached.data.length >= pageSize)
        loadingRef.current = false
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔥 [useExerciseSearch] FETCH - query:', query, 'filters:', currentFilters, 'page:', currentPage)

      let results: Exercise[] = []

      if (query) {
        // Use search endpoint
        results = await api.exercises.search(query)
      } else {
        // Use list endpoint with filters
        const params = {
          ...currentFilters,
          muscle_group: currentFilters.muscleGroup,
          limit: pageSize,
          offset: currentPage * pageSize
        }
        
        // Clean up undefined values
        Object.keys(params).forEach(key => {
          if (params[key as keyof typeof params] === undefined) {
            delete params[key as keyof typeof params]
          }
        })

        results = await api.exercises.list(params)
      }

      console.log('🔧 [useExerciseSearch] RESULTS:', results.length, 'exercises')

      // Update state
      if (append) {
        setExercises(prev => [...prev, ...results])
      } else {
        setExercises(results)
        
        // Cache first page results
        if (enableCache && currentPage === 0) {
          cache.set(cacheKey, {
            data: results,
            timestamp: Date.now()
          })
        }
      }

      setHasMore(results.length >= pageSize)
      setTotalCount(prev => append ? prev + results.length : results.length)

      // Generate search suggestions from results
      if (query && results.length > 0) {
        const suggestions = Array.from(new Set(
          results.flatMap(ex => [
            ex.name,
            ex.category,
            ex.equipment,
            ...ex.primary_muscles
          ])
        )).slice(0, 10)
        setSearchSuggestions(suggestions)
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('🚨 [useExerciseSearch] ERROR:', err)
        setError(err.message || 'Failed to fetch exercises')
      }
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [pageSize, enableCache])

  // Effect to fetch exercises when search or filters change
  useEffect(() => {
    setPage(0)
    fetchExercises(debouncedSearchQuery, filters, 0, false)
  }, [debouncedSearchQuery, filters, fetchExercises])

  // Load more function
  const loadMore = useCallback(() => {
    if (!hasMore || loading) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchExercises(debouncedSearchQuery, filters, nextPage, true)
  }, [page, hasMore, loading, debouncedSearchQuery, filters, fetchExercises])

  // Refresh function
  const refresh = useCallback(() => {
    // Clear cache for current query
    const cacheKey = getCacheKey(debouncedSearchQuery, filters)
    cache.delete(cacheKey)
    
    setPage(0)
    fetchExercises(debouncedSearchQuery, filters, 0, false)
  }, [debouncedSearchQuery, filters, fetchExercises])

  // Clear filters function
  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  // Track exercise usage
  const trackExerciseUsage = useCallback((exercise: Exercise) => {
    if (!enableRecent && !enableFrequent) return

    try {
      // Update recent exercises
      if (enableRecent) {
        const recent = JSON.parse(localStorage.getItem(RECENT_EXERCISES_KEY) || '[]')
        const filtered = recent.filter((ex: Exercise) => ex.id !== exercise.id)
        const updated = [exercise, ...filtered].slice(0, MAX_RECENT_EXERCISES)
        localStorage.setItem(RECENT_EXERCISES_KEY, JSON.stringify(updated))
        setRecentExercises(updated)
      }

      // Update frequent exercises (would need more sophisticated tracking in production)
      if (enableFrequent) {
        // This is a simplified version - in production, you'd track actual usage counts
        const frequent = JSON.parse(localStorage.getItem(FREQUENT_EXERCISES_KEY) || '[]')
        const exists = frequent.find((ex: Exercise) => ex.id === exercise.id)
        if (!exists) {
          const updated = [exercise, ...frequent].slice(0, MAX_FREQUENT_EXERCISES)
          localStorage.setItem(FREQUENT_EXERCISES_KEY, JSON.stringify(updated))
          setFrequentExercises(updated)
        }
      }
    } catch (err) {
      console.error('Failed to track exercise usage:', err)
    }
  }, [enableRecent, enableFrequent])

  return {
    exercises,
    loading,
    error,
    
    searchQuery,
    setSearchQuery,
    searchSuggestions,
    
    filters,
    setFilters,
    clearFilters,
    activeFilterCount,
    
    page,
    hasMore,
    loadMore,
    refresh,
    
    recentExercises,
    frequentExercises,
    
    totalCount,
    isSearching: !!debouncedSearchQuery
  }
}

// Export types for use in components
export type { ExerciseFilters, ExerciseSearchResult }