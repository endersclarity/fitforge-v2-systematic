#!/usr/bin/env node

// INSTANT TEST for Issue #26: Experimental Workout Builder
// No timeouts, immediate feedback, rapid iteration

const { execSync } = require('child_process');

console.log('⚡ INSTANT TEST - Issue #26 Workout Builder');
console.log('🎯 Goal: Test workout builder basic functionality in <1 second\n');

let passed = 0;
let failed = 0;

function test(name, testFn) {
  try {
    const result = testFn();
    if (result) {
      console.log(`✅ ${name}`);
      passed++;
    } else {
      console.log(`❌ ${name}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${name} - Error: ${error.message}`);
    failed++;
  }
}

// Test 1: Route Accessibility (immediate)
console.log('📍 Phase 1: Route and Page Structure');
test('Route /flows-experimental/workout-builder returns 200', () => {
  const statusCode = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/flows-experimental/workout-builder', {encoding: 'utf8'}).trim();
  return statusCode === '200';
});

if (failed > 0) {
  console.log('\n🛑 Route not accessible - stopping further tests');
  process.exit(1);
}

// Test 2: Page Content (immediate)
console.log('\n📍 Phase 2: Essential Content Verification');
const pageContent = execSync('curl -s http://localhost:8080/flows-experimental/workout-builder', {encoding: 'utf8'});

test('Page title contains "Workout Builder"', () => pageContent.includes('Workout Builder'));
test('Empty state message present', () => pageContent.includes('Start building your workout'));
test('Add exercise button present', () => pageContent.includes('Add an exercise'));
test('Save button present', () => pageContent.includes('Save Workout'));
test('Cancel button present', () => pageContent.includes('Cancel'));

// Test 3: DOM Structure (immediate)
console.log('\n📍 Phase 3: DOM Structure Validation');
test('Sufficient buttons (expected >= 2)', () => {
  const buttonCount = (pageContent.match(/<button/g) || []).length;
  console.log(`   Found ${buttonCount} buttons`);
  return buttonCount >= 2;
});

test('Headers present (expected >= 1)', () => {
  const headerCount = (pageContent.match(/<h[1-6]/g) || []).length;
  console.log(`   Found ${headerCount} headers`);
  return headerCount >= 1;
});

// Test 4: Data Contract Verification (immediate)
console.log('\n📍 Phase 4: Data Contract Verification');
test('Exercise data file exists and valid', () => {
  try {
    const exerciseCount = parseInt(execSync('cat data/exercises-real.json | jq ". | length"', {encoding: 'utf8'}).trim());
    console.log(`   Found ${exerciseCount} exercises in data`);
    return exerciseCount > 0;
  } catch {
    return false;
  }
});

test('Exercise data has required fields', () => {
  try {
    const firstExercise = execSync('cat data/exercises-real.json | jq ".[0]"', {encoding: 'utf8'});
    const hasId = firstExercise.includes('"id"');
    const hasName = firstExercise.includes('"name"');
    const hasEquipment = firstExercise.includes('"equipment"');
    console.log(`   Has id: ${hasId}, name: ${hasName}, equipment: ${hasEquipment}`);
    return hasId && hasName && hasEquipment;
  } catch {
    return false;
  }
});

// Test 5: Responsive Design (immediate)
console.log('\n📍 Phase 5: Basic Responsive Structure');
test('Mobile-friendly meta viewport', () => pageContent.includes('viewport'));
test('CSS classes suggest responsive design', () => {
  const hasResponsiveClasses = pageContent.includes('max-w-') || pageContent.includes('mx-auto') || pageContent.includes('flex');
  return hasResponsiveClasses;
});

// Results Summary
console.log(`\n🎯 INSTANT TEST RESULTS:`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`⚡ Completed in <1 second (no artificial delays)`);

if (failed > 0) {
  console.log(`\n🚨 ${failed} tests failed - basic functionality needs attention`);
  console.log('🔧 Fix these issues before running Playwright tests');
  process.exit(1);
} else {
  console.log('\n✨ All instant tests passed - ready for interaction testing');
  process.exit(0);
}