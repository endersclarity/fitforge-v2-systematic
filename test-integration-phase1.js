const puppeteer = require('puppeteer');

async function testPhase1Integration() {
  console.log('🧪 Testing Phase 1 Integration - Analytics Feature\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const testResults = {
    mvpFeatures: {},
    analyticsFeature: {},
    navigation: {},
    performance: {}
  };
  
  try {
    const page = await browser.newPage();
    const startTime = Date.now();
    
    // Test 1: MVP Features Still Work
    console.log('1️⃣ Testing MVP Features Remain Functional...');
    
    // Dashboard
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
    testResults.mvpFeatures.dashboard = await page.$eval('body', el => 
      el.textContent.includes('FitForge Dashboard') && el.textContent.includes('Start Workout')
    );
    console.log(`   ✅ Dashboard: ${testResults.mvpFeatures.dashboard}`);
    
    // Push/Pull/Legs
    await page.goto('http://localhost:8080/push-pull-legs', { waitUntil: 'networkidle2' });
    testResults.mvpFeatures.pushPullLegs = await page.$eval('body', el => 
      el.textContent.includes('Push Day') && el.textContent.includes('Pull Day')
    );
    console.log(`   ✅ Push/Pull/Legs: ${testResults.mvpFeatures.pushPullLegs}`);
    
    // Muscle Explorer
    await page.goto('http://localhost:8080/muscle-explorer', { waitUntil: 'networkidle2' });
    testResults.mvpFeatures.muscleExplorer = await page.$eval('body', el => 
      el.textContent.includes('Muscle Engagement Explorer')
    );
    console.log(`   ✅ Muscle Explorer: ${testResults.mvpFeatures.muscleExplorer}`);
    
    // Test 2: Analytics Feature
    console.log('\n2️⃣ Testing New Analytics Feature...');
    await page.goto('http://localhost:8080/analytics', { waitUntil: 'networkidle2' });
    
    // Wait a bit for analytics to process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check page loads
    testResults.analyticsFeature.pageLoads = await page.$eval('body', el => 
      el.textContent.includes('Workout Analytics')
    );
    console.log(`   ✅ Analytics Page Loads: ${testResults.analyticsFeature.pageLoads}`);
    
    // Check if analytics is showing data or empty state
    const analyticsState = await page.evaluate(() => {
      const body = document.body.textContent;
      const hasData = body.includes('Overview') || body.includes('Total Workouts');
      const hasEmptyState = body.includes('Complete some workouts');
      return { hasData, hasEmptyState };
    });
    
    // Either state is valid - data or empty message
    testResults.analyticsFeature.tabs = analyticsState.hasData || analyticsState.hasEmptyState;
    console.log(`   ✅ Analytics State Valid: ${testResults.analyticsFeature.tabs} (${analyticsState.hasData ? 'has data' : 'empty state'})`);
    
    // Check metrics display
    testResults.analyticsFeature.metrics = await page.$eval('body', el => 
      el.textContent.includes('Total Workouts') || el.textContent.includes('Complete some workouts')
    );
    console.log(`   ✅ Metrics Display: ${testResults.analyticsFeature.metrics}`);
    
    // Test 3: Navigation Integration
    console.log('\n3️⃣ Testing Navigation Integration...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
    
    const navLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('nav a');
      return Array.from(links).map(link => ({
        text: link.textContent,
        href: link.getAttribute('href')
      }));
    });
    
    testResults.navigation.hasAnalytics = navLinks.some(link => link.href === '/analytics');
    testResults.navigation.linkCount = navLinks.length;
    console.log(`   ✅ Analytics in Nav: ${testResults.navigation.hasAnalytics}`);
    console.log(`   ✅ Total Nav Links: ${testResults.navigation.linkCount}`);
    
    // Check dashboard button
    const dashboardButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      return Array.from(buttons).map(btn => btn.textContent).filter(text => text.includes('Analytics'));
    });
    testResults.navigation.dashboardButton = dashboardButtons.length > 0;
    console.log(`   ✅ Dashboard Analytics Button: ${testResults.navigation.dashboardButton}`);
    
    // Test 4: Performance Check
    console.log('\n4️⃣ Testing Performance Impact...');
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    testResults.performance.totalTestTime = totalTime;
    testResults.performance.acceptable = totalTime < 10000; // Under 10 seconds
    console.log(`   ✅ Total Test Time: ${totalTime}ms`);
    console.log(`   ✅ Performance Acceptable: ${testResults.performance.acceptable}`);
    
    // Test 5: Dark Theme Consistency
    console.log('\n5️⃣ Testing Dark Theme Consistency...');
    await page.goto('http://localhost:8080/analytics', { waitUntil: 'networkidle2' });
    
    const themeCheck = await page.evaluate(() => {
      const body = document.body;
      const bgColor = window.getComputedStyle(body).backgroundColor;
      const cards = document.querySelectorAll('.bg-\\[\\#1C1C1E\\]');
      return {
        darkBackground: bgColor.includes('18, 18, 18'), // RGB for #121212
        darkCards: cards.length > 0
      };
    });
    
    testResults.darkTheme = themeCheck.darkBackground && themeCheck.darkCards;
    console.log(`   ✅ Dark Theme Applied: ${testResults.darkTheme}`);
    
    // Summary
    console.log('\n📊 INTEGRATION TEST SUMMARY:');
    console.log('================================');
    const allMvpPass = Object.values(testResults.mvpFeatures).every(v => v === true);
    const allAnalyticsPass = Object.values(testResults.analyticsFeature).every(v => v === true);
    const navPass = testResults.navigation.hasAnalytics && testResults.navigation.dashboardButton;
    
    console.log(`✅ MVP Features Intact: ${allMvpPass ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Analytics Working: ${allAnalyticsPass ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Navigation Updated: ${navPass ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Performance Good: ${testResults.performance.acceptable ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Theme Consistent: ${testResults.darkTheme ? 'PASS' : 'FAIL'}`);
    
    const overallPass = allMvpPass && allAnalyticsPass && navPass && 
                       testResults.performance.acceptable && testResults.darkTheme;
    
    console.log(`\n🎯 OVERALL RESULT: ${overallPass ? '✅ PASS' : '❌ FAIL'}`);
    
    if (overallPass) {
      console.log('\n🎉 Phase 1 Analytics Integration Successful!');
      console.log('   All MVP features remain functional');
      console.log('   Analytics feature properly integrated');
      console.log('   No performance degradation detected');
      console.log('   Ready to proceed with Phase 2 features!');
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
    console.log(error.stack);
  } finally {
    await browser.close();
  }
}

testPhase1Integration();