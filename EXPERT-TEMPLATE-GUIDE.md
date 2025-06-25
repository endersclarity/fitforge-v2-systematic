# Expert Template Addition Guide

## Overview
This guide explains how to add your proven workout templates to the template library with the same professional structure as the suggested templates.

## Template Structure

### Required Fields
Each template must include:

```json
{
  "templateId": {
    "id": "unique_template_id",
    "name": "Template Display Name",
    "description": "Brief description of the template's focus and benefits",
    "category": "expert",
    "workoutType": "push" | "pull" | "legs",
    "variant": "A" | "B",
    "exercises": [
      {
        "exerciseId": "exercise_id_from_exercises_real_json",
        "sets": 3,
        "reps": "8-12",
        "restSeconds": 120,
        "notes": "Optional notes about the exercise"
      }
    ],
    "targetMuscles": ["Primary", "Muscle", "Groups"],
    "estimatedDuration": 45,
    "difficulty": "Beginner" | "Intermediate" | "Advanced",
    "equipment": ["Required", "Equipment"],
    "tags": ["descriptive", "tags"],
    "progressiveOverloadNotes": "How to progress this template",
    "fatigueScore": 7.5,
    "createdAt": "2025-06-25T17:30:00.000Z",
    "updatedAt": "2025-06-25T17:30:00.000Z"
  }
}
```

### Exercise IDs Available
From `data/exercises-real.json`, you can use any of these exercise IDs:

**ChestTriceps Category:**
- bench_press, incline_bench_press, shoulder_press, pushup, trx_pushup
- dips, tricep_extension, single_arm_bench, single_arm_incline
- claps, pullover, kettlebell_halos, kettlebell_press, trx_reverse_flys

**BackBiceps Category:**
- wide_grip_pullups, chin_ups, neutral_grip_pullups, bent_over_rows
- t_row, renegade_rows, concentration_curl, trx_bicep_curl
- incline_hammer_curl, face_pull, shoulder_shrugs, single_arm_upright_row

**Legs Category:**
- goblet_squats, dead_lifts, stiff_legged_deadlifts, calf_raises
- glute_bridges, box_step_ups, kettlebell_swings

**Abs Category:**
- planks, hanging_knee_raises, spider_planks, bench_sit_ups

### Adding Your Templates

1. **Choose Template IDs**: Pick descriptive IDs like `expertPushA`, `expertPullB`, etc.

2. **Add to JSON**: Insert your templates in `data/workout-templates.json` alongside existing ones

3. **Update Categories**: Add your template IDs to the `expert.templates` array:
   ```json
   "expert": {
     "id": "expert",
     "name": "Expert Workouts", 
     "description": "Battle-tested workout templates with proven compound/isolation balance and A/B variation system",
     "templates": ["expertPushA", "expertPushB", "expertPullA", "expertPullB", "expertLegsA", "expertLegsB"]
   }
   ```

4. **Update Metadata**: Increment `totalTemplates` and update `categoryDistribution.expert`

### Example Expert Template

```json
"expertPushA": {
  "id": "expert_push_a",
  "name": "Expert Push A - Power & Size",
  "description": "Proven compound/isolation mix for chest, shoulders, and triceps with battle-tested progression",
  "category": "expert",
  "workoutType": "push", 
  "variant": "A",
  "exercises": [
    {
      "exerciseId": "bench_press",
      "sets": 4,
      "reps": "5-7",
      "restSeconds": 210,
      "notes": "Your proven rep range and rest period"
    },
    {
      "exerciseId": "shoulder_press", 
      "sets": 3,
      "reps": "8-10",
      "restSeconds": 180,
      "notes": "Your preferred shoulder work"
    }
    // ... add your other exercises
  ],
  "targetMuscles": ["Pectoralis_Major", "Anterior_Deltoids", "Triceps_Brachii"],
  "estimatedDuration": 50,
  "difficulty": "Intermediate",
  "equipment": ["Bench", "Dumbbell"],
  "tags": ["expert", "proven", "compound-isolation"],
  "progressiveOverloadNotes": "Your proven progression method",
  "fatigueScore": 8.0,
  "createdAt": "2025-06-25T17:30:00.000Z",
  "updatedAt": "2025-06-25T17:30:00.000Z"
}
```

### Validation
After adding templates, run validation to ensure they meet all requirements:
- All exercise IDs exist in the exercise database
- Rep ranges, sets, and rest periods are realistic
- Required fields are present
- TypeScript interfaces match

### User Experience
Your expert templates will appear in the template selector under "Expert Workouts" with the same professional presentation as suggested templates, giving users access to your proven workout methodology alongside exercise science-based suggestions.