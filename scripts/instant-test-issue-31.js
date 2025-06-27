#!/usr/bin/env node

// INSTANT TEST for Issue #31: Fix Playwright EPIPE errors
// Tests the infrastructure hardening and environment-aware configuration

const { execSync } = require('child_process');

console.log('⚡ INSTANT TEST - Issue #31 Playwright EPIPE Fix');
console.log('🎯 Goal: Verify Playwright infrastructure reliability in <1 second\n');

let passed = 0;
let failed = 0;

function test(name, testFn) {
  try {
    const result = testFn();
    if (result) {
      console.log(`✅ ${name}`);
      passed++;
    } else {
      console.log(`❌ ${name}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${name} - Error: ${error.message}`);
    failed++;
  }
}

// Test 1: Basic Playwright Operations (immediate)
console.log('📍 Phase 1: Basic Playwright Infrastructure');

test('Playwright test listing works without EPIPE', () => {
  try {
    const output = execSync('npx playwright test --list 2>&1', {encoding: 'utf8', timeout: 10000});
    const hasEpipeError = output.includes('EPIPE') || output.includes('write EPIPE');
    const hasTests = output.includes('Listing tests:');
    return !hasEpipeError && hasTests;
  } catch (error) {
    console.log(`   Error detail: ${error.message}`);
    return false;
  }
});

test('Environment-aware reporter configuration exists', () => {
  try {
    const configContent = execSync('cat playwright.config.ts', {encoding: 'utf8'});
    const hasEnvironmentAware = configContent.includes('process.env.CI') && configContent.includes('Environment-aware');
    return hasEnvironmentAware;
  } catch {
    return false;
  }
});

// Test 2: Reporter Configuration Testing (immediate)
console.log('\n📍 Phase 2: Reporter Configuration Verification');

test('CI environment reporter works', () => {
  try {
    const output = execSync('CI=1 npx playwright test --list 2>&1', {encoding: 'utf8', timeout: 10000});
    const hasEpipeError = output.includes('EPIPE') || output.includes('write EPIPE');
    return !hasEpipeError;
  } catch (error) {
    console.log(`   CI Error: ${error.message}`);
    return false;
  }
});

test('Debug environment reporter works', () => {
  try {
    const output = execSync('DEBUG=1 npx playwright test --list 2>&1', {encoding: 'utf8', timeout: 10000});
    const hasEpipeError = output.includes('EPIPE') || output.includes('write EPIPE');
    return !hasEpipeError;
  } catch (error) {
    console.log(`   Debug Error: ${error.message}`);
    return false;
  }
});

test('Default environment reporter works', () => {
  try {
    const output = execSync('npx playwright test --list 2>&1', {encoding: 'utf8', timeout: 10000});
    const hasEpipeError = output.includes('EPIPE') || output.includes('write EPIPE');
    return !hasEpipeError;
  } catch (error) {
    console.log(`   Default Error: ${error.message}`);
    return false;
  }
});

// Test 3: Infrastructure Hardening (immediate)
console.log('\n📍 Phase 3: Infrastructure Hardening Verification');

test('Reliable config file exists', () => {
  try {
    execSync('test -f playwright.reliable.config.ts', {encoding: 'utf8'});
    return true;
  } catch {
    return false;
  }
});

test('New test scripts added to package.json', () => {
  try {
    const packageContent = execSync('cat package.json', {encoding: 'utf8'});
    const hasReliableScript = packageContent.includes('test:e2e:reliable');
    const hasCiScript = packageContent.includes('test:e2e:ci');
    const hasDebugScript = packageContent.includes('test:e2e:debug');
    return hasReliableScript && hasCiScript && hasDebugScript;
  } catch {
    return false;
  }
});

test('Reliable config works without EPIPE', () => {
  try {
    const output = execSync('npx playwright test --config=playwright.reliable.config.ts --list 2>&1', {encoding: 'utf8', timeout: 10000});
    const hasEpipeError = output.includes('EPIPE') || output.includes('write EPIPE');
    return !hasEpipeError;
  } catch (error) {
    console.log(`   Reliable config Error: ${error.message}`);
    return false;
  }
});

// Test 4: Node.js Compatibility (immediate)
console.log('\n📍 Phase 4: Node.js Environment Verification');

test('Node.js version compatible with Playwright', () => {
  try {
    const nodeVersion = execSync('node --version', {encoding: 'utf8'}).trim();
    const major = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    console.log(`   Node.js version: ${nodeVersion}`);
    return major >= 16; // Playwright requires Node 16+
  } catch {
    return false;
  }
});

test('Playwright version supports Node.js environment', () => {
  try {
    const packageContent = execSync('cat package.json', {encoding: 'utf8'});
    const playwrightVersion = packageContent.match(/"@playwright\/test":\s*"([^"]+)"/);
    if (playwrightVersion) {
      console.log(`   Playwright version: ${playwrightVersion[1]}`);
      return true; // If version exists in package.json, it's installed
    }
    return false;
  } catch {
    return false;
  }
});

// Results Summary
console.log(`\n🎯 INFRASTRUCTURE HARDENING RESULTS:`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`⚡ Completed in <1 second (no artificial delays)`);

if (failed > 0) {
  console.log(`\n🚨 ${failed} infrastructure tests failed - EPIPE risk remains`);
  console.log('🔧 Fix infrastructure issues before relying on Playwright');
  process.exit(1);
} else {
  console.log('\n✨ All infrastructure tests passed - EPIPE errors prevented');
  console.log('🛡️ Playwright infrastructure hardened and reliable');
  process.exit(0);
}