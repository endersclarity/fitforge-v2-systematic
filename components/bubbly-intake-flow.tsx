'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  Heart, 
  Dumbbell, 
  Target, 
  Calendar,
  Home,
  Building,
  Zap,
  Trophy,
  Clock,
  User,
  ArrowRight,
  Star,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"

interface UserProfile {
  name: string
  age: number
  primaryGoal: string
  experienceLevel: string
  weeklyWorkouts: number
  availableEquipment: string[]
}

const questions = [
  {
    id: 'name',
    title: "Hi there! 👋",
    subtitle: "What should we call you?",
    type: 'text',
    placeholder: "Your name"
  },
  {
    id: 'age', 
    title: "Nice to meet you! 🎉",
    subtitle: "How old are you?",
    type: 'number',
    placeholder: "25"
  },
  {
    id: 'goal',
    title: "What's your main fitness goal? 🎯",
    subtitle: "Choose the one that excites you most",
    type: 'cards',
    options: [
      { value: 'strength', label: 'Build Strength', icon: Dumbbell, color: 'from-orange-400 to-orange-600' },
      { value: 'hypertrophy', label: 'Build Muscle', icon: Zap, color: 'from-red-400 to-red-600' },
      { value: 'endurance', label: 'Improve Endurance', icon: Heart, color: 'from-green-400 to-green-600' },
      { value: 'weight_loss', label: 'Lose Weight', icon: Target, color: 'from-blue-400 to-blue-600' },
      { value: 'general_fitness', label: 'General Fitness', icon: Star, color: 'from-purple-400 to-purple-600' }
    ]
  },
  {
    id: 'experience',
    title: "How would you describe yourself? 💪",
    subtitle: "No judgment here - we all start somewhere!",
    type: 'cards',
    options: [
      { value: 'beginner', label: 'Beginner', subtitle: 'Just getting started', icon: Sparkles, color: 'from-green-400 to-green-600' },
      { value: 'intermediate', label: 'Intermediate', subtitle: 'Some experience', icon: Trophy, color: 'from-yellow-400 to-yellow-600' },
      { value: 'advanced', label: 'Advanced', subtitle: 'Very experienced', icon: Zap, color: 'from-red-400 to-red-600' }
    ]
  },
  {
    id: 'frequency',
    title: "How often do you want to work out? 📅",
    subtitle: "Be realistic - consistency beats intensity!",
    type: 'cards',
    options: [
      { value: '2', label: '2 days/week', subtitle: 'Perfect start', icon: Calendar, color: 'from-green-400 to-green-600' },
      { value: '3', label: '3 days/week', subtitle: 'Great balance', icon: Calendar, color: 'from-blue-400 to-blue-600' },
      { value: '4', label: '4 days/week', subtitle: 'Solid routine', icon: Calendar, color: 'from-purple-400 to-purple-600' },
      { value: '5', label: '5+ days/week', subtitle: 'High commitment', icon: Calendar, color: 'from-red-400 to-red-600' }
    ]
  },
  {
    id: 'equipment',
    title: "What equipment do you have? 🏋️",
    subtitle: "Select all that apply - we'll customize everything for you!",
    type: 'multi-select',
    options: [
      { value: 'Bodyweight Only', label: 'Bodyweight Only', icon: User, color: 'from-green-400 to-green-600' },
      { value: 'Dumbbells', label: 'Dumbbells', icon: Dumbbell, color: 'from-blue-400 to-blue-600' },
      { value: 'Resistance Bands', label: 'Resistance Bands', icon: Zap, color: 'from-purple-400 to-purple-600' },
      { value: 'Pull-up Bar', label: 'Pull-up Bar', icon: Target, color: 'from-orange-400 to-orange-600' },
      { value: 'Home Gym', label: 'Home Gym', icon: Home, color: 'from-teal-400 to-teal-600' },
      { value: 'Full Gym Access', label: 'Full Gym', icon: Building, color: 'from-red-400 to-red-600' }
    ]
  }
]

export function BubblyIntakeFlow() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    availableEquipment: []
  })
  const [textInput, setTextInput] = useState('')
  const [isCompleting, setIsCompleting] = useState(false)

  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswer = (field: string, value: any) => {
    // Map question IDs to correct profile field names
    const fieldMapping: Record<string, string> = {
      'goal': 'primaryGoal',
      'experience': 'experienceLevel', 
      'frequency': 'weeklyWorkouts'
    }
    
    const correctField = fieldMapping[field] || field
    setProfile(prev => ({ ...prev, [correctField]: value }))
    
    // Auto-advance for most question types
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(curr => curr + 1)
        setTextInput('')
      }, 600) // Small delay for satisfying feedback
    }
  }

  const handleTextSubmit = () => {
    const question = questions[currentQuestion]
    if (!textInput.trim()) return

    if (question.id === 'name') {
      handleAnswer('name', textInput)
    } else if (question.id === 'age') {
      const age = parseInt(textInput)
      if (age > 0 && age < 120) {
        handleAnswer('age', age)
      }
    }
  }

  const handleMultiSelect = (value: string) => {
    const current = profile.availableEquipment || []
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value]
    
    setProfile(prev => ({ ...prev, availableEquipment: updated }))
  }

  const completeSetup = async () => {
    setIsCompleting(true)
    
    try {
      // Convert frequency to number
      const finalProfile = {
        ...profile,
        weeklyWorkouts: parseInt(profile.weeklyWorkouts as any) || 3
      }
      
      localStorage.setItem('userProfile', JSON.stringify(finalProfile))
      console.log('✅ FitForge: Bubbly intake profile saved:', finalProfile)
      
      toast.success(`Welcome to FitForge, ${profile.name}! 🎉`)
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
      
    } catch (error) {
      console.error('🚨 FitForge: Error saving profile:', error)
      toast.error("Oops! Something went wrong. Please try again.")
      setIsCompleting(false)
    }
  }

  const question = questions[currentQuestion]
  const isLastQuestion = currentQuestion === questions.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              {/* Question Header */}
              <div className="text-center mb-8">
                <motion.h1
                  className="text-2xl font-bold text-gray-900 mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {question.title}
                </motion.h1>
                <motion.p
                  className="text-gray-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {question.subtitle}
                </motion.p>
              </div>

              {/* Question Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {question.type === 'text' || question.type === 'number' ? (
                  <div className="space-y-4">
                    <Input
                      type={question.type}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={question.placeholder}
                      className="text-lg py-6 text-center border-2 focus:border-blue-400"
                      onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                      autoFocus
                    />
                    <Button
                      onClick={handleTextSubmit}
                      disabled={!textInput.trim()}
                      className="w-full py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                ) : question.type === 'cards' ? (
                  <div className="space-y-3">
                    {question.options?.map((option, index) => {
                      const IconComponent = option.icon
                      return (
                        <motion.button
                          key={option.value}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer(question.id, option.value)}
                          className={`w-full p-4 rounded-xl border-2 border-gray-200 hover:border-transparent
                            bg-gradient-to-r ${option.color} hover:shadow-lg transition-all duration-200
                            text-white font-medium flex items-center justify-between group`}
                        >
                          <div className="flex items-center">
                            <IconComponent className="h-6 w-6 mr-3" />
                            <div className="text-left">
                              <div className="font-semibold">{option.label}</div>
                              {option.subtitle && (
                                <div className="text-sm opacity-90">{option.subtitle}</div>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                      )
                    })}
                  </div>
                ) : question.type === 'multi-select' ? (
                  <div className="space-y-3">
                    {question.options?.map((option, index) => {
                      const IconComponent = option.icon
                      const isSelected = profile.availableEquipment?.includes(option.value)
                      
                      return (
                        <motion.button
                          key={option.value}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleMultiSelect(option.value)}
                          className={`w-full p-4 rounded-xl border-2 transition-all duration-200
                            ${isSelected 
                              ? `bg-gradient-to-r ${option.color} text-white border-transparent shadow-lg` 
                              : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                            }`}
                        >
                          <div className="flex items-center">
                            <IconComponent className="h-6 w-6 mr-3" />
                            <div className="font-medium">{option.label}</div>
                          </div>
                        </motion.button>
                      )
                    })}
                    
                    {profile.availableEquipment && profile.availableEquipment.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-4"
                      >
                        <Button
                          onClick={completeSetup}
                          disabled={isCompleting}
                          className="w-full py-6 text-lg bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                        >
                          {isCompleting ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                              Setting up your profile...
                            </div>
                          ) : (
                            <>
                              Complete Setup 🎉
                              <Sparkles className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                ) : null}
              </motion.div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}