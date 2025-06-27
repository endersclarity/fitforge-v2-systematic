export interface FeatureTestConfig {
  featureName: string;
  issueNumber: number;
  url: string;
  requirements: {
    description: string;
    selector: string;
    action: string;
    expectedResult: string;
  }[];
}

export function generateFeatureTest(config: FeatureTestConfig): string {
  return `import { test, expect } from '@playwright/test';

test.describe('Issue #${config.issueNumber}: ${config.featureName}', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('${config.url}');
  });

${config.requirements.map((req, index) => `
  test('${req.description}', async ({ page }) => {
    // Arrange: Get initial state
    const initialCount = await page.locator('${req.selector}').count();
    console.log('Initial count:', initialCount);
    
    // Act: Perform user action
    await page.${req.action};
    await page.waitForTimeout(500); // Wait for any animations
    
    // Assert: Verify expected result
    ${req.expectedResult}
    
    // Generate evidence
    await page.screenshot({ 
      path: \`test-results/issue-${config.issueNumber}-test-${index + 1}.png\`,
      fullPage: true 
    });
  });`).join('\n')}

  test('generates testing evidence', async ({ page }) => {
    const evidence = {
      issue: ${config.issueNumber},
      feature: '${config.featureName}',
      url: '${config.url}',
      timestamp: new Date().toISOString(),
      testsRun: ${config.requirements.length},
      testsPassed: 0 // Will be updated by test runner
    };
    
    console.log('TEST EVIDENCE:', JSON.stringify(evidence, null, 2));
  });
});`;
}

// Helper to generate test from issue
export function generateTestFromIssue(
  issueNumber: number, 
  issueName: string,
  requirements: string[]
): string {
  const config: FeatureTestConfig = {
    featureName: issueName,
    issueNumber: issueNumber,
    url: '/flows-experimental/exercise-browser', // Default, update per issue
    requirements: requirements.map(req => ({
      description: req,
      selector: '.exercise-card', // Update based on requirement
      action: 'click("button")', // Update based on requirement
      expectedResult: 'const newCount = await page.locator(".exercise-card").count();\nexpect(newCount).toBeLessThan(initialCount);'
    }))
  };
  
  return generateFeatureTest(config);
}