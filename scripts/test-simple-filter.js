#!/usr/bin/env node
const exercisesData = require('../data/exercises-real.json');

console.log('🔍 SIMPLE FILTER TEST\n');

console.log('Total exercises:', exercisesData.length);

// Test 1: Equipment filter
const dumbbellExercises = exercisesData.filter(ex => ex.equipment === 'Dumbbell');
console.log('Dumbbell exercises:', dumbbellExercises.length);
console.log('Names:', dumbbellExercises.map(ex => ex.name));

// Test 2: Muscle filter  
const chestExercises = exercisesData.filter(ex => 
  Object.keys(ex.muscleEngagement).includes('Pectoralis_Major')
);
console.log('\nChest exercises (Pectoralis_Major):', chestExercises.length);
console.log('Names:', chestExercises.map(ex => ex.name));

// Test 3: Combined filter
const dumbbellChest = exercisesData.filter(ex => 
  ex.equipment === 'Dumbbell' && 
  Object.keys(ex.muscleEngagement).includes('Pectoralis_Major')
);
console.log('\nDumbbell + Chest exercises:', dumbbellChest.length);
console.log('Names:', dumbbellChest.map(ex => ex.name));