/**
 * 高效LRU缓存实现
 * 支持TTL和智能内存管理
 */
class LRUCache {
  constructor(maxSize = 1000, ttl = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.cache = new Map();
    this.accessOrder = new Map();
    this.timers = new Map();

    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      expirations: 0,
    };
  }

  /**
   * 获取缓存项
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      return null;
    }

    // 检查是否过期
    if (Date.now() > item.expiry) {
      this._deleteItem(key);
      this.stats.expirations++;
      this.stats.misses++;
      return null;
    }

    // 更新访问顺序
    this.accessOrder.delete(key);
    this.accessOrder.set(key, Date.now());

    this.stats.hits++;
    return item.value;
  }

  /**
   * 设置缓存项
   */
  set(key, value) {
    // 删除现有项
    if (this.cache.has(key)) {
      this._deleteItem(key);
    }

    // 检查容量
    if (this.cache.size >= this.maxSize) {
      this._evictLRU();
    }

    const now = Date.now();
    const item = {
      value,
      createdAt: now,
      expiry: now + this.ttl,
    };

    this.cache.set(key, item);
    this.accessOrder.set(key, now);

    // 设置TTL定时器
    const timer = setTimeout(() => {
      this._deleteItem(key);
      this.stats.expirations++;
    }, this.ttl);
    this.timers.set(key, timer);
  }

  /**
   * 删除缓存项
   */
  delete(key) {
    this._deleteItem(key);
  }

  /**
   * 清空缓存
   */
  clear() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.cache.clear();
    this.accessOrder.clear();
    this.timers.clear();

    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      expirations: 0,
    };
  }

  /**
   * 检查是否存在
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * 获取缓存大小
   */
  size() {
    return this.cache.size;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? `${((this.stats.hits / total) * 100).toFixed(2)}%` : '0%',
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  /**
   * 删除指定项的内部方法
   */
  _deleteItem(key) {
    this.cache.delete(key);
    this.accessOrder.delete(key);

    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  /**
   * 驱逐最少使用的项
   */
  _evictLRU() {
    if (this.accessOrder.size === 0) {
      return;
    }

    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, time] of this.accessOrder) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this._deleteItem(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * 批量预加载
   */
  preload(items) {
    items.forEach((item) => {
      if (this.cache.size < this.maxSize) {
        this.set(item.key, item.value);
      }
    });
  }

  /**
   * 获取所有键
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * 获取所有值
   */
  values() {
    return Array.from(this.cache.values()).map((item) => item.value);
  }

  /**
   * 优化内存使用
   */
  optimize() {
    // 清理过期项
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, item] of this.cache) {
      if (now > item.expiry) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => {
      this._deleteItem(key);
      this.stats.expirations++;
    });

    // 如果还是太满，驱逐最旧的一半
    if (this.cache.size > this.maxSize * 0.8) {
      const itemsToEvict = Math.floor(this.cache.size / 2);
      for (let i = 0; i < itemsToEvict; i++) {
        this._evictLRU();
      }
    }
  }
}

/**
 * 缓存工厂
 */
class CacheFactory {
  static instances = new Map();

  static getInstance(name, maxSize = 1000, ttl = 5 * 60 * 1000) {
    if (!this.instances.has(name)) {
      this.instances.set(name, new LRUCache(maxSize, ttl));
    }
    return this.instances.get(name);
  }

  static clearAll() {
    this.instances.forEach((cache) => cache.clear());
    this.instances.clear();
  }

  static getStats() {
    const stats = {};
    this.instances.forEach((cache, name) => {
      stats[name] = cache.getStats();
    });
    return stats;
  }
}

export { LRUCache, CacheFactory };
