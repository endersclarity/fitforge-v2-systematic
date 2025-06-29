const puppeteer = require('puppeteer');

async function testRecoveryData() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Enable console logging
  page.on('console', msg => {
    console.log('Browser console:', msg.text());
  });

  try {
    console.log('1. Navigating to recovery dashboard...');
    await page.goto('http://localhost:8080/flows-experimental/recovery', { 
      waitUntil: 'networkidle2' 
    });

    console.log('2. Checking localStorage for workout data...');
    const workoutData = await page.evaluate(() => {
      const sessions = localStorage.getItem('workoutSessions');
      const parsedSessions = sessions ? JSON.parse(sessions) : null;
      
      return {
        hasData: !!sessions,
        sessionCount: parsedSessions ? parsedSessions.length : 0,
        firstSession: parsedSessions && parsedSessions.length > 0 ? parsedSessions[0] : null
      };
    });

    console.log('\n📊 WORKOUT DATA CHECK:');
    console.log('Has data:', workoutData.hasData);
    console.log('Session count:', workoutData.sessionCount);
    
    if (workoutData.firstSession) {
      console.log('First session date:', workoutData.firstSession.date);
      console.log('Exercises:', workoutData.firstSession.exercises?.length || 0);
    }

    // Wait for recovery data to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check page content
    const pageContent = await page.content();
    const hasLoadingMessage = pageContent.includes('Loading recovery data');
    const hasDaysSince = pageContent.includes('DAYS SINCE YOUR LAST WORKOUT');
    const hasRecoveryStatus = pageContent.includes('Recovery Status');

    console.log('\n📄 PAGE CONTENT CHECK:');
    console.log('Still loading:', hasLoadingMessage);
    console.log('Shows days since workout:', hasDaysSince);
    console.log('Shows recovery status:', hasRecoveryStatus);

    // If no data, add some test data
    if (!workoutData.hasData) {
      console.log('\n🔧 Adding test workout data...');
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
              id: 'bicep_curl',
              name: 'Bicep Curl',
              sets: [
                { weight: 30, reps: 12, completed: true, rpe: 6 },
                { weight: 35, reps: 10, completed: true, rpe: 7 },
                { weight: 35, reps: 8, completed: true, rpe: 8 }
              ]
            }
          ]
        }];
        
        localStorage.setItem('workoutSessions', JSON.stringify(testSessions));
      });

      console.log('✅ Test data added, reloading page...');
      await page.reload({ waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Take screenshot
    await page.screenshot({ path: 'recovery-dashboard-test.png', fullPage: true });
    console.log('\n📸 Screenshot saved: recovery-dashboard-test.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testRecoveryData();