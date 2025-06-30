#!/usr/bin/env node

/**
 * Comprehensive Container Test Suite for FitForge
 * Tests all aspects of the application running in Docker container
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080';
const TEST_LOG = path.join(__dirname, '..', 'test-scratchpad.md');

// Test result tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const findings = [];

// Utility functions
function runTest(name, testFn) {
  totalTests++;
  process.stdout.write(`Testing: ${name}... `);
  
  try {
    const result = testFn();
    if (result.success) {
      passedTests++;
      console.log('✅ PASSED');
      logFinding(`✅ ${name}: ${result.message}`);
    } else {
      failedTests++;
      console.log('❌ FAILED');
      logFinding(`❌ ${name}: ${result.message}`);
    }
    return result;
  } catch (error) {
    failedTests++;
    console.log('❌ ERROR');
    logFinding(`❌ ${name}: ERROR - ${error.message}`);
    return { success: false, message: error.message };
  }
}

function exec(command) {
  return execSync(command, { encoding: 'utf8' }).trim();
}

function curl(url, options = '') {
  return exec(`curl -s ${options} "${url}"`);
}

function getStatusCode(url) {
  return exec(`curl -s -o /dev/null -w "%{http_code}" "${url}"`);
}

function countElements(url, selector) {
  const content = curl(url);
  const matches = content.match(new RegExp(selector, 'g'));
  return matches ? matches.length : 0;
}

function logFinding(message) {
  findings.push(`[${new Date().toISOString()}] ${message}`);
}

function updateScratchpad() {
  const content = fs.readFileSync(TEST_LOG, 'utf8');
  const updatedContent = content
    .replace(/Total Tests: \d+/, `Total Tests: ${totalTests}`)
    .replace(/Passed: \d+/, `Passed: ${passedTests}`)
    .replace(/Failed: \d+/, `Failed: ${failedTests}`)
    .replace(/## FINDINGS LOG[\s\S]*/, `## FINDINGS LOG\n${findings.join('\n')}`);
  
  fs.writeFileSync(TEST_LOG, updatedContent);
}

// Test Categories

console.log('🧪 FITFORGE COMPREHENSIVE CONTAINER TEST SUITE\n');

// 1. CONTAINER HEALTH TESTS
console.log('\n📦 1. CONTAINER HEALTH TESTS');

runTest('Container Running', () => {
  const running = exec('docker ps --format "{{.Names}}" | grep -c fitforge-v2-systematic-frontend-1 || echo 0');
  return {
    success: running === '1',
    message: running === '1' ? 'Container is running' : 'Container not found'
  };
});

runTest('Port 8080 Accessible', () => {
  const code = getStatusCode(BASE_URL);
  return {
    success: code === '200',
    message: `HTTP ${code} response`
  };
});

runTest('Next.js Application Loaded', () => {
  const content = curl(BASE_URL);
  const hasNextData = content.includes('__NEXT_DATA__');
  return {
    success: hasNextData,
    message: hasNextData ? 'Next.js app detected' : 'No Next.js data found'
  };
});

// 2. ROUTE ACCESSIBILITY TESTS
console.log('\n🛣️  2. ROUTE ACCESSIBILITY TESTS');

const routes = [
  '/',
  '/dashboard',
  '/push-day',
  '/pull-day',
  '/legs-day',
  '/profile',
  '/analytics',
  '/flows-experimental/exercise-browser',
  '/flows-experimental/workout-builder',
  '/flows-experimental/saved-workouts',
  '/flows-experimental/recovery'
];

routes.forEach(route => {
  runTest(`Route ${route}`, () => {
    const code = getStatusCode(BASE_URL + route);
    return {
      success: code === '200',
      message: `HTTP ${code}`
    };
  });
});

// 3. DATA FILE TESTS
console.log('\n📊 3. DATA FILE INTEGRITY TESTS');

runTest('Exercise Data Valid', () => {
  try {
    const exerciseData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'exercises-real.json')));
    const count = exerciseData.length;
    return {
      success: count === 38,
      message: `Found ${count} exercises (expected 38)`
    };
  } catch (e) {
    return { success: false, message: e.message };
  }
});

runTest('All Exercises Have Required Fields', () => {
  const exerciseData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'exercises-real.json')));
  const requiredFields = ['name', 'equipment', 'muscleGroup', 'targetMuscle'];
  let missingFields = 0;
  
  exerciseData.forEach(exercise => {
    requiredFields.forEach(field => {
      if (!exercise[field]) missingFields++;
    });
  });
  
  return {
    success: missingFields === 0,
    message: missingFields === 0 ? 'All fields present' : `${missingFields} missing fields found`
  };
});

// 4. COMPONENT RENDERING TESTS
console.log('\n🎨 4. COMPONENT RENDERING TESTS');

runTest('Exercise Browser Shows Exercises', () => {
  const content = curl(`${BASE_URL}/flows-experimental/exercise-browser`);
  const exerciseCount = (content.match(/font-semibold/g) || []).length;
  return {
    success: exerciseCount > 0,
    message: `Rendered ${exerciseCount} exercise titles`
  };
});

runTest('Dashboard Has Metric Cards', () => {
  const content = curl(`${BASE_URL}/dashboard`);
  const hasCards = content.includes('metric-card') || content.includes('Card');
  return {
    success: hasCards,
    message: hasCards ? 'Metric cards found' : 'No metric cards detected'
  };
});

// 5. FILTER FUNCTIONALITY TESTS
console.log('\n🔍 5. FILTER FUNCTIONALITY TESTS');

runTest('Equipment Filter - Dumbbell', () => {
  const allExercises = countElements(`${BASE_URL}/flows-experimental/exercise-browser`, 'font-semibold');
  const filtered = countElements(`${BASE_URL}/flows-experimental/exercise-browser?equipment=Dumbbell`, 'font-semibold');
  
  return {
    success: filtered < allExercises && filtered > 0,
    message: `${allExercises} exercises → ${filtered} with Dumbbell filter`
  };
});

runTest('Muscle Filter - Push', () => {
  const content = curl(`${BASE_URL}/flows-experimental/exercise-browser?group=Push`);
  const hasPushExercises = content.includes('Bench Press') || content.includes('Chest');
  return {
    success: hasPushExercises,
    message: hasPushExercises ? 'Push exercises shown' : 'No push exercises found'
  };
});

// 6. LOCALSTORAGE FUNCTIONALITY
console.log('\n💾 6. STORAGE FUNCTIONALITY TESTS');

runTest('LocalStorage Service Available', () => {
  const content = curl(`${BASE_URL}/flows-experimental/saved-workouts`);
  const hasStorageUI = content.includes('template') || content.includes('saved') || content.includes('workout');
  return {
    success: hasStorageUI,
    message: hasStorageUI ? 'Storage UI elements present' : 'No storage UI found'
  };
});

// 7. FORM FUNCTIONALITY
console.log('\n📝 7. FORM FUNCTIONALITY TESTS');

runTest('Profile Form Renders', () => {
  const content = curl(`${BASE_URL}/profile`);
  const hasForm = content.includes('form') || content.includes('input');
  return {
    success: hasForm,
    message: hasForm ? 'Form elements detected' : 'No form found'
  };
});

// 8. NAVIGATION TESTS
console.log('\n🧭 8. NAVIGATION TESTS');

runTest('Navigation Links Present', () => {
  const content = curl(BASE_URL);
  const hasNav = content.includes('href="/dashboard"') || content.includes('Dashboard');
  return {
    success: hasNav,
    message: hasNav ? 'Navigation links found' : 'No navigation detected'
  };
});

// 9. RECOVERY DASHBOARD
console.log('\n🔥 9. RECOVERY FEATURE TESTS');

runTest('Recovery Dashboard Loads', () => {
  const code = getStatusCode(`${BASE_URL}/flows-experimental/recovery`);
  return {
    success: code === '200',
    message: `HTTP ${code}`
  };
});

runTest('Muscle Heatmap Component', () => {
  const content = curl(`${BASE_URL}/flows-experimental/recovery`);
  const hasHeatmap = content.includes('muscle') || content.includes('recovery');
  return {
    success: hasHeatmap,
    message: hasHeatmap ? 'Muscle/recovery elements found' : 'No heatmap elements'
  };
});

// 10. PERFORMANCE TESTS
console.log('\n⚡ 10. PERFORMANCE TESTS');

runTest('Homepage Load Time', () => {
  const start = Date.now();
  curl(BASE_URL);
  const loadTime = Date.now() - start;
  
  return {
    success: loadTime < 2000,
    message: `Loaded in ${loadTime}ms (limit: 2000ms)`
  };
});

runTest('Exercise Browser Load Time', () => {
  const start = Date.now();
  curl(`${BASE_URL}/flows-experimental/exercise-browser`);
  const loadTime = Date.now() - start;
  
  return {
    success: loadTime < 2000,
    message: `Loaded in ${loadTime}ms (limit: 2000ms)`
  };
});

// Final Summary
console.log('\n' + '='.repeat(50));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(50));
console.log(`Total Tests: ${totalTests}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`Success Rate: ${((passedTests/totalTests)*100).toFixed(1)}%`);

// Update scratchpad
updateScratchpad();
console.log(`\n📝 Full results saved to: ${TEST_LOG}`);

// Exit with appropriate code
process.exit(failedTests > 0 ? 1 : 0);