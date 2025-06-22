"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'
import type { WorkoutSet } from '../dataProcessing'
import { muscleBalance } from '../dataProcessing'
import { chartColors } from '../chartUtils'

interface Props {
  data: WorkoutSet[]
}

export default function MuscleBalanceRadar({ data }: Props) {
  const chartData = muscleBalance(data)
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="muscle" />
        <PolarRadiusAxis />
        <Tooltip />
        <Radar name="Engagement" dataKey="engagement" stroke={chartColors[1]} fill={chartColors[1]} fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
