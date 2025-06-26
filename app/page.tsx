'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function Home() {
  const router = useRouter()
  const [showButtons, setShowButtons] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [userProfile, setUserProfile] = useState(null)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    let loadingTimer: NodeJS.Timeout
    let profileTimer: NodeJS.Timeout
    let timeoutTimer: NodeJS.Timeout

    const checkProfile = async () => {
      try {
        console.log('🔍 FitForge: Checking localStorage for user profile...')
        
        // Check if localStorage is available
        if (typeof Storage === 'undefined') {
          throw new Error('localStorage is not supported in this browser')
        }

        // Test localStorage access
        try {
          localStorage.setItem('fitforge-test', 'test')
          localStorage.removeItem('fitforge-test')
        } catch (storageError) {
          throw new Error('localStorage access is blocked or disabled')
        }

        const profileData = localStorage.getItem('userProfile')
        
        if (profileData) {
          let profile
          try {
            profile = JSON.parse(profileData)
          } catch (parseError) {
            console.error('🚨 FitForge: Invalid profile data format:', parseError)
            // Clear corrupted data
            localStorage.removeItem('userProfile')
            setUserProfile(null)
            setShowLoading(false)
            setShowButtons(true)
            return
          }

          // Validate profile structure
          if (profile && typeof profile === 'object') {
            console.log('✅ FitForge: User profile found:', profile)
            setUserProfile(profile)
            setUserName(profile.name || 'User')
          } else {
            console.warn('🚨 FitForge: Invalid profile structure, treating as new user')
            localStorage.removeItem('userProfile')
            setUserProfile(null)
          }
        } else {
          console.log('❌ FitForge: No user profile found - new user')
          setUserProfile(null)
        }
        
        setShowLoading(false)
        setShowButtons(true)
        
      } catch (error) {
        console.error('🚨 FitForge: Critical error during profile check:', error)
        setErrorMessage(error.message || 'An unexpected error occurred')
        setHasError(true)
        setShowLoading(false)
        setShowButtons(true)
        // Default to new user flow on any error
        setUserProfile(null)
      }
    }

    // Show loading indicator after 1 second
    loadingTimer = setTimeout(() => {
      setShowLoading(true)
    }, 1000)

    // Check profile data after 2.5 seconds
    profileTimer = setTimeout(checkProfile, 2500)

    // Timeout fallback after 8 seconds
    timeoutTimer = setTimeout(() => {
      if (!showButtons && !hasError) {
        console.warn('🚨 FitForge: Profile check timeout, defaulting to new user flow')
        setErrorMessage('Profile check is taking longer than expected')
        setShowLoading(false)
        setShowButtons(true)
        setUserProfile(null)
      }
    }, 8000)

    return () => {
      clearTimeout(loadingTimer)
      clearTimeout(profileTimer)
      clearTimeout(timeoutTimer)
    }
  }, [])

  const handleWelcomeBack = () => {
    try {
      console.log('🏠 FitForge: Navigating to main app for returning user')
      setIsNavigating(true)
      setHasError(false) // Clear any previous errors
      
      setTimeout(() => {
        try {
          router.push('/dashboard')
        } catch (navError) {
          console.error('🚨 FitForge: Navigation error to dashboard:', navError)
          setErrorMessage('Unable to navigate to dashboard. Please try again.')
          setHasError(true)
          setIsNavigating(false)
        }
      }, 800)
    } catch (error) {
      console.error('🚨 FitForge: Error in handleWelcomeBack:', error)
      setErrorMessage('Navigation failed. Please refresh the page.')
      setHasError(true)
      setIsNavigating(false)
    }
  }

  const handleGetStarted = () => {
    try {
      console.log('🚀 FitForge: Navigating to intake form for new user')
      setIsNavigating(true)
      setHasError(false) // Clear any previous errors
      
      setTimeout(() => {
        try {
          router.push('/intake')
        } catch (navError) {
          console.error('🚨 FitForge: Navigation error to intake:', navError)
          setErrorMessage('Unable to navigate to setup. Please try again.')
          setHasError(true)
          setIsNavigating(false)
        }
      }, 800)
    } catch (error) {
      console.error('🚨 FitForge: Error in handleGetStarted:', error)
      setErrorMessage('Navigation failed. Please refresh the page.')
      setHasError(true)
      setIsNavigating(false)
    }
  }

  const handleRetry = () => {
    console.log('🔄 FitForge: Retrying profile check...')
    setHasError(false)
    setErrorMessage('')
    setShowButtons(false)
    setShowLoading(true)
    
    // Retry profile check after a short delay
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative">
      <div className="w-full h-screen relative">
        <Image
          src="/splashscreen_bunq.png"
          alt="FitForge - Colorful splash screen"
          fill
          className="object-cover object-center"
          priority
          quality={100}
          unoptimized={true}
        />
        
        {/* Loading Indicator */}
        {showLoading && !showButtons && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-40 bg-black/30">
            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
              <p className="text-white/80 text-sm font-medium">Checking your profile...</p>
            </motion.div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-32 bg-black/40">
            <motion.div
              className="text-center space-y-6 px-6 max-w-md"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 space-y-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">Something went wrong</h3>
                  <p className="text-white/80 text-sm">{errorMessage}</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleRetry}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={handleGetStarted}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Continue Anyway
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Welcome Buttons Overlay */}
        {showButtons && !hasError && (
          <motion.div 
            className="absolute inset-0 flex flex-col items-center justify-end pb-32 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: isNavigating ? 0 : 1,
              scale: isNavigating ? 0.95 : 1
            }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="text-center space-y-6 px-6"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: 0.2
              }}
            >
              {userProfile ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Button
                    onClick={handleWelcomeBack}
                    disabled={isNavigating}
                    className="w-64 h-16 bg-[#FF375F] hover:bg-[#E63050] text-white text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50"
                  >
                    {isNavigating ? 'Loading...' : `Welcome Back, ${userName}`}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Button
                    onClick={handleGetStarted}
                    disabled={isNavigating}
                    className="w-64 h-16 bg-[#FF375F] hover:bg-[#E63050] text-white text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50"
                  >
                    {isNavigating ? 'Loading...' : 'Get Started'}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
