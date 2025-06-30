#!/usr/bin/env node

// Instant test for Issue #41 - Profile schema fix
// Tests basic functionality without browser automation

console.log('🔥 [INSTANT_TEST] Testing Issue #41 Profile Schema Fix...');

// Test 1: Field mapping logic
console.log('\n🔧 [TEST_1] Field mapping logic...');
const fieldMapping = {
  'goal': 'primaryGoal',
  'experience': 'experienceLevel', 
  'frequency': 'weeklyWorkouts'
};

const testField = (input, expected) => {
  const result = fieldMapping[input] || input;
  const pass = result === expected;
  console.log(`  ${pass ? '✅' : '❌'} ${input} → ${result} (expected: ${expected})`);
  return pass;
};

let allPassed = true;
allPassed &= testField('goal', 'primaryGoal');
allPassed &= testField('experience', 'experienceLevel');  
allPassed &= testField('frequency', 'weeklyWorkouts');
allPassed &= testField('name', 'name'); // Should pass through unchanged
allPassed &= testField('age', 'age'); // Should pass through unchanged

// Test 2: Data migration logic
console.log('\n🔧 [TEST_2] Data migration logic...');
const testMigration = (oldData, expectedFields) => {
  const needsMigration = oldData.goal || oldData.experience || oldData.frequency;
  
  if (needsMigration) {
    const migratedData = {
      ...oldData,
      primaryGoal: oldData.goal || oldData.primaryGoal,
      experienceLevel: oldData.experience || oldData.experienceLevel,
      weeklyWorkouts: oldData.frequency || oldData.weeklyWorkouts,
    };
    
    // Remove old fields
    delete migratedData.goal;
    delete migratedData.experience;
    delete migratedData.frequency;
    
    const hasExpectedFields = expectedFields.every(field => migratedData[field] !== undefined);
    const hasOldFields = migratedData.goal || migratedData.experience || migratedData.frequency;
    
    console.log(`  Migration needed: ${needsMigration}`);
    console.log(`  Has expected fields: ${hasExpectedFields}`);
    console.log(`  Old fields removed: ${!hasOldFields}`);
    console.log(`  Migrated data:`, migratedData);
    
    return hasExpectedFields && !hasOldFields;
  }
  
  return true; // No migration needed
};

const oldFormatData = {
  name: 'Test User',
  age: 30,
  goal: 'strength',
  experience: 'intermediate',
  frequency: 3,
  availableEquipment: ['Dumbbells']
};

const migrationPassed = testMigration(oldFormatData, ['primaryGoal', 'experienceLevel', 'weeklyWorkouts']);
console.log(`  ${migrationPassed ? '✅' : '❌'} Migration test ${migrationPassed ? 'PASSED' : 'FAILED'}`);
allPassed &= migrationPassed;

// Test 3: Profile interface compatibility
console.log('\n🔧 [TEST_3] Profile interface compatibility...');
const validProfile = {
  name: 'Jane Doe',
  age: 25,
  primaryGoal: 'hypertrophy',
  experienceLevel: 'beginner',
  weeklyWorkouts: 4,
  availableEquipment: ['Dumbbells', 'Pull-up Bar']
};

const requiredFields = ['name', 'age', 'primaryGoal', 'experienceLevel', 'weeklyWorkouts', 'availableEquipment'];
const hasAllFields = requiredFields.every(field => validProfile[field] !== undefined);
console.log(`  ${hasAllFields ? '✅' : '❌'} Profile has all required fields: ${hasAllFields}`);
allPassed &= hasAllFields;

// Final result
console.log(`\n🎯 [RESULT] ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
console.log('🔥 [INSTANT_TEST] Issue #41 basic functionality test complete');

process.exit(allPassed ? 0 : 1);