'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function Home() {
  const router = useRouter()
  const [showButtons, setShowButtons] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Show splash for 2 seconds, then check for profile data
    const timer = setTimeout(() => {
      try {
        console.log('🔍 FitForge: Checking localStorage for user profile...')
        const profileData = localStorage.getItem('userProfile')
        
        if (profileData) {
          const profile = JSON.parse(profileData)
          console.log('✅ FitForge: User profile found:', profile)
          setUserProfile(profile)
          setUserName(profile.name || 'User')
        } else {
          console.log('❌ FitForge: No user profile found - new user')
          setUserProfile(null)
        }
        
        setShowButtons(true)
      } catch (error) {
        console.error('🚨 FitForge: Error checking profile data:', error)
        setUserProfile(null)
        setShowButtons(true)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleWelcomeBack = () => {
    console.log('🏠 FitForge: Navigating to main app for returning user')
    router.push('/dashboard')
  }

  const handleGetStarted = () => {
    console.log('🚀 FitForge: Navigating to intake form for new user')
    router.push('/intake')
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
        
        {/* Welcome Buttons Overlay */}
        {showButtons && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-32 bg-black/30">
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
                    className="w-64 h-16 bg-[#FF375F] hover:bg-[#E63050] text-white text-lg font-semibold rounded-xl shadow-lg"
                  >
                    Welcome Back, {userName}
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
                    className="w-64 h-16 bg-[#FF375F] hover:bg-[#E63050] text-white text-lg font-semibold rounded-xl shadow-lg"
                  >
                    Get Started
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
