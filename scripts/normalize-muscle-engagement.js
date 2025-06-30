#!/usr/bin/env node

/**
 * Normalize muscle engagement percentages to exactly 100% for each exercise
 * This fixes the data quality issue where 37/38 exercises have totals >100%
 */

const fs = require('fs');
const path = require('path');

const EXERCISES_FILE = path.join(__dirname, '..', 'data', 'exercises-real.json');
const BACKUP_FILE = path.join(__dirname, '..', 'data', 'exercises-real.backup.json');

console.log('🔧 Normalizing Muscle Engagement Percentages\n');

// Read the current data
const exercisesData = JSON.parse(fs.readFileSync(EXERCISES_FILE, 'utf8'));

// Create backup
fs.writeFileSync(BACKUP_FILE, JSON.stringify(exercisesData, null, 2));
console.log(`✅ Created backup at: ${BACKUP_FILE}\n`);

// Track statistics
let totalExercises = 0;
let correctedExercises = 0;
const corrections = [];

// Process each exercise
exercisesData.forEach(exercise => {
  if (!exercise.muscleEngagement) return;
  
  totalExercises++;
  
  // Calculate current total
  const currentTotal = Object.values(exercise.muscleEngagement).reduce((sum, value) => sum + value, 0);
  
  // Check if normalization is needed (allow 0.01 tolerance for floating point)
  if (Math.abs(currentTotal - 100) > 0.01) {
    correctedExercises++;
    
    // Store correction info
    corrections.push({
      name: exercise.name,
      oldTotal: currentTotal,
      muscles: Object.keys(exercise.muscleEngagement).length
    });
    
    // Normalize by scaling each percentage proportionally
    const scaleFactor = 100 / currentTotal;
    
    Object.keys(exercise.muscleEngagement).forEach(muscle => {
      const oldValue = exercise.muscleEngagement[muscle];
      const newValue = Math.round(oldValue * scaleFactor * 100) / 100; // Round to 2 decimal places
      exercise.muscleEngagement[muscle] = newValue;
    });
    
    // Verify the new total (might have small rounding errors)
    const newTotal = Object.values(exercise.muscleEngagement).reduce((sum, value) => sum + value, 0);
    
    // If there's a small rounding error, adjust the largest muscle group
    if (Math.abs(newTotal - 100) > 0.01) {
      const diff = 100 - newTotal;
      const largestMuscle = Object.entries(exercise.muscleEngagement)
        .sort((a, b) => b[1] - a[1])[0][0];
      
      exercise.muscleEngagement[largestMuscle] = 
        Math.round((exercise.muscleEngagement[largestMuscle] + diff) * 100) / 100;
    }
    
    // Final verification
    const finalTotal = Object.values(exercise.muscleEngagement).reduce((sum, value) => sum + value, 0);
    console.log(`📊 ${exercise.name}: ${currentTotal}% → ${finalTotal}%`);
  }
});

// Write the normalized data
fs.writeFileSync(EXERCISES_FILE, JSON.stringify(exercisesData, null, 2));

// Print summary
console.log('\n' + '='.repeat(50));
console.log('📊 NORMALIZATION SUMMARY');
console.log('='.repeat(50));
console.log(`Total exercises: ${totalExercises}`);
console.log(`Corrected: ${correctedExercises}`);
console.log(`Already correct: ${totalExercises - correctedExercises}`);

// Show worst offenders
console.log('\n🚨 Worst Offenders (Top 5):');
corrections
  .sort((a, b) => b.oldTotal - a.oldTotal)
  .slice(0, 5)
  .forEach((correction, i) => {
    console.log(`${i + 1}. ${correction.name}: ${correction.oldTotal}% (${correction.muscles} muscles)`);
  });

console.log('\n✅ Normalization complete! All exercises now total exactly 100%');
console.log(`📁 Backup saved to: ${BACKUP_FILE}`);