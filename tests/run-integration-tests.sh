#!/bin/bash

# FitForge Integration Test Runner
# Runs integration tests with proper error handling and reporting

echo "🧪 FitForge Integration Test Suite"
echo "================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in Docker
if [ -f /.dockerenv ]; then
    echo "📦 Running in Docker environment"
else
    echo "💻 Running in local environment"
fi

# Function to run tests with nice output
run_test_suite() {
    local suite_name=$1
    local test_pattern=$2
    
    echo ""
    echo "▶️  Running $suite_name..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if npm run test -- --testPathPattern="$test_pattern" --coverage --coverageDirectory="coverage/$suite_name"; then
        echo -e "${GREEN}✅ $suite_name passed${NC}"
        return 0
    else
        echo -e "${RED}❌ $suite_name failed${NC}"
        return 1
    fi
}

# Track overall test status
TESTS_FAILED=0

# Run each integration test suite
run_test_suite "Workout Flow" "workout-flow" || TESTS_FAILED=1
run_test_suite "Muscle Visualization" "muscle-visualization" || TESTS_FAILED=1
run_test_suite "Progress Tracking" "progress-tracking" || TESTS_FAILED=1
run_test_suite "API Client" "api-client" || TESTS_FAILED=1

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Generate coverage report
if [ -d "coverage" ]; then
    echo "📊 Generating coverage report..."
    npx jest --coverage --coverageReporters=text-summary --testPathPattern="integration" > /dev/null 2>&1
    echo ""
fi

# Summary
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All integration tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "  - Run unit tests: npm run test:unit"
    echo "  - Run E2E tests: npm run test:e2e"
    echo "  - View coverage: open coverage/lcov-report/index.html"
else
    echo -e "${RED}❌ Some integration tests failed${NC}"
    echo ""
    echo "Please fix the failing tests before proceeding."
    exit 1
fi

echo ""
echo "🏁 Integration test run complete"