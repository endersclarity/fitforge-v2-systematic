const puppeteer = require('puppeteer');

async function testFitForge() {
  console.log('🚀 Starting FitForge Automated Testing...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {
    pageErrors: {},
    consoleErrors: {},
    functionality: {}
  };

  // Test each page
  const pages = ['/', '/minimal', '/test-logger', '/diagnostic', '/workouts', '/dashboard'];
  
  for (const pagePath of pages) {
    console.log(`\n📄 Testing ${pagePath}...`);
    const page = await browser.newPage();
    
    // Capture console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    try {
      const response = await page.goto(`http://localhost:8080${pagePath}`, {
        waitUntil: 'networkidle2',
        timeout: 10000
      });
      
      console.log(`  Status: ${response.status()}`);
      
      if (errors.length > 0) {
        console.log(`  ❌ Console errors found:`);
        errors.forEach(err => console.log(`     - ${err}`));
        results.consoleErrors[pagePath] = errors;
      } else {
        console.log(`  ✅ No console errors`);
      }
      
      // Take screenshot for debugging
      await page.screenshot({ path: `/tmp/fitforge-${pagePath.replace('/', 'root')}.png` });
      
    } catch (error) {
      console.log(`  ❌ Page error: ${error.message}`);
      results.pageErrors[pagePath] = error.message;
    }
    
    await page.close();
  }
  
  // Test minimal page functionality
  console.log('\n🧪 Testing Minimal Page Functionality...');
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:8080/minimal', { waitUntil: 'networkidle2' });
    
    // Test adding a set
    await page.type('input[placeholder="Exercise name"]', 'Bench Press');
    await page.type('input[placeholder="Weight"]', '135');
    await page.type('input[placeholder="Reps"]', '10');
    
    // Click Add Set
    await page.click('button:has-text("Add Set")');
    await page.waitForTimeout(500);
    
    // Check if set appears
    const setVisible = await page.$eval('div:has-text("1. Bench Press")', el => el.textContent);
    if (setVisible) {
      console.log('  ✅ Set added successfully');
      results.functionality.addSet = true;
    } else {
      console.log('  ❌ Set not visible');
      results.functionality.addSet = false;
    }
    
    // Click Save Workout
    await page.click('button:has-text("Save Workout")');
    await page.waitForTimeout(1000);
    
    // Check localStorage
    const localStorageData = await page.evaluate(() => {
      return localStorage.getItem('workoutSessions');
    });
    
    if (localStorageData) {
      const sessions = JSON.parse(localStorageData);
      console.log(`  ✅ Workout saved to localStorage: ${sessions.length} session(s)`);
      results.functionality.localStorage = true;
    } else {
      console.log('  ❌ No data in localStorage');
      results.functionality.localStorage = false;
    }
    
  } catch (error) {
    console.log(`  ❌ Functionality test failed: ${error.message}`);
    results.functionality.error = error.message;
  }
  
  await browser.close();
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  console.log(`Pages with errors: ${Object.keys(results.consoleErrors).length}`);
  console.log(`Page load failures: ${Object.keys(results.pageErrors).length}`);
  console.log(`Functionality working: ${results.functionality.addSet && results.functionality.localStorage ? '✅' : '❌'}`);
  
  return results;
}

// Run tests
testFitForge().catch(console.error);