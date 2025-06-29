#!/usr/bin/env node

/**
 * Test script to verify the workout execution flow
 * This helps debug the failing tests by checking the actual behavior
 */

const puppeteer = require('puppeteer');

async function testWorkoutFlow() {
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 100,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Setup localStorage with workout data
    await page.evaluateOnNewDocument(() => {
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
    
    await page.goto('http://localhost:8080/flows-experimental/workout-execution');
    
    console.log('1. Page loaded, checking for form elements...');
    
    // Wait for form
    await page.waitForSelector('input[placeholder="135"]', { timeout: 5000 });
    console.log('✓ Form is visible');
    
    // Fill in set data
    await page.type('input[placeholder="135"]', '135');
    await page.type('input[placeholder="10"]', '10');
    console.log('✓ Filled in weight and reps');
    
    // Click Add Set
    await page.click('button:has-text("Add Set")');
    console.log('✓ Clicked Add Set');
    
    // Wait for RPE modal
    await page.waitForSelector('[data-testid="rpe-modal"]', { timeout: 5000 });
    console.log('✓ RPE modal appeared');
    
    // Click RPE rating
    await page.click('[data-testid="rpe-rating-5"]');
    await page.click('button:has-text("Continue")');
    console.log('✓ Completed RPE rating');
    
    // Check for rest timer
    await page.waitForSelector(':has-text("Rest Timer")', { timeout: 5000 });
    console.log('✓ Rest timer appeared!');
    
    // Check localStorage
    const storageData = await page.evaluate(() => {
      const sessions = localStorage.getItem('workoutSessions');
      return sessions ? JSON.parse(sessions) : null;
    });
    
    console.log('\n2. Checking localStorage data:');
    if (storageData && storageData.length > 0) {
      const latestSession = storageData[storageData.length - 1];
      console.log('✓ Session saved with', latestSession.sets.length, 'sets');
      console.log('✓ Set data includes RPE:', latestSession.sets[0].rpe);
    } else {
      console.log('✗ No session data found in localStorage');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testWorkoutFlow();