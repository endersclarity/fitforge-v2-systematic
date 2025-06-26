import { test, expect } from '@playwright/test';

test.describe('Debug Pull Day Page', () => {
  test('inspect pull day page structure', async ({ page }) => {
    console.log('🔍 Debugging Pull Day page structure');
    
    await page.goto('http://localhost:8080');
    await page.click('text=Start Workout');
    await page.click('text=Start Pull Day');
    
    // Get page title and main content
    const url = page.url();
    console.log('🔧 Current URL:', url);
    
    const title = await page.title();
    console.log('🔧 Page title:', title);
    
    // Get all headings
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    console.log('🔧 All headings:', headings);
    
    // Get all buttons and links
    const buttons = await page.locator('button, a').allTextContents();
    console.log('🔧 All buttons and links:', buttons);
    
    // Look for exercise-related elements
    const exerciseElements = await page.locator('[class*="exercise"], [data-testid*="exercise"], .cursor-pointer').allTextContents();
    console.log('🔧 Exercise elements:', exerciseElements);
    
    // Look for checkbox or selection elements
    const checkboxes = await page.locator('input[type="checkbox"]').count();
    console.log('🔧 Number of checkboxes found:', checkboxes);
    
    // Look for cards or selectable items
    const cards = await page.locator('[class*="card"], [class*="Card"], .bg-fitbod-card').count();
    console.log('🔧 Number of card elements:', cards);
    
    // Look for "Start" buttons
    const startButtons = await page.locator('text=/start/i').allTextContents();
    console.log('🔧 Start-related buttons:', startButtons);
    
    // Look for workout-related actions
    const workoutActions = await page.locator('text=/workout|begin|execute|complete/i').allTextContents();
    console.log('🔧 Workout action buttons:', workoutActions);
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-pull-day.png', fullPage: true });
    console.log('🔧 Screenshot saved as debug-pull-day.png');
    
    // Check localStorage to see if any workout data exists
    const localStorage = await page.evaluate(() => {
      return {
        workoutSession: localStorage.getItem('fitforge-workout-session'),
        workoutHistory: localStorage.getItem('fitforge-workout-history'),
        allKeys: Object.keys(localStorage)
      };
    });
    console.log('🔧 localStorage data:', localStorage);
  });
});