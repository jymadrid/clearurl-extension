# Development Guide for ClearURL Extension

This guide provides comprehensive information for developers who want to contribute to the ClearURL project or understand its architecture.

## Quick Start

1. **Clone and Setup**:
   ```bash
   git clone https://github.com/jymadrid/clearurl-extension.git
   cd clearurl-extension
   npm install
   ```

2. **Development Commands**:
   ```bash
   npm run dev      # Start development with web-ext
   npm run lint     # Run ESLint
   npm run test     # Run Jest tests
   npm run format   # Format code with Prettier
   npm run build    # Build production version
   ```

3. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select project directory

## Architecture Overview

### Core Components

#### 🎯 Background Service Worker (`background.js`)
- **Purpose**: Main extension logic running in the background
- **Key Features**:
  - URL cleaning using declarativeNetRequest API
  - Statistics tracking and persistence
  - Settings management with Chrome Storage API
  - Message handling for UI communication
  - Badge updates for visual feedback

#### 💻 Popup Interface (`popup.html/js/css`)
- **Purpose**: Quick access interface from browser toolbar
- **Features**:
  - Real-time privacy statistics display
  - Recent cleanup activity log
  - Quick toggle for extension on/off
  - Site-specific whitelist controls

#### ⚙️ Options Page (`options.html/js/css`)
- **Purpose**: Comprehensive settings and configuration
- **Features**:
  - Advanced rule management
  - Bulk whitelist operations
  - Data export/import capabilities
  - Developer tools and debugging info

#### 📋 Declarative Rules (`rules.json`)
- **Purpose**: Network-level URL processing rules
- **Features**:
  - Regex-based parameter matching
  - Optimized for performance
  - Easy to extend with new tracking parameters

## Development Workflow

### 1. Setting Up Your Environment
```bash
# Install dependencies
npm install

# Run tests to ensure everything works
npm test

# Start linting to check code quality
npm run lint

# Format code according to project standards
npm run format
```

### 2. Making Changes
- Create a feature branch: `git checkout -b feature/your-feature-name`
- Make your changes following the coding standards
- Write tests for new functionality
- Update documentation as needed
- Test manually in browser

### 3. Quality Assurance
```bash
# Run all quality checks
npm run validate  # Runs lint + test

# Test the extension build
npm run build

# Check for security vulnerabilities
npm audit
```

## Testing Strategy

### Unit Tests (`npm test`)
- **Framework**: Jest with jsdom environment
- **Coverage**: All core functions and utilities
- **Location**: `tests/extension.test.js`
- **Mock Strategy**: Chrome APIs are fully mocked

### Integration Testing
```bash
# Test extension loading
npx web-ext lint

# Test in real browser
npx web-ext run
```

### Manual Testing Checklist
1. **URL Cleaning**:
   - Visit `https://example.com?utm_source=test&utm_medium=email&normal=keep`
   - Verify tracking parameters are removed
   - Check that legitimate parameters remain

2. **Statistics**:
   - Open popup after cleaning URLs
   - Verify counters increment correctly
   - Check recent activity list

3. **Whitelist**:
   - Add a site to whitelist
   - Verify tracking parameters are not removed on that site
   - Remove from whitelist and verify cleaning resumes

4. **Settings Persistence**:
   - Change settings in options page
   - Restart extension/browser
   - Verify settings are preserved

### Test URLs for Manual Testing
```
# Google Analytics tracking
https://example.com?utm_source=newsletter&utm_medium=email&utm_campaign=summer2024&product=widget

# Social media tracking  
https://example.com?fbclid=IwAR1abc123&igshid=xyz789&normal_param=keep

# Multiple tracking sources
https://example.com?gclid=abc123&msclkid=def456&utm_source=google&ref=reddit&product=test

# HubSpot tracking
https://example.com?_hsenc=p2ANqtz&_hsmi=12345&hsCtaTracking=abc&email=user@example.com
```

## Debugging

### Background Script Debugging
1. Open `chrome://extensions/`
2. Find ClearURL extension
3. Click "Inspect views: service worker"
4. Use console to debug background script

### Popup/Options Debugging
1. Open extension popup or options page
2. Right-click and select "Inspect"
3. Debug using standard Chrome DevTools

### Common Issues and Solutions

**Extension not loading tracking rules:**
```javascript
// Check rule status in background script console
chrome.declarativeNetRequest.getEnabledRulesets().then(console.log);
```

**Storage issues:**
```javascript
// Check stored data
chrome.storage.sync.get(null).then(console.log);
```

**Message passing problems:**
```javascript
// Test message handling
chrome.runtime.sendMessage({action: 'getStats'}, response => {
  console.log('Response:', response);
});
```

## Performance Considerations

### Network-Level Processing
- Uses `declarativeNetRequest` API for optimal performance
- Rules processed at network layer, not JavaScript layer
- Zero impact on page loading times

### Memory Management
- Service worker architecture minimizes memory usage
- Cleanup old statistics entries automatically
- Efficient Set operations for whitelist management

### Rule Optimization
- Regex patterns optimized for common cases
- Minimal rule set to reduce processing overhead
- Rules grouped by parameter type for efficiency

## Browser Compatibility

### Chrome/Chromium (Supported)
- Manifest V3 with full `declarativeNetRequest` support
- All features fully functional
- Recommended development browser

### Firefox (Planned)
- Manifest V2 compatibility needed
- Alternative approach for network requests
- Feature parity planned for future release

## Security Best Practices

### Code Security
- No external network requests
- No eval() or unsafe JavaScript practices
- Minimal permissions requested
- Input validation for all user data

### Privacy Protection
- All data stored locally
- No telemetry or analytics
- Transparent operation
- User consent for all data collection

## Contributing Guidelines

### Code Style
- **JavaScript**: ES2022+ features preferred
- **Formatting**: Prettier with project config
- **Linting**: ESLint with recommended rules
- **Comments**: JSDoc style for functions

### Commit Convention
Follow conventional commits:
```
feat: add new tracking parameter support
fix: resolve popup display issue on small screens  
docs: update installation instructions
test: add unit tests for URL cleaning
refactor: optimize statistics storage
```

### Pull Request Process
1. **Fork** the repository
2. **Create** feature branch from main
3. **Implement** changes with tests
4. **Update** documentation
5. **Verify** all checks pass
6. **Submit** PR with detailed description

### Code Review Checklist
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] Performance impact considered
- [ ] Browser compatibility maintained

## Release Process

### Version Management
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Update `manifest.json` and `package.json` versions
- Create git tags for releases
- Maintain CHANGELOG.md

### Build and Package
```bash
# Build production version
npm run build

# Test built extension
npx web-ext run --source-dir=web-ext-artifacts/

# Package for store submission
npx web-ext build
```

### Quality Gates
- All automated tests must pass
- Manual testing completed
- Security audit clean
- Performance benchmarks met
- Documentation up to date

## Getting Help

### Community Resources
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Community Q&A and ideas
- **Wiki**: Detailed documentation and guides

### Development Support
- **Code Review**: Submit PRs for feedback
- **Architecture Questions**: Open discussions
- **Testing Help**: Ask for testing scenarios

### Maintainer Contact
For security issues or sensitive topics, contact maintainers privately through GitHub or email.