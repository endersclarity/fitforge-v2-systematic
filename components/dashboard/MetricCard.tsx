/**
 * MetricCard Component
 * Displays key performance indicators with trend arrows and percentage changes
 */

import React from 'react'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  loading?: boolean
  className?: string
  onClick?: () => void
}

export const MetricCard = React.memo(function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeLabel = 'vs last period',
  icon,
  loading = false,
  className,
  onClick
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (change === undefined || change === 0) {
      return <Minus className="w-4 h-4 text-gray-400" />
    }
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    }
    return <TrendingDown className="w-4 h-4 text-red-500" />
  }

  const getTrendColor = () => {
    if (change === undefined || change === 0) return 'text-gray-400'
    if (change > 0) return 'text-green-500'
    return 'text-red-500'
  }

  const formatChange = (value: number) => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <Card className={cn(
        "bg-[#1C1C1E] border-gray-800 p-6 animate-pulse",
        className
      )}>
        <div className="space-y-3">
          <div className="h-4 bg-gray-800 rounded w-24"></div>
          <div className="h-8 bg-gray-800 rounded w-32"></div>
          <div className="h-3 bg-gray-800 rounded w-20"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className={cn(
        "bg-[#1C1C1E] border-gray-800 p-6 transition-all duration-200",
        onClick && "cursor-pointer hover:bg-[#252528] hover:border-gray-700",
        className
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header with icon */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
          {icon && (
            <div className="text-gray-600">
              {icon}
            </div>
          )}
        </div>

        {/* Main value */}
        <div className="flex items-baseline space-x-2">
          <p className="text-3xl font-bold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <span className="text-sm text-gray-500">{subtitle}</span>
          )}
        </div>

        {/* Change indicator */}
        {change !== undefined && (
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <span className={cn("text-sm font-medium", getTrendColor())}>
              {formatChange(change)}
            </span>
            <span className="text-xs text-gray-500">{changeLabel}</span>
          </div>
        )}
      </div>
    </Card>
  )
})

// Specialized metric cards for common use cases
export const VolumeMetricCard = React.memo(function VolumeMetricCard(props: Omit<MetricCardProps, 'title'>) {
  return <MetricCard {...props} title="Total Volume" subtitle="lbs" />
})

export const WorkoutMetricCard = React.memo(function WorkoutMetricCard(props: Omit<MetricCardProps, 'title'>) {
  return <MetricCard {...props} title="Workouts Completed" />
})

export const FrequencyMetricCard = React.memo(function FrequencyMetricCard(props: Omit<MetricCardProps, 'title'>) {
  return <MetricCard {...props} title="Weekly Frequency" subtitle="workouts/week" />
})

export const StreakMetricCard = React.memo(function StreakMetricCard(props: Omit<MetricCardProps, 'title'>) {
  return <MetricCard {...props} title="Current Streak" subtitle="days" />
})

export const PersonalRecordMetricCard = React.memo(function PersonalRecordMetricCard(props: Omit<MetricCardProps, 'title'>) {
  return <MetricCard {...props} title="Personal Records" />
})