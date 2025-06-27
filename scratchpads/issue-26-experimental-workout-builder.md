# Issue #26: Experimental Workout Builder with Drag-and-Drop

**GitHub Issue**: https://github.com/endorpheus/fitforge-v2-systematic/issues/26
**Created**: 2025-06-27  
**Status**: PLANNING

## Issue Analysis
### Problem Summary
Create a drag-and-drop workout builder at `/flows-experimental/workout-builder` that follows Fitbod's proven UX patterns for creating and organizing workouts. Current app has workout building scattered across multiple pages without cohesive flow.

### Root Cause Analysis  
No centralized workout creation interface - users can't intuitively build custom workouts with proper exercise grouping (supersets, warm-ups, etc.) and drag-and-drop organization.

### Impact Assessment
Users cannot create custom workouts efficiently, limiting the app's core functionality for workout planning and organization.

## Data Contract Verification ✅
**Exercise Data**: `data/exercises-real.json`
- Fields: `id`, `name`, `category`, `equipment`, `difficulty`, `variation`, `muscleEngagement`

**Workout Template Structure**: `lib/workout-template-service.ts`
- `WorkoutTemplate` with `exercises: WorkoutTemplateExercise[]`
- `WorkoutTemplateExercise` with `exercise_id` (matches Exercise.id), `order_index`, `is_superset`, `superset_group`

**Validation**: `lib/workoutValidation.ts` - Zod schemas for workout sets and sessions

## Task Breakdown
- [ ] Task 1: Create `/app/flows-experimental/workout-builder/page.tsx` route
- [ ] Task 2: Implement drag-and-drop exercise addition from browser
- [ ] Task 3: Create exercise grouping system (Superset, Timed Intervals, Warm-up, Cool-down)
- [ ] Task 4: Build set/rep/weight configuration interface
- [ ] Task 5: Implement workout template saving functionality
- [ ] Task 6: Add drag-and-drop reordering within workout
- [ ] Task 7: Connect to existing exercise browser (Issue #20)
- [ ] Task 8: Mobile-friendly drag interactions

## Implementation Plan

### Step 1: Create Base Route and Layout
**Files to modify**: 
- `/app/flows-experimental/workout-builder/page.tsx` (new)

**Approach**: 
- Create Next.js app router page
- Basic layout matching Fitbod flow patterns
- Header with save/cancel actions
- Main area for workout builder

### Step 2: Exercise Addition Interface  
**Files to modify**:
- `components/workout-builder/ExerciseSelector.tsx` (new)
- `components/workout-builder/WorkoutCanvas.tsx` (new)

**Approach**:
- "Add an exercise" button triggering exercise browser modal
- Connect to existing exercise data from `data/exercises-real.json`
- Visual exercise cards showing sets/reps placeholders

### Step 3: Drag-and-Drop Implementation
**Files to modify**:
- `components/workout-builder/DraggableExercise.tsx` (new)
- `components/workout-builder/DropZone.tsx` (new)

**Approach**:
- Use react-beautiful-dnd or @dnd-kit for drag-and-drop
- Draggable exercise cards within workout
- Drop zones for reordering and grouping

### Step 4: Exercise Grouping System
**Files to modify**:
- `components/workout-builder/GroupingControls.tsx` (new)
- `components/workout-builder/SupersetGroup.tsx` (new)

**Approach**:
- "Group as..." dropdown: Superset, Timed Intervals, Warm-up, Cool-down
- Visual indicators for grouped exercises
- Superset grouping with visual connections (following Fitbod patterns)

### Step 5: Set/Rep Configuration
**Files to modify**:
- `components/workout-builder/ExerciseConfig.tsx` (new)
- `components/workout-builder/SetRepSelector.tsx` (new)

**Approach**:
- Inline editing for sets, reps, weight
- Quick increment/decrement controls
- Rest timer configuration per exercise

### Step 6: Workout Template Management
**Files to modify**:
- Extend existing `lib/workout-template-service.ts`
- `components/workout-builder/SaveWorkoutModal.tsx` (new)

**Approach**:
- Save workout as template using existing service
- Name custom workouts
- A/B workout variation support

## Technical Architecture

### State Management
```typescript
interface WorkoutBuilderState {
  exercises: WorkoutExercise[]
  groups: ExerciseGroup[]
  workoutMeta: {
    name: string
    type: 'A' | 'B' | 'C' | 'D'
    estimatedDuration: number
  }
}

interface WorkoutExercise {
  id: string
  exerciseId: string // References Exercise.id from data
  orderIndex: number
  sets: number
  reps: number
  weight?: number
  restTime: number
  groupId?: string
  notes?: string
}

interface ExerciseGroup {
  id: string
  type: 'superset' | 'timed-intervals' | 'warm-up' | 'cool-down'
  exerciseIds: string[]
  name?: string
}
```

### Data Flow
1. User clicks "Add an exercise" → Opens exercise selector
2. User selects exercise → Added to workout with default values
3. User configures sets/reps/weight → Updates exercise state
4. User drags to reorder → Updates orderIndex values
5. User groups exercises → Creates ExerciseGroup and updates exerciseIds
6. User saves workout → Converts to WorkoutTemplate format and saves

### UI Components Architecture
```
WorkoutBuilderPage
├── WorkoutBuilderHeader (save, cancel, name)
├── WorkoutCanvas
│   ├── EmptyState (when no exercises)
│   ├── ExerciseList
│   │   ├── DraggableExercise[]
│   │   │   ├── ExerciseCard
│   │   │   ├── SetRepControls
│   │   │   └── GroupingBadge
│   │   └── SupersetGroup[]
│   └── AddExerciseButton
├── ExerciseSelectorModal
└── SaveWorkoutModal
```

## Reference Flow Analysis

### Primary Flow: Adding an Exercise (6 screens)
- Screen 0: Workout view with "Add an exercise" button
- Screen 1-2: Exercise browser with filtering
- Screen 3: Multi-select with "Group as..." option
- Screen 4: Grouping options modal (Superset, Timed Intervals, Warm-up, Cool-down)
- Screen 5: Updated workout with grouped exercises

### Superset Creation (4 screens)
- Visual superset indicators with "4 ROUNDS" label
- Grouped exercises shown together
- Drag handle for reordering

### Key UX Patterns to Follow
1. **Visual Grouping**: Clear indicators for supersets, warm-ups, etc.
2. **Inline Editing**: Sets/reps/weight editing without modal
3. **Drag Handles**: Clear affordances for reordering
4. **Progressive Disclosure**: Simple interface that reveals complexity as needed

## Testing Strategy

### Unit Tests
- [ ] WorkoutBuilderState management functions
- [ ] Exercise grouping logic
- [ ] Data transformation (WorkoutExercise → WorkoutTemplate)
- [ ] Drag-and-drop ordering logic

### Integration Tests  
- [ ] Exercise selection from browser
- [ ] Workout template saving/loading
- [ ] State persistence during building

### E2E Tests (Playwright)
- [ ] Complete workout building flow
- [ ] Drag-and-drop exercise reordering
- [ ] Exercise grouping (create superset)
- [ ] Save and load workout template
- [ ] Mobile drag interactions

### Interaction Verification (CLAUDE MUST COMPLETE)
- [ ] Test drag-and-drop with actual DOM manipulation
- [ ] Verify exercise data loads correctly from JSON
- [ ] Confirm grouping creates proper data structures
- [ ] Validate saved workouts match expected schema
- [ ] Use curl/Playwright to verify UI state changes

## Success Criteria Checklist
- [ ] Drag-and-drop exercise addition works smoothly
- [ ] Exercise grouping (supersets, etc.) functions correctly  
- [ ] Set/rep configuration is intuitive
- [ ] Workout can be saved and named
- [ ] Mobile-friendly drag interactions
- [ ] Follows Fitbod visual patterns exactly
- [ ] Connects seamlessly to exercise browser
- [ ] Performance is smooth (<500ms interactions)

## Dependencies
- **Issue #20**: Exercise Browser (for exercise selection)
- **React Beautiful DND**: For drag-and-drop functionality
- **Existing workout-template-service.ts**: For saving templates

## Research Notes
- Fitbod uses visual superset grouping with round counts
- Exercise cards show sets × reps format consistently
- Grouping options: Superset, Timed Intervals, Warm-up, Cool-down
- Mobile-first design with touch-friendly drag handles
- Save/cancel actions in header for easy access

## Implementation Priority
1. **MVP**: Basic exercise addition and configuration
2. **Enhanced**: Drag-and-drop reordering  
3. **Advanced**: Exercise grouping and supersets
4. **Polish**: Mobile optimization and animations

## Notes
This solves the core problem of scattered workout creation by providing a unified, intuitive interface following proven Fitbod patterns. The drag-and-drop functionality will make workout building feel natural and efficient for users.