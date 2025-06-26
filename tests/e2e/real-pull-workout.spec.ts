import { test, expect } from '@playwright/test';

test.describe('Real Pull Workout Test', () => {
  test('simulate real user doing pull workout with bodyweight exercises', async ({ page }) => {
    console.log('🔥 Testing REAL pull workout flow');
    
    // Listen for console logs and alerts
    page.on('console', (msg) => {
      console.log(`🖥️ Browser Console [${msg.type()}]:`, msg.text());
    });
    
    page.on('dialog', async dialog => {
      console.log(`🚨 ALERT DETECTED: ${dialog.message()}`);
      await dialog.accept();
    });
    
    // Clear localStorage first
    await page.goto('http://localhost:8080');
    await page.evaluate(() => localStorage.clear());
    
    // Navigate to Pull Day
    await page.click('text=Start Workout');
    await page.click('text=Start Pull Day');
    await page.waitForTimeout(2000);
    
    // Find and add a specific bodyweight exercise (like Pull-ups)
    console.log('🔧 Looking for Pull-ups exercise');
    
    // Look for "Neutral Grip Pull-ups" specifically
    const pullupRows = page.locator('text=Neutral Grip Pull-ups').locator('xpath=..');
    if (await pullupRows.count() > 0) {
      const addButton = pullupRows.locator('button').filter({ has: page.locator('svg') });
      if (await addButton.count() > 0) {
        console.log('🔧 Found Neutral Grip Pull-ups, clicking add button');
        await addButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Also try Wide Grip Pullups
    const wideGripRows = page.locator('text=Wide Grip Pullups').locator('xpath=..');
    if (await wideGripRows.count() > 0) {
      const addButton = wideGripRows.locator('button').filter({ has: page.locator('svg') });
      if (await addButton.count() > 0) {
        console.log('🔧 Found Wide Grip Pullups, clicking add button');
        await addButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Check what was actually added
    const workoutSection = await page.locator('text=Your Workout').count();
    console.log('🔧 Your Workout section exists:', workoutSection > 0);
    
    if (workoutSection > 0) {
      const workoutContent = await page.locator('text=Your Workout').locator('xpath=../..').textContent();
      console.log('🔧 Workout content:', workoutContent?.substring(0, 200));
    }
    
    // Check localStorage before starting
    const preStartSession = await page.evaluate(() => {
      return localStorage.getItem('fitforge-workout-session');
    });
    console.log('🔧 Session before start:', preStartSession ? 'exists' : 'null');
    
    // Find the correct Start Workout button (should be in the "Your Workout" section)
    console.log('🔧 Looking for Start Workout button');
    const startButtons = page.locator('text=Start Workout');
    const buttonCount = await startButtons.count();
    console.log('🔧 Found Start Workout buttons:', buttonCount);
    
    // Click the Start Workout button that's inside the workout builder section
    const workoutBuilderSection = page.locator('text=Your Workout').locator('xpath=../..');
    const startButtonInBuilder = workoutBuilderSection.locator('text=Start Workout');
    
    if (await startButtonInBuilder.count() > 0) {
      console.log('🔧 Clicking Start Workout button in workout builder');
      await startButtonInBuilder.click();
    } else {
      console.log('🔧 No Start Workout in builder, clicking last button');
      await startButtons.last().click();
    }
    
    await page.waitForTimeout(2000);
    
    // Check we're on execution page
    const url = page.url();
    console.log('🔧 Current URL:', url);
    
    if (url.includes('workout-execution')) {
      // Check the workout session data
      const sessionData = await page.evaluate(() => {
        const session = localStorage.getItem('fitforge-workout-session');
        return session ? JSON.parse(session) : null;
      });
      
      console.log('🔧 Execution page session data:', sessionData);
      
      if (sessionData && sessionData.exercises) {
        sessionData.exercises.forEach((exercise, i) => {
          console.log(`🔧 Exercise ${i + 1}:`, {
            name: exercise.name,
            category: exercise.category,
            equipment: exercise.equipment,
            workoutType: sessionData.workoutType,
            sets: exercise.plannedSets.length
          });
        });
      }
      
      // Check page headings to see what workout type is displayed
      const headings = await page.locator('h1, h2').allTextContents();
      console.log('🔧 Execution page headings:', headings);
      
      // Look for Mark Complete buttons
      const markCompleteButtons = page.locator('text=Mark Complete');
      const buttonCount = await markCompleteButtons.count();
      console.log('🔧 Mark Complete buttons found:', buttonCount);
      
      // Complete one set and finish workout
      if (buttonCount > 0) {
        await markCompleteButtons.first().click();
        await page.waitForTimeout(1000);
        
        // Finish workout
        await page.click('text=Finish Workout');
        await page.waitForTimeout(2000);
        
        // Check the saved workout history
        const workoutHistory = await page.evaluate(() => {
          const history = localStorage.getItem('fitforge-workout-history');
          return history ? JSON.parse(history) : [];
        });
        
        console.log('🔧 Final workout history:', workoutHistory);
        
        if (workoutHistory.length > 0) {
          const lastWorkout = workoutHistory[workoutHistory.length - 1];
          console.log('🔧 Last workout details:', {
            type: lastWorkout.type,
            exerciseCount: lastWorkout.exercises.length,
            exercises: lastWorkout.exercises.map(ex => ({
              name: ex.name,
              equipment: ex.equipment,
              totalWeight: ex.totalWeight,
              totalReps: ex.totalReps,
              completedSets: ex.completedSets
            }))
          });
        }
      }
    }
  });
});