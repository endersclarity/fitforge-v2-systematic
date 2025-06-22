/**
 * WorkoutCalendar Component
 * Calendar heatmap showing workout frequency and volume
 */

import React, { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Dumbbell,
  TrendingUp
} from 'lucide-react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  getDay,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday
} from 'date-fns'
import { cn } from '@/lib/utils'
import { WorkoutDay } from '@/hooks/useProgressData'

export interface WorkoutCalendarProps {
  data: WorkoutDay[]
  loading?: boolean
  className?: string
  onDayClick?: (day: WorkoutDay) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Calculate color intensity based on volume
const getHeatmapColor = (volume: number, maxVolume: number): string => {
  if (volume === 0) return 'bg-gray-800'
  
  const intensity = volume / maxVolume
  if (intensity > 0.8) return 'bg-[#FF375F]'
  if (intensity > 0.6) return 'bg-[#FF375F]/80'
  if (intensity > 0.4) return 'bg-[#FF375F]/60'
  if (intensity > 0.2) return 'bg-[#FF375F]/40'
  return 'bg-[#FF375F]/20'
}

export const WorkoutCalendar = React.memo(function WorkoutCalendar({
  data,
  loading = false,
  className,
  onDayClick
}: WorkoutCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null)

  // Create a map of dates to workout data
  const workoutMap = useMemo(() => {
    const map = new Map<string, WorkoutDay>()
    data.forEach(day => {
      map.set(day.date, day)
    })
    return map
  }, [data])

  // Calculate max volume for color scaling
  const maxVolume = useMemo(() => {
    return Math.max(...data.map(d => d.totalVolume), 1)
  }, [data])

  // Get days for current month view
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  // Calculate stats for current month
  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    
    const monthWorkouts = data.filter(day => {
      const date = new Date(day.date)
      return date >= monthStart && date <= monthEnd && day.workoutCount > 0
    })

    return {
      totalWorkouts: monthWorkouts.reduce((sum, day) => sum + day.workoutCount, 0),
      totalVolume: monthWorkouts.reduce((sum, day) => sum + day.totalVolume, 0),
      workoutDays: monthWorkouts.length,
      avgVolumePerWorkout: monthWorkouts.length > 0 
        ? monthWorkouts.reduce((sum, day) => sum + day.totalVolume, 0) / monthWorkouts.length
        : 0
    }
  }, [currentMonth, data])

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const workoutDay = workoutMap.get(dateStr)
    
    if (workoutDay) {
      setSelectedDay(workoutDay)
      onDayClick?.(workoutDay)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1))
  }

  if (loading) {
    return (
      <Card className={cn("bg-[#1C1C1E] border-gray-800 p-6", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-800 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn("bg-[#1C1C1E] border-gray-800 p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Workout Calendar
        </h3>
        
        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h4 className="text-sm font-medium text-white min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h4>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8"
            disabled={isSameMonth(currentMonth, new Date())}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Month Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-[#252528] rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Workout Days</p>
          <p className="text-lg font-semibold text-white">{monthStats.workoutDays}</p>
        </div>
        <div className="bg-[#252528] rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Total Workouts</p>
          <p className="text-lg font-semibold text-white">{monthStats.totalWorkouts}</p>
        </div>
        <div className="bg-[#252528] rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Total Volume</p>
          <p className="text-lg font-semibold text-white">
            {(monthStats.totalVolume / 1000).toFixed(1)}k
          </p>
        </div>
        <div className="bg-[#252528] rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Avg Volume</p>
          <p className="text-lg font-semibold text-white">
            {Math.round(monthStats.avgVolumePerWorkout).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {WEEKDAYS.map(day => (
            <div 
              key={day} 
              className="text-center text-xs font-medium text-gray-500 py-1"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day[0]}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty cells for start of month */}
          {Array.from({ length: getDay(monthDays[0]) }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Month days */}
          {monthDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const workoutDay = workoutMap.get(dateStr)
            const hasWorkout = workoutDay && workoutDay.workoutCount > 0
            const isSelected = selectedDay && isSameDay(new Date(selectedDay.date), day)
            
            return (
              <button
                key={dateStr}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "aspect-square rounded-lg p-1 transition-all duration-200",
                  "hover:ring-2 hover:ring-[#FF375F]/50",
                  "flex flex-col items-center justify-center relative",
                  hasWorkout 
                    ? getHeatmapColor(workoutDay.totalVolume, maxVolume)
                    : 'bg-gray-800/50',
                  isToday(day) && "ring-2 ring-white/20",
                  isSelected && "ring-2 ring-[#FF375F]"
                )}
              >
                <span className={cn(
                  "text-xs sm:text-sm",
                  hasWorkout ? "font-semibold text-white" : "text-gray-400",
                  isToday(day) && "text-white"
                )}>
                  {format(day, 'd')}
                </span>
                
                {hasWorkout && (
                  <div className="absolute bottom-0.5 sm:bottom-1 flex gap-0.5">
                    {Array.from({ length: Math.min(workoutDay.workoutCount, 3) }).map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1 h-1 bg-white rounded-full"
                      />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && selectedDay.workoutCount > 0 && (
        <div className="mt-4 p-4 bg-[#252528] rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-white">
              {format(new Date(selectedDay.date), 'MMMM d, yyyy')}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDay(null)}
              className="h-6 px-2 text-xs"
            >
              Close
            </Button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                Workouts
              </span>
              <span className="text-white">{selectedDay.workoutCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Volume
              </span>
              <span className="text-white">{selectedDay.totalVolume.toLocaleString()} lbs</span>
            </div>
            {selectedDay.workoutTypes.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Types</span>
                <span className="text-white">{selectedDay.workoutTypes.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-800 rounded"></div>
            <div className="w-3 h-3 bg-[#FF375F]/20 rounded"></div>
            <div className="w-3 h-3 bg-[#FF375F]/40 rounded"></div>
            <div className="w-3 h-3 bg-[#FF375F]/60 rounded"></div>
            <div className="w-3 h-3 bg-[#FF375F]/80 rounded"></div>
            <div className="w-3 h-3 bg-[#FF375F] rounded"></div>
          </div>
          <span>More</span>
        </div>
        
        <span className="text-xs text-gray-500">
          Volume intensity
        </span>
      </div>
    </Card>
  )
})