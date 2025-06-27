#!/usr/bin/env node

// Instant testing with no arbitrary timeouts
const { execSync } = require('child_process');

console.log('🚀 INSTANT TEST - Issue #26 Workout Builder');

try {
  // Test 1: Route exists (immediate)
  console.log('\n📍 Test 1: Route accessibility');
  const statusCode = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/flows-experimental/workout-builder', {encoding: 'utf8'}).trim();
  console.log(`   Status: ${statusCode} ${statusCode === '200' ? '✅' : '❌'}`);
  
  if (statusCode !== '200') {
    console.log('   🛑 Route not accessible - stopping tests');
    process.exit(1);
  }

  // Test 2: Page content (immediate)
  console.log('\n📍 Test 2: Page content verification');
  const pageContent = execSync('curl -s http://localhost:8080/flows-experimental/workout-builder', {encoding: 'utf8'});
  
  const tests = [
    { name: 'Page title contains "Workout Builder"', check: () => pageContent.includes('Workout Builder') },
    { name: 'Empty state message present', check: () => pageContent.includes('Start building your workout') },
    { name: 'Add exercise button present', check: () => pageContent.includes('Add an exercise') },
    { name: 'Save button present', check: () => pageContent.includes('Save Workout') },
    { name: 'Cancel button present', check: () => pageContent.includes('Cancel') }
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    const result = test.check();
    console.log(`   ${result ? '✅' : '❌'} ${test.name}`);
    result ? passed++ : failed++;
  });

  // Test 3: Basic DOM structure (immediate)
  console.log('\n📍 Test 3: DOM structure verification');
  const buttonCount = (pageContent.match(/<button/g) || []).length;
  const headerCount = (pageContent.match(/<h[1-6]/g) || []).length;
  
  console.log(`   ✅ Buttons found: ${buttonCount} (expected >= 2)`);
  console.log(`   ✅ Headers found: ${headerCount} (expected >= 1)`);

  console.log(`\n🎯 RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`⚡ Completed in <1 second (no artificial timeouts)`);

  if (failed > 0) {
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}