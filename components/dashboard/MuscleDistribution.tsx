/**
 * MuscleDistribution Component
 * Donut chart showing volume distribution by muscle group
 */

import React, { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Sector
} from 'recharts'
import { 
  AlertCircle, 
  CheckCircle, 
  TrendingUp,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MuscleGroupData } from '@/hooks/useProgressData'

export interface MuscleDistributionProps {
  data: MuscleGroupData[]
  loading?: boolean
  className?: string
  onMuscleGroupClick?: (muscleGroup: string) => void
}

// Ideal muscle group distribution percentages for balanced training
const IDEAL_DISTRIBUTION = {
  Push: { min: 25, max: 35 },
  Pull: { min: 25, max: 35 },
  Legs: { min: 25, max: 35 },
  Core: { min: 5, max: 15 }
}

interface ImbalanceInfo {
  severity: 'balanced' | 'minor' | 'moderate' | 'severe'
  message: string
  recommendations: string[]
}

const analyzeImbalances = (data: MuscleGroupData[]): ImbalanceInfo => {
  const imbalances: string[] = []
  const recommendations: string[] = []
  
  data.forEach(group => {
    const ideal = IDEAL_DISTRIBUTION[group.name as keyof typeof IDEAL_DISTRIBUTION]
    if (!ideal) return
    
    if (group.percentage < ideal.min) {
      imbalances.push(`${group.name} is undertrained (${group.percentage}% vs ${ideal.min}-${ideal.max}% ideal)`)
      recommendations.push(`Increase ${group.name} volume by adding 1-2 more exercises`)
    } else if (group.percentage > ideal.max) {
      imbalances.push(`${group.name} is overtrained (${group.percentage}% vs ${ideal.min}-${ideal.max}% ideal)`)
      recommendations.push(`Reduce ${group.name} volume or increase other muscle groups`)
    }
  })
  
  if (imbalances.length === 0) {
    return {
      severity: 'balanced',
      message: 'Your training is well-balanced!',
      recommendations: ['Maintain current distribution', 'Focus on progressive overload']
    }
  } else if (imbalances.length === 1) {
    return {
      severity: 'minor',
      message: 'Minor imbalance detected',
      recommendations
    }
  } else if (imbalances.length === 2) {
    return {
      severity: 'moderate',
      message: 'Moderate imbalances detected',
      recommendations
    }
  } else {
    return {
      severity: 'severe',
      message: 'Significant imbalances detected',
      recommendations
    }
  }
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null
  
  const data = payload[0]
  return (
    <div className="bg-[#1C1C1E] border border-gray-800 rounded-lg p-3 shadow-xl">
      <p className="font-semibold text-white mb-1">{data.name}</p>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between items-center space-x-4">
          <span className="text-gray-400">Volume:</span>
          <span className="font-medium text-white">{data.value.toLocaleString()} lbs</span>
        </div>
        <div className="flex justify-between items-center space-x-4">
          <span className="text-gray-400">Percentage:</span>
          <span className="font-medium" style={{ color: data.payload.color }}>
            {data.payload.percentage.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between items-center space-x-4">
          <span className="text-gray-400">Sets:</span>
          <span className="font-medium text-white">{data.payload.sets}</span>
        </div>
      </div>
    </div>
  )
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props
  
  return (
    <g>
      <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#fff" className="text-2xl font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#9CA3AF" className="text-sm">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 15}
        outerRadius={outerRadius + 20}
        fill={fill}
      />
    </g>
  )
}

export const MuscleDistribution = React.memo(function MuscleDistribution({
  data,
  loading = false,
  className,
  onMuscleGroupClick
}: MuscleDistributionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showRecommendations, setShowRecommendations] = useState(false)

  const imbalanceInfo = useMemo(() => analyzeImbalances(data), [data])

  const chartData = useMemo(() => {
    return data.map(group => ({
      name: group.name,
      value: group.volume,
      percentage: group.percentage,
      sets: group.sets,
      color: group.color
    }))
  }, [data])

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const getSeverityIcon = () => {
    switch (imbalanceInfo.severity) {
      case 'balanced':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'minor':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'moderate':
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      case 'severe':
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getSeverityColor = () => {
    switch (imbalanceInfo.severity) {
      case 'balanced': return 'text-green-500'
      case 'minor': return 'text-yellow-500'
      case 'moderate': return 'text-orange-500'
      case 'severe': return 'text-red-500'
    }
  }

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

  if (!data.length) {
    return (
      <Card className={cn("bg-[#1C1C1E] border-gray-800 p-6", className)}>
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Workout Data</h3>
          <p className="text-gray-400 text-sm">Complete workouts to see muscle distribution</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn("bg-[#1C1C1E] border-gray-800 p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Muscle Distribution</h3>
        <div className="flex items-center gap-2">
          {getSeverityIcon()}
          <span className={cn("text-sm font-medium", getSeverityColor())}>
            {imbalanceInfo.message}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={onPieEnter}
              onClick={(data) => onMuscleGroupClick?.(data.name)}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with details */}
      <div className="space-y-2 mb-4">
        {data.map((group, index) => (
          <div
            key={group.name}
            className={cn(
              "flex items-center justify-between p-2 rounded-lg transition-all duration-200",
              "hover:bg-[#252528] cursor-pointer",
              activeIndex === index && "bg-[#252528]"
            )}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => onMuscleGroupClick?.(group.name)}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: group.color }}
              />
              <span className="text-sm font-medium text-white">{group.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">{group.sets} sets</span>
              <Badge 
                variant="secondary" 
                className="min-w-[60px] justify-center"
                style={{ 
                  backgroundColor: `${group.color}20`,
                  color: group.color
                }}
              >
                {group.percentage.toFixed(1)}%
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="border-t border-gray-800 pt-4">
        <button
          onClick={() => setShowRecommendations(!showRecommendations)}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Balance Recommendations
          </span>
          <span className="text-xs">
            {showRecommendations ? 'Hide' : 'Show'}
          </span>
        </button>
        
        {showRecommendations && (
          <div className="mt-3 space-y-2">
            {imbalanceInfo.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1 h-1 bg-gray-500 rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-sm text-gray-300">{rec}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
})