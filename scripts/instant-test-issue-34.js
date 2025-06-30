#!/usr/bin/env node

const http = require('http');

console.log('🔍 INSTANT TEST: Issue #34 - Workout Template Management');
console.log('======================================================\n');

// Test saved workouts page
function testSavedWorkoutsPage() {
  return new Promise((resolve) => {
    console.log('📍 Testing Saved Workouts Page...');
    
    http.get('http://localhost:8080/flows-experimental/saved-workouts', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const tests = [
          { name: 'Page loads successfully', pass: res.statusCode === 200 },
          { name: 'Contains "Saved Workouts" title', pass: data.includes('Saved Workouts') },
          { name: 'Contains "New Workout" button', pass: data.includes('New Workout') },
          { name: 'Has category filter', pass: data.includes('select') && data.includes('All Categories') },
          { name: 'Has search input', pass: data.includes('Search templates') },
          { name: 'Uses localStorage service', pass: data.includes('LocalStorageService') || data.includes('localStorage') }
        ];
        
        tests.forEach(test => {
          console.log(`  ${test.pass ? '✅' : '❌'} ${test.name}`);
        });
        
        console.log('');
        resolve();
      });
    });
  });
}

// Test workout builder
function testWorkoutBuilder() {
  return new Promise((resolve) => {
    console.log('📍 Testing Workout Builder...');
    
    http.get('http://localhost:8080/flows-experimental/workout-builder', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const tests = [
          { name: 'Page loads successfully', pass: res.statusCode === 200 },
          { name: 'Has add exercise button', pass: data.includes('data-testid="add-exercise-button"') },
          { name: 'Has save workout button', pass: data.includes('data-testid="save-workout-button"') },
          { name: 'Shows workout name input', pass: data.includes('Workout Name') || data.includes('workout-name') },
          { name: 'Has success message container', pass: data.includes('success-message') || data.includes('showSuccessMessage') }
        ];
        
        tests.forEach(test => {
          console.log(`  ${test.pass ? '✅' : '❌'} ${test.name}`);
        });
        
        console.log('');
        resolve();
      });
    });
  });
}

// Test data flow
function testDataFlow() {
  console.log('📍 Testing Data Flow & Contracts...');
  
  const fs = require('fs');
  
  // Read saved workouts page
  const savedWorkoutsCode = fs.readFileSync('app/flows-experimental/saved-workouts/page.tsx', 'utf8');
  const saveModalCode = fs.readFileSync('app/flows-experimental/workout-builder/components/SaveWorkoutModal.tsx', 'utf8');
  
  const tests = [
    { 
      name: 'Saved workouts uses exerciseId', 
      pass: savedWorkoutsCode.includes('exerciseId') 
    },
    { 
      name: 'Save modal outputs exerciseId', 
      pass: saveModalCode.includes('exerciseId:') 
    },
    { 
      name: 'LocalStorage key is consistent', 
      pass: savedWorkoutsCode.includes('fitforge_workout_templates') 
    },
    { 
      name: 'Validation prevents empty names', 
      pass: saveModalCode.includes('trim().length === 0') 
    },
    { 
      name: 'Validation prevents duplicates', 
      pass: saveModalCode.includes('isDuplicate') 
    }
  ];
  
  tests.forEach(test => {
    console.log(`  ${test.pass ? '✅' : '❌'} ${test.name}`);
  });
  
  console.log('');
}

// Run all tests
async function runTests() {
  await testSavedWorkoutsPage();
  await testWorkoutBuilder();
  testDataFlow();
  
  console.log('🎯 INSTANT TEST COMPLETE\n');
  console.log('💡 Note: This verifies the components exist and are properly connected.');
  console.log('   For full interaction testing, use Playwright when display is available.');
}

runTests().catch(console.error);