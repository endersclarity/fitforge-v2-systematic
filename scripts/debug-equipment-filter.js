#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function debugEquipmentFilter() {
  console.log('🔍 DEBUGGING Equipment Filter - Issue #39');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    
    // Capture all console logs
    const logs = [];
    page.on('console', (msg) => {
      const text = msg.text();
      logs.push(text);
      console.log(`📝 BROWSER: ${text}`);
    });

    // Go to exercise browser
    console.log('\n1. NAVIGATING TO EXERCISE BROWSER...');
    await page.goto('http://localhost:8080/flows-experimental/exercise-browser', { 
      waitUntil: 'networkidle2', 
      timeout: 10000 
    });
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Count initial exercises
    console.log('\n2. CHECKING INITIAL STATE...');
    const initialCards = await page.$$eval('[class*="card"], [class*="exercise"]', elements => elements.length);
    console.log(`Initial exercise cards: ${initialCards}`);
    
    // Click Equipment filter
    console.log('\n3. CLICKING EQUIPMENT FILTER...');
    
    // Try multiple selectors to find Equipment button
    const equipmentButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const equipmentBtn = buttons.find(btn => btn.textContent?.includes('Equipment'));
      if (equipmentBtn) {
        console.log('🔍 Found Equipment button:', equipmentBtn.textContent);
        equipmentBtn.click();
        return true;
      }
      console.log('❌ Equipment button not found');
      console.log('Available buttons:', buttons.map(b => b.textContent?.trim()));
      return false;
    });
    
    if (!equipmentButton) {
      console.log('❌ Could not find Equipment button');
      return;
    }
    
    // Wait for dropdown to appear
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Click Dumbbell option
    console.log('\n4. CLICKING DUMBBELL OPTION...');
    
    const dumbbellClicked = await page.evaluate(() => {
      // Look for Dumbbell text in dropdown options
      const elements = Array.from(document.querySelectorAll('*'));
      const dumbbellElement = elements.find(el => 
        el.textContent?.trim() === 'Dumbbell' && 
        el.tagName === 'BUTTON'
      );
      
      if (dumbbellElement) {
        console.log('🔍 Found Dumbbell option, clicking...');
        dumbbellElement.click();
        return true;
      }
      
      console.log('❌ Dumbbell option not found');
      console.log('Available options:', elements
        .filter(el => el.tagName === 'BUTTON' && el.textContent?.trim())
        .map(el => el.textContent?.trim())
      );
      return false;
    });
    
    if (!dumbbellClicked) {
      console.log('❌ Could not click Dumbbell option');
      return;
    }
    
    // Wait for filtering to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Count filtered exercises
    console.log('\n5. CHECKING FILTERED RESULTS...');
    const filteredCards = await page.$$eval('[class*="card"], [class*="exercise"]', elements => elements.length);
    console.log(`Filtered exercise cards: ${filteredCards}`);
    
    // Check if count changed
    console.log('\n6. RESULTS ANALYSIS:');
    console.log(`Initial: ${initialCards} exercises`);
    console.log(`Filtered: ${filteredCards} exercises`);
    console.log(`Expected: 11 dumbbell exercises`);
    
    if (filteredCards === 11) {
      console.log('✅ FILTERING WORKS CORRECTLY!');
    } else if (filteredCards === initialCards) {
      console.log('❌ NO FILTERING OCCURRED - Bug confirmed');
    } else {
      console.log('⚠️  UNEXPECTED RESULT - Need investigation');
    }
    
    // Analysis of console logs
    console.log('\n7. CONSOLE LOG ANALYSIS:');
    const filterLogs = logs.filter(log => 
      log.includes('🔥') || 
      log.includes('🔧') || 
      log.includes('🚨') ||
      log.includes('FILTER') ||
      log.includes('Equipment')
    );
    
    if (filterLogs.length === 0) {
      console.log('❌ NO FILTER DEBUG LOGS - Event handlers not firing');
    } else {
      console.log('📋 Filter-related logs:');
      filterLogs.forEach(log => console.log(`   ${log}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugEquipmentFilter();