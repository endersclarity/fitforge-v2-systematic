# Implementation Plan: Equipment Filtering for Exercise Selection

**Parent Module(s)**: [components_module.md], [data_module.md]
**Status**: [x] Planned / [ ] In Progress / [ ] Completed / [ ] Deferred

## 1. Objective / Goal
Implement equipment filtering functionality in exercise selection interface following Fitbod UI patterns. Users can toggle equipment availability (Bodyweight, Dumbbell, TRX, Pull-up Bar) to filter exercises, with "Your available equipment" toggle matching flows/workout/adding-an-exercise/filtering-by-available-equipment/ patterns.

## 2. Affected Components / Files
* **Code:**
  * `components/fitbod-home.tsx` - Add equipment filter toggles to muscle group selection
  * `data/exercises-real.json` - Exercise data already contains equipment field
  * `lib/data-service.ts` - Add equipment filtering logic
  * `components/exercise/ExerciseFilters.tsx` - Create reusable filter component
* **Documentation:**
  * `docs/features/equipment-filtering.md` - Feature specification and patterns
* **Data Structures / Schemas:**
  * Equipment enum: "Bodyweight", "Dumbbell", "TRX", "Pull-up_Bar", "Cable", "Barbell"

## 3. High-Level Approach / Design Decisions
* **Approach:** Extract equipment types from exercise database, create toggle interface matching Fitbod patterns, integrate filtering with existing exercise selection
* **Design Decisions:**
  * Use toggle component similar to "Your available equipment" from Fitbod flows
  * Implement as React state with localStorage persistence for user preferences
  * Filter exercises client-side for immediate response
* **Algorithms:**
  * Equipment extraction: `exercises.map(ex => ex.equipment).filter(unique)`
  * Filter logic: `exercises.filter(ex => availableEquipment.includes(ex.equipment))`
* **Data Flow:**
  * User toggles equipment → Update state → Filter exercise list → Re-render components

## 4. Task Decomposition (Roadmap Steps)
* [ ] [Extract Equipment Types](task_extract_equipment_types.md): Analyze exercise database and create equipment enum
* [ ] [Create Filter UI Component](task_create_filter_ui.md): Build toggle interface matching Fitbod patterns
* [ ] [Integrate Filter Logic](task_integrate_filter_logic.md): Connect filtering to exercise selection components
* [ ] [Add State Persistence](task_add_state_persistence.md): Save equipment preferences to localStorage

## 5. Task Sequence / Build Order
1. Extract Equipment Types - *Reason: Need to understand available equipment options*
2. Create Filter UI Component - *Reason: Build reusable filtering interface*
3. Integrate Filter Logic - *Reason: Connect filtering to exercise data*
4. Add State Persistence - *Reason: Enhance UX with saved preferences*

## 6. Prioritization within Sequence
* Extract Equipment Types: P1 (Critical Path)
* Create Filter UI Component: P1 (Critical Path)
* Integrate Filter Logic: P1 (Critical Path) 
* Add State Persistence: P2 (Enhancement)

## 7. Open Questions / Risks
* Should equipment filtering be global across all exercise selection or contextual to specific workout flows?
* How to handle exercises that can be performed with multiple equipment types?
* Integration strategy with existing muscle group filtering in fitbod-home.tsx