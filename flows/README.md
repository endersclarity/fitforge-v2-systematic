# FitForge UI Flow Archive

Organized flow reference structure based on Mobbin's Fitbod flow analysis.

## Flow Categories

### Onboarding
- `creating-an-account/` - User registration and setup flows

### Workout (Primary Feature Area)
- `editing-main-muscle-groups/` - Muscle group selection interface
- `adding-an-exercise/` - Exercise selection and browsing
  - `all-exercises/` - Complete exercise library view
  - `exercise-info/` - Individual exercise details
  - `filtering-by-available-equipment/` - Equipment-based filtering
  - `exercises-by-target-muscle/` - Muscle group filtering  
  - `exercises-by-equipment/` - Equipment category browsing
- `routine-options/` - Workout template and routine management
  - `editing-warm-up-routine/` - Custom warm-up flows
  - `normalizing-weights-superset/` - Superset configuration
  - `deleting-an-exercise/` - Exercise removal flows
  - `replacing-an-exercise/` - Exercise substitution
  - `starting-workout/` - Workout initiation flows
    - `logging-a-set/` - **Core set tracking functionality**
    - `learn-more-about-reps/` - Educational content
    - `achievements/` - Progress celebration
    - `adding-a-note/` - Workout notes
    - `finishing-workout/` - Workout completion
    - `sharing-workout-summary/` - Social features
    - `subscribing-to-fitbod/` - Premium upsell

### Gym Profile Options
- `creating-new-saved-workout/` - Custom workout creation
- `sharing-workout-summary/` - Social sharing
- `building-a-superset/` - Advanced exercise grouping
- `editing-gym-profile-settings/` - Profile customization
- `view-upcoming-workouts/` - Workout planning

### Recovery
- `muscle-recovery/` - Recovery tracking
- `editing-muscle-recovery/` - Recovery customization

### Log
- `post-workout-detail/` - Workout history details
- `giving-free-fitbod-workouts/` - Sharing features
- `setting-weekly-workout-goal/` - Goal setting

### Settings
- `selecting-unit-of-measurement/` - Preferences
- `downloading-gifs-to-device/` - Media management

### About Fitbod
- `contacting-support/` - Support flows
- `success-stories/` - Social proof
- `terms-and-conditions/` - Legal
- `privacy-policy/` - Privacy

## Usage

Each folder can contain:
- Reference screenshots from Mobbin
- Implementation notes
- Component specifications  
- User story details
- Design patterns

## Key Implementation Priorities

1. **`workout/adding-an-exercise/filtering-by-available-equipment/`** - Equipment filtering
2. **`workout/routine-options/starting-workout/logging-a-set/`** - Core logging flow
3. **`workout/routine-options/`** - Workout templates
4. **`workout/editing-main-muscle-groups/`** - Dashboard improvement