const puppeteer = require('puppeteer');

async function testExerciseFilters() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.text().includes('FILTER DEBUG') || msg.text().includes('Filter state changed')) {
      console.log('Browser console:', msg.text());
    }
  });
  
  try {
    // Navigate to exercise browser
    await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
    await page.waitForSelector('.grid', { timeout: 5000 });
    
    // Count initial exercises
    const initialCount = await page.$$eval('.grid > div', els => els.length);
    console.log(`Initial exercise count: ${initialCount}`);
    
    // Test Equipment filter by clicking the dropdown and then checking its structure
    console.log('\n--- Testing Equipment Filter ---');
    
    // Click Equipment dropdown to open it
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const equipButton = buttons.find(b => b.textContent.trim() === 'Equipment');
      if (equipButton) equipButton.click();
    });
    
    await new Promise(r => setTimeout(r, 500));
    
    // Now check what elements are visible
    const dropdownInfo = await page.evaluate(() => {
      const info = {
        hasPopover: !!document.querySelector('[data-radix-popper-content-wrapper]'),
        hasMenu: !!document.querySelector('[role="menu"]'),
        checkboxCount: document.querySelectorAll('input[type="checkbox"]').length,
        labels: []
      };
      
      // Get all checkbox labels
      document.querySelectorAll('label').forEach(label => {
        const checkbox = label.querySelector('input[type="checkbox"]');
        if (checkbox) {
          info.labels.push(label.textContent.trim());
        }
      });
      
      return info;
    });
    
    console.log('Dropdown structure:', dropdownInfo);
    
    if (dropdownInfo.labels.includes('Dumbbell')) {
      // Click the Dumbbell checkbox
      await page.evaluate(() => {
        const labels = Array.from(document.querySelectorAll('label'));
        const dumbbellLabel = labels.find(label => label.textContent.trim() === 'Dumbbell');
        if (dumbbellLabel) {
          const checkbox = dumbbellLabel.querySelector('input[type="checkbox"]');
          if (checkbox) checkbox.click();
        }
      });
      
      await new Promise(r => setTimeout(r, 500));
      
      // Close dropdown by clicking outside
      await page.click('body');
      await new Promise(r => setTimeout(r, 500));
      
      const afterCount = await page.$$eval('.grid > div', els => els.length);
      console.log(`After selecting Dumbbell: ${afterCount} exercises`);
      
      if (afterCount === initialCount) {
        console.log('❌ EQUIPMENT FILTER NOT WORKING - count unchanged');
      } else {
        console.log('✅ Equipment filter working! Reduced from', initialCount, 'to', afterCount);
      }
    } else {
      console.log('❌ Dumbbell option not found in dropdown labels:', dropdownInfo.labels);
    }
    
    // Reset by refreshing
    await page.reload();
    await page.waitForSelector('.grid', { timeout: 5000 });
    
    // Test Target Muscle filter
    console.log('\n--- Testing Target Muscle Filter ---');
    
    // Click Target Muscle dropdown
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const muscleButton = buttons.find(b => b.textContent.trim() === 'Target Muscle');
      if (muscleButton) muscleButton.click();
    });
    
    await new Promise(r => setTimeout(r, 500));
    
    // Check muscle dropdown
    const muscleDropdownInfo = await page.evaluate(() => {
      const info = {
        labels: []
      };
      
      document.querySelectorAll('label').forEach(label => {
        const checkbox = label.querySelector('input[type="checkbox"]');
        if (checkbox) {
          info.labels.push(label.textContent.trim());
        }
      });
      
      return info;
    });
    
    console.log('Muscle dropdown labels:', muscleDropdownInfo.labels);
    
    if (muscleDropdownInfo.labels.includes('Chest')) {
      // Click Chest checkbox
      await page.evaluate(() => {
        const labels = Array.from(document.querySelectorAll('label'));
        const chestLabel = labels.find(label => label.textContent.trim() === 'Chest');
        if (chestLabel) {
          const checkbox = chestLabel.querySelector('input[type="checkbox"]');
          if (checkbox) checkbox.click();
        }
      });
      
      await new Promise(r => setTimeout(r, 500));
      
      // Close dropdown
      await page.click('body');
      await new Promise(r => setTimeout(r, 500));
      
      const afterChestCount = await page.$$eval('.grid > div', els => els.length);
      console.log(`After selecting Chest: ${afterChestCount} exercises`);
      
      if (afterChestCount === 38) {
        console.log('❌ MUSCLE FILTER NOT WORKING - still showing all 38 exercises');
        
        // Let's check what exercises are being shown
        const visibleExercises = await page.$$eval('.grid h3', els => 
          els.slice(0, 5).map(el => el.textContent)
        );
        console.log('First 5 visible exercises:', visibleExercises);
      } else {
        console.log('✅ Muscle filter working! Count changed to', afterChestCount);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testExerciseFilters();