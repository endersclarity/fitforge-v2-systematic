#!/usr/bin/env node

/**
 * Detailed functionality tests based on investigation findings
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:8080';

function exec(command) {
  return execSync(command, { encoding: 'utf8' }).trim();
}

console.log('🧪 DETAILED FUNCTIONALITY TESTS\n');

// Test localStorage functionality with Puppeteer
async function testLocalStorage() {
  console.log('📦 Testing localStorage functionality...');
  
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    // Test saved workouts localStorage
    await page.goto(`${BASE_URL}/flows-experimental/saved-workouts`);
    
    // Check if we can access localStorage
    const templates = await page.evaluate(() => {
      return localStorage.getItem('fitforge_workout_templates');
    });
    
    console.log('✅ localStorage accessible:', templates !== null ? 'Yes' : 'No (empty)');
    
    // Test workout session storage
    await page.goto(`${BASE_URL}/flows-experimental/workout-execution`);
    const sessionData = await page.evaluate(() => {
      return localStorage.getItem('currentWorkoutSession');
    });
    
    console.log('✅ Session storage check:', sessionData !== null ? 'Has data' : 'Empty');
    
  } catch (error) {
    console.log('❌ localStorage test error:', error.message);
  }
  
  await browser.close();
}

// Test actual exercise filtering with Puppeteer
async function testExerciseFiltering() {
  console.log('\n🔍 Testing exercise filtering with browser automation...');
  
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    // Go to exercise browser
    await page.goto(`${BASE_URL}/flows-experimental/exercise-browser`);
    await page.waitForSelector('h3', { timeout: 5000 });
    
    // Count initial exercises
    const initialCount = await page.$$eval('h3.font-semibold', els => els.length);
    console.log(`Initial exercise count: ${initialCount}`);
    
    // Look for filter buttons
    const filterButtons = await page.$$eval('button', buttons => 
      buttons.map(b => b.textContent).filter(text => text.includes('Equipment') || text.includes('Filter'))
    );
    console.log('Filter buttons found:', filterButtons);
    
    // Try to click equipment filter
    const equipmentFilter = await page.$('button:has-text("Equipment")');
    if (equipmentFilter) {
      await equipmentFilter.click();
      await page.waitForTimeout(500);
      
      // Look for Dumbbell option
      const dumbbellOption = await page.$('text=Dumbbell');
      if (dumbbellOption) {
        await dumbbellOption.click();
        await page.waitForTimeout(1000);
        
        // Count filtered exercises
        const filteredCount = await page.$$eval('h3.font-semibold', els => els.length);
        console.log(`Filtered exercise count: ${filteredCount}`);
        console.log(`✅ Filter working: ${filteredCount < initialCount ? 'Yes' : 'No'}`);
      } else {
        console.log('❌ Dumbbell option not found');
      }
    } else {
      console.log('❌ Equipment filter button not found');
    }
    
  } catch (error) {
    console.log('❌ Exercise filter test error:', error.message);
  }
  
  await browser.close();
}

// Test workout builder functionality
async function testWorkoutBuilder() {
  console.log('\n🏋️ Testing workout builder...');
  
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    await page.goto(`${BASE_URL}/flows-experimental/workout-builder`);
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Check for key elements
    const hasAddButton = await page.$('button:has-text("Add Exercise")') !== null;
    const hasSaveButton = await page.$('button:has-text("Save")') !== null;
    const hasWorkoutName = await page.$('input[placeholder*="workout"]') !== null;
    
    console.log('✅ Add Exercise button:', hasAddButton ? 'Found' : 'Missing');
    console.log('✅ Save button:', hasSaveButton ? 'Found' : 'Missing');
    console.log('✅ Workout name input:', hasWorkoutName ? 'Found' : 'Missing');
    
  } catch (error) {
    console.log('❌ Workout builder test error:', error.message);
  }
  
  await browser.close();
}

// Test recovery dashboard heat map
async function testRecoveryDashboard() {
  console.log('\n🔥 Testing recovery dashboard...');
  
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    await page.goto(`${BASE_URL}/flows-experimental/recovery`);
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Look for SVG muscle paths
    const musclePaths = await page.$$eval('path[data-muscle]', paths => 
      paths.map(p => p.getAttribute('data-muscle'))
    );
    
    console.log(`✅ Muscle paths found: ${musclePaths.length}`);
    if (musclePaths.length > 0) {
      console.log('Sample muscles:', musclePaths.slice(0, 5));
    }
    
    // Check for recovery data
    const recoveryText = await page.$eval('body', el => el.textContent);
    const hasRecoveryInfo = recoveryText.includes('recovery') || recoveryText.includes('fatigue');
    console.log('✅ Recovery information:', hasRecoveryInfo ? 'Present' : 'Missing');
    
  } catch (error) {
    console.log('❌ Recovery dashboard test error:', error.message);
  }
  
  await browser.close();
}

// Test data integrity across pages
async function testDataConsistency() {
  console.log('\n📊 Testing data consistency...');
  
  // Check exercise data structure
  const exerciseData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'exercises-real.json')));
  
  // Verify muscle engagement totals
  let invalidExercises = 0;
  exerciseData.forEach(exercise => {
    if (exercise.muscleEngagement) {
      const total = Object.values(exercise.muscleEngagement).reduce((sum, val) => sum + val, 0);
      if (Math.abs(total - 100) > 0.1) {
        invalidExercises++;
        console.log(`❌ ${exercise.name}: muscle engagement totals ${total}%`);
      }
    }
  });
  
  console.log(`✅ Valid muscle engagement totals: ${exerciseData.length - invalidExercises}/${exerciseData.length}`);
  
  // Check equipment types
  const equipmentTypes = new Set();
  exerciseData.forEach(ex => equipmentTypes.add(ex.equipment));
  console.log('✅ Equipment types found:', Array.from(equipmentTypes));
  
  // Check categories
  const categories = new Set();
  exerciseData.forEach(ex => categories.add(ex.category));
  console.log('✅ Exercise categories:', Array.from(categories));
}

// Run all tests
async function runAllTests() {
  await testLocalStorage();
  await testExerciseFiltering();
  await testWorkoutBuilder();
  await testRecoveryDashboard();
  await testDataConsistency();
  
  console.log('\n✅ DETAILED TESTS COMPLETE');
}

runAllTests().catch(console.error);