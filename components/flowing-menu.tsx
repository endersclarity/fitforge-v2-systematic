'use client'

import React, { useRef, useState, useEffect } from "react"
import { motion, useAnimation, useMotionValue, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  Dumbbell, 
  Search, 
  BarChart3, 
  Zap,
  ArrowRight,
  Star,
  Target
} from "lucide-react"

interface FlowingMenuProps {
  items: FlowingMenuItem[]
  className?: string
}

interface FlowingMenuItem {
  id: string
  title: string
  subtitle: string
  href: string
  icon: React.ComponentType<any>
  color: string
  image?: string
}

interface EdgePosition {
  edge: 'top' | 'bottom' | 'left' | 'right'
  position: { x: number; y: number }
}

export function FlowingMenu({ items, className = "" }: FlowingMenuProps) {
  return (
    <div className={`flowing-menu ${className}`}>
      <nav className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <FlowingMenuItem key={item.id} item={item} />
        ))}
      </nav>
    </div>
  )
}

function FlowingMenuItem({ item }: { item: FlowingMenuItem }) {
  const router = useRouter()
  const itemRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  
  const [isHovered, setIsHovered] = useState(false)
  const [edgeInfo, setEdgeInfo] = useState<EdgePosition | null>(null)
  
  const overlayControls = useAnimation()
  const marqueeX = useMotionValue(0)
  
  // Edge detection function - calculates closest edge
  const detectClosestEdge = (mouseX: number, mouseY: number, rect: DOMRect): EdgePosition => {
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const distances = {
      top: Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY, 2)),
      bottom: Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - rect.height, 2)),
      left: Math.sqrt(Math.pow(mouseX, 2) + Math.pow(mouseY - centerY, 2)),
      right: Math.sqrt(Math.pow(mouseX - rect.width, 2) + Math.pow(mouseY - centerY, 2))
    }
    
    const closestEdge = Object.keys(distances).reduce((a, b) => 
      distances[a as keyof typeof distances] < distances[b as keyof typeof distances] ? a : b
    ) as 'top' | 'bottom' | 'left' | 'right'
    
    return {
      edge: closestEdge,
      position: { x: mouseX, y: mouseY }
    }
  }
  
  // Handle mouse enter with edge detection
  const handleMouseEnter = async (event: React.MouseEvent) => {
    if (!itemRef.current) return
    
    const rect = itemRef.current.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    
    const edgePosition = detectClosestEdge(mouseX, mouseY, rect)
    setEdgeInfo(edgePosition)
    setIsHovered(true)
    
    // Set initial position based on edge
    const initialY = edgePosition.edge === 'top' ? '-100%' : 
                    edgePosition.edge === 'bottom' ? '100%' : '0%'
    const initialX = edgePosition.edge === 'left' ? '-100%' : 
                    edgePosition.edge === 'right' ? '100%' : '0%'
    
    // Animate overlay sliding in from detected edge
    await overlayControls.set({ 
      x: initialX, 
      y: initialY,
      opacity: 0
    })
    
    await overlayControls.start({
      x: '0%',
      y: '0%', 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.6
      }
    })
    
    // Start marquee animation
    startMarqueeAnimation()
  }
  
  // Handle mouse leave with edge detection
  const handleMouseLeave = async (event: React.MouseEvent) => {
    if (!itemRef.current) return
    
    const rect = itemRef.current.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    
    const edgePosition = detectClosestEdge(mouseX, mouseY, rect)
    setIsHovered(false)
    
    // Animate overlay sliding out to detected edge
    const exitY = edgePosition.edge === 'top' ? '-100%' : 
                 edgePosition.edge === 'bottom' ? '100%' : '0%'
    const exitX = edgePosition.edge === 'left' ? '-100%' : 
                 edgePosition.edge === 'right' ? '100%' : '0%'
    
    await overlayControls.start({
      x: exitX,
      y: exitY,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.6
      }
    })
    
    // Stop marquee animation
    stopMarqueeAnimation()
  }
  
  // Marquee animation functions
  const startMarqueeAnimation = () => {
    if (!marqueeRef.current) return
    
    const marqueeWidth = marqueeRef.current.scrollWidth
    const containerWidth = marqueeRef.current.offsetWidth
    
    if (marqueeWidth > containerWidth) {
      marqueeX.set(0)
      // Smooth scrolling marquee effect
      marqueeX.stop()
      marqueeX.set(0)
      
      const animation = setInterval(() => {
        const currentX = marqueeX.get()
        const newX = currentX - 1
        if (Math.abs(newX) >= marqueeWidth / 2) {
          marqueeX.set(0)
        } else {
          marqueeX.set(newX)
        }
      }, 16) // ~60fps
      
      // Store animation ref for cleanup
      ;(marqueeRef.current as any).animationRef = animation
    }
  }
  
  const stopMarqueeAnimation = () => {
    if (marqueeRef.current && (marqueeRef.current as any).animationRef) {
      clearInterval((marqueeRef.current as any).animationRef)
      ;(marqueeRef.current as any).animationRef = null
    }
  }
  
  // Cleanup on unmount
  useEffect(() => {
    return () => stopMarqueeAnimation()
  }, [])
  
  const IconComponent = item.icon
  
  return (
    <motion.div
      ref={itemRef}
      className="relative overflow-hidden rounded-xl bg-fitbod-card border border-fitbod-subtle shadow-lg cursor-pointer group"
      style={{ height: '200px' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => router.push(item.href)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Base Card Content */}
      <div className="p-6 h-full flex flex-col justify-between relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color} shadow-lg`}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <span className="px-3 py-1 bg-fitbod-subtle text-fitbod-text-secondary text-sm font-medium rounded-full">
            {item.subtitle}
          </span>
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-fitbod-text mb-2">{item.title}</h3>
          <div className="flex items-center text-fitbod-text-secondary">
            <span className="mr-2">Explore</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
      
      {/* Flowing Overlay */}
      <motion.div
        ref={overlayRef}
        className={`absolute inset-0 bg-gradient-to-r ${item.color} z-20`}
        animate={overlayControls}
        initial={{ x: '0%', y: '100%', opacity: 0 }}
      >
        <div className="p-6 h-full flex flex-col justify-center items-center text-white">
          {/* Marquee Content */}
          <div className="w-full overflow-hidden">
            <motion.div
              ref={marqueeRef}
              className="flex items-center whitespace-nowrap"
              style={{ x: marqueeX }}
            >
              {/* Repeated marquee content */}
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="flex items-center mr-8">
                  <Star className="h-4 w-4 mr-2" />
                  <span className="text-lg font-semibold mr-2">{item.title}</span>
                  <Target className="h-4 w-4 mr-2" />
                  <span className="text-sm opacity-80 mr-8">{item.subtitle}</span>
                </div>
              ))}
            </motion.div>
          </div>
          
          {/* Action Button */}
          <motion.button
            className="mt-6 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg text-white font-medium hover:bg-white/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              router.push(item.href)
            }}
          >
            {`Open ${item.title}`}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Export default menu items for dashboard
export const defaultDashboardMenuItems: FlowingMenuItem[] = [
  {
    id: 'workouts',
    title: 'Workouts',
    subtitle: 'Templates & routines',
    href: '/push-pull-legs',
    icon: Dumbbell,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'exercises',
    title: 'Exercise Library',
    subtitle: 'Browse & discover', 
    href: '/muscle-explorer',
    icon: Search,
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    subtitle: 'Progress & insights',
    href: '/analytics',
    icon: BarChart3,
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'quicklog',
    title: 'Quick Log',
    subtitle: 'Fast workout entry',
    href: '/workout-simple',
    icon: Zap,
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'experimental',
    title: 'Experimental Flows',
    subtitle: 'Try new features',
    href: '/flows-experimental',
    icon: Zap,
    color: 'from-pink-500 to-pink-600',
  }
]