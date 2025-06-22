/**
 * Loading and skeleton components
 * FitForge dark theme loading states
 */

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circular'
}

export function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[#2C2C2E]",
        variant === 'default' && "rounded-xl",
        variant === 'text' && "rounded h-4 w-full",
        variant === 'circular' && "rounded-full",
        className
      )}
      {...props}
    />
  )
}

export function ExerciseCardSkeleton() {
  return (
    <div className="rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 ml-auto" />
          <Skeleton className="h-3 w-16 ml-auto" />
        </div>
      </div>
    </div>
  )
}

export function WorkoutSetSkeleton() {
  return (
    <div className="rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center space-y-1">
            <Skeleton className="h-3 w-8 mx-auto" />
            <Skeleton className="h-6 w-12" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton className="h-3 w-12 mx-auto" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton className="h-3 w-10 mx-auto" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  )
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center items-center", className)}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF375F]" />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-[#121212] flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner className="mb-4" />
        <p className="text-[#A1A1A3] text-sm">Loading...</p>
      </div>
    </div>
  )
}