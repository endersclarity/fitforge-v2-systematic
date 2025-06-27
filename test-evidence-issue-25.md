# Issue #25: Exercise Filter Test Evidence

## Test Results Summary

### 🔍 Current Status
- **Equipment Filter**: WORKS in Puppeteer (11 exercises), FAILS in Playwright (38 exercises)
- **Muscle Filter**: NOT WORKING (stays at 38 exercises)
- **URL Parameters**: NOT WORKING
- **Clear All**: Cannot test (filters not applying)

### 📊 Expected vs Actual
| Filter Type | Expected | Actual | Status |
|------------|----------|---------|---------|
| No filter | 38 exercises | 38 ✓ | PASS |
| Equipment: Dumbbell | 11 exercises | 38 ✗ | FAIL (Playwright) / PASS (Puppeteer) |
| Muscle: Chest | 9 exercises | 38 ✗ | FAIL |
| Clear All | 38 exercises | N/A | BLOCKED |

### 🐛 Root Cause Analysis

1. **Data Contract Issue**: Fixed - CleanFilterBar now sends data names
2. **Filter State Issue**: Filter state appears to update but exercises don't re-render
3. **Modal Interference**: Exercise detail modal blocks muscle filter dropdown clicks
4. **Inconsistent Test Results**: Works in Puppeteer but not Playwright

### 📝 Debug Findings

From console logs:
- `Muscle display names:` array is populated correctly
- `Filter state changed:` logs show state updates
- But filtered exercise count remains 38

### 🔧 What Was Fixed
1. Created `muscle-name-constants.ts` with proper mappings
2. Updated CleanFilterBar to send data names not display names
3. Simplified exercise browser filter logic
4. Added comprehensive logging

### ❌ What's Still Broken
1. Filter state changes don't trigger re-render
2. Muscle dropdown might not be populating correctly
3. URL parameter filtering not implemented
4. Modal z-index issues blocking interactions

### 🎯 Next Steps
1. Debug why useMemo isn't recalculating on filter state change
2. Fix modal z-index issues
3. Implement URL parameter support
4. Ensure consistent behavior across test frameworks