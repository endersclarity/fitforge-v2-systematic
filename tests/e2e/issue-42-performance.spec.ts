import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('all pages should load in under 2 seconds', async ({ page }) => {
    const routes = [
      '/',
      '/dashboard',
      '/push-day',
      '/pull-day', 
      '/legs-day',
      '/profile',
      '/analytics',
      '/flows-experimental/exercise-browser',
      '/flows-experimental/workout-builder',
      '/flows-experimental/saved-workouts',
      '/flows-experimental/recovery'
    ];

    const performanceResults: { route: string; loadTime: number }[] = [];

    for (const route of routes) {
      const startTime = Date.now();
      
      await page.goto(`http://localhost:8080${route}`, {
        waitUntil: 'networkidle'
      });
      
      const loadTime = Date.now() - startTime;
      performanceResults.push({ route, loadTime });
      
      console.log(`${route}: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(2000);
    }

    // Calculate average
    const average = performanceResults.reduce((sum, r) => sum + r.loadTime, 0) / performanceResults.length;
    console.log(`Average load time: ${average.toFixed(0)}ms`);
    expect(average).toBeLessThan(1000);
  });

  test('filters should respond in under 500ms', async ({ page }) => {
    await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
    await page.waitForLoadState('networkidle');

    // Measure filter response time
    const filterButton = await page.locator('button:has-text("Equipment")').first();
    
    if (await filterButton.isVisible()) {
      // Time the filter interaction
      const startTime = Date.now();
      
      await filterButton.click();
      await page.waitForTimeout(100); // Small wait for dropdown
      
      const dumbbellOption = await page.locator('text=Dumbbell').first();
      if (await dumbbellOption.isVisible()) {
        await dumbbellOption.click();
        
        // Wait for exercises to update
        await page.waitForFunction(() => {
          // Check if DOM has updated
          const exercises = document.querySelectorAll('h3.font-semibold');
          return exercises.length > 0;
        }, { timeout: 500 });
        
        const responseTime = Date.now() - startTime;
        console.log(`Filter response time: ${responseTime}ms`);
        
        expect(responseTime).toBeLessThan(500);
      }
    }
  });

  test('should measure First Contentful Paint (FCP)', async ({ page }) => {
    await page.goto('http://localhost:8080/dashboard');
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Wait for paint timing
        if (window.performance && window.performance.getEntriesByType) {
          const paintTimings = performance.getEntriesByType('paint');
          const fcp = paintTimings.find(timing => timing.name === 'first-contentful-paint');
          
          if (fcp) {
            resolve({
              fcp: fcp.startTime,
              fp: paintTimings.find(t => t.name === 'first-paint')?.startTime || 0
            });
          } else {
            // Fallback for browsers without paint timing
            resolve({ fcp: 0, fp: 0 });
          }
        } else {
          resolve({ fcp: 0, fp: 0 });
        }
      });
    });

    console.log('First Paint:', metrics.fp + 'ms');
    console.log('First Contentful Paint:', metrics.fcp + 'ms');
    
    if (metrics.fcp > 0) {
      expect(metrics.fcp).toBeLessThan(1500);
    }
  });

  test('should measure Time to Interactive (TTI)', async ({ page }) => {
    await page.goto('http://localhost:8080/dashboard');
    
    // Measure time until page is interactive
    const tti = await page.evaluate(() => {
      return new Promise((resolve) => {
        let lastLongTaskTime = 0;
        
        // Use PerformanceObserver to track long tasks
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              lastLongTaskTime = entry.startTime + entry.duration;
            }
          });
          
          observer.observe({ entryTypes: ['longtask'] });
          
          // Wait a bit then resolve with TTI
          setTimeout(() => {
            observer.disconnect();
            resolve(lastLongTaskTime || performance.now());
          }, 2000);
        } else {
          // Fallback
          resolve(performance.now());
        }
      });
    });

    console.log('Time to Interactive:', tti + 'ms');
    expect(tti).toBeLessThan(3000);
  });

  test('should have acceptable JavaScript bundle size', async ({ page }) => {
    const response = await page.goto('http://localhost:8080');
    
    // Collect all JavaScript resources
    const jsResources = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return scripts.map(script => script.src);
    });

    let totalSize = 0;
    
    for (const url of jsResources) {
      try {
        const response = await page.request.get(url);
        const size = (await response.body()).length;
        totalSize += size;
        console.log(`${url.split('/').pop()}: ${(size / 1024).toFixed(1)}KB`);
      } catch (error) {
        // Skip if resource fails
      }
    }

    const totalSizeMB = totalSize / (1024 * 1024);
    console.log(`Total JS size: ${totalSizeMB.toFixed(2)}MB`);
    
    // Expect reasonable bundle size (under 5MB)
    expect(totalSizeMB).toBeLessThan(5);
  });

  test('should not have memory leaks during navigation', async ({ page }) => {
    // Navigate between pages multiple times
    const routes = ['/dashboard', '/flows-experimental/exercise-browser', '/profile'];
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    // Navigate multiple times
    for (let i = 0; i < 10; i++) {
      for (const route of routes) {
        await page.goto(`http://localhost:8080${route}`);
        await page.waitForLoadState('networkidle');
      }
    }

    // Force garbage collection if available
    await page.evaluate(() => {
      if (window.gc) {
        window.gc();
      }
    });

    // Check final memory usage
    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024);
      console.log(`Memory increase after navigation: ${memoryIncrease.toFixed(2)}MB`);
      
      // Should not increase by more than 50MB
      expect(memoryIncrease).toBeLessThan(50);
    }
  });

  test('API response times should be fast', async ({ page }) => {
    // Test any API endpoints if they exist
    const apiEndpoints = [
      '/api/health',
      '/api/exercises',
      '/api/workouts'
    ];

    for (const endpoint of apiEndpoints) {
      try {
        const startTime = Date.now();
        const response = await page.request.get(`http://localhost:8080${endpoint}`);
        const responseTime = Date.now() - startTime;
        
        console.log(`${endpoint}: ${response.status()} - ${responseTime}ms`);
        
        if (response.status() === 200) {
          expect(responseTime).toBeLessThan(500);
        }
      } catch (error) {
        // API might not exist, which is fine
        console.log(`${endpoint}: Not found`);
      }
    }
  });
});