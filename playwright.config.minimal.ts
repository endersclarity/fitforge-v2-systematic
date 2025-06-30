import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // REMOVED Firefox - 3% market share not worth the maintenance burden
    // If we need cross-browser testing, add Safari (18% share) instead
  ],

  webServer: {
    command: './start-fitforge-v2-dev.sh',
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});