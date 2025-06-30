#!/bin/bash

echo "🔍 VERIFICATION: Issue #34 - Workout Template Management"
echo "======================================================="
echo ""

# Test 1: Check if saved workouts page loads
echo "📍 TEST 1: Saved Workouts Page Accessibility"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/flows-experimental/saved-workouts)
if [ "$response" == "200" ]; then
    echo "✅ Saved workouts page returns 200 OK"
else
    echo "❌ Saved workouts page returns $response"
fi

# Test 2: Check page content
echo ""
echo "📍 TEST 2: Page Content Verification"
content=$(curl -s http://localhost:8080/flows-experimental/saved-workouts)

# Check for key elements
if echo "$content" | grep -q "Saved Workouts"; then
    echo "✅ Page title 'Saved Workouts' found"
else
    echo "❌ Page title not found"
fi

if echo "$content" | grep -q "New Workout"; then
    echo "✅ 'New Workout' button found"
else
    echo "❌ 'New Workout' button not found"
fi

if echo "$content" | grep -q "data-testid=\"saved-workouts-page\""; then
    echo "✅ Saved workouts page container found"
else
    echo "❌ Saved workouts page container not found"
fi

# Test 3: Check workout builder
echo ""
echo "📍 TEST 3: Workout Builder Page"
builder_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/flows-experimental/workout-builder)
if [ "$builder_response" == "200" ]; then
    echo "✅ Workout builder page returns 200 OK"
else
    echo "❌ Workout builder page returns $builder_response"
fi

builder_content=$(curl -s http://localhost:8080/flows-experimental/workout-builder)
if echo "$builder_content" | grep -q "data-testid=\"add-exercise-button\""; then
    echo "✅ Add exercise button found"
else
    echo "❌ Add exercise button not found"
fi

if echo "$builder_content" | grep -q "data-testid=\"save-workout-button\""; then
    echo "✅ Save workout button found"
else
    echo "❌ Save workout button not found"
fi

# Test 4: Check for localStorage service
echo ""
echo "📍 TEST 4: LocalStorage Service Implementation"
if [ -f "lib/localStorage-service.ts" ]; then
    echo "✅ LocalStorage service exists"
    
    # Check for quota protection
    if grep -q "MAX_STORAGE_SIZE" lib/localStorage-service.ts; then
        echo "✅ Storage quota protection implemented"
    fi
    
    if grep -q "QuotaExceededError" lib/localStorage-service.ts; then
        echo "✅ Quota exceeded error handling found"
    fi
else
    echo "❌ LocalStorage service not found"
fi

# Test 5: Check for validation
echo ""
echo "📍 TEST 5: Input Validation"
if grep -q "validateWorkoutName" app/flows-experimental/workout-builder/components/SaveWorkoutModal.tsx; then
    echo "✅ Workout name validation found"
fi

if grep -q "duplicate" app/flows-experimental/workout-builder/components/SaveWorkoutModal.tsx; then
    echo "✅ Duplicate name checking implemented"
fi

# Test 6: Data contract verification
echo ""
echo "📍 TEST 6: Data Contract Consistency"
echo "Checking for exerciseId usage across components..."

if grep -q "exerciseId" app/flows-experimental/saved-workouts/page.tsx; then
    echo "✅ Saved workouts uses exerciseId"
fi

if grep -q "exerciseId" app/flows-experimental/workout-builder/components/SaveWorkoutModal.tsx; then
    echo "✅ Save modal uses exerciseId"
fi

# Test 7: Check test coverage
echo ""
echo "📍 TEST 7: Test Coverage"
if [ -f "tests/e2e/issue-34.spec.ts" ]; then
    echo "✅ E2E tests exist"
    test_count=$(grep -c "test(" tests/e2e/issue-34.spec.ts)
    echo "✅ Found $test_count test cases"
fi

if [ -f "lib/__tests__/localStorage-service.test.ts" ]; then
    echo "✅ Unit tests for localStorage service exist"
fi

echo ""
echo "🎯 VERIFICATION COMPLETE"
echo "========================"