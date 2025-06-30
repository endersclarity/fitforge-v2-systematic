#!/usr/bin/env node

/**
 * Run comprehensive E2E tests for Issue #42
 * This script runs all the new tests and generates a report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Running Comprehensive E2E Test Suite\n');
console.log('This test suite checks for the 4 critical issues found in container tests:\n');
console.log('1. 🚨 Exercise data has invalid muscle engagement totals');
console.log('2. 🚨 Equipment filters not working');
console.log('3. 🚨 No forms on profile page (should be fixed)');
console.log('4. 🚨 Backend service not responding\n');

const testFiles = [
  'tests/e2e/issue-42-data-integrity.spec.ts',
  'tests/e2e/issue-42-route-accessibility.spec.ts',
  'tests/e2e/issue-42-filter-functionality.spec.ts',
  'tests/e2e/issue-42-local-storage.spec.ts',
  'tests/e2e/issue-42-performance.spec.ts'
];

let allPassed = true;
const results = [];

// Run each test file
testFiles.forEach(testFile => {
  console.log(`\n📋 Running ${path.basename(testFile)}...`);
  
  try {
    const output = execSync(`npx playwright test ${testFile} --reporter=list`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('✅ PASSED');
    results.push({
      file: testFile,
      status: 'PASSED',
      output: output
    });
  } catch (error) {
    console.log('❌ FAILED');
    allPassed = false;
    
    results.push({
      file: testFile,
      status: 'FAILED',
      output: error.stdout || error.message
    });
  }
});

// Generate summary report
console.log('\n' + '='.repeat(50));
console.log('📊 COMPREHENSIVE E2E TEST SUMMARY');
console.log('='.repeat(50));

const passed = results.filter(r => r.status === 'PASSED').length;
const failed = results.filter(r => r.status === 'FAILED').length;

console.log(`Total test files: ${testFiles.length}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

// Check for critical issues
console.log('\n🚨 CRITICAL ISSUES STATUS:');

// Parse results to check specific critical tests
const criticalChecks = {
  'muscle_engagement': false,
  'equipment_filter': false,
  'profile_forms': false,
  'backend_service': false
};

results.forEach(result => {
  if (result.output.includes('muscle engagement totals should equal 100%')) {
    criticalChecks.muscle_engagement = !result.output.includes('FAILED');
  }
  if (result.output.includes('equipment filter should reduce exercise count')) {
    criticalChecks.equipment_filter = !result.output.includes('FAILED');
  }
  if (result.output.includes('profile')) {
    criticalChecks.profile_forms = result.status === 'PASSED';
  }
  if (result.output.includes('backend API status check')) {
    criticalChecks.backend_service = !result.output.includes('FAILED');
  }
});

console.log(`1. Muscle engagement totals: ${criticalChecks.muscle_engagement ? '✅ FIXED' : '❌ STILL BROKEN'}`);
console.log(`2. Equipment filters: ${criticalChecks.equipment_filter ? '✅ FIXED' : '❌ STILL BROKEN'}`);
console.log(`3. Profile forms: ${criticalChecks.profile_forms ? '✅ FIXED' : '❌ STILL BROKEN'}`);
console.log(`4. Backend confusion: ${criticalChecks.backend_service ? '✅ RESOLVED' : '❌ STILL EXISTS'}`);

// Generate detailed report
const reportPath = path.join(__dirname, '..', 'e2e-test-report.md');
const reportContent = `# Comprehensive E2E Test Report

Generated: ${new Date().toISOString()}

## Summary
- Test Files Run: ${testFiles.length}
- Passed: ${passed}
- Failed: ${failed}
- Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}

## Critical Issues Status

### 1. Exercise Data Muscle Engagement
- **Status**: ${criticalChecks.muscle_engagement ? '✅ FIXED' : '❌ STILL BROKEN'}
- **Expected**: All exercises should have muscle engagement totals = 100%
- **Impact**: Incorrect fatigue calculations

### 2. Equipment Filter Functionality  
- **Status**: ${criticalChecks.equipment_filter ? '✅ FIXED' : '❌ STILL BROKEN'}
- **Expected**: Filters should reduce exercise count
- **Impact**: Poor user experience

### 3. Profile Page Forms
- **Status**: ${criticalChecks.profile_forms ? '✅ FIXED' : '❌ STILL BROKEN'}
- **Expected**: Profile page should have editable form inputs
- **Note**: This was fixed in PR #45

### 4. Backend Service Architecture
- **Status**: ${criticalChecks.backend_service ? '✅ RESOLVED' : '❌ STILL EXISTS'}
- **Expected**: Clear architecture without unused backend
- **Impact**: Confusion and maintenance overhead

## Test Results by Category

${results.map(r => `### ${path.basename(r.file)}
- Status: ${r.status}
- Details: See test output for specifics
`).join('\n')}

## Recommendations

1. **Immediate Action Required**:
   - Fix muscle engagement data in exercises-real.json
   - Implement working equipment filters
   - Remove or properly connect backend service

2. **Already Fixed**:
   - Profile forms issue resolved in PR #45

3. **Architecture Decision Needed**:
   - Decide on localStorage-only vs backend persistence
   - Remove unused backend code if not needed
`;

fs.writeFileSync(reportPath, reportContent);
console.log(`\n📄 Detailed report saved to: ${reportPath}`);

// Exit with appropriate code
process.exit(allPassed ? 0 : 1);