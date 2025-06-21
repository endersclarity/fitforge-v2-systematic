"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Target } from "lucide-react"

interface BasicMuscleMapProps {
  className?: string
  workoutData?: Record<string, number> // muscle name -> engagement level
}

// Simplified muscle groups for basic visualization
const MUSCLE_GROUPS = {
  'Upper Body': [
    'Pectoralis Major', 'Pectoralis_Major', 'Chest',
    'Anterior Deltoids', 'Anterior_Deltoids', 'Front Deltoids',
    'Triceps Brachii', 'Triceps_Brachii', 'Triceps',
    'Biceps Brachii', 'Biceps_Brachii', 'Biceps',
    'Latissimus Dorsi', 'Latissimus_Dorsi', 'Lats',
    'Rhomboids', 'Middle Trapezius', 'Trapezius',
    'Rear Deltoids', 'Rear_Deltoids'
  ],
  'Core': [
    'Rectus Abdominis', 'Rectus_Abdominis', 'Abs',
    'Transverse Abdominis', 'Transverse_Abdominis',
    'Obliques', 'External Obliques', 'Internal Obliques',
    'Erector Spinae', 'Erector_Spinae', 'Lower Back'
  ],
  'Lower Body': [
    'Quadriceps', 'Quads', 'Rectus Femoris',
    'Hamstrings', 'Biceps Femoris',
    'Glutes', 'Gluteus Maximus', 'Gluteus_Maximus',
    'Calves', 'Gastrocnemius', 'Soleus',
    'Hip Flexors', 'Hip_Flexors'
  ],
  'Stabilizers': [
    'Levator Scapulae', 'Levator_Scapulae',
    'Serratus Anterior', 'Serratus_Anterior',
    'Rotator Cuff', 'Rotator_Cuff'
  ]
}

export function BasicMuscleMap({ className, workoutData }: BasicMuscleMapProps) {
  const [muscleGroupData, setMuscleGroupData] = useState<Record<string, { engagement: number, muscles: string[] }>>({})
  const [lastWorkoutMuscles, setLastWorkoutMuscles] = useState<Record<string, number>>({})

  useEffect(() => {
    // If no workout data provided, load from last workout
    let muscleData = workoutData
    
    if (!muscleData) {
      const workouts = JSON.parse(localStorage.getItem("workoutSessions") || "[]")
      if (workouts.length > 0) {
        const lastWorkout = workouts[workouts.length - 1]
        const allMuscles: Record<string, number> = {}
        
        lastWorkout.exercises?.forEach((exercise: any) => {
          if (exercise.muscleEngagement) {
            Object.entries(exercise.muscleEngagement).forEach(([muscle, engagement]) => {
              allMuscles[muscle] = (allMuscles[muscle] || 0) + (engagement as number)
            })
          }
        })
        muscleData = allMuscles
      }
    }

    setLastWorkoutMuscles(muscleData || {})

    // Group muscles by body region
    const groupData: Record<string, { engagement: number, muscles: string[] }> = {}
    
    Object.entries(MUSCLE_GROUPS).forEach(([groupName, muscleList]) => {
      let totalEngagement = 0
      const activeMuscles: string[] = []
      
      Object.entries(muscleData || {}).forEach(([muscle, engagement]) => {
        // Check if this muscle belongs to this group (flexible matching)
        const belongsToGroup = muscleList.some(groupMuscle => 
          muscle.toLowerCase().includes(groupMuscle.toLowerCase()) ||
          groupMuscle.toLowerCase().includes(muscle.toLowerCase()) ||
          muscle.replace(/[_\s]/g, '').toLowerCase() === groupMuscle.replace(/[_\s]/g, '').toLowerCase()
        )
        
        if (belongsToGroup) {
          totalEngagement += engagement
          activeMuscles.push(muscle)
        }
      })
      
      if (totalEngagement > 0) {
        groupData[groupName] = {
          engagement: totalEngagement,
          muscles: activeMuscles
        }
      }
    })
    
    setMuscleGroupData(groupData)
  }, [workoutData])

  const getEngagementColor = (engagement: number): string => {
    if (engagement >= 100) return "bg-red-500 text-white"
    if (engagement >= 60) return "bg-orange-500 text-white"
    if (engagement >= 30) return "bg-yellow-500 text-black"
    if (engagement >= 10) return "bg-green-500 text-white"
    return "bg-gray-200 text-gray-600"
  }

  const getEngagementLevel = (engagement: number): string => {
    if (engagement >= 100) return "Very High"
    if (engagement >= 60) return "High"
    if (engagement >= 30) return "Moderate"
    if (engagement >= 10) return "Light"
    return "Minimal"
  }

  const sortedGroups = Object.entries(muscleGroupData)
    .sort(([,a], [,b]) => b.engagement - a.engagement)

  if (Object.keys(lastWorkoutMuscles).length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Muscle Map
          </CardTitle>
          <CardDescription>Visual representation of muscle engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Complete a workout to see muscle engagement data.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Muscle Engagement Map
        </CardTitle>
        <CardDescription>Body regions worked in last workout</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Simplified Body Map */}
        <div className="grid grid-cols-2 gap-4">
          {sortedGroups.map(([groupName, data]) => (
            <div 
              key={groupName}
              className={`p-4 rounded-lg border-2 transition-all ${
                data.engagement >= 60 ? 'border-red-300 bg-red-50' :
                data.engagement >= 30 ? 'border-orange-300 bg-orange-50' :
                data.engagement >= 10 ? 'border-yellow-300 bg-yellow-50' :
                'border-green-300 bg-green-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{groupName}</h4>
                <Badge className={getEngagementColor(data.engagement)}>
                  {data.engagement}%
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground mb-2">
                {getEngagementLevel(data.engagement)} engagement
              </div>
              
              <div className="space-y-1">
                {data.muscles.slice(0, 3).map(muscle => (
                  <div key={muscle} className="text-xs text-gray-600">
                    • {muscle}: {lastWorkoutMuscles[muscle]}%
                  </div>
                ))}
                {data.muscles.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{data.muscles.length - 3} more muscles
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Individual Muscle Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Individual Muscle Engagement</h4>
          <div className="grid gap-2">
            {Object.entries(lastWorkoutMuscles)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 8) // Top 8 muscles
              .map(([muscle, engagement]) => (
                <div key={muscle} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3 text-blue-600" />
                    <span>{muscle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(engagement, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-muted-foreground w-8">{engagement}%</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Muscle Balance Analysis */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm text-blue-900">Muscle Balance Analysis</span>
          </div>
          <p className="text-sm text-blue-800">
            {sortedGroups.length > 0 ? (
              `Primary focus: ${sortedGroups[0][0]} (${sortedGroups[0][1].engagement}% engagement). 
               ${sortedGroups.length > 1 ? 
                 `Secondary: ${sortedGroups[1][0]} (${sortedGroups[1][1].engagement}%).` : 
                 'Single muscle group focus detected.'}`
            ) : (
              'No muscle engagement data available.'
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}