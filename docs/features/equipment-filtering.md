# Equipment Filtering Feature

*Based on Fitbod flow analysis - flows/workout/adding-an-exercise/filtering-by-available-equipment/*

## Overview
Add equipment-based filtering to exercise selection, similar to Fitbod's "Filter by Your available equipment" feature.

## Current State
- Exercise selection shows all exercises for a muscle group
- No filtering options available
- User has to scroll through all 14+ exercises to find bodyweight/TRX/etc.

## Target Design
From Fitbod flow analysis:
- "Filter by Your available equipment" button
- Equipment categories: Bodyweight, TRX, Dumbbells, Kettlebell, Pull-up Bar, Plyo Box, Ab Straps
- "Sort by Alphabetically" and "Most Logged" options

## Implementation Plan
1. **Add filter state** to exercise selection component
2. **Create equipment filter UI** - horizontal scrolling chips or dropdown
3. **Filter exercise data** based on equipment field in exercises-real.json
4. **Update exercise cards** to show filtered results
5. **Add sort options** (alphabetical, most logged)

## Files to Modify
- `app/exercises/[muscleGroup]/page.tsx` - Add filtering logic
- `data/exercises-real.json` - Ensure equipment field is consistent
- `components/exercise-card.tsx` - Possibly add equipment badges

## Reference
- Fitbod Flow: `flows/workout/adding-an-exercise/filtering-by-available-equipment/flow-analysis.md`
- See screens showing filter interface and interaction patterns