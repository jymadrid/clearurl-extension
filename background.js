class ClearURLService {
  constructor() {
    this.stats = {
      totalCleaned: 0,
      parametersRemoved: 0,
      sessionsCleared: 0,
    };
    this.performanceStats = {
      averageProcessingTime: 0,
      totalProcessed: 0,
      memoryUsage: 0,
      lastCleanup: Date.now(),
    };
    this.recentCleanups = [];
    this.whitelist = new Set();
    this.isEnabled = true;

    this.initialize();
  }

  async initialize() {
    await this.loadSettings();
    await this.setupRules();
    this.setupEventListeners();
  }

  async loadSettings() {
    try {
      const data = await chrome.storage.sync.get([
        'stats',
        'whitelist',
        'isEnabled',
        'recentCleanups',
      ]);

      if (data.stats) {
        this.stats = { ...this.stats, ...data.stats };
      }
      if (data.whitelist) {
        this.whitelist = new Set(data.whitelist);
      }
      if (data.isEnabled !== undefined) {
        this.isEnabled = data.isEnabled;
      }
      if (data.recentCleanups) {
        this.recentCleanups = data.recentCleanups;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({
        stats: this.stats,
        whitelist: Array.from(this.whitelist),
        isEnabled: this.isEnabled,
        recentCleanups: this.recentCleanups.slice(-50),
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  async setupRules() {
    if (!this.isEnabled) {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        disableRulesetIds: ['tracking_rules'],
      });
      return;
    }

    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ['tracking_rules'],
    });
  }

  setupEventListeners() {
    chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener((details) => {
      this.handleRuleMatched(details);
    });

    chrome.webNavigation?.onBeforeNavigate?.addListener((details) => {
      if (details.frameId === 0) {
        this.trackNavigation(details);
      }
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true;
    });

    chrome.action.onClicked.addListener((tab) => {
      this.toggleForSite(tab.url);
    });
  }

  async handleRuleMatched(details) {
    if (!this.isEnabled) {
      return;
    }

    const startTime = performance.now();
    const url = new URL(details.request.url);
    const hostname = url.hostname;

    if (this.whitelist.has(hostname)) {
      return;
    }

    const originalParams = url.search;
    const cleanedUrl = this.cleanUrl(details.request.url);

    if (originalParams !== new URL(cleanedUrl).search) {
      this.stats.totalCleaned++;
      this.stats.parametersRemoved += this.countRemovedParameters(
        originalParams,
        new URL(cleanedUrl).search,
      );

      // Update performance stats
      const processingTime = performance.now() - startTime;
      this.updatePerformanceStats(processingTime);

      this.addRecentCleanup(details.request.url, cleanedUrl, hostname);
      await this.saveSettings();
      this.updateBadge();
    }
  }

  cleanUrl(url) {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);

      // Enhanced tracking parameters with regex patterns
      const trackingPatterns = [
        // UTM parameters
        /^utm_/,
        // Google Analytics
        /^_ga/,
        /^_gl/,
        // Click identifiers
        /^gclid$/,
        /^fbclid$/,
        /^msclkid$/,
        /^twclid$/,
        /^dclid$/,
        /^gbraid$/,
        /^wbraid$/,
        // Marketing automation
        /^mtm_/,
        /^hs[a-z_]/,
        /^vero_/,
        /^kenshoo_/,
        // Social media tracking
        /^igshid$/,
        /^rb_clickid$/,
        /^s_cid$/,
        /^ml_subscriber/,
        // General tracking
        /^ref_/,
        /^referrer$/,
        /^source$/,
        /^campaign$/,
        /^click_id$/,
        /^trk$/,
        /^pk_/,
        /^at_/,
        /^ncid$/,
        /^cid$/,
        /^yclid$/,
        // E-commerce tracking
        /^itm_/,
        /^mc_eid$/,
        /^sb_referer_host$/,
        /^mkwid$/,
        /^pcrid$/,
        /^ef_id$/,
        /^s_kwcid$/,
        /^zanpid$/,
        /^awesm$/,
        /^WT\.mc_id$/,
        /^piwik_/,
        /^redirect_mongo_id$/,
        /^ceneo_spo$/,
        /^spm$/,
        /^vn_/,
        /^tracking_source$/,
        /^wickedid$/,
        /^oly_/,
        /^__s$/,
        /^echobox$/,
        /^srsltid$/,
        /^mkt_tok$/,
        /^_openstat$/,
        /^fb_action_/,
        /^gs_l$/,
        /^hmb_/,
        /^otm_/,
        /^cmpid$/,
        /^os_ehash$/,
        /^__twitter_impression$/,
        /^wt_?z?mc/,
        /^wtrid$/,
        /^[a-z]?mc$/,
        /^correlation_id$/,
        /^ref_campaign$/,
        /^ref_source$/,
        /%24deep_link/,
        /%24original_url/,
        /%243p/,
        /^rdt$/,
        /^_branch_match_id$/,
        /^share_id$/,
        /^trackId$/,
        /^tctx$/,
        /^jb[a-z]*?$/,
        // Performance and analytics
        /^echobox$/,
        /^__hstc$/,
        /^__hssc$/,
        /^__hsfp$/,
        /^hsCtaTracking$/,
        /^gad_source$/,
        // Miscellaneous
        /^action_object_type_map$/,
        /^action_ref_map$/,
        /^log_mongo_id$/,
      ];

      // Remove parameters matching patterns
      for (const [key] of params) {
        const shouldRemove = trackingPatterns.some(pattern => {
          if (pattern instanceof RegExp) {
            return pattern.test(key);
          }
          return key === pattern;
        });

        if (shouldRemove) {
          params.delete(key);
        }
      }

      urlObj.search = params.toString();
      return urlObj.toString();
    } catch (error) {
      console.error('Error cleaning URL:', error);
      return url;
    }
  }

  countRemovedParameters(original, cleaned) {
    const originalParams = new URLSearchParams(original);
    const cleanedParams = new URLSearchParams(cleaned);
    return originalParams.size - cleanedParams.size;
  }

  addRecentCleanup(originalUrl, cleanedUrl, hostname) {
    const cleanup = {
      originalUrl,
      cleanedUrl,
      hostname,
      timestamp: Date.now(),
      parametersRemoved: this.countRemovedParameters(
        new URL(originalUrl).search,
        new URL(cleanedUrl).search,
      ),
    };

    this.recentCleanups.unshift(cleanup);
    if (this.recentCleanups.length > 50) {
      this.recentCleanups = this.recentCleanups.slice(0, 50);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.action) {
    case 'getStats':
      sendResponse({
        stats: this.stats,
        performanceStats: this.performanceStats,
        recentCleanups: this.recentCleanups,
        isEnabled: this.isEnabled,
      });
      break;

    case 'toggleEnabled':
      this.isEnabled = !this.isEnabled;
      await this.setupRules();
      await this.saveSettings();
      this.updateBadge();
      sendResponse({ isEnabled: this.isEnabled });
      break;

    case 'addToWhitelist':
      if (message.hostname) {
        this.whitelist.add(message.hostname);
        await this.saveSettings();
      }
      sendResponse({ success: true });
      break;

    case 'removeFromWhitelist':
      if (message.hostname) {
        this.whitelist.delete(message.hostname);
        await this.saveSettings();
      }
      sendResponse({ success: true });
      break;

    case 'getWhitelist':
      sendResponse({ whitelist: Array.from(this.whitelist) });
      break;

    case 'clearStats':
      this.stats = { totalCleaned: 0, parametersRemoved: 0, sessionsCleared: 0 };
      this.performanceStats = {
        averageProcessingTime: 0,
        totalProcessed: 0,
        memoryUsage: 0,
        lastCleanup: Date.now(),
      };
      this.recentCleanups = [];
      await this.saveSettings();
      this.updateBadge();
      sendResponse({ success: true });
      break;
    }
  }

  async toggleForSite(url) {
    try {
      const hostname = new URL(url).hostname;
      if (this.whitelist.has(hostname)) {
        this.whitelist.delete(hostname);
      } else {
        this.whitelist.add(hostname);
      }
      await this.saveSettings();
    } catch (error) {
      console.error('Error toggling site:', error);
    }
  }

  updateBadge() {
    if (!this.isEnabled) {
      chrome.action.setBadgeText({ text: 'OFF' });
      chrome.action.setBadgeBackgroundColor({ color: '#666666' });
      return;
    }

    const todayCleanups = this.recentCleanups.filter(
      (cleanup) => Date.now() - cleanup.timestamp < 24 * 60 * 60 * 1000,
    ).length;

    if (todayCleanups > 0) {
      chrome.action.setBadgeText({ text: todayCleanups.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }

  updatePerformanceStats(processingTime) {
    this.performanceStats.totalProcessed++;
    this.performanceStats.lastCleanup = Date.now();

    // Calculate rolling average
    this.performanceStats.averageProcessingTime =
      (this.performanceStats.averageProcessingTime * (this.performanceStats.totalProcessed - 1) + processingTime) /
      this.performanceStats.totalProcessed;

    // Update memory usage if available
    if (performance.memory) {
      this.performanceStats.memoryUsage = performance.memory.usedJSHeapSize;
    }
  }

  async trackNavigation(details) {
    const startTime = performance.now();
    const url = details.url;
    const cleanedUrl = this.cleanUrl(url);

    if (url !== cleanedUrl) {
      this.stats.sessionsCleared++;

      const processingTime = performance.now() - startTime;
      this.updatePerformanceStats(processingTime);

      await this.saveSettings();
    }
  }
}

const clearURLService = new ClearURLService();

chrome.runtime.onInstalled.addListener(() => {
  console.log('ClearURL Extension installed');
});

chrome.runtime.onStartup.addListener(() => {
  clearURLService.updateBadge();
});
