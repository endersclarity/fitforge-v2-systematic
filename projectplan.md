# FitForge Workout Execution Fix

## Problem
When users build a workout on pull-day (or other workout pages) and click "Start Workout", they get redirected to the generic `workout-simple` page which ignores their selected exercises and starts fresh. All their exercise selections, sets, reps, and weights are lost.

## Solution
Create a dedicated workout execution page that preserves the user's pre-planned workout data.

## Implementation Plan

### Phase 1: Create Dedicated Workout Execution Page
- [ ] Create `/app/workout-execution/page.tsx` - dedicated page for executing pre-planned workouts
- [ ] Create `WorkoutExecutor` component that accepts pre-selected exercises with their planned sets
- [ ] Handle URL parameters or localStorage to pass workout data between pages
- [ ] Ensure the page ONLY shows the exercises the user selected (not the full database)

### Phase 2: Update Pull Day Integration
- [ ] Modify pull-day page's `startWorkout()` function to pass full workout data
- [ ] Test that pull-day → workout execution preserves all exercise selections and set planning
- [ ] Verify muscle fatigue data and volume calculations carry over

### Phase 3: Create Push Day and Legs Day Pages
- [ ] Create `/app/push-day/page.tsx` similar to pull-day
- [ ] Create `/app/legs-day/page.tsx` similar to pull-day
- [ ] Update push-pull-legs hub to route to dedicated pages instead of workout-simple

### Phase 4: Remove/Deprecate Simple Workout Logger
- [ ] Update navigation to avoid directing users to workout-simple
- [ ] Keep workout-simple as fallback for direct access but remove from main flow
- [ ] Update dashboard and navigation links

## Technical Approach

### Data Flow
```
Pull/Push/Legs Day Page → Select Exercises → Plan Sets/Reps/Weights → Click "Start Workout" → Workout Execution Page (with pre-selected exercises only)
```

### URL Parameters vs localStorage
- Use localStorage to pass complex workout data (exercises with sets, reps, weights)
- Use URL parameters for simple routing and page state

### Component Reuse
- Reuse existing WorkoutLogger logic but filter to only show pre-selected exercises
- Maintain all existing features: progressive overload, set tracking, muscle engagement

## Success Criteria
- [ ] User can build a workout on pull-day and start it without losing any data
- [ ] Workout execution page shows ONLY the exercises user selected
- [ ] All set planning (reps, weights, notes) is preserved
- [ ] Push day and legs day have same functionality as pull day
- [ ] No more accidental redirects to the generic simple workout logger

## Testing
- [ ] Build a pull workout → start workout → verify all exercises preserved
- [ ] Test with different exercise combinations and set configurations
- [ ] Verify localStorage data persistence between page transitions
- [ ] Test browser back/forward navigation doesn't break the flow