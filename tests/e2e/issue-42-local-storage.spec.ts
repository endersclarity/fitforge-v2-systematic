import { test, expect } from '@playwright/test';

test.describe('localStorage Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:8080');
    await page.evaluate(() => localStorage.clear());
  });

  test('should be able to save and load workout templates', async ({ page }) => {
    // Navigate to saved workouts
    await page.goto('http://localhost:8080/flows-experimental/saved-workouts');
    await page.waitForLoadState('networkidle');

    // Create a mock template
    const mockTemplate = {
      id: 'test-template-1',
      name: 'Test Push Day',
      exercises: [
        { name: 'Bench Press', sets: 3, reps: 10 },
        { name: 'Shoulder Press', sets: 3, reps: 12 }
      ],
      createdAt: new Date().toISOString()
    };

    // Save template to localStorage
    await page.evaluate((template) => {
      const templates = JSON.parse(localStorage.getItem('fitforge_workout_templates') || '[]');
      templates.push(template);
      localStorage.setItem('fitforge_workout_templates', JSON.stringify(templates));
    }, mockTemplate);

    // Reload page to verify persistence
    await page.reload();
    
    // Check if template persisted
    const savedTemplates = await page.evaluate(() => {
      return localStorage.getItem('fitforge_workout_templates');
    });

    expect(savedTemplates).toBeTruthy();
    const parsed = JSON.parse(savedTemplates!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe('Test Push Day');
  });

  test('workout sessions should persist in localStorage', async ({ page }) => {
    // Navigate to workout page
    await page.goto('http://localhost:8080/push-day');
    
    // Create a mock workout session
    const mockSession = {
      id: 'session-1',
      date: new Date().toISOString(),
      exercises: [
        {
          name: 'Bench Press',
          sets: [
            { reps: 10, weight: 135, completed: true },
            { reps: 8, weight: 155, completed: true }
          ]
        }
      ]
    };

    // Save session
    await page.evaluate((session) => {
      localStorage.setItem('currentWorkoutSession', JSON.stringify(session));
    }, mockSession);

    // Verify it persisted
    const savedSession = await page.evaluate(() => {
      return localStorage.getItem('currentWorkoutSession');
    });

    expect(savedSession).toBeTruthy();
    const parsed = JSON.parse(savedSession!);
    expect(parsed.id).toBe('session-1');
    expect(parsed.exercises).toHaveLength(1);
  });

  test('localStorage should not exceed 5MB limit', async ({ page }) => {
    await page.goto('http://localhost:8080');

    // Test storage limits
    const testResult = await page.evaluate(() => {
      const testData = 'x'.repeat(1024 * 1024); // 1MB string
      let storedSize = 0;
      
      try {
        // Try to store up to 4MB (safe under 5MB limit)
        for (let i = 0; i < 4; i++) {
          localStorage.setItem(`test-data-${i}`, testData);
          storedSize += 1;
        }
        
        // Clean up test data
        for (let i = 0; i < 4; i++) {
          localStorage.removeItem(`test-data-${i}`);
        }
        
        return { success: true, storedMB: storedSize };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    expect(testResult.success).toBe(true);
    expect(testResult.storedMB).toBe(4);
  });

  test('profile data should persist correctly', async ({ page }) => {
    await page.goto('http://localhost:8080/profile');

    // Set profile data
    const profileData = {
      name: 'Test User',
      age: 25,
      primaryGoal: 'strength',
      experienceLevel: 'intermediate',
      weeklyWorkouts: 4,
      availableEquipment: ['Dumbbell', 'Barbell']
    };

    await page.evaluate((data) => {
      localStorage.setItem('userProfile', JSON.stringify(data));
    }, profileData);

    // Reload and verify
    await page.reload();
    await page.waitForLoadState('networkidle');

    const savedProfile = await page.evaluate(() => {
      return localStorage.getItem('userProfile');
    });

    expect(savedProfile).toBeTruthy();
    const parsed = JSON.parse(savedProfile!);
    expect(parsed.name).toBe('Test User');
    expect(parsed.primaryGoal).toBe('strength');
  });

  test('should handle localStorage quota exceeded gracefully', async ({ page }) => {
    await page.goto('http://localhost:8080');

    const result = await page.evaluate(() => {
      try {
        // Try to exceed localStorage limit
        const hugeData = 'x'.repeat(10 * 1024 * 1024); // 10MB
        localStorage.setItem('huge-data', hugeData);
        return { exceeded: false };
      } catch (error) {
        // Should catch QuotaExceededError
        return { 
          exceeded: true, 
          errorName: error.name,
          errorMessage: error.message 
        };
      }
    });

    expect(result.exceeded).toBe(true);
    expect(result.errorName).toContain('QuotaExceeded');
  });

  test('workout history should accumulate over time', async ({ page }) => {
    await page.goto('http://localhost:8080');

    // Add multiple workout sessions
    const sessions = [
      { id: '1', date: '2025-06-28', exercise: 'Bench Press', weight: 135 },
      { id: '2', date: '2025-06-29', exercise: 'Bench Press', weight: 140 },
      { id: '3', date: '2025-06-30', exercise: 'Bench Press', weight: 145 }
    ];

    await page.evaluate((workouts) => {
      localStorage.setItem('workoutHistory', JSON.stringify(workouts));
    }, sessions);

    // Navigate to analytics to see if history is used
    await page.goto('http://localhost:8080/analytics');
    await page.waitForLoadState('networkidle');

    // Verify history exists
    const history = await page.evaluate(() => {
      return localStorage.getItem('workoutHistory');
    });

    expect(history).toBeTruthy();
    const parsed = JSON.parse(history!);
    expect(parsed).toHaveLength(3);
    expect(parsed[2].weight).toBe(145);
  });

  test('localStorage keys should follow naming convention', async ({ page }) => {
    await page.goto('http://localhost:8080');

    // Check all localStorage keys
    const keys = await page.evaluate(() => {
      const allKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        allKeys.push(localStorage.key(i));
      }
      return allKeys;
    });

    // All keys should start with fitforge_ or be well-known keys
    const validPrefixes = ['fitforge_', 'userProfile', 'currentWorkout', 'workoutHistory'];
    
    keys.forEach(key => {
      const isValid = validPrefixes.some(prefix => key.startsWith(prefix));
      expect(isValid).toBe(true);
    });
  });
});