# Issue #41: Profile page missing form inputs despite UI text

**GitHub Issue**: https://github.com/[repo]/issues/41
**Created**: 2025-06-30
**Status**: FEEDBACK_ADDRESSED_AWAITING_REVIEW

## Issue Analysis
### Problem Summary
Profile page shows "Loading profile..." forever because of schema mismatch between intake form and profile page. The issue title is misleading - forms exist, but data contract is broken.

### Root Cause Analysis  
- **Intake Form** saves localStorage with keys: `{goal, experience, frequency}`
- **Profile Page** expects localStorage with keys: `{primaryGoal, experienceLevel, weeklyWorkouts}`
- Schema mismatch prevents profile data from loading, causing infinite loading state

### Impact Assessment
- Users complete intake form but profile page never loads their data
- Breaks user experience flow from onboarding to dashboard
- Makes app appear broken after successful setup

## Review Feedback (Sandy Metz Review)
**Review Date**: 2025-06-30
**PR**: #45
**Decision**: REQUEST CHANGES

### Critical Issues
1. **Missing Core Requirement**: Issue #41 specifically requests form inputs for editing profile data - PR only fixes schema mismatch
2. **Unrelated Changes**: Console.log removals in filter-dropdown.tsx and exercise-browser/page.tsx should be removed

### Action Items from Review
- [x] Add actual form inputs to profile page for editing user data
- [x] Implement save/cancel buttons for profile updates
- [x] Add form validation (basic HTML5 validation)
- [x] Remove unrelated console.log changes
- [x] Update tests to cover new form functionality

## Task Breakdown
- [x] **Task 1**: Verify schema mismatch (COMPLETED)
- [ ] **Task 2**: Fix field mapping in intake form component  
- [ ] **Task 3**: Create data migration utility for existing localStorage data
- [ ] **Task 4**: Add validation to ensure data contract consistency
- [ ] **Task 5**: Test complete flow: intake → profile → dashboard

## Implementation Plan

### Step 1: Fix handleAnswer Field Mapping  
**Files to modify**: `components/bubbly-intake-flow.tsx:277`
**Approach**: Update handleAnswer calls to use correct field names
- Change `question.id` mapping to use proper profile field names
- `'goal'` → `'primaryGoal'`
- `'experience'` → `'experienceLevel'` 
- `'frequency'` → `'weeklyWorkouts'`

### Step 2: Create Data Migration Utility
**Files to modify**: `components/bubbly-intake-flow.tsx`, `app/profile/page.tsx`
**Approach**: Add migration function to handle existing localStorage data
- Check for old format data and convert to new format
- Preserve user data during schema transition
- Remove old format data after successful migration

### Step 3: Add Schema Validation
**Files to modify**: `lib/profile-schema.ts` (new file), profile page
**Approach**: Create shared schema validation to prevent future mismatches
- Define single source of truth for profile data structure
- Add runtime validation in both intake and profile components
- Log clear error messages when schema mismatches occur

## Testing Strategy

### Unit Tests
- [ ] Test intake form saves data in correct format
- [ ] Test profile page loads data correctly
- [ ] Test data migration handles edge cases

### Integration Tests  
- [ ] Test complete user flow: intake → save → profile load
- [ ] Test data migration from old to new format
- [ ] Test profile page with missing fields

### UI/E2E Tests
- [ ] Complete intake form and verify profile loads
- [ ] Test profile displays all user information correctly
- [ ] Verify Edit Profile button navigates to intake

### Interaction Verification (CLAUDE MUST COMPLETE)
- [ ] **MANDATORY**: Use curl to verify profile page loads after intake completion
- [ ] **MANDATORY**: Trace data flow from intake form save to profile load  
- [ ] **MANDATORY**: Use localStorage inspection to verify correct data format
- [ ] **MANDATORY**: Confirm profile displays actual user data, not loading spinner

## Research Notes

### Schema Mismatch Pattern (from FITFORGE-ESSENTIAL-PRINCIPLES.md)
This is exactly the pattern described: "components used different data contracts"
- Intake component sends field names: `goal, experience, frequency`
- Profile component expects field names: `primaryGoal, experienceLevel, weeklyWorkouts`
- No agreed-upon data contract between components

### Existing Services Analysis
- `lib/user-profile-service.ts` exists but uses Supabase backend (snake_case)
- Current implementation uses localStorage only (camelCase)
- Two different profile systems co-exist but don't integrate

### Field Mapping Requirements
Based on intake form questions and profile display:
- Name: `name` → `name` ✅ (correct)
- Age: `age` → `age` ✅ (correct)  
- Goal: `goal` → `primaryGoal` ❌ (needs fix)
- Experience: `experience` → `experienceLevel` ❌ (needs fix)
- Frequency: `frequency` → `weeklyWorkouts` ❌ (needs fix)
- Equipment: `availableEquipment` → `availableEquipment` ✅ (correct, handled specially)

## Completion Checklist
- [ ] Field mapping fixed in intake form
- [ ] Data migration utility implemented
- [ ] Schema validation added
- [ ] All tests passing
- [ ] User flow works end-to-end: intake → profile → edit
- [ ] Profile page loads user data instead of showing loading spinner
- [ ] Manual verification completed with actual browser testing

## Evidence-First Debugging Notes
Following FITFORGE-ESSENTIAL-PRINCIPLES.md requirements:
- ✅ **Root cause identified with concrete evidence**: localStorage field name mismatch
- ✅ **Fix design predicts specific outcome**: Correcting field names will allow profile page to load data
- ✅ **Instrumentation needed**: Add console logging to verify data save/load process
- ✅ **User assistance not required**: Issue can be reproduced and fixed without user interaction