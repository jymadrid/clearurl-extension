class PopupManager {
  constructor() {
    this.currentHostname = '';
    this.isWhitelisted = false;
    this.customRules = [];
    this.cleaningLog = [];
    this.initialize();
  }

  async initialize() {
    await this.loadCurrentTab();
    await this.loadData();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        this.currentHostname = new URL(tab.url).hostname;
      }
    } catch (error) {
      console.error('Error loading current tab:', error);
      this.currentHostname = 'Unknown';
    }
  }

  async loadData() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getStats' });
      this.stats = response.stats || { totalCleaned: 0, parametersRemoved: 0 };
      this.recentCleanups = response.recentCleanups || [];
      this.isEnabled = response.isEnabled !== false;

      const whitelistResponse = await chrome.runtime.sendMessage({ action: 'getWhitelist' });
      this.whitelist = new Set(whitelistResponse.whitelist || []);
      this.isWhitelisted = this.whitelist.has(this.currentHostname);

      const customRulesResponse = await chrome.runtime.sendMessage({ action: 'getCustomRules' });
      this.customRules = customRulesResponse.customRules || [];

      const logResponse = await chrome.runtime.sendMessage({ action: 'getCleaningLog' });
      this.cleaningLog = logResponse.cleaningLog || [];
    } catch (error) {
      console.error('Error loading data:', error);
      this.stats = { totalCleaned: 0, parametersRemoved: 0 };
      this.recentCleanups = [];
      this.isEnabled = true;
      this.whitelist = new Set();
      this.isWhitelisted = false;
      this.customRules = [];
      this.cleaningLog = [];
    }
  }

  setupEventListeners() {
    // 标签页切换
    const tabBtns = document.querySelectorAll('.popup-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    // 概览标签页
    const enableToggle = document.getElementById('enableToggle');
    const clearStatsBtn = document.getElementById('clearStats');
    const openOptionsBtn = document.getElementById('openOptions');
    const whitelistBtn = document.getElementById('whitelistBtn');

    enableToggle.addEventListener('change', () => this.toggleEnabled());
    clearStatsBtn.addEventListener('click', () => this.clearStats());
    openOptionsBtn.addEventListener('click', () => this.openOptions());
    whitelistBtn.addEventListener('click', () => this.toggleWhitelist());

    // 白名单标签页
    const addWhitelistBtn = document.getElementById('addWhitelistBtn');
    const whitelistInput = document.getElementById('whitelistInput');

    addWhitelistBtn.addEventListener('click', () => this.addWhitelist());
    whitelistInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addWhitelist();
    });

    // 自定义规则标签页
    const addCustomRuleBtn = document.getElementById('addCustomRuleBtn');
    const customRuleInput = document.getElementById('customRuleInput');

    addCustomRuleBtn.addEventListener('click', () => this.addCustomRule());
    customRuleInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addCustomRule();
    });

    // 净化日志标签页
    const clearLogBtn = document.getElementById('clearLogBtn');
    const refreshLogBtn = document.getElementById('refreshLogBtn');

    clearLogBtn.addEventListener('click', () => this.clearLog());
    refreshLogBtn.addEventListener('click', () => this.refreshLog());
  }

  switchTab(tabName) {
    // 更新标签按钮状态
    document.querySelectorAll('.popup-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // 更新标签内容显示
    document.querySelectorAll('.popup-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === tabName);
    });

    // 如果切换到白名单或自定义规则标签页，刷新列表
    if (tabName === 'whitelist') {
      this.updateWhitelistUI();
    } else if (tabName === 'custom-rules') {
      this.updateCustomRulesUI();
    } else if (tabName === 'cleaning-log') {
      this.updateCleaningLogUI();
    }
  }

  updateUI() {
    this.updateStats();
    this.updateActivity();
    this.updateToggle();
    this.updateCurrentSite();
    this.updateWhitelistUI();
    this.updateCustomRulesUI();
  }

  updateStats() {
    document.getElementById('totalCleaned').textContent = this.formatNumber(
      this.stats.totalCleaned,
    );
    document.getElementById('parametersRemoved').textContent = this.formatNumber(
      this.stats.parametersRemoved,
    );
  }

  updateActivity() {
    const activityList = document.getElementById('activityList');

    if (!this.recentCleanups || this.recentCleanups.length === 0) {
      activityList.innerHTML = '<div class="no-activity">No recent activity</div>';
      return;
    }

    const recentItems = this.recentCleanups.slice(0, 10);
    activityList.innerHTML = recentItems
      .map(
        (cleanup) => `
      <div class="activity-item">
        <div class="activity-site">${this.truncateUrl(cleanup.hostname)}</div>
        <div class="activity-params">${cleanup.parametersRemoved} parameter${cleanup.parametersRemoved !== 1 ? 's' : ''} removed</div>
        <div class="activity-time">${this.formatTime(cleanup.timestamp)}</div>
      </div>
    `,
      )
      .join('');
  }

  updateToggle() {
    document.getElementById('enableToggle').checked = this.isEnabled;
  }

  updateCurrentSite() {
    document.getElementById('currentSite').textContent = this.currentHostname;

    const whitelistBtn = document.getElementById('whitelistBtn');
    const whitelistText = whitelistBtn.querySelector('.whitelist-text');

    if (this.isWhitelisted) {
      whitelistBtn.classList.add('whitelisted');
      whitelistText.textContent = 'Remove from Whitelist';
    } else {
      whitelistBtn.classList.remove('whitelisted');
      whitelistText.textContent = 'Add to Whitelist';
    }
  }

  updateWhitelistUI() {
    const whitelistList = document.getElementById('whitelistList');
    const whitelistCount = document.getElementById('whitelistCount');
    const whitelistArray = Array.from(this.whitelist);

    whitelistCount.textContent = whitelistArray.length;

    if (whitelistArray.length === 0) {
      whitelistList.innerHTML = '<div class="no-items">暂无白名单网站</div>';
      return;
    }

    whitelistList.innerHTML = whitelistArray
      .map(
        (domain) => `
      <div class="list-item">
        <span class="list-item-text">${domain}</span>
        <button class="list-item-remove" data-domain="${domain}">删除</button>
      </div>
    `,
      )
      .join('');

    // 添加删除按钮事件监听
    whitelistList.querySelectorAll('.list-item-remove').forEach(btn => {
      btn.addEventListener('click', () => this.removeWhitelist(btn.dataset.domain));
    });
  }

  updateCustomRulesUI() {
    const customRulesList = document.getElementById('customRulesList');
    const customRulesCount = document.getElementById('customRulesCount');

    customRulesCount.textContent = this.customRules.length;

    if (this.customRules.length === 0) {
      customRulesList.innerHTML = '<div class="no-items">暂无自定义规则</div>';
      return;
    }

    customRulesList.innerHTML = this.customRules
      .map(
        (rule) => `
      <div class="list-item">
        <span class="list-item-text">${rule}</span>
        <button class="list-item-remove" data-rule="${rule}">删除</button>
      </div>
    `,
      )
      .join('');

    // 添加删除按钮事件监听
    customRulesList.querySelectorAll('.list-item-remove').forEach(btn => {
      btn.addEventListener('click', () => this.removeCustomRule(btn.dataset.rule));
    });
  }

  async addWhitelist() {
    const input = document.getElementById('whitelistInput');
    const domain = input.value.trim();

    if (!domain) {
      alert('请输入域名');
      return;
    }

    // 简单的域名验证
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(domain)) {
      alert('请输入有效的域名');
      return;
    }

    if (this.whitelist.has(domain)) {
      alert('该域名已在白名单中');
      return;
    }

    try {
      await chrome.runtime.sendMessage({
        action: 'addToWhitelist',
        hostname: domain,
      });
      this.whitelist.add(domain);
      input.value = '';
      this.updateWhitelistUI();

      // 如果添加的是当前网站，更新状态
      if (domain === this.currentHostname) {
        this.isWhitelisted = true;
        this.updateCurrentSite();
      }
    } catch (error) {
      console.error('Error adding to whitelist:', error);
      alert('添加失败，请重试');
    }
  }

  async removeWhitelist(domain) {
    try {
      await chrome.runtime.sendMessage({
        action: 'removeFromWhitelist',
        hostname: domain,
      });
      this.whitelist.delete(domain);
      this.updateWhitelistUI();

      // 如果删除的是当前网站，更新状态
      if (domain === this.currentHostname) {
        this.isWhitelisted = false;
        this.updateCurrentSite();
      }
    } catch (error) {
      console.error('Error removing from whitelist:', error);
      alert('删除失败，请重试');
    }
  }

  async addCustomRule() {
    const input = document.getElementById('customRuleInput');
    const rule = input.value.trim();

    if (!rule) {
      alert('请输入参数名');
      return;
    }

    // 简单的参数名验证
    if (!/^[a-zA-Z0-9_-]+$/.test(rule)) {
      alert('参数名只能包含字母、数字、下划线和连字符');
      return;
    }

    if (this.customRules.includes(rule)) {
      alert('该规则已存在');
      return;
    }

    try {
      await chrome.runtime.sendMessage({
        action: 'addCustomRule',
        rule: rule,
      });
      this.customRules.push(rule);
      input.value = '';
      this.updateCustomRulesUI();
    } catch (error) {
      console.error('Error adding custom rule:', error);
      alert('添加失败，请重试');
    }
  }

  async removeCustomRule(rule) {
    try {
      await chrome.runtime.sendMessage({
        action: 'removeCustomRule',
        rule: rule,
      });
      this.customRules = this.customRules.filter(r => r !== rule);
      this.updateCustomRulesUI();
    } catch (error) {
      console.error('Error removing custom rule:', error);
      alert('删除失败，请重试');
    }
  }

  async toggleEnabled() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'toggleEnabled' });
      this.isEnabled = response.isEnabled;
      this.updateToggle();
    } catch (error) {
      console.error('Error toggling enabled state:', error);
    }
  }

  async clearStats() {
    if (confirm('Are you sure you want to clear all statistics?')) {
      try {
        await chrome.runtime.sendMessage({ action: 'clearStats' });
        this.stats = { totalCleaned: 0, parametersRemoved: 0 };
        this.recentCleanups = [];
        this.updateUI();
      } catch (error) {
        console.error('Error clearing stats:', error);
      }
    }
  }

  openOptions() {
    chrome.runtime.openOptionsPage();
  }

  async toggleWhitelist() {
    try {
      if (this.isWhitelisted) {
        await chrome.runtime.sendMessage({
          action: 'removeFromWhitelist',
          hostname: this.currentHostname,
        });
        this.whitelist.delete(this.currentHostname);
        this.isWhitelisted = false;
      } else {
        await chrome.runtime.sendMessage({
          action: 'addToWhitelist',
          hostname: this.currentHostname,
        });
        this.whitelist.add(this.currentHostname);
        this.isWhitelisted = true;
      }
      this.updateCurrentSite();
      this.updateWhitelistUI();
    } catch (error) {
      console.error('Error toggling whitelist:', error);
    }
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) {
      return 'Just now';
    } else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    } else if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
  }

  truncateUrl(url) {
    if (url.length > 25) {
      return `${url.substring(0, 22)}...`;
    }
    return url;
  }

  updateCleaningLogUI() {
    const logList = document.getElementById('cleaningLogList');
    const logCount = document.getElementById('logCount');

    logCount.textContent = this.cleaningLog.length;

    if (this.cleaningLog.length === 0) {
      logList.innerHTML = '<div class="no-items">暂无净化记录</div>';
      return;
    }

    logList.innerHTML = this.cleaningLog
      .map((log) => {
        const paramsHtml = log.removedParams.length > 5
          ? `
            ${log.removedParams.slice(0, 5).map(param =>
              `<span class="log-item-param-tag">${param}</span>`
            ).join('')}
            <span class="log-item-param-count">+${log.removedParams.length - 5} more</span>
          `
          : log.removedParams.map(param =>
              `<span class="log-item-param-tag">${param}</span>`
            ).join('');

        return `
          <div class="log-item">
            <div class="log-item-header">
              <img src="${log.favicon}" class="log-item-favicon" onerror="this.style.display='none'">
              <span class="log-item-domain">${log.domain}</span>
              <span class="log-item-time">${this.formatTime(log.timestamp)}</span>
            </div>
            <div class="log-item-url" title="${log.originalUrl}">${log.originalUrl}</div>
            <div class="log-item-params">
              ${paramsHtml}
            </div>
          </div>
        `;
      })
      .join('');
  }

  async clearLog() {
    if (confirm('确定要清空所有净化日志吗？')) {
      try {
        await chrome.runtime.sendMessage({ action: 'clearCleaningLog' });
        this.cleaningLog = [];
        this.updateCleaningLogUI();
      } catch (error) {
        console.error('Error clearing log:', error);
        alert('清空失败，请重试');
      }
    }
  }

  async refreshLog() {
    try {
      const logResponse = await chrome.runtime.sendMessage({ action: 'getCleaningLog' });
      this.cleaningLog = logResponse.cleaningLog || [];
      this.updateCleaningLogUI();
    } catch (error) {
      console.error('Error refreshing log:', error);
      alert('刷新失败，请重试');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});
