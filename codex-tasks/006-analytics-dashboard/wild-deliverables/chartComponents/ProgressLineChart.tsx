"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { WorkoutSet } from '../dataProcessing'
import { groupByDate } from '../dataProcessing'
import { formatDate, chartColors } from '../chartUtils'

interface Props {
  data: WorkoutSet[]
}

export default function ProgressLineChart({ data }: Props) {
  const chartData = groupByDate(data)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={formatDate} />
        <YAxis />
        <Tooltip labelFormatter={formatDate} />
        <Line type="monotone" dataKey="volume" stroke={chartColors[0]} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
