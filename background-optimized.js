/**
 * 高性能优化版本的 ClearURL Service
 * 关键优化：
 * 1. 预编译正则表达式和合并模式
 * 2. 防抖存储机制
 * 3. URL 解析缓存
 * 4. 循环队列数据结构
 * 5. 性能监控和追踪
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      urlProcessingTimes: [],
      cacheHits: 0,
      cacheMisses: 0,
      storageOperations: 0,
      regexMatches: 0,
    };
  }

  recordUrlProcessing(duration) {
    this.metrics.urlProcessingTimes.push(duration);
    if (this.metrics.urlProcessingTimes.length > 1000) {
      this.metrics.urlProcessingTimes.shift();
    }
  }

  getAverageProcessingTime() {
    const times = this.metrics.urlProcessingTimes;
    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  getCacheHitRate() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total === 0 ? 0 : (this.metrics.cacheHits / total) * 100;
  }

  getReport() {
    return {
      averageProcessingTime: this.getAverageProcessingTime().toFixed(3),
      cacheHitRate: this.getCacheHitRate().toFixed(2),
      totalProcessed: this.metrics.urlProcessingTimes.length,
      cacheHits: this.metrics.cacheHits,
      cacheMisses: this.metrics.cacheMisses,
      storageOperations: this.metrics.storageOperations,
      regexMatches: this.metrics.regexMatches,
    };
  }
}

class CircularQueue {
  constructor(maxSize = 50) {
    this.queue = new Array(maxSize);
    this.maxSize = maxSize;
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  push(item) {
    this.queue[this.tail] = item;
    this.tail = (this.tail + 1) % this.maxSize;

    if (this.size < this.maxSize) {
      this.size++;
    } else {
      this.head = (this.head + 1) % this.maxSize;
    }
  }

  toArray() {
    const result = [];
    let current = this.head;
    for (let i = 0; i < this.size; i++) {
      result.push(this.queue[current]);
      current = (current + 1) % this.maxSize;
    }
    return result;
  }

  clear() {
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }
}

class URLCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = [];
  }

  get(url) {
    if (this.cache.has(url)) {
      // LRU: 更新访问顺序
      const index = this.accessOrder.indexOf(url);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
      this.accessOrder.push(url);
      return this.cache.get(url);
    }
    return null;
  }

  set(url, cleanedUrl) {
    if (this.cache.size >= this.maxSize) {
      // 删除最久未使用的项
      const oldest = this.accessOrder.shift();
      this.cache.delete(oldest);
    }

    this.cache.set(url, cleanedUrl);
    this.accessOrder.push(url);
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }
}

class DebouncedStorage {
  constructor(saveFunction, delay = 2000) {
    this.saveFunction = saveFunction;
    this.delay = delay;
    this.timeoutId = null;
    this.pendingSave = false;
  }

  scheduleSave() {
    this.pendingSave = true;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      if (this.pendingSave) {
        this.saveFunction();
        this.pendingSave = false;
      }
    }, this.delay);
  }

  forceSave() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.pendingSave) {
      this.saveFunction();
      this.pendingSave = false;
    }
  }
}

class OptimizedTrackingPatternMatcher {
  constructor() {
    // 合并的超级正则表达式 - 一次性匹配所有模式
    this.compiledPattern = this.compilePatterns();
  }

  compilePatterns() {
    // 将所有模式合并为一个大型正则表达式
    const patterns = [
      // UTM parameters
      'utm_[a-z_]*',
      // Google Analytics
      '_ga[a-z_]*',
      '_gl',
      // Click identifiers
      'gclid|fbclid|msclkid|twclid|dclid|gbraid|wbraid',
      // Marketing automation
      'mtm_[a-z_]*',
      'hs[a-z_]+',
      'vero_[a-z_]+',
      'kenshoo_[a-z_]+',
      // Social media tracking
      'igshid|rb_clickid|s_cid|ml_subscriber[a-z_]*',
      // General tracking
      'ref_[a-z_]*|referrer|source|campaign|click_id|trk',
      'pk_[a-z_]+|at_[a-z_]+|ncid|cid|yclid',
      // E-commerce tracking
      'itm_[a-z_]*|mc_eid|sb_referer_host|mkwid|pcrid|ef_id|s_kwcid',
      'zanpid|awesm|WT\\.mc_id|piwik_[a-z_]+',
      'redirect_(?:log_)?mongo_id|ceneo_spo|spm|vn_[a-z_]+',
      'tracking_source|wickedid|oly_[a-z_]+|__s|echobox|srsltid',
      'mkt_tok|_openstat|fb_action_[a-z_]+|gs_l|hmb_[a-z_]+',
      'otm_[a-z_]*|cmpid|os_ehash|__twitter_impression',
      'wt_?z?mc|wtrid|[a-z]?mc',
      // Special parameters
      'correlation_id|ref_campaign|ref_source',
      '%24deep_link|%24original_url|%243p|rdt',
      '_branch_match_id|share_id|trackId|tctx|jb[a-z]*',
      // Performance and analytics
      '__hstc|__hssc|__hsfp|hsCtaTracking|gad_source',
      // Miscellaneous
      'action_(?:object_type_map|ref_map)|log_mongo_id',
    ];

    // 创建一个高效的正则表达式
    const combinedPattern = `^(${patterns.join('|')})$`;
    return new RegExp(combinedPattern, 'i');
  }

  shouldRemoveParameter(key) {
    return this.compiledPattern.test(key);
  }
}

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

    // 优化的数据结构
    this.recentCleanups = new CircularQueue(50);
    this.whitelist = new Set();
    this.isEnabled = true;

    // 性能优化组件
    this.urlCache = new URLCache(100);
    this.patternMatcher = new OptimizedTrackingPatternMatcher();
    this.performanceMonitor = new PerformanceMonitor();

    // 防抖存储
    this.debouncedStorage = new DebouncedStorage(() => this.saveSettingsInternal(), 2000);

    this.initialize();
  }

  async initialize() {
    await this.loadSettings();
    await this.setupRules();
    this.setupEventListeners();
    this.setupPeriodicTasks();
  }

  setupPeriodicTasks() {
    // 每5分钟强制保存一次
    setInterval(() => {
      this.debouncedStorage.forceSave();
    }, 5 * 60 * 1000);

    // 每小时清理缓存
    setInterval(() => {
      this.urlCache.clear();
    }, 60 * 60 * 1000);

    // 每10分钟输出性能报告（开发模式）
    if (chrome.runtime.getManifest().version.includes('dev')) {
      setInterval(() => {
        console.log('Performance Report:', this.performanceMonitor.getReport());
      }, 10 * 60 * 1000);
    }
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
      if (data.recentCleanups && Array.isArray(data.recentCleanups)) {
        data.recentCleanups.forEach((cleanup) => this.recentCleanups.push(cleanup));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  saveSettings() {
    // 使用防抖机制
    this.debouncedStorage.scheduleSave();
  }

  async saveSettingsInternal() {
    try {
      this.performanceMonitor.metrics.storageOperations++;

      await chrome.storage.sync.set({
        stats: this.stats,
        whitelist: Array.from(this.whitelist),
        isEnabled: this.isEnabled,
        recentCleanups: this.recentCleanups.toArray(),
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

    // 在扩展卸载前强制保存
    chrome.runtime.onSuspend?.addListener(() => {
      this.debouncedStorage.forceSave();
    });
  }

  async handleRuleMatched(details) {
    if (!this.isEnabled) {
      return;
    }

    const startTime = performance.now();
    const url = details.request.url;

    // 快速检查白名单
    try {
      const hostname = new URL(url).hostname;
      if (this.whitelist.has(hostname)) {
        return;
      }
    } catch {
      return;
    }

    // 使用缓存
    let cleanedUrl = this.urlCache.get(url);
    if (cleanedUrl) {
      this.performanceMonitor.metrics.cacheHits++;
    } else {
      this.performanceMonitor.metrics.cacheMisses++;
      cleanedUrl = this.cleanUrl(url);
      this.urlCache.set(url, cleanedUrl);
    }

    if (url !== cleanedUrl) {
      this.stats.totalCleaned++;

      const originalParams = new URL(url).searchParams;
      const cleanedParams = new URL(cleanedUrl).searchParams;
      const removedCount = originalParams.size - cleanedParams.size;

      this.stats.parametersRemoved += removedCount;

      // 更新性能统计
      const processingTime = performance.now() - startTime;
      this.updatePerformanceStats(processingTime);
      this.performanceMonitor.recordUrlProcessing(processingTime);

      this.addRecentCleanup(url, cleanedUrl, new URL(url).hostname, removedCount);
      this.saveSettings(); // 使用防抖保存
      this.updateBadge();
    }
  }

  cleanUrl(url) {
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;

      // 高效地删除参数
      const keysToDelete = [];
      for (const key of params.keys()) {
        if (this.patternMatcher.shouldRemoveParameter(key)) {
          keysToDelete.push(key);
          this.performanceMonitor.metrics.regexMatches++;
        }
      }

      keysToDelete.forEach((key) => params.delete(key));

      urlObj.search = params.toString();
      return urlObj.toString();
    } catch (error) {
      console.error('Error cleaning URL:', error);
      return url;
    }
  }

  addRecentCleanup(originalUrl, cleanedUrl, hostname, parametersRemoved) {
    const cleanup = {
      originalUrl,
      cleanedUrl,
      hostname,
      timestamp: Date.now(),
      parametersRemoved,
    };

    this.recentCleanups.push(cleanup);
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'getStats':
        sendResponse({
          stats: this.stats,
          performanceStats: {
            ...this.performanceStats,
            ...this.performanceMonitor.getReport(),
          },
          recentCleanups: this.recentCleanups.toArray(),
          isEnabled: this.isEnabled,
        });
        break;

      case 'toggleEnabled':
        this.isEnabled = !this.isEnabled;
        await this.setupRules();
        this.debouncedStorage.forceSave(); // 立即保存重要设置
        this.updateBadge();
        sendResponse({ isEnabled: this.isEnabled });
        break;

      case 'addToWhitelist':
        if (message.hostname) {
          this.whitelist.add(message.hostname);
          this.saveSettings();
        }
        sendResponse({ success: true });
        break;

      case 'removeFromWhitelist':
        if (message.hostname) {
          this.whitelist.delete(message.hostname);
          this.saveSettings();
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
        this.recentCleanups.clear();
        this.urlCache.clear();
        this.performanceMonitor = new PerformanceMonitor();
        this.debouncedStorage.forceSave();
        this.updateBadge();
        sendResponse({ success: true });
        break;

      case 'getPerformanceReport':
        sendResponse({ report: this.performanceMonitor.getReport() });
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
      this.saveSettings();
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

    const recentArray = this.recentCleanups.toArray();
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const todayCleanups = recentArray.filter((cleanup) => cleanup.timestamp > oneDayAgo).length;

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

    // 使用加权移动平均
    const alpha = 0.1; // 平滑因子
    this.performanceStats.averageProcessingTime =
      alpha * processingTime + (1 - alpha) * this.performanceStats.averageProcessingTime;

    // 更新内存使用（如果可用）
    if (performance.memory) {
      this.performanceStats.memoryUsage = performance.memory.usedJSHeapSize;
    }
  }

  async trackNavigation(details) {
    const startTime = performance.now();
    const url = details.url;

    // 使用缓存
    let cleanedUrl = this.urlCache.get(url);
    if (!cleanedUrl) {
      cleanedUrl = this.cleanUrl(url);
      this.urlCache.set(url, cleanedUrl);
    }

    if (url !== cleanedUrl) {
      this.stats.sessionsCleared++;

      const processingTime = performance.now() - startTime;
      this.updatePerformanceStats(processingTime);
      this.performanceMonitor.recordUrlProcessing(processingTime);

      this.saveSettings();
    }
  }
}

const clearURLService = new ClearURLService();

chrome.runtime.onInstalled.addListener(() => {
  console.log('ClearURL Extension (Optimized) installed');
});

chrome.runtime.onStartup.addListener(() => {
  clearURLService.updateBadge();
});
