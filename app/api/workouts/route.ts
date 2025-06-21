import { NextRequest, NextResponse } from 'next/server'
import { WorkoutSchema, WorkoutCreateSchema } from '@/schemas/workout'
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

// POST /api/workouts - Create new workout with Zod validation
export async function POST(request: NextRequest) {
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

    // Validate with Zod schema
    const validatedWorkout = WorkoutCreateSchema.parse({
      ...rawData,
      userId // Ensure user ID is included
    })

    // Save via Data Access Layer
    const savedWorkout = await dataService.saveWorkout(validatedWorkout, userId)

    // Return validated workout data
    return NextResponse.json({ 
      success: true, 
      workout: WorkoutSchema.parse(savedWorkout)
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

    console.error('Error creating workout:', error)
    return NextResponse.json(
      { 
        error: `Failed to create workout: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// GET /api/workouts - Retrieve workouts for authenticated user
export async function GET(request: NextRequest) {
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

    // Get query parameters with validation
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Cap at 100
    const status = searchParams.get('status') as 'draft' | 'completed' | 'template' | null
    
    // Validate status parameter if provided
    if (status && !['draft', 'completed', 'template'].includes(status)) {
      return NextResponse.json(
        { 
          error: 'Invalid status parameter. Must be: draft, completed, or template',
          code: 'VALIDATION_ERROR' 
        },
        { status: 400 }
      )
    }

    // Get workouts from data service
    const workouts = await dataService.getWorkouts(userId, { limit, status })
    
    // Validate each workout with Zod before returning
    const validatedWorkouts = workouts.map(workout => WorkoutSchema.parse(workout))

    return NextResponse.json({
      workouts: validatedWorkouts,
      total: validatedWorkouts.length,
      filters: { status, limit }
    })

  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Data validation error in GET /workouts:', error.errors)
      // Return generic error to user, log detailed validation issues
      return NextResponse.json(
        { 
          error: 'Data integrity error',
          code: 'DATA_VALIDATION_ERROR'
        },
        { status: 500 }
      )
    }

    console.error('Error retrieving workouts:', error)
    return NextResponse.json(
      { 
        error: `Failed to retrieve workouts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// PUT /api/workouts - Update existing workout
export async function PUT(request: NextRequest) {
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

    // Validate with full Zod schema (includes ID)
    const validatedWorkout = WorkoutSchema.parse({
      ...rawData,
      userId // Ensure user ID matches
    })

    // Update via Data Access Layer
    const updatedWorkout = await dataService.updateWorkout(validatedWorkout, userId)

    if (!updatedWorkout) {
      return NextResponse.json(
        { 
          error: 'Workout not found or access denied',
          code: 'NOT_FOUND' 
        },
        { status: 404 }
      )
    }

    // Return validated workout data
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