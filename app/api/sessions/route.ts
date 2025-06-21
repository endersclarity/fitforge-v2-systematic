import { NextRequest, NextResponse } from 'next/server'
import { dataService } from '@/lib/data-service'
import { createClient } from '@supabase/supabase-js'
import { WorkoutSessionSchema, WorkoutSessionCreateSchema } from '@/schemas/workout'
import { ZodError } from 'zod'

// Helper function to get authenticated user ID from request
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Get the session token from Authorization header
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

// POST /api/sessions - Save new workout session with Zod validation
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
    const validatedSession = WorkoutSessionCreateSchema.parse({
      ...rawData,
      userId // Ensure user ID is included
    })

    // Save via Data Access Layer
    const savedSession = await dataService.saveWorkoutSession(validatedSession, userId)

    return NextResponse.json({ 
      success: true, 
      sessionId: savedSession.id,
      session: WorkoutSessionSchema.parse(savedSession)
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

    console.error('Error saving workout session:', error)
    return NextResponse.json(
      { 
        error: `Failed to save workout session: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// GET /api/sessions - Retrieve workout sessions for authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user ID
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const includeDetails = searchParams.get('details') === 'true'

    if (includeDetails) {
      // Get detailed sessions (includes exercises and sets)
      const sessions = await dataService.getWorkoutSessions(userId, limit)
      const detailedSessions: DetailedWorkoutSession[] = []
      
      for (const session of sessions) {
        const detailed = await dataService.getDetailedWorkoutSession(session.id)
        if (detailed) {
          detailedSessions.push(detailed)
        }
      }
      
      return NextResponse.json({
        sessions: detailedSessions,
        totalSessions: detailedSessions.length,
        lastSession: detailedSessions[0] || null
      })
    } else {
      // Get basic session info only
      const sessions = await dataService.getWorkoutSessions(userId, limit)
      
      return NextResponse.json({
        sessions,
        totalSessions: sessions.length,
        lastSession: sessions[0] || null
      })
    }

  } catch (error) {
    console.error('Error retrieving workout sessions:', error)
    return NextResponse.json(
      { error: `Failed to retrieve workout sessions: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}