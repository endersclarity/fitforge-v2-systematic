/**
 * SVG anatomy component with interactive muscle regions
 */

import { useState, useRef, useEffect } from 'react'
import { 
  frontMusclePaths, 
  backMusclePaths, 
  bodyOutlineFront, 
  bodyOutlineBack,
  getMuscleColor,
  type MusclePath 
} from './muscle-paths'
import { cn } from '@/lib/utils'

interface MuscleAnatomyProps {
  view: 'front' | 'back'
  muscleData: Record<string, number> // muscle name -> fatigue percentage
  hoveredMuscle: string | null
  selectedMuscle: string | null
  onMuscleHover: (muscleName: string | null) => void
  onMuscleClick: (muscleName: string) => void
  filterGroup?: 'Push' | 'Pull' | 'Legs' | 'Core' | 'Arms' | 'Shoulders' | null
  showLabels?: boolean
  enableZoom?: boolean
}

export function MuscleAnatomy({
  view,
  muscleData,
  hoveredMuscle,
  selectedMuscle,
  onMuscleHover,
  onMuscleClick,
  filterGroup = null,
  showLabels = false,
  enableZoom = true
}: MuscleAnatomyProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [viewBox, setViewBox] = useState('0 0 400 600')
  const [isPanning, setIsPanning] = useState(false)
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })

  const muscles = view === 'front' ? frontMusclePaths : backMusclePaths
  const bodyOutline = view === 'front' ? bodyOutlineFront : bodyOutlineBack

  // Filter muscles by group if specified
  const displayMuscles = filterGroup 
    ? muscles.filter(m => m.group === filterGroup)
    : muscles

  // Handle zoom with mouse wheel
  useEffect(() => {
    if (!enableZoom || !svgRef.current) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(0.5, Math.min(3, scale * delta))
      setScale(newScale)
    }

    const svg = svgRef.current
    svg.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      svg.removeEventListener('wheel', handleWheel)
    }
  }, [scale, enableZoom])

  // Pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enableZoom) return
    setIsPanning(true)
    setStartPoint({ x: e.clientX - translate.x, y: e.clientY - translate.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return
    setTranslate({
      x: e.clientX - startPoint.x,
      y: e.clientY - startPoint.y
    })
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  // Reset view
  const resetView = () => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }

  // Get muscle rendering properties
  const getMuscleProps = (muscle: MusclePath) => {
    const fatigueLevel = muscleData[muscle.scientificName] || 0
    const isHovered = hoveredMuscle === muscle.scientificName
    const isSelected = selectedMuscle === muscle.scientificName
    const isFiltered = filterGroup && muscle.group !== filterGroup

    let fillColor = '#E5E7EB' // Default gray
    let fillOpacity = 0.3
    let strokeWidth = 1
    let strokeColor = '#9CA3AF'
    
    if (!isFiltered && fatigueLevel > 0) {
      fillColor = getMuscleColor(fatigueLevel)
      fillOpacity = 0.7
    }
    
    if (isHovered) {
      fillOpacity = 0.9
      strokeWidth = 2
      strokeColor = '#1F2937'
    }
    
    if (isSelected) {
      strokeWidth = 3
      strokeColor = '#FF375F'
    }
    
    if (isFiltered) {
      fillOpacity = 0.1
    }

    return {
      fill: fillColor,
      fillOpacity,
      stroke: strokeColor,
      strokeWidth,
      cursor: isFiltered ? 'default' : 'pointer',
      pointerEvents: isFiltered ? 'none' : 'auto' as const
    }
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg overflow-hidden">
      {/* Zoom controls */}
      {enableZoom && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={() => setScale(Math.min(3, scale * 1.2))}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
            title="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => setScale(Math.max(0.5, scale * 0.8))}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
            title="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={resetView}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
            title="Reset view"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )}

      {/* SVG Anatomy */}
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className={cn(
          "w-full h-full",
          isPanning ? "cursor-grabbing" : enableZoom ? "cursor-grab" : ""
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: 'center'
        }}
      >
        {/* Background gradient */}
        <defs>
          <radialGradient id="bodyGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#374151" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#111827" stopOpacity="0.3" />
          </radialGradient>
          
          {/* Glow effects for hover */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Body outline */}
        <path
          d={bodyOutline}
          fill="url(#bodyGradient)"
          stroke="#4B5563"
          strokeWidth="2"
          strokeDasharray="5,5"
          opacity="0.5"
        />

        {/* Muscle groups */}
        <g>
          {displayMuscles.map((muscle, index) => {
            const props = getMuscleProps(muscle)
            const key = `${muscle.scientificName}-${muscle.side || 'center'}-${index}`
            
            return (
              <g key={key}>
                <path
                  d={muscle.path}
                  {...props}
                  className="transition-all duration-200"
                  onMouseEnter={() => !filterGroup || muscle.group === filterGroup ? onMuscleHover(muscle.scientificName) : null}
                  onMouseLeave={() => onMuscleHover(null)}
                  onClick={() => !filterGroup || muscle.group === filterGroup ? onMuscleClick(muscle.scientificName) : null}
                  filter={hoveredMuscle === muscle.scientificName ? "url(#glow)" : undefined}
                />
                
                {/* Show labels if enabled */}
                {showLabels && !filterGroup && fatigueLevel > 0 && (
                  <text
                    x={getMuscleCenter(muscle.path).x}
                    y={getMuscleCenter(muscle.path).y}
                    textAnchor="middle"
                    className="text-xs fill-white pointer-events-none select-none"
                    style={{ textShadow: '0 0 3px rgba(0,0,0,0.8)' }}
                  >
                    {muscle.name}
                  </text>
                )}
              </g>
            )
          })}
        </g>

        {/* Hover info */}
        {hoveredMuscle && (
          <g className="pointer-events-none">
            <rect
              x="10"
              y="10"
              width="200"
              height="60"
              rx="5"
              fill="#1F2937"
              fillOpacity="0.95"
              stroke="#FF375F"
              strokeWidth="1"
            />
            <text x="20" y="30" className="text-sm font-semibold fill-white">
              {hoveredMuscle}
            </text>
            <text x="20" y="50" className="text-xs fill-gray-300">
              Fatigue: {(muscleData[hoveredMuscle] || 0).toFixed(0)}%
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

// Helper function to get center point of a path (simplified)
function getMuscleCenter(pathData: string): { x: number, y: number } {
  const numbers = pathData.match(/\d+/g)?.map(Number) || []
  if (numbers.length < 2) return { x: 0, y: 0 }
  
  const xCoords = numbers.filter((_, i) => i % 2 === 0)
  const yCoords = numbers.filter((_, i) => i % 2 === 1)
  
  const avgX = xCoords.reduce((a, b) => a + b, 0) / xCoords.length
  const avgY = yCoords.reduce((a, b) => a + b, 0) / yCoords.length
  
  return { x: avgX, y: avgY }
}