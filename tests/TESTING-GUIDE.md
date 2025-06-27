# FitForge Testing Guide

## ⚡ INSTANT TESTING METHODOLOGY - NO TIMEOUTS

**Why wait 30 seconds when you can verify in milliseconds?**

### The Problem with Traditional E2E Testing
- Playwright/Puppeteer arbitrary 30-second timeouts
- Waiting for elements that don't exist (obvious failure in <100ms)
- Slow feedback cycles kill development flow

### Instant Testing Solution
```bash
# Create instant test script for any feature
node scripts/instant-test.js

# Results in <1 second:
# ✅ Route accessibility (HTTP 200/404)
# ✅ Page content verification (string matching)  
# ✅ DOM structure validation (element counting)
# ✅ Data contract verification (JSON parsing)
```

### When to Use Each Approach
- **Instant Tests**: Route exists, content present, basic functionality
- **Playwright**: Complex interactions, visual regression, cross-browser
- **Manual curl**: Data verification, API responses, state checking

### Instant Test Template
```javascript
#!/usr/bin/env node
const { execSync } = require('child_process');

// Test 1: Route accessibility (immediate)
const statusCode = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/route', {encoding: 'utf8'});

// Test 2: Content verification (immediate)  
const content = execSync('curl -s http://localhost:8080/route', {encoding: 'utf8'});
const hasExpectedContent = content.includes('Expected Text');

// Test 3: Data validation (immediate)
const dataCount = execSync('cat data/file.json | jq ". | length"', {encoding: 'utf8'});

console.log(`Route: ${statusCode === '200' ? '✅' : '❌'}`);
console.log(`Content: ${hasExpectedContent ? '✅' : '❌'}`);
console.log(`Data: ${dataCount} items found`);
```

## 🚨 MANDATORY: Test Before You Claim It Works

**If you didn't test it, it doesn't work. Period.**

## 🚨 BASIC INTERACTION DEBUGGING FIRST

**Before ANY complex testing, check basic interactions:**

### When User Reports "Clicking Doesn't Work"
1. **Add console logs to onClick handlers**:
   ```javascript
   onClick={(e) => {
     console.log('🚨 CLICK FIRED')
     e.stopPropagation()  // Try this FIRST
     e.preventDefault()   // And this
     // ... handler logic
   }}
   ```

2. **Check common interaction failures** (in order):
   - Event bubbling → `e.stopPropagation()`
   - Handler not attached → verify console.log fires
   - Element blocked → z-index/positioning issues
   - Dropdown closing immediately → outside click conflicts

3. **Human testing trumps automation**:
   - If Puppeteer/Playwright shows "working" but human says "broken"
   - **Conclude**: automation is bypassing real interaction
   - Debug actual user path, not automated path

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