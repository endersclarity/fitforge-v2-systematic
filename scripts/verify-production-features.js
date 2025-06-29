#!/usr/bin/env node

/**
 * Verify key features work in production build
 * This simulates what would happen on Vercel
 */

const http = require('http');

async function checkEndpoint(path, expectedContent) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const success = res.statusCode === 200 && 
                       (!expectedContent || data.includes(expectedContent));
        resolve({ path, status: res.statusCode, success });
      });
    }).on('error', (err) => {
      resolve({ path, error: err.message, success: false });
    });
  });
}

async function verifyProduction() {
  console.log('🔍 Verifying Production Features\n');
  
  const checks = [
    { path: '/', name: 'Home page' },
    { path: '/flows-experimental', name: 'Experimental flows index' },
    { path: '/flows-experimental/workout-execution', name: 'Workout execution page' },
    { path: '/api/health', name: 'API health check' }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    const result = await checkEndpoint(check.path);
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${check.name}: ${result.status || result.error}`);
    if (!result.success) allPassed = false;
  }
  
  console.log('\n' + (allPassed ? '✅ All checks passed!' : '❌ Some checks failed'));
  console.log('\n💡 Manual verification steps:');
  console.log('1. Visit http://localhost:3000/flows-experimental/workout-execution');
  console.log('2. Check if demo workout loads automatically');
  console.log('3. Try adding a set (135 lbs, 10 reps)');
  console.log('4. Verify RPE modal appears');
  console.log('5. Check localStorage in DevTools');
}

// Wait a bit for server to start, then verify
setTimeout(verifyProduction, 3000);