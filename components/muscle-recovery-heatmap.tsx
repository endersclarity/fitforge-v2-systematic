"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Clock, CheckCircle } from "lucide-react"
import type { FatigueAnalysis, MuscleGroup } from "@/lib/ai/types"

interface MuscleRecoveryHeatmapProps {
  fatigueAnalysis: FatigueAnalysis | null
  loading?: boolean
}

export function MuscleRecoveryHeatmap({ fatigueAnalysis, loading = false }: MuscleRecoveryHeatmapProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recovery Heat Map</CardTitle>
          <CardDescription>Loading muscle recovery analysis...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!fatigueAnalysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recovery Heat Map</CardTitle>
          <CardDescription>No recovery data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Start logging workouts to see your recovery analysis
          </div>
        </CardContent>
      </Card>
    )
  }

  const muscleGroups = Object.entries(fatigueAnalysis.muscleGroups)

  const getRecoveryColor = (fatigueScore: number): string => {
    if (fatigueScore <= 30) return "bg-green-500" // Well recovered
    if (fatigueScore <= 60) return "bg-yellow-500" // Moderate fatigue
    return "bg-red-500" // High fatigue
  }

  const getRecoveryTextColor = (fatigueScore: number): string => {
    if (fatigueScore <= 30) return "text-green-700 border-green-200 bg-green-50"
    if (fatigueScore <= 60) return "text-yellow-700 border-yellow-200 bg-yellow-50"
    return "text-red-700 border-red-200 bg-red-50"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Recovered':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Recovering':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'Fatigued':
        return <Activity className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recovery Heat Map
            </CardTitle>
            <CardDescription>Real-time muscle fatigue and recovery analysis</CardDescription>
          </div>
          <Badge variant="outline" className="text-blue-700">
            {fatigueAnalysis.overallRecoveryScore}% Overall
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
          <p className="font-medium text-sm mb-2">Recovery Summary</p>
          <p className="text-sm text-gray-700">{fatigueAnalysis.summary}</p>
        </div>

        {/* Muscle Group Heat Map Grid */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Muscle Group Status</h4>
          <div className="grid gap-3">
            {muscleGroups.map(([muscleName, muscle]) => (
              <div key={muscleName} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(muscle.status)}
                    <span className="font-medium text-sm">{muscle.name}</span>
                  </div>
                  <Badge variant="outline" className={getRecoveryTextColor(muscle.fatigueScore)}>
                    {muscle.status}
                  </Badge>
                </div>
                
                {/* Fatigue Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Fatigue Level</span>
                    <span>{Math.round(muscle.fatigueScore)}%</span>
                  </div>
                  <Progress 
                    value={muscle.fatigueScore} 
                    className="h-2"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Recovered</span>
                    <span>Fatigued</span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="font-medium">Last Trained</div>
                    <div className="text-muted-foreground">
                      {muscle.daysSinceLastTrained === 0 ? 'Today' : 
                       muscle.daysSinceLastTrained === 1 ? 'Yesterday' :
                       `${muscle.daysSinceLastTrained} days ago`}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="font-medium">Avg RPE</div>
                    <div className="text-muted-foreground">
                      {muscle.averageRPE ? muscle.averageRPE.toFixed(1) : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Recovery Recommendation */}
                {muscle.recoveryRecommendation && (
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <p className="text-xs text-blue-800">{muscle.recoveryRecommendation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Status Indicators */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <p className="font-medium text-sm text-green-700">Ready to Train</p>
            <div className="flex flex-wrap gap-1">
              {fatigueAnalysis.readyForTraining.map((muscle) => (
                <Badge key={muscle} variant="outline" className="text-green-700 border-green-200 bg-green-50 text-xs">
                  {muscle}
                </Badge>
              ))}
            </div>
          </div>
          
          {fatigueAnalysis.needingRest.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium text-sm text-orange-700">Needs Rest</p>
              <div className="flex flex-wrap gap-1">
                {fatigueAnalysis.needingRest.map((muscle) => (
                  <Badge key={muscle} variant="outline" className="text-orange-700 border-orange-200 bg-orange-50 text-xs">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}