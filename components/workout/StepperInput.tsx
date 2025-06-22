/**
 * StepperInput Component
 * A mobile-optimized number input with increment/decrement buttons
 * Supports weight (0.25 lb increments) and reps (1 increment)
 */

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/fitforge-button'
import { Minus, Plus } from 'lucide-react'

export interface StepperInputProps {
  /** Current value */
  value: number
  /** Callback when value changes */
  onChange: (value: number) => void
  /** Minimum allowed value */
  min?: number
  /** Maximum allowed value */
  max?: number
  /** Step increment (0.25 for weight, 1 for reps) */
  step?: number
  /** Label for the input */
  label?: string
  /** Unit to display (e.g., 'lbs', 'reps') */
  unit?: string
  /** Size variant */
  size?: 'sm' | 'default' | 'lg'
  /** Disabled state */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
  /** ID for form association */
  id?: string
  /** Show decimal places */
  decimalPlaces?: number
  /** Enable haptic feedback on mobile */
  enableHaptics?: boolean
}

/**
 * StepperInput - Touch-optimized numeric input with increment/decrement
 * 
 * @example
 * ```tsx
 * // Weight input with 0.25 lb increments
 * <StepperInput
 *   value={weight}
 *   onChange={setWeight}
 *   min={0}
 *   max={500}
 *   step={0.25}
 *   unit="lbs"
 *   label="Weight"
 * />
 * 
 * // Reps input with single increments
 * <StepperInput
 *   value={reps}
 *   onChange={setReps}
 *   min={1}
 *   max={50}
 *   step={1}
 *   unit="reps"
 *   label="Reps"
 * />
 * ```
 */
export const StepperInput: React.FC<StepperInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  label,
  unit,
  size = 'default',
  disabled = false,
  className,
  id,
  decimalPlaces,
  enableHaptics = true,
}) => {
  const [localValue, setLocalValue] = useState(value.toString())
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  console.log('🔥 [StepperInput] ENTRY - props:', { value, min, max, step, unit, label })

  // Determine decimal places based on step if not explicitly provided
  const displayDecimalPlaces = decimalPlaces ?? (step < 1 ? 2 : 0)

  // Update local value when prop changes
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value.toFixed(displayDecimalPlaces))
    }
  }, [value, displayDecimalPlaces, isFocused])

  /**
   * Validate and normalize a numeric value
   */
  const normalizeValue = (val: number): number => {
    console.log('🔧 [normalizeValue] BEFORE:', val)
    
    // Clamp to min/max
    let normalized = Math.max(min, Math.min(max, val))
    
    // Round to nearest step
    if (step !== 1) {
      normalized = Math.round(normalized / step) * step
    }
    
    // Fix floating point precision issues
    normalized = parseFloat(normalized.toFixed(displayDecimalPlaces))
    
    console.log('🔧 [normalizeValue] AFTER:', normalized)
    return normalized
  }

  /**
   * Handle increment button click
   */
  const handleIncrement = () => {
    console.log('🔥 [handleIncrement] Current value:', value)
    
    const newValue = normalizeValue(value + step)
    if (newValue !== value) {
      onChange(newValue)
      
      // Haptic feedback on mobile
      if (enableHaptics && 'vibrate' in navigator) {
        navigator.vibrate(10)
      }
    }
  }

  /**
   * Handle decrement button click
   */
  const handleDecrement = () => {
    console.log('🔥 [handleDecrement] Current value:', value)
    
    const newValue = normalizeValue(value - step)
    if (newValue !== value) {
      onChange(newValue)
      
      // Haptic feedback on mobile
      if (enableHaptics && 'vibrate' in navigator) {
        navigator.vibrate(10)
      }
    }
  }

  /**
   * Handle direct input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔧 [handleInputChange] Raw input:', e.target.value)
    setLocalValue(e.target.value)
  }

  /**
   * Handle input blur - validate and update
   */
  const handleInputBlur = () => {
    console.log('🔥 [handleInputBlur] Local value:', localValue)
    setIsFocused(false)
    
    const numValue = parseFloat(localValue)
    
    if (isNaN(numValue)) {
      console.log('🚨 FAILURE CONDITION - Invalid number:', localValue)
      setLocalValue(value.toFixed(displayDecimalPlaces))
      return
    }
    
    const normalized = normalizeValue(numValue)
    onChange(normalized)
    setLocalValue(normalized.toFixed(displayDecimalPlaces))
  }

  /**
   * Handle input focus
   */
  const handleInputFocus = () => {
    setIsFocused(true)
    inputRef.current?.select()
  }

  // Size classes
  const sizeClasses = {
    sm: {
      container: 'h-10',
      button: 'h-10 w-10',
      input: 'text-sm',
      icon: 'h-3 w-3',
    },
    default: {
      container: 'h-12',
      button: 'h-12 w-12',
      input: 'text-base',
      icon: 'h-4 w-4',
    },
    lg: {
      container: 'h-14',
      button: 'h-14 w-14',
      input: 'text-lg',
      icon: 'h-5 w-5',
    },
  }

  const sizeConfig = sizeClasses[size]

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label 
          htmlFor={id} 
          className="text-sm font-medium text-gray-300"
        >
          {label}
        </label>
      )}
      
      <div className={cn(
        'flex items-center bg-[#1C1C1E] rounded-xl overflow-hidden',
        'border border-[#2C2C2E] focus-within:border-[#FF375F]',
        'transition-colors duration-200',
        sizeConfig.container
      )}>
        {/* Decrement button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={cn(
            'rounded-none border-r border-[#2C2C2E]',
            'hover:bg-[#2C2C2E] active:bg-[#3C3C3E]',
            'min-w-[44px]', // Touch-friendly target
            sizeConfig.button
          )}
          aria-label={`Decrease ${label || 'value'}`}
        >
          <Minus className={sizeConfig.icon} />
        </Button>

        {/* Input field */}
        <div className="flex-1 flex items-center justify-center px-2">
          <input
            ref={inputRef}
            id={id}
            type="number"
            inputMode="decimal"
            value={localValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            disabled={disabled}
            className={cn(
              'w-full bg-transparent text-center text-white',
              'focus:outline-none appearance-none',
              '[&::-webkit-inner-spin-button]:appearance-none',
              '[&::-webkit-outer-spin-button]:appearance-none',
              sizeConfig.input
            )}
            style={{
              MozAppearance: 'textfield',
            }}
          />
          {unit && (
            <span className={cn(
              'ml-1 text-gray-400',
              sizeConfig.input
            )}>
              {unit}
            </span>
          )}
        </div>

        {/* Increment button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className={cn(
            'rounded-none border-l border-[#2C2C2E]',
            'hover:bg-[#2C2C2E] active:bg-[#3C3C3E]',
            'min-w-[44px]', // Touch-friendly target
            sizeConfig.button
          )}
          aria-label={`Increase ${label || 'value'}`}
        >
          <Plus className={sizeConfig.icon} />
        </Button>
      </div>
    </div>
  )
}