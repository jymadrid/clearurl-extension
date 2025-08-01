# Development Guide

## Setup Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/jymadrid/clearurl-extension.git
   cd clearurl-extension
   ```

2. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project directory

## Project Structure

```
clearurl-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker with core logic
├── popup.html/js/css      # Extension popup interface
├── options.html/js/css    # Settings page
├── rules.json            # URL cleaning rules
├── icons/                # Extension icons
└── docs/                 # Documentation
```

## Key Components

### Background Service Worker
- Manages declarativeNetRequest rules
- Handles statistics and storage
- Provides messaging API for UI components

### Popup Interface
- Shows real-time statistics
- Displays recent cleaning activity
- Quick access to settings

### Options Page
- Comprehensive settings management
- Rule configuration
- Whitelist management
- Statistics and export

## Testing

### Manual Testing
1. Install the extension in developer mode
2. Visit websites with tracking parameters
3. Verify parameters are removed
4. Check statistics update correctly
5. Test whitelist functionality

### Test URLs
Use these URLs to test the extension:
- `https://example.com?utm_source=test&utm_medium=email&utm_campaign=newsletter`
- `https://example.com?fbclid=test123&gclid=test456`
- `https://example.com?ref=reddit&source=google`

## Debugging

### Background Script
- Open `chrome://extensions/`
- Click "Inspect views: background page"
- Check console for errors

### Popup/Options
- Right-click the extension popup
- Select "Inspect"
- Debug in DevTools

## Building for Production

1. Update version in `manifest.json`
2. Test thoroughly in multiple browsers
3. Validate all functionality
4. Create ZIP archive for store submission

## Contributing Guidelines

### Code Style
- Use ES6+ features
- Follow consistent indentation (2 spaces)
- Add comments for complex logic
- Use meaningful variable names

### Commit Messages
- Use conventional commit format
- Examples:
  - `feat: add custom rule support`
  - `fix: resolve popup display issue`
  - `docs: update README installation guide`

### Pull Requests
1. Create feature branch from main
2. Make changes with tests
3. Update documentation
4. Submit PR with detailed description