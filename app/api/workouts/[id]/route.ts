import { NextRequest, NextResponse } from 'next/server'
import { WorkoutSchema } from '@/schemas/workout'
import { dataService } from '@/lib/data-service'
import { createClient } from '@supabase/supabase-js'
import { ZodError } from 'zod'

// Helper function to get authenticated user ID from request
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }
    
    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }
    
    return user.id
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}

// GET /api/workouts/[id] - Get specific workout by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user ID
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'UNAUTHORIZED' 
        },
        { status: 401 }
      )
    }

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(params.id)) {
      return NextResponse.json(
        { 
          error: 'Invalid workout ID format',
          code: 'VALIDATION_ERROR' 
        },
        { status: 400 }
      )
    }

    // Get workout from data service
    const workout = await dataService.getWorkout(params.id, userId)
    
    if (!workout) {
      return NextResponse.json(
        { 
          error: 'Workout not found',
          code: 'NOT_FOUND' 
        },
        { status: 404 }
      )
    }

    // Validate workout data with Zod
    const validatedWorkout = WorkoutSchema.parse(workout)

    return NextResponse.json({
      workout: validatedWorkout
    })

  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Data validation error in GET /workouts/[id]:', error.errors)
      return NextResponse.json(
        { 
          error: 'Data integrity error',
          code: 'DATA_VALIDATION_ERROR'
        },
        { status: 500 }
      )
    }

    console.error('Error retrieving workout:', error)
    return NextResponse.json(
      { 
        error: `Failed to retrieve workout: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/workouts/[id] - Delete specific workout
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user ID
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'UNAUTHORIZED' 
        },
        { status: 401 }
      )
    }

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(params.id)) {
      return NextResponse.json(
        { 
          error: 'Invalid workout ID format',
          code: 'VALIDATION_ERROR' 
        },
        { status: 400 }
      )
    }

    // Check if workout exists and user owns it
    const existingWorkout = await dataService.getWorkout(params.id, userId)
    if (!existingWorkout) {
      return NextResponse.json(
        { 
          error: 'Workout not found or access denied',
          code: 'NOT_FOUND' 
        },
        { status: 404 }
      )
    }

    // Prevent deletion of completed workouts (business rule)
    if (existingWorkout.status === 'completed') {
      return NextResponse.json(
        { 
          error: 'Cannot delete completed workouts',
          code: 'BUSINESS_RULE_VIOLATION' 
        },
        { status: 403 }
      )
    }

    // Delete workout
    await dataService.deleteWorkout(params.id, userId)

    return NextResponse.json({
      success: true,
      message: 'Workout deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting workout:', error)
    return NextResponse.json(
      { 
        error: `Failed to delete workout: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// PATCH /api/workouts/[id] - Partial update of workout (e.g., status changes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rawData = await request.json()

    // Get authenticated user ID
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'UNAUTHORIZED' 
        },
        { status: 401 }
      )
    }

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(params.id)) {
      return NextResponse.json(
        { 
          error: 'Invalid workout ID format',
          code: 'VALIDATION_ERROR' 
        },
        { status: 400 }
      )
    }

    // Get existing workout
    const existingWorkout = await dataService.getWorkout(params.id, userId)
    if (!existingWorkout) {
      return NextResponse.json(
        { 
          error: 'Workout not found or access denied',
          code: 'NOT_FOUND' 
        },
        { status: 404 }
      )
    }

    // Merge with existing data and validate
    const mergedWorkout = { ...existingWorkout, ...rawData, id: params.id, userId }
    const validatedWorkout = WorkoutSchema.parse(mergedWorkout)

    // Business rule: Mark completed workout with timestamp
    if (validatedWorkout.status === 'completed' && !validatedWorkout.completedAt) {
      validatedWorkout.completedAt = new Date()
    }

    // Update via Data Access Layer
    const updatedWorkout = await dataService.updateWorkout(validatedWorkout, userId)

    return NextResponse.json({ 
      success: true, 
      workout: WorkoutSchema.parse(updatedWorkout)
    })

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        },
        { status: 400 }
      )
    }

    console.error('Error updating workout:', error)
    return NextResponse.json(
      { 
        error: `Failed to update workout: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}