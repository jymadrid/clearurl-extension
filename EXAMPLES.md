# Usage Examples

This document provides practical examples of how to use and extend the URL Cleaner Extension.

## Basic Usage Examples

### Example 1: Common Tracking Parameters

```javascript
// Original URLs with tracking
const trackedUrls = [
  'https://shop.example.com/product?utm_source=google&utm_medium=cpc&utm_campaign=summer&id=123',
  'https://news.site.com/article?fbclid=IwAR1abc123&utm_source=facebook',
  'https://blog.example.com/post?gclid=abc123&ref=twitter&utm_content=promoted',
];

// After cleaning
const cleanedUrls = [
  'https://shop.example.com/product?id=123',
  'https://news.site.com/article',
  'https://blog.example.com/post',
];
```

### Example 2: Real-World Scenarios

#### E-commerce URLs

```javascript
// Amazon product URL
const original =
  'https://amazon.com/product/dp/B08N5WRWNW?tag=affiliate&ref_=sr_1_1&crid=ABC123&keywords=headphones&qid=1234567890&sprefix=head%2Caps%2C123&sr=8-1';
const cleaned = 'https://amazon.com/product/dp/B08N5WRWNW?keywords=headphones';

// eBay listing URL
const originalEbay =
  'https://ebay.com/itm/123456789?hash=item1234&_trkparms=pageci%3A123%2Cparent%3A456&_trksid=p2047675.c100005.m1851';
const cleanedEbay = 'https://ebay.com/itm/123456789';
```

#### Social Media Links

```javascript
// Facebook shared link
const fbOriginal =
  'https://example.com/article?fbclid=IwAR0abc123def456ghi789&utm_source=facebook&utm_medium=social';
const fbCleaned = 'https://example.com/article';

// Twitter shared link
const twitterOriginal =
  'https://example.com/page?utm_source=twitter&utm_medium=social&utm_campaign=organic&ref=twitter';
const twitterCleaned = 'https://example.com/page';
```

## Configuration Examples

### Custom Domain Rules

```javascript
// Define custom rules for your organization
const companyRules = {
  'company.com': {
    parameters: ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'campaign_id'],
    description: 'Company website tracking parameters',
    enabled: true,
  },
  'blog.company.com': {
    parameters: ['utm_source', 'utm_medium', 'author_ref', 'share_id'],
    description: 'Company blog tracking',
    enabled: true,
  },
};

// Apply rules to extension
Object.entries(companyRules).forEach(([domain, rule]) => {
  chrome.storage.sync.set({
    [`rule_${domain}`]: rule,
  });
});
```

### Whitelist Configuration

```javascript
// Sites that need specific parameters preserved
const whitelist = [
  {
    domain: 'internal-app.company.com',
    reason: 'Authentication parameters required',
    preservedParams: ['token', 'session_id', 'redirect'],
  },
  {
    domain: 'analytics.company.com',
    reason: 'Analytics dashboard parameters',
    preservedParams: ['dashboard_id', 'date_range', 'filter'],
  },
];

// Add to extension whitelist
whitelist.forEach((entry) => {
  chrome.runtime.sendMessage({
    action: 'addToWhitelist',
    domain: entry.domain,
    preservedParams: entry.preservedParams,
  });
});
```

## Advanced Usage

### Bulk URL Processing

```javascript
// Process multiple URLs efficiently
async function processBulkUrls(urls) {
  const results = [];

  for (const url of urls) {
    try {
      const cleaned = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          {
            action: 'cleanUrl',
            url: url,
          },
          (response) => resolve(response.cleanedUrl)
        );
      });

      results.push({
        original: url,
        cleaned: cleaned,
        parametersRemoved: getParameterDifference(url, cleaned),
      });
    } catch (error) {
      results.push({
        original: url,
        error: error.message,
      });
    }
  }

  return results;
}

function getParameterDifference(original, cleaned) {
  const originalParams = new URL(original).searchParams;
  const cleanedParams = new URL(cleaned).searchParams;
  const removed = [];

  for (const [key, value] of originalParams) {
    if (!cleanedParams.has(key)) {
      removed.push(`${key}=${value}`);
    }
  }

  return removed;
}
```

### Custom Parameter Detection

```javascript
// Analyze URLs to suggest new cleaning rules
function analyzeUrlsForTracking(urls) {
  const parameterFrequency = new Map();
  const suspiciousPatterns = [
    /^utm_/, // Google Analytics
    /^fb/, // Facebook
    /^gclid/, // Google Click ID
    /campaign/, // Campaign tracking
    /source/, // Source tracking
    /medium/, // Medium tracking
    /ref/, // Referral tracking
    /track/, // General tracking
    /click/, // Click tracking
    /_id$/, // ID parameters
  ];

  urls.forEach((url) => {
    try {
      const urlObj = new URL(url);
      for (const [param, value] of urlObj.searchParams) {
        if (suspiciousPatterns.some((pattern) => pattern.test(param))) {
          parameterFrequency.set(param, (parameterFrequency.get(param) || 0) + 1);
        }
      }
    } catch (error) {
      console.warn('Invalid URL:', url);
    }
  });

  // Return parameters that appear frequently
  return Array.from(parameterFrequency.entries())
    .filter(([param, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .map(([param, count]) => ({ parameter: param, frequency: count }));
}
```

## Integration Examples

### Website Integration

```javascript
// Add URL cleaning to your website
class URLCleaner {
  constructor() {
    this.trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'msclkid',
      'ref',
      'source',
    ];
  }

  cleanUrl(url) {
    try {
      const urlObj = new URL(url);
      this.trackingParams.forEach((param) => {
        urlObj.searchParams.delete(param);
      });
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  cleanCurrentPage() {
    const cleanUrl = this.cleanUrl(window.location.href);
    if (cleanUrl !== window.location.href) {
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }
}

// Usage
const cleaner = new URLCleaner();
cleaner.cleanCurrentPage();
```

### Node.js Integration

```javascript
// Use cleaning logic in Node.js applications
const { URL } = require('url');

class ServerSideURLCleaner {
  constructor() {
    this.rules = {
      default: [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'fbclid',
        'gclid',
        'msclkid',
        'twclid',
        'ref',
        'source',
      ],
    };
  }

  addRule(domain, parameters) {
    this.rules[domain] = parameters;
  }

  cleanUrl(url) {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const params = this.rules[domain] || this.rules.default;

      params.forEach((param) => {
        urlObj.searchParams.delete(param);
      });

      return urlObj.toString();
    } catch (error) {
      console.error('URL cleaning failed:', error);
      return url;
    }
  }
}

// Express.js middleware example
function urlCleaningMiddleware(req, res, next) {
  const cleaner = new ServerSideURLCleaner();
  req.cleanedUrl = cleaner.cleanUrl(req.originalUrl);
  next();
}
```

## Testing Examples

### Unit Testing

```javascript
describe('URL Cleaning', () => {
  const cleaner = new URLCleaner();

  test('removes Google Analytics parameters', () => {
    const original = 'https://example.com/page?utm_source=google&utm_medium=cpc&product_id=123';
    const expected = 'https://example.com/page?product_id=123';
    expect(cleaner.cleanUrl(original)).toBe(expected);
  });

  test('removes Facebook tracking', () => {
    const original = 'https://example.com/article?fbclid=IwAR1abc123&category=news';
    const expected = 'https://example.com/article?category=news';
    expect(cleaner.cleanUrl(original)).toBe(expected);
  });

  test('preserves functional parameters', () => {
    const original = 'https://shop.example.com/search?q=shoes&page=2&utm_source=email';
    const expected = 'https://shop.example.com/search?q=shoes&page=2';
    expect(cleaner.cleanUrl(original)).toBe(expected);
  });

  test('handles URLs without parameters', () => {
    const url = 'https://example.com/page';
    expect(cleaner.cleanUrl(url)).toBe(url);
  });

  test('handles malformed URLs gracefully', () => {
    const malformedUrl = 'not-a-valid-url';
    expect(cleaner.cleanUrl(malformedUrl)).toBe(malformedUrl);
  });
});
```

### Integration Testing

```javascript
describe('Extension Integration', () => {
  beforeEach(() => {
    // Mock Chrome APIs
    global.chrome = {
      runtime: {
        sendMessage: jest.fn(),
        onMessage: {
          addListener: jest.fn(),
        },
      },
      storage: {
        sync: {
          get: jest.fn().mockResolvedValue({}),
          set: jest.fn().mockResolvedValue(),
        },
      },
    };
  });

  test('processes extension messages correctly', async () => {
    const mockResponse = { cleanedUrl: 'https://example.com/clean' };
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      callback(mockResponse);
    });

    const result = await new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          action: 'cleanUrl',
          url: 'https://example.com/dirty?utm_source=test',
        },
        resolve
      );
    });

    expect(result.cleanedUrl).toBe('https://example.com/clean');
  });
});
```

## Performance Examples

### Efficient Batch Processing

```javascript
class BatchURLProcessor {
  constructor(batchSize = 100) {
    this.batchSize = batchSize;
    this.queue = [];
    this.processing = false;
  }

  async processUrls(urls) {
    // Split into batches to avoid blocking
    const batches = [];
    for (let i = 0; i < urls.length; i += this.batchSize) {
      batches.push(urls.slice(i, i + this.batchSize));
    }

    const results = [];
    for (const batch of batches) {
      const batchResults = await this.processBatch(batch);
      results.push(...batchResults);

      // Allow other operations between batches
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return results;
  }

  async processBatch(urls) {
    return Promise.all(urls.map((url) => this.cleanUrlWithFallback(url)));
  }

  async cleanUrlWithFallback(url) {
    try {
      return await this.cleanUrl(url);
    } catch (error) {
      console.warn(`Failed to clean URL: ${url}`, error);
      return url; // Return original on failure
    }
  }
}
```

### Memory-Efficient Processing

```javascript
// Process URLs with minimal memory footprint
function* processUrlsGenerator(urls) {
  for (const url of urls) {
    try {
      yield {
        original: url,
        cleaned: cleanUrl(url),
        status: 'success',
      };
    } catch (error) {
      yield {
        original: url,
        error: error.message,
        status: 'error',
      };
    }
  }
}

// Usage
const urlProcessor = processUrlsGenerator(largeUrlList);
for (const result of urlProcessor) {
  console.log(result);
  // Process one result at a time without loading all into memory
}
```

## Real-World Use Cases

### Content Management System

```javascript
// WordPress plugin example
function cleanUrlsInContent(content) {
  const urlRegex = /https?:\/\/[^\s<>"']+/g;

  return content.replace(urlRegex, (url) => {
    try {
      return cleanUrl(url);
    } catch {
      return url; // Keep original if cleaning fails
    }
  });
}

// Usage in WordPress
add_filter('the_content', function (content) {
  return cleanUrlsInContent(content);
});
```

### Email Processing

```javascript
// Clean URLs in email templates
function cleanEmailUrls(emailHtml) {
  const $ = require('cheerio');
  const email = $.load(emailHtml);

  email('a[href]').each(function () {
    const $link = $(this);
    const originalHref = $link.attr('href');
    const cleanedHref = cleanUrl(originalHref);

    if (cleanedHref !== originalHref) {
      $link.attr('href', cleanedHref);
      $link.attr('data-original-url', originalHref); // Keep for reference
    }
  });

  return email.html();
}
```

### Analytics Integration

```javascript
// Track cleaning effectiveness
class CleaningAnalytics {
  constructor() {
    this.stats = {
      totalProcessed: 0,
      totalCleaned: 0,
      parametersCleaned: new Map(),
      domainStats: new Map(),
    };
  }

  recordCleaning(original, cleaned) {
    this.stats.totalProcessed++;

    if (original !== cleaned) {
      this.stats.totalCleaned++;

      const originalUrl = new URL(original);
      const cleanedUrl = new URL(cleaned);
      const domain = originalUrl.hostname;

      // Track domain stats
      const domainStat = this.stats.domainStats.get(domain) || { processed: 0, cleaned: 0 };
      domainStat.processed++;
      domainStat.cleaned++;
      this.stats.domainStats.set(domain, domainStat);

      // Track parameter removal
      for (const [param] of originalUrl.searchParams) {
        if (!cleanedUrl.searchParams.has(param)) {
          this.stats.parametersCleaned.set(
            param,
            (this.stats.parametersCleaned.get(param) || 0) + 1
          );
        }
      }
    }
  }

  getReport() {
    return {
      summary: {
        totalProcessed: this.stats.totalProcessed,
        totalCleaned: this.stats.totalCleaned,
        cleaningRate: this.stats.totalCleaned / this.stats.totalProcessed,
      },
      topParameters: Array.from(this.stats.parametersCleaned.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      topDomains: Array.from(this.stats.domainStats.entries())
        .sort((a, b) => b[1].cleaned - a[1].cleaned)
        .slice(0, 10),
    };
  }
}
```

These examples demonstrate the flexibility and power of the URL Cleaner Extension. You can adapt these patterns to your specific use cases and requirements.
