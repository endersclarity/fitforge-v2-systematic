# FitForge Development Workflow
**The Single Source of Truth for Chaos-Free Development**

---

## 🚨 CRITICAL PRINCIPLES

### Single Sources of Truth
- **Task Management**: TaskMaster ONLY (no Claude todos, no manual lists)
- **Testing Environment**: localhost:8080 ONLY (Docker container)
- **Git Operations**: Local machine ONLY (container has no git binary)
- **Code Authority**: main branch = canonical state

### Anti-Chaos Rules
❌ **NEVER DO:**
- Use Claude's built-in todos (TaskMaster ONLY)
- Run `npm run dev` locally (Docker container ONLY)
- Test at localhost:3000 (localhost:8080 ONLY) 
- Commit directly to main (feature branches ONLY)
- Work without a TaskMaster task
- Start development without referencing Fitbod flows

✅ **ALWAYS DO:**
- Start with TaskMaster task selection
- Create feature branch for every change
- Test at localhost:8080 (container)
- Reference FitForge Development Guide + Fitbod flows
- Update CURRENT-STATUS.md with major changes

---

## 🔄 THE DAILY WORKFLOW (10 Steps)

### 1. Task Selection
```bash
task-master start <task-id>
```
- Select task from TaskMaster (informed by PRD + Development Guide + CURRENT-STATUS)
- Task must reference specific Fitbod flow analysis

### 2. Branch Creation
```bash
git checkout -b feature/task-name
```
- Create feature branch (never work on main directly)
- Use descriptive names: `feature/workout-routine-display`, `fix/equipment-filter-bug`

### 3. Development
- Edit files locally using your preferred editor
- Container automatically reflects changes via volume mount (`.:/app`)
- No need to restart container - hot reloading works

### 4. Testing
- **ONLY** test at `localhost:8080` (Docker container)
- Container shows current branch files automatically
- Check browser console for errors

### 5. Iteration
- Repeat steps 3-4 until satisfied
- Container always shows current local branch state

### 6. Commit
```bash
git add .
git commit -m "feat: descriptive commit message"
```
- Use conventional commit format
- Commit frequently with meaningful messages

### 7. Integration
```bash
git checkout main
git merge feature/task-name
```
- Merge to main when feature is complete and tested
- Container automatically reflects main branch state

### 8. Cleanup
```bash
git branch -d feature/task-name
```
- Delete feature branch after successful merge

### 9. Task Completion
```bash
task-master complete <task-id>
```
- Mark task as complete in TaskMaster

### 10. Documentation
- Update CURRENT-STATUS.md with major changes
- Reference completed work and next priorities

---

## 🐳 CONTAINER & GIT ARCHITECTURE

### Current Setup (Perfect for Chaos Elimination)
```yaml
# docker-compose.fast.yml
volumes:
  - .:/app  # Entire local directory mounted to container
```

### How It Works
1. **Local Git Authority**: All git operations happen on local machine
2. **Container File Reflection**: Volume mount makes container see current branch files
3. **No Git Conflicts**: Container has no git binary, can't run git commands
4. **Automatic Sync**: Switch branches locally → container immediately reflects changes

### Branch Switching Example
```bash
# Local
git checkout feature/new-ui

# Container automatically sees feature/new-ui files
# Test at localhost:8080

# Local  
git checkout main

# Container automatically sees main files
# No manual sync needed
```

---

## 📋 TASKMASTER INTEGRATION

### Task Sources
TaskMaster generates tasks from:
- **FitForge Development Guide** (8-step architecture, strategic vision)
- **CURRENT-STATUS.md** (operational priorities)
- **TaskMaster PRD** (systematic phase breakdown)
- **Fitbod Flow Analysis** (proven UX patterns)

### Task Requirements
Every task must include:
- Reference to specific Fitbod flow analysis
- Alignment with FitForge Development Guide
- Clear success criteria
- Testing requirements

### TaskMaster Commands
```bash
# Daily workflow
task-master list                    # See available tasks
task-master start <task-id>        # Begin specific task  
task-master status                 # Check current progress
task-master complete <task-id>     # Mark task complete

# Task management
task-master expand <task-id>       # Break task into subtasks
task-master dependencies          # View task dependencies
task-master pause <task-id>       # Pause current task
```

---

## 🎯 QUALITY GATES

### Before Starting Development
- [ ] TaskMaster task selected and started
- [ ] Feature branch created
- [ ] Relevant Fitbod flow analysis reviewed
- [ ] FitForge Development Guide section referenced

### Before Committing
- [ ] Changes tested at localhost:8080
- [ ] No console errors
- [ ] Feature works as expected
- [ ] Code follows existing patterns

### Before Merging to Main
- [ ] All commits tested
- [ ] TaskMaster task marked complete
- [ ] CURRENT-STATUS.md updated if needed
- [ ] No regressions introduced

---

## 🚫 CHAOS PREVENTION

### Common Mistakes to Avoid
1. **Multiple Dev Environments**: Only use Docker container at localhost:8080
2. **Git State Confusion**: All git operations local, container just reflects files
3. **Task Fragmentation**: Stick to TaskMaster, don't create manual todo lists
4. **Branch Mess**: Always work in feature branches, merge to main when complete
5. **Testing Confusion**: Never test locally with npm run dev

### Emergency Procedures
If you get confused about current state:
```bash
# Check current setup
docker ps                          # Verify containers running
git branch                         # Check current branch
curl localhost:8080               # Test container response
task-master status                # Check TaskMaster state
```

---

## 📁 REFERENCE DOCUMENTS

### Strategic Level
- **FitForge Development Guide** - 8-step architecture, core vision
- **flows/FLOW-REFERENCE.md** - Complete Fitbod flow analysis library

### Operational Level  
- **CURRENT-STATUS.md** - Daily task priorities and completed work
- **.taskmaster/docs/fitforge-prd.txt** - Systematic development breakdown

### Implementation Level
- **schemas/typescript-interfaces.ts** - Data structures and validation
- **flows/workout/routine-options/flow-analysis.md** - Current task reference

---

**This workflow eliminates chaos through strict adherence to single sources of truth and systematic processes. No exceptions, no deviations.**