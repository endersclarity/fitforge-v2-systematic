#!/usr/bin/env node

/**
 * Investigate test failures and run deeper diagnostics
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080';

function exec(command) {
  return execSync(command, { encoding: 'utf8' }).trim();
}

function curl(url) {
  return exec(`curl -s "${url}"`);
}

console.log('🔍 INVESTIGATING TEST FAILURES\n');

// 1. Next.js Application Detection
console.log('1. Next.js Detection Issue:');
const homeContent = curl(BASE_URL);
console.log('- Checking for React root:', homeContent.includes('__next') || homeContent.includes('_next'));
console.log('- HTML length:', homeContent.length);
console.log('- Has <html> tag:', homeContent.includes('<html'));
console.log('- First 200 chars:', homeContent.substring(0, 200));

// 2. Exercise Data Fields
console.log('\n2. Exercise Data Missing Fields:');
const exerciseData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'exercises-real.json')));
const sampleExercise = exerciseData[0];
console.log('Sample exercise fields:', Object.keys(sampleExercise));
console.log('Looking for targetMuscle field...');
exerciseData.slice(0, 3).forEach((ex, i) => {
  console.log(`Exercise ${i}: ${ex.name}`);
  console.log(`  - equipment: ${ex.equipment}`);
  console.log(`  - muscleGroup: ${ex.muscleGroup}`);
  console.log(`  - targetMuscle: ${ex.targetMuscle || 'MISSING'}`);
});

// 3. Equipment Filter Issue
console.log('\n3. Equipment Filter Investigation:');
const allExercisesUrl = `${BASE_URL}/flows-experimental/exercise-browser`;
const filteredUrl = `${BASE_URL}/flows-experimental/exercise-browser?equipment=Dumbbell`;

const allContent = curl(allExercisesUrl);
const filteredContent = curl(filteredUrl);

console.log('All exercises page size:', allContent.length);
console.log('Filtered page size:', filteredContent.length);
console.log('Pages identical?', allContent === filteredContent);

// Count exercises more accurately
const countExercises = (content) => {
  // Try different selectors
  const patterns = [
    /<h3[^>]*font-semibold[^>]*>/g,
    /<div[^>]*exercise[^>]*>/g,
    /data-testid="exercise-/g,
    /<button[^>]*exercise[^>]*>/g
  ];
  
  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      console.log(`  Pattern ${pattern} found:`, matches.length, 'matches');
    }
  }
};

console.log('\nAll exercises page patterns:');
countExercises(allContent);
console.log('\nFiltered page patterns:');
countExercises(filteredContent);

// 4. Profile Form Investigation
console.log('\n4. Profile Form Investigation:');
const profileContent = curl(`${BASE_URL}/profile`);
console.log('Profile page size:', profileContent.length);
console.log('Contains "form":', profileContent.includes('<form'));
console.log('Contains "input":', profileContent.includes('<input'));
console.log('Contains "Name":', profileContent.includes('Name'));
console.log('Contains "Weight":', profileContent.includes('Weight'));

// Look for React components
console.log('Contains "Profile":', profileContent.includes('Profile'));
console.log('Contains any inputs:', /<input|<select|<textarea/.test(profileContent));

// 5. Check for client-side rendering
console.log('\n5. Client-Side Rendering Check:');
console.log('Checking if pages are server-rendered or require JS...');
const dashboardContent = curl(`${BASE_URL}/dashboard`);
console.log('Dashboard has content:', dashboardContent.length > 1000);
console.log('Dashboard has "Loading":', dashboardContent.includes('Loading'));

console.log('\n📊 INVESTIGATION COMPLETE');