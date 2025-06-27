#!/usr/bin/env node
const puppeteer = require('puppeteer');

async function testExerciseFilters() {
  console.log('🧪 Testing Exercise Filters with Puppeteer...\n');
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Test 1: Initial page load
    console.log('Test 1: Loading exercise browser...');
    await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
    await page.waitForSelector('h3.font-semibold', { timeout: 5000 });
    
    const initialCount = await page.$$eval('h3.font-semibold', elements => elements.length);
    console.log(`✅ Initial exercise count: ${initialCount}`);
    console.log(`   Expected: 38, Actual: ${initialCount}, ${initialCount === 38 ? 'PASS' : 'FAIL'}\n`);
    
    // Test 2: Equipment filter
    console.log('Test 2: Testing Dumbbell filter...');
    
    // Click Equipment dropdown
    const equipmentButton = await page.$('button:has(span:has-text("Equipment"))') || 
                           await page.$x('//button[contains(., "Equipment")]')[0];
    if (equipmentButton) await equipmentButton.click();
    await page.waitForTimeout(500);
    
    // Click Dumbbell option
    const dumbbellOption = await page.$x('//div[contains(text(), "Dumbbell")]')[0];
    if (dumbbellOption) await dumbbellOption.click();
    await page.waitForTimeout(1000);
    
    // Count exercises after filter
    const dumbbellCount = await page.$$eval('h3.font-semibold', elements => elements.length);
    console.log(`✅ Filtered exercise count: ${dumbbellCount}`);
    console.log(`   Expected: 11, Actual: ${dumbbellCount}, ${dumbbellCount === 11 ? 'PASS' : 'FAIL'}\n`);
    
    // Test 3: Screenshot evidence
    console.log('Test 3: Capturing screenshot evidence...');
    await page.screenshot({ path: 'test-evidence-dumbbell-filter.png', fullPage: true });
    console.log('✅ Screenshot saved: test-evidence-dumbbell-filter.png\n');
    
    // Test 4: Clear filters
    console.log('Test 4: Testing Clear All filters...');
    await page.click('button:has-text("Clear All")');
    await page.waitForTimeout(1000);
    
    const clearedCount = await page.$$eval('h3.font-semibold', elements => elements.length);
    console.log(`✅ Cleared exercise count: ${clearedCount}`);
    console.log(`   Expected: 38, Actual: ${clearedCount}, ${clearedCount === 38 ? 'PASS' : 'FAIL'}\n`);
    
    // Test 5: Muscle filter (the broken one)
    console.log('Test 5: Testing muscle filter (known issue)...');
    await page.click('button:has-text("Target Muscle")');
    await page.waitForTimeout(500);
    
    // Check what options are available
    const muscleOptions = await page.$$eval('[role="menuitem"]', els => els.map(el => el.textContent));
    console.log('Available muscle options:', muscleOptions);
    
    // Try clicking "Chest"
    await page.click('text=Chest');
    await page.waitForTimeout(1000);
    
    const chestCount = await page.$$eval('h3.font-semibold', elements => elements.length);
    console.log(`❌ Chest filter count: ${chestCount}`);
    console.log(`   Expected: <38, Actual: ${chestCount}, ${chestCount < 38 ? 'PASS' : 'FAIL'}`);
    console.log('   Note: This is the broken filter - sends "Chest" but data expects "Pectoralis_Major"\n');
    
    // Generate final evidence
    console.log('📊 TEST SUMMARY:');
    console.log('================');
    console.log(`Initial Load: ${initialCount === 38 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Dumbbell Filter: ${dumbbellCount === 11 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Clear Filters: ${clearedCount === 38 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Muscle Filter: ${chestCount < 38 ? '⚠️  WORKS' : '❌ BROKEN'} (but data contract issue)`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testExerciseFilters().catch(console.error);