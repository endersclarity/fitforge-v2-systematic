const puppeteer = require('puppeteer');

async function testMinimalPage() {
  console.log('🧪 Testing Minimal Page Detailed...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Log all console messages
  page.on('console', msg => {
    console.log(`Console [${msg.type()}]: ${msg.text()}`);
  });
  
  try {
    await page.goto('http://localhost:8080/minimal', { waitUntil: 'networkidle2' });
    console.log('✅ Page loaded');
    
    // Get page content
    const content = await page.content();
    const hasLogger = content.includes('Log Workout');
    const hasDashboard = content.includes('Recent Workouts');
    
    console.log(`Logger section present: ${hasLogger ? '✅' : '❌'}`);
    console.log(`Dashboard section present: ${hasDashboard ? '✅' : '❌'}`);
    
    // Test form inputs
    const exerciseInput = await page.$('input[placeholder="Exercise name"]');
    if (exerciseInput) {
      await exerciseInput.type('Bench Press');
      console.log('✅ Typed exercise name');
    } else {
      console.log('❌ Exercise input not found');
    }
    
    const weightInput = await page.$('input[placeholder="Weight"]');
    if (weightInput) {
      await weightInput.type('135');
      console.log('✅ Typed weight');
    } else {
      console.log('❌ Weight input not found');
    }
    
    const repsInput = await page.$('input[placeholder="Reps"]');
    if (repsInput) {
      await repsInput.type('10');
      console.log('✅ Typed reps');
    } else {
      console.log('❌ Reps input not found');
    }
    
    // Find and click Add Set button
    const addButton = await page.$x("//button[contains(text(), 'Add Set')]");
    if (addButton.length > 0) {
      await addButton[0].click();
      console.log('✅ Clicked Add Set button');
      await page.waitForTimeout(500);
      
      // Check if set was added
      const setText = await page.$eval('body', el => el.textContent);
      if (setText.includes('1. Bench Press')) {
        console.log('✅ Set appears in UI');
        
        // Now try to save workout
        const saveButton = await page.$x("//button[contains(text(), 'Save Workout')]");
        if (saveButton.length > 0) {
          await saveButton[0].click();
          console.log('✅ Clicked Save Workout');
          
          // Wait for alert
          await page.waitForTimeout(1000);
          
          // Check localStorage
          const stored = await page.evaluate(() => localStorage.getItem('workoutSessions'));
          if (stored) {
            const sessions = JSON.parse(stored);
            console.log(`✅ Data in localStorage: ${sessions.length} workout(s)`);
            console.log('📦 First workout:', JSON.stringify(sessions[0], null, 2));
          } else {
            console.log('❌ No data in localStorage');
          }
        } else {
          console.log('❌ Save button not found');
        }
      } else {
        console.log('❌ Set not visible in UI');
      }
    } else {
      console.log('❌ Add Set button not found');
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
  
  await browser.close();
}

testMinimalPage().catch(console.error);