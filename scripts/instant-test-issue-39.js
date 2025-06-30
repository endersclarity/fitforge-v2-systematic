#!/usr/bin/env node

/**
 * Instant test for Issue #39 - Equipment filter functionality
 * Tests basic filtering logic without Playwright overhead
 */

const exercisesData = require('../data/exercises-real.json');

console.log('🔥 INSTANT TEST - Issue #39 Equipment Filtering');

// Test 1: Basic data verification
console.log('\n1. DATA VERIFICATION:');
console.log(`  Total exercises: ${exercisesData.length}`);

const dumbbellExercises = exercisesData.filter(ex => ex.equipment === 'Dumbbell');
console.log(`  Dumbbell exercises: ${dumbbellExercises.length}`);

const bodyweightExercises = exercisesData.filter(ex => ex.equipment === 'Bodyweight');
console.log(`  Bodyweight exercises: ${bodyweightExercises.length}`);

// Test 2: Verify equipment values match EQUIPMENT_OPTIONS
console.log('\n2. EQUIPMENT VALUES:');
const uniqueEquipment = [...new Set(exercisesData.map(ex => ex.equipment))].sort();
console.log(`  Unique equipment: ${JSON.stringify(uniqueEquipment)}`);

// Test 3: Filter simulation
console.log('\n3. FILTER SIMULATION:');

// Simulate the exact filtering logic from page.tsx
function simulateFiltering(filterState) {
  console.log(`  Filter state: ${JSON.stringify(filterState)}`);
  
  let filtered = [...exercisesData];
  console.log(`  Starting with: ${filtered.length} exercises`);
  
  if (filterState.equipment.length > 0) {
    const beforeCount = filtered.length;
    filtered = filtered.filter(ex => filterState.equipment.includes(ex.equipment));
    console.log(`  Equipment filter (${filterState.equipment}): ${beforeCount} → ${filtered.length}`);
  }
  
  return filtered.length;
}

// Test different filter states
const testCases = [
  { equipment: [], desc: 'No filter' },
  { equipment: ['Dumbbell'], desc: 'Dumbbell only' },
  { equipment: ['Bodyweight'], desc: 'Bodyweight only' },
  { equipment: ['Dumbbell', 'Bodyweight'], desc: 'Dumbbell + Bodyweight' }
];

testCases.forEach(testCase => {
  console.log(`\n  ${testCase.desc}:`);
  const result = simulateFiltering(testCase);
  console.log(`  Result: ${result} exercises`);
});

// Test 4: Expected vs Actual verification
console.log('\n4. VERIFICATION:');
const dumbbellTest = simulateFiltering({ equipment: ['Dumbbell'] });
console.log(`  Dumbbell filter: Expected 11, Got ${dumbbellTest} - ${dumbbellTest === 11 ? 'PASS' : 'FAIL'}`);

const noFilterTest = simulateFiltering({ equipment: [] });
console.log(`  No filter: Expected 38, Got ${noFilterTest} - ${noFilterTest === 38 ? 'PASS' : 'FAIL'}`);

// Success indicator
if (dumbbellTest === 11 && noFilterTest === 38) {
  console.log('\n✅ INSTANT TEST: LOGIC CORRECT - Filter simulation works');
  console.log('   Issue is likely in React state management or event handlers');
  process.exit(0);
} else {
  console.log('\n❌ INSTANT TEST: LOGIC BROKEN - Data or filtering logic issue');
  process.exit(1);
}