# CODEX TASK 013: Convert WorkoutLogger to localStorage

## Mission Brief
The WorkoutLogger component currently uses a complex API client and backend integration. Your mission is to simplify it to use localStorage (browser storage) to match how the Dashboard already works. This will create a cohesive, working application.

## Background
- **Current Issue**: WorkoutLogger expects a backend API that doesn't exist in production
- **Dashboard Approach**: Already uses localStorage successfully
- **Goal**: Make WorkoutLogger work the same way for consistency

## Task Objectives

### 1. Analyze Current Implementation
First, understand the current WorkoutLogger:
- Review `components/WorkoutLogger.tsx`
- Check `hooks/useWorkoutLogger.ts` 
- Note how it expects to save data via API

### 2. Study Dashboard's localStorage Pattern
Learn from the working Dashboard:
- See `components/dashboard.tsx` lines 68-73
- Note localStorage keys: `"userProfile"` and `"workoutSessions"`
- Understand the data structure being saved

### 3. Convert WorkoutLogger to localStorage

#### Remove Dependencies:
```typescript
// REMOVE these imports:
import { useWorkoutLogger } from '../hooks/useWorkoutLogger'
import { api } from '@/lib/api-client'

// KEEP these imports:
import { workoutSetSchema, WorkoutSetFormData } from '../lib/workoutValidation'
```

#### Implement localStorage Operations:
```typescript
// Save workout session
const saveWorkoutSession = (session: WorkoutSession) => {
  const sessions = JSON.parse(localStorage.getItem('workoutSessions') || '[]')
  sessions.push(session)
  localStorage.setItem('workoutSessions', JSON.stringify(sessions))
}

// Get current session (if any)
const getCurrentSession = () => {
  // Implementation here
}
```

#### Match Dashboard's Data Structure:
The Dashboard expects this structure:
```typescript
interface WorkoutSession {
  id: string
  name: string  
  date: string
  duration: number
  exercises: any[] // Array of exercise objects
  totalSets: number
}
```

### 4. Preserve Good Features
Keep these working features from current WorkoutLogger:
- Form validation using Zod schemas
- Clean UI with proper feedback
- Weight/reps increment buttons
- Exercise selection dropdown

### 5. Simplify Complex Features
Remove or simplify:
- Optimistic updates (not needed with localStorage)
- Offline mode detection (always "offline" now)
- Complex error recovery
- API retry logic

## Technical Constraints
- Must use same localStorage keys as Dashboard
- Keep TypeScript types for safety
- Preserve the clean UI design
- Make sure data persists on page refresh

## Testing Your Changes
1. Start the app with `npm run dev:next`
2. Log a workout using WorkoutLogger
3. Navigate to Dashboard
4. Verify your workout appears in "Recent Workouts"
5. Refresh page - data should persist

## Deliverables
1. Modified `components/WorkoutLogger.tsx` using localStorage
2. Remove/simplify `hooks/useWorkoutLogger.ts` or inline its logic
3. Brief summary of changes made
4. Confirmation that Dashboard displays logged workouts

## Success Criteria
- WorkoutLogger saves to localStorage (not API)
- Dashboard can read and display the saved workouts
- No console errors about missing API endpoints
- Clean, simplified code without backend dependencies
- Data persists between page refreshes

## Important Notes
- Don't over-engineer - localStorage is much simpler than API calls
- Use `JSON.parse()` and `JSON.stringify()` for data serialization
- Generate simple IDs with `Date.now().toString()` or similar
- Focus on making it work first, optimize later

Good luck! This conversion will unify the application's architecture and make it actually work end-to-end.