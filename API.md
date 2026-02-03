# API Documentation

## Extension Architecture

URL Cleaner Extension provides a modular architecture for URL processing and privacy protection.

## Core APIs

### Background Script API

#### URL Cleaning

```javascript
// Main URL cleaning function
function cleanUrl(url, options = {}) {
  // Parameters:
  // - url: String - The URL to clean
  // - options: Object - Configuration options
  //   - preserveHash: Boolean - Keep URL fragments
  //   - customRules: Array - Additional parameters to remove
  // Returns: String - Cleaned URL
}
```

#### Rule Management

```javascript
// Add custom cleaning rule
function addCleaningRule(domain, parameters) {
  // Parameters:
  // - domain: String - Domain to apply rule to
  // - parameters: Array<String> - Parameters to remove
}

// Remove cleaning rule
function removeCleaningRule(domain) {
  // Parameters:
  // - domain: String - Domain to remove rule from
}

// Get all active rules
function getCleaningRules() {
  // Returns: Object - All active cleaning rules
}
```

### Storage API

#### Settings Management

```javascript
// Get extension settings
chrome.storage.sync.get(['settings'], (result) => {
  const settings = result.settings || defaultSettings;
});

// Save extension settings
chrome.storage.sync.set({
  settings: {
    enabled: true,
    showNotifications: false,
    customRules: [],
  },
});
```

#### Statistics API

```javascript
// Get cleaning statistics
chrome.storage.local.get(['stats'], (result) => {
  const stats = result.stats || {
    totalCleaned: 0,
    parametersRemoved: 0,
    sessionsActive: 0,
  };
});
```

### Messaging API

#### Extension Communication

```javascript
// Send message to background script
chrome.runtime.sendMessage(
  {
    action: 'cleanUrl',
    url: 'https://example.com?utm_source=test',
  },
  (response) => {
    console.log('Cleaned URL:', response.cleanedUrl);
  }
);

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'getStats':
      sendResponse(getCurrentStats());
      break;
    case 'updateSettings':
      updateSettings(message.settings);
      sendResponse({ success: true });
      break;
  }
});
```

## Configuration Schema

### Settings Object

```javascript
const settingsSchema = {
  enabled: Boolean, // Extension enabled/disabled
  showNotifications: Boolean, // Show cleaning notifications
  customRules: Array, // User-defined rules
  whitelist: Array, // Exempt domains
  statistics: {
    enabled: Boolean, // Track statistics
    retention: Number, // Days to keep stats
  },
};
```

### Rule Definition

```javascript
const ruleSchema = {
  domain: String, // Target domain
  parameters: Array, // Parameters to remove
  enabled: Boolean, // Rule active status
  description: String, // Human-readable description
};
```

## Event System

### Extension Events

```javascript
// URL cleaned event
chrome.runtime.sendMessage({
  type: 'URL_CLEANED',
  data: {
    originalUrl: 'https://example.com?utm_source=test',
    cleanedUrl: 'https://example.com',
    parametersRemoved: ['utm_source'],
  },
});

// Settings changed event
chrome.runtime.sendMessage({
  type: 'SETTINGS_CHANGED',
  data: {
    oldSettings: previousSettings,
    newSettings: currentSettings,
  },
});
```

## Utility Functions

### URL Processing

```javascript
// Extract parameters from URL
function getUrlParameters(url) {
  const urlObj = new URL(url);
  return Object.fromEntries(urlObj.searchParams);
}

// Check if parameter is tracking parameter
function isTrackingParameter(param) {
  const trackingPatterns = [
    /^utm_/, // Google Analytics
    /^fbclid/, // Facebook
    /^gclid/, // Google Ads
    /^ref/, // General referral
  ];

  return trackingPatterns.some((pattern) => pattern.test(param));
}

// Validate URL format
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

### Data Management

```javascript
// Export extension data
function exportSettings() {
  return chrome.storage.sync.get(null).then((data) => {
    return JSON.stringify(
      {
        ...data,
        exportDate: new Date().toISOString(),
        version: chrome.runtime.getManifest().version,
      },
      null,
      2
    );
  });
}

// Import extension data
function importSettings(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    // Validate and sanitize data
    return chrome.storage.sync.set(data);
  } catch (error) {
    throw new Error('Invalid import data format');
  }
}
```

## Error Handling

### Error Types

```javascript
class UrlCleaningError extends Error {
  constructor(message, url) {
    super(message);
    this.name = 'UrlCleaningError';
    this.url = url;
  }
}

class StorageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StorageError';
  }
}
```

### Error Recovery

```javascript
function safeCleanUrl(url) {
  try {
    return cleanUrl(url);
  } catch (error) {
    console.error('URL cleaning failed:', error);
    // Return original URL as fallback
    return url;
  }
}
```

## Performance Considerations

### Optimization Strategies

```javascript
// Cache compiled regex patterns
const parameterPatterns = new Map();

function getParameterPattern(param) {
  if (!parameterPatterns.has(param)) {
    parameterPatterns.set(param, new RegExp(`[?&]${param}=[^&]*`, 'gi'));
  }
  return parameterPatterns.get(param);
}

// Batch process multiple URLs
function cleanUrlsBatch(urls) {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise((resolve) => {
          setTimeout(() => resolve(cleanUrl(url)), 0);
        })
    )
  );
}
```

## Browser Compatibility

### Feature Support Matrix

| Feature            | Chrome | Firefox | Edge | Safari |
| ------------------ | ------ | ------- | ---- | ------ |
| Core Cleaning      | ✅     | ✅      | ✅   | ❌     |
| Background Scripts | ✅     | ✅      | ✅   | ❌     |
| Storage Sync       | ✅     | ✅      | ✅   | ❌     |
| Import/Export      | ✅     | ✅      | ✅   | ❌     |

### Compatibility Checks

```javascript
// Check for required APIs
function checkBrowserSupport() {
  const requiredAPIs = ['chrome.runtime', 'chrome.storage', 'chrome.tabs'];

  return requiredAPIs.every(
    (api) =>
      typeof chrome !== 'undefined' &&
      api.split('.').reduce((obj, prop) => obj && obj[prop], window)
  );
}
```

## Testing API

### Mock Objects

```javascript
// Mock Chrome APIs for testing
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
    },
  },
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
};
```

### Test Utilities

```javascript
// Create test URL with tracking parameters
function createTestUrl(base, params) {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
}

// Verify URL cleaning
function expectUrlCleaned(original, expected) {
  const cleaned = cleanUrl(original);
  expect(cleaned).toBe(expected);
}
```

## Extension Lifecycle

### Installation

```javascript
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Initialize default settings
    initializeDefaultSettings();
  } else if (details.reason === 'update') {
    // Handle extension updates
    handleExtensionUpdate(details.previousVersion);
  }
});
```

### Uninstallation

```javascript
chrome.runtime.setUninstallURL('https://example.com/feedback');

// Cleanup before uninstall
chrome.runtime.onSuspend.addListener(() => {
  // Perform cleanup operations
  cleanupResources();
});
```

For more detailed examples and advanced usage patterns, see the [EXAMPLES.md](./EXAMPLES.md) file.
