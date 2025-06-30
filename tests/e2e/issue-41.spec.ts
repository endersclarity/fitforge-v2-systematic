import { test, expect } from '@playwright/test';

test.describe('Issue #41: Profile page schema fix', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:8080');
    await page.evaluate(() => localStorage.clear());
  });

  test('should save profile data with correct field names from intake form', async ({ page }) => {
    // Navigate to intake form
    await page.goto('http://localhost:8080/intake');
    
    // Fill out intake form with test data
    await page.fill('input[placeholder="Your name"]', 'Test User');
    await page.click('button:has-text("Continue")');
    
    await page.fill('input[placeholder="25"]', '30');
    await page.click('button:has-text("Continue")');
    
    // Select goal (should save as primaryGoal, not goal)
    await page.click('button:has-text("Build Strength")');
    
    // Select experience (should save as experienceLevel, not experience)  
    await page.waitForSelector('button:has-text("Intermediate")', { timeout: 5000 });
    await page.waitForTimeout(1000); // Wait for animations to settle
    await page.click('button:has-text("Intermediate")');
    
    // Select frequency (should save as weeklyWorkouts, not frequency)
    await page.waitForSelector('button:has-text("3 days/week")', { timeout: 5000 });
    await page.waitForTimeout(1000); // Wait for animations to settle
    await page.click('button:has-text("3 days/week")');
    
    // Select equipment  
    await page.waitForSelector('button:has-text("Dumbbells")', { timeout: 5000 });
    await page.waitForTimeout(1000); // Wait for animations to settle
    await page.click('button:has-text("Dumbbells")');
    
    // Equipment page shows "Complete Setup" button after selection
    await page.waitForSelector('button:has-text("Complete Setup")', { timeout: 5000 });
    await page.click('button:has-text("Complete Setup")');
    
    // Wait for completion (may redirect or stay on intake)
    await page.waitForTimeout(3000); // Wait for processing
    
    // Verify localStorage has correct field names (regardless of navigation)
    const profileData = await page.evaluate(() => {
      const data = localStorage.getItem('userProfile');
      return data ? JSON.parse(data) : null;
    });
    
    expect(profileData).toBeTruthy();
    expect(profileData.name).toBe('Test User');
    expect(profileData.age).toBe(30);
    
    // These are the CORRECT field names that should be saved
    expect(profileData.primaryGoal).toBe('strength');
    expect(profileData.experienceLevel).toBe('intermediate');
    expect(profileData.weeklyWorkouts).toBe(3);
    expect(profileData.availableEquipment).toContain('Dumbbells');
    
    // These WRONG field names should NOT exist
    expect(profileData.goal).toBeUndefined();
    expect(profileData.experience).toBeUndefined(); 
    expect(profileData.frequency).toBeUndefined();
  });

  test('should load profile page successfully after intake completion', async ({ page }) => {
    // Set up profile data with CORRECT field names
    await page.goto('http://localhost:8080');
    await page.evaluate(() => {
      const profileData = {
        name: 'Jane Doe',
        age: 25,
        primaryGoal: 'hypertrophy',
        experienceLevel: 'beginner', 
        weeklyWorkouts: 4,
        availableEquipment: ['Dumbbells', 'Pull-up Bar']
      };
      localStorage.setItem('userProfile', JSON.stringify(profileData));
    });
    
    // Navigate to profile page
    await page.goto('http://localhost:8080/profile');
    
    // Should NOT show loading spinner
    await expect(page.locator('text=Loading profile...')).not.toBeVisible({ timeout: 2000 });
    
    // Should show actual profile data
    await expect(page.locator('text=Jane Doe')).toBeVisible();
    await expect(page.locator('text=25 years old')).toBeVisible();
    await expect(page.locator('text=hypertrophy')).toBeVisible();
    await expect(page.locator('text=beginner')).toBeVisible();
    await expect(page.locator('text=4')).toBeVisible();
    await expect(page.locator('text=Dumbbells')).toBeVisible();
    await expect(page.locator('text=Pull-up Bar')).toBeVisible();
  });

  test('should handle profile data migration from old format', async ({ page }) => {
    // Set up OLD format data (what currently gets saved incorrectly)
    await page.goto('http://localhost:8080');
    await page.evaluate(() => {
      const oldFormatData = {
        name: 'Migration Test',
        age: 35,
        goal: 'strength', // OLD field name
        experience: 'advanced', // OLD field name  
        frequency: 5, // OLD field name
        availableEquipment: ['Full Gym Access']
      };
      localStorage.setItem('userProfile', JSON.stringify(oldFormatData));
    });
    
    // Navigate to profile page - should trigger migration
    await page.goto('http://localhost:8080/profile');
    
    // After migration, should show profile data (not loading)
    await expect(page.locator('text=Loading profile...')).not.toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Migration Test')).toBeVisible();
    await expect(page.locator('text=35 years old')).toBeVisible();
    
    // Verify localStorage was migrated to correct format
    const migratedData = await page.evaluate(() => {
      const data = localStorage.getItem('userProfile');
      return data ? JSON.parse(data) : null;
    });
    
    expect(migratedData.primaryGoal).toBe('strength');
    expect(migratedData.experienceLevel).toBe('advanced');
    expect(migratedData.weeklyWorkouts).toBe(5);
    
    // Old field names should be gone
    expect(migratedData.goal).toBeUndefined();
    expect(migratedData.experience).toBeUndefined();
    expect(migratedData.frequency).toBeUndefined();
  });

  test('should show "No Profile Found" when localStorage is empty', async ({ page }) => {
    // Navigate to profile page with no data
    await page.goto('http://localhost:8080/profile');
    
    // Should show no profile state, not loading
    await expect(page.locator('text=No Profile Found')).toBeVisible();
    await expect(page.locator('text=Complete Setup')).toBeVisible();
    await expect(page.locator('text=Loading profile...')).not.toBeVisible();
  });

  test('should navigate to intake form when editing profile', async ({ page }) => {
    // Set up valid profile data
    await page.goto('http://localhost:8080');
    await page.evaluate(() => {
      const profileData = {
        name: 'Edit Test',
        age: 28,
        primaryGoal: 'weight_loss',
        experienceLevel: 'intermediate',
        weeklyWorkouts: 3,
        availableEquipment: ['Bodyweight Only']
      };
      localStorage.setItem('userProfile', JSON.stringify(profileData));
    });
    
    // Navigate to profile page
    await page.goto('http://localhost:8080/profile');
    
    // Click Edit Profile button
    await page.click('button:has-text("Edit Profile")');
    
    // Should navigate to intake form
    await page.waitForURL('**/intake');
    await expect(page.locator('text=Hi there! 👋')).toBeVisible();
  });
});