/**
 * Interactive tooltip component for muscle visualization
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Activity, 
  Calendar, 
  TrendingUp, 
  Weight,
  X,
  Download,
  ChevronRight
} from 'lucide-react'
import { MuscleDetail } from '@/hooks/useMuscleData'
import { getMuscleColor } from './muscle-paths'
import { format, formatDistanceToNow } from 'date-fns'

interface MuscleTooltipProps {
  muscle: MuscleDetail | null
  onClose: () => void
  onExerciseClick?: (exerciseName: string) => void
  position?: 'left' | 'right'
}

export function MuscleTooltip({ 
  muscle, 
  onClose, 
  onExerciseClick,
  position = 'right' 
}: MuscleTooltipProps) {
  if (!muscle) return null

  const fatigueColor = getMuscleColor(muscle.fatiguePercentage)
  const recoveryStatus = muscle.fatiguePercentage >= 60 ? 'Needs Rest' : 
                        muscle.fatiguePercentage >= 30 ? 'Recovering' : 
                        'Ready'

  return (
    <Card className={`absolute top-4 ${position === 'left' ? 'left-4' : 'right-4'} w-96 z-50 shadow-xl bg-[#1C1C1E] border-gray-700`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Activity className="h-5 w-5" style={{ color: fatigueColor }} />
              {muscle.scientificName}
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">{muscle.muscleName}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Fatigue Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Fatigue Level</span>
            <Badge 
              variant="outline" 
              className="border-gray-600"
              style={{ backgroundColor: `${fatigueColor}20`, color: fatigueColor }}
            >
              {recoveryStatus}
            </Badge>
          </div>
          <Progress 
            value={muscle.fatiguePercentage} 
            className="h-3 bg-gray-800"
            style={{ 
              '--progress-foreground': fatigueColor 
            } as React.CSSProperties}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0% (Recovered)</span>
            <span>{muscle.fatiguePercentage.toFixed(0)}%</span>
            <span>100% (Fatigued)</span>
          </div>
        </div>

        {/* Recovery Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Calendar className="h-3 w-3" />
              <span className="text-xs">Last Trained</span>
            </div>
            <p className="text-sm font-medium text-white">
              {muscle.lastTrainedDate 
                ? formatDistanceToNow(new Date(muscle.lastTrainedDate), { addSuffix: true })
                : 'Never'
              }
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">Full Recovery</span>
            </div>
            <p className="text-sm font-medium text-white">
              {muscle.expectedRecoveryDate 
                ? format(new Date(muscle.expectedRecoveryDate), 'MMM d')
                : 'Ready'
              }
            </p>
          </div>
        </div>

        {/* Weekly Volume */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-gray-400">
              <Weight className="h-3 w-3" />
              <span className="text-xs">Weekly Volume</span>
            </div>
            <span className="text-xs text-gray-500">{muscle.weeklySets} sets</span>
          </div>
          <p className="text-lg font-semibold text-white">
            {muscle.weeklyVolume.toLocaleString()} lbs
          </p>
        </div>

        {/* Recent Exercises */}
        {muscle.recentExercises.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Recent Exercises</h4>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {muscle.recentExercises.map((exercise, idx) => (
                  <button
                    key={idx}
                    onClick={() => onExerciseClick?.(exercise.name)}
                    className="w-full text-left p-2 rounded hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-[#FF375F]">
                          {exercise.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {exercise.sets} sets • {exercise.volume.toLocaleString()} lbs
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-[#FF375F]" />
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Recovery Timeline */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Recovery Timeline</h4>
          <div className="flex gap-1">
            {muscle.recoveryTimeline.map((point) => (
              <div
                key={point.day}
                className="flex-1 text-center"
              >
                <div 
                  className="h-16 bg-gray-800 rounded relative overflow-hidden"
                  title={`Day ${point.day}: ${point.recoveryLevel.toFixed(0)}% recovered`}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 transition-all"
                    style={{
                      height: `${point.recoveryLevel}%`,
                      backgroundColor: getMuscleColor(100 - point.recoveryLevel)
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {point.day === 0 ? 'Today' : `+${point.day}d`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-gray-700 hover:bg-gray-800"
            onClick={() => {
              // Export muscle data functionality
              const dataStr = JSON.stringify(muscle, null, 2)
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
              const exportName = `${muscle.muscleName}-data-${new Date().toISOString().split('T')[0]}.json`
              
              const linkElement = document.createElement('a')
              linkElement.setAttribute('href', dataUri)
              linkElement.setAttribute('download', exportName)
              linkElement.click()
            }}
          >
            <Download className="h-4 w-4 mr-1" />
            Export Data
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-[#FF375F] hover:bg-[#FF375F]/90"
            onClick={() => onExerciseClick?.('__filter__' + muscle.muscleName)}
          >
            View Exercises
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}