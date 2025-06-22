/**
 * FitForge Input Components
 * Dark theme inputs following Fitbod design patterns
 */

import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1A3]">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex w-full rounded-xl bg-[#2C2C2E] px-4 py-3 text-base text-white",
            "border border-[#2C2C2E] transition-all duration-200",
            "placeholder:text-[#A1A1A3]",
            "focus:border-[#FF375F] focus:outline-none focus:ring-4 focus:ring-[#FF375F]/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-[#FF375F] ring-4 ring-[#FF375F]/20",
            icon && "pl-10",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

// Specialized number input for workout data
export interface NumberInputProps extends Omit<InputProps, 'type' | 'onChange'> {
  value?: number
  onChange?: (value: number | undefined) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onChange, min, max, step, suffix, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (val === '') {
        onChange?.(undefined)
      } else {
        const num = parseFloat(val)
        if (!isNaN(num)) {
          onChange?.(num)
        }
      }
    }

    return (
      <div className="relative">
        <input
          type="number"
          value={value ?? ''}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className={cn(
            "flex w-full rounded-xl bg-[#2C2C2E] px-4 py-3",
            "text-center text-2xl font-semibold text-white",
            "border border-[#2C2C2E] transition-all duration-200",
            "placeholder:text-[#A1A1A3]",
            "focus:border-[#FF375F] focus:outline-none focus:ring-4 focus:ring-[#FF375F]/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Hide number input spinners
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            className
          )}
          ref={ref}
          {...props}
        />
        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1A3] text-sm">
            {suffix}
          </div>
        )}
      </div>
    )
  }
)
NumberInput.displayName = "NumberInput"

// Stepper buttons for number inputs
interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}

export function StepperInput({ value, onChange, min = 0, max = 999, step = 1, suffix }: StepperProps) {
  const decrease = () => {
    const newValue = Math.max(min, value - step)
    onChange(newValue)
  }

  const increase = () => {
    const newValue = Math.min(max, value + step)
    onChange(newValue)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={decrease}
        disabled={value <= min}
        className={cn(
          "h-12 w-12 rounded-xl bg-[#2C2C2E] text-white",
          "hover:bg-[#3C3C3E] active:scale-95 transition-all",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        aria-label="Decrease"
      >
        <span className="text-xl">−</span>
      </button>
      
      <div className="flex-1 text-center">
        <div className="text-3xl font-bold text-white">
          {value}
          {suffix && <span className="text-xl text-[#A1A1A3] ml-1">{suffix}</span>}
        </div>
      </div>
      
      <button
        type="button"
        onClick={increase}
        disabled={value >= max}
        className={cn(
          "h-12 w-12 rounded-xl bg-[#2C2C2E] text-white",
          "hover:bg-[#3C3C3E] active:scale-95 transition-all",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        aria-label="Increase"
      >
        <span className="text-xl">+</span>
      </button>
    </div>
  )
}

export { Input, NumberInput }