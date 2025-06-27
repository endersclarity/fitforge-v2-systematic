#!/usr/bin/env node
const puppeteer = require('puppeteer');

async function verifyFilters() {
  console.log('🧪 Issue #25: Verifying Exercise Filters\n');
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Test 1: Initial state
    console.log('TEST 1: Initial page load');
    await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
    await page.waitForSelector('h3.font-semibold', { timeout: 5000 });
    
    const initialCount = await page.$$eval('h3.font-semibold', els => els.length);
    console.log(`✓ Initial exercise count: ${initialCount}`);
    console.log(`  Expected: 38, Actual: ${initialCount}, ${initialCount === 38 ? 'PASS' : 'FAIL'}\n`);
    
    // Test 2: Equipment filter
    console.log('TEST 2: Equipment filter (Dumbbell)');
    
    // Find and click Equipment button using text content
    const equipmentClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const equipmentButton = buttons.find(btn => btn.textContent.includes('Equipment'));
      if (equipmentButton) {
        equipmentButton.click();
        return true;
      }
      return false;
    });
    
    if (equipmentClicked) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Click Dumbbell option
      const dumbbellClicked = await page.evaluate(() => {
        const options = Array.from(document.querySelectorAll('div, button, span'));
        const dumbbellOption = options.find(el => el.textContent === 'Dumbbell');
        if (dumbbellOption) {
          dumbbellOption.click();
          return true;
        }
        return false;
      });
      
      if (dumbbellClicked) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const filteredCount = await page.$$eval('h3.font-semibold', els => els.length);
        console.log(`✓ After Dumbbell filter: ${filteredCount} exercises`);
        console.log(`  Expected: 11, Actual: ${filteredCount}, ${filteredCount === 11 ? 'PASS' : 'FAIL'}\n`);
      } else {
        console.log('❌ Could not find Dumbbell option\n');
      }
    } else {
      console.log('❌ Could not find Equipment button\n');
    }
    
    // Test 3: Direct URL with query params
    console.log('TEST 3: Direct URL with filter params');
    await page.goto('http://localhost:8080/flows-experimental/exercise-browser?equipment=Dumbbell');
    await page.waitForSelector('h3.font-semibold', { timeout: 5000 });
    
    const urlFilteredCount = await page.$$eval('h3.font-semibold', els => els.length);
    console.log(`✓ URL filtered count: ${urlFilteredCount}`);
    console.log(`  Expected: 11, Actual: ${urlFilteredCount}, ${urlFilteredCount === 11 ? 'PASS' : 'FAIL'}\n`);
    
    // Test 4: Screenshot evidence
    console.log('TEST 4: Generating visual evidence');
    await page.screenshot({ 
      path: 'test-evidence-issue-25-filters.png', 
      fullPage: true 
    });
    console.log('✓ Screenshot saved: test-evidence-issue-25-filters.png\n');
    
    // Summary
    console.log('📊 FILTER VERIFICATION SUMMARY:');
    console.log('================================');
    console.log(`Initial Display: ${initialCount === 38 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Equipment Filter: ${filteredCount === 11 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`URL Parameters: ${urlFilteredCount === 11 ? '✅ PASS' : '❌ FAIL'}`);
    console.log('\nCONCLUSION: Filters are ' + (filteredCount === 11 ? 'WORKING' : 'BROKEN'));
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  } finally {
    await browser.close();
  }
}

verifyFilters().catch(console.error);