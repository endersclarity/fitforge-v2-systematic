import { test, expect } from '@playwright/test';

test.describe('Filter Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to exercise browser before each test
    await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
    await page.waitForLoadState('networkidle');
  });

  test('exercise browser should display all 38 exercises initially', async ({ page }) => {
    // Count exercise cards
    const exercises = await page.locator('[data-testid*="exercise"], .exercise-card, h3.font-semibold').all();
    console.log(`Found ${exercises.length} exercise elements`);
    
    // Should show all 38 exercises
    expect(exercises.length).toBeGreaterThanOrEqual(38);
  });

  test('🚨 CRITICAL: equipment filter should reduce exercise count', async ({ page }) => {
    // Get initial exercise count
    const initialExercises = await page.locator('h3.font-semibold').all();
    const initialCount = initialExercises.length;
    console.log(`Initial exercise count: ${initialCount}`);

    // Look for equipment filter
    const equipmentFilter = await page.locator('button:has-text("Equipment"), select[name*="equipment"], [data-testid*="equipment"]').first();
    
    if (await equipmentFilter.isVisible()) {
      // Click to open filter dropdown
      await equipmentFilter.click();
      await page.waitForTimeout(500);

      // Try to select "Dumbbell"
      const dumbbellOption = await page.locator('text=Dumbbell, [value="Dumbbell"], input[value="Dumbbell"]').first();
      
      if (await dumbbellOption.isVisible()) {
        await dumbbellOption.click();
        await page.waitForTimeout(1000);

        // Count exercises after filtering
        const filteredExercises = await page.locator('h3.font-semibold').all();
        const filteredCount = filteredExercises.length;
        console.log(`Filtered exercise count: ${filteredCount}`);

        // This test is expected to FAIL based on container test findings
        expect(filteredCount).toBeLessThan(initialCount);
        expect(filteredCount).toBeGreaterThan(0);
      } else {
        // Filter exists but can't select options
        throw new Error('Equipment filter dropdown exists but options not selectable');
      }
    } else {
      throw new Error('No equipment filter found on page');
    }
  });

  test('muscle group filter should work', async ({ page }) => {
    // Get initial count
    const initialExercises = await page.locator('h3.font-semibold').all();
    const initialCount = initialExercises.length;

    // Look for muscle filter
    const muscleFilter = await page.locator('button:has-text("Muscle"), select[name*="muscle"], [data-testid*="muscle"]').first();
    
    if (await muscleFilter.isVisible()) {
      await muscleFilter.click();
      await page.waitForTimeout(500);

      // Try to select a muscle group
      const chestOption = await page.locator('text=Chest, text=Pectoralis, [value*="chest"], [value*="Chest"]').first();
      
      if (await chestOption.isVisible()) {
        await chestOption.click();
        await page.waitForTimeout(1000);

        const filteredCount = await page.locator('h3.font-semibold').count();
        console.log(`Muscle filter - Initial: ${initialCount}, Filtered: ${filteredCount}`);

        // Should show fewer exercises
        expect(filteredCount).toBeLessThan(initialCount);
      }
    }
  });

  test('category filter should work', async ({ page }) => {
    // Get initial count
    const initialCount = await page.locator('h3.font-semibold').count();

    // Look for category/muscle group filter
    const categoryFilter = await page.locator('button:has-text("Category"), button:has-text("Muscle Group"), select[name*="category"]').first();
    
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      await page.waitForTimeout(500);

      // Try to select "Push" category
      const pushOption = await page.locator('text=Push, [value="Push"]').first();
      
      if (await pushOption.isVisible()) {
        await pushOption.click();
        await page.waitForTimeout(1000);

        const filteredCount = await page.locator('h3.font-semibold').count();
        console.log(`Category filter - Initial: ${initialCount}, Filtered: ${filteredCount}`);

        expect(filteredCount).toBeLessThan(initialCount);
        expect(filteredCount).toBeGreaterThan(0);
      }
    }
  });

  test('multiple filters should work together', async ({ page }) => {
    // This tests if filters can be combined
    const initialCount = await page.locator('h3.font-semibold').count();

    // Apply equipment filter first
    const equipmentFilter = await page.locator('button:has-text("Equipment")').first();
    if (await equipmentFilter.isVisible()) {
      await equipmentFilter.click();
      const dumbbellOption = await page.locator('text=Dumbbell').first();
      if (await dumbbellOption.isVisible()) {
        await dumbbellOption.click();
        await page.waitForTimeout(500);
      }
    }

    // Then apply muscle group filter
    const muscleFilter = await page.locator('button:has-text("Muscle Group"), button:has-text("Category")').first();
    if (await muscleFilter.isVisible()) {
      await muscleFilter.click();
      const pushOption = await page.locator('text=Push').first();
      if (await pushOption.isVisible()) {
        await pushOption.click();
        await page.waitForTimeout(500);
      }
    }

    const filteredCount = await page.locator('h3.font-semibold').count();
    console.log(`Combined filters - Initial: ${initialCount}, Filtered: ${filteredCount}`);

    // Should have even fewer results with both filters
    expect(filteredCount).toBeLessThan(initialCount);
  });

  test('filter should update URL parameters', async ({ page }) => {
    // Check if filters update the URL for shareable links
    const initialUrl = page.url();

    // Apply a filter
    const equipmentFilter = await page.locator('button:has-text("Equipment")').first();
    if (await equipmentFilter.isVisible()) {
      await equipmentFilter.click();
      const dumbbellOption = await page.locator('text=Dumbbell').first();
      if (await dumbbellOption.isVisible()) {
        await dumbbellOption.click();
        await page.waitForTimeout(500);

        const newUrl = page.url();
        console.log(`URL changed from ${initialUrl} to ${newUrl}`);

        // URL should contain filter parameter
        expect(newUrl).toContain('equipment');
      }
    }
  });

  test('clear filters should restore all exercises', async ({ page }) => {
    // Apply a filter first
    const equipmentFilter = await page.locator('button:has-text("Equipment")').first();
    if (await equipmentFilter.isVisible()) {
      await equipmentFilter.click();
      const dumbbellOption = await page.locator('text=Dumbbell').first();
      if (await dumbbellOption.isVisible()) {
        await dumbbellOption.click();
        await page.waitForTimeout(500);
      }
    }

    // Look for clear filters button
    const clearButton = await page.locator('button:has-text("Clear"), button:has-text("Reset")').first();
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForTimeout(500);

      const count = await page.locator('h3.font-semibold').count();
      expect(count).toBeGreaterThanOrEqual(38);
    }
  });
});