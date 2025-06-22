"use client"

import { useState } from 'react'
import ProgressLineChart from './chartComponents/ProgressLineChart'
import MuscleBalanceRadar from './chartComponents/MuscleBalanceRadar'
import type { WorkoutSet } from './dataProcessing'

const sampleData: WorkoutSet[] = [
  { exercise: 'Bench Press', weight: 185, reps: 5, date: '2024-05-01', muscles: { Chest: 70, Triceps: 30 } },
  { exercise: 'Bench Press', weight: 190, reps: 5, date: '2024-05-08', muscles: { Chest: 70, Triceps: 30 } },
  { exercise: 'Deadlift', weight: 315, reps: 3, date: '2024-05-10', muscles: { Back: 60, Legs: 40 } },
  { exercise: 'Squat', weight: 225, reps: 5, date: '2024-05-12', muscles: { Legs: 80, Core: 20 } },
  { exercise: 'Bench Press', weight: 195, reps: 5, date: '2024-05-15', muscles: { Chest: 70, Triceps: 30 } },
  { exercise: 'Overhead Press', weight: 115, reps: 5, date: '2024-05-18', muscles: { Shoulders: 70, Triceps: 30 } },
]

export default function AnalyticsDashboard() {
  const [data] = useState<WorkoutSet[]>(sampleData)

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-2 font-medium">Volume Progression</h3>
          <ProgressLineChart data={data} />
        </div>
        <div>
          <h3 className="mb-2 font-medium">Muscle Balance</h3>
          <MuscleBalanceRadar data={data} />
        </div>
      </div>
    </div>
  )
}
