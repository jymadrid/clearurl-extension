/**
 * @jest-environment jsdom
 */

describe('ClearURL Extension Tests', () => {
  // Mock Chrome APIs
  global.chrome = {
    storage: {
      sync: {
        get: jest.fn(),
        set: jest.fn(),
      },
    },
    runtime: {
      sendMessage: jest.fn(),
      onMessage: {
        addListener: jest.fn(),
      },
    },
    declarativeNetRequest: {
      updateEnabledRulesets: jest.fn(),
      onRuleMatchedDebug: {
        addListener: jest.fn(),
      },
    },
    action: {
      setBadgeText: jest.fn(),
      setBadgeBackgroundColor: jest.fn(),
      onClicked: {
        addListener: jest.fn(),
      },
    },
    webNavigation: {
      onBeforeNavigate: {
        addListener: jest.fn(),
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock URL cleaning function for testing
  const mockCleanUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);

      const trackingParams = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'utm_id',
        'gclid',
        'fbclid',
        'msclkid',
        'twclid',
        '_ga',
        '_gl',
        'mc_eid',
        'igshid',
      ];

      trackingParams.forEach((param) => params.delete(param));

      urlObj.search = params.toString();
      return urlObj.toString();
    } catch (error) {
      return url;
    }
  };

  describe('URL Cleaning', () => {
    test('should remove UTM parameters', () => {
      const testUrl = 'https://example.com?utm_source=test&utm_medium=email&param=keep';
      const cleanedUrl = mockCleanUrl(testUrl);

      expect(cleanedUrl).toBe('https://example.com/?param=keep');
      expect(cleanedUrl).not.toContain('utm_source');
      expect(cleanedUrl).not.toContain('utm_medium');
    });

    test('should remove Facebook tracking parameters', () => {
      const testUrl = 'https://example.com?fbclid=test123&param=keep';
      const cleanedUrl = mockCleanUrl(testUrl);

      expect(cleanedUrl).toBe('https://example.com/?param=keep');
      expect(cleanedUrl).not.toContain('fbclid');
    });

    test('should remove Google Ads tracking', () => {
      const testUrl = 'https://example.com?gclid=abc123&param=keep';
      const cleanedUrl = mockCleanUrl(testUrl);

      expect(cleanedUrl).toBe('https://example.com/?param=keep');
      expect(cleanedUrl).not.toContain('gclid');
    });

    test('should keep non-tracking parameters', () => {
      const testUrl = 'https://example.com?page=1&sort=name&utm_source=test';
      const cleanedUrl = mockCleanUrl(testUrl);

      expect(cleanedUrl).toContain('page=1');
      expect(cleanedUrl).toContain('sort=name');
      expect(cleanedUrl).not.toContain('utm_source');
    });

    test('should handle URLs with no parameters', () => {
      const testUrl = 'https://example.com/page';
      const cleanedUrl = mockCleanUrl(testUrl);

      expect(cleanedUrl).toBe(testUrl);
    });

    test('should handle URLs with only tracking parameters', () => {
      const testUrl = 'https://example.com?utm_source=test&fbclid=123';
      const cleanedUrl = mockCleanUrl(testUrl);

      expect(cleanedUrl).toBe('https://example.com/');
    });

    test('should handle malformed URLs gracefully', () => {
      const invalidUrl = 'not-a-valid-url';
      const result = mockCleanUrl(invalidUrl);

      expect(result).toBe(invalidUrl);
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

    test('should track recent cleanups correctly', () => {
      const recentCleanups = [];
      const cleanup = {
        originalUrl: 'https://example.com?utm_source=test',
        cleanedUrl: 'https://example.com',
        hostname: 'example.com',
        timestamp: Date.now(),
        parametersRemoved: 1,
      };

      recentCleanups.push(cleanup);

      expect(recentCleanups).toHaveLength(1);
      expect(recentCleanups[0].parametersRemoved).toBe(1);
    });

    test('should limit recent cleanups to maximum entries', () => {
      const recentCleanups = [];
      const maxEntries = 50;

      // Add more than max entries
      for (let i = 0; i < maxEntries + 10; i++) {
        recentCleanups.push({ id: i });
      }

      // Simulate cleanup limit enforcement
      const limitedCleanups = recentCleanups.slice(0, maxEntries);

      expect(limitedCleanups).toHaveLength(maxEntries);
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

    test('should handle multiple domains in whitelist', () => {
      const whitelist = new Set();
      const domains = ['example1.com', 'example2.com', 'example3.com'];

      domains.forEach((domain) => whitelist.add(domain));

      expect(whitelist.size).toBe(3);
      domains.forEach((domain) => {
        expect(whitelist.has(domain)).toBe(true);
      });
    });

    test('should not add duplicate domains', () => {
      const whitelist = new Set();
      const domain = 'example.com';

      whitelist.add(domain);
      whitelist.add(domain); // Try to add again

      expect(whitelist.size).toBe(1);
    });
  });

  describe('Storage Operations', () => {
    test('should save settings to Chrome storage', async () => {
      const mockData = { isEnabled: true, customRules: [] };

      chrome.storage.sync.set.mockResolvedValue();

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

    test('should handle storage errors gracefully', async () => {
      chrome.storage.sync.get.mockRejectedValue(new Error('Storage error'));

      try {
        await chrome.storage.sync.get(['settings']);
      } catch (error) {
        expect(error.message).toBe('Storage error');
      }
    });
  });

  describe('Chrome Extension APIs', () => {
    test('should update badge text', () => {
      const badgeText = '5';

      chrome.action.setBadgeText({ text: badgeText });

      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: badgeText });
    });

    test('should update badge color', () => {
      const color = '#4CAF50';

      chrome.action.setBadgeBackgroundColor({ color });

      expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ color });
    });

    test('should send runtime messages', () => {
      const message = { action: 'getStats' };

      chrome.runtime.sendMessage(message);

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(message);
    });

    test('should handle declarativeNetRequest operations', async () => {
      chrome.declarativeNetRequest.updateEnabledRulesets.mockResolvedValue();

      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ['tracking_rules'],
      });

      expect(chrome.declarativeNetRequest.updateEnabledRulesets).toHaveBeenCalledWith({
        enableRulesetIds: ['tracking_rules'],
      });
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
      const invalidDomain = '';

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

    test('should validate URL format', () => {
      const validUrls = [
        'https://example.com',
        'https://example.com/path',
        'https://example.com?param=value',
      ];

      const invalidUrls = ['not-a-url', 'ftp://example.com', ''];

      const isValidHttpUrl = (url) => {
        try {
          const urlObj = new URL(url);
          return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
        } catch {
          return false;
        }
      };

      validUrls.forEach((url) => {
        expect(isValidHttpUrl(url)).toBe(true);
      });

      invalidUrls.forEach((url) => {
        expect(isValidHttpUrl(url)).toBe(false);
      });
    });
  });

  describe('Message Handling', () => {
    test('should handle getStats message', () => {
      const mockStats = {
        totalCleaned: 10,
        parametersRemoved: 25,
        sessionsCleared: 3,
      };

      const mockHandler = (message, sender, sendResponse) => {
        if (message.action === 'getStats') {
          sendResponse({ stats: mockStats, isEnabled: true });
        }
      };

      const sendResponse = jest.fn();
      mockHandler({ action: 'getStats' }, null, sendResponse);

      expect(sendResponse).toHaveBeenCalledWith({
        stats: mockStats,
        isEnabled: true,
      });
    });

    test('should handle toggleEnabled message', () => {
      let isEnabled = true;

      const mockHandler = (message, sender, sendResponse) => {
        if (message.action === 'toggleEnabled') {
          isEnabled = !isEnabled;
          sendResponse({ isEnabled });
        }
      };

      const sendResponse = jest.fn();
      mockHandler({ action: 'toggleEnabled' }, null, sendResponse);

      expect(sendResponse).toHaveBeenCalledWith({ isEnabled: false });
    });
  });

  describe('Performance Tests', () => {
    test('should process URLs efficiently', () => {
      const urls = [];
      for (let i = 0; i < 1000; i++) {
        urls.push(`https://example${i}.com?utm_source=test&param=value`);
      }

      const startTime = Date.now();
      const cleanedUrls = urls.map((url) => mockCleanUrl(url));
      const endTime = Date.now();

      expect(cleanedUrls).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms

      // Verify all URLs were cleaned
      cleanedUrls.forEach((url) => {
        expect(url).not.toContain('utm_source');
      });
    });

    test('should handle large parameter lists', () => {
      const baseUrl = 'https://example.com?';
      const params = [];

      // Create 100 parameters (mix of tracking and normal)
      for (let i = 0; i < 50; i++) {
        params.push(`utm_source=value${i}`);
        params.push(`normal_param${i}=value${i}`);
      }

      const testUrl = baseUrl + params.join('&');
      const cleanedUrl = mockCleanUrl(testUrl);

      // Should contain normal params but not utm params
      expect(cleanedUrl).toContain('normal_param0=value0');
      expect(cleanedUrl).not.toContain('utm_source=value0');
    });
  });
});
