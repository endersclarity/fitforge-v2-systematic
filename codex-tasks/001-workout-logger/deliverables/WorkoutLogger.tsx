'use client'

import exercises from '@/data/exercises.json'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { useWorkoutLogger } from './useWorkoutLogger'

interface WorkoutLoggerProps {
  onLogged?: (data: any) => void
}

export function WorkoutLogger({ onLogged }: WorkoutLoggerProps) {
  const { handleSubmit, submit, control, formState } = useWorkoutLogger(onLogged)

  return (
    <Form {...{ control }}>
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <FormField
          control={control}
          name="exerciseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exercise</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id.toString()}>
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
          control={control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (lbs)</FormLabel>
              <FormControl>
                <Input type="number" step="0.25" min="0" max="500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="reps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reps</FormLabel>
              <FormControl>
                <Input type="number" min="1" max="50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 'Saving...' : 'Log Set'}
        </Button>
      </form>
    </Form>
  )
}
