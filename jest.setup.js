// Jest setup file for URL Cleaner Extension tests

// Mock Chrome APIs
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    },
    getManifest: jest.fn(() => ({
      version: '1.0.0',
      name: 'URL Cleaner Extension'
    }))
  },
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    },
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  tabs: {
    query: jest.fn(),
    update: jest.fn(),
    onUpdated: {
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
  declarativeNetRequest: {
    updateEnabledRulesets: jest.fn(),
    onRuleMatchedDebug: {
      addListener: jest.fn()
    }
  },
  webNavigation: {
    onBeforeNavigate: {
      addListener: jest.fn()
    }
  }
};

// Mock URL constructor for older environments
if (!global.URL) {
  global.URL = class URL {
    constructor(url, base) {
      if (base) {
        this.href = new URL(base).origin + '/' + url;
      } else {
        this.href = url;
      }
      
      const match = this.href.match(/^(https?:)\/\/([^\/\?#]+)([^?#]*)(\?[^#]*)?(#.*)?$/);
      if (!match) {
        throw new Error('Invalid URL');
      }
      
      this.protocol = match[1];
      this.hostname = match[2];
      this.pathname = match[3] || '/';
      this.search = match[4] || '';
      this.hash = match[5] || '';
      this.origin = this.protocol + '//' + this.hostname;
      
      this.searchParams = new URLSearchParams(this.search);
    }
    
    toString() {
      return this.href;
    }
  };
}

// Mock URLSearchParams if not available
if (!global.URLSearchParams) {
  global.URLSearchParams = class URLSearchParams {
    constructor(search = '') {
      this.params = new Map();
      if (search.startsWith('?')) {
        search = search.slice(1);
      }
      
      if (search) {
        search.split('&').forEach(param => {
          const [key, value] = param.split('=');
          if (key) {
            this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''));
          }
        });
      }
    }
    
    get(name) {
      return this.params.get(name);
    }
    
    set(name, value) {
      this.params.set(name, value);
    }
    
    has(name) {
      return this.params.has(name);
    }
    
    delete(name) {
      this.params.delete(name);
    }
    
    append(name, value) {
      this.params.set(name, value);
    }
    
    toString() {
      const params = [];
      for (const [key, value] of this.params) {
        params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
      return params.join('&');
    }
    
    *[Symbol.iterator]() {
      for (const [key, value] of this.params) {
        yield [key, value];
      }
    }
  };
}

// Setup console methods for testing
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});