const puppeteer = require('puppeteer');

async function generateTestWorkoutData() {
  console.log('🏋️ Generating test workout data for analytics...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
    
    // Generate workout data for the past 30 days
    const workoutData = [];
    const today = new Date();
    
    // Create 15 workouts over the past 30 days
    for (let i = 0; i < 15; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const workoutDate = new Date(today);
      workoutDate.setDate(today.getDate() - daysAgo);
      
      const exercises = [
        { id: 'bench-press', name: 'Bench Press', sets: 3 + Math.floor(Math.random() * 2) },
        { id: 'squat', name: 'Squat', sets: 4 + Math.floor(Math.random() * 2) },
        { id: 'deadlift', name: 'Deadlift', sets: 3 + Math.floor(Math.random() * 2) },
        { id: 'pull-up', name: 'Pull-Up', sets: 3 + Math.floor(Math.random() * 2) },
        { id: 'shoulder-press', name: 'Shoulder Press', sets: 3 + Math.floor(Math.random() * 2) }
      ];
      
      // Random selection of exercises (2-4 per workout)
      const exerciseCount = 2 + Math.floor(Math.random() * 3);
      const selectedExercises = exercises
        .sort(() => Math.random() - 0.5)
        .slice(0, exerciseCount);
      
      const totalSets = selectedExercises.reduce((sum, ex) => sum + ex.sets, 0);
      
      workoutData.push({
        id: `workout-${Date.now()}-${i}`,
        name: `Workout ${workoutDate.toLocaleDateString()}`,
        date: workoutDate.toISOString(),
        duration: 30 + Math.floor(Math.random() * 45), // 30-75 minutes
        exercises: selectedExercises,
        totalSets: totalSets
      });
    }
    
    // Sort by date
    workoutData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Save to localStorage
    await page.evaluate((data) => {
      localStorage.setItem('workoutSessions', JSON.stringify(data));
    }, workoutData);
    
    console.log(`✅ Generated ${workoutData.length} workouts`);
    console.log(`📅 Date range: ${workoutData[0].date.split('T')[0]} to ${workoutData[workoutData.length - 1].date.split('T')[0]}`);
    console.log(`💪 Total sets: ${workoutData.reduce((sum, w) => sum + w.totalSets, 0)}`);
    
    // Test the analytics page
    console.log('\n🔍 Testing Analytics Page...');
    await page.goto('http://localhost:8080/analytics', { waitUntil: 'networkidle2' });
    
    // Wait for analytics to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if analytics loaded
    const analyticsLoaded = await page.$eval('body', el => {
      return el.textContent.includes('Total Workouts') && 
             el.textContent.includes('Consistency Score');
    });
    
    if (analyticsLoaded) {
      console.log('✅ Analytics page loaded successfully!');
      
      // Get some stats
      const stats = await page.evaluate(() => {
        const getText = (selector) => {
          const el = document.querySelector(selector);
          return el ? el.textContent : null;
        };
        
        return {
          hasOverview: document.body.textContent.includes('Overview'),
          hasTrends: document.body.textContent.includes('Trends'),
          hasExercises: document.body.textContent.includes('Exercises')
        };
      });
      
      console.log('\n📊 Analytics Features:');
      console.log(`   ✅ Overview Tab: ${stats.hasOverview}`);
      console.log(`   ✅ Trends Tab: ${stats.hasTrends}`);
      console.log(`   ✅ Exercises Tab: ${stats.hasExercises}`);
    } else {
      console.log('❌ Analytics page failed to load properly');
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

generateTestWorkoutData();