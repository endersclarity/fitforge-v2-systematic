# Workout Templates Feature

*Replace muscle group dashboard with pre-built workout routines*

## Overview  
Instead of "Push", "Pull", "Legs" muscle group cards, show workout template cards like "Push Day A", "Chest & Triceps", "Full Body Bodyweight", etc.

## Current State
- Dashboard shows 6 muscle group cards
- Leads directly to exercise selection by muscle group
- No pre-built workout structure

## Target Design
From your requirements and Fitbod flows:
- Workout template cards showing routine name and estimated duration
- Template preview showing included exercises with sets/reps
- Ability to start workout directly or customize template
- Templates like: "Push Day A/B", "Pull Day A/B", "Legs Day", "Chest & Triceps", etc.

## Implementation Plan
1. **Create workout template data structure** in JSON
2. **Replace dashboard muscle cards** with template cards  
3. **Add template preview** showing exercises and sets/reps
4. **Create template selection flow** - preview → customize → start
5. **Build template customization** - add/remove exercises, adjust sets/reps

## Data Structure
```json
{
  "templates": [
    {
      "id": "push-day-a",
      "name": "Push Day A", 
      "duration": "45-60 min",
      "exercises": [
        {"exercise": "Push Up", "sets": 3, "reps": 10, "weight": "bodyweight"},
        {"exercise": "Dumbbell Bench Press", "sets": 4, "reps": 8, "weight": 135}
      ]
    }
  ]
}
```

## Files to Create/Modify
- `data/workout-templates.json` - Template definitions
- `components/fitbod-home.tsx` - Replace muscle cards with template cards
- `app/templates/[templateId]/page.tsx` - Template preview and customization
- `components/template-card.tsx` - Template display component

## Reference
- Fitbod Flow: `flows/workout/routine-options/flow-analysis.md`
- Starting Workout: `flows/workout/routine-options/starting-workout/flow-analysis.md`