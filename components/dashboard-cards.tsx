'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FlowingMenu, defaultDashboardMenuItems } from "./flowing-menu"
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


  return (
    <div className="min-h-screen bg-fitbod-background text-fitbod-text p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-fitbod-text mb-2">
            Welcome back{profile.name ? `, ${profile.name}` : ''}! 👋
          </h1>
          <p className="text-fitbod-text-secondary text-lg">
            Ready to crush your {profile.primaryGoal || 'fitness'} goals?
          </p>
        </motion.div>

        {/* Flowing Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <FlowingMenu 
            items={defaultDashboardMenuItems}
            className="max-w-4xl mx-auto"
          />
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="p-4 bg-fitbod-card border border-fitbod-subtle">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-fitbod-accent mr-3" />
              <div>
                <p className="text-sm text-fitbod-text-secondary">Goal</p>
                <p className="font-semibold text-fitbod-text capitalize">{profile.primaryGoal || 'Set in intake'}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-fitbod-card border border-fitbod-subtle">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-fitbod-accent mr-3" />
              <div>
                <p className="text-sm text-fitbod-text-secondary">Level</p>
                <p className="font-semibold text-fitbod-text capitalize">{profile.experienceLevel || 'Beginner'}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-fitbod-card border border-fitbod-subtle">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-fitbod-accent mr-3" />
              <div>
                <p className="text-sm text-fitbod-text-secondary">Frequency</p>
                <p className="font-semibold text-fitbod-text">{profile.weeklyWorkouts || 3} days/week</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-fitbod-card border border-fitbod-subtle">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-fitbod-accent mr-3" />
              <div>
                <p className="text-sm text-fitbod-text-secondary">Equipment</p>
                <p className="font-semibold text-fitbod-text">{profile.availableEquipment?.length || 0} types</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}