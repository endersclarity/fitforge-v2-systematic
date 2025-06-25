# Set Logging Improvements

*Enhanced workout execution based on Fitbod's 15-screen logging flow*

## Overview
Improve the set logging experience with automatic timers, progress indicators, and better UX based on Fitbod's comprehensive logging interface.

## Current State
- Basic set logging in WorkoutLoggerEnhanced
- Manual set completion
- No rest timers or progress tracking
- Basic localStorage saving

## Target Features
From Fitbod flow analysis (15 screens documented):
- **Automatic rest timers** that start after logging each set
- **Progress indicators** showing "3/3 logged" completion status
- **"Log All Sets" option** for quick completion
- **Set modification** - adjust reps/weight on the fly
- **Visual feedback** - green checkmarks, completion celebrations
- **Bodyweight integration** - pull user weight from profile for bodyweight exercises

## Key UI Patterns from Fitbod
- Timer display: "0:30 REST" countdown
- Log button: Large "LOG SET" button
- Progress: "3 SETS ✓ ON" with checkmarks
- Quick options: "Add Set", "Replace", "Delete from Workout"
- Completion: "3/3 logged" status with green indicators

## Implementation Plan
1. **Add rest timer component** - countdown after each set
2. **Enhance progress tracking** - visual set completion indicators  
3. **Implement "Log All Sets"** - bulk completion option
4. **Add set modification** - inline editing of reps/weight
5. **Integrate bodyweight** - pull from user profile for bodyweight exercises
6. **Improve completion flow** - celebrations and auto-progression

## Files to Modify
- `components/workout-logger-enhanced.tsx` - Main logging interface
- `hooks/useWorkoutTimer.ts` - Rest timer logic
- `components/set-logger.tsx` - Individual set logging component
- `data/user-profile.json` - User bodyweight storage

## Reference
- Primary: `flows/workout/routine-options/starting-workout/logging-a-set/flow-analysis.md` (15 screens)
- Supporting: `flows/workout/routine-options/starting-workout/flow-analysis.md`

## Notes
This is the most detailed flow in our analysis - Fitbod clearly invested heavily in perfecting the logging experience. The 15-screen flow shows comprehensive interaction patterns we can learn from.