import { test, expect } from '@playwright/test';

test.describe('Issue #39: Equipment Filter Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/flows-experimental/exercise-browser');
    await page.waitForLoadState('networkidle');
  });

  test('should show all 38 exercises initially', async ({ page }) => {
    const exerciseCards = page.locator('[data-testid="exercise-card"], .exercise-card, [class*="exercise"], [class*="card"]').first();
    await expect(exerciseCards).toBeVisible();
    
    // Count all exercise elements - should be 38 total
    const exerciseCount = await page.locator('div[class*="card"]').count();
    expect(exerciseCount).toBe(38);
    
    // Verify header shows correct count
    await expect(page.getByText('38 exercises available')).toBeVisible();
  });

  test('should filter to only dumbbell exercises when Dumbbell selected', async ({ page }) => {
    // Click Equipment filter button
    const equipmentButton = page.locator('button:has-text("Equipment")');
    await expect(equipmentButton).toBeVisible();
    await equipmentButton.click();
    
    // Click Dumbbell option
    const dumbbellOption = page.locator('button:has-text("Dumbbell")').first();
    await expect(dumbbellOption).toBeVisible();
    await dumbbellOption.click({ force: true });
    
    // Wait for filtering to complete
    await page.waitForTimeout(2000);
    
    // Should show only 11 dumbbell exercises
    const exerciseCount = await page.locator('div[class*="card"]').count();
    expect(exerciseCount).toBe(11);
    
    // Verify header shows correct count
    await expect(page.getByText('11 exercises available')).toBeVisible();
    
    // URL parameter integration not implemented yet - that's OK
  });

  test('should filter to only bodyweight exercises when Bodyweight selected', async ({ page }) => {
    // Click Equipment filter button
    const equipmentButton = page.locator('button:has-text("Equipment")');
    await equipmentButton.click();
    
    // Click Bodyweight option
    const bodyweightOption = page.locator('button:has-text("Bodyweight")').first();
    await bodyweightOption.click({ force: true });
    
    // Wait for filtering to complete
    await page.waitForTimeout(2000);
    
    // Should show only bodyweight exercises (5 exercises)
    const exerciseCount = await page.locator('div[class*="card"]').count();
    expect(exerciseCount).toBe(5);
    
    // All visible exercises should be bodyweight
    const exerciseElements = await page.locator('div[class*="card"]').all();
    for (const exercise of exerciseElements) {
      await expect(exercise.getByText('Bodyweight')).toBeVisible();
    }
  });

  test('should clear filters when Clear All clicked', async ({ page }) => {
    // Apply a filter first
    await page.locator('button:has-text("Equipment")').click();
    await page.locator('button:has-text("Dumbbell")').first().click({ force: true });
    await page.waitForTimeout(2000);
    
    // Verify filter is applied
    const filteredCount = await page.locator('div[class*="card"]').count();
    expect(filteredCount).toBe(11);
    
    // Click Clear All (in the filter bar, not dropdown)
    const clearButton = page.getByRole('button', { name: 'Clear All' }).first();
    await expect(clearButton).toBeVisible();
    await clearButton.click();
    
    await page.waitForTimeout(1000);
    
    // Should show all 38 exercises again
    const allCount = await page.locator('div[class*="card"]').count();
    expect(allCount).toBe(38);
    
    await expect(page.getByText('38 exercises available')).toBeVisible();
  });

  test('should show active filter indicator when equipment selected', async ({ page }) => {
    // Click Equipment filter
    await page.locator('button:has-text("Equipment")').click();
    await page.locator('button:has-text("Dumbbell")').first().click({ force: true });
    await page.waitForTimeout(1000);
    
    // Should show active filter indicator
    await expect(page.getByText('1 Equipment')).toBeVisible();
    
    // Should show "Active filters:" section
    await expect(page.getByText('Active filters:')).toBeVisible();
  });

  test('should support multiple equipment selections', async ({ page }) => {
    // Select Equipment filter
    await page.locator('button:has-text("Equipment")').click();
    
    // Select Dumbbell
    await page.locator('button:has-text("Dumbbell")').first().click({ force: true });
    
    // Select Bodyweight (without closing dropdown)
    await page.locator('button:has-text("Bodyweight")').first().click({ force: true });
    
    // Wait for filtering to complete
    await page.waitForTimeout(2000);
    
    // Should show combined results (Dumbbell: 11 + Bodyweight: 5 = 16)
    const combinedCount = await page.locator('div[class*="card"]').count();
    expect(combinedCount).toBe(16);
    
    // Should show "2 Equipment" in filter indicator
    await expect(page.getByText('2 Equipment')).toBeVisible();
  });
});