# FitForge V2 Systematic - Isolated Development Environment

## 🚨 **ISOLATION BOUNDARY - CRITICAL RULES**

**MANDATORY:** This project operates in complete isolation within the `fitforge-v2-systematic` directory.

- ❌ **NEVER** reference files outside this directory
- ❌ **NEVER** use `../` paths that escape this boundary  
- ❌ **NEVER** look in parent directories for context
- ✅ **ALWAYS** work exclusively within fitforge-v2-systematic
- ✅ **ALWAYS** use relative paths within this directory only

## 📚 **COMPREHENSIVE DOCUMENTATION SYSTEM**

This project uses a systematic approach with extensive documentation:

### **Primary Documentation Files:**
- `FitForge-Development-Guide.md` - Complete development methodology and practices
- `FitForge-Technical-Specifications.md` - System architecture and technical details
- `FitForge-Style-Guide.md` - Coding standards and design principles  
- `FitForge-Implementation-Journal.md` - Development progress and decisions
- `Development-Guide-Template.md` - Templates and reference materials

### **Before ANY Development Work:**
1. **Read the documentation first** - Comprehensive guides exist for methodology
2. **Follow the systematic approach** - Don't improvise, follow established patterns
3. **Reference the implementation journal** - Understand what's been done and why
4. **Respect the architecture** - Technical specifications define the system design

## 🏗️ **PROJECT STRUCTURE**

### **Type System:**
- `schemas/typescript-interfaces.ts` - Complete TypeScript type definitions
- `schemas/database-schema.sql` - Database structure
- `schemas/pydantic-models.py` - Python backend models

### **Data & Content:**
- `data/exercises.json` - Exercise database (self-contained)
- `data/exercises-real.json` - Real exercise data

### **Application Structure:**
- `app/` - Next.js application pages and routing
- `components/` - React UI components
- `lib/` - Core business logic and utilities
- `hooks/` - React hooks and state management

### **Development Tools:**
- `package.json` - All dependencies (no external package references)
- Docker-based development workflow
- Comprehensive testing with Jest and Playwright

## 🚀 **DEVELOPMENT COMMANDS**

```bash
# Docker-based development (preferred method)
./start-fitforge-docker.sh

# Testing
npm run test           # Jest unit tests
npm run test:e2e       # Playwright e2e tests
npm run test:fast      # Fast test suite

# Building
npm run build          # Production build
npm run lint           # Code linting
```

## 🧠 **AI & ANALYTICS FEATURES**

- Advanced muscle fatigue analytics in `lib/ai/`
- Progressive overload algorithms
- Exercise recommendation system
- Comprehensive muscle engagement tracking

## ⚠️ **CRITICAL DEVELOPMENT NOTES**

1. **Respect Existing Architecture** - Don't "fix" imports or structure without understanding intent
2. **Follow Systematic Approach** - Use established documentation and methodology
3. **Maintain Isolation** - Never escape the fitforge-v2-systematic boundary
4. **Docker First** - Use Docker-based development workflow as primary method
5. **Test Thoroughly** - Comprehensive test suite exists for validation

## 🚨 **MANDATORY SCHEMA-FIRST DEVELOPMENT - NO EXCEPTIONS**

**BEFORE writing ANY code that touches the database, you MUST:**

1. **Check the actual database schema first** using direct database queries:
   ```bash
   # For PostgreSQL databases
   docker exec [container] psql -d [db] -c "\d+ [table_name]"
   
   # For project databases - verify live schema via API
   curl -s "http://localhost:3000/api/endpoint" | grep -o '"[a-z_]*":"[^"]*"'
   ```

2. **Show me the EXACT column names, types, and constraints**

3. **Create/verify TypeScript interfaces match the actual schema**

4. **ONLY THEN write code** using the verified column names

**DO NOT assume column names. DO NOT guess schema structure. DO NOT write code first and debug later.**

**If you write code without first showing me the verified schema, I will stop you and make you start over.**

**EXAMPLE:** If touching the workouts table, first run:
```bash
SELECT column_name, data_type, is_nullable FROM information_schema.columns 
WHERE table_name = 'workouts' ORDER BY ordinal_position;
```
Then show me output and confirm interface matches before any INSERT/UPDATE/SELECT code.

**FORBIDDEN PATTERNS:**
- ❌ Hand-coding function parameters based on "common sense"
- ❌ Guessing column names without checking actual database
- ❌ Creating functions first, discovering schema issues during testing
- ❌ Assuming TypeScript interfaces are accurate without verification

**VIOLATION CONSEQUENCE:** If you write code without first showing verified schema, STOP immediately and start over with schema verification.

**MANDATORY DATABASE INTERACTION RULES:**
```python
# ✅ CORRECT: Parameterized queries with verified column names
async def get_workout(db, workout_id):
    query = "SELECT * FROM workouts WHERE id = $1"
    return await db.execute_query(query, workout_id)

# ❌ FORBIDDEN: Dynamic query building or unverified columns
# f"SELECT * FROM workouts WHERE target_area = '{area}'"  # target_area doesn't exist!
# f"AND user_id = ${param_count}"  # SQL injection risk!
```

## 📋 **SLASH COMMANDS AVAILABLE**

- `/docs` - Access comprehensive documentation
- `/specs` - Technical specifications
- `/style` - Style guide and standards
- `/journal` - Implementation history
- `/exercises` - Exercise database work
- `/types` - TypeScript interfaces
- `/analytics` - AI and analytics features
- `/components` - UI development
- `/test` - Testing workflows

---

**This environment is completely self-contained. All dependencies, documentation, and code exist within this directory. No external references are needed or allowed.**