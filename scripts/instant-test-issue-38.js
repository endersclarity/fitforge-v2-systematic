#!/usr/bin/env node

/**
 * Instant test for Issue #38 - Verify muscle engagement normalization
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test 1: Verify exercise data totals
console.log('🧪 Testing Exercise Data Normalization...\n');

const exercisesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'exercises-real.json'), 'utf8')
);

let allCorrect = true;
let incorrectCount = 0;

exercisesData.forEach(exercise => {
  if (exercise.muscleEngagement) {
    const total = Object.values(exercise.muscleEngagement).reduce((sum, val) => sum + val, 0);
    
    if (Math.abs(total - 100) > 0.01) {
      allCorrect = false;
      incorrectCount++;
      console.log(`❌ ${exercise.name}: ${total}%`);
    }
  }
});

console.log(`\n✅ Exercise Data Check: ${allCorrect ? 'PASSED' : 'FAILED'}`);
console.log(`   Total exercises: ${exercisesData.length}`);
console.log(`   Incorrect totals: ${incorrectCount}`);

// Test 2: Check recovery page for percentages > 100
console.log('\n🧪 Checking Recovery Page...\n');

try {
  const pageContent = execSync('curl -s http://localhost:8080/flows-experimental/recovery', { encoding: 'utf8' });
  
  // Find all percentage values
  const percentages = pageContent.match(/(\d+(?:\.\d+)?)\s*%/g) || [];
  const highPercentages = percentages
    .map(p => parseFloat(p))
    .filter(v => v > 100);
  
  if (highPercentages.length > 0) {
    console.log(`❌ Found ${highPercentages.length} percentages > 100%:`, highPercentages);
  } else {
    console.log('✅ All percentages ≤ 100%');
  }
  
  // Look for specific muscle engagement data
  const hasRecoveryData = pageContent.includes('recovery') || pageContent.includes('fatigue');
  console.log(`   Recovery data present: ${hasRecoveryData ? 'Yes' : 'No'}`);
  
} catch (error) {
  console.log('❌ Error checking recovery page:', error.message);
}

// Test 3: Verify calculations would be correct
console.log('\n🧪 Verifying Calculation Logic...\n');

// Simulate volume calculation with normalized data
const sampleExercise = exercisesData[0]; // Single Arm Upright Row
const setVolume = 100; // 10 reps × 10 lbs

let totalContribution = 0;
Object.entries(sampleExercise.muscleEngagement).forEach(([muscle, engagement]) => {
  const contribution = (setVolume * engagement) / 100;
  totalContribution += contribution;
});

console.log(`✅ Sample calculation check:`);
console.log(`   Exercise: ${sampleExercise.name}`);
console.log(`   Set volume: ${setVolume}`);
console.log(`   Total contribution: ${totalContribution} (should equal ${setVolume})`);
console.log(`   Calculation ${Math.abs(totalContribution - setVolume) < 0.01 ? 'CORRECT' : 'INCORRECT'}`);

// Exit code
process.exit(allCorrect && incorrectCount === 0 ? 0 : 1);