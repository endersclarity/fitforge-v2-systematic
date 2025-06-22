/**
 * DateRangePicker Component
 * Simple date range selector for the dashboard
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format, subDays, subWeeks, subMonths } from 'date-fns'

export interface DateRange {
  start: Date
  end: Date
}

export interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

const PRESET_RANGES = [
  {
    label: 'Last 7 days',
    getValue: () => ({
      start: subDays(new Date(), 7),
      end: new Date()
    })
  },
  {
    label: 'Last 30 days',
    getValue: () => ({
      start: subDays(new Date(), 30),
      end: new Date()
    })
  },
  {
    label: 'Last 3 months',
    getValue: () => ({
      start: subMonths(new Date(), 3),
      end: new Date()
    })
  },
  {
    label: 'Last 6 months',
    getValue: () => ({
      start: subMonths(new Date(), 6),
      end: new Date()
    })
  },
  {
    label: 'Last 12 weeks',
    getValue: () => ({
      start: subWeeks(new Date(), 12),
      end: new Date()
    })
  },
  {
    label: 'Last year',
    getValue: () => ({
      start: subMonths(new Date(), 12),
      end: new Date()
    })
  }
]

export const DateRangePicker = React.memo(function DateRangePicker({
  value,
  onChange,
  className
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handlePresetClick = (preset: typeof PRESET_RANGES[0]) => {
    onChange(preset.getValue())
    setOpen(false)
  }

  const formatDateRange = (range: DateRange) => {
    return `${format(range.start, 'MMM d, yyyy')} - ${format(range.end, 'MMM d, yyyy')}`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("justify-start text-left font-normal", className)}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {formatDateRange(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-300 mb-2">Quick ranges</h4>
            {PRESET_RANGES.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
})