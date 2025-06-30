const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log('1. Setting up test data...');
  // Navigate to the app
  await page.goto('http://localhost:8080');
  
  // Set test workout data in localStorage
  await page.evaluate(() => {
    const testSessions = [{
      id: 'test-1',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      exercises: [
        {
          id: 'bench_press',
          name: 'Bench Press',
          sets: [
            { weight: 135, reps: 10, completed: true, rpe: 7 },
            { weight: 155, reps: 8, completed: true, rpe: 8 },
            { weight: 175, reps: 6, completed: true, rpe: 9 }
          ]
        }
      ]
    }];
    
    localStorage.setItem('workoutSessions', JSON.stringify(testSessions));
  });
  
  console.log('2. Navigating to recovery dashboard...');
  // Navigate to recovery dashboard
  await page.goto('http://localhost:8080/flows-experimental/recovery');
  
  // Wait for content to load
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('3. Checking page content...');
  // Get page content
  const content = await page.evaluate(() => {
    const results = {
      title: document.querySelector('h1')?.textContent || 'NOT FOUND',
      daysSince: document.querySelector('.text-6xl')?.textContent || 'NOT FOUND',
      muscleCards: Array.from(document.querySelectorAll('.text-gray-400')).map(el => el.textContent),
      heatMapFound: document.body.textContent.includes('Muscle Heat Map'),
      recoveryStats: Array.from(document.querySelectorAll('[class*="Fresh"], [class*="Recovering"], [class*="Fatigued"]')).map(el => el.textContent),
      loading: document.body.textContent.includes('Loading recovery data')
    };
    return results;
  });
  
  console.log('\nRecovery Dashboard Test Results:');
  console.log('================================');
  console.log('Title:', content.title);
  console.log('Days Since Last Workout:', content.daysSince);
  console.log('Heat Map Found:', content.heatMapFound);
  console.log('Is Loading?:', content.loading);
  console.log('Recovery Stats:', content.recoveryStats);
  console.log('Muscle Cards (first 5):', content.muscleCards.slice(0, 5));
  
  // Take a screenshot
  await page.screenshot({ path: 'recovery-dashboard-actual.png' });
  console.log('\nScreenshot saved: recovery-dashboard-actual.png');
  
  await browser.close();
})();
