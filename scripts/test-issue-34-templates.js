const puppeteer = require('puppeteer');

(async () => {
  console.log('🔍 Testing Issue #34: Workout Template Management');
  console.log('================================================\n');

  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  try {
    // Test 1: Navigate to workout builder
    console.log('📍 TEST 1: Navigate to Workout Builder');
    await page.goto('http://localhost:8080/flows-experimental/workout-builder');
    await page.waitForSelector('[data-testid="add-exercise-button"]', { timeout: 5000 });
    console.log('✅ Workout builder loaded successfully\n');

    // Test 2: Add an exercise
    console.log('📍 TEST 2: Add Exercise to Workout');
    await page.click('[data-testid="add-exercise-button"]');
    await page.waitForSelector('[data-testid="exercise-selector-modal"]', { visible: true });
    
    // Click first exercise
    const exerciseButton = await page.$('[data-testid="exercise-item"]');
    if (exerciseButton) {
      await exerciseButton.click();
      console.log('✅ Exercise added successfully');
    }
    
    // Wait for modal to close
    await page.waitForSelector('[data-testid="exercise-selector-modal"]', { hidden: true });

    // Test 3: Save workout template
    console.log('\n📍 TEST 3: Save Workout Template');
    await page.click('[data-testid="save-workout-button"]');
    await page.waitForSelector('[data-testid="save-workout-modal"]', { visible: true });
    
    // Fill in workout details
    await page.type('[data-testid="workout-name-input"]', 'Test Workout ' + Date.now());
    await page.click('button:has-text("Save Template")');
    
    // Check for success message
    await page.waitForSelector('[data-testid="success-message"]', { timeout: 3000 });
    console.log('✅ Workout saved successfully\n');

    // Test 4: Navigate to saved workouts
    console.log('📍 TEST 4: View Saved Workouts');
    await page.goto('http://localhost:8080/flows-experimental/saved-workouts');
    await page.waitForSelector('[data-testid="saved-workouts-page"]', { timeout: 5000 });
    
    // Count workout templates
    const templateCards = await page.$$('[data-testid="workout-template-card"]');
    console.log(`✅ Found ${templateCards.length} saved workout(s)\n`);

    // Test 5: Verify localStorage
    console.log('📍 TEST 5: Verify localStorage Data');
    const localStorageData = await page.evaluate(() => {
      const data = localStorage.getItem('fitforge_workout_templates');
      return data ? JSON.parse(data) : null;
    });
    
    if (localStorageData && localStorageData.length > 0) {
      console.log('✅ localStorage contains workout templates:');
      localStorageData.forEach((template, index) => {
        console.log(`   ${index + 1}. ${template.name} - ${template.exercises.length} exercise(s)`);
      });
    } else {
      console.log('❌ No templates found in localStorage');
    }

    // Test 6: Test template actions
    if (templateCards.length > 0) {
      console.log('\n📍 TEST 6: Test Template Actions');
      
      // Test edit button
      const editButton = await page.$('[data-testid="edit-template-button"]');
      if (editButton) {
        await editButton.click();
        await page.waitForNavigation();
        const url = page.url();
        if (url.includes('workout-builder')) {
          console.log('✅ Edit template navigation works');
          
          // Check if template loaded
          const exercises = await page.$$('[data-testid="workout-exercise"]');
          console.log(`✅ Template loaded with ${exercises.length} exercise(s)`);
        }
      }
    }

    // Test 7: Category filter
    console.log('\n📍 TEST 7: Test Category Filter');
    await page.goto('http://localhost:8080/flows-experimental/saved-workouts');
    await page.waitForSelector('select', { timeout: 5000 });
    
    // Select strength category
    await page.select('select', 'strength');
    await page.waitForTimeout(500); // Wait for filter to apply
    
    const filteredCards = await page.$$('[data-testid="workout-template-card"]');
    console.log(`✅ Filter applied - showing ${filteredCards.length} template(s)`);

    console.log('\n✨ All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    // Take screenshot on failure
    await page.screenshot({ path: 'test-failure-issue-34.png' });
    console.log('📸 Screenshot saved as test-failure-issue-34.png');
  } finally {
    await browser.close();
  }
})();