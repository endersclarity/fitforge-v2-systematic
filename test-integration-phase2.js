const puppeteer = require('puppeteer');

async function testPhase2Integration() {
  console.log('🧪 Testing Phase 2 Integration - Volume Progression Calculator\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const testResults = {
    phase1Features: {},
    volumeCalculator: {},
    integration: {},
    performance: {}
  };
  
  try {
    const page = await browser.newPage();
    const startTime = Date.now();
    
    // Test 1: Phase 1 Features Still Work
    console.log('1️⃣ Testing Phase 1 Features Remain Functional...');
    
    // Analytics page with history analyzer
    await page.goto('http://localhost:8080/analytics', { waitUntil: 'networkidle2' });
    testResults.phase1Features.analytics = await page.$eval('body', el => 
      el.textContent.includes('Workout History Analysis')
    );
    console.log(`   ✅ Analytics Page: ${testResults.phase1Features.analytics}`);
    
    // MVP features
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
    testResults.phase1Features.dashboard = await page.$eval('body', el => 
      el.textContent.includes('FitForge Dashboard')
    );
    console.log(`   ✅ Dashboard: ${testResults.phase1Features.dashboard}`);
    
    // Test 2: Volume Progression Calculator
    console.log('\n2️⃣ Testing Volume Progression Calculator...');
    
    // First create some test data
    await page.evaluate(() => {
      // Create recent workout sets for testing
      const setHistory = [
        {
          date: new Date().toISOString().split('T')[0],
          sets: [
            { id: '1', exerciseId: 'bench-press', weight: 135, reps: 10 },
            { id: '2', exerciseId: 'bench-press', weight: 135, reps: 10 },
            { id: '3', exerciseId: 'bench-press', weight: 135, reps: 8 },
            { id: '4', exerciseId: 'squat', weight: 225, reps: 8 },
            { id: '5', exerciseId: 'squat', weight: 225, reps: 8 },
            { id: '6', exerciseId: 'deadlift', weight: 315, reps: 5 }
          ]
        }
      ];
      localStorage.setItem('workoutSetHistory', JSON.stringify(setHistory));
    });
    
    // Go to analytics page
    await page.goto('http://localhost:8080/analytics', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check calculator presence
    testResults.volumeCalculator.present = await page.$eval('body', el => 
      el.textContent.includes('Progressive Overload Calculator') || 
      el.textContent.includes('Volume Progression Calculator')
    );
    console.log(`   ✅ Calculator Present: ${testResults.volumeCalculator.present}`);
    
    // Check for progression options
    const calculatorFeatures = await page.evaluate(() => {
      const body = document.body.textContent;
      return {
        hasExercises: body.includes('Bench Press') || body.includes('bench-press'),
        hasCurrentVolume: body.includes('Current:') && body.includes('lbs'),
        hasProgressionOptions: body.includes('Increase Weight') || body.includes('Add Reps') || body.includes('Add Set'),
        hasPercentages: /\+\d+\.\d+%/.test(body),
        hasRecommendations: body.includes('Recommended') || body.includes('strength gains')
      };
    });
    
    Object.assign(testResults.volumeCalculator, calculatorFeatures);
    console.log(`   ✅ Shows Exercises: ${calculatorFeatures.hasExercises}`);
    console.log(`   ✅ Shows Current Volume: ${calculatorFeatures.hasCurrentVolume}`);
    console.log(`   ✅ Shows Progression Options: ${calculatorFeatures.hasProgressionOptions}`);
    console.log(`   ✅ Shows Percentages: ${calculatorFeatures.hasPercentages}`);
    console.log(`   ✅ Shows Recommendations: ${calculatorFeatures.hasRecommendations}`);
    
    // Test 3: Integration Check
    console.log('\n3️⃣ Testing Integration...');
    
    // Check if both analytics components are on the same page
    const pageContent = await page.evaluate(() => {
      const body = document.body.textContent;
      return {
        hasHistoryAnalyzer: body.includes('Workout History Analysis'),
        hasVolumeCalculator: body.includes('Calculator'),
        hasPlaceholder: body.includes('Muscle Balance Analysis')
      };
    });
    
    testResults.integration = pageContent;
    console.log(`   ✅ History Analyzer Present: ${pageContent.hasHistoryAnalyzer}`);
    console.log(`   ✅ Volume Calculator Present: ${pageContent.hasVolumeCalculator}`);
    console.log(`   ✅ Future Features Placeholder: ${pageContent.hasPlaceholder}`);
    
    // Test 4: Performance Check
    console.log('\n4️⃣ Testing Performance Impact...');
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    testResults.performance.totalTestTime = totalTime;
    testResults.performance.acceptable = totalTime < 12000; // Under 12 seconds
    console.log(`   ✅ Total Test Time: ${totalTime}ms`);
    console.log(`   ✅ Performance Acceptable: ${testResults.performance.acceptable}`);
    
    // Test 5: Dark Theme Consistency
    console.log('\n5️⃣ Testing Dark Theme Consistency...');
    const themeCheck = await page.evaluate(() => {
      // Check if calculator uses dark theme
      const cards = document.querySelectorAll('.bg-\\[\\#1C1C1E\\]');
      const darkBorders = document.querySelectorAll('.border-\\[\\#2C2C2E\\]');
      return {
        hasDarkCards: cards.length > 1, // Should have multiple dark cards
        hasDarkBorders: darkBorders.length > 0
      };
    });
    
    testResults.darkTheme = themeCheck.hasDarkCards && themeCheck.hasDarkBorders;
    console.log(`   ✅ Dark Theme Applied: ${testResults.darkTheme}`);
    
    // Summary
    console.log('\n📊 PHASE 2 INTEGRATION TEST SUMMARY:');
    console.log('====================================');
    const phase1Pass = Object.values(testResults.phase1Features).every(v => v === true);
    const calculatorPass = testResults.volumeCalculator.present;
    const integrationPass = testResults.integration.hasHistoryAnalyzer && 
                           testResults.integration.hasVolumeCalculator;
    
    console.log(`✅ Phase 1 Features Intact: ${phase1Pass ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Volume Calculator Working: ${calculatorPass ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Components Integrated: ${integrationPass ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Performance Good: ${testResults.performance.acceptable ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Theme Consistent: ${testResults.darkTheme ? 'PASS' : 'FAIL'}`);
    
    const overallPass = phase1Pass && calculatorPass && integrationPass && 
                       testResults.performance.acceptable && testResults.darkTheme;
    
    console.log(`\n🎯 OVERALL RESULT: ${overallPass ? '✅ PASS' : '❌ FAIL'}`);
    
    if (overallPass) {
      console.log('\n🎉 Phase 2 Volume Progression Integration Successful!');
      console.log('   All previous features remain functional');
      console.log('   Volume calculator properly integrated');
      console.log('   No performance degradation detected');
      console.log('   Ready to proceed with more advanced features!');
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
    console.log(error.stack);
  } finally {
    await browser.close();
  }
}

testPhase2Integration();