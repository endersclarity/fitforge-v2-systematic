"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { UserPreferences, WorkoutPlan } from './workoutAlgorithms'
import { generateWorkoutPlan } from './workoutAlgorithms'

const defaultPrefs: UserPreferences = {
  goal: 'general',
  equipment: [],
  time: 45,
  experience: 'Beginner'
}

export default function WorkoutGenerator() {
  const [prefs, setPrefs] = useState<UserPreferences>(defaultPrefs)
  const [plan, setPlan] = useState<WorkoutPlan | null>(null)

  const handleGenerate = () => {
    setPlan(generateWorkoutPlan(prefs))
  }

  const updatePrefs = (key: keyof UserPreferences, value: any) => {
    setPrefs(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>AI Workout Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Goal</Label>
            <Select value={prefs.goal} onValueChange={v => updatePrefs('goal', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                <SelectItem value="endurance">Endurance</SelectItem>
                <SelectItem value="general">General Fitness</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Experience</Label>
            <Select
              value={prefs.experience}
              onValueChange={v => updatePrefs('experience', v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Time (minutes)</Label>
            <Input
              type="number"
              value={prefs.time}
              onChange={e => updatePrefs('time', Number(e.target.value) as any)}
              min={30}
            />
          </div>
          <div>
            <Label>Equipment (comma separated)</Label>
            <Input
              type="text"
              value={prefs.equipment.join(',')}
              onChange={e =>
                updatePrefs(
                  'equipment',
                  e.target.value
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean)
                )
              }
            />
          </div>
        </div>
        <Button onClick={handleGenerate}>Generate Workout</Button>

        {plan && (
          <div className="mt-4 space-y-2">
            <h3 className="font-bold">Push</h3>
            <ul className="list-disc list-inside">
              {plan.push.map(ex => (
                <li key={ex.id}>{ex.name}</li>
              ))}
            </ul>
            <h3 className="font-bold">Pull</h3>
            <ul className="list-disc list-inside">
              {plan.pull.map(ex => (
                <li key={ex.id}>{ex.name}</li>
              ))}
            </ul>
            <h3 className="font-bold">Legs</h3>
            <ul className="list-disc list-inside">
              {plan.legs.map(ex => (
                <li key={ex.id}>{ex.name}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
