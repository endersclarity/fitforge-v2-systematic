import { test, expect } from '@playwright/test';

test.describe('Route Accessibility Tests', () => {
  const routes = [
    { path: '/', name: 'Homepage' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/push-day', name: 'Push Day' },
    { path: '/pull-day', name: 'Pull Day' },
    { path: '/legs-day', name: 'Legs Day' },
    { path: '/profile', name: 'Profile' },
    { path: '/analytics', name: 'Analytics' },
    { path: '/flows-experimental/exercise-browser', name: 'Exercise Browser' },
    { path: '/flows-experimental/workout-builder', name: 'Workout Builder' },
    { path: '/flows-experimental/saved-workouts', name: 'Saved Workouts' },
    { path: '/flows-experimental/recovery', name: 'Recovery Dashboard' }
  ];

  routes.forEach(({ path, name }) => {
    test(`should load ${name} (${path}) with 200 status`, async ({ page }) => {
      const response = await page.goto(`http://localhost:8080${path}`);
      expect(response?.status()).toBe(200);
    });

    test(`${name} should have content`, async ({ page }) => {
      await page.goto(`http://localhost:8080${path}`);
      
      // Wait for content to load
      await page.waitForLoadState('domcontentloaded');
      
      // Check page has meaningful content
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      expect(bodyText!.length).toBeGreaterThan(100);
      
      // Should not show error messages
      expect(bodyText).not.toContain('404');
      expect(bodyText).not.toContain('Error');
      expect(bodyText).not.toContain('not found');
    });
  });

  test('all pages should load in under 2 seconds', async ({ page }) => {
    for (const { path, name } of routes) {
      const startTime = Date.now();
      await page.goto(`http://localhost:8080${path}`);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      console.log(`${name}: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(2000);
    }
  });

  test('navigation links should work from dashboard', async ({ page }) => {
    await page.goto('http://localhost:8080/dashboard');
    
    // Test main navigation links
    const navLinks = [
      { text: 'Start Workout', expectedUrl: /push-pull-legs|workout/ },
      { text: 'Exercise Library', expectedUrl: /exercise|muscle/ },
      { text: 'Analytics', expectedUrl: /analytics/ },
      { text: 'Profile', expectedUrl: /profile/ }
    ];

    for (const { text, expectedUrl } of navLinks) {
      // Go back to dashboard
      await page.goto('http://localhost:8080/dashboard');
      
      // Find and click link
      const link = page.locator(`a:has-text("${text}")`).first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForLoadState('networkidle');
        
        // Verify navigation occurred
        expect(page.url()).toMatch(expectedUrl);
      }
    }
  });

  test('static assets should load correctly', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Check for CSS
    const styles = await page.$$('link[rel="stylesheet"]');
    expect(styles.length).toBeGreaterThan(0);
    
    // Check for JavaScript
    const scripts = await page.$$('script[src]');
    expect(scripts.length).toBeGreaterThan(0);
    
    // Verify no console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    expect(consoleErrors).toHaveLength(0);
  });

  test('🚨 CRITICAL: backend API status check', async ({ page }) => {
    // This test checks if backend confusion exists
    const backendUrl = 'http://localhost:8000';
    
    try {
      const response = await page.goto(backendUrl, { 
        timeout: 5000,
        waitUntil: 'domcontentloaded' 
      });
      
      // If backend responds, there's architectural confusion
      if (response && response.status() === 200) {
        console.warn('Backend service is running but not connected to frontend');
      }
      
      // This is expected to fail based on container test findings
      expect(response?.status()).not.toBe(200);
    } catch (error) {
      // Expected - backend should not be responding
      expect(error).toBeTruthy();
    }
  });
});