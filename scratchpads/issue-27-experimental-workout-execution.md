# Issue #27: Experimental Workout Execution with Advanced Set Logging

**GitHub Issue**: https://github.com/fitforge/fitforge-v2-systematic/issues/27
**Created**: 2025-06-27
**Status**: ADDRESS_FEEDBACK (Sandy Metz Review)

## 🔄 SANDY METZ REVIEW FEEDBACK (PR #35)

### ❌ CRITICAL ARCHITECTURAL VIOLATIONS
1. **MASSIVE COMPONENT (867 Lines)**: WorkoutExecutionExperimental violates "small, focused classes" principle
2. **COMPLEX STATE (15+ Variables)**: 15+ useState hooks violate Single Responsibility Principle  
3. **OVERSIZED PR (+2029 Lines)**: Too large for safe review and rollback

### 📋 REQUIRED REFACTORING TASKS

#### Phase 1: Break Down Component (PRIORITY 1)
- [x] Extract WorkoutHeader component (56 lines) ✅ COMPLETED
- [x] Extract SetLoggingForm component (153 lines) ✅ COMPLETED
- [ ] Extract WorkoutProgress component (<75 lines)  
- [ ] Extract ExerciseQueue component (<100 lines)
- [ ] Create container component (<100 lines)

**Progress**: 767 lines remaining (was 867) - 100 lines reduced (-12% reduction so far)

#### Phase 2: Extract State Management (PRIORITY 2)
- [ ] Create useWorkoutSession custom hook
- [ ] Create useSetLogging custom hook
- [ ] Create useWorkoutProgress custom hook
- [ ] Remove useState from main component

#### Phase 3: Separate Business Logic (PRIORITY 3)
- [ ] Extract workout flow logic to workoutService.ts
- [ ] Extract set management to setLoggingService.ts
- [ ] Extract exercise operations to exerciseService.ts

#### Phase 4: Split Into Focused PRs (FUTURE)
- [ ] PR 1: RPE rating feature only
- [ ] PR 2: Batch logging feature only
- [ ] PR 3: Exercise replacement only
- [ ] PR 4: Warm-up tracking only

### ✅ APPROVED ASPECTS TO MAINTAIN
- Excellent TypeScript interface design
- Good modal component separation
- Comprehensive test coverage
- Clear git workflow

## Issue Analysis

### Problem Summary
Create an experimental workout execution flow at `/flows-experimental/workout-execution` that implements Fitbod's comprehensive set logging patterns with advanced features not yet available in the existing `/app/workout-execution` implementation.

### Root Cause Analysis  
The current `WorkoutLoggerEnhanced` component provides basic set logging and rest timers, but lacks sophisticated features like exertion ratings (RPE), quick actions for consistent sets, exercise replacement, and real-time muscle fatigue visualization that make Fitbod's workout experience superior.

### Impact Assessment
- **Users**: Will get access to advanced workout execution patterns for better training quality
- **UX**: Matches Fitbod's proven 15-screen set logging flow
- **Architecture**: Tests experimental features without disrupting existing functionality

## Key Missing Features (vs Current Implementation)

### ✅ Already Implemented in WorkoutLoggerEnhanced
- Set-by-set logging with large rep/weight input
- "Add Set" button functionality  
- Rest timer auto-start after sets
- Progress indicators (exercise X/Y, sets completed)
- Visual countdown display with customizable rest periods
- Audio alerts for timer completion
- Workout timer and completion tracking

### ❌ Missing Features to Implement
1. **Exertion Rating (RPE)**: Post-set difficulty rating scale (1-10)
2. **Log All Sets**: Quick action for consistent sets across exercises  
3. **Replace Exercise**: Mid-workout exercise substitution
4. **Add Warm-up Sets**: Track warm-up vs working sets separately
5. **Exercise Notes**: Per-set or per-exercise notes capability
6. **Real-time Muscle Fatigue**: Visual heat map using `useRealTimeMuscleVolume` hook

## Task Breakdown

### Phase 2A: Create Base Implementation
- [ ] Create `/app/flows-experimental/workout-execution/page.tsx`
- [ ] Create `WorkoutExecutionExperimental` component
- [ ] Set up routing and basic structure
- [ ] Import and configure existing dependencies

### Phase 2B: Implement Missing Features
- [ ] **RPE System**: Add 1-10 exertion rating after each set
  - Post-set modal with "How difficult was 10 reps × 20 lbs?"
  - Visual rating scale with descriptions
  - Store RPE data in extended PerformedSet interface
  
- [ ] **Log All Sets**: Quick action implementation
  - "Log All Sets" button for current exercise
  - Pre-fill remaining sets with current weight/reps
  - Batch set creation with single RPE rating
  
- [ ] **Replace Exercise**: Mid-workout substitution
  - Exercise replacement modal during workout
  - Search and select alternative exercises
  - Maintain set progress for replacement
  
- [ ] **Warm-up Sets**: Dedicated warm-up tracking
  - Toggle for warm-up vs working sets
  - Visual distinction in set history
  - Separate tracking in workout summary
  
- [ ] **Exercise Notes**: Note-taking capability
  - Per-set notes with quick preset options
  - Per-exercise notes for form cues
  - Notes persistence in workout session
  
- [ ] **Real-time Muscle Fatigue**: Visual feedback
  - Integrate `useRealTimeMuscleVolume` hook
  - Display muscle heat map during workout
  - Update fatigue visualization after each set

### Phase 2C: Enhanced UX Patterns
- [ ] Follow Fitbod's 15-screen reference flow patterns
- [ ] Implement smooth transitions between exercises
- [ ] Add achievement-style notifications
- [ ] Optimize for single-handed usage patterns

## Implementation Plan

### Step 1: Base Structure Setup
**Files to create**:
- `/app/flows-experimental/workout-execution/page.tsx`
- `/components/workout-execution-experimental.tsx`
- `/components/rpe-rating-modal.tsx`
- `/components/exercise-replacement-modal.tsx`

**Approach**: 
- Start with existing `WorkoutLoggerEnhanced` as foundation
- Add experimental features incrementally
- Maintain compatibility with existing workout builder flow

### Step 2: RPE Integration
**Files to modify**:
- Extend `PerformedSet` interface to include `rpe: number`
- Create RPE rating component with visual scale
- Integrate into set completion flow

**Approach**:
- Modal appears after "Add Set" completion
- Visual 1-10 scale with descriptions ("Light", "Moderate", "Hard", etc.)
- Required field before proceeding to next set

### Step 3: Quick Actions Implementation  
**Files to modify**:
- Add "Log All Sets" button to exercise header
- Implement batch set creation logic
- Handle consistent vs varied set patterns

**Approach**:
- Detect if previous sets used same weight/reps
- Offer quick-fill for remaining planned sets
- Single RPE rating for all sets or individual rating option

### Step 4: Exercise Management
**Files to create**:
- Exercise replacement modal with search
- Warm-up set toggle component
- Notes input components

**Approach**:
- Load exercises from same category for replacement suggestions
- Visual toggle for warm-up identification
- Quick preset notes + custom text input

### Step 5: Real-time Muscle Visualization
**Files to modify**:
- Import and configure `useRealTimeMuscleVolume` hook
- Add muscle heat map component to workout view
- Update visualization after each completed set

**Approach**:
- Display compact muscle map in workout header
- Real-time color updates based on volume accumulation
- Optional detailed view for muscle-specific progress

## Testing Strategy

### Unit Tests
- [ ] RPE rating component renders correctly
- [ ] Batch set creation logic works
- [ ] Exercise replacement maintains workout state
- [ ] Warm-up set identification persists
- [ ] Notes are saved and retrieved correctly

### Integration Tests  
- [ ] Full workout flow with all new features
- [ ] Data persistence across exercise changes
- [ ] Real-time muscle volume updates correctly
- [ ] Compatibility with existing workout builder

### UI/E2E Tests
- [ ] Complete workout execution from start to finish
- [ ] RPE rating flow after each set
- [ ] Quick "Log All Sets" functionality
- [ ] Exercise replacement mid-workout
- [ ] Warm-up set workflow
- [ ] Note-taking during workout
- [ ] Real-time muscle fatigue visualization

### Interaction Verification (CLAUDE MUST COMPLETE)
- [ ] Test RPE modal appears after set completion
- [ ] Verify "Log All Sets" creates correct number of sets
- [ ] Confirm exercise replacement preserves workout state
- [ ] Validate warm-up sets display differently from working sets
- [ ] Test muscle visualization updates with real data
- [ ] Verify localStorage persistence of new data fields

## Technical Dependencies

### Existing Hooks and Components to Reuse
- `useRealTimeMuscleVolume` - For muscle fatigue visualization
- `RestTimer` component - Existing timer functionality
- `WorkoutLoggerEnhanced` - Base implementation patterns
- Data service interfaces - Extend `PerformedSet` for RPE

### New Dependencies Needed
- Exercise search/filter logic for replacement modal
- RPE rating scale component with descriptions
- Batch set creation utilities
- Enhanced localStorage schema for new fields

## Research Notes

### Fitbod Reference Patterns
- Issue mentions 15 screens in `/flows/workout/routine-options/starting-workout/logging-a-set/`
- Emphasizes "incredible attention to detail we should match"
- Focus on proven UX patterns for workout execution

### Data Contract Compatibility
- Existing `PerformedSet` interface can be extended with `rpe` field
- Exercise data structure supports replacement logic
- `useRealTimeMuscleVolume` hook already handles muscle engagement calculations
- localStorage patterns established for experimental features

### Architecture Alignment
- Follows `/flows-experimental/` pattern for testing new UX
- Maintains separation from production workout execution
- Allows A/B testing of advanced vs basic workout flows
- Prepares features for potential integration into main flow

## Completion Checklist
- [ ] All missing features implemented and tested
- [ ] RPE system fully functional with visual feedback
- [ ] Quick actions speed up consistent workouts
- [ ] Exercise replacement works seamlessly mid-workout
- [ ] Warm-up sets tracked separately from working sets
- [ ] Note-taking enhances workout documentation
- [ ] Real-time muscle fatigue provides immediate feedback
- [ ] UI matches Fitbod's attention to detail standards
- [ ] All tests passing with evidence documented
- [ ] PR created and ready for review

## Success Metrics
- ✅ **User Experience**: Smooth, single-handed workout execution
- ✅ **Feature Completeness**: All 6 missing features implemented  
- ✅ **Data Accuracy**: RPE, notes, and set data properly stored
- ✅ **Performance**: Real-time updates without lag
- ✅ **Compatibility**: Works with existing workout builder flow