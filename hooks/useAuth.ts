/**
 * Mock Auth Hook
 * Simulates authentication for development
 */

import { useState, useEffect } from 'react'

interface AuthUser {
  id: string
  email: string
  displayName: string
}

interface UseAuthReturn {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate auth check
    setTimeout(() => {
      // Mock authenticated user
      setUser({
        id: 'user-123',
        email: 'demo@fitforge.app',
        displayName: 'FitForge User'
      })
      setIsLoading(false)
    }, 500)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 1000))
    setUser({
      id: 'user-123',
      email,
      displayName: email.split('@')[0]
    })
    setIsLoading(false)
  }

  const logout = async () => {
    setIsLoading(true)
    // Simulate logout
    await new Promise(resolve => setTimeout(resolve, 500))
    setUser(null)
    setIsLoading(false)
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  }
}