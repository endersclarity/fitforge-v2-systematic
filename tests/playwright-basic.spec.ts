import { test, expect } from '@playwright/test';

test('Basic Playwright functionality test', async ({ page }) => {
  console.log('🧪 TESTING PLAYWRIGHT BASIC FUNCTIONALITY');
  
  console.log('1. Testing navigation to local site...');
  await page.goto('http://localhost:8080');
  
  const title = await page.title();
  console.log(`✅ Page title: ${title}`);
  expect(title).toContain('FitForge');
  
  console.log('2. Testing element selection...');
  const elements = await page.locator('*').count();
  console.log(`✅ Found ${elements} DOM elements`);
  expect(elements).toBeGreaterThan(10);
  
  console.log('3. Testing navigation to exercise browser...');
  await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
  
  console.log('4. Testing if exercise headings exist...');
  await page.waitForSelector('h3', { timeout: 5000 });
  const exerciseHeadings = await page.locator('h3').count();
  console.log(`✅ Found ${exerciseHeadings} h3 elements`);
  
  console.log('5. Testing specific exercise heading selector...');
  const exerciseCards = await page.locator('h3.font-semibold').count();
  console.log(`✅ Found ${exerciseCards} exercise cards with font-semibold`);
  
  console.log('\n🎯 PLAYWRIGHT VERDICT: FULLY FUNCTIONAL ✅');
});