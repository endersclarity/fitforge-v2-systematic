// Test workout flow
const baseUrl = 'http://localhost:8080';

async function testWorkoutFlow() {
  console.log('🧪 Testing FitForge Workout Flow...\n');
  
  // Test 1: Homepage loads
  try {
    const homeRes = await fetch(baseUrl);
    console.log(`✅ Homepage: ${homeRes.status} ${homeRes.statusText}`);
  } catch (e) {
    console.log(`❌ Homepage failed: ${e.message}`);
  }

  // Test 2: Check localStorage API
  console.log('\n📦 Testing localStorage (simulated):');
  const testWorkout = {
    id: Date.now().toString(),
    name: 'Test Workout',
    date: new Date().toISOString(),
    duration: 45,
    exercises: [
      { id: 'squat', name: 'Barbell Squat', sets: 3 }
    ],
    totalSets: 3
  };
  console.log('Would save to localStorage:', JSON.stringify(testWorkout, null, 2));

  // Test 3: Check key pages
  const pages = ['/dashboard', '/workouts'];
  for (const page of pages) {
    try {
      const res = await fetch(baseUrl + page);
      console.log(`\n📄 ${page}: ${res.status} ${res.statusText}`);
    } catch (e) {
      console.log(`\n❌ ${page} failed: ${e.message}`);
    }
  }
}

testWorkoutFlow();
