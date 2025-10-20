"use client"

import { useState, useEffect } from "react"
import { frontMuscles, backMuscles, MusclePath } from "./muscleSvgData"
import { getHeatColor } from "./heatMapUtils"

interface Exercise {
  id: string
  name: string
  muscleEngagement: Record<string, number>
}

const dataPath = "../../../data/exercises.json"

export default function MuscleHeatMap() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedId, setSelectedId] = useState<string>("1")
  const [view, setView] = useState<"front" | "back">("front")

  useEffect(() => {
    fetch(dataPath)
      .then((r) => r.json())
      .then((d: Exercise[]) => setExercises(d))
      .catch(() => {})
  }, [])

  const selected = exercises.find((e) => e.id === selectedId)
  const engagement = selected?.muscleEngagement || {}

  const renderMuscle = (m: MusclePath) => {
    const percent = engagement[m.name] || 0
    const color = percent ? getHeatColor(percent) : "#e5e7eb"
    return (
      <path
        key={m.name}
        d={m.path}
        fill={color}
        stroke="#1e293b"
        strokeWidth={1}
        style={{ transition: "fill 0.3s ease" }}
      >
        <title>
          {m.name}: {percent}%
        </title>
      </path>
    )
  }

  const muscles = view === "front" ? frontMuscles : backMuscles

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
        <button
          className="border rounded px-2 py-1 text-sm"
          onClick={() => setView(view === "front" ? "back" : "front")}
        >
          {view === "front" ? "Back" : "Front"}
        </button>
      </div>
      <svg viewBox="0 0 350 420" className="w-full max-w-sm mx-auto">
        {muscles.map(renderMuscle)}
      </svg>
    </div>
  )
}
