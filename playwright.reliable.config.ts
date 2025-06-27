import { defineConfig, devices } from '@playwright/test';

// Reliable Playwright configuration that prevents EPIPE errors
// Uses environment-aware reporter configuration to avoid output conflicts

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Environment-aware reporter configuration to prevent EPIPE errors
  reporter: (() => {
    if (process.env.CI) {
      // CI: Use file-based reporters only to avoid stdout conflicts
      return [
        ['json', { outputFile: 'test-results.json' }],
        ['html', { outputFolder: 'playwright-report', open: 'never' }]
      ];
    } else if (process.env.DEBUG) {
      // Debug: Full reporting with careful stream management
      return [
        ['html', { outputFolder: 'playwright-report', open: 'on-failure' }],
        ['list']
      ];
    } else {
      // Default: Console-only for reliability (prevents multiple stream conflicts)
      return [['list']];
    }
  })(),
  
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
    {
      name: 'firefox', 
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  webServer: {
    command: './start-fitforge-v2-dev.sh',
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});