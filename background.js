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
    this.cleaningLog = [];
    this.whitelist = new Set();
    this.customRules = [];
    this.isEnabled = true;
    this.staticRules = [];
    this.shortenerDomains = [];
    this.clipboardCleaningEnabled = false;
    this.shortUrlExpansionEnabled = false;
    this.lastClipboardContent = '';

    this.initialize();
  }

  async initialize() {
    await this.loadStaticRules();
    await this.loadShortenerDomains();
    await this.loadSettings();
    await this.updateRules();
    this.setupEventListeners();
    this.setupClipboardMonitoring();
  }

  async loadStaticRules() {
    try {
      const response = await fetch(chrome.runtime.getURL('rules.json'));
      this.staticRules = await response.json();
    } catch (error) {
      console.error('Failed to load static rules:', error);
      this.staticRules = [];
    }
  }

  async loadShortenerDomains() {
    try {
      const response = await fetch(chrome.runtime.getURL('shortener_domains.json'));
      this.shortenerDomains = await response.json();
    } catch (error) {
      console.error('Failed to load shortener domains:', error);
      this.shortenerDomains = [];
    }
  }

  async loadSettings() {
    try {
      const data = await chrome.storage.local.get([
        'stats',
        'whitelist',
        'customRules',
        'isEnabled',
        'recentCleanups',
        'cleaningLog',
        'clipboardCleaningEnabled',
        'shortUrlExpansionEnabled',
      ]);

      if (data.stats) {
        this.stats = { ...this.stats, ...data.stats };
      }
      if (data.whitelist) {
        this.whitelist = new Set(data.whitelist);
      }
      if (data.customRules) {
        this.customRules = data.customRules;
      }
      if (data.isEnabled !== undefined) {
        this.isEnabled = data.isEnabled;
      }
      if (data.recentCleanups) {
        this.recentCleanups = data.recentCleanups;
      }
      if (data.cleaningLog) {
        this.cleaningLog = data.cleaningLog;
      }
      if (data.clipboardCleaningEnabled !== undefined) {
        this.clipboardCleaningEnabled = data.clipboardCleaningEnabled;
      }
      if (data.shortUrlExpansionEnabled !== undefined) {
        this.shortUrlExpansionEnabled = data.shortUrlExpansionEnabled;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.local.set({
        stats: this.stats,
        whitelist: Array.from(this.whitelist),
        customRules: this.customRules,
        isEnabled: this.isEnabled,
        recentCleanups: this.recentCleanups.slice(-50),
        cleaningLog: this.cleaningLog.slice(-100),
        clipboardCleaningEnabled: this.clipboardCleaningEnabled,
        shortUrlExpansionEnabled: this.shortUrlExpansionEnabled,
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  async updateRules() {
    try {
      // 1. 获取所有现有的动态规则并删除
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
      const removeRuleIds = existingRules.map(rule => rule.id);

      if (removeRuleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: removeRuleIds,
        });
      }

      // 2. 如果扩展被禁用，不添加任何规则
      if (!this.isEnabled) {
        return;
      }

      // 3. 准备新的规则数组
      const newRules = [];
      let ruleId = 1000; // 从1000开始，避免与静态规则冲突

      // 4. 处理静态规则，添加白名单排除
      for (const staticRule of this.staticRules) {
        const rule = JSON.parse(JSON.stringify(staticRule)); // 深拷贝
        rule.id = ruleId++;

        // 如果有白名单，添加到规则的 condition 中
        if (this.whitelist.size > 0) {
          if (!rule.condition) {
            rule.condition = {};
          }
          rule.condition.excludedRequestDomains = Array.from(this.whitelist);
        }

        newRules.push(rule);
      }

      // 5. 如果有自定义规则，创建一个新的规则
      if (this.customRules.length > 0) {
        const customRule = {
          id: ruleId++,
          priority: 1,
          action: {
            type: 'redirect',
            redirect: {
              transform: {
                queryTransform: {
                  removeParams: this.customRules,
                },
              },
            },
          },
          condition: {
            resourceTypes: [
              'main_frame',
              'sub_frame',
              'xmlhttprequest',
              'script',
              'image',
              'stylesheet',
            ],
          },
        };

        // 如果有白名单，也要排除
        if (this.whitelist.size > 0) {
          customRule.condition.excludedRequestDomains = Array.from(this.whitelist);
        }

        newRules.push(customRule);
      }

      // 6. 应用所有新规则
      if (newRules.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          addRules: newRules,
        });
      }

      console.log(`Updated rules: ${newRules.length} rules applied`);
    } catch (error) {
      console.error('Failed to update rules:', error);
    }
  }

  setupEventListeners() {
    chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener((details) => {
      this.handleRuleMatched(details);
    });

    chrome.webNavigation?.onBeforeNavigate?.addListener((details) => {
      if (details.frameId === 0) {
        this.trackNavigation(details);
        // 处理短链接
        this.handleShortUrlNavigation(details);
      }
    });

    // 监听标签页更新以记录净化日志
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
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

      const trackingPatterns = [
        /^utm_/,
        /^_ga/,
        /^_gl/,
        /^gclid$/,
        /^fbclid$/,
        /^msclkid$/,
        /^twclid$/,
        /^dclid$/,
        /^gbraid$/,
        /^wbraid$/,
        /^mtm_/,
        /^hs[a-z_]/,
        /^vero_/,
        /^kenshoo_/,
        /^igshid$/,
        /^rb_clickid$/,
        /^s_cid$/,
        /^ml_subscriber/,
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
        /^__hstc$/,
        /^__hssc$/,
        /^__hsfp$/,
        /^hsCtaTracking$/,
        /^gad_source$/,
        /^action_object_type_map$/,
        /^action_ref_map$/,
        /^log_mongo_id$/,
      ];

      // 添加自定义规则到跟踪模式
      const customPatterns = this.customRules.map(rule => new RegExp(`^${rule}$`));
      const allPatterns = [...trackingPatterns, ...customPatterns];

      for (const [key] of params) {
        const shouldRemove = allPatterns.some(pattern => {
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

  async handleTabUpdate(tabId, changeInfo, tab) {
    // 只处理 URL 变化的事件
    if (!changeInfo.url || !this.isEnabled) {
      return;
    }

    try {
      const originalUrl = changeInfo.url;
      const urlObj = new URL(originalUrl);
      const hostname = urlObj.hostname;

      // 检查是否在白名单中
      if (this.whitelist.has(hostname)) {
        return;
      }

      // 模拟净化过程
      const cleanedUrl = this.cleanUrl(originalUrl);

      // 如果 URL 发生了变化，说明有参数被移除
      if (originalUrl !== cleanedUrl) {
        const originalParams = new URLSearchParams(urlObj.search);
        const cleanedParams = new URLSearchParams(new URL(cleanedUrl).search);

        // 计算被移除的参数
        const removedParams = [];
        for (const [key] of originalParams) {
          if (!cleanedParams.has(key)) {
            removedParams.push(key);
          }
        }

        // 添加到净化日志
        const logEntry = {
          id: Date.now() + Math.random(), // 唯一ID
          originalUrl,
          cleanedUrl,
          hostname,
          domain: hostname,
          removedParams,
          timestamp: Date.now(),
          favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`,
        };

        this.cleaningLog.unshift(logEntry);

        // 限制日志数量为100条
        if (this.cleaningLog.length > 100) {
          this.cleaningLog = this.cleaningLog.slice(0, 100);
        }

        await this.saveSettings();
      }
    } catch (error) {
      console.error('Error handling tab update:', error);
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
      await this.updateRules();
      await this.saveSettings();
      this.updateBadge();
      sendResponse({ isEnabled: this.isEnabled });
      break;

    case 'addToWhitelist':
      if (message.hostname) {
        this.whitelist.add(message.hostname);
        await this.updateRules();
        await this.saveSettings();
      }
      sendResponse({ success: true });
      break;

    case 'removeFromWhitelist':
      if (message.hostname) {
        this.whitelist.delete(message.hostname);
        await this.updateRules();
        await this.saveSettings();
      }
      sendResponse({ success: true });
      break;

    case 'getWhitelist':
      sendResponse({ whitelist: Array.from(this.whitelist) });
      break;

    case 'addCustomRule':
      if (message.rule && !this.customRules.includes(message.rule)) {
        this.customRules.push(message.rule);
        await this.updateRules();
        await this.saveSettings();
      }
      sendResponse({ success: true });
      break;

    case 'removeCustomRule':
      if (message.rule) {
        this.customRules = this.customRules.filter(r => r !== message.rule);
        await this.updateRules();
        await this.saveSettings();
      }
      sendResponse({ success: true });
      break;

    case 'getCustomRules':
      sendResponse({ customRules: this.customRules });
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

    case 'getCleaningLog':
      sendResponse({ cleaningLog: this.cleaningLog });
      break;

    case 'clearCleaningLog':
      this.cleaningLog = [];
      await this.saveSettings();
      sendResponse({ success: true });
      break;

    case 'toggleClipboardCleaning':
      this.clipboardCleaningEnabled = !this.clipboardCleaningEnabled;
      await this.saveSettings();
      sendResponse({ enabled: this.clipboardCleaningEnabled });
      break;

    case 'toggleShortUrlExpansion':
      this.shortUrlExpansionEnabled = !this.shortUrlExpansionEnabled;
      await this.saveSettings();
      sendResponse({ enabled: this.shortUrlExpansionEnabled });
      break;

    case 'getFeatureStatus':
      sendResponse({
        clipboardCleaningEnabled: this.clipboardCleaningEnabled,
        shortUrlExpansionEnabled: this.shortUrlExpansionEnabled,
      });
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
      await this.updateRules();
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

    this.performanceStats.averageProcessingTime =
      (this.performanceStats.averageProcessingTime * (this.performanceStats.totalProcessed - 1) + processingTime) /
      this.performanceStats.totalProcessed;

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

  // 剪贴板监控功能
  setupClipboardMonitoring() {
    // 使用 chrome.alarms API 定期检查剪贴板
    chrome.alarms.create('clipboardCheck', { periodInMinutes: 0.033 }); // 约2秒

    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'clipboardCheck' && this.clipboardCleaningEnabled) {
        this.monitorClipboard();
      }
    });

    // 监听设置变化
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        if (changes.clipboardCleaningEnabled) {
          this.clipboardCleaningEnabled = changes.clipboardCleaningEnabled.newValue;
        }
        if (changes.shortUrlExpansionEnabled) {
          this.shortUrlExpansionEnabled = changes.shortUrlExpansionEnabled.newValue;
        }
      }
    });
  }

  async monitorClipboard() {
    if (!this.clipboardCleaningEnabled) return;

    try {
      const text = await navigator.clipboard.readText();

      // 避免重复处理相同内容
      if (text === this.lastClipboardContent) return;

      // 检查是否为有效URL
      if (!this.isValidUrl(text)) return;

      // 净化URL
      const cleanedUrl = this.cleanUrl(text);

      // 只有在URL发生变化时才写入
      if (text !== cleanedUrl) {
        await navigator.clipboard.writeText(cleanedUrl);
        this.lastClipboardContent = cleanedUrl;

        // 发送通知
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'ClearURL',
          message: '链接已自动净化',
          priority: 0,
        });
      } else {
        this.lastClipboardContent = text;
      }
    } catch (error) {
      // 静默处理错误，避免频繁日志
      if (error.message !== 'Document is not focused.') {
        console.error('Clipboard monitoring error:', error);
      }
    }
  }

  isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // 短链接预解析功能
  async resolveShortUrl(url, maxRedirects = 5) {
    let currentUrl = url;
    let redirectCount = 0;

    while (redirectCount < maxRedirects) {
      try {
        const response = await fetch(currentUrl, {
          method: 'HEAD',
          redirect: 'manual',
        });

        // 检查是否有重定向
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get('Location');
          if (!location) break;

          // 处理相对URL
          currentUrl = new URL(location, currentUrl).href;
          redirectCount++;
        } else {
          break;
        }
      } catch (error) {
        console.error('Error resolving short URL:', error);
        break;
      }
    }

    return currentUrl;
  }

  isShortUrl(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      return this.shortenerDomains.some(domain =>
        hostname === domain || hostname.endsWith('.' + domain)
      );
    } catch {
      return false;
    }
  }

  async handleShortUrlNavigation(details) {
    if (!this.shortUrlExpansionEnabled) return;
    if (!this.isShortUrl(details.url)) return;

    try {
      // 显示加载状态
      chrome.action.setBadgeText({ text: '...' });
      chrome.action.setBadgeBackgroundColor({ color: '#FFA500' });

      // 解析短链接
      const resolvedUrl = await this.resolveShortUrl(details.url);

      // 净化最终URL
      const cleanedUrl = this.cleanUrl(resolvedUrl);

      // 更新标签页
      if (cleanedUrl !== details.url) {
        await chrome.tabs.update(details.tabId, { url: cleanedUrl });

        // 发送通知
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'ClearURL',
          message: '短链接已展开并净化',
          priority: 0,
        });
      }

      // 恢复徽章
      this.updateBadge();
    } catch (error) {
      console.error('Error handling short URL:', error);
      this.updateBadge();
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
