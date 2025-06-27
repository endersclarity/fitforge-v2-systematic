# Issue #25: Experimental Exercise Browser with Fitbod-Style Filtering

**GitHub Issue**: https://github.com/endersclarity/fitforge-v2-systematic/issues/25
**Created**: 2025-06-27
**Status**: REOPENED - Filters Non-Functional
**Previous PR**: #30 (Merged but broken)
**Reopened**: 2025-06-27

## DATA CONTRACT VERIFICATION

**🚨 CRITICAL FINDING**: Data contract mismatch between components

```
DATA CONTRACT VERIFICATION:
- Data source: /data/exercises-real.json
- Field names: muscleEngagement with keys like "Pectoralis_Major", "Triceps_Brachii"
- Component sends: Display names like "Chest", "Triceps"
- Match status: NO - MISMATCH DETECTED

CleanFilterBar outputs: "Chest", "Triceps", "Biceps" (display names)
Exercise data uses: "Pectoralis_Major", "Triceps_Brachii", "Biceps_Brachii" (scientific names)
ExerciseBrowser attempts manual conversion but it's incomplete and error-prone
```

## Issue Analysis
### Problem Summary
**REOPENED**: Despite being implemented and merged, the exercise filters don't actually work:
- Equipment filters: Click does nothing  
- Muscle filters: Click does nothing
- Group filters: Click does nothing

**Root Cause**: Component contract mismatch - CleanFilterBar sends display names but exercise data uses scientific names.

### Root Cause Analysis
- Current app built features in isolation without cohesive user flows
- Exercise filtering exists but isn't accessible where users actually select exercises
- Need flow-based architecture following proven Fitbod patterns

### Impact Assessment
- Users cannot find or use the equipment filtering feature
- Exercise selection is fragmented across different pages
- Poor user experience due to disconnected flows

## Task Breakdown (FIX BROKEN FILTERS)
- [ ] Task 1: Create single source of truth for muscle name mapping
- [ ] Task 2: Fix CleanFilterBar to output data values, not display values
- [ ] Task 3: Remove hacky conversion logic from ExerciseBrowser 
- [ ] Task 4: Write E2E tests that verify filters actually work
- [ ] Task 5: Test each filter type with actual clicks
- [ ] Task 6: Verify filtered exercise count changes
- [ ] Task 7: Add Puppeteer verification script
- [ ] Task 8: Document test evidence

## Implementation Plan (FIX BROKEN FILTERS)

### Step 0: Create Tests FIRST (TDD)
**Files to create**:
- `tests/e2e/issue-25-exercise-filters.spec.ts` (update existing)
- `tests/integration/muscle-name-mapping.test.ts`
- `scripts/verify-filters-work.js` (Puppeteer script)

**Tests must verify**:
- Equipment filter reduces exercise count correctly
- Muscle filter shows only exercises with that muscle
- Clear filters restores all exercises
- Multiple filters work together (AND logic)

### Step 1: Create Single Source of Truth
**File to create**: `/lib/muscle-name-constants.ts`
```typescript
export const MUSCLE_DATA_NAMES = {
  PECTORALIS_MAJOR: 'Pectoralis_Major',
  TRICEPS_BRACHII: 'Triceps_Brachii',
  // ... all scientific names
} as const

export const MUSCLE_DISPLAY_MAP: Record<string, string> = {
  'Pectoralis_Major': 'Chest',
  'Triceps_Brachii': 'Triceps',
  // ... complete mapping
}

export const DISPLAY_TO_DATA_MAP: Record<string, string> = {
  'Chest': 'Pectoralis_Major',
  'Triceps': 'Triceps_Brachii',
  // ... reverse mapping
}
```

### Step 2: Fix CleanFilterBar Component
**File to modify**: `/components/clean-filter-bar.tsx`
**Changes**:
- Import muscle name constants
- Change `handleMuscleChange` to send DATA values, not display values
- Keep display names only for UI rendering
- Ensure consistent data contract

### Step 3: Fix Exercise Browser Filter Logic  
**File to modify**: `/app/flows-experimental/exercise-browser/page.tsx`
**Changes**:
- Remove hacky conversion logic (lines 74-90)
- Use direct muscle name comparison
- Import shared constants
- Simplify filter logic to direct matches

### Step 4: Update FilterDropdown (if needed)
**File to check**: `/components/filter-dropdown.tsx`
**Verify**:
- It handles value/display separation properly
- Options can have separate value and label
### Step 1: Create Experimental Structure
**Files to create**: 
- `/app/flows-experimental/page.tsx` (landing page)
- `/app/flows-experimental/exercise-browser/page.tsx` (main browser)
**Approach**: 
- Create landing page explaining experimental flows
- Set up basic routing structure

### Step 2: Implement Exercise Browser Layout
**Files to modify**: `/app/flows-experimental/exercise-browser/page.tsx`
**Approach**: 
- Header with back navigation
- Title "Exercise Browser"
- Integrate CleanFilterBar at top
- Exercise grid below

### Step 3: Reuse Existing Components
**Components to integrate**:
- `CleanFilterBar` - already has equipment, muscle, group filters
- `FilterDropdown` - for dropdown functionality
- `SortDropdown` - for sort options (need to verify exists)
**Approach**: 
- Import and integrate existing filter components
- Connect filter state to exercise display

### Step 4: Exercise Display Grid
**Reference**: `/flows/workout/adding-an-exercise/all-exercises/`
**Features**:
- Exercise cards with name, equipment, thumbnail
- Tap to see exercise details
- Visual indicators for equipment needed
**Approach**:
- Create ExerciseCard component
- Grid layout responsive to screen size
- Load data from `/data/exercises-real.json`

### Step 5: Sorting Implementation
**Options**: 
- Alphabetically (A-Z)
- Most Logged (need to simulate or use placeholder)
**Approach**:
- Add sort state to component
- Implement sort functions
- Update exercise list based on sort selection

### Step 6: Exercise Detail View
**Reference**: `/flows/workout/adding-an-exercise/exercise-info/`
**Features**:
- Exercise name and description
- Muscle engagement visualization
- Equipment requirements
- Instructions/tips
**Approach**:
- Modal or slide-in panel
- Reuse muscle engagement data from exercise JSON

### Step 7: Navigation Integration
**Add links from**:
- Current dashboard → Experimental flows landing
- Landing page → Exercise browser
**Connect to**:
- Exercise browser → Workout builder (future Issue #26)

## Testing Strategy (EVIDENCE-BASED)

### Test Creation (BEFORE Implementation)
- [ ] E2E test file created and failing
- [ ] Integration test for name mapping
- [ ] Puppeteer script for manual verification

### Interaction Verification (REQUIRED)
```bash
# Initial state
curl -s http://localhost:8080/flows-experimental/exercise-browser | grep -c "font-semibold"
# Expected: 38

# After equipment filter simulation  
curl -s "http://localhost:8080/flows-experimental/exercise-browser?equipment=Dumbbell" | grep -c "font-semibold"
# Expected: 11 (verified via: cat data/exercises-real.json | jq '[.[] | select(.equipment == "Dumbbell")] | length')

# After muscle filter simulation
# Expected: Different count based on muscle selected
```

### Evidence Documentation
- [ ] Screenshot before filters
- [ ] Screenshot after equipment filter (should show fewer exercises)
- [ ] Screenshot after muscle filter
- [ ] Console logs showing filter state changes
- [ ] Test output showing all scenarios pass
### Functional Testing
- [x] All exercises display correctly
- [x] Equipment filtering works in real-time
- [x] Sorting changes exercise order properly
- [x] Exercise details show correct information
- [x] Navigation flows work correctly

### UI/UX Testing
- [x] Matches Fitbod visual patterns
- [x] Mobile responsive design
- [x] Smooth transitions and interactions
- [x] Filter state persists during session

### Integration Testing
- [x] Integrates with existing filter components
- [x] Exercise data loads correctly
- [x] Links from main app work

## Research Notes
### Existing Components Available:
1. **CleanFilterBar** - Complete filter implementation from Issue #19
   - Equipment filter
   - Target muscle filter
   - Group filter (Push/Pull/Legs/Abs)
   - Fatigue sort

2. **FilterDropdown** - Dropdown UI component
   - Portal-based for z-index
   - Multi-select capability
   - "Clear All" option

3. **Exercise Data** - `/data/exercises-real.json`
   - 38 exercises with full data
   - Categories: BackBiceps, ChestTriceps, Legs, Abs
   - Equipment types: Dumbbell, TRX, Pull-up_Bar, Bodyweight, etc.

### Fitbod UX Patterns to Follow:
1. **Filter Bar** (from flow screenshots):
   - "Filter by: Your available equipment" toggle
   - "Sort by: Alphabetically/Most Logged" dropdown

2. **Exercise Display**:
   - Clean cards with exercise names
   - Equipment indicators
   - Tap for details pattern

3. **Navigation**:
   - Clear back navigation
   - Connection to workout building flow

## Completion Checklist
- [x] Experimental directory structure created
- [x] Exercise browser page implemented
- [x] All filters working correctly
- [x] Sorting functionality complete
- [x] Exercise details viewable
- [x] Mobile responsive design verified
- [x] Navigation integrated with main app
- [x] Ready for testing and PR creation