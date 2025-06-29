import { test, expect } from '@playwright/test';

test.describe('Issue #27: Experimental Workout Execution with Advanced Set Logging', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to experimental workout execution page
    await page.goto('http://localhost:8080/flows-experimental/workout-execution');
  });

  test('should display experimental workout execution page', async ({ page }) => {
    // Test that the new experimental route exists
    await expect(page).toHaveTitle(/FitForge/);
    await expect(page.locator('h1')).toContainText('Experimental Workout Execution');
  });

  test('should show RPE rating modal after completing a set', async ({ page }) => {
    // This test will fail initially - feature not implemented
    
    // Setup: Add a workout exercise (will need to mock localStorage)
    await page.addInitScript(() => {
      const mockWorkout = {
        exercises: [{
          id: 'bench_press',
          name: 'Bench Press',
          category: 'ChestTriceps',
          equipment: 'Barbell',
          difficulty: 'Intermediate'
        }]
      };
      localStorage.setItem('fitforge-workout-session', JSON.stringify(mockWorkout));
    });
    
    await page.reload();
    
    // Complete a set
    await page.fill('input[placeholder="135"]', '135'); // weight
    await page.fill('input[placeholder="10"]', '10');   // reps
    await page.click('button:has-text("Add Set")');
    
    // Should show RPE rating modal
    await expect(page.locator('[data-testid="rpe-modal"]')).toBeVisible();
    await expect(page.locator('text=How difficult was 10 reps × 135 lbs?')).toBeVisible();
    await expect(page.locator('[data-testid="rpe-scale"]')).toBeVisible();
  });

  test('should provide "Log All Sets" quick action for consistent sets', async ({ page }) => {
    // Setup workout with planned sets
    await page.addInitScript(() => {
      const mockWorkout = {
        exercises: [{
          id: 'bench_press',
          name: 'Bench Press',
          category: 'ChestTriceps',
          equipment: 'Barbell',
          difficulty: 'Intermediate'
        }]
      };
      const mockPlan = {
        plannedSets: [
          { exerciseId: 'bench_press', setNumber: 1, targetWeight: 135, targetReps: 10 },
          { exerciseId: 'bench_press', setNumber: 2, targetWeight: 135, targetReps: 10 },
          { exerciseId: 'bench_press', setNumber: 3, targetWeight: 135, targetReps: 10 }
        ]
      };
      localStorage.setItem('fitforge-workout-session', JSON.stringify(mockWorkout));
      localStorage.setItem('workout-plan', JSON.stringify(mockPlan));
    });
    
    await page.reload();
    
    // Wait for the form to load
    await page.waitForSelector('input[placeholder="135"]', { timeout: 5000 });
    
    // Fill in weight and reps to enable "Log All Sets" button
    await page.fill('input[placeholder="135"]', '135');
    await page.fill('input[placeholder="10"]', '10');
    
    // Now the "Log All Sets" button should be visible for consistent planned sets
    await expect(page.locator('button:has-text("Log All Sets")')).toBeVisible();
    
    // Click to log all sets at once
    await page.click('button:has-text("Log All Sets")');
    
    // Should show batch RPE modal
    await expect(page.locator('[data-testid="batch-rpe-modal"]')).toBeVisible();
    await expect(page.locator('text=Rate difficulty for all 3 sets')).toBeVisible();
  });

  test('should allow exercise replacement mid-workout', async ({ page }) => {
    // This test will fail initially - feature not implemented
    
    // Setup workout
    await page.addInitScript(() => {
      const mockWorkout = {
        exercises: [{
          id: 'bench_press',
          name: 'Bench Press',
          category: 'ChestTriceps',
          equipment: 'Barbell',
          difficulty: 'Intermediate'
        }]
      };
      localStorage.setItem('fitforge-workout-session', JSON.stringify(mockWorkout));
    });
    
    await page.reload();
    
    // Should show replace exercise option
    await page.click('[data-testid="exercise-menu"]');
    await expect(page.locator('button:has-text("Replace Exercise")')).toBeVisible();
    
    // Click to replace exercise
    await page.click('button:has-text("Replace Exercise")');
    
    // Should show exercise replacement modal
    await expect(page.locator('[data-testid="replace-exercise-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="exercise-search"]')).toBeVisible();
    
    // Should filter by same category by default
    await expect(page.locator('text=ChestTriceps exercises')).toBeVisible();
  });

  test('should distinguish between warm-up and working sets', async ({ page }) => {
    // Setup workout
    await page.addInitScript(() => {
      const mockWorkout = {
        exercises: [{
          id: 'bench_press',
          name: 'Bench Press',
          category: 'ChestTriceps',
          equipment: 'Barbell',
          difficulty: 'Intermediate'
        }]
      };
      localStorage.setItem('fitforge-workout-session', JSON.stringify(mockWorkout));
    });
    
    await page.reload();
    
    // Should show warm-up set toggle
    await expect(page.locator('[data-testid="warmup-toggle"]')).toBeVisible();
    await expect(page.locator('text=Warm-up Set')).toBeVisible();
    
    // Toggle warm-up mode
    await page.click('[data-testid="warmup-toggle"]');
    
    // Add a warm-up set
    await page.fill('input[placeholder="135"]', '95');  // lighter weight
    await page.fill('input[placeholder="10"]', '12');   // more reps
    await page.click('button:has-text("Add Set")');
    
    // Complete RPE rating (required for set to be saved)
    await expect(page.locator('[data-testid="rpe-modal"]')).toBeVisible();
    await page.click('[data-testid="rpe-rating-3"]'); // Light effort for warm-up
    await page.click('button:has-text("Continue")');
    
    // Now should show warm-up indicator in set list
    await expect(page.locator('[data-testid="set-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="set-list"]')).toContainText('Warm-up');
    await expect(page.locator('[data-testid="warmup-badge"]')).toBeVisible();
  });

  test('should support exercise and set notes', async ({ page }) => {
    // Setup workout
    await page.addInitScript(() => {
      const mockWorkout = {
        exercises: [{
          id: 'bench_press',
          name: 'Bench Press',
          category: 'ChestTriceps',
          equipment: 'Barbell',
          difficulty: 'Intermediate'
        }]
      };
      localStorage.setItem('fitforge-workout-session', JSON.stringify(mockWorkout));
    });
    
    await page.reload();
    
    // Should show notes input option
    await expect(page.locator('[data-testid="set-notes-input"]')).toBeVisible();
    
    // Add a note to a set
    await page.fill('[data-testid="set-notes-input"]', 'Felt strong today');
    await page.fill('input[placeholder="135"]', '135');
    await page.fill('input[placeholder="10"]', '10');
    await page.click('button:has-text("Add Set")');
    
    // Complete RPE rating (required for set to be saved)
    await expect(page.locator('[data-testid="rpe-modal"]')).toBeVisible();
    await page.click('[data-testid="rpe-rating-5"]'); // Medium effort
    await page.click('button:has-text("Continue")');
    
    // Note should appear in completed set
    await expect(page.locator('[data-testid="set-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="set-list"]')).toContainText('Felt strong today');
    
    // Should have exercise notes section
    await expect(page.locator('[data-testid="exercise-notes"]')).toBeVisible();
    await page.fill('[data-testid="exercise-notes"]', 'Focus on form, control the weight');
  });

  test('should display real-time muscle fatigue visualization', async ({ page }) => {
    // Setup workout with multiple exercises
    await page.addInitScript(() => {
      const mockWorkout = {
        exercises: [
          {
            id: 'bench_press',
            name: 'Bench Press',
            category: 'ChestTriceps',
            equipment: 'Barbell',
            difficulty: 'Intermediate'
          },
          {
            id: 'bicep_curl',
            name: 'Bicep Curl',
            category: 'BackBiceps',
            equipment: 'Dumbbell',
            difficulty: 'Beginner'
          }
        ]
      };
      localStorage.setItem('fitforge-workout-session', JSON.stringify(mockWorkout));
    });
    
    await page.reload();
    
    // Should show muscle fatigue visualization
    await expect(page.locator('[data-testid="muscle-fatigue-display"]')).toBeVisible();
    
    // Complete a set to trigger muscle volume update
    await page.fill('input[placeholder="135"]', '135');
    await page.fill('input[placeholder="10"]', '10');
    await page.click('button:has-text("Add Set")');
    
    // Complete RPE rating to finalize the set
    await expect(page.locator('[data-testid="rpe-modal"]')).toBeVisible();
    await page.click('[data-testid="rpe-rating-5"]'); // Medium effort
    await page.click('button:has-text("Continue")');
    
    // Muscle visualization should be present (specific intensity depends on muscle engagement data)
    await expect(page.locator('[data-testid="muscle-fatigue-display"]')).toBeVisible();
    
    // Check that muscle indicators exist (exact intensity depends on exercise data)
    const muscleIndicators = page.locator('[data-testid*="-muscle-indicator"]');
    await expect(muscleIndicators.first()).toBeVisible();
  });

  test('should integrate with existing rest timer functionality', async ({ page }) => {
    // Setup workout
    await page.addInitScript(() => {
      const mockWorkout = {
        exercises: [{
          id: 'bench_press',
          name: 'Bench Press',
          category: 'ChestTriceps',
          equipment: 'Barbell',
          difficulty: 'Intermediate'
        }]
      };
      localStorage.setItem('fitforge-workout-session', JSON.stringify(mockWorkout));
    });
    
    await page.reload();
    
    // Wait for page to load properly
    await expect(page.locator('h1')).toContainText('Experimental Workout Execution');
    
    // Wait for the form to be rendered
    await page.waitForSelector('input[placeholder="135"]', { timeout: 5000 });
    
    // Complete a set
    await page.fill('input[placeholder="135"]', '135');
    await page.fill('input[placeholder="10"]', '10');
    await page.click('button:has-text("Add Set")');
    
    // Complete RPE rating
    await expect(page.locator('[data-testid="rpe-modal"]')).toBeVisible();
    await page.click('[data-testid="rpe-rating-5"]');
    await page.click('button:has-text("Continue")');
    
    // Rest timer should appear after completing the set
    await expect(page.locator('text=Rest Timer')).toBeVisible();
  });

  test('should save all experimental data to localStorage', async ({ page }) => {
    // Setup and complete a full workout with all new features
    await page.addInitScript(() => {
      const mockWorkout = {
        exercises: [{
          id: 'bench_press',
          name: 'Bench Press',
          category: 'ChestTriceps',
          equipment: 'Barbell',
          difficulty: 'Intermediate'
        }]
      };
      localStorage.setItem('fitforge-workout-session', JSON.stringify(mockWorkout));
    });
    
    await page.reload();
    
    // Wait for component to load
    await expect(page.locator('h1')).toContainText('Experimental Workout Execution');
    
    // Wait for form elements to be rendered
    await page.waitForSelector('[data-testid="exercise-notes"]', { timeout: 5000 });
    
    // Add exercise notes
    await page.fill('[data-testid="exercise-notes"]', 'Focus on form');
    
    // Add a set with all new data fields
    await page.click('[data-testid="warmup-toggle"]'); // Mark as warm-up
    await page.fill('[data-testid="set-notes-input"]', 'Good form');
    await page.fill('input[placeholder="135"]', '95');
    await page.fill('input[placeholder="10"]', '12');
    await page.click('button:has-text("Add Set")');
    
    // Complete RPE rating
    await expect(page.locator('[data-testid="rpe-modal"]')).toBeVisible();
    await page.click('[data-testid="rpe-rating-3"]'); // Light effort for warm-up
    await page.click('button:has-text("Continue")');
    
    // Wait for set to be completed and appear in list
    await expect(page.locator('[data-testid="set-list"]')).toBeVisible();
    
    // Finish the workout to trigger save
    await page.click('button:has-text("Finish")');
    
    // Wait a moment for save to complete
    await page.waitForTimeout(1000);
    
    // Check that enhanced data was saved to localStorage
    const savedData = await page.evaluate(() => {
      const sessions = localStorage.getItem('workoutSessions');
      return sessions ? JSON.parse(sessions) : null;
    });
    
    // Should include the experimental data
    expect(savedData).toBeTruthy();
    expect(savedData.length).toBeGreaterThan(0);
    
    // Check the latest session has our experimental features
    const latestSession = savedData[savedData.length - 1];
    expect(latestSession.sets).toBeTruthy();
    expect(latestSession.sets[0].rpe).toBe(3);
    expect(latestSession.sets[0].isWarmup).toBe(true);
    expect(latestSession.sets[0].notes).toBe('Good form');
    expect(latestSession.exerciseNotes).toBeTruthy();
    expect(latestSession.exerciseNotes['bench_press']).toBe('Focus on form');
  });
});