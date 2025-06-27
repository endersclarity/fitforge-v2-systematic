import { test, expect } from '@playwright/test';

test.describe('Issue #26: Experimental Workout Builder with Drag-and-Drop', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the workout builder page
    await page.goto('/flows-experimental/workout-builder');
  });

  test('should display workout builder page with empty state', async ({ page }) => {
    // Check page loads correctly
    await expect(page).toHaveTitle(/Workout Builder/);
    
    // Should show empty state when no exercises added
    await expect(page.getByText('Start building your workout')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add an exercise' })).toBeVisible();
    
    // Should have header with save/cancel actions
    await expect(page.getByRole('button', { name: 'Save Workout' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('should open exercise selector when Add an exercise is clicked', async ({ page }) => {
    // Click Add an exercise button
    await page.getByRole('button', { name: 'Add an exercise' }).click();
    
    // Should open exercise selector modal
    await expect(page.getByText('Select Exercises')).toBeVisible();
    await expect(page.getByPlaceholder('Search exercises...')).toBeVisible();
    
    // Should show exercises from data (check for a known exercise)
    await expect(page.getByText('Dumbbell Bench Press')).toBeVisible();
  });

  test('should add exercise to workout when selected', async ({ page }) => {
    // Open exercise selector
    await page.getByRole('button', { name: 'Add an exercise' }).click();
    
    // Select an exercise
    await page.getByText('Dumbbell Bench Press').click();
    await page.getByRole('button', { name: 'Add to Workout' }).click();
    
    // Exercise should appear in workout
    await expect(page.getByText('Dumbbell Bench Press')).toBeVisible();
    await expect(page.getByText('3 sets × 8 reps')).toBeVisible(); // Default values
    
    // Empty state should be gone
    await expect(page.getByText('Start building your workout')).not.toBeVisible();
  });

  test('should allow configuring sets, reps, and weight for exercises', async ({ page }) => {
    // Add an exercise first
    await page.getByRole('button', { name: 'Add an exercise' }).click();
    await page.getByText('Dumbbell Bench Press').click();
    await page.getByRole('button', { name: 'Add to Workout' }).click();
    
    // Configure sets
    await page.locator('[data-testid="sets-input"]').fill('4');
    await expect(page.getByText('4 sets')).toBeVisible();
    
    // Configure reps
    await page.locator('[data-testid="reps-input"]').fill('10');
    await expect(page.getByText('10 reps')).toBeVisible();
    
    // Configure weight
    await page.locator('[data-testid="weight-input"]').fill('135');
    await expect(page.getByText('135 lb')).toBeVisible();
  });

  test('should create superset when grouping exercises', async ({ page }) => {
    // Add two exercises
    await page.getByRole('button', { name: 'Add an exercise' }).click();
    await page.getByText('Dumbbell Bench Press').click();
    await page.getByRole('button', { name: 'Add to Workout' }).click();
    
    await page.getByRole('button', { name: 'Add an exercise' }).click();
    await page.getByText('Dumbbell Row').click();
    await page.getByRole('button', { name: 'Add to Workout' }).click();
    
    // Select both exercises (using checkboxes)
    await page.getByTestId('exercise-checkbox-0').check();
    await page.getByTestId('exercise-checkbox-1').check();
    
    // Group as superset
    await page.getByRole('button', { name: 'Group as...' }).click();
    await page.getByText('Superset').click();
    
    // Should show superset visual grouping
    await expect(page.getByText('SUPERSET')).toBeVisible();
    await expect(page.getByText('2 exercises')).toBeVisible();
  });

  test('should allow reordering exercises with drag and drop', async ({ page }) => {
    // Add three exercises
    const exercises = ['Dumbbell Bench Press', 'Dumbbell Row', 'Bicycle Crunch'];
    
    for (const exercise of exercises) {
      await page.getByRole('button', { name: 'Add an exercise' }).click();
      await page.getByText(exercise).click();
      await page.getByRole('button', { name: 'Add to Workout' }).click();
    }
    
    // Get initial order
    const firstExercise = page.getByTestId('draggable-exercise-0');
    const thirdExercise = page.getByTestId('draggable-exercise-2');
    
    await expect(firstExercise.getByText('Dumbbell Bench Press')).toBeVisible();
    await expect(thirdExercise.getByText('Bicycle Crunch')).toBeVisible();
    
    // Drag first exercise after third (simulate drag and drop)
    await firstExercise.dragTo(thirdExercise, { targetPosition: { x: 0, y: 50 } });
    
    // Order should be changed
    const newFirstExercise = page.getByTestId('draggable-exercise-0');
    await expect(newFirstExercise.getByText('Dumbbell Row')).toBeVisible();
  });

  test('should save workout as template', async ({ page }) => {
    // Add an exercise
    await page.getByRole('button', { name: 'Add an exercise' }).click();
    await page.getByText('Dumbbell Bench Press').click();
    await page.getByRole('button', { name: 'Add to Workout' }).click();
    
    // Configure exercise
    await page.locator('[data-testid="sets-input"]').fill('4');
    await page.locator('[data-testid="reps-input"]').fill('8');
    await page.locator('[data-testid="weight-input"]').fill('135');
    
    // Save workout
    await page.getByRole('button', { name: 'Save Workout' }).click();
    
    // Should show save dialog
    await expect(page.getByText('Save Workout Template')).toBeVisible();
    await page.getByPlaceholder('Workout name...').fill('My Chest Workout');
    await page.getByRole('button', { name: 'Save Template' }).click();
    
    // Should show success message
    await expect(page.getByText('Workout saved as template')).toBeVisible();
  });

  test('should handle mobile-friendly drag interactions', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Add exercises
    await page.getByRole('button', { name: 'Add an exercise' }).click();
    await page.getByText('Dumbbell Bench Press').click();
    await page.getByRole('button', { name: 'Add to Workout' }).click();
    
    // Should show drag handles on mobile
    await expect(page.getByTestId('drag-handle')).toBeVisible();
    
    // Touch interactions should work (basic test)
    const dragHandle = page.getByTestId('drag-handle');
    const handleBox = await dragHandle.boundingBox();
    
    expect(handleBox).toBeTruthy();
    if (handleBox) {
      expect(handleBox.width).toBeGreaterThan(44); // iOS minimum touch target
      expect(handleBox.height).toBeGreaterThan(44);
    }
  });

  test('should connect to exercise browser from issue #20', async ({ page }) => {
    // This test assumes issue #20 is implemented
    await page.getByRole('button', { name: 'Add an exercise' }).click();
    
    // Should show exercise browser interface
    await expect(page.getByText('All Exercises')).toBeVisible();
    
    // Should have filter options
    await expect(page.getByText('Equipment')).toBeVisible();
    await expect(page.getByText('Muscle Group')).toBeVisible();
    
    // Filter by equipment should work
    await page.getByText('Dumbbell').click();
    
    // Should only show dumbbell exercises
    await expect(page.getByText('Dumbbell Bench Press')).toBeVisible();
    await expect(page.getByText('Barbell Bench Press')).not.toBeVisible();
  });

});