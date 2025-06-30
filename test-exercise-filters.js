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
    
    // Test equipment filter - click "Dumbbell"
    const dumbbellButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent.includes('Dumbbell'));
    });
    
    if (dumbbellButton && dumbbellButton.asElement()) {
      console.log('Found Dumbbell button, clicking...');
      await dumbbellButton.click();
      await page.waitForTimeout(500);
      
      const afterDumbbellCount = await page.$$eval('.grid > div', els => els.length);
      console.log(`After clicking Dumbbell: ${afterDumbbellCount} exercises`);
      
      if (afterDumbbellCount === initialCount) {
        console.log('❌ EQUIPMENT FILTER NOT WORKING - count unchanged');
      } else {
        console.log('✅ Equipment filter appears to work');
      }
    } else {
      console.log('❌ Could not find Dumbbell button');
    }
    
    // Test muscle filter - look for and click "Chest"
    const chestButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent.includes('Chest'));
    });
    
    if (chestButton && chestButton.asElement()) {
      console.log('Found Chest button, clicking...');
      await chestButton.click();
      await page.waitForTimeout(500);
      
      const afterChestCount = await page.$$eval('.grid > div', els => els.length);
      console.log(`After clicking Chest: ${afterChestCount} exercises`);
      
      if (afterChestCount === initialCount) {
        console.log('❌ MUSCLE FILTER NOT WORKING - count unchanged');
      } else {
        console.log('✅ Muscle filter appears to work');
      }
    } else {
      console.log('❌ Could not find Chest button');
    }
    
    // Get all visible filter buttons
    const filterButtons = await page.$$eval('button', buttons => 
      buttons.map(b => b.textContent).filter(text => text && text.length < 20)
    );
    console.log('\nVisible filter buttons:', filterButtons);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testExerciseFilters();