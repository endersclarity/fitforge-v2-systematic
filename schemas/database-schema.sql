-- FitForge Database Schema
-- Created: December 21, 2024
-- Purpose: Production-ready schema for fitness tracking with muscle fatigue analytics
-- 
-- SCHEMA-FIRST DEVELOPMENT: This schema serves as the single source of truth
-- All Pydantic models and TypeScript interfaces MUST match these exact column names and types

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- Extends Supabase auth.users with fitness-specific profile data
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    
    -- Personal metrics for volume calculations
    height_inches INTEGER CHECK (height_inches > 0 AND height_inches < 120),
    weight_lbs DECIMAL(5,2) CHECK (weight_lbs > 0 AND weight_lbs < 1000),
    age INTEGER CHECK (age > 0 AND age < 150),
    sex TEXT CHECK (sex IN ('M', 'F', 'Other')),
    
    -- Fitness preferences
    experience_level TEXT DEFAULT 'Beginner' CHECK (experience_level IN ('Beginner', 'Intermediate', 'Advanced')),
    primary_goals TEXT[] DEFAULT ARRAY['General Fitness'],
    available_equipment TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Progressive disclosure tracking
    workout_count INTEGER DEFAULT 0 CHECK (workout_count >= 0),
    feature_level INTEGER DEFAULT 1 CHECK (feature_level >= 1 AND feature_level <= 4),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- EXERCISES TABLE  
-- Master exercise library with scientific muscle engagement data
-- ============================================================================
CREATE TABLE exercises (
    id TEXT PRIMARY KEY, -- e.g., 'single_arm_upright_row'
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- Push, Pull, Legs, etc.
    equipment TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    variation TEXT CHECK (variation IN ('A', 'B', 'A/B')),
    
    -- Instructions and guidance
    instructions TEXT[],
    setup_tips TEXT[],
    safety_notes TEXT[],
    
    -- Muscle engagement data (percentages 0-100)
    muscle_engagement JSONB NOT NULL, -- {"Biceps_Brachii": 80, "Core": 15}
    primary_muscles TEXT[] NOT NULL,
    secondary_muscles TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Exercise metadata
    is_compound BOOLEAN DEFAULT TRUE,
    is_unilateral BOOLEAN DEFAULT FALSE,
    movement_pattern TEXT, -- 'Push', 'Pull', 'Squat', 'Hinge', etc.
    
    -- System fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- WORKOUTS TABLE
-- Workout sessions with calculated metrics
-- ============================================================================
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session identification
    name TEXT,
    workout_type TEXT, -- 'Push', 'Pull', 'Legs', 'Full Body', 'Custom'
    variation TEXT CHECK (variation IN ('A', 'B')), -- For A/B periodization
    
    -- Session timing
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN ended_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (ended_at - started_at))::INTEGER
            ELSE NULL
        END
    ) STORED,
    
    -- Session metrics (calculated)
    total_volume_lbs DECIMAL(10,2) DEFAULT 0, -- Sum of weight * reps across all sets
    total_sets INTEGER DEFAULT 0,
    total_reps INTEGER DEFAULT 0,
    exercises_count INTEGER DEFAULT 0,
    
    -- Session notes and feedback
    notes TEXT,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
    perceived_exertion INTEGER CHECK (perceived_exertion >= 1 AND perceived_exertion <= 10),
    
    -- Progressive overload tracking
    previous_workout_id UUID REFERENCES workouts(id),
    volume_increase_percentage DECIMAL(5,2), -- Calculated vs previous workout
    
    -- System fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_completed BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- WORKOUT_SETS TABLE
-- Individual sets within workouts with strict validation
-- ============================================================================
CREATE TABLE workout_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL REFERENCES exercises(id),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Set data with business rule validation
    set_number INTEGER NOT NULL CHECK (set_number > 0 AND set_number <= 20),
    reps INTEGER NOT NULL CHECK (reps >= 1 AND reps <= 50), -- Prevents impossible rep counts
    weight_lbs DECIMAL(6,2) NOT NULL CHECK (weight_lbs >= 0 AND weight_lbs <= 500), -- Max 500lbs
    
    -- Weight increment validation (0.25 lb increments)
    CONSTRAINT valid_weight_increment CHECK (
        (weight_lbs * 4) = FLOOR(weight_lbs * 4) -- Ensures 0.25 lb increments
    ),
    
    -- Performance metrics
    time_under_tension_seconds INTEGER CHECK (time_under_tension_seconds > 0),
    rest_seconds INTEGER CHECK (rest_seconds >= 0 AND rest_seconds <= 600), -- Max 10 min rest
    perceived_exertion INTEGER CHECK (perceived_exertion >= 1 AND perceived_exertion <= 10),
    
    -- Calculated metrics
    volume_lbs DECIMAL(8,2) GENERATED ALWAYS AS (weight_lbs * reps) STORED,
    estimated_one_rep_max DECIMAL(6,2), -- Calculated using Epley formula
    
    -- Progressive tracking
    is_personal_best BOOLEAN DEFAULT FALSE,
    improvement_vs_last DECIMAL(5,2), -- Percentage improvement
    
    -- System fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure logical ordering within workouts
    UNIQUE(workout_id, exercise_id, set_number)
);

-- ============================================================================
-- MUSCLE_STATES TABLE
-- Calculated muscle fatigue and recovery data
-- ============================================================================
CREATE TABLE muscle_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Muscle identification
    muscle_name TEXT NOT NULL, -- e.g., 'Biceps_Brachii', 'Pectoralis_Major'
    muscle_group TEXT NOT NULL, -- 'Push', 'Pull', 'Legs'
    
    -- Fatigue calculation (0-100 scale)
    fatigue_percentage DECIMAL(5,2) NOT NULL CHECK (fatigue_percentage >= 0 AND fatigue_percentage <= 100),
    recovery_percentage DECIMAL(5,2) NOT NULL CHECK (recovery_percentage >= 0 AND recovery_percentage <= 100),
    
    -- Volume tracking (7-day rolling window)
    weekly_volume_lbs DECIMAL(10,2) DEFAULT 0,
    weekly_sets INTEGER DEFAULT 0,
    weekly_frequency INTEGER DEFAULT 0, -- How many days this week
    
    -- Recovery modeling (5-day recovery curve)
    last_trained_date DATE,
    days_since_trained INTEGER GENERATED ALWAYS AS (
        CURRENT_DATE - last_trained_date
    ) STORED,
    expected_recovery_date DATE,
    
    -- Progressive overload recommendations
    target_volume_increase_percentage DECIMAL(5,2) DEFAULT 3.0, -- 3% target increase
    recommended_next_weight DECIMAL(6,2),
    recommended_next_reps INTEGER,
    
    -- Calculation metadata
    calculation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_workout_id UUID REFERENCES workouts(id),
    
    -- System fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per user per muscle at each calculation time
    UNIQUE(user_id, muscle_name, DATE(calculation_timestamp))
);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- Ensure users can only access their own data
-- ============================================================================

-- Enable RLS on all user data tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE muscle_states ENABLE ROW LEVEL SECURITY;

-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only access their own workouts
CREATE POLICY "Users can view own workouts" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON workouts FOR DELETE USING (auth.uid() = user_id);

-- Users can only access their own workout sets
CREATE POLICY "Users can view own workout sets" ON workout_sets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout sets" ON workout_sets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout sets" ON workout_sets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout sets" ON workout_sets FOR DELETE USING (auth.uid() = user_id);

-- Users can only access their own muscle states
CREATE POLICY "Users can view own muscle states" ON muscle_states FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own muscle states" ON muscle_states FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own muscle states" ON muscle_states FOR UPDATE USING (auth.uid() = user_id);

-- Exercises are public read-only
CREATE POLICY "Anyone can view exercises" ON exercises FOR SELECT USING (true);

-- ============================================================================
-- PERFORMANCE INDEXES
-- Optimized for expected query patterns
-- ============================================================================

-- User profile lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_workout_count ON users(workout_count);

-- Exercise searches and filtering
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_equipment ON exercises(equipment);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_exercises_muscle_engagement ON exercises USING GIN(muscle_engagement);
CREATE INDEX idx_exercises_primary_muscles ON exercises USING GIN(primary_muscles);

-- Workout queries (recent workouts, workout type analysis)
CREATE INDEX idx_workouts_user_started ON workouts(user_id, started_at DESC);
CREATE INDEX idx_workouts_type ON workouts(workout_type);
CREATE INDEX idx_workouts_completed ON workouts(user_id, is_completed);

-- Workout set queries (exercise history, volume calculations)
CREATE INDEX idx_workout_sets_user_exercise ON workout_sets(user_id, exercise_id, created_at DESC);
CREATE INDEX idx_workout_sets_workout ON workout_sets(workout_id, set_number);
CREATE INDEX idx_workout_sets_volume ON workout_sets(user_id, volume_lbs DESC);
CREATE INDEX idx_workout_sets_created ON workout_sets(created_at);

-- Muscle state queries (fatigue calculations, recovery tracking)
CREATE INDEX idx_muscle_states_user_muscle ON muscle_states(user_id, muscle_name);
CREATE INDEX idx_muscle_states_calculation ON muscle_states(calculation_timestamp DESC);
CREATE INDEX idx_muscle_states_fatigue ON muscle_states(user_id, fatigue_percentage DESC);

-- ============================================================================
-- FUNCTIONS FOR AUTOMATIC UPDATES
-- Maintain calculated fields and enforce business logic
-- ============================================================================

-- Function to update workout metrics when sets are added/updated
CREATE OR REPLACE FUNCTION update_workout_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update workout totals
    UPDATE workouts SET
        total_volume_lbs = (
            SELECT COALESCE(SUM(volume_lbs), 0)
            FROM workout_sets 
            WHERE workout_id = COALESCE(NEW.workout_id, OLD.workout_id)
        ),
        total_sets = (
            SELECT COUNT(*)
            FROM workout_sets 
            WHERE workout_id = COALESCE(NEW.workout_id, OLD.workout_id)
        ),
        total_reps = (
            SELECT COALESCE(SUM(reps), 0)
            FROM workout_sets 
            WHERE workout_id = COALESCE(NEW.workout_id, OLD.workout_id)
        ),
        exercises_count = (
            SELECT COUNT(DISTINCT exercise_id)
            FROM workout_sets 
            WHERE workout_id = COALESCE(NEW.workout_id, OLD.workout_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.workout_id, OLD.workout_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update workout metrics automatically
CREATE TRIGGER trigger_update_workout_metrics
    AFTER INSERT OR UPDATE OR DELETE ON workout_sets
    FOR EACH ROW
    EXECUTE FUNCTION update_workout_metrics();

-- Function to update user workout count
CREATE OR REPLACE FUNCTION update_user_workout_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_completed = TRUE THEN
        UPDATE users SET 
            workout_count = workout_count + 1,
            feature_level = CASE 
                WHEN workout_count + 1 >= 20 THEN 4
                WHEN workout_count + 1 >= 10 THEN 3
                WHEN workout_count + 1 >= 3 THEN 2
                ELSE 1
            END,
            last_active_at = NOW()
        WHERE id = NEW.user_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.is_completed = FALSE AND NEW.is_completed = TRUE THEN
        UPDATE users SET 
            workout_count = workout_count + 1,
            feature_level = CASE 
                WHEN workout_count + 1 >= 20 THEN 4
                WHEN workout_count + 1 >= 10 THEN 3
                WHEN workout_count + 1 >= 3 THEN 2
                ELSE 1
            END,
            last_active_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for progressive disclosure
CREATE TRIGGER trigger_update_user_workout_count
    AFTER INSERT OR UPDATE ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_workout_count();

-- ============================================================================
-- VALIDATION FUNCTIONS
-- Ensure data integrity beyond constraints
-- ============================================================================

-- Function to validate muscle engagement data
CREATE OR REPLACE FUNCTION validate_muscle_engagement(engagement JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check that all values are between 0 and 100
    IF EXISTS (
        SELECT 1 FROM jsonb_each_text(engagement) 
        WHERE value::NUMERIC < 0 OR value::NUMERIC > 100
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Check that at least one muscle has engagement > 0
    IF NOT EXISTS (
        SELECT 1 FROM jsonb_each_text(engagement) 
        WHERE value::NUMERIC > 0
    ) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add constraint to exercises table
ALTER TABLE exercises ADD CONSTRAINT valid_muscle_engagement 
    CHECK (validate_muscle_engagement(muscle_engagement));

-- ============================================================================
-- SAMPLE DATA VERIFICATION QUERIES
-- Use these to verify schema works with real data
-- ============================================================================

-- Query to verify exercise data structure matches existing JSON
-- SELECT id, name, category, equipment, difficulty, muscle_engagement 
-- FROM exercises WHERE id = 'single_arm_upright_row';

-- Query to verify workout logging workflow
-- SELECT w.name, ws.exercise_id, ws.set_number, ws.reps, ws.weight_lbs, ws.volume_lbs
-- FROM workouts w 
-- JOIN workout_sets ws ON w.id = ws.workout_id 
-- WHERE w.user_id = '[user_id]' 
-- ORDER BY w.started_at DESC, ws.set_number;

-- Query to verify muscle fatigue calculations
-- SELECT muscle_name, fatigue_percentage, recovery_percentage, weekly_volume_lbs
-- FROM muscle_states 
-- WHERE user_id = '[user_id]' AND calculation_timestamp::date = CURRENT_DATE
-- ORDER BY fatigue_percentage DESC;

-- ============================================================================
-- SCHEMA VERIFICATION COMMANDS
-- Use these to verify schema matches Pydantic models
-- ============================================================================

-- Verify column names and types for Pydantic model generation
-- SELECT table_name, column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name, ordinal_position;

-- Verify constraints for validation rules
-- SELECT tc.table_name, tc.constraint_name, tc.constraint_type, cc.check_clause
-- FROM information_schema.table_constraints tc
-- LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
-- WHERE tc.table_schema = 'public'
-- ORDER BY tc.table_name, tc.constraint_type;