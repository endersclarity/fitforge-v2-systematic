#!/usr/bin/env node
const exercisesData = require('../data/exercises-real.json');

console.log('🔍 Testing Muscle Filter Logic\n');

// Check exercises with Pectoralis_Major (Chest)
const chestExercises = exercisesData.filter(ex => {
  const muscles = Object.keys(ex.muscleEngagement);
  return muscles.includes('Pectoralis_Major');
});

console.log(`Exercises with Pectoralis_Major: ${chestExercises.length}`);
console.log('Exercise names:');
chestExercises.forEach(ex => console.log(`  - ${ex.name}`));

// Check what muscle names exist
const allMuscles = new Set();
exercisesData.forEach(ex => {
  Object.keys(ex.muscleEngagement).forEach(muscle => {
    allMuscles.add(muscle);
  });
});

console.log('\nAll unique muscle names in data:');
Array.from(allMuscles).sort().forEach(muscle => console.log(`  - ${muscle}`));