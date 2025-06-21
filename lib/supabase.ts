import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Server-side client with service role key for admin operations (server-only)
export const createSupabaseAdmin = () => {
  // Only create admin client on server-side
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin should only be used on the server side')
  }
  
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// Database Types (will be auto-generated later)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'A' | 'B'
          exercises: any[] // JSON array of exercises
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'A' | 'B'
          exercises: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'A' | 'B'
          exercises?: any[]
          updated_at?: string
        }
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string
          workout_id: string
          started_at: string
          completed_at: string | null
          duration_minutes: number | null
          exercises_completed: any[] // JSON array of completed exercises
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_id: string
          started_at: string
          completed_at?: string | null
          duration_minutes?: number | null
          exercises_completed?: any[]
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          completed_at?: string | null
          duration_minutes?: number | null
          exercises_completed?: any[]
          notes?: string | null
        }
      }
    }
  }
}