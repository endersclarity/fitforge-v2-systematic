# FitForge V2 Systematic - Complete Codebase Export
*Generated for NotebookLM Analysis - Complete Project Context*

## Project Overview
This document contains the complete FitForge V2 Systematic codebase for NotebookLM analysis. It includes all source code, documentation, configuration files, and implementation details in a single markdown document.

---

## Table of Contents
1. [Project Documentation](#project-documentation)
2. [Database Schema & Models](#database-schema--models)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Configuration & Infrastructure](#configuration--infrastructure)
6. [Codex AI Contributions](#codex-ai-contributions)

---

## Project Documentation

### File: FitForge-Implementation-Journal.md

```markdown
# FitForge Implementation Journal
*Mission Control for Active Development - Always Start Here*

---

## 🎯 ESSENTIAL CONTEXT (Read First Every Session)

### Current Development State
- **Phase**: 1 - Backend Foundation (In Progress)
- **Active Task**: FastAPI Service Foundation (Days 5-7) - ✅ INFRASTRUCTURE COMPLETE
- **Architecture Stack**: Next.js 15 + FastAPI + Pydantic + PostgreSQL (dev) / Supabase (prod)
- **Last Completed**: Docker development environment fully operational with backend API running
- **Next Immediate Action**: Continue FastAPI endpoint development and test integration with frontend components

### Critical Success Factors
- **Portfolio Goal**: Demonstrate systematic development methodology and technical sophistication
- **Timeline**: 9 weeks total (5 phases), currently in preparation phase
- **Quality Standard**: Production-ready code with comprehensive validation and error handling

### 🤖 AI-Human Development Partnership
- **Codex Integration**: Established AI coding partner workflow (June 2025)
- **Task Delegation**: Component building, feature implementation, research-driven enhancements
- **Quality Control**: Code review and integration testing for all AI contributions
- **Branch Management**: Codex handles own branches/PRs, we review and merge

---

## 🗺️ PROJECT NAVIGATION

### Master Documentation Files
- 📋 **[Implementation Journal](./FitForge-Implementation-Journal.md)** ← YOU ARE HERE (Mission Control)
- 📖 **[Development Guide](./FitForge-Development-Guide.md)** - Complete methodology & best practices (Steps 1-8) 
- 🏗️ **[Technical Specifications](./FitForge-Technical-Specifications.md)** - Detailed architecture & data models
- 🎨 **[Style Guide](./FitForge-Style-Guide.md)** - Fitbod design system & UI components
- 📊 **[Best Practices Research](./FitForge-Best-Practices-Research.md)** - External validation findings

### Development Files (Implementation Status)
- 🗃️ **Database Schema** `./schemas/database-schema.sql` - ✅ Complete (5 tables, RLS, indexes)
- 📝 **TypeScript Interfaces** `./schemas/typescript-interfaces.ts` - ✅ Complete (exact schema match)
- 📋 **Schema Documentation** `./docs/database/schema-design-decisions.md` - ✅ Complete
- 🐍 **Pydantic Models** `./schemas/pydantic-models.py` - ✅ Complete (comprehensive validation models)
- 🐳 **Docker Development Environment** `./docker-compose.fast.yml` - ✅ Complete (hot reload enabled)
- 🔌 **FastAPI Backend** `./backend/` - 🔄 In Progress (workout endpoints implemented)
- ⚛️ **Next.js Frontend** `./app/` - 🔄 Basic structure exists
- 🧪 **Test Suite** `./tests/` - 🔄 Partial (FastAPI tests implemented)
- 📚 **API Documentation** `./docs/api-reference.md` - ❌ Not Started

### External Resources
- **Supabase Project**: [To be created]
- **GitHub Repository**: [To be created]
- **Deployment Environment**: [To be configured]

---

## ⚡ QUICK REFERENCE GUARDRAILS

### Schema-First Development (MANDATORY)
```bash
# NEVER write code without first verifying schema
# 1. Check database schema first
SELECT column_name, data_type, is_nullable FROM information_schema.columns 
WHERE table_name = 'your_table';

# 2. Match Pydantic models to exact schema
# 3. Only THEN write functions using verified column names
```

### Validation Rules (NEVER VIOLATE)
- **Pydantic Models**: `extra="forbid"` on ALL models (prevent data corruption)
- **Weight Validation**: Must be in 0.25 lb increments, max 500 lbs
- **Rep Validation**: 1-50 reps only (prevent impossible data)
- **Error Handling**: NEVER lose workout data - export before reset

### Code Quality Gates
- **Type Safety**: All code must pass TypeScript/mypy validation
- **Performance**: API responses <500ms, page loads <2s
- **Testing**: Minimum 80% test coverage required
- **Documentation**: Every function includes purpose and validation rules

### Evidence-First Debugging (ALWAYS USE)
```typescript
// Required logging pattern for all functions
console.log('🔥 [FUNCTION_NAME] ENTRY - [timestamp] - inputs:', {param1, param2});
console.log('🔧 [STEP_NAME] BEFORE:', inputData);
console.log('🔧 [STEP_NAME] AFTER:', transformedData);

if (!expectedCondition) {
  console.log('🚨 FAILURE_CONDITION - [timestamp]:', {
    expected: 'what should happen',
    actual: actualValue,
    context: relevantState
  });
}
```

---

## 🤖 AI-HUMAN DEVELOPMENT WORKFLOW

### Codex Integration Strategy (June 2025)

**Partnership Model**: Codex as specialized development partner for well-defined implementation tasks

#### Task Delegation Framework

**Delegate to Codex When:**
- Building new React/TypeScript components
- Implementing well-defined features with clear specifications
- Research-driven enhancements (leveraging internet access)
- UI/UX improvements with established patterns
- Form validation and data handling components

**Keep for Human Development:**
- Architectural decisions affecting multiple systems
- Complex debugging and integration issues
- Business logic requiring domain expertise
- Performance and security-sensitive implementations
- Real-time iteration requiring user feedback

#### Workflow Process

1. **Task Creation**: I create detailed specifications in `codex-tasks/` folder
2. **Delegation**: You point Codex to specific task file
3. **Independent Development**: Codex creates own branches and PRs
4. **Quality Review**: Code review focusing on integration and architecture
5. **Integration**: Merge approved contributions, sync context for next tasks

#### Quality Control Standards

**Code Review Checklist for Codex Contributions:**
- [ ] Follows project TypeScript and React patterns
- [ ] Integrates properly with existing codebase
- [ ] Maintains architectural consistency
- [ ] Includes proper error handling
- [ ] Meets accessibility standards
- [ ] No security vulnerabilities introduced

#### Successful Codex Collaborations Log

**WorkoutLogger Component Series (June 2025)**:
- **Round 1 (No Internet)**: Basic functional components, progressive improvement across versions
- **Round 2 (With Internet)**: Production-ready features including stepper buttons, session management, accessibility, toast notifications
- **Key Insight**: Internet access transformed capabilities from "functional" to "production-ready"
- **Lesson**: Clear specifications + internet research = high-quality deliverables

---

## 📋 DEVELOPMENT WORKFLOW CHECKLIST

### Before Every Coding Session
- [ ] Read Essential Context section above
- [ ] Review active task and next actions
- [ ] Check for any blockers or dependencies
- [ ] Navigate to relevant files using project map
- [ ] Verify current development environment state

### During Implementation
- [ ] Follow schema-first development process
- [ ] Apply validation rules and error handling
- [ ] Add evidence-first debugging instrumentation
- [ ] Update file map when creating new files
- [ ] Document decisions and rationale

### After Every Session
- [ ] Update Essential Context with progress
- [ ] Log completed tasks and next actions
- [ ] Note any blockers or important decisions
- [ ] Commit changes with descriptive messages
- [ ] Update file statuses in project navigation

---

## 🚧 CURRENT PHASE BREAKDOWN

### Phase 1: Backend Foundation (Weeks 1-2)
**Status**: 🔄 Ready to Begin

#### Task 1: Database Schema Implementation (Days 1-2)
- [ ] Design Supabase tables: users, exercises, workouts, workout_sets, muscle_states
- [ ] Implement Row Level Security policies
- [ ] Create database indexes for performance  
- [ ] **Quality Gate**: Schema verification against TypeScript interfaces

#### Task 2: Pydantic Data Models (Days 3-4)
- [ ] WorkoutSet, Exercise, MuscleEngagement, ProgressionTarget models
- [ ] Strict validation with `extra="forbid"` (CRM corruption prevention)
- [ ] Custom validators for fitness business logic
- [ ] **Quality Gate**: Validation prevents impossible data scenarios

#### Task 3: FastAPI Service Foundation (Days 5-7)
- [x] Workout endpoints with comprehensive validation and security fixes
- [x] SQL injection prevention through parameterized queries  
- [x] Schema alignment using only verified database columns
- [x] Database trigger reliance for consistent calculations
- [ ] Exercise endpoints implementation
- [ ] Dependency injection setup for database connections
- [ ] Settings management with Pydantic Settings
- [ ] Error handling with user-friendly messages
- [ ] **Quality Gate**: All database operations use dependency injection

#### Task 4: Authentication Integration (Days 8-10)
- [ ] Supabase Auth integration with FastAPI
- [ ] User session management and security
- [ ] API endpoint protection
- [ ] **Quality Gate**: Security testing with unauthorized access attempts

**Phase 1 Success Criteria**: Backend accepts and validates workout data according to business rules

---

## 📝 DAILY DEVELOPMENT LOG

### Session Template (Copy for each session)
```markdown
## Development Session - [DATE]

### Pre-Session Schema Verification Checkpoint (MANDATORY)
- [ ] **Database Schema Verified**: Checked actual column names and types before any database code
- [ ] **Schema Command Used**: [e.g., SELECT column_name, data_type FROM information_schema.columns WHERE table_name='workouts']
- [ ] **Column Names Documented**: [List exact column names that will be used]
- [ ] **Pydantic Models Updated**: Confirmed models match verified schema
- [ ] **No Assumptions Made**: Did not guess or assume any schema structure

### Session Goals
- [ ] [Specific task to complete]
- [ ] [Quality gate to achieve]
- [ ] [Documentation to update]

### Progress Made
- **Completed**: [What was finished]
- **In Progress**: [What's partially done]
- **Blocked**: [Any issues encountered]

### Key Decisions
- **Decision**: [What was decided]
- **Rationale**: [Why this approach was chosen]
- **Alternatives Considered**: [Other options evaluated]

### Database Interaction Validation (Required if touching database)
- [ ] **SQL Security**: All queries use parameterized statements ($1, $2, etc.)
- [ ] **Schema Alignment**: All INSERT/UPDATE use only verified column names
- [ ] **Trigger Awareness**: No manual calculations that duplicate database triggers
- [ ] **Error Handling**: Database errors preserve user data and context

### Technical Notes
- **New Files Created**: [List with purposes]
- **Dependencies Added**: [Packages/libraries installed]
- **Performance Insights**: [Any optimization opportunities discovered]
- **Schema Changes**: [Any database schema modifications made]

### Next Session Preparation
- **Priority Task**: [Most important thing to tackle next]
- **Context Needed**: [Information to review before starting]
- **Schema Verification Needed**: [Tables/columns that need verification next session]
- **Potential Blockers**: [Issues that might arise]
```

---

## 🎯 PORTFOLIO MILESTONES

### Week 2 Demo: "Backend Foundation"
- **Target**: Live API accepting workout data with validation
- **Demo Script**: Show database schema, Pydantic validation, API endpoints
- **Portfolio Value**: Full-stack architecture and data safety practices

### Week 4 Demo: "Core Functionality"  
- **Target**: Complete workout logging workflow with real-time sync
- **Demo Script**: Log workout from start to finish, show offline capability
- **Portfolio Value**: RESTful API design and real-time systems

### Week 6 Demo: "Professional UI/UX"
- **Target**: Fitbod-quality interface with responsive design
- **Demo Script**: Mobile workout logging flow under 5 minutes
- **Portfolio Value**: Frontend expertise and user experience design

### Week 8 Demo: "Advanced Intelligence"
- **Target**: Muscle fatigue analytics with visual heat map
- **Demo Script**: Show progressive overload recommendations, A/B variations
- **Portfolio Value**: Complex algorithms, data visualization, domain expertise

### Week 9 Demo: "Production System"
- **Target**: Live deployment with monitoring dashboard
- **Demo Script**: Multi-device sync, error recovery, performance metrics
- **Portfolio Value**: DevOps practices and production system management

---

## 🔧 TROUBLESHOOTING QUICK REFERENCE

### Common Issues & Solutions
- **Schema Mismatch**: Always check `painpoints.md` for schema-first approach
- **Validation Errors**: Ensure Pydantic models match exact database columns
- **Performance Issues**: Check database indexes and query optimization
- **Context Loss**: Use this journal's Essential Context section for session handoffs

### Emergency Procedures
- **Data Loss Prevention**: Export workout data before any error recovery
- **Rollback Strategy**: Use git commits at each quality gate completion
- **Debug Information**: Follow evidence-first logging patterns for troubleshooting

---

## 🎪 SESSION HISTORY

### Development Session - December 21, 2024

#### Session Goals
- [x] Create comprehensive database schema for 5 core tables
- [x] Implement Row Level Security and performance indexes
- [x] Generate TypeScript interfaces matching exact schema
- [x] Document architectural decisions and rationale

#### Progress Made
- **Completed**: Database schema implementation (Phase 1, Task 1)
  - Created `database-schema.sql` with 5 production-ready tables
  - Implemented comprehensive validation constraints (weight increments, rep ranges)
  - Added Row Level Security policies for user data isolation
  - Created performance indexes for expected query patterns
  - Added automatic triggers for calculated fields (workout metrics, user progression)
  
- **Completed**: TypeScript interface generation
  - Created `typescript-interfaces.ts` with exact schema matching
  - Added validation rules and type guards
  - Included composite interfaces for complex operations
  
- **Completed**: Documentation
  - Created `schema-design-decisions.md` with full architectural rationale
  - Documented security, performance, and scalability considerations

#### Key Decisions
- **Decision**: Use JSONB for muscle engagement data storage
- **Rationale**: Enables complex muscle percentage queries while maintaining flexibility
- **Alternatives Considered**: Separate muscle_engagement table
- **Result**: Better query performance for filtering exercises by muscle engagement

- **Decision**: Implement 0.25 lb weight increment validation at database level
- **Rationale**: Matches real gym equipment and prevents impossible data entry
- **Implementation**: `CHECK ((weight_lbs * 4) = FLOOR(weight_lbs * 4))`

- **Decision**: Progressive disclosure via calculated `feature_level` column
- **Rationale**: Automatically unlocks features based on user workout count
- **Levels**: 1 (0-2 workouts), 2 (3-9), 3 (10-19), 4 (20+)

#### Technical Notes
- **New Files Created**: 
  - `schemas/database-schema.sql` (500+ lines, production-ready)
  - `schemas/typescript-interfaces.ts` (comprehensive type definitions)
  - `docs/database/schema-design-decisions.md` (architectural documentation)
  
- **Schema Features**: 
  - 5 core tables (users, exercises, workouts, workout_sets, muscle_states)
  - Comprehensive validation constraints preventing impossible data
  - Automatic triggers for calculated fields
  - Row Level Security for user data isolation
  - Strategic indexing for performance optimization

- **Quality Gates Achieved**:
  - [x] Schema handles all 37 existing exercises from JSON data
  - [x] Workout logging workflow supported end-to-end
  - [x] RLS prevents unauthorized data access
  - [x] TypeScript interfaces match exact column names
  - [x] Performance indexes support expected query patterns

#### Next Session Preparation
- **Priority Task**: Begin Task 2 - Pydantic Data Models (Days 3-4)
- **Context Needed**: Review database schema for exact column names and constraints
- **Files to Focus**: Create `schemas/pydantic-models.py` matching database schema
- **Validation Requirements**: Ensure Pydantic models mirror database constraints exactly

#### Evidence-First Debugging Implementation
Added systematic logging patterns to schema:
```sql
-- Schema verification command embedded in file
SELECT column_name, data_type, is_nullable FROM information_schema.columns 
WHERE table_name = 'table_name' ORDER BY ordinal_position;
```

**Session Success**: Task 1 completed with comprehensive schema design that serves as single source of truth for all subsequent development phases.

---

### 📅 Development Session - December 21, 2024 (Session 2)
*Phase 1, Task 2: Pydantic Data Models Implementation*

#### Session Goals
- [x] Create comprehensive Pydantic models matching exact database schema
- [x] Implement all validation rules from database constraints
- [x] Add proper type annotations and field validators
- [x] Ensure schema-first development compliance

#### Progress Made
- **Completed**: Pydantic Data Models (Phase 1, Task 2)
  - Created `schemas/pydantic-models.py` with 5 core model groups
  - Implemented exact validation rules from database schema
  - Added comprehensive field validators for weight increments, rep ranges, percentages
  - Created enums for all constrained string fields (Sex, ExperienceLevel, Difficulty, etc.)
  - Added separate Create/Update/Read models for each entity
  
- **Validation Features Implemented**:
  - **Weight Validation**: 0.25 lb increments, max 500 lbs with custom validator
  - **Rep Validation**: 1-50 reps to prevent impossible data
  - **Percentage Validation**: 0-100% for muscle engagement and fatigue
  - **Muscle Engagement**: Custom validator ensuring at least one muscle > 0%
  - **Progressive Constraints**: Feature levels 1-4, workout counts ≥0

#### Key Decisions
- **Decision**: Use separate BaseModel classes for each entity
- **Rationale**: Enables proper inheritance and field validation without duplication
- **Implementation**: UserBase → UserCreate/UserUpdate/User pattern

- **Decision**: Implement custom field validators for complex business rules
- **Rationale**: Prevents invalid data at application boundary before database
- **Examples**: Weight increment validation, muscle engagement validation

- **Decision**: Use Pydantic v2 with ConfigDict for model configuration
- **Rationale**: Modern approach with better performance and type safety
- **Configuration**: `str_strip_whitespace=True, validate_assignment=True, use_enum_values=True`

#### Technical Notes
- **New Files Created**: 
  - `schemas/pydantic-models.py` (500+ lines, comprehensive validation)
  
- **Model Features**: 
  - 5 entity model groups (User, Exercise, Workout, WorkoutSet, MuscleState)
  - Comprehensive field validation matching database constraints
  - Proper enum definitions for all constrained fields
  - Decimal precision for financial-like calculations (weight, volume)
  - UUID type safety for all ID fields

- **Quality Gates Achieved**:
  - [x] All models match exact database schema column names
  - [x] Validation rules mirror database CHECK constraints
  - [x] Type annotations ensure runtime type safety
  - [x] Custom validators prevent business rule violations
  - [x] Comprehensive Create/Update/Read model coverage

#### Next Session Preparation
- **Priority Task**: Begin Task 3 - FastAPI Service Foundation (Days 5-7)
- **Context Needed**: Review Pydantic models for service layer integration
- **Files to Focus**: Create `backend/main.py` and core service modules
- **Requirements**: Implement dependency injection patterns and database connection

#### Evidence-First Debugging Implementation
Added validation utilities to models:
```python
def validate_exercise_data(exercise_data: dict) -> bool:
    """Validate exercise data against schema"""
    try:
        Exercise.model_validate(exercise_data)
        return True
    except Exception:
        return False
```

**Session Success**: Task 2 completed with comprehensive Pydantic models providing type-safe, validated data access layer that perfectly mirrors database schema constraints.

---

### 📅 Development Session - December 21, 2024 (Session 3)
*Phase 1, Task 3: FastAPI Service Foundation - CRITICAL FIXES APPLIED*

#### Pre-Session Schema Verification Checkpoint (MANDATORY)
- [x] **Database Schema Verified**: Reviewed `database-schema.sql` for exact column names
- [x] **Schema Command Used**: Column verification from existing schema file
- [x] **Column Names Documented**: workouts table uses id, user_id, workout_type, name, started_at, variation, notes, is_completed
- [x] **Pydantic Models Updated**: Models already match verified schema
- [x] **No Assumptions Made**: Used only verified column names in implementation

#### Session Goals  
- [x] Begin FastAPI Service Foundation implementation
- [x] Create workout endpoints with proper validation
- [x] Apply comprehensive architectural fixes for security and data integrity
- [x] Validate fixes through comprehensive testing

#### Progress Made
- **Completed**: FastAPI Service Foundation with Critical Fixes
  - Created `backend/app/api/workouts.py` with comprehensive workout endpoints
  - Implemented GET endpoints for listing and retrieving workouts
  - Implemented POST endpoints for creating and completing workouts
  - Applied critical architectural fixes for security, schema alignment, and data consistency
  
- **CRITICAL ISSUES IDENTIFIED AND FIXED**:
  1. **SQL Security Vulnerability**: Fixed f-string query building that allowed SQL injection
  2. **Schema Misalignment**: Removed references to non-existent database columns
  3. **Duplicate Volume Calculation**: Fixed manual calculations that conflicted with database triggers

#### Key Decisions
- **Decision**: Use parameterized queries with $1, $2 placeholders exclusively
- **Rationale**: Prevents SQL injection vulnerabilities and maintains data security
- **Implementation**: Dynamic query building with parameter arrays instead of f-strings

- **Decision**: Rely on database triggers for all volume calculations
- **Rationale**: Single source of truth, prevents data inconsistency
- **Implementation**: Extract calculated values from database response instead of manual calculation

- **Decision**: Use only verified database columns in all operations
- **Rationale**: Prevents runtime errors and maintains schema consistency
- **Implementation**: Removed target_area, is_ab_variation, difficulty from all queries

#### Database Interaction Validation (CRITICAL FIXES APPLIED)
- [x] **SQL Security**: All queries use parameterized statements ($1, $2, etc.) - FIXED
- [x] **Schema Alignment**: All INSERT/UPDATE use only verified column names - FIXED  
- [x] **Trigger Awareness**: No manual calculations that duplicate database triggers - FIXED
- [x] **Error Handling**: Database errors preserve user data and context - IMPLEMENTED

#### Technical Notes
- **Files Created/Modified**:
  - `backend/app/api/workouts.py` (500+ lines, comprehensive API implementation)
  - `backend/tests/test_workouts_api.py` (comprehensive test suite)
  - `backend/tests/test_framework_validation.py` (framework validation)
  - `backend/tests/test_workouts_logic.py` (logic pattern validation)
  - `backend/test_validation_report.md` (validation documentation)

- **Validation Results**: 12/12 tests passed confirming all fixes work correctly
- **Security Features**: SQL injection prevention, parameterized queries, input validation
- **Architecture Features**: Database trigger reliance, schema-first development, error resilience

#### Architecture Fixes Applied
```python
# BEFORE (Vulnerable): f-string query building
query = f"SELECT * FROM workouts WHERE user_id = '{user_id}'"

# AFTER (Secure): Parameterized queries  
query_conditions = ["1=1"]
params = []
if user_id:
    query_conditions.append("user_id = $" + str(len(params) + 1))
    params.append(user_id)
```

#### Quality Gates Achieved
- [x] SQL injection vulnerabilities eliminated
- [x] Database schema alignment verified  
- [x] Volume calculation consistency maintained
- [x] Comprehensive test coverage implemented
- [x] Error handling preserves user data
- [x] Evidence-first development methodology followed

#### Documentation Updates Applied
- Updated `FitForge-Development-Guide.md` with database interaction rules
- Updated `FitForge-Implementation-Journal.md` with mandatory schema verification
- Updated `CLAUDE.md` with schema-first development enforcement

#### Test Validation Summary
```bash
# Framework Validation: 6/6 tests passed
# Logic Pattern Validation: 6/6 tests passed  
# Total: 12/12 tests passed - All fixes validated
```

#### Next Session Preparation
- **Priority Task**: Complete remaining FastAPI Service Foundation components
- **Context Needed**: Build on validated workout endpoints implementation
- **Schema Verification Needed**: Review exercises, workout_sets tables for additional endpoints
- **Quality Focus**: Maintain security and consistency patterns established

#### Evidence-First Debugging Implementation
Applied systematic logging throughout workouts API:
```python
logger.info(f"🔥 get_workouts ENTRY - inputs: user_id={user_id}, limit={limit}")
logger.info(f"🔧 QUERY_BUILD RESULT: {query} with params: {params}")
```

**Session Success**: Task 3 initiated with critical architectural fixes applied and validated. FastAPI foundation established with production-ready security and data integrity patterns. All security vulnerabilities eliminated and comprehensive test validation confirms fixes work correctly.

---

### 📅 Development Session - June 21, 2025 (Session 4)
*Docker Development Environment Implementation - CRITICAL INFRASTRUCTURE*

#### Session Goals
- [x] Create complete Docker development environment with hot reload
- [x] Enable rapid iteration and fix verification workflow
- [x] Establish development stack compatible with Vercel deployment strategy
- [x] Provide seamless local development experience

#### Progress Made
- **Completed**: Docker Development Environment Infrastructure
  - Created `docker-compose.fast.yml` with multi-service orchestration
  - Implemented `Dockerfile` for Next.js frontend with hot reload
  - Implemented `backend/Dockerfile` for FastAPI with uvicorn auto-restart
  - Created `start-fitforge-docker.sh` one-command startup script
  - Added `.dockerignore` for optimized build performance
  - Added `docker-compose.override.yml` for local customizations

#### Key Architecture Decisions
- **Decision**: Development-focused Docker stack (not production mirroring)
- **Rationale**: Vercel handles frontend production, Docker optimized for local development
- **Implementation**: Hot reload for both frontend (:3000) and backend (:8000), local PostgreSQL (:5432)

- **Decision**: Volume mounts for live code synchronization
- **Rationale**: Enable instant reflection of code changes without container rebuilds
- **Implementation**: Frontend, backend, and database all use appropriate volume strategies

- **Decision**: Multi-stage Dockerfiles with development/production targets
- **Rationale**: Future-proofing for production builds while optimizing development experience
- **Implementation**: Development targets include dev dependencies and debugging tools

#### Docker Stack Configuration
- **Frontend**: Next.js with hot reload on port 3000
- **Backend**: FastAPI with uvicorn reload on port 8000  
- **Database**: PostgreSQL 15 with schema auto-initialization on port 5432
- **Network**: Isolated bridge network for service communication
- **Volumes**: Persistent database storage and live code sync

#### Development Workflow Enabled
```bash
# One-command startup
./start-fitforge-docker.sh

# Access points
Frontend: http://localhost:3000
Backend API: http://localhost:8000  
API Docs: http://localhost:8000/docs
Database: localhost:5432
```

#### Technical Features Implemented
- **Hot Reload**: CHOKIDAR_USEPOLLING for cross-platform file watching
- **Database Init**: Automatic schema loading from `schemas/database-schema.sql`
- **Health Checks**: Startup script validates all services are running
- **Volume Optimization**: Exclusion of node_modules and cache directories
- **Environment Variables**: Proper development configuration

#### Quality Gates Achieved
- [x] One-command startup for complete development stack
- [x] Hot reload enabled for both frontend and backend
- [x] Database automatically initialized with existing schema
- [x] All services accessible on predictable localhost ports
- [x] Volume mounts enable instant code change reflection
- [x] Compatible with Vercel production deployment strategy

#### Integration with Existing Work
- **Database Schema**: Automatically loads from `schemas/database-schema.sql`
- **FastAPI Backend**: Uses existing `backend/` implementation with hot reload
- **Package Scripts**: Updated to support Docker-first development approach
- **Project Structure**: Maintains compatibility with existing file organization

---

#### ✅ DOCKER ENVIRONMENT COMPLETION UPDATE (Dec 21, 2024)

**STATUS**: 🎉 **FULLY OPERATIONAL** - Docker development environment successfully deployed and tested

**Critical Issues Resolved**:
1. **Docker Build Context Fix**
   - Problem: Backend couldn't access schemas directory outside build context
   - Solution: Changed `context: ./backend` to `context: .` and updated Dockerfile paths
   - Result: Schemas properly copied and mounted in container

2. **Pydantic V2 Compatibility Fix**  
   - Problem: `decimal_places` constraints causing ValidationError in Pydantic v2
   - Solution: Removed invalid `decimal_places` parameters from all Decimal fields
   - Result: All Pydantic models loading successfully

3. **Import Structure Optimization**
   - Problem: Multiple files importing from hyphenated `pydantic-models.py` 
   - Solution: Created `backend/app/models/schemas.py` import helper using importlib
   - Result: Clean, consistent imports across all API modules

4. **Volume Mount Strategy** 
   - Problem: Schemas not accessible in running containers
   - Solution: Added `./schemas:/app/schemas` volume mount to docker-compose
   - Result: Live schema updates and proper model loading

**Final Architecture Status**:
- ✅ **Backend API**: http://localhost:8000 (FastAPI operational)
- ✅ **Database**: PostgreSQL with auto-schema initialization  
- ✅ **Hot Reload**: Live code changes for backend development
- ✅ **Schema Integration**: Pydantic models fully accessible
- ❌ **Frontend**: Port 3001 blocked by Windows/WSL (backend development can proceed)

**Development Workflow Ready**:
```bash
./start-fitforge-v2-dev.sh  # One command startup
curl http://localhost:8000/ # API responding with JSON
# Backend development can proceed immediately
```

**Key Lessons for Future Docker Implementations**:
- Always verify build context includes all required dependencies
- Test Pydantic constraints against current library versions  
- Use volume mounts for cross-container file sharing
- Create import helpers for complex module structures
- Design for Windows/WSL port permission limitations

#### Next Session Preparation
- **Priority Task**: Test Docker environment and verify hot reload functionality
- **Context Needed**: Validate all services start correctly and communicate properly
- **Testing Required**: Frontend-backend communication, database connectivity
- **Potential Issues**: Port conflicts, volume mount permissions, database initialization

#### Critical Infrastructure Success
This Docker environment solves the fundamental development workflow challenge:
- **Before**: No reliable way to test changes and verify fixes
- **After**: Complete local development stack with instant feedback loop
- **Impact**: Enables rapid iteration, proper testing, and confident development

**Session Success**: Critical development infrastructure completed. Docker environment provides seamless local development with hot reload, enabling proper testing of FastAPI implementation and rapid iteration on frontend components. All services orchestrated for optimal development experience.

---

---

**📌 Remember**: This Implementation Journal is the single source of truth for current development state. Update it continuously during active development to maintain context across sessions and ensure systematic progress toward portfolio-ready FitForge application.
```

---

## Database Schema & Models

### File: schemas/database-schema.sql

```sql
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
```

### File: schemas/pydantic-models.py

```python
"""
FitForge Pydantic Data Models
Created: December 21, 2024
Purpose: Python data validation models matching exact database schema

CRITICAL: These models MUST match the database schema exactly
Column names, types, and validation rules are verified against database-schema.sql
Any changes here must be reflected in the database schema and TypeScript interfaces

Schema verification: All validation rules mirror database CHECK constraints
"""

from datetime import datetime, date
from decimal import Decimal
from enum import Enum
from typing import Dict, List, Optional, Union
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, ConfigDict


# ============================================================================
# ENUMS AND CONSTANTS
# ============================================================================

class Sex(str, Enum):
    """User sex/gender options"""
    MALE = "M"
    FEMALE = "F"
    OTHER = "Other"


class ExperienceLevel(str, Enum):
    """User fitness experience levels"""
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"


class Difficulty(str, Enum):
    """Exercise difficulty levels"""
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"


class Variation(str, Enum):
    """Exercise variations for A/B periodization"""
    A = "A"
    B = "B"
    AB = "A/B"


class WorkoutType(str, Enum):
    """Workout type categorizations"""
    PUSH = "Push"
    PULL = "Pull"
    LEGS = "Legs"
    FULL_BODY = "Full Body"
    CUSTOM = "Custom"


# ============================================================================
# USER PROFILE MODELS
# ============================================================================

class UserBase(BaseModel):
    """Base user model with common fields"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    email: str = Field(..., min_length=1, max_length=255)
    display_name: Optional[str] = Field(None, max_length=255)
    
    # Personal metrics for volume calculations
    height_inches: Optional[int] = Field(None, ge=1, le=119)
    weight_lbs: Optional[Decimal] = Field(None, ge=Decimal('0.01'), le=Decimal('999.99'))
    age: Optional[int] = Field(None, ge=1, le=149)
    sex: Optional[Sex] = None
    
    # Fitness preferences
    experience_level: ExperienceLevel = ExperienceLevel.BEGINNER
    primary_goals: List[str] = Field(default_factory=lambda: ["General Fitness"])
    available_equipment: List[str] = Field(default_factory=list)
    
    # Progressive disclosure tracking
    workout_count: int = Field(default=0, ge=0)
    feature_level: int = Field(default=1, ge=1, le=4)


class UserCreate(UserBase):
    """User creation model"""
    id: UUID  # Must match auth.users.id


class UserUpdate(BaseModel):
    """User update model - all fields optional"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    display_name: Optional[str] = Field(None, max_length=255)
    height_inches: Optional[int] = Field(None, ge=1, le=119)
    weight_lbs: Optional[Decimal] = Field(None, ge=Decimal('0.01'), le=Decimal('999.99'))
    age: Optional[int] = Field(None, ge=1, le=149)
    sex: Optional[Sex] = None
    experience_level: Optional[ExperienceLevel] = None
    primary_goals: Optional[List[str]] = None
    available_equipment: Optional[List[str]] = None


class User(UserBase):
    """Complete user model with system fields"""
    id: UUID
    created_at: datetime
    updated_at: datetime
    last_active_at: datetime


# ============================================================================
# EXERCISE LIBRARY MODELS
# ============================================================================

class ExerciseBase(BaseModel):
    """Base exercise model"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    id: str = Field(..., min_length=1, max_length=100)  # e.g., 'single_arm_upright_row'
    name: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)  # Push, Pull, Legs, etc.
    equipment: str = Field(..., min_length=1, max_length=100)
    difficulty: Difficulty
    variation: Optional[Variation] = None
    
    # Instructions and guidance
    instructions: List[str] = Field(default_factory=list)
    setup_tips: List[str] = Field(default_factory=list)
    safety_notes: List[str] = Field(default_factory=list)
    
    # Muscle engagement data (percentages 0-100)
    muscle_engagement: Dict[str, int] = Field(..., min_length=1)
    primary_muscles: List[str] = Field(..., min_length=1)
    secondary_muscles: List[str] = Field(default_factory=list)
    
    # Exercise metadata
    is_compound: bool = True
    is_unilateral: bool = False
    movement_pattern: Optional[str] = Field(None, max_length=50)  # 'Push', 'Pull', 'Squat', etc.
    
    @field_validator('muscle_engagement')
    @classmethod
    def validate_muscle_engagement(cls, v: Dict[str, int]) -> Dict[str, int]:
        """Validate muscle engagement percentages"""
        if not v:
            raise ValueError("muscle_engagement cannot be empty")
        
        for muscle, percentage in v.items():
            if not isinstance(percentage, int) or percentage < 0 or percentage > 100:
                raise ValueError(f"muscle_engagement[{muscle}] must be integer 0-100, got {percentage}")
        
        # Ensure at least one muscle has engagement > 0
        if not any(percentage > 0 for percentage in v.values()):
            raise ValueError("At least one muscle must have engagement > 0")
        
        return v


class ExerciseCreate(ExerciseBase):
    """Exercise creation model"""
    pass


class ExerciseUpdate(BaseModel):
    """Exercise update model - all fields optional except muscle_engagement validation"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    equipment: Optional[str] = Field(None, min_length=1, max_length=100)
    difficulty: Optional[Difficulty] = None
    variation: Optional[Variation] = None
    instructions: Optional[List[str]] = None
    setup_tips: Optional[List[str]] = None
    safety_notes: Optional[List[str]] = None
    muscle_engagement: Optional[Dict[str, int]] = None
    primary_muscles: Optional[List[str]] = None
    secondary_muscles: Optional[List[str]] = None
    is_compound: Optional[bool] = None
    is_unilateral: Optional[bool] = None
    movement_pattern: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None
    
    @field_validator('muscle_engagement')
    @classmethod
    def validate_muscle_engagement(cls, v: Optional[Dict[str, int]]) -> Optional[Dict[str, int]]:
        """Validate muscle engagement percentages if provided"""
        if v is None:
            return v
        
        if not v:
            raise ValueError("muscle_engagement cannot be empty if provided")
        
        for muscle, percentage in v.items():
            if not isinstance(percentage, int) or percentage < 0 or percentage > 100:
                raise ValueError(f"muscle_engagement[{muscle}] must be integer 0-100, got {percentage}")
        
        # Ensure at least one muscle has engagement > 0
        if not any(percentage > 0 for percentage in v.values()):
            raise ValueError("At least one muscle must have engagement > 0")
        
        return v


class Exercise(ExerciseBase):
    """Complete exercise model with system fields"""
    created_at: datetime
    updated_at: datetime
    is_active: bool = True


# ============================================================================
# WORKOUT SESSION MODELS
# ============================================================================

class WorkoutBase(BaseModel):
    """Base workout model"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    name: Optional[str] = Field(None, max_length=255)
    workout_type: Optional[WorkoutType] = None
    variation: Optional[Variation] = None
    
    # Session timing
    started_at: datetime = Field(default_factory=datetime.now)
    ended_at: Optional[datetime] = None
    
    # Session notes and feedback
    notes: Optional[str] = None
    energy_level: Optional[int] = Field(None, ge=1, le=5)
    perceived_exertion: Optional[int] = Field(None, ge=1, le=10)
    
    # Progressive overload tracking
    previous_workout_id: Optional[UUID] = None


class WorkoutCreate(WorkoutBase):
    """Workout creation model"""
    user_id: UUID


class WorkoutUpdate(BaseModel):
    """Workout update model"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    name: Optional[str] = Field(None, max_length=255)
    workout_type: Optional[WorkoutType] = None
    variation: Optional[Variation] = None
    ended_at: Optional[datetime] = None
    notes: Optional[str] = None
    energy_level: Optional[int] = Field(None, ge=1, le=5)
    perceived_exertion: Optional[int] = Field(None, ge=1, le=10)
    is_completed: Optional[bool] = None


class Workout(WorkoutBase):
    """Complete workout model with calculated fields"""
    id: UUID
    user_id: UUID
    
    # Calculated session metrics
    duration_seconds: Optional[int] = None
    total_volume_lbs: Decimal = Field(default=Decimal('0.00'))
    total_sets: int = 0
    total_reps: int = 0
    exercises_count: int = 0
    
    # Progressive overload tracking
    volume_increase_percentage: Optional[Decimal] = Field(None)
    
    # System fields
    created_at: datetime
    updated_at: datetime
    is_completed: bool = False


# ============================================================================
# WORKOUT SET MODELS
# ============================================================================

class WorkoutSetBase(BaseModel):
    """Base workout set model with strict validation"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    set_number: int = Field(..., ge=1, le=20)
    reps: int = Field(..., ge=1, le=50)  # Prevents impossible rep counts
    weight_lbs: Decimal = Field(..., ge=Decimal('0.00'), le=Decimal('500.00'))
    
    # Performance metrics
    time_under_tension_seconds: Optional[int] = Field(None, gt=0)
    rest_seconds: Optional[int] = Field(None, ge=0, le=600)  # Max 10 min rest
    perceived_exertion: Optional[int] = Field(None, ge=1, le=10)
    
    # Progressive tracking
    estimated_one_rep_max: Optional[Decimal] = Field(None)
    is_personal_best: bool = False
    improvement_vs_last: Optional[Decimal] = Field(None)
    
    @field_validator('weight_lbs')
    @classmethod
    def validate_weight_increment(cls, v: Decimal) -> Decimal:
        """Ensure weight is in 0.25 lb increments"""
        # Check if weight * 4 is a whole number (0.25 lb increments)
        if (v * 4) != int(v * 4):
            raise ValueError(f"Weight must be in 0.25 lb increments, got {v}")
        return v


class WorkoutSetCreate(WorkoutSetBase):
    """Workout set creation model"""
    workout_id: UUID
    exercise_id: str
    user_id: UUID


class WorkoutSetUpdate(BaseModel):
    """Workout set update model"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    reps: Optional[int] = Field(None, ge=1, le=50)
    weight_lbs: Optional[Decimal] = Field(None, ge=Decimal('0.00'), le=Decimal('500.00'))
    time_under_tension_seconds: Optional[int] = Field(None, gt=0)
    rest_seconds: Optional[int] = Field(None, ge=0, le=600)
    perceived_exertion: Optional[int] = Field(None, ge=1, le=10)
    estimated_one_rep_max: Optional[Decimal] = Field(None)
    is_personal_best: Optional[bool] = None
    improvement_vs_last: Optional[Decimal] = Field(None)
    
    @field_validator('weight_lbs')
    @classmethod
    def validate_weight_increment(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        """Ensure weight is in 0.25 lb increments if provided"""
        if v is None:
            return v
        # Check if weight * 4 is a whole number (0.25 lb increments)
        if (v * 4) != int(v * 4):
            raise ValueError(f"Weight must be in 0.25 lb increments, got {v}")
        return v


class WorkoutSet(WorkoutSetBase):
    """Complete workout set model with calculated fields"""
    id: UUID
    workout_id: UUID
    exercise_id: str
    user_id: UUID
    
    # Calculated metrics
    volume_lbs: Decimal = Field(...)  # Generated: weight_lbs * reps
    
    # System fields
    created_at: datetime
    updated_at: datetime


# ============================================================================
# MUSCLE STATE MODELS
# ============================================================================

class MuscleStateBase(BaseModel):
    """Base muscle state model"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    muscle_name: str = Field(..., min_length=1, max_length=100)  # e.g., 'Biceps_Brachii'
    muscle_group: str = Field(..., min_length=1, max_length=50)  # 'Push', 'Pull', 'Legs'
    
    # Fatigue calculation (0-100 scale)
    fatigue_percentage: Decimal = Field(..., ge=Decimal('0.00'), le=Decimal('100.00'))
    recovery_percentage: Decimal = Field(..., ge=Decimal('0.00'), le=Decimal('100.00'))
    
    # Volume tracking (7-day rolling window)
    weekly_volume_lbs: Decimal = Field(default=Decimal('0.00'))
    weekly_sets: int = Field(default=0, ge=0)
    weekly_frequency: int = Field(default=0, ge=0)  # How many days this week
    
    # Recovery modeling (5-day recovery curve)
    last_trained_date: Optional[date] = None
    expected_recovery_date: Optional[date] = None
    
    # Progressive overload recommendations
    target_volume_increase_percentage: Decimal = Field(default=Decimal('3.00'))
    recommended_next_weight: Optional[Decimal] = Field(None)
    recommended_next_reps: Optional[int] = Field(None, ge=1, le=50)
    
    # Associated workout
    last_workout_id: Optional[UUID] = None


class MuscleStateCreate(MuscleStateBase):
    """Muscle state creation model"""
    user_id: UUID


class MuscleStateUpdate(BaseModel):
    """Muscle state update model"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True
    )
    
    fatigue_percentage: Optional[Decimal] = Field(None, ge=Decimal('0.00'), le=Decimal('100.00'))
    recovery_percentage: Optional[Decimal] = Field(None, ge=Decimal('0.00'), le=Decimal('100.00'))
    weekly_volume_lbs: Optional[Decimal] = Field(None)
    weekly_sets: Optional[int] = Field(None, ge=0)
    weekly_frequency: Optional[int] = Field(None, ge=0)
    last_trained_date: Optional[date] = None
    expected_recovery_date: Optional[date] = None
    target_volume_increase_percentage: Optional[Decimal] = Field(None)
    recommended_next_weight: Optional[Decimal] = Field(None)
    recommended_next_reps: Optional[int] = Field(None, ge=1, le=50)
    last_workout_id: Optional[UUID] = None


class MuscleState(MuscleStateBase):
    """Complete muscle state model with calculated fields"""
    id: UUID
    user_id: UUID
    
    # Calculated field
    days_since_trained: Optional[int] = None  # Generated: CURRENT_DATE - last_trained_date
    
    # Calculation metadata
    calculation_timestamp: datetime = Field(default_factory=datetime.now)
    
    # System fields
    created_at: datetime
    updated_at: datetime


# ============================================================================
# VALIDATION UTILITIES
# ============================================================================

def validate_exercise_data(exercise_data: dict) -> bool:
    """Validate exercise data against schema"""
    try:
        Exercise.model_validate(exercise_data)
        return True
    except Exception:
        return False


def validate_workout_set_data(set_data: dict) -> bool:
    """Validate workout set data against schema"""
    try:
        WorkoutSet.model_validate(set_data)
        return True
    except Exception:
        return False


# ============================================================================
# EXPORT LIST
# ============================================================================

__all__ = [
    # Enums
    'Sex', 'ExperienceLevel', 'Difficulty', 'Variation', 'WorkoutType',
    
    # User models
    'UserBase', 'UserCreate', 'UserUpdate', 'User',
    
    # Exercise models
    'ExerciseBase', 'ExerciseCreate', 'ExerciseUpdate', 'Exercise',
    
    # Workout models
    'WorkoutBase', 'WorkoutCreate', 'WorkoutUpdate', 'Workout',
    
    # Workout set models
    'WorkoutSetBase', 'WorkoutSetCreate', 'WorkoutSetUpdate', 'WorkoutSet',
    
    # Muscle state models
    'MuscleStateBase', 'MuscleStateCreate', 'MuscleStateUpdate', 'MuscleState',
    
    # Utilities
    'validate_exercise_data', 'validate_workout_set_data'
]
```

### File: schemas/typescript-interfaces.ts

```typescript
/**
 * FitForge TypeScript Database Interfaces
 * Generated from: database-schema.sql
 * 
 * CRITICAL: These interfaces MUST match the exact database schema
 * Column names and types are verified against actual database structure
 * 
 * Schema verification command:
 * SELECT column_name, data_type, is_nullable FROM information_schema.columns 
 * WHERE table_name = 'table_name' ORDER BY ordinal_position;
 */

// ============================================================================
// USER PROFILE INTERFACES
// ============================================================================

export interface User {
  id: string; // UUID from auth.users
  email: string;
  display_name?: string;
  
  // Personal metrics for volume calculations
  height_inches?: number; // 1-119
  weight_lbs?: number; // Decimal(5,2), 1-999.99
  age?: number; // 1-149
  sex?: 'M' | 'F' | 'Other';
  
  // Fitness preferences
  experience_level: 'Beginner' | 'Intermediate' | 'Advanced';
  primary_goals: string[]; // Default: ['General Fitness']
  available_equipment: string[]; // Default: []
  
  // Progressive disclosure tracking
  workout_count: number; // Default: 0
  feature_level: 1 | 2 | 3 | 4; // Progressive feature unlock
  
  // Metadata
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  last_active_at: string; // ISO timestamp
}

export interface UserInsert {
  id: string; // Must match auth.users.id
  email: string;
  display_name?: string;
  height_inches?: number;
  weight_lbs?: number;
  age?: number;
  sex?: 'M' | 'F' | 'Other';
  experience_level?: 'Beginner' | 'Intermediate' | 'Advanced';
  primary_goals?: string[];
  available_equipment?: string[];
}

export interface UserUpdate {
  display_name?: string;
  height_inches?: number;
  weight_lbs?: number;
  age?: number;
  sex?: 'M' | 'F' | 'Other';
  experience_level?: 'Beginner' | 'Intermediate' | 'Advanced';
  primary_goals?: string[];
  available_equipment?: string[];
}

// ============================================================================
// EXERCISE LIBRARY INTERFACES
// ============================================================================

export interface MuscleEngagement {
  [muscleName: string]: number; // 0-100 percentage
}

export interface Exercise {
  id: string; // Primary key, e.g., 'single_arm_upright_row'
  name: string;
  category: string; // 'Push', 'Pull', 'Legs', etc.
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  variation?: 'A' | 'B' | 'A/B';
  
  // Instructions and guidance
  instructions?: string[];
  setup_tips?: string[];
  safety_notes?: string[];
  
  // Muscle engagement data (scientific percentages)
  muscle_engagement: MuscleEngagement; // JSONB: {"Biceps_Brachii": 80}
  primary_muscles: string[];
  secondary_muscles: string[];
  
  // Exercise metadata
  is_compound: boolean; // Default: true
  is_unilateral: boolean; // Default: false
  movement_pattern?: string; // 'Push', 'Pull', 'Squat', 'Hinge'
  
  // System fields
  created_at: string;
  updated_at: string;
  is_active: boolean; // Default: true
}

export interface ExerciseInsert {
  id: string;
  name: string;
  category: string;
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  variation?: 'A' | 'B' | 'A/B';
  instructions?: string[];
  setup_tips?: string[];
  safety_notes?: string[];
  muscle_engagement: MuscleEngagement;
  primary_muscles: string[];
  secondary_muscles?: string[];
  is_compound?: boolean;
  is_unilateral?: boolean;
  movement_pattern?: string;
  is_active?: boolean;
}

// ============================================================================
// WORKOUT SESSION INTERFACES
// ============================================================================

export interface Workout {
  id: string; // UUID
  user_id: string; // UUID reference to users
  
  // Session identification
  name?: string;
  workout_type?: string; // 'Push', 'Pull', 'Legs', 'Full Body', 'Custom'
  variation?: 'A' | 'B'; // For A/B periodization
  
  // Session timing
  started_at: string; // ISO timestamp
  ended_at?: string; // ISO timestamp
  duration_seconds?: number; // Generated column
  
  // Session metrics (calculated automatically)
  total_volume_lbs: number; // Decimal(10,2)
  total_sets: number;
  total_reps: number;
  exercises_count: number;
  
  // Session notes and feedback
  notes?: string;
  energy_level?: number; // 1-5
  perceived_exertion?: number; // 1-10
  
  // Progressive overload tracking
  previous_workout_id?: string; // UUID reference
  volume_increase_percentage?: number; // Decimal(5,2)
  
  // System fields
  created_at: string;
  updated_at: string;
  is_completed: boolean; // Default: false
}

export interface WorkoutInsert {
  user_id: string;
  name?: string;
  workout_type?: string;
  variation?: 'A' | 'B';
  started_at?: string; // Default: NOW()
  notes?: string;
  energy_level?: number;
  perceived_exertion?: number;
  previous_workout_id?: string;
}

export interface WorkoutUpdate {
  name?: string;
  ended_at?: string;
  notes?: string;
  energy_level?: number;
  perceived_exertion?: number;
  is_completed?: boolean;
}

// ============================================================================
// WORKOUT SET INTERFACES
// ============================================================================

export interface WorkoutSet {
  id: string; // UUID
  workout_id: string; // UUID reference to workouts
  exercise_id: string; // Text reference to exercises
  user_id: string; // UUID reference to users
  
  // Set data with strict validation
  set_number: number; // 1-20
  reps: number; // 1-50 (prevents impossible rep counts)
  weight_lbs: number; // Decimal(6,2), 0-500, 0.25 increments
  
  // Performance metrics
  time_under_tension_seconds?: number;
  rest_seconds?: number; // 0-600 (max 10 minutes)
  perceived_exertion?: number; // 1-10
  
  // Calculated metrics (generated columns)
  volume_lbs: number; // weight_lbs * reps
  estimated_one_rep_max?: number; // Decimal(6,2)
  
  // Progressive tracking
  is_personal_best: boolean; // Default: false
  improvement_vs_last?: number; // Decimal(5,2) percentage
  
  // System fields
  created_at: string;
  updated_at: string;
}

export interface WorkoutSetInsert {
  workout_id: string;
  exercise_id: string;
  user_id: string;
  set_number: number;
  reps: number;
  weight_lbs: number;
  time_under_tension_seconds?: number;
  rest_seconds?: number;
  perceived_exertion?: number;
}

export interface WorkoutSetUpdate {
  reps?: number;
  weight_lbs?: number;
  time_under_tension_seconds?: number;
  rest_seconds?: number;
  perceived_exertion?: number;
  is_personal_best?: boolean;
  improvement_vs_last?: number;
}

// ============================================================================
// MUSCLE STATE INTERFACES
// ============================================================================

export interface MuscleState {
  id: string; // UUID
  user_id: string; // UUID reference to users
  
  // Muscle identification
  muscle_name: string; // e.g., 'Biceps_Brachii', 'Pectoralis_Major'
  muscle_group: string; // 'Push', 'Pull', 'Legs'
  
  // Fatigue calculation (0-100 scale)
  fatigue_percentage: number; // Decimal(5,2), 0-100
  recovery_percentage: number; // Decimal(5,2), 0-100
  
  // Volume tracking (7-day rolling window)
  weekly_volume_lbs: number; // Decimal(10,2)
  weekly_sets: number;
  weekly_frequency: number; // Days per week
  
  // Recovery modeling (5-day recovery curve)
  last_trained_date?: string; // Date string (YYYY-MM-DD)
  days_since_trained?: number; // Generated column
  expected_recovery_date?: string; // Date string
  
  // Progressive overload recommendations
  target_volume_increase_percentage: number; // Default: 3.0
  recommended_next_weight?: number; // Decimal(6,2)
  recommended_next_reps?: number;
  
  // Calculation metadata
  calculation_timestamp: string; // ISO timestamp
  last_workout_id?: string; // UUID reference
  
  // System fields
  created_at: string;
  updated_at: string;
}

export interface MuscleStateInsert {
  user_id: string;
  muscle_name: string;
  muscle_group: string;
  fatigue_percentage: number;
  recovery_percentage: number;
  weekly_volume_lbs?: number;
  weekly_sets?: number;
  weekly_frequency?: number;
  last_trained_date?: string;
  expected_recovery_date?: string;
  target_volume_increase_percentage?: number;
  recommended_next_weight?: number;
  recommended_next_reps?: number;
  last_workout_id?: string;
}

// ============================================================================
// COMPOSITE INTERFACES FOR COMPLEX OPERATIONS
// ============================================================================

export interface WorkoutWithSets extends Workout {
  sets: WorkoutSet[];
}

export interface ExerciseWithLastPerformance extends Exercise {
  last_workout_set?: WorkoutSet;
  personal_best?: WorkoutSet;
  recent_volume?: number;
}

export interface UserWithMuscleStates extends User {
  muscle_states: MuscleState[];
  fatigue_summary: {
    overall_fatigue: number;
    most_fatigued_muscle: string;
    recovery_ready_muscles: string[];
  };
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

export interface WorkoutSessionResponse {
  workout: Workout;
  sets: WorkoutSet[];
  muscle_impact: {
    [muscleName: string]: {
      volume_added: number;
      fatigue_increase: number;
    };
  };
}

export interface ExerciseRecommendations {
  recommended_exercises: Exercise[];
  rationale: string;
  target_muscles: string[];
  avoid_muscles: string[];
}

export interface ProgressionRecommendation {
  exercise_id: string;
  current_best: WorkoutSet;
  recommended_progression: {
    weight_lbs: number;
    reps: number;
    rationale: string;
    confidence_level: number; // 0-100
  };
}

// ============================================================================
// VALIDATION SCHEMAS FOR RUNTIME TYPE CHECKING
// ============================================================================

export const VALIDATION_RULES = {
  workout_set: {
    reps: { min: 1, max: 50 },
    weight_lbs: { min: 0, max: 500, increment: 0.25 },
    set_number: { min: 1, max: 20 },
    rest_seconds: { min: 0, max: 600 },
    perceived_exertion: { min: 1, max: 10 }
  },
  user: {
    height_inches: { min: 1, max: 119 },
    weight_lbs: { min: 1, max: 999.99 },
    age: { min: 1, max: 149 }
  },
  muscle_state: {
    fatigue_percentage: { min: 0, max: 100 },
    recovery_percentage: { min: 0, max: 100 },
    target_volume_increase_percentage: { min: 0, max: 50 }
  }
} as const;

// ============================================================================
// DATABASE TABLE NAMES (for Supabase client)
// ============================================================================

export const TABLE_NAMES = {
  USERS: 'users',
  EXERCISES: 'exercises',
  WORKOUTS: 'workouts',
  WORKOUT_SETS: 'workout_sets',
  MUSCLE_STATES: 'muscle_states'
} as const;

// ============================================================================
// TYPE GUARDS FOR RUNTIME VALIDATION
// ============================================================================

export function isValidWorkoutSet(data: any): data is WorkoutSetInsert {
  return (
    typeof data === 'object' &&
    typeof data.workout_id === 'string' &&
    typeof data.exercise_id === 'string' &&
    typeof data.user_id === 'string' &&
    typeof data.set_number === 'number' &&
    data.set_number >= 1 && data.set_number <= 20 &&
    typeof data.reps === 'number' &&
    data.reps >= 1 && data.reps <= 50 &&
    typeof data.weight_lbs === 'number' &&
    data.weight_lbs >= 0 && data.weight_lbs <= 500 &&
    (data.weight_lbs * 4) === Math.floor(data.weight_lbs * 4) // 0.25 increment check
  );
}

export function isValidMuscleEngagement(data: any): data is MuscleEngagement {
  return (
    typeof data === 'object' &&
    Object.values(data).every(value => 
      typeof value === 'number' && value >= 0 && value <= 100
    ) &&
    Object.values(data).some(value => value > 0) // At least one muscle engaged
  );
}

/**
 * SCHEMA VERIFICATION NOTES:
 * 
 * 1. All interfaces match exact database column names and types
 * 2. Validation rules enforce business logic constraints
 * 3. Generated columns (duration_seconds, volume_lbs, days_since_trained) are read-only
 * 4. UUID fields use string type for TypeScript compatibility
 * 5. Decimal fields use number type with documented precision
 * 6. Array fields use TypeScript array syntax
 * 7. JSONB fields use appropriate interface types
 * 
 * BEFORE CREATING PYDANTIC MODELS:
 * Verify these interfaces match database schema exactly using:
 * SELECT column_name, data_type, is_nullable FROM information_schema.columns 
 * WHERE table_name = 'table_name' ORDER BY ordinal_position;
 */
```

### File: schemas/database-schema-local.sql

```sql
-- FitForge Database Schema - Local PostgreSQL Version
-- Created: December 22, 2024
-- Purpose: Local development schema for fitness tracking with muscle fatigue analytics
-- Adapted from production schema to work without Supabase auth
-- 
-- SCHEMA-FIRST DEVELOPMENT: This schema serves as the single source of truth
-- All Pydantic models and TypeScript interfaces MUST match these exact column names and types

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- Standalone users table for local development
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    
    -- Authentication fields for local dev
    password_hash TEXT, -- For local development only
    
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
```

---

## Backend Implementation

### File: backend/main.py

```python
"""
FitForge FastAPI Backend Application
Production-ready FastAPI server with CORS, middleware, and error handling

Run with: uvicorn main:app --reload
"""

import os
import sys
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

# Add the schemas directory to the Python path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "schemas"))

from app.core.config import get_settings
from app.core.logging import setup_logging
from app.middleware.request_logging import RequestLoggingMiddleware
from app.middleware.error_handling import ErrorHandlingMiddleware
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.exercises import router as exercises_router
from app.api.workouts import router as workouts_router
from app.api.workout_sets import router as workout_sets_router
from app.api.analytics import router as analytics_router


# Initialize settings
settings = get_settings()

# Set up logging
setup_logging(settings.LOG_LEVEL)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan management
    Handles startup and shutdown events
    """
    # Startup
    logger.info("🚀 FitForge Backend starting up...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info(f"Database URL: {settings.DATABASE_URL[:50]}...")  # Truncate for security
    
    # Initialize database connections
    from app.core.database import db_manager
    await db_manager.initialize()
    logger.info("✅ Database connections initialized")
    
    yield
    
    # Shutdown
    logger.info("🛑 FitForge Backend shutting down...")
    # Clean up database connections
    await db_manager.close()
    logger.info("🔌 Database connections closed")


# Create FastAPI application
app = FastAPI(
    title="FitForge API",
    description="Advanced fitness tracking backend with muscle fatigue analytics and progressive overload targeting",
    version="0.1.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan
)

# Trust host middleware (security)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Custom middleware
app.add_middleware(ErrorHandlingMiddleware)
app.add_middleware(RequestLoggingMiddleware)


# Exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions with consistent JSON response"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "type": "http_error",
                "message": exc.detail,
                "status_code": exc.status_code
            }
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors with detailed field information"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "type": "validation_error",
                "message": "Request validation failed",
                "details": exc.errors()
            }
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions with logging"""
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    
    if settings.DEBUG:
        import traceback
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "type": "internal_error",
                    "message": str(exc),
                    "traceback": traceback.format_exc()
                }
            }
        )
    else:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "type": "internal_error",
                    "message": "An unexpected error occurred"
                }
            }
        )


# Root endpoint
@app.get("/", response_model=Dict[str, Any])
async def root():
    """Root endpoint with API information"""
    return {
        "name": "FitForge API",
        "version": "0.1.0",
        "status": "running",
        "environment": settings.ENVIRONMENT,
        "docs_url": "/docs" if settings.DEBUG else None,
        "features": {
            "muscle_fatigue_analytics": True,
            "progressive_overload_targeting": True,
            "exercise_library": True,
            "workout_tracking": True,
            "real_time_muscle_visualization": True
        }
    }


# Include routers
app.include_router(health_router, prefix="/api/health", tags=["health"])
app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(exercises_router, prefix="/api/exercises", tags=["exercises"])
app.include_router(workouts_router, prefix="/api/workouts", tags=["workouts"])
app.include_router(workout_sets_router, prefix="/api/workout-sets", tags=["workout-sets"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["analytics"])


if __name__ == "__main__":
    import uvicorn
    
    # Run with uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=settings.DEBUG
    )
```

### File: backend/app/models/schemas.py

```python
"""
Schema Import Helper
Loads Pydantic models from the schemas directory
"""

import importlib.util
import sys
import os

# Load pydantic models from schemas directory
_schemas_path = "/app/schemas/pydantic-models.py"

if os.path.exists(_schemas_path):
    spec = importlib.util.spec_from_file_location("pydantic_models", _schemas_path)
    pydantic_models = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(pydantic_models)
    
    # Export all model classes and enums
    User = pydantic_models.User
    UserCreate = pydantic_models.UserCreate
    UserUpdate = pydantic_models.UserUpdate
    
    Exercise = pydantic_models.Exercise
    ExerciseCreate = pydantic_models.ExerciseCreate
    ExerciseUpdate = pydantic_models.ExerciseUpdate
    
    Workout = pydantic_models.Workout
    WorkoutCreate = pydantic_models.WorkoutCreate
    WorkoutUpdate = pydantic_models.WorkoutUpdate
    
    WorkoutSet = pydantic_models.WorkoutSet
    WorkoutSetCreate = pydantic_models.WorkoutSetCreate
    WorkoutSetUpdate = pydantic_models.WorkoutSetUpdate
    
    MuscleState = pydantic_models.MuscleState
    MuscleStateCreate = pydantic_models.MuscleStateCreate
    MuscleStateUpdate = pydantic_models.MuscleStateUpdate
    
    # Export enums
    Difficulty = pydantic_models.Difficulty
    Variation = pydantic_models.Variation
    WorkoutType = pydantic_models.WorkoutType
    
else:
    raise ImportError(f"Could not find pydantic models at {_schemas_path}")
```

### File: backend/app/api/workout_sets.py

```python
"""
Workout Sets API Router
Individual set tracking for workout sessions with Enhanced WorkoutLogger V2 compatibility
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
from uuid import UUID, uuid4
from decimal import Decimal

from app.models.schemas import WorkoutSet, WorkoutSetCreate, WorkoutSetUpdate
from ..core.database import get_database, DatabaseManager

router = APIRouter()
logger = logging.getLogger(__name__)


class WorkoutSetV2Request:
    """Enhanced WorkoutLogger V2 compatible request model"""
    def __init__(self, sessionId: str, exerciseId: str, weight: float, reps: int):
        self.sessionId = sessionId
        self.exerciseId = exerciseId  
        self.weight = weight
        self.reps = reps


@router.post("/", response_model=Dict[str, Any])
async def create_workout_set(
    request: Dict[str, Any],
    db: DatabaseManager = Depends(get_database)
):
    """
    Create a new workout set
    Compatible with Enhanced WorkoutLogger V2 format
    """
    logger.info("🔥 create_workout_set ENTRY", extra={"request": request})
    
    try:
        # Extract data from Enhanced WorkoutLogger V2 format
        session_id = request.get("sessionId")
        exercise_id = request.get("exerciseId") 
        weight = request.get("weight")
        reps = request.get("reps")
        
        # Validate required fields
        if not all([session_id, exercise_id, weight is not None, reps]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing required fields: sessionId, exerciseId, weight, reps"
            )
        
        # Validate data types and ranges
        try:
            session_uuid = UUID(session_id)
            weight_decimal = Decimal(str(weight))
            reps_int = int(reps)
        except (ValueError, TypeError) as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid data format: {str(e)}"
            )
            
        # Validate business rules
        if not (0 <= weight_decimal <= 500):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Weight must be between 0 and 500 lbs"
            )
            
        if not (1 <= reps_int <= 50):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reps must be between 1 and 50"
            )
        
        # Find or create workout for this session
        workout_id = await get_or_create_workout_for_session(db, session_uuid)
        
        # Get user_id (for now, using a default - would come from auth in production)
        # TODO: Replace with actual user from authentication
        user_id = UUID("00000000-0000-0000-0000-000000000001")  # Placeholder
        
        # Get next set number for this exercise in the workout
        set_number = await get_next_set_number(db, workout_id, exercise_id)
        
        # Create workout set record
        query = """
            INSERT INTO workout_sets (
                id, workout_id, exercise_id, user_id, set_number, 
                reps, weight_lbs, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9
            )
            RETURNING id, workout_id, exercise_id, user_id, set_number, 
                     reps, weight_lbs, volume_lbs, created_at, updated_at
        """
        
        set_id = uuid4()
        now = datetime.utcnow()
        
        params = [
            set_id,
            workout_id, 
            exercise_id,
            user_id,
            set_number,
            reps_int,
            weight_decimal,
            now,
            now
        ]
        
        logger.info("🔧 WORKOUT_SET_INSERT", extra={"query": query, "params": params})
        
        result = await db.execute_query(query, params)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create workout set"
            )
            
        # Return Enhanced WorkoutLogger V2 compatible response
        set_data = result[0]
        response = {
            "id": str(set_data["id"]),
            "sessionId": session_id,
            "exerciseId": exercise_id,
            "weight": float(set_data["weight_lbs"]),
            "reps": set_data["reps"],
            "volume": float(set_data["volume_lbs"]),
            "setNumber": set_data["set_number"],
            "createdAt": set_data["created_at"].isoformat()
        }
        
        logger.info("🔧 WORKOUT_SET_CREATED", extra={"response": response})
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("❌ create_workout_set ERROR", extra={"error": str(e)})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error creating workout set"
        )


@router.get("/session/{session_id}", response_model=List[Dict[str, Any]])
async def get_workout_sets_for_session(
    session_id: str,
    db: DatabaseManager = Depends(get_database)
):
    """
    Get all workout sets for a given session
    Compatible with Enhanced WorkoutLogger V2 format
    """
    logger.info("🔥 get_workout_sets_for_session ENTRY", extra={"session_id": session_id})
    
    try:
        # Validate session UUID
        try:
            session_uuid = UUID(session_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid session ID format"
            )
        
        # Find workout for this session
        workout_query = "SELECT id FROM workouts WHERE id = $1"
        workout_result = await db.execute_query(workout_query, [session_uuid])
        
        if not workout_result:
            # No workout found for this session, return empty list
            return []
        
        workout_id = workout_result[0]["id"]
        
        # Get all sets for this workout
        sets_query = """
            SELECT id, exercise_id, set_number, reps, weight_lbs, 
                   volume_lbs, created_at
            FROM workout_sets 
            WHERE workout_id = $1 
            ORDER BY created_at ASC
        """
        
        sets_result = await db.execute_query(sets_query, [workout_id])
        
        # Convert to Enhanced WorkoutLogger V2 format
        sets = []
        for set_data in sets_result:
            sets.append({
                "id": str(set_data["id"]),
                "sessionId": session_id,
                "exerciseId": set_data["exercise_id"],
                "weight": float(set_data["weight_lbs"]),
                "reps": set_data["reps"],
                "volume": float(set_data["volume_lbs"]),
                "setNumber": set_data["set_number"],
                "createdAt": set_data["created_at"].isoformat()
            })
        
        logger.info("🔧 WORKOUT_SETS_RETRIEVED", extra={"count": len(sets)})
        return sets
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("❌ get_workout_sets_for_session ERROR", extra={"error": str(e)})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error retrieving workout sets"
        )


async def get_or_create_workout_for_session(db: DatabaseManager, session_id: UUID) -> UUID:
    """
    Find existing workout for session or create new one
    Uses session_id as workout_id for simplicity
    """
    # Check if workout already exists for this session
    check_query = "SELECT id FROM workouts WHERE id = $1"
    result = await db.execute_query(check_query, [session_id])
    
    if result:
        return result[0]["id"]
    
    # Create new workout for this session
    # TODO: Replace with actual user from authentication
    user_id = UUID("00000000-0000-0000-0000-000000000001")  # Placeholder
    
    create_query = """
        INSERT INTO workouts (
            id, user_id, workout_type, name, started_at, 
            variation, is_completed, created_at, updated_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
        RETURNING id
    """
    
    now = datetime.utcnow()
    params = [
        session_id,
        user_id,
        "general",  # Default workout type
        f"Workout Session {session_id}",
        now,
        "A",  # Default variation
        False,  # Not completed yet
        now,
        now
    ]
    
    result = await db.execute_query(create_query, params)
    return result[0]["id"]


async def get_next_set_number(db: DatabaseManager, workout_id: UUID, exercise_id: str) -> int:
    """
    Get the next set number for an exercise in this workout
    """
    query = """
        SELECT COALESCE(MAX(set_number), 0) + 1 as next_set_number
        FROM workout_sets 
        WHERE workout_id = $1 AND exercise_id = $2
    """
    
    result = await db.execute_query(query, [workout_id, exercise_id])
    return result[0]["next_set_number"]
```

### File: backend/app/api/workouts.py

```python
"""
Workouts API Router
Workout session management and tracking endpoints with full database integration
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import logging
import sys
import os
from uuid import uuid4

from app.models.schemas import Workout, WorkoutCreate, WorkoutUpdate, WorkoutSet, WorkoutSetCreate, WorkoutSetUpdate
from ..core.database import get_database, DatabaseManager, DatabaseUtils

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[Workout])
async def get_workouts(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    workout_type: Optional[str] = Query(None, description="Filter by workout type"),
    start_date: Optional[date] = Query(None, description="Filter workouts after this date"),
    end_date: Optional[date] = Query(None, description="Filter workouts before this date"),
    is_completed: Optional[bool] = Query(None, description="Filter by completion status"),
    limit: int = Query(50, ge=1, le=100, description="Number of workouts to return"),
    offset: int = Query(0, ge=0, description="Number of workouts to skip"),
    db: DatabaseManager = Depends(get_database)
):
    """
    Get workouts with optional filtering
    Supports filtering by user, type, date range, and completion status
    """
    logger.info("🔥 get_workouts ENTRY", extra={
        "user_id": user_id, "workout_type": workout_type, 
        "start_date": start_date, "end_date": end_date,
        "is_completed": is_completed, "limit": limit, "offset": offset
    })
    
    try:
        # Build secure parameterized query
        query_conditions = ["1=1"]
        params = []
        
        if user_id:
            query_conditions.append("user_id = $" + str(len(params) + 1))
            params.append(user_id)
        
        if workout_type:
            query_conditions.append("workout_type = $" + str(len(params) + 1))
            params.append(workout_type)
        
        if start_date:
            query_conditions.append("started_at >= $" + str(len(params) + 1))
            params.append(start_date)
        
        if end_date:
            query_conditions.append("started_at <= $" + str(len(params) + 1))
            params.append(end_date)
        
        if is_completed is not None:
            query_conditions.append("is_completed = $" + str(len(params) + 1))
            params.append(is_completed)
        
        # Build final query with pagination parameters
        where_clause = " AND ".join(query_conditions)
        base_query = f"SELECT * FROM workouts WHERE {where_clause}"
        
        # Add ORDER BY, LIMIT, OFFSET as parameters
        params.extend([limit, offset])
        limit_param = "$" + str(len(params) - 1)  # limit
        offset_param = "$" + str(len(params))     # offset
        
        paginated_query = f"{base_query} ORDER BY started_at DESC LIMIT {limit_param} OFFSET {offset_param}"
        
        logger.info("🔧 Executing workout query", extra={
            "query": paginated_query, "params": params
        })
        
        results = await db.execute_query(paginated_query, *params, fetch=True)
        
        logger.info("🔧 Query results", extra={
            "count": len(results) if results else 0
        })
        
        return results or []
        
    except Exception as e:
        logger.error(f"🚨 get_workouts FAILURE - {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve workouts: {str(e)}"
        )


@router.get("/{workout_id}", response_model=Workout)
async def get_workout(
    workout_id: str,
    db: DatabaseManager = Depends(get_database)
):
    """Get workout by ID with full details"""
    logger.info("🔥 get_workout ENTRY", extra={"workout_id": workout_id})
    
    try:
        # Verify workout exists
        workout = await db.execute_query(
            "SELECT * FROM workouts WHERE id = $1",
            workout_id,
            fetch_one=True
        )
        
        if not workout:
            logger.warning("🚨 Workout not found", extra={"workout_id": workout_id})
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workout with ID {workout_id} not found"
            )
        
        logger.info("🔧 Workout retrieved successfully", extra={
            "workout_id": workout_id, "workout_type": workout.get("workout_type")
        })
        
        return workout
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 get_workout FAILURE - {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve workout: {str(e)}"
        )


@router.post("/", response_model=Workout, status_code=status.HTTP_201_CREATED)
async def create_workout(
    workout: WorkoutCreate,
    db: DatabaseManager = Depends(get_database)
):
    """Create new workout session"""
    logger.info("🔥 create_workout ENTRY", extra={
        "user_id": workout.user_id, "workout_type": workout.workout_type
    })
    
    try:
        # Verify user exists
        user_exists = await DatabaseUtils.verify_user_exists(workout.user_id, db)
        if not user_exists:
            logger.warning("🚨 User not found", extra={"user_id": workout.user_id})
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {workout.user_id} not found"
            )
        
        # Generate workout ID
        workout_id = str(uuid4())
        current_time = datetime.utcnow()
        
        logger.info("🔧 Creating workout", extra={
            "workout_id": workout_id, "timestamp": current_time
        })
        
        # Insert workout record - ONLY using columns that exist in database schema
        insert_query = """
            INSERT INTO workouts (
                id, user_id, workout_type, name, 
                started_at, variation, notes, is_completed
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8
            ) RETURNING *
        """
        
        created_workout = await db.execute_query(
            insert_query,
            workout_id,
            workout.user_id,
            workout.workout_type,
            workout.name,
            workout.started_at or current_time,
            workout.variation,  # A/B periodization variation
            workout.notes,
            False,  # New workouts start as not completed
            fetch_one=True
        )
        
        logger.info("🔧 Workout created successfully", extra={
            "workout_id": workout_id, "user_id": workout.user_id
        })
        
        return created_workout
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 create_workout FAILURE - {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create workout: {str(e)}"
        )


@router.put("/{workout_id}", response_model=Workout)
async def update_workout(workout_id: str, workout_update: WorkoutUpdate):
    """Update workout details"""
    # TODO: Implement workout update
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not implemented yet"
    )


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workout(workout_id: str):
    """Delete workout session"""
    # TODO: Implement workout deletion
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not implemented yet"
    )


@router.post("/{workout_id}/complete")
async def complete_workout(
    workout_id: str,
    db: DatabaseManager = Depends(get_database)
):
    """Mark workout as completed and calculate metrics"""
    logger.info("🔥 complete_workout ENTRY", extra={"workout_id": workout_id})
    
    try:
        # Verify workout exists and is not already completed
        workout = await db.execute_query(
            "SELECT * FROM workouts WHERE id = $1",
            workout_id,
            fetch_one=True
        )
        
        if not workout:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workout with ID {workout_id} not found"
            )
        
        if workout["is_completed"]:
            logger.warning("🚨 Workout already completed", extra={"workout_id": workout_id})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workout is already completed"
            )
        
        current_time = datetime.utcnow()
        
        # Get workout sets for muscle fatigue calculation (volume calculated by DB trigger)
        workout_sets = await db.execute_query(
            """
            SELECT ws.*, e.muscle_engagement_data
            FROM workout_sets ws
            JOIN exercises e ON ws.exercise_id = e.id
            WHERE ws.workout_id = $1
            """,
            workout_id,
            fetch=True
        )
        
        logger.info("🔧 Processing workout completion", extra={
            "workout_id": workout_id, "sets_count": len(workout_sets) if workout_sets else 0
        })
        
        # Calculate muscle fatigue data (let DB trigger handle volume calculations)
        muscle_fatigue_data = {}
        
        if workout_sets:
            for set_data in workout_sets:
                # Use the pre-calculated volume_lbs from the set (calculated by trigger)
                set_volume = float(set_data.get("volume_lbs", 0))
                
                # Process muscle engagement for fatigue calculation
                muscle_engagement = set_data.get("muscle_engagement_data", {})
                if isinstance(muscle_engagement, dict):
                    for muscle, percentage in muscle_engagement.items():
                        if muscle not in muscle_fatigue_data:
                            muscle_fatigue_data[muscle] = 0.0
                        # Weight fatigue contribution by muscle engagement percentage
                        muscle_fatigue_data[muscle] += set_volume * (float(percentage) / 100.0)
        
        logger.info("🔧 Calculated muscle fatigue data", extra={
            "muscles_engaged": len(muscle_fatigue_data)
        })
        
        # Update workout completion (let DB triggers calculate volume/sets/reps)
        update_query = """
            UPDATE workouts SET
                is_completed = true,
                ended_at = $2,
                updated_at = $2
            WHERE id = $1
            RETURNING *
        """
        
        completed_workout = await db.execute_query(
            update_query,
            workout_id,
            current_time,
            fetch_one=True
        )
        
        # Update user muscle states for fatigue tracking
        user_id = workout["user_id"]
        if muscle_fatigue_data:
            await update_muscle_states(user_id, muscle_fatigue_data, current_time, db)
        
        # Use database-calculated metrics (from triggers)
        db_total_volume = float(completed_workout.get("total_volume_lbs", 0))
        db_total_sets = int(completed_workout.get("total_sets", 0))
        db_total_reps = int(completed_workout.get("total_reps", 0))
        db_exercises_count = int(completed_workout.get("exercises_count", 0))
        
        # Calculate duration from timestamps
        duration_seconds = completed_workout.get("duration_seconds", 0)
        duration_minutes = int(duration_seconds / 60) if duration_seconds else 0
        
        logger.info("🔧 Workout completed successfully", extra={
            "workout_id": workout_id, 
            "total_volume_lbs": db_total_volume,
            "total_sets": db_total_sets,
            "duration_minutes": duration_minutes
        })
        
        return {
            "message": "Workout completed successfully",
            "workout": completed_workout,
            "metrics": {
                "total_volume_lbs": db_total_volume,  # From DB trigger
                "total_sets": db_total_sets,          # From DB trigger  
                "total_reps": db_total_reps,          # From DB trigger
                "exercises_count": db_exercises_count, # From DB trigger
                "duration_minutes": duration_minutes,
                "muscle_engagement": muscle_fatigue_data
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 complete_workout FAILURE - {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete workout: {str(e)}"
        )


async def update_muscle_states(
    user_id: str, 
    muscle_fatigue_data: Dict[str, float], 
    workout_time: datetime,
    db: DatabaseManager
):
    """Update user muscle states based on workout fatigue"""
    logger.info("🔧 Updating muscle states", extra={
        "user_id": user_id, "muscles_count": len(muscle_fatigue_data)
    })
    
    for muscle_name, fatigue_amount in muscle_fatigue_data.items():
        # Upsert muscle state record
        upsert_query = """
            INSERT INTO muscle_states (
                id, user_id, muscle_name, current_fatigue_percentage,
                last_workout_date, total_volume_lifetime, updated_at
            ) VALUES (
                gen_random_uuid(), $1, $2, $3, $4, $5, $4
            )
            ON CONFLICT (user_id, muscle_name) 
            DO UPDATE SET
                current_fatigue_percentage = LEAST(100.0, muscle_states.current_fatigue_percentage + $3),
                last_workout_date = $4,
                total_volume_lifetime = muscle_states.total_volume_lifetime + $5,
                updated_at = $4
        """
        
        await db.execute_query(
            upsert_query,
            user_id,
            muscle_name,
            min(20.0, fatigue_amount / 100.0),  # Cap fatigue increase per workout
            workout_time,
            fatigue_amount
        )


# Workout Sets endpoints
@router.get("/{workout_id}/sets", response_model=List[WorkoutSet])
async def get_workout_sets(workout_id: str):
    """Get all sets for a workout"""
    # TODO: Implement workout sets retrieval
    return []


@router.post("/{workout_id}/sets", response_model=WorkoutSet, status_code=status.HTTP_201_CREATED)
async def create_workout_set(workout_id: str, workout_set: WorkoutSetCreate):
    """Add new set to workout"""
    # TODO: Implement workout set creation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not implemented yet"
    )


@router.put("/{workout_id}/sets/{set_id}", response_model=WorkoutSet)
async def update_workout_set(workout_id: str, set_id: str, set_update: WorkoutSetUpdate):
    """Update workout set details"""
    # TODO: Implement workout set update
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not implemented yet"
    )


@router.delete("/{workout_id}/sets/{set_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workout_set(workout_id: str, set_id: str):
    """Delete workout set"""
    # TODO: Implement workout set deletion
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not implemented yet"
    )


@router.get("/{workout_id}/summary")
async def get_workout_summary(workout_id: str):
    """Get workout summary with calculated metrics"""
    # TODO: Implement workout summary calculation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not implemented yet"
    )


@router.get("/{workout_id}/muscle-engagement")
async def get_workout_muscle_engagement(workout_id: str):
    """Get muscle engagement data for entire workout"""
    # TODO: Implement workout muscle engagement calculation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not implemented yet"
    )
```

### File: backend/app/api/exercises.py

```python
"""
FitForge Exercise Library API Endpoints
Created: December 21, 2024
Purpose: CRUD operations for exercise database with filtering and search

CRITICAL: Uses exact Pydantic models from schemas/pydantic-models.py
All database operations follow schema-first development approach
"""

import logging
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse

# Import our Pydantic models (schema-first approach)
from app.models.schemas import Exercise, ExerciseCreate, ExerciseUpdate, Difficulty, Variation

from ..core.database import get_database, DatabaseManager, DatabaseUtils
from ..core.config import get_settings

router = APIRouter()
settings = get_settings()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[Exercise])
async def get_exercises(
    category: Optional[str] = Query(None, description="Filter by exercise category"),
    equipment: Optional[str] = Query(None, description="Filter by equipment type"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty level"),
    muscle_group: Optional[str] = Query(None, description="Filter by target muscle group"),
    variation: Optional[str] = Query(None, description="Filter by A/B variation"),
    is_compound: Optional[bool] = Query(None, description="Filter compound vs isolation"),
    movement_pattern: Optional[str] = Query(None, description="Filter by movement pattern"),
    limit: int = Query(50, ge=1, le=100, description="Number of exercises to return"),
    offset: int = Query(0, ge=0, description="Number of exercises to skip"),
    db: DatabaseManager = Depends(get_database)
):
    """
    Get exercises with advanced filtering
    
    SECURITY: Uses parameterized queries to prevent SQL injection
    SCHEMA: Uses only verified database columns from exercises table
    """
    logger.info(f"🔥 get_exercises ENTRY - inputs: category={category}, difficulty={difficulty}, "
                f"equipment={equipment}, muscle_group={muscle_group}, limit={limit}")
    
    try:
        # Build safe parameterized query using verified schema columns
        base_query = """
        SELECT 
            id, name, category, equipment, difficulty, variation,
            instructions, setup_tips, safety_notes, muscle_engagement,
            primary_muscles, secondary_muscles, is_compound, is_unilateral,
            movement_pattern, created_at, updated_at, is_active
        FROM exercises
        WHERE is_active = $1
        """
        
        query_conditions = ["is_active = $1"]
        params = [True]  # Always filter for active exercises
        
        # Add filters using parameterized queries (SQL injection prevention)
        if category:
            query_conditions.append("category = $" + str(len(params) + 1))
            params.append(category)
            
        if equipment:
            query_conditions.append("equipment = $" + str(len(params) + 1))
            params.append(equipment)
            
        if difficulty:
            query_conditions.append("difficulty = $" + str(len(params) + 1))
            params.append(difficulty)
            
        if variation:
            query_conditions.append("variation = $" + str(len(params) + 1))
            params.append(variation)
            
        if is_compound is not None:
            query_conditions.append("is_compound = $" + str(len(params) + 1))
            params.append(is_compound)
            
        if movement_pattern:
            query_conditions.append("movement_pattern = $" + str(len(params) + 1))
            params.append(movement_pattern)
            
        if muscle_group:
            # Search in muscle engagement JSON and muscle arrays
            query_conditions.append(
                "(muscle_engagement ? $" + str(len(params) + 1) + " OR "
                "$" + str(len(params) + 1) + " = ANY(primary_muscles) OR "
                "$" + str(len(params) + 1) + " = ANY(secondary_muscles))"
            )
            params.append(muscle_group)
        
        # Build final query with pagination
        where_clause = " AND ".join(query_conditions)
        query = f"""
        {base_query.replace('WHERE is_active = $1', 'WHERE ' + where_clause)}
        ORDER BY name
        LIMIT ${ len(params) + 1 } OFFSET ${ len(params) + 2 }
        """
        
        # Add pagination parameters
        params.extend([limit, offset])
        
        logger.info(f"🔧 QUERY_BUILD RESULT: {query[:200]}... with {len(params)} params")
        
        # Execute query using dependency injection
        results = await db.execute_query(query, *params, fetch=True)
        
        # Convert database results to Pydantic models
        exercises = []
        if results:
            for row in results:
                try:
                    exercise = Exercise(**row)
                    exercises.append(exercise)
                except Exception as e:
                    logger.warning(f"Failed to convert exercise row to model: {e}")
                    continue
        
        logger.info(f"🔧 QUERY_RESULT: Retrieved {len(exercises)} exercises")
        return exercises
        
    except Exception as e:
        logger.error(f"🚨 get_exercises ERROR: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to retrieve exercises",
                "preserved_filters": {
                    "category": category,
                    "equipment": equipment,
                    "difficulty": difficulty,
                    "muscle_group": muscle_group,
                    "limit": limit,
                    "offset": offset
                },
                "recovery_instructions": "Filters have been preserved. Please retry.",
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@router.get("/search", response_model=List[Exercise])
async def search_exercises(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=50, description="Number of results to return")
):
    """
    Search exercises by name, description, or muscle groups
    Full-text search across exercise database
    """
    # TODO: Implement exercise search functionality
    return []


@router.get("/{exercise_id}", response_model=Exercise)
async def get_exercise(
    exercise_id: str,
    db: DatabaseManager = Depends(get_database)
):
    """
    Get exercise by ID with full details
    
    SECURITY: Uses parameterized query for security
    SCHEMA: Uses only verified database columns
    """
    logger.info(f"🔥 get_exercise ENTRY - exercise_id: {exercise_id}")
    
    try:
        # Parameterized query using verified schema columns only
        query = """
        SELECT 
            id, name, category, equipment, difficulty, variation,
            instructions, setup_tips, safety_notes, muscle_engagement,
            primary_muscles, secondary_muscles, is_compound, is_unilateral,
            movement_pattern, created_at, updated_at, is_active
        FROM exercises 
        WHERE id = $1 AND is_active = $2
        """
        
        params = [exercise_id, True]
        
        logger.info(f"🔧 QUERY_EXECUTE: {query[:100]}... with params: {params}")
        
        # Execute query using dependency injection
        result = await db.execute_query(query, *params, fetch_one=True)
        
        if not result:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": f"Exercise '{exercise_id}' not found",
                    "exercise_id": exercise_id,
                    "recovery_instructions": "Check exercise ID and try again",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        
        # Convert to Pydantic model
        try:
            exercise = Exercise(**result)
            logger.info(f"🔧 QUERY_SUCCESS: Retrieved exercise {exercise_id}")
            return exercise
        except Exception as e:
            logger.error(f"🚨 MODEL_CONVERSION_ERROR: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "Failed to process exercise data",
                    "exercise_id": exercise_id,
                    "recovery_instructions": "Exercise data may be corrupted. Contact support.",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 get_exercise ERROR: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to retrieve exercise",
                "exercise_id": exercise_id,
                "recovery_instructions": "Exercise ID preserved. Please retry.",
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@router.post("/", response_model=Exercise, status_code=status.HTTP_201_CREATED)
async def create_exercise(exercise: ExerciseCreate):
    """Create new exercise (admin only)"""
    # TODO: Implement exercise creation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not implemented yet"
    )


@router.put("/{exercise_id}", response_model=Exercise)
async def update_exercise(exercise_id: str, exercise_update: ExerciseUpdate):
    """Update exercise details (admin only)"""
    # TODO: Implement exercise update
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not implemented yet"
    )


@router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exercise(exercise_id: str):
    """Delete exercise (admin only)"""
    # TODO: Implement exercise deletion
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not implemented yet"
    )


@router.get("/{exercise_id}/muscle-engagement")
async def get_exercise_muscle_engagement(exercise_id: str):
    """Get detailed muscle engagement data for an exercise"""
    # TODO: Implement muscle engagement data retrieval
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not implemented yet"
    )


@router.get("/categories/")
async def get_exercise_categories(
    db: DatabaseManager = Depends(get_database)
):
    """
    Get all available exercise categories
    
    SECURITY: Uses parameterized query for security
    SCHEMA: Uses verified 'category' column from exercises table
    """
    logger.info("🔥 get_exercise_categories ENTRY")
    
    try:
        # Parameterized query to get distinct categories
        query = "SELECT DISTINCT category FROM exercises WHERE is_active = $1 ORDER BY category"
        params = [True]
        
        logger.info(f"🔧 CATEGORIES_QUERY: {query} with params: {params}")
        
        # Execute query using dependency injection
        results = await db.execute_query(query, *params, fetch=True)
        
        categories = []
        if results:
            categories = [row['category'] for row in results]
        
        logger.info(f"🔧 CATEGORIES_RESULT: Retrieved {len(categories)} categories")
        return categories
        
    except Exception as e:
        logger.error(f"🚨 get_exercise_categories ERROR: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to retrieve exercise categories",
                "recovery_instructions": "Please retry request",
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@router.get("/equipment/")
async def get_equipment_types(
    db: DatabaseManager = Depends(get_database)
):
    """
    Get all available equipment types
    
    SECURITY: Uses parameterized query for security  
    SCHEMA: Uses verified 'equipment' column from exercises table
    """
    logger.info("🔥 get_equipment_types ENTRY")
    
    try:
        # Parameterized query to get distinct equipment types
        query = "SELECT DISTINCT equipment FROM exercises WHERE is_active = $1 ORDER BY equipment"
        params = [True]
        
        logger.info(f"🔧 EQUIPMENT_QUERY: {query} with params: {params}")
        
        # Execute query using dependency injection
        results = await db.execute_query(query, *params, fetch=True)
        
        equipment_types = []
        if results:
            equipment_types = [row['equipment'] for row in results]
        
        logger.info(f"🔧 EQUIPMENT_RESULT: Retrieved {len(equipment_types)} equipment types")
        return equipment_types
        
    except Exception as e:
        logger.error(f"🚨 get_equipment_types ERROR: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to retrieve equipment types",
                "recovery_instructions": "Please retry request",
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@router.get("/muscles/")  
async def get_target_muscles(
    db: DatabaseManager = Depends(get_database)
):
    """
    Get all muscles that can be targeted by exercises
    
    SECURITY: Uses parameterized query for security
    SCHEMA: Uses verified muscle_engagement JSONB and muscle arrays
    """
    logger.info("🔥 get_target_muscles ENTRY")
    
    try:
        # Query to extract all muscle names from engagement data and muscle arrays
        query = """
        SELECT DISTINCT muscle_name 
        FROM (
            SELECT jsonb_object_keys(muscle_engagement) AS muscle_name 
            FROM exercises WHERE is_active = $1
            UNION
            SELECT unnest(primary_muscles) AS muscle_name
            FROM exercises WHERE is_active = $1
            UNION  
            SELECT unnest(secondary_muscles) AS muscle_name
            FROM exercises WHERE is_active = $1
        ) AS all_muscles
        ORDER BY muscle_name
        """
        
        params = [True]
        
        logger.info(f"🔧 MUSCLES_QUERY: {query[:100]}... with params: {params}")
        
        # Execute query using dependency injection
        results = await db.execute_query(query, *params, fetch=True)
        
        muscles = []
        if results:
            muscles = [row['muscle_name'] for row in results]
        
        logger.info(f"🔧 MUSCLES_RESULT: Retrieved {len(muscles)} target muscles")
        return muscles
        
    except Exception as e:
        logger.error(f"🚨 get_target_muscles ERROR: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to retrieve target muscles",
                "recovery_instructions": "Please retry request", 
                "timestamp": datetime.utcnow().isoformat()
            }
        )


# ============================================================================
# SECURITY & VALIDATION SUMMARY
# ============================================================================

"""
SECURITY MEASURES IMPLEMENTED (following validated workouts.py patterns):

1. SQL Injection Prevention:
   - All queries use parameterized statements ($1, $2, etc.)
   - No f-string or raw string concatenation in queries
   - Dynamic filter building with parameter arrays

2. Schema Alignment:
   - Only verified database columns used in all queries
   - Column names match exactly: id, name, category, equipment, etc.
   - No assumption-based column references

3. Input Validation:
   - Pydantic models validate all input data
   - Query parameter validation with FastAPI
   - Type safety enforced throughout

4. Error Handling:
   - Preserves user data during failures (filter states, etc.)
   - Provides clear recovery instructions
   - Structured error responses with context

5. Evidence-First Debugging:
   - Systematic logging at function entry points
   - Query logging with parameter counts
   - Error logging with full context

This implementation follows the exact security patterns validated in workouts.py
and is ready for database connection via dependency injection.
"""
```

### File: backend/app/core/database.py

```python
"""
FitForge Database Connection and Supabase Integration
Created: December 21, 2024
Purpose: Database connectivity using Supabase with async operations

CRITICAL: Uses exact database schema from schemas/database-schema.sql
All database operations must match the validated schema structure
"""

import asyncio
import logging
from typing import AsyncGenerator, Optional, Dict, Any
from contextlib import asynccontextmanager

import asyncpg
from supabase import create_client, Client
from fastapi import HTTPException

from .config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class DatabaseManager:
    """
    Database connection manager for Supabase PostgreSQL
    Handles both direct asyncpg connections and Supabase client operations
    """
    
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
        self.supabase: Optional[Client] = None
        self._initialized = False
    
    async def initialize(self) -> None:
        """Initialize database connections"""
        if self._initialized:
            return
        
        try:
            # Initialize Supabase client
            if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
                self.supabase = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_ANON_KEY
                )
                logger.info("✅ Supabase client initialized")
            
            # Initialize direct PostgreSQL connection pool
            if settings.DATABASE_URL:
                self.pool = await asyncpg.create_pool(
                    settings.DATABASE_URL,
                    min_size=settings.DB_POOL_MIN_SIZE,
                    max_size=settings.DB_POOL_MAX_SIZE,
                    command_timeout=settings.DB_COMMAND_TIMEOUT,
                    server_settings={
                        'application_name': 'FitForge_Backend',
                        'timezone': 'UTC'
                    }
                )
                logger.info("✅ PostgreSQL connection pool initialized")
            
            self._initialized = True
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Database connection failed: {str(e)}"
            )
    
    async def close(self) -> None:
        """Close database connections"""
        if self.pool:
            await self.pool.close()
            logger.info("🔌 PostgreSQL connection pool closed")
        
        self._initialized = False
    
    @asynccontextmanager
    async def get_connection(self) -> AsyncGenerator[asyncpg.Connection, None]:
        """Get a database connection from the pool"""
        if not self.pool:
            raise HTTPException(
                status_code=500,
                detail="Database pool not initialized"
            )
        
        async with self.pool.acquire() as connection:
            try:
                yield connection
            except Exception as e:
                # Log the error but let it propagate
                logger.error(f"Database operation failed: {e}")
                raise
    
    async def execute_query(
        self,
        query: str,
        *args,
        fetch: bool = False,
        fetch_one: bool = False
    ) -> Optional[Any]:
        """
        Execute a database query with error handling
        
        Args:
            query: SQL query string
            *args: Query parameters
            fetch: Return all results
            fetch_one: Return single result
            
        Returns:
            Query results or None
        """
        async with self.get_connection() as conn:
            try:
                if fetch_one:
                    result = await conn.fetchrow(query, *args)
                    return dict(result) if result else None
                elif fetch:
                    results = await conn.fetch(query, *args)
                    return [dict(row) for row in results]
                else:
                    return await conn.execute(query, *args)
                    
            except asyncpg.exceptions.UniqueViolationError as e:
                logger.warning(f"Unique constraint violation: {e}")
                raise HTTPException(
                    status_code=409,
                    detail="Resource already exists"
                )
            except asyncpg.exceptions.ForeignKeyViolationError as e:
                logger.warning(f"Foreign key violation: {e}")
                raise HTTPException(
                    status_code=400,
                    detail="Invalid reference to related resource"
                )
            except asyncpg.exceptions.CheckViolationError as e:
                logger.warning(f"Check constraint violation: {e}")
                raise HTTPException(
                    status_code=400,
                    detail="Data validation failed"
                )
            except Exception as e:
                logger.error(f"Database query failed: {e}")
                raise HTTPException(
                    status_code=500,
                    detail="Database operation failed"
                )
    
    async def health_check(self) -> Dict[str, Any]:
        """Check database connectivity and return status"""
        status = {
            "database": "unknown",
            "supabase": "unknown",
            "pool_size": 0,
            "timestamp": None
        }
        
        try:
            # Check PostgreSQL pool
            if self.pool:
                async with self.get_connection() as conn:
                    result = await conn.fetchrow("SELECT NOW() as timestamp, version() as version")
                    status["database"] = "connected"
                    status["pool_size"] = self.pool.get_size()
                    status["timestamp"] = result["timestamp"]
                    status["version"] = result["version"]
            
            # Check Supabase client
            if self.supabase:
                try:
                    # Simple health check query
                    response = self.supabase.from_("exercises").select("id").limit(1).execute()
                    status["supabase"] = "connected" if response.data is not None else "error"
                except Exception as e:
                    logger.warning(f"Supabase health check failed: {e}")
                    status["supabase"] = "error"
            
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            status["database"] = "error"
            status["error"] = str(e)
        
        return status


# Global database manager instance
db_manager = DatabaseManager()


async def get_database() -> DatabaseManager:
    """Dependency injection for database manager"""
    if not db_manager._initialized:
        await db_manager.initialize()
    return db_manager


async def get_supabase_client() -> Client:
    """Dependency injection for Supabase client"""
    db = await get_database()
    if not db.supabase:
        raise HTTPException(
            status_code=500,
            detail="Supabase client not available"
        )
    return db.supabase


# Database utilities for common operations
class DatabaseUtils:
    """Utility functions for database operations"""
    
    @staticmethod
    async def verify_user_exists(user_id: str, db: DatabaseManager) -> bool:
        """Verify user exists in database"""
        result = await db.execute_query(
            "SELECT id FROM users WHERE id = $1",
            user_id,
            fetch_one=True
        )
        return result is not None
    
    @staticmethod
    async def verify_exercise_exists(exercise_id: str, db: DatabaseManager) -> bool:
        """Verify exercise exists in database"""
        result = await db.execute_query(
            "SELECT id FROM exercises WHERE id = $1 AND is_active = true",
            exercise_id,
            fetch_one=True
        )
        return result is not None
    
    @staticmethod
    async def verify_workout_belongs_to_user(
        workout_id: str, 
        user_id: str, 
        db: DatabaseManager
    ) -> bool:
        """Verify workout belongs to specified user"""
        result = await db.execute_query(
            "SELECT id FROM workouts WHERE id = $1 AND user_id = $2",
            workout_id,
            user_id,
            fetch_one=True
        )
        return result is not None
    
    @staticmethod
    def build_pagination_query(
        base_query: str,
        limit: int = 50,
        offset: int = 0,
        order_by: str = "created_at DESC"
    ) -> str:
        """Build paginated query with proper ordering"""
        # Validate limit
        limit = max(1, min(limit, 100))  # Between 1 and 100
        
        # Validate offset
        offset = max(0, offset)
        
        # Basic SQL injection prevention for order_by
        allowed_columns = [
            "created_at", "updated_at", "name", "id", 
            "started_at", "ended_at", "difficulty", "category"
        ]
        allowed_directions = ["ASC", "DESC"]
        
        order_parts = order_by.split()
        if len(order_parts) >= 1:
            column = order_parts[0]
            direction = order_parts[1] if len(order_parts) > 1 else "DESC"
            
            if column not in allowed_columns or direction not in allowed_directions:
                order_by = "created_at DESC"  # Safe default
        
        return f"{base_query} ORDER BY {order_by} LIMIT {limit} OFFSET {offset}"


# Export functions and classes
__all__ = [
    'DatabaseManager',
    'DatabaseUtils',
    'db_manager',
    'get_database',
    'get_supabase_client'
]
```

### File: backend/app/core/config.py

```python
"""
FitForge Backend Configuration Management
Pydantic settings for environment variable management with validation
"""

import os
from functools import lru_cache
from typing import List, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings with environment variable support
    All settings can be overridden via environment variables
    """
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )
    
    # Application settings
    APP_NAME: str = "FitForge API"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = Field(default="development", description="Application environment")
    DEBUG: bool = Field(default=False, description="Enable debug mode")
    
    # Server settings
    HOST: str = Field(default="0.0.0.0", description="Server host")
    PORT: int = Field(default=8000, ge=1, le=65535, description="Server port")
    
    # Database settings
    DATABASE_URL: str = Field(
        default="postgresql://postgres:password@localhost:5432/fitforge",
        description="Database connection URL"
    )
    DATABASE_POOL_SIZE: int = Field(default=10, ge=1, le=50, description="Database connection pool size")
    DATABASE_MAX_OVERFLOW: int = Field(default=20, ge=0, le=100, description="Database max overflow connections")
    
    # Supabase settings (if using Supabase)
    SUPABASE_URL: Optional[str] = Field(default=None, description="Supabase project URL")
    SUPABASE_ANON_KEY: Optional[str] = Field(default=None, description="Supabase anon key")
    SUPABASE_SERVICE_KEY: Optional[str] = Field(default=None, description="Supabase service role key")
    
    # Database connection pool settings
    DB_POOL_MIN_SIZE: int = Field(default=5, ge=1, le=20, description="Minimum database pool size")
    DB_POOL_MAX_SIZE: int = Field(default=20, ge=1, le=100, description="Maximum database pool size")
    DB_COMMAND_TIMEOUT: int = Field(default=30, ge=1, le=300, description="Database command timeout in seconds")
    
    # Security settings
    SECRET_KEY: str = Field(
        default="your-secret-key-change-in-production",
        min_length=32,
        description="Secret key for JWT tokens and encryption"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, ge=1, description="JWT access token expiration in minutes")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, ge=1, description="JWT refresh token expiration in days")
    
    # CORS settings
    CORS_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001"
        ],
        description="Allowed CORS origins"
    )
    
    # Security - Trusted hosts
    ALLOWED_HOSTS: List[str] = Field(
        default=["*"],
        description="Allowed host headers"
    )
    
    # Logging settings
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    LOG_FORMAT: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        description="Log format string"
    )
    
    # Redis settings (for caching, sessions)
    REDIS_URL: Optional[str] = Field(default=None, description="Redis connection URL")
    REDIS_EXPIRE_SECONDS: int = Field(default=3600, ge=1, description="Default Redis key expiration")
    
    # API rate limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, ge=1, description="API rate limit per minute per IP")
    
    # File upload settings
    MAX_UPLOAD_SIZE: int = Field(default=10 * 1024 * 1024, ge=1, description="Max file upload size in bytes (10MB)")
    UPLOAD_DIRECTORY: str = Field(default="uploads", description="Directory for file uploads")
    
    # Analytics settings
    MUSCLE_RECOVERY_DAYS: int = Field(default=5, ge=1, le=14, description="Default muscle recovery period in days")
    TARGET_VOLUME_INCREASE_PERCENTAGE: float = Field(
        default=3.0, 
        ge=0.1, 
        le=20.0, 
        description="Target volume increase percentage for progressive overload"
    )
    
    # External API settings
    OPENAI_API_KEY: Optional[str] = Field(default=None, description="OpenAI API key for AI features")
    
    @field_validator('ENVIRONMENT')
    @classmethod
    def validate_environment(cls, v: str) -> str:
        """Validate environment setting"""
        allowed_environments = ['development', 'staging', 'production', 'testing']
        if v.lower() not in allowed_environments:
            raise ValueError(f'Environment must be one of: {allowed_environments}')
        return v.lower()
    
    @field_validator('LOG_LEVEL')
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Validate log level setting"""
        allowed_levels = ['CRITICAL', 'ERROR', 'WARNING', 'INFO', 'DEBUG']
        if v.upper() not in allowed_levels:
            raise ValueError(f'Log level must be one of: {allowed_levels}')
        return v.upper()
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    @field_validator('ALLOWED_HOSTS', mode='before')
    @classmethod
    def parse_allowed_hosts(cls, v):
        """Parse allowed hosts from string or list"""
        if isinstance(v, str):
            return [host.strip() for host in v.split(',')]
        return v
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return self.ENVIRONMENT == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment"""
        return self.ENVIRONMENT == "development"
    
    @property
    def is_testing(self) -> bool:
        """Check if running in testing environment"""
        return self.ENVIRONMENT == "testing"
    
    @property
    def database_url_async(self) -> str:
        """Get async database URL (for SQLAlchemy async)"""
        if self.DATABASE_URL.startswith("postgresql://"):
            return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
        return self.DATABASE_URL


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance
    Uses lru_cache to ensure single instance throughout application
    """
    return Settings()


# Export settings instance for direct import
settings = get_settings()
```

### File: backend/requirements.txt

```text
# FitForge Backend Dependencies
# FastAPI and core dependencies

# FastAPI framework and ASGI server
fastapi==0.104.1
uvicorn[standard]==0.24.0

# Pydantic for data validation and settings
pydantic==2.5.0
pydantic-settings==2.1.0

# Database dependencies
sqlalchemy==2.0.23
asyncpg==0.29.0
alembic==1.13.0

# Supabase client (optional)
supabase==2.0.1
postgrest==0.13.0

# Authentication and security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# HTTP client for external APIs - compatible with supabase requirements
httpx==0.24.1
aiohttp==3.9.1

# Redis for caching and sessions (optional)
redis==5.0.1
aioredis==2.0.1

# Data processing and analytics
pandas==2.1.4
numpy==1.24.4
scipy==1.11.4

# Logging and monitoring
python-json-logger==2.0.7
structlog==23.2.0

# Development and testing dependencies
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
# httpx==0.24.1 already defined above for compatibility

# Code quality and formatting
black==23.11.0
isort==5.12.0
flake8==6.1.0
mypy==1.7.1

# Environment and configuration
python-dotenv==1.0.0

# Date and time utilities
python-dateutil==2.8.2

# Validation and parsing utilities
email-validator==2.1.0

# UUID utilities - built-in Python module, no need to install
# uuid==1.30

# Math and decimal handling - built-in Python module, no need to install  
# decimal==1.70

# Type hints for older Python versions
typing-extensions==4.8.0

# CORS middleware (included in FastAPI but listed for clarity)
# fastapi already includes starlette which provides CORS

# Optional: Machine learning for advanced analytics
# scikit-learn==1.3.2
# tensorflow==2.15.0  # Uncomment if using ML features

# Optional: Image processing for user avatars
# Pillow==10.1.0  # Uncomment if handling image uploads

# Optional: Background task processing
# celery==5.3.4
# kombu==5.3.4

# Optional: Monitoring and metrics
# prometheus-client==0.19.0
# opencensus-ext-azure==1.1.13

# Production deployment
gunicorn==21.2.0

# Health checks and utilities
psutil==5.9.6
```

---

## Configuration & Infrastructure