/**
 * VolumeChart Component
 * Interactive line chart showing volume progression over time
 */

import React, { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { VolumeData } from '@/hooks/useProgressData'

export interface VolumeChartProps {
  data: VolumeData[]
  loading?: boolean
  className?: string
  height?: number
}

type ChartView = 'total' | 'push' | 'pull' | 'legs' | 'all'

const CHART_COLORS = {
  total: '#FF375F',
  push: '#4F46E5',
  pull: '#10B981',
  legs: '#F59E0B',
  core: '#6B7280'
}

export const VolumeChart = React.memo(function VolumeChart({
  data,
  loading = false,
  className,
  height = 400
}: VolumeChartProps) {
  const [selectedView, setSelectedView] = useState<ChartView>('total')
  const [showTrendLine, setShowTrendLine] = useState(true)

  // Calculate trend line
  const trendData = useMemo(() => {
    if (!data.length || !showTrendLine) return null

    const points = data.map((d, i) => ({ x: i, y: d.total }))
    const n = points.length
    const sumX = points.reduce((sum, p) => sum + p.x, 0)
    const sumY = points.reduce((sum, p) => sum + p.y, 0)
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0)
    const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return { slope, intercept }
  }, [data, showTrendLine])

  // Format data for chart
  const chartData = useMemo(() => {
    return data.map((d, index) => {
      const formattedDate = format(new Date(d.date), 'MMM d')
      const dataPoint: any = {
        date: formattedDate,
        fullDate: d.date,
        total: Math.round(d.total),
        push: Math.round(d.push),
        pull: Math.round(d.pull),
        legs: Math.round(d.legs),
        core: Math.round(d.core)
      }

      if (trendData) {
        dataPoint.trend = Math.round(trendData.slope * index + trendData.intercept)
      }

      return dataPoint
    })
  }, [data, trendData])

  // Find personal best week
  const personalBestWeek = useMemo(() => {
    if (!data.length) return null
    return data.reduce((max, d) => d.total > max.total ? d : max)
  }, [data])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    const data = payload[0].payload
    return (
      <div className="bg-[#1C1C1E] border border-gray-800 rounded-lg p-4 shadow-xl">
        <p className="font-semibold text-white mb-2">{label}</p>
        <div className="space-y-1">
          {selectedView === 'all' ? (
            <>
              <div className="flex justify-between items-center space-x-4">
                <span className="text-gray-400">Push:</span>
                <span className="font-medium text-[#4F46E5]">{data.push.toLocaleString()} lbs</span>
              </div>
              <div className="flex justify-between items-center space-x-4">
                <span className="text-gray-400">Pull:</span>
                <span className="font-medium text-[#10B981]">{data.pull.toLocaleString()} lbs</span>
              </div>
              <div className="flex justify-between items-center space-x-4">
                <span className="text-gray-400">Legs:</span>
                <span className="font-medium text-[#F59E0B]">{data.legs.toLocaleString()} lbs</span>
              </div>
              <div className="flex justify-between items-center space-x-4">
                <span className="text-gray-400">Core:</span>
                <span className="font-medium text-[#6B7280]">{data.core.toLocaleString()} lbs</span>
              </div>
              <div className="border-t border-gray-700 mt-2 pt-2">
                <div className="flex justify-between items-center space-x-4">
                  <span className="text-gray-400">Total:</span>
                  <span className="font-bold text-white">{data.total.toLocaleString()} lbs</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center space-x-4">
              <span className="text-gray-400">Volume:</span>
              <span className="font-bold text-white">{data[selectedView].toLocaleString()} lbs</span>
            </div>
          )}
        </div>
        {data.fullDate === personalBestWeek?.date && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <span className="text-xs text-[#FF375F] font-medium">🏆 Personal Best Week!</span>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <Card className={cn("bg-[#1C1C1E] border-gray-800 p-6", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-800 rounded w-48 mb-4"></div>
          <div className={`bg-gray-800 rounded`} style={{ height }}></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn("bg-[#1C1C1E] border-gray-800 p-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-white">Volume Progression</h3>
        
        {/* View selector */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedView === 'total' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('total')}
            className={cn(
              "text-xs",
              selectedView === 'total' && "bg-[#FF375F] hover:bg-[#FF375F]/90"
            )}
          >
            Total
          </Button>
          <Button
            variant={selectedView === 'push' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('push')}
            className={cn(
              "text-xs",
              selectedView === 'push' && "bg-[#4F46E5] hover:bg-[#4F46E5]/90"
            )}
          >
            Push
          </Button>
          <Button
            variant={selectedView === 'pull' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('pull')}
            className={cn(
              "text-xs",
              selectedView === 'pull' && "bg-[#10B981] hover:bg-[#10B981]/90"
            )}
          >
            Pull
          </Button>
          <Button
            variant={selectedView === 'legs' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('legs')}
            className={cn(
              "text-xs",
              selectedView === 'legs' && "bg-[#F59E0B] hover:bg-[#F59E0B]/90"
            )}
          >
            Legs
          </Button>
          <Button
            variant={selectedView === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('all')}
            className="text-xs"
          >
            All Groups
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTrendLine(!showTrendLine)}
            className="text-xs"
          >
            {showTrendLine ? 'Hide' : 'Show'} Trend
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full overflow-x-auto">
        <div style={{ minWidth: '600px', height }}>
          <ResponsiveContainer width="100%" height="100%">
            {selectedView === 'all' ? (
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
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="line"
                />
                <Area
                  type="monotone"
                  dataKey="push"
                  stackId="1"
                  stroke={CHART_COLORS.push}
                  fill={CHART_COLORS.push}
                  fillOpacity={0.6}
                  name="Push"
                />
                <Area
                  type="monotone"
                  dataKey="pull"
                  stackId="1"
                  stroke={CHART_COLORS.pull}
                  fill={CHART_COLORS.pull}
                  fillOpacity={0.6}
                  name="Pull"
                />
                <Area
                  type="monotone"
                  dataKey="legs"
                  stackId="1"
                  stroke={CHART_COLORS.legs}
                  fill={CHART_COLORS.legs}
                  fillOpacity={0.6}
                  name="Legs"
                />
                <Area
                  type="monotone"
                  dataKey="core"
                  stackId="1"
                  stroke={CHART_COLORS.core}
                  fill={CHART_COLORS.core}
                  fillOpacity={0.6}
                  name="Core"
                />
              </ComposedChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D30" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Main line */}
                <Line
                  type="monotone"
                  dataKey={selectedView}
                  stroke={CHART_COLORS[selectedView]}
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS[selectedView], r: 4 }}
                  activeDot={{ r: 6 }}
                />
                
                {/* Trend line */}
                {showTrendLine && selectedView === 'total' && (
                  <Line
                    type="monotone"
                    dataKey="trend"
                    stroke="#9CA3AF"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Trend"
                  />
                )}
                
                {/* Personal best marker */}
                {personalBestWeek && selectedView === 'total' && (
                  <ReferenceLine
                    y={personalBestWeek.total}
                    stroke="#FF375F"
                    strokeDasharray="3 3"
                    label={{ value: "Personal Best", position: "left", style: { fill: '#FF375F', fontSize: 12 } }}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary stats */}
      {trendData && selectedView === 'total' && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Weekly Average Change:</span>
            <span className={cn(
              "font-medium",
              trendData.slope > 0 ? "text-green-500" : "text-red-500"
            )}>
              {trendData.slope > 0 ? '+' : ''}{Math.round(trendData.slope)} lbs/week
            </span>
          </div>
        </div>
      )}
    </Card>
  )
})