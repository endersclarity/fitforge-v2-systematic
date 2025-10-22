'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Controller } from 'react-hook-form'
import { useWorkoutLogger } from './useWorkoutLogger'

export function WorkoutLogger() {
  const { form, onSubmit, error, exerciseOptions } = useWorkoutLogger()

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-sm">
      <Controller
        control={form.control}
        name="exerciseId"
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select exercise" />
            </SelectTrigger>
            <SelectContent>
              {exerciseOptions.map(opt => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {form.formState.errors.exerciseId && (
        <p className="text-sm text-red-500">
          {form.formState.errors.exerciseId.message}
        </p>
      )}

      <Input
        type="number"
        step="0.25"
        min="0"
        max="500"
        placeholder="Weight (lbs)"
        {...form.register('weight', { valueAsNumber: true })}
      />
      {form.formState.errors.weight && (
        <p className="text-sm text-red-500">
          {form.formState.errors.weight.message}
        </p>
      )}

      <Input
        type="number"
        min="1"
        max="50"
        placeholder="Reps"
        {...form.register('reps', { valueAsNumber: true })}
      />
      {form.formState.errors.reps && (
        <p className="text-sm text-red-500">
          {form.formState.errors.reps.message}
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Saving...' : 'Save Set'}
      </Button>
    </form>
  )
}
