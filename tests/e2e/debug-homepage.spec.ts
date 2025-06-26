import { test, expect } from '@playwright/test';

test.describe('Debug Homepage', () => {
  test('inspect homepage structure', async ({ page }) => {
    console.log('🔍 Loading homepage and inspecting structure');
    
    await page.goto('http://localhost:8080');
    await expect(page).toHaveTitle(/FitForge/);
    
    // Get page title and main content
    const title = await page.title();
    console.log('🔧 Page title:', title);
    
    // Get all text content on the page
    const pageText = await page.textContent('body');
    console.log('🔧 Page contains Push/Pull/Legs:', pageText?.includes('Push/Pull/Legs'));
    console.log('🔧 Page contains Push:', pageText?.includes('Push'));
    console.log('🔧 Page contains Pull:', pageText?.includes('Pull'));
    console.log('🔧 Page contains Legs:', pageText?.includes('Legs'));
    
    // Get all visible links and buttons
    const links = await page.locator('a, button').allTextContents();
    console.log('🔧 All links and buttons:', links);
    
    // Get navigation elements
    const navElements = await page.locator('nav a, [role="navigation"] a').allTextContents();
    console.log('🔧 Navigation elements:', navElements);
    
    // Check for specific workout-related text
    const workoutText = await page.locator('text=/workout|exercise|push|pull|legs/i').allTextContents();
    console.log('🔧 Workout-related text found:', workoutText);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-homepage.png', fullPage: true });
    console.log('🔧 Screenshot saved as debug-homepage.png');
    
    // Get all heading elements
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    console.log('🔧 All headings:', headings);
    
    // Get main dashboard cards or sections
    const cards = await page.locator('[class*="card"], [class*="Card"], .bg-fitbod-card').allTextContents();
    console.log('🔧 Card elements found:', cards);
  });
});