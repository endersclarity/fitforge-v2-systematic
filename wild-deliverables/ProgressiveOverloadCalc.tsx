"use client"

import { useState } from "react"
import {
  linearProgression,
  doubleProgression,
  percentageBasedProgression,
  autoRegulation,
  WorkoutHistoryEntry,
} from "./progressionAlgorithms"
import { detectPlateau } from "./plateauDetection"

interface ProgressiveOverloadCalcProps {
  history: WorkoutHistoryEntry[]
}

export default function ProgressiveOverloadCalc({ history }: ProgressiveOverloadCalcProps) {
  const last = history[history.length - 1]
  const [method, setMethod] = useState("linear")
  const [recommendation, setRecommendation] = useState<{ weight: number; reps: number }>({
    weight: last?.weight || 0,
    reps: last?.reps || 0,
  })

  const calculate = () => {
    switch (method) {
      case "linear":
        setRecommendation({
          weight: linearProgression(recommendation.weight, { weeklyIncrement: 2.5 }),
          reps: recommendation.reps,
        })
        break
      case "double":
        setRecommendation(
          doubleProgression(recommendation.weight, recommendation.reps, {
            minReps: 5,
            maxReps: 10,
            weightIncrement: 2.5,
          })
        )
        break
      case "percentage":
        setRecommendation({
          weight: percentageBasedProgression(recommendation.weight, 2),
          reps: recommendation.reps,
        })
        break
      case "autoregulatory":
        setRecommendation({
          weight: autoRegulation(8, 9, recommendation.weight),
          reps: recommendation.reps,
        })
        break
      default:
        break
    }
  }

  const plateau = detectPlateau(history)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Progressive Overload Calculator</h2>
      {plateau && (
        <p className="text-sm text-red-600">Plateau detected - consider a deload!</p>
      )}
      <div className="flex space-x-2">
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="border p-1">
          <option value="linear">Linear</option>
          <option value="double">Double</option>
          <option value="percentage">Percentage</option>
          <option value="autoregulatory">Auto Regulation</option>
        </select>
        <button onClick={calculate} className="px-2 py-1 border rounded">Calculate</button>
      </div>
      <div>
        <p className="text-sm">Next Weight: {recommendation.weight} kg</p>
        <p className="text-sm">Target Reps: {recommendation.reps}</p>
      </div>
    </div>
  )
}
