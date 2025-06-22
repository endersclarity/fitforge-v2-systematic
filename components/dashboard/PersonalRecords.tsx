/**
 * PersonalRecords Component
 * Displays recent personal records with trophy icons and sharing capabilities
 */

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  TrendingUp, 
  Share2, 
  ChevronRight,
  Dumbbell,
  Calendar,
  Award
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { PersonalRecord } from '@/hooks/useProgressData'
import { toast } from '@/components/ui/use-toast'

export interface PersonalRecordsProps {
  records: PersonalRecord[]
  loading?: boolean
  className?: string
  onExerciseClick?: (exerciseId: string) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  Push: 'bg-[#4F46E5]',
  Pull: 'bg-[#10B981]',
  Legs: 'bg-[#F59E0B]',
  Core: 'bg-[#6B7280]'
}

const TROPHY_COLORS = {
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32'
}

export const PersonalRecords = React.memo(function PersonalRecords({
  records,
  loading = false,
  className,
  onExerciseClick
}: PersonalRecordsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set())

  const filteredRecords = selectedCategory
    ? records.filter(r => r.category === selectedCategory)
    : records

  const categories = Array.from(new Set(records.map(r => r.category)))

  const toggleExpanded = (recordId: string) => {
    const newExpanded = new Set(expandedRecords)
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId)
    } else {
      newExpanded.add(recordId)
    }
    setExpandedRecords(newExpanded)
  }

  const shareRecord = async (record: PersonalRecord) => {
    const text = `🏆 New Personal Record!\n${record.exerciseName}: ${record.weight}lbs × ${record.reps} reps\nTotal Volume: ${record.volume}lbs\n#FitForge #PersonalRecord`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FitForge Personal Record',
          text
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard!",
        description: "Your PR is ready to share"
      })
    }
  }

  const getTrophyIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5" style={{ color: TROPHY_COLORS.gold }} />
    if (index === 1) return <Trophy className="w-5 h-5" style={{ color: TROPHY_COLORS.silver }} />
    if (index === 2) return <Trophy className="w-5 h-5" style={{ color: TROPHY_COLORS.bronze }} />
    return <Award className="w-5 h-5 text-gray-400" />
  }

  if (loading) {
    return (
      <Card className={cn("bg-[#1C1C1E] border-gray-800 p-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-40"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-800 rounded"></div>
          ))}
        </div>
      </Card>
    )
  }

  if (!records.length) {
    return (
      <Card className={cn("bg-[#1C1C1E] border-gray-800 p-6", className)}>
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Personal Records Yet</h3>
          <p className="text-gray-400 text-sm">Complete workouts to start setting records!</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn("bg-[#1C1C1E] border-gray-800 p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#FFD700]" />
          Personal Records
        </h3>
        <Badge variant="secondary" className="bg-[#FF375F]/20 text-[#FF375F]">
          {records.length} PRs
        </Badge>
      </div>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="text-xs whitespace-nowrap"
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "text-xs whitespace-nowrap",
                selectedCategory === category && CATEGORY_COLORS[category]
              )}
            >
              {category}
            </Button>
          ))}
        </div>
      )}

      {/* Records List */}
      <div className="space-y-3">
        {filteredRecords.map((record, index) => {
          const isExpanded = expandedRecords.has(record.id)
          
          return (
            <div
              key={record.id}
              className={cn(
                "bg-[#252528] rounded-lg p-4 transition-all duration-200",
                "hover:bg-[#2A2A2D] cursor-pointer"
              )}
              onClick={() => toggleExpanded(record.id)}
            >
              {/* Main Content */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* Trophy/Rank */}
                  {getTrophyIcon(index)}
                  
                  {/* Exercise Info */}
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{record.exerciseName}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-400 flex items-center gap-1">
                        <Dumbbell className="w-3 h-3" />
                        {record.weight}lbs × {record.reps}
                      </span>
                      <span className="text-sm text-[#FF375F] font-medium">
                        {record.volume.toLocaleString()}lbs volume
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      CATEGORY_COLORS[record.category]?.replace('bg-', 'text-')
                    )}
                  >
                    {record.category}
                  </Badge>
                  <ChevronRight 
                    className={cn(
                      "w-4 h-4 text-gray-400 transition-transform",
                      isExpanded && "rotate-90"
                    )}
                  />
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Achieved on
                    </span>
                    <span className="text-white">
                      {format(new Date(record.achievedDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  
                  {record.improvement > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Improvement
                      </span>
                      <span className="text-green-500 font-medium">
                        +{record.improvement.toFixed(1)}%
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        onExerciseClick?.(record.exerciseName)
                      }}
                      className="flex-1 text-xs"
                    >
                      View Progress
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        shareRecord(record)
                      }}
                      className="flex-1 text-xs"
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* View All Link */}
      {records.length > 5 && (
        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white">
            View All Records
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      )}
    </Card>
  )
})

// Shareable PR Card Component for social media
export const ShareablePRCard = React.memo(function ShareablePRCard({
  record,
  userName = "FitForge User"
}: {
  record: PersonalRecord
  userName?: string
}) {
  return (
    <div className="bg-gradient-to-br from-[#FF375F] to-[#FF1744] p-6 rounded-lg text-white max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">Personal Record!</h3>
        <Trophy className="w-8 h-8 text-yellow-300" />
      </div>
      
      <div className="space-y-2">
        <p className="text-3xl font-bold">{record.exerciseName}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{record.weight}lbs</span>
          <span className="text-xl">× {record.reps} reps</span>
        </div>
        <p className="text-lg opacity-90">
          Total Volume: {record.volume.toLocaleString()}lbs
        </p>
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/20">
        <p className="text-sm opacity-80">{userName} • {format(new Date(record.achievedDate), 'MMM d, yyyy')}</p>
        <p className="text-xs opacity-60 mt-1">Tracked with FitForge</p>
      </div>
    </div>
  )
})