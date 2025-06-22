/**
 * FitForge Card Components
 * Dark theme cards with Fitbod-inspired styling
 */

import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl bg-[#1C1C1E] text-white",
      "border border-[#2C2C2E]",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-white",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[#A1A1A3]", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Exercise card specific component
interface ExerciseCardProps {
  name: string
  equipment: string
  category: string
  lastPerformed?: {
    weight: number
    reps: number
    date: string
  }
  onClick?: () => void
  className?: string
}

export function ExerciseCard({ 
  name, 
  equipment, 
  category, 
  lastPerformed,
  onClick,
  className 
}: ExerciseCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200",
        "hover:bg-[#2C2C2E] active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className="font-semibold text-white">{name}</h4>
            <p className="text-sm text-[#A1A1A3] mt-1">
              {equipment} • {category}
            </p>
          </div>
          {lastPerformed && (
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {lastPerformed.weight} lbs × {lastPerformed.reps}
              </p>
              <p className="text-xs text-[#A1A1A3] mt-1">
                Last: {lastPerformed.date}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Workout set card component
interface WorkoutSetCardProps {
  setNumber: number
  weight: number
  reps: number
  isCompleted?: boolean
  isPersonalBest?: boolean
  onEdit?: () => void
  className?: string
}

export function WorkoutSetCard({
  setNumber,
  weight,
  reps,
  isCompleted = false,
  isPersonalBest = false,
  onEdit,
  className
}: WorkoutSetCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-200",
        isCompleted && "bg-[#2C2C2E] border-[#10B981]",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-[#A1A1A3]">SET</p>
              <p className="text-lg font-bold text-white">{setNumber}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#A1A1A3]">WEIGHT</p>
              <p className="text-lg font-bold text-white">{weight} lbs</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#A1A1A3]">REPS</p>
              <p className="text-lg font-bold text-white">{reps}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPersonalBest && (
              <span className="px-2 py-1 bg-[#FF375F] text-white text-xs font-medium rounded-lg">
                PR
              </span>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 hover:bg-[#2C2C2E] rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-[#A1A1A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }