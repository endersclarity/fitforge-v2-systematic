import { Progress } from "./progress"
import { Badge } from "./badge"
import { ParsedMuscleData, MuscleEngagement } from "@/lib/muscle-engagement-parser"

interface MuscleEngagementChartProps {
  muscleData: ParsedMuscleData
  title?: string
}

export function MuscleEngagementChart({ muscleData, title = "Muscle Engagement" }: MuscleEngagementChartProps) {
  const getCategoryColor = (category: MuscleEngagement['category']) => {
    switch (category) {
      case 'primary': return 'bg-blue-500'
      case 'secondary': return 'bg-green-500' 
      case 'stabilizer': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryBadgeVariant = (category: MuscleEngagement['category']) => {
    switch (category) {
      case 'primary': return 'default' as const
      case 'secondary': return 'secondary' as const
      case 'stabilizer': return 'outline' as const
      default: return 'outline' as const
    }
  }

  if (muscleData.total.length === 0) {
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-sm text-muted-foreground">
          Muscle engagement data not available for this exercise.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium">{title}</h4>
      
      {/* Primary Muscles */}
      {muscleData.primary.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs">PRIMARY</Badge>
            <span className="text-xs text-muted-foreground">Main target muscles</span>
          </div>
          {muscleData.primary.map((muscle) => (
            <MuscleBar key={muscle.name} muscle={muscle} />
          ))}
        </div>
      )}

      {/* Secondary Muscles */}
      {muscleData.secondary.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">SECONDARY</Badge>
            <span className="text-xs text-muted-foreground">Supporting muscles</span>
          </div>
          {muscleData.secondary.map((muscle) => (
            <MuscleBar key={muscle.name} muscle={muscle} />
          ))}
        </div>
      )}

      {/* Stabilizer Muscles */}
      {muscleData.stabilizer.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">STABILIZER</Badge>
            <span className="text-xs text-muted-foreground">Stability & balance</span>
          </div>
          {muscleData.stabilizer.map((muscle) => (
            <MuscleBar key={muscle.name} muscle={muscle} />
          ))}
        </div>
      )}
    </div>
  )
}

function MuscleBar({ muscle }: { muscle: MuscleEngagement }) {
  // Accessibility enhancement: Different patterns for different categories
  const getProgressPattern = (category: MuscleEngagement['category']) => {
    switch (category) {
      case 'primary': return 'solid'
      case 'secondary': return 'striped'
      case 'stabilizer': return 'dotted'
      default: return 'solid'
    }
  }

  const getProgressColor = (category: MuscleEngagement['category']) => {
    switch (category) {
      case 'primary': return 'hsl(217, 91%, 60%)' // Blue
      case 'secondary': return 'hsl(142, 76%, 36%)' // Green
      case 'stabilizer': return 'hsl(48, 96%, 53%)' // Yellow
      default: return 'hsl(215, 16%, 47%)' // Gray
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">{muscle.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{muscle.percentage}%</span>
          {/* Category indicator for accessibility */}
          <div 
            className={`w-2 h-2 rounded-full ${
              muscle.category === 'primary' ? 'bg-blue-500' :
              muscle.category === 'secondary' ? 'bg-green-500' : 'bg-yellow-500'
            }`}
            title={`${muscle.category} muscle`}
            aria-label={`${muscle.category} muscle indicator`}
          />
        </div>
      </div>
      <div className="relative">
        <Progress 
          value={muscle.percentage} 
          className="h-3"
          style={{
            '--progress-background': getProgressColor(muscle.category)
          } as React.CSSProperties}
        />
        {/* Accessibility pattern overlay for better distinction beyond color */}
        {muscle.category === 'secondary' && (
          <div 
            className="absolute inset-0 h-3 rounded-full pointer-events-none"
            style={{
              background: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(255,255,255,0.3) 2px,
                rgba(255,255,255,0.3) 4px
              )`,
              width: `${muscle.percentage}%`
            }}
          />
        )}
        {muscle.category === 'stabilizer' && (
          <div 
            className="absolute inset-0 h-3 rounded-full pointer-events-none"
            style={{
              background: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 1px,
                rgba(255,255,255,0.4) 1px,
                rgba(255,255,255,0.4) 3px
              )`,
              width: `${muscle.percentage}%`
            }}
          />
        )}
      </div>
    </div>
  )
}