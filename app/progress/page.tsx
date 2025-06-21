import { ProgressTracker } from "@/components/progress-tracker"
import { WorkoutHistoryAnalyzer } from "@/components/workout-history-analyzer"
import { StrengthProgressionCharts } from "@/components/strength-progression-charts"
import { MuscleBalanceAnalyzer } from "@/components/muscle-balance-analyzer"
import { WorkoutFrequencyOptimizer } from "@/components/workout-frequency-optimizer"

export default function ProgressPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Progress Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive analysis of your fitness journey and performance trends
        </p>
      </div>

      {/* Legacy Progress Tracker */}
      <ProgressTracker />
      
      {/* Advanced Analytics Components */}
      <div className="space-y-6">
        {/* Workout History Analysis */}
        <WorkoutHistoryAnalyzer />
        
        {/* Strength Progression Charts */}
        <StrengthProgressionCharts />
        
        {/* Muscle Balance Analysis */}
        <MuscleBalanceAnalyzer />
        
        {/* Workout Frequency Optimization */}
        <WorkoutFrequencyOptimizer />
      </div>
    </div>
  )
}
