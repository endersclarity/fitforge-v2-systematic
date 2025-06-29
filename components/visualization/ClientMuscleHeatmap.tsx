/**
 * Simplified muscle heatmap visualization for client-side data
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity } from 'lucide-react'

interface ClientMuscleHeatmapProps {
  muscleData: Record<string, {
    name: string
    displayName: string
    fatigueScore: number
    recoveryPercentage: number
    status: 'Recovered' | 'Recovering' | 'Fatigued'
  }>
  className?: string
}

export function ClientMuscleHeatmap({ muscleData, className }: ClientMuscleHeatmapProps) {
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null)

  // Group muscles by body part
  const upperBody = ['Pectoralis_Major', 'Triceps_Brachii', 'Biceps_Brachii', 'Deltoids', 'Trapezius']
  const lowerBody = ['Quadriceps', 'Hamstrings', 'Gluteus_Maximus', 'Gastrocnemius']
  const core = ['Core', 'Abs']

  // Get color based on fatigue
  const getMuscleColor = (fatigueScore: number) => {
    if (fatigueScore >= 80) return '#FF375F' // severe fatigue
    if (fatigueScore >= 60) return '#FF6B6B' // high fatigue
    if (fatigueScore >= 40) return '#FF8C42' // moderate fatigue
    if (fatigueScore >= 20) return '#F59E0B' // light fatigue
    return '#10B981' // recovered
  }

  // Calculate overall stats
  const recoveredCount = Object.values(muscleData).filter(m => m.status === 'Recovered').length
  const fatiguedCount = Object.values(muscleData).filter(m => m.status === 'Fatigued').length
  const overallFatigue = Object.values(muscleData).reduce((sum, m) => sum + m.fatigueScore, 0) / Object.keys(muscleData).length

  const renderMuscleGroup = (muscles: string[], title: string) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-400">{title}</h4>
      <div className="grid grid-cols-2 gap-2">
        {muscles.map(muscleName => {
          const muscle = muscleData[muscleName]
          if (!muscle) return null
          
          return (
            <div
              key={muscleName}
              className="relative p-3 rounded-lg border border-gray-700 transition-all cursor-pointer hover:scale-105"
              style={{ 
                backgroundColor: getMuscleColor(muscle.fatigueScore) + '20',
                borderColor: hoveredMuscle === muscleName ? getMuscleColor(muscle.fatigueScore) : undefined
              }}
              onMouseEnter={() => setHoveredMuscle(muscleName)}
              onMouseLeave={() => setHoveredMuscle(null)}
            >
              <div className="flex flex-col">
                <span className="font-medium text-sm">{muscle.displayName}</span>
                <span className="text-xs text-gray-400">{muscle.recoveryPercentage.toFixed(0)}% recovered</span>
              </div>
              <div 
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: getMuscleColor(muscle.fatigueScore) }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#FF375F]" />
              Muscle Heat Map
            </CardTitle>
            <CardDescription>
              Visual representation of muscle fatigue levels
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-gray-800">
              {overallFatigue.toFixed(0)}% Overall
            </Badge>
            <Badge variant="outline" className="bg-green-900 text-green-300">
              {recoveredCount} Ready
            </Badge>
            <Badge variant="outline" className="bg-red-900 text-red-300">
              {fatiguedCount} Fatigued
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Muscle Groups */}
        {renderMuscleGroup(upperBody, 'Upper Body')}
        {renderMuscleGroup(lowerBody, 'Lower Body')}
        {renderMuscleGroup(core, 'Core')}

        {/* Legend */}
        <div className="pt-4 border-t border-gray-800">
          <h4 className="text-sm font-medium mb-2">Fatigue Scale</h4>
          <div className="flex items-center gap-3 text-xs">
            {[
              { color: '#10B981', label: 'Recovered' },
              { color: '#F59E0B', label: 'Light' },
              { color: '#FF8C42', label: 'Moderate' },
              { color: '#FF6B6B', label: 'High' },
              { color: '#FF375F', label: 'Severe' }
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}