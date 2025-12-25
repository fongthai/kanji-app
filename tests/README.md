# Testing Infrastructure

## Overview

This project uses a comprehensive testing approach with multiple frameworks:

- **Vitest** - Fast unit and integration tests
- **Testing Library** - React component testing
- **Playwright** - E2E and visual regression tests
- **fake-indexeddb** - In-memory IndexedDB for unit tests

## Test Structure

```
tests/
├── unit/               # Unit tests for Redux slices, utilities
├── integration/        # Component integration tests
├── e2e/               # End-to-end tests with Playwright
│   ├── layout.spec.ts      # Responsive layout tests
│   ├── controls.spec.ts    # Control panel functionality
│   └── kanji-selection.spec.ts  # Kanji selection workflow
├── fixtures/          # Test data
│   └── testKanjis.ts      # Sample kanji for testing
└── setup.ts           # Test environment setup
```

## Running Tests

### Unit Tests (Vitest)
```bash
# Run all unit tests
npm test

# Run with UI
npm run test:ui

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### E2E Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run visual regression tests only
npm run test:visual

# Run all tests
npm run test:all
```

### Platform-Specific Tests
```bash
# Run tests on specific viewport
npx playwright test --project=pc-horizontal
npx playwright test --project=mobile-vertical
npx playwright test --project=tablet-horizontal
```

## Test Platforms

The E2E tests run across 6 different viewport configurations:

1. **PC Horizontal**: 1920x1080 (Desktop wide-screen)
2. **PC Vertical**: 1024x1366 (Desktop narrow/portrait)
3. **Tablet Horizontal**: iPad Pro landscape
4. **Tablet Vertical**: iPad Pro portrait
5. **Mobile Horizontal**: iPhone 14 Pro landscape
6. **Mobile Vertical**: iPhone 14 Pro portrait

## Visual Regression Testing

Visual tests are tagged with `@visual` and capture screenshots for pixel-perfect comparison.

Baseline screenshots are stored in `tests/e2e/screenshots/`.

To update baselines:
```bash
npx playwright test --update-snapshots
```

## Test Data

### Real Data with Random Selection
Tests use real kanji data from JSON files but select randomly to catch edge cases like:
- Long text overflow
- Multiple readings
- Special characters
- Different JLPT levels

### Test Fixtures
Located in `tests/fixtures/testKanjis.ts`:
- `testKanjis` - 5 carefully selected kanji covering common cases
- `getRandomKanjis(n)` - Get n random kanji
- `getOverflowTestKanji()` - Kanji with intentionally long text for overflow testing

## IndexedDB Testing

- **Unit tests**: Use `fake-indexeddb` (in-memory)
- **E2E tests**: Use real browser IndexedDB with cleanup between tests

## Debugging Tests

### Playwright Debugging
```bash
# Run with headed browser
npx playwright test --headed

# Run with debug mode
npx playwright test --debug

# View test report
npx playwright show-report
```

### Vitest Debugging
```bash
# Run specific test file
npm test -- kanjiSlice

# Run with verbose output
npm test -- --reporter=verbose
```

## CI/CD Integration

Tests are configured to run in CI environments:
- Retry failed tests 2 times
- Run in single worker mode for stability
- Generate HTML reports
- Capture screenshots on failure

## Best Practices

1. **Always add test IDs** to new components using `data-testid`
2. **Run tests before committing** with `npm run test:all`
3. **Update visual baselines** when intentionally changing UI
4. **Use fixtures** for consistent test data
5. **Clean up** after tests (especially IndexedDB)

## Known Issues

- Font rendering may differ slightly across OS (Mac/Windows/Linux)
- Network timeouts can occur on slow connections - increase timeout if needed
- IndexedDB tests require async/await properly handled
