const puppeteer = require('puppeteer');

async function testExerciseFilters() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to exercise browser
    await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
    await page.waitForSelector('.grid', { timeout: 5000 });
    
    // Count initial exercises
    const initialCount = await page.$$eval('.grid > div', els => els.length);
    console.log(`Initial exercise count: ${initialCount}`);
    
    // Test Equipment filter
    console.log('\n--- Testing Equipment Filter ---');
    
    // Click Equipment dropdown
    const equipmentDropdown = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent.trim() === 'Equipment');
    });
    
    if (equipmentDropdown && equipmentDropdown.asElement()) {
      console.log('Found Equipment dropdown, clicking...');
      await equipmentDropdown.click();
      await new Promise(r => setTimeout(r, 300));
      
      // Look for Dumbbell option in the dropdown menu
      const dumbbellOption = await page.evaluateHandle(() => {
        const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
        const dumbbellCheckbox = checkboxes.find(cb => {
          const label = cb.parentElement?.textContent || '';
          return label.includes('Dumbbell');
        });
        return dumbbellCheckbox;
      });
      
      if (dumbbellOption && dumbbellOption.asElement()) {
        console.log('Found Dumbbell option, clicking...');
        await dumbbellOption.click();
        await new Promise(r => setTimeout(r, 500));
        
        // Click outside to close dropdown
        await page.click('body');
        await new Promise(r => setTimeout(r, 500));
        
        const afterDumbbellCount = await page.$$eval('.grid > div', els => els.length);
        console.log(`After selecting Dumbbell: ${afterDumbbellCount} exercises`);
        
        if (afterDumbbellCount === initialCount) {
          console.log('❌ EQUIPMENT FILTER NOT WORKING - count unchanged');
        } else {
          console.log('✅ Equipment filter working! Reduced from', initialCount, 'to', afterDumbbellCount);
        }
      } else {
        console.log('❌ Could not find Dumbbell option in dropdown');
      }
    } else {
      console.log('❌ Could not find Equipment dropdown');
    }
    
    // Test Target Muscle filter
    console.log('\n--- Testing Target Muscle Filter ---');
    
    // Click Target Muscle dropdown
    const muscleDropdown = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent.trim() === 'Target Muscle');
    });
    
    if (muscleDropdown && muscleDropdown.asElement()) {
      console.log('Found Target Muscle dropdown, clicking...');
      await muscleDropdown.click();
      await new Promise(r => setTimeout(r, 300));
      
      // Look for Chest option
      const chestOption = await page.evaluateHandle(() => {
        const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
        const chestCheckbox = checkboxes.find(cb => {
          const label = cb.parentElement?.textContent || '';
          return label.includes('Chest');
        });
        return chestCheckbox;
      });
      
      if (chestOption && chestOption.asElement()) {
        console.log('Found Chest option, clicking...');
        await chestOption.click();
        await new Promise(r => setTimeout(r, 500));
        
        // Click outside to close dropdown
        await page.click('body');
        await new Promise(r => setTimeout(r, 500));
        
        const afterChestCount = await page.$$eval('.grid > div', els => els.length);
        console.log(`After selecting Chest: ${afterChestCount} exercises`);
        
        if (afterChestCount === initialCount) {
          console.log('❌ MUSCLE FILTER NOT WORKING - count unchanged');
        } else {
          console.log('✅ Muscle filter working! Changed exercise count');
        }
      } else {
        console.log('❌ Could not find Chest option in dropdown');
      }
    } else {
      console.log('❌ Could not find Target Muscle dropdown');
    }
    
    // Check console logs
    const consoleLogs = await page.evaluate(() => {
      return window.__consoleLogs || [];
    });
    
    console.log('\n--- Console Logs ---');
    consoleLogs.forEach(log => console.log(log));
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Inject console log capture
const originalLog = console.log;
console.log = function(...args) {
  originalLog.apply(console, args);
};

testExerciseFilters();