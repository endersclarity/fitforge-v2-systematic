/**
 * ExerciseProgress Component
 * Track and visualize progress for individual exercises
 */

import React, { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Bar
} from 'recharts'
import { 
  TrendingUp, 
  Weight,
  BarChart3,
  Activity,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { ExerciseProgressData } from '@/hooks/useProgressData'

export interface ExerciseProgressProps {
  exercises: Map<string, ExerciseProgressData>
  selectedExercise: string | null
  onExerciseSelect: (exerciseId: string) => void
  loading?: boolean
  className?: string
}

type ChartView = 'weight' | 'volume' | '1rm' | 'reps'

const CHART_COLORS = {
  weight: '#FF375F',
  volume: '#4F46E5',
  '1rm': '#10B981',
  reps: '#F59E0B'
}

interface ProgressStats {
  totalImprovement: number
  weeklyRate: number
  personalBest: number
  consistency: number
}

const calculateProgressStats = (data: ExerciseProgressData['data']): ProgressStats => {
  if (data.length < 2) {
    return {
      totalImprovement: 0,
      weeklyRate: 0,
      personalBest: 0,
      consistency: 0
    }
  }

  const first = data[0]
  const last = data[data.length - 1]
  const weeks = data.length

  // Calculate improvements
  const weightImprovement = ((last.weight - first.weight) / first.weight) * 100
  const weeklyRate = weightImprovement / weeks

  // Find personal best
  const personalBest = Math.max(...data.map(d => d.weight))

  // Calculate consistency (how often they trained)
  const consistency = (data.filter(d => d.volume > 0).length / weeks) * 100

  return {
    totalImprovement: weightImprovement,
    weeklyRate,
    personalBest,
    consistency
  }
}

const CustomTooltip = ({ active, payload, label, view }: any) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  return (
    <div className="bg-[#1C1C1E] border border-gray-800 rounded-lg p-3 shadow-xl">
      <p className="font-semibold text-white mb-2">{label}</p>
      <div className="space-y-1 text-sm">
        {view === 'weight' && (
          <>
            <div className="flex justify-between items-center space-x-4">
              <span className="text-gray-400">Weight:</span>
              <span className="font-medium text-[#FF375F]">{data.weight} lbs</span>
            </div>
            <div className="flex justify-between items-center space-x-4">
              <span className="text-gray-400">Reps:</span>
              <span className="font-medium text-white">{data.reps}</span>
            </div>
          </>
        )}
        {view === 'volume' && (
          <div className="flex justify-between items-center space-x-4">
            <span className="text-gray-400">Volume:</span>
            <span className="font-medium text-[#4F46E5]">{data.volume.toLocaleString()} lbs</span>
          </div>
        )}
        {view === '1rm' && (
          <div className="flex justify-between items-center space-x-4">
            <span className="text-gray-400">Est. 1RM:</span>
            <span className="font-medium text-[#10B981]">{Math.round(data.estimated1RM)} lbs</span>
          </div>
        )}
        {view === 'reps' && (
          <>
            <div className="flex justify-between items-center space-x-4">
              <span className="text-gray-400">Reps:</span>
              <span className="font-medium text-[#F59E0B]">{data.reps}</span>
            </div>
            <div className="flex justify-between items-center space-x-4">
              <span className="text-gray-400">Weight:</span>
              <span className="font-medium text-white">{data.weight} lbs</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export const ExerciseProgress = React.memo(function ExerciseProgress({
  exercises,
  selectedExercise,
  onExerciseSelect,
  loading = false,
  className
}: ExerciseProgressProps) {
  const [chartView, setChartView] = useState<ChartView>('weight')

  const currentExerciseData = selectedExercise ? exercises.get(selectedExercise) : null
  const progressStats = useMemo(() => 
    currentExerciseData ? calculateProgressStats(currentExerciseData.data) : null,
    [currentExerciseData]
  )

  // Format data for charts
  const chartData = useMemo(() => {
    if (!currentExerciseData) return []
    
    return currentExerciseData.data.map(d => ({
      date: format(new Date(d.date), 'MMM d'),
      weight: d.weight,
      reps: d.reps,
      volume: d.volume,
      estimated1RM: Math.round(d.estimated1RM)
    }))
  }, [currentExerciseData])

  // Calculate trend lines
  const trendData = useMemo(() => {
    if (!chartData.length) return null

    const getValue = (d: any) => {
      switch (chartView) {
        case 'weight': return d.weight
        case 'volume': return d.volume
        case '1rm': return d.estimated1RM
        case 'reps': return d.reps
      }
    }

    const points = chartData.map((d, i) => ({ x: i, y: getValue(d) }))
    const n = points.length
    const sumX = points.reduce((sum, p) => sum + p.x, 0)
    const sumY = points.reduce((sum, p) => sum + p.y, 0)
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0)
    const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return chartData.map((d, i) => ({
      ...d,
      trend: Math.round(slope * i + intercept)
    }))
  }, [chartData, chartView])

  if (loading) {
    return (
      <Card className={cn("bg-[#1C1C1E] border-gray-800 p-6", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-800 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-800 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn("bg-[#1C1C1E] border-gray-800 p-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-white">Exercise Progress</h3>
        
        <div className="flex flex-wrap gap-2">
          {/* Exercise Selector */}
          <Select value={selectedExercise || ''} onValueChange={onExerciseSelect}>
            <SelectTrigger className="w-[200px] bg-[#252528] border-gray-700">
              <SelectValue placeholder="Select exercise" />
            </SelectTrigger>
            <SelectContent>
              {Array.from(exercises.entries()).map(([id, data]) => (
                <SelectItem key={id} value={id}>
                  {data.exerciseName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Selector */}
          <div className="flex gap-1 bg-[#252528] rounded-lg p-1">
            {(['weight', 'volume', '1rm', 'reps'] as ChartView[]).map(view => (
              <Button
                key={view}
                variant={chartView === view ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartView(view)}
                className={cn(
                  "text-xs px-3",
                  chartView === view && "bg-[#FF375F] hover:bg-[#FF375F]/90"
                )}
              >
                {view === '1rm' ? '1RM' : view.charAt(0).toUpperCase() + view.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {!currentExerciseData ? (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Select an exercise to view progress</p>
        </div>
      ) : (
        <>
          {/* Progress Stats */}
          {progressStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-[#252528] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <p className="text-xs text-gray-400">Total Gain</p>
                </div>
                <p className={cn(
                  "text-lg font-semibold",
                  progressStats.totalImprovement > 0 ? "text-green-500" : "text-red-500"
                )}>
                  {progressStats.totalImprovement > 0 ? '+' : ''}{progressStats.totalImprovement.toFixed(1)}%
                </p>
              </div>
              
              <div className="bg-[#252528] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <p className="text-xs text-gray-400">Weekly Rate</p>
                </div>
                <p className={cn(
                  "text-lg font-semibold",
                  progressStats.weeklyRate > 0 ? "text-green-500" : "text-red-500"
                )}>
                  {progressStats.weeklyRate > 0 ? '+' : ''}{progressStats.weeklyRate.toFixed(1)}%
                </p>
              </div>
              
              <div className="bg-[#252528] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Weight className="w-4 h-4 text-gray-400" />
                  <p className="text-xs text-gray-400">Personal Best</p>
                </div>
                <p className="text-lg font-semibold text-white">
                  {progressStats.personalBest} lbs
                </p>
              </div>
              
              <div className="bg-[#252528] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  <p className="text-xs text-gray-400">Consistency</p>
                </div>
                <p className="text-lg font-semibold text-white">
                  {progressStats.consistency.toFixed(0)}%
                </p>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'volume' ? (
                <AreaChart data={trendData || chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D2D30" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip view={chartView} />} />
                  
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke={CHART_COLORS.volume}
                    fill={CHART_COLORS.volume}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  
                  {trendData && (
                    <Line
                      type="monotone"
                      dataKey="trend"
                      stroke="#9CA3AF"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  )}
                </AreaChart>
              ) : chartView === 'reps' ? (
                <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D2D30" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip view={chartView} />} />
                  
                  <Bar
                    dataKey="reps"
                    fill={CHART_COLORS.reps}
                    opacity={0.6}
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke={CHART_COLORS.weight}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.weight, r: 4 }}
                  />
                </ComposedChart>
              ) : (
                <LineChart data={trendData || chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D2D30" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip view={chartView} />} />
                  
                  <Line
                    type="monotone"
                    dataKey={chartView === '1rm' ? 'estimated1RM' : chartView}
                    stroke={CHART_COLORS[chartView]}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS[chartView], r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  
                  {trendData && (
                    <Line
                      type="monotone"
                      dataKey="trend"
                      stroke="#9CA3AF"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  )}
                  
                  {/* Personal best line */}
                  {progressStats && chartView === 'weight' && (
                    <ReferenceLine
                      y={progressStats.personalBest}
                      stroke="#10B981"
                      strokeDasharray="3 3"
                      label={{ 
                        value: "Personal Best", 
                        position: "right",
                        style: { fill: '#10B981', fontSize: 12 }
                      }}
                    />
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Progress Summary */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Tracking {currentExerciseData.data.length} weeks of data
              </span>
              {progressStats && progressStats.totalImprovement !== 0 && (
                <Badge 
                  variant="secondary"
                  className={cn(
                    "flex items-center gap-1",
                    progressStats.totalImprovement > 0 
                      ? "bg-green-500/20 text-green-500" 
                      : "bg-red-500/20 text-red-500"
                  )}
                >
                  {progressStats.totalImprovement > 0 ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                  {Math.abs(progressStats.totalImprovement).toFixed(1)}% overall
                </Badge>
              )}
            </div>
          </div>
        </>
      )}
    </Card>
  )
})