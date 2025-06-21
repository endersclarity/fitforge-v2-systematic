'use client'

import { useState, useCallback } from 'react'
import { ZodSchema, ZodError } from 'zod'

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface UseValidatedFormOptions<T> {
  schema: ZodSchema<T>
  onSubmit: (data: T) => Promise<void> | void
  defaultValues?: Partial<T>
  mode?: 'onChange' | 'onBlur' | 'onSubmit'
}

export interface UseValidatedFormReturn<T> {
  values: Partial<T>
  errors: ValidationError[]
  isValid: boolean
  isSubmitting: boolean
  setValue: (field: keyof T, value: any) => void
  setValues: (values: Partial<T>) => void
  validateField: (field: keyof T) => ValidationError[]
  validateAll: () => ValidationError[]
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  reset: () => void
  clearErrors: () => void
}

export function useValidatedForm<T extends Record<string, any>>({
  schema,
  onSubmit,
  defaultValues = {},
  mode = 'onSubmit'
}: UseValidatedFormOptions<T>): UseValidatedFormReturn<T> {
  const [values, setValuesState] = useState<Partial<T>>(defaultValues)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Convert Zod errors to our ValidationError format
  const formatZodErrors = useCallback((zodError: ZodError): ValidationError[] => {
    return zodError.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))
  }, [])

  // Validate a specific field
  const validateField = useCallback((field: keyof T): ValidationError[] => {
    try {
      // Create a partial schema for the field
      const fieldValue = values[field]
      if (fieldValue === undefined) return []

      // Validate the entire object to check field relationships
      schema.parse(values)
      
      // If no errors, clear errors for this field
      setErrors(prev => prev.filter(err => !err.field.startsWith(String(field))))
      return []
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = formatZodErrors(error).filter(err => 
          err.field.startsWith(String(field))
        )
        
        // Update errors state
        setErrors(prev => [
          ...prev.filter(err => !err.field.startsWith(String(field))),
          ...fieldErrors
        ])
        
        return fieldErrors
      }
      return []
    }
  }, [values, schema, formatZodErrors])

  // Validate all fields
  const validateAll = useCallback((): ValidationError[] => {
    try {
      schema.parse(values)
      setErrors([])
      return []
    } catch (error) {
      if (error instanceof ZodError) {
        const allErrors = formatZodErrors(error)
        setErrors(allErrors)
        return allErrors
      }
      return []
    }
  }, [values, schema, formatZodErrors])

  // Set a single field value
  const setValue = useCallback((field: keyof T, value: any) => {
    setValuesState(prev => ({ ...prev, [field]: value }))
    
    // Validate on change if mode is onChange
    if (mode === 'onChange') {
      // Use setTimeout to validate after state update
      setTimeout(() => validateField(field), 0)
    }
  }, [mode, validateField])

  // Set multiple values
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }))
    
    if (mode === 'onChange') {
      setTimeout(() => validateAll(), 0)
    }
  }, [mode, validateAll])

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    setIsSubmitting(true)

    try {
      // Validate all fields
      const validationErrors = validateAll()
      
      if (validationErrors.length > 0) {
        setIsSubmitting(false)
        return
      }

      // Parse and submit valid data
      const validData = schema.parse(values)
      await onSubmit(validData)
      
    } catch (error) {
      if (error instanceof ZodError) {
        setErrors(formatZodErrors(error))
      } else {
        // Handle submission errors
        console.error('Form submission error:', error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [values, schema, onSubmit, validateAll, formatZodErrors])

  // Reset form
  const reset = useCallback(() => {
    setValuesState(defaultValues)
    setErrors([])
    setIsSubmitting(false)
  }, [defaultValues])

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  // Handle blur events
  const handleBlur = useCallback((field: keyof T) => {
    if (mode === 'onBlur') {
      validateField(field)
    }
  }, [mode, validateField])

  // Calculate if form is valid
  const isValid = errors.length === 0 && Object.keys(values).length > 0

  return {
    values,
    errors,
    isValid,
    isSubmitting,
    setValue,
    setValues,
    validateField,
    validateAll,
    handleSubmit,
    reset,
    clearErrors
  }
}

// Helper hook for getting field-specific props
export function useFieldProps<T extends Record<string, any>>(
  form: UseValidatedFormReturn<T>,
  field: keyof T
) {
  const fieldErrors = form.errors.filter(err => err.field.startsWith(String(field)))
  const hasError = fieldErrors.length > 0
  
  return {
    value: form.values[field] || '',
    onChange: (value: any) => form.setValue(field, value),
    onBlur: () => form.validateField(field),
    error: hasError,
    errorMessage: fieldErrors[0]?.message,
    errorDetails: fieldErrors
  }
}