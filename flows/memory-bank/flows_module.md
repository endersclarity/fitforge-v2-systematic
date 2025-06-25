# Module: Flow Analysis

## Purpose & Responsibility
Comprehensive UI pattern library derived from 49 Mobbin Fitbod flow screenshots with OCR analysis. Provides systematic reference for implementing consistent workout app UX patterns including exercise selection, equipment filtering, workout logging, and completion flows.

## Interfaces
* `FlowAnalysisSystem`: Automated flow documentation generation
  * `analyzeScreenshots`: OCR extraction from Mobbin flow images
  * `generateFlowDocumentation`: Create markdown analysis for each UI pattern
  * `categorizeFlowPatterns`: Organize flows by functional area
* `FlowReference`: UI pattern lookup and guidance
  * `getEquipmentFilteringPatterns`: Reference for implementing equipment selection UI
  * `getWorkoutLoggingFlows`: Patterns for set logging and workout progression
  * `getExerciseSelectionPatterns`: UI flows for exercise browsing and selection
* `PatternLibrary`: Design system integration
  * `extractUIComponents`: Identify reusable component patterns from flows
  * `mapToShadcnComponents`: Connect Fitbod patterns to shadcn/ui implementations
* Input: Mobbin screenshot archives, OCR processing requests, pattern queries
* Output: Structured flow documentation, UI pattern references, implementation guidance

## Implementation Details
* Files:
  * `flows/FLOW-REFERENCE.md` - Master index of all 49 analyzed flows
  * `flows/analyze-flows.py` - Python script for automated OCR and documentation
  * `flows/workout/` - Exercise selection and logging flow patterns
  * `flows/gym-profile-options/` - Equipment and preference management flows
  * `flows/settings/` - App configuration and user preference patterns
* Important algorithms:
  * OCR text extraction using pytesseract and easyocr for flow analysis
  * Pattern categorization based on UI function and user journey stage
  * Flow documentation generation with consistent markdown structure
* Data Models
  * `FlowPattern`: Category, screenshots, extracted text, UI elements, implementation notes
  * `UIComponent`: Component type, styling patterns, interaction behaviors
  * `UserJourney`: Flow sequence, decision points, error states, completion actions

## Current Implementation Status
* Completed: 49 Mobbin flows analyzed, master flow reference created, Python OCR system
* In Progress: Integration of flow patterns into current component development
* Pending: Advanced pattern matching for UI consistency validation

## Implementation Plans & Tasks
* `implementation_plan_equipment_filtering.md`
  * Reference equipment filtering flows for UI implementation
  * Apply Fitbod toggle patterns to exercise selection interface
* `implementation_plan_workout_templates.md`
  * Use routine selection patterns from gym-profile-options flows
  * Implement workout template UI based on Fitbod patterns

## Mini Dependency Tracker
---mini_tracker_start---
Dependencies: ~/.venvs/claude (Python OCR environment), flows/*.zip (Mobbin archives)
Dependents: components/fitbod-home.tsx, docs/features/, CURRENT-STATUS.md
---mini_tracker_end---