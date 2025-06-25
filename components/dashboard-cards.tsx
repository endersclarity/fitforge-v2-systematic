'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Dumbbell, 
  Search, 
  TrendingUp, 
  Zap,
  ArrowRight,
  Play,
  Plus,
  BarChart3,
  Target,
  Calendar,
  Clock,
  Trophy
} from "lucide-react"
import { useRouter } from "next/navigation"

interface UserProfile {
  name?: string
  primaryGoal?: string
  experienceLevel?: string
  weeklyWorkouts?: number
  availableEquipment?: string[]
}

export function DashboardCards() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>({})
  const [recentWorkouts, setRecentWorkouts] = useState(0)

  useEffect(() => {
    try {
      const userProfile = localStorage.getItem('userProfile')
      if (userProfile) {
        setProfile(JSON.parse(userProfile))
      }

      // Count recent workouts
      const workouts = JSON.parse(localStorage.getItem("workoutSessions") || "[]")
      setRecentWorkouts(workouts.length)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }, [])

  const cards = [
    {
      id: 'workouts',
      title: 'Workouts',
      subtitle: 'Templates & routines',
      description: 'Saved workout templates, push/pull/legs, and custom routines',
      icon: Dumbbell,
      color: 'from-blue-500 to-blue-600',
      action: () => router.push('/push-pull-legs'),
      stats: `${recentWorkouts} logged`,
      badge: 'Start Training'
    },
    {
      id: 'library',
      title: 'Exercise Library',
      subtitle: 'Browse & discover',
      description: 'Filter by equipment and muscle groups to find perfect exercises',
      icon: Search,
      color: 'from-green-500 to-green-600',
      action: () => router.push('/muscle-explorer'),
      stats: '38 exercises',
      badge: 'Explore'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      subtitle: 'Progress & insights',
      description: 'Muscle maps, volume tracking, and strength progression charts',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      action: () => router.push('/analytics'),
      stats: 'Track progress',
      badge: 'View Data'
    },
    {
      id: 'quicklog',
      title: 'Quick Log',
      subtitle: 'Fast workout entry',
      description: 'Log exercises quickly with progressive overload suggestions',
      icon: Zap,
      color: 'from-orange-500 to-orange-600',
      action: () => router.push('/workout-simple'),
      stats: 'Log anywhere',
      badge: 'Quick Start'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back{profile.name ? `, ${profile.name}` : ''}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Ready to crush your {profile.primaryGoal || 'fitness'} goals?
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8"
        >
          {cards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <motion.div
                key={card.id}
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="p-8 h-full cursor-pointer border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group">
                  <div className="flex flex-col h-full">
                    {/* Icon & Badge */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${card.color} shadow-lg`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                        {card.stats}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-gray-500 font-medium mb-3">
                        {card.subtitle}
                      </p>
                      <p className="text-gray-600 leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={card.action}
                      className={`w-full py-6 text-lg font-semibold bg-gradient-to-r ${card.color} hover:shadow-lg transition-all duration-200 group`}
                    >
                      <span className="mr-2">{card.badge}</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="p-4 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Goal</p>
                <p className="font-semibold text-gray-900 capitalize">{profile.primaryGoal || 'Set in intake'}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="font-semibold text-gray-900 capitalize">{profile.experienceLevel || 'Beginner'}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Frequency</p>
                <p className="font-semibold text-gray-900">{profile.weeklyWorkouts || 3} days/week</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Equipment</p>
                <p className="font-semibold text-gray-900">{profile.availableEquipment?.length || 0} types</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}