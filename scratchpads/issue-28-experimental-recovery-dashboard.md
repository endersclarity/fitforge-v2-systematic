# Issue #28: Experimental Recovery Dashboard

**GitHub Issue**: https://github.com/ender/fitforge-v2-systematic/issues/28
**Created**: 2025-06-29
**Status**: PLANNING

## Issue Analysis
### Problem Summary
Implement an experimental recovery dashboard that follows Fitbod's muscle recovery tracking patterns with visual feedback and fatigue management. Create a comprehensive recovery tracking experience at `/flows-experimental/recovery` that helps users understand muscle fatigue and optimize workout timing.

### Root Cause Analysis  
Current app needs a central place to understand recovery status and plan future workouts. Recovery tracking is fragmented and users don't have clear visibility into their muscle fatigue levels.

### Impact Assessment
- Users cannot see when muscles are ready to train again
- No visual feedback for recovery status
- Difficult to plan optimal workout timing
- Risk of overtraining without proper recovery insights

## 🔍 PHASE 0 - SCHEMA VERIFICATION

### Data Sources Identified
1. **Exercise Data**: `data/exercises-real.json`
2. **Fatigue Analyzer**: `lib/ai/fatigue-analyzer.ts`
3. **Muscle Visualization Components**: `components/visualization/MuscleHeatmap.tsx`
4. **Muscle Name Constants**: `lib/muscle-name-constants.ts`

### Data Contract Verification
```bash
# Verify exercise data structure
cat data/exercises-real.json | jq '.[0] | keys' | head -20
# Expected fields: name, muscleEngagement, targetMuscle, equipment, etc.

# Verify muscle name mapping
cat lib/muscle-name-constants.ts | grep -E "MUSCLE_DISPLAY_MAP|MUSCLE_NAMES"
# Maps scientific names to display names

# Check fatigue analyzer types
cat lib/ai/types.ts | grep -A 10 "interface.*Fatigue"
# Verify FatigueAnalysis, MuscleGroup interfaces
```

**VERIFICATION CHECKPOINT**: 
```
DATA CONTRACT VERIFICATION:
- Data source: data/exercises-real.json
- Field names: muscleEngagement (object with muscle:percentage)
  Example: {"Trapezius": 60, "Deltoids": 40, "Biceps_Brachii": 20}
- FatigueAnalysis interface: muscleGroups: Record<string, MuscleGroup>
- MuscleHeatmap expects: Record<string, number> for fatigue percentages
- Muscle names: Use underscored scientific names (e.g., "Biceps_Brachii")
- Match status: ✅ VERIFIED - All contracts align
```

## Task Breakdown
- [ ] Phase 0: Verify all data contracts and existing components
- [ ] Phase 1: Create recovery dashboard route at `/flows-experimental/recovery`
- [ ] Phase 2: Integrate existing FatigueAnalyzer with localStorage data
- [ ] Phase 3: Implement visual muscle map using existing MuscleHeatmap component
- [ ] Phase 4: Add recovery metrics display (percentages, time to recovery)
- [ ] Phase 5: Implement muscle group recommendations
- [ ] Phase 6: Add customization features (recovery rate adjustment)
- [ ] Phase 7: Create comprehensive E2E tests
- [ ] Phase 8: Visual polish and Fitbod theme alignment

## Implementation Plan
### Step 1: Create Recovery Dashboard Page Structure
**Files to create**: 
- `app/flows-experimental/recovery/page.tsx`
- `app/flows-experimental/recovery/layout.tsx` (if needed)

**Approach**: 
- Create basic page structure following Fitbod's dark theme
- Add to experimental flows navigation
- Verify route is accessible

### Step 2: Integrate Fatigue Analysis
**Files to modify**: 
- Use existing `lib/ai/fatigue-analyzer.ts`
- Connect to localStorage workout data

**Approach**:
- Initialize FatigueAnalyzer with user data
- Fetch fatigue analysis on page load
- Handle loading and error states

### Step 3: Implement Muscle Visualization
**Files to use**: 
- Leverage `components/visualization/MuscleHeatmap.tsx`
- Use `components/visualization/MuscleAnatomy.tsx`
- Apply `components/visualization/muscle-paths.ts`

**Approach**:
- Embed MuscleHeatmap component
- Map fatigue data to color values
- Enable front/back view toggle

### Step 4: Display Recovery Metrics
**Components to create**:
- Recovery percentage cards
- Time to full recovery display
- Recovery rate indicators

**Approach**:
- Show muscle-specific recovery percentages
- Calculate and display time until full recovery
- Use progress bars for visual feedback

### Step 5: Smart Recommendations
**Features to implement**:
- "Ready to train" muscle group list
- Suggested workout focus based on recovery
- Overtraining warnings
- Recovery optimization tips

### Step 6: Customization Features
**Interactions to add**:
- Adjust individual muscle recovery rates
- Account for external factors (sleep, nutrition toggles)
- Manual fatigue level adjustments
- Save preferences to localStorage

## Testing Strategy
### Unit Tests
- [ ] FatigueAnalyzer integration with localStorage
- [ ] Recovery percentage calculations
- [ ] Recommendation logic
- [ ] Data transformation functions

### Integration Tests  
- [ ] Page loads with muscle visualization
- [ ] Fatigue data updates correctly
- [ ] View toggle functionality
- [ ] Customization persistence

### E2E Tests (issue-28.spec.ts)
- [ ] Navigate to recovery dashboard
- [ ] Verify muscle map displays with colors
- [ ] Test front/back view toggle
- [ ] Click muscle for details
- [ ] Verify recovery metrics display
- [ ] Test customization features
- [ ] Verify recommendations update

### Interaction Verification
- [ ] Trace click flow from muscle selection to detail display
- [ ] Verify fatigue colors match actual data values
- [ ] Test recovery rate adjustment saves correctly
- [ ] Confirm recommendations match fatigue state

## Research Notes

### Existing Components Available:
1. **FatigueAnalyzer** (`lib/ai/fatigue-analyzer.ts`)
   - Comprehensive fatigue calculation based on volume, RPE, recency
   - Recovery rate constants for each muscle group
   - Generates recommendations and recovery times

2. **MuscleHeatmap** (`components/visualization/MuscleHeatmap.tsx`)  
   - Complete muscle visualization with heat map
   - Front/back views with SVG anatomy
   - Tooltip details on click
   - Export functionality

3. **Muscle Name Mapping** (`lib/muscle-name-constants.ts`)
   - Maps scientific names to display names
   - Ensures data contract consistency

### Fitbod Recovery Flow Analysis:
- Main recovery screen shows days since last workout
- Muscle list with recovery percentages
- Edit mode for adjusting recovery rates
- Clean dark theme with clear visual hierarchy

### Technical Considerations:
- Use localStorage for persistence (no backend currently)
- Leverage existing visualization components
- Follow established data contracts
- Maintain Fitbod's visual design patterns

## Completion Checklist
- [ ] All data contracts verified
- [ ] Recovery dashboard page created
- [ ] Fatigue analysis integrated
- [ ] Muscle visualization working
- [ ] Recovery metrics displayed
- [ ] Recommendations functional
- [ ] Customization features implemented
- [ ] All tests passing
- [ ] Visual design matches Fitbod patterns
- [ ] PR created and ready for review
- [ ] Issue can be closed