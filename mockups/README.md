# FitForge Feature Mockups

## UI Features - Visual Mockups

### 1. **Equipment Filters - Horizontal Layout** 
📄 `equipment-filters-horizontal.html`

**What it shows:**
- Horizontal filter bar on exercise list pages
- Multiple filter types: Equipment, Target Muscle, Recovery Status
- Active filter chips with easy removal
- Exercise cards showing recovery status indicators

**Key Features:**
- Clean horizontal layout that doesn't take up vertical space
- Multiple filters can be active simultaneously
- Visual recovery indicators (Fresh/Recovering/Fatigued)
- Responsive design for mobile/desktop

---

### 2. **Streamlined Set Completion UX**
📄 `streamlined-set-completion.html`

**What it shows:**
- Single-tap set completion with large touch targets
- Pre-filled weight values from previous sets
- Automatic rest timer popup after set completion
- Mobile-optimized number pad for input
- Undo functionality for mistakes

**Key Features:**
- Minimal taps to complete a set
- Smart defaults reduce data entry
- Immediate visual feedback
- Rest timer integration

---

### 3. **Muscle Fatigue Intelligence**
📄 `muscle-fatigue-visualization.html`

**What it shows:**
- Interactive muscle heat map with color-coded recovery states
- Recovery timeline showing when muscles will be ready
- Smart exercise recommendations based on fresh muscles
- Front/back body view toggle

**Key Features:**
- Visual representation of muscle fatigue
- 48-72 hour recovery tracking
- Intelligent exercise suggestions
- Color-coded system (Green=Fresh, Red=Fatigued)

---

## Backend Features - What They Mean

### 1. **Muscle Fatigue Algorithm** (lib/muscle-fatigue-intelligence.ts)
```typescript
// What it does:
- Analyzes workout history from localStorage
- Calculates recovery time for each muscle group
- Uses exercise engagement percentages from exercises-real.json
- Returns fatigue scores and recovery timelines

// Example:
calculateMuscleFatigue(workoutHistory) => {
  chest: { fatigue: 85%, recoveryHours: 48 },
  biceps: { fatigue: 10%, recoveryHours: 0 }
}
```

### 2. **Progressive Overload Calculator** (lib/progressive-overload.ts)
```typescript
// What it does:
- Tracks strength progression over time
- Suggests weight/rep increases using 3% rule
- Calculates one-rep max using Brzycki formula
- Provides personalized progression recommendations

// Example:
getProgressionRecommendation(exerciseHistory) => {
  suggestedWeight: 190, // 3% increase from 185
  suggestedReps: 8,
  progressionType: 'weight-increase'
}
```

### 3. **Template-to-Workout Transformation** (lib/template-utils.ts)
```typescript
// What it does:
- Converts workout templates to actual workout sessions
- Maps exercise IDs to full exercise data
- Applies user preferences and equipment filters
- Handles A/B workout variations

// Example:
templateToWorkout(pushTemplateA, userProfile) => {
  exercises: [
    { id: 'bench-press', sets: 4, reps: '6-8', weight: 185 },
    { id: 'overhead-press', sets: 3, reps: '8-10', weight: 95 }
  ]
}
```

### 4. **Future: Database Integration** (Phase 5)
**Current State:** Everything uses localStorage (browser storage)
**Future State:** PostgreSQL database with Supabase

**What changes:**
- User authentication (login/signup)
- Data syncs across devices
- Real-time updates during workouts
- Secure data storage
- API endpoints for mobile apps

**Backend Stack (Future):**
- **Database:** PostgreSQL (via Supabase)
- **API:** FastAPI (Python) or Next.js API routes
- **Authentication:** Supabase Auth
- **Real-time:** WebSockets for live sync
- **Hosting:** Vercel (frontend) + Supabase (backend)

---

## How to View Mockups

1. Open any HTML file in your browser:
```bash
# From project root
open mockups/equipment-filters-horizontal.html
# or
cd mockups && python -m http.server 8000
# Then visit http://localhost:8000
```

2. Interact with the mockups - they have basic JavaScript for demonstrations

3. View on mobile by using browser developer tools responsive mode

## Next Steps

Based on these mockups, we can create GitHub issues for each feature with:
- Clear acceptance criteria
- Technical implementation details
- Priority and dependencies
- Estimated effort

Would you like to proceed with creating GitHub issues for these features?