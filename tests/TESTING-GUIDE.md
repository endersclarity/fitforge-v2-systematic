# FitForge Testing Guide

## 🚨 MANDATORY: Test Before You Claim It Works

**If you didn't test it, it doesn't work. Period.**

## Test Types Required for Every Feature

### 1. E2E Tests (Playwright) - User Perspective
Tests that simulate actual user interactions:
```typescript
// tests/e2e/issue-XX-feature-name.spec.ts
test('user can click filter and see results change', async ({ page }) => {
  await page.goto('/feature-url');
  const initialCount = await page.locator('.item').count();
  
  await page.click('button:has-text("Filter")');
  await page.click('text=Dumbbell');
  
  const filteredCount = await page.locator('.item').count();
  expect(filteredCount).toBeLessThan(initialCount);
});
```

### 2. Integration Tests - Data Flow
Tests that verify components work together:
```typescript
// tests/integration/feature-data-flow.test.ts
test('filter component sends correct data values', () => {
  // Verify data contracts between components
  // Check that display names map to data values correctly
});
```

### 3. Unit Tests - Component Logic
Tests for individual functions/components:
```typescript
// tests/unit/component.test.ts
test('component converts display names to data values', () => {
  const result = convertMuscleName('Chest');
  expect(result).toBe('Pectoralis_Major');
});
```

### 4. Manual Verification Commands
Actual curl/grep commands to verify behavior:
```bash
# Initial state
curl -s http://localhost:8080/page | grep -c "item-class"

# After interaction (simulate with query params)
curl -s http://localhost:8080/page?filter=value | grep -c "item-class"
```

## Test Evidence Requirements

### For Every PR, You MUST Provide:

1. **Test Execution Output**
```bash
$ npx playwright test issue-25
Running 6 tests using 3 workers
✓ [chromium] › issue-25.spec.ts:9:7 › displays all exercises (2.1s)
✓ [chromium] › issue-25.spec.ts:20:7 › equipment filter works (3.2s)
...
6 passed (15.2s)
```

2. **Manual Verification Output**
```bash
$ curl -s http://localhost:8080/exercise-browser | grep -c "font-semibold"
38
$ # After filter simulation...
$ curl -s http://localhost:8080/exercise-browser?equipment=Dumbbell | grep -c "font-semibold"
11
```

3. **Screenshot Evidence**
- Before state
- After interaction
- Error states (if applicable)

## Common Test Scenarios

### Testing Filters
```typescript
test('filter reduces displayed items', async ({ page }) => {
  // 1. Count initial items
  // 2. Apply filter
  // 3. Count filtered items
  // 4. Verify count decreased
  // 5. Verify correct items shown
});
```

### Testing Form Submissions
```typescript
test('form saves data correctly', async ({ page }) => {
  // 1. Fill form
  // 2. Submit
  // 3. Verify success message
  // 4. Verify data persisted
  // 5. Reload and check data still there
});
```

### Testing Navigation
```typescript
test('navigation works correctly', async ({ page }) => {
  // 1. Click navigation element
  // 2. Verify URL changed
  // 3. Verify correct content loaded
  // 4. Verify back button works
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific issue tests
npx playwright test issue-25

# Run with UI mode (see what's happening)
npx playwright test --ui

# Run specific test file
npx playwright test tests/e2e/issue-25.spec.ts

# Generate test evidence
npm run test:evidence -- 25

# Run Puppeteer tests directly
node scripts/test-filters-simple.js
node scripts/test-with-puppeteer.js
```

### 5. Puppeteer Tests - Direct Browser Automation
For quick verification and debugging:
```javascript
// scripts/test-filters-simple.js
const puppeteer = require('puppeteer');

async function testFilters() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Direct navigation and element counting
  await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
  const titles = await page.$$eval('h3', elements => 
    elements.filter(el => el.className.includes('font-semibold')).map(el => el.textContent)
  );
  console.log(`Found ${titles.length} exercises`);
  
  // Test with query parameters
  await page.goto('http://localhost:8080/flows-experimental/exercise-browser?equipment=Dumbbell');
  const filtered = await page.$$eval('h3', elements => 
    elements.filter(el => el.className.includes('font-semibold')).length
  );
  console.log(`Filtered count: ${filtered} (expected: 11)`);
  
  await browser.close();
}
```

Use Puppeteer when:
- Playwright tests are too heavyweight
- You need quick browser automation
- Debugging specific interactions
- Capturing screenshots for evidence

## Test Writing Workflow

1. **Before Implementation**
   - Write E2E test for user story
   - Run test - it MUST fail
   - This proves you're testing the right thing

2. **During Implementation**
   - Run tests frequently
   - Each test that passes = progress
   - If test doesn't pass, feature doesn't work

3. **After Implementation**
   - All tests must pass
   - Generate evidence report
   - Paste evidence in PR

## The Golden Rule

**If you can't show test output proving it works, then it doesn't work.**

No exceptions. No "trust me, I tested it manually". No "it should work".

Show the evidence or admit it's broken.