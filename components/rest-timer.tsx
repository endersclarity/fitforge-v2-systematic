'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, RotateCcw, Plus, Minus, Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface RestTimerProps {
  onComplete?: () => void
  autoStart?: boolean
  className?: string
}

export function RestTimer({ onComplete, autoStart = false, className = '' }: RestTimerProps) {
  const [duration, setDuration] = useState(90) // Default 90 seconds
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load user preferences from localStorage
  useEffect(() => {
    const savedDuration = localStorage.getItem('fitforge-rest-timer-duration')
    if (savedDuration) {
      const parsedDuration = parseInt(savedDuration)
      if (parsedDuration >= 30 && parsedDuration <= 300) { // 30 seconds to 5 minutes
        setDuration(parsedDuration)
        setTimeLeft(parsedDuration)
      }
    }
  }, [])

  // Auto-start timer if requested
  useEffect(() => {
    if (autoStart && !isRunning && !isCompleted) {
      startTimer()
    }
  }, [autoStart])

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsCompleted(true)
            playCompletionSound()
            onComplete?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft, onComplete])

  const startTimer = () => {
    setIsRunning(true)
    setIsCompleted(false)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsCompleted(false)
    setTimeLeft(duration)
  }

  const adjustDuration = (change: number) => {
    const newDuration = Math.max(30, Math.min(300, duration + change))
    setDuration(newDuration)
    setTimeLeft(newDuration)
    
    // Save to localStorage
    localStorage.setItem('fitforge-rest-timer-duration', newDuration.toString())
  }

  const playCompletionSound = () => {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log('Audio notification not available')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = ((duration - timeLeft) / duration) * 100

  return (
    <Card className={`bg-fitbod-card border-fitbod-subtle ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Timer Display */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-32 h-32">
              {/* Circular Progress Background */}
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-fitbod-subtle"
                />
                {/* Progress Circle */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className={isCompleted ? "text-green-500" : "text-fitbod-accent"}
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                  animate={{ 
                    strokeDashoffset: 2 * Math.PI * 45 * (1 - progressPercentage / 100) 
                  }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
              
              {/* Time Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="text-center"
                  animate={{ 
                    scale: isCompleted ? [1, 1.1, 1] : 1 
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-2xl font-bold text-fitbod-text">
                    {formatTime(timeLeft)}
                  </div>
                  {isCompleted && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-green-500 text-sm font-medium"
                    >
                      Rest Complete!
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Status Badge */}
            <AnimatePresence>
              {isRunning && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge className="bg-fitbod-accent text-white">
                    Rest Timer Active
                  </Badge>
                </motion.div>
              )}
              {isCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge className="bg-green-500 text-white">
                    <Bell className="w-3 h-3 mr-1" />
                    Ready for Next Set!
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Duration Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustDuration(-15)}
                disabled={isRunning}
                className="h-8 w-8 p-0 border-fitbod-subtle text-fitbod-text hover:bg-fitbod-subtle"
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-fitbod-text-secondary">Duration:</span>
                <span className="text-sm font-medium text-fitbod-text min-w-[3rem] text-center">
                  {formatTime(duration)}
                </span>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustDuration(15)}
                disabled={isRunning}
                className="h-8 w-8 p-0 border-fitbod-subtle text-fitbod-text hover:bg-fitbod-subtle"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="text-xs text-center text-fitbod-text-secondary">
              Adjust in 15-second increments (30s - 5min)
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center space-x-3">
            {!isRunning ? (
              <Button
                onClick={startTimer}
                className="bg-fitbod-accent hover:bg-red-600 text-white px-6"
                disabled={isCompleted && timeLeft === 0}
              >
                <Play className="w-4 h-4 mr-2" />
                {isCompleted ? 'Start New Timer' : 'Start'}
              </Button>
            ) : (
              <Button
                onClick={pauseTimer}
                variant="outline"
                className="border-fitbod-subtle text-fitbod-text hover:bg-fitbod-subtle px-6"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            
            <Button
              onClick={resetTimer}
              variant="outline"
              className="border-fitbod-subtle text-fitbod-text hover:bg-fitbod-subtle"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}