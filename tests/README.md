# Testing Guide

## Overview
This directory contains tests for the ClearURL extension. The test suite uses Jest with jsdom environment to simulate browser APIs.

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

## Test Structure

### Current Tests
- **URL Cleaning**: Tests for tracking parameter removal
- **Statistics**: Tests for statistics tracking and updates
- **Whitelist**: Tests for domain whitelist functionality
- **Storage**: Tests for Chrome storage API interactions
- **Validation**: Tests for input validation functions

### Test Files
- `extension.test.js` - Main extension functionality tests
- Add more test files as needed

## Writing New Tests

### Example Test Structure
```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks();
  });

  test('should do something specific', () => {
    // Arrange
    const input = 'test data';
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe('expected output');
  });
});
```

### Chrome API Mocking
Chrome extension APIs are mocked in the test setup:
```javascript
global.chrome = {
  storage: { sync: { get: jest.fn(), set: jest.fn() } },
  runtime: { sendMessage: jest.fn() },
  // ... other APIs
};
```

## Test Categories

### Unit Tests
- Individual function testing
- Input validation
- Data transformation
- Error handling

### Integration Tests
- Component interactions
- Chrome API integration
- Storage operations
- Message passing

### Future Tests
- End-to-end browser testing
- Performance benchmarks
- Cross-browser compatibility
- Security testing

## Best Practices

1. **Test Naming**: Use descriptive test names that explain what is being tested
2. **Setup/Teardown**: Use `beforeEach`/`afterEach` for clean test isolation
3. **Mocking**: Mock external dependencies (Chrome APIs, network requests)
4. **Assertions**: Use specific assertions with clear expected values
5. **Coverage**: Aim for high test coverage but focus on critical paths

## Adding More Tests

When adding new features, include tests for:
- Happy path scenarios
- Error conditions
- Edge cases
- Browser API interactions
- User input validation

## Continuous Integration

Tests run automatically in GitHub Actions on:
- Pull requests
- Pushes to main branch
- Release creation

The CI pipeline ensures all tests pass before merging code.