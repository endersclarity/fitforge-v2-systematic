# FitForge V2 Systematic

**Advanced workout tracking with comprehensive UI flow analysis and design patterns.**

## 🚨 **MANDATORY DEVELOPMENT WORKFLOW - NO EXCEPTIONS**

### 📋 **BEFORE ANY DEVELOPMENT WORK - REQUIRED CHECKLIST**

**ALWAYS START WITH:**
1. `npx task-master list` - Check TaskMaster status and current tasks
2. `npx task-master next` - Get recommended next task based on dependencies
3. `git checkout -b feature/task-name` - Create feature branch (NEVER work on main)
4. Reference `DEVELOPMENT-WORKFLOW.md` for complete 10-step process

**TESTING ENVIRONMENT:**
- ✅ **ONLY**: localhost:8080 (Docker container)
- ❌ **FORBIDDEN**: npm run dev, localhost:3000, local testing

**TASK MANAGEMENT:**
- ✅ **ONLY**: TaskMaster commands and task references
- ❌ **FORBIDDEN**: Claude todos, manual task lists, "quick tasks"

**GIT WORKFLOW:**
- ✅ **ONLY**: Feature branches → main merge → cleanup
- ❌ **FORBIDDEN**: Direct commits to main, working without branches

### 🚨 **VIOLATION CONSEQUENCES**
**If I deviate from this workflow:** STOP immediately and redirect to proper process
**If I suggest Claude todos:** STOP and use TaskMaster instead
**If I suggest local testing:** STOP and use Docker container at localhost:8080

### 🎯 **MANDATORY DAILY COMMANDS**
```bash
# Session startup (REQUIRED)
npx task-master list              # Check current task status
npx task-master next              # Get next logical task
git branch                        # Verify current branch
docker ps                         # Confirm container running

# Task workflow (REQUIRED)
npx task-master set-status --id=X --status=in-progress    # Start task
git checkout -b feature/task-name                         # Create branch
# ... development work ...
curl localhost:8080                                       # Test in container
git add . && git commit -m "feat: description"           # Commit work
git checkout main && git merge feature/task-name         # Merge to main
npx task-master set-status --id=X --status=done          # Complete task
```

**Reference Document**: `DEVELOPMENT-WORKFLOW.md` - Complete systematic process

## 🚀 **Quick Start**
- **System Overview**: `flows/memory-bank/system_manifest.md` ← Architecture overview
- **Project Roadmap**: `flows/memory-bank/project_roadmap.md` - Development phases and milestones
- **Current Implementation**: Task 1 from Equipment Filtering implementation plan
- **Development**: `./start-fitforge-v2-dev.sh` (Docker on :8080) or `npm run dev`

## 📁 **HDTA Documentation Structure**
- `flows/memory-bank/system_manifest.md` - Complete system architecture
- `flows/memory-bank/project_roadmap.md` - Strategic development timeline
- `flows/memory-bank/*_module.md` - 5 core modules: Components, Data, AI/Analytics, Flows, Backend
- `flows/memory-bank/implementation_plan_*.md` - Feature development plans
- `flows/memory-bank/task_*.md` - Specific actionable tasks

## 🏗️ **Core Files**
- `app/` - Next.js application
- `components/` - React UI components  
- `data/exercises-real.json` - Exercise database
- `flows/` - UI pattern reference library
- `styles/calm-tokens.css` - Design system

## 🚀 **Development Commands**
```bash
./start-fitforge-v2-dev.sh   # Docker development (recommended) - localhost:8080
npm run dev                  # Local development - localhost:3000
npm run build                # Production build
docker ps                    # Check if Docker containers are running
```

## ⚠️ **Development Notes**
- Project uses localStorage for data persistence (no database currently)
- Equipment filtering and workout templates are next priorities
- Reference Fitbod flows in `/flows/` for UI patterns
- Follow Calm design tokens in `styles/calm-tokens.css`

---

## 🛠️ **AVAILABLE CLI TOOLS FOR FITFORGE DEVELOPMENT**

### **Image Processing & OCR Tools**
```bash
# OCR text extraction from images  
tesseract image.png output.txt                    # Basic OCR
~/bin/ocr-screenshot [filename]                   # OCR latest screenshot or specific file
~/bin/ocr-crop-screenshot [w] [h] [x] [y] [file]  # Crop and OCR (defaults: 330x1000+0+0)

# Image manipulation with ImageMagick
convert image.png -crop WxH+X+Y output.png        # Crop images
convert image.png -resize 50% smaller.png         # Resize images  
identify image.png                                 # Get image info

# Manual cropping helper
~/bin/crop-image input.png output.png w h x y     # Crop with explicit parameters
```

### **Data Processing Tools**
```bash
# JSON processing and formatting
jq '.key' file.json                               # Extract JSON values
jq '.' file.json                                  # Pretty-print JSON
echo '{"test": "value"}' | jq '.test'             # Process JSON from stdin

# PDF text extraction
pdftotext document.pdf output.txt                 # Extract text from PDF
pdftotext -layout document.pdf -                  # Extract with layout to stdout

# QR code generation
qrencode -o qr.png "text to encode"               # Generate QR code image
```

### **FitForge-Specific Use Cases**
- **UI flow analysis**: Use `~/bin/ocr-crop-screenshot` to extract text from Mobbin screenshots
- **Exercise data processing**: Use `jq` to manipulate exercise JSON files
- **Image assets**: Use ImageMagick to resize/crop exercise images for components
- **Flow documentation**: OCR screenshots to document user flows and UI patterns

---

**This environment is completely self-contained. All dependencies, documentation, and code exist within this directory. No external references are needed or allowed.**