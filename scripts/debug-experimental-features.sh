#!/bin/bash

echo "🔍 DEBUGGING EXPERIMENTAL FEATURES"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Base URL
BASE_URL="http://localhost:8080"

echo "📋 FEATURE LIST:"
echo "1. Exercise Browser (Issue #25)"
echo "2. Workout Builder (Issue #26)"  
echo "3. Workout Execution (Issue #27)"
echo "4. Recovery Dashboard (Issue #28)"
echo "5. Saved Workouts (Issue #34)"
echo ""

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local check_text=$3
    
    echo -n "Testing $name... "
    
    # Check if endpoint returns 200
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" == "200" ]; then
        # Check if page contains expected text
        if curl -s "$url" | grep -q "$check_text"; then
            echo -e "${GREEN}✅ WORKING${NC} (200 OK, contains '$check_text')"
            return 0
        else
            echo -e "${YELLOW}⚠️  PARTIAL${NC} (200 OK, but missing '$check_text')"
            return 1
        fi
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $response)"
        return 1
    fi
}

echo "🧪 TESTING ENDPOINTS:"
echo "---------------------"

# Test each feature
test_endpoint "Exercise Browser" "$BASE_URL/flows-experimental/exercise-browser" "Exercise Browser"
exercise_browser=$?

test_endpoint "Workout Builder" "$BASE_URL/flows-experimental/workout-builder" "Workout Builder"
workout_builder=$?

test_endpoint "Workout Execution" "$BASE_URL/flows-experimental/workout-execution" "Workout"
workout_execution=$?

test_endpoint "Recovery Dashboard" "$BASE_URL/flows-experimental/recovery-dashboard" "Recovery"
recovery_dashboard=$?

test_endpoint "Saved Workouts" "$BASE_URL/flows-experimental/saved-workouts" "Saved Workouts"
saved_workouts=$?

echo ""
echo "🔗 TESTING FEATURE INTEGRATION:"
echo "-------------------------------"

# Test if features can interact
echo -n "Can save workout from builder... "
if curl -s "$BASE_URL/flows-experimental/workout-builder" | grep -q "save-workout-button"; then
    echo -e "${GREEN}✅ YES${NC}"
else
    echo -e "${RED}❌ NO${NC}"
fi

echo -n "Can start workout from saved... "
if curl -s "$BASE_URL/flows-experimental/saved-workouts" | grep -q "start-workout-button"; then
    echo -e "${GREEN}✅ YES${NC}"
else
    echo -e "${RED}❌ NO${NC}"
fi

echo ""
echo "📊 SUMMARY:"
echo "-----------"

total=5
working=0

[ $exercise_browser -eq 0 ] && ((working++))
[ $workout_builder -eq 0 ] && ((working++))
[ $workout_execution -eq 0 ] && ((working++))
[ $recovery_dashboard -eq 0 ] && ((working++))
[ $saved_workouts -eq 0 ] && ((working++))

echo "Features Working: $working/$total"

if [ $working -eq $total ]; then
    echo -e "${GREEN}🎉 All experimental features are accessible!${NC}"
elif [ $working -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Some features need attention${NC}"
else
    echo -e "${RED}🚨 Major issues - features not accessible${NC}"
fi

echo ""
echo "🔍 CHECKING NAVIGATION:"
echo "----------------------"

echo -n "Main nav has experimental links... "
if curl -s "$BASE_URL" | grep -q "flows-experimental"; then
    echo -e "${GREEN}✅ YES${NC}"
else
    echo -e "${RED}❌ NO - Features not linked from main navigation${NC}"
    echo ""
    echo "💡 RECOMMENDATION: Add experimental features to main navigation or create a hub page"
fi

echo ""
echo "📝 NEXT STEPS:"
echo "--------------"
if [ $working -lt $total ]; then
    echo "1. Check if Docker container is running: docker ps"
    echo "2. Check for TypeScript/build errors: npm run build"
    echo "3. Check browser console for runtime errors"
    echo "4. Verify routes exist in app/flows-experimental/"
fi