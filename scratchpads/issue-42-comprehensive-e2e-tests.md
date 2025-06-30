# Issue #42: Create comprehensive E2E test suite

**GitHub Issue**: https://github.com/endersclarity/fitforge-v2-systematic/issues/42
**Created**: 2025-06-30
**Status**: PLANNING

## Issue Analysis
### Problem Summary
Container tests revealed 4 critical issues. Need to formalize into proper E2E test suite that runs in CI.

### Existing Test Scripts to Convert
1. `scripts/comprehensive-container-test.js` - Main test suite
2. `scripts/detailed-functionality-tests.js` - Deep functionality tests
3. `scripts/investigate-failures.js` - Failure investigation
4. `scripts/api-and-summary-tests.js` - API and summary tests

### Test Categories Required
1. **Data Integrity** - Exercise data validation
2. **Route Accessibility** - All routes return 200
3. **Filter Functionality** - Equipment/muscle/category filters work
4. **localStorage** - Templates and workout persistence
5. **Performance** - Page load times and filter response times

## Implementation Plan

### Phase 1: Analyze Existing Scripts
- [x] Review comprehensive-container-test.js to understand test coverage
- [x] Review detailed-functionality-tests.js for deep tests
- [x] Identify the 4 critical issues found
- [x] Map existing tests to new E2E structure

### Phase 2: Create Test Structure
- [x] Create tests/e2e/issue-42-data-integrity.spec.ts
- [x] Create tests/e2e/issue-42-route-accessibility.spec.ts
- [x] Create tests/e2e/issue-42-filter-functionality.spec.ts
- [x] Create tests/e2e/issue-42-local-storage.spec.ts
- [x] Create tests/e2e/issue-42-performance.spec.ts

### Phase 3: Implement Tests
- [x] Convert data integrity tests to Playwright
- [x] Convert route tests to Playwright
- [x] Convert filter tests to Playwright
- [x] Convert localStorage tests to Playwright
- [x] Implement performance tests with metrics

### Phase 4: CI Integration
- [x] Update package.json test:e2e script (already configured)
- [x] Create test configuration for CI (.github/workflows/comprehensive-e2e-tests.yml)
- [x] Add reporting for clear pass/fail (run-comprehensive-e2e-tests.js)
- [x] Ensure catches the 4 critical issues (tests specifically target them)

## Critical Issues to Catch
Based on container test findings:
1. **🚨 Exercise data has invalid muscle engagement totals** - 37/38 exercises have muscle percentages that sum > 100%
2. **🚨 Equipment filters not working** - Filter UI exists but doesn't actually filter exercises
3. **🚨 No forms on profile page** - Profile page missing form inputs (Issue #41 - now fixed)
4. **🚨 Backend service not responding** - Architectural confusion with disconnected backend

## Testing Strategy
- Use Playwright for all tests (consistent with existing E2E)
- Run against localhost:8080 (Docker container)
- Generate HTML reports for CI visibility
- Fail fast on critical issues