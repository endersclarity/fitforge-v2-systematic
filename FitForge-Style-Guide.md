# FitForge Style Guide
*Following Step 4: Style Guides & State Designs from Systematic Development Process*

## Design Philosophy
**Core Principle**: Simplify complex fitness tracking through intuitive, step-by-step interactions that feel supportive and personalized.

**Inspiration Source**: Fitbod iOS app - Progressive data entry with clean, minimal interfaces and contextual guidance.

---

## Color System
*Based on precise ChatGPT analysis of Fitbod iOS app screenshots*

### Primary Palette (Exact Fitbod Colors)
- **Background**: `#121212` - Main app background, dark theme base
- **Card Background**: `#1C1C1E` - Exercise cards, modal backgrounds
- **Subtle Background**: `#2C2C2E` - Secondary surfaces, input fields
- **Accent Red**: `#FF375F` - Primary action buttons, completion states, high intensity

### Text System
- **Primary Text**: `#FFFFFF` - Headings, primary content, high contrast
- **Secondary Text**: `#A1A1A3` - Supporting text, metadata, subdued content

### Support Colors (Maintained for FitForge Features)
- **Success Green**: `#10B981` - Completed workouts, positive feedback
- **Warning Orange**: `#F59E0B` - Alerts, moderate intensity indicators
- **Info Blue**: `#3B82F6` - Tips, additional information

### Usage Guidelines
- **Dark Theme First**: Core design built around dark backgrounds (#121212)
- **Red Accent Strategy**: Use #FF375F sparingly for primary actions and intensity indicators
- **Card Hierarchy**: #1C1C1E for main cards, #2C2C2E for secondary surfaces
- **High Contrast Text**: White (#FFFFFF) for readability on dark backgrounds
- **Subtle Information**: Use #A1A1A3 for non-critical supporting text

---

## Typography Scale

### Font System
**Primary Font**: `Inter` - Clean, modern sans-serif optimized for UI
**Fallback Stack**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

### Heading Scale
- **H1**: `text-4xl` (36px) / `font-bold` / `leading-tight` - Page titles
- **H2**: `text-3xl` (30px) / `font-semibold` / `leading-tight` - Section headers
- **H3**: `text-2xl` (24px) / `font-semibold` / `leading-snug` - Component titles
- **H4**: `text-xl` (20px) / `font-medium` / `leading-snug` - Card headers
- **H5**: `text-lg` (18px) / `font-medium` / `leading-normal` - Form labels

### Body Text Scale (Fitbod-Extracted Specifications)
- **Body**: `16px/24px` - Standard text with proper line height
- **Small**: `14px/20px` - Secondary information, metadata
- **Caption**: `12px/18px` - Labels, micro-content

### Usage Principles
- **High Contrast**: White text (#FFFFFF) on dark backgrounds (#121212)
- **Clear Hierarchy**: Use size and color contrast to guide attention
- **Prominent Numerical Data**: Large, bold numerical displays for workout data
- **System Fonts**: Leverage native iOS/Android font stacks for optimal rendering

---

## Component Library

### Buttons

#### Primary Button (Fitbod Red Accent)
```css
Base: bg-[#FF375F] text-white px-6 py-3 rounded-xl font-medium
Hover: bg-[#E63050] transform transition-all duration-200
Focus: ring-4 ring-[#FF375F]/30 outline-none
Active: bg-[#D02040] scale-98
```

#### Secondary Button (Dark Theme)
```css
Base: bg-[#2C2C2E] text-[#FFFFFF] px-6 py-3 rounded-xl font-medium
Hover: bg-[#3C3C3E] transition-all duration-200
Focus: ring-4 ring-[#2C2C2E]/50 outline-none
```

#### Large Tappable Areas
- Minimum touch target: 44px height
- Generous padding for mobile interaction
- Clear visual feedback on press

### Input Fields

#### Text Input (Dark Theme)
```css
Base: bg-[#2C2C2E] border border-[#2C2C2E] rounded-xl px-4 py-3 text-base text-[#FFFFFF]
Focus: border-[#FF375F] ring-4 ring-[#FF375F]/20 outline-none
Error: border-[#FF375F] ring-4 ring-[#FF375F]/20
Placeholder: text-[#A1A1A3]
```

#### Number Input (Workout Data)
```css
Base: Large, centered numerical display with dark theme
Style: text-2xl font-bold text-center bg-[#1C1C1E] text-[#FFFFFF] rounded-xl p-4
Focus: bg-[#2C2C2E] border-[#FF375F] ring-[#FF375F]/20
```

### Cards

#### Exercise Card (Dark Theme)
```css
Base: bg-[#1C1C1E] rounded-xl p-6 border border-[#1C1C1E]
Hover: bg-[#2C2C2E] transform translateY(-1px) transition-all duration-200
Content: Exercise name (white text), muscle groups (secondary text), sets preview
Text: Primary text #FFFFFF, secondary text #A1A1A3
```

#### Workout Session Card (Dark Theme)
```css
Base: bg-[#1C1C1E] rounded-xl p-4 border border-[#1C1C1E]
Header: Date, duration, exercise count in white text
Body: Exercise list with completion status using accent colors
Footer: Total volume, metrics in secondary text (#A1A1A3)
```

### Progress Indicators

#### Progress Bar
```css
Container: bg-gray-200 rounded-full h-3
Fill: bg-blue-600 rounded-full transition-all duration-300
Text: text-sm font-medium text-center mt-2
```

#### Completion Checkmarks
```css
Base: w-6 h-6 rounded-full border-2 border-gray-300
Completed: bg-green-500 border-green-500 text-white
Animation: scale-110 transition-transform duration-200
```

---

## Layout Principles

### Spacing System (Fitbod-Extracted Measurements)
- **3**: `12px` - Tight spacing between related elements
- **4**: `16px` - Component internal spacing, standard padding
- **6**: `24px` - Section spacing, card margins
- **xl**: `12px` - Border radius for cards and buttons (Fitbod standard)

### Grid Structure
- **Mobile First**: Single column with generous margins
- **Tablet**: 2-column grid for cards, single column for forms
- **Desktop**: 3-column grid for exercise library, 2-column for workouts

### Visual Hierarchy Guidelines
- **Use Negative Space**: Create breathing room between elements
- **Progressive Disclosure**: Show essential info first, details on demand
- **Consistent Patterns**: Maintain interaction patterns across features

---

## Animation Guidelines

### Timing & Easing
- **Duration**: 200ms for micro-interactions, 300ms for state changes
- **Easing**: `ease-out` for entrances, `ease-in` for exits
- **Physics**: Subtle bounce for positive feedback (`spring(1, 80, 10)`)

### Micro-Interactions
- **Button Press**: Scale down to 98% on active state
- **Card Hover**: Lift with shadow and 2px translateY
- **Input Focus**: Smooth border color transition with ring appearance
- **Completion**: Checkmark with scale bounce animation

### State Transitions
- **Loading**: Skeleton placeholders with shimmer effect
- **Success**: Green checkmark with scale animation
- **Error**: Red shake animation (3px left-right, 3 cycles)
- **Navigation**: Slide transitions for page changes

---

## State Design Definitions

### Workout Logging States

#### Initial State
- **Visual**: Clean form with placeholder values
- **Content**: Exercise name, empty rep/weight fields
- **Actions**: Large "Start Set" button prominent

#### Focus State (During Input)
- **Visual**: Input field with blue ring, keyboard optimized
- **Feedback**: Real-time validation, contextual guidance
- **Example**: "The reps & weight for this exercise are typical for your health profile"

#### In-Progress State
- **Visual**: Timer running, current set highlighted
- **Content**: Previous set data visible for reference
- **Actions**: "Complete Set" and "Rest Timer" prominent

#### Completion State
- **Visual**: Green checkmark animation, set summary
- **Feedback**: "Great job! +3% volume increase achieved"
- **Actions**: "Next Exercise" or "End Workout"

### Exercise Library States

#### Browse State
- **Visual**: Grid of exercise cards with search
- **Content**: Exercise names, muscle group tags, difficulty
- **Actions**: Search, filter by muscle group, select exercise

#### Exercise Detail State
- **Visual**: Hero image, detailed information
- **Content**: Muscle engagement percentages, instructions
- **Actions**: "Add to Workout", "View Variations"

#### Selection State
- **Visual**: Selected exercises with checkmarks
- **Content**: Chosen exercises list with reorder handles
- **Actions**: "Create Workout", "Clear Selection"

### Progress Tracking States

#### Overview State
- **Visual**: Charts, recent workouts, muscle heat map
- **Content**: Weekly volume, strength progression
- **Actions**: "View Details", "Start Workout"

#### Detail State
- **Visual**: Expanded charts, historical data
- **Content**: Exercise-specific progression, plateau analysis
- **Actions**: "Adjust Program", "Export Data"

#### Empty State
- **Visual**: Motivational illustration, getting started tips
- **Content**: "No workouts yet - let's start your fitness journey!"
- **Actions**: "Log First Workout", "Browse Exercises"

---

## Mobile-Specific Considerations

### Touch Interactions
- **Minimum Target Size**: 44px for all interactive elements
- **Swipe Gestures**: Horizontal swipe for navigation between sets
- **Long Press**: Quick actions menu for exercises
- **Pull to Refresh**: Update workout data and sync

### Responsive Breakpoints
- **Mobile**: `max-width: 640px` - Single column, large touch targets
- **Tablet**: `641px - 1024px` - 2-column grids, medium density
- **Desktop**: `1025px+` - 3-column grids, hover states enabled

### Performance Optimizations
- **Lazy Loading**: Exercise images and non-critical content
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Offline Support**: Cache workout data for uninterrupted use

---

## Accessibility Standards

### Color Contrast
- **AA Compliance**: 4.5:1 ratio for normal text, 3:1 for large text
- **Focus Indicators**: High contrast ring with 4px thickness
- **Error States**: Never rely on color alone, include icons/text

### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy, landmark regions
- **ARIA Labels**: Descriptive labels for interactive elements
- **Live Regions**: Announce state changes (set completion, errors)

### Keyboard Navigation
- **Tab Order**: Logical progression through interactive elements
- **Skip Links**: Jump to main content, exercise list
- **Focus Management**: Clear visual indicators, trapped modals

---

## Implementation Notes

### CSS Framework Integration
- **Tailwind CSS**: Utility-first approach with custom component classes
- **Custom Properties**: CSS variables for theme consistency
- **Component Variants**: Use @apply directive for reusable patterns

### React Component Architecture
- **Compound Components**: Flexible, composable exercise/workout forms
- **Render Props**: Reusable state logic for form handling
- **Context API**: Theme and user preferences management

### Performance Considerations
- **Critical CSS**: Inline above-the-fold styles
- **Code Splitting**: Lazy load non-essential UI components
- **Image Optimization**: WebP format with fallbacks, proper sizing

---

This style guide provides the foundation for implementing professional, user-friendly interfaces that align with modern fitness app standards while maintaining our scientific approach to workout tracking and muscle analysis.