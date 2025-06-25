# Database Schema Design Decisions

*Architectural rationale and design choices for FitForge database schema*

**Created**: December 21, 2024  
**Schema Version**: 1.0  
**Review Status**: Initial Implementation

---

## Design Philosophy

### Schema-First Development Approach
- **Database schema serves as the single source of truth**
- All Pydantic models and TypeScript interfaces must match exact column names and types
- Business logic constraints enforced at the database level
- Validation rules prevent impossible data scenarios (CRM corruption prevention)

### Production-Quality Standards
- Comprehensive indexing for expected query patterns
- Row Level Security for multi-tenant data isolation
- Automatic triggers for calculated fields
- Proper foreign key relationships and cascading deletes

---

## Table Design Decisions

### 1. Users Table

#### Design Choices
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_count INTEGER DEFAULT 0,
    feature_level INTEGER DEFAULT 1 CHECK (feature_level >= 1 AND feature_level <= 4),
    -- ...
);
```

**Rationale:**
- **UUID Primary Key**: Integrates with Supabase Auth, ensures user data isolation
- **Progressive Disclosure**: `feature_level` automatically calculated from `workout_count`
  - Level 1: 0-2 workouts (basic logging only)
  - Level 2: 3-9 workouts (comparisons appear)
  - Level 3: 10-19 workouts (analytics available)
  - Level 4: 20+ workouts (full features unlocked)
- **Fitness Metrics**: Height, weight, age for volume calculations and progressive overload
- **Equipment Tracking**: Available equipment affects exercise recommendations

**Alternative Considered**: Separate user_profiles table
**Why Rejected**: Adds complexity without benefit for single-profile-per-user scenario

### 2. Exercises Table

#### Design Choices
```sql
CREATE TABLE exercises (
    id TEXT PRIMARY KEY, -- 'single_arm_upright_row'
    muscle_engagement JSONB NOT NULL,
    primary_muscles TEXT[] NOT NULL,
    -- ...
);
```

**Rationale:**
- **Text ID**: Human-readable identifiers from existing exercise data (`single_arm_upright_row`)
- **JSONB for Muscle Engagement**: Flexible storage for scientific muscle percentages
  - Enables complex queries: `WHERE muscle_engagement->>'Biceps_Brachii' > '50'`
  - Validates percentage ranges (0-100) with custom constraint
- **Array Fields**: PostgreSQL native arrays for muscle lists
- **Variation System**: A/B variations for periodization and muscle confusion

**Alternative Considered**: Separate muscle_engagement table
**Why Rejected**: JSONB provides better performance for muscle percentage queries

### 3. Workouts Table

#### Design Choices
```sql
CREATE TABLE workouts (
    duration_seconds INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (ended_at - started_at))::INTEGER
    ) STORED,
    total_volume_lbs DECIMAL(10,2) DEFAULT 0, -- Updated by trigger
    -- ...
);
```

**Rationale:**
- **Generated Columns**: `duration_seconds` automatically calculated from start/end times
- **Calculated Metrics**: Totals updated via triggers when sets are added/modified
- **A/B Periodization**: `variation` field supports workout alternation
- **Progressive Overload**: Links to previous workout for volume comparison
- **Session Feedback**: Energy level and perceived exertion for load management

**Alternative Considered**: Calculate metrics in application code
**Why Rejected**: Database triggers ensure consistency, prevent calculation errors

### 4. Workout Sets Table

#### Design Choices
```sql
CREATE TABLE workout_sets (
    reps INTEGER NOT NULL CHECK (reps >= 1 AND reps <= 50),
    weight_lbs DECIMAL(6,2) NOT NULL CHECK (weight_lbs >= 0 AND weight_lbs <= 500),
    CONSTRAINT valid_weight_increment CHECK (
        (weight_lbs * 4) = FLOOR(weight_lbs * 4) -- 0.25 lb increments
    ),
    volume_lbs DECIMAL(8,2) GENERATED ALWAYS AS (weight_lbs * reps) STORED,
    -- ...
);
```

**Rationale:**
- **Strict Validation**: Prevents impossible data (135 reps, 2000 lb weights)
- **Weight Increments**: 0.25 lb constraint matches real gym equipment
- **Volume Calculation**: Stored generated column for performance
- **Personal Best Tracking**: Boolean flag for achievement recognition
- **Unique Constraint**: Prevents duplicate set numbers within same workout/exercise

**Alternative Considered**: Looser validation with application-level checks
**Why Rejected**: Database constraints provide absolute data integrity

### 5. Muscle States Table

#### Design Choices
```sql
CREATE TABLE muscle_states (
    fatigue_percentage DECIMAL(5,2) NOT NULL CHECK (fatigue_percentage >= 0 AND fatigue_percentage <= 100),
    days_since_trained INTEGER GENERATED ALWAYS AS (
        CURRENT_DATE - last_trained_date
    ) STORED,
    UNIQUE(user_id, muscle_name, DATE(calculation_timestamp)),
    -- ...
);
```

**Rationale:**
- **Fatigue Modeling**: 0-100 scale for visual heat map representation
- **Recovery Tracking**: 5-day recovery curve with automatic date calculations
- **Volume Analytics**: 7-day rolling window for overtraining prevention
- **Progressive Overload**: Recommended progressions based on 3% volume increase
- **Temporal Uniqueness**: One calculation per user per muscle per day

**Alternative Considered**: Real-time calculation without storage
**Why Rejected**: Complex calculations benefit from caching and historical analysis

---

## Security Design

### Row Level Security (RLS)
```sql
CREATE POLICY "Users can view own workouts" ON workouts 
FOR SELECT USING (auth.uid() = user_id);
```

**Implementation:**
- **Complete Data Isolation**: Users can only access their own data
- **Public Exercise Library**: Exercises table readable by all authenticated users
- **Service Role Bypass**: Backend services use service role for cross-user operations
- **Automatic Enforcement**: Database-level security cannot be bypassed

**Alternative Considered**: Application-level access control
**Why Rejected**: Database RLS provides stronger security guarantees

---

## Performance Optimization

### Indexing Strategy
```sql
-- User-specific data access patterns
CREATE INDEX idx_workouts_user_started ON workouts(user_id, started_at DESC);
CREATE INDEX idx_workout_sets_user_exercise ON workout_sets(user_id, exercise_id, created_at DESC);

-- Exercise search and filtering
CREATE INDEX idx_exercises_muscle_engagement ON exercises USING GIN(muscle_engagement);
CREATE INDEX idx_exercises_primary_muscles ON exercises USING GIN(primary_muscles);
```

**Rationale:**
- **User-Centric Queries**: Most queries filter by user_id first
- **Time-Series Access**: Recent workouts and exercise history use time-based ordering
- **JSON Indexing**: GIN indexes enable fast muscle engagement queries
- **Composite Indexes**: Multi-column indexes for common query patterns

### Automatic Maintenance
```sql
CREATE TRIGGER trigger_update_workout_metrics
    AFTER INSERT OR UPDATE OR DELETE ON workout_sets
    FOR EACH ROW
    EXECUTE FUNCTION update_workout_metrics();
```

**Benefits:**
- **Data Consistency**: Calculated fields always accurate
- **Performance**: Pre-calculated totals avoid complex aggregation queries
- **Simplicity**: Application code doesn't handle metric calculations

---

## Data Validation Strategy

### Business Rule Enforcement
```sql
-- Prevent impossible workout data
CHECK (reps >= 1 AND reps <= 50)
CHECK (weight_lbs >= 0 AND weight_lbs <= 500)
CHECK ((weight_lbs * 4) = FLOOR(weight_lbs * 4)) -- 0.25 lb increments

-- Validate muscle engagement percentages
CHECK (validate_muscle_engagement(muscle_engagement))
```

**Principles:**
- **Database-Level Validation**: Absolute data integrity
- **Business Logic Constraints**: Realistic fitness data ranges
- **Custom Functions**: Complex validation logic in database functions
- **Fail-Fast Approach**: Invalid data rejected immediately

### Integration with Pydantic
- Database constraints mirror Pydantic Field() validators
- Consistent error messages between database and application
- Type safety from database to frontend via TypeScript interfaces

---

## Scalability Considerations

### Growth Planning
- **Partitioning Strategy**: Future partitioning by user_id for large datasets
- **Archive Strategy**: Old workout data can be moved to archive tables
- **Index Maintenance**: Regular VACUUM and REINDEX for performance
- **Query Optimization**: Explain plans monitored for slow queries

### Current Limitations
- **Single Database**: No horizontal scaling initially
- **JSONB Queries**: Complex muscle engagement queries may need optimization
- **Trigger Overhead**: Multiple triggers on workout_sets may impact bulk operations

---

## Migration Strategy

### Version Control
- **Schema Migrations**: All changes tracked in numbered migration files
- **Rollback Plans**: Each migration includes rollback procedures
- **Data Migration**: Scripts for transforming existing exercise JSON data
- **Testing**: All migrations tested on production-like data

### Deployment Process
1. **Backup Current Schema**: Full database backup before changes
2. **Apply Migration**: Run migration in transaction
3. **Verify Data Integrity**: Run validation queries
4. **Update Application**: Deploy application code changes
5. **Monitor Performance**: Watch for query performance regressions

---

## Quality Assurance

### Testing Strategy
- **Unit Tests**: Each function and trigger tested individually
- **Integration Tests**: Full workout logging workflow tested
- **Performance Tests**: Large dataset queries benchmarked
- **Security Tests**: RLS policies verified with test users

### Monitoring
- **Query Performance**: Slow query log analysis
- **Data Quality**: Regular constraint violation checks
- **Storage Growth**: Table size monitoring for capacity planning
- **Index Usage**: Unused index identification

---

## Conclusion

This schema design prioritizes:
1. **Data Integrity**: Comprehensive validation and constraints
2. **Performance**: Strategic indexing and pre-calculated fields
3. **Security**: Row-level security and proper access control
4. **Maintainability**: Clear relationships and automatic maintenance
5. **Scalability**: Designed for growth with optimization opportunities

The schema serves as the foundation for systematic development, ensuring that all application layers (Pydantic, FastAPI, TypeScript) maintain consistency with the authoritative database structure.

**Next Phase**: Implement Pydantic models that match this exact schema for backend API validation.