import { test, expect } from '@playwright/test';

test.describe('Debug Pull Day Exercise Selection', () => {
  test('check what exercises are actually being selected', async ({ page }) => {
    console.log('🔍 Debugging Pull Day exercise selection');
    
    await page.goto('http://localhost:8080');
    await page.click('text=Start Workout');
    await page.click('text=Start Pull Day');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check the available exercises in each column
    console.log('🔧 Checking available exercises in Pull A column');
    const pullAExercises = await page.locator('.grid .space-y-2').first().locator('span.text-sm').allTextContents();
    console.log('🔧 Pull A exercises:', pullAExercises);
    
    console.log('🔧 Checking available exercises in Pull B column');
    const pullBExercises = await page.locator('.grid .space-y-2').nth(1).locator('span.text-sm').allTextContents();
    console.log('🔧 Pull B exercises:', pullBExercises);
    
    // Look for the + buttons and see what exercises they correspond to
    const addButtons = page.locator('button').filter({ has: page.locator('svg') });
    const buttonCount = await addButtons.count();
    console.log('🔧 Found add buttons:', buttonCount);
    
    // Click the first few add buttons and see what gets added
    for (let i = 0; i < Math.min(3, buttonCount); i++) {
      // Find the exercise name near this button
      const button = addButtons.nth(i);
      const parentDiv = button.locator('xpath=..');
      const exerciseName = await parentDiv.locator('span.text-sm').textContent();
      
      console.log(`🔧 Button ${i + 1} corresponds to exercise:`, exerciseName);
      
      // Click the button
      await button.click();
      await page.waitForTimeout(500);
      
      // Check localStorage after clicking
      const workoutData = await page.evaluate(() => {
        return localStorage.getItem('fitforge-workout-session') || 'null';
      });
      
      if (workoutData !== 'null') {
        const sessionData = JSON.parse(workoutData);
        console.log(`🔧 After clicking button ${i + 1}, workout session:`, sessionData);
      }
    }
    
    // Check what's in the "Your Workout" section
    const workoutSection = await page.locator('text=Your Workout').locator('xpath=../..').textContent();
    console.log('🔧 Your Workout section content:', workoutSection);
    
    // Check the actual localStorage data before starting workout
    const finalWorkoutData = await page.evaluate(() => {
      return localStorage.getItem('fitforge-workout-session') || 'null';
    });
    
    if (finalWorkoutData !== 'null') {
      const finalSession = JSON.parse(finalWorkoutData);
      console.log('🔧 Final workout session data:', finalSession);
      
      // Log each exercise in detail
      finalSession.exercises.forEach((ex, i) => {
        console.log(`🔧 Exercise ${i + 1}:`, {
          id: ex.id,
          name: ex.name,
          category: ex.category,
          equipment: ex.equipment,
          plannedSets: ex.plannedSets.length
        });
      });
    }
    
    // Now click Start Workout and see what happens
    await page.click('text=Start Workout');
    await page.waitForTimeout(2000);
    
    // Check localStorage after clicking Start Workout
    const postStartData = await page.evaluate(() => {
      return localStorage.getItem('fitforge-workout-session') || 'null';
    });
    
    if (postStartData !== 'null') {
      const postStartSession = JSON.parse(postStartData);
      console.log('🔧 Workout session AFTER clicking Start Workout:', postStartSession);
    }
  });
});