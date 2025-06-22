# FitForge Testing Guide

## Overview

This guide covers the comprehensive testing strategy for FitForge, including unit tests, integration tests, and end-to-end tests.

## Test Structure

```
tests/
├── integration/          # Component integration tests
│   ├── workout-flow.test.tsx
│   ├── muscle-visualization.test.tsx
│   ├── progress-tracking.test.tsx
│   └── api-client.test.ts
├── unit/                # Unit tests for utilities and hooks
├── e2e/                 # End-to-end tests with Playwright
├── run-integration-tests.sh
└── TESTING_GUIDE.md
```

## Running Tests

### All Tests
```bash
npm run test:all
```

### Integration Tests Only
```bash
npm run test:integration
# or use the dedicated runner:
./tests/run-integration-tests.sh
```

### Unit Tests Only
```bash
npm run test:unit
```

### E2E Tests
```bash
npm run test:e2e
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Integration Tests

### 1. Workout Flow Integration (`workout-flow.test.tsx`)

Tests the complete workout creation and logging flow:
- Starting a new workout
- Selecting workout type (A/B)
- Adding exercises via search
- Logging sets with weight and reps
- Editing and deleting sets
- Completing workouts with notes and energy level
- Error handling for network failures

**Key Components Tested:**
- `WorkoutLogger`
- `ExerciseSelector`
- API client interactions
- Real-time state updates

### 2. Muscle Visualization Integration (`muscle-visualization.test.tsx`)

Tests the muscle heatmap and fatigue display:
- Loading and displaying muscle fatigue data
- Color-coding based on fatigue levels
- Interactive hover tooltips
- Front/back view toggling
- Recommended muscle highlighting
- Loading and error states
- Data refresh functionality

**Key Components Tested:**
- `MuscleHeatmap`
- Analytics API integration
- SVG rendering and interactions

### 3. Progress Tracking Integration (`progress-tracking.test.tsx`)

Tests the analytics dashboard:
- Volume progression charts
- Strength gains display
- Muscle distribution visualization
- Workout frequency metrics
- Personal records tracking
- Time period selection
- Data export functionality
- Empty state handling

**Key Components Tested:**
- `ProgressDashboard`
- Chart components (mocked Recharts)
- Analytics data processing

### 4. API Client Integration (`api-client.test.ts`)

Tests the API client's robustness:
- Successful GET/POST/PUT/DELETE requests
- Query parameter handling
- Error responses (400, 401, 404, 500)
- Network failure retry logic
- Timeout handling
- Authentication token management
- Concurrent request handling

**Key Features Tested:**
- Retry logic with exponential backoff
- Custom error classes
- Request/response interceptors
- Type safety

## Test Patterns

### Component Testing Pattern
```typescript
describe('Component Integration', () => {
  // Setup mocks
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock API responses
  })

  it('should handle user interactions', async () => {
    const user = userEvent.setup()
    render(<Component />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(api.endpoint).toHaveBeenCalled()
    })
    
    // User interaction
    await user.click(screen.getByRole('button'))
    
    // Verify results
    expect(screen.getByText('Expected')).toBeInTheDocument()
  })
})
```

### API Testing Pattern
```typescript
it('should handle errors gracefully', async () => {
  // Mock error response
  ;(api.endpoint as jest.Mock).mockRejectedValue(
    new APIError(400, 'VALIDATION_ERROR', 'Invalid input')
  )
  
  // Attempt operation
  await expect(operation()).rejects.toThrow(APIError)
  
  // Verify error handling
  expect(screen.getByText(/error message/i)).toBeInTheDocument()
})
```

## Mock Strategies

### API Mocking
- Use `jest.mock('@/lib/api-client')` for component tests
- Mock individual endpoints as needed
- Return realistic data structures

### Component Mocking
- Mock heavy dependencies (e.g., Recharts)
- Keep mocks minimal to test integration
- Use `data-testid` for reliable element selection

### Authentication Mocking
```typescript
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    isAuthenticated: true,
    isLoading: false,
  }),
}))
```

## Best Practices

1. **Test User Flows**: Focus on complete user journeys, not isolated components
2. **Use Realistic Data**: Mock data should match production schemas
3. **Test Error States**: Always test loading, error, and empty states
4. **Avoid Implementation Details**: Test behavior, not internal state
5. **Keep Tests Fast**: Mock heavy operations and external dependencies
6. **Use Descriptive Names**: Test names should clearly describe the scenario

## Coverage Goals

- **Integration Tests**: 80% coverage of critical user flows
- **Unit Tests**: 90% coverage of utilities and business logic
- **E2E Tests**: Cover happy paths and critical error scenarios

## Debugging Tests

### Run Single Test File
```bash
npm test -- tests/integration/workout-flow.test.tsx
```

### Run Tests in Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### View Coverage Gaps
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## CI/CD Integration

Tests are automatically run on:
- Pull request creation
- Push to main branch
- Pre-deployment checks

Failed tests will block deployment to ensure quality.

## Adding New Tests

1. Identify the user flow or integration point
2. Create test file in appropriate directory
3. Mock external dependencies
4. Write tests following existing patterns
5. Run tests locally before committing
6. Update this guide if adding new patterns

## Common Issues

### "Cannot find module" Errors
- Check Jest moduleNameMapper in jest.config.js
- Ensure TypeScript paths are configured

### Timeout Errors
- Increase timeout for slow operations: `jest.setTimeout(10000)`
- Mock heavy operations instead of running them

### Flaky Tests
- Use `waitFor` instead of fixed delays
- Ensure proper cleanup in `afterEach`
- Mock time-dependent operations