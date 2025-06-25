// Mock Supabase client for development
// This provides the interface needed by user-profile-service.ts without requiring actual Supabase

export const supabase = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
      single: () => Promise.resolve({ data: null, error: null })
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Mock Supabase - not implemented' } })
      })
    }),
    upsert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Mock Supabase - not implemented' } })
      })
    })
  })
}