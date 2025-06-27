#!/bin/bash
# Automated Issue Verification Gates
# This script enforces test-first development and prevents untested code

ISSUE_NUMBER=$1

if [ -z "$ISSUE_NUMBER" ]; then
  echo "❌ ERROR: Issue number required"
  echo "Usage: ./scripts/verify-issue-gates.sh <issue-number>"
  exit 1
fi

echo "🔍 AUTOMATED VERIFICATION FOR ISSUE #$ISSUE_NUMBER"
echo "================================================"

# Gate 1: Schema Verification Check
echo -e "\n📋 GATE 1: Schema Verification"
if [ -f "./scratchpads/issue-${ISSUE_NUMBER}-*.md" ]; then
  if grep -q "DATA CONTRACT VERIFICATION" ./scratchpads/issue-${ISSUE_NUMBER}-*.md; then
    echo "✅ Schema verification documented"
  else
    echo "❌ FAIL: No schema verification found in scratchpad"
    echo "   You must complete Phase 0 first"
    exit 1
  fi
else
  echo "❌ FAIL: No scratchpad found for issue #$ISSUE_NUMBER"
  echo "   Create ./scratchpads/issue-${ISSUE_NUMBER}-*.md first"
  exit 1
fi

# Gate 2: Test Files Exist
echo -e "\n📋 GATE 2: Test-First Development"
TEST_FILES=$(find tests -name "*issue-${ISSUE_NUMBER}*" -type f)
if [ -z "$TEST_FILES" ]; then
  echo "❌ FAIL: No test files found for issue #$ISSUE_NUMBER"
  echo "   Expected: tests/e2e/issue-${ISSUE_NUMBER}.spec.ts"
  echo "   You MUST write tests before implementation"
  exit 1
else
  echo "✅ Test files found:"
  echo "$TEST_FILES" | sed 's/^/   /'
fi

# Gate 3: Tests Were Written First (check git history)
echo -e "\n📋 GATE 3: Test-First Verification"
FIRST_TEST_COMMIT=$(git log --oneline --grep="test.*issue.*$ISSUE_NUMBER" | tail -1)
FIRST_IMPL_COMMIT=$(git log --oneline --grep="feat.*issue.*$ISSUE_NUMBER" | tail -1)

if [ -n "$FIRST_TEST_COMMIT" ] && [ -n "$FIRST_IMPL_COMMIT" ]; then
  TEST_DATE=$(git log -1 --format=%at $(echo $FIRST_TEST_COMMIT | cut -d' ' -f1))
  IMPL_DATE=$(git log -1 --format=%at $(echo $FIRST_IMPL_COMMIT | cut -d' ' -f1))
  
  if [ "$TEST_DATE" -lt "$IMPL_DATE" ]; then
    echo "✅ Tests committed before implementation"
  else
    echo "⚠️  WARNING: Implementation appears before tests in git history"
  fi
else
  echo "⚠️  No commit history found yet"
fi

# Gate 4: Run Tests
echo -e "\n📋 GATE 4: Test Execution"
if command -v npx &> /dev/null && [ -f "package.json" ]; then
  echo "Running tests for issue #$ISSUE_NUMBER..."
  npx playwright test issue-$ISSUE_NUMBER --reporter=list
  TEST_RESULT=$?
  
  if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ All tests passing"
  else
    echo "❌ FAIL: Tests not passing"
    echo "   Fix failing tests before proceeding"
    exit 1
  fi
else
  echo "⚠️  Cannot run tests automatically (npx not found)"
fi

# Gate 5: Evidence Generation
echo -e "\n📋 GATE 5: Evidence Documentation"
EVIDENCE_FILE="test-evidence-issue-${ISSUE_NUMBER}.md"
if [ -f "$EVIDENCE_FILE" ]; then
  echo "✅ Evidence file exists: $EVIDENCE_FILE"
else
  echo "⚠️  No evidence file found, generating..."
  if [ -f "scripts/generate-test-evidence.ts" ]; then
    npm run test:evidence -- $ISSUE_NUMBER
  else
    echo "   Create $EVIDENCE_FILE manually with test results"
  fi
fi

# Gate 6: Interactive Feature Verification
echo -e "\n📋 GATE 6: Interactive Feature Check"
if grep -q "button\|click\|filter\|select\|input" tests/e2e/issue-${ISSUE_NUMBER}*.spec.ts 2>/dev/null; then
  echo "⚠️  Interactive features detected - manual verification required:"
  echo "   1. Use curl to verify initial state"
  echo "   2. Trace click handler logic"
  echo "   3. Verify data transformation"
  echo "   4. Check visual output matches data"
  echo "   Document all findings in $EVIDENCE_FILE"
fi

# Final Summary
echo -e "\n🎯 VERIFICATION SUMMARY"
echo "======================="
echo "Issue #$ISSUE_NUMBER verification complete"
echo ""
echo "NEXT STEPS:"
echo "1. If any gates failed, fix them before proceeding"
echo "2. Run this script again after fixes"
echo "3. Only create PR when all gates pass"
echo ""
echo "Remember: If you didn't test it, it doesn't work!"