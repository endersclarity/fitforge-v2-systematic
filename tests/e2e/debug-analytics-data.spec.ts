import { test, expect } from '@playwright/test';

test.describe('Debug Analytics Data Loading', () => {
  test('inspect analytics data loading and filtering', async ({ page }) => {
    console.log('🔍 Debugging analytics data loading issue');
    
    // First, set up test data directly
    await page.goto('http://localhost:8080');
    
    // Create test workout data
    await page.evaluate(() => {
      const testWorkouts = [
        {
          id: 'test-workout-1',
          date: new Date().toISOString(),
          type: 'push',
          duration: 1800,
          exercises: [{
            id: 'bench_press',
            name: 'Bench Press',
            category: 'ChestTriceps',
            muscleEngagement: { 'Pectoralis_Major': 85, 'Triceps_Brachii': 25 },
            completedSets: 3,
            totalWeight: 150,
            totalReps: 30,
            equipment: 'Bench',
            difficulty: 'Intermediate'
          }],
          totalSets: 3
        },
        {
          id: 'test-workout-2',
          date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          type: 'pull',
          duration: 2100,
          exercises: [{
            id: 'pullups',
            name: 'Pull-ups',
            category: 'BackBiceps',
            muscleEngagement: { 'Latissimus_Dorsi': 85, 'Biceps_Brachii': 60 },
            completedSets: 3,
            totalWeight: 0, // Bodyweight
            totalReps: 24,
            equipment: 'Pull-up_Bar',
            difficulty: 'Advanced'
          }],
          totalSets: 3
        }
      ];
      
      localStorage.setItem('fitforge-workout-history', JSON.stringify(testWorkouts));
      console.log('🔧 Created test workout data:', testWorkouts);
    });
    
    // Navigate to analytics page
    await page.goto('http://localhost:8080/analytics');
    await page.waitForTimeout(2000); // Allow time for React to load data
    
    // Check localStorage in browser context
    const localStorageData = await page.evaluate(() => {
      const history = localStorage.getItem('fitforge-workout-history');
      const sessions = localStorage.getItem('workoutSessions');
      return {
        history: history ? JSON.parse(history) : null,
        sessions: sessions ? JSON.parse(sessions) : null,
        allKeys: Object.keys(localStorage)
      };
    });
    console.log('🔧 localStorage data in browser:', localStorageData);
    
    // Check page title and main elements
    const title = await page.title();
    console.log('🔧 Analytics page title:', title);
    
    // Check for workout cards with various selectors
    const cardSelectors = [
      '[data-testid="workout-card"]',
      '.cursor-pointer',
      '.bg-fitbod-card',
      'text=Push Day Workout',
      'text=Pull Day Workout',
      'text=Workout Session',
      '[role="button"]'
    ];
    
    for (const selector of cardSelectors) {
      const elementCount = await page.locator(selector).count();
      console.log(`🔧 Found ${elementCount} elements with selector: ${selector}`);
      
      if (elementCount > 0) {
        const textContents = await page.locator(selector).allTextContents();
        console.log(`🔧 Text contents:`, textContents.slice(0, 3)); // First 3 items
      }
    }
    
    // Check for error messages or empty states
    const pageText = await page.textContent('body');
    const hasEmptyMessage = pageText?.includes('No workouts found');
    const hasErrorMessage = pageText?.includes('error') || pageText?.includes('Error');
    console.log('🔧 Page has empty message:', hasEmptyMessage);
    console.log('🔧 Page has error message:', hasErrorMessage);
    
    // Check time range filter
    const timeRangeValue = await page.locator('select, [role="combobox"]').first().textContent();
    console.log('🔧 Current time range filter:', timeRangeValue);
    
    // Check React state by looking for loading indicators or data
    const workoutCountElements = await page.locator('text=/\\d+ workouts?/i').allTextContents();
    console.log('🔧 Workout count elements found:', workoutCountElements);
    
    // Check for any JavaScript console messages
    const consoleMessages = [];
    page.on('console', (msg) => {
      const text = msg.text();
      consoleMessages.push({ type: msg.type(), text });
      console.log(`🖥️ Browser Console [${msg.type()}]:`, text);
    });
    
    // Force reload to catch console messages
    await page.reload();
    await page.waitForTimeout(3000); // Give more time for React to render
    
    console.log('🔧 All console messages:', consoleMessages.filter(m => m.text.includes('ANALYTICS')));
    
    // Try manually triggering the analytics data loading function
    const dataLoadingResult = await page.evaluate(() => {
      try {
        // Simulate the loadAnalyticsData function
        const history = JSON.parse(localStorage.getItem('fitforge-workout-history') || '[]');
        const sessions = JSON.parse(localStorage.getItem('workoutSessions') || '[]');
        const allHistory = [...history, ...sessions];
        
        console.log('📊 Raw history:', history);
        console.log('📊 Raw sessions:', sessions);
        console.log('📊 Combined history:', allHistory);
        
        // Check time filtering
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days
        
        const filteredHistory = allHistory.filter(session => {
          const sessionDate = new Date(session.date);
          const isInRange = sessionDate >= cutoffDate;
          console.log('📊 Session date:', session.date, 'In range:', isInRange);
          return isInRange;
        });
        
        console.log('📊 Filtered history:', filteredHistory);
        
        return {
          rawCount: allHistory.length,
          filteredCount: filteredHistory.length,
          cutoffDate: cutoffDate.toISOString(),
          sampleDates: allHistory.map(w => w.date)
        };
      } catch (error) {
        console.error('📊 Error in data loading simulation:', error);
        return { error: error.message };
      }
    });
    
    console.log('🔧 Data loading simulation result:', dataLoadingResult);
    
    // Check actual DOM structure when cards should be present
    await page.waitForTimeout(1000); // Wait for final render
    
    const domStructure = await page.evaluate(() => {
      // Find the workout cards container
      const exerciseHistoryTab = document.querySelector('[value="exercise-history"]');
      if (exerciseHistoryTab) {
        const tabContent = exerciseHistoryTab.parentElement?.parentElement?.nextElementSibling;
        return {
          found: 'exercise-history tab content',
          innerHTML: tabContent?.innerHTML?.substring(0, 500),
          childElementCount: tabContent?.childElementCount,
          textContent: tabContent?.textContent?.substring(0, 200)
        };
      }
      
      // Alternative: look for any element with workout cards
      const cardsContainer = document.querySelector('.grid.gap-4');
      if (cardsContainer) {
        return {
          found: 'cards container',
          innerHTML: cardsContainer.innerHTML.substring(0, 500),
          childElementCount: cardsContainer.childElementCount,
          textContent: cardsContainer.textContent?.substring(0, 200)
        };
      }
      
      return { found: 'nothing specific' };
    });
    
    console.log('🔧 DOM structure analysis:', domStructure);
    
    // Check if workout cards exist but are hidden
    const hiddenCards = await page.locator('[data-testid="workout-card"]').count();
    const allCards = await page.locator('.bg-fitbod-card').count();
    console.log('🔧 Hidden workout cards:', hiddenCards, 'All .bg-fitbod-card elements:', allCards);
    
    // Check the specific tab that contains workout history
    const currentTab = await page.locator('[role="tabpanel"]:not([hidden])').count();
    console.log('🔧 Active tab panels:', currentTab);
    
    // Switch to exercise-history tab explicitly
    const exerciseHistoryTab = page.locator('[role="tab"]:has-text("Exercise History")');
    if (await exerciseHistoryTab.count() > 0) {
      console.log('🔧 Clicking Exercise History tab');
      await exerciseHistoryTab.click();
      await page.waitForTimeout(1000);
      
      // Re-check for workout cards after tab switch
      const cardsAfterTabSwitch = await page.locator('[data-testid="workout-card"]').count();
      console.log('🔧 Workout cards after tab switch:', cardsAfterTabSwitch);
      
      if (cardsAfterTabSwitch > 0) {
        const cardTexts = await page.locator('[data-testid="workout-card"]').allTextContents();
        console.log('🔧 Card texts found:', cardTexts);
      }
    }
    
    // Take a screenshot for visual debugging
    await page.screenshot({ path: 'debug-analytics-data.png', fullPage: true });
    console.log('🔧 Screenshot saved as debug-analytics-data.png');
  });
});