# 🔧 TECHNICAL SPECIFICATIONS & DEBUGGING GUIDE

## 🏗️ SYSTEM ARCHITECTURE OVERVIEW

### Stack Components:
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python 3.11 + Pydantic V2
- **Database**: PostgreSQL 15 with RLS (Row Level Security)
- **Development**: Docker Compose with hot reload

### Port Configuration:
- **Frontend**: http://localhost:3001 (NOT 3000 - changed due to conflicts)
- **Backend**: http://localhost:8000
- **Database**: localhost:5432
- **API Docs**: http://localhost:8000/docs

---

## 🚨 KNOWN ISSUES TO INVESTIGATE

### 1. Frontend Build Failure
```bash
# Current error:
npm error 404 Not Found - GET https://registry.npmjs.org/react-window-autosizer
npm error 404 'react-window-autosizer@^0.3.0' is not in this registry.
```

**Investigation Tasks:**
- Research correct package name (might be `react-virtualized-auto-sizer`)
- Check if other dependencies are also incorrect
- Verify package.json has valid versions for all deps

### 2. Port Conflicts
```yaml
# docker-compose.fast.yml uses port 3001:
ports:
  - "3001:3000"  # Changed from standard 3000
```

**Why**: Documented as Windows/WSL port permission issues

### 3. Component Import Paths
Many components reference paths that may not exist:
```typescript
import { ExerciseSelector } from './ExerciseSelector'  // Does this exist?
import { SetLogger } from './SetLogger'                // What about this?
```

---

## 🔍 DEBUGGING COMMANDS

### Docker Diagnostics:
```bash
# Check service status
docker-compose -f docker-compose.fast.yml ps

# View logs for specific service
docker-compose -f docker-compose.fast.yml logs frontend
docker-compose -f docker-compose.fast.yml logs backend
docker-compose -f docker-compose.fast.yml logs db

# Execute commands inside containers
docker-compose -f docker-compose.fast.yml exec frontend sh
docker-compose -f docker-compose.fast.yml exec backend bash
```

### Database Connection Test:
```bash
# Connect to PostgreSQL directly
docker-compose -f docker-compose.fast.yml exec db psql -U fitforge_user -d fitforge_dev

# Check if tables exist
\dt

# Verify schema loaded
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

### Backend API Testing:
```bash
# Health check
curl http://localhost:8000/

# API documentation
curl http://localhost:8000/docs

# Test specific endpoints
curl http://localhost:8000/api/exercises
curl http://localhost:8000/api/workouts
curl -X POST http://localhost:8000/api/workouts \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "workout_type": "A"}'
```

---

## 📁 KEY FILES TO EXAMINE

### Frontend Entry Points:
```
app/page.tsx                 # Main dashboard
app/workouts/page.tsx        # Workout creation page
components/dashboard.tsx     # Main dashboard component
components/workout-creator.tsx # Workout logging interface
```

### API Client:
```
lib/api-client.ts           # Type-safe API client with retry logic
hooks/useWorkoutLogger.ts   # Workout logging hook
hooks/useAuth.ts            # Authentication hook (mock)
```

### Backend API:
```
backend/main.py             # FastAPI app with all routes
backend/app/api/workouts.py # Workout endpoints
backend/app/api/exercises.py # Exercise endpoints
backend/app/core/config.py  # Settings management
```

### Database Schema:
```
schemas/database-schema.sql      # PostgreSQL schema
schemas/typescript-interfaces.ts # Frontend types
schemas/pydantic-models.py      # Backend models
```

---

## 🧪 TESTING APPROACH

### 1. Build Verification
```bash
# Fix dependencies first
npm install --package-lock-only
npm audit fix

# Try manual build
npm run build
```

### 2. Service Health Checks
```bash
# Frontend response
curl -I http://localhost:3001

# Backend health
curl http://localhost:8000/health

# Database connection
pg_isready -h localhost -p 5432 -U fitforge_user
```

### 3. API Integration Test
```javascript
// Browser console test:
fetch('http://localhost:8000/api/exercises')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### 4. Frontend-Backend Communication
```javascript
// Check if frontend actually calls backend:
// Open browser dev tools → Network tab
// Perform workout logging actions
// Look for HTTP requests to localhost:8000
```

---

## 🎯 SPECIFIC INVESTIGATION TARGETS

### Component Integration Reality:
1. **WorkoutLogger** (`components/workout/WorkoutLogger.tsx`)
   - Does it import correctly?
   - Are all its dependencies available?
   - Does it make real API calls?

2. **Dashboard** (`components/dashboard.tsx`)
   - Are the stats real or hardcoded?
   - Do the charts actually render?
   - Is data coming from API or localStorage?

3. **ExerciseSelector** (`components/exercise/ExerciseSelector.tsx`)
   - Can users actually select exercises?
   - Is search functionality working?
   - Does virtualization work with large lists?

### API Functionality:
1. **Authentication**: Is the mock auth working?
2. **CRUD Operations**: Can you create, read, update, delete workouts?
3. **Data Validation**: Are Pydantic models preventing bad data?
4. **Error Handling**: Do friendly errors appear for users?

### Database Integration:
1. **Schema Loading**: Did the SQL file execute correctly?
2. **Data Persistence**: Are workouts actually saved?
3. **Relationships**: Do foreign keys work correctly?
4. **Triggers**: Are calculated fields being computed?

---

## 🔧 COMMON FIXES

### Dependency Issues:
```bash
# Fix react-window-autosizer
npm uninstall react-window-autosizer
npm install react-virtualized-auto-sizer

# Update package.json
sed -i 's/react-window-autosizer/react-virtualized-auto-sizer/g' package.json
```

### Port Conflicts:
```bash
# Check what's using port 3000
lsof -i :3000

# Kill processes if needed
pkill -f "node.*3000"
```

### Database Issues:
```sql
-- Check if schema loaded
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';

-- Verify triggers exist
SELECT trigger_name FROM information_schema.triggers;

-- Test sample data
INSERT INTO users (id, email, display_name) VALUES ('test-123', 'test@example.com', 'Test User');
```

---

## 📊 PERFORMANCE BENCHMARKS

### Target Metrics:
- **Frontend Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **Database Query Time**: < 100ms
- **Workout Logging Flow**: < 30 seconds end-to-end

### Stress Test Scenarios:
- **Large Workout**: 20+ exercises, 100+ sets
- **Heavy User**: 50+ saved workouts
- **Concurrent Users**: Multiple browser tabs
- **Network Issues**: Simulated offline/slow connections

---

## 🎯 SUCCESS METRICS

### Minimum Viable Functionality:
- [ ] All 3 Docker services start without errors
- [ ] Frontend loads without JavaScript console errors
- [ ] Can navigate between pages
- [ ] Can start a new workout
- [ ] Can add at least one exercise
- [ ] Can log at least one set with weight/reps
- [ ] Data persists after page refresh

### Excellent Functionality:
- [ ] Muscle visualization works
- [ ] Progress charts render correctly
- [ ] Search and filtering work smoothly
- [ ] Mobile experience is usable
- [ ] Error handling is user-friendly
- [ ] Performance feels snappy

This technical specification should give you everything needed to perform a thorough diagnostic of the system's actual capabilities vs. documented features.