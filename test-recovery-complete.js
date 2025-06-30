const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log('Setting up comprehensive test data...');
  await page.goto('http://localhost:8080');
  
  // Set more comprehensive workout data
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
        },
        {
          id: 'squat',
          name: 'Squat',
          sets: [
            { weight: 225, reps: 8, completed: true, rpe: 8 },
            { weight: 245, reps: 6, completed: true, rpe: 9 }
          ]
        }
      ]
    }, {
      id: 'test-2',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      exercises: [
        {
          id: 'deadlift',
          name: 'Deadlift',
          sets: [
            { weight: 315, reps: 5, completed: true, rpe: 9 }
          ]
        }
      ]
    }];
    
    localStorage.setItem('workoutSessions', JSON.stringify(testSessions));
  });
  
  console.log('Navigating to recovery dashboard...');
  await page.goto('http://localhost:8080/flows-experimental/recovery');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Check all features
  const analysis = await page.evaluate(() => {
    const results = {
      // Basic page info
      pageTitle: document.querySelector('h1')?.textContent,
      daysSince: document.querySelector('.text-6xl')?.textContent,
      
      // Recovery stats
      freshMuscles: document.querySelector('.text-3xl')?.textContent,
      
      // Heat map
      heatMapFound: document.body.textContent.includes('Muscle Heat Map'),
      
      // Check for actual muscle visualization
      muscleGroups: Array.from(document.querySelectorAll('.space-y-2 h4')).map(el => el.textContent),
      
      // Training recommendations
      recommendationsFound: document.body.textContent.includes('Training Recommendations'),
      
      // Edit button
      editButtonText: Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Edit'))?.textContent
    };
    return results;
  });
  
  console.log('\nComplete Feature Analysis:');
  console.log('==========================');
  console.log('Page Title:', analysis.pageTitle);
  console.log('Days Since Workout:', analysis.daysSince);
  console.log('Fresh Muscles Count:', analysis.freshMuscles);
  console.log('Heat Map Found:', analysis.heatMapFound);
  console.log('Muscle Groups:', analysis.muscleGroups);
  console.log('Training Recommendations:', analysis.recommendationsFound);
  console.log('Edit Button:', analysis.editButtonText);
  
  await browser.close();
})();
