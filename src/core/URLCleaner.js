/**
 * 高性能URL清理器
 * 优化了匹配算法和缓存机制
 */
class URLCleaner {
  constructor() {
    this.trackingParams = new Set([
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
      'ref_',
      'referrer',
      'source',
      'campaign',
      'click_id',
      'trk',
      'pk_campaign',
      'pk_kwd',
      'pk_source',
      'pk_medium',
      'pk_content',
      'mtm_source',
      'mtm_medium',
      'mtm_campaign',
      'mtm_keyword',
      'mtm_content',
      'at_medium',
      'at_campaign',
      'ncid',
      'cid',
      'yclid',
      '_hsenc',
      '_hsmi',
      'hsCtaTracking',
      'hsa_acc',
      'hsa_ad',
      'hsa_cam',
      'hsa_grp',
      'hsa_kw',
      'hsa_mt',
      'hsa_net',
      'hsa_src',
      'hsa_tgt',
      'hsa_ver',
      'vero_conv',
      'vero_id',
      'wickedid',
      'oly_anon_id',
      'oly_enc_id',
      '__s',
      'rb_clickid',
      's_cid',
      'ml_subscriber',
      'ml_subscriber_hash',
      'kenshoo_clickid',
      'zanpid',
      'awesm',
      'WT.mc_id',
      'pk_vid',
      'piwik_campaign',
      'piwik_kwd',
      'redirect_log_mongo_id',
      'redirect_mongo_id',
      'sb_referer_host',
      'mkwid',
      'pcrid',
      'ef_id',
      's_kwcid',
      'c',
      'dclid',
      'gad_source',
      'gbraid',
      'wbraid',
    ]);

    this.customParams = new Set();
    this.disabledParams = new Set();

    // 预编译的正则表达式
    this.patternCache = new Map();

    // 性能统计
    this.stats = {
      cleanedCount: 0,
      cacheHits: 0,
      totalProcessed: 0,
    };
  }

  /**
   * 添加自定义参数
   */
  addCustomParam(param) {
    if (typeof param === 'string' && param.trim()) {
      this.customParams.add(param.trim());
      this._invalidateCache();
    }
  }

  /**
   * 移除自定义参数
   */
  removeCustomParam(param) {
    this.customParams.delete(param);
    this._invalidateCache();
  }

  /**
   * 启用/禁用参数
   */
  toggleParam(param, enabled) {
    if (enabled) {
      this.disabledParams.delete(param);
    } else {
      this.disabledParams.add(param);
    }
    this._invalidateCache();
  }

  /**
   * 高性能URL清理
   */
  cleanUrl(url) {
    this.stats.totalProcessed++;

    try {
      const urlObj = new URL(url);

      // 检查缓存
      const cacheKey = urlObj.search;
      if (this.patternCache.has(cacheKey)) {
        this.stats.cacheHits++;
        return this.patternCache.get(cacheKey);
      }

      const originalParams = urlObj.searchParams;
      const paramsToRemove = new Set();

      // 批量检查参数
      for (const [key] of originalParams) {
        if (this._shouldRemoveParam(key)) {
          paramsToRemove.add(key);
        }
      }

      // 批量删除参数
      if (paramsToRemove.size > 0) {
        paramsToRemove.forEach((param) => originalParams.delete(param));
        this.stats.cleanedCount++;
      }

      const cleanedUrl = urlObj.toString();

      // 缓存结果
      if (this.patternCache.size < 1000) {
        this.patternCache.set(cacheKey, cleanedUrl);
      }

      return cleanedUrl;
    } catch (error) {
      console.error('URL cleaning error:', error);
      return url;
    }
  }

  /**
   * 检查参数是否应该被移除
   */
  _shouldRemoveParam(param) {
    if (this.disabledParams.has(param)) {
      return false;
    }

    return this.trackingParams.has(param) || this.customParams.has(param);
  }

  /**
   * 清除缓存
   */
  _invalidateCache() {
    this.patternCache.clear();
  }

  /**
   * 批量清理URL数组
   */
  cleanUrls(urls) {
    return urls.map((url) => this.cleanUrl(url));
  }

  /**
   * 获取清理统计
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * 重置统计
   */
  resetStats() {
    this.stats = {
      cleanedCount: 0,
      cacheHits: 0,
      totalProcessed: 0,
    };
  }

  /**
   * 获取所有有效的跟踪参数
   */
  getEffectiveParams() {
    const params = new Set([...this.trackingParams, ...this.customParams]);
    return [...params].filter((param) => !this.disabledParams.has(param));
  }

  /**
   * 分析URL中的跟踪参数
   */
  analyzeUrl(url) {
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;
      const foundParams = [];
      const removedParams = [];

      for (const [key, value] of params) {
        if (this._shouldRemoveParam(key)) {
          removedParams.push({ key, value });
        } else {
          foundParams.push({ key, value });
        }
      }

      return {
        originalUrl: url,
        cleanedUrl: this.cleanUrl(url),
        foundParams,
        removedParams,
        totalParams: params.size,
        removedCount: removedParams.length,
      };
    } catch (error) {
      return {
        error: error.message,
        originalUrl: url,
      };
    }
  }
}

// 导出单例
const urlCleaner = new URLCleaner();

export default urlCleaner;
