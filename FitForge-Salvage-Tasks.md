# FitForge Salvage Tasks for Codex

*Based on critical path analysis findings*

## Architecture Decision: localStorage PWA ✅

**DECISION MADE**: localStorage-first approach chosen
- **Rationale**: Fast development, perfect for portfolio demos, works offline
- **Benefits**: No backend needed, instant visitor demos, zero hosting costs
- **Current state**: Dashboard already uses localStorage correctly
- **Main work**: Convert WorkoutLogger to use localStorage

### Why This Architecture Wins:
1. **Portfolio demos**: Visitors can try immediately without signup
2. **Personal use**: Works offline at the gym
3. **Development speed**: 2-3 weeks vs 5+ weeks for full backend
4. **Hosting**: Free on Vercel, no database costs

---

## PRIMARY TASK SET: localStorage PWA Implementation ⭐

### Task A1: Simplify WorkoutLogger for localStorage
**File**: `components/WorkoutLogger.tsx`
**Complexity**: Medium
**Instructions**:
1. Remove dependency on `useWorkoutLogger` hook
2. Replace API calls with localStorage operations
3. Keep the clean UI and validation logic
4. Ensure data format matches Dashboard's localStorage structure
5. Reference `dashboard.tsx:68-73` for localStorage key names

### Task A2: Create Simple Exercise Organization
**Files**: Create new `components/workout-organizer.tsx`
**Complexity**: Medium
**Instructions**:
1. Implement Push/Pull/Legs day structure (missing from current implementation)
2. Use `data/exercises.json` as source
3. Create 6+6 exercise variation system as specified in MVP
4. Store selected variations in localStorage
5. Keep it simple - no AI, just filtering

### Task A3: Build Formula-Based Insights
**Files**: Create new `components/simple-insights.tsx`
**Complexity**: Low
**Instructions**:
1. Calculate volume (sets x reps x weight) from localStorage data
2. Show weekly progression percentages
3. Simple "increase weight by 2.5-5%" recommendations
4. NO AI imports - pure math only
5. Reference stored workout history for trends

---

## ~~Task Set B: API-Based Architecture~~ (NOT CHOSEN)

*These tasks are preserved for reference but should NOT be executed.*
*We are using localStorage approach - see PRIMARY TASK SET above.*

---

## Task Set C: Common Tasks (Either Architecture)

### Task C1: Remove All AI Components
**Files**: Delete multiple files
**Complexity**: Low
**Instructions**:
1. Delete entire `lib/ai/` directory
2. Remove these components:
   - `workout-frequency-optimizer.tsx`
   - `muscle-balance-analyzer.tsx`
   - `workout-history-analyzer.tsx`
   - `strength-progression-charts.tsx`
   - `anatomical-muscle-map.tsx`
   - `muscle-recovery-heatmap.tsx`
   - `fatigue-calculator.tsx`
3. Remove AI imports from any remaining components

### Task C2: Salvage and Simplify SetLogger
**File**: `components/workout/SetLogger.tsx`
**Complexity**: Low
**Instructions**:
1. This component is already clean - keep as is
2. Ensure it works with chosen storage approach
3. Remove RPE features if too complex
4. Focus on weight/reps/sets only

### Task C3: Clean Up UI Components
**Directory**: `components/ui/`
**Complexity**: Low
**Instructions**:
1. Keep all basic UI components (button, card, input, etc.)
2. Delete `muscle-engagement-chart.tsx` from ui directory
3. Ensure consistent theming
4. Remove any AI-related UI components

---

## Architecture Guidelines for All Tasks

### Allowed Patterns
- Simple React hooks (useState, useEffect)
- Direct localStorage OR API calls (not both)
- Type-safe interfaces from schemas
- Basic form validation

### Forbidden Patterns
- Any AI/ML imports or features
- Complex state management beyond component level
- Multiple ways to do the same thing
- Features beyond the 5 MVP items

### Import Restrictions
```typescript
// ❌ FORBIDDEN
import { WorkoutGenerator, FatigueAnalyzer } from '@/lib/ai'
import { MuscleRecoveryHeatmap } from '@/components/muscle-recovery-heatmap'

// ✅ ALLOWED
import { Exercise, WorkoutSet } from '@/schemas/typescript-interfaces'
import { BasicMuscleMap } from '@/components/basic-muscle-map'
```

---

## Success Criteria

1. **One Storage System**: Either localStorage OR API, not both
2. **5 MVP Features Only**: No scope creep
3. **Clean Imports**: Dashboard imports < 5 components
4. **No AI**: Zero AI/ML related code
5. **Simple Architecture**: Clear data flow, no circular dependencies

---

## Recommended Task Order

1. **First**: ✅ Architecture decided - localStorage PWA
2. **Second**: Execute Common Tasks (cleanup)
3. **Third**: Execute PRIMARY TASK SET (localStorage implementation)
4. **Finally**: Integration testing & PWA setup

Time Estimate: 2-3 weeks with focused execution

---

## Deployment & Demo Preparation

### Additional Tasks for Portfolio:

### Task D1: Add Demo Data Generator
**Files**: Create `lib/demo-data.ts`
**Complexity**: Low
**Instructions**:
1. Create button "Load Sample Workout Data"
2. Generate realistic workout history (30 days)
3. Show variety of exercises and progression
4. Help visitors see app capabilities immediately

### Task D2: PWA Configuration
**Files**: `public/manifest.json`, `next.config.js`
**Complexity**: Low
**Instructions**:
1. Create PWA manifest with FitForge branding
2. Add service worker for offline functionality
3. Configure "Add to Home Screen" prompts
4. Test on mobile devices

### Task D3: Vercel Deployment Setup
**Files**: `vercel.json`, remove Docker files
**Complexity**: Low
**Instructions**:
1. Remove all Docker-related files
2. Remove backend directory entirely
3. Configure Vercel deployment settings
4. Add environment variables for production