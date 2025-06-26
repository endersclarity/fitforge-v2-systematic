'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Play, 
  Dumbbell, 
  Users, 
  Clock,
  Target
} from "lucide-react"
import exercisesData from '@/data/exercises-real.json'

interface Exercise {
  id: string
  name: string
  category: string
  equipment: string
  difficulty: string
  variation: string
  muscleEngagement: Record<string, number>
}

export default function PullDayPage() {
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])

  useEffect(() => {
    // Filter BackBiceps exercises and organize by variation
    const backBicepsExercises = (exercisesData as Exercise[]).filter(
      exercise => exercise.category === 'BackBiceps'
    )
    setExercises(backBicepsExercises)
  }, [])

  // Organize exercises by variation
  const pullAExercises = exercises.filter(ex => ex.variation === 'A')
  const pullBExercises = exercises.filter(ex => ex.variation === 'B') 
  const sharedExercises = exercises.filter(ex => ex.variation === 'A/B')

  const getEquipmentIcon = (equipment: string) => {
    switch (equipment) {
      case 'Pull-up_Bar': return '🔥'
      case 'Dumbbell': return '🏋️'
      case 'TRX': return '⚡'
      case 'Bench': return '🪑'
      default: return '💪'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500'
      case 'Intermediate': return 'bg-yellow-500'
      case 'Advanced': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const startWorkout = (variation: 'A' | 'B') => {
    // Navigate to workout logger with specific pull variation
    router.push(`/workout-simple?category=pull&variation=${variation}`)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  }

  return (
    <div className="min-h-screen bg-fitbod-background text-fitbod-text p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="bg-fitbod-card border-fitbod-subtle text-fitbod-text hover:bg-fitbod-subtle"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-fitbod-text">Pull Day Workouts</h1>
            <p className="text-fitbod-text-secondary text-lg mt-2">
              Choose your pull day variation - vertical or horizontal focus
            </p>
          </div>
        </motion.div>

        {/* Workout Variations */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-8"
        >
          {/* Pull A Card */}
          <motion.div variants={cardVariants}>
            <Card className="bg-fitbod-card border-fitbod-subtle h-full">
              <CardHeader className="border-b border-fitbod-subtle">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-fitbod-text flex items-center gap-3">
                      <span className="text-3xl">🏋️</span>
                      Pull A - Vertical Focus
                    </CardTitle>
                    <p className="text-fitbod-text-secondary mt-2">
                      Wide grip pullups and vertical pulling emphasis
                    </p>
                  </div>
                  <Badge className="bg-blue-500 text-white">Variation A</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Pull A Specific Exercises */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-fitbod-text-secondary mb-3 uppercase tracking-wide">
                    A-Specific Exercises ({pullAExercises.length})
                  </h4>
                  <div className="space-y-3">
                    {pullAExercises.map((exercise) => (
                      <div key={exercise.id} className="flex items-center justify-between p-3 bg-fitbod-subtle rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getEquipmentIcon(exercise.equipment)}</span>
                          <div>
                            <p className="font-medium text-fitbod-text">{exercise.name}</p>
                            <p className="text-sm text-fitbod-text-secondary">{exercise.equipment}</p>
                          </div>
                        </div>
                        <Badge className={`${getDifficultyColor(exercise.difficulty)} text-white text-xs`}>
                          {exercise.difficulty}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shared A/B Exercises */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-fitbod-text-secondary mb-3 uppercase tracking-wide">
                    Additional Options ({sharedExercises.length})
                  </h4>
                  <div className="space-y-2">
                    {sharedExercises.map((exercise) => (
                      <div key={`a-${exercise.id}`} className="flex items-center justify-between p-2 bg-fitbod-background rounded-md">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{getEquipmentIcon(exercise.equipment)}</span>
                          <span className="text-sm text-fitbod-text">{exercise.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs border-fitbod-subtle text-fitbod-text-secondary">
                          {exercise.equipment}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <Button 
                  onClick={() => startWorkout('A')}
                  className="w-full py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Pull A Workout
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pull B Card */}
          <motion.div variants={cardVariants}>
            <Card className="bg-fitbod-card border-fitbod-subtle h-full">
              <CardHeader className="border-b border-fitbod-subtle">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-fitbod-text flex items-center gap-3">
                      <span className="text-3xl">⚡</span>
                      Pull B - Horizontal Focus
                    </CardTitle>
                    <p className="text-fitbod-text-secondary mt-2">
                      Chin-ups, rows and horizontal pulling emphasis
                    </p>
                  </div>
                  <Badge className="bg-purple-500 text-white">Variation B</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Pull B Specific Exercises */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-fitbod-text-secondary mb-3 uppercase tracking-wide">
                    B-Specific Exercises ({pullBExercises.length})
                  </h4>
                  <div className="space-y-3">
                    {pullBExercises.map((exercise) => (
                      <div key={exercise.id} className="flex items-center justify-between p-3 bg-fitbod-subtle rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getEquipmentIcon(exercise.equipment)}</span>
                          <div>
                            <p className="font-medium text-fitbod-text">{exercise.name}</p>
                            <p className="text-sm text-fitbod-text-secondary">{exercise.equipment}</p>
                          </div>
                        </div>
                        <Badge className={`${getDifficultyColor(exercise.difficulty)} text-white text-xs`}>
                          {exercise.difficulty}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shared A/B Exercises */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-fitbod-text-secondary mb-3 uppercase tracking-wide">
                    Additional Options ({sharedExercises.length})
                  </h4>
                  <div className="space-y-2">
                    {sharedExercises.map((exercise) => (
                      <div key={`b-${exercise.id}`} className="flex items-center justify-between p-2 bg-fitbod-background rounded-md">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{getEquipmentIcon(exercise.equipment)}</span>
                          <span className="text-sm text-fitbod-text">{exercise.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs border-fitbod-subtle text-fitbod-text-secondary">
                          {exercise.equipment}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <Button 
                  onClick={() => startWorkout('B')}
                  className="w-full py-6 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Pull B Workout  
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card className="p-4 bg-fitbod-card border-fitbod-subtle text-center">
            <div className="text-2xl font-bold text-fitbod-accent">{pullAExercises.length}</div>
            <div className="text-sm text-fitbod-text-secondary">Pull A Exercises</div>
          </Card>
          <Card className="p-4 bg-fitbod-card border-fitbod-subtle text-center">
            <div className="text-2xl font-bold text-fitbod-accent">{pullBExercises.length}</div>
            <div className="text-sm text-fitbod-text-secondary">Pull B Exercises</div>
          </Card>
          <Card className="p-4 bg-fitbod-card border-fitbod-subtle text-center">
            <div className="text-2xl font-bold text-fitbod-accent">{sharedExercises.length}</div>
            <div className="text-sm text-fitbod-text-secondary">Shared A/B</div>
          </Card>
          <Card className="p-4 bg-fitbod-card border-fitbod-subtle text-center">
            <div className="text-2xl font-bold text-fitbod-accent">{exercises.length}</div>
            <div className="text-sm text-fitbod-text-secondary">Total Pull Exercises</div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}