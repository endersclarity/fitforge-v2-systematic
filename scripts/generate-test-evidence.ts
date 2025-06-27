#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

interface TestEvidence {
  issueNumber: number;
  timestamp: string;
  testResults: TestResult[];
  screenshots: string[];
  manualVerification: {
    command: string;
    output: string;
    expected: string;
    actual: string;
  }[];
}

async function runTests(issueNumber: number): Promise<TestEvidence> {
  const evidence: TestEvidence = {
    issueNumber,
    timestamp: new Date().toISOString(),
    testResults: [],
    screenshots: [],
    manualVerification: []
  };

  try {
    // Run Playwright tests
    console.log('Running Playwright tests...');
    const playwrightOutput = execSync(
      `npx playwright test issue-${issueNumber} --reporter=json`,
      { encoding: 'utf8' }
    );
    
    // Parse test results
    const results = JSON.parse(playwrightOutput);
    evidence.testResults = results.tests.map((test: any) => ({
      name: test.title,
      status: test.status,
      duration: test.duration,
      error: test.error?.message
    }));

    // Collect screenshots
    const screenshotDir = `test-results`;
    if (fs.existsSync(screenshotDir)) {
      const files = fs.readdirSync(screenshotDir);
      evidence.screenshots = files.filter(f => f.endsWith('.png'));
    }

    // Run manual verification commands
    console.log('Running manual verification...');
    
    // Count exercises
    const exerciseCount = execSync(
      'curl -s http://localhost:8080/flows-experimental/exercise-browser | grep -c "font-semibold text-fitbod-text"',
      { encoding: 'utf8' }
    ).trim();
    
    evidence.manualVerification.push({
      command: 'curl -s http://localhost:8080/flows-experimental/exercise-browser | grep -c "font-semibold"',
      output: exerciseCount,
      expected: '38',
      actual: exerciseCount
    });

    // Verify dumbbell exercises in data
    const dumbbellCount = execSync(
      'cat data/exercises-real.json | jq \'[.[] | select(.equipment == "Dumbbell")] | length\'',
      { encoding: 'utf8' }
    ).trim();
    
    evidence.manualVerification.push({
      command: 'cat data/exercises-real.json | jq \'[.[] | select(.equipment == "Dumbbell")] | length\'',
      output: dumbbellCount,
      expected: '11',
      actual: dumbbellCount
    });

  } catch (error) {
    console.error('Test execution failed:', error);
    evidence.testResults.push({
      name: 'Test Execution',
      status: 'failed',
      duration: 0,
      error: error.message
    });
  }

  // Generate evidence file
  const evidencePath = `TESTING-EVIDENCE-${issueNumber}.md`;
  const evidenceContent = generateEvidenceMarkdown(evidence);
  fs.writeFileSync(evidencePath, evidenceContent);
  
  console.log(`Evidence generated: ${evidencePath}`);
  return evidence;
}

function generateEvidenceMarkdown(evidence: TestEvidence): string {
  return `# Testing Evidence for Issue #${evidence.issueNumber}

Generated: ${evidence.timestamp}

## Automated Test Results

${evidence.testResults.map(test => 
  `- ${test.status === 'passed' ? '✅' : '❌'} ${test.name} (${test.duration}ms)`
).join('\n')}

## Manual Verification

${evidence.manualVerification.map(verify => `
### ${verify.command}
\`\`\`
Expected: ${verify.expected}
Actual: ${verify.actual}
Output: ${verify.output}
Status: ${verify.expected === verify.actual ? '✅ PASS' : '❌ FAIL'}
\`\`\`
`).join('\n')}

## Screenshots

${evidence.screenshots.map(screenshot => 
  `![${screenshot}](test-results/${screenshot})`
).join('\n\n')}

## Summary

- Total Tests: ${evidence.testResults.length}
- Passed: ${evidence.testResults.filter(t => t.status === 'passed').length}
- Failed: ${evidence.testResults.filter(t => t.status === 'failed').length}
- Manual Verification: ${evidence.manualVerification.filter(v => v.expected === v.actual).length}/${evidence.manualVerification.length} passed

## Certification

I certify that:
- [ ] I ran these tests myself
- [ ] I verified the actual UI behavior matches test results
- [ ] The feature works as intended when manually tested
- [ ] All evidence above is accurate and not fabricated

Signed: Claude (AI Assistant)
Date: ${new Date().toISOString()}
`;
}

// Run if called directly
if (require.main === module) {
  const issueNumber = parseInt(process.argv[2] || '25');
  runTests(issueNumber);
}

export { runTests, generateEvidenceMarkdown };