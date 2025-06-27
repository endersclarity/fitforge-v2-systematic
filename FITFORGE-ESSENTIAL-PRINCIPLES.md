# FITFORGE ESSENTIAL PRINCIPLES
*Critical rules that MUST be followed for EVERY prompt and feature implementation*

## 🚨 MANDATORY SCHEMA-FIRST DEVELOPMENT

### The Core Problem
The broken exercise filters happened because components used different data contracts:
- CleanFilterBar sends display names: `"Chest"`
- Exercise data uses scientific names: `"Pectoralis_Major"`
- No agreed-upon data contract between components

### The Solution: Schema-First Rules

```bash
# BEFORE writing ANY database code or component:
1. Check actual schema/data structure FIRST
2. Document EXACT field names and types
3. Create shared interfaces matching reality
4. ONLY THEN write implementation code
```

**NEVER ASSUME** field names, column types, or data formats exist without verification.

---

## 📋 DATA CONTRACT STANDARDS

### Single Source of Truth
```typescript
// MANDATORY: Define data contracts in ONE place
// schemas/typescript-interfaces.ts or similar

export const MUSCLE_NAMES = {
  // Data values (what's in database/JSON)
  PECTORALIS_MAJOR: 'Pectoralis_Major',
  TRICEPS_BRACHII: 'Triceps_Brachii',
  // ... etc
} as const;

export const MUSCLE_DISPLAY_NAMES: Record<string, string> = {
  'Pectoralis_Major': 'Chest',
  'Triceps_Brachii': 'Triceps',
  // ... etc
};
```

### Component Communication Rules
- **Props MUST match component interfaces exactly**
- **Filter components send DATA values, not display values**
- **Transformation happens at display layer only**

```typescript
// CORRECT: Filter sends data value
onFilterChange({ targetMuscle: ['Pectoralis_Major'] })

// WRONG: Filter sends display value
onFilterChange({ targetMuscle: ['Chest'] })
```

---

## 🛡️ MULTI-LAYER VALIDATION

### Pydantic Validation (Backend)
```python
class WorkoutSet(BaseModel):
    reps: conint(ge=1, le=50)  # Prevents "135 reps" errors
    weight: confloat(ge=0, le=500)  # Realistic weight range
    
    class Config:
        extra = "forbid"  # CRITICAL: Reject unknown fields
        validate_assignment = True
```

### Client Validation (Frontend)
```typescript
const WorkoutSetSchema = z.object({
  reps: z.number().min(1).max(50),
  weight: z.number().min(0).max(500).multipleOf(0.25),
});
```

### Database Constraints
```sql
ALTER TABLE workout_sets ADD CONSTRAINT valid_reps CHECK (reps BETWEEN 1 AND 50);
ALTER TABLE workout_sets ADD CONSTRAINT valid_weight CHECK (weight BETWEEN 0 AND 500);
```

---

## 🔍 EVIDENCE-FIRST DEBUGGING

### Mandatory Instrumentation Pattern
```javascript
// REQUIRED in EVERY function that processes data
console.log('🔥 [FUNCTION_NAME] ENTRY:', { inputs });
console.log('🔧 [TRANSFORMATION] BEFORE:', dataBefore);
console.log('🔧 [TRANSFORMATION] AFTER:', dataAfter);

if (!expectedCondition) {
  console.log('🚨 FAILURE:', {
    expected: expectedValue,
    actual: actualValue,
    context: relevantData
  });
}
```

### Testing Requirements
**NEVER claim a feature works without:**
1. Tracing the complete data flow
2. Verifying with actual tools (curl, grep, jq, Playwright, Puppeteer)
3. Testing the ACTUAL user interaction path
4. Confirming visual output matches data state

**Available Testing Methods:**
- `curl -s [url] | grep -c [selector]` - Count elements
- `npx playwright test` - Run E2E tests
- `node scripts/test-with-puppeteer.js` - Direct browser automation
- Manual code tracing to verify data contracts

---

## 🔌 COMPONENT INTEGRATION RULES

### Filter Component Integration
```typescript
// VERIFY these match before implementation:
interface FilterComponentProps {
  onFilterChange: (filters: FilterState) => void;
  // NO exercises prop if component loads its own data
  // NO filterState prop if component manages its own state
}

interface FilterState {
  equipment: string[];      // Data values from EQUIPMENT_TYPES
  targetMuscle: string[];   // Data values from exercise JSON
  group: string[];          // Standardized: 'Push', 'Pull', 'Legs', 'Abs'
}
```

### State Management Rules
- Filter state uses DATA values, not display values
- Transformations happen at render time only
- Parent components receive data values to filter with

---

## ✅ TESTING BEFORE CLAIMING SUCCESS

### The /issue Command Requirement
```bash
# MANDATORY before marking ANY interactive feature complete:
1. Use curl to get initial state
2. Trace code to simulate interaction
3. Calculate expected result
4. Verify with data tools:
   cat data/exercises.json | jq '[.[] | select(.equipment == "Dumbbell")] | length'
5. Document complete flow from click to result
```

### Evidence Format
```
INTERACTION TEST: Equipment Filter - Dumbbell
INITIAL STATE: 38 exercises shown
CLICK SIMULATION: Filter outputs {equipment: ['Dumbbell']}
DATA VERIFICATION: 11 dumbbell exercises in data
EXPECTED: Shows 11 exercises
ACTUAL: [MUST VERIFY THIS MATCHES]
```

---

## 🏗️ ARCHITECTURE PATTERNS

### Progressive Disclosure
- **Level 1** (Workouts 1-3): Just Exercise → Weight → Reps → Sets
- **Level 2** (Workouts 4-10): Add "last time" comparisons
- **Level 3** (2+ weeks): Show volume calculations
- **Level 4** (1+ month): Full analytics

### Data Persistence
- **IndexedDB** for workout history (NOT localStorage - 5MB limit)
- **Auto-save** after every field to prevent data loss
- **Background sync** for offline capability
- **Export functionality** for data ownership

### Real-time Updates
```typescript
// Efficient channel usage (free tier: 200 concurrent)
const channel = supabase
  .channel(`workout-${sessionId}`)  // One per session, not per user
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'workout_sets',
    filter: `session_id=eq.${sessionId}`  // Specific filtering
  }, handleUpdate)
  .subscribe();

// CRITICAL: Clean up channels
await supabase.removeChannel(channel);
```

---

## 🚀 DEVELOPMENT WORKFLOW

### Git Workflow (MANDATORY)
```bash
git checkout -b feature/issue-name  # NEVER work on main
# ... development ...
git add . && git commit -m "feat: description"
git checkout main && git merge feature/issue-name
git branch -d feature/issue-name
```

### Testing Environment
- **ONLY TEST AT**: localhost:8080 (Docker container)
- **FORBIDDEN**: npm run dev, localhost:3000, local testing
- **One-command startup**: `./start-fitforge-v2-dev.sh`

### Task Management
- **USE**: TaskMaster commands (`npx task-master list`, `npx task-master next`)
- **FORBIDDEN**: Claude todos, manual task tracking

---

## ⚡ PERFORMANCE REQUIREMENTS

### Response Times
- **API calls**: <500ms
- **Page loads**: <2 seconds  
- **Exercise selection**: <500ms
- **Set logging**: Immediate with auto-save

### Caching Rules
```typescript
// Static data (exercises): Cache aggressively
'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'

// User data: NEVER cache
export const dynamic = 'force-dynamic';
```

---

## 🎯 WHEN THINGS GO WRONG

### Schema Mismatch Pattern
**Symptom**: Features don't work despite "correct" code
**Cause**: Components using different data contracts
**Fix**: 
1. Stop immediately
2. Document all data contracts
3. Verify what each component sends/receives
4. Establish single source of truth
5. Update all components to match

### The Nuclear Option
When architecture is fundamentally broken:
1. Document the current broken state
2. Define the correct data contracts
3. Reimplement with schema-first approach
4. Test EVERY interaction path
5. Never assume - always verify

---

## 📌 QUICK REFERENCE CHECKLIST

Before implementing ANY feature:
- [ ] Verified actual data schema/structure
- [ ] Defined data contracts in shared location
- [ ] Components use consistent data values
- [ ] Multi-layer validation implemented
- [ ] Evidence-first debugging instrumented
- [ ] Actual functionality tested with tools
- [ ] Using correct git workflow
- [ ] Testing in Docker container only

**Remember**: The broken filters could have been prevented by following these principles. Every architecture failure stems from violating one of these rules.