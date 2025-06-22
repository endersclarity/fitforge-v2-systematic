const puppeteer = require('puppeteer');

async function testVolumeProgression() {
  console.log('🧮 Testing Volume Progression Calculator...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // First, create some test workout data with sets
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
    
    // Create workout set history for testing
    const testSetHistory = [
      {
        date: new Date().toISOString().split('T')[0],
        sets: [
          { id: '1', exerciseId: 'bench-press', weight: 135, reps: 10 },
          { id: '2', exerciseId: 'bench-press', weight: 135, reps: 10 },
          { id: '3', exerciseId: 'bench-press', weight: 135, reps: 8 },
          { id: '4', exerciseId: 'squat', weight: 225, reps: 8 },
          { id: '5', exerciseId: 'squat', weight: 225, reps: 8 },
          { id: '6', exerciseId: 'squat', weight: 225, reps: 6 }
        ]
      }
    ];
    
    await page.evaluate((history) => {
      localStorage.setItem('workoutSetHistory', JSON.stringify(history));
    }, testSetHistory);
    
    console.log('✅ Created test workout set history');
    
    // Go to workout logger page
    await page.goto('http://localhost:8080/workout-simple', { waitUntil: 'networkidle2' });
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if volume progression calculator appears
    const hasCalculator = await page.evaluate(() => {
      const body = document.body.textContent;
      return body.includes('Progressive Overload Calculator') || 
             body.includes('Volume Progression Calculator');
    });
    
    console.log(`✅ Volume Calculator Present: ${hasCalculator}`);
    
    if (hasCalculator) {
      // Check for progression options
      const progressionInfo = await page.evaluate(() => {
        const body = document.body.textContent;
        return {
          hasWeightOption: body.includes('Increase Weight'),
          hasRepsOption: body.includes('Add Reps'),
          hasSetsOption: body.includes('Add Set'),
          hasRecommendation: body.includes('Recommended'),
          hasPercentages: body.includes('%')
        };
      });
      
      console.log('\n📊 Progression Features:');
      console.log(`   ✅ Weight Increase Option: ${progressionInfo.hasWeightOption}`);
      console.log(`   ✅ Reps Increase Option: ${progressionInfo.hasRepsOption}`);
      console.log(`   ✅ Sets Increase Option: ${progressionInfo.hasSetsOption}`);
      console.log(`   ✅ Shows Recommendations: ${progressionInfo.hasRecommendation}`);
      console.log(`   ✅ Shows Percentages: ${progressionInfo.hasPercentages}`);
    }
    
    // Test on analytics page too
    console.log('\n🔍 Testing on Analytics Page...');
    await page.goto('http://localhost:8080/analytics', { waitUntil: 'networkidle2' });
    
    // Add the calculator to analytics page for the next update
    const analyticsHasPlaceholder = await page.evaluate(() => {
      return document.body.textContent.includes('Volume Progression');
    });
    
    console.log(`✅ Analytics mentions Volume Progression: ${analyticsHasPlaceholder}`);
    
    console.log('\n✅ Volume Progression Calculator Test Complete!');
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testVolumeProgression();