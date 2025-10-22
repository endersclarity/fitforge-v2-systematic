'use client'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import exercisesData from '@/data/exercises.json'
import { WorkoutSetV2 } from './validationV2'
import { useWorkoutLoggerV2 } from './useWorkoutLoggerV2'

const exercises = exercisesData.map((ex) => ({ id: ex.id.toString(), name: ex.name }))

export function WorkoutLoggerV2() {
  const { form, submitSet, sets, isSaving, getLastWeight } = useWorkoutLoggerV2({
    onSuccess: () => toast.success('Set logged!'),
  })

  const handleExerciseChange = (value: string) => {
    form.setValue('exerciseId', value)
    const lw = getLastWeight(value)
    if (lw !== null) {
      form.setValue('weight', lw)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitSet)} className="space-y-4" aria-label="Workout logger form">
        <FormField
          control={form.control}
          name="exerciseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exercise</FormLabel>
              <Select onValueChange={handleExerciseChange} value={field.value}>
                <FormControl>
                  <SelectTrigger id="exercise" aria-label="Choose exercise">
                    <SelectValue placeholder="Select exercise" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {exercises.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id} aria-label={ex.name}>
                      {ex.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (lbs)</FormLabel>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => field.onChange(Math.max(0, (field.value || 0) - 0.25))}
                  aria-label="Decrease weight"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <FormControl>
                  <Input
                    type="number"
                    step={0.25}
                    min={0}
                    max={500}
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => field.onChange(Math.min(500, (field.value || 0) + 0.25))}
                  aria-label="Increase weight"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reps</FormLabel>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => field.onChange(Math.max(1, (field.value || 1) - 1))}
                  aria-label="Decrease reps"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <FormControl>
                  <Input
                    type="number"
                    step={1}
                    min={1}
                    max={50}
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => field.onChange(Math.min(50, (field.value || 1) + 1))}
                  aria-label="Increase reps"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSaving} aria-label="Submit set" className="min-w-[120px]">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Logging...
            </>
          ) : (
            'Log Set'
          )}
        </Button>

        {sets.length > 0 && (
          <ul className="text-sm space-y-1" aria-live="polite">
            {sets.map((s: WorkoutSetV2, i) => (
              <li key={i}>{s.weight} lbs x {s.reps}</li>
            ))}
          </ul>
        )}
      </form>
    </Form>
  )
}
