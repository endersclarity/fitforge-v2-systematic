const puppeteer = require('puppeteer');

async function testExerciseFilters() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Filter state changed') || text.includes('FILTER DEBUG') || text.includes('BUTTON CLICKED')) {
      console.log('Browser console:', text);
    }
  });
  
  try {
    // Navigate to exercise browser
    await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
    await page.waitForSelector('.grid', { timeout: 5000 });
    
    // Count initial exercises
    const initialCount = await page.$$eval('.grid > div', els => els.length);
    console.log(`Initial exercise count: ${initialCount}`);
    
    // Test Equipment filter
    console.log('\n--- Testing Equipment Filter ---');
    
    // Click Equipment dropdown button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const equipButton = buttons.find(b => {
        const text = b.textContent?.trim();
        return text === 'Equipment' || text?.startsWith('Equipment');
      });
      if (equipButton) {
        console.log('Clicking Equipment button');
        equipButton.click();
      }
    });
    
    await new Promise(r => setTimeout(r, 300));
    
    // Find and click Dumbbell in the portal dropdown
    const clickedDumbbell = await page.evaluate(() => {
      // Portal dropdowns are rendered at document.body level
      const dropdownButtons = Array.from(document.querySelectorAll('.fixed button'));
      const dumbbellButton = dropdownButtons.find(btn => 
        btn.textContent?.trim() === 'Dumbbell'
      );
      
      if (dumbbellButton) {
        console.log('Found Dumbbell button in dropdown, clicking...');
        dumbbellButton.click();
        return true;
      }
      return false;
    });
    
    if (clickedDumbbell) {
      await new Promise(r => setTimeout(r, 500));
      
      // Click outside to close dropdown
      await page.click('body');
      await new Promise(r => setTimeout(r, 300));
      
      const afterCount = await page.$$eval('.grid > div', els => els.length);
      console.log(`After selecting Dumbbell: ${afterCount} exercises`);
      
      if (afterCount === initialCount) {
        console.log('❌ EQUIPMENT FILTER NOT WORKING - count unchanged');
        
        // Check what exercises are shown
        const exercises = await page.$$eval('.grid h3', els => 
          els.slice(0, 3).map(el => el.textContent)
        );
        console.log('First 3 exercises:', exercises);
      } else {
        console.log('✅ Equipment filter working! Reduced from', initialCount, 'to', afterCount);
        
        // Verify they're all dumbbell exercises
        const equipment = await page.$$eval('.grid p.text-sm', els => 
          els.slice(0, 3).map(el => el.textContent)
        );
        console.log('Equipment of first 3:', equipment);
      }
    } else {
      console.log('❌ Could not find Dumbbell option in dropdown');
    }
    
    // Reset page
    await page.reload();
    await page.waitForSelector('.grid', { timeout: 5000 });
    
    // Test Target Muscle filter
    console.log('\n--- Testing Target Muscle Filter ---');
    
    // Click Target Muscle dropdown
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const muscleButton = buttons.find(b => {
        const text = b.textContent?.trim();
        return text === 'Target Muscle' || text?.startsWith('Target Muscle');
      });
      if (muscleButton) {
        console.log('Clicking Target Muscle button');
        muscleButton.click();
      }
    });
    
    await new Promise(r => setTimeout(r, 300));
    
    // Find and click Chest
    const clickedChest = await page.evaluate(() => {
      const dropdownButtons = Array.from(document.querySelectorAll('.fixed button'));
      const chestButton = dropdownButtons.find(btn => 
        btn.textContent?.trim() === 'Chest'
      );
      
      if (chestButton) {
        console.log('Found Chest button, clicking...');
        chestButton.click();
        return true;
      }
      
      // Log what options we see
      const options = dropdownButtons.map(btn => btn.textContent?.trim()).filter(Boolean);
      console.log('Available muscle options:', options);
      return false;
    });
    
    if (clickedChest) {
      await new Promise(r => setTimeout(r, 500));
      
      // Close dropdown
      await page.click('body');
      await new Promise(r => setTimeout(r, 300));
      
      const afterChestCount = await page.$$eval('.grid > div', els => els.length);
      console.log(`After selecting Chest: ${afterChestCount} exercises`);
      
      if (afterChestCount === 38) {
        console.log('❌ MUSCLE FILTER NOT WORKING - still showing all exercises');
      } else {
        console.log('✅ Muscle filter appears to work! Count:', afterChestCount);
        
        // Check which exercises are shown
        const exercises = await page.$$eval('.grid h3', els => 
          els.slice(0, 5).map(el => el.textContent)
        );
        console.log('First 5 exercises:', exercises);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testExerciseFilters();