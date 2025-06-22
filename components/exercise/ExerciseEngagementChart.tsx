/**
 * Exercise Engagement Chart Component
 * Mini visualization for muscle engagement percentages
 */

import React from 'react'
import { cn } from '@/lib/utils'

interface MuscleEngagement {
  muscle: string
  percentage: number
}

interface ExerciseEngagementChartProps {
  engagements: MuscleEngagement[]
  maxDisplay?: number
  height?: number
  className?: string
  showLabels?: boolean
}

export function ExerciseEngagementChart({
  engagements,
  maxDisplay = 5,
  height = 60,
  className,
  showLabels = false
}: ExerciseEngagementChartProps) {
  // Sort by percentage and take top muscles
  const topEngagements = engagements
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, maxDisplay)

  // Calculate bar widths
  const maxPercentage = Math.max(...topEngagements.map(e => e.percentage), 1)

  // Color gradient based on engagement level
  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500'
    if (percentage >= 60) return 'bg-orange-500'
    if (percentage >= 40) return 'bg-yellow-500'
    if (percentage >= 20) return 'bg-green-500'
    return 'bg-blue-500'
  }

  // Format muscle name for display
  const formatMuscleName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/Brachii/g, '')
      .replace(/Major/g, '')
      .replace(/Minor/g, '')
      .trim()
  }

  return (
    <div
      className={cn(
        'w-full',
        className
      )}
      style={{ height: `${height}px` }}
    >
      <div className="flex flex-col justify-between h-full">
        {topEngagements.map((engagement, index) => (
          <div
            key={engagement.muscle}
            className="flex items-center gap-2"
            style={{ height: `${100 / maxDisplay}%` }}
          >
            {showLabels && (
              <span className="text-xs text-[#A1A1A3] w-20 truncate">
                {formatMuscleName(engagement.muscle)}
              </span>
            )}
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-[#2C2C2E] rounded-sm" />
              <div
                className={cn(
                  'absolute top-0 left-0 h-full rounded-sm transition-all duration-300',
                  getBarColor(engagement.percentage)
                )}
                style={{ width: `${(engagement.percentage / maxPercentage) * 100}%` }}
              />
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-white font-medium">
                {engagement.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Compact version for exercise cards
export function ExerciseEngagementMini({
  engagements,
  className
}: {
  engagements: MuscleEngagement[]
  className?: string
}) {
  const topThree = engagements
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3)

  return (
    <div className={cn('flex gap-1', className)}>
      {topThree.map((engagement, index) => (
        <div
          key={engagement.muscle}
          className="flex-1 h-1 bg-[#2C2C2E] rounded-full overflow-hidden"
        >
          <div
            className={cn(
              'h-full transition-all duration-300',
              index === 0 ? 'bg-[#FF375F]' :
              index === 1 ? 'bg-orange-500' :
              'bg-yellow-500'
            )}
            style={{ width: `${engagement.percentage}%` }}
          />
        </div>
      ))}
    </div>
  )
}

// Full chart for detailed view
export function ExerciseEngagementDetailed({
  muscleEngagement,
  className
}: {
  muscleEngagement: Record<string, number>
  className?: string
}) {
  const engagements = Object.entries(muscleEngagement)
    .map(([muscle, percentage]) => ({ muscle, percentage }))
    .filter(e => e.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage)

  const primaryMuscles = engagements.filter(e => e.percentage >= 50)
  const secondaryMuscles = engagements.filter(e => e.percentage >= 20 && e.percentage < 50)
  const stabilizerMuscles = engagements.filter(e => e.percentage > 0 && e.percentage < 20)

  return (
    <div className={cn('space-y-4', className)}>
      {primaryMuscles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white mb-2">Primary Muscles</h4>
          <ExerciseEngagementChart
            engagements={primaryMuscles}
            showLabels
            height={primaryMuscles.length * 24}
          />
        </div>
      )}
      
      {secondaryMuscles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white mb-2">Secondary Muscles</h4>
          <ExerciseEngagementChart
            engagements={secondaryMuscles}
            showLabels
            height={secondaryMuscles.length * 24}
          />
        </div>
      )}
      
      {stabilizerMuscles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white mb-2">Stabilizer Muscles</h4>
          <ExerciseEngagementChart
            engagements={stabilizerMuscles}
            showLabels
            height={stabilizerMuscles.length * 24}
          />
        </div>
      )}
    </div>
  )
}