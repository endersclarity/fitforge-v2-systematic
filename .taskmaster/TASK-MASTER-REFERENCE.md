# Task Master Quick Reference Guide

*Your systematic development companion - commands, workflows, and pro tips*

---

## 🎯 Essential Daily Commands

**Start Every Session:**
```bash
npx task-master list          # Dashboard overview with progress
npx task-master next          # Get recommended next task
npx task-master show 6        # Detailed view of specific task
```

**Core Task Management:**
```bash
# Start working on a task
npx task-master set-status --id=6 --status=in-progress

# Complete a task  
npx task-master set-status --id=6 --status=done

# Other useful statuses
npx task-master set-status --id=6 --status=review
npx task-master set-status --id=6 --status=deferred
npx task-master set-status --id=6 --status=cancelled
```

---

## 🚀 Advanced Task Management

### Task Breakdown & Planning
```bash
# Break complex tasks into subtasks
npx task-master expand --id=6                    # Basic expansion
npx task-master expand --id=6 --num=5            # Specify number of subtasks
npx task-master expand --id=6 --research         # Include AI research
npx task-master expand --all                     # Expand all pending tasks

# Analyze task complexity
npx task-master analyze-complexity               # Get expansion recommendations
npx task-master complexity-report                # View detailed complexity analysis
```

### Subtask Management
```bash
# Add subtasks manually
npx task-master add-subtask --parent=6 --title="Create schema" --description="Database structure"

# Remove subtasks
npx task-master remove-subtask --id=6.1          # Remove specific subtask
npx task-master clear-subtasks --id=6            # Remove all subtasks from task
npx task-master clear-subtasks --all             # Remove all subtasks from all tasks
```

### Dependencies
```bash
# Manage task dependencies  
npx task-master add-dependency --id=7 --depends-on=6     # Task 7 depends on Task 6
npx task-master remove-dependency --id=7 --depends-on=6  # Remove dependency
npx task-master validate-dependencies                    # Check for issues
npx task-master fix-dependencies                         # Auto-fix invalid dependencies
```

---

## 🔧 Project Setup & Generation

### Initial Setup
```bash
# Initialize new project
npx task-master init --name="ProjectName" --description="Project description"

# Configure AI models (interactive)
npx task-master models --setup

# View current model configuration
npx task-master models
```

### Task Generation
```bash
# Generate tasks from PRD
npx task-master parse-prd --input=prd.txt --num-tasks=10
npx task-master parse-prd .taskmaster/docs/fitforge-prd.txt --force

# Create individual task files
npx task-master generate
```

---

## 🏷️ Multi-Project Organization

### Tag Management (Multiple Projects)
```bash
# View and manage tags
npx task-master tags                              # List all tags
npx task-master tags --show-metadata              # Include metadata

# Create and switch contexts
npx task-master add-tag "backend"                 # Create new tag
npx task-master add-tag "sprint-1" --copy-from-current  # Copy current tasks
npx task-master use-tag "backend"                 # Switch to tag context

# Tag operations
npx task-master copy-tag "master" "sprint-1"      # Copy tag with tasks
npx task-master rename-tag "old-name" "new-name"  # Rename tag
npx task-master delete-tag "backend" --yes        # Delete tag (permanent!)
```

---

## 🔍 Research & Analysis

### AI-Powered Research
```bash
# General research
npx task-master research "How to implement OAuth2 in Next.js?"

# Research with task context
npx task-master research "Best practices for React hooks" -i=6,7

# Research with file context
npx task-master research "Database optimization" -f=schema.sql,config.js

# Advanced research options
npx task-master research "Performance optimization" \
  -i=6,7 \
  -f=package.json \
  -c="We're using Next.js and TypeScript" \
  --tree \
  -s=research-results.md \
  -d=detailed
```

---

## 📊 Task Updates & Modifications

### Updating Tasks
```bash
# Update single task
npx task-master update-task --id=6 --prompt="New requirements: add validation"

# Update multiple tasks (from ID onwards)
npx task-master update --from=6 --prompt="Changed API structure"

# Update subtasks
npx task-master update-subtask --id=6.1 --prompt="Additional context"

# Add new tasks via AI
npx task-master add-task --prompt="Create user authentication" --priority=high --dependencies=6,7
```

### Task Removal
```bash
# Remove tasks (permanent!)
npx task-master remove-task --id=6 -y           # Skip confirmation
npx task-master remove-task --id=6              # With confirmation
```

---

## 📋 Documentation & Export

### Export & Sync
```bash
# Export to README.md
npx task-master sync-readme                     # Basic export
npx task-master sync-readme --with-subtasks     # Include subtasks
npx task-master sync-readme --status=pending    # Filter by status
```

---

## 🎯 Pro Workflows & Patterns

### Daily Development Workflow
```bash
# 1. Start of day
npx task-master next                             # See what's next

# 2. Begin working
npx task-master set-status --id=6 --status=in-progress

# 3. If task is complex
npx task-master expand --id=6 --research        # Break it down

# 4. Need help?
npx task-master research "specific question" -i=6

# 5. Complete task
npx task-master set-status --id=6 --status=done

# 6. Check progress
npx task-master list
```

### Feature Development Workflow
```bash
# 1. Generate tasks from feature spec
npx task-master parse-prd --input=feature-spec.txt

# 2. Analyze complexity
npx task-master analyze-complexity

# 3. Expand complex tasks
npx task-master expand --all --research

# 4. Work through systematically
npx task-master next  # Always get next logical task
```

### Multi-Sprint Workflow
```bash
# 1. Create sprint context
npx task-master add-tag "sprint-1" --copy-from-current

# 2. Switch contexts as needed
npx task-master use-tag "sprint-1"
npx task-master use-tag "master"

# 3. Track progress per context
npx task-master list
```

---

## ⚖️ When to Use Task Master vs Direct Coding

### ✅ Use Task Master For:
- **Feature development** with multiple components
- **Complex implementations** requiring coordination  
- **Long-term projects** where you might lose context
- **Team environments** needing systematic coordination
- **Portfolio projects** requiring demonstration quality
- **Learning new technologies** (research integration)

### ⚡ Direct Coding For:
- **Quick fixes** or single-file changes
- **Experimental features** you might discard
- **Hot fixes** with time pressure
- **Simple refactoring** tasks
- **Rapid prototyping** sessions

### 🏆 Hybrid Approach (Recommended):
- **Task Master**: Strategic feature development
- **Direct coding**: Tactical fixes and experiments  
- **CURRENT-STATUS.md**: Bridge between both approaches

---

## 🔧 Configuration & Troubleshooting

### Model Configuration
```bash
# Set specific models
npx task-master models --set-main sonnet
npx task-master models --set-research opus
npx task-master models --set-fallback sonnet
```

### File Locations
```bash
.taskmaster/config.json          # AI model configuration
.taskmaster/tasks/tasks.json     # Task data
.taskmaster/docs/               # PRDs and documentation  
.env                            # API keys
```

### Common Issues
- **No tasks generated**: Check PRD file path and content
- **Dependencies broken**: Run `npx task-master fix-dependencies`
- **Can't start task**: Check dependencies with `npx task-master show <id>`
- **Model errors**: Verify API keys in `.env` file

---

## 📈 Current FitForge Project Status

### Next Task to Work On
```bash
npx task-master show 6           # Task #6: Create Workout Template Data Structure
```

### Phase Progression
- **Phase 1**: Foundation (Tasks 6→7→8→9)
- **Phase 2**: Enhanced UX (Tasks 10→11→12)  
- **Phase 3**: Intelligence (Tasks 13→14→15)

### Quick Commands for This Project
```bash
# Check current status
npx task-master list

# Start Phase 1
npx task-master set-status --id=6 --status=in-progress

# Get help with current task
npx task-master research "React component best practices" -i=6
```

---

## 💡 Pro Tips

1. **Always check `next`** before starting work - maintains logical progression
2. **Use `expand` for anything complex** - prevents getting overwhelmed
3. **Research integration is powerful** - get AI help with project context
4. **Dependencies prevent "vibe coding"** - trust the systematic approach
5. **Tags are great for experiments** - create separate contexts without losing main progress
6. **Export to README.md regularly** - keeps project documentation current
7. **Status transitions matter** - `pending→in-progress→done` provides accountability

---

**Remember**: Task Master works best when you trust the systematic approach and resist the urge to jump ahead in the dependency chain. Let it guide you through methodical, high-quality development!