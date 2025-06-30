#!/usr/bin/env node

const { chromium } = require('playwright');

async function playwrightDebug() {
  console.log('🔍 PLAYWRIGHT DEBUG - Equipment Filter');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Monitor console logs
    page.on('console', (msg) => {
      console.log(`BROWSER: ${msg.text()}`);
    });

    await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
    await page.waitForLoadState('networkidle');
    
    console.log('\n1. INITIAL COUNT:');
    const initialCount = await page.locator('div[class*="card"]').count();
    console.log(`Initial card count: ${initialCount}`);
    
    console.log('\n2. CLICKING EQUIPMENT FILTER:');
    const equipmentButton = page.locator('button:has-text("Equipment")');
    await equipmentButton.click();
    console.log('Equipment button clicked');
    
    await page.waitForTimeout(500);
    
    console.log('\n3. LOOKING FOR DUMBBELL OPTION:');
    
    // Try different selectors for Dumbbell
    const dumbbellSelectors = [
      'text=Dumbbell',
      'button:has-text("Dumbbell")',
      '[role="button"]:has-text("Dumbbell")',
      'div:has-text("Dumbbell")'
    ];
    
    for (const selector of dumbbellSelectors) {
      const count = await page.locator(selector).count();
      console.log(`  ${selector}: ${count} elements`);
    }
    
    // Check if dropdown is actually open
    const dropdownVisible = await page.evaluate(() => {
      const dropdowns = document.querySelectorAll('[class*="fixed"]');
      return Array.from(dropdowns).map(d => ({
        visible: d.offsetWidth > 0 && d.offsetHeight > 0,
        content: d.textContent?.slice(0, 100)
      }));
    });
    console.log('\nDropdown state:', dropdownVisible);
    
    console.log('\n4. ATTEMPTING DUMBBELL CLICK:');
    
    // Try clicking with force
    try {
      await page.locator('button:has-text("Dumbbell")').first().click({ force: true });
      console.log('Dumbbell clicked with force');
    } catch (error) {
      console.log('Force click failed:', error.message);
    }
    
    await page.waitForTimeout(2000);
    
    console.log('\n5. FINAL COUNT:');
    const finalCount = await page.locator('div[class*="card"]').count();
    console.log(`Final card count: ${finalCount}`);
    
    if (finalCount === 11) {
      console.log('✅ SUCCESS: Filtering worked!');
    } else {
      console.log('❌ FAILURE: No filtering occurred');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

playwrightDebug();