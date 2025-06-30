# Issue #34: Workout Template Management: Save, View, Load, and Execute Saved Workouts

**GitHub Issue**: https://github.com/endorpheus/fitforge-v2-systematic/issues/34
**Created**: 2025-06-30
**Status**: PLANNING

## Issue Analysis
### Problem Summary
Implement complete workout template management system to allow users to save, view, load, and execute workout templates created in the Workout Builder (#26). Currently, the workout builder can create workouts but cannot persist them.

### Root Cause Analysis  
The workout builder exists without persistence layer - users lose their carefully crafted workouts after leaving the page. No way to manage, organize, or reuse workout templates.

### Impact Assessment
Users cannot maintain consistent training routines, track which workouts work best, or build a library of effective templates. This severely limits the app's value for serious fitness enthusiasts.

## DATA CONTRACT VERIFICATION ✅

### Verified Data Structures:
1. **Backend WorkoutTemplate** (`lib/workout-template-service.ts`):
   - Uses Supabase integration (currently not active, will use localStorage)
   - Fields: id, name, workout_type ('A'|'B'|'C'|'D'), category, exercises array
   - Exercise fields: exercise_id, target_sets, target_reps_min/max, rest_time_seconds

2. **SaveWorkoutModal Output** (`workout-builder/components/SaveWorkoutModal.tsx`):
   - Outputs: name, type, category, exercises array
   - Maps to backend with type→workout_type transformation

3. **JSON Templates** (`data/workout-templates.json`):
   - Pre-made templates with exerciseId, sets, reps, restSeconds
   - Needs transformation to match backend schema

### Data Contract Mappings:
```
UI Component → Backend Service
- name → name ✓
- type → workout_type ✓
- category → category ✓
- exercises.exerciseId → exercises.exercise_id ✓
- exercises.targetSets → exercises.target_sets ✓
- exercises.restTimeSeconds → exercises.rest_time_seconds ✓
```

## Task Breakdown

### Phase 1: Template Management UI
- [x] Verify data contracts (completed above)
- [ ] Create `/flows-experimental/saved-workouts/page.tsx` 
- [ ] Implement WorkoutTemplateCard component
- [ ] Create localStorage adapter for WorkoutTemplateService
- [ ] Implement CRUD operations (Create, Read, Update, Delete)
- [ ] Add template filtering and search

### Phase 2: Integration with Workout Builder
- [ ] Add save functionality to workout builder
- [ ] Implement "Load Template" flow
- [ ] Add template duplication feature
- [ ] Connect SaveWorkoutModal to persistence layer

### Phase 3: Template Execution
- [ ] Create "Start Workout" flow from template
- [ ] Pass template data to workout-execution page
- [ ] Track template usage statistics
- [ ] Update last_used_at timestamp

### Phase 4: UI Polish & Testing
- [ ] Follow Fitbod flow patterns from screenshots
- [ ] Implement mobile-responsive design
- [ ] Add loading states and error handling
- [ ] Write comprehensive E2E tests

## Implementation Plan

### Step 1: Create Saved Workouts Page
**Files to create**: 
- `app/flows-experimental/saved-workouts/page.tsx`
- `app/flows-experimental/saved-workouts/layout.tsx`
- `components/workout-template-card.tsx`

**Approach**: 
- Use grid layout similar to exercise browser
- Display template cards with workout info
- Quick actions: Edit, Duplicate, Delete, Start

### Step 2: LocalStorage Adapter
**Files to modify**: 
- Create `lib/workout-template-localStorage.ts`

**Approach**:
- Implement WorkoutTemplateService interface using localStorage
- Store templates under 'fitforge_workout_templates' key
- Handle JSON serialization/deserialization
- Generate unique IDs for templates

### Step 3: Connect Workout Builder
**Files to modify**: 
- `app/flows-experimental/workout-builder/page.tsx`
- `components/SaveWorkoutModal.tsx`

**Approach**:
- Wire handleWorkoutSaved to localStorage adapter
- Add "Load Template" button to workout builder
- Implement template loading flow

### Step 4: Template Execution Integration
**Files to modify**:
- `app/flows-experimental/workout-execution/page.tsx`

**Approach**:
- Accept template data via route params or state
- Pre-populate workout with template exercises
- Track which template is being executed

## Testing Strategy

### Unit Tests
- [ ] LocalStorage adapter CRUD operations
- [ ] Template data transformations
- [ ] Filter and search functionality

### Integration Tests  
- [ ] Save template from workout builder
- [ ] Load template back into builder
- [ ] Start workout from template

### E2E Tests (Playwright)
- [ ] Complete flow: Build → Save → View → Load → Execute
- [ ] Template management operations (edit, duplicate, delete)
- [ ] Search and filter templates
- [ ] Mobile responsiveness

### Interaction Verification
- [ ] Verify template count changes after save
- [ ] Confirm template data persists across page refreshes
- [ ] Test loading templates with different exercise counts
- [ ] Validate template execution pre-populates correctly

## Research Notes

### Fitbod Flow References:
- **Creating new saved workout**: `flows/gym-profile-options/creating-new-saved-workout/`
  - Shows save modal with name input
  - Categories and workout type selection
  - Summary of exercises and duration

- **Saved workouts view**: Need to reference Fitbod patterns for:
  - Template card design
  - Quick action buttons
  - Filter/sort options

### Related Issues:
- #26: Workout Builder (COMPLETED) - Provides the creation interface
- #27: Workout Execution (COMPLETED) - Target for "Start Workout" action
- #25: Exercise Browser (COMPLETED) - Reference for grid layout patterns

### Technical Decisions:
1. **Use localStorage initially** - Simpler than full Supabase integration
2. **Reuse existing components** - WorkoutExercise, ExerciseSelectorModal
3. **Follow established patterns** - Grid layouts, Fitbod design tokens
4. **Progressive enhancement** - Basic CRUD first, then advanced features

## Edge Cases to Handle
- Maximum localStorage storage (5MB limit)
- Template name conflicts
- Invalid template data on load
- Exercises that no longer exist in database
- Very long workout templates (50+ exercises)

## Success Metrics
- Users can save templates without data loss
- Templates persist across browser sessions
- Loading a template fully restores workout configuration
- Template library is searchable and filterable
- Seamless integration with existing workout flows

## Completion Checklist
- [ ] All Phase 1 tasks completed
- [ ] All Phase 2 tasks completed
- [ ] All Phase 3 tasks completed
- [ ] All Phase 4 tasks completed
- [ ] All tests passing
- [ ] PR created and ready for review
- [ ] Issue can be closed