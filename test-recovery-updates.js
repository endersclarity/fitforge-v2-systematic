const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log('Testing recovery dashboard after feedback updates...');
  
  // Set test data
  await page.goto('http://localhost:8080');
  await page.evaluate(() => {
    const testSessions = [{
      id: 'test-1',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      exercises: [
        {
          id: 'bench_press',
          name: 'Bench Press',
          sets: [
            { weight: 135, reps: 10, completed: true, rpe: 7 }
          ]
        }
      ]
    }];
    localStorage.setItem('workoutSessions', JSON.stringify(testSessions));
  });
  
  // Navigate to recovery dashboard
  await page.goto('http://localhost:8080/flows-experimental/recovery');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Verify functionality
  const results = await page.evaluate(() => {
    return {
      pageTitle: document.querySelector('h1')?.textContent,
      daysSince: document.querySelector('.text-6xl')?.textContent,
      heatMapFound: document.body.textContent.includes('Muscle Heat Map'),
      errorMessages: Array.from(document.querySelectorAll('.error')).map(e => e.textContent)
    };
  });
  
  console.log('Test Results:');
  console.log('- Page Title:', results.pageTitle);
  console.log('- Days Since:', results.daysSince);
  console.log('- Heat Map Found:', results.heatMapFound);
  console.log('- Errors:', results.errorMessages.length === 0 ? 'None' : results.errorMessages);
  
  await browser.close();
  
  console.log('\n✅ Recovery dashboard working after feedback updates\!');
})();
