import { test, expect } from '@playwright/test';

test.describe('Issue #34: Workout Template Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
  });

  test.describe('Saved Workouts View', () => {
    test('should navigate to saved workouts page', async ({ page }) => {
      await page.goto('http://localhost:8080/flows-experimental/saved-workouts');
      await expect(page).toHaveURL(/.*saved-workouts/);
      await expect(page.locator('h1')).toContainText('Saved Workouts');
    });

    test('should display empty state when no templates exist', async ({ page }) => {
      await page.goto('http://localhost:8080/flows-experimental/saved-workouts');
      await expect(page.locator('text=No saved workouts yet')).toBeVisible();
      await expect(page.locator('text=Create your first workout template')).toBeVisible();
    });

    test('should display saved workout templates in grid', async ({ page }) => {
      // First save a template
      await page.goto('http://localhost:8080/flows-experimental/workout-builder');
      
      // Add an exercise
      await page.getByTestId('add-exercise-button').click();
      await page.locator('text=Bench Press').first().click();
      await page.locator('button:has-text("Add to Workout")').click();
      
      // Wait for modal to close
      await page.waitForSelector('[data-testid="exercise-selector-modal"]', { state: 'hidden' });
      
      // Save the workout
      await page.getByTestId('save-workout-button').click();
      await page.getByTestId('workout-name-input').fill('Test Push Workout');
      await page.getByTestId('workout-type-select').selectOption('A');
      await page.locator('button:has-text("Save Template")').click();
      
      // Navigate to saved workouts
      await page.goto('http://localhost:8080/flows-experimental/saved-workouts');
      
      // Verify template appears
      await expect(page.locator('[data-testid="workout-template-card"]')).toHaveCount(1);
      await expect(page.locator('text=Test Push Workout')).toBeVisible();
      await expect(page.locator('text=Type A')).toBeVisible();
      await expect(page.locator('text=1 exercise')).toBeVisible();
    });
  });

  test.describe('Template CRUD Operations', () => {
    test('should save workout template from builder', async ({ page }) => {
      await page.goto('http://localhost:8080/flows-experimental/workout-builder');
      
      // Add exercises
      await page.getByTestId('add-exercise-button').click();
      await page.locator('text=Bench Press').first().click();
      await page.locator('button:has-text("Add to Workout")').click();
      
      // Wait for modal to close
      await page.waitForSelector('[data-testid="exercise-selector-modal"]', { state: 'hidden' });
      
      await page.getByTestId('add-exercise-button').click();
      await page.locator('text=Tricep Extension').first().click();
      await page.locator('button:has-text("Add to Workout")').click();
      
      // Save workout
      await page.getByTestId('save-workout-button').click();
      await page.getByTestId('workout-name-input').fill('Push Day A');
      await page.getByTestId('workout-type-select').selectOption('A');
      await page.locator('button:has-text("Save Template")').click();
      
      // Verify success message
      await expect(page.locator('text=Workout saved successfully!')).toBeVisible();
      
      // Verify template persists
      await page.reload();
      await page.goto('http://localhost:8080/flows-experimental/saved-workouts');
      await expect(page.locator('text=Push Day A')).toBeVisible();
    });

    test('should load template back into workout builder', async ({ page }) => {
      // Create a template first
      await page.goto('http://localhost:8080/flows-experimental/workout-builder');
      await page.getByTestId('add-exercise-button').click();
      await page.locator('text=Bench Press').first().click();
      await page.locator('button:has-text("Add to Workout")').click();
      
      // Wait for modal to close
      await page.waitForSelector('[data-testid="exercise-selector-modal"]', { state: 'hidden' });
      await page.getByTestId('save-workout-button').click();
      await page.getByTestId('workout-name-input').fill('Template to Load');
      await page.locator('button:has-text("Save Template")').click();
      
      // Go to saved workouts
      await page.goto('http://localhost:8080/flows-experimental/saved-workouts');
      
      // Click edit on the template
      await page.locator('[data-testid="edit-template-button"]').first().click();
      
      // Verify we're back in workout builder with the template loaded
      await expect(page).toHaveURL(/.*workout-builder/);
      await expect(page.locator('[data-testid="workout-exercise"]')).toHaveCount(1);
      await expect(page.locator('text=Bench Press')).toBeVisible();
    });

    test('should delete workout template', async ({ page }) => {
      // Create a template
      await page.goto('http://localhost:8080/flows-experimental/workout-builder');
      await page.getByTestId('add-exercise-button').click();
      await page.locator('text=Bench Press').first().click();
      await page.locator('button:has-text("Add to Workout")').click();
      
      // Wait for modal to close
      await page.waitForSelector('[data-testid="exercise-selector-modal"]', { state: 'hidden' });
      await page.getByTestId('save-workout-button').click();
      await page.getByTestId('workout-name-input').fill('Template to Delete');
      await page.locator('button:has-text("Save Template")').click();
      
      // Go to saved workouts
      await page.goto('http://localhost:8080/flows-experimental/saved-workouts');
      await expect(page.locator('text=Template to Delete')).toBeVisible();
      
      // Delete the template
      page.on('dialog', dialog => dialog.accept());
      await page.locator('[data-testid="delete-template-button"]').first().click();
      
      // Verify it's gone
      await expect(page.locator('text=Template to Delete')).not.toBeVisible();
      await expect(page.locator('text=No saved workouts yet')).toBeVisible();
    });

    test('should duplicate workout template', async ({ page }) => {
      // Create a template
      await page.goto('http://localhost:8080/flows-experimental/workout-builder');
      await page.getByTestId('add-exercise-button').click();
      await page.locator('text=Bench Press').first().click();
      await page.locator('button:has-text("Add to Workout")').click();
      
      // Wait for modal to close
      await page.waitForSelector('[data-testid="exercise-selector-modal"]', { state: 'hidden' });
      await page.getByTestId('save-workout-button').click();
      await page.getByTestId('workout-name-input').fill('Original Template');
      await page.locator('button:has-text("Save Template")').click();
      
      // Go to saved workouts
      await page.goto('http://localhost:8080/flows-experimental/saved-workouts');
      
      // Duplicate the template
      await page.locator('[data-testid="duplicate-template-button"]').first().click();
      
      // Verify duplicate exists
      await expect(page.locator('[data-testid="workout-template-card"]')).toHaveCount(2);
      await expect(page.locator('text=Original Template (Copy)')).toBeVisible();
    });
  });

  test.describe('Template Execution', () => {
    test('should start workout from saved template', async ({ page }) => {
      // Create a template
      await page.goto('http://localhost:8080/flows-experimental/workout-builder');
      await page.getByTestId('add-exercise-button').click();
      await page.locator('text=Bench Press').first().click();
      await page.locator('button:has-text("Add to Workout")').click();
      
      // Wait for modal to close
      await page.waitForSelector('[data-testid="exercise-selector-modal"]', { state: 'hidden' });
      await page.getByTestId('save-workout-button').click();
      await page.getByTestId('workout-name-input').fill('Workout to Execute');
      await page.locator('button:has-text("Save Template")').click();
      
      // Go to saved workouts
      await page.goto('http://localhost:8080/flows-experimental/saved-workouts');
      
      // Start workout
      await page.locator('[data-testid="start-workout-button"]').first().click();
      
      // Verify we're in workout execution with the template loaded
      await expect(page).toHaveURL(/.*workout-execution/);
      await expect(page.locator('text=Bench Press')).toBeVisible();
      await expect(page.locator('[data-testid="exercise-set-row"]')).toBeVisible();
    });
  });

  test.describe('Template Organization', () => {
    test('should filter templates by category', async ({ page }) => {
      // Create templates with different categories
      await page.goto('http://localhost:8080/flows-experimental/workout-builder');
      
      // Create strength template
      await page.getByTestId('add-exercise-button').click();
      await page.locator('text=Bench Press').first().click();
      await page.locator('button:has-text("Add to Workout")').click();
      
      // Wait for modal to close
      await page.waitForSelector('[data-testid="exercise-selector-modal"]', { state: 'hidden' });
      await page.getByTestId('save-workout-button').click();
      await page.getByTestId('workout-name-input').fill('Strength Template');
      await page.getByTestId('workout-category-select').selectOption('strength');
      await page.locator('button:has-text("Save Template")').click();
      
      // Create hypertrophy template
      await page.getByTestId('add-exercise-button').click();
      await page.locator('text=Tricep Extension').first().click();
      await page.getByTestId('save-workout-button').click();
      await page.getByTestId('workout-name-input').fill('Hypertrophy Template');
      await page.getByTestId('workout-category-select').selectOption('hypertrophy');
      await page.locator('button:has-text("Save Template")').click();
      
      // Go to saved workouts and filter
      await page.goto('http://localhost:8080/flows-experimental/saved-workouts');
      await expect(page.locator('[data-testid="workout-template-card"]')).toHaveCount(2);
      
      // Filter by strength
      await page.locator('[data-testid="category-filter"]').selectOption('strength');
      await expect(page.locator('[data-testid="workout-template-card"]')).toHaveCount(1);
      await expect(page.locator('text=Strength Template')).toBeVisible();
      await expect(page.locator('text=Hypertrophy Template')).not.toBeVisible();
    });

    test('should search templates by name', async ({ page }) => {
      // Create multiple templates
      await page.goto('http://localhost:8080/flows-experimental/workout-builder');
      
      // Template 1
      await page.getByTestId('add-exercise-button').click();
      await page.locator('text=Bench Press').first().click();
      await page.locator('button:has-text("Add to Workout")').click();
      
      // Wait for modal to close
      await page.waitForSelector('[data-testid="exercise-selector-modal"]', { state: 'hidden' });
      await page.getByTestId('save-workout-button').click();
      await page.getByTestId('workout-name-input').fill('Upper Body Power');
      await page.locator('button:has-text("Save Template")').click();
      
      // Template 2
      await page.getByTestId('add-exercise-button').click();
      await page.locator('text=Goblet Squats').first().click();
      await page.locator('button:has-text("Add to Workout")').click();
      await page.getByTestId('save-workout-button').click();
      await page.getByTestId('workout-name-input').fill('Lower Body Strength');
      await page.locator('button:has-text("Save Template")').click();
      
      // Search
      await page.goto('http://localhost:8080/flows-experimental/saved-workouts');
      await page.getByTestId('template-search-input').fill('Upper');
      
      await expect(page.locator('[data-testid="workout-template-card"]')).toHaveCount(1);
      await expect(page.locator('text=Upper Body Power')).toBeVisible();
      await expect(page.locator('text=Lower Body Strength')).not.toBeVisible();
    });
  });
});