class ClearURLService {
  constructor() {
    this.stats = {
      totalCleaned: 0,
      parametersRemoved: 0,
      sessionsCleared: 0
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
      const data = await chrome.storage.sync.get(['stats', 'whitelist', 'isEnabled', 'recentCleanups']);
      
      if (data.stats) this.stats = { ...this.stats, ...data.stats };
      if (data.whitelist) this.whitelist = new Set(data.whitelist);
      if (data.isEnabled !== undefined) this.isEnabled = data.isEnabled;
      if (data.recentCleanups) this.recentCleanups = data.recentCleanups;
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
        recentCleanups: this.recentCleanups.slice(-50)
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  async setupRules() {
    if (!this.isEnabled) {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        disableRulesetIds: ['tracking_rules']
      });
      return;
    }

    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ['tracking_rules']
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
    if (!this.isEnabled) return;

    const url = new URL(details.request.url);
    const hostname = url.hostname;

    if (this.whitelist.has(hostname)) return;

    const originalParams = url.search;
    const cleanedUrl = this.cleanUrl(details.request.url);
    
    if (originalParams !== new URL(cleanedUrl).search) {
      this.stats.totalCleaned++;
      this.stats.parametersRemoved += this.countRemovedParameters(originalParams, new URL(cleanedUrl).search);
      
      this.addRecentCleanup(details.request.url, cleanedUrl, hostname);
      await this.saveSettings();
      this.updateBadge();
    }
  }

  cleanUrl(url) {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      
      const trackingParams = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
        'gclid', 'fbclid', 'msclkid', 'twclid', '_ga', '_gl', 'mc_eid', 'igshid',
        'ref_', 'referrer', 'source', 'campaign', 'click_id', 'trk', 'pk_campaign',
        'pk_kwd', 'pk_source', 'pk_medium', 'pk_content', 'mtm_source', 'mtm_medium',
        'mtm_campaign', 'mtm_keyword', 'mtm_content', 'at_medium', 'at_campaign',
        'ncid', 'cid', 'yclid', '_hsenc', '_hsmi', 'hsCtaTracking', 'hsa_acc',
        'hsa_ad', 'hsa_cam', 'hsa_grp', 'hsa_kw', 'hsa_mt', 'hsa_net', 'hsa_src',
        'hsa_tgt', 'hsa_ver', 'vero_conv', 'vero_id', 'wickedid', 'oly_anon_id',
        'oly_enc_id', '__s', 'rb_clickid', 's_cid', 'ml_subscriber', 'ml_subscriber_hash',
        'kenshoo_clickid', 'zanpid', 'awesm', 'WT.mc_id', 'pk_vid', 'piwik_campaign',
        'piwik_kwd', 'redirect_log_mongo_id', 'redirect_mongo_id', 'sb_referer_host',
        'mkwid', 'pcrid', 'ef_id', 's_kwcid', 'c', 'dclid', 'gad_source', 'gbraid', 'wbraid'
      ];

      trackingParams.forEach(param => params.delete(param));
      
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
        new URL(cleanedUrl).search
      )
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
          recentCleanups: this.recentCleanups,
          isEnabled: this.isEnabled
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
      cleanup => Date.now() - cleanup.timestamp < 24 * 60 * 60 * 1000
    ).length;

    if (todayCleanups > 0) {
      chrome.action.setBadgeText({ text: todayCleanups.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }

  async trackNavigation(details) {
    const url = details.url;
    const cleanedUrl = this.cleanUrl(url);
    
    if (url !== cleanedUrl) {
      this.stats.sessionsCleared++;
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