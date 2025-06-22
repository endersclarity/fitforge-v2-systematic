/**
 * Comprehensive muscle visualization component with heat map
 */

'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Toggle } from '@/components/ui/toggle'
import { 
  Activity, 
  RefreshCw, 
  Download, 
  Maximize2,
  Filter,
  Eye,
  EyeOff,
  Info,
  Accessibility
} from 'lucide-react'
import { MuscleAnatomy } from './MuscleAnatomy'
import { MuscleTooltip } from './MuscleTooltip'
import { useMuscleData } from '@/hooks/useMuscleData'
import { getMuscleColor, getUniqueMuscleNames, getMusclesByGroup } from './muscle-paths'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import html2canvas from 'html2canvas'

interface MuscleHeatmapProps {
  userId: string
  onExerciseClick?: (exerciseName: string) => void
  className?: string
}

export function MuscleHeatmap({ userId, onExerciseClick, className }: MuscleHeatmapProps) {
  const [view, setView] = useState<'front' | 'back'>('front')
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null)
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)
  const [filterGroup, setFilterGroup] = useState<string | null>(null)
  const [showLabels, setShowLabels] = useState(false)
  const [enableZoom, setEnableZoom] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const visualizationRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  
  const {
    heatmapData,
    selectedMuscle: selectedMuscleDetail,
    loading,
    error,
    lastUpdated,
    refreshData,
    selectMuscle,
    clearSelection,
    getMuscleColor: getDataColor
  } = useMuscleData(userId)

  // Handle muscle click
  const handleMuscleClick = useCallback((muscleName: string) => {
    setSelectedMuscle(muscleName)
    selectMuscle(muscleName)
  }, [selectMuscle])

  // Handle tooltip close
  const handleTooltipClose = useCallback(() => {
    setSelectedMuscle(null)
    clearSelection()
  }, [clearSelection])

  // Export as image
  const exportAsImage = useCallback(async () => {
    if (!visualizationRef.current) return

    try {
      toast({
        title: "Generating image...",
        description: "Please wait while we export your muscle heat map"
      })

      const canvas = await html2canvas(visualizationRef.current, {
        backgroundColor: '#121212',
        scale: 2
      })
      
      const link = document.createElement('a')
      link.download = `muscle-heatmap-${format(new Date(), 'yyyy-MM-dd')}.png`
      link.href = canvas.toDataURL()
      link.click()

      toast({
        title: "Export successful",
        description: "Your muscle heat map has been saved"
      })
    } catch (err) {
      console.error('Export error:', err)
      toast({
        title: "Export failed",
        description: "Unable to export the visualization",
        variant: "destructive"
      })
    }
  }, [toast])

  // Loading state
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Muscle Heat Map
          </CardTitle>
          <CardDescription>Loading muscle fatigue data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-[600px] w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Muscle Heat Map
          </CardTitle>
          <CardDescription className="text-red-500">Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare muscle data for visualization
  const muscleDataForViz = heatmapData?.muscle_states 
    ? Object.entries(heatmapData.muscle_states).reduce((acc, [name, data]) => {
        acc[name] = data.fatigue_percentage
        return acc
      }, {} as Record<string, number>)
    : {}

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#FF375F]" />
              Muscle Heat Map
            </CardTitle>
            <CardDescription>
              Real-time muscle fatigue visualization
              {lastUpdated && (
                <span className="ml-2 text-xs">
                  • Updated {format(lastUpdated, 'h:mm a')}
                </span>
              )}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {heatmapData && (
              <>
                <Badge variant="outline" className="bg-gray-800">
                  {heatmapData.overall_fatigue.toFixed(0)}% Overall
                </Badge>
                <Badge variant="outline" className="bg-green-900 text-green-300">
                  {heatmapData.recovery_ready_muscles.length} Ready
                </Badge>
                <Badge variant="outline" className="bg-red-900 text-red-300">
                  {heatmapData.most_fatigued_muscles.length} Fatigued
                </Badge>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex gap-1 p-1 bg-gray-800 rounded-lg">
              <Button
                variant={filterGroup === null ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilterGroup(null)}
              >
                All
              </Button>
              {['Push', 'Pull', 'Legs', 'Core'].map(group => (
                <Button
                  key={group}
                  variant={filterGroup === group ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilterGroup(filterGroup === group ? null : group)}
                >
                  {group}
                </Button>
              ))}
            </div>

            {/* View options */}
            <Toggle
              pressed={showLabels}
              onPressedChange={setShowLabels}
              size="sm"
              aria-label="Toggle muscle labels"
            >
              <Eye className="h-4 w-4" />
            </Toggle>
            
            <Toggle
              pressed={enableZoom}
              onPressedChange={setEnableZoom}
              size="sm"
              aria-label="Toggle zoom"
            >
              <Maximize2 className="h-4 w-4" />
            </Toggle>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsImage}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main visualization */}
        <div ref={visualizationRef} className="relative">
          <Tabs value={view} onValueChange={(v) => setView(v as 'front' | 'back')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="front">Front View</TabsTrigger>
              <TabsTrigger value="back">Back View</TabsTrigger>
            </TabsList>

            <TabsContent value={view} className="relative">
              <div className="h-[600px] relative">
                <MuscleAnatomy
                  view={view}
                  muscleData={muscleDataForViz}
                  hoveredMuscle={hoveredMuscle}
                  selectedMuscle={selectedMuscle}
                  onMuscleHover={setHoveredMuscle}
                  onMuscleClick={handleMuscleClick}
                  filterGroup={filterGroup as any}
                  showLabels={showLabels}
                  enableZoom={enableZoom}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Selected muscle tooltip */}
          {selectedMuscleDetail && (
            <MuscleTooltip
              muscle={selectedMuscleDetail}
              onClose={handleTooltipClose}
              onExerciseClick={onExerciseClick}
              position={isFullscreen ? 'right' : 'left'}
            />
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              Fatigue Scale
            </h4>
            <div className="flex items-center gap-2 text-xs">
              {[
                { color: '#10B981', label: '0-20%', desc: 'Recovered' },
                { color: '#F59E0B', label: '20-40%', desc: 'Light' },
                { color: '#FF8C42', label: '40-60%', desc: 'Moderate' },
                { color: '#FF6B6B', label: '60-80%', desc: 'High' },
                { color: '#FF375F', label: '80-100%', desc: 'Severe' }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-400">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Accessibility className="h-4 w-4" />
              Interaction
            </h4>
            <p className="text-xs text-gray-400">
              Hover to preview • Click for details • Scroll to zoom • Drag to pan
            </p>
          </div>
        </div>

        {/* Quick stats */}
        {heatmapData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-800">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {heatmapData.recovery_ready_muscles.length}
              </p>
              <p className="text-xs text-gray-500">Ready Muscles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">
                {Object.values(heatmapData.muscle_states).filter(m => 
                  m.fatigue_percentage >= 30 && m.fatigue_percentage < 60
                ).length}
              </p>
              <p className="text-xs text-gray-500">Recovering</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {heatmapData.most_fatigued_muscles.length}
              </p>
              <p className="text-xs text-gray-500">Fatigued</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {Object.keys(heatmapData.muscle_states).length}
              </p>
              <p className="text-xs text-gray-500">Total Tracked</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}