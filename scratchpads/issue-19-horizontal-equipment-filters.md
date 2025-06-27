# Issue #19: Add horizontal equipment filters to exercise list pages

**GitHub Issue**: https://github.com/endersclarity/fitforge-v2-systematic/issues/19
**Created**: 2025-06-27
**Status**: PLANNING

## Issue Analysis
### Problem Summary
The current filter implementation needs to be simplified to show only 4 main filter categories at the top level with cascading dropdown menus, improving usability and reducing visual clutter.

### Current State Analysis
1. **CleanFilterBar** (`components/clean-filter-bar.tsx`):
   - Already has Equipment and Target Muscle filters
   - Missing Group filter (Push/Pull/Legs/Abs)
   - Has disabled Muscle Fatigue filter
   - Uses FilterDropdown component for dropdowns

2. **FilterDropdown** (`components/filter-dropdown.tsx`):
   - Already implements dropdown functionality
   - Supports multiple selections
   - Has "Clear All" option
   - Uses portal for proper z-index handling

3. **Exercise List Page** (`app/exercises/[muscleGroup]/page.tsx`):
   - Already integrates CleanFilterBar
   - Has filtering logic for equipment and target muscle
   - Missing group filtering logic

### What Needs to Change
1. Add "Group" filter to CleanFilterBar
2. Update "Fatigue" filter to sort by muscle recovery (not just filter)
3. Simplify the UI to show only 4 main categories
4. Ensure cascading filtration works properly (AND between categories, OR within)
5. Add visual indicators for active filter counts

## Task Breakdown
- [x] Task 1: Update CleanFilterBar to include Group filter
- [x] Task 2: Modify Fatigue filter to be a sort option instead of multi-select
- [x] Task 3: Update FilterState interface to include group filter
- [x] Task 4: Implement group filtering logic in exercise list page
- [x] Task 5: Update filter button styling to show active counts
- [x] Task 6: Test cascading filtration logic
- [x] Task 7: Ensure responsive design works on mobile

## Implementation Plan
### Step 1: Update FilterState Interface
**Files to modify**: `components/clean-filter-bar.tsx`
**Approach**: Add 'group' to FilterState and change 'muscleFatigue' to 'fatigueSort'

### Step 2: Add Group Filter Options
**Files to modify**: `components/clean-filter-bar.tsx`
**Approach**: Define group options as ['Push', 'Pull', 'Legs', 'Abs']

### Step 3: Update Fatigue Filter to Sort Dropdown
**Files to modify**: `components/clean-filter-bar.tsx`, `components/filter-dropdown.tsx`
**Approach**: Create a new dropdown variant that allows single selection for sorting

### Step 4: Implement Group Filtering Logic
**Files to modify**: `app/exercises/[muscleGroup]/page.tsx`
**Approach**: Add logic to filter exercises by their movement group based on category mappings

### Step 5: Update UI for Active Filter Counts
**Files to modify**: `components/filter-dropdown.tsx`
**Approach**: Show count badges on filter buttons when selections are active

## Testing Strategy
### Manual Testing
- [x] Test each filter individually works correctly
- [x] Test multiple filters work together (cascading)
- [x] Test "Clear All" functionality
- [x] Test responsive design on mobile viewport
- [x] Test filter persistence when navigating between exercises

### Edge Cases
- [x] No exercises match all filters
- [x] All filters cleared shows all exercises
- [x] Filter state updates reflected in URL count

## Research Notes
- Current implementation already has most infrastructure in place
- FilterDropdown component is well-designed with portal usage
- Exercise data structure includes category field for group mapping
- Muscle fatigue sorting will need to be implemented in future when fatigue data is available

## Completion Checklist
- [x] All filters implemented and working
- [x] Cascading filtration logic tested
- [x] UI shows active filter counts
- [x] Responsive design verified
- [x] Code follows existing patterns
- [x] Ready for PR creation