"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import exerciseData from "@/data/exercises.json"

interface MuscleMapProps {
  highlightedMuscles?: Record<string, number> // muscle name -> fatigue percentage (0-100)
  onMuscleClick?: (muscleName: string) => void
  workoutSessions?: any[] // Recent workout data for calculating actual fatigue
}

export function AnatomicalMuscleMap({ highlightedMuscles = {}, onMuscleClick, workoutSessions = [] }: MuscleMapProps) {
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null)
  const [selectedView, setSelectedView] = useState<"front" | "back">("front")
  const [exerciseCount, setExerciseCount] = useState<Record<string, number>>({})

  // Calculate which muscles are used in our exercise database
  useEffect(() => {
    const muscleExerciseCount: Record<string, number> = {}
    
    exerciseData.forEach(exercise => {
      Object.keys(exercise.muscleEngagement).forEach(muscle => {
        muscleExerciseCount[muscle] = (muscleExerciseCount[muscle] || 0) + 1
      })
    })
    
    setExerciseCount(muscleExerciseCount)
  }, [])

  // Color scale for fatigue levels
  const getFatigueColor = (fatigue: number) => {
    if (fatigue >= 80) return "#dc2626" // red-600
    if (fatigue >= 60) return "#ea580c" // orange-600
    if (fatigue >= 40) return "#f59e0b" // amber-500
    if (fatigue >= 20) return "#84cc16" // lime-500
    return "#22c55e" // green-500
  }

  // Get opacity based on whether muscle is in our exercise database
  const getMuscleOpacity = (muscleName: string) => {
    const isHovered = hoveredMuscle === muscleName
    const hasExercises = exerciseCount[muscleName] > 0
    const hasFatigue = highlightedMuscles[muscleName] > 0
    
    if (isHovered) return 0.9
    if (hasFatigue) return 0.7
    if (hasExercises) return 0.5
    return 0.2 // Muscles not in our database are faded
  }

  // Anatomically accurate muscle paths based on the reference images
  const frontMuscles = [
    // Head/Neck
    { name: "Sternocleidomastoid", path: "M 165 65 L 175 65 L 175 85 L 170 95 L 165 85 Z" },
    { name: "Trapezius", path: "M 155 70 L 195 70 L 205 90 L 195 100 L 155 100 L 145 90 Z" },
    
    // Shoulders
    { name: "Deltoids", path: "M 120 95 L 145 95 L 150 115 L 145 125 L 125 120 L 115 105 Z" },
    { name: "Anterior Deltoids", path: "M 205 95 L 230 95 L 235 105 L 225 120 L 205 125 L 200 115 Z" },
    
    // Chest
    { name: "Pectoralis Major", path: "M 145 110 L 205 110 L 210 140 L 200 155 L 175 165 L 150 155 L 140 140 Z" },
    
    // Arms - Biceps
    { name: "Biceps Brachii", path: "M 115 125 L 130 125 L 135 145 L 130 165 L 120 165 L 110 145 Z" },
    { name: "Brachialis", path: "M 220 125 L 235 125 L 240 145 L 235 165 L 225 165 L 215 145 Z" },
    { name: "Brachioradialis", path: "M 110 165 L 125 165 L 120 190 L 110 190 L 105 175 Z" },
    
    // Forearms
    { name: "Grip/Forearms", path: "M 105 190 L 120 190 L 115 210 L 105 210 L 100 200 Z" },
    
    // Core - More detailed
    { name: "Rectus Abdominis", path: "M 160 165 L 190 165 L 188 185 L 186 205 L 184 225 L 175 235 L 166 225 L 164 205 L 162 185 Z" },
    { name: "Obliques", path: "M 140 165 L 160 165 L 162 185 L 164 205 L 166 225 L 155 235 L 145 225 L 142 205 L 138 185 Z" },
    { name: "Transverse Abdominis", path: "M 190 165 L 210 165 L 212 185 L 208 205 L 206 225 L 195 235 L 184 225 L 186 205 L 188 185 Z" },
    { name: "Serratus Anterior", path: "M 135 140 L 145 145 L 142 160 L 135 155 L 130 145 Z" },
    
    // Hip Area
    { name: "Hip Flexors", path: "M 155 235 L 195 235 L 190 250 L 180 255 L 170 255 L 160 250 Z" },
    
    // Legs - Quadriceps (more detailed)
    { name: "Quadriceps", path: "M 145 255 L 175 255 L 170 280 L 168 305 L 165 330 L 155 335 L 152 305 L 150 280 Z" },
    { name: "Vastus Lateralis", path: "M 135 260 L 145 255 L 150 280 L 145 305 L 135 300 L 130 275 Z" },
    { name: "Vastus Medialis", path: "M 175 255 L 185 260 L 190 275 L 185 300 L 175 305 L 170 280 Z" },
    
    // Lower Legs
    { name: "Gastrocnemius", path: "M 145 335 L 165 335 L 162 360 L 158 380 L 152 380 L 148 360 Z" },
    { name: "Soleus", path: "M 185 335 L 205 335 L 202 360 L 198 380 L 192 380 L 188 360 Z" },
    { name: "Tibialis Anterior", path: "M 140 340 L 145 335 L 148 360 L 145 370 L 140 365 L 138 350 Z" },
  ]

  // Back view muscles - based on reference
  const backMuscles = [
    // Upper Back/Neck
    { name: "Trapezius", path: "M 140 60 L 210 60 L 220 90 L 205 120 L 175 130 L 145 120 L 130 90 Z" },
    { name: "Levator Scapulae", path: "M 155 65 L 165 65 L 165 80 L 160 85 L 155 80 Z" },
    
    // Shoulders
    { name: "Rear Deltoids", path: "M 115 95 L 140 95 L 145 110 L 140 125 L 120 120 L 110 105 Z" },
    { name: "Deltoids", path: "M 210 95 L 235 95 L 240 105 L 230 120 L 210 125 L 205 110 Z" },
    { name: "Rotator Cuff", path: "M 145 100 L 165 100 L 165 115 L 155 120 L 145 115 Z" },
    
    // Mid Back
    { name: "Rhomboids", path: "M 165 120 L 185 120 L 180 140 L 175 145 L 170 140 Z" },
    { name: "Latissimus Dorsi", path: "M 125 130 L 225 130 L 215 180 L 200 200 L 175 210 L 150 200 L 135 180 Z" },
    
    // Arms
    { name: "Triceps Brachii", path: "M 110 125 L 125 125 L 130 145 L 125 165 L 115 165 L 105 145 Z" },
    { name: "Anconeus", path: "M 105 165 L 115 165 L 112 175 L 108 175 Z" },
    
    // Lower Back
    { name: "Erector Spinae", path: "M 160 200 L 190 200 L 188 230 L 185 250 L 175 255 L 165 250 L 162 230 Z" },
    
    // Glutes
    { name: "Gluteus Maximus", path: "M 140 250 L 210 250 L 205 280 L 195 295 L 175 300 L 155 295 L 145 280 Z" },
    
    // Legs - Hamstrings
    { name: "Hamstrings", path: "M 145 300 L 205 300 L 200 330 L 195 355 L 175 360 L 155 355 L 150 330 Z" },
    
    // Calves
    { name: "Gastrocnemius", path: "M 150 360 L 200 360 L 195 375 L 190 385 L 180 390 L 170 390 L 160 385 L 155 375 Z" },
    { name: "Soleus", path: "M 155 385 L 195 385 L 190 395 L 180 400 L 170 400 L 160 395 Z" },
  ]

  const currentMuscles = selectedView === "front" ? frontMuscles : backMuscles

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Anatomical Muscle Heat Map</span>
          <div className="flex gap-2">
            <Badge variant="outline">{Object.keys(exerciseCount).length} Muscle Groups</Badge>
            <Badge variant="outline">{exerciseData.length} Exercises</Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Based on our exercise database. Darker muscles have more exercises targeting them.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as "front" | "back")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="front">Front View</TabsTrigger>
            <TabsTrigger value="back">Back View</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedView} className="space-y-4">
            <div className="relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-8">
              {/* SVG Anatomical Drawing */}
              <svg 
                viewBox="0 0 350 420" 
                className="w-full max-w-md mx-auto"
                style={{ maxHeight: "600px" }}
              >
                {/* Human Figure Outline - More anatomically accurate */}
                <g className="body-outline">
                  {/* Head */}
                  <ellipse cx="175" cy="35" rx="22" ry="28" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                  
                  {/* Neck */}
                  <path d="M 165 60 L 165 75 L 170 85 L 180 85 L 185 75 L 185 60" 
                        fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                  
                  {/* Shoulders and Upper Torso */}
                  <path d="M 145 95 Q 120 95 115 105 L 110 125" 
                        fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                  <path d="M 205 95 Q 230 95 235 105 L 240 125" 
                        fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                  
                  {/* Torso - More realistic shape */}
                  <path d="M 145 95 L 140 110 L 135 165 L 140 235 L 155 250" 
                        fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                  <path d="M 205 95 L 210 110 L 215 165 L 210 235 L 195 250" 
                        fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                  
                  {/* Arms */}
                  <path d="M 110 125 L 105 145 L 100 190 L 105 210 L 108 220" 
                        fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                  <path d="M 240 125 L 245 145 L 250 190 L 245 210 L 242 220" 
                        fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                  
                  {/* Hips */}
                  <path d="M 155 250 Q 175 255 195 250" 
                        fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                  
                  {/* Legs */}
                  <path d="M 160 250 L 155 280 L 150 330 L 145 380 L 140 400" 
                        fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                  <path d="M 190 250 L 195 280 L 200 330 L 205 380 L 210 400" 
                        fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                </g>

                {/* Muscle Groups */}
                {currentMuscles.map((muscle) => {
                  const fatigue = highlightedMuscles[muscle.name] || 0
                  const isHovered = hoveredMuscle === muscle.name
                  const exerciseCountForMuscle = exerciseCount[muscle.name] || 0
                  
                  return (
                    <g key={muscle.name}>
                      <path
                        d={muscle.path}
                        fill={fatigue > 0 ? getFatigueColor(fatigue) : (exerciseCountForMuscle > 0 ? "#cbd5e1" : "#f1f5f9")}
                        fillOpacity={getMuscleOpacity(muscle.name)}
                        stroke={isHovered ? "#1e293b" : "#94a3b8"}
                        strokeWidth={isHovered ? 2 : 1}
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredMuscle(muscle.name)}
                        onMouseLeave={() => setHoveredMuscle(null)}
                        onClick={() => onMuscleClick?.(muscle.name)}
                      />
                    </g>
                  )
                })}

                {/* Muscle Labels and Info */}
                {hoveredMuscle && (
                  <g>
                    <rect 
                      x="10" y="10" 
                      width="180" height="60" 
                      rx="5"
                      fill="white" 
                      fillOpacity="0.95"
                      stroke="#1e293b" 
                      strokeWidth="1"
                    />
                    <text x="15" y="30" className="text-sm font-semibold fill-gray-900">
                      {hoveredMuscle}
                    </text>
                    <text x="15" y="45" className="text-xs fill-gray-600">
                      Exercises: {exerciseCount[hoveredMuscle] || 0}
                    </text>
                    {highlightedMuscles[hoveredMuscle] && (
                      <text x="15" y="60" className="text-xs fill-gray-600">
                        Fatigue: {highlightedMuscles[hoveredMuscle]}%
                      </text>
                    )}
                  </g>
                )}
              </svg>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Muscle Engagement</h4>
                <div className="flex gap-4 flex-wrap text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: "#cbd5e1" }} />
                    <span>In Exercise Database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: "#f1f5f9" }} />
                    <span>Not in Database</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Fatigue Level</h4>
                <div className="flex gap-3 flex-wrap text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "#22c55e" }} />
                    <span>0-20%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "#84cc16" }} />
                    <span>20-40%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "#f59e0b" }} />
                    <span>40-60%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ea580c" }} />
                    <span>60-80%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "#dc2626" }} />
                    <span>80-100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Exercise Info */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                {hoveredMuscle ? `${hoveredMuscle} Exercises` : "Muscle Exercise Coverage"}
              </h4>
              <p className="text-sm text-blue-800">
                {hoveredMuscle 
                  ? `We have ${exerciseCount[hoveredMuscle] || 0} exercises targeting ${hoveredMuscle}.`
                  : "Hover over any muscle to see exercise count. Click to filter exercises by muscle group."
                }
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}