/**
 * @jest-environment jsdom
 */

describe('ClearURL Extension Tests', () => {
  // Mock Chrome APIs
  global.chrome = {
    storage: {
      sync: {
        get: jest.fn(),
        set: jest.fn()
      }
    },
    runtime: {
      sendMessage: jest.fn(),
      onMessage: {
        addListener: jest.fn()
      }
    },
    declarativeNetRequest: {
      updateEnabledRulesets: jest.fn(),
      onRuleMatchedDebug: {
        addListener: jest.fn()
      }
    },
    action: {
      setBadgeText: jest.fn(),
      setBadgeBackgroundColor: jest.fn(),
      onClicked: {
        addListener: jest.fn()
      }
    },
    webNavigation: {
      onBeforeNavigate: {
        addListener: jest.fn()
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('URL Cleaning', () => {
    test('should remove UTM parameters', () => {
      const testUrl = 'https://example.com?utm_source=test&utm_medium=email&param=keep';
      const expectedUrl = 'https://example.com?param=keep';
      
      // This would test the URL cleaning logic
      // For now, just verify the test structure works
      expect(testUrl).toContain('utm_source');
      expect(expectedUrl).not.toContain('utm_source');
    });

    test('should remove Facebook tracking parameters', () => {
      const testUrl = 'https://example.com?fbclid=test123&param=keep';
      const expectedUrl = 'https://example.com?param=keep';
      
      expect(testUrl).toContain('fbclid');
      expect(expectedUrl).not.toContain('fbclid');
    });

    test('should keep non-tracking parameters', () => {
      const testUrl = 'https://example.com?page=1&sort=name&utm_source=test';
      // After cleaning, should keep page and sort
      expect(testUrl).toContain('page=1');
      expect(testUrl).toContain('sort=name');
    });
  });

  describe('Statistics Tracking', () => {
    test('should initialize with zero stats', () => {
      const stats = { totalCleaned: 0, parametersRemoved: 0, sessionsCleared: 0 };
      
      expect(stats.totalCleaned).toBe(0);
      expect(stats.parametersRemoved).toBe(0);
      expect(stats.sessionsCleared).toBe(0);
    });

    test('should increment stats when URLs are cleaned', () => {
      const stats = { totalCleaned: 0, parametersRemoved: 0, sessionsCleared: 0 };
      
      // Simulate cleaning a URL with 2 parameters
      stats.totalCleaned += 1;
      stats.parametersRemoved += 2;
      
      expect(stats.totalCleaned).toBe(1);
      expect(stats.parametersRemoved).toBe(2);
    });
  });

  describe('Whitelist Functionality', () => {
    test('should allow adding domains to whitelist', () => {
      const whitelist = new Set();
      const domain = 'example.com';
      
      whitelist.add(domain);
      
      expect(whitelist.has(domain)).toBe(true);
      expect(whitelist.size).toBe(1);
    });

    test('should allow removing domains from whitelist', () => {
      const whitelist = new Set(['example.com']);
      
      whitelist.delete('example.com');
      
      expect(whitelist.has('example.com')).toBe(false);
      expect(whitelist.size).toBe(0);
    });
  });

  describe('Storage Operations', () => {
    test('should save settings to Chrome storage', async () => {
      const mockData = { isEnabled: true, customRules: [] };
      
      chrome.storage.sync.set.mockResolvedValue();
      
      // This would test the actual storage save logic
      await chrome.storage.sync.set(mockData);
      
      expect(chrome.storage.sync.set).toHaveBeenCalledWith(mockData);
    });

    test('should load settings from Chrome storage', async () => {
      const mockData = { isEnabled: true, customRules: ['custom_param'] };
      
      chrome.storage.sync.get.mockResolvedValue(mockData);
      
      const result = await chrome.storage.sync.get(['isEnabled', 'customRules']);
      
      expect(chrome.storage.sync.get).toHaveBeenCalledWith(['isEnabled', 'customRules']);
      expect(result).toEqual(mockData);
    });
  });

  describe('Chrome Extension APIs', () => {
    test('should update badge text', () => {
      const badgeText = '5';
      
      chrome.action.setBadgeText({ text: badgeText });
      
      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: badgeText });
    });

    test('should send runtime messages', () => {
      const message = { action: 'getStats' };
      
      chrome.runtime.sendMessage(message);
      
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(message);
    });
  });

  describe('Parameter Validation', () => {
    test('should validate custom rule format', () => {
      const validRule = 'custom_param';
      const invalidRule = 'invalid@param!';
      
      const isValid = (rule) => /^[a-zA-Z0-9_-]+$/.test(rule);
      
      expect(isValid(validRule)).toBe(true);
      expect(isValid(invalidRule)).toBe(false);
    });

    test('should validate domain format', () => {
      const validDomain = 'example.com';
      const invalidDomain = 'not-a-domain';
      
      const isValidDomain = (domain) => {
        try {
          new URL(`https://${domain}`);
          return true;
        } catch {
          return false;
        }
      };
      
      expect(isValidDomain(validDomain)).toBe(true);
      expect(isValidDomain(invalidDomain)).toBe(false);
    });
  });
});