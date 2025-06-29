import { test, expect } from '@playwright/test'

test.describe('Issue #28: Experimental Recovery Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test workout data before each test
    await page.goto('http://localhost:8080')
    
    await page.evaluate(() => {
      const testSessions = [{
        id: 'test-1',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        exercises: [
          {
            id: 'bench_press',
            name: 'Bench Press',
            sets: [
              { weight: 135, reps: 10, completed: true, rpe: 7 },
              { weight: 155, reps: 8, completed: true, rpe: 8 },
              { weight: 175, reps: 6, completed: true, rpe: 9 }
            ]
          },
          {
            id: 'bicep_curl',
            name: 'Bicep Curl',
            sets: [
              { weight: 30, reps: 12, completed: true, rpe: 6 },
              { weight: 35, reps: 10, completed: true, rpe: 7 },
              { weight: 35, reps: 8, completed: true, rpe: 8 }
            ]
          }
        ]
      }, {
        id: 'test-2',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        exercises: [
          {
            id: 'squat',
            name: 'Squat',
            sets: [
              { weight: 225, reps: 8, completed: true, rpe: 8 },
              { weight: 245, reps: 6, completed: true, rpe: 9 }
            ]
          }
        ]
      }];
      
      localStorage.setItem('workoutSessions', JSON.stringify(testSessions));
    });
  });

  test('should navigate to recovery dashboard', async ({ page }) => {
    await page.goto('http://localhost:8080/flows-experimental/recovery')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Recovery Dashboard')
    await expect(page.locator('p').first()).toContainText('Muscle recovery tracking and fatigue management')
  })

  test('should display days since last workout', async ({ page }) => {
    await page.goto('http://localhost:8080/flows-experimental/recovery')
    
    // Wait for data to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Check for days since workout card
    const daysSinceCard = page.locator('text=DAYS SINCE YOUR LAST WORKOUT')
    await expect(daysSinceCard).toBeVisible()
    
    // Should show "2" days since we set the last workout 2 days ago
    const daysNumber = page.locator('.text-6xl.font-bold')
    await expect(daysNumber).toContainText('2')
  })

  test('should display muscle recovery statistics', async ({ page }) => {
    await page.goto('http://localhost:8080/flows-experimental/recovery')
    
    // Wait for data to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Check for recovery stats cards
    await expect(page.locator('text=Fresh Muscles')).toBeVisible()
    await expect(page.locator('text=Recovering')).toBeVisible()
    await expect(page.locator('text=Fatigued')).toBeVisible()
    
    // Check that we have some muscle data
    const freshCount = page.locator('text=ready to train').first()
    await expect(freshCount).toBeVisible()
  })

  test('should show muscle recovery list', async ({ page }) => {
    await page.goto('http://localhost:8080/flows-experimental/recovery')
    
    // Wait for data to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Check for muscle recovery status section
    await expect(page.locator('text=Muscle Recovery Status')).toBeVisible()
    await expect(page.locator('text=Detailed recovery percentages by muscle group')).toBeVisible()
    
    // Check for progress bars (muscle recovery indicators)
    const progressBars = page.locator('[role="progressbar"]')
    const muscleNames = page.locator('.font-medium').filter({ hasText: /Chest|Biceps|Triceps/ })
    
    // Either we should have progress bars or muscle names visible
    await expect(progressBars.or(muscleNames).first()).toBeVisible()
  })

  test('should show training recommendations', async ({ page }) => {
    await page.goto('http://localhost:8080/flows-experimental/recovery')
    
    // Wait for data to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Check for recommendations section
    await expect(page.locator('text=Training Recommendations')).toBeVisible()
    
    // Should have at least one recommendation
    const recommendationHeaders = page.locator('h4').filter({ hasText: /Ready to Train|Rest Recommended/ })
    await expect(recommendationHeaders.first()).toBeVisible()
  })

  test('should have edit mode toggle', async ({ page }) => {
    await page.goto('http://localhost:8080/flows-experimental/recovery')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check for edit button
    const editButton = page.locator('button:has-text("Edit")')
    await expect(editButton).toBeVisible()
    
    // Click edit button
    await editButton.click()
    
    // Button should change to "Done"
    await expect(page.locator('button:has-text("Done")')).toBeVisible()
  })

  test('should handle empty workout data gracefully', async ({ page }) => {
    // Clear localStorage
    await page.evaluate(() => localStorage.clear())
    
    await page.goto('http://localhost:8080/flows-experimental/recovery')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Should not show loading forever
    await expect(page.locator('text=Loading recovery data')).not.toBeVisible()
    
    // Should show some content (even if empty)
    await expect(page.locator('h1:has-text("Recovery Dashboard")')).toBeVisible()
  })
})