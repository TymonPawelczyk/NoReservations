# Test Suite Documentation

## Overview

This test suite provides comprehensive testing coverage for the **Bez Rezerwacji** (No Reservations) dating app. The tests are built using **Vitest** and **React Testing Library**, optimized for Next.js 15 and React 19.

## Table of Contents

- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Testing Strategy](#testing-strategy)
- [Mocking Strategy](#mocking-strategy)
- [Coverage Goals](#coverage-goals)
- [Writing New Tests](#writing-new-tests)
- [Troubleshooting](#troubleshooting)

## Setup

### Prerequisites

- Node.js 18+
- npm

### Installation

All test dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### Dependencies

- **vitest** - Fast unit test framework
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom matchers for DOM assertions
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM implementation for Node.js
- **@vitejs/plugin-react** - React support for Vitest

## Running Tests

### Basic Commands

```bash
# Run tests in watch mode (recommended for development)
npm test

# Run tests once (useful for CI/CD)
npm run test:run

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Watch Mode Features

When running `npm test`, Vitest will:
- Watch for file changes and re-run related tests
- Show only failed tests after initial run
- Provide interactive filtering options

Press `h` in watch mode to see all available commands.

### Coverage Reports

After running `npm run test:coverage`, coverage reports are generated in:
- `coverage/index.html` - HTML report (open in browser)
- `coverage/coverage-final.json` - JSON report
- Terminal output - Summary table

## Test Structure

### Directory Organization

```
NoReservations/
├── components/
│   ├── __tests__/
│   │   ├── Avatar.test.tsx
│   │   ├── ConfirmExitModal.test.tsx
│   │   └── EndGameAnimation.test.tsx
│   ├── Avatar.tsx
│   └── ...
├── lib/
│   ├── __tests__/
│   │   ├── session.test.ts
│   │   ├── avatars.test.ts
│   │   └── questions.test.ts
│   ├── session.ts
│   └── ...
├── __tests__/
│   └── README.md (this file)
├── vitest.config.ts
└── vitest.setup.ts
```

### Test File Naming

- Component tests: `ComponentName.test.tsx`
- Utility tests: `fileName.test.ts`
- Tests are colocated with source files in `__tests__/` directories

## Testing Strategy

### Test Categories

#### 1. Utility Tests (`lib/__tests__/`)

**session.test.ts** - Session utility functions
- ✅ Session code generation (6-digit codes)
- ✅ User ID generation (unique timestamps + random)
- ✅ Time-based unlocking logic
- ✅ Ready state validation (both users)

**avatars.test.ts** - Avatar configuration
- ✅ Avatar mappings validation
- ✅ Emotion states (closed, happy, open, surprised)
- ✅ Image path validation
- ✅ Display name mappings

**questions.test.ts** - Question data structures
- ✅ Stage 1 questions (food preferences, 6 questions)
- ✅ Stage 2 questions (activities, 5 questions + easter egg)
- ✅ Stage 3 questions (quiz, 12 questions)
- ✅ Points validation
- ✅ Correct answer validation

#### 2. Component Tests (`components/__tests__/`)

**Avatar.test.tsx** - Avatar rendering and interactions
- ✅ Basic rendering (all emotions × all avatars)
- ✅ Size configuration
- ✅ Custom styling
- ✅ Clickable behavior (surprised state)
- ✅ Animated blinking
- ✅ Emotion updates
- ✅ Cleanup on unmount

**ConfirmExitModal.test.tsx** - Exit confirmation modal
- ✅ Modal rendering (Polish text)
- ✅ User interactions (confirm/cancel)
- ✅ Button styling (green/red)
- ✅ Modal layout (overlay, centering)
- ✅ Emoji rendering
- ✅ Responsive design

**EndGameAnimation.test.tsx** - End game celebration
- ✅ Animation phases (fade-in → walking → hearts → message → fade-out)
- ✅ Timeline progression (0ms → 7000ms)
- ✅ Player data rendering
- ✅ Visual elements (stars, hearts, road)
- ✅ Success messages
- ✅ onComplete callback
- ✅ Cleanup and unmounting

### Testing Patterns

We follow the **AAA Pattern**:

```typescript
it('should do something when condition is met', () => {
  // Arrange - Setup test data and state
  const props = { ... };

  // Act - Perform action
  render(<Component {...props} />);

  // Assert - Verify expected outcome
  expect(screen.getByText('...')).toBeInTheDocument();
});
```

### Best Practices

1. **Descriptive test names** - Use `should` statements
2. **One assertion concept per test** - Test one thing at a time
3. **Test user behavior** - Focus on what users see and do
4. **Avoid implementation details** - Don't test internal state directly
5. **Use accessible queries** - Prefer `getByRole`, `getByText` over `getByTestId`

## Mocking Strategy

### Firebase Mocking

Firebase Firestore is mocked in `vitest.setup.ts`:

```typescript
// All Firestore functions return mock implementations
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  onSnapshot: vi.fn((ref, callback) => vi.fn()), // Returns unsubscribe
  runTransaction: vi.fn(),
  // ... more mocks
}));
```

**Why?** The app uses real-time Firebase listeners extensively, which can't run in test environment.

### Next.js Mocking

#### Image Component

```typescript
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />
}));
```

**Why?** Next.js Image optimization requires a server, not available in tests.

#### Router

```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), ... }),
  useParams: () => ({ code: '123456' }),
  usePathname: () => '/session/123456',
}));
```

**Why?** Router hooks require Next.js routing context.

### localStorage Mocking

```typescript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;
```

**Why?** Node.js doesn't have localStorage API.

### Timer Mocking

For components with animations or timeouts:

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// In tests
vi.advanceTimersByTime(1500); // Fast-forward 1.5 seconds
```

## Coverage Goals

### Target Coverage

- **Overall**: > 80%
- **Components**: > 75%
- **Utilities**: > 90%

### Current Coverage

Run `npm run test:coverage` to see current coverage metrics.

### Coverage Exclusions

The following are excluded from coverage (configured in `vitest.config.ts`):
- `node_modules/`
- `vitest.setup.ts`
- `**/*.config.{js,ts}`
- `**/types.ts`
- `**/__tests__/**`
- `**/__mocks__/**`

## Writing New Tests

### Component Test Template

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<YourComponent />);
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle click events', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<YourComponent onClick={handleClick} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing data gracefully', () => {
      render(<YourComponent data={null} />);
      expect(screen.getByText('No data')).toBeInTheDocument();
    });
  });
});
```

### Utility Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { yourFunction } from '../yourUtility';

describe('yourFunction', () => {
  it('should return expected result for valid input', () => {
    const result = yourFunction('input');
    expect(result).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(yourFunction('')).toBe('default');
    expect(yourFunction(null)).toBe('default');
  });
});
```

### Common Matchers

```typescript
// DOM presence
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();

// Text content
expect(element).toHaveTextContent('text');

// Attributes
expect(element).toHaveAttribute('href', '/path');
expect(element).toHaveClass('classname');

// Form elements
expect(input).toHaveValue('value');
expect(checkbox).toBeChecked();

// Visibility
expect(element).toBeVisible();
expect(element).not.toBeVisible();

// Arrays
expect(array).toHaveLength(5);
expect(array).toContain(item);

// Functions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
```

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors

**Solution**: Check import paths use `@/` alias:
```typescript
import { Component } from '@/components/Component';
```

#### 2. Tests timeout with Firebase

**Solution**: Ensure Firebase is properly mocked in `vitest.setup.ts`

#### 3. Timer-based tests fail

**Solution**: Use fake timers:
```typescript
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
vi.advanceTimersByTime(1000);
```

#### 4. "ReferenceError: localStorage is not defined"

**Solution**: Already mocked in `vitest.setup.ts`. If still failing, verify setup file is loaded.

#### 5. Image component errors

**Solution**: Already mocked in `vitest.setup.ts`. Ensure Next.js Image is imported correctly.

### Debug Mode

Run tests with verbose output:

```bash
npx vitest --reporter=verbose
```

Enable debug logging:

```bash
DEBUG=* npm test
```

### VSCode Integration

Install the **Vitest** extension for VSCode:
- Test explorer in sidebar
- Run/debug individual tests
- Inline test results
- Coverage highlighting

## Test Maintenance

### When to Update Tests

- ✅ When adding new features
- ✅ When fixing bugs (add regression tests)
- ✅ When refactoring (ensure tests still pass)
- ✅ When changing component APIs

### When NOT to Change Tests

- ❌ To make failing tests pass (fix the code instead)
- ❌ To improve coverage without adding value
- ❌ To test implementation details

### Regular Maintenance

1. **Monthly**: Review and update outdated tests
2. **Per Release**: Ensure all tests pass
3. **Per Feature**: Add tests for new functionality
4. **Per Bug Fix**: Add regression test

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm run test:run

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)
- [User Event API](https://testing-library.com/docs/user-event/intro)

## Contributing

When adding tests:

1. Follow existing patterns and structure
2. Use descriptive test names
3. Group related tests with `describe` blocks
4. Add comments for complex test scenarios
5. Ensure tests are isolated and don't depend on each other
6. Clean up resources in `afterEach` hooks

## Questions?

If you have questions about the test suite, please refer to:
- This README
- Existing test files for examples
- Vitest and Testing Library documentation

---

**Happy Testing!** 🧪
