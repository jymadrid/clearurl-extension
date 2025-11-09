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

    this.initialize();
  }

  async initialize() {
    await this.loadStaticRules();
    await this.loadSettings();
    await this.updateRules();
    this.setupEventListeners();
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

  async loadSettings() {
    try {
      const data = await chrome.storage.local.get([
        'stats',
        'whitelist',
        'customRules',
        'isEnabled',
        'recentCleanups',
        'cleaningLog',
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
        cleaningLog: this.cleaningLog.slice(-100), // 只保留最新的100条日志
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
}

const clearURLService = new ClearURLService();

chrome.runtime.onInstalled.addListener(() => {
  console.log('ClearURL Extension installed');
});

chrome.runtime.onStartup.addListener(() => {
  clearURLService.updateBadge();
});
